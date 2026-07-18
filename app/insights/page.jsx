import Image from "next/image";
import { permanentRedirect } from "next/navigation";
import { ArrowRight, BookOpen } from "lucide-react";
import {
  externalLearningResources,
  insightArticles,
  insightHeroImage,
  learningCenterSections
} from "./insights-data";
import LearningCenterLibrary from "./LearningCenterLibrary";
import { InsightsHeader } from "./InsightsShell";
import StructuredData from "../components/StructuredData";
import { PUBLIC_ROBOTS, SITE_URL, absoluteUrl, buildLearningCenterStructuredData } from "../../lib/site";

const learningCenterDescription =
  "Plain-language extraction cooling guides covering temperature science, ethanol workflow, LN2 economics, maintenance, and system planning.";

export const metadata = {
  title: "Extraction Learning Center | Perma Cool",
  description: learningCenterDescription,
  alternates: {
    canonical: `${SITE_URL}/learning-center`,
    types: {
      "application/rss+xml": `${SITE_URL}/learning-center/feed.xml`
    }
  },
  robots: PUBLIC_ROBOTS,
  openGraph: {
    type: "website",
    locale: "en_US",
    url: `${SITE_URL}/learning-center`,
    siteName: "Perma Cool",
    title: "Extraction Learning Center | Perma Cool",
    description: learningCenterDescription,
    images: [{ url: absoluteUrl(insightHeroImage), alt: "Perma Cool Extraction Learning Center" }]
  },
  twitter: {
    card: "summary_large_image",
    title: "Extraction Learning Center | Perma Cool",
    description: learningCenterDescription,
    images: [absoluteUrl(insightHeroImage)]
  }
};

const wordCountExcludedKeys = new Set(["slug", "image", "previewImage", "href", "heroClass"]);

function collectArticleText(value, key = "") {
  if (wordCountExcludedKeys.has(key) || value == null || typeof value === "function") return "";
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value.map((item) => collectArticleText(item)).join(" ");
  if (typeof value === "object") {
    return Object.entries(value)
      .map(([childKey, childValue]) => collectArticleText(childValue, childKey))
      .join(" ");
  }
  return "";
}

function estimateReadTime(article) {
  const wordCount = collectArticleText(article).trim().split(/\s+/).filter(Boolean).length;
  return Math.max(3, Math.ceil(wordCount / 210));
}

export function LearningCenterPage() {
  const visibleArticles = insightArticles.filter((article) => !article.hidden);
  const sectionLabels = Object.fromEntries(learningCenterSections.map((section) => [section.id, section.label]));
  const libraryArticles = visibleArticles.map((article) => ({
    slug: article.slug,
    category: article.category,
    title: article.title,
    shortTitle: article.shortTitle,
    summary: article.summary,
    image: article.previewImage || article.image,
    href: article.href,
    format: article.format || "Guide",
    librarySection: article.librarySection || "process-throughput",
    sectionLabel: sectionLabels[article.librarySection] || "Extraction Guidance",
    tags: article.tags || [article.category],
    featuredRank: article.featuredRank || 99,
    readTime: estimateReadTime(article),
    searchText: collectArticleText(article)
  }));

  return (
    <main className="site-shell insights-page learning-center-page">
      <StructuredData data={buildLearningCenterStructuredData(visibleArticles)} />
      <InsightsHeader />

      <section className="insights-hero learning-center-hero">
        <Image src={insightHeroImage} alt="" fill priority className="insights-hero-image" sizes="100vw" />
        <div className="insights-hero-overlay" />
        <div className="insights-hero-content">
          <p className="eyebrow">Perma Cool Knowledge Hub</p>
          <h1>Extraction Learning Center</h1>
          <p>
            Temperature, workflow, equipment economics, and maintenance explained clearly for the people building and
            operating extraction systems.
          </p>
          <div className="hero-actions">
            <a className="button primary" href="#article-library">
              Browse all articles
              <ArrowRight size={18} aria-hidden="true" />
            </a>
            <a className="button secondary" href="/minus-40-celsius-fahrenheit">
              Start with the −40° lesson
              <ArrowRight size={18} aria-hidden="true" />
            </a>
          </div>
          <div className="learning-hero-facts" aria-label="Learning Center overview">
            <span>
              <strong>{libraryArticles.length}</strong>
              labeled guides
            </span>
            <span>
              <strong>{learningCenterSections.length}</strong>
              topic areas
            </span>
            <span>
              <strong>Plain</strong>
              language first
            </span>
          </div>
        </div>
      </section>

      <section className="learning-principle-banner" aria-labelledby="learning-principle-heading">
        <div className="learning-principle-inner">
          <h2 id="learning-principle-heading">
            The Science of Extraction -{" "}
            <span>&quot;If you can’t explain it simply, you don’t understand it well enough.&quot;</span>
          </h2>
          <p>
            Journey into the art, science and business of extraction through our knowledge hub. Learn the why, not just
            the how and take your extraction process to the next level.
          </p>
        </div>
      </section>

      <LearningCenterLibrary
        articles={libraryArticles}
        externalResources={externalLearningResources}
        sections={learningCenterSections}
      />

      <section className="insights-bottom-cta learning-bottom-cta">
        <BookOpen size={34} aria-hidden="true" />
        <div>
          <p className="eyebrow">Turn Reading Into A Plan</p>
          <h2>Have a cooling question specific to your facility?</h2>
          <p>
            Share your throughput, temperature target, current cooling method, and facility constraints. We will help
            connect the technical guidance to the next practical step.
          </p>
        </div>
        <a className="button primary" href="/contact-us">
          Request a recommendation
          <ArrowRight size={18} aria-hidden="true" />
        </a>
      </section>
    </main>
  );
}

export default function InsightsRedirect() {
  permanentRedirect("/learning-center");
}
