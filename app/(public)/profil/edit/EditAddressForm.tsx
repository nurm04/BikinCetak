"use client";
import { useState } from "react";
import { MapPin } from "lucide-react";
import FormInput from "@/components/ui/FormInput";
import FormSelect from "@/components/ui/FormSelect";
import FormTextarea from "@/components/ui/FormTextarea";
import { updateAddress, AddressItem } from "@/services/userService";
import AlertPopup from "@/components/ui/AlertPopup";

export default function EditAddressForm({ initialData }: { initialData: AddressItem | null }) {
  const [loading, setLoading] = useState(false);
	const [popup, setPopup] = useState<{
		isOpen: boolean; title: string; message: string; type: "success" | "error" | "warning" | "info";
	}>({ isOpen: false, title: "", message: "", type: "info" });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!initialData) return;
    
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    
    const currentAddrType = formData.get("address_type")?.toString() || initialData.address_type || "Shipping";

    const payload: AddressItem = {
      address_title: formData.get("address_title")?.toString() || initialData.address_title || "",
      address_type: currentAddrType as AddressItem["address_type"],
      address_line1: formData.get("address_line1")?.toString() || initialData.address_line1 || "",
      city: formData.get("city")?.toString() || initialData.city || "",
      state: formData.get("state")?.toString().trim() || initialData.state || "",
      pincode: formData.get("pincode")?.toString() || initialData.pincode || "",
      phone: formData.get("address_phone")?.toString() || initialData.phone || "",
      country: "Indonesia",
      city_id: initialData.city_id || "0",
      province_id: initialData.province_id || "0",
      subdistrict_id: initialData.subdistrict_id || "0",
    };

    const safeType = initialData.address_type || "Shipping";
    const originalKey = `${initialData.address_title}-${safeType}`;
    
    console.log("FINAL_PAYLOAD:", payload);

    const res = await updateAddress(originalKey, payload);

		setPopup(res.success?
			{ 
				isOpen: true, 
				title: "Berhasil!", 
				message: "Alamat berhasil diperbarui!", 
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

  if (!initialData) return null;

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
			<form onSubmit={handleSubmit} className="card bg-base-100 shadow-sm border border-base-content/5 p-8">
				<div className="flex items-center gap-3 mb-6">
					<MapPin className="text-primary" size={20} />
					<h2 className="text-sm font-black uppercase tracking-widest leading-none">Edit Alamat</h2>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<FormInput label="Label Alamat" name="address_title" defaultValue={initialData.address_title} />
					<FormSelect label="Tipe Alamat" name="address_type" options={["Shipping", "Billing"]} value={initialData.address_type || "Shipping"} 
					/>
					<FormTextarea label="Alamat Lengkap" name="address_line1" defaultValue={initialData.address_line1} className="md:col-span-2" />
					<FormInput label="Kota" name="city" defaultValue={initialData.city} />
					<FormInput label="Provinsi" name="state" defaultValue={initialData.state} />
					<FormInput label="Kode Pos" name="pincode" defaultValue={initialData.pincode} />
					<FormInput label="HP Penerima" name="address_phone" defaultValue={initialData.phone} />
				</div>

				<button disabled={loading} className="btn btn-primary mt-6 rounded-xl font-black uppercase h-14">
					{loading ? <span className="loading loading-spinner"></span> : "Update Alamat"}
				</button>
			</form>
		</>
  );
}