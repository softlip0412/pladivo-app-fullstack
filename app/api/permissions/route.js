import { NextResponse } from "next/server";
import { handleCORS } from "../common/cors";
import { PERMISSIONS } from "../common/permissions-map";

export async function GET() {
  return handleCORS(NextResponse.json(PERMISSIONS));
}
