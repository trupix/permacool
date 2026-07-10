import { StandardArticlePage } from "../insights/ArticlePage";
import { articlesBySlug } from "../insights/insights-data";

const article = articlesBySlug["how-to-reduce-ln2-dependence"];

export const metadata = {
  title: `${article.title} | PermaCool`,
  description: article.description,
  alternates: { canonical: "https://perma.cool/how-to-reduce-ln2-dependence" }
};

export default function Page() {
  return <StandardArticlePage article={article} />;
}
