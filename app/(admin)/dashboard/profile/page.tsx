import Image from "next/image";
import { User, Mail, ShieldCheck, KeyRound, Save } from "lucide-react";

export default function Profile() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div className="flex flex-col items-center gap-4 py-6">
        <div className="avatar">
          <div className="w-28 h-28 rounded-[2.5rem] border-4 border-primary shadow-2xl relative overflow-hidden bg-base-300">
            <Image 
              src="https://api.dicebear.com/7.x/avataaars/svg?seed=Nurm" 
              alt="Profil Nurm" 
              width={112} 
              height={112} 
              unoptimized 
              priority
              className="object-cover"
            />
          </div>
        </div>
        <div className="text-center">
          <h1 className="text-3xl font-black uppercase tracking-tighter">Nurm</h1>
          <div className="flex items-center gap-2 justify-center mt-1">
            <span className="badge badge-outline font-black uppercase text-[9px] p-3 opacity-50">Shift Pagi</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <div className="card bg-base-100 border border-base-content/5 shadow-sm rounded-lg p-8">
            <div className="flex items-center gap-3 mb-6">
              <User className="text-primary" size={20} />
              <h2 className="font-black uppercase text-sm tracking-widest">Informasi Personal</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="form-control w-full">
                <label className="label uppercase font-black text-[10px] opacity-40">Nama Lengkap</label>
                <input type="text" defaultValue="Nurm" className="input input-bordered rounded-2xl font-bold bg-base-200/50 border-none" />
              </div>
              <div className="form-control w-full">
                <label className="label uppercase font-black text-[10px] opacity-40">Username</label>
                <input type="text" defaultValue="nurm_admin" className="input input-bordered rounded-2xl font-bold bg-base-200/50 border-none" />
              </div>
              <div className="form-control w-full md:col-span-2">
                <label className="label uppercase font-black text-[10px] opacity-40">Email Percetakan</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 opacity-20" size={18} />
                  <input type="email" defaultValue="nurm@bikincetak.com" className="input input-bordered w-full pl-12 rounded-2xl font-bold bg-base-200/50 border-none" />
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <button className="btn btn-primary rounded-2xl px-8 uppercase font-black text-xs gap-2">
                <Save size={16} /> Simpan Perubahan
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card bg-base-100 border border-base-content/5 shadow-sm rounded-lg p-8 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="p-4 bg-primary/10 text-primary rounded-2xl">
                <ShieldCheck size={32} />
              </div>
              <div>
                <h2 className="font-black uppercase text-sm">Keamanan Akun</h2>
                <p className="text-[10px] opacity-50 font-bold uppercase mt-1">Terakhir diganti: 2 bulan lalu</p>
              </div>
              <button className="btn btn-outline btn-block rounded-2xl uppercase font-black text-xs gap-2">
                <KeyRound size={16} /> Ganti Password
              </button>
            </div>
          </div>

          <div className="card bg-error/5 border border-error/10 rounded-lg p-6">
            <p className="text-[10px] font-black uppercase text-error opacity-70 mb-2">Zona Bahaya</p>
            <button className="btn btn-error btn-ghost btn-block btn-sm rounded-xl uppercase font-black text-[10px]">
              Nonaktifkan Akun
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}