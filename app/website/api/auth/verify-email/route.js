import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import EmailVerificationToken from "@/models/EmailVerificationToken";

export async function POST(request) {
  await connectDB();
  const { token } = await request.json();

  if (!token) {
    return Response.json({ error: "Verification token required" }, { status: 400 });
  }

  const record = await EmailVerificationToken.findOne({ token });
  if (!record) {
    return Response.json({ error: "Invalid or expired token" }, { status: 400 });
  }

  if (record.expires_at < new Date()) {
    await EmailVerificationToken.deleteOne({ _id: record._id });
    return Response.json({ error: "Token expired" }, { status: 400 });
  }

  await User.updateOne(
    { _id: record.user_id },
    { $set: { status: "active" } }
  );

  await EmailVerificationToken.deleteOne({ _id: record._id });

  return Response.json({ message: "Email verified successfully" }, { status: 200 });
}
