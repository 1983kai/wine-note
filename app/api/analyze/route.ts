import { NextRequest, NextResponse } from "next/server";
import { analyzeWineLabel } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  try {
    const { image, mimeType } = await req.json();

    if (!image) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    const result = await analyzeWineLabel(image, mimeType || "image/jpeg");
    return NextResponse.json(result);
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("Analyze error:", msg);
    return NextResponse.json(
      { error: "Failed to analyze wine label", detail: msg },
      { status: 500 }
    );
  }
}
