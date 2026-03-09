"use client";

import { useState } from "react";
import type { WineLabel } from "@/lib/gemini";

export interface WineFormData extends WineLabel {
  rating: string;
  flavorProfile: string;
  tastingNotes: string;
  pairing: string;
  price: number | null;
  purchaseSource: string;
  dateTasted: string;
  buyDate: string;
  status: string;
  storage: string;
}

interface Props {
  initial: WineLabel;
  imagePreview: string;
  onSave: (data: WineFormData) => Promise<void>;
  onReset: () => void;
}

export default function WineForm({ initial, imagePreview, onSave, onReset }: Props) {
  const today = new Date().toISOString().split("T")[0];
  const [form, setForm] = useState<WineFormData>({
    ...initial,
    rating: "",
    flavorProfile: "",
    tastingNotes: "",
    pairing: "",
    price: null,
    purchaseSource: "",
    dateTasted: today,
    buyDate: "",
    status: "Tasted",
    storage: "",
  });
  const [saving, setSaving] = useState(false);

  const set = (key: keyof WineFormData, value: string | number | null) =>
    setForm((f) => ({ ...f, [key]: value }));

  const [saveError, setSaveError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveError("");
    try {
      await onSave(form);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "저장 실패");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-lg mx-auto space-y-6">
      {/* Preview */}
      <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden border border-white/10">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={imagePreview} alt="Wine label" className="w-full h-full object-contain bg-black/40" />
      </div>

      <p className="text-xs text-white/40 text-center">AI가 분석한 정보를 확인하고 수정하세요</p>

      {/* Auto-filled fields */}
      <section className="space-y-3">
        <h2 className="text-xs font-semibold text-white/40 uppercase tracking-widest">라벨 정보</h2>
        <Field label="와인 이름" required>
          <input type="text" value={form.name} onChange={(e) => set("name", e.target.value)}
            className="input" placeholder="e.g. Château Margaux" required />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="빈티지">
            <input type="number" value={form.vintage ?? ""} onChange={(e) => set("vintage", e.target.value ? Number(e.target.value) : null)}
              className="input" placeholder="2019" min={1800} max={2100} />
          </Field>
          <Field label="도수 (ABV%)">
            <input type="number" step="0.1" value={form.abv ?? ""} onChange={(e) => set("abv", e.target.value ? Number(e.target.value) : null)}
              className="input" placeholder="13.5" />
          </Field>
        </div>
        <Field label="지역">
          <input type="text" value={form.region} onChange={(e) => set("region", e.target.value)}
            className="input" placeholder="Bordeaux, France" />
        </Field>
        <Field label="품종">
          <input type="text" value={form.grape} onChange={(e) => set("grape", e.target.value)}
            className="input" placeholder="Cabernet Sauvignon, Merlot" />
        </Field>
        <Field label="스타일">
          <select value={form.style} onChange={(e) => set("style", e.target.value)}
            className="input">
            <option value="">선택</option>
            <option value="Red">Red</option>
            <option value="White">White</option>
            <option value="샴페인">샴페인</option>
          </select>
        </Field>
      </section>

      {/* User-filled fields */}
      <section className="space-y-3">
        <h2 className="text-xs font-semibold text-white/40 uppercase tracking-widest">테이스팅 노트</h2>
        <Field label="느낀 점 (Tasting Notes)">
          <textarea value={form.tastingNotes} onChange={(e) => set("tastingNotes", e.target.value)}
            className="input min-h-[100px] resize-none" placeholder="다크 초콜릿, 블랙베리의 풍미..." rows={4} />
        </Field>
        <Field label="향 프로파일">
          <input type="text" value={form.flavorProfile} onChange={(e) => set("flavorProfile", e.target.value)}
            className="input" placeholder="Fruity, Earthy, Tannic" />
        </Field>
        <Field label="평점">
          <input type="text" value={form.rating} onChange={(e) => set("rating", e.target.value)}
            className="input" placeholder="92/100 or ★★★★☆" />
        </Field>
        <Field label="페어링">
          <input type="text" value={form.pairing} onChange={(e) => set("pairing", e.target.value)}
            className="input" placeholder="스테이크, 하드 치즈" />
        </Field>
      </section>

      <section className="space-y-3">
        <h2 className="text-xs font-semibold text-white/40 uppercase tracking-widest">구매 정보</h2>
        <div className="grid grid-cols-2 gap-3">
          <Field label="가격 (₩)">
            <input type="number" value={form.price ?? ""} onChange={(e) => set("price", e.target.value ? Number(e.target.value) : null)}
              className="input" placeholder="65000" />
          </Field>
          <Field label="구매처">
            <input type="text" value={form.purchaseSource} onChange={(e) => set("purchaseSource", e.target.value)}
              className="input" placeholder="와인앤모어" />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="시음 날짜">
            <input type="date" value={form.dateTasted} onChange={(e) => set("dateTasted", e.target.value)}
              className="input" />
          </Field>
          <Field label="구매 날짜">
            <input type="date" value={form.buyDate} onChange={(e) => set("buyDate", e.target.value)}
              className="input" />
          </Field>
        </div>
      </section>

      {saveError && (
        <p className="text-red-400 text-sm text-center">{saveError}</p>
      )}
      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onReset}
          className="flex-1 py-4 rounded-2xl border border-white/10 text-white/50 hover:bg-white/5 transition-colors">
          다시 촬영
        </button>
        <button type="submit" disabled={saving}
          className="flex-2 flex-[2] py-4 rounded-2xl bg-[#8b1a2e] text-white font-semibold hover:bg-[#8b1a2e]/80 transition-colors disabled:opacity-50">
          {saving ? "저장 중..." : "Notion에 저장"}
        </button>
      </div>
    </form>
  );
}

function Field({ label, children, required }: { label: string; children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm text-white/60">{label}{required && <span className="text-wine ml-1">*</span>}</span>
      {children}
    </label>
  );
}
