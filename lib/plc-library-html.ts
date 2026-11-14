import { unified } from 'unified';
import rehypeParse from 'rehype-parse';
import rehypeRemark from 'rehype-remark';
import remarkGfm from 'remark-gfm';
import remarkStringify from 'remark-stringify';
import type { Root, Element, RootContent } from 'hast';

// Parse as inert text on the server. Never embed a notebook iframe or raw HTML.
const blocked = new Set(['head', 'script', 'style', 'iframe', 'object', 'embed', 'form', 'input', 'button', 'textarea', 'select', 'svg', 'math', 'img', 'video', 'audio', 'source', 'link', 'meta']);
function documentationOnly() {
  return (tree: Root) => {
    const clean = (node: Root | Element) => {
      node.children = node.children.filter((child: RootContent) => child.type !== 'element' || !blocked.has(child.tagName)) as typeof node.children;
      for (const child of node.children) if (child.type === 'element') clean(child);
    };
    clean(tree);
  };
}
const converter = unified().use(rehypeParse).use(documentationOnly).use(rehypeRemark).use(remarkGfm).use(remarkStringify);
export function notebookHtmlToMarkdown(content: string) { return String(converter.processSync(content)); }
