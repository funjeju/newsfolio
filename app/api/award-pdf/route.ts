import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { createElement } from "react";
import { AwardCertificate, type AwardCertificateData } from "@/components/pdf/AwardCertificate";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const data: AwardCertificateData = await req.json();

    if (!data.recipientName || !data.awardType) {
      return NextResponse.json({ error: "필수 필드가 누락됐어요." }, { status: 400 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const element = createElement(AwardCertificate, { data }) as any;
    const buffer = await renderToBuffer(element);

    const filename = `newsfolio_award_${data.recipientName}_${data.period ?? "2026"}.pdf`
      .replace(/\s+/g, "_")
      .replace(/[^\w._-]/g, "");

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`,
        "Content-Length": buffer.byteLength.toString(),
      },
    });
  } catch (err: any) {
    console.error("PDF generation error:", err);
    return NextResponse.json({ error: "PDF 생성에 실패했어요." }, { status: 500 });
  }
}
