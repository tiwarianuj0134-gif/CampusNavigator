import { create } from 'zustand';
import type { College } from '@/data/mockData';

interface CompareState {
  colleges: College[];
  addCollege: (college: College) => void;
  removeCollege: (id: string) => void;
  clearAll: () => void;
}

export const useCompareStore = create<CompareState>((set) => ({
  colleges: [],
  addCollege: (college) => set((state) => {
    if (state.colleges.length >= 4) return state;
    if (state.colleges.find(c => c.id === college.id)) return state;
    return { colleges: [...state.colleges, college] };
  }),
  removeCollege: (id) => set((state) => ({
    colleges: state.colleges.filter(c => c.id !== id),
  })),
  clearAll: () => set({ colleges: [] }),
}));
