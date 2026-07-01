import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { DailyDashboard } from "@/components/app/daily-dashboard";
import type { DailySummary } from "@/lib/types";

vi.mock("@/lib/client-env", () => ({
  hasPublicSupabaseEnv: () => true,
}));

const summary: DailySummary = {
  date: "2026-07-01",
  target: { kcal: 2200, protein: 150, carbs: 250, fat: 70 },
  consumed: { kcal: 750, protein: 55, carbs: 84, fat: 22 },
  meals: [
    {
      id: "550e8400-e29b-41d4-a716-446655440000",
      mealType: "lunch",
      title: "Arroz con pollo",
      total: { kcal: 500, protein: 40, carbs: 60, fat: 10 },
      items: [
        {
          name: "Arroz con pollo",
          grams: 300,
          kcal: 500,
          protein: 40,
          carbs: 60,
          fat: 10,
          confidence: "high",
          source: "manual",
        },
      ],
    },
    {
      id: "550e8400-e29b-41d4-a716-446655440001",
      mealType: "lunch",
      title: "Tortilla",
      total: { kcal: 250, protein: 15, carbs: 24, fat: 12 },
      items: [
        {
          name: "Tortilla",
          grams: 120,
          kcal: 250,
          protein: 15,
          carbs: 24,
          fat: 12,
          confidence: "medium",
          source: "photo_ai",
        },
      ],
    },
  ],
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("DailyDashboard", () => {
  it("renders multiple meals and deletes one from the day", async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);

      if (url.startsWith("/api/daily-summary")) {
        return Response.json(summary);
      }

      if (
        url === "/api/meals?id=550e8400-e29b-41d4-a716-446655440000" &&
        init?.method === "DELETE"
      ) {
        return Response.json({ deleted: "550e8400-e29b-41d4-a716-446655440000" });
      }

      return Response.json({ error: "not found" }, { status: 404 });
    });
    vi.stubGlobal("fetch", fetchMock);

    render(<DailyDashboard />);

    expect(await screen.findByText("Arroz con pollo")).toBeInTheDocument();
    expect(screen.getByText("Tortilla")).toBeInTheDocument();
    expect(screen.getByText("2 registros")).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText("Eliminar Arroz con pollo"));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/meals?id=550e8400-e29b-41d4-a716-446655440000",
        { method: "DELETE" },
      );
    });

    await waitFor(() => {
      expect(screen.queryByText("Arroz con pollo")).not.toBeInTheDocument();
    });
    expect(screen.getByText("Tortilla")).toBeInTheDocument();
    expect(screen.getByText("Comida eliminada del dia.")).toBeInTheDocument();
  });
});
