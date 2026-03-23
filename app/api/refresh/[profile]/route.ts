import { NextRequest, NextResponse } from "next/server";
import { list, del } from "@vercel/blob";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ profile: string }> }
) {
  const { profile } = await params;
  const { blobs } = await list({ prefix: `player-${profile}` });
  if (blobs.length) await del(blobs.map((b) => b.url));
  return NextResponse.json({ cleared: blobs.length, profile });
}
