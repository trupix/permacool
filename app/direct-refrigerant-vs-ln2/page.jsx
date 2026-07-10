import { StandardArticlePage } from "../insights/ArticlePage";
import { articlesBySlug } from "../insights/insights-data";

const article = articlesBySlug["direct-refrigerant-vs-ln2"];

export const metadata = {
  title: `${article.title} | PermaCool Insights`,
  description: article.description,
  alternates: { canonical: "https://perma.cool/direct-refrigerant-vs-ln2" }
};

export default function Page() {
  return <StandardArticlePage article={article} />;
}
