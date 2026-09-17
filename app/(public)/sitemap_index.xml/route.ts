// app/sitemap_index.xml/route.ts
export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://bikincetak.co.id";
  
  // Tanggal hari ini untuk penanda kapan sitemap terakhir diupdate
  const lastMod = new Date().toISOString();

  // Struktur XML standar untuk Sitemap Index
  const sitemapIndexXML = `<?xml version="1.0" encoding="UTF-8"?>
    <sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      <sitemap>
        <loc>${baseUrl}/sitemap-produk.xml</loc>
        <lastmod>${lastMod}</lastmod>
      </sitemap>
      <sitemap>
        <loc>${baseUrl}/sitemap-halaman.xml</loc>
        <lastmod>${lastMod}</lastmod>
      </sitemap>
    </sitemapindex>
  `;

  return new Response(sitemapIndexXML.trim(), {
    headers: {
      "Content-Type": "text/xml",
      // Cache 1 hari agar server tidak berat
      "Cache-Control": "public, s-maxage=86400, stale-while-revalidate",
    },
  });
}