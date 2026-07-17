import { ProcessOwnershipArticlePage } from "../insights/ArticlePage";
import { articlesBySlug } from "../insights/insights-data";
import { buildArticleMetadata } from "../../lib/site";

const article = articlesBySlug["owning-an-extraction-lab-means-owning-the-process"];

export const metadata = buildArticleMetadata(article);

export default function Page() {
  return <ProcessOwnershipArticlePage article={article} />;
}
