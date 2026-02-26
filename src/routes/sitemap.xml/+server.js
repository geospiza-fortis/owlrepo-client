const SITE = "https://owlrepo.com";

const staticRoutes = [
  { path: "/", changefreq: "daily", priority: "1.0" },
  { path: "/summary", changefreq: "daily", priority: "0.9" },
  { path: "/items", changefreq: "daily", priority: "0.8" },
  { path: "/charts", changefreq: "weekly", priority: "0.7" },
  { path: "/recommendation", changefreq: "weekly", priority: "0.6" },
  { path: "/about", changefreq: "monthly", priority: "0.3" },
];

function toLastmod(timestamp) {
  if (!timestamp) return null;
  const d = new Date(timestamp);
  if (isNaN(d.getTime())) return null;
  return d.toISOString().split("T")[0];
}

/** @type {import('./$types').RequestHandler} */
export async function GET({ fetch }) {
  const resp = await fetch("/api/v2/items/metadata");
  const items = resp.ok ? await resp.json() : [];

  const urls = staticRoutes
    .map(
      (r) => `  <url>
    <loc>${SITE}${r.path}</loc>
    <changefreq>${r.changefreq}</changefreq>
    <priority>${r.priority}</priority>
  </url>`,
    )
    .concat(
      items.map((item) => {
        const lastmod = toLastmod(item.search_item_timestamp);
        return `  <url>
    <loc>${SITE}/items/${item.slug}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.5</priority>${lastmod ? `\n    <lastmod>${lastmod}</lastmod>` : ""}
  </url>`;
      }),
    )
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "max-age=3600",
    },
  });
}
