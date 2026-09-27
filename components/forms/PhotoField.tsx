"use client";

import { useCallback, useRef, useState } from "react";
import Cropper, { type Area } from "react-easy-crop";
import { useController, type FieldPath, type FieldValues } from "react-hook-form";

type Aspect = "square" | "passport";
const RATIO: Record<Aspect, number> = { square: 1, passport: 35 / 45 };
const OUTPUT_WIDTH = 600;

interface PhotoValue {
  dataUrl: string;
  aspect: Aspect;
}

const isPhoto = (v: unknown): v is PhotoValue =>
  typeof v === "object" && v !== null && "dataUrl" in v && typeof v.dataUrl === "string";

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/** Crops to the selected area and re-encodes as JPEG (~600px wide) so it stays small in localStorage. */
async function cropToDataUrl(src: string, area: Area, aspect: Aspect): Promise<string> {
  const img = await loadImage(src);
  const canvas = document.createElement("canvas");
  canvas.width = OUTPUT_WIDTH;
  canvas.height = Math.round(OUTPUT_WIDTH / RATIO[aspect]);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not available");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, area.x, area.y, area.width, area.height, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", 0.88);
}

export function PhotoField<T extends FieldValues>({ name, defaultAspect = "passport" }: { name: FieldPath<T>; defaultAspect?: Aspect }) {
  const {
    field: { value, onChange },
  } = useController<T>({ name });
  const raw: unknown = value;
  const photo = isPhoto(raw) ? raw : null;
  const inputRef = useRef<HTMLInputElement>(null);
  const [source, setSource] = useState<string | null>(null);
  const [aspect, setAspect] = useState<Aspect>(photo?.aspect ?? defaultAspect);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [area, setArea] = useState<Area | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onFile = (file: File | undefined) => {
    setError(null);
    if (!file) return;
    if (!file.type.startsWith("image/")) return setError("Please choose an image file (JPG or PNG).");
    if (file.size > 15 * 1024 * 1024) return setError("That image is larger than 15 MB.");
    const reader = new FileReader();
    reader.onload = () => {
      setSource(typeof reader.result === "string" ? reader.result : null);
      setZoom(1);
      setCrop({ x: 0, y: 0 });
    };
    reader.readAsDataURL(file);
  };

  const onCropComplete = useCallback((_: Area, pixels: Area) => setArea(pixels), []);

  const save = async () => {
    if (!source || !area) return;
    try {
      onChange({ dataUrl: await cropToDataUrl(source, area, aspect), aspect });
      setSource(null);
    } catch {
      setError("Couldn't process that image. Try a different file.");
    }
  };

  return (
    <div className="flex items-start gap-4">
      <div
        className="flex shrink-0 items-center justify-center overflow-hidden rounded-md border border-dashed border-zinc-300 bg-zinc-50 text-xs text-zinc-400"
        style={{ width: 84, height: photo?.aspect === "square" ? 84 : 108 }}
      >
        {photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photo.dataUrl} alt="Your photo" className="h-full w-full object-cover" />
        ) : (
          "No photo"
        )}
      </div>
      <div className="space-y-2">
        <div className="flex flex-wrap gap-2">
          <button type="button" className="btn" onClick={() => inputRef.current?.click()}>
            {photo ? "Replace photo" : "Upload photo"}
          </button>
          {photo ? (
            <button type="button" className="btn btn-ghost text-red-600" onClick={() => onChange(null)}>
              Remove
            </button>
          ) : null}
        </div>
        <p className="text-xs text-zinc-500">JPG or PNG. You can crop to square or passport (35×45 mm) size.</p>
        {error ? <p className="text-xs text-red-600">{error}</p> : null}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            onFile(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
      </div>

      {source ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" role="dialog" aria-modal="true" aria-label="Crop photo">
          <div className="w-full max-w-lg overflow-hidden rounded-xl bg-white shadow-2xl">
            <div className="relative h-80 bg-zinc-900">
              <Cropper
                image={source}
                crop={crop}
                zoom={zoom}
                aspect={RATIO[aspect]}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            </div>
            <div className="space-y-3 p-4">
              <div className="flex flex-wrap items-center gap-3">
                <div className="inline-flex rounded-md border border-zinc-300 p-0.5">
                  {(["passport", "square"] as const).map((a) => (
                    <button
                      key={a}
                      type="button"
                      onClick={() => setAspect(a)}
                      className={`rounded px-3 py-1 text-sm ${aspect === a ? "bg-indigo-600 text-white" : "text-zinc-700 hover:bg-zinc-100"}`}
                    >
                      {a === "passport" ? "Passport (35×45)" : "Square"}
                    </button>
                  ))}
                </div>
                <label className="flex flex-1 items-center gap-2 text-sm text-zinc-600">
                  Zoom
                  <input type="range" min={1} max={3} step={0.01} value={zoom} onChange={(e) => setZoom(Number(e.target.value))} className="flex-1 accent-indigo-600" />
                </label>
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" className="btn" onClick={() => setSource(null)}>
                  Cancel
                </button>
                <button type="button" className="btn btn-primary" onClick={save}>
                  Use photo
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
