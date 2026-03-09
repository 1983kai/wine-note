import { Client } from "@notionhq/client";
import type { CreatePageParameters } from "@notionhq/client/build/src/api-endpoints";

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const DATABASE_ID = process.env.NOTION_DATABASE_ID!;

export interface WineEntry {
  name: string;
  vintage: number | null;
  region: string;
  grape: string;
  style: "Red" | "White" | "샴페인" | "";
  abv: number | null;
  price: number | null;
  rating: string;
  flavorProfile: string;
  tastingNotes: string;
  pairing: string;
  storage: string;
  status: string;
  purchaseSource: string;
  dateTasted: string;
  buyDate: string;
}

export async function saveWineToNotion(entry: WineEntry): Promise<string> {
  type Properties = CreatePageParameters["properties"];
  const properties: Properties = {
    Name: {
      title: [{ text: { content: entry.name || "Unknown Wine" } }],
    },
  };

  if (entry.vintage) {
    properties.Vintage = { number: entry.vintage };
  }
  if (entry.region) {
    properties.Region = { rich_text: [{ text: { content: entry.region } }] };
  }
  if (entry.grape) {
    properties.Grape = { rich_text: [{ text: { content: entry.grape } }] };
  }
  if (entry.style) {
    properties.Style = { select: { name: entry.style } };
  }
  if (entry.abv) {
    properties.ABV = { number: entry.abv };
  }
  if (entry.price) {
    properties.Price = { number: entry.price };
  }
  if (entry.rating) {
    properties.Rating = { rich_text: [{ text: { content: entry.rating } }] };
  }
  if (entry.flavorProfile) {
    properties["Flavor Profile"] = { rich_text: [{ text: { content: entry.flavorProfile } }] };
  }
  if (entry.tastingNotes) {
    properties["Tasting Notes"] = { rich_text: [{ text: { content: entry.tastingNotes } }] };
  }
  if (entry.pairing) {
    properties.Pairing = { rich_text: [{ text: { content: entry.pairing } }] };
  }
  if (entry.storage) {
    properties.Storage = { rich_text: [{ text: { content: entry.storage } }] };
  }
  if (entry.status) {
    properties.Status = { rich_text: [{ text: { content: entry.status } }] };
  }
  if (entry.purchaseSource) {
    properties["Purchase Source"] = { rich_text: [{ text: { content: entry.purchaseSource } }] };
  }
  if (entry.dateTasted) {
    properties["Date Tasted"] = { date: { start: entry.dateTasted } };
  }
  if (entry.buyDate) {
    properties["Buy Date"] = { date: { start: entry.buyDate } };
  }

  const response = await notion.pages.create({
    parent: { database_id: DATABASE_ID },
    properties,
  });

  return response.id;
}
