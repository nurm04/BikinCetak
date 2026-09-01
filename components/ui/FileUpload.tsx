"use client";

import { useState, useRef, useEffect } from "react";
import { Upload, File, X, Paperclip, AlertCircle, Link as LinkIcon, Mail } from "lucide-react";

export type TipeFileDesain = "upload" | "link" | "email";

export interface FileDesainPayload {
  tipe_file: TipeFileDesain;
  file: File | null;
  link_file: string;
}

interface FileUploadProps {
  variant?: "box" | "minimal";
  onChange?: (payload: FileDesainPayload) => void;
}

export default function FileUpload({ variant = "box", onChange }: FileUploadProps) {
  const [activeTab, setActiveTab] = useState<TipeFileDesain>("upload");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [linkDrive, setLinkDrive] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const MAX_FILE_SIZE = 200 * 1024 * 1024;

  useEffect(() => {
    if (onChange) {
      onChange({
        tipe_file: activeTab,
        file: activeTab === "upload" ? selectedFile : null,
        link_file: activeTab === "link" ? linkDrive : "",
      });
    }
  }, [activeTab, selectedFile, linkDrive, onChange]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    setError(null);

    if (files && files.length > 0) {
      const allowedExtensions = ["jpg", "jpeg", "png", "tif", "tiff"];
      const file = files[0];
      const fileExtension = file.name.split(".").pop()?.toLowerCase();

      let hasError = false;

      if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
        setError("HANYA JPG/PNG/TIF. GUNAKAN LINK/EMAIL UNTUK FORMAT LAIN");
        hasError = true;
      }

      if (!hasError && file.size > MAX_FILE_SIZE) {
        setError("UKURAN FILE TERLALU BESAR (MAKSIMAL 200MB)");
        hasError = true;
      }

      if (!hasError) {
        setSelectedFile(file);
      }
      
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedFile(null);
    setError(null);
  };

  // Tampilan Minimal (Mobile)
  if (variant === "minimal") {
    return (
      <div className="w-full min-w-0 max-w-full overflow-hidden space-y-3 bg-base-100 p-4 border border-base-content/5 rounded-2xl">
        <div className="text-[10px] font-black uppercase opacity-40 mb-2 flex items-center gap-1"><Upload size={12}/> Kirim File Desain</div>
        
        <div className="join w-full grid grid-cols-3 bg-base-200 rounded-lg p-1">
          <button onClick={() => setActiveTab('upload')} className={`join-item btn btn-xs border-none font-black text-[9px] uppercase ${activeTab === 'upload' ? 'bg-base-100 shadow-sm text-primary' : 'bg-transparent text-base-content/50 hover:bg-base-300'}`}>Upload</button>
          <button onClick={() => setActiveTab('link')} className={`join-item btn btn-xs border-none font-black text-[9px] uppercase ${activeTab === 'link' ? 'bg-base-100 shadow-sm text-primary' : 'bg-transparent text-base-content/50 hover:bg-base-300'}`}>Link</button>
          <button onClick={() => setActiveTab('email')} className={`join-item btn btn-xs border-none font-black text-[9px] uppercase ${activeTab === 'email' ? 'bg-base-100 shadow-sm text-primary' : 'bg-transparent text-base-content/50 hover:bg-base-300'}`}>Email</button>
        </div>

        {activeTab === "upload" && (
          <div className="mt-3">
             <input type="file" className="hidden" ref={fileInputRef} onChange={handleFileChange} accept=".jpg,.jpeg,.png,.tif,.tiff" />
             {!selectedFile ? (
               <button type="button" onClick={() => fileInputRef.current?.click()} className={`btn btn-outline border-dashed border-2 w-full flex items-center justify-start gap-3 rounded-2xl h-12 bg-base-200/30 hover:bg-base-200 min-w-0 px-4 overflow-hidden ${error ? 'border-error bg-error/5 text-error' : 'border-base-300'}`}>
                 {error ? <AlertCircle size={16} /> : <Paperclip size={16} className="text-primary shrink-0" />}
                 <span className={`font-black uppercase text-[9px] tracking-tighter truncate w-full text-left ${error ? 'opacity-100' : 'opacity-50'}`}>{error || "Pilih File"}</span>
               </button>
             ) : (
               <div className="flex items-center gap-3 bg-primary/5 p-2.5 rounded-xl border border-primary/20 w-full min-w-0">
                 <div className="bg-primary text-white p-1.5 rounded-lg shrink-0"><File size={14} /></div>
                 <div className="flex-1 min-w-0 overflow-hidden">
                    <p className="text-[10px] font-black truncate uppercase tracking-tighter leading-none w-full block">{selectedFile.name}</p>
                 </div>
                 <button onClick={(e) => removeFile(e)} className="btn btn-ghost btn-circle btn-xs text-error shrink-0"><X size={14} /></button>
               </div>
             )}
          </div>
        )}

        {activeTab === "link" && (
          <div className="mt-3">
            <input type="url" placeholder="Paste link Google Drive/Cloud di sini..." value={linkDrive} onChange={(e) => setLinkDrive(e.target.value)} className="input input-bordered w-full h-12 rounded-2xl text-xs font-bold bg-base-200/50" />
          </div>
        )}

        {activeTab === "email" && (
          <div className="mt-3 bg-base-200/50 border border-base-300 p-3 rounded-2xl text-center flex flex-col items-center gap-1">
             <Mail size={16} className="text-primary opacity-50" />
             <p className="text-[9px] font-bold uppercase opacity-60">Kirim file pesanan ke email:</p>
             <p className="text-xs font-black text-primary select-all">cs@bikincetak.com</p>
          </div>
        )}
      </div>
    );
  }

  // Tampilan Box (Desktop)
  return (
    <div className="bg-base-100 border-base-content/5 rounded-2xl border w-full max-w-full min-w-0 p-5 shadow-sm flex flex-col overflow-hidden box-border">
      
      <div className="flex flex-col gap-3 mb-5">
        <span className="text-primary font-black uppercase tracking-widest text-[10px] flex items-center shrink-0">
          <Upload size={14} className="mr-2 shrink-0" /> File Desain
        </span>
        
        {/* TABS DESKTOP */}
        <div className="grid grid-cols-3 bg-base-200 p-1 rounded-xl gap-1 w-full">
          <button onClick={() => setActiveTab('upload')} className={`btn btn-xs border-none font-black text-[9px] uppercase h-8 ${activeTab === 'upload' ? 'bg-base-100 shadow-sm text-primary' : 'bg-transparent text-base-content/50 hover:bg-base-300'}`}>Upload</button>
          <button onClick={() => setActiveTab('link')} className={`btn btn-xs border-none font-black text-[9px] uppercase h-8 ${activeTab === 'link' ? 'bg-base-100 shadow-sm text-primary' : 'bg-transparent text-base-content/50 hover:bg-base-300'}`}>Link</button>
          <button onClick={() => setActiveTab('email')} className={`btn btn-xs border-none font-black text-[9px] uppercase h-8 ${activeTab === 'email' ? 'bg-base-100 shadow-sm text-primary' : 'bg-transparent text-base-content/50 hover:bg-base-300'}`}>Email</button>
        </div>
      </div>

      {activeTab === "upload" && (
        <>
          {!selectedFile ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className={`relative flex flex-col items-center justify-center border-2 border-dashed rounded-2xl py-8 px-4 transition-all cursor-pointer group w-full max-w-full min-w-0 overflow-hidden box-border ${error ? "border-error bg-error/5" : "border-base-300 bg-base-200/50 hover:bg-base-200 hover:border-primary"}`}
            >
              <input type="file" className="hidden" ref={fileInputRef} onChange={handleFileChange} accept=".jpg,.jpeg,.png,.tif,.tiff" />
              {error ? <AlertCircle className="mb-4 text-error animate-bounce" size={28} /> : <Upload className="mb-4 opacity-20 group-hover:text-primary group-hover:opacity-100 transition-all shrink-0" size={28} />}
              <p className={`text-[10px] text-center font-black uppercase tracking-tighter px-2 leading-tight ${error ? 'text-error' : 'opacity-50'}`}>{error || "Klik/Seret File ke Sini"}</p>
            </div>
          ) : (
            <div className="flex items-center gap-3 bg-base-100 p-3 rounded-xl shadow-sm border border-primary/20 w-full max-w-full min-w-0 overflow-hidden box-border">
              <File className="text-primary shrink-0" size={18} />
              <div className="flex-1 min-w-0 overflow-hidden text-left">
                <p className="text-[10px] font-black truncate uppercase mb-0.5 block w-full">{selectedFile.name}</p>
                <p className="text-[9px] uppercase font-bold opacity-40 truncate">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
              <button onClick={removeFile} className="btn btn-circle btn-ghost btn-xs text-error shrink-0 relative z-10"><X size={14} /></button>
            </div>
          )}
          <p className={`text-[8px] mt-3 uppercase font-black text-center tracking-widest truncate w-full shrink-0 ${error ? 'text-error' : 'opacity-30'}`}>
            {error ? `* ${error}` : "* JPG, PNG, TIF (MAKS 200MB)"}
          </p>
        </>
      )}

      {activeTab === "link" && (
        <div className="flex flex-col items-center justify-center border-2 border-dashed border-base-300 bg-base-200/50 rounded-2xl py-6 px-4 transition-all group w-full max-w-full min-w-0 box-border">
          <LinkIcon className="mb-3 opacity-20 text-primary transition-all shrink-0" size={28} />
          <input 
            type="url" 
            placeholder="Paste link Drive/Cloud..." 
            value={linkDrive} 
            onChange={(e) => setLinkDrive(e.target.value)} 
            className="input input-bordered w-full h-10 rounded-xl font-bold bg-base-100 text-[10px] text-center" 
          />
          <p className="text-[8px] mt-3 uppercase font-black text-center tracking-widest opacity-30 w-full shrink-0">Pastikan link bisa diakses publik</p>
        </div>
      )}

      {activeTab === "email" && (
        <div className="flex flex-col items-center justify-center border-2 border-dashed border-base-300 bg-base-200/50 rounded-2xl py-6 px-4 transition-all group w-full max-w-full min-w-0 box-border">
          <Mail className="mb-3 opacity-20 text-primary transition-all shrink-0" size={28} />
          <p className="text-[10px] font-bold opacity-70 text-center mb-2">Kirim file desain ke email:</p>
          <div className="bg-base-100 px-4 py-2 rounded-xl border border-base-300 shadow-sm">
             <span className="text-sm font-black text-primary select-all">order@bikincetak.co.id</span>
          </div>
          <p className="text-[8px] mt-3 uppercase font-black text-center tracking-widest opacity-30 w-full shrink-0">Sertakan Kode Transaksi pada subjek</p>
        </div>
      )}
    </div>
  );
}