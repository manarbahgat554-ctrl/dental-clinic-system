import { v2 as cloudinary } from 'cloudinary';

const cloudName = process.env.CLOUDINARY_NAME;
const apiKey = process.env.CLOUDINARY_KEY;
const apiSecret = process.env.CLOUDINARY_SECRET;

console.log('Cloudinary config:', {
  cloudName: cloudName ? '✓ موجود' : '✗ مفقود',
  apiKey: apiKey ? '✓ موجود' : '✗ مفقود',
  apiSecret: apiSecret ? '✓ موجود' : '✗ مفقود',
});

cloudinary.config({
  cloud_name: cloudName || '',
  api_key: apiKey || '',
  api_secret: apiSecret || '',
});

export { cloudinary };

export interface CloudinaryUploadResult {
  url: string;
  publicId: string;
  format: string;
  width: number;
  height: number;
}

export async function uploadToCloudinary(
  filePath: string,
  folder: string,
): Promise<CloudinaryUploadResult> {
  const result = await cloudinary.uploader.upload(filePath, {
    folder: `dental-clinic/${folder}`,
    resource_type: 'auto',
  });

  return {
    url: result.secure_url,
    publicId: result.public_id,
    format: result.format,
    width: result.width,
    height: result.height,
  };
}

export async function deleteFromCloudinary(
  publicId: string,
): Promise<void> {
  await cloudinary.uploader.destroy(publicId);
}