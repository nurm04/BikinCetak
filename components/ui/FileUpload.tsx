"use client";

import { useState, useRef, useEffect } from "react";
import { Upload, File, X, Paperclip, AlertCircle } from "lucide-react";

interface FileUploadProps {
  variant?: "box" | "minimal";
  onChange?: (files: File[]) => void;
}

export default function FileUpload({ variant = "box", onChange }: FileUploadProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const MAX_FILE_SIZE = 200 * 1024 * 1024;

  useEffect(() => {
    if (onChange) {
      onChange(selectedFiles);
    }
  }, [selectedFiles, onChange]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    setError(null);

    if (files && files.length > 0) {
      const allowedExtensions = ["pdf", "ai", "jpg", "jpeg", "png", "zip"];
      const validFiles: File[] = [];
      let hasError = false;

      Array.from(files).forEach((file) => {
        const fileExtension = file.name.split(".").pop()?.toLowerCase();

        // 1. Validasi Ekstensi
        if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
          setError("ADA FILE FORMAT TIDAK DIDUKUNG (PDF, AI, JPG, PNG, ZIP)");
          hasError = true;
          return;
        }

        // 2. Validasi Ukuran (Maks 200MB)
        if (file.size > MAX_FILE_SIZE) {
          setError("ADA FILE UKURAN TERLALU BESAR (MAKSIMAL 200MB)");
          hasError = true;
          return;
        }

        validFiles.push(file);
      });

      if (!hasError) {
        // Gabungkan file baru dengan file yang sudah dipilih sebelumnya
        setSelectedFiles((prev) => [...prev, ...validFiles]);
      }
      
      // Reset input agar bisa pilih file yang sama berulang kali
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeFile = (e: React.MouseEvent, indexToRemove: number) => {
    e.stopPropagation();
    setSelectedFiles((prev) => prev.filter((_, idx) => idx !== indexToRemove));
    setError(null);
  };

  const clearAllFiles = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedFiles([]);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // ==============================
  // UI MINIMAL (Untuk Tampilan HP)
  // ==============================
  if (variant === "minimal") {
    return (
      <div className="w-full min-w-0 max-w-full overflow-hidden space-y-3">
        <input 
          type="file" 
          multiple // <-- Wajib ada biar bisa pilih banyak file
          className="hidden" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          accept=".pdf,.ai,.jpg,.jpeg,.png,.zip" 
        />
        
        {/* Tombol Upload (Selalu Muncul) */}
        <button 
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className={`btn btn-outline border-dashed border-2 w-full flex items-center justify-start gap-3 rounded-2xl h-14 bg-base-200/30 hover:bg-base-200 min-w-0 px-4 overflow-hidden ${error ? 'border-error bg-error/5 text-error' : 'border-base-300'}`}
        >
          {error ? <AlertCircle size={18} /> : <Paperclip size={18} className="text-primary shrink-0" />}
          <span className={`font-black uppercase text-[10px] tracking-tighter truncate w-full text-left ${error ? 'opacity-100' : 'opacity-50'}`}>
            {error || "Lampirkan File Desain"}
          </span>
        </button>

        {/* List File yang Dipilih */}
        {selectedFiles.length > 0 && (
          <div className="space-y-2">
            {selectedFiles.map((file, idx) => (
              <div key={idx} className="flex items-center gap-3 bg-primary/5 p-3 rounded-2xl border border-primary/20 w-full min-w-0 overflow-hidden">
                <div className="bg-primary text-white p-2 rounded-xl shadow-lg shadow-primary/20 shrink-0">
                  <File size={16} />
                </div>
                <div className="flex-1 min-w-0 overflow-hidden">
                   <p className="text-[11px] font-black truncate uppercase tracking-tighter leading-none w-full block">
                     {file.name}
                   </p>
                </div>
                <button onClick={(e) => removeFile(e, idx)} className="btn btn-ghost btn-circle btn-xs text-error shrink-0">
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-base-100 border-base-content/5 rounded-2xl border w-full max-w-full min-w-0 p-6 shadow-sm flex flex-col overflow-hidden box-border">
      
      <div className="text-primary font-black uppercase tracking-widest text-[10px] mb-4 flex items-center justify-between shrink-0">
        <span className="flex items-center">
          <Upload size={14} className="mr-2 shrink-0" /> File Desain
        </span>
        {selectedFiles.length > 0 && (
          <button onClick={clearAllFiles} className="text-error hover:underline">
            Hapus Semua
          </button>
        )}
      </div>

      <div
        onClick={() => fileInputRef.current?.click()}
        className={`relative flex flex-col items-center justify-center border-2 border-dashed rounded-2xl py-8 px-4 transition-all cursor-pointer group w-full max-w-full min-w-0 overflow-hidden box-border ${
          error ? "border-error bg-error/5" : "border-base-300 bg-base-200/50 hover:bg-base-200 hover:border-primary"
        }`}
      >
        <input 
          type="file" 
          multiple
          className="hidden" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          accept=".pdf,.ai,.jpg,.jpeg,.png,.zip" 
        />

        {error ? (
          <AlertCircle className="mb-4 text-error animate-bounce" size={32} />
        ) : (
          <Upload className="mb-4 opacity-20 group-hover:text-primary group-hover:opacity-100 transition-all shrink-0" size={32} />
        )}
        <p className={`text-[10px] text-center font-black uppercase tracking-tighter px-2 ${error ? 'text-error' : 'opacity-50'}`}>
          {error || "Klik atau seret banyak file desain ke sini"}
        </p>
      </div>
      
      {/* List File yang Dipilih */}
      {selectedFiles.length > 0 && (
        <div className="mt-4 space-y-2 max-h-48 overflow-y-auto pr-1">
          {selectedFiles.map((file, idx) => (
            <div key={idx} className="flex items-center gap-3 bg-base-100 p-3 rounded-xl shadow-sm border border-primary/20 w-full max-w-full min-w-0 overflow-hidden box-border">
              <File className="text-primary shrink-0" size={20} />
              <div className="flex-1 min-w-0 overflow-hidden text-left">
                <p className="text-[11px] font-black truncate uppercase mb-0.5 block w-full">{file.name}</p>
                <p className="text-[9px] uppercase font-bold opacity-40 truncate">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              <button onClick={(e) => removeFile(e, idx)} className="btn btn-circle btn-ghost btn-xs text-error shrink-0 relative z-10">
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      <p className={`text-[9px] mt-4 uppercase font-black text-center tracking-widest truncate w-full shrink-0 ${error ? 'text-error' : 'opacity-30'}`}>
        {error ? `* ${error}` : "* PDF, AI, JPG, PNG, ZIP (MAKS 200MB)"}
      </p>
    </div>
  );
}