'use client';

import { useMemo, useState } from 'react';
import {
  BookOpenCheck,
  Check,
  CircleAlert,
  Database,
  FileClock,
  Pencil,
  Plus,
  Search,
  SlidersHorizontal,
  Workflow,
  X
} from 'lucide-react';
import { logicCategoryLabels, logicStatusLabels } from '@/lib/equipment/logic-catalog';
import type {
  LogicDefinition,
  LogicDefinitionCategory,
  LogicImplementationStatus
} from '@/types/domain';

type DefinitionForm = {
  category: LogicDefinitionCategory;
  title: string;
  signalKey: string;
  definition: string;
  behavior: string;
  implementationStatus: LogicImplementationStatus;
};

const categories = Object.keys(logicCategoryLabels) as LogicDefinitionCategory[];
const statuses = Object.keys(logicStatusLabels) as LogicImplementationStatus[];

const emptyForm: DefinitionForm = {
  category: 'signal',
  title: '',
  signalKey: '',
  definition: '',
  behavior: '',
  implementationStatus: 'draft'
};

function formFromDefinition(definition: LogicDefinition): DefinitionForm {
  return {
    category: definition.category,
    title: definition.title,
    signalKey: definition.signalKey ?? '',
    definition: definition.definition,
    behavior: definition.behavior,
    implementationStatus: definition.implementationStatus
  };
}

function formatUpdatedAt(value: string) {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime()) || date.getTime() === 0) return 'Catalog default';
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  }).format(date);
}

function categoryIcon(category: LogicDefinitionCategory) {
  if (category === 'signal') return <SlidersHorizontal size={15} />;
  if (category === 'event') return <CircleAlert size={15} />;
  if (category === 'storage') return <Database size={15} />;
  if (category === 'display') return <BookOpenCheck size={15} />;
  return <Workflow size={15} />;
}

function DefinitionEditor({
  form,
  setForm,
  isSaving,
  editing,
  onCancel,
  onSave
}: {
  form: DefinitionForm;
  setForm: (form: DefinitionForm) => void;
  isSaving: boolean;
  editing: boolean;
  onCancel: () => void;
  onSave: () => void;
}) {
  const ready = form.title.trim() && form.definition.trim() && form.behavior.trim();

  return (
    <section id="logic-editor" className="logic-editor" aria-label={editing ? 'Edit logic definition' : 'Add logic definition'}>
      <header className="logic-editor__heading">
        <div>
          <p className="eyebrow">{editing ? 'Update specification' : 'Extend specification'}</p>
          <h2>{editing ? 'Edit logic definition' : 'Add a logic definition'}</h2>
        </div>
        <button type="button" className="logic-icon-button" onClick={onCancel} aria-label="Close editor">
          <X size={17} />
        </button>
      </header>

      <div className="logic-editor__grid">
        <label>
          <span>Title</span>
          <input
            value={form.title}
            maxLength={120}
            onChange={(event) => setForm({ ...form, title: event.target.value })}
            placeholder="Example: Low-pressure safety stop"
          />
        </label>
        <label>
          <span>PLC key or pattern <small>Optional</small></span>
          <input
            value={form.signalKey}
            maxLength={240}
            onChange={(event) => setForm({ ...form, signalKey: event.target.value })}
            placeholder="ch1_example / ch2_example"
          />
        </label>
        <label>
          <span>Category</span>
          <select
            value={form.category}
            onChange={(event) => setForm({ ...form, category: event.target.value as LogicDefinitionCategory })}
          >
            {categories.map((category) => <option key={category} value={category}>{logicCategoryLabels[category]}</option>)}
          </select>
        </label>
        <label>
          <span>Implementation status</span>
          <select
            value={form.implementationStatus}
            onChange={(event) => setForm({ ...form, implementationStatus: event.target.value as LogicImplementationStatus })}
          >
            {statuses.map((status) => <option key={status} value={status}>{logicStatusLabels[status]}</option>)}
          </select>
        </label>
        <label className="logic-editor__wide">
          <span>Definition</span>
          <textarea
            value={form.definition}
            maxLength={2_000}
            onChange={(event) => setForm({ ...form, definition: event.target.value })}
            placeholder="What this signal, state, or rule means."
            rows={3}
          />
        </label>
        <label className="logic-editor__wide">
          <span>Dashboard and control behavior</span>
          <textarea
            value={form.behavior}
            maxLength={3_000}
            onChange={(event) => setForm({ ...form, behavior: event.target.value })}
            placeholder="How the dashboard, event system, or alarm engine should respond."
            rows={4}
          />
        </label>
      </div>

      <footer className="logic-editor__actions">
        <p><CircleAlert size={14} /> Specification edits do not reprogram the PLC or deploy application code.</p>
        <div>
          <button type="button" className="logic-button logic-button--secondary" onClick={onCancel}>Cancel</button>
          <button
            type="button"
            className="logic-button logic-button--primary"
            onClick={onSave}
            disabled={!ready || isSaving}
          >
            <Check size={15} /> {isSaving ? 'Saving…' : 'Save definition'}
          </button>
        </div>
      </footer>
    </section>
  );
}

export function LogicDefinitionWorkspace({
  initialDefinitions,
  persistenceReady,
  currentUserName
}: {
  initialDefinitions: LogicDefinition[];
  persistenceReady: boolean;
  currentUserName: string;
}) {
  const [definitions, setDefinitions] = useState(initialDefinitions);
  const [category, setCategory] = useState<'all' | LogicDefinitionCategory>('all');
  const [query, setQuery] = useState('');
  const [editorMode, setEditorMode] = useState<'closed' | 'add' | 'edit'>('closed');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<DefinitionForm>(emptyForm);
  const [isSaving, setIsSaving] = useState(false);
  const [notice, setNotice] = useState<{ tone: 'success' | 'error'; text: string } | null>(null);

  const counts = useMemo(() => ({
    deployed: definitions.filter((item) => item.implementationStatus === 'deployed').length,
    draft: definitions.filter((item) => item.implementationStatus === 'draft').length,
    signals: definitions.filter((item) => item.category === 'signal').length
  }), [definitions]);

  const visibleDefinitions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return definitions.filter((item) => {
      if (category !== 'all' && item.category !== category) return false;
      if (!normalizedQuery) return true;
      return [item.title, item.signalKey, item.definition, item.behavior]
        .filter(Boolean)
        .some((value) => value?.toLowerCase().includes(normalizedQuery));
    });
  }, [category, definitions, query]);

  function openAdd() {
    setForm(emptyForm);
    setEditingId(null);
    setEditorMode('add');
    setNotice(null);
    window.requestAnimationFrame(() => document.getElementById('logic-editor')?.scrollIntoView({ behavior: 'smooth', block: 'center' }));
  }

  function openEdit(definition: LogicDefinition) {
    setForm(formFromDefinition(definition));
    setEditingId(definition.id);
    setEditorMode('edit');
    setNotice(null);
    window.requestAnimationFrame(() => document.getElementById('logic-editor')?.scrollIntoView({ behavior: 'smooth', block: 'center' }));
  }

  function closeEditor() {
    setEditorMode('closed');
    setEditingId(null);
    setForm(emptyForm);
  }

  async function saveDefinition() {
    if (!persistenceReady || isSaving) return;
    setIsSaving(true);
    setNotice(null);
    const editing = editorMode === 'edit' && editingId;

    try {
      const response = await fetch(editing ? `/api/logic-definitions/${editingId}` : '/api/logic-definitions', {
        method: editing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const payload = await response.json() as { definition?: LogicDefinition; error?: string };
      if (!response.ok || !payload.definition) throw new Error(payload.error || 'Definition could not be saved.');

      setDefinitions((current) => {
        const next = editing
          ? current.map((item) => item.id === payload.definition?.id ? payload.definition : item)
          : [...current, payload.definition as LogicDefinition];
        return next.sort((left, right) => left.sortOrder - right.sortOrder || left.title.localeCompare(right.title));
      });
      setNotice({
        tone: 'success',
        text: `${payload.definition.title} was saved by ${currentUserName}.`
      });
      closeEditor();
    } catch (error) {
      setNotice({ tone: 'error', text: error instanceof Error ? error.message : 'Definition could not be saved.' });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <>
      <section className="logic-page__overview">
        <div className="logic-page__overview-copy">
          <span className="logic-page__overview-icon"><BookOpenCheck size={22} /></span>
          <div>
            <p className="eyebrow">Living control specification</p>
            <h2>{definitions.length} documented definitions</h2>
            <p>Review what the PLC sends, what the dashboard derives, and exactly when events or alarms are created.</p>
          </div>
        </div>
        <div className="logic-page__stats" aria-label="Logic catalog summary">
          <div><strong>{counts.signals}</strong><span>PLC signals</span></div>
          <div><strong>{counts.deployed}</strong><span>Deployed</span></div>
          <div><strong>{counts.draft}</strong><span>Drafts</span></div>
        </div>
        <button type="button" className="logic-button logic-button--add" onClick={openAdd} disabled={!persistenceReady}>
          <Plus size={16} /> Add definition
        </button>
      </section>

      <div className="logic-specification-note">
        <CircleAlert size={17} />
        <p><strong>Specification versus execution:</strong> saved changes update this permanent operations record and audit trail. PLC code and deployed alarm logic change only after the corresponding implementation is reviewed, tested, and deployed.</p>
      </div>

      {!persistenceReady ? (
        <div className="ops-notice">Logic storage is not connected. The verified default catalog is readable, but editing is disabled until the production database is available.</div>
      ) : null}
      {notice ? <div className={`logic-notice is-${notice.tone}`}>{notice.tone === 'success' ? <Check size={16} /> : <CircleAlert size={16} />}{notice.text}</div> : null}

      {editorMode !== 'closed' ? (
        <DefinitionEditor
          form={form}
          setForm={setForm}
          isSaving={isSaving}
          editing={editorMode === 'edit'}
          onCancel={closeEditor}
          onSave={saveDefinition}
        />
      ) : null}

      <section className="panel logic-catalog">
        <header className="logic-catalog__toolbar">
          <div className="logic-search">
            <Search size={16} aria-hidden="true" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search signals, rules, or behavior"
              aria-label="Search logic definitions"
            />
          </div>
          <div className="logic-category-filter" aria-label="Filter definitions by category">
            <button type="button" className={category === 'all' ? 'is-active' : ''} onClick={() => setCategory('all')}>All <span>{definitions.length}</span></button>
            {categories.map((item) => (
              <button type="button" key={item} className={category === item ? 'is-active' : ''} onClick={() => setCategory(item)}>
                {logicCategoryLabels[item]} <span>{definitions.filter((definition) => definition.category === item).length}</span>
              </button>
            ))}
          </div>
        </header>

        <div className="logic-definition-list">
          {visibleDefinitions.map((definition) => (
            <article className="logic-definition-card" key={definition.id}>
              <header>
                <div className={`logic-category-icon is-${definition.category}`}>{categoryIcon(definition.category)}</div>
                <div className="logic-definition-card__title">
                  <span>{logicCategoryLabels[definition.category]}</span>
                  <h3>{definition.title}</h3>
                </div>
                <span className={`logic-status is-${definition.implementationStatus}`}>{logicStatusLabels[definition.implementationStatus]}</span>
                <button
                  type="button"
                  className="logic-edit-button"
                  onClick={() => openEdit(definition)}
                  disabled={!persistenceReady}
                >
                  <Pencil size={14} /> Edit
                </button>
              </header>
              {definition.signalKey ? <code className="logic-signal-key">{definition.signalKey}</code> : null}
              <div className="logic-definition-card__body">
                <div>
                  <span>Definition</span>
                  <p>{definition.definition}</p>
                </div>
                <div>
                  <span>Behavior</span>
                  <p>{definition.behavior}</p>
                </div>
              </div>
              <footer>
                <span><FileClock size={13} /> Updated {formatUpdatedAt(definition.updatedAt)}</span>
                <span>{definition.updatedBy ? `by ${definition.updatedBy}` : 'Editor not recorded'}</span>
              </footer>
            </article>
          ))}
          {!visibleDefinitions.length ? (
            <div className="logic-empty-state">
              <Search size={22} />
              <strong>No definitions match this view</strong>
              <p>Clear the search or select another category.</p>
            </div>
          ) : null}
        </div>
      </section>
    </>
  );
}
