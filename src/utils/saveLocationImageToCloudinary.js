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

/**
 * Видаляє фото з Cloudinary за його URL.
 * Фото з seed (ftp.goit.study) не чіпаємо — вони не в нашому Cloudinary.
 */
export async function deleteImageFromCloudinary(imageUrl) {
  if (!imageUrl || !imageUrl.includes('res.cloudinary.com')) return;

  // .../upload/v1790585307/relax-map/locations/location_x_123.jpg
  //   → public_id: relax-map/locations/location_x_123
  const match = imageUrl.match(/\/upload\/(?:v\d+\/)?(.+)\.[a-z0-9]+$/i);
  if (!match) return;

  await cloudinary.uploader.destroy(match[1]);
}
