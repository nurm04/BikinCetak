import { getHalamanStatisDetail } from "@/services/pengaturanWebService";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface PageProps {
  params: Promise<{ slug: string }>;
}

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

export default async function HalamanStatisPage({ params }: PageProps) {
  const unwrappedParams = await params;
  const slug = unwrappedParams.slug;

  const data = await getHalamanStatisDetail(slug);

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
          </div>
          
          {/* 
            FIX UNTUK QUILL EDITOR DI TAILWIND V4:
            Quill memakai <ol> dan <li data-list="bullet"> untuk bullet list.
            Selector arbitrary di bawah memaksa list-style & padding muncul normal.
          */}
          <div 
            className="prose max-w-none md:prose-lg prose-headings:font-bold prose-a:text-primary prose-img:rounded-2xl [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-disc [&_ol]:pl-6 [&_li]:my-1 [&_li[data-list=bullet]]:list-disc [&_li[data-list=ordered]]:list-decimal"
            dangerouslySetInnerHTML={{ __html: data.konten }}
          />
        </div>

      </div>
    </main>
  );
}