import { MoreOutputPerGallonArticlePage } from "../insights/ArticlePage";
import { articlesBySlug } from "../insights/insights-data";

const article = articlesBySlug["more-output-per-gallon"];

export const metadata = {
  title: `${article.title} | PermaCool Insights`,
  description: article.description
};

export default function Page() {
  return <MoreOutputPerGallonArticlePage article={article} />;
}
