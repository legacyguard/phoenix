import React from "react";
import { Helmet } from "react-helmet";
import { useTranslation } from "react-i18next";

interface MetaTagsProps {
  page: string;
  customTitle?: string;
  customDescription?: string;
  customKeywords?: string;
  ogImage?: string;
  ogType?: string;
  canonicalUrl?: string;
}

const MetaTags: React.FC<MetaTagsProps> = ({
  page,
  customTitle,
  customDescription,
  customKeywords,
  ogImage = "/images/legacyguard-og.jpg",
  ogType = "website",
  canonicalUrl,
}) => {
  const { t } = useTranslation(["landing", "pricing", "legal-pages"]);

  // Default meta content
  const defaultMeta = {
    title: "LegacyGuard - Protect Your Family's Future",
    description:
      "Organize your life's important information so your loved ones are never left searching for answers during difficult times.",
    keywords:
      "estate planning, family protection, will generator, digital vault, legacy planning, family security",
  };

  // Page-specific meta content
  const getPageMeta = () => {
    switch (page) {
      case "landing":
        return {
          title: t("hero.headline"),
          description: t("hero.subheadline"),
          keywords:
            "family protection, estate planning, will generator, digital vault, legacy planning, family security, peace of mind",
        };

      case "pricing":
        return {
          title: t("header.title"),
          description: t("header.subtitle"),
          keywords:
            "LegacyGuard pricing, family protection plans, estate planning cost, will generator pricing, affordable family security",
        };

      case "terms":
        return {
          title: t("termsOfService.title"),
          description:
            "Terms of Service for LegacyGuard family protection platform and services.",
          keywords:
            "LegacyGuard terms, terms of service, legal terms, family protection terms",
        };

      case "privacy":
        return {
          title: t("privacyPolicy.title"),
          description:
            "Privacy Policy for LegacyGuard - Learn how we protect your family's sensitive information.",
          keywords:
            "LegacyGuard privacy, privacy policy, data protection, GDPR, CCPA, family data security",
        };

      case "cookies":
        return {
          title: t("cookiePolicy.title"),
          description:
            "Cookie Policy for LegacyGuard - Learn how we use cookies to improve your experience.",
          keywords:
            "LegacyGuard cookies, cookie policy, website cookies, privacy cookies",
        };

      default:
        return defaultMeta;
    }
  };

  const pageMeta = getPageMeta();

  const title = customTitle || pageMeta.title;
  const description = customDescription || pageMeta.description;
  const keywords = customKeywords || pageMeta.keywords;
  const url = canonicalUrl || window.location.href;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content="LegacyGuard" />
      <meta name="robots" content="index, follow" />

      {/* Canonical URL */}
      <link rel="canonical" href={url} />

      {/* Open Graph Meta Tags */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:site_name" content="LegacyGuard" />
      <meta property="og:locale" content="en_US" />

      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      <meta name="twitter:site" content="@legacyguard" />

      {/* Additional Meta Tags */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="theme-color" content="#2563eb" />
      <meta name="msapplication-TileColor" content="#2563eb" />

      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "LegacyGuard",
          url: "https://legacyguard.com",
          logo: "https://legacyguard.com/images/logo.png",
          description: "Family protection and estate planning platform",
          contactPoint: {
            "@type": "ContactPoint",
            telephone: "1-800-LEGACY-1",
            contactType: "customer service",
          },
          sameAs: [
            "https://twitter.com/legacyguard",
            "https://linkedin.com/company/legacyguard",
          ],
        })}
      </script>

      {/* Page-specific structured data */}
      {page === "landing" && (
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: "LegacyGuard",
            url: "https://legacyguard.com",
            description:
              "Protect your family's future with comprehensive estate planning tools",
            potentialAction: {
              "@type": "SearchAction",
              target: "https://legacyguard.com/search?q={search_term_string}",
              "query-input": "required name=search_term_string",
            },
          })}
        </script>
      )}

      {page === "pricing" && (
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            name: "LegacyGuard Family Protection",
            description:
              "Comprehensive family protection and estate planning platform",
            offers: {
              "@type": "Offer",
              price: "9.99",
              priceCurrency: "USD",
              availability: "https://schema.org/InStock",
            },
          })}
        </script>
      )}
    </Helmet>
  );
};

export default MetaTags;
