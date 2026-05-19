import { useRef, useState } from "react";
import { toast } from "sonner";
import { api } from "../api/client";

export function LogoUploader({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (path: string | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  async function handleFile(file: File) {
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      toast.error("Please pick a JPG, PNG, or WebP image.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("File too large (max 2 MB).");
      return;
    }
    setUploading(true);
    try {
      const { path } = await api.upload<{ path: string }>("/uploads/logo", file);
      onChange(path);
      toast.success("Logo uploaded");
    } catch (e: any) {
      toast.error(e?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <div className="label mb-2">Logo</div>

      {/* Preview matches the card aspect ratio (16:7) so what you see is what others see */}
      <div
        className={`relative aspect-[16/7] overflow-hidden rounded-2xl border-2 border-dashed transition
          ${dragOver ? "border-brand-500 bg-brand-50/50" : "border-slate-200 bg-[linear-gradient(135deg,#f8fafc_0%,#ffffff_50%,#eef2ff_100%)]"}`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          const f = e.dataTransfer.files?.[0];
          if (f) handleFile(f);
        }}
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 30%, #3730A3 0, transparent 40%), radial-gradient(circle at 80% 70%, #10B981 0, transparent 40%)",
          }}
          aria-hidden
        />

        <div className="absolute inset-0 grid place-items-center p-6">
          {value ? (
            <img
              src={value}
              alt=""
              className="max-h-full max-w-full object-contain drop-shadow-sm"
            />
          ) : (
            <div className="text-center">
              <div className="mx-auto mb-2 grid h-10 w-10 place-items-center rounded-xl bg-white text-slate-400 ring-1 ring-slate-200 text-lg">
                ↑
              </div>
              <p className="text-xs font-medium text-slate-500">
                Drop a logo here, or click below to upload
              </p>
            </div>
          )}
        </div>

        {uploading && (
          <div className="absolute inset-0 grid place-items-center bg-white/70">
            <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-brand-600" />
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
          e.target.value = "";
        }}
      />

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          className="btn-ghost text-xs"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? "Uploading…" : value ? "Replace logo" : "Upload logo"}
        </button>
        {value && (
          <button
            type="button"
            className="btn-ghost text-xs text-rose-700 border-rose-200 hover:bg-rose-50"
            onClick={() => onChange(null)}
          >
            Remove
          </button>
        )}
        <p className="ml-auto text-xs text-slate-500">
          JPG, PNG, or WebP · Up to 2 MB · Any aspect ratio — we won't crop it
        </p>
      </div>
    </div>
  );
}
