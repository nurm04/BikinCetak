"use client"; // Wajib karena pakai usePathname

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  Users, 
  UserCircle,
  LogOut 
} from "lucide-react";
import SwapTheme from "../ui/SwapTheme";
import Image from "next/image";

const SidebarAdmin = () => {
  const pathname = usePathname();

  const menus = [
    { label: "Beranda", icon: <LayoutDashboard size={18} />, href: "/dashboard" },
    { label: "Kasir / Order", icon: <ShoppingCart size={18} />, href: "/dashboard/orders" },
    { label: "Stok Bahan", icon: <Package size={18} />, href: "/dashboard/inventory" },
    { label: "Database Pelanggan", icon: <Users size={18} />, href: "/dashboard/customers" },
    { label: "Profil", icon: <UserCircle size={18} />, href: "/dashboard/profile" },
  ];
  
  return (
    <aside className="w-72 bg-base-100 border-r border-base-content/5 flex flex-col h-full">
      <div className="p-8 flex items-center justify-between">
        <Link href="/dashboard" className="text-2xl font-black tracking-tighter uppercase text-primary">
          BIKIN<span className="text-base-content">CETAK</span>
        </Link>
        
        <label htmlFor="my-drawer-2" className="lg:hidden btn btn-sm btn-circle btn-ghost">
           ✕
        </label>
      </div>

      <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
        {menus.map((menu) => {
          const isActive = pathname === menu.href;
          return (
            <Link 
              key={menu.href}
              href={menu.href} 
              onClick={() => document.getElementById('my-drawer-2')?.click()}
              className={`
                flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-200 group
                ${isActive 
                  ? "bg-primary text-primary-content shadow-lg shadow-primary/20" 
                  : "hover:bg-primary/10 hover:text-primary text-base-content/70"
                }
              `}
            >
              <span className={`${isActive ? "opacity-100" : "opacity-50 group-hover:opacity-100"}`}>
                {menu.icon}
              </span>
              <span className="text-xs font-bold uppercase tracking-widest">
                {menu.label}
              </span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 mt-auto border-t border-base-content/5 space-y-3">
        <Link 
          href="/dashboard/profile" 
          className={`flex items-center gap-3 p-3 rounded-2xl border transition-all ${
            pathname === "/dashboard/profile" 
            ? "border-primary bg-primary/5" 
            : "border-base-content/5 bg-base-200"
          }`}
        >
          <div className="avatar">
            <div className="w-10 h-10 rounded-xl relative overflow-hidden">
              <Image 
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=Nurm" 
                alt="User Profile" 
                width={40} 
                height={40} 
                unoptimized
              />
            </div>
          </div>
          <div className="overflow-hidden">
            <p className="text-[11px] font-black uppercase truncate">Kasir Nurm</p>
            <p className="text-[9px] font-bold opacity-50 uppercase tracking-tighter">Shift Pagi</p>
          </div>
        </Link>

        <div className="flex items-center justify-between px-4 py-2 bg-base-200 rounded-2xl border border-base-content/5">
          <span className="text-[9px] font-black uppercase opacity-40 tracking-widest">Theme</span>
          <SwapTheme />
        </div>

        <button className="btn btn-ghost btn-sm btn-block justify-start gap-4 rounded-xl text-error hover:bg-error/10 uppercase font-black text-[10px]">
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </aside>
  );
};

export default SidebarAdmin;