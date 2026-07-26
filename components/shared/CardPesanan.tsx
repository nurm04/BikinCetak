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
import { Pesanan } from "@/services/pesanService";

interface Props {
  pesanan: Pesanan;
}

export default function CardPesanan({ pesanan }: Props) {
  const totalItem = pesanan.pesanan_item?.reduce((sum, item) => sum + (Number(item.jumlah) || 0), 0) ?? 0;

  const ongkir = Number(pesanan.harga_ongkir || 0);
  const diskon = Number(pesanan.diskon_voucher_nominal || 0);

  const totalTagihan = Number(pesanan.total_tagihan || 0);

  return (
    <div className="flex flex-col overflow-hidden transition-all bg-base-100 border border-base-300 rounded-3xl hover:border-primary/50 hover:shadow-md">
      
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 border-b bg-base-200/30 border-base-200">
        <div>
          <h3 className="text-xs font-black tracking-widest text-primary uppercase">{pesanan.id_pesan}</h3>
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
        {pesanan.pesanan_item?.map((item) => (
          <div key={item.id} className="flex gap-4">
            
            <div className="relative w-16 h-16 overflow-hidden border shrink-0 bg-base-200 rounded-xl border-base-300">
              <Image
                src="/favicon.ico"
                alt={item.nama_produk_snapshot || "Produk"}
                fill
                className="object-cover"
              />
            </div>

            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-black truncate text-base-content">
                {item.nama_produk_snapshot}
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
        ))}
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