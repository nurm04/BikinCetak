import { AlertCircle, CheckCircle2, Info, XCircle, X } from "lucide-react";

interface AlertProps {
  type: "success" | "error" | "info" | "warning";
  message: string;
  onClose?: () => void;
}

export default function Alert({ type, message, onClose }: AlertProps) {
  const config = {
    success: {
      bg: "bg-success/10",
      text: "text-success",
      border: "border-success/20",
      icon: <CheckCircle2 size={18} />,
    },
    error: {
      bg: "bg-error/10",
      text: "text-error",
      border: "border-error/20",
      icon: <XCircle size={18} />,
    },
    info: {
      bg: "bg-info/10",
      text: "text-info",
      border: "border-info/20",
      icon: <Info size={18} />,
    },
    warning: {
      bg: "bg-warning/10",
      text: "text-warning",
      border: "border-warning/20",
      icon: <AlertCircle size={18} />,
    },
  };

  const current = config[type];

  return (
    <div 
      className={`
        flex items-center justify-between p-4 rounded-2xl border 
        ${current.bg} ${current.text} ${current.border}
        animate-in fade-in slide-in-from-top-2 duration-300
      `}
    >
      <div className="flex items-center gap-3">
        <div className="shrink-0">{current.icon}</div>
        <p className="text-[11px] font-black uppercase tracking-widest leading-none">
          {message}
        </p>
      </div>

      {onClose && (
        <button 
          onClick={onClose}
          className="hover:opacity-60 transition-opacity p-1"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}