import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/auth-store';

export const RADIOLOGY_BUCKET = 'radiology-images';

export const ACCEPTED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'pdf', 'stl', 'dcm', 'dicom'];

export const IMAGE_TYPES = [
  'Periapical',
  'Bitewing',
  'Occlusal',
  'Panoramic (OPG)',
  'CBCT',
  'Cephalometric',
  'Intraoral Photo',
  'Clinical Photo',
] as const;

export function isPreviewable(ext: string | null): boolean {
  return ext === 'jpg' || ext === 'jpeg' || ext === 'png' || ext === 'webp';
}

export function getFileExtension(filename: string): string {
  const parts = filename.split('.');
  return parts.length > 1 ? parts.pop()!.toLowerCase() : '';
}

export function isAcceptedFile(file: File): boolean {
  return ACCEPTED_EXTENSIONS.includes(getFileExtension(file.name));
}

function getClinicId(): string {
  const { profile } = useAuthStore.getState();
  if (!profile?.clinic_id) throw new Error('No active clinic');
  return profile.clinic_id;
}

function getUploaderId(): string {
  const { user } = useAuthStore.getState();
  if (!user) throw new Error('Not authenticated');
  return user.id;
}

export interface UploadResult {
  path: string;
  publicUrl: string;
}

/**
 * Uploads a radiology file to the clinic's folder in the storage bucket.
 * Reports progress via the onProgress callback.
 */
export async function uploadRadiologyFile(
  file: File,
  onProgress: (percent: number) => void,
): Promise<UploadResult> {
  const clinicId = getClinicId();
  const uploaderId = getUploaderId();
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const path = `${clinicId}/${uploaderId}/${Date.now()}-${safeName}`;

  const result = await supabase.storage
  .from(RADIOLOGY_BUCKET)
  .upload(path, file, {
    cacheControl: '3600',
    upsert: false,
  });

console.log("UPLOAD RESULT:", result);

if (result.error) {
  console.error(result.error);
  throw result.error;
}

  const { data: publicUrlData } = supabase.storage
    .from(RADIOLOGY_BUCKET)
    .getPublicUrl(path);

  // Storage upload doesn't expose progress events; simulate a final 100%.
  onProgress(100);

  return {
    path,
    publicUrl: publicUrlData.publicUrl,
  };
}

/**
 * Removes a file from the radiology storage bucket.
 */
export async function deleteRadiologyFile(path: string) {
  console.log("Deleting Storage:", path);

  const { data, error } = await supabase.storage
    .from(RADIOLOGY_BUCKET)
    .remove([path]);

  console.log(data);
  console.log(error);

  if (error) throw error;
}
