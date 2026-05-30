import { ReactNode } from "react";

interface AuthInputProps {
  label: string;
  name: string;
  type: string;
  placeholder: string;
  icon: ReactNode;
  rightLabel?: ReactNode;
}

export default function AuthInput({ 
  label, 
  name, 
  type, 
  placeholder, 
  icon, 
  rightLabel 
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
          placeholder={placeholder}
          className="input input-bordered w-full pl-12 bg-base-200 focus:input-primary border-none rounded-2xl font-medium placeholder:opacity-30 text-sm"
          required
        />
      </div>
    </div>
  );
}