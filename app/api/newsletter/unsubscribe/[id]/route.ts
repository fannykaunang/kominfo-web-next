import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const redirectUrl = new URL(`/newsletter/unsubscribe/${id}`, request.url);

  return NextResponse.redirect(redirectUrl);
}
