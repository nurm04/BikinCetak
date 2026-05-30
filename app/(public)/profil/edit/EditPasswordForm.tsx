"use client";
import { useState } from "react";
import { Lock, ShieldCheck } from "lucide-react";
import FormInput from "@/components/ui/FormInput";
import { updateUserProfile } from "@/services/userService";
import AlertPopup from "@/components/ui/AlertPopup";

export default function EditPasswordForm() {
  const [loading, setLoading] = useState(false);
	const [popup, setPopup] = useState<{
    isOpen: boolean; title: string; message: string; type: "success" | "error" | "warning" | "info";
  }>({ isOpen: false, title: "", message: "", type: "info" });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newPass = formData.get("new_password") as string;
    const confirmPass = formData.get("confirm_password") as string;

    if (newPass !== confirmPass) return alert("Konfirmasi password tidak cocok!");

    setLoading(true);
    const res = await updateUserProfile({ new_password: newPass });
		setPopup(res.success ?
			{ 
				isOpen: true, 
				title: "Berhasil!", 
				message: "Password berhasil diganti!", 
				type: "success" 
			} : { 
				isOpen: true, 
				title: "Gagal!", 
				message: `${res.error}`, 
				type: "error" 
			}
		);
    setLoading(false);
    (e.target as HTMLFormElement).reset();
  };

  return (
    <>
			<AlertPopup
				isOpen={popup.isOpen}
				type={popup.type}
				title={popup.title}
				message={popup.message}
				autoClose={popup.type === "success" ? 3000 : undefined} 
				onCancel={() => setPopup({ ...popup, isOpen: false })}
			/>
			<form onSubmit={handleSubmit} className="card bg-base-100 shadow-sm border border-base-content/5">
				<div className="card-body p-8">
					<div className="flex items-center gap-3 mb-6">
						<div className="p-2 bg-error/10 rounded-lg text-error"><Lock size={20} /></div>
						<h2 className="text-sm font-black uppercase tracking-widest leading-none">Keamanan Akun</h2>
					</div>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						<FormInput label="Password Lama" name="old_password" type="password" icon={<ShieldCheck size={16}/>} />
						<FormInput label="Password Baru" name="new_password" type="password" icon={<Lock size={16}/>} />
						<FormInput label="Konfirmasi Baru" name="confirm_password" type="password" icon={<Lock size={16}/>} />
					</div>
					<button disabled={loading} className="btn btn-error btn-outline rounded-xl mt-6 font-black uppercase tracking-widest border-2">
						{loading ? "Memproses..." : "Ganti Password"}
					</button>
				</div>
			</form>
    </>
  );
}