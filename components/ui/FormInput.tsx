import { ReactNode, ChangeEvent, FocusEvent } from "react";

interface FormInputProps {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  icon?: ReactNode;
  min?: string;
  max?: string;
  step?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (name: string, value: string) => void;
}

export default function FormInput({
  label,
  name,
  type = "text",
  placeholder,
  icon,
  min,
  max,
  step,
  value,
  onChange,
}: FormInputProps) {
  
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange?.(name, e.target.value);
  };

  const handleBlur = (e: FocusEvent<HTMLInputElement>) => {
    if (type !== "number") return;

    const valueStr = e.target.value;
    
    if (valueStr === "") {
      if (min !== undefined && min !== "") {
        onChange?.(name, String(min)); 
      }
      return;
    }

    let numValue = parseFloat(valueStr);
    const minVal = min !== undefined && min !== "" ? parseFloat(min) : null;
    const maxVal = max !== undefined && max !== "" ? parseFloat(max) : null;
    const stepVal = step !== undefined && step !== "" ? parseFloat(step) : null;

    // 1. Batas Minimum / Maksimum
    if (minVal !== null && numValue < minVal) {
      numValue = minVal;
    } else if (maxVal !== null && numValue > maxVal) {
      numValue = maxVal;
    }

    // 2. LOGIKA KELIPATAN (STEP): Langsung bulatkan ke atas
    if (stepVal !== null && stepVal > 0) {
      if (numValue % stepVal !== 0) {
        numValue = Math.ceil(numValue / stepVal) * stepVal;
      }
    }

    // Eksekusi perubahan ke parent state jika angka berubah
    if (String(numValue) !== value) {
      onChange?.(name, String(numValue));
    }
  };

  return (
    <div className="form-control w-full">
      <label className="label px-1">
        <span className="label-text font-bold uppercase text-[10px] opacity-60 tracking-wider">
          {label}
        </span>
      </label>
      <div className="relative mt-1">
        {icon && (
          <span className="absolute inset-y-0 left-4 flex items-center opacity-30 z-10 pointer-events-none">
            {icon}
          </span>
        )}
        <input
          type={type}
          name={name}
          min={min}
          max={max}
          step={step}
          value={value ?? ""}
          placeholder={placeholder}
          onChange={handleChange}
          onBlur={handleBlur}
          className={`input input-bordered w-full ${icon ? 'pl-12' : 'pl-5'} bg-base-200 focus:input-primary border-none rounded-2xl font-medium placeholder:opacity-30 text-sm`}
        />
      </div>
    </div>
  );
}