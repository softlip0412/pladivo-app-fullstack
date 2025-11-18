import { connectDB } from "@/lib/mongodb"
import User from "@/models/User"
import EmailVerificationToken from "@/models/EmailVerificationToken"
import bcrypt from "bcryptjs"
import crypto from "crypto"
import nodemailer from "nodemailer"

export async function POST(request) {
  await connectDB()
  const { username, email, password, phone, role = "customer" } = await request.json()

  // Check user tồn tại
  const existingUser = await User.findOne({ $or: [{ email }, { username }] })
  if (existingUser) {
    return Response.json(
      { error: "Email hoặc username đã tồn tại" },
      { status: 400 }
    )
  }

  if (!email.includes("@")) {
    return Response.json({ error: "Email không hợp lệ" }, { status: 400 })
  }
  if (password.length < 6) {
    return Response.json(
      { error: "Mật khẩu phải có ít nhất 6 ký tự" },
      { status: 400 }
    )
  }

  const hashedPassword = await bcrypt.hash(password, 10)

  const newUser = new User({
    username,
    email,
    password_hash: hashedPassword,
    phone,
    role: ["customer", "staff", "manager", "admin"].includes(role)
      ? role
      : "customer",
    status: "pending",
  })
  await newUser.save()

  // Tạo token xác minh email
  const token = crypto.randomBytes(32).toString("hex")
  await EmailVerificationToken.create({
    user_id: newUser._id,
    token,
    expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24h
  })

  // Link verify
  const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${token}`

  // Gửi email xác minh
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  })

  await transporter.sendMail({
    from: `"Pladivo" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Xác minh tài khoản của bạn",
    html: `
      <h2>Xin chào ${username},</h2>
      <p>Cảm ơn bạn đã đăng ký. Vui lòng nhấp vào link bên dưới để xác minh email:</p>
      <a href="${verifyUrl}" target="_blank">${verifyUrl}</a>
      <p>Link có hiệu lực trong 24 giờ.</p>
    `,
  })

  return Response.json(
    {
      message:
        "Đăng ký thành công. Vui lòng kiểm tra email để xác minh tài khoản.",
      user: {
        user_id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
        status: newUser.status,
      },
    },
    { status: 201 }
  )
}
