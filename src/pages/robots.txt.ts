const site = import.meta.env.SITE;
const base = import.meta.env.BASE_URL;
const basePath = base.endsWith('/') ? base : `${base}/`;
const sitemapUrl = new URL(`${basePath}sitemap.xml`, site).toString();

export async function GET() {
    const body = `User-agent: *
Allow: /
Sitemap: ${sitemapUrl}
`;

    return new Response(body, {
        headers: {
            'Content-Type': 'text/plain; charset=utf-8'
        }
    });
}
