import PaymentFormClient from "@/components/shared/PaymentFormClient";

async function getOrderDetails(id: string) {
  return {
    id: id,
    customer: "Budi Santoso",
    total: 150000,
    total_paid: 50000,
    product: "Sticker Vinyl A3+",
  };
}

export default async function BayarPage({ params }: { params: { order: string } }) {
  const orderData = await getOrderDetails(params.order);

  return (
    <div className="max-w-2xl mx-auto">
      <PaymentFormClient order={orderData} />
    </div>
  );
}