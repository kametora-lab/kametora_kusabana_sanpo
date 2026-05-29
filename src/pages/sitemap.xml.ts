import plants from '../data/plants.json';

const site = import.meta.env.SITE;
const base = import.meta.env.BASE_URL;
const basePath = base.endsWith('/') ? base : `${base}/`;

const withBase = (path: string) => new URL(`${basePath}${path}`, site).toString();

export async function GET() {
    const staticPaths = ['', 'plants', 'about', 'privacy'];
    const plantPaths = plants.map((plant) => `plants/${plant.slug}`);
    const urls = [...staticPaths, ...plantPaths];

    const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((path) => `  <url><loc>${withBase(path)}</loc></url>`).join('\n')}
</urlset>`;

    return new Response(body, {
        headers: {
            'Content-Type': 'application/xml; charset=utf-8'
        }
    });
}
