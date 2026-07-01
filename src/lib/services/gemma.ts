import "server-only";

import { GoogleGenAI } from "@google/genai";
import { z } from "zod";

import { photoAnalysisSchema } from "@/lib/schemas/api";

let client: GoogleGenAI | null = null;

function getGeminiClient() {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  client ??= new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  return client;
}

export type PhotoAnalysis = z.infer<typeof photoAnalysisSchema>;

export interface PhotoInput {
  base64: string;
  mimeType: string;
}

const photoAnalysisJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: ["meal_name", "items", "warnings"],
  properties: {
    meal_name: {
      type: "string",
      description: "Short Spanish name for the meal.",
    },
    items: {
      type: "array",
      minItems: 1,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["food_name_es", "estimated_grams", "confidence", "reason"],
        properties: {
          food_name_es: {
            type: "string",
            description: "Spanish name of one visible food item.",
          },
          estimated_grams: {
            type: "number",
            minimum: 1,
            maximum: 2000,
            description: "Estimated edible grams for this item.",
          },
          confidence: {
            type: "string",
            enum: ["low", "medium", "high"],
          },
          reason: {
            type: "string",
            description: "Brief Spanish explanation of the estimate.",
          },
        },
      },
    },
    warnings: {
      type: "array",
      items: { type: "string" },
    },
  },
} as const;

export async function analyzeFoodPhoto(input: PhotoInput): Promise<PhotoAnalysis> {
  const interaction = await getGeminiClient().interactions.create({
    model: process.env.GEMMA_VISION_MODEL || "gemma-4-26b-a4b-it",
    system_instruction:
      "Analiza la imagen de comida. Identifica alimentos visibles y estima gramos. No calcules calorias ni macros. Si hay aceites, salsas o ingredientes ocultos, usa warnings. Devuelve solo JSON valido.",
    input: [
      {
        type: "text",
        text: "Identifica cada alimento visible, estima gramos y confianza. Usa nombres en espanol.",
      },
      {
        type: "image",
        data: input.base64,
        mime_type: input.mimeType,
      },
    ],
    response_format: {
      type: "text",
      mime_type: "application/json",
      schema: photoAnalysisJsonSchema,
    },
    generation_config: {
      max_output_tokens: 1000,
      temperature: 0.1,
    },
  });

  const raw = interaction.output_text;
  if (!raw) {
    throw new Error("Gemma response did not include output_text");
  }

  return photoAnalysisSchema.parse(JSON.parse(raw));
}
