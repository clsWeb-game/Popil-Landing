"use client";

import { useRef, useState, useCallback } from "react";
import { Upload, X, FileText } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";

interface ImageDropboxProps {
  label: string;
  subtitle?: string;
  accept?: string;
  value?: File | null;
  onChange?: (file: File | null) => void;
  className?: string;
}

export default function ImageDropbox({
  label,
  subtitle = "PDF, JPG, PNG (Max 5MB)",
  accept = "image/*,.pdf",
  value,
  onChange,
  className,
}: ImageDropboxProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    (file: File | null) => {
      onChange?.(file);
      if (file && file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onloadend = () => setPreview(reader.result as string);
        reader.readAsDataURL(file);
      } else {
        setPreview(null);
      }
    },
    [onChange]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    handleFile(null);
    setPreview(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <span className="text-sm font-medium text-foreground/70">{label}</span>
      <motion.div
        onClick={() => inputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        animate={{
          borderColor: isDragging
            ? "rgba(82,39,255,0.8)"
            : value
            ? "rgba(82,39,255,0.45)"
            : "rgba(255,255,255,0.1)",
          backgroundColor: isDragging
            ? "rgba(82,39,255,0.06)"
            : "rgba(255,255,255,0.03)",
        }}
        transition={{ duration: 0.15 }}
        className="relative flex min-h-[120px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed"
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0] ?? null;
            handleFile(file);
          }}
        />

        <AnimatePresence mode="wait">
          {value ? (
            <motion.div
              key="uploaded"
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              transition={{ duration: 0.2 }}
              className="relative flex w-full flex-col items-center gap-2 p-3"
            >
              {preview ? (
                <>
                  <img
                    src={preview}
                    alt="preview"
                    className="max-h-[72px] rounded-lg object-contain"
                  />
                  <span className="text-xs text-white/40 truncate max-w-[180px]">
                    {value.name}
                  </span>
                </>
              ) : (
                <div className="flex items-center gap-2 text-white/60 px-3">
                  <FileText className="h-8 w-8 text-primary/60 shrink-0" />
                  <span className="text-xs truncate max-w-[160px]">{value.name}</span>
                </div>
              )}
              <button
                type="button"
                onClick={handleRemove}
                className="absolute right-2 top-2 rounded-full bg-white/10 p-1 hover:bg-red-400/20 transition-colors"
              >
                <X className="h-3 w-3 text-white/50" />
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="placeholder"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="flex flex-col items-center gap-2 p-4 text-center pointer-events-none"
            >
              <motion.div
                animate={isDragging ? { y: -4, scale: 1.12 } : { y: 0, scale: 1 }}
                transition={{ type: "spring", stiffness: 320, damping: 20 }}
              >
                <Upload className="h-7 w-7 text-white/25" />
              </motion.div>
              <p className="text-xs text-white/40">
                <span className="text-primary/70 font-medium">Click to upload</span>{" "}
                or drag &amp; drop
              </p>
              {subtitle && <p className="text-xs text-white/25">{subtitle}</p>}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
