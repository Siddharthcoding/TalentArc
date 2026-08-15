import { Helmet } from 'react-helmet-async';

const BASE_URL = 'https://kampusace.in';
const DEFAULT_IMAGE = `${BASE_URL}/og-image.jpg`;
const SITE_NAME = 'Kampus Ace';
const DEFAULT_TITLE = 'Kampus Ace — KIIT Campus Placement Hub';
const DEFAULT_DESC =
  "Kampus Ace is KIIT's all-in-one campus placement prep hub. ATS resume checker, verified company question banks, AI mock tests, and live mentor doubt sessions.";

/**
 * SEO component — drops dynamic <title>, <meta>, OG, Twitter, canonical into <head>.
 *
 * @param {string}  title       - Page title (appended with " | Kampus Ace" unless noSuffix)
 * @param {string}  description - Meta description (max 160 chars)
 * @param {string}  path        - Path for canonical URL e.g. "/dashboard"
 * @param {string}  image       - Absolute URL for OG image (defaults to og-image.jpg)
 * @param {string}  keywords    - Comma-separated keywords
 * @param {boolean} noIndex     - Set true for auth/admin/private pages
 * @param {boolean} noSuffix    - Don't append "| Kampus Ace" to title
 */
export default function SEO({
  title,
  description = DEFAULT_DESC,
  path = '/',
  image = DEFAULT_IMAGE,
  keywords = '',
  noIndex = false,
  noSuffix = false,
}) {
  const fullTitle = noSuffix || !title
    ? (title || DEFAULT_TITLE)
    : `${title} | ${SITE_NAME}`;

  const canonical = `${BASE_URL}${path}`;

  const defaultKeywords =
    'KIIT placement, KIIT campus placement, KIIT interview questions, ATS resume checker, company question bank, mock tests, placement preparation';
  const allKeywords = keywords
    ? `${keywords}, ${defaultKeywords}`
    : defaultKeywords;

  return (
    <Helmet>
      {/* Primary */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={allKeywords} />
      <meta name="robots" content={noIndex ? 'noindex, nofollow' : 'index, follow'} />
      <link rel="canonical" href={canonical} />

      {/* Open Graph */}
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:url" content={canonical} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:locale" content="en_IN" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
    </Helmet>
  );
}
