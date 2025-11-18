import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { connectToMongo } from "../../../common/db";
import { authenticateToken } from "../../../common/auth";
import { handleCORS } from "../../../common/cors";
import { requirePermission } from "../../../common/permissions";

export async function POST(request, { params }) {
  const db = await connectToMongo();
  const user = await authenticateToken(request);
  const permCheck = await requirePermission("promotion:approve")(request, user);
  if (permCheck) return handleCORS(permCheck);

  await db.collection("promotions").updateOne(
    { _id: new ObjectId(params.id) },
    { $set: { status: "approved", approvedAt: new Date() } }
  );

  return handleCORS(NextResponse.json({ success: true }));
}
