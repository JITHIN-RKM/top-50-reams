export const BRANCHES = [
  'CSE',
  'CS-AI',
  'MINING',
  'ECE',
  'EEE',
  'MECH',
  'CIVIL',
  'BME',
] as const;

export type Branch = typeof BRANCHES[number];

export const YEARS = [
  '1st Year (B.Tech)',
  '2nd Year (B.Tech)',
  '3rd Year (B.Tech)',
  '4th Year (B.Tech)',
  '1st Year (M.Tech)',
  '2nd Year (M.Tech)',
  'Testing',
  'Coordinator',
] as const;

export type AcademicYear = typeof YEARS[number];

export const COUNTRY_CODES = [
  { code: '+91', label: '+91 (IND)' },
  { code: '+1', label: '+1 (US)' },
] as const;

/**
 * Roll number is optional for 1st Year (B.Tech), Testing, and Coordinator.
 * Roll number is mandatory for 2nd-4th Year B.Tech and 1st-2nd Year M.Tech.
 */
export function isRollNumberRequired(year: string): boolean {
  if (!year) return false;
  const trimmed = year.trim();
  if (
    trimmed === '1st Year (B.Tech)' ||
    trimmed === 'Testing' ||
    trimmed === 'Coordinator'
  ) {
    return false;
  }
  return true;
}

/**
 * Cleanly formats the year display without trailing redundant "Year" for Testing / Coordinator
 */
export function formatYear(year: string | null | undefined): string {
  if (!year) return '';
  const trimmed = year.trim();
  if (trimmed === 'Testing' || trimmed === 'Coordinator') {
    return trimmed;
  }
  if (trimmed.toLowerCase().includes('year')) {
    return trimmed;
  }
  return `${trimmed} Year`;
}
