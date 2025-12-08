import { NextResponse } from "next/server";
import { connectDB } from "../common/db";
import { authenticateToken } from "../common/auth";
import { handleCORS } from "../common/cors";
import { requirePermission } from "../common/permissions";

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const db = await connectDB();
  const user = await authenticateToken(request);
  const permCheck = await requirePermission("serviceOrder:read")(request, user);
  if (permCheck) return handleCORS(permCheck);

  const orders = await db.collection("service_orders").find().toArray();
  return handleCORS(NextResponse.json(orders));
}
