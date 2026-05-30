// @/components/ui/AlertPopup.tsx
"use client";

import { useEffect } from "react";
import { AlertTriangle, CheckCircle2, Info, AlertCircle, X } from "lucide-react";

// Tipe untuk status alert
export type AlertType = "success" | "error" | "warning" | "info";

interface AlertPopupProps {
  isOpen: boolean;
  type?: AlertType;
  title: string;
  message: string;
  onConfirm?: () => void; // Opsional, kalau ada ini berarti butuh konfirmasi
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
  autoClose?: number; // Dalam milidetik, misal 3000 (3 detik)
}

export default function AlertPopup({
  isOpen,
  type = "info",
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = "Oke",
  cancelText = "Tutup",
  isLoading = false,
  autoClose,
}: AlertPopupProps) {
  
  // Logic untuk auto close kalau durasi diisi
  useEffect(() => {
    if (isOpen && autoClose && !onConfirm) {
      const timer = setTimeout(() => {
        onCancel();
      }, autoClose);
      return () => clearTimeout(timer);
    }
  }, [isOpen, autoClose, onCancel, onConfirm]);

  if (!isOpen) return null;

  // Konfigurasi warna dan ikon berdasarkan tipe
  const config = {
    success: {
      color: "text-success",
      bg: "bg-success/10",
      btn: "btn-success shadow-success/30",
      icon: <CheckCircle2 size={24} />,
    },
    error: {
      color: "text-error",
      bg: "bg-error/10",
      btn: "btn-error shadow-error/30",
      icon: <AlertCircle size={24} />,
    },
    warning: {
      color: "text-warning",
      bg: "bg-warning/10",
      btn: "btn-warning shadow-warning/30",
      icon: <AlertTriangle size={24} />,
    },
    info: {
      color: "text-info",
      bg: "bg-info/10",
      btn: "btn-info shadow-info/30",
      icon: <Info size={24} />,
    },
  };

  const style = config[type];

  return (
    <div className="modal modal-open modal-bottom sm:modal-middle bg-base-300/60 backdrop-blur-sm z-[999]">
      <div className="modal-box rounded-[2rem] border border-base-content/5 shadow-2xl relative overflow-hidden">
        
        {/* Progress bar kecil kalau autoClose aktif */}
        {autoClose && !onConfirm && (
          <div className="absolute top-0 left-0 h-1 bg-base-content/10 w-full">
            <div 
              className={`h-full ${style.color.replace('text', 'bg')} transition-all duration-[3000ms] ease-linear`}
              style={{ width: isOpen ? '100%' : '0%' }}
            />
          </div>
        )}

        <button 
          onClick={onCancel}
          className="btn btn-ghost btn-circle btn-sm absolute right-4 top-4 opacity-40 hover:opacity-100"
        >
          <X size={18} />
        </button>

        <h3 className="font-black text-xl flex items-center gap-3 uppercase tracking-tight">
          <div className={`${style.bg} ${style.color} p-2 rounded-xl`}>
            {style.icon}
          </div>
          {title}
        </h3>
        
        <p className="py-6 text-sm opacity-80 font-medium leading-relaxed">
          {message}
        </p>
        
        <div className="modal-action mt-0 flex items-center gap-2">
          {/* Tombol Batal hanya muncul kalau butuh konfirmasi atau tidak ada autoClose */}
          {(onConfirm || !autoClose) && (
            <button 
              onClick={onCancel} 
              disabled={isLoading}
              className="btn btn-ghost rounded-xl font-bold uppercase text-[10px] tracking-widest"
            >
              {cancelText}
            </button>
          )}
          
          {/* Tombol Konfirmasi hanya muncul kalau ada onConfirm */}
          {onConfirm && (
            <button 
              onClick={onConfirm} 
              disabled={isLoading}
              className={`btn ${style.btn} text-white shadow-lg rounded-xl font-black uppercase text-[10px] tracking-widest px-8`}
            >
              {isLoading ? <span className="loading loading-spinner loading-xs"></span> : confirmText}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}