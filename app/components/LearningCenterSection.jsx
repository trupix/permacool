import Image from "next/image";
import { ArrowRight, BookOpen } from "lucide-react";
import { insightArticles } from "../insights/insights-data";

const featuredSlugs = [
  "minus-40-celsius-fahrenheit",
  "direct-refrigerant-vs-ln2",
  "how-to-reduce-ln2-dependence"
];

const featuredArticles = featuredSlugs
  .map((slug) => insightArticles.find((article) => article.slug === slug))
  .filter(Boolean);

export default function LearningCenterSection() {
  return (
    <section className="learning-center-section" aria-labelledby="learning-center-heading">
      <div className="learning-center-copy">
        <p className="eyebrow">Learning Center</p>
        <h2 id="learning-center-heading">Extraction cooling education before the quote conversation.</h2>
        <p>
          Compare chilling methods, reduce LN2 dependency, and plan system fit with practical guides built for
          extraction operators.
        </p>
        <a className="button primary" href="/learning-center">
          Visit Learning Center
          <ArrowRight size={18} aria-hidden="true" />
        </a>
      </div>
      <div className="learning-center-card-grid">
        {featuredArticles.map((article) => (
          <a className="learning-center-card" href={article.href} key={article.slug}>
            <Image src={article.image} alt="" width={520} height={340} />
            <span>{article.category}</span>
            <strong>{article.shortTitle}</strong>
          </a>
        ))}
      </div>
      <BookOpen className="learning-center-mark" size={84} aria-hidden="true" />
    </section>
  );
}
