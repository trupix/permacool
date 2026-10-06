"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  assetStates,
  partStates,
  workStates,
  safeSource,
  type CatalogSnapshot,
  type LabAsset,
  type LabCatalog,
  type LabItem,
} from "@/lib/lab-catalog";

const today = () =>
  new Date().toLocaleDateString("en-CA", { timeZone: "America/Los_Angeles" });
const uid = () => crypto.randomUUID();
const label = (value: string) => value || "Not recorded";
function Source({ url, children }: { url: string; children: React.ReactNode }) {
  const href = safeSource(url);
  return href ? (
    <a href={href} target="_blank" rel="noreferrer">
      {children} ↗
    </a>
  ) : null;
}

export function LabPortal({
  initial,
  canEdit,
  author,
  preview,
}: {
  initial: CatalogSnapshot;
  canEdit: boolean;
  author: string;
  preview: boolean;
}) {
  const [snapshot, setSnapshot] = useState(initial);
  const [section, setSection] = useState("Catalog");
  const [kind, setKind] = useState("Freezer");
  const [query, setQuery] = useState("");
  const [state, setState] = useState("All states");
  const [selected, setSelected] = useState<string | null>(null);
  const [tab, setTab] = useState("Overview");
  const [form, setForm] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const catalog = snapshot.catalog;
  const asset = catalog.assets.find((item) => item.id === selected);
  const modalOpen = Boolean(asset || form === "equipment");
  useEffect(() => {
    if (!modalOpen) return;
    const previous = document.activeElement as HTMLElement | null;
    const background = document.querySelectorAll<HTMLElement>(
      ".lab-sidebar, .lab-main",
    );
    background.forEach((element) => {
      element.inert = true;
    });
    const trap = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;
      const nodes = Array.from(
        document.querySelectorAll<HTMLElement>(
          ".lab-detail button:not(:disabled), .lab-detail a[href], .lab-detail input, .lab-detail select, .lab-detail textarea",
        ),
      );
      const first = nodes[0],
        last = nodes[nodes.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };
    document.addEventListener("keydown", trap);
    return () => {
      background.forEach((element) => {
        element.inert = false;
      });
      document.removeEventListener("keydown", trap);
      previous?.focus();
    };
  }, [modalOpen]);
  const filtered = useMemo(
    () =>
      catalog.assets.filter(
        (item) =>
          (kind === "All equipment" || item.kind === kind) &&
          (state === "All states" || item.status === state) &&
          `${item.name} ${item.brand} ${item.model} ${item.serial} ${item.location}`
            .toLowerCase()
            .includes(query.toLowerCase()),
      ),
    [catalog, kind, query, state],
  );
  const openWork = catalog.assets.reduce(
    (n, item) => n + item.tasks.filter((t) => t.status !== "Completed").length,
    0,
  );
  async function save(next: LabCatalog) {
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch("/api/lab/catalog", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ revision: snapshot.revision, catalog: next }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Save failed.");
      setSnapshot({ catalog: next, revision: result.revision });
      setForm(null);
      setMessage("Saved.");
      return true;
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Save failed.");
      return false;
    } finally {
      setBusy(false);
    }
  }
  function updateAsset(next: LabAsset) {
    return save({
      ...catalog,
      assets: catalog.assets.map((item) => (item.id === next.id ? next : item)),
    });
  }
  function select(id: string) {
    setSelected(id);
    setTab("Overview");
    setForm(null);
    setMessage("");
  }
  function exportCatalog() {
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(snapshot, null, 2)], {
        type: "application/json",
      }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = `lab-equipment-${today()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }
  async function matchRecord(event: FormEvent<HTMLFormElement>, item: LabItem) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const target = catalog.assets.find(
      (entry) => entry.id === data.get("equipment"),
    );
    if (!target) return;
    const key = data.get("category") as "tasks" | "parts" | "history";
    const status =
      key === "tasks"
        ? "Open"
        : key === "parts"
          ? "To identify"
          : "Source note";
    await save({
      ...catalog,
      unmatched: catalog.unmatched.filter((entry) => entry.id !== item.id),
      assets: catalog.assets.map((entry) =>
        entry.id === target.id
          ? {
              ...entry,
              [key]: [
                {
                  ...item,
                  status,
                  detail: `${item.detail}\n\nMatched to this equipment by ${author} on ${today()}. Original source status: ${item.status}`,
                },
                ...entry[key],
              ],
            }
          : entry,
      ),
    });
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const get = (name: string) => String(data.get(name) || "").trim();
    if (form === "equipment" || form === "edit") {
      const next: LabAsset = {
        id: asset && form === "edit" ? asset.id : uid(),
        name: get("name"),
        kind: get("kind") as LabAsset["kind"],
        location: get("location"),
        brand: get("brand"),
        model: get("model"),
        serial: get("serial"),
        electrical: get("electrical"),
        refrigerant: get("refrigerant"),
        charge: get("charge"),
        pressure: get("pressure"),
        notes: get("notes"),
        source: get("source"),
        sourceRow: asset && form === "edit" ? asset.sourceRow : "",
        status: asset && form === "edit" ? asset.status : "Unknown",
        statusDate: asset && form === "edit" ? asset.statusDate : "",
        tasks: asset && form === "edit" ? asset.tasks : [],
        parts: asset && form === "edit" ? asset.parts : [],
        history: asset && form === "edit" ? asset.history : [],
      };
      const ok =
        form === "edit"
          ? await updateAsset(next)
          : await save({ ...catalog, assets: [...catalog.assets, next] });
      if (ok) {
        setSelected(next.id);
        setSection("Catalog");
        setKind("All equipment");
      }
    } else if (asset && form === "status") {
      const status = get("status") as LabAsset["status"];
      await updateAsset({
        ...asset,
        status,
        statusDate: get("date"),
        history: [
          {
            id: uid(),
            title: `State updated: ${status}`,
            status: "Observation",
            date: get("date"),
            detail: get("detail"),
            reference: "",
            author,
          },
          ...asset.history,
        ],
      });
    } else if (asset && form && ["tasks", "parts", "history"].includes(form)) {
      const key = form as "tasks" | "parts" | "history";
      const entry: LabItem = {
        id: uid(),
        title: get("title"),
        status: get("status"),
        date: get("date"),
        detail: get("detail"),
        reference: get("reference"),
        author,
      };
      await updateAsset({ ...asset, [key]: [entry, ...asset[key]] });
    }
  }
  function itemList(items: LabItem[], key?: "tasks" | "parts" | "history") {
    if (!items.length)
      return (
        <div className="lab-empty">
          <span>Nothing recorded yet</span>
          <p>
            {key === "history"
              ? "Add dated inspections, repairs, and completed work here."
              : "Add details as they are verified for this unit."}
          </p>
        </div>
      );
    return (
      <div className="lab-items">
        {items.map((item) => (
          <article key={item.id}>
            <div className="lab-item-top">
              <span className="lab-badge">{item.status}</span>
              <time>{item.date || "Date not recorded"}</time>
            </div>
            <h3>{item.title}</h3>
            <p>{item.detail}</p>
            <div className="lab-item-bottom">
              <small>{item.author}</small>
              <Source url={item.reference}>Source record</Source>
            </div>
            {canEdit && asset && key && key !== "history" && (
              <label className="lab-inline-label">
                Progress
                <select
                  aria-label={`Progress for ${item.title}`}
                  value={item.status}
                  disabled={busy}
                  onChange={(event) => {
                    const status = event.target.value;
                    void updateAsset({
                      ...asset,
                      [key]: asset[key].map((entry) =>
                        entry.id === item.id ? { ...entry, status } : entry,
                      ),
                      history: [
                        {
                          id: uid(),
                          title: `${item.title}: ${status}`,
                          status: "Progress update",
                          date: today(),
                          detail: `Previous progress: ${item.status}.`,
                          reference: "",
                          author,
                        },
                        ...asset.history,
                      ],
                    });
                  }}
                >
                  {(key === "tasks" ? workStates : partStates).map((value) => (
                    <option key={value}>{value}</option>
                  ))}
                </select>
              </label>
            )}
            {canEdit && !key && section === "Needs matching" && (
              <form
                className="lab-match"
                onSubmit={(event) => void matchRecord(event, item)}
              >
                <label>
                  Equipment
                  <select name="equipment" required>
                    <option value="">Choose verified unit</option>
                    {catalog.assets.map((entry) => (
                      <option key={entry.id} value={entry.id}>
                        {entry.name} · {entry.serial || "serial unknown"}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Add as
                  <select name="category">
                    <option value="tasks">Work needed</option>
                    <option value="parts">Replacement part</option>
                    <option value="history">Source note in history</option>
                  </select>
                </label>
                <button disabled={busy}>Match to equipment</button>
              </form>
            )}
          </article>
        ))}
      </div>
    );
  }
  const formAsset = form === "edit" ? asset : undefined;
  return (
    <div className="lab-app">
      <aside className="lab-sidebar">
        <a className="lab-brand" href="/lab">
          <img
            src="/images/brand/perma-cool.png"
            width="38"
            height="38"
            alt=""
          />
          <span>
            PERMA COOL<small>LAB SERVICE PORTAL</small>
          </span>
        </a>
        <div className="lab-workspace">
          <span className="lab-square">L</span>
          <div>
            {catalog.title}
            <small>Equipment workspace</small>
          </div>
        </div>
        <p className="lab-nav-label">WORKSPACE</p>
        <nav>
          {[
            "Catalog",
            "Work needed",
            "Replacement parts",
            "Service history",
            "Needs matching",
          ].map((name, i) => (
            <button
              key={name}
              className={section === name ? "active" : ""}
              onClick={() => {
                setSection(name);
                setSelected(null);
                setForm(null);
              }}
            >
              <span aria-hidden="true">{["▤", "☑", "⚙", "◷", "◇"][i]}</span>
              {name}
              {name === "Needs matching" && <b>{catalog.unmatched.length}</b>}
            </button>
          ))}
        </nav>
        <div className="lab-sidebar-foot">
          <span className="lab-dot" /> Private lab workspace
          <small>
            {preview
              ? "Local preview • saved on this computer"
              : canEdit
                ? "Editing enabled"
                : "View access"}
          </small>
        </div>
      </aside>
      <main className="lab-main">
        <header className="lab-topbar">
          <span>
            Workspace <span className="lab-slash">/</span> {section}
          </span>
          <span className="lab-account">{author}</span>
        </header>
        <div className="lab-content">
          <div className="lab-heading">
            <div>
              <p className="lab-eyebrow">PERMA COOL / EQUIPMENT CARE</p>
              <h1>
                {section === "Catalog" ? "Cold storage, in focus." : section}
              </h1>
              <p>
                {section === "Catalog"
                  ? "Every unit. Every part. Every service visit."
                  : section === "Needs matching"
                    ? "Source records waiting to be linked to the correct equipment."
                    : "A shared view across your lab equipment."}
              </p>
            </div>
            <div className="lab-actions">
              <button onClick={exportCatalog}>Export records ↓</button>
              {canEdit && (
                <button
                  className="lab-primary"
                  onClick={() => {
                    setSelected(null);
                    setForm("equipment");
                  }}
                >
                  ＋ Add equipment
                </button>
              )}
            </div>
          </div>
          {preview && (
            <div className="lab-notice">
              Preview on this computer. Records are saved locally; shared access
              starts when the portal is connected to the lab database.
            </div>
          )}
          <div
            role="status"
            aria-live="polite"
            className={message ? "lab-message" : ""}
          >
            {message}
          </div>
          <section className="lab-stats" aria-label="Catalog overview">
            <div>
              <span>Equipment cataloged</span>
              <strong>
                {catalog.assets.length.toString().padStart(2, "0")}
              </strong>
              <small>
                {catalog.assets.filter((a) => a.kind === "Freezer").length}{" "}
                freezers ·{" "}
                {catalog.assets.filter((a) => a.kind !== "Freezer").length}{" "}
                other cold storage
              </small>
            </div>
            <div>
              <span>Needs attention</span>
              <strong>
                {catalog.assets
                  .filter((a) =>
                    ["Needs attention", "Out of service"].includes(a.status),
                  )
                  .length.toString()
                  .padStart(2, "0")}
              </strong>
              <small>Confirmed equipment states</small>
            </div>
            <div>
              <span>Open work items</span>
              <strong>{openWork.toString().padStart(2, "0")}</strong>
              <small>Assigned to equipment</small>
            </div>
            <div>
              <span>State not verified</span>
              <strong>
                {catalog.assets
                  .filter((a) => a.status === "Unknown")
                  .length.toString()
                  .padStart(2, "0")}
              </strong>
              <small>Awaiting a dated condition check</small>
            </div>
          </section>
          {section === "Catalog" ? (
            <section className="lab-catalog">
              <div className="lab-toolbar">
                <div className="lab-segments">
                  {[
                    "Freezer",
                    "Refrigerator",
                    "Combination",
                    "All equipment",
                  ].map((value) => (
                    <button
                      key={value}
                      aria-pressed={kind === value}
                      className={kind === value ? "active" : ""}
                      onClick={() => setKind(value)}
                    >
                      {value === "Freezer"
                        ? "Freezers"
                        : value === "Refrigerator"
                          ? "Refrigerators"
                          : value}
                    </button>
                  ))}
                </div>
                <div className="lab-filters">
                  <input
                    aria-label="Search equipment"
                    placeholder="Search model, serial, location…"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                  <select
                    aria-label="Filter equipment state"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                  >
                    {["All states", ...assetStates].map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="lab-table-wrap">
                <table className="lab-table">
                  <thead>
                    <tr>
                      <th>Equipment</th>
                      <th>Location</th>
                      <th>Model / serial</th>
                      <th>Current state</th>
                      <th>Open work</th>
                      <th>
                        <span className="lab-sr-only">Details</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((item) => (
                      <tr key={item.id}>
                        <td>
                          <button
                            className="lab-unit-button"
                            onClick={() => select(item.id)}
                          >
                            <span
                              className="lab-freezer-icon"
                              aria-hidden="true"
                            >
                              ▥
                            </span>
                            <span>
                              {item.name}
                              <small>{label(item.brand)}</small>
                            </span>
                          </button>
                        </td>
                        <td>{label(item.location)}</td>
                        <td>
                          <span className="lab-model">{label(item.model)}</span>
                          <small>{label(item.serial)}</small>
                        </td>
                        <td>
                          <span
                            className={`lab-badge ${item.status === "Operating" ? "good" : item.status === "Unknown" ? "" : "attention"}`}
                          >
                            {item.status}
                          </span>
                          <small>
                            {item.statusDate
                              ? `Checked ${item.statusDate}`
                              : "No condition check recorded"}
                          </small>
                        </td>
                        <td>
                          {
                            item.tasks.filter((t) => t.status !== "Completed")
                              .length
                          }
                        </td>
                        <td>
                          <button
                            aria-label={`View ${item.name}`}
                            onClick={() => select(item.id)}
                          >
                            ↗
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {!filtered.length && (
                  <div className="lab-empty">
                    <span>No equipment matches</span>
                    <p>Try another filter or add your first unit.</p>
                  </div>
                )}
              </div>
              <div className="lab-table-footer">
                {filtered.length} units shown
                <span>
                  States are recorded observations, not live telemetry.
                </span>
              </div>
            </section>
          ) : section === "Needs matching" ? (
            itemList(catalog.unmatched)
          ) : (
            <div className="lab-cross-list">
              {catalog.assets
                .filter(
                  (a) =>
                    a[
                      section === "Work needed"
                        ? "tasks"
                        : section === "Replacement parts"
                          ? "parts"
                          : "history"
                    ].length,
                )
                .map((a) => (
                  <section key={a.id}>
                    <button
                      className="lab-text-button"
                      onClick={() => select(a.id)}
                    >
                      {a.name} ↗
                    </button>
                    {itemList(
                      a[
                        section === "Work needed"
                          ? "tasks"
                          : section === "Replacement parts"
                            ? "parts"
                            : "history"
                      ],
                    )}
                  </section>
                ))}
              {!catalog.assets.some(
                (a) =>
                  a[
                    section === "Work needed"
                      ? "tasks"
                      : section === "Replacement parts"
                        ? "parts"
                        : "history"
                  ].length,
              ) && (
                <div className="lab-empty">
                  <span>No records assigned yet</span>
                  <p>
                    Open an equipment record to add an entry. Check “Needs
                    matching” for unassigned source notes.
                  </p>
                </div>
              )}
            </div>
          )}
          <footer className="lab-bottom">
            PERMA COOL{" "}
            <span>Equipment records that stay with the equipment.</span>
          </footer>
        </div>
      </main>
      {(asset || form === "equipment") && (
        <div className="lab-overlay">
          <section
            className="lab-detail"
            role="dialog"
            aria-modal="true"
            aria-label={asset?.name || "Add equipment"}
            onKeyDown={(event) => {
              if (event.key === "Escape" && !busy) {
                setSelected(null);
                setForm(null);
              }
            }}
          >
            <header>
              <div>
                <p className="lab-eyebrow">EQUIPMENT RECORD</p>
                <h2>{form === "equipment" ? "Add equipment" : asset?.name}</h2>
                <p>
                  {asset?.brand} {asset?.model}
                </p>
              </div>
              <button
                autoFocus
                aria-label="Close equipment record"
                disabled={busy}
                onClick={() => {
                  setSelected(null);
                  setForm(null);
                }}
              >
                ✕
              </button>
            </header>
            {form ? (
              <form className="lab-form" onSubmit={submit}>
                <h3>
                  {form === "equipment"
                    ? "Equipment details"
                    : form === "edit"
                      ? "Edit equipment"
                      : form === "status"
                        ? "Record a condition check"
                        : `Add ${form === "tasks" ? "work needed" : form === "parts" ? "replacement part" : "service entry"}`}
                </h3>
                {["equipment", "edit"].includes(form) ? (
                  <>
                    <div className="lab-form-grid">
                      <label>
                        Name
                        <input
                          name="name"
                          required
                          maxLength={150}
                          defaultValue={formAsset?.name}
                        />
                      </label>
                      <label>
                        Type
                        <select
                          name="kind"
                          defaultValue={formAsset?.kind || "Freezer"}
                        >
                          {["Freezer", "Refrigerator", "Combination"].map(
                            (s) => (
                              <option key={s}>{s}</option>
                            ),
                          )}
                        </select>
                      </label>
                      {(
                        [
                          "location",
                          "brand",
                          "model",
                          "serial",
                          "electrical",
                          "refrigerant",
                          "charge",
                          "pressure",
                        ] as const
                      ).map((field) => (
                        <label key={field}>
                          {
                            {
                              location: "Location",
                              brand: "Manufacturer",
                              model: "Model",
                              serial: "Serial number",
                              electrical: "Electrical / nameplate text",
                              refrigerant: "Refrigerant",
                              charge: "Charge / source text",
                              pressure: "Design pressure",
                            }[field]
                          }
                          <input
                            name={field}
                            defaultValue={formAsset?.[field]}
                            maxLength={8000}
                          />
                        </label>
                      ))}
                    </div>
                    <label>
                      Notes / verification needed
                      <textarea
                        name="notes"
                        defaultValue={formAsset?.notes}
                        maxLength={8000}
                      />
                    </label>
                    <label>
                      Source link
                      <input
                        name="source"
                        type="url"
                        defaultValue={formAsset?.source}
                      />
                    </label>
                  </>
                ) : (
                  <>
                    {form !== "status" && (
                      <label>
                        {form === "parts" ? "Part name / number" : "Title"}
                        <input name="title" required maxLength={200} />
                      </label>
                    )}
                    <div className="lab-form-grid">
                      <label>
                        {form === "status" ? "Equipment state" : "Entry status"}
                        <select
                          name="status"
                          defaultValue={
                            form === "status" ? asset?.status : undefined
                          }
                        >
                          {(form === "status"
                            ? assetStates
                            : form === "tasks"
                              ? workStates
                              : form === "parts"
                                ? partStates
                                : [
                                    "Inspection",
                                    "Repair completed",
                                    "Maintenance completed",
                                    "Observation",
                                  ]
                          ).map((value) => (
                            <option key={value}>{value}</option>
                          ))}
                        </select>
                      </label>
                      <label>
                        Date
                        <input
                          name="date"
                          type="date"
                          required
                          defaultValue={today()}
                          max={today()}
                        />
                      </label>
                    </div>
                    <label>
                      {form === "parts"
                        ? "Quantity, supplier, compatibility and order details"
                        : form === "tasks"
                          ? "Issue, priority, next step and assigned person"
                          : "Work performed / observations"}
                      <textarea name="detail" required maxLength={8000} />
                    </label>
                    {form !== "status" && (
                      <label>
                        Source / document link
                        <input name="reference" type="url" />
                      </label>
                    )}
                    <small>
                      Recorded by {author}. Only mark work completed when
                      verified.
                    </small>
                  </>
                )}
                <div className="lab-actions">
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() =>
                      form === "equipment" ? setForm(null) : setForm(null)
                    }
                  >
                    Cancel
                  </button>
                  <button className="lab-primary" disabled={busy}>
                    {busy ? "Saving…" : "Save record"}
                  </button>
                </div>
                <div role="status">{message}</div>
              </form>
            ) : (
              asset && (
                <>
                  <nav className="lab-tabs" aria-label="Equipment sections">
                    {["Overview", "Work needed", "Parts", "History"].map(
                      (name) => (
                        <button
                          key={name}
                          aria-pressed={tab === name}
                          className={tab === name ? "active" : ""}
                          onClick={() => setTab(name)}
                        >
                          {name}
                        </button>
                      ),
                    )}
                  </nav>
                  <div className="lab-detail-body">
                    {tab === "Overview" ? (
                      <>
                        <div className="lab-condition">
                          <div>
                            <small>CURRENT STATE</small>
                            <h3>{asset.status}</h3>
                            <p>
                              {asset.statusDate
                                ? `Recorded ${asset.statusDate}`
                                : "Condition has not been verified."}
                            </p>
                          </div>
                          {canEdit && (
                            <button
                              onClick={() => {
                                setMessage("");
                                setForm("status");
                              }}
                            >
                              Update state
                            </button>
                          )}
                        </div>
                        <dl className="lab-specs">
                          {[
                            ["Location", asset.location],
                            ["Manufacturer", asset.brand],
                            ["Model", asset.model],
                            ["Serial number", asset.serial],
                            ["Electrical (source text)", asset.electrical],
                            ["Refrigerant (source text)", asset.refrigerant],
                            ["Charge (source text)", asset.charge],
                            ["Design pressure", asset.pressure],
                          ].map(([key, value]) => (
                            <div key={key}>
                              <dt>{key}</dt>
                              <dd>{label(value)}</dd>
                            </div>
                          ))}
                        </dl>
                        {asset.notes && (
                          <div className="lab-notice">
                            <b>Record notes</b>
                            <p>{asset.notes}</p>
                          </div>
                        )}
                        <div className="lab-source">
                          <Source url={asset.source}>
                            Inventory source{" "}
                            {asset.sourceRow && `· row ${asset.sourceRow}`}
                          </Source>
                          {canEdit && (
                            <button
                              onClick={() => {
                                setMessage("");
                                setForm("edit");
                              }}
                            >
                              Edit equipment
                            </button>
                          )}
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="lab-section-heading">
                          <h3>{tab}</h3>
                          {canEdit && (
                            <button
                              className="lab-primary"
                              onClick={() => {
                                setMessage("");
                                setForm(
                                  tab === "Work needed"
                                    ? "tasks"
                                    : tab === "Parts"
                                      ? "parts"
                                      : "history",
                                );
                              }}
                            >
                              ＋ Add entry
                            </button>
                          )}
                        </div>
                        {itemList(
                          asset[
                            tab === "Work needed"
                              ? "tasks"
                              : tab === "Parts"
                                ? "parts"
                                : "history"
                          ],
                          tab === "Work needed"
                            ? "tasks"
                            : tab === "Parts"
                              ? "parts"
                              : "history",
                        )}
                      </>
                    )}
                    {message && <p role="status">{message}</p>}
                  </div>
                </>
              )
            )}
          </section>
        </div>
      )}
    </div>
  );
}
