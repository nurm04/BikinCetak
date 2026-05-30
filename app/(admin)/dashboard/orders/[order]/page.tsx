import OrderDetailClient from "@/components/shared/OrderDetailClient";

async function getFullOrderData(id: string) {
  return {
    id: id,
    customer: "Budi Santoso",
    phone: "0812-3456-7890",
    email: "budi@mail.com",
    date: "14 Apr 2026",
    status: "To Deliver",
    payment_status: "Partially Paid",
    total: 150000,
    total_paid: 100000,
    items: [
      { name: "Sticker Vinyl A3+", qty: 10, price: 10000, total: 100000 },
      { name: "Ongkos Potong Die-Cut", qty: 1, price: 50000, total: 50000 },
    ],
    payments: [
      { date: "14 Apr 2026 10:00", method: "Mandiri Transfer", amount: 100000, ref: "TRF-99201" },
    ]
  };
}

export default async function OrderDetailPage({ params }: { params: { order: string } }) {
  const data = await getFullOrderData(params.order);
  return <OrderDetailClient data={data} />;
}