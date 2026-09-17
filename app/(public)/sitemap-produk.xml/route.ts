import { getItems } from "@/services/itemService";
import { slugify } from "@/lib/utils"; // Pastikan path import ini sesuai sama file utils lu

export async function GET() {
  // Ganti dengan domain asli lu saat naik ke production
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://bikincetak.co.id";
  
  try {
    // 1. Tarik semua data produk persis kayak di halaman Home lu
    const items = await getItems();

    let urlsXML = "";
    
    // 2. Looping data produk untuk merakit link dinamis
    items.forEach((item) => {
      // Skip produk yang mati atau produk dummy (mengikuti logic di Home lu)
      if (item.is_active === 0 || item.id_produk === "PRD-0001") return;

      const slug = slugify(item.nama_produk);
      
      // Ambil tanggal update asli dari database (Penting buat SEO Google)
      // Kalau API nggak nyediain updated_at, fallback ke tanggal hari ini
      const lastMod = item.updated_at 
        ? new Date(item.updated_at).toISOString() 
        : new Date().toISOString();

      urlsXML += `
  <url>
    <loc>${baseUrl}/produk/${slug}</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>`;
    });

    // 3. Bungkus jadi format XML standar
    const sitemapXML = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${urlsXML}
</urlset>
    `;

    return new Response(sitemapXML.trim(), {
      headers: {
        "Content-Type": "text/xml",
        // Kasih cache 1 jam (3600 detik) biar server lu nggak jebol kalau di-hit bot Google berkali-kali
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate",
      },
    });

  } catch (error) {
    console.error("Sitemap Produk Error:", error);
    return new Response("Gagal memuat sitemap", { status: 500 });
  }
}