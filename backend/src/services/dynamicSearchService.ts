/**
 * Dynamic Search Service
 * Hybrid search: MongoDB first, then Gemini AI fallback for unknown colleges.
 * Uses direct HTTP to Gemini (no SDK) — consistent with aiService.
 */

import config from '../config/index.js';
import { College } from '../models/College.js';
import { RawInstitution } from '../models/RawInstitution.js';
import { normalizeInstitutionName, normalizeCity, normalizeState } from '../utils/normalizers/index.js';
import { logger } from '../utils/logger.js';

const GEMINI_URL = config.GEMINI_API_KEY
  ? `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${config.GEMINI_API_KEY}`
  : null;

export interface DynamicResult {
  source: 'database' | 'ai_discovery';
  _id?: string;
  name: string;
  city?: string;
  state?: string;
  type?: string;
  description?: string;
  established?: number;
  website?: string;
  streams?: string[];
  approvals?: string;
  fees?: string;
  rating?: number;
  temporary: boolean;
  queuedForIngestion: boolean;
}

// In-memory cache
const cache = new Map<string, { data: DynamicResult[]; expires: number }>();
const CACHE_TTL = 60 * 60 * 1000;

async function callGeminiForDiscovery(query: string): Promise<any | null> {
  if (!GEMINI_URL) return null;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);

    const prompt = `You are an Indian education database. For the institution "${query}", respond ONLY with valid JSON (no markdown, no explanation):
{"name":"Full official name","city":"City","state":"State","type":"Government or Private or Deemed","established":year_or_null,"description":"One paragraph description","website":"URL or null","streams":["stream1","stream2"],"approvals":"AICTE, UGC, NAAC grade if known","feesRange":"approx annual fees","exists":true}
If this institution does not exist or you are unsure, respond: {"exists":false}`;

    const res = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.3, maxOutputTokens: 512 },
      }),
    });
    clearTimeout(timeout);

    if (!res.ok) {
      logger.warn(`[dynamicSearch] Gemini returned ${res.status}`);
      return null;
    }

    const data = await res.json() as any;
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) return null;

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;

    const parsed = JSON.parse(jsonMatch[0]);
    return parsed.exists ? parsed : null;
  } catch (err: any) {
    logger.warn(`[dynamicSearch] Gemini discovery failed: ${err.message}`);
    return null;
  }
}

export const dynamicSearchService = {
  async search(query: string): Promise<DynamicResult[]> {
    if (!query || query.trim().length < 2) return [];

    const cacheKey = query.toLowerCase().trim();
    const cached = cache.get(cacheKey);
    if (cached && cached.expires > Date.now()) return cached.data;

    // Step 1: Search MongoDB
    try {
      const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const dbResults = await College.find({
        status: 'active',
        $or: [
          { name: { $regex: escaped, $options: 'i' } },
          { shortName: { $regex: escaped, $options: 'i' } },
          { 'address.city': { $regex: escaped, $options: 'i' } },
          { 'address.state': { $regex: escaped, $options: 'i' } },
          { streams: { $regex: escaped, $options: 'i' } },
          { tags: { $regex: escaped, $options: 'i' } },
        ],
      })
        .sort({ rating: -1 })
        .limit(10)
        .lean();

      if (dbResults.length > 0) {
        const results: DynamicResult[] = dbResults.map((c: any) => ({
          source: 'database' as const,
          _id: c._id?.toString(),
          name: c.name,
          city: c.address?.city,
          state: c.address?.state,
          type: c.type,
          description: c.description,
          established: c.established,
          website: c.contact?.website,
          streams: c.streams,
          approvals: [
            c.approvals?.aicte ? 'AICTE' : '',
            c.approvals?.ugc ? 'UGC' : '',
            c.approvals?.naac?.grade ? `NAAC ${c.approvals.naac.grade}` : '',
          ].filter(Boolean).join(', ') || undefined,
          rating: c.rating,
          temporary: false,
          queuedForIngestion: false,
        }));
        cache.set(cacheKey, { data: results, expires: Date.now() + CACHE_TTL });
        return results;
      }
    } catch (err: any) {
      logger.error(`[dynamicSearch] MongoDB search failed: ${err.message}`);
    }

    // Step 2: Also check staging table
    try {
      const rawResults = await RawInstitution.find({
        nameNormalized: { $regex: normalizeInstitutionName(query).split(' ').slice(0, 3).join('.*'), $options: 'i' },
      }).limit(5).lean();

      if (rawResults.length > 0) {
        const results: DynamicResult[] = rawResults.map((r: any) => ({
          source: 'database' as const,
          name: r.name,
          city: r.city,
          state: r.state,
          type: r.type,
          description: 'This institution is being reviewed and will have full data soon.',
          website: r.website,
          streams: r.streams,
          temporary: true,
          queuedForIngestion: true,
        }));
        cache.set(cacheKey, { data: results, expires: Date.now() + CACHE_TTL });
        return results;
      }
    } catch { /* ignore staging errors */ }

    // Step 3: Gemini AI discovery
    const discovered = await callGeminiForDiscovery(query);
    if (!discovered) return [];

    // Queue for future ingestion
    let queuedForIngestion = false;
    try {
      const nameNorm = normalizeInstitutionName(discovered.name);
      const exists = await RawInstitution.findOne({ source: 'college_website', nameNormalized: nameNorm });
      if (!exists) {
        await RawInstitution.create({
          source: 'college_website',
          name: discovered.name,
          nameNormalized: nameNorm,
          city: discovered.city ? normalizeCity(discovered.city) : undefined,
          state: discovered.state ? normalizeState(discovered.state) : undefined,
          type: discovered.type,
          description: discovered.description,
          established: discovered.established,
          website: discovered.website,
          streams: discovered.streams || [],
          rawPayload: discovered,
          moderationStatus: 'pending',
        });
        queuedForIngestion = true;
        logger.info(`[dynamicSearch] Queued "${discovered.name}" for ingestion`);
      }
    } catch (err: any) {
      if (err.code !== 11000) logger.warn(`[dynamicSearch] Queue error: ${err.message}`);
    }

    const results: DynamicResult[] = [{
      source: 'ai_discovery',
      name: discovered.name,
      city: discovered.city,
      state: discovered.state,
      type: discovered.type,
      description: discovered.description,
      established: discovered.established,
      website: discovered.website,
      streams: discovered.streams,
      approvals: discovered.approvals,
      fees: discovered.feesRange,
      temporary: true,
      queuedForIngestion,
    }];

    cache.set(cacheKey, { data: results, expires: Date.now() + CACHE_TTL });
    return results;
  },

  async searchGeminiForColleges(query: string): Promise<DynamicResult[]> {
    if (!GEMINI_URL) return [];
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);

      const prompt = `You are an Indian education database. For the search query "${query}", respond ONLY with a valid JSON array of up to 6 Indian institutions (no markdown, no explanation, no formatting except JSON):
[
  {
    "name": "Full official name",
    "city": "City",
    "state": "State",
    "type": "Government or Private or Deemed",
    "established": year_or_null,
    "description": "One paragraph description",
    "website": "URL or null",
    "streams": ["stream1","stream2"],
    "approvals": "AICTE, UGC, NAAC grade if known",
    "feesRange": "approx annual fees"
  }
]
If no institutions match or you are unsure, respond: []`;

      const res = await fetch(GEMINI_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.4, maxOutputTokens: 1024 },
        }),
      });
      clearTimeout(timeout);

      if (!res.ok) {
        logger.warn(`[dynamicSearch] searchGeminiForColleges returned HTTP ${res.status}`);
        return [];
      }

      const data = await res.json() as any;
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) return [];

      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (!jsonMatch) return [];

      const list = JSON.parse(jsonMatch[0]);
      if (!Array.isArray(list)) return [];

      // Map to DynamicResult
      const mappedResults: DynamicResult[] = list.map((item: any) => ({
        source: 'ai_discovery' as const,
        name: item.name,
        city: item.city,
        state: item.state,
        type: item.type || 'Private',
        description: item.description || 'Discovered via AI.',
        established: item.established,
        website: item.website,
        streams: item.streams || [],
        approvals: item.approvals || '',
        fees: item.feesRange || '',
        temporary: true,
        queuedForIngestion: false,
      }));

      // Queue for ingestion in background
      for (const inst of list) {
        try {
          const nameNorm = normalizeInstitutionName(inst.name);
          const exists = await RawInstitution.findOne({ source: 'college_website', nameNormalized: nameNorm });
          if (!exists) {
            await RawInstitution.create({
              source: 'college_website',
              name: inst.name,
              nameNormalized: nameNorm,
              city: inst.city ? normalizeCity(inst.city) : undefined,
              state: inst.state ? normalizeState(inst.state) : undefined,
              type: inst.type,
              description: inst.description,
              established: inst.established,
              website: inst.website,
              streams: inst.streams || [],
              rawPayload: inst,
              moderationStatus: 'pending',
            });
          }
        } catch (err: any) {
          if (err.code !== 11000) logger.warn(`[dynamicSearch] Queue error: ${err.message}`);
        }
      }

      return mappedResults;
    } catch (err: any) {
      logger.error(`[dynamicSearch] searchGeminiForColleges failed: ${err.message}`);
      return [];
    }
  },

  clearCache() { cache.clear(); },
};

export default dynamicSearchService;
