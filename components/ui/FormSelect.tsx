import { Loader2 } from "lucide-react";

export interface SelectOption {
  value: string;
  label: string;
}

interface FormSelectProps {
  label: string;
  name: string;
  options: SelectOption[];
  value?: string;
  onChange?: (name: string, value: string) => void;
  disabled?: boolean;
  loading?: boolean;
}

export default function FormSelect({ 
  label, 
  name, 
  options, 
  value, 
  onChange, 
  disabled = false,
  loading = false 
}: FormSelectProps) {
  return (
    <div className="w-full form-control">
      <label className="px-1 label">
        <span className="label-text font-bold uppercase text-[10px] opacity-60 tracking-wider">
          {label}
        </span>
      </label>
      <div className="relative">
        <select 
          name={name}
          value={value || ""}
          onChange={(e) => onChange?.(name, e.target.value)}
          disabled={disabled || loading}
          className="select mt-1 w-full bg-base-200 border-none rounded-2xl font-medium text-sm px-5 transition-all focus:outline-none focus:ring-2 focus:ring-primary appearance-none disabled:opacity-50"
        >
          <option value="" disabled>Pilih {label}</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        
        {loading && (
          <Loader2 className="absolute top-4 right-5 animate-spin opacity-50 text-base-content" size={16} />
        )}
      </div>
    </div>
  );
}