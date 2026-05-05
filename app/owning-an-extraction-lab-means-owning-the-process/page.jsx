import { ProcessOwnershipArticlePage } from "../insights/ArticlePage";
import { articlesBySlug } from "../insights/insights-data";

const article = articlesBySlug["owning-an-extraction-lab-means-owning-the-process"];

export const metadata = {
  title: `${article.title} | PermaCool Insights`,
  description: article.description
};

export default function Page() {
  return <ProcessOwnershipArticlePage article={article} />;
}
