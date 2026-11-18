// Fontsource exposes its CSS subsets through an extensionless `./*` export without type declarations.
declare module '@fontsource/big-shoulders-display/*';

interface ImportMetaEnv {
  /** Matomo instance receiving the audience statistics; unset in development, so nothing is sent. */
  readonly PUBLIC_MATOMO_URL?: string;
  /** Site id of watchecklist in that instance. */
  readonly PUBLIC_MATOMO_SITE_ID?: string;
}
