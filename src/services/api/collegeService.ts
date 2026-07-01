/**
 * College Service — API-Driven
 * Normalizes backend responses to frontend College shape.
 *
 * Backend response patterns (verified from controllers):
 * - getAll:     { success, data: College[], pagination: {...} }
 * - getFeatured:{ success, data: { colleges: College[] } }
 * - getById:    { success, data: { college: College } }
 * - compare:    { success, data: { colleges: College[] } }
 * - reviews:    { success, data: Review[], pagination }
 */

import { api } from './client';
import type { College } from '@/data/mockData';

interface CollegeFilters {
  search?: string;
  stream?: string;
  city?: string;
  state?: string;
  type?: string;
  minFees?: number;
  maxFees?: number;
  minRating?: number;
  sort?: string;
  page?: number;
  limit?: number;
}

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
  hasMore: boolean;
}

/** Normalize a raw backend college doc → frontend College shape.
 *  All array fields guaranteed to be real arrays — handles space-separated strings
 *  that the backend sometimes returns (e.g. "streams": "Engineering Science Management").
 */
function normalizeCollege(raw: any): College {
  if (!raw) return {} as College;

  /** Always return a real array — handles arrays, strings, and undefined */
  const arr = (v: any): any[] => {
    if (Array.isArray(v)) return v;
    if (typeof v === 'string' && v.trim()) return v.split(/\s+/);
    return [];
  };

  return {
    id:            raw._id?.toString() || raw.id || '',
    _id:           raw._id?.toString(),
    name:          raw.name   || '',
    slug:          raw.slug,
    shortName:     raw.shortName,
    city:          raw.address?.city  || raw.city  || '',
    state:         raw.address?.state || raw.state || '',
    rating:        Number(raw.rating)      || 0,
    reviewCount:   Number(raw.reviewCount) || 0,
    type:          raw.type        || 'Private',
    established:   Number(raw.established) || 0,
    fees:          raw.fees        || { min: 0, max: 0 },
    streams:       arr(raw.streams),
    tags:          arr(raw.tags),
    description:   raw.description || '',
    image:         raw.coverImage  || raw.image
                   || 'https://images.unsplash.com/photo-1562774053-701939374585?w=800&q=80',
    coverImage:    raw.coverImage,
    logo:          raw.logo || '',
    lat:           raw.coordinates?.lat || raw.lat || 0,
    lng:           raw.coordinates?.lng || raw.lng || 0,
    ranking:       raw.approvals?.nirf?.rank || raw.ranking || 999,
    facilities:    arr(raw.facilities),
    placementRate: raw.placements?.placementRate || raw.placementRate || 0,
    avgPackage:    raw.placements?.averagePackage
      ? `₹${(raw.placements.averagePackage / 100000).toFixed(1)} LPA`
      : raw.avgPackage || '—',
    highestPackage: raw.placements?.highestPackage
      ? `₹${(raw.placements.highestPackage / 100000).toFixed(1)} LPA`
      : raw.highestPackage || '—',
    courses: arr(raw.courses).map((c: any) => ({
      id:             c._id?.toString() || c.id,
      name:           c.name || '',
      duration:       c.duration?.years
                        ? `${c.duration.years} years`
                        : c.duration_str || String(c.duration || ''),
      fees:           c.fees?.total || c.fees || 0,
      seats:          c.intake || c.seats || 0,
      degree:         c.degree,
      stream:         c.stream,
      specialization: c.specialization,
    })),
    accreditation: raw.approvals?.naac?.grade
      ? `NAAC ${raw.approvals.naac.grade}`
      : raw.accreditation || '',
    website:    raw.contact?.website || raw.website || '',
    approvals:  raw.approvals,
    placements: raw.placements,
    contact:    raw.contact,
    address:    raw.address,
  };
}

export const collegeService = {
  /**
   * GET /api/colleges
   * Backend: { success, data: College[], pagination }
   */
  async getAll(params?: CollegeFilters): Promise<PaginatedResponse<College>> {
    try {
      const response = await api.get<any>('/colleges', params as any);
      // api.get returns the full ApiResponse: { success, data, pagination }
      // so response.data is the array, response.pagination is pagination
      const rawData = Array.isArray(response.data) ? response.data : [];
      const pagination = (response as any).pagination || {};
      return {
        data: rawData.map(normalizeCollege),
        total: pagination.total ?? rawData.length,
        page: pagination.page ?? 1,
        totalPages: pagination.totalPages ?? 1,
        hasMore: pagination.hasMore ?? false,
      };
    } catch (error: any) {
      console.error('[collegeService.getAll]', error.message);
      return { data: [], total: 0, page: 1, totalPages: 0, hasMore: false };
    }
  },

  /**
   * GET /api/colleges/:id
   * Backend: { success, data: { college: College } }
   */
  async getById(id: string): Promise<College | null> {
    try {
      const response = await api.get<any>(`/colleges/${id}`);
      // response.data = { college: {...} }
      const raw = response.data?.college || response.data;
      return raw ? normalizeCollege(raw) : null;
    } catch (err: any) {
      console.error('[collegeService.getById]', err.message);
      return null;
    }
  },

  /**
   * GET /api/colleges/featured
   * Backend: { success, data: { colleges: College[] } }
   */
  async getFeatured(limit: number = 6): Promise<College[]> {
    try {
      const response = await api.get<any>('/colleges/featured', { limit });
      // response.data = { colleges: [...] }
      const rawData = response.data?.colleges ?? (Array.isArray(response.data) ? response.data : []);
      return rawData.map(normalizeCollege);
    } catch (err: any) {
      console.error('[collegeService.getFeatured]', err.message);
      return [];
    }
  },

  /**
   * POST /api/ai/recommendations
   * Backend: { success, data: { recommendations: [...] } }
   */
  async getRecommendations(preferences: any): Promise<(College & { matchScore: number; reason: string })[]> {
    try {
      const response = await api.post<any>('/ai/recommendations', { preferences });
      const recs = response.data?.recommendations ?? (Array.isArray(response.data) ? response.data : []);
      return recs.map((r: any) => ({
        ...normalizeCollege(r.college || r),
        matchScore: r.matchScore || 0,
        reason: r.reason || '',
      }));
    } catch (err: any) {
      console.error('[collegeService.getRecommendations]', err.message);
      return [];
    }
  },

  /**
   * GET /api/colleges/compare?ids=id1,id2
   * Backend: { success, data: { colleges: College[] } }
   */
  async compare(ids: string[]): Promise<College[]> {
    try {
      const response = await api.get<any>('/colleges/compare', { ids: ids.join(',') });
      const rawData = response.data?.colleges ?? (Array.isArray(response.data) ? response.data : []);
      return rawData.map(normalizeCollege);
    } catch (err: any) {
      console.error('[collegeService.compare]', err.message);
      return [];
    }
  },

  /**
   * POST /api/ai/enrich-college
   * Backend: { success, data: { enriched: {...} } }
   */
  async enrichCollege(name: string, city: string, state: string): Promise<Record<string, any>> {
    try {
      const response = await api.post<any>('/ai/enrich-college', { name, city, state });
      return response.data?.enriched ?? {};
    } catch (err: any) {
      console.error('[collegeService.enrichCollege]', err.message);
      return {};
    }
  },
};

export default collegeService;
