
const cloudinary = require("../config/cloudinary");

const deleteCloudinaryImage = async (imageUrl) => {
  try {
    if (!imageUrl || typeof imageUrl !== "string") {
      return;
    }

    // Only delete images hosted on Cloudinary.
    const parsedUrl = new URL(imageUrl);

    if (parsedUrl.hostname !== "res.cloudinary.com") {
      return;
    }

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;

    const urlParts = parsedUrl.pathname
      .split("/")
      .filter(Boolean);

    // Expected URL structure:
    // /<cloud_name>/image/upload/v123/folder/image.jpg
    if (
      urlParts.length < 5 ||
      urlParts[0] !== cloudName ||
      urlParts[1] !== "image" ||
      urlParts[2] !== "upload"
    ) {
      return;
    }

    const uploadIndex = urlParts.indexOf("upload");

    let publicIdParts = urlParts.slice(uploadIndex + 1);

    // Remove version segment, such as v123456789
    if (
      publicIdParts.length > 0 &&
      /^v\d+$/.test(publicIdParts[0])
    ) {
      publicIdParts = publicIdParts.slice(1);
    }

    // Remove file extension
    const lastIndex = publicIdParts.length - 1;

    publicIdParts[lastIndex] =
      publicIdParts[lastIndex].replace(/\.[^/.]+$/, "");

    const publicId = publicIdParts.join("/");

    if (!publicId) {
      return;
    }

    const result = await cloudinary.uploader.destroy(
      publicId,
      {
        resource_type: "image",
        invalidate: true,
      }
    );

    if (
      result.result !== "ok" &&
      result.result !== "not found"
    ) {
      console.warn(
        "Cloudinary image deletion result:",
        result
      );
    }

    return result;
  } catch (error) {
    // Cleanup failures should not crash the main application operation.
    console.error(
      "Cloudinary image deletion error:",
      error.message
    );
  }
};

module.exports = deleteCloudinaryImage;
