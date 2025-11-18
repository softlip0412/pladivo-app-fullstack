import { connectDB } from "@/app/api/common/db";
import { Service } from "@/models";
import { v2 as cloudinary } from "cloudinary";

// 🔹 Lấy chi tiết dịch vụ
export async function GET(_, { params }) {
  await connectDB();
  const service = await Service.findById(params.id).populate(
    "category_id",
    "name"
  );
  if (!service) {
    return Response.json({ error: "Không tìm thấy dịch vụ" }, { status: 404 });
  }
  return Response.json(service, { status: 200 });
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

export const config = {
  api: { bodyParser: false },
};

export async function PATCH(request, { params }) {
  await connectDB();
  const { id } = params;

  const formData = await request.formData();

  const updates = {
    category_id: formData.get("category_id"),
    name: formData.get("name"),
    description: formData.get("description"),
    minPrice: Number(formData.get("minPrice")),
    maxPrice: Number(formData.get("maxPrice")),
    unit: formData.get("unit"),
  };

  // 1) Danh sách ảnh cũ còn giữ lại
  const remainingImages = JSON.parse(formData.get("remainingImages") || "[]");

  // 2) Upload ảnh mới (nếu có)
  const files = formData.getAll("images");
  const newImageUrls = [];

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

      newImageUrls.push(uploaded);
    }
  }

  // 3) Gộp ảnh cũ + ảnh mới
  updates.images = [...remainingImages, ...newImageUrls];

  const updated = await Service.findByIdAndUpdate(id, updates, { new: true });

  return Response.json({ success: true, data: updated });
}

export async function DELETE(_, { params }) {
  await connectDB();
  const service = await Service.findByIdAndDelete(params.id);
  if (!service) {
    return Response.json({ error: "Không tìm thấy dịch vụ" }, { status: 404 });
  }
  return Response.json(
    { success: true, message: "Đã xóa dịch vụ" },
    { status: 200 }
  );
}
