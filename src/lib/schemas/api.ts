import { z } from "zod";

export const confidenceSchema = z.enum(["low", "medium", "high"]);
export const mealTypeSchema = z.enum(["breakfast", "lunch", "snack", "dinner"]);
export const mealSourceSchema = z.enum(["photo_ai", "barcode", "manual", "search"]);

export const photoAnalysisSchema = z.object({
  meal_name: z.string().min(1),
  items: z
    .array(
      z.object({
        food_name_es: z.string().min(1),
        estimated_grams: z.number().positive().max(2000),
        confidence: confidenceSchema,
        reason: z.string().min(1),
      }),
    )
    .min(1),
  warnings: z.array(z.string()).default([]),
});

export const onboardingSchema = z.object({
  age: z.coerce.number().int().min(13).max(100),
  sex: z.enum(["male", "female"]),
  heightCm: z.coerce.number().min(100).max(230),
  weightKg: z.coerce.number().min(35).max(250),
  goal: z.enum(["maintain", "lose", "gain_slow", "gain_fast"]),
  activity: z.enum(["low", "medium", "high"]),
});

export const scanCodeSchema = z.object({
  code: z.string().min(1).max(512),
});

export const mealItemInputSchema = z.object({
  foodId: z.string().uuid().nullable().optional(),
  productId: z.string().uuid().nullable().optional(),
  name: z.string().min(1),
  grams: z.coerce.number().positive().max(5000),
  kcalPer100g: z.coerce.number().nonnegative().max(2000),
  proteinPer100g: z.coerce.number().nonnegative().max(300),
  carbsPer100g: z.coerce.number().nonnegative().max(300),
  fatPer100g: z.coerce.number().nonnegative().max(300),
  confidence: confidenceSchema.default("high"),
  source: mealSourceSchema,
});

export const saveMealSchema = z.object({
  mealType: mealTypeSchema,
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  title: z.string().min(1).max(120).default("Comida"),
  items: z.array(mealItemInputSchema).min(1),
});

export const correctionSchema = z.object({
  mealItemId: z.string().uuid().nullable().optional(),
  originalPrediction: z.record(z.string(), z.unknown()),
  correctedFood: z.string().min(1),
  correctedGrams: z.coerce.number().positive().max(5000),
  photoId: z.string().nullable().optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});
