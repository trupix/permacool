'use client';

import { useEffect, useId, useRef, useState } from 'react';
import {
  ACESFilmicToneMapping,
  AdditiveBlending,
  AmbientLight,
  BoxGeometry,
  CanvasTexture,
  CircleGeometry,
  Color,
  ConeGeometry,
  CylinderGeometry,
  DirectionalLight,
  DoubleSide,
  Group,
  LinearFilter,
  MathUtils,
  Mesh,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  OrthographicCamera,
  PointLight,
  RingGeometry,
  Scene,
  Sprite,
  SpriteMaterial,
  SRGBColorSpace,
  TorusGeometry,
  WebGLRenderer
} from 'three';

export type TelemetryDialAccent = 'cyan' | 'lime' | 'gold' | 'violet';

export type TelemetryDialZone = {
  from: number;
  to: number;
  color: string;
  label: string;
  effect?: 'frost';
  secondaryColor?: string;
};

export type TelemetryDialGoal = {
  value: number;
  color: string;
  label: string;
};

export type TelemetryDialScale = {
  stops: Array<{
    value: number;
    angleDegrees: number;
  }>;
  tickValues: number[];
  labelValues: number[];
};

type TelemetryDial3DProps = {
  label: string;
  value: number | null;
  unit: string;
  minimum: number;
  maximum: number;
  detail: string;
  accent?: TelemetryDialAccent;
  demo?: boolean;
  zones?: TelemetryDialZone[];
  goal?: TelemetryDialGoal;
  scale?: TelemetryDialScale;
  renderer?: 'webgl' | 'glossy-svg';
};

type DialRuntime = {
  renderer: WebGLRenderer;
  scene: Scene;
  camera: OrthographicCamera;
  needle: Group;
  ringMaterial: MeshBasicMaterial;
  tickMaterials: MeshBasicMaterial[];
  needleMaterials: MeshStandardMaterial[];
  glowMaterial: MeshBasicMaterial;
  frameId: number | null;
  lastTime: number;
  resizeObserver: ResizeObserver;
};

const ACCENT_COLORS: Record<TelemetryDialAccent, string> = {
  cyan: '#5ed7ef',
  lime: '#a8dc5f',
  gold: '#d6a32e',
  violet: '#aa8cff'
};

const DIAL_START_ANGLE = MathUtils.degToRad(135);
const DIAL_END_ANGLE = MathUtils.degToRad(-135);
const TICK_COUNT = 25;
const EMPTY_DIAL_ZONES: TelemetryDialZone[] = [];

function valueAngle(
  value: number | null,
  minimum: number,
  maximum: number,
  scale?: TelemetryDialScale
) {
  if (scale?.stops.length) {
    const boundedValue = MathUtils.clamp(value ?? minimum, minimum, maximum);
    const upperIndex = scale.stops.findIndex((stop) => boundedValue <= stop.value);
    if (upperIndex <= 0) {
      return MathUtils.degToRad(scale.stops[0].angleDegrees);
    }
    if (upperIndex === -1) {
      return MathUtils.degToRad(scale.stops[scale.stops.length - 1].angleDegrees);
    }

    const lowerStop = scale.stops[upperIndex - 1];
    const upperStop = scale.stops[upperIndex];
    const progress = (boundedValue - lowerStop.value) /
      (upperStop.value - lowerStop.value);
    return MathUtils.degToRad(
      MathUtils.lerp(lowerStop.angleDegrees, upperStop.angleDegrees, progress)
    );
  }
  if (value === null) return DIAL_START_ANGLE;
  const normalized = MathUtils.clamp(
    (value - minimum) / (maximum - minimum),
    0,
    1
  );
  return MathUtils.lerp(DIAL_START_ANGLE, DIAL_END_ANGLE, normalized);
}

function createDialLabel(value: number, color: string, isGoal = false) {
  const canvas = document.createElement('canvas');
  canvas.width = isGoal ? 320 : 200;
  canvas.height = 100;
  const context = canvas.getContext('2d');
  if (context) {
    context.clearRect(0, 0, canvas.width, canvas.height);
    if (isGoal) {
      context.beginPath();
      context.roundRect(8, 10, canvas.width - 16, canvas.height - 20, 22);
      context.fillStyle = 'rgba(3, 16, 22, 0.9)';
      context.fill();
      context.lineWidth = 5;
      context.strokeStyle = color;
      context.stroke();
    }
    context.font = isGoal
      ? '900 46px Inter, ui-sans-serif, system-ui, sans-serif'
      : '900 58px Inter, ui-sans-serif, system-ui, sans-serif';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.lineWidth = isGoal ? 5 : 4;
    context.strokeStyle = 'rgba(3, 16, 22, 0.88)';
    const labelText = isGoal
      ? `${String(value).replace('-', '−')}°F  GOAL`
      : String(value);
    context.strokeText(labelText, canvas.width / 2, canvas.height / 2);
    context.fillStyle = color;
    context.shadowColor = color;
    context.shadowBlur = isGoal ? 6 : 2;
    context.fillText(labelText, canvas.width / 2, canvas.height / 2);
  }

  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.minFilter = LinearFilter;
  texture.magFilter = LinearFilter;
  texture.generateMipmaps = false;
  const material = new SpriteMaterial({
    map: texture,
    transparent: true,
    depthTest: false,
    toneMapped: false
  });
  const label = new Sprite(material);
  label.scale.set(isGoal ? 1.38 : 0.66, isGoal ? 0.46 : 0.36, 1);
  return label;
}

function createGlossyFaceTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const context = canvas.getContext('2d');
  if (context) {
    const depthGradient = context.createRadialGradient(
      174,
      132,
      18,
      270,
      278,
      326
    );
    depthGradient.addColorStop(0, '#315966');
    depthGradient.addColorStop(0.38, '#173e49');
    depthGradient.addColorStop(0.72, '#0b2832');
    depthGradient.addColorStop(1, '#04131a');
    context.fillStyle = depthGradient;
    context.fillRect(0, 0, canvas.width, canvas.height);

    const centerGlow = context.createRadialGradient(
      226,
      206,
      0,
      226,
      206,
      230
    );
    centerGlow.addColorStop(0, 'rgba(138, 235, 247, 0.12)');
    centerGlow.addColorStop(0.55, 'rgba(58, 160, 181, 0.035)');
    centerGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    context.fillStyle = centerGlow;
    context.fillRect(0, 0, canvas.width, canvas.height);

    const lowerShade = context.createLinearGradient(0, 100, 0, 512);
    lowerShade.addColorStop(0, 'rgba(0, 0, 0, 0)');
    lowerShade.addColorStop(0.62, 'rgba(0, 8, 12, 0.04)');
    lowerShade.addColorStop(1, 'rgba(0, 6, 10, 0.32)');
    context.fillStyle = lowerShade;
    context.fillRect(0, 0, canvas.width, canvas.height);
  }

  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.minFilter = LinearFilter;
  texture.magFilter = LinearFilter;
  return texture;
}

function createSoftShadowTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const context = canvas.getContext('2d');
  if (context) {
    const shadow = context.createRadialGradient(128, 128, 20, 128, 128, 124);
    shadow.addColorStop(0, 'rgba(0, 7, 11, 0.7)');
    shadow.addColorStop(0.52, 'rgba(0, 7, 11, 0.42)');
    shadow.addColorStop(0.78, 'rgba(0, 7, 11, 0.17)');
    shadow.addColorStop(1, 'rgba(0, 7, 11, 0)');
    context.fillStyle = shadow;
    context.fillRect(0, 0, canvas.width, canvas.height);
  }

  const texture = new CanvasTexture(canvas);
  texture.minFilter = LinearFilter;
  texture.magFilter = LinearFilter;
  texture.generateMipmaps = false;
  return texture;
}

function dialPoint(angle: number, radius: number) {
  return {
    x: Number((-Math.sin(angle) * radius).toFixed(6)),
    y: Number((-Math.cos(angle) * radius).toFixed(6))
  };
}

function dialPathPoints(
  from: number,
  to: number,
  minimum: number,
  maximum: number,
  scale?: TelemetryDialScale,
  radius = 1.72
) {
  const steps = 48;
  return Array.from({ length: steps + 1 }, (_, index) => {
    const sampleValue = MathUtils.lerp(from, to, index / steps);
    const point = dialPoint(
      valueAngle(sampleValue, minimum, maximum, scale),
      radius
    );
    return `${point.x.toFixed(3)},${point.y.toFixed(3)}`;
  }).join(' ');
}

function GlossyTelemetryDial({
  value,
  minimum,
  maximum,
  accentColor,
  zones,
  goal,
  scale,
  id
}: {
  value: number | null;
  minimum: number;
  maximum: number;
  accentColor: string;
  zones: TelemetryDialZone[];
  goal?: TelemetryDialGoal;
  scale?: TelemetryDialScale;
  id: string;
}) {
  const tickValues = scale?.tickValues ??
    Array.from(
      { length: TICK_COUNT },
      (_, index) => MathUtils.lerp(minimum, maximum, index / (TICK_COUNT - 1))
    );
  const needleAngle = valueAngle(value, minimum, maximum, scale);
  const needleEnd = dialPoint(needleAngle, 1.42);
  const needleTail = dialPoint(needleAngle + Math.PI, 0.18);

  return (
    <svg
      className={`salinas-dashboard__dial-fallback${scale ? ' salinas-dashboard__dial-fallback--numbered' : ''}`}
      viewBox="-2.35 -2.35 4.7 4.7"
      role="presentation"
    >
      <defs>
        <radialGradient id={`${id}-face`} cx="38%" cy="30%">
          <stop offset="0%" stopColor="#31505d" />
          <stop offset="62%" stopColor="#102832" />
          <stop offset="100%" stopColor="#06141b" />
        </radialGradient>
        <linearGradient id={`${id}-frost`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#17384f" />
          <stop offset="38%" stopColor="#f7feff" />
          <stop offset="58%" stopColor="#75c9ef" />
          <stop offset="78%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#17384f" />
        </linearGradient>
        <filter id={`${id}-shadow`} x="-40%" y="-40%" width="180%" height="180%">
          <feDropShadow dx="0" dy="0.08" stdDeviation="0.08" floodColor="#000b10" floodOpacity="0.9" />
        </filter>
        <filter id={`${id}-glow`} x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="0.055" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <circle cx="0" cy="0" r="2.09" fill="#07131a" stroke="#203943" strokeWidth="0.16" />
      <circle cx="0" cy="0" r="1.97" fill={`url(#${id}-face)`} stroke="#5c747d" strokeWidth="0.045" />
      <polyline
        points={dialPathPoints(minimum, maximum, minimum, maximum, scale)}
        fill="none"
        stroke={accentColor}
        strokeOpacity="0.66"
        strokeWidth="0.1"
      />

      {zones.map((zone) => (
        <g key={`${zone.from}-${zone.to}`}>
          <polyline
            points={dialPathPoints(zone.from, zone.to, minimum, maximum, scale)}
            fill="none"
            stroke={zone.effect === 'frost' ? `url(#${id}-frost)` : zone.color}
            strokeWidth="0.2"
          />
          {zone.effect === 'frost' ? (
            <polyline
              points={dialPathPoints(zone.from, zone.to, minimum, maximum, scale, 1.7)}
              fill="none"
              stroke="#ffffff"
              strokeDasharray="0.08 0.055"
              strokeOpacity="0.9"
              strokeWidth="0.055"
            />
          ) : null}
        </g>
      ))}

      {tickValues.map((tickValue, index) => {
        const angle = valueAngle(tickValue, minimum, maximum, scale);
        const major = scale
          ? scale.labelValues.includes(tickValue)
          : index % 4 === 0;
        const inner = dialPoint(angle, major ? 1.45 : 1.56);
        const outer = dialPoint(angle, 1.76);
        return (
          <line
            key={tickValue}
            x1={inner.x}
            y1={inner.y}
            x2={outer.x}
            y2={outer.y}
            stroke={major ? '#effbff' : '#91aab4'}
            strokeOpacity={major ? 0.95 : 0.7}
            strokeWidth={major ? 0.055 : 0.028}
          />
        );
      })}

      {scale?.labelValues.map((labelValue) => {
        const isGoalLabel = goal?.value === labelValue;
        const labelAngle = valueAngle(labelValue, minimum, maximum, scale);
        const point = dialPoint(
          labelAngle,
          isGoalLabel ? 1.8 : labelValue === 0 ? 1.23 : 1.27
        );
        if (isGoalLabel) {
          return (
            <g
              key={labelValue}
              transform={`translate(${point.x} ${point.y + 0.48})`}
              filter={`url(#${id}-glow)`}
            >
              <rect
                x="-0.73"
                y="-0.22"
                width="1.46"
                height="0.44"
                rx="0.14"
                fill="#061820"
                fillOpacity="0.94"
                stroke={goal.color}
                strokeWidth="0.07"
              />
              <text
                x="0"
                y="0.09"
                fill={goal.color}
                fontSize="0.27"
                fontWeight="900"
                textAnchor="middle"
              >
                −40°F GOAL
              </text>
            </g>
          );
        }
        return (
          <text
            key={labelValue}
            x={point.x}
            y={point.y + 0.075}
            fill={goal?.value === labelValue ? goal.color : '#edf8fb'}
            fontSize="0.23"
            fontWeight="900"
            textAnchor="middle"
            paintOrder="stroke"
            stroke="#071820"
            strokeWidth="0.07"
            strokeLinejoin="round"
          >
            {labelValue}
          </text>
        );
      })}

      {goal ? (() => {
        const goalAngle = valueAngle(goal.value, minimum, maximum, scale);
        const goalInner = dialPoint(goalAngle, 1.38);
        const goalOuter = dialPoint(goalAngle, 1.91);
        return (
          <g filter={`url(#${id}-glow)`}>
            <line
              x1={goalInner.x}
              y1={goalInner.y}
              x2={goalOuter.x}
              y2={goalOuter.y}
              stroke={goal.color}
              strokeWidth="0.14"
              strokeLinecap="round"
            />
            <line
              x1={goalInner.x}
              y1={goalInner.y}
              x2={goalOuter.x}
              y2={goalOuter.y}
              stroke="#ffffff"
              strokeWidth="0.035"
              strokeLinecap="round"
            />
          </g>
        );
      })() : null}

      <g filter={`url(#${id}-shadow)`}>
        <line
          x1={needleTail.x}
          y1={needleTail.y}
          x2={needleEnd.x}
          y2={needleEnd.y}
          stroke="#061015"
          strokeWidth="0.13"
          strokeLinecap="round"
        />
        <line
          x1={needleTail.x}
          y1={needleTail.y}
          x2={needleEnd.x}
          y2={needleEnd.y}
          stroke={accentColor}
          strokeWidth="0.065"
          strokeLinecap="round"
        />
        <circle cx="0" cy="0" r="0.2" fill="#d5e4e8" stroke="#526a73" strokeWidth="0.07" />
        <circle cx="-0.05" cy="-0.06" r="0.05" fill="#ffffff" fillOpacity="0.72" />
      </g>
      <ellipse cx="-0.45" cy="-0.6" rx="1.1" ry="0.55" fill="#ffffff" fillOpacity="0.035" transform="rotate(-25)" />
    </svg>
  );
}

function disposeScene(scene: Scene) {
  scene.traverse((object) => {
    if (object instanceof Sprite) {
      object.material.map?.dispose();
      object.material.dispose();
      return;
    }
    if (!(object instanceof Mesh)) return;
    object.geometry.dispose();
    const materials = Array.isArray(object.material)
      ? object.material
      : [object.material];
    materials.forEach((material) => {
      if (
        material instanceof MeshStandardMaterial ||
        material instanceof MeshBasicMaterial
      ) {
        material.map?.dispose();
      }
      material.dispose();
    });
  });
}

export function TelemetryDial3D({
  label,
  value,
  unit,
  minimum,
  maximum,
  detail,
  accent = 'cyan',
  demo = false,
  zones = EMPTY_DIAL_ZONES,
  goal,
  scale,
  renderer = 'webgl'
}: TelemetryDial3DProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const runtimeRef = useRef<DialRuntime | null>(null);
  const targetAngleRef = useRef(valueAngle(value, minimum, maximum, scale));
  const startAnimationRef = useRef<(() => void) | null>(null);
  const [webglAvailable, setWebglAvailable] = useState(true);
  const useGlossyVectorRenderer = renderer === 'glossy-svg';
  const showGlossyVectorRenderer = useGlossyVectorRenderer || !webglAvailable;
  const fallbackId = useId().replace(/:/g, '');
  const accentColor = ACCENT_COLORS[accent];
  const displayValue = value === null
    ? '--'
    : new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 }).format(value);
  const activeZone = value === null
    ? undefined
    : zones.find((zone) =>
        value >= zone.from &&
        (value < zone.to || (zone.to === maximum && value <= zone.to))
      );

  useEffect(() => {
    if (useGlossyVectorRenderer) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    let renderer: WebGLRenderer;
    try {
      renderer = new WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance'
      });
      setWebglAvailable(true);
    } catch {
      setWebglAvailable(false);
      return;
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = SRGBColorSpace;
    renderer.toneMapping = ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.setClearColor(0x000000, 0);

    const scene = new Scene();
    const camera = new OrthographicCamera(-3.6, 3.6, 2.45, -2.45, 0.1, 20);
    camera.position.set(0, 0, 7);
    camera.lookAt(0, 0, 0);

    scene.add(new AmbientLight(0xffffff, 1.35));
    const keyLight = new DirectionalLight(0xe7fbff, 2.1);
    keyLight.position.set(3, 4, 7);
    scene.add(keyLight);
    const accentLight = new PointLight(new Color(accentColor), 8, 9);
    accentLight.position.set(-3, -2, 5);
    scene.add(accentLight);

    const dial = new Group();
    dial.rotation.set(-0.08, 0.12, 0);
    dial.position.y = scale ? 0.44 : 0;
    scene.add(dial);

    if (scale) {
      const castShadow = new Mesh(
        new CircleGeometry(2.42, 96),
        new MeshBasicMaterial({
          map: createSoftShadowTexture(),
          transparent: true,
          opacity: 0.62,
          depthWrite: false,
          toneMapped: false
        })
      );
      castShadow.position.set(0, 0.04, -0.38);
      castShadow.scale.y = 0.68;
      scene.add(castShadow);
    }

    const base = new Mesh(
      new CylinderGeometry(2.18, 2.1, 0.34, 96),
      new MeshStandardMaterial({
        color: scale ? '#02080c' : '#07131a',
        metalness: scale ? 0.9 : 0.82,
        roughness: scale ? 0.18 : 0.28
      })
    );
    base.rotation.x = Math.PI / 2;
    dial.add(base);

    const face = new Mesh(
      new CircleGeometry(2, 96),
      new MeshStandardMaterial({
        color: scale ? '#ffffff' : '#0b202a',
        map: scale ? createGlossyFaceTexture() : null,
        metalness: scale ? 0.12 : 0.28,
        roughness: scale ? 0.36 : 0.62
      })
    );
    face.position.z = 0.2;
    dial.add(face);

    const ringMaterial = new MeshBasicMaterial({
      color: accentColor,
      opacity: value === null ? 0.2 : 0.7,
      transparent: true,
      side: DoubleSide,
      toneMapped: false
    });
    const ringStart = valueAngle(maximum, minimum, maximum, scale) + Math.PI / 2;
    const ringEnd = valueAngle(minimum, minimum, maximum, scale) + Math.PI / 2;
    const ring = new Mesh(
      new RingGeometry(1.69, 1.77, 112, 1, ringStart, ringEnd - ringStart),
      ringMaterial
    );
    ring.position.z = 0.29;
    dial.add(ring);

    zones.forEach((zone) => {
      const from = MathUtils.clamp(Math.min(zone.from, zone.to), minimum, maximum);
      const to = MathUtils.clamp(Math.max(zone.from, zone.to), minimum, maximum);
      if (to <= from) return;

      const start = valueAngle(to, minimum, maximum, scale) + Math.PI / 2;
      const end = valueAngle(from, minimum, maximum, scale) + Math.PI / 2;
      const zoneLength = end - start;
      const zoneArc = new Mesh(
        new RingGeometry(1.64, 1.82, 72, 1, start, end - start),
        new MeshBasicMaterial({
          color: zone.effect === 'frost'
            ? zone.secondaryColor ?? '#17354a'
            : zone.color,
          opacity: 0.94,
          transparent: true,
          side: DoubleSide,
          toneMapped: false
        })
      );
      zoneArc.position.z = 0.34;
      dial.add(zoneArc);

      if (zone.effect === 'frost') {
        const shardCount = 5;
        for (let shardIndex = 0; shardIndex < shardCount; shardIndex += 1) {
          const shardStart = start +
            zoneLength * (shardIndex / shardCount) +
            zoneLength * 0.012;
          const shardLength = zoneLength / shardCount *
            (shardIndex % 2 === 0 ? 0.7 : 0.48);
          const innerRadius = shardIndex % 2 === 0 ? 1.63 : 1.69;
          const frostShard = new Mesh(
            new RingGeometry(
              innerRadius,
              shardIndex % 3 === 0 ? 1.84 : 1.8,
              16,
              1,
              shardStart,
              shardLength
            ),
            new MeshBasicMaterial({
              color: shardIndex % 4 === 1
                ? '#79c9ef'
                : zone.color,
              opacity: shardIndex % 2 === 0 ? 0.96 : 0.74,
              transparent: true,
              side: DoubleSide,
              toneMapped: false
            })
          );
          frostShard.position.z = 0.355 + (shardIndex % 2) * 0.008;
          dial.add(frostShard);
        }
      }
    });

    const tickMaterials: MeshBasicMaterial[] = [];
    const tickValues = scale?.tickValues ??
      Array.from(
        { length: TICK_COUNT },
        (_, index) => MathUtils.lerp(
          minimum,
          maximum,
          index / (TICK_COUNT - 1)
        )
      );
    for (let index = 0; index < tickValues.length; index += 1) {
      const tickValue = tickValues[index];
      const angle = valueAngle(tickValue, minimum, maximum, scale);
      const major = scale
        ? scale.labelValues.includes(tickValue)
        : index % 4 === 0;
      const radius = major ? 1.58 : 1.65;
      const tickMaterial = new MeshBasicMaterial({
        color: major ? '#d7e8ee' : '#6f8994',
        opacity: value === null ? 0.35 : 0.9,
        transparent: true,
        toneMapped: false
      });
      tickMaterials.push(tickMaterial);
      const tick = new Mesh(
        new BoxGeometry(major ? 0.045 : 0.025, major ? 0.24 : 0.14, 0.035),
        tickMaterial
      );
      tick.position.set(
        -Math.sin(angle) * radius,
        Math.cos(angle) * radius,
        0.38
      );
      tick.rotation.z = angle;
      dial.add(tick);
    }

    scale?.labelValues.forEach((labelValue) => {
      const angle = valueAngle(labelValue, minimum, maximum, scale);
      const isGoalLabel = goal?.value === labelValue;
      const label = createDialLabel(
        labelValue,
        isGoalLabel ? goal.color : '#e8f3f6',
        isGoalLabel
      );
      const labelRadius = isGoalLabel ? 2.12 : labelValue === 0 ? 1.28 : 1.31;
      label.position.set(
        -Math.sin(angle) * labelRadius,
        Math.cos(angle) * labelRadius - (isGoalLabel ? 0.28 : 0),
        0.47
      );
      dial.add(label);
    });

    if (goal && goal.value >= minimum && goal.value <= maximum) {
      const angle = valueAngle(goal.value, minimum, maximum, scale);
      const goalMaterial = new MeshStandardMaterial({
        color: goal.color,
        emissive: new Color(goal.color),
        emissiveIntensity: 1.85,
        metalness: 0.25,
        roughness: 0.22
      });
      const goalMarker = new Mesh(
        new BoxGeometry(0.13, 0.5, 0.085),
        goalMaterial
      );
      goalMarker.position.set(
        -Math.sin(angle) * 1.62,
        Math.cos(angle) * 1.62,
        0.48
      );
      goalMarker.rotation.z = angle;
      dial.add(goalMarker);

      const goalHighlight = new Mesh(
        new BoxGeometry(0.035, 0.54, 0.09),
        new MeshBasicMaterial({
          color: '#ffffff',
          opacity: 0.92,
          transparent: true,
          toneMapped: false
        })
      );
      goalHighlight.position.copy(goalMarker.position);
      goalHighlight.position.z = 0.5;
      goalHighlight.rotation.z = angle;
      dial.add(goalHighlight);

      const goalHalo = new Mesh(
        new CircleGeometry(0.19, 24),
        new MeshBasicMaterial({
          color: goal.color,
          opacity: 0.34,
          transparent: true,
          blending: AdditiveBlending,
          depthWrite: false,
          toneMapped: false
        })
      );
      goalHalo.position.copy(goalMarker.position);
      goalHalo.position.z = 0.43;
      dial.add(goalHalo);

      const goalPointer = new Mesh(
        new ConeGeometry(0.15, 0.32, 3),
        new MeshBasicMaterial({
          color: goal.color,
          toneMapped: false
        })
      );
      goalPointer.position.set(
        -Math.sin(angle) * 1.94,
        Math.cos(angle) * 1.94,
        0.49
      );
      goalPointer.rotation.z = angle + Math.PI;
      dial.add(goalPointer);
    }

    const needle = new Group();
    needle.rotation.z = targetAngleRef.current;
    dial.add(needle);
    const needleMaterials = [0, 1].map(
      () =>
        new MeshStandardMaterial({
          color: accentColor,
          emissive: new Color(accentColor),
          emissiveIntensity: value === null ? 0.08 : 0.48,
          metalness: 0.35,
          roughness: 0.28
        })
    );
    const needleBody = new Mesh(
      new BoxGeometry(0.065, 1.38, 0.055),
      needleMaterials[0]
    );
    needleBody.position.set(0, 0.71, 0.5);
    needle.add(needleBody);
    const needleTip = new Mesh(
      new ConeGeometry(0.09, 0.25, 16),
      needleMaterials[1]
    );
    needleTip.position.set(0, 1.43, 0.5);
    needle.add(needleTip);

    const hub = new Mesh(
      new CylinderGeometry(0.18, 0.22, 0.14, 32),
      new MeshStandardMaterial({ color: '#d7e4e7', metalness: 0.88, roughness: 0.2 })
    );
    hub.position.z = 0.56;
    hub.rotation.x = Math.PI / 2;
    dial.add(hub);

    const glowMaterial = new MeshBasicMaterial({
      color: accentColor,
      opacity: value === null ? 0.08 : scale ? 0.085 : 0.16,
      transparent: true,
      blending: AdditiveBlending,
      depthWrite: false,
      toneMapped: false
    });
    const glow = new Mesh(new CircleGeometry(1.91, 96), glowMaterial);
    glow.position.z = 0.43;
    dial.add(glow);

    const glass = new Mesh(
      new CircleGeometry(2.02, 96),
      new MeshPhysicalMaterial({
        color: '#d9f7ff',
        opacity: scale ? 0.07 : 0.055,
        transparent: true,
        roughness: scale ? 0.035 : 0.06,
        metalness: 0,
        transmission: scale ? 0.18 : 0.12,
        depthWrite: false
      })
    );
    glass.position.z = 0.6;
    dial.add(glass);

    if (scale) {
      const broadHighlight = new Mesh(
        new CircleGeometry(1, 72),
        new MeshBasicMaterial({
          color: '#e9fcff',
          opacity: 0.065,
          transparent: true,
          blending: AdditiveBlending,
          depthWrite: false,
          toneMapped: false
        })
      );
      broadHighlight.position.set(-0.34, 0.72, 0.66);
      broadHighlight.scale.set(1.36, 0.42, 1);
      broadHighlight.rotation.z = -0.34;
      dial.add(broadHighlight);

      const specularSweep = new Mesh(
        new RingGeometry(
          1.78,
          1.84,
          72,
          1,
          MathUtils.degToRad(104),
          MathUtils.degToRad(58)
        ),
        new MeshBasicMaterial({
          color: '#f4feff',
          opacity: 0.24,
          transparent: true,
          side: DoubleSide,
          blending: AdditiveBlending,
          depthWrite: false,
          toneMapped: false
        })
      );
      specularSweep.position.z = 0.67;
      dial.add(specularSweep);
    }

    const bezel = new Mesh(
      new TorusGeometry(2.03, 0.065, 18, 96),
      new MeshStandardMaterial({
        color: scale ? '#071117' : '#38505b',
        metalness: 0.9,
        roughness: scale ? 0.14 : 0.2
      })
    );
    bezel.position.z = 0.48;
    dial.add(bezel);

    if (scale) {
      const outerBezel = new Mesh(
        new TorusGeometry(2.1, 0.105, 22, 112),
        new MeshStandardMaterial({
          color: '#010508',
          metalness: 0.92,
          roughness: 0.16
        })
      );
      outerBezel.position.z = 0.42;
      dial.add(outerBezel);

      const innerRing = new Mesh(
        new TorusGeometry(1.93, 0.026, 14, 112),
        new MeshBasicMaterial({
          color: '#b8f7ff',
          opacity: 0.78,
          transparent: true,
          toneMapped: false
        })
      );
      innerRing.position.z = 0.61;
      dial.add(innerRing);
    }
    const draw = (time: number) => {
      const runtime = runtimeRef.current;
      if (!runtime) return;
      const delta = Math.min((time - runtime.lastTime) / 1000, 0.05);
      runtime.lastTime = time;
      const nextAngle = MathUtils.damp(
        runtime.needle.rotation.z,
        targetAngleRef.current,
        8,
        delta
      );
      runtime.needle.rotation.z = nextAngle;
      runtime.renderer.render(runtime.scene, runtime.camera);

      if (Math.abs(nextAngle - targetAngleRef.current) > 0.0005) {
        runtime.frameId = window.requestAnimationFrame(draw);
      } else {
        runtime.frameId = null;
      }
    };

    const startAnimation = () => {
      const runtime = runtimeRef.current;
      if (!runtime || runtime.frameId !== null) return;
      runtime.lastTime = performance.now();
      runtime.frameId = window.requestAnimationFrame(draw);
    };
    startAnimationRef.current = startAnimation;

    const resizeObserver = new ResizeObserver(() => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width < 1 || rect.height < 1) return;
      renderer.setSize(rect.width, rect.height, false);
      const aspect = rect.width / rect.height;
      camera.left = -2.45 * aspect;
      camera.right = 2.45 * aspect;
      camera.top = 2.45;
      camera.bottom = -2.45;
      camera.updateProjectionMatrix();
      renderer.render(scene, camera);
    });
    resizeObserver.observe(canvas);

    runtimeRef.current = {
      renderer,
      scene,
      camera,
      needle,
      ringMaterial,
      tickMaterials,
      needleMaterials,
      glowMaterial,
      frameId: null,
      lastTime: performance.now(),
      resizeObserver
    };
    startAnimation();

    return () => {
      const runtime = runtimeRef.current;
      if (runtime?.frameId != null) window.cancelAnimationFrame(runtime.frameId);
      resizeObserver.disconnect();
      disposeScene(scene);
      renderer.dispose();
      renderer.forceContextLoss();
      runtimeRef.current = null;
      startAnimationRef.current = null;
    };
  }, [accentColor, goal, maximum, minimum, scale, useGlossyVectorRenderer, zones]);

  useEffect(() => {
    targetAngleRef.current = valueAngle(value, minimum, maximum, scale);
    const runtime = runtimeRef.current;
    if (runtime) {
      const hasValue = value !== null;
      runtime.ringMaterial.opacity = hasValue ? 0.7 : 0.2;
      runtime.tickMaterials.forEach((material) => {
        material.opacity = hasValue ? 0.9 : 0.35;
      });
      runtime.needleMaterials.forEach((material) => {
        material.emissiveIntensity = hasValue ? 0.48 : 0.08;
      });
      runtime.glowMaterial.opacity = hasValue
        ? scale ? 0.085 : 0.16
        : 0.08;
    }
    startAnimationRef.current?.();
  }, [maximum, minimum, scale, value]);

  return (
    <article
      className={`salinas-dashboard__dial salinas-dashboard__dial--${accent}`}
      role="meter"
      aria-label={label}
      aria-valuemin={minimum}
      aria-valuemax={maximum}
      aria-valuenow={value ?? undefined}
      aria-valuetext={
        value === null
          ? `${label} unavailable`
          : `${displayValue} ${unit}${demo ? ' demo value' : ''}`
      }
    >
      <header className="salinas-dashboard__dial-heading">
        <span>{label}</span>
        <small>
          {demo
            ? 'DEMO'
            : value === null
              ? 'WAITING'
              : useGlossyVectorRenderer
                ? 'LIVE'
                : 'LIVE 3D'}
        </small>
      </header>

      <div className="salinas-dashboard__dial-canvas" aria-hidden="true">
        <canvas ref={canvasRef} hidden={showGlossyVectorRenderer} />
        {showGlossyVectorRenderer ? (
          <GlossyTelemetryDial
            value={value}
            minimum={minimum}
            maximum={maximum}
            accentColor={accentColor}
            zones={zones}
            goal={goal}
            scale={scale}
            id={fallbackId}
          />
        ) : null}
        <div
          className={`salinas-dashboard__dial-reading${scale ? ' salinas-dashboard__dial-reading--numbered' : ''}`}
          style={activeZone ? { borderColor: activeZone.color } : undefined}
        >
          <strong style={activeZone ? { color: activeZone.color } : undefined}>
            {displayValue}
          </strong>
          <span>{value === null ? '' : unit}</span>
        </div>
      </div>

      <div
        className={`salinas-dashboard__dial-scale${scale ? ' salinas-dashboard__dial-scale--numbered' : ''}`}
      >
        <span>{minimum}</span>
        <small>{detail}</small>
        <span>{maximum}</span>
      </div>
    </article>
  );
}
