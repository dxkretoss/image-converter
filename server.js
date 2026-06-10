const express = require("express");
const multer = require("multer");
const sharp = require("sharp");

const app = express();

app.use(express.static("public"));

const upload = multer({
  storage: multer.memoryStorage(),

  limits: {
    fileSize: 50 * 1024 * 1024,
  },
});

app.post(
  "/convert",
  upload.single("image"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No image uploaded",
        });
      }

      const image = sharp(req.file.buffer, {
        limitInputPixels: false,
      });

      const metadata = await image.metadata();

      let width = metadata.width;
      let height = metadata.height;

      console.log("Original:", width, height);

      /* ONLY resize if dimensions are extremely huge */
      const MAX_SIZE = 8000;

      if (width > MAX_SIZE || height > MAX_SIZE) {
        image.resize({
          width: MAX_SIZE,
          height: MAX_SIZE,
          fit: "inside",
          withoutEnlargement: true,
        });
      }

      const webpBuffer = await image
        .webp({
          quality: 100,
          lossless: false,
          nearLossless: true,
          effort: 6,
        })
        .toBuffer();

      res.set({
        "Content-Type": "image/webp",
        "Content-Disposition":
          'attachment; filename="converted.webp"',
      });

      res.send(webpBuffer);

    } catch (error) {
      console.log(error);

      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
);

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});