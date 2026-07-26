// app/pesan/[kode_transaksi]/page.tsx
import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache"; 
import { ArrowLeft, ShoppingBag, CreditCard, Calendar, CheckCircle } from "lucide-react";
import { getPesananByKodeTransaksi, completePesanan, Pesanan, PesananItem } from "@/services/pesanService";
import { RincianDiskon } from "@/services/pesanService";
import CartProductItem from "@/components/shared/CardProductItem";

async function completeAction(kode_transaksi: string) {
  "use server";
  await completePesanan(kode_transaksi);
  revalidatePath(`/pesan/${kode_transaksi}`);
}

export default async function DetailPesananPage({ params }: {
  params: Promise<{ kode_transaksi: string }>;
}) {
  const { kode_transaksi } = await params;
  const result = await getPesananByKodeTransaksi(kode_transaksi);

  if (!result.success || !result.data) {
    redirect("/pesan");
  }

  const pesanan = result.data as Pesanan;
  const totalTagihan = pesanan.total_tagihan || 0;
  const kodeUnik = pesanan.kode_unik || 0;

  // Hitung total Murni (Harga + Finishing)
  const totalHargaMurniProduk = pesanan.pesanan_item?.reduce((sum, item) => {
      const finishingTotal = item.pesanan_item_finishing?.reduce((acc, fin) => acc + (Number(fin.harga_finishing_snapshot) || 0), 0) ?? 0;
      return sum + ((Number(item.harga_satuan_snapshot) + finishingTotal) * Number(item.jumlah));
  }, 0) ?? 0;

  // Hitung total Biaya SLA
  const totalBiayaPengerjaan = pesanan.pesanan_item?.reduce((sum, item) => {
      return sum + (Number(item.harga_pengerjaan_snapshot) || 0);
  }, 0) ?? 0;

  // Data Bank dari Environment
  const bankName = process.env.NEXT_PUBLIC_BANK_NAME || "BCA";
  const bankNumber = process.env.NEXT_PUBLIC_BANK_NUMBER || "1234567890";
  const bankOwner = process.env.NEXT_PUBLIC_BANK_OWNER || "Bikin Cetak";

  // Batas Waktu 3 Hari
  const tglPesan = new Date(pesanan.tanggal_pesan);
  tglPesan.setDate(tglPesan.getDate() + 3);
  const batasWaktuTransfer = tglPesan.toLocaleString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Jakarta"
  }) + " WIB";

  return (
    <main className="min-h-screen bg-base-200 py-6 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div className="breadcrumbs text-[10px] uppercase font-black opacity-40 tracking-widest">
            <ul>
              <li><Link href="/">Home</Link></li>
              <li><Link href="/pesan">Pesanan</Link></li>
              <li>{pesanan.kode_transaksi}</li>
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
                  <p className="text-[10px] uppercase font-black opacity-40">Kode Transaksi</p>
                  <h1 className="text-2xl font-black tracking-tight">{pesanan.kode_transaksi}</h1>
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

          {/* RIGHT: Kolom Ringkasan */}
          <div className="lg:col-span-4">
            <div className="sticky top-24 space-y-4">
              
              {/* RINGKASAN TAGIHAN */}
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

                    {totalBiayaPengerjaan > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="opacity-70 font-bold">Biaya Pengerjaan</span>
                        <span className="font-black text-primary">+ Rp {totalBiayaPengerjaan.toLocaleString("id-ID")}</span>
                      </div>
                    )}

                    <div className="flex justify-between text-sm">
                      <span className="opacity-70 font-bold">Ongkos Kirim</span>
                      <span className="font-black text-primary">+ Rp {(pesanan.harga_ongkir || 0).toLocaleString("id-ID")}</span>
                    </div>

                    {pesanan.diskon_voucher_nominal && pesanan.diskon_voucher_nominal > 0 ? (
                      <div className="flex justify-between text-sm">
                        <span className="opacity-70 font-bold">Diskon Voucher</span>
                        <span className="font-black text-error">- Rp {pesanan.diskon_voucher_nominal.toLocaleString("id-ID")}</span>
                      </div>
                    ) : null}

                    {kodeUnik > 0 && (
                      <div className="flex justify-between text-sm text-warning">
                        <span className="opacity-70 font-bold">Kode Unik</span>
                        <span className="font-black">+ Rp {kodeUnik.toLocaleString("id-ID")}</span>
                      </div>
                    )}

                    <div className="divider opacity-10 my-2" />
                    
                    <div className="flex flex-col gap-1">
                      <p className="text-[10px] uppercase font-black opacity-40 tracking-widest">Total Tagihan</p>
                      <p className="text-3xl font-black text-primary tracking-tighter">Rp {totalTagihan.toLocaleString("id-ID")}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* CARD INFORMASI REKENING (Hanya tampil jika belum lunas) */}
              {pesanan.status_pembayaran === "belum_lunas" && (
                <div className="bg-base-100 rounded-2xl p-6 border-2 border-warning/30 shadow-md">
                  <div className="flex flex-col gap-4 border-b border-base-200 pb-4 mb-4">
                    <div>
                      <h3 className="text-sm font-black uppercase text-warning tracking-wider flex items-center gap-2">
                        ⚠️ Segera Selesaikan Pembayaran
                      </h3>
                      <p className="text-xs opacity-65 mt-1">Transfer tepat hingga <strong className="text-base-content font-black">3 digit terakhir</strong> agar otomatis terverifikasi.</p>
                    </div>
                    <div className="bg-warning/10 text-warning px-4 py-3 rounded-xl text-center border border-warning/20">
                      <p className="text-[9px] font-black uppercase tracking-tight opacity-60">Batas Waktu Transfer</p>
                      <p className="text-xs font-black">{batasWaktuTransfer}</p>
                    </div>
                  </div>

                  <div className="space-y-4 bg-base-200/50 p-4 rounded-xl border border-base-content/5">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black uppercase opacity-40">Bank Tujuan</span>
                      <span className="text-sm font-black text-base-content uppercase">{bankName}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black uppercase opacity-40">No. Rekening</span>
                      <span className="text-sm font-black text-primary tracking-wider select-all">{bankNumber}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black uppercase opacity-40">Atas Nama</span>
                      <span className="text-sm font-bold text-base-content">{bankOwner}</span>
                    </div>
                  </div>

                  <div className="mt-4 bg-warning/5 border border-warning/20 p-4 rounded-xl flex flex-col gap-3">
                    <div>
                      <span className="text-[10px] font-black uppercase opacity-60">Total Harus Ditransfer</span>
                      <div className="mt-1">
                        <span className="text-2xl font-black text-warning select-all">Rp {totalTagihan.toLocaleString("id-ID")}</span>
                      </div>
                    </div>
                    
                    <div className="text-right text-xs font-bold opacity-70 bg-base-100 p-3 rounded-lg border border-base-content/5 w-full">
                      <div className="flex justify-between gap-4 mb-1">
                        <span>Subtotal:</span>
                        <span>Rp {(totalTagihan - kodeUnik).toLocaleString("id-ID")}</span>
                      </div>
                      <div className="flex justify-between gap-4 text-warning">
                        <span>Kode Unik:</span>
                        <span>+ Rp {kodeUnik.toLocaleString("id-ID")}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {pesanan.status_operasional === "proses_pengantaran" && (
                 <form action={completeAction.bind(null, pesanan.kode_transaksi)}>
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