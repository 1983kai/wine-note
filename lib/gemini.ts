import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export interface WineLabel {
  name: string;
  vintage: number | null;
  region: string;
  grape: string;
  style: "Red" | "White" | "샴페인" | "";
  abv: number | null;
}

type SupportedMediaType = "image/jpeg" | "image/png" | "image/gif" | "image/webp";

export async function analyzeWineLabel(base64Image: string, mimeType: string): Promise<WineLabel> {
  const supported: SupportedMediaType[] = ["image/jpeg", "image/png", "image/gif", "image/webp"];
  const mediaType: SupportedMediaType = supported.includes(mimeType as SupportedMediaType)
    ? (mimeType as SupportedMediaType)
    : "image/jpeg";

  const response = await client.messages.create({
    model: "claude-opus-4-6",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: { type: "base64", media_type: mediaType, data: base64Image },
          },
          {
            type: "text",
            text: `Analyze this wine label image and extract the following information in JSON format:
{
  "name": "wine name (producer + wine name)",
  "vintage": year as number or null,
  "region": "region/appellation",
  "grape": "grape variety/varieties",
  "style": "Red" or "White" or "샴페인" (for sparkling/champagne),
  "abv": alcohol percentage as number or null
}

Return ONLY the JSON object, no other text. If information is not visible, use null or empty string.`,
          },
        ],
      },
    ],
  });

  const text = response.content[0].type === "text" ? response.content[0].text.trim() : "";
  const jsonText = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  return JSON.parse(jsonText) as WineLabel;
}
