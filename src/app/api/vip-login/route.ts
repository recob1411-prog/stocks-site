import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { code } = await req.json();

  if (code === "1234") {
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ success: false });
}