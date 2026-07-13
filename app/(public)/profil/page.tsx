import { getUserProfile } from "@/services/userService";
import { getAlamat, Alamat } from "@/services/alamatService";
import { getPesanan, Pesanan } from "@/services/pesanService";
import { redirect } from "next/navigation";
import { User, Mail, Phone, ShieldCheck, ShoppingBag, Plus } from "lucide-react";
import Link from "next/link";
import AddressList from "./AlamatList";
import CardPesanan from "@/components/shared/CardPesanan";

export default async function ProfilePage() {
  const [profilRes, alamatRes, pesananRes] =
    await Promise.all([
      getUserProfile(),
      getAlamat(),
      getPesanan(),
    ]);

  if (!profilRes.data || profilRes.error) {
    redirect("/login");
  }

  const user = profilRes.data;
  const daftarAlamat: Alamat[] = Array.isArray(alamatRes.data) ? alamatRes.data : [];
  const daftarPesanan: Pesanan[] = Array.isArray(pesananRes.data) ? pesananRes.data : [];

  const aktivitasTerakhir =
    daftarPesanan
      .sort((a, b) =>
        new Date(b.tanggal_pesan).getTime() -
        new Date(a.tanggal_pesan).getTime()
      )
      .slice(0, 3);

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
                {user.name || "Pelanggan Setia"}
              </h1>
              <div className="badge badge-success badge-sm gap-1 py-3 px-3 text-[10px] font-black uppercase tracking-widest text-white mt-2">
                <ShieldCheck size={12} /> {user.customer?.role || "Individual"}
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
                    <p className="text-xs font-black">{user.customer?.no_hp || "-"}</p>
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
                <h3 className="text-xs font-black uppercase tracking-tight">
                  Semua Daftar Alamat
                </h3>
                <Link href="/profil/alamat/tambah" className="btn btn-ghost btn-xs text-[10px] font-black uppercase border border-base-content/10">
                  <Plus size={14} /> Tambah
                </Link>
              </div>

              <div className="h-50 md:h-75 overflow-y-auto scrollbar-thin">
                <AddressList daftarAlamat={daftarAlamat} />
              </div>
            </div>

            <div className="bg-base-100 rounded-2xl shadow-sm border border-base-content/5 overflow-hidden">
              <div className="p-6 border-b border-base-content/5 flex justify-between items-center bg-base-200/30">
                <h3 className="text-xs font-black uppercase tracking-tight">
                  Aktivitas Terakhir
                </h3>

                <Link
                  href="/pesan"
                  className="btn btn-ghost btn-xs text-[10px] font-black uppercase border border-base-content/10"
                >
                  Lihat Semua
                </Link>
              </div>

              <div className="h-50 md:h-75 overflow-y-auto scrollbar-thin">
                {aktivitasTerakhir.length > 0 ? (
                  aktivitasTerakhir.map((pesanan) => (
                    <CardPesanan
                      key={pesanan.id_pesan}
                      pesanan={pesanan}
                    />
                  ))
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center space-y-4">
                      <div className="w-16 h-16 bg-base-200 rounded-full flex items-center justify-center mx-auto opacity-30">
                        <ShoppingBag size={24} />
                      </div>

                      <div>
                        <p className="text-sm font-black opacity-50 uppercase tracking-tighter">
                          Belum ada pesanan
                        </p>

                        <p className="text-[10px] font-bold opacity-30 uppercase mt-1">
                          Semua jejak cetak akan muncul di sini
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </main>
  );
}