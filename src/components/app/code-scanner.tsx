"use client";

import { useEffect, useRef, useState } from "react";
import { Barcode, Camera, Save } from "lucide-react";
import { BrowserMultiFormatReader, type IScannerControls } from "@zxing/browser";

import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { hasPublicSupabaseEnv } from "@/lib/client-env";

interface ProductResult {
  status: "found" | "not_found" | "unsupported_qr";
  message?: string;
  product?: {
    id: string | null;
    name: string;
    brand: string | null;
    kcalPer100g: number;
    proteinPer100g: number;
    carbsPer100g: number;
    fatPer100g: number;
    servingSizeG: number | null;
  };
}

export function CodeScanner() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsRef = useRef<IScannerControls | null>(null);
  const [code, setCode] = useState("");
  const [grams, setGrams] = useState(125);
  const [result, setResult] = useState<ProductResult | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    return () => controlsRef.current?.stop();
  }, []);

  async function startCamera() {
    if (!videoRef.current) {
      setStatus("La camara no esta lista");
      return;
    }

    setStatus("Abriendo camara");
    try {
      const reader = new BrowserMultiFormatReader();
      controlsRef.current = await reader.decodeFromVideoDevice(
        undefined,
        videoRef.current,
        (scanResult) => {
          if (scanResult) {
            const value = scanResult.getText();
            setCode(value);
            controlsRef.current?.stop();
            lookup(value);
          }
        },
      );
    } catch {
      setStatus("No se pudo abrir la camara. Revisa permisos o introduce el codigo manualmente.");
    }
  }

  async function lookup(value = code) {
    if (!value.trim()) return;
    if (!hasPublicSupabaseEnv()) {
      setStatus("Configura Supabase para consultar codigos reales.");
      return;
    }

    setStatus("Buscando producto");
    const response = await fetch("/api/scan-code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: value }),
    });
    const payload = await response.json().catch(() => null);
    setResult(payload);
    setStatus(response.ok ? null : payload?.error ?? "No se pudo consultar el codigo");
    if (payload?.product?.servingSizeG) setGrams(payload.product.servingSizeG);
  }

  async function saveProduct() {
    if (!result?.product) return;
    if (!hasPublicSupabaseEnv()) {
      setStatus("Configura Supabase para guardar productos.");
      return;
    }

    const today = new Date().toISOString().slice(0, 10);
    const response = await fetch("/api/meals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mealType: "snack",
        date: today,
        title: result.product.name,
        items: [
          {
            productId: result.product.id,
            name: result.product.name,
            grams,
            kcalPer100g: result.product.kcalPer100g,
            proteinPer100g: result.product.proteinPer100g,
            carbsPer100g: result.product.carbsPer100g,
            fatPer100g: result.product.fatPer100g,
            confidence: "high",
            source: "barcode",
          },
        ],
      }),
    });

    setStatus(response.ok ? "Producto guardado" : "Inicia sesion y configura Supabase para guardar.");
  }

  return (
    <div className="grid gap-5">
      <section className="overflow-hidden rounded-3xl border border-[#edf1ee] bg-[#101a14]">
        <video ref={videoRef} muted playsInline className="aspect-[4/3] w-full object-cover" />
      </section>

      <div className="grid gap-3">
        <Button onClick={startCamera} icon={<Camera className="h-4 w-4" />}>
          Escanear codigo
        </Button>
        <div className="grid grid-cols-[1fr_auto] gap-2">
          <Field label="EAN / QR" value={code} onChange={(event) => setCode(event.target.value)} placeholder="841..." />
          <Button type="button" variant="secondary" onClick={() => lookup()} icon={<Barcode className="h-4 w-4" />}>
            Buscar
          </Button>
        </div>
      </div>

      {result?.product ? (
        <section className="grid gap-4 rounded-3xl border border-[#edf1ee] p-4">
          <div>
            <p className="text-sm font-semibold text-[#708078]">Producto detectado</p>
            <h2 className="mt-1 text-2xl font-semibold">{result.product.name}</h2>
            {result.product.brand ? <p className="mt-1 text-sm text-[#708078]">{result.product.brand}</p> : null}
          </div>
          <div className="grid grid-cols-4 gap-2 text-center">
            <Metric label="kcal" value={result.product.kcalPer100g} />
            <Metric label="prot" value={result.product.proteinPer100g} />
            <Metric label="carbs" value={result.product.carbsPer100g} />
            <Metric label="grasas" value={result.product.fatPer100g} />
          </div>
          <Field label="Cantidad consumida" type="number" value={grams} onChange={(event) => setGrams(Number(event.target.value))} />
          <Button onClick={saveProduct} icon={<Save className="h-4 w-4" />}>
            Guardar
          </Button>
        </section>
      ) : result ? (
        <p className="rounded-xl bg-[#fff9eb] p-3 text-sm font-medium text-[#8b6415]">{result.message ?? "Producto no encontrado."}</p>
      ) : null}

      {status ? <p className="text-sm font-medium text-[#607369]">{status}</p> : null}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl bg-[#f6faf8] p-3">
      <p className="text-lg font-semibold">{Math.round(value)}</p>
      <p className="mt-1 text-[11px] font-semibold text-[#708078]">{label}</p>
    </div>
  );
}
