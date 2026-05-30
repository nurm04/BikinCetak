"use client";

import { useState } from "react";
import { Filter, ChevronLeft, ChevronRight, Eye, Banknote, Truck, CheckCircle2, AlertCircle } from "lucide-react";
import Link from "next/link";

export interface Order {
  id: string;
  customer: string;
  product: string;
  total: number;
  total_paid: number;
  status: "Draft" | "To Bill" | "To Deliver" | "Completed" | "Cancelled";
  payment_status: "Unpaid" | "Partially Paid" | "Paid";
  date: string;
}

export default function OrderTableClient({ initialData }: { initialData: Order[] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("Semua");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const filteredOrders = initialData.filter((order) => {
    const matchesSearch = order.customer.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          order.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "Semua" || order.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredOrders.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);

  const getWorkflowStyle = (status: string) => {
    switch (status) {
      case "To Bill": return "badge-warning";
      case "To Deliver": return "badge-info text-white";
      case "Completed": return "badge-success";
      case "Draft": return "badge-ghost";
      default: return "badge-error";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tighter">Sales Orders Ledger</h1>
          <p className="text-[10px] font-bold opacity-40 uppercase tracking-[0.2em]">Monitoring Tagihan & Pengiriman</p>
        </div>
        
        <div className="flex gap-2 w-full md:w-auto">
          <input 
            type="text"   
            placeholder="Cari Pesanan..." 
            className="input input-bordered w-full md:w-64 rounded-2xl bg-base-100 font-bold text-xs"
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
          />
          <div className="dropdown dropdown-end">
            <div tabIndex={0} role="button" className="btn btn-square btn-bordered rounded-2xl bg-base-100"><Filter size={18} /></div>
            <ul tabIndex={0} className="dropdown-content z-10 menu p-2 shadow-xl bg-base-100 rounded-2xl w-52 mt-2 border border-base-content/5">
              <li className="menu-title uppercase text-[10px] font-black opacity-40">Status Dokumen</li>
              {["Semua", "Draft", "To Bill", "To Deliver", "Completed"].map((s) => (
                <li key={s}><a onClick={() => setFilterStatus(s)} className="text-xs font-bold uppercase">{s}</a></li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="bg-base-100 border border-base-content/5 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="table table-zebra w-full text-xs">
            <thead className="bg-base-200/50 uppercase text-[10px] font-black">
              <tr>
                <th className="pl-8">ID / Dokumen</th>
                <th>Pelanggan</th>
                <th>Status Bayar</th>
                <th>Outstanding</th>
                <th className="text-center">Workflow</th>
                <th className="text-center">Aksi Kasir</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((order) => {
                const outstanding = order.total - order.total_paid;
                return (
                  <tr key={order.id} className="hover:bg-primary/5 transition-colors">
                    <td className="pl-8 py-4">
                      <p className="font-black text-primary tracking-tighter">{order.id}</p>
                      <p className="opacity-40 font-bold text-[9px] uppercase">{order.date}</p>
                    </td>
                    <td className="font-bold uppercase">{order.customer}</td>
                    <td>
                      <div className={`flex items-center gap-1 font-black uppercase text-[10px] ${order.payment_status === 'Paid' ? 'text-success' : 'text-error'}`}>
                        {order.payment_status === 'Paid' ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                        {order.payment_status}
                      </div>
                    </td>
                    <td className="font-black" suppressHydrationWarning>
                      {outstanding > 0 ? (
                        <span className="text-error">Rp {outstanding.toLocaleString("id-ID")}</span>
                      ) : (
                        <span className="opacity-20">-</span>
                      )}
                    </td>
                    <td className="text-center">
                      <span className={`badge ${getWorkflowStyle(order.status)} badge-sm font-black uppercase text-[9px] p-2.5`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="text-center">
                      <div className="flex justify-center gap-2">
                        {order.status === "Draft" && (
                          <button className="btn btn-success btn-xs rounded-xl font-black uppercase text-[9px] gap-1 px-3">
                            <CheckCircle2 size={12} /> Approve
                          </button>
                        )}
                        {order.status !== "Draft" && order.payment_status !== "Paid" && (
                          <Link href={`/dashboard/orders/${order.id}/bayar`} className="btn btn-warning btn-xs rounded-xl font-black uppercase text-[9px] gap-1 px-3">
                            <Banknote size={12} /> Bayar
                          </Link>
                        )}
                        {order.status === "To Deliver" && (
                          <button className="btn btn-info btn-xs rounded-xl font-black uppercase text-[9px] gap-1 px-3 text-white">
                            <Truck size={12} /> Kirim
                          </button>
                        )}
                        <Link href={`/dashboard/orders/${order.id}`} className="btn btn-ghost btn-xs btn-circle hover:bg-primary/10 transition-colors">
                          <Eye size={16} className="text-primary" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="p-4 bg-base-200/30 border-t border-base-content/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[10px] font-bold uppercase opacity-50">
            Menampilkan {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, filteredOrders.length)} dari {filteredOrders.length} Pesanan
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