export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string | null;
          age: number | null;
          sex: "male" | "female" | null;
          height_cm: number | null;
          weight_kg: number | null;
          goal: string | null;
          activity: string | null;
          target_kcal: number;
          target_protein_g: number;
          target_carbs_g: number;
          target_fat_g: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["profiles"]["Row"]> & { id: string };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Row"]>;
      };
      foods: {
        Row: {
          id: string;
          name: string;
          name_es: string;
          source: string;
          kcal_per_100g: number;
          protein_per_100g: number;
          carbs_per_100g: number;
          fat_per_100g: number;
          fiber_per_100g: number | null;
          verified: boolean;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["foods"]["Row"]> & {
          name: string;
          name_es: string;
          kcal_per_100g: number;
          protein_per_100g: number;
          carbs_per_100g: number;
          fat_per_100g: number;
        };
        Update: Partial<Database["public"]["Tables"]["foods"]["Row"]>;
      };
      branded_products: {
        Row: {
          id: string;
          barcode: string;
          brand: string | null;
          product_name: string;
          kcal_per_100g: number;
          protein_per_100g: number;
          carbs_per_100g: number;
          fat_per_100g: number;
          fiber_per_100g: number | null;
          serving_size_g: number | null;
          source: string;
          last_verified_at: string;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["branded_products"]["Row"]> & {
          barcode: string;
          product_name: string;
          kcal_per_100g: number;
          protein_per_100g: number;
          carbs_per_100g: number;
          fat_per_100g: number;
        };
        Update: Partial<Database["public"]["Tables"]["branded_products"]["Row"]>;
      };
      meals: {
        Row: {
          id: string;
          user_id: string;
          meal_type: string;
          title: string;
          date: string;
          total_kcal: number;
          total_protein_g: number;
          total_carbs_g: number;
          total_fat_g: number;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["meals"]["Row"]> & {
          user_id: string;
          meal_type: string;
          title: string;
          date: string;
        };
        Update: Partial<Database["public"]["Tables"]["meals"]["Row"]>;
      };
      meal_items: {
        Row: {
          id: string;
          meal_id: string;
          food_id: string | null;
          product_id: string | null;
          name: string;
          grams: number;
          kcal: number;
          protein_g: number;
          carbs_g: number;
          fat_g: number;
          confidence: string;
          source: string;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["meal_items"]["Row"]> & {
          meal_id: string;
          name: string;
          grams: number;
          kcal: number;
          protein_g: number;
          carbs_g: number;
          fat_g: number;
          confidence: string;
          source: string;
        };
        Update: Partial<Database["public"]["Tables"]["meal_items"]["Row"]>;
      };
      user_corrections: {
        Row: {
          id: string;
          user_id: string;
          meal_item_id: string | null;
          original_prediction: Json;
          corrected_food: string;
          corrected_grams: number;
          photo_id: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["user_corrections"]["Row"]> & {
          user_id: string;
          original_prediction: Json;
          corrected_food: string;
          corrected_grams: number;
        };
        Update: Partial<Database["public"]["Tables"]["user_corrections"]["Row"]>;
      };
    };
  };
}
