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
    </div>
    <details className={styles.details}><summary>Read the flow step by step</summary><ol><li>Node-RED reads sensor values and system/pump commands without changing controls.</li><li>Each signal receives its acquisition time and good/missing quality.</li><li>The sample is saved locally before upload. Normal active batches contain about five samples; bounded catch-up batches may contain more.</li><li>The website saves unique sample IDs and adds a prior ambient observation, labeled current, stale, or missing.</li><li>After the database confirms storage, Node-RED removes only acknowledged IDs.</li><li>Graphs display capture-time history. Cooling averages are intended for both groov View and the website; that integration is not yet commissioned.</li></ol></details>
  </div>;
}
