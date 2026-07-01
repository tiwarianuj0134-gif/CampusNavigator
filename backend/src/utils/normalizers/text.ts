/**
 * Text Normalization Utilities
 * Handles inconsistent naming, casing, and special characters
 */

/** Normalize institution name for deduplication matching */
export function normalizeInstitutionName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[''`]/g, "'")
    .replace(/[""]/g, '"')
    .replace(/\b(the|of|and|&|for|in)\b/gi, '')
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Normalize city names */
export function normalizeCity(city: string): string {
  const cityMap: Record<string, string> = {
    'bengaluru': 'Bangalore',
    'bengalooru': 'Bangalore',
    'bangalore': 'Bangalore',
    'mumbai': 'Mumbai',
    'bombay': 'Mumbai',
    'chennai': 'Chennai',
    'madras': 'Chennai',
    'kolkata': 'Kolkata',
    'calcutta': 'Kolkata',
    'new delhi': 'New Delhi',
    'delhi': 'New Delhi',
    'noida': 'Noida',
    'gurgaon': 'Gurugram',
    'gurugram': 'Gurugram',
    'pune': 'Pune',
    'poona': 'Pune',
    'hyderabad': 'Hyderabad',
    'secunderabad': 'Hyderabad',
    'thiruvananthapuram': 'Thiruvananthapuram',
    'trivandrum': 'Thiruvananthapuram',
    'varanasi': 'Varanasi',
    'benaras': 'Varanasi',
    'banaras': 'Varanasi',
    'kochi': 'Kochi',
    'cochin': 'Kochi',
    'visakhapatnam': 'Visakhapatnam',
    'vizag': 'Visakhapatnam',
    'coimbatore': 'Coimbatore',
    'guwahati': 'Guwahati',
    'gauhati': 'Guwahati',
  };
  const lower = city.toLowerCase().trim();
  return cityMap[lower] || city.trim().replace(/\b\w/g, c => c.toUpperCase());
}

/** Normalize state names */
export function normalizeState(state: string): string {
  const stateMap: Record<string, string> = {
    'ap': 'Andhra Pradesh', 'andhra pradesh': 'Andhra Pradesh',
    'ar': 'Arunachal Pradesh', 'arunachal pradesh': 'Arunachal Pradesh',
    'as': 'Assam', 'assam': 'Assam',
    'br': 'Bihar', 'bihar': 'Bihar',
    'cg': 'Chhattisgarh', 'chhattisgarh': 'Chhattisgarh', 'chattisgarh': 'Chhattisgarh',
    'ga': 'Goa', 'goa': 'Goa',
    'gj': 'Gujarat', 'gujarat': 'Gujarat',
    'hr': 'Haryana', 'haryana': 'Haryana',
    'hp': 'Himachal Pradesh', 'himachal pradesh': 'Himachal Pradesh',
    'jh': 'Jharkhand', 'jharkhand': 'Jharkhand',
    'ka': 'Karnataka', 'karnataka': 'Karnataka',
    'kl': 'Kerala', 'kerala': 'Kerala',
    'mp': 'Madhya Pradesh', 'madhya pradesh': 'Madhya Pradesh',
    'mh': 'Maharashtra', 'maharashtra': 'Maharashtra',
    'mn': 'Manipur', 'manipur': 'Manipur',
    'ml': 'Meghalaya', 'meghalaya': 'Meghalaya',
    'mz': 'Mizoram', 'mizoram': 'Mizoram',
    'nl': 'Nagaland', 'nagaland': 'Nagaland',
    'or': 'Odisha', 'od': 'Odisha', 'odisha': 'Odisha', 'orissa': 'Odisha',
    'pb': 'Punjab', 'punjab': 'Punjab',
    'rj': 'Rajasthan', 'rajasthan': 'Rajasthan',
    'sk': 'Sikkim', 'sikkim': 'Sikkim',
    'tn': 'Tamil Nadu', 'tamil nadu': 'Tamil Nadu', 'tamilnadu': 'Tamil Nadu',
    'tg': 'Telangana', 'ts': 'Telangana', 'telangana': 'Telangana',
    'tr': 'Tripura', 'tripura': 'Tripura',
    'up': 'Uttar Pradesh', 'uttar pradesh': 'Uttar Pradesh',
    'uk': 'Uttarakhand', 'uttarakhand': 'Uttarakhand', 'uttaranchal': 'Uttarakhand',
    'wb': 'West Bengal', 'west bengal': 'West Bengal',
    'dl': 'Delhi', 'delhi': 'Delhi', 'new delhi': 'Delhi',
    'jk': 'Jammu & Kashmir', 'jammu and kashmir': 'Jammu & Kashmir', 'j&k': 'Jammu & Kashmir',
    'la': 'Ladakh', 'ladakh': 'Ladakh',
    'ch': 'Chandigarh', 'chandigarh': 'Chandigarh',
    'py': 'Puducherry', 'puducherry': 'Puducherry', 'pondicherry': 'Puducherry',
  };
  const lower = state.toLowerCase().trim();
  return stateMap[lower] || state.trim().replace(/\b\w/g, c => c.toUpperCase());
}

/** Normalize recruiter / company name */
export function normalizeCompanyName(name: string): string {
  const companyMap: Record<string, string> = {
    'tcs': 'TCS', 'tata consultancy services': 'TCS',
    'infosys': 'Infosys', 'infosys ltd': 'Infosys', 'infosys limited': 'Infosys',
    'wipro': 'Wipro', 'wipro ltd': 'Wipro',
    'hcl': 'HCL Technologies', 'hcl technologies': 'HCL Technologies',
    'cognizant': 'Cognizant', 'cts': 'Cognizant',
    'accenture': 'Accenture',
    'deloitte': 'Deloitte',
    'google': 'Google', 'google llc': 'Google', 'google inc': 'Google',
    'microsoft': 'Microsoft', 'microsoft corporation': 'Microsoft',
    'amazon': 'Amazon', 'amazon.com': 'Amazon', 'amazon india': 'Amazon',
    'meta': 'Meta', 'facebook': 'Meta',
    'apple': 'Apple', 'apple inc': 'Apple',
    'goldman sachs': 'Goldman Sachs', 'gs': 'Goldman Sachs',
    'jp morgan': 'JP Morgan', 'jpmorgan': 'JP Morgan', 'j.p. morgan': 'JP Morgan',
    'morgan stanley': 'Morgan Stanley',
    'mckinsey': 'McKinsey', 'mckinsey & company': 'McKinsey',
    'bcg': 'BCG', 'boston consulting group': 'BCG',
    'bain': 'Bain & Company', 'bain & company': 'Bain & Company',
    'samsung': 'Samsung', 'samsung electronics': 'Samsung',
    'oracle': 'Oracle', 'oracle corporation': 'Oracle',
    'adobe': 'Adobe', 'adobe systems': 'Adobe',
    'ibm': 'IBM',
    'intel': 'Intel', 'intel corporation': 'Intel',
    'qualcomm': 'Qualcomm',
    'cisco': 'Cisco', 'cisco systems': 'Cisco',
    'uber': 'Uber', 'uber india': 'Uber',
  };
  const lower = name.toLowerCase().trim().replace(/[.,]/g, '');
  return companyMap[lower] || name.trim();
}

/** Parse salary string → number in INR */
export function parseSalary(raw: string): number | null {
  if (!raw) return null;
  const cleaned = raw.replace(/[,\s]/g, '').toLowerCase();

  // "21 LPA", "21.5 lpa", "₹21L"
  let match = cleaned.match(/([\d.]+)\s*(?:lpa|lakhs?|lacs?|l)/);
  if (match) return Math.round(parseFloat(match[1]) * 100000);

  // "2.1 CPA", "2.1 crore"
  match = cleaned.match(/([\d.]+)\s*(?:cpa|crores?|cr)/);
  if (match) return Math.round(parseFloat(match[1]) * 10000000);

  // "₹2100000", "2100000"
  match = cleaned.replace(/[₹inr]/g, '').match(/^(\d+)$/);
  if (match) return parseInt(match[1]);

  return null;
}

/** Normalize stream / discipline name */
export function normalizeStream(stream: string): string {
  const streamMap: Record<string, string> = {
    'engineering': 'Engineering',
    'engg': 'Engineering',
    'tech': 'Engineering',
    'technology': 'Engineering',
    'computer science': 'Engineering',
    'medical': 'Medical',
    'medicine': 'Medical',
    'management': 'Business',
    'business': 'Business',
    'mba': 'Business',
    'commerce': 'Commerce',
    'arts': 'Arts',
    'humanities': 'Arts',
    'science': 'Science',
    'law': 'Law',
    'legal': 'Law',
    'design': 'Design',
    'architecture': 'Architecture',
    'pharmacy': 'Pharmacy',
    'education': 'Education',
    'agriculture': 'Agriculture',
    'nursing': 'Medical',
    'dental': 'Medical',
  };
  const lower = stream.toLowerCase().trim();
  return streamMap[lower] || stream.trim().replace(/\b\w/g, c => c.toUpperCase());
}
