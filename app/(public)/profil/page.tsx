import { getUserAddresses, getUserProfile, AddressItem } from "@/services/userService";
import { redirect } from "next/navigation";
import { User, Mail, Phone, MapPin, ShieldCheck, ShoppingBag, Plus, Home } from "lucide-react";
import Link from "next/link";

export default async function ProfilePage() {
  const profilRes = await getUserProfile();
  const alamatRes = await getUserAddresses();

  if (!profilRes.data || profilRes.error) {
    redirect("/login");
  }

  const user = profilRes.data;
  const daftarAlamat: AddressItem[] = Array.isArray(alamatRes.data) ? alamatRes.data : [];
  const alamatUtama = daftarAlamat.length > 0 ? daftarAlamat[0] : null;

  return (
    <main className="min-h-screen bg-base-200 py-12 px-4 md:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="card bg-base-100 shadow-sm border border-base-content/5 overflow-hidden">
          <div className="card-body flex-col md:flex-row items-center gap-6 p-8">
            <div className="avatar">
              <div className="w-24 md:w-32 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                <User size={48} />
              </div>
            </div>
            <div className="text-center md:text-left">
              <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tighter">
                {user.customer_name || "Pelanggan Setia"}
              </h1>
              <div className="badge badge-success badge-sm gap-1 py-3 px-3 text-[10px] font-black uppercase tracking-widest text-white mt-2">
                <ShieldCheck size={12} /> {user.customer_group || "Individual"}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Info Sidebar */}
          <div className="space-y-6">
            <div className="bg-base-100 p-6 rounded-2xl shadow-sm border border-base-content/5 space-y-6">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Kontak & Lokasi</h3>
              
              <div className="space-y-5">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-base-200 flex items-center justify-center opacity-70 shrink-0">
                    <Mail size={18} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold opacity-40 uppercase">Email</p>
                    <p className="text-xs font-black truncate">{user.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-base-200 flex items-center justify-center opacity-70 shrink-0">
                    <Phone size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold opacity-40 uppercase">WhatsApp</p>
                    <p className="text-xs font-black">{user.mobile_no || "-"}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 border-t border-base-content/5 pt-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <Home size={18} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold opacity-40 uppercase">Alamat Utama</p>
                    {alamatUtama ? (
                      <div className="text-xs font-black leading-tight mt-1">
                        <p className="truncate text-primary uppercase">{alamatUtama.address_title}</p>
                        <p className="opacity-60 line-clamp-2 mt-1">{alamatUtama.address_line1}</p>
                        <p className="opacity-40 font-bold mt-1 uppercase">{alamatUtama.city}, {alamatUtama.pincode}</p>
                      </div>
                    ) : (
                      <p className="text-xs font-black opacity-30 italic mt-1">Belum ada alamat</p>
                    )}
                  </div>
                </div>
              </div>

              <Link href="/profil/edit" className="btn btn-primary btn-block btn-sm rounded-xl font-black uppercase text-[10px] tracking-widest mt-4">
                Edit Profil
              </Link>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">
            
            <div className="bg-base-100 rounded-2xl shadow-sm border border-base-content/5 overflow-hidden">
              <div className="p-6 border-b border-base-content/5 flex justify-between items-center bg-base-200/30">
                <h3 className="text-xs font-black uppercase tracking-tight">Semua Daftar Alamat</h3>
                <Link href="/profil/edit" className="btn btn-ghost btn-xs text-[10px] font-black uppercase border border-base-content/10">
                  <Plus size={14} /> Tambah
                </Link>
              </div>
              
              <div className="divide-y divide-base-content/5">
                {daftarAlamat.length > 0 ? (
                  daftarAlamat.map((item: AddressItem, idx: number) => (
                    <div key={idx} className="p-6 hover:bg-base-200/20 transition-colors flex justify-between items-center group">
                      <div className="min-w-0 pr-4">
                        <div className="flex items-center gap-2">
                           <p className="text-xs font-black uppercase tracking-tight">{item.address_title}</p>
                           <span className="badge badge-ghost text-[9px] font-bold opacity-50 uppercase">{item.address_type}</span>
                        </div>
                        <p className="text-xs opacity-60 mt-1 line-clamp-1">{item.address_line1}</p>
                        <p className="text-[10px] font-bold opacity-30 mt-0.5 uppercase tracking-wide">
                          {item.city}, {item.state} {item.pincode}
                        </p>
                      </div>
                      <MapPin size={16} className="opacity-0 group-hover:opacity-20 transition-opacity shrink-0" />
                    </div>
                  ))
                ) : (
                  <div className="p-16 text-center opacity-30 italic text-sm font-black">
                    Belum ada alamat yang tersimpan.
                  </div>
                )}
              </div>
            </div>

            <div className="p-6 bg-base-100 rounded-2xl shadow-sm border border-base-content/5 overflow-hidden">
              <div className="border-b border-base-content/5 text-center">
                <h3 className="text-sm font-black uppercase tracking-tight">Aktivitas Terakhir</h3>
              </div>
              <div className="p-12 text-center space-y-4">
                <div className="w-16 h-16 bg-base-200 rounded-full flex items-center justify-center mx-auto opacity-30">
                  <ShoppingBag size={24} />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-black opacity-50 uppercase tracking-tighter">Belum ada pesanan aktif</p>
                  <p className="text-[10px] font-bold opacity-30 uppercase mt-1">Semua jejak cetak lu bakal muncul di sini</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </main>
  );
}