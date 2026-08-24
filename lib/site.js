export const SITE_URL = "https://perma.cool";
export const SITE_NAME = "Perma Cool";
export const ORGANIZATION_NAME = "Perma Cool Systems Inc.";
export const ORGANIZATION_ID = `${SITE_URL}/#organization`;
export const WEBSITE_ID = `${SITE_URL}/#website`;
export const LEARNING_CENTER_URL = `${SITE_URL}/learning-center`;
export const OPTO22_CASE_STUDY_URL =
  "https://blog.opto22.com/optoblog/case-study-how-an-oem-took-back-their-control-systems";

export const PUBLIC_ROBOTS = {
  index: true,
  follow: true,
  googleBot: {
    index: true,
    follow: true,
    "max-image-preview": "large",
    "max-snippet": -1,
    "max-video-preview": -1
  }
};

export function absoluteUrl(path = "/") {
  return new URL(path, `${SITE_URL}/`).toString();
}

export function articleUrl(article) {
  return absoluteUrl(article.href || `/${article.slug}`);
}

export function buildPublicPageMetadata({ path, title, description, image, keywords }) {
  const url = absoluteUrl(path);
  const imageUrl = absoluteUrl(image || "/images/brand/permacool-social-card.jpg");

  return {
    title,
    description,
    ...(keywords ? { keywords } : {}),
    alternates: { canonical: url },
    robots: PUBLIC_ROBOTS,
    openGraph: {
      type: "website",
      locale: "en_US",
      url,
      siteName: SITE_NAME,
      title,
      description,
      images: [{ url: imageUrl, alt: title }]
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl]
    }
  };
}

export function buildProductStructuredData({ path, name, model, description, image, properties = [] }) {
  const url = absoluteUrl(path);

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${url}#product`,
    url,
    name,
    model,
    description,
    image: [absoluteUrl(image)],
    category: "Industrial ethanol chiller",
    brand: { "@type": "Brand", name: SITE_NAME },
    manufacturer: { "@id": ORGANIZATION_ID },
    additionalProperty: properties.map(([propertyName, value]) => ({
      "@type": "PropertyValue",
      name: propertyName,
      value
    }))
  };
}

export function buildServiceStructuredData({ path, name, serviceType, description, image }) {
  const url = absoluteUrl(path);

  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${url}#service`,
    url,
    name,
    serviceType,
    description,
    image: absoluteUrl(image),
    provider: { "@id": ORGANIZATION_ID },
    areaServed: "Worldwide",
    audience: {
      "@type": "BusinessAudience",
      audienceType: "Commercial botanical extraction facilities"
    }
  };
}

export function buildArticleMetadata(article) {
  const url = articleUrl(article);
  const image = absoluteUrl(article.image);
  const title = `${article.title} | Perma Cool Learning Center`;
  const tags = article.tags || [article.category];

  return {
    title,
    description: article.description,
    authors: [{ name: SITE_NAME, url: SITE_URL }],
    creator: SITE_NAME,
    publisher: ORGANIZATION_NAME,
    category: article.category,
    keywords: tags,
    alternates: { canonical: url },
    robots: PUBLIC_ROBOTS,
    openGraph: {
      type: "article",
      locale: "en_US",
      url,
      siteName: SITE_NAME,
      title,
      description: article.description,
      images: [{ url: image, alt: `${article.title} article cover` }],
      publishedTime: article.publishedAt,
      modifiedTime: article.updatedAt,
      authors: [SITE_URL],
      section: article.category,
      tags
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: article.description,
      images: [image]
    }
  };
}

export function buildSiteStructuredData() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": ORGANIZATION_ID,
        name: ORGANIZATION_NAME,
        alternateName: SITE_NAME,
        url: SITE_URL,
        logo: {
          "@type": "ImageObject",
          url: absoluteUrl("/images/brand/perma-cool.png")
        },
        image: absoluteUrl("/images/brand/permacool-social-card.jpg"),
        description: "Purpose-built industrial cooling systems for botanical extraction.",
        foundingDate: "2018",
        founder: {
          "@type": "Person",
          name: "David Schaefer"
        },
        areaServed: "Worldwide",
        email: "sales@perma.cool",
        telephone: "+1-747-208-1001",
        contactPoint: {
          "@type": "ContactPoint",
          contactType: "sales",
          telephone: "+1-747-208-1001",
          email: "sales@perma.cool",
          availableLanguage: "English"
        },
        knowsAbout: [
          "Industrial ethanol chilling",
          "Direct refrigerant cooling",
          "Cold ethanol extraction",
          "Butane recovery systems",
          "Extraction process cooling"
        ],
        subjectOf: {
          "@type": "Article",
          name: "Case Study: How an OEM took back their control systems",
          url: OPTO22_CASE_STUDY_URL,
          publisher: {
            "@type": "Organization",
            name: "Opto 22"
          }
        }
      },
      {
        "@type": "WebSite",
        "@id": WEBSITE_ID,
        url: SITE_URL,
        name: SITE_NAME,
        description: "Industrial extraction cooling systems and plain-language extraction education.",
        publisher: { "@id": ORGANIZATION_ID },
        inLanguage: "en-US"
      }
    ]
  };
}

export function buildArticleStructuredData(article) {
  const url = articleUrl(article);
  const tags = article.tags || [article.category];

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        "@id": `${url}#article`,
        url,
        mainEntityOfPage: { "@type": "WebPage", "@id": url },
        headline: article.title,
        description: article.description,
        image: [absoluteUrl(article.image)],
        datePublished: article.publishedAt,
        dateModified: article.updatedAt,
        author: { "@id": ORGANIZATION_ID },
        publisher: { "@id": ORGANIZATION_ID },
        isPartOf: { "@id": `${LEARNING_CENTER_URL}#collection` },
        articleSection: article.category,
        genre: article.format || "Guide",
        keywords: tags,
        about: tags.map((tag) => ({ "@type": "Thing", name: tag })),
        isAccessibleForFree: true,
        inLanguage: "en-US"
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${url}#breadcrumb`,
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: SITE_URL
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Learning Center",
            item: LEARNING_CENTER_URL
          },
          {
            "@type": "ListItem",
            position: 3,
            name: article.title,
            item: url
          }
        ]
      }
    ]
  };
}

export function buildLearningCenterStructuredData(articles) {
  const publishedArticles = articles.filter((article) => !article.hidden);

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${LEARNING_CENTER_URL}#collection`,
        url: LEARNING_CENTER_URL,
        name: "Extraction Learning Center",
        description:
          "Plain-language extraction cooling guides covering temperature science, ethanol workflow, LN2 economics, maintenance, and system planning.",
        isPartOf: { "@id": WEBSITE_ID },
        publisher: { "@id": ORGANIZATION_ID },
        inLanguage: "en-US",
        mainEntity: { "@id": `${LEARNING_CENTER_URL}#articles` }
      },
      {
        "@type": "ItemList",
        "@id": `${LEARNING_CENTER_URL}#articles`,
        name: "Perma Cool Learning Center articles",
        numberOfItems: publishedArticles.length,
        itemListOrder: "https://schema.org/ItemListOrderAscending",
        itemListElement: publishedArticles.map((article, index) => ({
          "@type": "ListItem",
          position: index + 1,
          item: {
            "@type": "Article",
            "@id": `${articleUrl(article)}#article`,
            url: articleUrl(article),
            name: article.title,
            description: article.description
          }
        }))
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${LEARNING_CENTER_URL}#breadcrumb`,
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: SITE_URL
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Learning Center",
            item: LEARNING_CENTER_URL
          }
        ]
      }
    ]
  };
}
