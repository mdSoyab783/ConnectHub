
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const config = cloudinary.config();

console.log("Cloudinary SDK configuration:", {
  cloudNameConfigured: Boolean(config.cloud_name),
  apiKeyConfigured: Boolean(config.api_key),
  apiSecretConfigured: Boolean(config.api_secret),
});

module.exports = cloudinary;
