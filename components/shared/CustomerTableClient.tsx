"use client";

import { useState } from "react";
import { Search, Mail, Phone, UserPlus, Star, History, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  total_orders: number;
  total_spent: number;
  image: string;
}

export default function CustomerTableClient({ initialData }: { initialData: Customer[] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Logic Filter & Search (Nama, Email, atau HP)
  const filteredCustomers = initialData.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone.includes(searchTerm)
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredCustomers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tighter">Database Pelanggan</h1>
          <p className="text-[10px] font-bold opacity-40 uppercase tracking-[0.2em]">Manajemen Loyalitas & Member</p>
        </div>
        
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30" size={18} />
            <input 
              type="text" 
              placeholder="Nama, Email, atau HP..." 
              className="input input-bordered w-full pl-12 rounded-2xl bg-base-100 font-bold text-xs"
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            />
          </div>
          <button className="btn btn-primary rounded-2xl gap-2 uppercase font-black text-xs shadow-lg shadow-primary/20">
            <UserPlus size={18} /> Tambah Member
          </button>
        </div>
      </div>

      <div className="bg-base-100 border border-base-content/5 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="table table-zebra w-full text-xs">
            <thead className="bg-base-200/50 uppercase text-[10px] font-black">
              <tr>
                <th className="pl-8 py-4">Profil Pelanggan</th>
                <th>Kontak</th>
                <th className="text-center">Total Order</th>
                <th>Total Belanja</th>
                <th className="text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((c) => {
                const isLoyal = c.total_orders >= 10;
                return (
                  <tr key={c.id} className="hover:bg-primary/5 transition-colors">
                    <td className="pl-8 py-4">
                      <div className="flex items-center gap-4">
                        <div className="avatar">
                          <div className={`w-10 h-10 rounded-xl relative overflow-hidden bg-base-300 border-2 ${isLoyal ? 'border-warning' : 'border-transparent'}`}>
                            <Image 
                              src={c.image} 
                              alt={c.name} 
                              width={40} 
                              height={40} 
                              unoptimized 
                              className="object-cover"
                            />
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-black uppercase tracking-tight">{c.name}</p>
                            {isLoyal && <Star size={12} className="fill-warning text-warning" />}
                          </div>
                          <p className="text-[9px] opacity-40 font-bold uppercase tracking-widest">{c.id}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 opacity-60">
                          <Mail size={12} className="text-primary" /> {c.email}
                        </div>
                        <div className="flex items-center gap-2 opacity-60 font-bold">
                          <Phone size={12} className="text-primary" /> {c.phone}
                        </div>
                      </div>
                    </td>
                    <td className="text-center">
                      <div className="badge badge-ghost font-black text-[10px] uppercase p-2.5">
                        {c.total_orders} Order
                      </div>
                    </td>
                    <td className="font-black text-primary italic" suppressHydrationWarning>
                      Rp {c.total_spent.toLocaleString("id-ID")}
                    </td>
                    <td className="text-center">
                      <div className="flex justify-center gap-2">
                        <button title="Lihat Riwayat" className="btn btn-ghost btn-xs rounded-lg hover:bg-primary hover:text-white transition-all">
                          <History size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination - Identik dengan OrderTableClient */}
        <div className="p-4 bg-base-200/30 border-t border-base-content/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[10px] font-bold uppercase opacity-50">
            Menampilkan {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, filteredCustomers.length)} dari {filteredCustomers.length} Pelanggan
          </p>
          
          <div className="join shadow-sm border border-base-content/10">
            <button 
              className="btn btn-sm join-item bg-base-100 hover:bg-primary hover:text-white transition-colors"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => prev - 1)}
            >
              <ChevronLeft size={16} />
            </button>
            
            <button className="btn btn-sm join-item bg-base-100 pointer-events-none font-black text-xs px-6">
              Halaman {currentPage} / {totalPages || 1}
            </button>
            
            <button 
              className="btn btn-sm join-item bg-base-100 hover:bg-primary hover:text-white transition-colors"
              disabled={currentPage === totalPages || totalPages === 0}
              onClick={() => setCurrentPage(prev => prev + 1)}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}