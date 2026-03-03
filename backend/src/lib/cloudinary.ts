import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { Readable } from 'stream';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export { cloudinary };

export interface UploadProgress {
  loaded: number;
  total: number | null;
  percent: number | null;
}

/**
 * Pipe a Node.js Readable directly into Cloudinary upload_stream.
 * Zero buffering — Client → busboy → Cloudinary simultaneously.
 */
export function streamToCloudinary(
  source: Readable,
  totalBytes: number | null,
  options: {
    folder?: string;
    resource_type?: 'auto' | 'image' | 'video' | 'raw';
    public_id?: string;
  },
  onProgress?: (p: UploadProgress) => void
): Promise<UploadApiResponse> {
  return new Promise((resolve, reject) => {
    let loaded = 0;

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: options.folder ?? 'filevault',
        resource_type: options.resource_type ?? 'auto',
        public_id: options.public_id,
        timeout: 180000,
      },
      (err, result) => {
        if (err || !result) return reject(err ?? new Error('Cloudinary upload failed'));
        resolve(result);
      }
    );

    source.on('data', (chunk: Buffer) => {
      loaded += chunk.length;
      if (onProgress) {
        const percent =
          totalBytes && totalBytes > 0
            ? Math.min(99, Math.round((loaded / totalBytes) * 100))
            : null;
        onProgress({ loaded, total: totalBytes, percent });
      }
    });

    source.on('error', (err) => { uploadStream.destroy(err); reject(err); });
    uploadStream.on('error', reject);

    source.pipe(uploadStream);
  });
}
