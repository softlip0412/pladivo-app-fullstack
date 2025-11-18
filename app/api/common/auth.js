import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET || "pladivo-admin-secret-key";
const JWT_REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET || "pladivo-admin-refresh-key";

export function signAccessToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "5d" });
}

export function signRefreshToken(payload) {
  return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: "30d" });
}

export function verifyAccessToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

export function verifyRefreshToken(token) {
  return jwt.verify(token, JWT_REFRESH_SECRET);
}

export async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
}

export function authenticateToken(request) {
  try {
    let token = null;

    const authHeader = request?.headers?.get("authorization");
    if (authHeader?.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }

    if (!token) {
      const cookieStore = cookies();
      token = cookieStore.get("accessToken")?.value;
    }

    if (!token) {
      throw new Error("Access token required");
    }

    const decoded = verifyAccessToken(token);

    if (!(decoded?.user_id || decoded?.id)) {
      throw new Error("Token không chứa user_id hoặc id");
    }

    return {
      user_id: decoded.user_id || decoded.id,
      email: decoded.email,
      role: decoded.role,
    };
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      console.error("❌ Token error: jwt expired");
      throw new Error("TokenExpiredError");
    }

    console.error("❌ Token error:", error.message);
    throw new Error("Access token required");
  }
}
