import { StandardArticlePage } from "../insights/ArticlePage";
import { articlesBySlug } from "../insights/insights-data";

const article = articlesBySlug["extraction-cooling-system-design-checklist"];

export const metadata = {
  title: `${article.title} | Perma Cool Insights`,
  description: article.description,
  alternates: { canonical: "https://perma.cool/extraction-cooling-system-design-checklist" }
};

export default function Page() {
  return <StandardArticlePage article={article} />;
}
