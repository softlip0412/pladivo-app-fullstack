import { NextResponse } from "next/server";
import { PERMISSIONS } from "./permissions-map"; 

export function hasPermission(role, permission) {
  return PERMISSIONS[permission]?.includes(role) || false;
}

export function requirePermission(permission) {
  return async (request, user) => {
    if (!user)
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    if (!hasPermission(user.role, permission))
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
    return null;
  };
}
