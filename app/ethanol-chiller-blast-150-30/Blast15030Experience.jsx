"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

const imageRoot = "/images/generated/blast15030";

const components = [
  {
    number: "01",
    title: "22 HP Primary Unit",
    copy: "The high-capacity workhorse at the center of the BLAST 150/30, engineered to hold the cold even when ambient temperatures climb.",
    image: `${imageRoot}/desert-22hp.png`
  },
  {
    number: "02",
    title: "6 HP Cascade Condenser",
    copy: "A dedicated cascade subcooling stage positioned beside the primary unit, with both grilles aligned for clean, parallel airflow.",
    image: `${imageRoot}/desert-6hp.png`
  },
  {
    number: "03",
    title: "Open FluxBox",
    copy: "Wall-mounted in Zone 2, as close as practical to the Zone 3 ethanol skid, ready for field insulation.",
    image: `${imageRoot}/desert-fluxbox.png`
  },
  {
    number: "04",
    title: "Integrated PLC",
    copy: "A clean, centralized control panel positioned beside the FluxBox—or anywhere within 40 feet in Zone 2.",
    image: `${imageRoot}/desert-plc.png`
  }
];

function HeatMirage() {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return undefined;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(48, 1, 0.1, 100);
    camera.position.z = 9;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    const count = 340;
    const positions = new Float32Array(count * 3);
    const speeds = new Float32Array(count);
    for (let index = 0; index < count; index += 1) {
      positions[index * 3] = (Math.random() - 0.5) * 18;
      positions[index * 3 + 1] = (Math.random() - 0.5) * 10;
      positions[index * 3 + 2] = (Math.random() - 0.5) * 5;
      speeds[index] = 0.003 + Math.random() * 0.008;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const dustMaterial = new THREE.PointsMaterial({
      size: 0.022,
      color: 0xffc66d,
      transparent: true,
      opacity: 0.38,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });
    scene.add(new THREE.Points(geometry, dustMaterial));

    const flareGroup = new THREE.Group();
    const rayGroup = new THREE.Group();
    const sunOrigin = new THREE.Vector3();
    const earthTarget = new THREE.Vector3();
    const palette = [
      [255, 242, 198],
      [255, 190, 92],
      [255, 137, 49],
      [116, 226, 255]
    ];

    const createFlareTexture = (variant) => {
      const size = 256;
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const context = canvas.getContext("2d");
      if (!context) return new THREE.Texture();
      const [red, green, blue] = palette[variant % palette.length];
      const center = size / 2;
      const glow = context.createRadialGradient(center, center, 4, center, center, center);
      glow.addColorStop(0, `rgba(${red}, ${green}, ${blue}, .24)`);
      glow.addColorStop(0.46, `rgba(${red}, ${green}, ${blue}, .12)`);
      glow.addColorStop(1, `rgba(${red}, ${green}, ${blue}, 0)`);
      context.fillStyle = glow;
      context.fillRect(0, 0, size, size);
      context.beginPath();
      context.arc(center, center, 65 + variant * 8, 0, Math.PI * 2);
      context.lineWidth = 4 + variant;
      context.strokeStyle = `rgba(${red}, ${green}, ${blue}, ${0.34 - variant * 0.035})`;
      context.shadowColor = `rgba(${red}, ${green}, ${blue}, .75)`;
      context.shadowBlur = 18 + variant * 5;
      context.stroke();
      const texture = new THREE.CanvasTexture(canvas);
      texture.colorSpace = THREE.SRGBColorSpace;
      return texture;
    };

    const flareTextures = palette.map((_, index) => createFlareTexture(index));
    for (let index = 0; index < 8; index += 1) {
      const material = new THREE.SpriteMaterial({
        map: flareTextures[index % flareTextures.length],
        transparent: true,
        opacity: 0,
        depthWrite: false,
        blending: THREE.AdditiveBlending
      });
      const flare = new THREE.Sprite(material);
      flare.userData.distance = (index + 1) / 9;
      flare.userData.variant = index % flareTextures.length;
      flare.userData.offset = ((index % 3) - 1) * 0.075;
      flareGroup.add(flare);
    }
    scene.add(flareGroup);

    for (let index = 0; index < 5; index += 1) {
      const lineGeometry = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]);
      const lineMaterial = new THREE.LineBasicMaterial({
        color: index % 2 ? 0xffd89a : 0xffb45a,
        transparent: true,
        opacity: 0.04,
        depthWrite: false,
        blending: THREE.AdditiveBlending
      });
      const ray = new THREE.Line(lineGeometry, lineMaterial);
      ray.userData.offset = (index - 2) * 0.13;
      rayGroup.add(ray);
    }
    scene.add(rayGroup);

    const resize = () => {
      renderer.setSize(mount.clientWidth, mount.clientHeight, false);
      camera.aspect = mount.clientWidth / Math.max(mount.clientHeight, 1);
      camera.updateProjectionMatrix();
      const visibleHeight = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.position.z;
      const visibleWidth = visibleHeight * camera.aspect;
      sunOrigin.set((0.15 - 0.5) * visibleWidth, (0.5 - 0.14) * visibleHeight, -1);
      earthTarget.set((0.47 - 0.5) * visibleWidth, (0.5 - 0.84) * visibleHeight, -1);
      rayGroup.children.forEach((ray) => {
        const values = ray.geometry.attributes.position.array;
        values[0] = sunOrigin.x;
        values[1] = sunOrigin.y;
        values[2] = sunOrigin.z;
        values[3] = earthTarget.x + ray.userData.offset;
        values[4] = earthTarget.y + ray.userData.offset * 0.45;
        values[5] = earthTarget.z;
        ray.geometry.attributes.position.needsUpdate = true;
      });
    };

    const observer = new ResizeObserver(resize);
    observer.observe(mount);
    resize();

    let frame = 0;
    const render = () => {
      const points = geometry.attributes.position.array;
      for (let index = 0; index < count; index += 1) {
        points[index * 3 + 1] += speeds[index];
        points[index * 3] += Math.sin(points[index * 3 + 1] * 1.8 + index) * 0.0008;
        if (points[index * 3 + 1] > 5) points[index * 3 + 1] = -5;
      }
      geometry.attributes.position.needsUpdate = true;

      const elapsed = performance.now() * 0.001;
      flareGroup.children.forEach((flare) => {
        const { distance, variant, offset } = flare.userData;
        const pulse = (Math.sin(elapsed * 1.35 - distance * 6.4) + 1) / 2;
        const pathPosition = THREE.MathUtils.clamp(distance + 0.012 * Math.sin(elapsed * 0.72 + distance * 9), 0, 1);
        const baseSize = 0.12 + Math.pow(distance, 2.15) * 3.05;
        const size = baseSize * (0.9 + pulse * (0.1 + variant * 0.018));
        flare.position.lerpVectors(sunOrigin, earthTarget, pathPosition);
        flare.position.x += offset;
        flare.position.y -= offset * 0.28;
        flare.scale.set(size, size, 1);
        flare.material.opacity = (0.19 + variant * 0.025) * (0.66 + pulse * 0.34);
      });
      rayGroup.children.forEach((ray, index) => {
        ray.material.opacity = 0.025 + ((Math.sin(elapsed * 1.05 + index * 0.8) + 1) / 2) * 0.055;
      });
      renderer.render(scene, camera);
      frame = requestAnimationFrame(render);
    };
    render();

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      geometry.dispose();
      dustMaterial.dispose();
      flareGroup.children.forEach((flare) => flare.material.dispose());
      flareTextures.forEach((texture) => texture.dispose());
      rayGroup.children.forEach((ray) => {
        ray.geometry.dispose();
        ray.material.dispose();
      });
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return <div className="b15030-mirage-canvas" ref={mountRef} aria-hidden="true" />;
}

function Eyebrow({ children }) {
  return <p className="b15030-eyebrow"><span />{children}</p>;
}

export default function Blast15030Experience({ pricingHref }) {
  return (
    <div className="b15030" id="top">
      <nav className="b15030-local-nav" aria-label="BLAST 150/30 page sections">
        <strong>BLAST™ 150/30</strong>
        <div>
          <a href="#system">System</a>
          <a href="#mirage">Mirage</a>
          <a href="#regeneration">Regenerative chilling</a>
          <a href="#layout">Installation</a>
        </div>
        <a className="b15030-local-cta" href={pricingHref}>Request pricing</a>
      </nav>

      <section className="b15030-hero">
        <HeatMirage />
        <div className="b15030-heat-band" aria-hidden="true" />
        <div className="b15030-hero-copy">
          <Eyebrow>Engineered beyond ambient limits</Eyebrow>
          <p className="b15030-model">BLAST™ 150/30</p>
          <h1>Desert heat.<br /><em>Unbroken</em><br />cold.</h1>
          <p className="b15030-lede">A purpose-built 22 HP + 6 HP cascade system with regenerative chilling—reliably continuing to chill your ethanol when the environment is anything but forgiving.</p>
          <div className="b15030-actions">
            <a className="b15030-button" href={pricingHref}>Request BLAST 150/30 pricing <span>↗</span></a>
            <a href="#layout">Review installation concept <span>↓</span></a>
          </div>
        </div>
        <div className="b15030-airflow-chip">→ Sub-cooled for speed and reliability</div>
        <div className="b15030-stats" aria-label="BLAST 150/30 performance highlights">
          <div><strong>150 GAL</strong><span>Tank size</span></div>
          <div><strong>30 MIN</strong><span>Room temperature to −40 °C</span></div>
          <div><strong>5 GPM</strong><span>Flash-chilling rate</span></div>
          <div className="b15030-stage-stat"><span><strong>22 HP</strong><small>Primary</small></span><b>+</b><span><strong>6 HP</strong><small>Cascade</small></span></div>
        </div>
      </section>

      <section className="b15030-section b15030-system" id="system">
        <div className="b15030-section-number">The system <span>01</span></div>
        <div className="b15030-heading-grid">
          <div><Eyebrow>Cold that refuses to compromise</Eyebrow><h2>Every component holds its ground against the heat.</h2></div>
          <p>Built for reliability, speed, and consistency. The BLAST 150/30 combines high-capacity primary refrigeration, a dedicated cascade subcooling stage, regenerative chilling, and centralized control for reliable, predictable operation.</p>
        </div>
        <div className="b15030-component-grid">
          {components.map((component) => (
            <article key={component.title}>
              <div className="b15030-component-image"><img src={component.image} alt={component.title} /></div>
              <div className="b15030-component-copy"><span>{component.number}</span><h3>{component.title}</h3><p>{component.copy}</p></div>
            </article>
          ))}
        </div>
      </section>

      <section className="b15030-intelligence" id="mirage">
        <div className="b15030-section">
          <div className="b15030-section-number light">PLC intelligence <span>02</span></div>
          <div className="b15030-mirage-logo-stage">
            <div className="b15030-sun" aria-hidden="true" />
            <img src={`${imageRoot}/mirage-1-logo.png`} alt="Mirage 1.0" />
            <p>by <strong>Agenticly Cool</strong></p>
            <span className="b15030-live"><i /> Available now</span>
          </div>
          <div className="b15030-intelligence-grid">
            <div className="b15030-bear"><div aria-hidden="true"><i /><i /><i /></div><img src={`${imageRoot}/agenticly-cool-bear-3d.png`} alt="Agenticly Cool bear mascot" /></div>
            <div>
              <Eyebrow>Cold equipment. Intelligent control.</Eyebrow>
              <h2>One control layer.<br />Every cold-critical decision.</h2>
              <p className="b15030-intro-copy">Mirage 1.0 is the production PLC software behind the BLAST 150/30. It watches the process continuously, coordinates system response, and gives operators and service teams the information they need to act early.</p>
              <div className="b15030-pillars">
                <article><b>01</b><h3>Protection</h3><p>Critical-limit monitoring, alerts, and coordinated responses help protect the process and equipment.</p></article>
                <article><b>02</b><h3>Performance</h3><p>Automatic staging keeps both refrigeration stages working together toward stable target temperatures.</p></article>
                <article><b>03</b><h3>Reliability</h3><p>Trend history and predictive indicators reveal developing conditions before they become downtime.</p></article>
                <article><b>04</b><h3>Service</h3><p>Remote access and clear reporting give authorized support teams faster diagnostic context.</p></article>
              </div>
            </div>
          </div>
          <div className="b15030-capabilities">
            <header><span>Production capabilities</span><strong>Live today</strong></header>
            <div>
              <span><i>01</i><b>Remote monitoring</b><small>Live visibility and alerts</small></span>
              <span><i>02</i><b>Historical trends</b><small>Performance over time</small></span>
              <span><i>03</i><b>Predictive maintenance</b><small>Earlier service insight</small></span>
              <span><i>04</i><b>Automatic staging</b><small>Coordinated system control</small></span>
              <span><i>05</i><b>Remote service</b><small>Access and reports</small></span>
            </div>
          </div>
        </div>
      </section>

      <section className="b15030-regeneration" id="regeneration">
        <div className="b15030-section">
          <div className="b15030-section-number light">Regenerative chilling <span>03</span></div>
          <div className="b15030-regen-grid">
            <div>
              <Eyebrow>Useful cold, recovered</Eyebrow>
              <h2>Make every degree of cold work twice.</h2>
              <p>Returning ethanol passes through additional heat-transfer surface, where it exchanges energy with the colder side of the loop before returning to the process tank.</p>
              <div className="b15030-benefits">
                <div><b>01</b><span><strong>Reduce refrigeration load</strong>Reclaim useful cold before final pull-down.</span></div>
                <div><b>02</b><span><strong>Limit temperature swing</strong>Protect the cold reserve from warm return flow.</span></div>
                <div><b>03</b><span><strong>Chill faster</strong>Increase chilling capacity with more surface area and regeneration horsepower.</span></div>
              </div>
            </div>
            <figure><img src={`${imageRoot}/regeneration.png`} alt="Regenerative chilling flow through the process tank, pump, and plate heat exchangers" /><figcaption><i /> Regeneration energy exchange</figcaption></figure>
          </div>
        </div>
      </section>

      <section className="b15030-section b15030-airflow">
        <div>
          <Eyebrow>Outdoor configuration</Eyebrow>
          <h2>Chill the chiller.<br />Break the heat barrier.</h2>
          <p>The 22 HP and 6 HP units operate as a cascade system, with the 6 HP stage acting like a “chiller for the chiller.” By subcooling the 22 HP, it allows the main compressor to discharge into a cold void instead of smashing into a wall of heat, delivering faster chilling, reduced strain, and reliable performance even in extreme ambient temperatures.</p>
        </div>
        <div className="b15030-airflow-image"><div aria-hidden="true"><i /><i /><i /><i /></div><img src={`${imageRoot}/desert-system-hero.png`} alt="Separate 22 horsepower and 6 horsepower units aligned side by side" /><span>Aligned airflow →</span></div>
      </section>

      <section className="b15030-layout" id="layout">
        <div className="b15030-section">
          <div className="b15030-section-number light">Installation concept <span>04</span></div>
          <div className="b15030-heading-grid"><div><Eyebrow>Simple by design</Eyebrow><h2>A clear equipment location plan.</h2></div><p>Final placement remains field-coordinated. Mirage 1.0 by Agenticly Cool brings the outdoor equipment, Zone 2 controls, and the Zone 3 ethanol process into one coordinated control system.</p></div>
          <div className="b15030-location" role="group" aria-label="BLAST 150/30 three-zone equipment location plan">
            <div className="b15030-zone b15030-zone1"><header><b>Zone 1</b><small>Outdoor / rooftop · aligned airflow →</small></header><div><span><img src={`${imageRoot}/desert-22hp.png`} alt="" /><b>22 HP</b></span><span><img src={`${imageRoot}/desert-6hp.png`} alt="" /><b>6 HP</b></span></div></div>
            <div className="b15030-link-line">Mirage coordinated system link</div>
            <div className="b15030-zone b15030-zone2"><header><b>Zone 2</b><small>Wall-mounted equipment</small></header><div><span><img src={`${imageRoot}/desert-fluxbox.png`} alt="" /><b>FluxBox</b><small>Nearest practical point to Zone 3</small></span><em>Within 40 ft</em><span><img src={`${imageRoot}/desert-plc.png`} alt="" /><b>PLC</b><small>Flexible Zone 2 location</small></span></div></div>
            <div className="b15030-boundary">Mirage-monitored hazardous location boundary</div>
            <div className="b15030-zone b15030-zone3"><header><b>Zone 3</b><small>Process area</small></header><div><img className="b15030-skid" src={`${imageRoot}/regeneration-unit-isolated.png`} alt="Stainless steel regenerative chilling equipment" /><span className="b15030-touchscreen"><img src={`${imageRoot}/zone3-touchscreen.png`} alt="Touchscreen displaying minus 40 degrees Fahrenheit" /><b>Touchscreen control</b><small>Local Zone 3 process interface</small></span><span className="b15030-skid-copy"><b>Ethanol regeneration skid</b><small>Stainless equipment in the Zone 3 process area</small></span></div></div>
            <aside className="b15030-network"><img src={`${imageRoot}/agenticly-cool-bear-3d.png`} alt="" /><h3>Mirage 1.0</h3><p>by Agenticly Cool</p><strong>One intelligent control system across all three zones</strong><div><span>Zone 1<small>Outdoor</small></span><i>↓</i><span>Zone 2<small>Controls</small></span><i>↓</i><span>Zone 3<small>Process</small></span></div></aside>
          </div>
        </div>
      </section>

      <section className="b15030-close">
        <HeatMirage />
        <div><Eyebrow>Built for the unforgiving</Eyebrow><h2>The hotter it gets,<br /><em>the colder we think.</em></h2><p>A desert-ready BLAST 150/30 system design from Perma Cool.</p><div className="b15030-actions centered"><a className="b15030-button" href={pricingHref}>Request pricing <span>↗</span></a><a href="/ethanol-chiller-comparison">Compare BLAST systems <span>→</span></a></div></div>
      </section>
    </div>
  );
}
