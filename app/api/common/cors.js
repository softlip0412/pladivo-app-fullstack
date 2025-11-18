import { NextResponse } from "next/server";

export function handleCORS(response) {
  const allowedOrigin = process.env.CORS_ORIGINS || "http://localhost:3000";

  response.headers.set("Access-Control-Allow-Origin", allowedOrigin);
  response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  response.headers.set("Access-Control-Allow-Credentials", "true");

  return response;
}
