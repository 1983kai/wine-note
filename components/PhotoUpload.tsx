"use client";

import { useRef } from "react";

interface Props {
  onImageSelect: (base64: string, mimeType: string, preview: string) => void;
}

const SUPPORTED = ["image/jpeg", "image/png", "image/webp", "image/gif"];

// Always convert image to JPEG via canvas — handles HEIC and oversized images
function toJpeg(dataUrl: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const MAX = 1024;
      let { width, height } = img;
      if (width > MAX || height > MAX) {
        if (width > height) { height = Math.round(height * MAX / width); width = MAX; }
        else { width = Math.round(width * MAX / height); height = MAX; }
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) { reject(new Error("Canvas unavailable")); return; }
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);
      const result = canvas.toDataURL("image/jpeg", 0.88);
      if (result.length < 500) { reject(new Error("Canvas output invalid")); return; }
      resolve(result);
    };
    img.onerror = () => reject(new Error("Image load failed"));
    img.src = dataUrl;
  });
}

export default function PhotoUpload({ onImageSelect }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    // Check format — reject HEIC/HEIF upfront
    const type = file.type.toLowerCase();
    if (type.includes("heic") || type.includes("heif")) {
      alert("HEIC 포맷은 지원하지 않습니다.\n사진 앱에서 JPEG로 공유하거나, 사진 촬영 버튼을 사용해주세요.");
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => alert("파일 읽기 실패");
    reader.onload = async (e) => {
      const dataUrl = e.target?.result as string;
      if (!dataUrl) { alert("이미지 로드 실패"); return; }

      try {
        const jpeg = await toJpeg(dataUrl);
        const base64 = jpeg.split(",")[1];
        onImageSelect(base64, "image/jpeg", jpeg);
      } catch (err) {
        // Canvas failed — try sending as-is if it's a supported format
        if (SUPPORTED.includes(type)) {
          const base64 = dataUrl.split(",")[1];
          onImageSelect(base64, type, dataUrl);
        } else {
          alert(`이미지 처리 실패: ${err instanceof Error ? err.message : "알 수 없는 오류"}`);
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = ""; // allow re-selecting same file
  };

  return (
    <div className="flex flex-col gap-4 w-full max-w-sm mx-auto">
      {/* Camera */}
      <button
        onClick={() => cameraRef.current?.click()}
        className="flex items-center justify-center gap-3 w-full py-4 rounded-2xl border border-[#8b1a2e]/40 bg-[#8b1a2e]/10 text-[#8b1a2e] hover:bg-[#8b1a2e]/20 transition-colors text-lg font-medium"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        사진 촬영
      </button>
      <input ref={cameraRef} type="file" accept="image/jpeg,image/png,image/webp"
        capture="environment" className="hidden" onChange={onChange} />

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
      <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden" onChange={onChange} />
    </div>
  );
}
