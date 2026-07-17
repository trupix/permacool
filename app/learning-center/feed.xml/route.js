import { insightArticles } from "../../insights/insights-data";
import { LEARNING_CENTER_URL, SITE_NAME, SITE_URL, articleUrl } from "../../../lib/site";

export const dynamic = "force-static";

function escapeXml(value) {
  return String(value).replace(/[<>&'\"]/g, (character) => {
    const entities = {
      "<": "&lt;",
      ">": "&gt;",
      "&": "&amp;",
      "'": "&apos;",
      '"': "&quot;"
    };
    return entities[character];
  });
}

export function GET() {
  const articles = insightArticles
    .filter((article) => !article.hidden)
    .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
  const lastBuildDate = new Date(
    Math.max(...articles.map((article) => new Date(article.updatedAt).getTime()))
  ).toUTCString();

  const items = articles
    .map((article) => {
      const url = articleUrl(article);
      return `    <item>
      <title>${escapeXml(article.title)}</title>
      <link>${escapeXml(url)}</link>
      <guid isPermaLink="true">${escapeXml(url)}</guid>
      <description>${escapeXml(article.description)}</description>
      <category>${escapeXml(article.category)}</category>
      <pubDate>${new Date(article.publishedAt).toUTCString()}</pubDate>
    </item>`;
    })
    .join("\n");

  const feed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${SITE_NAME} Learning Center</title>
    <link>${LEARNING_CENTER_URL}</link>
    <description>Plain-language extraction cooling guides from Perma Cool.</description>
    <language>en-us</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <atom:link href="${SITE_URL}/learning-center/feed.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`;

  return new Response(feed, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400"
    }
  });
}
