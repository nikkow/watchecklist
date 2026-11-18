import { statsOptOutKey } from './constants.ts';
import type { PageView } from './types.ts';

/**
 * Builds the Matomo HTTP tracking request for one page view. The request carries no visitor id
 * and no cookie, which keeps the measurement within the CNIL consent exemption.
 *
 * @param base - The Matomo instance, such as `https://analytics.example.com`.
 * @param siteId - The site id in that instance.
 * @param view - The page being viewed.
 * @param random - A cache-busting value.
 * @returns The `matomo.php` URL to send.
 */
export function trackingUrl(base: string, siteId: string, view: PageView, random: string): URL {
  const url = new URL('matomo.php', base.endsWith('/') ? base : `${base}/`);
  url.search = new URLSearchParams({
    idsite: siteId,
    rec: '1',
    apiv: '1',
    send_image: '0',
    url: view.url,
    action_name: view.title,
    urlref: view.referrer,
    rand: random,
  }).toString();
  return url;
}

/**
 * Counts the current page view when the build names a Matomo instance and the visitor has not
 * opted out. Failures, offline visits included, are dropped: the site never depends on Matomo.
 */
export function trackPageView(): void {
  const base = import.meta.env.PUBLIC_MATOMO_URL;
  const siteId = import.meta.env.PUBLIC_MATOMO_SITE_ID;
  if (!base || !siteId || isOptedOut()) return;
  const view = { url: location.href, title: document.title, referrer: document.referrer };
  const url = trackingUrl(base, siteId, view, String(Math.random()).slice(2));
  // `credentials: 'omit'` guarantees no cookie of the Matomo domain travels with the hit.
  fetch(url, { method: 'POST', mode: 'no-cors', credentials: 'omit', keepalive: true }).catch(
    () => {
      // A lost page view is not worth telling the visitor about.
    },
  );
}

/** Whether the visitor opted out; false when storage is unavailable. */
export function isOptedOut(): boolean {
  try {
    return localStorage.getItem(statsOptOutKey) === 'true';
  } catch {
    return false;
  }
}

/**
 * Records the visitor's choice. Without storage the choice cannot be kept.
 *
 * @param optedOut - Whether to stop counting this browser.
 */
export function setOptedOut(optedOut: boolean): void {
  try {
    if (optedOut) localStorage.setItem(statsOptOutKey, 'true');
    else localStorage.removeItem(statsOptOutKey);
  } catch {
    // Nothing to keep the choice in.
  }
}
