import { StandardArticlePage } from "../insights/ArticlePage";
import { articlesBySlug } from "../insights/insights-data";

const article = articlesBySlug["industrial-process-chiller-maintenance"];

export const metadata = {
  title: `${article.title} | Perma Cool Insights`,
  description: article.description,
  alternates: { canonical: "https://perma.cool/industrial-process-chiller-maintenance" }
};

export default function Page() {
  return <StandardArticlePage article={article} />;
}
