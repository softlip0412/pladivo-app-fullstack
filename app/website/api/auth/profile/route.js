import { connectDB } from "@/lib/mongodb";
import { UserProfile } from "@/models";
import { authenticateToken } from "@/lib/auth";

export async function POST(request) {
  await connectDB();

  let userData;
  try {
    userData = authenticateToken(); 
  } catch (err) {
    return Response.json({ error: err.message }, { status: 401 });
  }

  const { full_name, company_name, address, tax_code, payment_info } =
    await request.json();

  const existingProfile = await UserProfile.findOne({ user_id: userData.user_id });
  if (existingProfile) {
    return Response.json({ error: "Profile đã tồn tại" }, { status: 400 });
  }

  const newProfile = new UserProfile({
    user_id: userData.user_id,
    full_name,
    company_name,
    address,
    tax_code,
    payment_info,
  });

  await newProfile.save();

  return Response.json({ message: "Tạo profile thành công", profile: newProfile }, { status: 201 });
}
