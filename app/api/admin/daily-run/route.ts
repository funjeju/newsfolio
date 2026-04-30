import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { force } = await req.json().catch(() => ({ force: false }));

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? `https://${req.headers.get("host")}`;
  const url = `${baseUrl}/api/daily/run${force ? "?force=true" : ""}`;

  const res = await fetch(url, {
    headers: { authorization: `Bearer ${process.env.CRON_SECRET}` },
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
