import { mkdirSync, writeFileSync, existsSync } from 'fs';
import path from 'path';
import multer from 'multer';
import { randomUUID } from 'crypto';

const UPLOADS_DIR = path.resolve(process.cwd(), 'server/data/uploads');

if (!existsSync(UPLOADS_DIR)) {
  mkdirSync(UPLOADS_DIR, { recursive: true });
}

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 },
});

export interface UploadResult {
  secure_url: string;
  original_filename: string;
  bytes: number;
  format: string;
}

export const saveFileLocally = (buffer: Buffer, originalName: string): UploadResult => {
  const ext = path.extname(originalName);
  const safeName = path.basename(originalName, ext).replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 40);
  const filename = `${randomUUID()}-${safeName}${ext}`;
  writeFileSync(path.join(UPLOADS_DIR, filename), buffer);
  return {
    secure_url: `/uploads/${filename}`,
    original_filename: originalName,
    bytes: buffer.length,
    format: ext.slice(1),
  };
};

export const formatBytes = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};
