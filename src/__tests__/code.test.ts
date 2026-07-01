import { describe, expect, it } from "vitest";

import { extractBarcodeCandidate, parseScannedCode } from "@/lib/services/code";

describe("scan code parsing", () => {
  it("recognizes plain EAN barcodes", () => {
    expect(parseScannedCode("8412345678901")).toEqual({
      type: "barcode",
      value: "8412345678901",
    });
  });

  it("extracts a barcode candidate from GS1-style URLs", () => {
    expect(extractBarcodeCandidate("https://example.com/01/08412345678901")).toBe("08412345678901");
  });

  it("keeps arbitrary QR text distinct from barcodes", () => {
    expect(parseScannedCode("menu del dia")).toEqual({
      type: "qr_text",
      value: "menu del dia",
      barcodeCandidate: undefined,
    });
  });
});
