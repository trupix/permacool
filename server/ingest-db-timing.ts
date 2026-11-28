import { AsyncLocalStorage } from 'node:async_hooks';
import { context, createContextKey, ROOT_CONTEXT } from '@opentelemetry/api';
import { AsyncLocalStorageContextManager } from '@opentelemetry/context-async-hooks';
import { BasicTracerProvider, SamplingDecision, type ReadableSpan, type Span } from '@opentelemetry/sdk-trace-base';
import { PrismaInstrumentation } from '@prisma/instrumentation';

type Clock = [number, number];
type Checkout = { waits: number[]; lastSqlEnd: number };
type Phase = {
  parents: Map<string, Checkout>;
  wait: number; lo: number; hi: number; attempts: number;
  noSql: number; ambiguous: boolean; coldConnectMs: number; sawDbWork: boolean;
};
const globalState = globalThis as typeof globalThis & { __permaIngestTiming?: {
  scope: AsyncLocalStorage<Phase>; initialized: boolean; installed?: boolean;
} };
const shared = globalState.__permaIngestTiming ??= { scope: new AsyncLocalStorage<Phase>(), initialized: false };
const ms = (t: Clock) => t[0] * 1000 + t[1] / 1e6;
const round = (n: number) => Math.round(n * 10) / 10;

// Private processor: no exporter, SQL, parameters, values or query attributes in logs.
// Use the native checkout span; do not wrap queries in extra transactions to time them.
export function initializeIngestTiming() {
  if (shared.initialized) return;
  shared.initialized = true;
  try {
    const instrumentation = new PrismaInstrumentation({enabled: false});
    if (instrumentation.isEnabled()) return; // Never replace another installed Prisma tracer.
    const key = createContextKey('perma.ingest.context-test');
    if (!context.with(ROOT_CONTEXT.setValue(key, true), () => context.active().getValue(key))) {
      context.setGlobalContextManager(new AsyncLocalStorageContextManager().enable());
    }
    const provider = new BasicTracerProvider({
      sampler: {shouldSample: () => ({decision: shared.scope.getStore() ? SamplingDecision.RECORD_AND_SAMPLED : SamplingDecision.NOT_RECORD}), toString: () => 'ingest-only'},
      spanProcessors: [{
        onStart(span: Span) {
          const p = shared.scope.getStore();
          if (!p) return;
          if (span.name.startsWith('prisma:')) p.sawDbWork = true;
          if (!span.name.startsWith('prisma:engine:')) return;
          const parent = p.parents.get(span.parentSpanContext?.spanId ?? '');
          if (span.name === 'prisma:engine:query' || parent) {
            p.parents.set(span.spanContext().spanId, parent ?? {waits: [], lastSqlEnd: 0});
          }
        },
        onEnd(span: ReadableSpan) {
          const p = shared.scope.getStore(); if (!p) return;
          if (span.name === 'prisma:engine:connect') p.coldConnectMs += ms(span.duration);
          const id = span.spanContext().spanId, q = p.parents.get(id);
          if (!q) return;
          p.parents.delete(id);
          const end = ms(span.endTime);
          if (span.name === 'prisma:engine:connection') {
            q.waits.push(end); p.wait += ms(span.duration); p.attempts++;
          } else if (span.name === 'prisma:engine:db_query') {
            q.lastSqlEnd = Math.max(q.lastSqlEnd, end);
          } else if (span.name === 'prisma:engine:query') {
            if (q.waits.length !== 1) p.ambiguous = true;
            else if (!q.lastSqlEnd) p.noSql++;
            else {
              // Connection was held through the final SQL (including COMMIT/ROLLBACK)
              // and returned by engine completion. Prisma has no exact release span.
              p.lo += Math.max(0, q.lastSqlEnd - q.waits[0]);
              p.hi += Math.max(0, Math.max(end, q.lastSqlEnd) - q.waits[0]);
            }
          }
        },
        forceFlush: async () => {}, shutdown: async () => {}
      }]
    });
    instrumentation.setTracerProvider(provider);
    instrumentation.enable();
    shared.installed = true;
  } catch { /* Telemetry persistence must not depend on tracing availability. */ }
}

export function dbErrorCode(error: unknown) {
  const code = (error as {code?: unknown; errorCode?: unknown} | null)?.code ??
    (error as {errorCode?: unknown} | null)?.errorCode;
  return typeof code === 'string' && /^P\d{4}$/.test(code) ? code : null;
}
export type DbStep = {
  phase: string; elapsedMs: number; checkoutAttempts: number; waitMs: number | null;
  heldMinMs: number | null; heldMaxMs: number | null; coldConnectMs?: number; code?: string; failed?: true; sharedOrCached?: true;
};
export async function timeDbStep<T>(steps: DbStep[], phase: string, work: () => PromiseLike<T>): Promise<T> {
  initializeIngestTiming();
  const p: Phase = {parents: new Map(), wait: 0, lo: 0, hi: 0, attempts: 0, noSql: 0, ambiguous: false, coldConnectMs: 0, sawDbWork: false};
  const started = performance.now(); let code: string | null = null; let failed = false;
  try {
    // Await *inside* the context: Prisma promises are lazy.
    return await shared.scope.run(p, async () => await work());
  } catch (error) { failed = true; code = dbErrorCode(error); throw error; }
  finally {
    // This single-flight initializer can await an existing promise without taking a connection itself.
    const sharedOrCached = phase === 'event_storage' && shared.installed && !p.sawDbWork && !failed;
    const known = sharedOrCached || (p.attempts > 0 && !p.ambiguous && (p.noSql === 0 || (p.noSql === 1 && code === 'P2024')));
    steps.push({phase, elapsedMs: round(performance.now()-started), checkoutAttempts: p.attempts,
      waitMs: p.attempts ? round(p.wait) : sharedOrCached ? 0 : null,
      heldMinMs: known ? Math.floor(p.lo * 10) / 10 : null, heldMaxMs: known ? Math.ceil(p.hi * 10) / 10 : null,
      ...(p.coldConnectMs ? {coldConnectMs: round(p.coldConnectMs)} : {}), ...(code ? {code} : {}),
      ...(failed ? {failed: true} : {}), ...(sharedOrCached ? {sharedOrCached: true} : {})});
  }
}
