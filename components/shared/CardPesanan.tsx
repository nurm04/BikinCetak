import Image from "next/image";
import Link from "next/link";
import {
  CalendarDays,
  Package,
  CreditCard,
  Eye,
  Truck,
  Ticket
} from "lucide-react";
import { Pesanan, PesananItem, CustomAttributeValue } from "@/services/pesanService";

interface Props {
  pesanan: Pesanan;
}

export default function CardPesanan({ pesanan }: Props) {
  const totalItem = pesanan.pesanan_item?.reduce((sum, item) => sum + (Number(item.jumlah) || 0), 0) ?? 0;

  const ongkir = Number(pesanan.harga_ongkir || 0);
  const diskon = Number(pesanan.diskon_voucher_nominal || 0);
  const kodeUnik = Number(pesanan.kode_unik || 0);

  // ==========================================
  // KALKULASI ULANG HARGA (SINKRON DENGAN CHECKOUT)
  // ==========================================
  const hitungRowTotal = (item: PesananItem) => {
    let hargaDasar = Number(item.harga_satuan_snapshot) || 0;

    // 1. Ekstrak Jumlah Halaman dengan aman
    let jumlahHalaman = 1;
    let atribut: Record<string, CustomAttributeValue> = {};

    if (item.atribut_custom_snapshot) {
      if (typeof item.atribut_custom_snapshot === "string") {
        try {
          atribut = JSON.parse(item.atribut_custom_snapshot) as Record<string, CustomAttributeValue>;
        } catch (e) {
          console.error("Gagal parse atribut_custom_snapshot", e);
        }
      } else {
        atribut = item.atribut_custom_snapshot;
      }

      if (atribut && atribut["Jumlah Halaman"] !== undefined) {
        const val = parseInt(String(atribut["Jumlah Halaman"]), 10);
        if (!isNaN(val) && val > 0) {
          jumlahHalaman = val;
        }
      }
    }

    // 2. Deteksi Sisi Cetak
    let sisi = 1;
    item.pesanan_item_finishing?.forEach((fin) => {
      const label = (fin.nama_finishing_snapshot || "").toLowerCase();
      if (label.includes("2 sisi") || label.includes("dua sisi") || label.includes("bolak")) {
        sisi = 2;
      }
    });

    // 3. Tambahkan Biaya Kertas Halaman Dalam (halaman 1 gratis)
    if (jumlahHalaman > 1) {
      hargaDasar += (jumlahHalaman - 1) * sisi * 1500;
    }

    // 4. Kalkulasi Total (Harga Dasar + Kertas + Finishing)
    const finishingTotal = item.pesanan_item_finishing?.reduce((sum, fin) => sum + (Number(fin.harga_finishing_snapshot) || 0), 0) ?? 0;
    const hargaPerPcs = hargaDasar + finishingTotal;
    const biayaPengerjaan = Number(item.harga_pengerjaan_snapshot) || 0;

    return (hargaPerPcs * (Number(item.jumlah) || 1)) + biayaPengerjaan;
  };

  // 5. Timpa total tagihan dari DB dengan kalkulasi aktual frontend (termasuk kode unik)
  const subtotalProduk = pesanan.pesanan_item?.reduce((sum, item) => sum + hitungRowTotal(item), 0) ?? 0;
  const totalTagihan = subtotalProduk + ongkir - diskon + kodeUnik;

  return (
    <div className="flex flex-col overflow-hidden transition-all bg-base-100 border border-base-300 rounded-3xl hover:border-primary/50 hover:shadow-md">
      
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 border-b bg-base-200/30 border-base-200">
        <div>
          <h3 className="text-xs font-black tracking-widest text-primary uppercase">{pesanan.kode_transaksi}</h3>
          <div className="flex items-center gap-1 mt-1 text-[10px] font-bold opacity-60">
            <CalendarDays size={12} />
            {new Date(pesanan.tanggal_pesan).toLocaleString("id-ID", {
              day: "2-digit", 
              month: "short", 
              year: "numeric", 
              hour: "2-digit", 
              minute: "2-digit",
              timeZone: "Asia/Jakarta"
            })} WIB
          </div>
        </div>
        <div className="flex gap-2">
          <div className={`badge badge-sm py-3 px-3 text-[9px] font-black uppercase tracking-widest border-none ${pesanan.status_operasional === 'batal' ? 'bg-error/20 text-error' : 'bg-primary/20 text-primary'}`}>
            {pesanan.status_operasional.replace(/_/g, " ")}
          </div>
          <div className={`badge badge-sm py-3 px-3 text-[9px] font-black uppercase tracking-widest border-none ${pesanan.status_pembayaran === 'lunas' ? 'bg-success/20 text-success' : 'bg-warning/20 text-warning'}`}>
            {pesanan.status_pembayaran.replace(/_/g, " ")}
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {pesanan.pesanan_item?.map((item) => {
          // ==========================================
          // BERSIHKAN NAMA PRODUK DARI KODE SKU
          // ==========================================
          const cleanProductName = (item.nama_produk_snapshot || "")
            .replace(/^[A-Za-z]+-\d+-/, "")
            .replace(/-/g, " ");

          return (
            <div key={item.id} className="flex gap-4">
              
              <div className="relative w-16 h-16 overflow-hidden border shrink-0 bg-base-200 rounded-xl border-base-300">
                <Image
                  src="/favicon.ico"
                  alt={cleanProductName || "Produk"}
                  fill
                  className="object-cover"
                />
              </div>

              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-black truncate text-base-content capitalize">
                  {cleanProductName}
                </h4>
                
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] font-black text-primary bg-primary/10 px-2 py-0.5 rounded">
                    {item.jumlah} PCS
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-warning">
                    ⏳ {item.estimasi_pengerjaan_snapshot || "Reguler"}
                  </span>
                </div>

                {item.pesanan_item_finishing?.length ? (
                  <div className="mt-1.5 text-[9px] font-bold opacity-60 uppercase flex flex-wrap gap-1 leading-tight">
                    <span className="opacity-50">FINISHING:</span> 
                    
                    {item.pesanan_item_finishing.map((f, i, arr) => (
                      <span key={f.id} className="text-base-content">
                        {f.nama_finishing_snapshot}{i !== arr.length - 1 ? ' •' : ''}
                      </span>
                    ))}
                    
                  </div>
                ) : null}
              </div>
              
            </div>
          );
        })}
      </div>

      <div className="flex flex-col w-full gap-4 p-4 border-t border-base-200 bg-base-200/10 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1 space-y-1">
          <div className="flex flex-wrap items-center gap-3 text-[10px] font-bold opacity-60 uppercase tracking-widest">
            <span className="flex items-center gap-1"><Package size={12} /> {totalItem} Item</span>
            <span className="flex items-center gap-1"><Truck size={12} /> Rp {ongkir.toLocaleString("id-ID")}</span>
            {diskon > 0 && (
              <span className="flex items-center gap-1 text-error"><Ticket size={12} /> -Rp {diskon.toLocaleString("id-ID")}</span>
            )}
          </div>
          <div className="flex items-center gap-2 text-lg font-black tracking-tight text-base-content">
            <CreditCard size={18} className="text-primary" />
            Rp {totalTagihan.toLocaleString("id-ID")}
          </div>
        </div>

        <Link
          href={`/pesan/${pesanan.kode_transaksi}`}
          className="w-full shrink-0 sm:ml-auto font-black tracking-widest uppercase shadow-sm btn btn-primary sm:w-auto rounded-xl"
        >
          <Eye size={16} /> Lihat Detail
        </Link>

      </div>
    </div>
  );
}