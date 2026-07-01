export type ParsedScan =
  | { type: "barcode"; value: string }
  | { type: "qr_url"; value: string; barcodeCandidate?: string }
  | { type: "qr_text"; value: string; barcodeCandidate?: string };

const barcodePattern = /^\d{8,14}$/;

export function parseScannedCode(raw: string): ParsedScan {
  const value = raw.trim();

  if (barcodePattern.test(value)) {
    return { type: "barcode", value };
  }

  const barcodeCandidate = extractBarcodeCandidate(value);

  try {
    const url = new URL(value);
    return { type: "qr_url", value: url.toString(), barcodeCandidate };
  } catch {
    return { type: "qr_text", value, barcodeCandidate };
  }
}

export function extractBarcodeCandidate(value: string) {
  const candidates = value.match(/\d{8,14}/g) ?? [];
  return candidates.sort((a, b) => b.length - a.length)[0];
}
