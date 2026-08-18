import type { ToothStatus, ToothSurface } from '@/types';

// FDI World Dental Federation notation (used internationally)
// Upper Right: 18-11, Upper Left: 21-28
// Lower Left: 31-38, Lower Right: 41-48
export const UPPER_RIGHT = [18, 17, 16, 15, 14, 13, 12, 11];
export const UPPER_LEFT = [21, 22, 23, 24, 25, 26, 27, 28];
export const LOWER_LEFT = [31, 32, 33, 34, 35, 36, 37, 38];
export const LOWER_RIGHT = [41, 42, 43, 44, 45, 46, 47, 48];

export const PERMANENT_TEETH = {
  upperRight: UPPER_RIGHT,
  upperLeft: UPPER_LEFT,
  lowerLeft: LOWER_LEFT,
  lowerRight: LOWER_RIGHT,
};

// Primary (deciduous) teeth — FDI notation
export const PRIMARY_TEETH = {
  upperRight: [55, 54, 53, 52, 51],
  upperLeft: [61, 62, 63, 64, 65],
  lowerLeft: [71, 72, 73, 74, 75],
  lowerRight: [81, 82, 83, 84, 85],
};

export const ALL_TOOTH_NUMBERS = [...UPPER_RIGHT, ...UPPER_LEFT, ...LOWER_LEFT, ...LOWER_RIGHT];

export const TOOTH_SURFACES: { key: ToothSurface; label: string }[] = [
  { key: 'occlusal', label: 'Occlusal' },
  { key: 'buccal', label: 'Buccal' },
  { key: 'lingual', label: 'Lingual' },
  { key: 'mesial', label: 'Mesial' },
  { key: 'distal', label: 'Distal' },
];

export const TOOTH_STATUSES: { value: ToothStatus; label: string }[] = [
  { value: 'healthy', label: 'Healthy' },
  { value: 'needs_treatment', label: 'Needs Treatment' },
  { value: 'caries', label: 'Caries' },
  { value: 'fracture', label: 'Fracture' },
  { value: 'filling', label: 'Filling' },
  { value: 'crown', label: 'Crown' },
  { value: 'root_canal', label: 'Root Canal' },
  { value: 'bridge', label: 'Bridge' },
  { value: 'implant', label: 'Implant' },
  { value: 'veneer', label: 'Veneer' },
  { value: 'extraction', label: 'Extraction' },
  { value: 'missing', label: 'Missing' },
  { value: 'temporary', label: 'Temporary' },
  { value: 'completed', label: 'Completed' },
];

export function isPrimaryTooth(num: number): boolean {
  return num >= 51 && num <= 85;
}

export function getToothLabel(num: number): string {
  return String(num);
}
