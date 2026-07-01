/**
 * Review Service — API-Driven
 */

import { api } from './client';
import type { Review } from '@/data/mockData';

export const reviewService = {
  async getByCollege(collegeId: string): Promise<Review[]> {
    try {
      const response = await api.get<any>(`/colleges/${collegeId}/reviews`);
      // Backend: { success, data: [...], pagination }
      const rawData = Array.isArray(response.data)
        ? response.data
        : response.data?.reviews || [];
      return rawData.map((r: any) => ({
        id: r._id || r.id || '',
        userId: r.user?._id || r.userId || '',
        userName: r.user?.name || r.userName || 'Anonymous',
        avatar: r.user?.avatar || r.avatar || '',
        collegeId: r.college || r.collegeId || collegeId,
        rating: r.rating || 0,
        title: r.title || '',
        content: r.content || '',
        date: r.createdAt ? new Date(r.createdAt).toLocaleDateString('en-IN') : r.date || '',
        helpful: r.helpfulCount || r.helpful || 0,
        categories: r.ratings || r.categories || {
          academics: r.rating || 0,
          faculty: r.rating || 0,
          infrastructure: r.rating || 0,
          placements: r.rating || 0,
          social: r.rating || 0,
        },
      }));
    } catch {
      return [];
    }
  },

  async create(review: Partial<Review>): Promise<Review | null> {
    try {
      const response = await api.post<any>('/reviews', {
        college: review.collegeId,
        title: review.title,
        content: review.content,
        rating: review.rating,
        ratings: review.categories,
      });
      return response.data || null;
    } catch {
      return null;
    }
  },
};
