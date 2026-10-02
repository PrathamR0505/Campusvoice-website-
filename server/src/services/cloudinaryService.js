import { cloudinary, isConfigured } from '../config/cloudinary.js';

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
  const dataUri = `data:${mimeType || (isVideo ? 'video/mp4' : 'image/jpeg')};base64,${buffer.toString('base64')}`;

  // 1. If CLOUDINARY_UPLOAD_PRESET is specified in .env, try unsigned upload
  if (process.env.CLOUDINARY_UPLOAD_PRESET && process.env.CLOUDINARY_UPLOAD_PRESET.trim() !== '') {
    try {
      const preset = process.env.CLOUDINARY_UPLOAD_PRESET.trim();
      const result = await cloudinary.uploader.unsigned_upload(dataUri, preset, {
        folder,
        resource_type: isVideo ? 'video' : 'image',
      });
      console.log('✅ Directly uploaded to Cloudinary via Unsigned Preset:', result.secure_url);
      return {
        url: result.secure_url,
        public_id: result.public_id,
        media_type: mediaType,
      };
    } catch (presetErr) {
      console.error('⚠️ Unsigned Cloudinary upload preset failed:', presetErr.message);
    }
  }

  // 2. Standard signed API upload
  if (isConfigured) {
    try {
      const uploadOptions = {
        folder,
        resource_type: isVideo ? 'video' : 'image',
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

        uploadStream.end(buffer);
      });

      console.log('✅ Directly uploaded to Cloudinary via Signed API:', cloudinaryResult.url);
      return cloudinaryResult;
    } catch (cloudinaryError) {
      console.error('⚠️ Cloudinary Signed Upload failed (e.g. 403 API permission issue):', cloudinaryError.message || cloudinaryError);
    }
  }

  // 3. Fallback: Return inline Data URI so media attachment is NEVER lost even if Cloudinary permissions error
  console.log('ℹ️ Utilizing Data URI attachment so media is saved successfully with the report.');
  return {
    url: dataUri,
    public_id: `inline_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
    media_type: mediaType,
  };
};

export default {
  uploadMedia,
};
