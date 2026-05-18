import { Minus40ArticlePage } from "../insights/ArticlePage";
import { articlesBySlug } from "../insights/insights-data";

const article = articlesBySlug["minus-40-celsius-fahrenheit"];

export const metadata = {
  title: `${article.title} | PermaCool Insights`,
  description: article.description
};

export default function Page() {
  return <Minus40ArticlePage article={article} />;
}
