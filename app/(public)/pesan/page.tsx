import { getPesanan, Pesanan } from "@/services/pesanService";
import { redirect } from "next/navigation";
import { ShoppingBag } from "lucide-react";
import CardPesanan from "@/components/shared/CardPesanan";
import Link from "next/link";

export default async function PesanPage() {
  // Ambil data pesanan dari API (Server-side fetching)
  const pesananRes = await getPesanan();

  // Jika gagal (kemungkinan karena belum login atau token expired), arahkan ke login
  if (pesananRes.error) {
    redirect("/login");
  }

  // Pastikan tipe datanya array untuk menghindari error .map() di bawah
  const daftarPesanan: Pesanan[] = Array.isArray(pesananRes.data)
    ? pesananRes.data
    : [];

  return (
    <main className="min-h-screen bg-base-200 py-12 px-4 md:px-8">
      <div className="max-w-5xl mx-auto">
        
        {/* HEADER & BREADCRUMBS */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div className="breadcrumbs text-[10px] uppercase font-black opacity-40 tracking-widest">
            <ul>
              <li>
                <Link href="/">Home</Link>
              </li>
              <li>Transaksi</li>
            </ul>
          </div>
        </div>

        {/* CONTAINER LIST PESANAN */}
        <div className="bg-base-100 rounded-2xl shadow-sm border border-base-content/5 overflow-hidden">
          <div className="p-6 border-b border-base-content/5 bg-base-200/30">
            <h2 className="text-xs font-black uppercase tracking-tight">
              Semua Transaksi
            </h2>
          </div>

          {/* KONDISI JIKA ADA TRANSAKSI VS KOSONG */}
          {daftarPesanan.length > 0 ? (
            <div className="divide-y divide-base-content/5">
              {daftarPesanan.map((pesanan) => (
                <CardPesanan
                  key={pesanan.id_pesan}
                  pesanan={pesanan}
                />
              ))}
            </div>
          ) : (
            <div className="p-12 text-center space-y-4">
              <div className="w-16 h-16 bg-base-200 rounded-full flex items-center justify-center mx-auto opacity-30">
                <ShoppingBag size={24} />
              </div>

              <div>
                <p className="text-sm font-black opacity-50 uppercase tracking-tight">
                  Belum Ada Transaksi
                </p>
                <p className="text-[10px] font-bold opacity-30 uppercase mt-1">
                  Transaksi yang sudah checkout akan muncul di sini
                </p>
              </div>
            </div>
          )}
        </div>

      </div>
    </main>
  );
}