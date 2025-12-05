import { connectDB } from "@/app/api/common/db";
import { Service } from "@/models";
import { v2 as cloudinary } from "cloudinary";

// 📦 Lấy danh sách dịch vụ
export async function GET() {
  await connectDB();
  const services = await Service.find().populate("category_id", "name");
  return Response.json({ success: true, data: services }, { status: 200 });
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});



export async function POST(request) {
  await connectDB();

  const formData = await request.formData();
  const category_id = formData.get("category_id");
  const name = formData.get("name");
  const description = formData.get("description");
  const minPrice = Number(formData.get("minPrice"));
  const maxPrice = Number(formData.get("maxPrice"));
  const unit = formData.get("unit");

  if (!category_id || !name || !minPrice || !maxPrice) {
    return Response.json(
      { error: "category_id, name, minPrice, maxPrice là bắt buộc" },
      { status: 400 }
    );
  }

  // Upload tất cả ảnh lên Cloudinary
  const files = formData.getAll("images");
  const imageUrls = [];

  for (const file of files) {
    if (file && file.size > 0) {
      const buffer = Buffer.from(await file.arrayBuffer());

      const uploaded = await new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream({ folder: "services" }, (err, result) => {
            if (err) return reject(err);
            resolve(result.secure_url);
          })
          .end(buffer);
      });

      imageUrls.push(uploaded);
    }
  }

  const service = await Service.create({
    category_id,
    name,
    description,
    minPrice,
    maxPrice,
    unit,
    images: imageUrls,
  });

  return Response.json(
    { success: true, message: "Tạo dịch vụ thành công", data: service },
    { status: 201 }
  );
}
