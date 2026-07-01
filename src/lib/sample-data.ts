import type { DailySummary, FoodRecord } from "@/lib/types";

export const seedFoods: FoodRecord[] = [
  {
    name: "cooked white rice",
    nameEs: "Arroz blanco cocido",
    source: "seed",
    nutritionPer100g: { kcal: 130, protein: 2.7, carbs: 28, fat: 0.3 },
    verified: true,
  },
  {
    name: "grilled chicken breast",
    nameEs: "Pechuga de pollo a la plancha",
    source: "seed",
    nutritionPer100g: { kcal: 165, protein: 31, carbs: 0, fat: 3.6 },
    verified: true,
  },
  {
    name: "olive oil",
    nameEs: "Aceite de oliva",
    source: "seed",
    nutritionPer100g: { kcal: 884, protein: 0, carbs: 0, fat: 100 },
    verified: true,
  },
  {
    name: "banana",
    nameEs: "Platano",
    source: "seed",
    nutritionPer100g: { kcal: 89, protein: 1.1, carbs: 22.8, fat: 0.3 },
    verified: true,
  },
  {
    name: "egg",
    nameEs: "Huevo",
    source: "seed",
    nutritionPer100g: { kcal: 143, protein: 12.6, carbs: 0.7, fat: 9.5 },
    verified: true,
  },
  {
    name: "greek yogurt",
    nameEs: "Yogur griego natural",
    source: "seed",
    nutritionPer100g: { kcal: 125, protein: 8, carbs: 4, fat: 8 },
    verified: true,
  },
  {
    name: "white bread",
    nameEs: "Pan blanco",
    source: "seed",
    nutritionPer100g: { kcal: 265, protein: 9, carbs: 49, fat: 3.2 },
    verified: true,
  },
  {
    name: "cooked pasta",
    nameEs: "Pasta cocida",
    source: "seed",
    nutritionPer100g: { kcal: 158, protein: 5.8, carbs: 30.9, fat: 0.9 },
    verified: true,
  },
  {
    name: "salmon",
    nameEs: "Salmon",
    source: "seed",
    nutritionPer100g: { kcal: 208, protein: 20.4, carbs: 0, fat: 13.4 },
    verified: true,
  },
  {
    name: "potato",
    nameEs: "Patata cocida",
    source: "seed",
    nutritionPer100g: { kcal: 87, protein: 1.9, carbs: 20.1, fat: 0.1 },
    verified: true,
  },
];

export const demoSummary: DailySummary = {
  date: new Date().toISOString().slice(0, 10),
  target: { kcal: 2850, protein: 160, carbs: 385, fat: 75 },
  consumed: { kcal: 2150, protein: 120, carbs: 260, fat: 55 },
  meals: [
    {
      id: "demo-breakfast",
      mealType: "breakfast",
      title: "Desayuno",
      total: { kcal: 420, protein: 28, carbs: 52, fat: 11 },
      items: [
        {
          name: "Yogur griego natural",
          grams: 200,
          kcal: 250,
          protein: 16,
          carbs: 8,
          fat: 16,
          confidence: "high",
          source: "manual",
        },
      ],
    },
    {
      id: "demo-lunch",
      mealType: "lunch",
      title: "Comida",
      total: { kcal: 572, protein: 48, carbs: 50, fat: 18 },
      items: [
        {
          name: "Arroz blanco cocido",
          grams: 180,
          kcal: 234,
          protein: 4.9,
          carbs: 50.4,
          fat: 0.5,
          confidence: "medium",
          source: "photo_ai",
        },
        {
          name: "Pechuga de pollo a la plancha",
          grams: 150,
          kcal: 248,
          protein: 46.5,
          carbs: 0,
          fat: 5.4,
          confidence: "high",
          source: "photo_ai",
        },
      ],
    },
  ],
};

export function findSeedFoods(query: string) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return seedFoods.slice(0, 6);
  }

  return seedFoods.filter((food) => {
    return (
      food.name.toLowerCase().includes(normalized) ||
      food.nameEs.toLowerCase().includes(normalized)
    );
  });
}
