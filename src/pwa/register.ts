/**
 * Registers the offline service worker, then hands it what this page already loaded, since the
 * first visit happens before the worker controls the page, plus every image the page refers to:
 * lazy posters further down would otherwise be missing offline.
 */
export function registerServiceWorker(): void {
  if (!('serviceWorker' in navigator)) return;
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then(() => navigator.serviceWorker.ready)
      .then((registration) => {
        const loaded = performance.getEntriesByType('resource').map((entry) => entry.name);
        const urls = [location.pathname, ...loaded, ...imageUrls()].filter(
          (url) => new URL(url, location.href).origin === location.origin,
        );
        registration.active?.postMessage({ type: 'cache', urls: [...new Set(urls)] });
      })
      .catch(() => {
        // Without a worker the site still works online; nothing to tell the visitor.
      });
  });
}

/**
 * Lists every image source of the page, srcset candidates included.
 *
 * @returns Absolute URLs, possibly repeated.
 */
function imageUrls(): string[] {
  return [...document.images]
    .flatMap((image) => [
      image.currentSrc || image.src,
      ...image.srcset.split(',').map((candidate) => candidate.trim().split(/\s+/)[0] ?? ''),
    ])
    .filter(Boolean)
    .map((url) => new URL(url, location.href).href);
}
