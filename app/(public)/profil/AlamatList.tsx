"use client";

import Link from "next/link";
import { Alamat, deleteAlamat, setDefaultAlamat } from "@/services/alamatService";
import { MapPin } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AddressList({
  daftarAlamat,
}: {
  daftarAlamat: Alamat[];
}) {
  const router = useRouter();
  const handleSetDefault = async (id: string) => {
    const res = await setDefaultAlamat(id);

    if (res.success) {
      router.refresh();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus alamat ini?")) return;

    const res = await deleteAlamat(id);

    if (res.success) {
      router.refresh();
    }
  };

  if (daftarAlamat.length === 0) {
    return (
      <div className="p-16 text-center opacity-30 italic text-sm font-black">
        Belum ada alamat yang tersimpan.
      </div>
    );
  }

  return (
    <div className="divide-y divide-base-content/5">
      {daftarAlamat.map((item) => (
        <div key={item.id_alamat} className="p-6 hover:bg-base-200/20 transition-colors">
          <div className="flex justify-between gap-4">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-xs font-black uppercase tracking-tight">
                  {item.label || "Alamat"}
                </p>

                {item.is_default ? (
                  <span className="badge badge-success badge-sm text-white">
                    Utama
                  </span>
                ) : null}
              </div>

              <p className="text-xs opacity-70 mt-2 leading-relaxed">
                {item.alamat_lengkap}
              </p>

              <p className="text-[10px] font-bold opacity-50 mt-2 uppercase tracking-wide">
                {item.kecamatan}, {item.kota}, {item.provinsi}{" "}
                {item.kode_pos}
              </p>

              <p className="text-[10px] font-bold opacity-60 mt-2">
                {item.nama_penerima || "-"} • {item.no_hp || "-"}
              </p>
            </div>
            <MapPin
              size={18}
              className="opacity-20 shrink-0 mt-1"
            />
          </div>

          <div className="flex flex-wrap gap-2 mt-5">
            {!item.is_default && (
              <button className="btn btn-success btn-xs text-white" onClick={() => handleSetDefault(item.id_alamat)}>
                Jadikan Utama
              </button>
            )}
            <Link href={`/profil/alamat/edit/${item.id_alamat}`} className="btn btn-warning btn-xs">
              Edit
            </Link>
            <button className="btn btn-error btn-xs text-white" onClick={() => handleDelete(item.id_alamat)}>
              Hapus
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}