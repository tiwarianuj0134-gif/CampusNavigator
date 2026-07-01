/**
 * AI Service — Production-Grade
 * Uses Gemini 2.0 Flash with retry, caching, rate-limit handling, and rich fallbacks.
 * Never crashes — always returns a useful response.
 */

import config from '../config/index.js';
import { College, ICollege } from '../models/College.js';
import { logger } from '../utils/logger.js';

// ─── Gemini HTTP Client (direct fetch, no SDK issues) ─────────
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${config.GEMINI_API_KEY}`;

async function callGemini(prompt: string, retries = 3, maxTokens = 512): Promise<string> {
  if (!config.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY not configured');
  }

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 20000);

      const res = await fetch(GEMINI_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: maxTokens },
        }),
      });

      clearTimeout(timeout);

      if (res.status === 429) {
        // Rate limited — on first attempt do a short wait, on subsequent throw immediately
        logger.warn(`[AI] Gemini rate limited (429) attempt ${attempt + 1}/${retries + 1}`);
        if (attempt === 0) {
          await new Promise(r => setTimeout(r, 2000));
          continue;
        }
        // Don't keep retrying — throw and let the caller use its fallback
        throw new Error('Gemini rate limited');
      }

      if (!res.ok) {
        throw new Error(`Gemini HTTP ${res.status}`);
      }

      const data = await res.json() as any;
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) return text.trim();
      throw new Error('Empty Gemini response');
    } catch (err: any) {
      if (err.name === 'AbortError') {
        logger.warn(`[AI] Gemini timeout on attempt ${attempt + 1}`);
        if (attempt === retries) throw new Error('Gemini request timed out');
        await new Promise(r => setTimeout(r, 2000 * (attempt + 1)));
        continue;
      }
      if (attempt === retries) {
        logger.error(`[AI] Gemini failed after ${retries + 1} attempts: ${err.message}`);
        throw err;
      }
      await new Promise(r => setTimeout(r, 2000 * (attempt + 1)));
    }
  }
  throw new Error('Gemini call exhausted retries');
}

// ─── Simple In-Memory Cache ───────────────────────────────────
const cache = new Map<string, { value: string; expires: number }>();
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

function cacheGet(key: string): string | null {
  const entry = cache.get(key);
  if (entry && entry.expires > Date.now()) return entry.value;
  cache.delete(key);
  return null;
}

function cacheSet(key: string, value: string) {
  cache.set(key, { value, expires: Date.now() + CACHE_TTL });
  // Evict old entries if cache grows too large
  if (cache.size > 500) {
    const now = Date.now();
    for (const [k, v] of cache) {
      if (v.expires < now) cache.delete(k);
    }
  }
}

// ─── Scoring ──────────────────────────────────────────────────

interface UserPreferences {
  streams?: string[];
  locations?: string[];
  budget?: { min: number; max: number };
  interests?: string[];
  studyLevel?: string;
}

interface ScoredCollege {
  college: any;
  matchScore: number;
  reason: string;
  strengths: string[];
  weaknesses: string[];
}

const WEIGHTS = { streamMatch: 20, locationMatch: 15, budgetFit: 15, placementQuality: 20, ranking: 15, rating: 10, accreditation: 5 };

function computeFitScore(college: any, prefs: UserPreferences) {
  let score = 0;
  const strengths: string[] = [];
  const weaknesses: string[] = [];

  if (prefs.streams?.length && college.streams?.length) {
    const matched = prefs.streams.filter(s => college.streams.some((cs: string) => cs.toLowerCase().includes(s.toLowerCase())));
    score += (matched.length / prefs.streams.length) * WEIGHTS.streamMatch;
    if (matched.length > 0) strengths.push(`Offers ${matched.join(', ')}`);
    else weaknesses.push('Stream mismatch');
  } else score += WEIGHTS.streamMatch * 0.5;

  if (prefs.locations?.length) {
    const cityMatch = prefs.locations.some(l =>
      (college.address?.city || '').toLowerCase().includes(l.toLowerCase()) ||
      (college.address?.state || '').toLowerCase().includes(l.toLowerCase()));
    if (cityMatch) { score += WEIGHTS.locationMatch; strengths.push('Preferred location'); }
    else weaknesses.push('Not in preferred area');
  } else score += WEIGHTS.locationMatch * 0.5;

  if (prefs.budget?.max && college.fees?.min != null) {
    if (college.fees.min <= prefs.budget.max) { score += WEIGHTS.budgetFit; }
    else weaknesses.push('May exceed budget');
  } else score += WEIGHTS.budgetFit * 0.5;

  if (college.placements?.placementRate) {
    score += Math.min(college.placements.placementRate / 100, 1) * WEIGHTS.placementQuality;
    if (college.placements.placementRate >= 85) strengths.push(`${college.placements.placementRate}% placement rate`);
  }

  if (college.approvals?.nirf?.rank) {
    score += Math.max(0, 1 - college.approvals.nirf.rank / 200) * WEIGHTS.ranking;
    if (college.approvals.nirf.rank <= 50) strengths.push(`NIRF #${college.approvals.nirf.rank}`);
  }

  if (college.rating) {
    score += (college.rating / 5) * WEIGHTS.rating;
    if (college.rating >= 4.5) strengths.push(`${college.rating}★ rated`);
  }

  if (college.approvals?.naac?.grade && ['A++', 'A+', 'A'].includes(college.approvals.naac.grade)) {
    score += WEIGHTS.accreditation;
    strengths.push(`NAAC ${college.approvals.naac.grade}`);
  }

  const maxPossible = Object.values(WEIGHTS).reduce((a, b) => a + b, 0);
  return { score: Math.min(99, Math.max(35, Math.round((score / maxPossible) * 100))), strengths: strengths.slice(0, 5), weaknesses: weaknesses.slice(0, 3) };
}

// ─── Public API ───────────────────────────────────────────────

export const aiService = {
  async getRecommendations(preferences: UserPreferences, limit = 5): Promise<ScoredCollege[]> {
    const query: any = { status: 'active' };
    if (preferences.streams?.length) query.streams = { $in: preferences.streams.map(s => new RegExp(s, 'i')) };
    if (preferences.budget?.max) query['fees.min'] = { $lte: preferences.budget.max };

    const candidates = await College.find(query).sort({ rating: -1 }).limit(limit * 4).lean();
    const scored = candidates.map(c => {
      const { score, strengths, weaknesses } = computeFitScore(c, preferences);
      return { college: c, matchScore: score, reason: `${c.name} ${strengths.length ? strengths.slice(0, 2).join(' and ').toLowerCase() : 'matches your preferences'}.`, strengths, weaknesses };
    });
    scored.sort((a, b) => b.matchScore - a.matchScore);
    return scored.slice(0, limit);
  },

  async getRecommendationExplanation(collegeName: string, preferences: UserPreferences): Promise<string> {
    const cacheKey = `expl:${collegeName}:${preferences.streams?.join(',')}`;
    const cached = cacheGet(cacheKey);
    if (cached) return cached;

    try {
      const prompt = `You are an Indian college counselor. In 2-3 concise sentences, explain why "${collegeName}" is a good match for a student interested in ${preferences.streams?.join(', ') || 'general studies'}. Be specific and encouraging.`;
      const result = await callGemini(prompt);
      cacheSet(cacheKey, result);
      return result;
    } catch {
      return `${collegeName} is well-regarded for its academic programs and offers strong opportunities in ${preferences.streams?.join(', ') || 'your chosen field'}. Consider exploring their placement statistics and campus facilities for a complete picture.`;
    }
  },

  async chat(message: string, context?: string): Promise<string> {
    const cacheKey = `chat:${message.slice(0, 80)}`;
    const cached = cacheGet(cacheKey);
    if (cached) return cached;

    try {
      const prompt = `You are CampusNavigator AI, a helpful college discovery assistant for Indian students. ${context ? `Context: ${context}` : ''}\n\nAnswer concisely in 2-4 sentences. Be specific to Indian higher education.\n\nQuestion: ${message}`;
      const result = await callGemini(prompt);
      cacheSet(cacheKey, result);
      return result;
    } catch {
      // Rich fallback based on keywords
      const lower = message.toLowerCase();
      if (lower.includes('iit')) return 'The Indian Institutes of Technology (IITs) are India\'s premier engineering institutions. Admission is through JEE Advanced after clearing JEE Main. IITs offer excellent placements with average packages ranging from ₹15-25 LPA.';
      if (lower.includes('iim')) return 'The Indian Institutes of Management (IIMs) are India\'s top B-schools. Admission to the PGP (MBA) program requires a strong CAT score. IIM graduates receive average packages of ₹20-35 LPA.';
      if (lower.includes('neet') || lower.includes('medical')) return 'For medical colleges in India, NEET-UG is the mandatory entrance exam. Top institutions include AIIMS, JIPMER, and government medical colleges. Consider NAAC accreditation and NMC approval when shortlisting.';
      if (lower.includes('placement')) return 'Placement rates vary significantly across colleges. Look for colleges with 80%+ placement rates, diverse recruiter profiles, and transparent placement reports. NIRF rankings include placement data as a scoring parameter.';
      if (lower.includes('engineering') || lower.includes('btech')) return 'India has thousands of engineering colleges. Focus on AICTE-approved, NAAC-accredited institutions with good NIRF rankings. Entrance exams include JEE Main, JEE Advanced, and state-level exams like KCET, WBJEE, and MHT-CET.';
      if (lower.includes('mba') || lower.includes('management')) return 'For MBA programs, consider IIMs, top private B-schools (ISB, XLRI, FMS), and state universities. Key entrance exams are CAT, XAT, GMAT, and SNAP. Look for AACSB/EQUIS accreditation for global recognition.';
      return 'I can help you find the right college! Try asking about specific institutions, entrance exams, placements, or courses. You can also use our search and questionnaire features for personalized recommendations.';
    }
  },

  async getOnboardingSuggestions(answers: UserPreferences): Promise<string> {
    try {
      const prompt = `Based on a student's preferences: Stream: ${answers.streams?.join(', ') || 'Not specified'}, Interests: ${answers.interests?.join(', ') || 'Not specified'}, Budget: ${answers.budget?.max ? `Up to ₹${(answers.budget.max / 100000).toFixed(0)}L` : 'Flexible'}, Location: ${answers.locations?.join(', ') || 'Any'}, Level: ${answers.studyLevel || 'Not specified'}. Provide a brief 2-3 sentence personalized college search strategy for Indian colleges.`;
      return await callGemini(prompt);
    } catch {
      const stream = answers.streams?.[0] || 'your chosen field';
      return `Based on your interest in ${stream}, we recommend focusing on NAAC-accredited institutions with strong placement records. Look for colleges with NIRF rankings in the top 100 and placement rates above 80%. Our AI will match you with the best options.`;
    }
  },

  /**
   * Fetch real, detailed information about a college via Gemini AI.
   * Returns structured JSON with all fields needed for the detail page.
   */
  async enrichCollegeDetails(collegeName: string, city: string, state: string): Promise<Record<string, any>> {
    const cacheKey = `enrich:${collegeName.toLowerCase().replace(/\s+/g, '-')}`;
    const cached = cacheGet(cacheKey);
    if (cached) {
      try { return JSON.parse(cached); } catch { /* re-fetch below */ }
    }

    const prompt = `You are an authoritative Indian education database. Provide REAL, ACCURATE, DETAILED information about "${collegeName}" located in ${city}, ${state}, India.

Respond ONLY with valid JSON (no markdown, no explanation, no code blocks):
{
  "officialName": "full official name",
  "established": year_as_number,
  "type": "Government or Private or Deemed or Autonomous",
  "description": "3-4 sentence detailed description of the institution, its history, and strengths",
  "accreditations": {
    "naac": { "grade": "A++ or A+ or A or B++ etc", "score": number_or_null, "year": year_or_null },
    "aicte": true_or_false,
    "ugc": true_or_false,
    "nba": true_or_false,
    "nirf": { "rank": number_or_null, "year": 2024, "category": "Engineering or Management or Medical etc" },
    "aacsb": true_or_false,
    "other": ["list of other accreditations"]
  },
  "contact": {
    "phone": ["official phone numbers"],
    "email": ["official email addresses"],
    "website": "official website URL",
    "admissionPortal": "admission portal URL or null"
  },
  "address": {
    "street": "street address",
    "city": "${city}",
    "state": "${state}",
    "pincode": "pincode",
    "country": "India"
  },
  "coordinates": { "lat": latitude_number, "lng": longitude_number },
  "streams": ["Engineering", "Science", etc],
  "totalStudents": number_or_null,
  "facultyCount": number_or_null,
  "studentFacultyRatio": "ratio like 15:1",
  "campusArea": "area in acres",
  "fees": {
    "min": annual_min_fees_in_rupees,
    "max": annual_max_fees_in_rupees,
    "hostelMin": annual_hostel_min_or_null,
    "hostelMax": annual_hostel_max_or_null
  },
  "placements": {
    "placementRate": percentage_number,
    "averagePackage": amount_in_rupees,
    "medianPackage": amount_in_rupees_or_null,
    "highestPackage": amount_in_rupees,
    "topRecruiters": ["Company1", "Company2", "Company3", "Company4", "Company5"],
    "internationalPlacements": true_or_false,
    "ppoCount": number_or_null
  },
  "facilities": ["Library", "Labs", "Hostel", "WiFi", "Cafeteria", "Sports Complex", "Hospital", "Auditorium"],
  "hostel": { "boys": true_or_false, "girls": true_or_false, "capacity": number_or_null },
  "courses": [
    {
      "name": "B.Tech Computer Science",
      "degree": "B.Tech",
      "stream": "Engineering",
      "duration": 4,
      "totalFees": fees_in_rupees,
      "intake": seats_count,
      "entranceExams": ["JEE Main", "JEE Advanced"]
    }
  ],
  "entranceExams": ["JEE Main", "NEET", "CAT", etc],
  "ranking": {
    "nirf": rank_number_or_null,
    "qs": rank_number_or_null,
    "times": rank_number_or_null,
    "india_today": rank_number_or_null,
    "outlook": rank_number_or_null
  },
  "notableAlumni": ["Name - Achievement", "Name - Achievement"],
  "researchCenters": ["center1", "center2"],
  "internationalCollaborations": ["University - Country", "University - Country"],
  "admissionProcess": ["Step 1", "Step 2", "Step 3"],
  "scholarships": ["scholarship1", "scholarship2"],
  "tags": ["IIT", "NIRF Top 10", etc],
  "highlights": ["key highlight 1", "key highlight 2", "key highlight 3", "key highlight 4"]
}`;

    try {
      const raw = await callGemini(prompt);
      // Extract JSON from response
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('No JSON in Gemini response');
      const data = JSON.parse(jsonMatch[0]);
      cacheSet(cacheKey, JSON.stringify(data));
      return data;
    } catch (err: any) {
      logger.warn(`[AI] enrichCollegeDetails failed for "${collegeName}": ${err.message}`);
      // Return minimal fallback
      return {
        officialName: collegeName,
        description: `${collegeName} is a well-known educational institution located in ${city}, ${state}. It offers quality education and has been consistently ranked among India's top colleges.`,
        accreditations: {},
        placements: {},
        facilities: ['Library', 'Labs', 'Hostel', 'WiFi', 'Cafeteria', 'Sports Complex'],
        courses: [],
        highlights: [],
      };
    }
  },
};

export default aiService;
