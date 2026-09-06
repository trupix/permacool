import { insightArticles } from "./insights/insights-data";
import { SITE_URL, absoluteUrl, articleUrl } from "../lib/site";

const publicPages = [
  { path: "/", updatedAt: "2026-09-01", changeFrequency: "monthly", priority: 1 },
  { path: "/ethanol-chilling-systems", updatedAt: "2026-09-01", changeFrequency: "monthly", priority: 0.9 },
  { path: "/ethanol-chiller-comparison", updatedAt: "2026-09-01", changeFrequency: "monthly", priority: 0.8 },
  { path: "/ethanol-chiller-blast-60", updatedAt: "2026-08-27T06:34:15-07:00", changeFrequency: "monthly", priority: 0.8 },
  { path: "/ethanol-chiller-blast-150", updatedAt: "2026-08-27T06:34:15-07:00", changeFrequency: "monthly", priority: 0.8 },
  { path: "/ethanol-chiller-blast-150-30", updatedAt: "2026-09-05", changeFrequency: "monthly", priority: 0.85 },
  { path: "/ethanol-chiller-blast-240", updatedAt: "2026-08-27T06:34:15-07:00", changeFrequency: "monthly", priority: 0.8 },
  { path: "/butane-recovery-system", updatedAt: "2026-08-27T06:34:15-07:00", changeFrequency: "monthly", priority: 0.8 },
  { path: "/learning-center", updatedAt: "2026-08-27T06:34:15-07:00", changeFrequency: "weekly", priority: 0.9 },
  { path: "/contact-us", updatedAt: "2026-08-27T06:34:15-07:00", changeFrequency: "yearly", priority: 0.7 },
  { path: "/privacy-policy", updatedAt: "2026-09-01", changeFrequency: "yearly", priority: 0.2 },
  { path: "/terms-and-conditions", updatedAt: "2026-09-01", changeFrequency: "yearly", priority: 0.2 }
];

export default function sitemap() {
  const pages = publicPages.map((page) => ({
    url: absoluteUrl(page.path),
    lastModified: page.updatedAt,
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
