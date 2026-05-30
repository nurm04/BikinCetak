import InventoryClient from "@/components/shared/InventoryClient";

async function fetchInventory() {
  // Simulasi fetch dari Golang API
  return [
    { 
      id: "1", 
      name: "Kertas Art Paper 150g A3+", 
      category: "Kertas", 
      stock: 450, 
      min_stock: 500, 
      unit: "Lembar", 
      image: "https://picsum.photos/seed/paper/200" 
    },
    { 
      id: "2", 
      name: "Tinta Cyan Ultra HD 1L", 
      category: "Tinta", 
      stock: 15, 
      min_stock: 5, 
      unit: "Liter", 
      image: "https://picsum.photos/seed/ink/200" 
    },
    { 
      id: "3", 
      name: "Mug Coating Putih SNI", 
      category: "Merchandise", 
      stock: 24, 
      min_stock: 50, 
      unit: "Pcs", 
      image: "https://picsum.photos/seed/mug/200" 
    },
  ];
}

export default async function InventoryPage() {
  const data = await fetchInventory();
  return <InventoryClient initialData={data} />;
}