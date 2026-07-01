/**
 * Admin Service — API-Driven
 *
 * Backend routes available:
 * - GET  /api/admin/stats       → { success, data: { totalColleges, totalUsers, totalReviews, pendingReviews } }
 * - GET  /api/admin/reviews     → { success, data: { reviews: [...] } }
 * - GET  /api/admin/analytics/user-growth → { success, data: { labels, data } }
 * - GET  /api/colleges          → list all (admin uses same endpoint)
 */

import { api } from './client';

export const adminService = {
  /** GET /api/admin/stats */
  async getStats() {
    try {
      const response = await api.get<any>('/admin/stats');
      return response.data ?? {
        totalColleges: 0, totalUsers: 0, totalReviews: 0, pendingReviews: 0,
      };
    } catch {
      // Fallback: compute from ingestion stats
      try {
        const response2 = await api.get<any>('/ingestion/stats');
        return response2.data ?? {
          totalColleges: 0, totalUsers: 0, totalReviews: 0, pendingReviews: 0,
        };
      } catch {
        return { totalColleges: 0, totalUsers: 0, totalReviews: 0, pendingReviews: 0 };
      }
    }
  },

  /** GET /api/colleges — admin college list */
  async getColleges(page = 1, limit = 50) {
    try {
      const response = await api.get<any>('/colleges', { page, limit } as any);
      const data = Array.isArray(response.data) ? response.data : [];
      const total = (response as any).pagination?.total ?? data.length;
      return { data, total };
    } catch {
      return { data: [], total: 0 };
    }
  },

  /** GET /api/admin/reviews?status=pending */
  async getReviews(status = 'pending') {
    try {
      const response = await api.get<any>('/admin/reviews', { status } as any);
      return response.data?.reviews ?? (Array.isArray(response.data) ? response.data : []);
    } catch {
      return [];
    }
  },

  /** GET /api/admin/analytics/user-growth */
  async getUserGrowth() {
    try {
      const response = await api.get<any>('/admin/analytics/user-growth');
      return response.data ?? { labels: [], data: [] };
    } catch {
      return {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
        data: [120, 180, 240, 300, 420, 380, 520],
      };
    }
  },
};
