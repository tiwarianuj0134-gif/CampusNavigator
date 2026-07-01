export const APP_NAME = 'CampusNavigator';
export const APP_TAGLINE = 'Discover Your Perfect College with AI';

export const STREAMS = [
  'Engineering', 'Medical', 'Business', 'Arts', 'Science', 'Law', 'Design', 'Pharmacy', 'Architecture', 'Agriculture'
];

export const INTERESTS = [
  'Research', 'Startups', 'Sports', 'Cultural', 'Placements', 'International Exposure', 'Innovation', 'Community Service'
];

export const BUDGET_RANGES = [
  { label: 'Under ₹1L', min: 0, max: 100000 },
  { label: '₹1L - ₹5L', min: 100000, max: 500000 },
  { label: '₹5L - ₹10L', min: 500000, max: 1000000 },
  { label: '₹10L - ₹25L', min: 1000000, max: 2500000 },
  { label: '₹25L+', min: 2500000, max: Infinity },
];

export const STUDY_LEVELS = ['Undergraduate', 'Postgraduate', 'Doctorate', 'Diploma'];

export const LOCATIONS = [
  'Delhi NCR', 'Mumbai', 'Bangalore', 'Chennai', 'Hyderabad', 'Pune', 'Kolkata', 'Jaipur', 'Lucknow', 'Chandigarh'
];

export const SORT_OPTIONS = [
  { value: 'rating', label: 'Highest Rating' },
  { value: 'fees_low', label: 'Lowest Fees' },
  { value: 'fees_high', label: 'Highest Fees' },
  { value: 'name', label: 'Name A-Z' },
];

export const NAV_LINKS = [
  { label: 'Home', path: '/' },
  { label: 'Search', path: '/search' },
  { label: 'Compare', path: '/compare' },
  { label: 'Questionnaire', path: '/questionnaire' },
];

export const DASHBOARD_NAV = [
  { label: 'Overview', path: '/dashboard' },
  { label: 'Bookmarks', path: '/dashboard/bookmarks' },
  { label: 'Applications', path: '/dashboard/applications' },
  { label: 'Recommendations', path: '/dashboard/recommendations' },
  { label: 'Settings', path: '/dashboard/settings' },
];
