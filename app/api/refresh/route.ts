import { NextResponse } from "next/server";
import { list, del } from "@vercel/blob";

export async function POST() {
  let cursor: string | undefined;
  let total = 0;

  do {
    const { blobs, cursor: next } = await list({ prefix: "player-", cursor });
    if (blobs.length) {
      await del(blobs.map((b) => b.url));
      total += blobs.length;
    }
    cursor = next;
  } while (cursor);

  return NextResponse.json({ cleared: total });
}
