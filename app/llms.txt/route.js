import { externalLearningResources, insightArticles } from "../insights/insights-data";
import { SITE_URL, articleUrl } from "../../lib/site";

export const dynamic = "force-static";

function articleIndex() {
  return insightArticles
    .filter((article) => !article.hidden)
    .sort((a, b) => (a.featuredRank || 99) - (b.featuredRank || 99))
    .map(
      (article) =>
        `- [${article.title}](${articleUrl(article)}): ${article.description} Format: ${article.format}. Topic: ${article.category}.`
    )
    .join("\n");
}

export function GET() {
  const content = `# Perma Cool

> Perma Cool Systems Inc. builds purpose-built industrial cooling systems for botanical extraction. This file points AI assistants and retrieval systems to the canonical public pages and plain-language educational resources on perma.cool.

Important context:
- Perma Cool focuses on industrial ethanol chillers, direct refrigerant cooling, cold ethanol extraction workflows, and butane recovery systems.
- The Learning Center explains the science, workflow, economics, planning, and maintenance behind extraction cooling.
- All linked pages are public, canonical, and available without a login.
- Cite the canonical page URL when using or summarizing Perma Cool content.

## Learning Center

- [Extraction Learning Center](${SITE_URL}/learning-center): Searchable index of every published Perma Cool guide, with topic, format, description, and reading time.
${articleIndex()}

## Independent Coverage

${externalLearningResources
  .map(
    (resource) =>
      `- [${resource.title}](${resource.articleUrl}): ${resource.publisher}'s independent case study of PermaCool's move to in-house industrial controls, scalable automation, and remote diagnostics.`
  )
  .join("\n")}

## Cooling Systems

- [Ethanol Chilling Systems](${SITE_URL}/ethanol-chilling-systems): Overview of Perma Cool direct refrigerant ethanol chillers for extraction facilities.
- [BLAST 60/45](${SITE_URL}/ethanol-chiller-blast-60): Compact system designed to chill 60 gallons of ethanol to -40 degrees Celsius in 45 minutes.
- [BLAST 150/45](${SITE_URL}/ethanol-chiller-blast-150): Mid-scale system designed to chill 150 gallons of ethanol to -40 degrees Celsius in 45 minutes.
- [BLAST 240/45](${SITE_URL}/ethanol-chiller-blast-240): High-volume system designed to chill 240 gallons of ethanol to -40 degrees Celsius in 45 minutes.
- [BLAST Model Comparison](${SITE_URL}/ethanol-chiller-comparison): Side-by-side overview of the 60/45, 150/45, and 240/45 systems.
- [Butane Recovery Systems](${SITE_URL}/butane-recovery-system): Commercial butane recovery equipment and process integration overview.

## Company And Contact

- [Perma Cool Home](${SITE_URL}/): Company, system, and extraction cooling overview.
- [Contact Perma Cool](${SITE_URL}/contact-us): Sales and system recommendation inquiries.
- Email: sales@perma.cool
- Phone: +1-747-208-1001

## Machine-Readable Resources

- [XML Sitemap](${SITE_URL}/sitemap.xml): Canonical public URL inventory with update dates.
- [Learning Center RSS Feed](${SITE_URL}/learning-center/feed.xml): Published article feed with titles, descriptions, dates, topics, and canonical links.
- [Robots Policy](${SITE_URL}/robots.txt): Crawler permissions and private-route exclusions.
`;

  return new Response(content, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400"
    }
  });
}
