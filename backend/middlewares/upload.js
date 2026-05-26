import multer from "multer";
import path from "path";
import fs from "fs";

// Make sure the upload folder exists when the server starts
const uploadDir = "uploads/gst";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Tell multer WHERE to save and WHAT to name the file
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const vendorId = req.user.userId.toString();
    const uniqueName = `gst-${Date.now()}-${vendorId}${ext}`;
    cb(null, uniqueName);
  },
});

// Only allow PDF and image files
const fileFilter = function (req, file, cb) {
  const allowed = ["application/pdf", "image/jpeg", "image/png"];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only PDF, JPG, and PNG files are allowed"), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
});

export default upload;