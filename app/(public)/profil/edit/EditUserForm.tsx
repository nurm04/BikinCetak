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
	
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    
    // Ambil value dan paksa ke string, handle jika null dengan string kosong
    const customer_name = formData.get("customer_name")?.toString() || "";
    const mobile_no = formData.get("mobile_no")?.toString() || "";

    const res = await updateUserProfile({
      customer_name,
      mobile_no,
    });

		setPopup(res.success?
			{ 
				isOpen: true, 
				title: "Berhasil!", 
				message: "Data profil diperbarui!", 
				type: "success" 
			} : { 
				isOpen: true, 
				title: "Gagal!", 
				message: `${res.error}`, 
				type: "error" 
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
							name="customer_name" 
							defaultValue={initialData.customer_name || ""} 
							icon={<User size={16}/>} 
						/>
						<FormInput 
							label="WhatsApp" 
							name="mobile_no" 
							defaultValue={initialData.mobile_no || ""} 
							icon={<Phone size={16}/>} 
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