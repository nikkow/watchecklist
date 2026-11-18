/** What one page view reports to Matomo. */
export interface PageView {
  url: string;
  title: string;
  /** The previous page, empty when the visitor arrived directly. */
  referrer: string;
}
