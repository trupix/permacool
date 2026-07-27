"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";
import type { TelemetryPoint } from "@/types/domain";

type SiteTelemetryPoint = TelemetryPoint & { deviceName: string };
type TelemetrySample = {
  id: string;
  deviceId: string;
  deviceName: string;
  key: string;
  value: number;
  unit: string;
  capturedAt: string;
};

type GaugeDefinition = {
  key: string;
  label: string;
  min: number;
  max: number;
  accent: string;
};

const gauges: GaugeDefinition[] = [
  { key: "ch1_temperature_c", label: "CH1 Temperature", min: -60, max: 20, accent: "#66d4ff" },
  { key: "ch1_high_pressure", label: "CH1 High Pressure", min: 0, max: 350, accent: "#91c83e" },
  { key: "ch1_low_pressure", label: "CH1 Low Pressure", min: 0, max: 100, accent: "#b7e8ff" },
  { key: "ch2_temperature_c", label: "CH2 Temperature", min: -60, max: 20, accent: "#66d4ff" },
  { key: "ch2_high_pressure", label: "CH2 High Pressure", min: 0, max: 350, accent: "#91c83e" },
  { key: "ch2_low_pressure", label: "CH2 Low Pressure", min: 0, max: 100, accent: "#b7e8ff" }
];

const stateKeys = [
  "ch1_chiller_run",
  "ch1_system_on",
  "ch1_high_pressure_stop",
  "ch2_chiller_run",
  "ch2_system_on",
  "ch2_high_pressure_stop"
];

function valueText(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

export function SiteTelemetryPanel({
  siteId,
  initialPoints
}: {
  siteId: string;
  initialPoints: SiteTelemetryPoint[];
}) {
  const [points, setPoints] = useState(initialPoints);
  const [isOpen, setIsOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [samples, setSamples] = useState<TelemetrySample[]>([]);
  const [pageCount, setPageCount] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    const refresh = async () => {
      const response = await fetch(`/api/sites/${siteId}/telemetry`, { cache: "no-store" });
      if (!response.ok) return;
      const payload = (await response.json()) as { points: SiteTelemetryPoint[] };
      setPoints(payload.points);
    };

    const timer = window.setInterval(refresh, 15_000);
    return () => window.clearInterval(timer);
  }, [siteId]);

  useEffect(() => {
    if (!isOpen) return;
    const loadHistory = async () => {
      const response = await fetch(
        `/api/sites/${siteId}/telemetry?history=1&page=${page + 1}&pageSize=${pageSize}`,
        { cache: "no-store" }
      );
      if (!response.ok) return;
      const payload = (await response.json()) as { samples: TelemetrySample[]; pageCount: number };
      setSamples(payload.samples);
      setPageCount(payload.pageCount);
    };
    void loadHistory();
  }, [isOpen, page, siteId]);

  const byKey = useMemo(() => new Map(points.map((point) => [point.key, point])), [points]);
  const statePoints = stateKeys.map((key) => byKey.get(key)).filter((point): point is SiteTelemetryPoint => Boolean(point));
  const latestTimestamp = points.reduce(
    (latest, point) => (point.latestTimestamp > latest ? point.latestTimestamp : latest),
    ""
  );

  return (
    <section className="telemetry-panel" aria-labelledby="live-telemetry-title">
      <div className="telemetry-panel-header">
        <div>
          <p className="eyebrow">Live read-only values</p>
          <h2 id="live-telemetry-title">System telemetry</h2>
          <p className="telemetry-freshness">
            <span className="live-dot" aria-hidden="true" />
            Updating every 15 seconds
            {latestTimestamp ? ` · Last received ${new Date(latestTimestamp).toLocaleTimeString()}` : ""}
          </p>
        </div>
        <button
          className="button-secondary telemetry-log-button"
          type="button"
          onClick={() => {
            setPage(0);
            setIsOpen(true);
          }}
        >
          All readings
        </button>
      </div>

      <div className="gauge-grid">
        {gauges.map((definition) => {
          const point = byKey.get(definition.key);
          const rawProgress = point ? ((point.latestValue - definition.min) / (definition.max - definition.min)) * 100 : 0;
          const progress = Math.max(0, Math.min(100, rawProgress));
          const style = {
            "--gauge-progress": `${progress * 2.7}deg`,
            "--gauge-accent": definition.accent
          } as CSSProperties;

          return (
            <article className="telemetry-gauge-card" key={definition.key}>
              <div className="telemetry-gauge" style={style}>
                <div className="telemetry-gauge-inner">
                  <strong>{point ? valueText(point.latestValue) : "—"}</strong>
                  <span>{point?.unit ?? ""}</span>
                </div>
              </div>
              <h3>{definition.label}</h3>
              <p>
                Range {definition.min}–{definition.max} {point?.unit ?? ""}
              </p>
            </article>
          );
        })}
      </div>

      <div className="telemetry-state-grid">
        {statePoints.map((point) => {
          const active = point.latestValue === 1;
          const isAlarm = point.key.includes("stop");
          const healthy = isAlarm ? !active : active;
          return (
            <div className="telemetry-state" key={point.key}>
              <span className={`telemetry-state-dot ${healthy ? "is-healthy" : "is-idle"}`} />
              <div>
                <strong>{point.label}</strong>
                <p>{isAlarm ? (active ? "TRIPPED" : "Clear") : active ? "Active" : "Off"}</p>
              </div>
            </div>
          );
        })}
      </div>

      {isOpen ? (
        <div className="telemetry-modal-backdrop" role="presentation" onMouseDown={() => setIsOpen(false)}>
          <section
            className="telemetry-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="all-readings-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="telemetry-modal-header">
              <div>
                <p className="eyebrow">Current snapshot</p>
                <h2 id="all-readings-title">Telemetry history</h2>
              </div>
              <button className="telemetry-close" type="button" onClick={() => setIsOpen(false)} aria-label="Close">
                ×
              </button>
            </div>

            <div className="telemetry-reading-list">
              {samples.map((sample) => (
                <div className="telemetry-reading-row" key={sample.id}>
                  <div>
                    <strong>{sample.key.replaceAll("_", " ")}</strong>
                    <small>{sample.deviceName}</small>
                  </div>
                  <span className="telemetry-reading-value">
                    {valueText(sample.value)} {sample.unit}
                  </span>
                  <time>{new Date(sample.capturedAt).toLocaleString()}</time>
                </div>
              ))}
            </div>

            <div className="telemetry-pagination">
              <button
                className="button-secondary"
                type="button"
                disabled={page === 0}
                onClick={() => setPage((current) => Math.max(0, current - 1))}
              >
                Previous
              </button>
              <span>
                Page {page + 1} of {pageCount}
              </span>
              <button
                className="button-secondary"
                type="button"
                disabled={page + 1 >= pageCount}
                onClick={() => setPage((current) => Math.min(pageCount - 1, current + 1))}
              >
                Next
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </section>
  );
}
