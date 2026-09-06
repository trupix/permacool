"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";


const components = [
  {
    number: "01",
    title: "22 HP Primary Unit",
    copy: "The high-capacity workhorse at the center of the system, engineered to hold the cold even when ambient temperatures climb.",
    image: "/images/generated/blast15030/desert-22hp.png",
    className: "component-primary",
  },
  {
    number: "02",
    title: "6 HP Cascade Condenser",
    copy: "A dedicated cascade subcooling stage positioned beside the primary unit, with both grilles aligned for clean, parallel airflow.",
    image: "/images/generated/blast15030/desert-6hp.png",
    className: "component-cascade",
  },
  {
    number: "03",
    title: "Open FluxBox",
    copy: "Wall-mounted in Zone 2, as close as practical to the Zone 3 ethanol skid, ready for field insulation.",
    image: "/images/generated/blast15030/desert-fluxbox.png",
    className: "component-flux",
  },
  {
    number: "04",
    title: "Integrated PLC",
    copy: "A clean, centralized control panel positioned beside the FluxBox—or anywhere within 40 feet in Zone 2.",
    image: "/images/generated/blast15030/desert-plc.png",
    className: "component-plc",
  },
];

function HeatMirage() {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(48, 1, 0.1, 100);
    camera.position.z = 9;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    const count = 460;
    const positions = new Float32Array(count * 3);
    const speeds = new Float32Array(count);
    for (let i = 0; i < count; i += 1) {
      positions[i * 3] = (Math.random() - 0.5) * 18;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 5;
      speeds[i] = 0.003 + Math.random() * 0.009;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const dust = new THREE.Points(
      geometry,
      new THREE.PointsMaterial({
        size: 0.022,
        color: 0xffc66d,
        transparent: true,
        opacity: 0.42,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      })
    );
    scene.add(dust);

    const flareGroup = new THREE.Group();
    const rayGroup = new THREE.Group();
    const sunOrigin = new THREE.Vector3();
    const earthTarget = new THREE.Vector3();
    const flarePalette = [
      [255, 242, 198],
      [255, 190, 92],
      [255, 137, 49],
      [116, 226, 255],
    ];

    const createFlareTexture = (variant) => {
      const size = 256;
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const context = canvas.getContext("2d");
      if (!context) return new THREE.Texture();

      const [red, green, blue] = flarePalette[variant % flarePalette.length];
      const center = size / 2;
      const glow = context.createRadialGradient(center, center, 4, center, center, center);
      glow.addColorStop(0, `rgba(${red}, ${green}, ${blue}, ${0.2 + variant * 0.025})`);
      glow.addColorStop(0.42, `rgba(${red}, ${green}, ${blue}, ${0.12 + variant * 0.015})`);
      glow.addColorStop(0.7, `rgba(${red}, ${green}, ${blue}, 0.05)`);
      glow.addColorStop(1, `rgba(${red}, ${green}, ${blue}, 0)`);
      context.fillStyle = glow;
      context.fillRect(0, 0, size, size);

      const ringRadius = 67 + variant * 7;
      context.beginPath();
      context.arc(center, center, ringRadius, 0, Math.PI * 2);
      context.fillStyle = `rgba(${red}, ${green}, ${blue}, ${0.045 + variant * 0.018})`;
      context.fill();
      context.lineWidth = 4 + variant * 1.5;
      context.strokeStyle = `rgba(${red}, ${green}, ${blue}, ${0.34 - variant * 0.035})`;
      context.shadowColor = `rgba(${red}, ${green}, ${blue}, 0.72)`;
      context.shadowBlur = 16 + variant * 5;
      context.stroke();

      const texture = new THREE.CanvasTexture(canvas);
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.needsUpdate = true;
      return texture;
    };

    const flareTextures = flarePalette.map((_, index) => createFlareTexture(index));
    const flareCount = 8;
    for (let i = 0; i < flareCount; i += 1) {
      const material = new THREE.SpriteMaterial({
        map: flareTextures[i % flareTextures.length],
        transparent: true,
        opacity: 0,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });
      const flare = new THREE.Sprite(material);
      flare.userData.distance = (i + 1) / (flareCount + 1);
      flare.userData.variant = i % flareTextures.length;
      flare.userData.offset = ((i % 3) - 1) * 0.075;
      flareGroup.add(flare);
    }
    scene.add(flareGroup);

    for (let i = 0; i < 5; i += 1) {
      const rayGeometry = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]);
      const rayMaterial = new THREE.LineBasicMaterial({
        color: i % 2 ? 0xffd89a : 0xffb45a,
        transparent: true,
        opacity: 0.045 + i * 0.008,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });
      const ray = new THREE.Line(rayGeometry, rayMaterial);
      ray.userData.offset = (i - 2) * 0.13;
      rayGroup.add(ray);
    }
    scene.add(rayGroup);

    let frame = 0;
    const resize = () => {
      renderer.setSize(mount.clientWidth, mount.clientHeight, false);
      camera.aspect = mount.clientWidth / Math.max(mount.clientHeight, 1);
      camera.updateProjectionMatrix();

      const visibleHeight = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.position.z;
      const visibleWidth = visibleHeight * camera.aspect;
      sunOrigin.set((0.15 - 0.5) * visibleWidth, (0.5 - 0.14) * visibleHeight, -1);
      earthTarget.set((0.47 - 0.5) * visibleWidth, (0.5 - 0.84) * visibleHeight, -1);

      rayGroup.children.forEach((child) => {
        const ray = child;
        const rayPositions = ray.geometry.attributes.position.array;
        rayPositions[0] = sunOrigin.x;
        rayPositions[1] = sunOrigin.y;
        rayPositions[2] = sunOrigin.z;
        rayPositions[3] = earthTarget.x + ray.userData.offset;
        rayPositions[4] = earthTarget.y + ray.userData.offset * 0.45;
        rayPositions[5] = earthTarget.z;
        ray.geometry.attributes.position.needsUpdate = true;
      });
    };
    const observer = new ResizeObserver(resize);
    observer.observe(mount);
    resize();

    const render = () => {
      const points = geometry.attributes.position.array;
      for (let i = 0; i < count; i += 1) {
        points[i * 3 + 1] += speeds[i];
        points[i * 3] += Math.sin(points[i * 3 + 1] * 1.8 + i) * 0.0008;
        if (points[i * 3 + 1] > 5) points[i * 3 + 1] = -5;
      }
      geometry.attributes.position.needsUpdate = true;

      const elapsed = performance.now() * 0.001;
      flareGroup.children.forEach((child) => {
        const flare = child;
        const material = flare.material;
        const distance = flare.userData.distance;
        const variant = flare.userData.variant;
        const pulse = (Math.sin(elapsed * 1.35 - distance * 6.4) + 1) / 2;
        const travel = 0.012 * Math.sin(elapsed * 0.72 + distance * 9);
        const pathPosition = THREE.MathUtils.clamp(distance + travel, 0, 1);
        // Keep the flares compact at the sun, then open them up dramatically
        // as the beam reaches the desert floor.
        const baseSize = 0.12 + Math.pow(distance, 2.15) * 3.05;
        const size = baseSize * (0.9 + pulse * (0.1 + variant * 0.018));

        flare.position.lerpVectors(sunOrigin, earthTarget, pathPosition);
        flare.position.x += flare.userData.offset;
        flare.position.y += flare.userData.offset * -0.28;
        flare.scale.set(size, size, 1);
        material.opacity = (0.19 + variant * 0.025) * (0.66 + pulse * 0.34);
      });

      rayGroup.children.forEach((child, index) => {
        const ray = child;
        const material = ray.material;
        material.opacity = 0.025 + ((Math.sin(elapsed * 1.05 + index * 0.8) + 1) / 2) * 0.055;
      });

      renderer.render(scene, camera);
      frame = requestAnimationFrame(render);
    };
    render();

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      geometry.dispose();
      flareGroup.children.forEach((child) => {
        const flare = child;
        (flare.material).dispose();
      });
      flareTextures.forEach((texture) => texture.dispose());
      rayGroup.children.forEach((child) => {
        const ray = child;
        ray.geometry.dispose();
        (ray.material).dispose();
      });
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return <div className="heat-mirage" ref={mountRef} aria-hidden="true" />;
}

export default function Blast15030Experience({ pricingHref }) {
  return (
    <div className="blast-original desert-page">
      <nav className="site-nav" aria-label="Primary navigation">
        <a className="brand" href="/" aria-label="Perma Cool home">
          <img src="/images/generated/blast15030/permacool-wordmark.png" alt="Perma Cool" />
        </a>
        <div className="nav-links">
          <a href="#system">System</a>
          <a href="#mirage">Mirage</a>
          <a href="#regeneration">Regeneration</a>
          <a href="#layout">Layout</a>
        </div>
        <a className="nav-cta version-link" href={pricingHref}>Request pricing</a>
      </nav>

      <section className="hero" id="top">
        <HeatMirage />
        <div className="mirage-band" aria-hidden="true" />
        <div className="hero-glow" aria-hidden="true" />
        <div className="hero-copy">
          <p className="eyebrow"><span /> BLAST™ 150/30 · Engineered beyond ambient limits</p>
          <h1>Desert heat.<br /><em>Unbroken</em><br />cold.</h1>
          <p className="hero-deck">
            The BLAST 150/30: a purpose-built 22 HP + 6 HP cascade system with regenerative chilling—reliably continuing to chill your ethanol when the environment is anything but forgiving.
          </p>
          <div className="hero-actions">
            <a className="button button-primary" href="#system">Enter the cold zone <span>↓</span></a>
            <a className="text-link" href="#layout">Review installation concept <span>↗</span></a>
          </div>
        </div>

        <div className="airflow-chip hero-airflow-chip"><span>→</span> Sub-cooled for speed and reliability</div>

        <div className="hero-stats" aria-label="System highlights">
          <div className="combined-stage-stat">
            <span className="stage-part"><strong>22 HP</strong><small>Primary stage</small></span>
            <b>+</b>
            <span className="stage-part"><strong>6 HP</strong><small>Cascade stage</small></span>
          </div>
          <div><strong>150 GAL</strong><span>Tank size</span></div>
          <div><strong>5 GPM</strong><span>Speed</span></div>
          <div><strong>30 MIN</strong><span>Pull-down target</span></div>
        </div>
      </section>

      <section className="intro section-shell" id="system">
        <div className="section-label">The system <span>01</span></div>
        <div className="intro-grid">
          <div>
            <p className="eyebrow"><span /> Cold that refuses to compromise</p>
            <h2>Every component holds its ground against the heat.</h2>
          </div>
          <p className="section-lead">
            Built for reliability, speed, and consistency. The system combines high-capacity primary refrigeration, a dedicated cascade subcooling stage, regenerative chilling, and centralized control for reliable, predictable operation.
          </p>
        </div>

        <div className="component-grid">
          {components.map((component) => (
            <article className={`component-card ${component.className}`} key={component.title}>
              <div className="component-image">
                <img src={component.image} alt={component.title} />
              </div>
              <div className="component-copy">
                <span className="component-number">{component.number}</span>
                <h3>{component.title}</h3>
                <p>{component.copy}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mirage-control" id="mirage">
        <div className="mirage-control-inner section-shell">
          <div className="section-label light">PLC intelligence <span>02</span></div>

          <div className="mirage-brand-stage">
            <div className="mirage-sun" aria-hidden="true" />
            <div className="mirage-logo-wrap">
              <img src="/images/generated/blast15030/mirage-1-logo.png" alt="Mirage 1.0" />
              <p>by <strong>Agenticly Cool</strong></p>
            </div>
            <div className="mirage-status"><i /> Available now</div>
          </div>

          <div className="mirage-intro-grid">
            <div className="mirage-bear-stage">
              <div className="bear-orbit" aria-hidden="true"><i /><i /><i /></div>
              <img src="/images/generated/blast15030/agenticly-cool-bear-3d.png" alt="Agenticly Cool gold bear mascot" />
            </div>

            <div className="mirage-message">
              <p className="eyebrow"><span /> Cold equipment. Intelligent control.</p>
              <h2>One control layer.<br />Every cold-critical decision.</h2>
              <p>
                Mirage 1.0 is the production PLC software behind the cascade system. It watches the process continuously, coordinates system response, and gives operators and service teams the information they need to act early.
              </p>

              <div className="control-pillars" aria-label="Mirage control priorities">
                <article>
                  <b>01</b><h3>Protection</h3>
                  <p>Critical-limit monitoring, alerts, and coordinated responses help protect the process and equipment.</p>
                </article>
                <article>
                  <b>02</b><h3>Performance</h3>
                  <p>Automatic staging keeps both refrigeration stages working together toward stable target temperatures.</p>
                </article>
                <article>
                  <b>03</b><h3>Reliability</h3>
                  <p>Trend history and predictive indicators reveal developing conditions before they become downtime.</p>
                </article>
                <article>
                  <b>04</b><h3>Service</h3>
                  <p>Remote access and clear reporting give authorized support teams faster diagnostic context.</p>
                </article>
              </div>
            </div>
          </div>

          <div className="mirage-capabilities" aria-label="Mirage 1.0 capabilities available today">
            <div className="capability-heading">
              <span>Production capabilities</span>
              <strong>Live today</strong>
            </div>
            <div className="capability-grid">
              <div><i>01</i><span><b>Remote monitoring</b><small>Live visibility and alerts</small></span></div>
              <div><i>02</i><span><b>Historical trends</b><small>Performance over time</small></span></div>
              <div><i>03</i><span><b>Predictive maintenance</b><small>Earlier service insight</small></span></div>
              <div><i>04</i><span><b>Automatic staging</b><small>Coordinated system control</small></span></div>
              <div><i>05</i><span><b>Remote service</b><small>Access and reports</small></span></div>
            </div>
          </div>
        </div>
      </section>

      <section className="regeneration" id="regeneration">
        <div className="regeneration-inner section-shell">
          <div className="section-label light">Regenerative chilling <span>03</span></div>
          <div className="regen-grid">
            <div className="regen-copy">
              <p className="eyebrow"><span /> Useful cold, recovered</p>
              <h2>Make every degree of cold work twice.</h2>
              <p>
                Returning ethanol passes through additional heat-transfer surface, where it exchanges energy with the colder side of the loop before returning to the process tank.
              </p>
              <div className="benefit-list">
                <div><b>01</b><span><strong>Reduce refrigeration load</strong>Reclaim useful cold before final pull-down.</span></div>
                <div><b>02</b><span><strong>Limit temperature swing</strong>Protect the cold reserve from warm return flow.</span></div>
                <div><b>03</b><span><strong>Chill faster</strong>Increase chilling capacity with more surface area and regeneration horsepower.</span></div>
              </div>
            </div>
            <figure className="regen-visual">
              <img src="/images/generated/blast15030/regeneration.png" alt="Regenerative chilling flow diagram showing the direction through the process tank, pump, and plate heat exchangers" />
              <figcaption><span className="pulse-dot" /> Regeneration energy exchange</figcaption>
            </figure>
          </div>
        </div>
      </section>

      <section className="airflow section-shell">
        <div className="airflow-content">
          <p className="eyebrow"><span /> Outdoor configuration</p>
          <h2>Chill the chiller.<br />Break the heat barrier.</h2>
          <p>
            The 22 HP and 6 HP units operate as a cascade system, with the 6 HP stage acting like a “chiller for the chiller.” By subcooling the 22 HP, it allows the main compressor to discharge into a cold void instead of smashing into a wall of heat, delivering faster chilling, reduced strain, and reliable performance even in extreme ambient temperatures.
          </p>
        </div>
        <div className="airflow-stage">
          <div className="flow-lines" aria-hidden="true"><i /><i /><i /><i /></div>
          <img className="airflow-premium" src="/images/generated/blast15030/desert-system-hero.png" alt="Desert visualization of separate 22 horsepower and 6 horsepower units aligned side by side" />
          <div className="direction-label">Aligned airflow <b>→</b></div>
        </div>
      </section>

      <section className="layout-section" id="layout">
        <div className="section-shell">
          <div className="section-label light">Installation concept <span>04</span></div>
          <div className="layout-heading">
            <div>
              <p className="eyebrow"><span /> Simple by design</p>
              <h2>A clear equipment location plan.</h2>
            </div>
            <p>Final placement remains field-coordinated. Mirage 1.0 by Agenticly Cool brings the outdoor equipment, Zone 2 controls, and the Zone 3 ethanol process into one coordinated control environment.</p>
          </div>

          <div className="location-diagram" role="group" aria-label="Mirage 1.0 equipment location plan connecting Zone 1 outdoor condensers, Zone 2 FluxBox and PLC, and the Zone 3 ethanol skid">
            <div className="zone-network">
              <div className="zone-network-brand">
                <img src="/images/generated/blast15030/agenticly-cool-bear-3d.png" alt="" />
                <span><b>Mirage 1.0</b><small>by Agenticly Cool</small></span>
              </div>
              <p>One intelligent control system across all three zones</p>
              <div className="zone-network-path" aria-label="Mirage connects Zone 1, Zone 2, and Zone 3">
                <span><i />Zone 1<small>Outdoor</small></span>
                <b aria-hidden="true">↓</b>
                <span><i />Zone 2<small>Controls</small></span>
                <b aria-hidden="true">↓</b>
                <span><i />Zone 3<small>Process</small></span>
              </div>
            </div>

            <div className="location-band roof-band">
              <div className="band-label"><span>Zone 1</span><small>Outdoor / rooftop · aligned airflow →</small></div>
              <div className="roof-equipment">
                <div className="mini-machine large"><img src="/images/generated/blast15030/desert-22hp.png" alt="" /><b>22 HP</b></div>
                <div className="mini-machine small"><img src="/images/generated/blast15030/desert-6hp.png" alt="" /><b>6 HP</b></div>
              </div>
            </div>

            <div className="connection-spine"><span>Mirage coordinated system link</span></div>

            <div className="location-band zone2-band">
              <div className="band-label"><span>Zone 2</span><small>Wall-mounted equipment</small></div>
              <div className="wall-equipment">
                <div className="wall-card"><img src="/images/generated/blast15030/desert-fluxbox.png" alt="" /><span><b>FluxBox</b><small>Nearest practical point to Zone 3</small></span></div>
                <div className="distance-marker"><i /> Within 40 ft <i /></div>
                <div className="wall-card plc-card"><img src="/images/generated/blast15030/desert-plc.png" alt="" /><span><b>PLC</b><small>Flexible Zone 2 location</small></span></div>
              </div>
            </div>

            <div className="boundary-line"><span>Mirage-monitored hazardous location boundary</span></div>

            <div className="location-band zone3-band">
              <div className="band-label"><span>Zone 3</span><small>Process area</small></div>
              <div className="skid-symbol">
                <div className="zone3-equipment-model"><img src="/images/generated/blast15030/regeneration-unit-isolated.png" alt="Stainless steel regenerative chilling equipment" /></div>
                <div className="zone3-process-column">
                  <div className="zone3-touchscreen">
                    <img src="/images/generated/blast15030/zone3-touchscreen.png" alt="Zone 3 touchscreen displaying minus 40 degrees Fahrenheit" />
                    <span><b>Touchscreen control</b><small>Local Zone 3 process interface</small></span>
                  </div>
                  <span className="zone3-skid-caption"><b>Ethanol regeneration skid</b><small>Actual stainless equipment in the Zone 3 process area</small></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="closing" id="contact">
        <HeatMirage />
        <div className="mirage-band" aria-hidden="true" />
        <div className="closing-copy">
          <img src="/images/generated/blast15030/permacool-icon.png" alt="Perma Cool icon" />
          <p className="eyebrow"><span /> Built for the unforgiving</p>
          <h2>The hotter it gets,<br /><em>the colder we think.</em></h2>
            <p>A desert ready system design from Perma Cool.</p>
          <div className="closing-actions">
            <a className="button button-primary" href={pricingHref}>Request BLAST 150/30 pricing <span>↗</span></a>
            <a className="text-link" href="/ethanol-chiller-comparison">Compare BLAST systems <span>↗</span></a>
          </div>
        </div>
      </section>


    </div>
  );
}
