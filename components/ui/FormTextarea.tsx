interface FormTextareaProps {
  label: string;
  name: string;
  placeholder?: string;
  className?: string;
  defaultValue?: string;
  onChange?: (name: string, value: string) => void;
}

export default function FormTextarea({ label, name, placeholder, defaultValue, className, onChange }: FormTextareaProps) {
  return (
    <div className={`form-control w-full ${className}`}>
      <label className="label px-1">
        <span className="label-text font-bold uppercase text-[10px] opacity-60 tracking-wider">
          {label}
        </span>
      </label>
      <textarea 
        name={name}
        placeholder={placeholder}
        defaultValue={defaultValue}
        onChange={(e) => onChange?.(name, e.target.value)}
        className="textarea mt-1 w-full bg-base-200 border-none rounded-2xl font-medium text-sm p-5 h-28 transition-all focus:outline-none focus:ring-2 focus:ring-primary"
      ></textarea>
    </div>
  );
}