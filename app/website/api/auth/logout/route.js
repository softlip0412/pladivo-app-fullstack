import { cookies } from "next/headers";

export async function POST() {
  const cookieStore = cookies();


  cookieStore.set("accessToken", "", { maxAge: 0, path: "/" });
  cookieStore.set("refreshToken", "", { maxAge: 0, path: "/" });

  return Response.json({ message: "Logout successful" }, { status: 200 });
}
