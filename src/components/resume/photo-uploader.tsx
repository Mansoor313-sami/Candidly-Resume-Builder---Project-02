"use client";

import { useRef, useState } from "react";
import { ImagePlus, Trash2 } from "lucide-react";
import { resizeImageToDataUrl } from "@/lib/utils";

/**
 * Profile photo control. Reads a chosen image, downscales it client-side to a
 * small JPEG data URL, and hands it back via onChange. Photo-friendly
 * templates (sidebar, banner, gradient…) render it; others ignore it.
 */
export function PhotoUploader({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const input = useRef<HTMLInputElement>(null);
  const [error, setError] = useState("");

  async function handle(file?: File) {
    if (!file) return;
    if (!file.type.startsWith("image/")) return setError("Please choose an image file.");
    try {
      onChange(await resizeImageToDataUrl(file));
      setError("");
    } catch {
      setError("Could not process that image.");
    }
  }

  return (
    <div className="flex items-center gap-4">
      <div className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-full border border-line bg-brand/10 text-brand">
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt="Profile" className="h-full w-full object-cover" />
        ) : (
          <ImagePlus size={22} />
        )}
      </div>
      <div>
        <div className="flex gap-2">
          <button type="button" className="btn btn-secondary !px-3 !py-2 text-sm" onClick={() => input.current?.click()}>
            {value ? "Change photo" : "Upload photo"}
          </button>
          {value && (
            <button type="button" className="btn btn-ghost !px-3 !py-2 text-sm text-rose-500" onClick={() => onChange("")}>
              <Trash2 size={14} /> Remove
            </button>
          )}
        </div>
        <p className="mt-1.5 text-xs text-muted">Shown in photo templates (Sidebar, Banner, Gradient…).</p>
        {error && <p className="mt-1 text-xs text-rose-500">{error}</p>}
      </div>
      <input
        ref={input}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handle(e.target.files?.[0])}
      />
    </div>
  );
}
