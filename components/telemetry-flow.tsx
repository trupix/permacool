'use client';

import { useState } from 'react';
import styles from './telemetry-flow.module.css';

function FlowPath({d,active=true,reverse=false,resting=false}:{d:string;active?:boolean;reverse?:boolean;resting?:boolean}) {
  return <g><path d={d} className={active?styles.line:styles.offlineLine}/>{active&&[0,1,2].map(i=><circle key={i} r="4" className={reverse?styles.ackDot:styles.dot}><animateMotion path={d} dur={resting?'9s':'4s'} begin={`${-i*(resting?3:1.33)}s`} repeatCount="indefinite"/></circle>)}</g>;
}
function Box({x,y,title,detail,foot,dim=false}:{x:number;y:number;title:string;detail:string;foot:string;dim?:boolean}) {
  return <g className={dim?styles.dim:undefined}><rect x={x} y={y} width="240" height="112" rx="16" className={styles.box}/><text x={x+20} y={y+30} className={styles.nodeTitle}>{title}</text><text x={x+20} y={y+59} className={styles.nodeDetail}>{detail}</text><text x={x+20} y={y+85} className={styles.nodeFoot}>{foot}</text></g>;
}
export function TelemetryFlow() {
  const [systemOn,setSystemOn]=useState(true),[pumpOn,setPumpOn]=useState(true),[internet,setInternet]=useState(true),[motion,setMotion]=useState(true);
  const calculate=systemOn&&pumpOn;
  const summary=!internet?'Internet unavailable: samples remain queued locally.':systemOn?'Active monitoring: collect every 3 seconds; upload every 15 seconds.':'Resting monitoring: collect and upload once per minute.';
  return <div className={styles.root}>
    <div className={styles.toolbar}>
      <div><span className={styles.badge}>PLANNED · INTERACTIVE EXAMPLE</span><h2>One reading. A complete history.</h2></div>
      <button type="button" onClick={()=>setMotion(!motion)}>{motion?'Pause animation':'Resume animation'}</button>
    </div>
    <fieldset className={styles.controls}><legend>Explore a scenario — these switches do not control the PLC</legend>
      <label><input type="checkbox" checked={systemOn} onChange={e=>setSystemOn(e.target.checked)}/>System commanded On</label>
      <label><input type="checkbox" checked={pumpOn} onChange={e=>setPumpOn(e.target.checked)}/>Pump commanded On</label>
      <label><input type="checkbox" checked={internet} onChange={e=>setInternet(e.target.checked)}/>Internet available</label>
    </fieldset>
    <p className={styles.summary} aria-live="polite">{summary}</p>
    <div className={styles.canvas}>
      <svg viewBox="0 0 1040 620" role="img" aria-labelledby="telemetry-flow-title telemetry-flow-desc">
        <title id="telemetry-flow-title">Planned controller telemetry flow</title><desc id="telemetry-flow-desc">Sensors are read by Node-RED, saved in a bounded durable queue, and uploaded to the website. Only a durable database acknowledgment removes saved entries. Degrees Per Min requires system and pump commands On. Internet loss stops upload, not local collection.</desc>
        <text x="30" y="30" className={styles.zone}>ON THE CONTROLLER · READ-ONLY MONITORING</text>
        <text x="770" y="30" className={styles.zone}>WEBSITE / CLOUD</text>
        <FlowPath d="M270 126 L340 126" active={motion} resting={!systemOn}/>
        <FlowPath d="M580 126 L650 126 L650 276 L580 276" active={motion} resting={!systemOn}/>
        <FlowPath d="M580 276 L770 276" active={motion&&internet} resting={!systemOn}/>
        <text x="675" y="254" textAnchor="middle" className={styles.edgeLabel}>{internet?'HTTPS batch':'Waiting for internet'}</text>
        <FlowPath d="M770 312 L690 312 L690 356 L460 356 L460 332" active={motion&&internet} reverse resting={!systemOn}/>
        <text x="620" y="380" textAnchor="middle" className={styles.edgeLabel}>Saved IDs acknowledged → remove only those entries</text>
        <FlowPath d="M890 220 L890 182" active={motion&&internet}/>
        <FlowPath d="M460 182 L460 203 L150 203 L150 220" active={motion&&calculate} resting={!systemOn}/>
        <FlowPath d="M150 332 L150 440" active={motion&&calculate}/>
        <FlowPath d="M270 276 L300 276 L300 410 L735 410 L735 126 L770 126" active={motion&&calculate&&internet}/>
        <text x="490" y="432" textAnchor="middle" className={styles.edgeLabel}>Same calculated results → website and groov View</text>
        <FlowPath d="M890 440 L890 332" active={motion&&internet} resting/>
        <Box x={30} y={70} title="PAC + physical I/O" detail="Temperature · pressure · commands" foot="Each reading keeps its capture time"/>
        <Box x={340} y={70} title="Node-RED collector" detail={systemOn?'Full sample every 3 seconds':'Full sample every 60 seconds'} foot="System-status check every 3 seconds"/>
        <Box x={340} y={220} title="Durable local queue" detail={systemOn?'Upload every 15 seconds':'Upload every 60 seconds'} foot="Retry safely · bounded storage"/>
        <Box x={770} y={220} title="Website + database" detail="Validate · deduplicate · save" foot="Acknowledge after database commit" dim={!internet}/>
        <Box x={770} y={70} title="Graphs + daily history" detail="Original timestamps · visible gaps" foot="Old uploads never become live data" dim={!internet}/>
        <Box x={30} y={220} title="Degrees Per Min" detail={calculate?'Calculating eligible cooling blocks':'Paused — '+(!systemOn?'system Off':'pump Off')} foot="Complete blocks → historical averages" dim={!calculate}/>
        <Box x={30} y={440} title="groov View display" detail="Same cooling rates for technicians" foot="Dedicated display tags · no PAC writes"/>
        <Box x={770} y={440} title="Ambient observations" detail="Website adds matching weather" foot="Source + observation time retained"/>
        <text x="30" y="594" className={styles.edgeLabel}>Moving dots illustrate direction, not real-time speed. VPN is not required for outbound telemetry.</text>
      </svg>
    </div>
    <div className={styles.notes}>
      <article><h3>Resting is operator Off</h3><p>Compressor and solenoid cycling do not slow telemetry. System On stays at 3-second sampling, including delays and faults.</p></article>
      <article><h3>Pump gates the cooling average</h3><p>System and pump must both be commanded On. An interrupted block is excluded; stopped time is never joined to the next calculation. Commands do not prove physical flow.</p></article>
      <article><h3>History survives an outage</h3><p>Unacknowledged samples stay on the controller within the storage limit. At capacity, oldest entries are dropped with a loss counter. Missing history is never invented.</p></article>
      <article><h3>Six connection checks</h3><p>VPN, PAC strategy, physical I/O presence, Node-RED, cloud delivery, and website status remain separate. Each needs its own evidence and last-checked time. Connected is green, checking or unknown is gray, and a confirmed failure is red. A planned, deliberately disconnected VPN is not an equipment fault.</p><p>GoldDrop hourly I/O support: the website accepts a completed, matching diagnostic report for one hour plus one minute of delivery grace, while requiring current heartbeat, PAC reads and strategy status. The display retains the actual check time; hourly results do not prove continuous module or output health. Other sites retain their existing freshness rules.</p><p>GoldDrop commissioning pending: the new PAC strategy is local only, and its Node-RED companion flow remains disabled. PAC will own startup, system-on and hourly diagnostics. The API account remains read-only; external recovery-check requests are not enabled. No automatic PLC, network or service restarts.</p></article>
      <article><h3>Module quality: triggered checks</h3><p>Check on telemetry-monitor startup, a confirmed PLC reboot, and system Off-to-On. Combine simultaneous triggers. No continuous quality polling is planned; show the last check time and never present an old result as continuous verification. Unwired or uncommissioned channels are excluded from required-sensor faults, not replaced with fake readings.</p></article>
      <article><h3>Operating reasons and major alerts</h3><p>Planned PAC reporting supplies the actual reason for Cooling Stopped or Start Blocked to groov View and the website. Major alerts include a verified high-pressure trip, invalid required sensor, required I/O failure, unexpected strategy stop, sustained telemetry loss, and storage failure or data loss. Exact interlocks still require strategy verification; NaN alone must not be described as a proven shutdown.</p></article>
      <article><h3>Normal states are not faults</h3><p>Show commanded cooling in blue and normal waiting or cycling in green. Low Temp Cycling, Pump Start Delay, Pump Stop Countdown, and operator Off are operating states. CH1 pump, liquid pump, compressor, and solenoid commands stay distinct. A command is not physical feedback; contradictory displays must not be treated as verified equipment state.</p></article>
      <article><h3>Events and daily organization</h3><p>Record fault onset and recovery, relevant operating-state transitions, monitoring startup, confirmed controller reboot, and queue data loss. Deduplicate repeated faults. Group history by the site’s local calendar day while retaining original timestamps. Node-RED startup is not proof of PLC reboot. Telemetry DNS failures are excluded from the local event history; website delivery freshness is tracked separately.</p></article>
      <article><h3>Cooling-rate blocks</h3><p>Degrees Per Min covers 80→50, 50→30, 30→10, 10→0, 0→−10, −10→−20, −20→−30, and −30→−40 °F. Require valid, fresh temperature and eligible system/pump commands. Keep completed-block results and averages; do not join gaps or interrupted runs. Display the same results in groov View and website graphs.</p></article>
      <article><h3>On-demand VPN: future option</h3><p>Outbound authenticated HTTPS telemetry works without the VPN. A future authorized website request could be received through that outbound connection to enable remote service access. EPIC support, built-in retries, permissions, expiry, and audit logging must be verified first. No automatic reconnect or remote equipment control is enabled by this diagram.</p></article>
      <article><h3>Versioned controller library</h3><p>Track PAC strategy, Node-RED, groov configuration, and firmware versions per site. Keep before-and-after backups and installed-release records in the controller library, with copies in the approved Google Drive folder. Keep credentials protected. Website source is versioned separately in Git; a source archive is not a full controller recovery backup.</p></article>
    </div>
    <details className={styles.details}><summary>Read the flow step by step</summary><ol><li>Node-RED reads sensor values and system/pump commands without changing controls.</li><li>Each signal receives its acquisition time and good/missing quality.</li><li>The sample is saved locally before upload. Normal active batches contain about five samples; bounded catch-up batches may contain more.</li><li>The website saves unique sample IDs and adds a prior ambient observation, labeled current, stale, or missing.</li><li>After the database confirms storage, Node-RED removes only acknowledged IDs.</li><li>Graphs display capture-time history. Cooling averages are intended for both groov View and the website; that integration is not yet commissioned.</li></ol></details>
  </div>;
}
