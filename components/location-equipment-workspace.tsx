'use client';

import { useEffect, useMemo, useState, type ReactNode } from 'react';
import Link from 'next/link';
import {
  Activity,
  CheckCircle2,
  CircleAlert,
  Cpu,
  Database,
  Gauge,
  HardDrive,
  Network,
  Settings2,
  Snowflake,
  Zap
} from 'lucide-react';

type WorkspaceView = 'overview' | 'connectivity' | 'specs';
type CondenserCount = 1 | 2;
type Arrangement =
  | 'single'
  | 'multiple_separate_systems'
  | 'multiple_parallel_same_system'
  | 'multiple_high_side_subcooling';

type UnitDraft = {
  label: string;
  channel: string;
  catalogSelection: string;
  manufacturer: string;
  productFamily: string;
  exactModelNumber: string;
  serialNumber: string;
  nominalHorsepower: string;
  refrigerant: string;
  refrigerantChargeLb: string;
  compressorManufacturer: string;
  compressorTechnology: string;
  compressorModel: string;
  compressorSerialNumber: string;
  voltage: string;
  phase: string;
  frequencyHz: string;
  nameplateRlaA: string;
  nameplateLraA: string;
  notes: string;
};

type LocationDraft = {
  condenserCount: CondenserCount;
  arrangement: Arrangement;
  processSolvent: string;
  processSolventOther: string;
  processDescription: string;
  units: UnitDraft[];
};

const catalogOptions = [
  { value: '', label: 'Select a known condenser or enter manually', values: {} },
  {
    value: 'russell-next-gen-ii-22hp-r404a',
    label: 'Russell Next-Gen II · 22 HP · R404A',
    values: {
      manufacturer: 'Russell',
      productFamily: 'Next-Gen II',
      nominalHorsepower: '22',
      refrigerant: 'R404A'
    }
  },
  {
    value: 'turbo-air-ts060xr404a3a',
    label: 'Turbo Air TS060XR404A3A · R404A',
    values: {
      manufacturer: 'Turbo Air',
      productFamily: 'TS Series',
      exactModelNumber: 'TS060XR404A3A',
      refrigerant: 'R404A',
      compressorManufacturer: 'Copeland',
      compressorModel: 'ZF18K4E-TF5'
    }
  },
  { value: 'custom', label: 'Other / custom condenser', values: {} }
] as const;

const arrangementOptions: Array<{ value: Arrangement; label: string }> = [
  { value: 'single', label: 'Single condenser' },
  { value: 'multiple_separate_systems', label: 'Two condensers · separate systems' },
  { value: 'multiple_parallel_same_system', label: 'Two condensers · parallel on the same system' },
  { value: 'multiple_high_side_subcooling', label: 'Two condensers · one subcools the other high side' }
];

function blankUnit(index: number): UnitDraft {
  return {
    label: `Condenser ${index + 1}`,
    channel: `CH${index + 1}`,
    catalogSelection: '',
    manufacturer: '',
    productFamily: '',
    exactModelNumber: '',
    serialNumber: '',
    nominalHorsepower: '',
    refrigerant: '',
    refrigerantChargeLb: '',
    compressorManufacturer: '',
    compressorTechnology: '',
    compressorModel: '',
    compressorSerialNumber: '',
    voltage: '',
    phase: '3',
    frequencyHz: '60',
    nameplateRlaA: '',
    nameplateLraA: '',
    notes: ''
  };
}

const defaultDraft: LocationDraft = {
  condenserCount: 1,
  arrangement: 'single',
  processSolvent: '',
  processSolventOther: '',
  processDescription: '',
  units: [blankUnit(0)]
};

function normalizeDraft(value: unknown): LocationDraft {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return defaultDraft;
  const candidate = value as Partial<LocationDraft>;
  const condenserCount: CondenserCount = candidate.condenserCount === 2 ? 2 : 1;
  const arrangements = arrangementOptions.map((option) => option.value);
  const arrangement =
    typeof candidate.arrangement === 'string' && arrangements.includes(candidate.arrangement as Arrangement)
      ? candidate.arrangement as Arrangement
      : condenserCount === 1
        ? 'single'
        : 'multiple_separate_systems';
  const sourceUnits = Array.isArray(candidate.units) ? candidate.units : [];
  const units = Array.from({ length: condenserCount }, (_, index) => ({
    ...blankUnit(index),
    ...(sourceUnits[index] && typeof sourceUnits[index] === 'object' ? sourceUnits[index] : {})
  }));

  return {
    condenserCount,
    arrangement: condenserCount === 1 ? 'single' : arrangement,
    processSolvent: typeof candidate.processSolvent === 'string' ? candidate.processSolvent : '',
    processSolventOther: typeof candidate.processSolventOther === 'string' ? candidate.processSolventOther : '',
    processDescription: typeof candidate.processDescription === 'string' ? candidate.processDescription : '',
    units
  };
}

function entered(value: string, fallback = 'Not entered') {
  return value.trim() || fallback;
}

function configuredFields(unit: UnitDraft) {
  return [
    unit.manufacturer,
    unit.exactModelNumber,
    unit.nominalHorsepower,
    unit.refrigerant,
    unit.compressorModel,
    unit.voltage,
    unit.nameplateRlaA,
    unit.nameplateLraA
  ].filter((value) => value.trim()).length;
}

export function LocationEquipmentWorkspace({
  siteId,
  siteName,
  view,
  controller
}: {
  siteId: string;
  siteName: string;
  view: WorkspaceView;
  controller: {
    name: string;
    status: 'online' | 'offline' | 'degraded';
    vpnIdentity: string;
    tunnelIp: string;
  };
}) {
  const storageKey = `permacool:location-equipment-draft:${siteId}`;
  const [draft, setDraft] = useState<LocationDraft>(defaultDraft);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(storageKey);
      if (saved) setDraft(normalizeDraft(JSON.parse(saved)));
    } catch {
      // A damaged local draft should not block the workspace.
    } finally {
      setLoaded(true);
    }
  }, [storageKey]);

  useEffect(() => {
    if (!loaded) return;
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(draft));
    } catch {
      // The workspace remains usable if browser storage is unavailable.
    }
  }, [draft, loaded, storageKey]);

  const configurationPercent = useMemo(() => {
    const complete = draft.units.reduce((total, unit) => total + configuredFields(unit), 0);
    return Math.round((complete / (draft.units.length * 8)) * 100);
  }, [draft.units]);

  function setCondenserCount(count: CondenserCount) {
    setDraft((current) => ({
      ...current,
      condenserCount: count,
      arrangement:
        count === 1
          ? 'single'
          : current.arrangement === 'single'
            ? 'multiple_separate_systems'
            : current.arrangement,
      units: Array.from({ length: count }, (_, index) => current.units[index] ?? blankUnit(index))
    }));
  }

  function updateUnit(index: number, patch: Partial<UnitDraft>) {
    setDraft((current) => ({
      ...current,
      units: current.units.map((unit, unitIndex) => unitIndex === index ? { ...unit, ...patch } : unit)
    }));
  }

  function selectCatalog(index: number, selection: string) {
    const option = catalogOptions.find((candidate) => candidate.value === selection);
    updateUnit(index, { catalogSelection: selection, ...(option?.values ?? {}) });
  }

  if (view === 'overview') {
    return (
      <div className="location-equipment-workspace">
        <section className="location-equipment-hero">
          <div>
            <p className="eyebrow">Live operating units</p>
            <h2>{siteName} equipment</h2>
            <p>
              The controller and equipment workspace are ready. Pressure, temperature, and amperage will populate
              here after the EPIC reconnects and begins publishing telemetry.
            </p>
          </div>
          <div className={`location-equipment-controller is-${controller.status}`}>
            <Cpu size={18} />
            <span><small>Controller</small><strong>{controller.status}</strong></span>
          </div>
        </section>

        <section className="location-equipment-status-grid">
          <article><span><HardDrive size={17} /></span><div><small>Configured condensers</small><strong>{draft.condenserCount}</strong></div></article>
          <article><span><Settings2 size={17} /></span><div><small>Specs completed</small><strong>{configurationPercent}%</strong></div></article>
          <article><span><Network size={17} /></span><div><small>VPN address</small><strong>{controller.tunnelIp}</strong></div></article>
        </section>

        <div className="location-equipment-unit-grid">
          {draft.units.map((unit, index) => (
            <article className="location-equipment-unit-card" key={`${unit.channel}-${index}`}>
              <header>
                <span>0{index + 1}</span>
                <div>
                  <small>{unit.channel}</small>
                  <h3>{entered(unit.label, `Condenser ${index + 1}`)}</h3>
                  <p>
                    {entered(unit.manufacturer, 'Manufacturer pending')} ·{' '}
                    {unit.nominalHorsepower ? `${unit.nominalHorsepower} HP` : 'HP pending'} ·{' '}
                    {entered(unit.refrigerant, 'Refrigerant pending')}
                  </p>
                </div>
                <b>Waiting for PLC</b>
              </header>
              <div className="location-equipment-reading-grid">
                <div><small>High pressure</small><strong>—</strong><span>PSI</span></div>
                <div><small>Low pressure</small><strong>—</strong><span>PSI</span></div>
                <div><small>Process temperature</small><strong>—</strong><span>°F</span></div>
                <div><small>Compressor amps</small><strong>—</strong><span>A</span></div>
              </div>
            </article>
          ))}
        </div>

        <Link className="location-equipment-primary-link" href={`/sites/${siteId}/specs`}>
          <Settings2 size={16} /> Enter or update location specifications
        </Link>
      </div>
    );
  }

  if (view === 'connectivity') {
    const requiredSignals = [
      'High pressure · CH1/CH2',
      'Low pressure · CH1/CH2',
      'Process-fluid temperature · CH1/CH2',
      'Compressor amperage · CH1/CH2',
      'Run state and system enabled',
      'High-pressure stop and controller heartbeat'
    ];

    return (
      <div className="location-equipment-workspace">
        <section className="location-equipment-connectivity-grid">
          <article className="panel">
            <header className="location-equipment-panel-heading">
              <span><Network size={19} /></span>
              <div><p className="eyebrow">OpenVPN identity</p><h2>Field tunnel</h2></div>
            </header>
            <dl className="location-equipment-definition-list">
              <div><dt>Controller</dt><dd>{controller.name}</dd></div>
              <div><dt>Identity</dt><dd>{controller.vpnIdentity}</dd></div>
              <div><dt>Reserved address</dt><dd>{controller.tunnelIp}</dd></div>
              <div><dt>Current state</dt><dd>{controller.status}</dd></div>
            </dl>
          </article>
          <article className="panel">
            <header className="location-equipment-panel-heading">
              <span><Database size={19} /></span>
              <div><p className="eyebrow">Signal readiness</p><h2>Telemetry expected</h2></div>
            </header>
            <div className="location-equipment-signal-list">
              {requiredSignals.map((signal) => (
                <div key={signal}><CircleAlert size={14} /><span>{signal}</span><b>Waiting</b></div>
              ))}
            </div>
          </article>
        </section>
      </div>
    );
  }

  return (
    <div className="location-equipment-workspace">
      <section className="location-equipment-specs-heading">
        <div>
          <p className="eyebrow">System configuration</p>
          <h2>System and condenser records</h2>
          <p>Build the installed-equipment record now; telemetry can be connected afterward.</p>
        </div>
        <span><CheckCircle2 size={15} /> {loaded ? 'Cannon Falls draft saved' : 'Loading draft'}</span>
      </section>

      <section className="panel location-equipment-system-form">
        <header className="location-equipment-panel-heading">
          <span><Snowflake size={19} /></span>
          <div><p className="eyebrow">Process system</p><h3>Location arrangement</h3></div>
        </header>
        <div className="location-equipment-form-grid">
          <label>
            <span>Number of condensers</span>
            <select value={draft.condenserCount} onChange={(event) => setCondenserCount(Number(event.target.value) === 2 ? 2 : 1)}>
              <option value={1}>One condenser</option>
              <option value={2}>Two condensers</option>
            </select>
          </label>
          <label>
            <span>Condenser orientation</span>
            <select value={draft.arrangement} onChange={(event) => setDraft((current) => ({ ...current, arrangement: event.target.value as Arrangement }))}>
              {arrangementOptions
                .filter((option) => draft.condenserCount === 1 ? option.value === 'single' : option.value !== 'single')
                .map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </label>
          <label>
            <span>Process solvent</span>
            <select value={draft.processSolvent} onChange={(event) => setDraft((current) => ({ ...current, processSolvent: event.target.value }))}>
              <option value="">Select solvent</option><option value="ethanol">Ethanol</option><option value="butane">Butane</option><option value="other">Other</option>
            </select>
          </label>
          {draft.processSolvent === 'other' ? (
            <label><span>Other process solvent</span><input value={draft.processSolventOther} onChange={(event) => setDraft((current) => ({ ...current, processSolventOther: event.target.value }))} placeholder="Enter solvent" /></label>
          ) : null}
          <label className="is-wide">
            <span>Process description</span>
            <textarea value={draft.processDescription} onChange={(event) => setDraft((current) => ({ ...current, processDescription: event.target.value }))} placeholder="What the refrigeration system is chilling and how it operates" rows={3} />
          </label>
        </div>
      </section>

      <div className="location-equipment-spec-card-list">
        {draft.units.map((unit, index) => (
          <section className="panel location-equipment-spec-card" key={`${unit.channel}-${index}`}>
            <header>
              <span>0{index + 1}</span>
              <div><p className="eyebrow">{unit.channel}</p><h3>{entered(unit.label, `Condenser ${index + 1}`)}</h3></div>
              <b>{configuredFields(unit)} of 8 key fields</b>
            </header>

            <FormSection icon={<Settings2 size={16} />} title="Condenser identity">
              <label><span>Display name</span><input value={unit.label} onChange={(event) => updateUnit(index, { label: event.target.value })} /></label>
              <label><span>Dashboard channel</span><select value={unit.channel} onChange={(event) => updateUnit(index, { channel: event.target.value })}><option>CH1</option><option>CH2</option></select></label>
              <label className="is-wide"><span>Known condenser selection</span><select value={unit.catalogSelection} onChange={(event) => selectCatalog(index, event.target.value)}>{catalogOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
              <label><span>Manufacturer</span><input value={unit.manufacturer} onChange={(event) => updateUnit(index, { manufacturer: event.target.value })} placeholder="Russell, Turbo Air, etc." /></label>
              <label><span>Product family</span><input value={unit.productFamily} onChange={(event) => updateUnit(index, { productFamily: event.target.value })} placeholder="Series or family" /></label>
              <label><span>Exact model number</span><input value={unit.exactModelNumber} onChange={(event) => updateUnit(index, { exactModelNumber: event.target.value })} placeholder="From nameplate" /></label>
              <label><span>Condenser serial number</span><input value={unit.serialNumber} onChange={(event) => updateUnit(index, { serialNumber: event.target.value })} placeholder="From nameplate" /></label>
              <label><span>Nominal horsepower</span><input type="number" min={0} step={0.1} value={unit.nominalHorsepower} onChange={(event) => updateUnit(index, { nominalHorsepower: event.target.value })} placeholder="HP" /></label>
              <label><span>Refrigerant</span><input value={unit.refrigerant} onChange={(event) => updateUnit(index, { refrigerant: event.target.value })} placeholder="R404A" /></label>
              <UnitInput label="Refrigerant charge" unit="lb" value={unit.refrigerantChargeLb} onChange={(value) => updateUnit(index, { refrigerantChargeLb: value })} />
            </FormSection>

            <FormSection icon={<Gauge size={16} />} title="Installed compressor">
              <label><span>Manufacturer</span><input value={unit.compressorManufacturer} onChange={(event) => updateUnit(index, { compressorManufacturer: event.target.value })} placeholder="Copeland, Bitzer, etc." /></label>
              <label><span>Technology</span><input value={unit.compressorTechnology} onChange={(event) => updateUnit(index, { compressorTechnology: event.target.value })} placeholder="Scroll, Discus, reciprocating" /></label>
              <label><span>Compressor model</span><input value={unit.compressorModel} onChange={(event) => updateUnit(index, { compressorModel: event.target.value })} placeholder="From compressor nameplate" /></label>
              <label><span>Compressor serial number</span><input value={unit.compressorSerialNumber} onChange={(event) => updateUnit(index, { compressorSerialNumber: event.target.value })} placeholder="Optional" /></label>
            </FormSection>

            <FormSection icon={<Zap size={16} />} title="Electrical nameplate" className="is-four">
              <label><span>Voltage</span><input value={unit.voltage} onChange={(event) => updateUnit(index, { voltage: event.target.value })} placeholder="460" /></label>
              <label><span>Phase</span><select value={unit.phase} onChange={(event) => updateUnit(index, { phase: event.target.value })}><option value="">Unknown</option><option value="1">1 phase</option><option value="3">3 phase</option></select></label>
              <label><span>Frequency</span><select value={unit.frequencyHz} onChange={(event) => updateUnit(index, { frequencyHz: event.target.value })}><option value="">Unknown</option><option value="60">60 Hz</option><option value="50">50 Hz</option></select></label>
              <UnitInput label="Compressor RLA" unit="A" value={unit.nameplateRlaA} onChange={(value) => updateUnit(index, { nameplateRlaA: value })} />
              <UnitInput label="Compressor LRA" unit="A" value={unit.nameplateLraA} onChange={(value) => updateUnit(index, { nameplateLraA: value })} />
            </FormSection>

            <label className="location-equipment-notes">
              <span>Installation notes</span>
              <textarea value={unit.notes} onChange={(event) => updateUnit(index, { notes: event.target.value })} rows={3} placeholder="Receiver, fan, location, service history, or other installed details" />
            </label>
          </section>
        ))}
      </div>

      <section className="location-equipment-draft-note">
        <Activity size={17} />
        <div><strong>This is the Cannon Falls equipment draft.</strong><p>Nothing is treated as verified manufacturer data until it is entered from a nameplate or approved manual.</p></div>
      </section>
    </div>
  );
}

function FormSection({
  icon,
  title,
  className,
  children
}: {
  icon: ReactNode;
  title: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className="location-equipment-form-section">
      <div className="location-equipment-form-section-title">{icon}<strong>{title}</strong></div>
      <div className={`location-equipment-form-grid${className ? ` ${className}` : ''}`}>{children}</div>
    </div>
  );
}

function UnitInput({
  label,
  unit,
  value,
  onChange
}: {
  label: string;
  unit: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label>
      <span>{label}</span>
      <div className="location-equipment-input-unit">
        <input type="number" min={0} step={0.1} value={value} onChange={(event) => onChange(event.target.value)} />
        <b>{unit}</b>
      </div>
    </label>
  );
}
