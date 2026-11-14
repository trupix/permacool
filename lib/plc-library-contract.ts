export const LIBRARY_REPOSITORY = 'nyramyqueen/permacool-controller-library';
export const LIBRARY_WORKFLOW = `${LIBRARY_REPOSITORY}/.github/workflows/plc-operations-sync.yml@refs/heads/main`;
export const LIBRARY_AUDIENCE = 'https://perma.cool/api/plc-operations/sync';
export type LibraryDocument = { path: string; content: string; updatedAt: string };
export type LibrarySnapshot = { version: 1; revision: string; documents: LibraryDocument[] };
export const LIBRARY_CUSTOMERS = [{ id: 'baldwin-park', name: 'Baldwin Park' }, { id: 'golddrop', name: 'GoldDrop' }, { id: 'cannon-falls', name: 'Cannon Falls' }] as const;
export const CANNON_FALLS_NOTEBOOKS = ['customers/cannon-falls/notebooks/node-red-notebook.md', 'customers/cannon-falls/notebooks/website-notebook.md'];
export const GOLDDROP_NOTEBOOKS = ['customers/golddrop/notebooks/PAC and groov Change Notebook.md', 'customers/golddrop/notebooks/node-red-notebook.html', 'customers/golddrop/notebooks/dashboard-notebook.html', 'research/ke2-temp-valve/notebook.html'];

export function allowedLibraryPath(path: string) {
  return /^(?:standards\/[a-z0-9-]+\.md|customers\/(?:baldwin-park|golddrop|cannon-falls)\/(?:README|controller-notebook|build-profile|backups|release|standards-adoption)\.md|customers\/(?:baldwin-park|golddrop|cannon-falls)\/(?:changes|plans)\/[a-zA-Z0-9-]+\.md)$/.test(path) || GOLDDROP_NOTEBOOKS.includes(path) || CANNON_FALLS_NOTEBOOKS.includes(path);
}

export function validateLibrarySnapshot(value: unknown): LibrarySnapshot {
  const data = value as LibrarySnapshot;
  if (!data || data.version !== 1 || !/^[a-f0-9]{40}$/.test(data.revision) || !Array.isArray(data.documents) || data.documents.length > 200) throw new Error('Invalid snapshot');
  const seen = new Set<string>();
  for (const doc of data.documents) {
    if (!doc || typeof doc.path !== 'string' || !allowedLibraryPath(doc.path) || seen.has(doc.path) || typeof doc.content !== 'string' || doc.content.length > 300_000 || !Number.isFinite(Date.parse(doc.updatedAt))) throw new Error('Invalid document');
    // Defense in depth; this publication set must never contain credentials.
    if (/-----BEGIN .*PRIVATE KEY-----|\b(?:ghp_|github_pat_)[A-Za-z0-9_]+/.test(doc.content)) throw new Error('Sensitive content rejected');
    seen.add(doc.path);
  }
  for (const required of ['customers/baldwin-park/README.md', 'customers/baldwin-park/controller-notebook.md', 'standards/baseline.md']) {
    if (!seen.has(required)) throw new Error('Incomplete snapshot');
  }
  // Accept the prior Baldwin-only snapshot during rollout, but never partial GoldDrop imports.
  if (data.documents.some(doc => doc.path.startsWith('customers/golddrop/'))) {
    for (const required of ['customers/golddrop/README.md', 'customers/golddrop/build-profile.md', ...GOLDDROP_NOTEBOOKS]) if (!seen.has(required)) throw new Error('Incomplete GoldDrop snapshot');
  }
  if (data.documents.some(doc => doc.path.startsWith('customers/cannon-falls/'))) {
    for (const required of ['customers/cannon-falls/README.md', 'customers/cannon-falls/build-profile.md', 'customers/cannon-falls/controller-notebook.md', ...CANNON_FALLS_NOTEBOOKS]) if (!seen.has(required)) throw new Error('Incomplete Cannon Falls snapshot');
  }
  return data;
}

export function libraryDocumentTitle(doc: LibraryDocument) {
  if (doc.path.endsWith('/node-red-notebook.html')) return 'GoldDrop Node-RED notebook';
  if (doc.path.endsWith('/dashboard-notebook.html')) return 'GoldDrop website notebook';
  if (doc.path === 'research/ke2-temp-valve/notebook.html') return 'KE2 integration notebook · GoldDrop reference';
  return doc.content.match(/^#\s+(.+)$/m)?.[1] ?? doc.path.split('/').pop()!;
}

export function libraryUrl(revision: string, path: string) {
  return `https://github.com/${LIBRARY_REPOSITORY}/blob/${revision}/${path}`;
}

// Preserve the source wording, not a generated status interpretation.
export function openIssueSections(markdown: string) {
  return markdown.split(/(?=^## )/m).filter(section => /^## (?:Open issue|.*repair plan)/i.test(section));
}
