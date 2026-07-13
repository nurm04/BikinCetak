"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MapPin } from "lucide-react";

import FormInput from "@/components/ui/FormInput";
import FormTextarea from "@/components/ui/FormTextarea";
import FormSelect from "@/components/ui/FormSelect"; // Sesuaikan path import lu
import AlertPopup from "@/components/ui/AlertPopup";
import {
  Alamat,
  AlamatPayload,
  updateAlamat,
  getProvinces,
  getCities,
  getDistricts,
} from "@/services/alamatService";

interface EditAlamatFormProps {
  initialData: Alamat;
}

interface RegionOption {
  id: string;
  name: string;
}

// Helper Normalisasi API (Strict Type)
const normalizeData = (responsePayload: unknown): RegionOption[] => {
  let results: Record<string, unknown>[] = [];

  if (Array.isArray(responsePayload)) {
    results = responsePayload as Record<string, unknown>[];
  } else if (responsePayload && typeof responsePayload === "object") {
    const payload = responsePayload as Record<string, unknown>;
    if (Array.isArray(payload.data)) {
      results = payload.data as Record<string, unknown>[];
    } else if (
      payload.rajaongkir &&
      typeof payload.rajaongkir === "object" &&
      Array.isArray((payload.rajaongkir as Record<string, unknown>).results)
    ) {
      results = (payload.rajaongkir as Record<string, unknown>).results as Record<string, unknown>[];
    } else if (Array.isArray(payload.results)) {
      results = payload.results as Record<string, unknown>[];
    }
  }

  if (!Array.isArray(results)) return [];

  return results.map((item) => {
    const type = typeof item.type === "string" ? item.type : "";
    const cityName = typeof item.city_name === "string" ? item.city_name : "";
    const namaKota = cityName ? `${type} ${cityName}`.trim() : null;

    const itemId = item.id || item.province_id || item.city_id || item.subdistrict_id || item.district_id;
    const itemName = item.name || item.province || namaKota || item.district_name || item.subdistrict_name || item.label;

    return {
      id: String(itemId || ""),
      name: String(itemName || ""),
    };
  });
};

export default function EditAlamatForm({ initialData }: EditAlamatFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // State Wilayah
  const [listProvinsi, setListProvinsi] = useState<RegionOption[]>([]);
  const [listKota, setListKota] = useState<RegionOption[]>([]);
  const [listKecamatan, setListKecamatan] = useState<RegionOption[]>([]);

  // State Loading Detail
  const [loadingProv, setLoadingProv] = useState(false);
  const [loadingCity, setLoadingCity] = useState(false);
  const [loadingDist, setLoadingDist] = useState(false);

  const [popup, setPopup] = useState({
    isOpen: false, title: "", message: "",
    type: "info" as "success" | "error" | "warning" | "info",
  });

  const [form, setForm] = useState({
    label: initialData.label ?? "",
    nama_penerima: initialData.nama_penerima,
    no_hp: initialData.no_hp,
    
    provinsi_id: initialData.provinsi_id,
    kota_id: initialData.kota_id,
    kecamatan_id: initialData.kecamatan_id,

    provinsi: initialData.provinsi,
    kota: initialData.kota,
    kecamatan: initialData.kecamatan,
    
    kode_pos: initialData.kode_pos,
    alamat_lengkap: initialData.alamat_lengkap,
    is_default: initialData.is_default,
  });

  // Fetch Awal Saat Edit
  useEffect(() => {
    const fetchInitialData = async () => {
      setLoadingProv(true);
      const provRes = await getProvinces();
      setListProvinsi(normalizeData(provRes));
      setLoadingProv(false);

      if (initialData.provinsi_id) {
        setLoadingCity(true);
        const cityRes = await getCities(initialData.provinsi_id);
        setListKota(normalizeData(cityRes));
        setLoadingCity(false);
      }

      if (initialData.kota_id) {
        setLoadingDist(true);
        const distRes = await getDistricts(initialData.kota_id);
        setListKecamatan(normalizeData(distRes));
        setLoadingDist(false);
      }
    };

    fetchInitialData();
  }, [initialData]);

  // Handler Input Biasa
  const handleChange = (name: string, value: string) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Handler Select Wilayah Berjenjang
  const handleRegionChange = async (name: string, value: string) => {
    if (name === "provinsi_id") {
      const selectedOpt = listProvinsi.find((p) => p.id === value);
      setForm((prev) => ({
        ...prev,
        provinsi_id: value,
        provinsi: selectedOpt ? selectedOpt.name : "",
        kota_id: "", kota: "",
        kecamatan_id: "", kecamatan: "",
      }));
      setListKota([]);
      setListKecamatan([]);

      if (value) {
        setLoadingCity(true);
        const cityRes = await getCities(value);
        setListKota(normalizeData(cityRes));
        setLoadingCity(false);
      }
    } else if (name === "kota_id") {
      const selectedOpt = listKota.find((p) => p.id === value);
      setForm((prev) => ({
        ...prev,
        kota_id: value,
        kota: selectedOpt ? selectedOpt.name : "",
        kecamatan_id: "", kecamatan: "",
      }));
      setListKecamatan([]);

      if (value) {
        setLoadingDist(true);
        const distRes = await getDistricts(value);
        setListKecamatan(normalizeData(distRes));
        setLoadingDist(false);
      }
    } else if (name === "kecamatan_id") {
      const selectedOpt = listKecamatan.find((p) => p.id === value);
      setForm((prev) => ({
        ...prev,
        kecamatan_id: value,
        kecamatan: selectedOpt ? selectedOpt.name : "",
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!form.provinsi_id || !form.kota_id || !form.kecamatan_id) {
      setPopup({ isOpen: true, title: "Data Belum Lengkap", message: "Pastikan Anda telah memilih Provinsi, Kota, dan Kecamatan dari opsi dropdown.", type: "warning" });
      return;
    }

    setLoading(true);

    const payload: AlamatPayload = {
      label: form.label,
      nama_penerima: form.nama_penerima,
      no_hp: form.no_hp,
      provinsi_id: form.provinsi_id,
      provinsi: form.provinsi,
      kota_id: form.kota_id,
      kota: form.kota,
      kecamatan_id: form.kecamatan_id,
      kecamatan: form.kecamatan,
      kode_pos: form.kode_pos,
      alamat_lengkap: form.alamat_lengkap,
      is_default: form.is_default,
    };

    const res = await updateAlamat(initialData.id_alamat, payload);

    if (res.success) {
      setPopup({ isOpen: true, title: "Berhasil", message: "Alamat berhasil diperbarui.", type: "success" });
      setTimeout(() => {
        router.push("/profil");
        router.refresh();
      }, 1500);
    } else {
      setPopup({ isOpen: true, title: "Gagal", message: res.error || "Terjadi kesalahan.", type: "error" });
    }
    setLoading(false);
  };

  return (
    <>
      <AlertPopup
        isOpen={popup.isOpen} title={popup.title} message={popup.message} type={popup.type}
        onCancel={() => setPopup((prev) => ({ ...prev, isOpen: false }))}
      />

      <form onSubmit={handleSubmit} className="p-8 border shadow-sm card bg-base-100 border-base-content/5">
        <div className="flex items-center gap-3 mb-8">
          <MapPin size={20} className="text-primary" />
          <h2 className="text-sm font-black tracking-widest uppercase">
            Edit Alamat
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <FormInput label="Label Alamat" name="label" value={form.label ?? ""} onChange={handleChange} />
          <FormInput label="Nama Penerima" name="nama_penerima" value={form.nama_penerima} onChange={handleChange} />
          <FormInput label="Nomor HP" name="no_hp" value={form.no_hp} onChange={handleChange} />
          <FormInput label="Kode Pos" name="kode_pos" value={form.kode_pos} onChange={handleChange} />

          <FormSelect
            label="Provinsi"
            name="provinsi_id"
            value={form.provinsi_id}
            options={listProvinsi.map(p => ({ value: p.id, label: p.name }))}
            onChange={handleRegionChange}
            loading={loadingProv}
          />

          <FormSelect
            label="Kota / Kabupaten"
            name="kota_id"
            value={form.kota_id}
            options={listKota.map(c => ({ value: c.id, label: c.name }))}
            onChange={handleRegionChange}
            disabled={!form.provinsi_id}
            loading={loadingCity}
          />

          <FormSelect
            label="Kecamatan"
            name="kecamatan_id"
            value={form.kecamatan_id}
            options={listKecamatan.map(k => ({ value: k.id, label: k.name }))}
            onChange={handleRegionChange}
            disabled={!form.kota_id}
            loading={loadingDist}
          />

          <div className="md:col-span-2 mt-2">
            <FormTextarea label="Alamat Lengkap (Jalan, RT/RW, Patokan)" name="alamat_lengkap" value={form.alamat_lengkap} onChange={handleChange} />
          </div>

          <div className="md:col-span-2">
            <label className="flex items-center gap-3 w-fit cursor-pointer">
              <input
                type="checkbox"
                className="rounded-md checkbox checkbox-primary checkbox-sm"
                checked={form.is_default}
                onChange={(e) => setForm((prev) => ({ ...prev, is_default: e.target.checked }))}
              />
              <span className="text-sm font-bold">Jadikan alamat utama (Default)</span>
            </label>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="h-14 mt-10 font-black tracking-widest uppercase rounded-xl btn btn-primary w-full md:w-auto px-10 shadow-lg shadow-primary/20"
        >
          {loading ? <span className="loading loading-spinner" /> : "Simpan Perubahan Alamat"}
        </button>
      </form>
    </>
  );
}