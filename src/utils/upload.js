import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import CloudinaryStorage from 'multer-storage-cloudinary';
import dotenv from 'dotenv';
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Only configure CloudinaryStorage if credentials are available
const cloudinaryCredsPresent = process.env.CLOUDINARY_CLOUD_NAME && 
                               process.env.CLOUDINARY_API_KEY && 
                               process.env.CLOUDINARY_API_SECRET;

let storage;

if (cloudinaryCredsPresent) {
  storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: 'hackathon_images',
      allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
    },
  });
} else {
  // Use default memory storage if Cloudinary credentials are not available
  console.log("⚠️  Cloudinary credentials not configured. Using memory storage for uploads.");
  storage = multer.memoryStorage();
}

export const upload = multer({ storage: storage });
