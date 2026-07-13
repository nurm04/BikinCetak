"use client";
import { useState } from "react";
import { User, Phone } from "lucide-react";
import FormInput from "@/components/ui/FormInput";
import { updateUserProfile, UserProfile } from "@/services/userService";
import AlertPopup from "@/components/ui/AlertPopup";

export default function EditUserForm({ initialData }: { initialData: UserProfile }) {
  const [loading, setLoading] = useState(false);
	const [popup, setPopup] = useState<{
		isOpen: boolean; title: string; message: string; type: "success" | "error" | "warning" | "info";
	}>({ isOpen: false, title: "", message: "", type: "info" });

	const [form, setForm] = useState({
		name: initialData.name,
		no_hp: initialData.customer?.no_hp ?? "",
	});

	const handleChange = (name: string, value: string) => {
		setForm((prev) => ({...prev, [name]: value}));
	};
	
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		setLoading(true);

		const res = await updateUserProfile({
			name: form.name,
			no_hp: form.no_hp,
		});

		setPopup(
			res.success
				? {
						isOpen: true,
						title: "Berhasil!",
						message: "Data profil diperbarui!",
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
						<div className="p-2 bg-primary/10 rounded-lg text-primary"><User size={20} /></div>
						<h2 className="text-sm font-black uppercase tracking-widest leading-none">Data Personal</h2>
					</div>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<FormInput
							label="Nama Lengkap"
							name="name"
							value={form.name}
							onChange={handleChange}
							icon={<User size={16} />}
						/>
						<FormInput
							label="WhatsApp"
							name="no_hp"
							value={form.no_hp || ""}
							onChange={handleChange}
							icon={<Phone size={16} />}
						/>
					</div>
					<button disabled={loading} className="btn btn-primary rounded-xl mt-6 font-black uppercase tracking-widest">
						{loading ? <span className="loading loading-spinner loading-xs"></span> : "Update Profil"}
					</button>
				</div>
			</form>
    </>
  );
}