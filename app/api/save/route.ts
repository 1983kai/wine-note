import { NextRequest, NextResponse } from "next/server";
import { saveWineToNotion } from "@/lib/notion";

export async function POST(req: NextRequest) {
  try {
    const entry = await req.json();

    if (!entry.name) {
      return NextResponse.json({ error: "Wine name is required" }, { status: 400 });
    }

    const pageId = await saveWineToNotion(entry);
    return NextResponse.json({ success: true, pageId });
  } catch (error) {
    console.error("Save error:", error);
    return NextResponse.json(
      { error: "Failed to save to Notion" },
      { status: 500 }
    );
  }
}
