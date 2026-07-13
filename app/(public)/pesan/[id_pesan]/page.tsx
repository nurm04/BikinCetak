// app/pesan/[id_pesan]/page.tsx
import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache"; 
import { ArrowLeft, ShoppingBag, CreditCard, Calendar, XCircle, CheckCircle } from "lucide-react";
import { getPesananById, cancelPesanan, completePesanan, Pesanan, PesananItem } from "@/services/pesanService";
import { RincianDiskon } from "@/services/pesanService";
import CartProductItem from "@/components/shared/CardProductItem";

async function cancelAction(id_pesan: string) {
  "use server"; 
  await cancelPesanan(id_pesan);
  revalidatePath(`/pesan/${id_pesan}`);
}

async function completeAction(id_pesan: string) {
  "use server";
  await completePesanan(id_pesan);
  revalidatePath(`/pesan/${id_pesan}`);
}

export default async function DetailPesananPage({ params }: {
  params: Promise<{ id_pesan: string }>;
}) {
  const { id_pesan } = await params;
  const result = await getPesananById(id_pesan);

  if (!result.success || !result.data) {
    redirect("/pesan");
  }

  const pesanan = result.data as Pesanan;
  const totalTagihan = pesanan.total_tagihan || 0;

  const totalHargaMurniProduk = pesanan.pesanan_item?.reduce((sum, item) => {
      const finishingTotal = item.pesanan_item_finishing?.reduce((acc, fin) => acc + fin.harga_finishing_snapshot, 0) ?? 0;
      return sum + ((item.harga_satuan_snapshot + finishingTotal) * item.jumlah);
  }, 0) ?? 0;

  return (
    <main className="min-h-screen bg-base-200 py-6 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div className="breadcrumbs text-[10px] uppercase font-black opacity-40 tracking-widest">
            <ul>
              <li><Link href="/">Home</Link></li>
              <li><Link href="/pesan">Pesanan</Link></li>
              <li>{pesanan.id_pesan}</li>
            </ul>
          </div>
          <Link href="/pesan" className="btn btn-ghost btn-xs gap-2 uppercase font-bold opacity-60">
            <ArrowLeft size={14} /> Kembali
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-6">
            
            {/* Header Pesanan */}
            <div className="bg-base-100 rounded-2xl p-6 shadow-sm border border-base-content/5">
              <div className="flex justify-between items-start gap-4 flex-wrap">
                <div>
                  <p className="text-[10px] uppercase font-black opacity-40">Kode Pesanan</p>
                  <h1 className="text-2xl font-black tracking-tight">{pesanan.id_pesan}</h1>
                  <div className="flex items-center gap-2 mt-3 text-xs opacity-60">
                    <Calendar size={14} /> Tanggal Pesan : {new Date(pesanan.tanggal_pesan).toLocaleDateString("id-ID")}
                  </div>
                </div>
                <div className="flex flex-col gap-2 items-end">
                  <div className="badge badge-primary badge-sm gap-1 py-3 px-3 text-[10px] font-black uppercase tracking-widest text-white mt-2">
                    {pesanan.status_operasional.replaceAll("_", " ")}
                  </div>
                  <div className={`badge badge-sm gap-1 py-3 px-3 text-[10px] font-black uppercase tracking-widest mt-2 ${pesanan.status_pembayaran === 'lunas' ? 'badge-success text-white' : 'badge-outline'}`}>
                    {pesanan.status_pembayaran.replaceAll("_", " ")}
                  </div>
                </div>
              </div>
            </div>

            {/* Produk List */}
            <div className="bg-base-100 rounded-2xl p-6 shadow-sm border border-base-content/5">
              <div className="flex items-center gap-3 mb-6 border-b border-base-content/5 pb-4">
                <ShoppingBag className="text-primary" size={20} />
                <h2 className="text-xl font-black uppercase tracking-tight">Produk Pesanan</h2>
              </div>
              <div className="divide-y divide-base-content/5">
                {pesanan.pesanan_item?.map((item: PesananItem) => {
                   const parsedDiskon: RincianDiskon[] = typeof item.rincian_diskon_snapshot === 'string' ? JSON.parse(item.rincian_diskon_snapshot) : (item.rincian_diskon_snapshot || []);
                   const parsedFileDesain: string[] = typeof item.file_desain === 'string' ? JSON.parse(item.file_desain) : (item.file_desain || []);

                   return (
                     <CartProductItem
                        key={item.id}
                        isReadOnly={true}
                        id={item.id}
                        nama_sku={item.nama_produk_snapshot}
                        harga_satuan={item.harga_satuan_snapshot}
                        jumlah={item.jumlah}
                        finishing={item.pesanan_item_finishing?.map(f => ({
                            nama_finishing: f.nama_finishing_snapshot,
                            harga_tambahan: f.harga_finishing_snapshot
                        }))}
                        rincian_diskon_snapshot={parsedDiskon}
                        estimasi_pengerjaan={item.estimasi_pengerjaan_snapshot}
                        harga_pengerjaan_snapshot={item.harga_pengerjaan_snapshot}
                        catatan={item.catatan}
                        file_desain={parsedFileDesain}
                     />
                   )
                })}
              </div>
            </div>
          </div>

          {/* RIGHT: Ringkasan Tagihan */}
          <div className="lg:col-span-4">
            <div className="sticky top-24 space-y-4">
              <div className="card bg-base-100 border border-base-content/5 rounded-2xl shadow-sm">
                <div className="card-body">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 mb-6 flex items-center gap-2">
                    <CreditCard size={14} /> Ringkasan Tagihan
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="opacity-70 font-bold">Total Produk</span>
                      <span className="font-black">Rp {totalHargaMurniProduk.toLocaleString("id-ID")}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="opacity-70 font-bold">Ongkos Kirim</span>
                      <span className="font-black text-primary">+ Rp {(pesanan.harga_ongkir || 0).toLocaleString("id-ID")}</span>
                    </div>
                    <div className="divider opacity-10 my-2" />
                    <div className="flex flex-col gap-1">
                      <p className="text-[10px] uppercase font-black opacity-40 tracking-widest">Total Tagihan</p>
                      <p className="text-3xl font-black text-primary tracking-tighter">Rp {totalTagihan.toLocaleString("id-ID")}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              {pesanan.status_operasional === "menunggu_diproses" && (
                <form action={cancelAction.bind(null, pesanan.id_pesan)}>
                  <button className="btn btn-error btn-outline btn-block rounded-2xl font-black uppercase">
                    <XCircle size={18} /> Batalkan Pesanan
                  </button>
                </form>
              )}
              {pesanan.status_operasional === "proses_pengantaran" && (
                 <form action={completeAction.bind(null, pesanan.id_pesan)}>
                    <button className="btn btn-success text-white btn-block rounded-2xl font-black uppercase text-xs shadow-lg shadow-success/30">
                      <CheckCircle size={18} /> Pesanan Diterima
                    </button>
                 </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}