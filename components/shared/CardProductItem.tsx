import Image from "next/image";
import { Trash2, Plus, Minus } from "lucide-react";

interface JasaTambahan {
  item_code: string;
  price: number;
}

interface CartProductItemProps {
  id: number;
  variant_name: string;
  price: number; 
  qty: number;
  image_url?: string;
  jasa_tambahan?: JasaTambahan[];
  isReadOnly?: boolean; 
  isSelected?: boolean;
  onToggleSelect?: (id: number) => void;
  onUpdateQty?: (id: number, newQty: number) => void;
  onDelete?: (id: number) => void;
  isLoading?: boolean;
}

export default function CartProductItem({
  id,
  variant_name,
  price,
  qty,
  image_url,
  jasa_tambahan = [],
  isReadOnly = false,
  isSelected = false,
  onToggleSelect,
  onUpdateQty,
  onDelete,
  isLoading = false,
}: CartProductItemProps) {

	console.log(`Item ${variant_name}:`, jasa_tambahan);
  
  // Hitung total harga satuan (Dasar + Jasa)
  const totalJasa = jasa_tambahan.reduce((acc, j) => acc + j.price, 0);
  const unitPriceTotal = price + totalJasa;

  return (
    <div className={`py-6 flex flex-col sm:flex-row gap-6 items-start transition-all ${!isReadOnly && !isSelected ? "opacity-60" : "opacity-100"}`}>
      
      {/* 1. CHECKBOX */}
      {!isReadOnly && onToggleSelect && (
        <div className="pt-8 hidden sm:block">
          <input 
            type="checkbox" 
            className="checkbox checkbox-primary checkbox-sm rounded-lg" 
            checked={isSelected} 
            onChange={() => onToggleSelect(id)} 
          />
        </div>
      )}

      {/* 2. IMAGE */}
      <div className="relative w-24 h-24 rounded-2xl overflow-hidden bg-base-200 border border-base-content/5 shrink-0">
        <Image 
          src={image_url || "/images/placeholder-product.jpg"} 
          alt={variant_name} 
          fill 
          sizes="96px" 
          className="object-cover" 
        />
      </div>

      {/* 3. INFO PRODUK - TAMPILAN FIXED */}
      <div className="flex-1 space-y-1 min-w-0">
				<h3 className="font-black uppercase text-sm tracking-tight leading-tight truncate">
					{variant_name.split("-")[0]}
				</h3>
				
				<p className="text-xs font-bold text-primary">
					Rp {unitPriceTotal.toLocaleString("id-ID")} / pcs
				</p>
				
				<div className="mt-3">
          <div className="inline-block bg-base-300/50 px-4 py-2 rounded-xl border border-base-content/5">
            <p className="text-[10px] font-black uppercase tracking-tight leading-relaxed">
              {/* Varian Utama */}
              <span className="opacity-60">
                VARIAN: {variant_name.split("-").slice(1).join(" ") || "DEFAULT"}
              </span>
              
              {/* Jasa Tambahan - Pastikan mapping property-nya bener (jasa_tambahan) */}
              {jasa_tambahan && jasa_tambahan.length > 0 && (
                <span>
                  {jasa_tambahan.map((jasa, idx) => (
                    <span key={idx}>
                      <span className="mx-2 opacity-20"> | </span>
                      <span className="opacity-60">
                        {/* Split item_code jasa, ambil bagian belakangnya aja */}
                        {jasa.item_code.split("-").pop()?.replace(/_/g, " ")}
                      </span>
                    </span>
                  ))}
                </span>
              )}
            </p>
          </div>
        </div>
			</div>

      {/* 4. ACTIONS & TOTAL */}
      <div className="flex flex-row sm:flex-col justify-between items-center sm:items-end w-full sm:w-auto gap-4 shrink-0">
        
        {!isReadOnly ? (
          <div className="flex items-center bg-base-200 rounded-xl p-1">
            <button 
              onClick={() => onUpdateQty?.(id, qty - 1)} 
              disabled={isLoading || qty <= 1} 
              className="btn btn-ghost btn-xs btn-square"
            >
              <Minus size={12}/>
            </button>
            <span className="px-3 text-xs font-black w-8 text-center">
              {isLoading ? <span className="loading loading-spinner loading-xs"></span> : qty}
            </span>
            <button 
              onClick={() => onUpdateQty?.(id, qty + 1)} 
              disabled={isLoading} 
              className="btn btn-ghost btn-xs btn-square"
            >
              <Plus size={12}/>
            </button>
          </div>
        ) : (
          <div className="bg-base-200 px-3 py-1.5 rounded-lg text-[10px] font-black opacity-60 uppercase tracking-widest border border-base-content/5">
            {qty} Pcs
          </div>
        )}
        
        <div className="flex items-center gap-4">
          <p className="font-black text-sm text-primary">
            Rp {(unitPriceTotal * qty).toLocaleString("id-ID")}
          </p>
          
          {!isReadOnly && onDelete && (
            <button 
              onClick={() => onDelete(id)} 
              disabled={isLoading} 
              className="btn btn-ghost btn-xs text-error btn-square hover:bg-error/20"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}