import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const migration = readFileSync(
  join(process.cwd(), "supabase/migrations/001_initial_schema.sql"),
  "utf8",
);

describe("Supabase migration", () => {
  it("enables RLS on user-facing tables", () => {
    for (const table of [
      "profiles",
      "foods",
      "branded_products",
      "meals",
      "meal_items",
      "user_corrections",
      "scan_history",
    ]) {
      expect(migration).toContain(`alter table public.${table} enable row level security;`);
    }
  });

  it("limits meal access to the authenticated owner", () => {
    expect(migration).toContain("auth.uid() = user_id");
    expect(migration).toContain("meal items select own");
    expect(migration).toContain("corrections insert own");
  });
});
