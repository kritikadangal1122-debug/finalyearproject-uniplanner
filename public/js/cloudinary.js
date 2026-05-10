// Fallback values — overridden at runtime by fetching /api/cloudinary-config from the server.
// These match CLOUDINARY_CLOUD_NAME and the preset created automatically at server startup.
const DEFAULTS = {
  cloudName: 'dvmasopqa',
  uploadPreset: 'uniplanner_unsigned',
};

let _config = null;

async function getConfig() {
  if (_config) return _config;
  try {
    // Try to fetch from the Express server (works on port 4000 or same-origin)
    const servers = ['', 'http://localhost:4000', 'http://127.0.0.1:4000'];
    for (const base of servers) {
      try {
        const res = await fetch(`${base}/api/cloudinary-config`, { signal: AbortSignal.timeout(2000) });
        if (res.ok) {
          const data = await res.json();
          _config = { cloudName: data.cloudName || DEFAULTS.cloudName, uploadPreset: data.uploadPreset || DEFAULTS.uploadPreset };
          return _config;
        }
      } catch { /* try next */ }
    }
  } catch { /* ignore */ }
  _config = { ...DEFAULTS };
  return _config;
}

/**
 * Upload a File object directly to Cloudinary from the browser.
 * Returns { url, name, size } on success, or throws on failure.
 * @param {File} file
 * @param {{ onProgress?: (pct: number) => void }} [opts]
 */
export async function uploadFile(file, { onProgress } = {}) {
  const { cloudName, uploadPreset } = await getConfig();

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);
  formData.append('folder', 'uniplanner');

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    if (onProgress) {
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
      });
    }

    xhr.addEventListener('load', () => {
      try {
        const data = JSON.parse(xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve({
            url: data.secure_url,
            name: data.original_filename
              ? `${data.original_filename}.${data.format}`
              : file.name,
            size: formatBytes(data.bytes ?? file.size),
          });
        } else {
          reject(new Error(data?.error?.message ?? `Upload failed (${xhr.status})`));
        }
      } catch {
        reject(new Error('Invalid response from Cloudinary'));
      }
    });

    xhr.addEventListener('error', () => reject(new Error('Network error during upload')));
    xhr.addEventListener('abort', () => reject(new Error('Upload cancelled')));

    xhr.open('POST', `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`);
    xhr.send(formData);
  });
}

function formatBytes(bytes) {
  if (!bytes) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
