import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";
import { PERMISSIONS } from "./permissions.js";

const JWT_SECRET = process.env.JWT_SECRET || "pladivo-admin-secret-key";

export async function authenticateToken(request) {
  const authHeader = request.headers.get("authorization");
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return null;

  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

export function requirePermission(permission) {
  return async (request, user) => {
    if (!user) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    if (!PERMISSIONS[permission]?.includes(user.role)) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
    }
    return null;
  };
}
