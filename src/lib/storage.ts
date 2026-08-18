import { radiologyApi } from '@/api/radiology';

export const IMAGE_TYPES = [
  'Panoramic',
  'Periapical',
  'Bitewing',
  'CBCT',
  'Cephalometric',
  'Intraoral Photo',
  'Extraoral Photo',
] as const;

export const ACCEPTED_EXTENSIONS = [
  '.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp', '.tiff', '.dcm', '.dicom', '.stl', '.obj',
];

export function isAcceptedFile(filename: string): boolean {
  const ext = '.' + (filename.split('.').pop() || '').toLowerCase();
  return ACCEPTED_EXTENSIONS.includes(ext);
}

export function isPreviewable(filename: string): boolean {
  const ext = '.' + (filename.split('.').pop() || '').toLowerCase();
  return ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp'].includes(ext);
}

export function getFileExtension(filename: string): string {
  return '.' + (filename.split('.').pop() || '').toLowerCase();
}

export interface UploadResult {
  path: string;
  publicUrl: string;
  publicId?: string;
}

export async function uploadRadiologyFile(
  file: File,
  metadata: { patientId: string; imageType: string; toothNumber?: number; notes?: string },
  onProgress?: (progress: number) => void,
): Promise<UploadResult> {
  const result = await radiologyApi.upload(file, metadata, onProgress);
  return {
    path: (result as { publicId?: string; imageName: string }).publicId ?? (result as { imageName: string }).imageName,
    publicUrl: (result as { imageUrl: string }).imageUrl,
    publicId: (result as { publicId?: string }).publicId ?? undefined,
  };
}

export async function deleteRadiologyFile(imageId: string): Promise<void> {
  await radiologyApi.delete(imageId);
}
