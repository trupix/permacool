export type OperatingSignal<T> = {
  value: T;
  isFresh: boolean;
};

export type OperatingStepState =
  | 'unavailable'
  | 'off'
  | 'ready'
  | 'commanded'
  | 'confirmed'
  | 'mismatch';

export type OperatingStep = {
  id: 'system' | 'cycle' | 'pump' | 'solenoid' | 'compressor' | 'pumpFeedback' | 'compressorFeedback';
  label: string;
  detail: string;
  state: OperatingStepState;
};

export type OperatingSequenceInput = {
  systemOn: OperatingSignal<boolean> | null;
  cycleRun: OperatingSignal<boolean> | null;
  pumpOutput: OperatingSignal<boolean> | null;
  solenoidOutput: OperatingSignal<boolean> | null;
  compressorOutput: OperatingSignal<boolean> | null;
  pumpAmps: OperatingSignal<number> | null;
  compressorAmps: OperatingSignal<number> | null;
  currentThresholdAmps?: number;
};

export type OperatingSequence = {
  steps: OperatingStep[];
  findings: string[];
};

const DEFAULT_CURRENT_THRESHOLD_AMPS = 1;

function freshValue<T>(signal: OperatingSignal<T> | null): T | null {
  return signal?.isFresh ? signal.value : null;
}

function commandStep(
  id: 'pump' | 'solenoid' | 'compressor',
  label: string,
  signal: OperatingSignal<boolean> | null,
  mismatch: boolean
): OperatingStep {
  const value = freshValue(signal);
  if (value === null) return { id, label, state: 'unavailable', detail: 'Not configured' };
  if (mismatch) return { id, label, state: 'mismatch', detail: 'Command mismatch' };
  return value
    ? { id, label, state: 'commanded', detail: 'PLC output ON' }
    : { id, label, state: 'off', detail: 'PLC output OFF' };
}

function feedbackStep(
  id: 'pumpFeedback' | 'compressorFeedback',
  label: string,
  signal: OperatingSignal<number> | null,
  output: boolean | null,
  threshold: number
): OperatingStep {
  const amps = freshValue(signal);
  if (amps === null) return { id, label, state: 'unavailable', detail: 'Not configured' };

  const absoluteAmps = Math.abs(amps);
  const confirmed = absoluteAmps >= threshold;
  const mismatch = (output === true && !confirmed) || (output === false && confirmed);

  return {
    id,
    label,
    state: mismatch ? 'mismatch' : confirmed ? 'confirmed' : 'off',
    detail: `${absoluteAmps.toFixed(1)} A measured`
  };
}

export function deriveOperatingSequence(input: OperatingSequenceInput): OperatingSequence {
  const threshold = Math.max(0, input.currentThresholdAmps ?? DEFAULT_CURRENT_THRESHOLD_AMPS);
  const systemOn = freshValue(input.systemOn);
  const cycleRun = freshValue(input.cycleRun);
  const pumpOutput = freshValue(input.pumpOutput);
  const solenoidOutput = freshValue(input.solenoidOutput);
  const compressorOutput = freshValue(input.compressorOutput);
  const pumpAmps = freshValue(input.pumpAmps);
  const compressorAmps = freshValue(input.compressorAmps);
  const pumpConfirmed = pumpAmps === null ? null : Math.abs(pumpAmps) >= threshold;
  const compressorConfirmed = compressorAmps === null ? null : Math.abs(compressorAmps) >= threshold;

  const unexpectedOutput = systemOn === false &&
    [pumpOutput, solenoidOutput, compressorOutput].some((value) => value === true);
  const compressorCommandMismatch = cycleRun === true && compressorOutput === false;
  const pumpFeedbackMismatch =
    (pumpOutput === true && pumpConfirmed === false) ||
    (pumpOutput === false && pumpConfirmed === true);
  const compressorFeedbackMismatch =
    (compressorOutput === true && compressorConfirmed === false) ||
    (compressorOutput === false && compressorConfirmed === true);

  const findings: string[] = [];
  if (unexpectedOutput) findings.push('A physical output is ON while the system enable is OFF.');
  if (compressorCommandMismatch) findings.push('The chiller cycle is requested but the compressor output is OFF.');
  if (pumpOutput === true && pumpConfirmed === false) findings.push('The pump is commanded ON but current is not detected.');
  if (pumpOutput === false && pumpConfirmed === true) findings.push('Pump current is present while its PLC output command is OFF.');
  if (compressorOutput === true && compressorConfirmed === false) findings.push('The compressor is commanded ON but current is not detected.');
  if (compressorOutput === false && compressorConfirmed === true) findings.push('Compressor current is present while its PLC output command is OFF.');

  const systemStep: OperatingStep = systemOn === null
    ? { id: 'system', label: 'System enable', state: 'unavailable', detail: 'Waiting for PLC' }
    : systemOn
      ? { id: 'system', label: 'System enable', state: 'ready', detail: 'Enabled' }
      : { id: 'system', label: 'System enable', state: 'off', detail: 'Disabled' };
  const cycleStep: OperatingStep = cycleRun === null
    ? { id: 'cycle', label: 'Chiller cycle', state: 'unavailable', detail: 'Waiting for PLC' }
    : cycleRun
      ? { id: 'cycle', label: 'Chiller cycle', state: 'commanded', detail: 'Run requested' }
      : { id: 'cycle', label: 'Chiller cycle', state: 'off', detail: 'Not requested' };

  return {
    steps: [
      systemStep,
      cycleStep,
      commandStep('pump', 'Pump output', input.pumpOutput, unexpectedOutput && pumpOutput === true),
      commandStep('solenoid', 'Solenoid output', input.solenoidOutput, unexpectedOutput && solenoidOutput === true),
      commandStep(
        'compressor',
        'Compressor output',
        input.compressorOutput,
        (unexpectedOutput && compressorOutput === true) || compressorCommandMismatch
      ),
      feedbackStep('pumpFeedback', 'Pump feedback', input.pumpAmps, pumpOutput, threshold),
      feedbackStep(
        'compressorFeedback',
        'Compressor feedback',
        input.compressorAmps,
        compressorOutput,
        threshold
      )
    ],
    findings
  };
}
