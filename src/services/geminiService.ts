/**
 * AI/Gemini Service — Frontend
 * ALL calls proxy through backend. No API keys in browser.
 *
 * Backend AI routes (verified from aiRoutes.ts):
 * POST /api/ai/chat
 * POST /api/ai/recommendations
 * POST /api/ai/explanation
 * POST /api/ai/onboarding-suggestions
 * POST /api/ai/enrich-college
 */

import { api } from './api/client';

interface AIResponse {
  text: string;
  error?: string;
}

export const geminiService = {
  /**
   * POST /api/ai/chat
   * Backend: { success, data: { response: string } }
   */
  async chat(message: string, context?: string): Promise<AIResponse> {
    try {
      const res = await api.post<any>('/ai/chat', { message, context });
      const text = res.data?.response ?? res.data?.text ?? '';
      return { text };
    } catch (error: any) {
      // Rich keyword fallback when backend AI is unavailable
      const lower = (message || '').toLowerCase();
      let fallback = 'I\'m having trouble connecting to the AI service. Please try again in a moment.';
      if (lower.includes('iit'))
        fallback = 'IITs are India\'s premier engineering institutes. Admission is via JEE Advanced. Average packages range ₹15–25 LPA at top IITs like IIT Bombay, Delhi, and Madras.';
      else if (lower.includes('neet') || lower.includes('medical'))
        fallback = 'NEET is mandatory for all medical admissions in India. Top institutes include AIIMS Delhi, JIPMER Puducherry, CMC Vellore, and MAMC Delhi.';
      else if (lower.includes('iim') || lower.includes('mba') || lower.includes('cat'))
        fallback = 'IIMs are India\'s top B-Schools. CAT is the primary entrance exam. Average packages at IIM A/B/C are ₹25–35 LPA. FMS Delhi offers the best ROI.';
      else if (lower.includes('placement'))
        fallback = 'Look for colleges with 80%+ placement rates, verified placement reports, and diverse recruiter lists with Fortune 500 companies.';
      else if (lower.includes('nit'))
        fallback = 'NITs are top government engineering colleges. NIT Trichy, Warangal, and Surathkal are the top 3. Admission via JEE Main counselling (JoSAA).';
      else if (lower.includes('bits') || lower.includes('bitsat'))
        fallback = 'BITS Pilani is India\'s top private engineering institute, known for its flexible academics and Practice School internship program. Admission via BITSAT.';
      else if (lower.includes('fees') || lower.includes('cost'))
        fallback = 'Government colleges like IITs/NITs charge ₹2–10L total fees. Private colleges like VIT/Manipal charge ₹5–25L. IIMs charge ₹20–30L for the full MBA program.';
      return { text: fallback, error: error?.message };
    }
  },

  /**
   * POST /api/ai/onboarding-suggestions
   * Backend: { success, data: { suggestions: string } }
   */
  async getOnboardingSuggestion(answers: any): Promise<AIResponse> {
    try {
      const res = await api.post<any>('/ai/onboarding-suggestions', { answers });
      const text = res.data?.suggestions ?? res.data?.text ?? '';
      return { text };
    } catch (error: any) {
      const stream = answers?.stream || answers?.streams?.[0] || 'your chosen field';
      const location = answers?.location || 'your preferred location';
      return {
        text: `Based on your interest in ${stream} in ${location}, we recommend looking at NAAC A++ accredited colleges with strong placement records in the top 50 NIRF rankings. Consider factors like faculty quality, industry connections, and campus infrastructure.`,
        error: error?.message,
      };
    }
  },

  /**
   * POST /api/ai/explanation
   * Backend: { success, data: { explanation: string } }
   */
  async getRecommendationExplanation(collegeName: string, preferences: any): Promise<AIResponse> {
    try {
      const res = await api.post<any>('/ai/explanation', { collegeName, preferences });
      const text = res.data?.explanation ?? '';
      return { text };
    } catch (error: any) {
      return {
        text: `${collegeName} is a strong match based on your preferences in stream, budget, and location. It has a proven track record with excellent placements and accreditation.`,
        error: error?.message,
      };
    }
  },
};

export default geminiService;
