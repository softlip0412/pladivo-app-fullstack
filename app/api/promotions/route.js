import { NextResponse } from "next/server";
import { connectDB } from "../common/db";
import { authenticateToken } from "../common/auth";
import { handleCORS } from "../common/cors";
import { requirePermission } from "../common/permissions";

export async function GET() {
  const db = await connectDB();
  const promotions = await db.collection("promotions").find().toArray();
  return handleCORS(NextResponse.json(promotions));
}
