import { StandardArticlePage } from "../insights/ArticlePage";
import { articlesBySlug } from "../insights/insights-data";

const article = articlesBySlug["extraction-cooling-system-design-checklist"];

export const metadata = {
  title: `${article.title} | PermaCool Insights`,
  description: article.description
};

export default function Page() {
  return <StandardArticlePage article={article} />;
}
