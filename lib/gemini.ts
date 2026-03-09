import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export interface WineLabel {
  name: string;
  vintage: number | null;
  region: string;
  grape: string;
  style: "Red" | "White" | "샴페인" | "";
  abv: number | null;
}

export async function analyzeWineLabel(base64Image: string, mimeType: string): Promise<WineLabel> {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const prompt = `Analyze this wine label image and extract the following information in JSON format:
{
  "name": "wine name (producer + wine name)",
  "vintage": year as number or null,
  "region": "region/appellation",
  "grape": "grape variety/varieties",
  "style": "Red" or "White" or "샴페인" (for sparkling/champagne),
  "abv": alcohol percentage as number or null
}

Return ONLY the JSON object, no other text. If information is not visible, use null or empty string.`;

  const result = await model.generateContent([
    prompt,
    {
      inlineData: {
        data: base64Image,
        mimeType,
      },
    },
  ]);

  const text = result.response.text().trim();
  // Strip markdown code blocks if present
  const jsonText = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");

  return JSON.parse(jsonText) as WineLabel;
}
