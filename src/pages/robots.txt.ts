import type { APIRoute } from 'astro';

/** Lets every crawler in and points it to the sitemap. */
export const GET: APIRoute = ({ site }) => {
  if (!site) throw new Error('Set `site` in astro.config to build robots.txt');
  const body = `User-agent: *\nAllow: /\n\nSitemap: ${new URL('/sitemap.xml', site).href}\n`;
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
