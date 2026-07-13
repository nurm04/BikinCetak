import { ReactNode } from "react";

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
  return (
    <div className="form-control w-full">
      <div className="label flex justify-between items-end px-1">
        <span className="label-text font-bold uppercase text-[10px] opacity-60 tracking-wider">
          {label}
        </span>
        {rightLabel}
      </div>
      <div className="relative mt-1">
        <span className="absolute inset-y-0 left-4 flex items-center opacity-40 z-10 pointer-events-none">
          {icon}
        </span>
        <input
          type={type}
          name={name}
          defaultValue={defaultValue}
          placeholder={placeholder}
          className="input input-bordered w-full pl-12 bg-base-200 focus:input-primary border-none rounded-2xl font-medium placeholder:opacity-30 text-sm"
          required={required}
          readOnly={readOnly}
        />
      </div>
    </div>
  );
}