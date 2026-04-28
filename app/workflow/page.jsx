import { WorkflowArticlePage } from "../insights/ArticlePage";
import { articlesBySlug } from "../insights/insights-data";

const article = articlesBySlug.workflow;

export const metadata = {
  title: `${article.title} | PermaCool Insights`,
  description: article.description
};

export default function Page() {
  return <WorkflowArticlePage article={article} />;
}
