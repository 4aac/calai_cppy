delete from public.foods
where source = 'curated_generic';

insert into public.foods
  (name, name_es, source, kcal_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, fiber_per_100g, verified)
values
  ('cooked white rice', 'Arroz blanco cocido', 'curated_generic', 130, 2.7, 28.2, 0.3, 0.4, true),
  ('grilled chicken breast', 'Pechuga de pollo a la plancha', 'curated_generic', 165, 31, 0, 3.6, 0, true),
  ('olive oil', 'Aceite de oliva', 'curated_generic', 884, 0, 0, 100, 0, true),
  ('banana', 'Platano', 'curated_generic', 89, 1.1, 22.8, 0.3, 2.6, true),
  ('whole egg', 'Huevo', 'curated_generic', 143, 12.6, 0.7, 9.5, 0, true),
  ('plain whole milk yogurt', 'Yogur natural entero', 'curated_generic', 61, 3.5, 4.7, 3.3, 0, true),
  ('white bread', 'Pan blanco', 'curated_generic', 265, 9, 49, 3.2, 2.7, true),
  ('cooked pasta', 'Pasta cocida', 'curated_generic', 158, 5.8, 30.9, 0.9, 1.8, true),
  ('cooked salmon', 'Salmon cocinado', 'curated_generic', 206, 22.1, 0, 12.4, 0, true),
  ('boiled potato', 'Patata cocida', 'curated_generic', 87, 1.9, 20.1, 0.1, 1.8, true),
  ('grilled beef steak', 'Filete de ternera a la plancha', 'curated_generic', 217, 26.1, 0, 12, 0, true),
  ('canned tuna in water', 'Atun al natural', 'curated_generic', 116, 25.5, 0, 0.8, 0, true),
  ('avocado', 'Aguacate', 'curated_generic', 160, 2, 8.5, 14.7, 6.7, true),
  ('tomato', 'Tomate', 'curated_generic', 18, 0.9, 3.9, 0.2, 1.2, true),
  ('lettuce', 'Lechuga', 'curated_generic', 15, 1.4, 2.9, 0.2, 1.3, true),
  ('apple', 'Manzana', 'curated_generic', 52, 0.3, 13.8, 0.2, 2.4, true),
  ('orange', 'Naranja', 'curated_generic', 47, 0.9, 11.8, 0.1, 2.4, true),
  ('rolled oats dry', 'Copos de avena', 'curated_generic', 389, 16.9, 66.3, 6.9, 10.6, true),
  ('whole milk', 'Leche entera', 'curated_generic', 61, 3.2, 4.8, 3.3, 0, true),
  ('cured cheese', 'Queso curado', 'curated_generic', 403, 25, 1.3, 33, 0, true),
  ('cooked lentils', 'Lentejas cocidas', 'curated_generic', 116, 9, 20.1, 0.4, 7.9, true),
  ('cooked chickpeas', 'Garbanzos cocidos', 'curated_generic', 164, 8.9, 27.4, 2.6, 7.6, true),
  ('boiled broccoli', 'Brocoli cocido', 'curated_generic', 35, 2.4, 7.2, 0.4, 3.3, true),
  ('raw carrot', 'Zanahoria', 'curated_generic', 41, 0.9, 9.6, 0.2, 2.8, true),
  ('roasted turkey breast', 'Pechuga de pavo', 'curated_generic', 135, 29, 0, 1.6, 0, true),
  ('cooked quinoa', 'Quinoa cocida', 'curated_generic', 120, 4.4, 21.3, 1.9, 2.8, true);
