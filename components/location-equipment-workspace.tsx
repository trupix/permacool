'use client';

import { useEffect, useMemo, useState, type ReactNode } from 'react';
import Image from 'next/image';
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
type AmbientMode = 'automatic' | 'manual';
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
  refrigerantOther: string;
  refrigerantChargeLb: string;
  compressorVariant: string;
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
  ambientMode: AmbientMode;
  manualAmbientF: number;
  manualSuctionF: number;
  manualSuctionValidated: boolean;
  units: UnitDraft[];
};

const catalogOptions = [
  { value: '', label: 'Select a known condenser or enter manually', values: {} },
  {
    value: 'russell-next-gen-ii-22hp-r404a',
    label: 'Russell Next-Gen II · 22 HP · Copeland Discus · R404A',
    values: {
      manufacturer: 'Russell',
      productFamily: 'Next-Gen II',
      exactModelNumber: 'R*DS22L4S**',
      nominalHorsepower: '22',
      refrigerant: 'R404A',
      refrigerantOther: '',
      compressorVariant: 'russell-next-gen-ii-22hp-low-temp-discus-r404a',
      compressorManufacturer: 'Copeland',
      compressorTechnology: 'Discus',
      compressorModel: '4DJNF-76KE',
      phase: '3',
      frequencyHz: '60'
    }
  },
  {
    value: 'russell-next-gen-minicon-6hp-zs45k4e-r404a',
    label: 'Russell Next-Gen MiniCon R*O600E4S** · 6 HP · R404A',
    values: {
      manufacturer: 'Russell',
      productFamily: 'Next-Gen MiniCon',
      exactModelNumber: 'R*O600E4S**',
      nominalHorsepower: '6',
      refrigerant: 'R404A',
      refrigerantOther: '',
      compressorVariant: 'russell-next-gen-minicon-6hp-zs45k4e-r404a',
      compressorManufacturer: 'Copeland',
      compressorTechnology: 'Scroll',
      compressorModel: 'ZS45K4E'
    }
  },
  {
    value: 'russell-next-gen-minicon-6hp-zs45k4e-r448a',
    label: 'Russell Next-Gen MiniCon R*O600E4S** · 6 HP · R448A',
    values: {
      manufacturer: 'Russell',
      productFamily: 'Next-Gen MiniCon',
      exactModelNumber: 'R*O600E4S**',
      nominalHorsepower: '6',
      refrigerant: 'R448A',
      refrigerantOther: '',
      compressorVariant: 'russell-next-gen-minicon-6hp-zs45k4e-r448a',
      compressorManufacturer: 'Copeland',
      compressorTechnology: 'Scroll',
      compressorModel: 'ZS45K4E'
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
      refrigerantOther: '',
      compressorVariant: 'turbo-air-ts060xr404a3a',
      compressorManufacturer: 'Copeland',
      compressorTechnology: 'Scroll',
      compressorModel: 'ZF18K4E-TF5'
    }
  },
  { value: 'custom', label: 'Other / custom condenser', values: {} }
] as const;

const compressorOptions = [
  {
    value: 'russell-next-gen-minicon-6hp-zs45k4e-r404a',
    label: 'Copeland ZS45K4E · 6 HP · R404A · 208-230 V / 3 / 60',
    catalogSelections: ['russell-next-gen-minicon-6hp-zs45k4e-r404a'],
    values: {
      catalogSelection: 'russell-next-gen-minicon-6hp-zs45k4e-r404a',
      manufacturer: 'Russell',
      productFamily: 'Next-Gen MiniCon',
      exactModelNumber: 'R*O600E4S**',
      nominalHorsepower: '6',
      refrigerant: 'R404A',
      refrigerantOther: '',
      compressorManufacturer: 'Copeland',
      compressorTechnology: 'Scroll',
      compressorModel: 'ZS45K4E',
      voltage: '208-230',
      phase: '3',
      frequencyHz: '60',
      nameplateRlaA: '21.5',
      nameplateLraA: '156'
    }
  },
  {
    value: 'russell-next-gen-minicon-6hp-zs45k4e-r448a',
    label: 'Copeland ZS45K4E · 6 HP · R448A · 208-230 V / 3 / 60',
    catalogSelections: ['russell-next-gen-minicon-6hp-zs45k4e-r448a'],
    values: {
      catalogSelection: 'russell-next-gen-minicon-6hp-zs45k4e-r448a',
      manufacturer: 'Russell',
      productFamily: 'Next-Gen MiniCon',
      exactModelNumber: 'R*O600E4S**',
      nominalHorsepower: '6',
      refrigerant: 'R448A',
      refrigerantOther: '',
      compressorManufacturer: 'Copeland',
      compressorTechnology: 'Scroll',
      compressorModel: 'ZS45K4E',
      voltage: '208-230',
      phase: '3',
      frequencyHz: '60',
      nameplateRlaA: '21.5',
      nameplateLraA: '156'
    }
  },
  {
    value: 'russell-next-gen-ii-22hp-low-temp-discus-r404a',
    label: 'Copeland Discus 4DJNF-76KE · 22 HP · R404A',
    catalogSelections: ['russell-next-gen-ii-22hp-r404a'],
    values: {
      catalogSelection: 'russell-next-gen-ii-22hp-r404a',
      manufacturer: 'Russell',
      productFamily: 'Next-Gen II',
      exactModelNumber: 'R*DS22L4S**',
      nominalHorsepower: '22',
      refrigerant: 'R404A',
      refrigerantOther: '',
      compressorManufacturer: 'Copeland',
      compressorTechnology: 'Discus',
      compressorModel: '4DJNF-76KE',
      phase: '3',
      frequencyHz: '60'
    }
  },
  {
    value: 'turbo-air-ts060xr404a3a',
    label: 'Copeland Scroll ZF18K4E-TF5 · TS060XR404A3A',
    catalogSelections: ['turbo-air-ts060xr404a3a'],
    values: {
      compressorManufacturer: 'Copeland',
      compressorTechnology: 'Scroll',
      compressorModel: 'ZF18K4E-TF5'
    }
  }
] as const;

const arrangementOptions: Array<{ value: Arrangement; label: string }> = [
  { value: 'single', label: 'Single condenser' },
  { value: 'multiple_separate_systems', label: 'Multiple - separate systems' },
  { value: 'multiple_parallel_same_system', label: 'Multiple - parallel on the same system' },
  { value: 'multiple_high_side_subcooling', label: "Multiple - one subcools the other's high side" }
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
    refrigerantOther: '',
    refrigerantChargeLb: '',
    compressorVariant: 'unconfirmed',
    compressorManufacturer: '',
    compressorTechnology: '',
    compressorModel: '',
    compressorSerialNumber: '',
    voltage: 'unconfirmed',
    phase: '3',
    frequencyHz: 'unconfirmed',
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
  ambientMode: 'automatic',
  manualAmbientF: 95,
  manualSuctionF: -20,
  manualSuctionValidated: false,
  units: [blankUnit(0)]
};

function inferCompressorVariant(unit: Partial<UnitDraft>): string {
  if (
    typeof unit.compressorVariant === 'string' &&
    unit.compressorVariant &&
    unit.compressorVariant !== 'unconfirmed' &&
    unit.compressorVariant !== 'russell-next-gen-ii-22hp-low-temp-bitzer-r404a'
  ) {
    return unit.compressorVariant;
  }
  if (unit.catalogSelection === 'russell-next-gen-ii-22hp-r404a') {
    return 'russell-next-gen-ii-22hp-low-temp-discus-r404a';
  }
  const model = typeof unit.compressorModel === 'string'
    ? unit.compressorModel.toUpperCase().replaceAll('-', '')
    : '';
  if (model === '4DJNF76KE') return 'russell-next-gen-ii-22hp-low-temp-discus-r404a';
  if (model === 'ZS45K4E') {
    return unit.refrigerant === 'R448A'
      ? 'russell-next-gen-minicon-6hp-zs45k4e-r448a'
      : 'russell-next-gen-minicon-6hp-zs45k4e-r404a';
  }
  if (model === 'ZF18K4ETF5') return 'turbo-air-ts060xr404a3a';
  return model ? 'other' : 'unconfirmed';
}

function backfillSelectedCompressor(unit: UnitDraft): UnitDraft {
  const option = compressorOptions.find((candidate) => candidate.value === unit.compressorVariant);
  if (!option) return unit;

  const defaults = option.values as Partial<UnitDraft>;
  const next = { ...unit };
  for (const [key, defaultValue] of Object.entries(defaults) as Array<[keyof UnitDraft, string]>) {
    if ((next[key] === '' || next[key] === 'unconfirmed') && defaultValue) {
      next[key] = defaultValue;
    }
  }
  return next;
}

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
  const units = Array.from({ length: condenserCount }, (_, index) => {
    const source =
      sourceUnits[index] && typeof sourceUnits[index] === 'object'
        ? sourceUnits[index] as Partial<UnitDraft>
        : {};
    const legacyRefrigerant =
      typeof source.refrigerant === 'string' &&
      source.refrigerant &&
      source.refrigerant !== 'R404A' &&
      source.refrigerant !== 'R448A' &&
      source.refrigerant !== 'other'
        ? source.refrigerant
        : '';

    return backfillSelectedCompressor({
      ...blankUnit(index),
      ...source,
      manufacturer: source.manufacturer === 'TurboAir' ? 'Turbo Air' : source.manufacturer ?? '',
      refrigerant: legacyRefrigerant ? 'other' : source.refrigerant ?? '',
      refrigerantOther: legacyRefrigerant || source.refrigerantOther || '',
      compressorVariant: inferCompressorVariant(source)
    });
  });

  return {
    condenserCount,
    arrangement: condenserCount === 1 ? 'single' : arrangement,
    processSolvent: typeof candidate.processSolvent === 'string' ? candidate.processSolvent : '',
    processSolventOther: typeof candidate.processSolventOther === 'string' ? candidate.processSolventOther : '',
    processDescription: typeof candidate.processDescription === 'string' ? candidate.processDescription : '',
    ambientMode: candidate.ambientMode === 'manual' ? 'manual' : 'automatic',
    manualAmbientF: typeof candidate.manualAmbientF === 'number' ? candidate.manualAmbientF : 95,
    manualSuctionF: typeof candidate.manualSuctionF === 'number' ? candidate.manualSuctionF : -20,
    manualSuctionValidated: candidate.manualSuctionValidated === true,
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

function availableCompressorOptions(unit: UnitDraft) {
  if (!unit.catalogSelection || unit.catalogSelection === 'custom') return [...compressorOptions];
  const matched = compressorOptions.filter((option) =>
    option.catalogSelections.some((selection) => selection === unit.catalogSelection)
  );
  const saved = compressorOptions.find((option) => option.value === unit.compressorVariant);
  return saved && !matched.some((option) => option.value === saved.value) ? [...matched, saved] : matched;
}

function voltageOptions(frequencyHz: string) {
  if (frequencyHz === '50') {
    return [
      { value: '200-220', label: '200-220 V / 3 phase / 50 Hz' },
      { value: '380', label: '380 V / 3 phase / 50 Hz' }
    ];
  }
  if (frequencyHz === '60') {
    return [
      { value: '208-230', label: '208-230 V / 3 phase / 60 Hz' },
      { value: '460', label: '460 V / 3 phase / 60 Hz' },
      { value: '575', label: '575 V / 3 phase / 60 Hz' }
    ];
  }
  return [];
}

function refrigerantLabel(unit: UnitDraft) {
  return unit.refrigerant === 'other' ? entered(unit.refrigerantOther, 'Other refrigerant') : unit.refrigerant;
}

function isRussellMinicon6Hp(unit: UnitDraft) {
  return unit.catalogSelection === 'russell-next-gen-minicon-6hp-zs45k4e-r404a' ||
    unit.catalogSelection === 'russell-next-gen-minicon-6hp-zs45k4e-r448a';
}

function isZs45k4e(unit: UnitDraft) {
  return unit.compressorModel.toUpperCase().replaceAll('-', '') === 'ZS45K4E' ||
    unit.compressorVariant.includes('zs45k4e');
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
    const compressorVariant =
      selection === 'turbo-air-ts060xr404a3a'
        ? 'turbo-air-ts060xr404a3a'
        : undefined;
    setDraft((current) => ({
      ...current,
      units: current.units.map((unit, unitIndex) => unitIndex === index
        ? backfillSelectedCompressor({
            ...unit,
            catalogSelection: selection,
            ...(option?.values ?? {}),
            ...(compressorVariant ? { compressorVariant } : {})
          })
        : unit)
    }));
  }

  function selectCompressor(index: number, selection: string) {
    const option = compressorOptions.find((candidate) => candidate.value === selection);
    updateUnit(index, { compressorVariant: selection, ...(option?.values ?? {}) });
  }

  function selectRefrigerant(index: number, refrigerant: string) {
    setDraft((current) => ({
      ...current,
      units: current.units.map((unit, unitIndex) => {
        if (unitIndex !== index) return unit;

        const usesZs45k4eCatalog =
          unit.catalogSelection === 'russell-next-gen-minicon-6hp-zs45k4e-r404a' ||
          unit.catalogSelection === 'russell-next-gen-minicon-6hp-zs45k4e-r448a';
        const matchingCatalog =
          refrigerant === 'R448A'
            ? 'russell-next-gen-minicon-6hp-zs45k4e-r448a'
            : 'russell-next-gen-minicon-6hp-zs45k4e-r404a';

        return {
          ...unit,
          refrigerant,
          ...(refrigerant === 'R404A' || refrigerant === 'R448A'
            ? { refrigerantOther: '' }
            : {}),
          ...(usesZs45k4eCatalog && (refrigerant === 'R404A' || refrigerant === 'R448A')
            ? {
                catalogSelection: matchingCatalog,
                compressorVariant: matchingCatalog
              }
            : {})
        };
      })
    }));
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
                    {entered(refrigerantLabel(unit), 'Refrigerant pending')}
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
        <span><CheckCircle2 size={15} /> {loaded ? `${siteName} draft saved` : 'Loading draft'}</span>
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

            <div className="location-equipment-visual-grid" aria-label={`${unit.label} equipment images`}>
              <article className={`location-equipment-visual-card ${isRussellMinicon6Hp(unit) ? 'has-image' : 'is-empty'}`}>
                {isRussellMinicon6Hp(unit) ? (
                  <>
                    <Image
                      src="/images/equipment/russell-next-gen-minicon-condenser-hero.png"
                      alt="Russell Next-Gen MiniCon air-cooled condensing unit"
                      fill
                      sizes="(max-width: 700px) 100vw, 50vw"
                    />
                    <div className="location-equipment-visual-shade" />
                    <div className="location-equipment-visual-content">
                      <span>Condenser</span>
                      <strong>Russell Next-Gen MiniCon</strong>
                      <small>R*O600E4S** · 6 HP · {refrigerantLabel(unit)}</small>
                      <b>Selected visual</b>
                    </div>
                  </>
                ) : (
                  <div className="location-equipment-visual-placeholder">
                    <Snowflake size={24} />
                    <span>Condenser image</span>
                    <strong>
                      {unit.catalogSelection && unit.catalogSelection !== 'custom'
                        ? 'Reference image coming soon'
                        : 'Select a known condenser'}
                    </strong>
                    <small>Its cabinet image will appear here for visual verification.</small>
                  </div>
                )}
              </article>

              <article className={`location-equipment-visual-card ${isZs45k4e(unit) ? 'has-image' : 'is-empty'}`}>
                {isZs45k4e(unit) ? (
                  <>
                    <Image
                      src="/images/equipment/copeland-zs45k4e-mini-hero.png"
                      alt="Copeland ZS45K4E scroll compressor"
                      fill
                      sizes="(max-width: 700px) 100vw, 50vw"
                    />
                    <div className="location-equipment-visual-shade" />
                    <div className="location-equipment-visual-content">
                      <span>Compressor</span>
                      <strong>Copeland ZS45K4E</strong>
                      <small>6 HP scroll · {refrigerantLabel(unit) || 'R404A / R448A'}</small>
                      <b>Selected visual</b>
                    </div>
                  </>
                ) : (
                  <div className="location-equipment-visual-placeholder">
                    <Gauge size={24} />
                    <span>Compressor image</span>
                    <strong>
                      {unit.compressorVariant !== 'unconfirmed'
                        ? 'Reference image coming soon'
                        : 'Select an installed compressor'}
                    </strong>
                    <small>Its product image will appear here for visual verification.</small>
                  </div>
                )}
              </article>
            </div>

            <FormSection icon={<Settings2 size={16} />} title="Condenser identity">
              <label><span>Display name</span><input value={unit.label} onChange={(event) => updateUnit(index, { label: event.target.value })} /></label>
              <label><span>Dashboard channel</span><select value={unit.channel} onChange={(event) => updateUnit(index, { channel: event.target.value })}><option>CH1</option><option>CH2</option></select></label>
              <label className="is-wide"><span>Known condenser selection</span><select value={unit.catalogSelection} onChange={(event) => selectCatalog(index, event.target.value)}>{catalogOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
              <label>
                <span>Manufacturer</span>
                <select value={unit.manufacturer} onChange={(event) => updateUnit(index, { manufacturer: event.target.value })}>
                  <option value="">Select manufacturer</option>
                  <option value="Russell">Russell</option>
                  <option value="Turbo Air">Turbo Air</option>
                </select>
              </label>
              <label><span>Product family</span><input value={unit.productFamily} onChange={(event) => updateUnit(index, { productFamily: event.target.value })} placeholder="Series or family" /></label>
              <label><span>Exact model number</span><input value={unit.exactModelNumber} onChange={(event) => updateUnit(index, { exactModelNumber: event.target.value })} placeholder="From nameplate" /></label>
              <label><span>Condenser serial number</span><input value={unit.serialNumber} onChange={(event) => updateUnit(index, { serialNumber: event.target.value })} placeholder="From nameplate" /></label>
              <label><span>Nominal horsepower</span><input type="number" min={0} step={0.1} value={unit.nominalHorsepower} onChange={(event) => updateUnit(index, { nominalHorsepower: event.target.value })} placeholder="HP" /></label>
              <label>
                <span>Refrigerant</span>
                <select
                  value={unit.refrigerant}
                  onChange={(event) => selectRefrigerant(index, event.target.value)}
                >
                  <option value="">Nameplate pending</option>
                  <option value="R404A">R404A - catalog loaded</option>
                  <option value="R448A">R448A - catalog loaded</option>
                  <option value="other">Other - curve required</option>
                </select>
              </label>
              {unit.refrigerant === 'other' ? (
                <label>
                  <span>Other refrigerant</span>
                  <input
                    value={unit.refrigerantOther}
                    onChange={(event) => updateUnit(index, { refrigerantOther: event.target.value })}
                    placeholder="Enter refrigerant type"
                  />
                </label>
              ) : null}
              <UnitInput label="Refrigerant charge" unit="lb" value={unit.refrigerantChargeLb} onChange={(value) => updateUnit(index, { refrigerantChargeLb: value })} />
            </FormSection>

            <FormSection icon={<Gauge size={16} />} title="Installed compressor">
              <label className="is-wide">
                <span>Installed compressor</span>
                <select value={unit.compressorVariant} onChange={(event) => selectCompressor(index, event.target.value)}>
                  <option value="unconfirmed">Nameplate model pending</option>
                  {availableCompressorOptions(unit).map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                  <option value="other">Other / manually entered compressor</option>
                  {!compressorOptions.some((option) => option.value === unit.compressorVariant) &&
                  unit.compressorVariant !== 'unconfirmed' &&
                  unit.compressorVariant !== 'other' ? (
                    <option value={unit.compressorVariant}>{unit.compressorVariant} · saved draft</option>
                  ) : null}
                </select>
              </label>
              <label><span>Manufacturer</span><input value={unit.compressorManufacturer} onChange={(event) => updateUnit(index, { compressorManufacturer: event.target.value })} placeholder="Copeland or other manufacturer" /></label>
              <label><span>Technology</span><input value={unit.compressorTechnology} onChange={(event) => updateUnit(index, { compressorTechnology: event.target.value })} placeholder="Scroll, Discus, reciprocating" /></label>
              <label><span>Compressor model</span><input value={unit.compressorModel} onChange={(event) => updateUnit(index, { compressorModel: event.target.value })} placeholder="From compressor nameplate" /></label>
              <label><span>Compressor serial number</span><input value={unit.compressorSerialNumber} onChange={(event) => updateUnit(index, { compressorSerialNumber: event.target.value })} placeholder="Optional" /></label>
            </FormSection>

            <FormSection icon={<Zap size={16} />} title="Electrical nameplate" className="is-four">
              <label><span>Phase</span><select value={unit.phase} onChange={(event) => updateUnit(index, { phase: event.target.value })}><option value="">Unknown</option><option value="1">1 phase</option><option value="3">3 phase</option></select></label>
              <label>
                <span>Installed frequency</span>
                <select
                  value={unit.frequencyHz || 'unconfirmed'}
                  onChange={(event) => updateUnit(index, {
                    frequencyHz: event.target.value,
                    voltage: 'unconfirmed'
                  })}
                >
                  <option value="unconfirmed">Nameplate pending</option>
                  <option value="60">60 Hz</option>
                  <option value="50">50 Hz - 0.83 capacity factor</option>
                  {unit.frequencyHz &&
                  unit.frequencyHz !== 'unconfirmed' &&
                  unit.frequencyHz !== '60' &&
                  unit.frequencyHz !== '50' ? (
                    <option value={unit.frequencyHz}>{unit.frequencyHz} Hz · saved draft</option>
                  ) : null}
                </select>
              </label>
              <label>
                <span>Installed voltage</span>
                <select
                  value={unit.voltage || 'unconfirmed'}
                  disabled={unit.frequencyHz !== '50' && unit.frequencyHz !== '60'}
                  onChange={(event) => updateUnit(index, { voltage: event.target.value })}
                >
                  <option value="unconfirmed">
                    {unit.frequencyHz === '50' || unit.frequencyHz === '60' ? 'Nameplate pending' : 'Confirm frequency first'}
                  </option>
                  {voltageOptions(unit.frequencyHz).map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                  {unit.voltage &&
                  unit.voltage !== 'unconfirmed' &&
                  !voltageOptions(unit.frequencyHz).some((option) => option.value === unit.voltage) ? (
                    <option value={unit.voltage}>{unit.voltage} V · saved draft</option>
                  ) : null}
                </select>
              </label>
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

      <section className="panel location-equipment-system-form">
        <header className="location-equipment-panel-heading">
          <span><Gauge size={19} /></span>
          <div><p className="eyebrow">Capacity model</p><h3>Analysis inputs</h3></div>
        </header>
        <div className="location-equipment-form-grid location-equipment-analysis-grid">
          <label>
            <span>Entering-air source</span>
            <select
              value={draft.ambientMode}
              onChange={(event) => setDraft((current) => ({
                ...current,
                ambientMode: event.target.value as AmbientMode
              }))}
            >
              <option value="automatic">PLC inlet-air, then observed weather</option>
              <option value="manual">Manual value</option>
            </select>
          </label>
          <UnitInput
            label="Manual entering air"
            unit="°F"
            value={String(draft.manualAmbientF)}
            min={-20}
            max={140}
            step={1}
            disabled={draft.ambientMode !== 'manual'}
            onChange={(value) => setDraft((current) => ({
              ...current,
              manualAmbientF: Number(value)
            }))}
          />
          <UnitInput
            label="Catalog suction temperature"
            unit="°F"
            value={String(draft.manualSuctionF)}
            min={-40}
            max={0}
            step={1}
            onChange={(value) => setDraft((current) => ({
              ...current,
              manualSuctionF: Number(value)
            }))}
          />
        </div>
        <label className="location-equipment-validation-check">
          <input
            type="checkbox"
            checked={draft.manualSuctionValidated}
            onChange={(event) => setDraft((current) => ({
              ...current,
              manualSuctionValidated: event.target.checked
            }))}
          />
          <span>I confirm the manual value is saturated suction temperature, not pipe temperature.</span>
        </label>
        <div className="location-equipment-analysis-note">
          <CircleAlert size={17} />
          <p>
            Capacity stays locked until the unit model and frequency are confirmed and the suction-table axis is
            validated. Automatic entering air will use the PLC inlet-air sensor first, then observed local weather.
          </p>
        </div>
      </section>

      <section className="location-equipment-draft-note">
        <Activity size={17} />
        <div><strong>This is the {siteName} equipment draft.</strong><p>Nothing is treated as verified manufacturer data until it is entered from a nameplate or approved manual.</p></div>
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
  min = 0,
  max,
  step = 0.1,
  disabled = false,
  onChange
}: {
  label: string;
  unit: string;
  value: string;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <label>
      <span>{label}</span>
      <div className="location-equipment-input-unit">
        <input
          type="number"
          min={min}
          max={max}
          step={step}
          value={value}
          disabled={disabled}
          onChange={(event) => onChange(event.target.value)}
        />
        <b>{unit}</b>
      </div>
    </label>
  );
}
