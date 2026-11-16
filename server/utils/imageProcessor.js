
const sharp = require("sharp");
const cloudinary = require("../config/cloudinary");

const uploadImage = async (
  buffer,
  folder,
  width,
  height = null,
  quality = 80
) => {
  if (!buffer) {
    throw new Error("Image buffer is required");
  }

  let image = sharp(buffer).rotate();

  if (height) {
    image = image.resize(width, height, {
      fit: "cover",
      position: "center",
    });
  } else {
    image = image.resize({
      width,
      withoutEnlargement: true,
    });
  }

  const optimizedBuffer = await image
    .jpeg({
      quality,
      mozjpeg: true,
    })
    .toBuffer();

  const result = await new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: `connecthub/${folder}`,
        resource_type: "image",
        format: "jpg",
      },
      (error, result) => {
        if (error) {
          return reject(error);
        }

        resolve(result);
      }
    );

    stream.end(optimizedBuffer);
  });

  return {
    url: result.secure_url,
    publicId: result.public_id,
  };
};

module.exports = uploadImage;
