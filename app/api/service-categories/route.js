import { connectDB } from "@/app/api/common/db";
import { ServiceCategory } from "@/models";
import { writeFile } from "fs/promises";
import path from "path";

// Lấy danh sách danh mục
export async function GET() {
  await connectDB();
  const categories = await ServiceCategory.find();
  return Response.json(categories, { status: 200 });
}

// Tạo danh mục có upload ảnh
export async function POST(request) {
  await connectDB();

  const formData = await request.formData();
  const name = formData.get("name");
  const imageFile = formData.get("image"); // file

  if (!name) {
    return Response.json({ error: "Tên danh mục bắt buộc" }, { status: 400 });
  }

  // Xử lý upload ảnh
  let imageUrl = null;
  if (imageFile && imageFile.size > 0) {
    const buffer = Buffer.from(await imageFile.arrayBuffer());
    const fileName = Date.now() + "-" + imageFile.name;
    const filePath = path.join(process.cwd(), "public/uploads", fileName);

    await writeFile(filePath, buffer);
    imageUrl = "/uploads/" + fileName;
  }

  // Lưu vào DB
  const category = new ServiceCategory({
    name: name.trim(),
    image: imageUrl
  });

  await category.save();

  return Response.json(
    { message: "Tạo danh mục thành công", category },
    { status: 201 }
  );
}
