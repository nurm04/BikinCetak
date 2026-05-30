// @/lib/data.tsx
export interface FormField {
  label: string;
  name: string; // Attribute di ERPNext
  type: "select" | "number" | "text" | "textarea";
  options?: string[];
}

export interface ProductItem {
  name: string;
  item_code_template: string; // Link ke Item Template ERPNext
  price: string;
  image: string; // Image spesifik produk
  fields: FormField[];
}

export interface Category {
  key: string;
  label: string;
  item_group: string; // Linked ke Item Group ERPNext
  image: string;
  submenu: ProductItem[];
}

export const PRODUCT_CATEGORIES: Category[] = [
  {
    key: "sticker",
    label: "Cetak Sticker",
    item_group: "Sticker",
    image: "https://img.daisyui.com/images/stock/photo-1625726411847-8cbb60cc71e6.webp",
    submenu: [
      {
        name: "Sticker Label Kemasan",
        item_code_template: "STK-LBL-001",
        price: "Rp 15.000",
        image: "https://picsum.photos/seed/label/600/600",
        fields: [
          { label: "Bahan", name: "material", type: "select", options: ["Vinyl White", "Chromo", "Transparan"] },
          { label: "Laminasi", name: "finishing", type: "select", options: ["Glossy", "Doff", "Tanpa Laminasi"] },
          { label: "Cutting", name: "cutting", type: "select", options: ["Kiss Cut", "Die Cut"] },
          { label: "Jumlah (Lembar)", name: "qty", type: "number" }
        ]
      },
      {
        name: "Sticker A3 Plus",
        item_code_template: "STK-A3-001",
        price: "Rp 10.000",
        image: "https://picsum.photos/seed/a3/600/600",
        fields: [
          { label: "Bahan", name: "material", type: "select", options: ["Vinyl White", "Chromo", "HVS Sticker"] },
          { label: "Laminasi", name: "finishing", type: "select", options: ["Glossy", "Doff"] },
          { label: "Jumlah", name: "qty", type: "number" }
        ]
      },
      {
        name: "Sticker Meteran",
        item_code_template: "STK-MTR-001",
        price: "Rp 65.000",
        image: "https://picsum.photos/seed/meter/600/600",
        fields: [
          { label: "Bahan", name: "material", type: "select", options: ["Ritrama", "Orajet", "China"] },
          { label: "Lebar (cm)", name: "width", type: "number" },
          { label: "Panjang (cm)", name: "length", type: "number" }
        ]
      },
      {
        name: "Sticker Cutting Vinyl",
        item_code_template: "STK-CUT-001",
        price: "Rp 25.000",
        image: "https://picsum.photos/seed/vinyl/600/600",
        fields: [
          { label: "Warna Bahan", name: "color", type: "select", options: ["Hitam", "Putih", "Merah", "Kuning"] },
          { label: "Jumlah", name: "qty", type: "number" }
        ]
      },
      {
        name: "Sticker Transparan",
        item_code_template: "STK-TRP-001",
        price: "Rp 12.000",
        image: "https://picsum.photos/seed/trans/600/600",
        fields: [
          { label: "Laminasi", name: "finishing", type: "select", options: ["Tanpa Laminasi", "Glossy"] },
          { label: "Jumlah", name: "qty", type: "number" }
        ]
      }
    ]
  },
  {
    key: "digital-print",
    label: "Digital Print & Doc",
    item_group: "Digital Print",
    image: "https://img.daisyui.com/images/stock/photo-1609621838510-5ad474b7d25d.webp",
    submenu: [
      {
        name: "Print A0 - A4",
        item_code_template: "PRNT-DOC-001",
        price: "Rp 2.000",
        image: "https://picsum.photos/seed/print/600/600",
        fields: [
          { label: "Ukuran", name: "size", type: "select", options: ["A4", "A3", "A2", "A1", "A0"] },
          { label: "Warna", name: "color_mode", type: "select", options: ["Full Color", "Hitam Putih"] },
          { label: "Jumlah Lembar", name: "qty", type: "number" }
        ]
      },
      {
        name: "Scan & Copy Highres",
        item_code_template: "SCAN-DOC-001",
        price: "Rp 5.000",
        image: "https://picsum.photos/seed/scan/600/600",
        fields: [
          { label: "Resolusi", name: "dpi", type: "select", options: ["300 DPI", "600 DPI"] },
          { label: "Format", name: "format", type: "select", options: ["PDF", "JPG"] }
        ]
      },
      {
        name: "Print Laser A3+",
        item_code_template: "PRNT-LSR-001",
        price: "Rp 5.000",
        image: "https://picsum.photos/seed/laser/600/600",
        fields: [
          { label: "Bahan", name: "paper_type", type: "select", options: ["Art Paper 150g", "Art Carton 260g", "HVS 100g"] },
          { label: "Sisi Cetak", name: "side", type: "select", options: ["1 Sisi", "2 Sisi"] },
          { label: "Jumlah", name: "qty", type: "number" }
        ]
      },
      {
        name: "Sertifikat",
        item_code_template: "CERT-001",
        price: "Rp 7.500",
        image: "https://picsum.photos/seed/cert/600/600",
        fields: [
          { label: "Bahan", name: "paper_type", type: "select", options: ["Linen", "BW", "Concorde"] },
          { label: "Data Variabel", name: "variable", type: "select", options: ["Tanpa Nama", "Pakai List Nama"] }
        ]
      }
    ]
  },
  {
    key: "promosi",
    label: "Media Promosi",
    item_group: "Promosi",
    image: "https://img.daisyui.com/images/stock/photo-1414694762283-acccc27bca85.webp",
    submenu: [
      {
        name: "Roll Banner",
        item_code_template: "BNR-ROLL-001",
        price: "Rp 185.000",
        image: "https://picsum.photos/seed/roll/600/600",
        fields: [
          { label: "Ukuran", name: "size", type: "select", options: ["60x160cm", "85x200cm"] },
          { label: "Bahan", name: "material", type: "select", options: ["Albatros", "Flexi China", "Flexi Korea"] },
          { label: "Laminasi", name: "finishing", type: "select", options: ["Doff", "Glossy"] }
        ]
      },
      {
        name: "X & Y Banner",
        item_code_template: "BNR-XY-001",
        price: "Rp 85.000",
        image: "https://picsum.photos/seed/xbanner/600/600",
        fields: [
          { label: "Tipe Stand", name: "stand_type", type: "select", options: ["X-Banner", "Y-Banner"] },
          { label: "Bahan", name: "material", type: "select", options: ["Flexi China", "Albatros"] }
        ]
      }
    ]
  },
  {
    key: "merchandise-kalender",
    label: "Souvenir & Kalender",
    item_group: "Merchandise",
    image: "https://picsum.photos/seed/merchandise/600/400",
    submenu: [
      {
        name: "Mug & Gelas",
        item_code_template: "MUG-001",
        price: "Rp 25.000",
        image: "https://picsum.photos/seed/mug/600/600",
        fields: [
          { label: "Jenis Mug", name: "mug_type", type: "select", options: ["Putih Standar", "Bunglon", "Dalam Warna"] },
          { label: "Jumlah", name: "qty", type: "number" }
        ]
      },
      {
        name: "Gantungan Kunci",
        item_code_template: "GK-001",
        price: "Rp 5.000",
        image: "https://picsum.photos/seed/key/600/600",
        fields: [
          { label: "Bahan", name: "material", type: "select", options: ["Akrilik", "Karet", "Pin"] },
          { label: "Sisi", name: "side", type: "select", options: ["1 Sisi", "2 Sisi"] }
        ]
      },
      {
        name: "Kalender Meja",
        item_code_template: "CAL-DESK-001",
        price: "Rp 35.000",
        image: "https://picsum.photos/seed/cal/600/600",
        fields: [
          { label: "Jumlah Lembar", name: "pages", type: "select", options: ["7 Lembar", "13 Lembar"] },
          { label: "Bahan Dudukan", name: "stand_material", type: "select", options: ["Hardboard Linan", "Art Carton"] }
        ]
      }
    ]
  },
  {
    key: "stationery",
    label: "Office Stationery",
    item_group: "Stationery",
    image: "https://picsum.photos/seed/office/600/400",
    submenu: [
      {
        name: "Kartu Nama",
        item_code_template: "BC-001",
        price: "Rp 35.000",
        image: "https://picsum.photos/seed/bizcard/600/600",
        fields: [
          { label: "Bahan", name: "material", type: "select", options: ["Art Carton 260g", "BW", "Linen"] },
          { label: "Laminasi", name: "finishing", type: "select", options: ["Tanpa Laminasi", "Doff", "Glossy"] },
          { label: "Jumlah (Box)", name: "qty", type: "number" }
        ]
      },
      {
        name: "Stempel Otomatis",
        item_code_template: "STMP-001",
        price: "Rp 65.000",
        image: "https://picsum.photos/seed/stamp/600/600",
        fields: [
          { label: "Ukuran", name: "size_type", type: "select", options: ["Kecil", "Standar", "Besar"] },
          { label: "Warna Tinta", name: "ink_color", type: "select", options: ["Biru", "Merah", "Ungu", "Hitam"] }
        ]
      }
    ]
  },
  {
    key: "buku-ncr",
    label: "Buku & Form Bisnis",
    item_group: "NCR",
    image: "https://picsum.photos/seed/book/600/400",
    submenu: [
      {
        name: "Nota NCR / Kwitansi",
        item_code_template: "NCR-001",
        price: "Rp 150.000",
        image: "https://picsum.photos/seed/nota/600/600",
        fields: [
          { label: "Rangkap", name: "ply", type: "select", options: ["2 Ply", "3 Ply", "4 Ply"] },
          { label: "Ukuran", name: "size", type: "select", options: ["1/2 Folio", "1/4 Folio", "A5"] },
          { label: "Jumlah Buku", name: "qty", type: "number" }
        ]
      }
    ]
  },
  {
    key: "kemasan-apparel",
    label: "Kemasan & Apparel",
    item_group: "Apparel",
    image: "https://picsum.photos/seed/packaging/600/400",
    submenu: [
      {
        name: "Paper Bag",
        item_code_template: "PB-001",
        price: "Rp 5.000",
        image: "https://picsum.photos/seed/paperbag/600/600",
        fields: [
          { label: "Bahan", name: "material", type: "select", options: ["Kraft Cokelat", "Art Carton 210g"] },
          { label: "Tali", name: "rope", type: "select", options: ["Tali Kur", "Tali Kertas"] }
        ]
      },
      {
        name: "Kaos Custom",
        item_code_template: "TSHIRT-001",
        price: "Rp 85.000",
        image: "https://picsum.photos/seed/shirt/600/600",
        fields: [
          { label: "Bahan", name: "material", type: "select", options: ["Cotton Combed 30s", "Cotton Combed 24s"] },
          { label: "Warna", name: "color", type: "text" },
          { label: "Ukuran", name: "size", type: "select", options: ["S", "M", "L", "XL", "XXL"] }
        ]
      }
    ]
  }
];