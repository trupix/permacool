import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import path from 'node:path';
import { libraryUrl, type LibraryDocument } from '@/lib/plc-library-contract';
import { notebookHtmlToMarkdown } from '@/lib/plc-library-html';

export function PlcLibraryDocument({ document, revision, content }: { document: LibraryDocument; revision: string; content?: string }) {
  const text = content ?? (document.path.endsWith('.html') ? notebookHtmlToMarkdown(document.content) : document.content);
  return <Markdown remarkPlugins={[remarkGfm]} skipHtml urlTransform={(url) => {
    if (url.startsWith('#')) return libraryUrl(revision, document.path) + url;
    if (/^https:\/\//i.test(url)) { try { const target = new URL(url); return !target.username && !target.password ? url : ''; } catch { return ''; } }
    if (/^[a-z][a-z0-9+.-]*:/i.test(url) || url.startsWith('//') || url.startsWith('/')) return '';
    const normalized = path.posix.normalize(path.posix.join(path.posix.dirname(document.path), url));
    return normalized.startsWith('../') ? '' : libraryUrl(revision, normalized);
  }} components={{ img: () => null, a: ({ children, href }) => href ? <a href={href} target="_blank" rel="noopener noreferrer">{children}</a> : <span>{children}</span>, table: ({ children }) => <div style={{ overflowX: 'auto' }}><table>{children}</table></div> }}>{text}</Markdown>;
}
