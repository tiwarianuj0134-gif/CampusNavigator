/**
 * Shared TypeScript interfaces for the frontend.
 * NO hardcoded data. All data comes from the backend API.
 */

export interface College {
  id: string;
  _id?: string;
  name: string;
  slug?: string;
  shortName?: string;
  city: string;
  state: string;
  rating: number;
  reviewCount: number;
  type: string;
  established: number;
  fees: { min: number; max: number };
  streams: string[];
  tags: string[];
  description: string;
  image: string;
  coverImage?: string;
  logo: string;
  lat: number;
  lng: number;
  ranking: number;
  facilities: string[];
  placementRate: number;
  avgPackage: string;
  highestPackage: string;
  courses: Course[];
  accreditation: string;
  website: string;
  approvals?: {
    aicte?: boolean;
    ugc?: boolean;
    naac?: { grade: string; score?: number };
    nirf?: { rank: number; year: number; category: string };
  };
  placements?: {
    averagePackage?: number;
    highestPackage?: number;
    medianPackage?: number;
    placementRate?: number;
    topRecruiters?: string[];
  };
  contact?: {
    phone?: string[];
    email?: string[];
    website?: string;
  };
  address?: {
    city: string;
    state: string;
    pincode?: string;
  };
}

export interface Course {
  id?: string;
  name: string;
  duration: string;
  fees: number;
  seats: number;
  degree?: string;
  stream?: string;
  specialization?: string;
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  avatar: string;
  collegeId: string;
  rating: number;
  title: string;
  content: string;
  date: string;
  helpful: number;
  categories: {
    academics: number;
    faculty: number;
    infrastructure: number;
    placements: number;
    social: number;
  };
}

/** Utility: simulate delay (used only when backend is unreachable) */
export const delay = (ms: number = 600) =>
  new Promise((resolve) => setTimeout(resolve, ms));
