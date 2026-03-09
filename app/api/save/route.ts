import { NextRequest, NextResponse } from "next/server";
import { saveWineToNotion } from "@/lib/notion";

export async function POST(req: NextRequest) {
  try {
    const entry = await req.json();

    if (!entry.name) {
      return NextResponse.json({ error: "Wine name is required" }, { status: 400 });
    }

    const tokenPreview = process.env.NOTION_API_KEY?.slice(0, 15) ?? "MISSING";
    console.log(`Notion token prefix: ${tokenPreview}, DB: ${process.env.NOTION_DATABASE_ID}`);
    const pageId = await saveWineToNotion(entry);
    return NextResponse.json({ success: true, pageId });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("Save error:", msg);
    return NextResponse.json(
      { error: "Failed to save to Notion", detail: msg },
      { status: 500 }
    );
  }
}
