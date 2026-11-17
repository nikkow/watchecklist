// @ts-check
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://watchecklist.com',
  trailingSlash: 'always',
  i18n: {
    locales: ['en', 'fr'],
    defaultLocale: 'en',
    routing: {
      prefixDefaultLocale: true,
      redirectToDefaultLocale: false,
    },
  },
});
