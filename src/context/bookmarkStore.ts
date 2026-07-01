/**
 * Bookmark Store
 * Manages college bookmarks with optimistic updates and persistence
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { College } from '@/data/mockData';

interface BookmarkState {
  bookmarkIds: string[];
  bookmarkedColleges: College[];
  isLoading: boolean;
  lastSynced: number | null;
}

interface BookmarkActions {
  toggle: (college: College) => void;
  add: (college: College) => void;
  remove: (id: string) => void;
  isBookmarked: (id: string) => boolean;
  getBookmarks: () => College[];
  syncWithServer: () => Promise<void>;
  clearAll: () => void;
}

type BookmarkStore = BookmarkState & BookmarkActions;

export const useBookmarkStore = create<BookmarkStore>()(
  persist(
    (set, get) => ({
      // State
      bookmarkIds: [],
      bookmarkedColleges: [],
      isLoading: false,
      lastSynced: null,

      // Actions
      toggle: (college) => {
        const { bookmarkIds, bookmarkedColleges } = get();
        const isCurrentlyBookmarked = bookmarkIds.includes(college.id);

        if (isCurrentlyBookmarked) {
          // Optimistic remove
          set({
            bookmarkIds: bookmarkIds.filter(id => id !== college.id),
            bookmarkedColleges: bookmarkedColleges.filter(c => c.id !== college.id),
          });
          
          // Sync with server (fire and forget)
          // api.delete(`/bookmarks/${college.id}`).catch(() => {
          //   // Rollback on error
          //   set(state => ({
          //     bookmarkIds: [...state.bookmarkIds, college.id],
          //     bookmarkedColleges: [...state.bookmarkedColleges, college],
          //   }));
          // });
        } else {
          // Optimistic add
          set({
            bookmarkIds: [...bookmarkIds, college.id],
            bookmarkedColleges: [...bookmarkedColleges, college],
          });
          
          // Sync with server (fire and forget)
          // api.post('/bookmarks', { collegeId: college.id }).catch(() => {
          //   // Rollback on error
          //   set(state => ({
          //     bookmarkIds: state.bookmarkIds.filter(id => id !== college.id),
          //     bookmarkedColleges: state.bookmarkedColleges.filter(c => c.id !== college.id),
          //   }));
          // });
        }
      },

      add: (college) => {
        const { bookmarkIds, bookmarkedColleges } = get();
        if (!bookmarkIds.includes(college.id)) {
          set({
            bookmarkIds: [...bookmarkIds, college.id],
            bookmarkedColleges: [...bookmarkedColleges, college],
          });
        }
      },

      remove: (id) => {
        set(state => ({
          bookmarkIds: state.bookmarkIds.filter(bid => bid !== id),
          bookmarkedColleges: state.bookmarkedColleges.filter(c => c.id !== id),
        }));
      },

      isBookmarked: (id) => get().bookmarkIds.includes(id),

      getBookmarks: () => get().bookmarkedColleges,

      syncWithServer: async () => {
        set({ isLoading: true });
        try {
          // Fetch bookmarks from server
          // const response = await api.get<{ bookmarks: College[] }>('/bookmarks');
          // set({
          //   bookmarkIds: response.data.bookmarks.map(c => c.id),
          //   bookmarkedColleges: response.data.bookmarks,
          //   lastSynced: Date.now(),
          //   isLoading: false,
          // });
          set({ lastSynced: Date.now(), isLoading: false });
        } catch {
          set({ isLoading: false });
        }
      },

      clearAll: () => {
        set({
          bookmarkIds: [],
          bookmarkedColleges: [],
          lastSynced: null,
        });
      },
    }),
    {
      name: 'cn_bookmarks',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        bookmarkIds: state.bookmarkIds,
        bookmarkedColleges: state.bookmarkedColleges,
        lastSynced: state.lastSynced,
      }),
    }
  )
);
