"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  CheckSquare2,
  Clock3,
  ExternalLink,
  Grid3X3,
  List,
  Newspaper,
  Search,
  Snowflake,
  Wrench,
  Workflow,
  X
} from "lucide-react";

const sectionIcons = {
  "temperature-science": Snowflake,
  "process-throughput": Workflow,
  "planning-economics": CheckSquare2,
  "operations-uptime": Wrench
};

const PAGE_SIZE = 9;

function articleSearchText(article) {
  return [
    article.title,
    article.shortTitle,
    article.summary,
    article.category,
    article.format,
    article.sectionLabel,
    article.searchText,
    ...article.tags
  ]
    .join(" ")
    .toLowerCase();
}

function ArticleMeta({ article }) {
  return (
    <div className="learning-article-meta">
      <span>{article.format}</span>
      <span aria-hidden="true">/</span>
      <span>
        <Clock3 size={14} aria-hidden="true" />
        {article.readTime} min read
      </span>
    </div>
  );
}

function FeaturedArticle({ article }) {
  if (!article) return null;

  return (
    <section className="learning-featured" aria-labelledby="featured-learning-heading">
      <div className="learning-section-heading">
        <div>
          <p className="eyebrow">Featured Lesson</p>
          <h2 id="featured-learning-heading">Start with one idea worth remembering.</h2>
        </div>
        <p>
          A clear, visual explanation of a useful scientific fact, connected to the temperatures extraction teams work
          with every day.
        </p>
      </div>

      <a className="learning-featured-story" href={article.href}>
        <div className="learning-featured-media">
          <Image
            src={article.image}
            alt={`${article.title} article cover`}
            fill
            sizes="(max-width: 760px) 100vw, 58vw"
          />
        </div>
        <div className="learning-featured-copy">
          <span className="learning-section-label">{article.sectionLabel}</span>
          <ArticleMeta article={article} />
          <h3>{article.title}</h3>
          <p>{article.summary}</p>
          <div className="learning-tag-row" aria-label="Article topics">
            {article.tags.map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>
          <strong className="learning-read-link">
            Read featured lesson
            <ArrowRight size={18} aria-hidden="true" />
          </strong>
        </div>
      </a>
    </section>
  );
}

function ArticleCard({ article }) {
  return (
    <article className="learning-library-card" data-section={article.librarySection}>
      <a href={article.href}>
        <div className="learning-card-media">
          <Image
            src={article.image}
            alt={`${article.title} article cover`}
            fill
            sizes="(max-width: 680px) 100vw, (max-width: 1080px) 50vw, 33vw"
          />
          <span className="learning-card-section">{article.sectionLabel}</span>
        </div>
        <div className="learning-card-copy">
          <ArticleMeta article={article} />
          <h3>{article.title}</h3>
          <p>{article.summary}</p>
          <div className="learning-tag-row" aria-label="Article topics">
            {article.tags.slice(0, 3).map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>
          <strong className="learning-read-link">
            Read article
            <ArrowRight size={17} aria-hidden="true" />
          </strong>
        </div>
      </a>
    </article>
  );
}

function ExternalResourceSpotlight({ resources }) {
  if (!resources?.length) return null;

  return (
    <section className="learning-external" aria-labelledby="external-learning-heading">
      <div className="learning-external-inner">
        <div className="learning-section-heading learning-external-heading">
          <div>
            <p className="eyebrow">Perma Cool In The Field</p>
            <h2 id="external-learning-heading">An independent look at how the controls evolved.</h2>
          </div>
          <p>
            Published outside the Perma Cool Learning Center, these resources offer another perspective on the systems,
            decisions, and people behind the equipment.
          </p>
        </div>

        <div className="learning-external-list">
          {resources.map((resource) => (
            <article className="learning-external-resource" key={resource.id}>
              <a
                className="learning-external-media"
                href={resource.articleUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Read ${resource.title} on ${resource.publisher} (opens in a new tab)`}
              >
                <Image
                  src={resource.image}
                  alt="Perma Cool industrial controls enclosure"
                  fill
                  sizes="(max-width: 760px) 100vw, 42vw"
                />
                <span>
                  <Newspaper size={16} aria-hidden="true" />
                  {resource.type}
                </span>
              </a>

              <div className="learning-external-copy">
                <div className="learning-external-meta">
                  <strong>Published by {resource.publisher}</strong>
                  <span>{resource.publishedLabel}</span>
                  <span>{resource.documentLabel}</span>
                </div>
                <h3>{resource.title}</h3>
                <p>{resource.summary}</p>
                <div className="learning-tag-row" aria-label="Case study topics">
                  {resource.topics.map((topic) => (
                    <span key={topic}>{topic}</span>
                  ))}
                </div>
                <div className="learning-external-actions">
                  <a
                    className="button primary"
                    href={resource.articleUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Read on {resource.publisher}
                    <ExternalLink size={17} aria-hidden="true" />
                  </a>
                  <a
                    className="learning-document-link"
                    href={resource.documentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Open the complete case study
                    <ExternalLink size={16} aria-hidden="true" />
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function LearningCenterLibrary({ articles, externalResources, sections }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSection, setActiveSection] = useState("all");
  const [activeFormat, setActiveFormat] = useState("all");
  const [sortOrder, setSortOrder] = useState("recommended");
  const [view, setView] = useState("grid");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const formats = useMemo(
    () => [...new Set(articles.map((article) => article.format))].sort((a, b) => a.localeCompare(b)),
    [articles]
  );

  const filteredArticles = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    const results = articles.filter((article) => {
      const matchesSearch = !normalizedQuery || articleSearchText(article).includes(normalizedQuery);
      const matchesSection = activeSection === "all" || article.librarySection === activeSection;
      const matchesFormat = activeFormat === "all" || article.format === activeFormat;
      return matchesSearch && matchesSection && matchesFormat;
    });

    return [...results].sort((a, b) => {
      if (sortOrder === "title") return a.title.localeCompare(b.title);
      if (sortOrder === "shortest") return a.readTime - b.readTime || a.title.localeCompare(b.title);
      return (a.featuredRank || 99) - (b.featuredRank || 99);
    });
  }, [activeFormat, activeSection, articles, searchQuery, sortOrder]);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [activeFormat, activeSection, searchQuery, sortOrder]);

  const featuredArticle = articles.find((article) => article.featuredRank === 1) || articles[0];
  const visibleArticles = filteredArticles.slice(0, visibleCount);
  const filtersActive = searchQuery || activeSection !== "all" || activeFormat !== "all";

  function chooseSection(sectionId) {
    setActiveSection(sectionId);
    document.getElementById("article-library")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function clearFilters() {
    setSearchQuery("");
    setActiveSection("all");
    setActiveFormat("all");
  }

  return (
    <>
      <FeaturedArticle article={featuredArticle} />

      <ExternalResourceSpotlight resources={externalResources} />

      <section className="learning-topic-index" aria-labelledby="learning-topics-heading">
        <div className="learning-section-heading">
          <div>
            <p className="eyebrow">Browse By Topic</p>
            <h2 id="learning-topics-heading">Follow the question you are trying to answer.</h2>
          </div>
          <p>
            The library is organized around the decisions extraction teams make: temperature, workflow, system
            planning, and dependable operation.
          </p>
        </div>

        <div className="learning-topic-grid">
          {sections.map((section) => {
            const Icon = sectionIcons[section.id] || BookOpen;
            const count = articles.filter((article) => article.librarySection === section.id).length;
            return (
              <button
                className={activeSection === section.id ? "active" : undefined}
                type="button"
                key={section.id}
                aria-pressed={activeSection === section.id}
                onClick={() => chooseSection(section.id)}
              >
                <Icon size={24} aria-hidden="true" />
                <span>
                  <strong>{section.label}</strong>
                  <small>{section.description}</small>
                </span>
                <b>{count}</b>
              </button>
            );
          })}
        </div>
      </section>

      <section className="learning-library" id="article-library" aria-labelledby="article-library-heading">
        <div className="learning-library-heading">
          <div>
            <p className="eyebrow">Article Library</p>
            <h2 id="article-library-heading">Every guide, clearly labeled.</h2>
          </div>
          <p>
            Search the full collection or narrow it by topic and format. Every article includes a plain-language
            description before you open it.
          </p>
        </div>

        <div className="learning-library-toolbar">
          <label className="learning-search">
            <Search size={19} aria-hidden="true" />
            <span className="sr-only">Search articles</span>
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search the article library"
            />
            {searchQuery ? (
              <button type="button" onClick={() => setSearchQuery("")} aria-label="Clear search" title="Clear search">
                <X size={17} aria-hidden="true" />
              </button>
            ) : null}
          </label>

          <label className="learning-select">
            <span>Format</span>
            <select value={activeFormat} onChange={(event) => setActiveFormat(event.target.value)}>
              <option value="all">All formats</option>
              {formats.map((format) => (
                <option value={format} key={format}>
                  {format}
                </option>
              ))}
            </select>
          </label>

          <label className="learning-select">
            <span>Sort</span>
            <select value={sortOrder} onChange={(event) => setSortOrder(event.target.value)}>
              <option value="recommended">Recommended</option>
              <option value="title">Title A-Z</option>
              <option value="shortest">Shortest read</option>
            </select>
          </label>

          <div className="learning-view-toggle" aria-label="Article view">
            <button
              className={view === "grid" ? "active" : undefined}
              type="button"
              onClick={() => setView("grid")}
              aria-label="Grid view"
              aria-pressed={view === "grid"}
              title="Grid view"
            >
              <Grid3X3 size={18} aria-hidden="true" />
            </button>
            <button
              className={view === "list" ? "active" : undefined}
              type="button"
              onClick={() => setView("list")}
              aria-label="List view"
              aria-pressed={view === "list"}
              title="List view"
            >
              <List size={19} aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className="learning-filter-row" aria-label="Filter articles by topic">
          <button
            className={activeSection === "all" ? "active" : undefined}
            type="button"
            aria-pressed={activeSection === "all"}
            onClick={() => setActiveSection("all")}
          >
            All topics
            <span>{articles.length}</span>
          </button>
          {sections.map((section) => {
            const count = articles.filter((article) => article.librarySection === section.id).length;
            return (
              <button
                className={activeSection === section.id ? "active" : undefined}
                type="button"
                aria-pressed={activeSection === section.id}
                key={section.id}
                onClick={() => setActiveSection(section.id)}
              >
                {section.label}
                <span>{count}</span>
              </button>
            );
          })}
        </div>

        <div className="learning-result-summary" aria-live="polite">
          <p>
            <strong>{filteredArticles.length}</strong> {filteredArticles.length === 1 ? "article" : "articles"}
            {activeSection !== "all"
              ? ` in ${sections.find((section) => section.id === activeSection)?.label || "this topic"}`
              : ""}
          </p>
          {filtersActive ? (
            <button type="button" onClick={clearFilters}>
              Clear filters
              <X size={15} aria-hidden="true" />
            </button>
          ) : null}
        </div>

        {visibleArticles.length ? (
          <div className={`learning-library-results ${view === "list" ? "list-view" : "grid-view"}`}>
            {visibleArticles.map((article) => (
              <ArticleCard article={article} key={article.slug} />
            ))}
          </div>
        ) : (
          <div className="learning-empty-state">
            <Search size={30} aria-hidden="true" />
            <h3>No articles match those filters.</h3>
            <p>Try a broader search or return to the complete article library.</p>
            <button className="button primary" type="button" onClick={clearFilters}>
              Show all articles
            </button>
          </div>
        )}

        {visibleCount < filteredArticles.length ? (
          <div className="learning-load-more">
            <button
              className="button secondary-dark"
              type="button"
              onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
            >
              Load more articles
              <ArrowRight size={18} aria-hidden="true" />
            </button>
          </div>
        ) : null}
      </section>
    </>
  );
}
