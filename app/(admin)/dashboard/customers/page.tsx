import CustomerTableClient from "@/components/shared/CustomerTableClient";

async function getCustomers() {
  return [
    { 
      id: "CUST-001", 
      name: "Budi Santoso", 
      email: "budi@gmail.com", 
      phone: "0812-3456-7890", 
      total_orders: 12, 
      total_spent: 2450000, 
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Budi" 
    },
    { 
      id: "CUST-002", 
      name: "Ani Wijaya", 
      email: "ani.w@yahoo.com", 
      phone: "0856-9988-7766", 
      total_orders: 5, 
      total_spent: 750000, 
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ani" 
    },
  ];
}

export default async function CustomersPage() {
  const data = await getCustomers();
  return <CustomerTableClient initialData={data} />;
}