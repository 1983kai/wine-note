"use client";

import { useState } from "react";
import PhotoUpload from "@/components/PhotoUpload";
import WineForm from "@/components/WineForm";
import type { WineLabel } from "@/lib/gemini";
import type { WineFormData } from "@/components/WineForm";

type State = "idle" | "analyzing" | "form" | "saved";

export default function Home() {
  const [state, setState] = useState<State>("idle");
  const [imagePreview, setImagePreview] = useState("");
  const [wineData, setWineData] = useState<WineLabel | null>(null);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");

  const handleImageSelect = async (base64: string, mimeType: string, preview: string) => {
    setImagePreview(preview);
    setState("analyzing");
    setError("");

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64, mimeType }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(`분석 실패: ${data.detail || data.error || res.status}`);
        setState("idle");
        return;
      }
      setWineData(data);
      setState("form");
    } catch (e) {
      setError(`오류: ${e instanceof Error ? e.message : String(e)}`);
      setState("idle");
    }
  };

  const handleSave = async (formData: WineFormData) => {
    const res = await fetch("/api/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    if (!res.ok) throw new Error("저장 실패");

    setState("saved");
    setToast("Notion에 저장되었습니다 ✓");
    setTimeout(() => {
      setToast("");
      setState("idle");
      setImagePreview("");
      setWineData(null);
    }, 3000);
  };

  const handleReset = () => {
    setState("idle");
    setImagePreview("");
    setWineData(null);
    setError("");
  };

  return (
    <main className="min-h-dvh flex flex-col">
      {/* Header */}
      <header className="flex items-center gap-3 px-6 pt-8 pb-4">
        <WineGlass />
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Wine Note</h1>
          <p className="text-xs text-white/40">AI 와인 라벨 스캐너</p>
        </div>
      </header>

      <div className="flex-1 px-6 pb-8 pt-4">
        {/* Idle: upload UI */}
        {state === "idle" && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] gap-8">
            <div className="text-center space-y-2">
              <div className="flex justify-center mb-4">
                <WineGlass size={64} />
              </div>
              <p className="text-white/60 text-sm max-w-xs">
                와인 라벨 사진을 찍거나 업로드하면<br />AI가 자동으로 정보를 분석해요
              </p>
            </div>
            <PhotoUpload onImageSelect={handleImageSelect} />
            {error && (
              <p className="text-red-400 text-sm text-center">{error}</p>
            )}
          </div>
        )}

        {/* Analyzing */}
        {state === "analyzing" && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
            {imagePreview && (
              <div className="w-48 h-64 rounded-2xl overflow-hidden border border-white/10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imagePreview} alt="분석 중" className="w-full h-full object-contain bg-black/40" />
              </div>
            )}
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-[#8b1a2e] border-t-transparent rounded-full animate-spin" />
              <p className="text-white/60 text-sm">라벨을 분석하고 있어요...</p>
            </div>
          </div>
        )}

        {/* Form */}
        {state === "form" && wineData && (
          <WineForm
            initial={wineData}
            imagePreview={imagePreview}
            onSave={handleSave}
            onReset={handleReset}
          />
        )}

        {/* Saved */}
        {state === "saved" && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
            <div className="w-16 h-16 rounded-full bg-[#8b1a2e]/20 flex items-center justify-center">
              <svg className="w-8 h-8 text-[#8b1a2e]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-white font-medium">저장 완료!</p>
            <p className="text-white/40 text-sm">Notion 데이터베이스에 기록되었습니다</p>
          </div>
        )}
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-[#8b1a2e] text-white text-sm px-5 py-3 rounded-full shadow-lg z-50">
          {toast}
        </div>
      )}
    </main>
  );
}

function WineGlass({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"
      className="text-[#8b1a2e] flex-shrink-0">
      <path d="M8 22h8M12 22v-6M6 2h12l-2 8a4 4 0 01-8 0L6 2z" />
    </svg>
  );
}
