import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';

const UNSIGNED_PRESET = 'uniplanner_unsigned';
const hasCloudinaryConfig = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET,
);

if (hasCloudinaryConfig) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

export async function ensureUnsignedPreset() {
  if (!hasCloudinaryConfig) {
    console.warn('[cloudinary] Skipping preset setup because Cloudinary env vars are not configured.');
    return;
  }

  try {
    await cloudinary.api.upload_preset(UNSIGNED_PRESET);
    console.log(`[cloudinary] Upload preset "${UNSIGNED_PRESET}" already exists.`);
  } catch (err) {
    if (err?.http_code === 404 || err?.error?.http_code === 404) {
      await cloudinary.api.create_upload_preset({
        name: UNSIGNED_PRESET,
        unsigned: true,
        folder: 'uniplanner',
        resource_type: 'auto',
        allowed_formats: 'jpg,jpeg,png,gif,pdf,doc,docx,ppt,pptx,xls,xlsx,txt,mp4,mov,avi,webm,zip',
      });
      console.log(`[cloudinary] Created unsigned preset "${UNSIGNED_PRESET}".`);
    } else {
      console.warn('[cloudinary] Could not verify upload preset:', err?.message ?? err);
    }
  }
}

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 },
});

export const uploadToCloudinary = (buffer, originalName) =>
  new Promise((resolve, reject) => {
    if (!hasCloudinaryConfig) {
      reject(new Error('Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.'));
      return;
    }

    const stream = cloudinary.uploader.upload_stream(
      { folder: 'uniplanner', resource_type: 'auto', use_filename: true, unique_filename: true },
      (error, result) => {
        if (error) return reject(error);
        resolve({
          secure_url: result.secure_url,
          original_filename: originalName,
          bytes: result.bytes,
          format: result.format,
        });
      },
    );
    stream.end(buffer);
  });

export const formatBytes = (bytes) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};
