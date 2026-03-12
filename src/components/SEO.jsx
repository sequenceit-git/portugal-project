import { Helmet } from "react-helmet-async";

const SITE_NAME = "Tukinlisbon";
const BASE_URL = "https://tukinlisbon.com";
const DEFAULT_IMAGE = `${BASE_URL}/og-image.jpg`;

/**
 * Drop-in SEO head manager. Every page should render <SEO ... />.
 *
 * Props:
 *   title        — page title (appended with " | Tukinlisbon" automatically)
 *   description  — meta description (≤ 160 chars)
 *   canonical    — canonical path, e.g. "/tours" (defaults to window.location.pathname)
 *   image        — absolute OG image URL
 *   type         — OG type, default "website"
 *   noIndex      — set true for admin / transactional pages
 *   structuredData — JSON-LD object or array of objects
 */
const SEO = ({
  title,
  description,
  canonical,
  image = DEFAULT_IMAGE,
  type = "website",
  noIndex = false,
  structuredData,
}) => {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} — Private Tours in Lisbon, Portugal`;
  const canonicalUrl = `${BASE_URL}${canonical ?? (typeof window !== "undefined" ? window.location.pathname : "/")}`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      {description && <meta name="description" content={description} />}
      <link rel="canonical" href={canonicalUrl} />
      <meta name="robots" content={noIndex ? "noindex, nofollow" : "index, follow"} />

      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={fullTitle} />
      {description && <meta property="og:description" content={description} />}
      <meta property="og:image" content={image} />
      <meta property="og:url" content={canonicalUrl} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      {description && <meta name="twitter:description" content={description} />}
      <meta name="twitter:image" content={image} />

      {/* JSON-LD structured data */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(Array.isArray(structuredData) ? structuredData : structuredData)}
        </script>
      )}
    </Helmet>
  );
};

export default SEO;
