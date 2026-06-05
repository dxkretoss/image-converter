const express = require("express");
const multer = require("multer");
const sharp = require("sharp");

const app = express();

app.use(express.static("public"));

/* MEMORY STORAGE = MUCH FASTER */
const upload = multer({
  storage: multer.memoryStorage(),
});

/* Convert API */
app.post(
  "/convert",
  upload.single("image"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
        });
      }

      /* Convert directly from buffer */
      const webpBuffer = await sharp(req.file.buffer)
        .webp({
          quality: 100,
  effort: 0,
  smartSubsample: true
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
      });
    }
  }
);

app.listen(3000, () => {
  console.log(
    "Server running on http://localhost:3000"
  );
});