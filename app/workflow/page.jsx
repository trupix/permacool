import { WorkflowArticlePage } from "../insights/ArticlePage";
import { articlesBySlug } from "../insights/insights-data";
import { buildArticleMetadata } from "../../lib/site";

const article = articlesBySlug.workflow;

export const metadata = buildArticleMetadata(article);

export default function Page() {
  return <WorkflowArticlePage article={article} />;
}
