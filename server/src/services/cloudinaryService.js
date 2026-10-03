import sharp from 'sharp';
import { cloudinary, isConfigured } from '../config/cloudinary.js';

/**
 * Compress image buffer to under 1MB (typically ~100KB - 400KB) while maintaining crisp quality & HD resolution
 * @param {Buffer} inputBuffer 
 * @param {string} mimeType 
 * @returns {Promise<{buffer: Buffer, mimeType: string}>}
 */
export const compressImageBuffer = async (inputBuffer, mimeType) => {
  // Skip compression for non-images or animated GIFs
  if (!mimeType || !mimeType.startsWith('image/') || mimeType === 'image/gif') {
    return { buffer: inputBuffer, mimeType: mimeType || 'image/jpeg' };
  }

  try {
    const originalSizeMB = (inputBuffer.length / (1024 * 1024)).toFixed(2);

    let sharpPipeline = sharp(inputBuffer)
      .rotate() // Auto-orient mobile photos using EXIF data
      .resize({
        width: 1920,
        height: 1920,
        fit: 'inside',
        withoutEnlargement: true,
      });

    let outputBuffer;
    let outputMimeType = 'image/jpeg';

    if (mimeType === 'image/webp') {
      outputBuffer = await sharpPipeline.webp({ quality: 80 }).toBuffer();
      outputMimeType = 'image/webp';
    } else {
      outputBuffer = await sharpPipeline
        .jpeg({ quality: 82, progressive: true, mozjpeg: true })
        .toBuffer();
    }

    const compressedSizeKB = (outputBuffer.length / 1024).toFixed(2);
    console.log(`⚡ Image Compressed on Backend: ${originalSizeMB} MB ➡️ ${compressedSizeKB} KB (Reduced by ${((1 - outputBuffer.length / inputBuffer.length) * 100).toFixed(1)}%)`);

    return { buffer: outputBuffer, mimeType: outputMimeType };
  } catch (err) {
    console.warn('⚠️ Image compression skipped, using original buffer:', err.message);
    return { buffer: inputBuffer, mimeType };
  }
};

/**
 * Upload a media buffer to Cloudinary (or local uploads as fallback)
 * @param {Buffer} buffer 
 * @param {string} originalName 
 * @param {string} mimeType 
 * @param {string} folder 
 * @returns {Promise<{url: string, public_id: string, media_type: 'image'|'video'}>}
 */
export const uploadMedia = async (buffer, originalName, mimeType, folder = 'campusvoice/reports') => {
  const isVideo = mimeType ? mimeType.startsWith('video') : false;
  const mediaType = isVideo ? 'video' : 'image';

  // 1. Compress image in memory on backend before network upload
  let uploadBuffer = buffer;
  let uploadMimeType = mimeType;

  if (!isVideo) {
    const compressed = await compressImageBuffer(buffer, mimeType);
    uploadBuffer = compressed.buffer;
    uploadMimeType = compressed.mimeType;
  }

  const dataUri = `data:${uploadMimeType || (isVideo ? 'video/mp4' : 'image/jpeg')};base64,${uploadBuffer.toString('base64')}`;

  // 2. If CLOUDINARY_UPLOAD_PRESET is specified in .env, try unsigned upload
  if (process.env.CLOUDINARY_UPLOAD_PRESET && process.env.CLOUDINARY_UPLOAD_PRESET.trim() !== '') {
    try {
      const preset = process.env.CLOUDINARY_UPLOAD_PRESET.trim();
      const result = await cloudinary.uploader.unsigned_upload(dataUri, preset, {
        folder,
        resource_type: isVideo ? 'video' : 'image',
      });
      console.log('✅ Directly uploaded compressed media to Cloudinary via Unsigned Preset:', result.secure_url);
      return {
        url: result.secure_url,
        public_id: result.public_id,
        media_type: mediaType,
      };
    } catch (presetErr) {
      console.error('⚠️ Unsigned Cloudinary upload preset failed:', presetErr.message);
    }
  }

  // 3. Standard signed API upload
  if (isConfigured) {
    try {
      const uploadOptions = {
        folder,
        resource_type: isVideo ? 'video' : 'image',
        transformation: isVideo ? undefined : [{ width: 1920, height: 1920, crop: 'limit', quality: 'auto:good' }],
      };

      const cloudinaryResult = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          uploadOptions,
          (error, result) => {
            if (error) {
              return reject(error);
            }
            resolve({
              url: result.secure_url,
              public_id: result.public_id,
              media_type: mediaType,
            });
          }
        );

        uploadStream.end(uploadBuffer);
      });

      console.log('✅ Directly uploaded compressed media to Cloudinary via Signed API:', cloudinaryResult.url);
      return cloudinaryResult;
    } catch (cloudinaryError) {
      console.error('⚠️ Cloudinary Signed Upload failed:', cloudinaryError.message || cloudinaryError);
    }
  }

  // 4. Fallback: Return compressed inline Data URI so media attachment is NEVER lost
  console.log('ℹ️ Utilizing compressed Data URI attachment so media is saved successfully with the report.');
  return {
    url: dataUri,
    public_id: `inline_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
    media_type: mediaType,
  };
};

export default {
  uploadMedia,
  compressImageBuffer,
};

