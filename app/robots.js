import { SITE_URL } from "../lib/site";

const privatePaths = [
  "/api/",
  "/auth/",
  "/admin/",
  "/alerts",
  "/audit-log",
  "/dashboard",
  "/devices/",
  "/freshbooks/",
  "/ingest-test",
  "/sign-in",
  "/sites",
  "/thank-you"
];

const publicCrawlers = [
  "*",
  "OAI-SearchBot",
  "GPTBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-SearchBot",
  "Claude-User",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended"
];

export default function robots() {
  return {
    rules: {
      userAgent: publicCrawlers,
      allow: "/",
      disallow: privatePaths
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL
  };
}
