import ConditionalLayout from "@/components/layouts/ConditionalLayout";
import { getItems } from "@/services/itemService"; // Pastikan di-import!

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const itemsData = await getItems();

  return (
    <ConditionalLayout items={itemsData}>
      {children}
    </ConditionalLayout>
  );
}