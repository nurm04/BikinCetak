import { getHalamanStatisList } from "@/services/pengaturanWebService";

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://bikincetak.co.id";

  try {
    // 1. Rute Fix (Hardcoded) yang murni UI publik
    // DILARANG keras memasukkan /cart, /checkout, /profil, /pesan ke sini.
    const hardcodedPages = [
      "",           // Halaman Utama (Home)
      "/katalog",
      "/login",
      "/register",
    ];

    let urlsXML = "";

    // Memproses rute fix
    hardcodedPages.forEach((route) => {
      const priority = route === "" ? "1.0" : "0.8";
      urlsXML += `
  <url>
    <loc>${baseUrl}${route}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${priority}</priority>
  </url>`;
    });

    // 2. Rute Dinamis (Tarik data dari fitur Halaman Statis Admin)
    const halamanStatis = await getHalamanStatisList();

    halamanStatis.forEach((halaman) => {
      // Memastikan slug pakai garis miring (slash) di depannya
      const slug = halaman.slug.startsWith('/') ? halaman.slug : `/${halaman.slug}`;
      
      urlsXML += `
  <url>
    <loc>${baseUrl}${slug}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
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
        // Cache 1 jam karena datanya campuran API dinamis
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate",
      },
    });

  } catch (error) {
    console.error("Sitemap Halaman Error:", error);
    return new Response("Gagal memuat sitemap halaman", { status: 500 });
  }
}