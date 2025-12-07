import { v2 as cloudinary } from "cloudinary";

const cloud_name = process.env.CLOUDINARY_CLOUD || process.env.CLOUDINARY_CLOUD_NAME;
const api_key = process.env.CLOUDINARY_KEY || process.env.CLOUDINARY_API_KEY;
const api_secret = process.env.CLOUDINARY_SECRET || process.env.CLOUDINARY_API_SECRET;

if (!api_key) {
  console.error("❌ Cloudinary API Key is missing! Check your .env file.");
  console.error("Looking for: CLOUDINARY_KEY or CLOUDINARY_API_KEY");
} else {
  console.log("✅ Cloudinary Configured with API Key ending in:", api_key.slice(-4));
}

cloudinary.config({
  cloud_name,
  api_key,
  api_secret,
});

export default cloudinary;