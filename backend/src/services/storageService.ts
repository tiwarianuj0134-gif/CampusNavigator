/**
 * Storage Service
 * Abstraction layer for file storage.
 * Supports local filesystem and is ready for Cloudinary/S3 integration.
 *
 * To switch to Cloudinary, install the SDK and update the upload/delete methods.
 * To switch to S3, install @aws-sdk/client-s3 and update accordingly.
 */

import fs from 'fs/promises';
import path from 'path';
import { logger } from '../utils/logger.js';

export type StorageProvider = 'local' | 'cloudinary' | 's3';

interface UploadResult {
  url: string;
  publicId: string;
  size: number;
  mimeType: string;
}

const UPLOAD_DIR = path.join(process.cwd(), 'uploads');

// Ensure upload directories exist
async function ensureDirs() {
  const dirs = [
    path.join(UPLOAD_DIR, 'placements'),
    path.join(UPLOAD_DIR, 'brochures'),
    path.join(UPLOAD_DIR, 'images'),
    path.join(UPLOAD_DIR, 'temp'),
  ];
  for (const dir of dirs) {
    await fs.mkdir(dir, { recursive: true });
  }
}

// Initialize on import
ensureDirs().catch(() => {});

export const storageService = {
  /**
   * Upload a file
   */
  async upload(
    buffer: Buffer,
    filename: string,
    folder: 'placements' | 'brochures' | 'images' | 'temp',
    mimeType: string = 'application/octet-stream'
  ): Promise<UploadResult> {
    // ── Local storage (default) ────────────────────────────
    const filePath = path.join(UPLOAD_DIR, folder, filename);
    await fs.writeFile(filePath, buffer);

    const url = `/uploads/${folder}/${filename}`;

    logger.info(`[storage] Uploaded ${filename} to ${folder} (${buffer.length} bytes)`);

    return {
      url,
      publicId: `${folder}/${filename}`,
      size: buffer.length,
      mimeType,
    };

    // ── Cloudinary (swap in when ready) ────────────────────
    // import { v2 as cloudinary } from 'cloudinary';
    // cloudinary.config({ cloud_name: '...', api_key: '...', api_secret: '...' });
    // const result = await cloudinary.uploader.upload_stream(
    //   { folder: `campusnavigator/${folder}`, resource_type: 'auto' },
    //   ...
    // );
    // return { url: result.secure_url, publicId: result.public_id, size: buffer.length, mimeType };

    // ── S3 (swap in when ready) ────────────────────────────
    // import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
    // const s3 = new S3Client({ region: '...' });
    // await s3.send(new PutObjectCommand({
    //   Bucket: 'campusnavigator', Key: `${folder}/${filename}`, Body: buffer, ContentType: mimeType,
    // }));
    // return { url: `https://...s3.../${folder}/${filename}`, publicId: `${folder}/${filename}`, size: buffer.length, mimeType };
  },

  /**
   * Delete a file
   */
  async delete(publicId: string): Promise<void> {
    const filePath = path.join(UPLOAD_DIR, publicId);
    try {
      await fs.unlink(filePath);
      logger.info(`[storage] Deleted ${publicId}`);
    } catch {
      logger.warn(`[storage] File not found for deletion: ${publicId}`);
    }
  },

  /**
   * Read a file
   */
  async read(publicId: string): Promise<Buffer> {
    const filePath = path.join(UPLOAD_DIR, publicId);
    return fs.readFile(filePath);
  },

  /**
   * Check if file exists
   */
  async exists(publicId: string): Promise<boolean> {
    const filePath = path.join(UPLOAD_DIR, publicId);
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  },
};

export default storageService;
