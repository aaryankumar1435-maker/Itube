import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';

const getCloudinary = () => {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key:    process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  return cloudinary;
};

const storage = multer.memoryStorage();
export const upload = multer({
  storage,
  limits: { fileSize: 500 * 1024 * 1024 },
});

export const uploadToCloudinary = (buffer, options) =>
  new Promise((resolve, reject) => {
    const cl = getCloudinary();
    const stream = cl.uploader.upload_stream(options, (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
    stream.end(buffer);
  });

export const deleteFromCloudinary = (publicId, resourceType = 'image') => {
  const cl = getCloudinary();
  return cl.uploader.destroy(publicId, { resource_type: resourceType });
};

export { cloudinary };
