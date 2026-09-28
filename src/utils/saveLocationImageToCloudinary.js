import { v2 as cloudinary } from 'cloudinary';

const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_SECRET, CLOUDINARY_API_KEY } =
  process.env;

cloudinary.config({
  secure: true,
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
});

export async function saveLocationImageToCloudinary(buffer, userId) {
  const options = {
    folder: 'relax-map/locations',
    public_id: `location_${userId}_${Date.now()}`,
    resource_type: 'image',
    overwrite: true,
    unique_filename: false,
    transformation: [
      {
        width: 1000,
        height: 700,
        crop: 'fill',
        gravity: 'auto',
      },
      {
        fetch_format: 'auto',
        quality: 'auto',
      },
    ],
  };

  return new Promise((res, rej) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      options,
      (error, result) => {
        if (error) {
          return rej(error);
        }
        res(result);
      },
    );

    uploadStream.end(buffer);
  });
}
