import multer from 'multer';

// Use memory storage so we can stream buffers directly to Cloudinary
const storage = multer.memoryStorage();

// File filter for images and videos
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'video/mp4',
    'video/webm',
    'video/quicktime',
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Unsupported file type: ${file.mimetype}. Only JPEG, PNG, WEBP, GIF, MP4, and WEBM are allowed.`), false);
  }
};

export const uploadMediaMiddleware = multer({
  storage,
  limits: {
    fileSize: 25 * 1024 * 1024, // 25 MB max per file
    files: 6, // Maximum 6 media attachments
  },
  fileFilter,
});

export default uploadMediaMiddleware;
