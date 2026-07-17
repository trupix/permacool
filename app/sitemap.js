import { insightArticles } from "./insights/insights-data";
import { SITE_URL, absoluteUrl, articleUrl } from "../lib/site";

const siteUpdatedAt = "2026-07-17T13:57:18-07:00";

const publicPages = [
  { path: "/", changeFrequency: "monthly", priority: 1 },
  { path: "/ethanol-chilling-systems", changeFrequency: "monthly", priority: 0.9 },
  { path: "/ethanol-chiller-comparison", changeFrequency: "monthly", priority: 0.8 },
  { path: "/ethanol-chiller-blast-60", changeFrequency: "monthly", priority: 0.8 },
  { path: "/ethanol-chiller-blast-150", changeFrequency: "monthly", priority: 0.8 },
  { path: "/ethanol-chiller-blast-240", changeFrequency: "monthly", priority: 0.8 },
  { path: "/butane-recovery-system", changeFrequency: "monthly", priority: 0.8 },
  { path: "/learning-center", changeFrequency: "weekly", priority: 0.9 },
  { path: "/contact-us", changeFrequency: "yearly", priority: 0.7 },
  { path: "/privacy-policy", changeFrequency: "yearly", priority: 0.2 },
  { path: "/terms-and-conditions", changeFrequency: "yearly", priority: 0.2 }
];

export default function sitemap() {
  const pages = publicPages.map((page) => ({
    url: absoluteUrl(page.path),
    lastModified: siteUpdatedAt,
    changeFrequency: page.changeFrequency,
    priority: page.priority
  }));

  const articles = insightArticles
    .filter((article) => !article.hidden)
    .map((article) => ({
      url: articleUrl(article),
      lastModified: article.updatedAt,
      changeFrequency: "monthly",
      priority: article.featuredRank === 1 ? 0.9 : 0.75
    }));

  return [...pages, ...articles].map((entry) => ({ ...entry, url: entry.url.replace(`${SITE_URL}//`, `${SITE_URL}/`) }));
}
