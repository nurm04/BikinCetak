// @/app/cart/page.tsx
import { Metadata } from "next";
import CartClient from "@/app/(public)/cart/CartClient";

export const metadata: Metadata = {
  title: "Keranjang Belanja | BikinCetak",
  description: "Daftar pesanan cetak dan merchandise Anda",
};

export default function CartPage() {
  return <CartClient />;
}