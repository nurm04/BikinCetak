"use client";

import { Alamat } from "@/services/alamatService";
import { MapPin, Check } from "lucide-react";

interface UbahAlamatProps {
  isOpen: boolean;
  alamatList: Alamat[];
  selectedAlamatId?: string;
  onClose: () => void;
  onSelect: (alamat: Alamat) => void;
}

export default function UbahAlamat({
  isOpen,
  alamatList,
  selectedAlamatId,
  onClose,
  onSelect,
}: UbahAlamatProps) {
  if (!isOpen) return null;

  return (
    <dialog className="modal modal-open">
      <div className="modal-box max-w-2xl p-0 rounded-3xl overflow-hidden">

        <div className="p-6 border-b border-base-content/5">
          <h3 className="font-black text-xl uppercase tracking-tight">
            Pilih Alamat Pengiriman
          </h3>

          <p className="text-xs opacity-50 mt-1">
            Pilih alamat yang akan digunakan untuk pesanan ini.
          </p>
        </div>

        <div className="max-h-[60vh] overflow-y-auto">
          {alamatList.map((alamat) => {
            const isSelected =
              alamat.id_alamat === selectedAlamatId;

            return (
              <button
                key={alamat.id_alamat}
                type="button"
                onClick={() => {
                  onSelect(alamat);
                  onClose();
                }}
                className={`w-full text-left p-5 border-b border-base-content/5 hover:bg-base-200/50 transition ${
                  isSelected
                    ? "bg-primary/5"
                    : ""
                }`}
              >
                <div className="flex gap-4">

                  <div
                    className={`
                      w-10 h-10 rounded-xl shrink-0
                      flex items-center justify-center
                      ${
                        isSelected
                          ? "bg-primary text-primary-content"
                          : "bg-base-200"
                      }
                    `}
                  >
                    {isSelected ? (
                      <Check size={18} />
                    ) : (
                      <MapPin size={18} />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-black text-sm uppercase">
                        {alamat.label || "Alamat"}
                      </p>

                      {alamat.is_default && (
                        <span className="badge badge-primary badge-xs">
                          Utama
                        </span>
                      )}
                    </div>

                    <p className="text-xs font-bold mt-1">
                      {alamat.nama_penerima}
                      {" ("}
                      {alamat.no_hp}
                      {")"}
                    </p>

                    <p className="text-[11px] opacity-60 mt-1 leading-relaxed">
                      {alamat.alamat_lengkap},{" "}
                      {alamat.kecamatan},{" "}
                      {alamat.kota},{" "}
                      {alamat.provinsi}{" "}
                      {alamat.kode_pos}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="modal-action p-4 m-0 border-t border-base-content/5">
          <button
            onClick={onClose}
            className="btn btn-ghost"
          >
            Tutup
          </button>
        </div>
      </div>

      <div
        className="modal-backdrop"
        onClick={onClose}
      />
    </dialog>
  );
}