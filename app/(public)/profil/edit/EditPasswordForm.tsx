"use client";
import { useState } from "react";
import { Lock, ShieldCheck } from "lucide-react";
import FormInput from "@/components/ui/FormInput";
import { updatePassword } from "@/services/userService";
import AlertPopup from "@/components/ui/AlertPopup";

export default function EditPasswordForm() {
  const [loading, setLoading] = useState(false);
	const [popup, setPopup] = useState<{
    isOpen: boolean; title: string; message: string; type: "success" | "error" | "warning" | "info";
  }>({ isOpen: false, title: "", message: "", type: "info" });

	const [form, setForm] = useState({
		old_password: "",
		new_password: "",
		confirm_password: "",
	});

	const handleChange = (name: string, value: string) => {
		setForm((prev) => ({...prev, [name]: value}));
	};

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		if (form.new_password !== form.confirm_password) {
			setPopup({
				isOpen: true,
				title: "Gagal!",
				message:
					"Konfirmasi password tidak cocok.",
				type: "error",
			});

			return;
		}

		setLoading(true);

		const res = await updatePassword({
			old_password: form.old_password,
			password: form.new_password,
			password_confirmation: form.confirm_password,
		});

		setPopup(
			res.success
				? {
						isOpen: true,
						title: "Berhasil!",
						message:
							"Password berhasil diganti!",
						type: "success",
					}
				: {
						isOpen: true,
						title: "Gagal!",
						message:
							res.error ||
							"Terjadi kesalahan.",
						type: "error",
					}
		);

		if (res.success) {
			setForm({
				old_password: "",
				new_password: "",
				confirm_password: "",
			});
		}

		setLoading(false);
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
						<FormInput
							label="Password Lama"
							name="old_password"
							type="password"
							value={form.old_password}
							onChange={handleChange}
							icon={<ShieldCheck size={16}/>}
						/>

						<FormInput
							label="Password Baru"
							name="new_password"
							type="password"
							value={form.new_password}
							onChange={handleChange}
							icon={<Lock size={16}/>}
						/>

						<FormInput
							label="Konfirmasi Baru"
							name="confirm_password"
							type="password"
							value={form.confirm_password}
							onChange={handleChange}
							icon={<Lock size={16}/>}
						/>
					</div>
					<button disabled={loading} className="btn btn-error btn-outline rounded-xl mt-6 font-black uppercase tracking-widest border-2">
						{loading ? "Memproses..." : "Ganti Password"}
					</button>
				</div>
			</form>
    </>
  );
}