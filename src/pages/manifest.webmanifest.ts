import type { APIRoute } from 'astro';
import { useTranslations, defaultLocale } from '../i18n';
import { backgroundColor } from '../site';

/** Web app manifest: lets phones install the site and open it full screen. */
export const GET: APIRoute = () => {
  const t = useTranslations(defaultLocale);
  const manifest = {
    name: 'watchecklist',
    short_name: 'watchecklist',
    description: t.meta.description,
    lang: defaultLocale,
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: backgroundColor,
    theme_color: backgroundColor,
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      // The brand icon keeps its mark within the central 65%, inside Android's safe zone.
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
  return new Response(JSON.stringify(manifest), {
    headers: { 'Content-Type': 'application/manifest+json' },
  });
};
