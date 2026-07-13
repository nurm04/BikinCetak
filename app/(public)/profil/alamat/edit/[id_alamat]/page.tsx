import { getAlamatById } from "@/services/alamatService";
import { redirect } from "next/navigation";
import EditAlamatForm from "./EditAlamatForm";

interface PageProps {
  params: Promise<{
    id_alamat: string;
  }>;
}

export default async function EditAlamatPage({
  params,
}: PageProps) {
  const { id_alamat } = await params;

  const res = await getAlamatById(id_alamat);

    if (!res.success || !res.data) {
    redirect("/profil");
    }

  return (
    <main className="min-h-screen bg-base-200 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <EditAlamatForm initialData={res.data}/>
      </div>
    </main>
  );
}