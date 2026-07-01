/**
 * Recommendation Service — API-Driven
 * All recommendations come from backend AI engine.
 */

import { api } from './client';

export const recommendationService = {
  async getPersonalized(userId: string) {
    try {
      const response = await api.post<any>('/ai/recommendations', {
        preferences: {},
        userId,
      });
      return response.data?.recommendations || (Array.isArray(response.data) ? response.data : []);
    } catch {
      return [];
    }
  },

  async getByPreferences(prefs: {
    stream?: string;
    interests?: string[];
    budget?: string;
    location?: string;
    level?: string;
  }) {
    try {
      const response = await api.post<any>('/ai/recommendations', {
        preferences: {
          streams: prefs.stream ? [prefs.stream] : undefined,
          locations: prefs.location ? [prefs.location] : undefined,
          interests: prefs.interests,
          studyLevel: prefs.level,
        },
      });
      return response.data?.recommendations || (Array.isArray(response.data) ? response.data : []);
    } catch {
      return [];
    }
  },
};
