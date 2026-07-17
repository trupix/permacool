import { Minus40ArticlePage } from "../insights/ArticlePage";
import { articlesBySlug } from "../insights/insights-data";
import { buildArticleMetadata } from "../../lib/site";

const article = articlesBySlug["minus-40-celsius-fahrenheit"];

export const metadata = buildArticleMetadata(article);

export default function Page() {
  return <Minus40ArticlePage article={article} />;
}
