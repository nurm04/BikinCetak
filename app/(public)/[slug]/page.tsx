import { getHalamanStatisDetail } from "@/services/pengaturanWebService";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface PageProps {
  params: Promise<{ slug: string }>;
}

// 👇 1. GENERATE METADATA DINAMIS UNTUK SEO 👇
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const unwrappedParams = await params;
  const slug = unwrappedParams.slug;
  const data = await getHalamanStatisDetail(slug);

  if (!data) {
    return { title: "Halaman Tidak Ditemukan | BikinCetak" };
  }

  return {
    title: `${data.judul} | BikinCetak`,
    description: `Halaman informasi mengenai ${data.judul} di BikinCetak.`,
  };
}

// 👇 2. KOMPONEN UTAMA (SERVER COMPONENT) 👇
export default async function HalamanStatisPage({ params }: PageProps) {
  const unwrappedParams = await params;
  const slug = unwrappedParams.slug;

  // Tarik data dari Redis/API berdasarkan slug di URL
  const data = await getHalamanStatisDetail(slug);

  // KUNCI PENTING: Kalau slug ngawur (misal: /asdfgh), 
  // langsung lempar ke halaman 404 bawaan Next.js
  if (!data) {
    notFound();
  }

  return (
    <main className="min-h-screen px-4 py-8 bg-base-200 md:px-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Tombol Kembali */}
        <Link href="/" className="mb-6 btn btn-ghost btn-sm w-fit">
          <ArrowLeft size={16} /> Kembali ke Beranda
        </Link>

        {/* Kontainer Artikel */}
        <div className="p-6 border shadow-sm bg-base-100 rounded-3xl md:p-10 border-base-content/5">
          <div className="pb-6 mb-6 border-b border-base-200">
            <h1 className="text-3xl font-black md:text-4xl text-primary">{data.judul}</h1>
            <p className="mt-2 text-xs font-bold tracking-widest uppercase opacity-50">
              Terakhir diperbarui: {new Date(data.updated_at).toLocaleDateString("id-ID", {
                day: "numeric", month: "long", year: "numeric"
              })}
            </p>
          </div>
          
          {/* 
            RENDER HTML KONTEN
            Pakai dangerouslySetInnerHTML karena data dari editor berupa tag HTML
          */}
          <div 
            className="prose max-w-none md:prose-lg prose-headings:font-bold prose-a:text-primary prose-img:rounded-2xl"
            dangerouslySetInnerHTML={{ __html: data.konten }}
          />
        </div>

      </div>
    </main>
  );
}