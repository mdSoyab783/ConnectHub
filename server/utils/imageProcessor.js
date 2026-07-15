const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const processImage = async (
  inputPath,
  outputFolder,
  width,
  height = null,
  quality = 80
) => {
  // Ensure output folder exists
  fs.mkdirSync(outputFolder, { recursive: true });

  const fileName = `${Date.now()}.jpg`;
  const outputPath = path.join(outputFolder, fileName);

  let image = sharp(inputPath).rotate();

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

  await image
    .jpeg({
      quality,
      mozjpeg: true,
    })
    .toFile(outputPath);

  // Delete original upload
  if (fs.existsSync(inputPath)) {
    fs.unlinkSync(inputPath);
  }

  return `/uploads/${path.basename(outputFolder)}/${fileName}`;
};

module.exports = processImage;