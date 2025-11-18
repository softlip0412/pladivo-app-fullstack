import { NextResponse } from "next/server";
import { connectDB } from "../common/db";
import { handleCORS } from "../common/cors";

export async function GET() {
  const db = await connectDB();
  const blogs = await db.collection("blogs").find().toArray();
  return handleCORS(NextResponse.json(blogs));
}

export async function POST(request) {
  const db = await connectDB();
  const data = await request.json();
  const result = await db.collection("blogs").insertOne({
    ...data,
    createdAt: new Date(),
  });
  return handleCORS(NextResponse.json({ success: true, id: result.insertedId }));
}
