import Sidebar from "@/components/layouts/Sidebar";
import { Menu } from "lucide-react"; // Import icon hamburger

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="drawer lg:drawer-open min-h-screen bg-base-200">
      <input id="my-drawer-2" type="checkbox" className="drawer-toggle" />
      
      <div className="drawer-content flex flex-col">
        <header className="h-20 bg-base-100/50 backdrop-blur-md border-b border-base-content/5 flex items-center justify-between lg:justify-end px-4 lg:px-8 sticky top-0 z-10">
          
          <label htmlFor="my-drawer-2" className="btn btn-ghost lg:hidden">
            <Menu size={24} />
          </label>

          <div className="flex items-center gap-4">
             <div className="badge badge-success gap-2 font-bold p-3 text-[10px] uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                Server ERP Online
             </div>
          </div>
        </header>

        <main className="p-4 lg:p-8">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div> 

      <div className="drawer-side z-20">
        <label htmlFor="my-drawer-2" aria-label="close sidebar" className="drawer-overlay"></label>
        <Sidebar />
      </div>
    </div>
  );
}