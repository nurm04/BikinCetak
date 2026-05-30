import OrderTableClient, { Order } from "@/components/shared/OrderTableClient";

async function getOrders(): Promise<Order[]> {
  return [
    { 
      id: "SO-2026-001", 
      customer: "Budi Santoso", 
      product: "Sticker Vinyl A3+", 
      total: 150000, 
      total_paid: 0, 
      status: "To Bill", 
      payment_status: "Unpaid", 
      date: "14 Apr 2026" 
    },
    { 
      id: "SO-2026-002", 
      customer: "Ani Wijaya", 
      product: "Kartu Nama Art Carton", 
      total: 75000, 
      total_paid: 75000, 
      status: "Completed", 
      payment_status: "Paid", 
      date: "14 Apr 2026" 
    },
    { 
      id: "SO-2026-003", 
      customer: "Ani Wijaya", 
      product: "Kartu Nama Art Carton", 
      total: 75000, 
      total_paid: 75000, 
      status: "Completed", 
      payment_status: "Paid", 
      date: "14 Apr 2026" 
    },
    { 
      id: "SO-2026-004", 
      customer: "Ani Wijaya", 
      product: "Kartu Nama Art Carton", 
      total: 75000, 
      total_paid: 75000, 
      status: "Completed", 
      payment_status: "Paid", 
      date: "14 Apr 2026" 
    },
    { 
      id: "SO-2026-005", 
      customer: "Siska Putri", 
      product: "Roll Banner 60x160", 
      total: 185000, 
      total_paid: 100000, 
      status: "To Deliver", 
      payment_status: "Partially Paid", 
      date: "13 Apr 2026" 
    },
    { 
      id: "SO-2026-006", 
      customer: "Dedi Kurniawan", 
      product: "Mug Bunglon", 
      total: 50000, 
      total_paid: 0, 
      status: "Draft", 
      payment_status: "Unpaid", 
      date: "13 Apr 2026" 
    },
  ];
}

export default async function OrdersPage() {
  const orders = await getOrders();
  return (
    <section>
      <OrderTableClient initialData={orders} />
    </section>
  );
}