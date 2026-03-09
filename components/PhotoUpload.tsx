"use client";

import { useRef } from "react";

interface Props {
  onImageSelect: (base64: string, mimeType: string, preview: string) => void;
}

export default function PhotoUpload({ onImageSelect }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      const [header, base64] = dataUrl.split(",");
      const mimeType = header.match(/:(.*?);/)?.[1] || "image/jpeg";
      onImageSelect(base64, mimeType, dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div className="flex flex-col gap-4 w-full max-w-sm mx-auto">
      {/* Camera */}
      <button
        onClick={() => cameraRef.current?.click()}
        className="flex items-center justify-center gap-3 w-full py-4 rounded-2xl border border-wine/40 bg-wine/10 text-wine hover:bg-wine/20 transition-colors text-lg font-medium"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        사진 촬영
      </button>
      <input ref={cameraRef} type="file" accept="image/*" capture="environment"
        className="hidden" onChange={onChange} />

      {/* Gallery */}
      <button
        onClick={() => fileRef.current?.click()}
        className="flex items-center justify-center gap-3 w-full py-4 rounded-2xl border border-white/10 bg-white/5 text-white/70 hover:bg-white/10 transition-colors text-lg font-medium"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        갤러리에서 선택
      </button>
      <input ref={fileRef} type="file" accept="image/*"
        className="hidden" onChange={onChange} />
    </div>
  );
}
