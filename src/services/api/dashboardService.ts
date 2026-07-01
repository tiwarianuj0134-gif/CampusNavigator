/**
 * Dashboard Service — API-Driven
 */

import { api } from './client';

export const dashboardService = {
  async getStats() {
    try {
      const response = await api.get<any>('/dashboard/stats');
      return response.data || { totalColleges: 0, bookmarks: 0, applications: 0, recommendations: 0 };
    } catch {
      return { totalColleges: 0, bookmarks: 0, applications: 0, recommendations: 0 };
    }
  },

  async getBookmarks() {
    try {
      const response = await api.get<any>('/dashboard/bookmarks');
      return response.data?.bookmarks || (Array.isArray(response.data) ? response.data : []);
    } catch {
      return [];
    }
  },

  async getApplications() {
    try {
      const response = await api.get<any>('/dashboard/applications');
      return response.data?.applications || (Array.isArray(response.data) ? response.data : []);
    } catch {
      return [];
    }
  },

  async getActivity() {
    try {
      const response = await api.get<any>('/dashboard/activity');
      return response.data?.activity || (Array.isArray(response.data) ? response.data : []);
    } catch {
      return [];
    }
  },

  async getAnalytics() {
    try {
      const response = await api.get<any>('/dashboard/analytics');
      return response.data || { labels: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'], views: [0,0,0,0,0,0,0] };
    } catch {
      return { labels: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'], views: [0,0,0,0,0,0,0] };
    }
  },
};
