import { NextRequest, NextResponse } from "next/server";
import { analyzeWineLabel } from "@/lib/gemini";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const { image, mimeType } = await req.json();

    if (!image) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    const sizeKB = Math.round(image.length * 0.75 / 1024);
    console.log(`Image: ${mimeType}, ~${sizeKB}KB`);

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
