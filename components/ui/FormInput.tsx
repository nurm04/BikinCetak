import { ReactNode, ChangeEvent, FocusEvent } from "react";

interface FormInputProps {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  icon?: ReactNode;
  min?: string;
  max?: string;
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
  defaultValue, 
  onChange 
}: FormInputProps) {
  
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange?.(name, e.target.value);
  };

  const handleBlur = (e: FocusEvent<HTMLInputElement>) => {
    if (type !== "number") return;

    const valueStr = e.target.value;
    
    if (valueStr === "") {
      if (min !== undefined) {
        e.target.value = min;
        onChange?.(name, min);
      }
      return;
    }

    const numValue = parseFloat(valueStr);
    const minVal = min !== undefined ? parseFloat(min) : null;
    const maxVal = max !== undefined ? parseFloat(max) : null;

    if (minVal !== null && numValue < minVal) {
      e.target.value = String(minVal);
      onChange?.(name, String(minVal));
    } else if (maxVal !== null && numValue > maxVal) {
      e.target.value = String(maxVal);
      onChange?.(name, String(maxVal));
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
          defaultValue={defaultValue}
          placeholder={placeholder}
          onChange={handleChange}
          onBlur={handleBlur}
          className={`input input-bordered w-full ${icon ? 'pl-12' : 'pl-5'} bg-base-200 focus:input-primary border-none rounded-2xl font-medium placeholder:opacity-30 text-sm`}
        />
      </div>
    </div>
  );
}