import Script from 'next/script'

export const metadata = {
  title: 'PermaCool Ethanol Chillers & Butane Recovery Systems | Industrial Extraction Cooling',
  description: 'PermaCool builds industrial ethanol chilling systems and butane recovery solutions for extraction labs.'
}

export default function HomePage() {
  return (
    <>
      <section className="hero hero-home">
        <div className="container hero-grid">
          <div>
            <p className="eyebrow">Industrial Extraction Cooling</p>
            <h1>Ethanol chillers and butane recovery systems engineered for production facilities.</h1>
            <p>
              PermaCool systems are designed for extraction teams that need fast pull-down times, stable low-temperature
              operation, and lower recurring costs than liquid nitrogen workflows.
            </p>
            <div className="cta-row">
              <a className="btn" href="/ethanol-chilling-systems">Explore Ethanol Chillers</a>
              <a className="btn btn-ghost" href="/contact-us">Request a Quote</a>
            </div>
          </div>
        </div>
        <div className="hero-snow" aria-hidden="true"></div>
        <div className="hero-jagged-divider" aria-hidden="true"></div>
      </section>

      <section className="split container post-hero-split">
        <article className="card">
          <h2><span className="icon-chip"><i data-lucide="snowflake"></i></span> Ethanol Chilling Systems</h2>
          <p>Direct refrigerant process chilling with HVAC condenser integration. Reach target process temperatures around -40°C while reducing LN2 dependency and consumable spend.</p>
          <a href="/ethanol-chilling-systems">Learn more →</a>
          <br /><a href="/ethanol-chiller-blast-150">Explore BLAST 150 →</a>
        </article>
        <article className="card">
          <h2><span className="icon-chip"><i data-lucide="flask-conical"></i></span> Butane Recovery for BHO</h2>
          <p>Triple Split™ architecture with controlled process zones, in-lab heat exchange, and centralized PLC visibility for safe, repeatable butane recovery workflows.</p>
          <a href="/butane-recovery-system">Learn more →</a>
        </article>
      </section>

      <section className="container section pt0 process-visual-section">
        <h2>How PermaCool process cooling flows through your operation</h2>
        <div className="process-steps clean-process-steps">
          <article className="card"><h3><span className="icon-chip"><i data-lucide="thermometer-snowflake"></i></span>01 • Pull-down</h3><p>Rapid refrigerant pull-down to hit target extraction temperature windows.</p></article>
          <article className="card"><h3><span className="icon-chip"><i data-lucide="activity"></i></span>02 • Stabilize</h3><p>PLC/HMI controls maintain repeatable process temps and protect runtime consistency.</p></article>
          <article className="card"><h3><span className="icon-chip"><i data-lucide="refresh-cw"></i></span>03 • Recover & Repeat</h3><p>Integrated cooling architecture supports high-duty production and lower consumable dependency.</p></article>
        </div>
      </section>

      <section className="container section pt0">
        <h2>Why extraction operators switch from LN2</h2>
        <ul className="list icon-list">
          <li><i data-lucide="badge-dollar-sign"></i> Lower recurring operating costs by minimizing consumables</li>
          <li><i data-lucide="sliders-horizontal"></i> Predictable system control through integrated PLC/HMI interfaces</li>
          <li><i data-lucide="factory"></i> Scalable process cooling for commercial extraction throughput</li>
        </ul>
        <p><a href="/direct-refrigerant-vs-ln2">Read: Direct Refrigerant vs LN2 →</a></p>
      </section>

      <section className="container section pt0">
        <h2>Common objections, answered</h2>
        <div className="card"><h3>“Will install disrupt production?”</h3><p>Most teams phase deployment around existing runs. We help sequence commissioning to minimize downtime.</p></div>
        <div className="card mt"><h3>“What if we scale in 6–12 months?”</h3><p>We design recommendations around current throughput and realistic expansion targets to reduce rework later.</p></div>
        <div className="cta-row mt"><a className="btn" href="/contact-us">Get a Build-Spec Quote</a><a className="btn btn-ghost" href="tel:+17472081001">Talk to an Engineer</a></div>
      </section>

      <div className="sticky-cta">
        <div className="inner">
          <p>Need pricing fast? Tell us your extraction throughput.</p>
          <a className="btn" href="/contact-us">Request a Quote</a>
        </div>
      </div>

      <Script src="https://unpkg.com/three@0.160.0/build/three.min.js" strategy="afterInteractive" />
      <Script id="hero-snow" strategy="afterInteractive">{`
        (function initSnow(retries){
          const root=document.querySelector('.hero-home');
          const mount=document.querySelector('.hero-snow');
          if(!root||!mount||!window.THREE){
            if((retries||0)<20){setTimeout(()=>initSnow((retries||0)+1),150);}return;
          }
          if(window.matchMedia('(max-width: 900px)').matches) return;
          const THREE=window.THREE;
          const scene=new THREE.Scene();
          const camera=new THREE.PerspectiveCamera(55,1,0.1,1000);camera.position.z=80;
          const renderer=new THREE.WebGLRenderer({alpha:true,antialias:true});
          renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.8));renderer.setClearColor(0x000000,0);mount.appendChild(renderer.domElement);
          const COUNT=180;const positions=new Float32Array(COUNT*3);const speeds=new Float32Array(COUNT);
          for(let i=0;i<COUNT;i++){const i3=i*3;positions[i3]=(Math.random()-0.5)*160;positions[i3+1]=(Math.random()-0.5)*90;positions[i3+2]=(Math.random()-0.5)*15;speeds[i]=0.12+Math.random()*0.28;}
          const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.BufferAttribute(positions,3));
          const spriteCanvas=document.createElement('canvas');spriteCanvas.width=64;spriteCanvas.height=64;const spriteCtx=spriteCanvas.getContext('2d');
          const grad=spriteCtx.createRadialGradient(32,32,0,32,32,32);grad.addColorStop(0,'rgba(255,255,255,1)');grad.addColorStop(0.45,'rgba(220,242,255,0.95)');grad.addColorStop(1,'rgba(220,242,255,0)');
          spriteCtx.fillStyle=grad;spriteCtx.beginPath();spriteCtx.arc(32,32,32,0,Math.PI*2);spriteCtx.fill();const spriteTex=new THREE.CanvasTexture(spriteCanvas);
          const material=new THREE.PointsMaterial({color:0xd9f2ff,size:1.15,map:spriteTex,alphaMap:spriteTex,transparent:true,opacity:0.82,depthWrite:false,alphaTest:0.05});
          const points=new THREE.Points(geometry,material);scene.add(points);
          function resize(){const w=mount.clientWidth,h=mount.clientHeight;if(!w||!h)return;camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h,false);} 
          function animate(){const pos=geometry.attributes.position.array;for(let i=0;i<COUNT;i++){const i3=i*3;pos[i3]+=speeds[i]*0.35;pos[i3+1]-=speeds[i]*0.6;if(pos[i3]>85)pos[i3]=-85;if(pos[i3+1]<-48)pos[i3+1]=48;}geometry.attributes.position.needsUpdate=true;renderer.render(scene,camera);requestAnimationFrame(animate);} 
          resize();window.addEventListener('resize',resize);animate();
        })();
      `}</Script>
    </>
  )
}
