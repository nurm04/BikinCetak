"use client";

import { useState } from "react";
import { Search, AlertTriangle, BellRing } from "lucide-react";
import Image from "next/image";

interface Item {
  id: string;
  name: string;
  category: string;
  stock: number;
  min_stock: number;
  unit: string;
  image: string;
}

export default function InventoryClient({ initialData }: { initialData: Item[] }) {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("Semua");

  const categories = ["Semua", "Kertas", "Tinta", "Merchandise"];

  const filteredItems = initialData.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
    const matchesTab = activeTab === "Semua" || item.category === activeTab;
    return matchesSearch && matchesTab;
  });

  return (
    <div className="space-y-8">
      {/* Header Kasir Area */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tighter">Informasi Stok</h1>
          <p className="text-[10px] font-bold opacity-40 uppercase tracking-[0.2em]">Hanya Lihat • Hubungi Gudang jika stok tidak akurat</p>
        </div>
        
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 opacity-20" size={20} />
          <input 
            type="text" 
            placeholder="Cari kertas, tinta, atau bahan..." 
            className="input input-bordered w-full pl-12 rounded-2xl bg-base-100 font-bold text-sm"
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Tabs Kategori Tetap Ada */}
      <div className="tabs tabs-boxed bg-transparent gap-2 p-0">
        {categories.map((cat) => (
          <button 
            key={cat}
            onClick={() => setActiveTab(cat)}
            className={`btn btn-sm rounded-xl uppercase font-black text-[10px] tracking-widest ${activeTab === cat ? 'btn-primary px-6' : 'btn-ghost opacity-50'}`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item) => {
          const isLow = item.stock <= item.min_stock;

          return (
            <div key={item.id} className="card bg-base-100 border border-base-content/5 shadow-sm rounded-[2.5rem] overflow-hidden group transition-all duration-300">
              <div className="p-6 space-y-6">
                <div className="flex justify-between items-start">
                  <div className="w-20 h-20 rounded-3xl relative overflow-hidden bg-base-200 border-4 border-base-200">
                    <Image 
                      src={item.image} 
                      alt={item.name} 
                      width={80} 
                      height={80} 
                      unoptimized
                      className="object-cover group-hover:scale-105 transition-transform duration-500" 
                    />
                  </div>
                  {isLow && (
                    <div className="badge badge-error gap-1 font-black text-[9px] uppercase p-3">
                      <AlertTriangle size={12} /> Hampir Habis
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <p className="text-[10px] font-black opacity-30 uppercase tracking-[0.2em]">{item.category}</p>
                  <h3 className="font-bold text-lg leading-tight uppercase tracking-tight line-clamp-2 h-14">{item.name}</h3>
                </div>

                <div className="bg-base-200/50 p-4 rounded-3xl space-y-3">
                  <div className="flex justify-between items-end">
                    <div>
                      <p className={`text-3xl font-black ${isLow ? 'text-error' : 'text-base-content'}`}>{item.stock}</p>
                      <p className="text-[10px] font-black opacity-40 uppercase leading-none">{item.unit} Tersedia</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-black opacity-40 uppercase italic">Status Stok</p>
                      <p className={`font-black text-[10px] uppercase ${isLow ? 'text-error' : 'text-success'}`}>
                        {isLow ? 'Jangan Terima Order' : 'Aman untuk Order'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                   {isLow && (
                     <button className="btn btn-outline btn-error btn-sm flex-1 rounded-2xl uppercase font-black text-[9px] gap-2 animate-pulse">
                        <BellRing size={14} /> Lapor Gudang
                     </button>
                   )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}