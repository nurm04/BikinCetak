"use client";

import { ReactNode, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

interface AuthInputProps {
  label: string;
  name: string;
  type: string;
  defaultValue?: string;
  placeholder?: string; 
  icon: ReactNode;
  rightLabel?: ReactNode;
  readOnly?: boolean;
  required?: boolean;   
}

export default function AuthInput({ 
  label, 
  name, 
  type,
  defaultValue,
  placeholder, 
  icon, 
  rightLabel,
  readOnly = false,
  required = false      
}: AuthInputProps) {
  // State untuk melacak status buka/tutup mata
  const [showPassword, setShowPassword] = useState(false);

  // Cek apakah input ini awalnya adalah password
  const isPassword = type === "password";
  
  // Kalau type-nya password dan lagi showPassword, ubah jadi text
  const inputType = isPassword ? (showPassword ? "text" : "password") : type;

  return (
    <div className="form-control w-full">
      <div className="label flex justify-between items-end px-1">
        <span className="label-text font-bold uppercase text-[10px] opacity-60 tracking-wider">
          {label}
        </span>
        {rightLabel}
      </div>
      <div className="relative mt-1">
        {/* Icon Kiri */}
        <span className="absolute inset-y-0 left-4 flex items-center opacity-40 z-10 pointer-events-none">
          {icon}
        </span>
        
        <input
          type={inputType}
          name={name}
          defaultValue={defaultValue}
          placeholder={placeholder}
          // Tambahin pr-12 biar ketikan panjang nggak nabrak icon mata di kanan
          className="input input-bordered w-full pl-12 pr-12 bg-base-200 focus:input-primary border-none rounded-2xl font-medium placeholder:opacity-30 text-sm"
          required={required}
          readOnly={readOnly}
        />

        {/* Tombol Mata (Muncul Kalo Props type === "password") */}
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-4 flex items-center opacity-40 hover:opacity-100 transition-opacity z-10"
            aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
    </div>
  );
}