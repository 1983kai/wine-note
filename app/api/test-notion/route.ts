import { NextResponse } from "next/server";
import { Client } from "@notionhq/client";

export async function GET() {
  const token = process.env.NOTION_API_KEY ?? "";
  const dbId = process.env.NOTION_DATABASE_ID ?? "";

  const info = {
    tokenExists: !!token,
    tokenPrefix: token.slice(0, 20) + "...",
    tokenLength: token.length,
    dbId,
  };

  try {
    const notion = new Client({ auth: token });
    // Step 1: check if token itself is valid (no DB permission needed)
    const me = await notion.users.me({});
    // Step 2: try to access the DB
    try {
      const db = await notion.databases.retrieve({ database_id: dbId });
      return NextResponse.json({ ok: true, integration: me.name, dbTitle: (db as any).title?.[0]?.plain_text, ...info });
    } catch (dbErr) {
      const dbMsg = dbErr instanceof Error ? dbErr.message : String(dbErr);
      return NextResponse.json({ tokenOk: true, integration: me.name, dbError: dbMsg, ...info });
    }
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ ok: false, error: msg, ...info });
  }
}
