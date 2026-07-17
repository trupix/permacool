import { StandardArticlePage } from "../insights/ArticlePage";
import { articlesBySlug } from "../insights/insights-data";
import { buildArticleMetadata } from "../../lib/site";

const article = articlesBySlug["how-to-reduce-ln2-dependence"];

export const metadata = buildArticleMetadata(article);

export default function Page() {
  return <StandardArticlePage article={article} />;
}
