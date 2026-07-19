import type {
  LogicDefinition,
  LogicDefinitionCategory,
  LogicImplementationStatus
} from '@/types/domain';

export type LogicDefinitionSeed = Omit<LogicDefinition, 'id' | 'createdAt' | 'updatedAt'>;

export const logicCategoryLabels: Record<LogicDefinitionCategory, string> = {
  signal: 'PLC signals',
  operation: 'Operating state',
  event: 'Events and alarms',
  storage: 'Storage and history',
  display: 'Display conventions'
};

export const logicStatusLabels: Record<LogicImplementationStatus, string> = {
  deployed: 'Deployed',
  draft: 'Draft',
  retired: 'Retired'
};

export const defaultLogicDefinitions: LogicDefinitionSeed[] = [
  {
    slug: 'signal-chiller-run',
    category: 'signal',
    title: 'Chiller run state',
    signalKey: 'ch1_chiller_run / ch2_chiller_run',
    definition: 'Whether each chiller or condenser is currently commanded to run. 0 is OFF and 1 is ON.',
    behavior: 'Drives the ON/OFF state displayed for CH1 and CH2. A transition from 1 to 0 can also qualify as a normal reached-temperature cycle.',
    implementationStatus: 'deployed',
    sortOrder: 10,
    updatedBy: 'System catalog'
  },
  {
    slug: 'signal-compressor-runtime',
    category: 'signal',
    title: 'Compressor accumulated runtime',
    signalKey: 'ch1_compressor_runtime_min / ch2_compressor_runtime_min',
    definition: 'Total accumulated compressor runtime for each condenser, measured in minutes.',
    behavior: 'Displayed on the unit status and performance cards and included in event snapshots when available.',
    implementationStatus: 'deployed',
    sortOrder: 20,
    updatedBy: 'System catalog'
  },
  {
    slug: 'signal-high-pressure',
    category: 'signal',
    title: 'Current high-side pressure',
    signalKey: 'ch1_high_pressure / ch2_high_pressure',
    definition: 'Current high-side refrigerant pressure for each condenser.',
    behavior: 'Displayed in PSI on a 0-500 PSI scale and captured with every operating event or alarm when available.',
    implementationStatus: 'deployed',
    sortOrder: 30,
    updatedBy: 'System catalog'
  },
  {
    slug: 'signal-channel-high-pressure-stop',
    category: 'signal',
    title: 'Channel high-pressure stop',
    signalKey: 'ch1_high_pressure_stop / ch2_high_pressure_stop',
    definition: 'Whether CH1 or CH2 is being stopped by its high-pressure safety limit. 1 is an active stop and 0 is not stopped by high pressure.',
    behavior: 'A transition to 1 opens the channel-specific critical alert. A transition back to 0 resolves it and records a recovery event.',
    implementationStatus: 'deployed',
    sortOrder: 40,
    updatedBy: 'System catalog'
  },
  {
    slug: 'signal-aggregate-high-pressure-stop',
    category: 'signal',
    title: 'System high-pressure stop',
    signalKey: 'high_pressure_stop',
    definition: 'Aggregate indication that the system stopped because of high pressure.',
    behavior: 'Creates a SYSTEM high-pressure alarm only when neither channel-specific stop identifies CH1 or CH2.',
    implementationStatus: 'deployed',
    sortOrder: 50,
    updatedBy: 'System catalog'
  },
  {
    slug: 'signal-low-pressure',
    category: 'signal',
    title: 'Current low-side pressure',
    signalKey: 'ch1_low_pressure / ch2_low_pressure',
    definition: 'Current low-side refrigerant pressure for each condenser.',
    behavior: 'Displayed in PSI on a -14.7-300 PSI scale and captured with every operating event or alarm when available.',
    implementationStatus: 'deployed',
    sortOrder: 60,
    updatedBy: 'System catalog'
  },
  {
    slug: 'signal-setpoint',
    category: 'signal',
    title: 'Process temperature setpoint',
    signalKey: 'ch1_setpoint_c / ch2_setpoint_c',
    definition: 'The target process-fluid temperature at which the corresponding chiller cycles off normally.',
    behavior: 'Used with the run-state transition and process temperature to identify a reached-temperature event. The telemetry payload unit is authoritative.',
    implementationStatus: 'deployed',
    sortOrder: 70,
    updatedBy: 'System catalog'
  },
  {
    slug: 'signal-system-on',
    category: 'signal',
    title: 'System enable state',
    signalKey: 'ch1_system_on / ch2_system_on',
    definition: 'Whether each system is enabled. 1 is enabled or turned on and 0 is disabled or turned off.',
    behavior: 'Every change between 0 and 1 is recorded as a system ON or system OFF event.',
    implementationStatus: 'deployed',
    sortOrder: 80,
    updatedBy: 'System catalog'
  },
  {
    slug: 'signal-process-temperature',
    category: 'signal',
    title: 'Process-fluid temperature',
    signalKey: 'ch1_temperature_c / ch2_temperature_c',
    definition: 'Current process-fluid temperature for CH1 or CH2. At Salinas the process fluid is ethanol and the received reading is Fahrenheit.',
    behavior: 'Displayed on a -50-100 F range and captured with all events and alarms. Despite the legacy _c key suffix, the payload unit controls display and storage.',
    implementationStatus: 'deployed',
    sortOrder: 90,
    updatedBy: 'System catalog'
  },
  {
    slug: 'signal-compressor-amps',
    category: 'signal',
    title: 'Compressor current',
    signalKey: 'ch1_compressor_amps / ch2_compressor_amps',
    definition: 'Current transducer amperage for each compressor.',
    behavior: 'Displayed with the unit performance data and captured in every event snapshot when available.',
    implementationStatus: 'deployed',
    sortOrder: 100,
    updatedBy: 'System catalog'
  },
  {
    slug: 'operation-unit-state',
    category: 'operation',
    title: 'CH1 and CH2 top status',
    signalKey: null,
    definition: 'Each system receives a dedicated top-level status card showing run state, enable state, telemetry currency, accumulated runtime, and high-pressure alarm state.',
    behavior: 'Run state is ON when chiller_run is 1 and OFF when it is 0. Unknown values display as pending rather than guessing.',
    implementationStatus: 'deployed',
    sortOrder: 110,
    updatedBy: 'System catalog'
  },
  {
    slug: 'operation-current-telemetry',
    category: 'operation',
    title: 'Current versus stale telemetry',
    signalKey: null,
    definition: 'A unit is current when at least one mapped operating pressure, temperature, amperage, run, or enable signal has arrived within five minutes.',
    behavior: 'An unchanged runtime or discrete value does not make the unit stale while another operating signal continues updating. Discrete state is retained while core telemetry remains current.',
    implementationStatus: 'deployed',
    sortOrder: 120,
    updatedBy: 'System catalog'
  },
  {
    slug: 'event-high-pressure-open',
    category: 'event',
    title: 'Open high-pressure alarm',
    signalKey: null,
    definition: 'A channel high-pressure-stop transition from 0 to 1, or the first observed active state, is a critical alarm.',
    behavior: 'Alert format: “{Location} compressor - CH1 or CH2 - HIGH PRESSURE STOP”. The aggregate signal uses SYSTEM when no channel can be identified.',
    implementationStatus: 'deployed',
    sortOrder: 130,
    updatedBy: 'System catalog'
  },
  {
    slug: 'event-high-pressure-clear',
    category: 'event',
    title: 'Clear high-pressure alarm',
    signalKey: null,
    definition: 'A high-pressure-stop transition from 1 to 0 indicates that the safety-stop condition has cleared.',
    behavior: 'The matching open alert is resolved and a recovery event is added to the permanent operating history.',
    implementationStatus: 'deployed',
    sortOrder: 140,
    updatedBy: 'System catalog'
  },
  {
    slug: 'event-reached-temperature',
    category: 'event',
    title: 'Reached temperature',
    signalKey: null,
    definition: 'A normal chiller cycle completes when run state changes from 1 to 0 while the system remains enabled, no high-pressure stop is active, and process temperature is at or below setpoint.',
    behavior: 'Adds “Reached Temperature ({setpoint} {unit})” to Recent Events. It is a normal event and does not open an alarm.',
    implementationStatus: 'deployed',
    sortOrder: 150,
    updatedBy: 'System catalog'
  },
  {
    slug: 'event-system-state',
    category: 'event',
    title: 'System enabled or disabled',
    signalKey: null,
    definition: 'Every observed change to system_on is an operating event.',
    behavior: '0 to 1 records SYSTEM ON. 1 to 0 records SYSTEM OFF. Initial observations do not manufacture a transition that was not seen.',
    implementationStatus: 'deployed',
    sortOrder: 160,
    updatedBy: 'System catalog'
  },
  {
    slug: 'event-snapshot',
    category: 'event',
    title: 'Event condition snapshot',
    signalKey: null,
    definition: 'Every recorded operating event or alarm carries the conditions available at that moment.',
    behavior: 'Snapshot fields are high pressure, low pressure, process-fluid temperature and unit, compressor amps, runtime minutes, and setpoint and unit.',
    implementationStatus: 'deployed',
    sortOrder: 170,
    updatedBy: 'System catalog'
  },
  {
    slug: 'event-deduplication',
    category: 'event',
    title: 'Duplicate-event prevention',
    signalKey: null,
    definition: 'Repeated telemetry containing the same state must not create repeated events or alarms.',
    behavior: 'Events are transition-based and use a unique dedupe key composed from site, device, channel, event type, and captured timestamp.',
    implementationStatus: 'deployed',
    sortOrder: 180,
    updatedBy: 'System catalog'
  },
  {
    slug: 'storage-latest-values',
    category: 'storage',
    title: 'Latest telemetry values',
    signalKey: 'TelemetryPoint',
    definition: 'Stores the latest received value and timestamp for each device signal.',
    behavior: 'Telemetry ingestion upserts one row per device and signal key so the dashboard can read the newest known operating state.',
    implementationStatus: 'deployed',
    sortOrder: 190,
    updatedBy: 'System catalog'
  },
  {
    slug: 'storage-alerts',
    category: 'storage',
    title: 'Alarm lifecycle',
    signalKey: 'Alert',
    definition: 'Stores open, acknowledged, and resolved alarm records.',
    behavior: 'High-pressure-stop transitions open and automatically resolve matching critical alerts without interrupting primary telemetry persistence.',
    implementationStatus: 'deployed',
    sortOrder: 200,
    updatedBy: 'System catalog'
  },
  {
    slug: 'storage-equipment-events',
    category: 'storage',
    title: 'Permanent equipment history',
    signalKey: 'EquipmentEvent',
    definition: 'PostgreSQL record of normal cycles, state transitions, safety stops, recoveries, and their condition snapshots.',
    behavior: 'The Site Detail page shows recent entries. The full page is paginated at 100 records and CSV download exports up to 10,000 newest records.',
    implementationStatus: 'deployed',
    sortOrder: 210,
    updatedBy: 'System catalog'
  },
  {
    slug: 'storage-logic-definitions',
    category: 'storage',
    title: 'Logic specification catalog',
    signalKey: 'LogicDefinition',
    definition: 'Permanent, editable record of PLC signal meanings, dashboard rules, event logic, storage behavior, and display conventions.',
    behavior: 'Edits here update the specification and audit metadata. They do not silently reprogram the PLC or change deployed application code.',
    implementationStatus: 'deployed',
    sortOrder: 220,
    updatedBy: 'System catalog'
  },
  {
    slug: 'display-engineering-ranges',
    category: 'display',
    title: 'Engineering display ranges',
    signalKey: null,
    definition: 'High pressure displays from 0-500 PSI, low pressure from -14.7-300 PSI, and process-fluid temperature from -50-100 F.',
    behavior: 'Ranges provide display context only. They are not alarm thresholds unless a separate alarm definition explicitly says so.',
    implementationStatus: 'deployed',
    sortOrder: 230,
    updatedBy: 'System catalog'
  },
  {
    slug: 'display-unit-authority',
    category: 'display',
    title: 'Telemetry unit authority',
    signalKey: null,
    definition: 'The unit sent in the telemetry payload is authoritative even when a legacy signal key has a misleading suffix.',
    behavior: 'Salinas process-temperature and setpoint values are displayed and logged in F when the payload supplies unit “F”; the dashboard does not infer Celsius from _c.',
    implementationStatus: 'deployed',
    sortOrder: 240,
    updatedBy: 'System catalog'
  }
];
