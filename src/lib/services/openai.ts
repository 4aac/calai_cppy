import "server-only";

import OpenAI from "openai";
import { z } from "zod";

import { photoAnalysisSchema } from "@/lib/schemas/api";

let client: OpenAI | null = null;

function getOpenAIClient() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not configured");
  }

  client ??= new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  return client;
}

export type PhotoAnalysis = z.infer<typeof photoAnalysisSchema>;

const photoAnalysisJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: ["meal_name", "items", "warnings"],
  properties: {
    meal_name: { type: "string" },
    items: {
      type: "array",
      minItems: 1,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["food_name_es", "estimated_grams", "confidence", "reason"],
        properties: {
          food_name_es: { type: "string" },
          estimated_grams: { type: "number", minimum: 1, maximum: 2000 },
          confidence: { enum: ["low", "medium", "high"], type: "string" },
          reason: { type: "string" },
        },
      },
    },
    warnings: {
      type: "array",
      items: { type: "string" },
    },
  },
} as const;

export async function analyzeFoodPhoto(dataUrl: string): Promise<PhotoAnalysis> {
  const response = await getOpenAIClient().responses.create({
    model: (process.env.OPENAI_VISION_MODEL || "gpt-5.5") as never,
    max_output_tokens: 1000,
    instructions:
      "Analiza la imagen de comida. Identifica alimentos visibles y estima gramos. No calcules calorias ni macros. Si hay aceites, salsas o ingredientes ocultos, usa warnings. Devuelve solo JSON valido.",
    input: [
      {
        role: "user",
        content: [
          {
            type: "input_text",
            text: "Identifica cada alimento visible, estima gramos y confianza. Usa nombres en espanol.",
          },
          {
            type: "input_image",
            detail: "high",
            image_url: dataUrl,
          },
        ],
      },
    ],
    text: {
      format: {
        type: "json_schema",
        name: "food_photo_analysis",
        strict: true,
        schema: photoAnalysisJsonSchema,
      },
    },
  });

  const raw = (response as { output_text?: string }).output_text;
  if (!raw) {
    throw new Error("OpenAI response did not include output_text");
  }

  return photoAnalysisSchema.parse(JSON.parse(raw));
}
