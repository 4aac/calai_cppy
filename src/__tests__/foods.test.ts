import { describe, expect, it } from "vitest";

import { sanitizeFoodSearchQuery } from "@/lib/services/foods";

describe("food search helpers", () => {
  it("keeps readable food names while stripping PostgREST filter punctuation", () => {
    expect(sanitizeFoodSearchQuery("pollo a la plancha")).toBe("pollo a la plancha");
    expect(sanitizeFoodSearchQuery("arroz%_,name.not.is.null")).toBe("arroz name not is null");
  });

  it("preserves unicode letters for Spanish food names", () => {
    const spanishFood = "pi\u00f1a con lim\u00f3n";

    expect(sanitizeFoodSearchQuery(spanishFood)).toBe(spanishFood);
  });
});
