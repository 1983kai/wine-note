import { NextResponse } from "next/server";

export async function GET() {
  const token = process.env.NOTION_API_KEY ?? "";
  const dbId = process.env.NOTION_DATABASE_ID ?? "";

  const info = {
    tokenExists: !!token,
    tokenPrefix: token.slice(0, 20) + "...",
    tokenLength: token.length,
    dbId,
  };

  // Bypass SDK — raw fetch to Notion API
  try {
    const meRes = await fetch("https://api.notion.com/v1/users/me", {
      headers: {
        Authorization: `Bearer ${token}`,
        "Notion-Version": "2022-06-28",
      },
    });
    const meData = await meRes.json();

    if (!meRes.ok) {
      return NextResponse.json({ step: "users/me", status: meRes.status, error: meData, ...info });
    }

    // Token is valid — try DB
    const dbRes = await fetch(`https://api.notion.com/v1/databases/${dbId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Notion-Version": "2022-06-28",
      },
    });
    const dbData = await dbRes.json();

    return NextResponse.json({
      ok: dbRes.ok,
      integration: meData.name,
      dbStatus: dbRes.status,
      dbError: dbRes.ok ? null : dbData,
      ...info,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ fetchError: msg, ...info });
  }
}
