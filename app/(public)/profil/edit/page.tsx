import { getUserProfile, getUserAddresses } from "@/services/userService";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import EditUserForm from "./EditUserForm";
import EditAddressForm from "./EditAddressForm";
import EditPasswordForm from "./EditPasswordForm";

export default async function ProfileEditPage() {
  const [pRes, aRes] = await Promise.all([
    getUserProfile(),
    getUserAddresses()
  ]);

  if (!pRes.data || pRes.error) redirect("/login");

  const user = pRes.data;
  const alamat = Array.isArray(aRes.data) && aRes.data.length > 0 ? aRes.data[0] : null;

  return (
    <main className="min-h-screen bg-base-200 py-12 px-4 md:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        <div className="flex justify-between items-center px-2">
          <Link href="/profil" className="btn btn-ghost btn-sm gap-2 text-[10px] font-black uppercase tracking-widest">
            <ArrowLeft size={14} /> Kembali ke Profil
          </Link>
          <span className="text-xs font-black uppercase tracking-[0.3em] opacity-20 italic">Settings</span>
        </div>

        {/* Masing-masing form sekarang independen */}
        <EditUserForm initialData={user} />
        
        <EditAddressForm initialData={alamat} />
        
        <EditPasswordForm />

      </div>
    </main>
  );
}