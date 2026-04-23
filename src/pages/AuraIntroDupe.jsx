// // // // // // // AuraIntro.jsx
// // // // // // // Drop this component into your React app and render it before <Home />.
// // // // // // // It auto-transitions to your homepage after the animation, or on "Skip".
// // // // // // //
// // // // // // // USAGE in App.jsx (or wherever you handle routing):
// // // // // // //   import AuraIntro from './components/AuraIntro';
// // // // // // //
// // // // // // //   In your router config, add a route for "/" that renders:
// // // // // // //     <AuraIntroGate><Home /></AuraIntroGate>
// // // // // // //
// // // // // // //   Or use AuraIntro directly as a splash overlay (see AuraIntroGate below).
// // // // // // //
// // // // // // // DEPENDENCIES:
// // // // // // //   npm install three
// // // // // // //   (framer-motion is optional — only used for the tagline fade)

// // // // // // import { useEffect, useRef, useState, useCallback } from 'react';
// // // // // // import * as THREE from 'three';

// // // // // // // ─────────────────────────────────────────────────────────────────────────────
// // // // // // // CONFIG — tweak timings, counts, colors here
// // // // // // // ─────────────────────────────────────────────────────────────────────────────
// // // // // // const CONFIG = {
// // // // // //     PARTICLE_COUNT: 2400,
// // // // // //     SCATTER_DURATION: 1.2,   // seconds of free float
// // // // // //     ORBIT_DURATION: 3.8,   // seconds of orbiting shapes
// // // // // //     COLLAPSE_DURATION: 1.6,   // seconds morphing into text
// // // // // //     TEXT_DURATION: 8.0,   // seconds holding "Aura"
// // // // // //     EXIT_DURATION: 1.8,   // seconds of exit explosion
// // // // // //     REPEL_RADIUS: 9,     // mouse repulsion radius (world units)
// // // // // //     REPEL_STRENGTH: 7,
// // // // // //     CAMERA_START_Z: 55,
// // // // // //     CAMERA_TEXT_Z: 36,
// // // // // //     PALETTE: [
// // // // // //         0x7b68ee, // indigo
// // // // // //         0xc084fc, // violet
// // // // // //         0x818cf8, // lavender
// // // // // //         0xe879f9, // fuchsia
// // // // // //         0xa78bfa, // purple
// // // // // //         0x60a5fa, // blue accent
// // // // // //     ],
// // // // // // };

// // // // // // // ─────────────────────────────────────────────────────────────────────────────
// // // // // // // HELPER — sample pixel positions from canvas text rendering
// // // // // // // ─────────────────────────────────────────────────────────────────────────────
// // // // // // function sampleTextParticles(text, count, containerWidth) {
// // // // // //     const offCanvas = document.createElement('canvas');
// // // // // //     const fontSize = Math.floor(Math.min(containerWidth, 900) * 0.18);
// // // // // //     offCanvas.width = Math.min(containerWidth, 900);
// // // // // //     offCanvas.height = Math.round(fontSize * 1.5);
// // // // // //     const ctx = offCanvas.getContext('2d');
// // // // // //     ctx.clearRect(0, 0, offCanvas.width, offCanvas.height);
// // // // // //     ctx.fillStyle = '#fff';
// // // // // //     ctx.font = `bold ${fontSize}px Georgia, serif`;
// // // // // //     ctx.textAlign = 'center';
// // // // // //     ctx.textBaseline = 'middle';
// // // // // //     ctx.fillText(text, offCanvas.width / 2, offCanvas.height / 2);

// // // // // //     const imgData = ctx.getImageData(0, 0, offCanvas.width, offCanvas.height);
// // // // // //     const pts = [];
// // // // // //     for (let y = 0; y < offCanvas.height; y += 2) {
// // // // // //         for (let x = 0; x < offCanvas.width; x += 2) {
// // // // // //             if (imgData.data[(y * offCanvas.width + x) * 4 + 3] > 100) {
// // // // // //                 pts.push({
// // // // // //                     x: ((x / offCanvas.width) - 0.5) * 56,
// // // // // //                     y: -((y / offCanvas.height) - 0.5) * 18,
// // // // // //                 });
// // // // // //             }
// // // // // //         }
// // // // // //     }
// // // // // //     // Fisher–Yates shuffle
// // // // // //     for (let i = pts.length - 1; i > 0; i--) {
// // // // // //         const j = Math.floor(Math.random() * (i + 1));
// // // // // //         [pts[i], pts[j]] = [pts[j], pts[i]];
// // // // // //     }
// // // // // //     const step = Math.max(1, Math.floor(pts.length / count));
// // // // // //     const sampled = [];
// // // // // //     for (let i = 0; i < pts.length && sampled.length < count; i += step) sampled.push(pts[i]);
// // // // // //     while (sampled.length < count) {
// // // // // //         sampled.push(pts[Math.floor(Math.random() * pts.length)] ?? { x: 0, y: 0 });
// // // // // //     }
// // // // // //     return sampled.slice(0, count);
// // // // // // }

// // // // // // // ─────────────────────────────────────────────────────────────────────────────
// // // // // // // HELPER — build orbital target positions
// // // // // // // ─────────────────────────────────────────────────────────────────────────────
// // // // // // function buildOrbitalTargets(count) {
// // // // // //     const shapes = [
// // // // // //         // Ring 1 — large orbit
// // // // // //         ...Array.from({ length: 80 }, (_, i) => {
// // // // // //             const a = (i / 80) * Math.PI * 2;
// // // // // //             return { x: Math.cos(a) * 22, y: Math.sin(a) * 9, z: Math.sin(a * 2) * 4 };
// // // // // //         }),
// // // // // //         // Ring 2 — tilted inner ring
// // // // // //         ...Array.from({ length: 60 }, (_, i) => {
// // // // // //             const a = (i / 60) * Math.PI * 2;
// // // // // //             return { x: Math.cos(a) * 15, y: Math.sin(a) * 6, z: Math.cos(a) * 6 };
// // // // // //         }),
// // // // // //         // Cluster: "bag" silhouette left
// // // // // //         ...Array.from({ length: 100 }, () => ({
// // // // // //             x: -13 + (Math.random() - 0.5) * 9,
// // // // // //             y: 4 + (Math.random() - 0.5) * 11,
// // // // // //             z: (Math.random() - 0.5) * 4,
// // // // // //         })),
// // // // // //         // Cluster: "cart" silhouette right
// // // // // //         ...Array.from({ length: 100 }, () => ({
// // // // // //             x: 13 + (Math.random() - 0.5) * 9,
// // // // // //             y: -2 + (Math.random() - 0.5) * 9,
// // // // // //             z: (Math.random() - 0.5) * 4,
// // // // // //         })),
// // // // // //         // Scattered sparkle particles
// // // // // //         ...Array.from({ length: 60 }, () => ({
// // // // // //             x: (Math.random() - 0.5) * 50,
// // // // // //             y: (Math.random() - 0.5) * 30,
// // // // // //             z: (Math.random() - 0.5) * 10,
// // // // // //         })),
// // // // // //     ];

// // // // // //     const targets = new Float32Array(count * 3);
// // // // // //     for (let i = 0; i < count; i++) {
// // // // // //         const s = shapes[i % shapes.length];
// // // // // //         targets[i * 3] = s.x + (Math.random() - 0.5) * 3;
// // // // // //         targets[i * 3 + 1] = s.y + (Math.random() - 0.5) * 3;
// // // // // //         targets[i * 3 + 2] = (s.z ?? 0) + (Math.random() - 0.5) * 2;
// // // // // //     }
// // // // // //     return targets;
// // // // // // }

// // // // // // // ─────────────────────────────────────────────────────────────────────────────
// // // // // // // SHADERS
// // // // // // // ─────────────────────────────────────────────────────────────────────────────
// // // // // // const VERTEX_SHADER = `
// // // // // //   attribute float size;
// // // // // //   attribute vec3 myColor;
// // // // // //   varying vec3 vMyColor;
// // // // // //   varying float vDist;
// // // // // //   uniform float uTime;
// // // // // //   uniform float uPixelRatio;

// // // // // //   void main() {
// // // // // //     vMyColor = myColor;
// // // // // //     vec4 mv = modelViewMatrix * vec4(position, 1.0);
// // // // // //     vDist = -mv.z;
// // // // // //     float s = size * uPixelRatio * (280.0 / max(vDist, 1.0));
// // // // // //     gl_PointSize = clamp(s, 1.0, 16.0);
// // // // // //     gl_Position  = projectionMatrix * mv;
// // // // // //   }
// // // // // // `;

// // // // // // const FRAGMENT_SHADER = `
// // // // // //   varying vec3 vMyColor;
// // // // // //   varying float vDist;

// // // // // //   void main() {
// // // // // //     vec2  uv   = gl_PointCoord - 0.5;
// // // // // //     float d    = length(uv);
// // // // // //     if (d > 0.5) discard;
// // // // // //     float core = 1.0 - smoothstep(0.0,  0.22, d);
// // // // // //     float glow = 1.0 - smoothstep(0.18, 0.50, d);
// // // // // //     float a    = core * 0.95 + glow * 0.35;
// // // // // //     a         *= 1.0 - smoothstep(20.0, 120.0, vDist); // depth fade
// // // // // //     vec3  col  = vMyColor + core * vec3(0.35, 0.25, 0.5);
// // // // // //     gl_FragColor = vec4(col, a);
// // // // // //   }
// // // // // // `;

// // // // // // // ─────────────────────────────────────────────────────────────────────────────
// // // // // // // MAIN COMPONENT
// // // // // // // ─────────────────────────────────────────────────────────────────────────────
// // // // // // export default function AuraIntro({ onComplete }) {
// // // // // //     const canvasRef = useRef(null);
// // // // // //     const mouseRef = useRef({ x: 9999, y: 9999 });
// // // // // //     const [progress, setProgress] = useState(0);
// // // // // //     const [showSkip, setShowSkip] = useState(false);
// // // // // //     const [showTagline, setShowTagline] = useState(false);
// // // // // //     const [exiting, setExiting] = useState(false);

// // // // // //     const triggerExit = useCallback(() => {
// // // // // //         setExiting(true);
// // // // // //     }, []);

// // // // // //     useEffect(() => {
// // // // // //         const timer = setTimeout(() => setShowSkip(true), 800);
// // // // // //         return () => clearTimeout(timer);
// // // // // //     }, []);

// // // // // //     useEffect(() => {
// // // // // //         if (!canvasRef.current) return;

// // // // // //         const canvas = canvasRef.current;
// // // // // //         const W = window.innerWidth;
// // // // // //         const H = window.innerHeight;

// // // // // //         // ── Renderer ──────────────────────────────────────────────────
// // // // // //         const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
// // // // // //         renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
// // // // // //         renderer.setSize(W, H);
// // // // // //         renderer.setClearColor(0x04020e, 1);

// // // // // //         const scene = new THREE.Scene();
// // // // // //         const camera = new THREE.PerspectiveCamera(60, W / H, 0.1, 1000);
// // // // // //         camera.position.set(0, 0, CONFIG.CAMERA_START_Z);

// // // // // //         // ── Particle buffers ──────────────────────────────────────────
// // // // // //         const N = CONFIG.PARTICLE_COUNT;
// // // // // //         const positions = new Float32Array(N * 3);
// // // // // //         const velocities = new Float32Array(N * 3);
// // // // // //         const targets = new Float32Array(N * 3);
// // // // // //         const colors = new Float32Array(N * 3);
// // // // // //         const sizes = new Float32Array(N);

// // // // // //         const palette = CONFIG.PALETTE.map(h => new THREE.Color(h));

// // // // // //         for (let i = 0; i < N; i++) {
// // // // // //             positions[i * 3] = (Math.random() - 0.5) * 130;
// // // // // //             positions[i * 3 + 1] = (Math.random() - 0.5) * 90;
// // // // // //             positions[i * 3 + 2] = (Math.random() - 0.5) * 70;
// // // // // //             velocities[i * 3] = (Math.random() - 0.5) * 0.25;
// // // // // //             velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.25;
// // // // // //             velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.08;
// // // // // //             const c = palette[Math.floor(Math.random() * palette.length)];
// // // // // //             colors[i * 3] = c.r; colors[i * 3 + 1] = c.g; colors[i * 3 + 2] = c.b;
// // // // // //             sizes[i] = 1.4 + Math.random() * 2.8;
// // // // // //         }

// // // // // //         const geo = new THREE.BufferGeometry();
// // // // // //         geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
// // // // // //         geo.setAttribute('myColor', new THREE.BufferAttribute(colors, 3));
// // // // // //         geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

// // // // // //         const mat = new THREE.ShaderMaterial({
// // // // // //             uniforms: {
// // // // // //                 uTime: { value: 0 },
// // // // // //                 uPixelRatio: { value: renderer.getPixelRatio() },
// // // // // //             },
// // // // // //             vertexShader: VERTEX_SHADER,
// // // // // //             fragmentShader: FRAGMENT_SHADER,
// // // // // //             transparent: true,
// // // // // //             depthWrite: false,
// // // // // //             blending: THREE.AdditiveBlending,
// // // // // //         });

// // // // // //         const points = new THREE.Points(geo, mat);
// // // // // //         scene.add(points);

// // // // // //         // ── Precompute orbital targets ─────────────────────────────────
// // // // // //         const orbitalTargets = buildOrbitalTargets(N);
// // // // // //         orbitalTargets.forEach((v, i) => { targets[i] = v; });

// // // // // //         // ── State ─────────────────────────────────────────────────────
// // // // // //         let phase = 'scatter';
// // // // // //         let phaseTime = 0;
// // // // // //         let totalTime = 0;
// // // // // //         let textPts = null;
// // // // // //         let cameraTargetZ = CONFIG.CAMERA_START_Z;
// // // // // //         let exitTriggered = false;
// // // // // //         let raf;

// // // // // //         // Precompute text targets async (tiny delay so DOM is ready)
// // // // // //         setTimeout(() => {
// // // // // //             textPts = sampleTextParticles('Aura', N, window.innerWidth);
// // // // // //         }, 80);

// // // // // //         const TOTAL = CONFIG.SCATTER_DURATION + CONFIG.ORBIT_DURATION
// // // // // //             + CONFIG.COLLAPSE_DURATION + CONFIG.TEXT_DURATION;

// // // // // //         // ── Helpers ────────────────────────────────────────────────────
// // // // // //         function setTextTargets() {
// // // // // //             if (!textPts) return;
// // // // // //             for (let i = 0; i < N; i++) {
// // // // // //                 const pt = textPts[i % textPts.length];
// // // // // //                 targets[i * 3] = pt.x + (Math.random() - 0.5) * 0.5;
// // // // // //                 targets[i * 3 + 1] = pt.y + (Math.random() - 0.5) * 0.5;
// // // // // //                 targets[i * 3 + 2] = (Math.random() - 0.5) * 1.5;
// // // // // //             }
// // // // // //         }

// // // // // //         function doExitTrigger() {
// // // // // //             if (exitTriggered) return;
// // // // // //             exitTriggered = true;
// // // // // //             setExiting(true);
// // // // // //         }

// // // // // //         // ── Clock ─────────────────────────────────────────────────────
// // // // // //         let lastT = performance.now();

// // // // // //         function tick(now) {
// // // // // //             raf = requestAnimationFrame(tick);
// // // // // //             const dt = Math.min((now - lastT) / 1000, 0.05);
// // // // // //             lastT = now;
// // // // // //             totalTime += dt;
// // // // // //             phaseTime += dt;
// // // // // //             mat.uniforms.uTime.value = totalTime;

// // // // // //             // ── Progress ─────────────────────────────────────────────
// // // // // //             setProgress(Math.min(totalTime / TOTAL, 1));

// // // // // //             // ── Phase machine ─────────────────────────────────────────
// // // // // //             if (phase === 'scatter' && phaseTime >= CONFIG.SCATTER_DURATION) {
// // // // // //                 phase = 'orbit'; phaseTime = 0;
// // // // // //             }
// // // // // //             if (phase === 'orbit' && phaseTime >= CONFIG.ORBIT_DURATION) {
// // // // // //                 phase = 'collapse'; phaseTime = 0;
// // // // // //                 setTextTargets();
// // // // // //                 cameraTargetZ = 42;
// // // // // //             }
// // // // // //             if (phase === 'collapse' && phaseTime >= CONFIG.COLLAPSE_DURATION) {
// // // // // //                 phase = 'text'; phaseTime = 0;
// // // // // //                 setShowTagline(true);
// // // // // //                 cameraTargetZ = CONFIG.CAMERA_TEXT_Z;
// // // // // //             }
// // // // // //             if (phase === 'text' && phaseTime >= CONFIG.TEXT_DURATION) {
// // // // // //                 doExitTrigger();
// // // // // //             }
// // // // // //             if (phase === 'exit' && phaseTime >= CONFIG.EXIT_DURATION) {
// // // // // //                 onComplete?.();
// // // // // //             }

// // // // // //             // If exiting flag was set externally
// // // // // //             if (exiting && phase !== 'exit') {
// // // // // //                 phase = 'exit'; phaseTime = 0;
// // // // // //             }

// // // // // //             // ── Camera ────────────────────────────────────────────────
// // // // // //             camera.position.z += (cameraTargetZ - camera.position.z) * 0.03;
// // // // // //             const mx = mouseRef.current.x;
// // // // // //             const my = mouseRef.current.y;
// // // // // //             camera.position.x += (-mx * 3 - camera.position.x) * 0.025;
// // // // // //             camera.position.y += (my * 2 - camera.position.y) * 0.025;

// // // // // //             // Mouse in world coords (approx at z=0)
// // // // // //             const halfFov = THREE.MathUtils.degToRad(30);
// // // // // //             const aspect = W / H;
// // // // // //             const mwx = mx * camera.position.z * Math.tan(halfFov);
// // // // // //             const mwy = my * camera.position.z * Math.tan(halfFov) / aspect;

// // // // // //             // ── Particle update ───────────────────────────────────────
// // // // // //             const posAttr = geo.attributes.position;
// // // // // //             const colAttr = geo.attributes.myColor;

// // // // // //             for (let i = 0; i < N; i++) {
// // // // // //                 const ix = i * 3, iy = i * 3 + 1, iz = i * 3 + 2;
// // // // // //                 let px = positions[ix], py = positions[iy], pz = positions[iz];

// // // // // //                 if (phase === 'scatter') {
// // // // // //                     velocities[ix] *= 0.985; velocities[iy] *= 0.985; velocities[iz] *= 0.985;
// // // // // //                     px += velocities[ix]; py += velocities[iy]; pz += velocities[iz];
// // // // // //                     px -= px * 0.007; py -= py * 0.007;
// // // // // //                     if (px > 80) px = -80; if (px < -80) px = 80;
// // // // // //                     if (py > 60) py = -60; if (py < -60) py = 60;

// // // // // //                 } else if (phase === 'orbit') {
// // // // // //                     const tx = orbitalTargets[ix];
// // // // // //                     const ty = orbitalTargets[iy];
// // // // // //                     const tz = orbitalTargets[iz];
// // // // // //                     const cos = Math.cos(totalTime * 0.14);
// // // // // //                     const sin = Math.sin(totalTime * 0.14);
// // // // // //                     const rotX = tx * cos - tz * sin;
// // // // // //                     const rotZ = tx * sin + tz * cos;
// // // // // //                     const wave = Math.sin(totalTime * 0.9 + i * 0.03) * 0.8;
// // // // // //                     px += (rotX + wave * 0.15 - px) * 0.045;
// // // // // //                     py += (ty + Math.sin(totalTime * 0.7 + i * 0.02) * 0.6 - py) * 0.045;
// // // // // //                     pz += (rotZ - pz) * 0.045;

// // // // // //                 } else if (phase === 'collapse') {
// // // // // //                     const tx = targets[ix], ty = targets[iy], tz = targets[iz];
// // // // // //                     px += (tx - px) * 0.07;
// // // // // //                     py += (ty - py) * 0.07;
// // // // // //                     pz += (tz - pz) * 0.07;

// // // // // //                 } else if (phase === 'text') {
// // // // // //                     const tx = targets[ix], ty = targets[iy], tz = targets[iz];
// // // // // //                     // Mouse repulsion
// // // // // //                     const dx = px - mwx, dy = py - mwy;
// // // // // //                     const dist = Math.sqrt(dx * dx + dy * dy);
// // // // // //                     if (dist < CONFIG.REPEL_RADIUS && dist > 0.01) {
// // // // // //                         const f = ((CONFIG.REPEL_RADIUS - dist) / CONFIG.REPEL_RADIUS) ** 2;
// // // // // //                         px += (dx / dist) * f * CONFIG.REPEL_STRENGTH;
// // // // // //                         py += (dy / dist) * f * CONFIG.REPEL_STRENGTH;
// // // // // //                         pz += Math.sin(totalTime * 3 + i) * f * 0.6;
// // // // // //                     }
// // // // // //                     // Spring back to text target
// // // // // //                     const ease = dist < CONFIG.REPEL_RADIUS ? 0.018 : 0.03;
// // // // // //                     px += (tx - px) * ease;
// // // // // //                     py += (ty - py) * ease;
// // // // // //                     pz += (tz - pz) * ease;
// // // // // //                     // Shimmer
// // // // // //                     px += Math.sin(totalTime * 2.1 + i * 0.11) * 0.012;
// // // // // //                     py += Math.cos(totalTime * 1.8 + i * 0.07) * 0.012;

// // // // // //                 } else if (phase === 'exit') {
// // // // // //                     const angle = i * 2.39996; // golden angle
// // // // // //                     const speed = phaseTime * 22;
// // // // // //                     px += Math.cos(angle) * speed * dt;
// // // // // //                     py += Math.sin(angle) * speed * dt;
// // // // // //                     pz += Math.sin(angle * 1.5) * speed * 0.4 * dt;
// // // // // //                 }

// // // // // //                 positions[ix] = px; positions[iy] = py; positions[iz] = pz;
// // // // // //                 posAttr.array[ix] = px; posAttr.array[iy] = py; posAttr.array[iz] = pz;

// // // // // //                 // Color pulsing in text phase
// // // // // //                 if (phase === 'text' || phase === 'collapse') {
// // // // // //                     const t = (Math.sin(totalTime * 1.6 + i * 0.09) + 1) * 0.5;
// // // // // //                     const c1 = palette[i % palette.length];
// // // // // //                     const c2 = palette[(i + 2) % palette.length];
// // // // // //                     colAttr.array[ix] = c1.r + (c2.r - c1.r) * t * 0.35;
// // // // // //                     colAttr.array[iy] = c1.g + (c2.g - c1.g) * t * 0.35;
// // // // // //                     colAttr.array[iz] = c1.b + (c2.b - c1.b) * t * 0.35;
// // // // // //                 }
// // // // // //             }

// // // // // //             posAttr.needsUpdate = true;
// // // // // //             if (phase === 'text' || phase === 'collapse') colAttr.needsUpdate = true;

// // // // // //             // Exit opacity handled via canvas style (see JSX)
// // // // // //             if (phase === 'exit') {
// // // // // //                 const t = Math.min(phaseTime / CONFIG.EXIT_DURATION, 1);
// // // // // //                 canvas.style.opacity = String(1 - t);
// // // // // //             }

// // // // // //             renderer.render(scene, camera);
// // // // // //         }

// // // // // //         raf = requestAnimationFrame(tick);

// // // // // //         // ── Resize ────────────────────────────────────────────────────
// // // // // //         const onResize = () => {
// // // // // //             const w = window.innerWidth, h = window.innerHeight;
// // // // // //             camera.aspect = w / h;
// // // // // //             camera.updateProjectionMatrix();
// // // // // //             renderer.setSize(w, h);
// // // // // //         };
// // // // // //         window.addEventListener('resize', onResize);

// // // // // //         return () => {
// // // // // //             cancelAnimationFrame(raf);
// // // // // //             window.removeEventListener('resize', onResize);
// // // // // //             renderer.dispose();
// // // // // //             geo.dispose();
// // // // // //             mat.dispose();
// // // // // //         };
// // // // // //         // eslint-disable-next-line react-hooks/exhaustive-deps
// // // // // //     }, []);

// // // // // //     // Mouse tracking
// // // // // //     useEffect(() => {
// // // // // //         const onMove = e => {
// // // // // //             mouseRef.current.x = (e.clientX / window.innerWidth) * 2 - 1;
// // // // // //             mouseRef.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
// // // // // //         };
// // // // // //         const onTouch = e => {
// // // // // //             const t = e.touches[0];
// // // // // //             mouseRef.current.x = (t.clientX / window.innerWidth) * 2 - 1;
// // // // // //             mouseRef.current.y = -(t.clientY / window.innerHeight) * 2 + 1;
// // // // // //         };
// // // // // //         window.addEventListener('mousemove', onMove);
// // // // // //         window.addEventListener('touchmove', onTouch, { passive: true });
// // // // // //         return () => {
// // // // // //             window.removeEventListener('mousemove', onMove);
// // // // // //             window.removeEventListener('touchmove', onTouch);
// // // // // //         };
// // // // // //     }, []);

// // // // // //     // Trigger completion when exiting
// // // // // //     useEffect(() => {
// // // // // //         if (!exiting) return;
// // // // // //         const timer = setTimeout(() => onComplete?.(), CONFIG.EXIT_DURATION * 1000);
// // // // // //         return () => clearTimeout(timer);
// // // // // //     }, [exiting, onComplete]);

// // // // // //     return (
// // // // // //         <div style={{
// // // // // //             position: 'fixed', inset: 0, zIndex: 9999,
// // // // // //             background: '#04020e',
// // // // // //             opacity: exiting ? 0 : 1,
// // // // // //             transition: exiting ? `opacity ${CONFIG.EXIT_DURATION}s ease-in` : 'none',
// // // // // //             pointerEvents: exiting ? 'none' : 'all',
// // // // // //         }}>
// // // // // //             {/* Three.js canvas */}
// // // // // //             <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />

// // // // // //             {/* Tagline */}
// // // // // //             <div style={{
// // // // // //                 position: 'absolute', top: '50%', left: '50%',
// // // // // //                 transform: 'translate(-50%, calc(-50% + 60px))',
// // // // // //                 fontFamily: 'Georgia, serif',
// // // // // //                 fontSize: 'clamp(11px, 1.5vw, 15px)',
// // // // // //                 letterSpacing: '0.28em',
// // // // // //                 textTransform: 'uppercase',
// // // // // //                 color: 'rgba(180, 160, 255, 0.75)',
// // // // // //                 opacity: showTagline ? 1 : 0,
// // // // // //                 transition: 'opacity 1.2s ease',
// // // // // //                 whiteSpace: 'nowrap',
// // // // // //                 userSelect: 'none',
// // // // // //             }}>
// // // // // //                 Where aesthetics meet soul
// // // // // //             </div>

// // // // // //             {/* Bottom UI */}
// // // // // //             <div style={{
// // // // // //                 position: 'absolute', bottom: 0, left: 0, right: 0,
// // // // // //                 display: 'flex', flexDirection: 'column', alignItems: 'center',
// // // // // //                 paddingBottom: '48px', gap: '20px',
// // // // // //                 pointerEvents: 'none',
// // // // // //             }}>
// // // // // //                 {/* Progress bar */}
// // // // // //                 <div style={{
// // // // // //                     width: '120px', height: '1px',
// // // // // //                     background: 'rgba(255,255,255,0.08)',
// // // // // //                     overflow: 'hidden',
// // // // // //                     opacity: showSkip ? 1 : 0,
// // // // // //                     transition: 'opacity 0.8s',
// // // // // //                 }}>
// // // // // //                     <div style={{
// // // // // //                         height: '100%',
// // // // // //                         width: `${progress * 100}%`,
// // // // // //                         background: 'linear-gradient(90deg, #7b68ee, #c084fc)',
// // // // // //                         transition: 'width 0.12s linear',
// // // // // //                     }} />
// // // // // //                 </div>

// // // // // //                 {/* Skip button */}
// // // // // //                 <button
// // // // // //                     onClick={triggerExit}
// // // // // //                     style={{
// // // // // //                         pointerEvents: showSkip ? 'all' : 'none',
// // // // // //                         cursor: 'pointer',
// // // // // //                         background: 'rgba(255,255,255,0.06)',
// // // // // //                         border: '1px solid rgba(255,255,255,0.18)',
// // // // // //                         color: 'rgba(255,255,255,0.65)',
// // // // // //                         fontFamily: 'sans-serif',
// // // // // //                         fontSize: '12px',
// // // // // //                         letterSpacing: '0.14em',
// // // // // //                         textTransform: 'uppercase',
// // // // // //                         padding: '10px 30px',
// // // // // //                         backdropFilter: 'blur(12px)',
// // // // // //                         borderRadius: '2px',
// // // // // //                         opacity: showSkip ? 1 : 0,
// // // // // //                         transition: 'opacity 0.8s, background 0.25s, color 0.25s',
// // // // // //                     }}
// // // // // //                     onMouseEnter={e => {
// // // // // //                         e.currentTarget.style.background = 'rgba(255,255,255,0.14)';
// // // // // //                         e.currentTarget.style.color = '#fff';
// // // // // //                     }}
// // // // // //                     onMouseLeave={e => {
// // // // // //                         e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
// // // // // //                         e.currentTarget.style.color = 'rgba(255,255,255,0.65)';
// // // // // //                     }}
// // // // // //                 >
// // // // // //                     Skip intro
// // // // // //                 </button>
// // // // // //             </div>

// // // // // //             {/* Corner branding */}
// // // // // //             <div style={{
// // // // // //                 position: 'absolute', top: '32px', left: '40px',
// // // // // //                 fontFamily: 'Georgia, serif',
// // // // // //                 fontSize: '22px',
// // // // // //                 letterSpacing: '0.15em',
// // // // // //                 color: 'rgba(255,255,255,0.12)',
// // // // // //                 userSelect: 'none',
// // // // // //             }}>
// // // // // //                 AURA
// // // // // //             </div>
// // // // // //         </div>
// // // // // //     );
// // // // // // }

// // // // // // // ─────────────────────────────────────────────────────────────────────────────
// // // // // // // GATE WRAPPER — wrap your <Home /> (or any page) with this
// // // // // // // It shows the intro once per session, then renders children normally
// // // // // // // ─────────────────────────────────────────────────────────────────────────────

// // // // // // let memoryIntroSeen = false;

// // // // // // export function AuraIntroGate({ children }) {
// // // // // //     // Only show intro on full browser refresh or first load
// // // // // //     const [done, setDone] = useState(memoryIntroSeen);

// // // // // //     const handleComplete = useCallback(() => {
// // // // // //         memoryIntroSeen = true;
// // // // // //         setDone(true);
// // // // // //     }, []);

// // // // // //     return (
// // // // // //         <>
// // // // // //             {done ? children : (
// // // // // //                 <>
// // // // // //                     <AuraIntro onComplete={handleComplete} />
// // // // // //                     {/* Render children behind the intro so they hydrate early */}
// // // // // //                     <div style={{ visibility: 'hidden', position: 'absolute', inset: 0, pointerEvents: 'none' }}>
// // // // // //                         {children}
// // // // // //                     </div>
// // // // // //                 </>
// // // // // //             )}
// // // // // //         </>
// // // // // //     );
// // // // // // }


// // // // // // AuraIntro.jsx — Enhanced & fixed
// // // // // // DEPENDENCIES: npm install three
// // // // // //
// // // // // // USAGE:
// // // // // //   import { AuraIntroGate } from './AuraIntro';
// // // // // //   <AuraIntroGate><Home /></AuraIntroGate>

// // // // // import { useEffect, useRef, useState, useCallback } from 'react';
// // // // // import * as THREE from 'three';

// // // // // // ─────────────────────────────────────────────────────────────────────────────
// // // // // // CONFIG
// // // // // // ─────────────────────────────────────────────────────────────────────────────
// // // // // const CONFIG = {
// // // // //     PARTICLE_COUNT: 2800,
// // // // //     SCATTER_DURATION: 1.4,
// // // // //     ORBIT_DURATION: 4.2,
// // // // //     COLLAPSE_DURATION: 1.8,
// // // // //     TEXT_DURATION: 9.0,
// // // // //     EXIT_DURATION: 2.0,
// // // // //     REPEL_RADIUS: 10,
// // // // //     REPEL_STRENGTH: 8,
// // // // //     CAMERA_START_Z: 58,
// // // // //     CAMERA_ORBIT_Z: 48,
// // // // //     CAMERA_TEXT_Z: 36,
// // // // //     PALETTE: [
// // // // //         0x7b68ee, // indigo
// // // // //         0xc084fc, // violet
// // // // //         0x818cf8, // lavender
// // // // //         0xe879f9, // fuchsia
// // // // //         0xa78bfa, // purple
// // // // //         0x60a5fa, // blue accent
// // // // //     ],
// // // // // };

// // // // // // ─────────────────────────────────────────────────────────────────────────────
// // // // // // SHADERS — use aColor to avoid Three.js built-in name collision
// // // // // // ─────────────────────────────────────────────────────────────────────────────
// // // // // const VERTEX_SHADER = /* glsl */`
// // // // //   attribute float aSize;
// // // // //   attribute vec3  aColor;
// // // // //   varying   vec3  vColor;
// // // // //   varying   float vDist;
// // // // //   uniform   float uPixelRatio;

// // // // //   void main() {
// // // // //     vColor = aColor;
// // // // //     vec4 mv = modelViewMatrix * vec4(position, 1.0);
// // // // //     vDist   = -mv.z;
// // // // //     float s = aSize * uPixelRatio * (300.0 / max(vDist, 1.0));
// // // // //     gl_PointSize = clamp(s, 1.0, 18.0);
// // // // //     gl_Position  = projectionMatrix * mv;
// // // // //   }
// // // // // `;

// // // // // const FRAGMENT_SHADER = /* glsl */`
// // // // //   varying vec3  vColor;
// // // // //   varying float vDist;

// // // // //   void main() {
// // // // //     vec2  uv   = gl_PointCoord - 0.5;
// // // // //     float d    = length(uv);
// // // // //     if (d > 0.5) discard;

// // // // //     float core = 1.0 - smoothstep(0.0,  0.20, d);
// // // // //     float mid  = 1.0 - smoothstep(0.15, 0.38, d);
// // // // //     float glow = 1.0 - smoothstep(0.30, 0.50, d);
// // // // //     float a    = core * 1.0 + mid * 0.5 + glow * 0.25;
// // // // //     a         *= smoothstep(130.0, 18.0, vDist);

// // // // //     vec3 col   = vColor
// // // // //                + core * vec3(0.40, 0.28, 0.55)
// // // // //                + mid  * vec3(0.10, 0.05, 0.20);

// // // // //     gl_FragColor = vec4(col, clamp(a, 0.0, 1.0));
// // // // //   }
// // // // // `;

// // // // // // ─────────────────────────────────────────────────────────────────────────────
// // // // // // HELPER — sample text pixels → world-space points (Three.js scale)
// // // // // // ─────────────────────────────────────────────────────────────────────────────
// // // // // function sampleTextParticles(text, count, containerWidth) {
// // // // //     const offCanvas = document.createElement('canvas');
// // // // //     const fontSize = Math.floor(Math.min(containerWidth, 900) * 0.19);
// // // // //     offCanvas.width = Math.min(containerWidth, 900);
// // // // //     offCanvas.height = Math.round(fontSize * 1.6);
// // // // //     const ctx = offCanvas.getContext('2d');
// // // // //     ctx.clearRect(0, 0, offCanvas.width, offCanvas.height);
// // // // //     ctx.fillStyle = '#fff';
// // // // //     ctx.font = `bold ${fontSize}px Georgia, serif`;
// // // // //     ctx.textAlign = 'center';
// // // // //     ctx.textBaseline = 'middle';
// // // // //     ctx.fillText(text, offCanvas.width / 2, offCanvas.height / 2);

// // // // //     const imgData = ctx.getImageData(0, 0, offCanvas.width, offCanvas.height);
// // // // //     const pts = [];
// // // // //     for (let y = 0; y < offCanvas.height; y += 2) {
// // // // //         for (let x = 0; x < offCanvas.width; x += 2) {
// // // // //             if (imgData.data[(y * offCanvas.width + x) * 4 + 3] > 120) {
// // // // //                 pts.push({
// // // // //                     // Map to Three.js world units — matched to CAMERA_TEXT_Z FOV
// // // // //                     x: ((x / offCanvas.width) - 0.5) * 58,
// // // // //                     y: -((y / offCanvas.height) - 0.5) * 20,
// // // // //                 });
// // // // //             }
// // // // //         }
// // // // //     }
// // // // //     // Fisher–Yates shuffle
// // // // //     for (let i = pts.length - 1; i > 0; i--) {
// // // // //         const j = Math.floor(Math.random() * (i + 1));
// // // // //         [pts[i], pts[j]] = [pts[j], pts[i]];
// // // // //     }
// // // // //     const step = Math.max(1, Math.floor(pts.length / count));
// // // // //     const sampled = [];
// // // // //     for (let i = 0; i < pts.length && sampled.length < count; i += step) sampled.push(pts[i]);
// // // // //     while (sampled.length < count) {
// // // // //         sampled.push(pts[Math.floor(Math.random() * pts.length)] ?? { x: 0, y: 0 });
// // // // //     }
// // // // //     return sampled.slice(0, count);
// // // // // }

// // // // // // ─────────────────────────────────────────────────────────────────────────────
// // // // // // HELPER — orbital target positions
// // // // // // ─────────────────────────────────────────────────────────────────────────────
// // // // // function buildOrbitalTargets(count) {
// // // // //     const shapes = [
// // // // //         // Large elliptical ring
// // // // //         ...Array.from({ length: 100 }, (_, i) => {
// // // // //             const a = (i / 100) * Math.PI * 2;
// // // // //             return { x: Math.cos(a) * 24, y: Math.sin(a) * 10, z: Math.sin(a * 2) * 5 };
// // // // //         }),
// // // // //         // Tilted inner ring
// // // // //         ...Array.from({ length: 70 }, (_, i) => {
// // // // //             const a = (i / 70) * Math.PI * 2;
// // // // //             return { x: Math.cos(a) * 16, y: Math.sin(a) * 7, z: Math.cos(a) * 7 };
// // // // //         }),
// // // // //         // Small central ring
// // // // //         ...Array.from({ length: 40 }, (_, i) => {
// // // // //             const a = (i / 40) * Math.PI * 2;
// // // // //             return { x: Math.cos(a) * 8, y: Math.sin(a) * 3, z: Math.sin(a) * 8 };
// // // // //         }),
// // // // //         // Left cluster
// // // // //         ...Array.from({ length: 120 }, () => ({
// // // // //             x: -14 + (Math.random() - 0.5) * 10,
// // // // //             y: 4 + (Math.random() - 0.5) * 12,
// // // // //             z: (Math.random() - 0.5) * 5,
// // // // //         })),
// // // // //         // Right cluster
// // // // //         ...Array.from({ length: 120 }, () => ({
// // // // //             x: 14 + (Math.random() - 0.5) * 10,
// // // // //             y: -2 + (Math.random() - 0.5) * 10,
// // // // //             z: (Math.random() - 0.5) * 5,
// // // // //         })),
// // // // //         // Sparkle cloud
// // // // //         ...Array.from({ length: 80 }, () => ({
// // // // //             x: (Math.random() - 0.5) * 55,
// // // // //             y: (Math.random() - 0.5) * 32,
// // // // //             z: (Math.random() - 0.5) * 14,
// // // // //         })),
// // // // //     ];

// // // // //     const targets = new Float32Array(count * 3);
// // // // //     for (let i = 0; i < count; i++) {
// // // // //         const s = shapes[i % shapes.length];
// // // // //         targets[i * 3] = s.x + (Math.random() - 0.5) * 2.5;
// // // // //         targets[i * 3 + 1] = s.y + (Math.random() - 0.5) * 2.5;
// // // // //         targets[i * 3 + 2] = (s.z ?? 0) + (Math.random() - 0.5) * 1.5;
// // // // //     }
// // // // //     return targets;
// // // // // }

// // // // // // ─────────────────────────────────────────────────────────────────────────────
// // // // // // MAIN COMPONENT
// // // // // // ─────────────────────────────────────────────────────────────────────────────
// // // // // export default function AuraIntro({ onComplete }) {
// // // // //     const canvasRef = useRef(null);
// // // // //     const mouseRef = useRef({ x: 9999, y: 9999 });
// // // // //     const exitingRef = useRef(false);           // ref so animation loop reads current value
// // // // //     const [progress, setProgress] = useState(0);
// // // // //     const [showSkip, setShowSkip] = useState(false);
// // // // //     const [showTagline, setShowTagline] = useState(false);
// // // // //     const [fadeOut, setFadeOut] = useState(false);

// // // // //     const triggerExit = useCallback(() => {
// // // // //         if (exitingRef.current) return;
// // // // //         exitingRef.current = true;
// // // // //         setFadeOut(true);
// // // // //     }, []);

// // // // //     // Show skip button after 800 ms
// // // // //     useEffect(() => {
// // // // //         const t = setTimeout(() => setShowSkip(true), 800);
// // // // //         return () => clearTimeout(t);
// // // // //     }, []);

// // // // //     // Call onComplete after fade-out finishes
// // // // //     useEffect(() => {
// // // // //         if (!fadeOut) return;
// // // // //         const t = setTimeout(() => onComplete?.(), CONFIG.EXIT_DURATION * 1000);
// // // // //         return () => clearTimeout(t);
// // // // //     }, [fadeOut, onComplete]);

// // // // //     // ── Main Three.js effect ─────────────────────────────────────────────────
// // // // //     useEffect(() => {
// // // // //         if (!canvasRef.current) return;
// // // // //         const canvas = canvasRef.current;
// // // // //         const W = window.innerWidth;
// // // // //         const H = window.innerHeight;

// // // // //         // Renderer
// // // // //         const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
// // // // //         renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
// // // // //         renderer.setSize(W, H);
// // // // //         renderer.setClearColor(0x04020e, 1);

// // // // //         const scene = new THREE.Scene();
// // // // //         const camera = new THREE.PerspectiveCamera(60, W / H, 0.1, 1000);
// // // // //         camera.position.set(0, 0, CONFIG.CAMERA_START_Z);

// // // // //         // Particle buffers
// // // // //         const N = CONFIG.PARTICLE_COUNT;
// // // // //         const positions = new Float32Array(N * 3);
// // // // //         const velocities = new Float32Array(N * 3);
// // // // //         const targets = new Float32Array(N * 3);
// // // // //         const colors = new Float32Array(N * 3);
// // // // //         const sizes = new Float32Array(N);
// // // // //         const phaseOffsets = new Float32Array(N);

// // // // //         const palette = CONFIG.PALETTE.map(h => new THREE.Color(h));

// // // // //         for (let i = 0; i < N; i++) {
// // // // //             positions[i * 3] = (Math.random() - 0.5) * 140;
// // // // //             positions[i * 3 + 1] = (Math.random() - 0.5) * 100;
// // // // //             positions[i * 3 + 2] = (Math.random() - 0.5) * 80;
// // // // //             velocities[i * 3] = (Math.random() - 0.5) * 0.30;
// // // // //             velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.30;
// // // // //             velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.10;
// // // // //             const c = palette[Math.floor(Math.random() * palette.length)];
// // // // //             colors[i * 3] = c.r;
// // // // //             colors[i * 3 + 1] = c.g;
// // // // //             colors[i * 3 + 2] = c.b;
// // // // //             sizes[i] = 1.5 + Math.random() * 3.0;
// // // // //             phaseOffsets[i] = Math.random() * Math.PI * 2;
// // // // //         }

// // // // //         const geo = new THREE.BufferGeometry();
// // // // //         geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
// // // // //         geo.setAttribute('aColor', new THREE.BufferAttribute(colors, 3));
// // // // //         geo.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));

// // // // //         const mat = new THREE.ShaderMaterial({
// // // // //             uniforms: {
// // // // //                 uPixelRatio: { value: renderer.getPixelRatio() },
// // // // //             },
// // // // //             vertexShader: VERTEX_SHADER,
// // // // //             fragmentShader: FRAGMENT_SHADER,
// // // // //             transparent: true,
// // // // //             depthWrite: false,
// // // // //             blending: THREE.AdditiveBlending,
// // // // //         });

// // // // //         const points = new THREE.Points(geo, mat);
// // // // //         scene.add(points);

// // // // //         // Precompute orbital targets
// // // // //         const orbitalTargets = buildOrbitalTargets(N);

// // // // //         // State machine
// // // // //         let phase = 'scatter';
// // // // //         let phaseTime = 0;
// // // // //         let totalTime = 0;
// // // // //         let textPts = null;
// // // // //         let cameraTargetZ = CONFIG.CAMERA_START_Z;
// // // // //         let raf;

// // // // //         const TOTAL = CONFIG.SCATTER_DURATION + CONFIG.ORBIT_DURATION
// // // // //             + CONFIG.COLLAPSE_DURATION + CONFIG.TEXT_DURATION;

// // // // //         // Sample text after DOM settles
// // // // //         setTimeout(() => {
// // // // //             textPts = sampleTextParticles('Aura', N, window.innerWidth);
// // // // //         }, 100);

// // // // //         function setTextTargets() {
// // // // //             if (!textPts) return;
// // // // //             for (let i = 0; i < N; i++) {
// // // // //                 const pt = textPts[i % textPts.length];
// // // // //                 targets[i * 3] = pt.x + (Math.random() - 0.5) * 0.6;
// // // // //                 targets[i * 3 + 1] = pt.y + (Math.random() - 0.5) * 0.6;
// // // // //                 targets[i * 3 + 2] = (Math.random() - 0.5) * 1.8;
// // // // //             }
// // // // //         }

// // // // //         let lastT = performance.now();

// // // // //         function tick(now) {
// // // // //             raf = requestAnimationFrame(tick);
// // // // //             const dt = Math.min((now - lastT) / 1000, 0.05);
// // // // //             lastT = now;
// // // // //             totalTime += dt;
// // // // //             phaseTime += dt;

// // // // //             setProgress(Math.min(totalTime / TOTAL, 1));

// // // // //             // ── Phase transitions ──────────────────────────────────────────
// // // // //             if (phase === 'scatter' && phaseTime >= CONFIG.SCATTER_DURATION) {
// // // // //                 phase = 'orbit'; phaseTime = 0;
// // // // //                 cameraTargetZ = CONFIG.CAMERA_ORBIT_Z;
// // // // //             }
// // // // //             if (phase === 'orbit' && phaseTime >= CONFIG.ORBIT_DURATION) {
// // // // //                 phase = 'collapse'; phaseTime = 0;
// // // // //                 setTextTargets();
// // // // //                 cameraTargetZ = CONFIG.CAMERA_TEXT_Z + 6;
// // // // //             }
// // // // //             if (phase === 'collapse' && phaseTime >= CONFIG.COLLAPSE_DURATION) {
// // // // //                 phase = 'text'; phaseTime = 0;
// // // // //                 setShowTagline(true);
// // // // //                 cameraTargetZ = CONFIG.CAMERA_TEXT_Z;
// // // // //             }
// // // // //             if (phase === 'text' && phaseTime >= CONFIG.TEXT_DURATION) {
// // // // //                 if (!exitingRef.current) {
// // // // //                     exitingRef.current = true;
// // // // //                     setFadeOut(true);
// // // // //                 }
// // // // //                 phase = 'exit'; phaseTime = 0;
// // // // //             }

// // // // //             // External skip
// // // // //             if (exitingRef.current && phase !== 'exit') {
// // // // //                 phase = 'exit'; phaseTime = 0;
// // // // //             }

// // // // //             // ── Camera ─────────────────────────────────────────────────────
// // // // //             camera.position.z += (cameraTargetZ - camera.position.z) * 0.028;
// // // // //             const mx = mouseRef.current.x;
// // // // //             const my = mouseRef.current.y;
// // // // //             camera.position.x += (-mx * 2.5 - camera.position.x) * 0.022;
// // // // //             camera.position.y += (my * 1.8 - camera.position.y) * 0.022;

// // // // //             // Mouse → world coords at z = 0 plane
// // // // //             const halfFov = THREE.MathUtils.degToRad(30);
// // // // //             const mwx = mx * camera.position.z * Math.tan(halfFov);
// // // // //             const mwy = my * camera.position.z * Math.tan(halfFov) / (W / H);

// // // // //             // ── Particle update ────────────────────────────────────────────
// // // // //             const posAttr = geo.attributes.position;
// // // // //             const colAttr = geo.attributes.aColor;

// // // // //             for (let i = 0; i < N; i++) {
// // // // //                 const ix = i * 3, iy = i * 3 + 1, iz = i * 3 + 2;
// // // // //                 let px = positions[ix], py = positions[iy], pz = positions[iz];

// // // // //                 if (phase === 'scatter') {
// // // // //                     velocities[ix] *= 0.983; velocities[iy] *= 0.983; velocities[iz] *= 0.983;
// // // // //                     px += velocities[ix]; py += velocities[iy]; pz += velocities[iz];
// // // // //                     px -= px * 0.006; py -= py * 0.006;
// // // // //                     if (px > 85) px = -85; if (px < -85) px = 85;
// // // // //                     if (py > 65) py = -65; if (py < -65) py = 65;

// // // // //                 } else if (phase === 'orbit') {
// // // // //                     const ox = orbitalTargets[ix];
// // // // //                     const oy = orbitalTargets[iy];
// // // // //                     const oz = orbitalTargets[iz];
// // // // //                     // Rotate the orbital target around Y axis
// // // // //                     const angle = totalTime * 0.16;
// // // // //                     const cosA = Math.cos(angle);
// // // // //                     const sinA = Math.sin(angle);
// // // // //                     const rotX = ox * cosA - oz * sinA;
// // // // //                     const rotZ = ox * sinA + oz * cosA;
// // // // //                     const wave = Math.sin(totalTime * 0.85 + phaseOffsets[i]) * 0.9;
// // // // //                     px += (rotX + wave * 0.2 - px) * 0.05;
// // // // //                     py += (oy + Math.sin(totalTime * 0.65 + phaseOffsets[i]) * 0.7 - py) * 0.05;
// // // // //                     pz += (rotZ - pz) * 0.05;

// // // // //                 } else if (phase === 'collapse') {
// // // // //                     px += (targets[ix] - px) * 0.075;
// // // // //                     py += (targets[iy] - py) * 0.075;
// // // // //                     pz += (targets[iz] - pz) * 0.075;

// // // // //                 } else if (phase === 'text') {
// // // // //                     const dx = px - mwx, dy = py - mwy;
// // // // //                     const dist = Math.sqrt(dx * dx + dy * dy);
// // // // //                     if (dist < CONFIG.REPEL_RADIUS && dist > 0.01) {
// // // // //                         const f = ((CONFIG.REPEL_RADIUS - dist) / CONFIG.REPEL_RADIUS) ** 2;
// // // // //                         px += (dx / dist) * f * CONFIG.REPEL_STRENGTH;
// // // // //                         py += (dy / dist) * f * CONFIG.REPEL_STRENGTH;
// // // // //                         pz += Math.sin(totalTime * 3 + phaseOffsets[i]) * f * 0.8;
// // // // //                     }
// // // // //                     const ease = dist < CONFIG.REPEL_RADIUS ? 0.016 : 0.032;
// // // // //                     px += (targets[ix] - px) * ease;
// // // // //                     py += (targets[iy] - py) * ease;
// // // // //                     pz += (targets[iz] - pz) * ease;
// // // // //                     // Subtle shimmer
// // // // //                     px += Math.sin(totalTime * 2.2 + phaseOffsets[i]) * 0.014;
// // // // //                     py += Math.cos(totalTime * 1.9 + phaseOffsets[i]) * 0.014;

// // // // //                 } else if (phase === 'exit') {
// // // // //                     const angle = i * 2.39996; // golden angle in radians
// // // // //                     const speed = phaseTime * 28;
// // // // //                     px += Math.cos(angle) * speed * dt;
// // // // //                     py += Math.sin(angle) * speed * dt;
// // // // //                     pz += Math.sin(angle * 1.618) * speed * 0.5 * dt;
// // // // //                 }

// // // // //                 positions[ix] = px; positions[iy] = py; positions[iz] = pz;
// // // // //                 posAttr.array[ix] = px; posAttr.array[iy] = py; posAttr.array[iz] = pz;

// // // // //                 // Color pulsing during collapse + text
// // // // //                 if (phase === 'text' || phase === 'collapse') {
// // // // //                     const t = (Math.sin(totalTime * 1.7 + phaseOffsets[i]) + 1) * 0.5;
// // // // //                     const c1 = palette[i % palette.length];
// // // // //                     const c2 = palette[(i + 2) % palette.length];
// // // // //                     colAttr.array[ix] = c1.r + (c2.r - c1.r) * t * 0.4;
// // // // //                     colAttr.array[iy] = c1.g + (c2.g - c1.g) * t * 0.4;
// // // // //                     colAttr.array[iz] = c1.b + (c2.b - c1.b) * t * 0.4;
// // // // //                 }
// // // // //             }

// // // // //             posAttr.needsUpdate = true;
// // // // //             if (phase === 'text' || phase === 'collapse') colAttr.needsUpdate = true;

// // // // //             renderer.render(scene, camera);
// // // // //         }

// // // // //         raf = requestAnimationFrame(tick);

// // // // //         const onResize = () => {
// // // // //             const w = window.innerWidth, h = window.innerHeight;
// // // // //             camera.aspect = w / h;
// // // // //             camera.updateProjectionMatrix();
// // // // //             renderer.setSize(w, h);
// // // // //         };
// // // // //         window.addEventListener('resize', onResize);

// // // // //         return () => {
// // // // //             cancelAnimationFrame(raf);
// // // // //             window.removeEventListener('resize', onResize);
// // // // //             renderer.dispose();
// // // // //             geo.dispose();
// // // // //             mat.dispose();
// // // // //         };
// // // // //         // eslint-disable-next-line react-hooks/exhaustive-deps
// // // // //     }, []);

// // // // //     // Mouse tracking
// // // // //     useEffect(() => {
// // // // //         const onMove = e => {
// // // // //             mouseRef.current.x = (e.clientX / window.innerWidth) * 2 - 1;
// // // // //             mouseRef.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
// // // // //         };
// // // // //         const onTouch = e => {
// // // // //             const t = e.touches[0];
// // // // //             mouseRef.current.x = (t.clientX / window.innerWidth) * 2 - 1;
// // // // //             mouseRef.current.y = -(t.clientY / window.innerHeight) * 2 + 1;
// // // // //         };
// // // // //         window.addEventListener('mousemove', onMove);
// // // // //         window.addEventListener('touchmove', onTouch, { passive: true });
// // // // //         return () => {
// // // // //             window.removeEventListener('mousemove', onMove);
// // // // //             window.removeEventListener('touchmove', onTouch);
// // // // //         };
// // // // //     }, []);

// // // // //     // ── JSX ────────────────────────────────────────────────────────────────────
// // // // //     return (
// // // // //         <div style={{
// // // // //             position: 'fixed', inset: 0, zIndex: 9999,
// // // // //             background: '#04020e',
// // // // //             opacity: fadeOut ? 0 : 1,
// // // // //             transition: fadeOut ? `opacity ${CONFIG.EXIT_DURATION}s ease-in` : 'none',
// // // // //             pointerEvents: fadeOut ? 'none' : 'all',
// // // // //         }}>
// // // // //             {/* Three.js canvas */}
// // // // //             <canvas
// // // // //                 ref={canvasRef}
// // // // //                 style={{ display: 'block', width: '100%', height: '100%' }}
// // // // //             />

// // // // //             {/* Tagline */}
// // // // //             <div style={{
// // // // //                 position: 'absolute', top: '50%', left: '50%',
// // // // //                 transform: 'translate(-50%, calc(-50% + 64px))',
// // // // //                 fontFamily: 'Georgia, serif',
// // // // //                 fontSize: 'clamp(11px, 1.5vw, 15px)',
// // // // //                 letterSpacing: '0.30em',
// // // // //                 textTransform: 'uppercase',
// // // // //                 color: 'rgba(180, 160, 255, 0.75)',
// // // // //                 opacity: showTagline ? 1 : 0,
// // // // //                 transition: 'opacity 1.4s ease',
// // // // //                 whiteSpace: 'nowrap',
// // // // //                 userSelect: 'none',
// // // // //                 pointerEvents: 'none',
// // // // //             }}>
// // // // //                 Where aesthetics meet soul
// // // // //             </div>

// // // // //             {/* Bottom UI */}
// // // // //             <div style={{
// // // // //                 position: 'absolute', bottom: 0, left: 0, right: 0,
// // // // //                 display: 'flex', flexDirection: 'column', alignItems: 'center',
// // // // //                 paddingBottom: '48px', gap: '20px',
// // // // //                 pointerEvents: 'none',
// // // // //             }}>
// // // // //                 {/* Progress bar */}
// // // // //                 <div style={{
// // // // //                     width: '120px', height: '1px',
// // // // //                     background: 'rgba(255,255,255,0.08)',
// // // // //                     overflow: 'hidden',
// // // // //                     opacity: showSkip ? 1 : 0,
// // // // //                     transition: 'opacity 0.8s',
// // // // //                 }}>
// // // // //                     <div style={{
// // // // //                         height: '100%',
// // // // //                         width: `${progress * 100}%`,
// // // // //                         background: 'linear-gradient(90deg, #7b68ee, #c084fc)',
// // // // //                         transition: 'width 0.12s linear',
// // // // //                     }} />
// // // // //                 </div>

// // // // //                 {/* Skip button */}
// // // // //                 <button
// // // // //                     onClick={triggerExit}
// // // // //                     style={{
// // // // //                         pointerEvents: showSkip ? 'all' : 'none',
// // // // //                         cursor: 'pointer',
// // // // //                         background: 'rgba(255,255,255,0.05)',
// // // // //                         border: '1px solid rgba(255,255,255,0.16)',
// // // // //                         color: 'rgba(255,255,255,0.6)',
// // // // //                         fontFamily: 'sans-serif',
// // // // //                         fontSize: '11px',
// // // // //                         letterSpacing: '0.16em',
// // // // //                         textTransform: 'uppercase',
// // // // //                         padding: '10px 32px',
// // // // //                         backdropFilter: 'blur(12px)',
// // // // //                         borderRadius: '2px',
// // // // //                         opacity: showSkip ? 1 : 0,
// // // // //                         transition: 'opacity 0.8s, background 0.2s, color 0.2s',
// // // // //                     }}
// // // // //                     onMouseEnter={e => {
// // // // //                         e.currentTarget.style.background = 'rgba(255,255,255,0.13)';
// // // // //                         e.currentTarget.style.color = '#fff';
// // // // //                     }}
// // // // //                     onMouseLeave={e => {
// // // // //                         e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
// // // // //                         e.currentTarget.style.color = 'rgba(255,255,255,0.6)';
// // // // //                     }}
// // // // //                 >
// // // // //                     Skip intro
// // // // //                 </button>
// // // // //             </div>

// // // // //             {/* Corner branding */}
// // // // //             <div style={{
// // // // //                 position: 'absolute', top: '32px', left: '40px',
// // // // //                 fontFamily: 'Georgia, serif',
// // // // //                 fontSize: '22px',
// // // // //                 letterSpacing: '0.18em',
// // // // //                 color: 'rgba(255,255,255,0.10)',
// // // // //                 userSelect: 'none',
// // // // //                 pointerEvents: 'none',
// // // // //             }}>
// // // // //                 AURA
// // // // //             </div>
// // // // //         </div>
// // // // //     );
// // // // // }

// // // // // // ─────────────────────────────────────────────────────────────────────────────
// // // // // // GATE WRAPPER
// // // // // // ─────────────────────────────────────────────────────────────────────────────
// // // // // let _introSeen = false;

// // // // // export function AuraIntroGate({ children }) {
// // // // //     const [done, setDone] = useState(_introSeen);

// // // // //     const handleComplete = useCallback(() => {
// // // // //         _introSeen = true;
// // // // //         setDone(true);
// // // // //     }, []);

// // // // //     if (done) return children;

// // // // //     return (
// // // // //         <>
// // // // //             <AuraIntro onComplete={handleComplete} />
// // // // //             {/* Pre-hydrate children invisibly */}
// // // // //             <div style={{ visibility: 'hidden', position: 'absolute', inset: 0, pointerEvents: 'none' }}>
// // // // //                 {children}
// // // // //             </div>
// // // // //         </>
// // // // //     );
// // // // // }


// // // // // AuraIntro.jsx — Enhanced, color-corrected, tagline-in-orbit
// // // // // DEPENDENCIES: npm install three
// // // // //
// // // // // USAGE:
// // // // //   import { AuraIntroGate } from './AuraIntro';
// // // // //   <AuraIntroGate><Home /></AuraIntroGate>

// // // // import { useEffect, useRef, useState, useCallback } from 'react';
// // // // import * as THREE from 'three';

// // // // // ─────────────────────────────────────────────────────────────────────────────
// // // // // CONFIG
// // // // // ─────────────────────────────────────────────────────────────────────────────
// // // // const CONFIG = {
// // // //     PARTICLE_COUNT: 2800,
// // // //     SCATTER_DURATION: 1.4,
// // // //     ORBIT_DURATION: 4.5,   // slightly longer so tagline reads cleanly in ring
// // // //     COLLAPSE_DURATION: 1.8,
// // // //     TEXT_DURATION: 9.0,
// // // //     EXIT_DURATION: 2.0,
// // // //     REPEL_RADIUS: 10,
// // // //     REPEL_STRENGTH: 8,
// // // //     CAMERA_START_Z: 58,
// // // //     CAMERA_ORBIT_Z: 48,
// // // //     CAMERA_TEXT_Z: 36,
// // // //     PALETTE: [
// // // //         0x7b68ee, // indigo
// // // //         0xc084fc, // violet
// // // //         0x818cf8, // lavender
// // // //         0xe879f9, // fuchsia
// // // //         0xa78bfa, // purple
// // // //         0x60a5fa, // blue accent
// // // //     ],
// // // // };

// // // // // ─────────────────────────────────────────────────────────────────────────────
// // // // // SHADERS
// // // // // Core fix: multiply vColor by a brightness factor instead of adding white vec3.
// // // // // This keeps the particle's own hue saturated — no blowout to white.
// // // // // ─────────────────────────────────────────────────────────────────────────────
// // // // const VERTEX_SHADER = /* glsl */`
// // // //   attribute float aSize;
// // // //   attribute vec3  aColor;
// // // //   varying   vec3  vColor;
// // // //   varying   float vDist;
// // // //   uniform   float uPixelRatio;

// // // //   void main() {
// // // //     vColor = aColor;
// // // //     vec4 mv = modelViewMatrix * vec4(position, 1.0);
// // // //     vDist   = -mv.z;
// // // //     float s = aSize * uPixelRatio * (300.0 / max(vDist, 1.0));
// // // //     gl_PointSize = clamp(s, 1.0, 16.0);
// // // //     gl_Position  = projectionMatrix * mv;
// // // //   }
// // // // `;

// // // // const FRAGMENT_SHADER = /* glsl */`
// // // //   varying vec3  vColor;
// // // //   varying float vDist;

// // // //   void main() {
// // // //     vec2  uv = gl_PointCoord - 0.5;
// // // //     float d  = length(uv);
// // // //     if (d > 0.5) discard;

// // // //     // Three layers — keep alpha controlled so additive blending stays colored
// // // //     float core = 1.0 - smoothstep(0.0,  0.18, d);
// // // //     float mid  = 1.0 - smoothstep(0.12, 0.36, d);
// // // //     float glow = 1.0 - smoothstep(0.28, 0.50, d);

// // // //     float a = core * 0.82 + mid * 0.32 + glow * 0.12;
// // // //     a *= smoothstep(130.0, 16.0, vDist);

// // // //     // Brighten toward own hue — multiply, not add white
// // // //     vec3 col = vColor * (1.0 + core * 0.60 + mid * 0.20);

// // // //     gl_FragColor = vec4(col, clamp(a, 0.0, 1.0));
// // // //   }
// // // // `;

// // // // // ─────────────────────────────────────────────────────────────────────────────
// // // // // HELPER — sample text pixels into Three.js world coords
// // // // // ─────────────────────────────────────────────────────────────────────────────
// // // // function sampleTextParticles(text, count, containerWidth) {
// // // //     const offCanvas = document.createElement('canvas');
// // // //     const fontSize = Math.floor(Math.min(containerWidth, 900) * 0.19);
// // // //     offCanvas.width = Math.min(containerWidth, 900);
// // // //     offCanvas.height = Math.round(fontSize * 1.6);
// // // //     const ctx = offCanvas.getContext('2d');
// // // //     ctx.clearRect(0, 0, offCanvas.width, offCanvas.height);
// // // //     ctx.fillStyle = '#fff';
// // // //     ctx.font = `bold ${fontSize}px Georgia, serif`;
// // // //     ctx.textAlign = 'center';
// // // //     ctx.textBaseline = 'middle';
// // // //     ctx.fillText(text, offCanvas.width / 2, offCanvas.height / 2);

// // // //     const imgData = ctx.getImageData(0, 0, offCanvas.width, offCanvas.height);
// // // //     const pts = [];
// // // //     for (let y = 0; y < offCanvas.height; y += 2) {
// // // //         for (let x = 0; x < offCanvas.width; x += 2) {
// // // //             if (imgData.data[(y * offCanvas.width + x) * 4 + 3] > 120) {
// // // //                 pts.push({
// // // //                     x: ((x / offCanvas.width) - 0.5) * 58,
// // // //                     y: -((y / offCanvas.height) - 0.5) * 20,
// // // //                 });
// // // //             }
// // // //         }
// // // //     }
// // // //     for (let i = pts.length - 1; i > 0; i--) {
// // // //         const j = Math.floor(Math.random() * (i + 1));
// // // //         [pts[i], pts[j]] = [pts[j], pts[i]];
// // // //     }
// // // //     const step = Math.max(1, Math.floor(pts.length / count));
// // // //     const sampled = [];
// // // //     for (let i = 0; i < pts.length && sampled.length < count; i += step) sampled.push(pts[i]);
// // // //     while (sampled.length < count)
// // // //         sampled.push(pts[Math.floor(Math.random() * pts.length)] ?? { x: 0, y: 0 });
// // // //     return sampled.slice(0, count);
// // // // }

// // // // // ─────────────────────────────────────────────────────────────────────────────
// // // // // HELPER — orbital target positions
// // // // // ─────────────────────────────────────────────────────────────────────────────
// // // // function buildOrbitalTargets(count) {
// // // //     const shapes = [
// // // //         ...Array.from({ length: 110 }, (_, i) => {
// // // //             const a = (i / 110) * Math.PI * 2;
// // // //             return { x: Math.cos(a) * 24, y: Math.sin(a) * 10, z: Math.sin(a * 2) * 5 };
// // // //         }),
// // // //         ...Array.from({ length: 70 }, (_, i) => {
// // // //             const a = (i / 70) * Math.PI * 2;
// // // //             return { x: Math.cos(a) * 16, y: Math.sin(a) * 7, z: Math.cos(a) * 7 };
// // // //         }),
// // // //         ...Array.from({ length: 40 }, (_, i) => {
// // // //             const a = (i / 40) * Math.PI * 2;
// // // //             return { x: Math.cos(a) * 8, y: Math.sin(a) * 3, z: Math.sin(a) * 8 };
// // // //         }),
// // // //         ...Array.from({ length: 120 }, () => ({
// // // //             x: -14 + (Math.random() - 0.5) * 10,
// // // //             y: 4 + (Math.random() - 0.5) * 12,
// // // //             z: (Math.random() - 0.5) * 5,
// // // //         })),
// // // //         ...Array.from({ length: 120 }, () => ({
// // // //             x: 14 + (Math.random() - 0.5) * 10,
// // // //             y: -2 + (Math.random() - 0.5) * 10,
// // // //             z: (Math.random() - 0.5) * 5,
// // // //         })),
// // // //         ...Array.from({ length: 80 }, () => ({
// // // //             x: (Math.random() - 0.5) * 55,
// // // //             y: (Math.random() - 0.5) * 32,
// // // //             z: (Math.random() - 0.5) * 14,
// // // //         })),
// // // //     ];

// // // //     const targets = new Float32Array(count * 3);
// // // //     for (let i = 0; i < count; i++) {
// // // //         const s = shapes[i % shapes.length];
// // // //         targets[i * 3] = s.x + (Math.random() - 0.5) * 2.5;
// // // //         targets[i * 3 + 1] = s.y + (Math.random() - 0.5) * 2.5;
// // // //         targets[i * 3 + 2] = (s.z ?? 0) + (Math.random() - 0.5) * 1.5;
// // // //     }
// // // //     return targets;
// // // // }

// // // // // ─────────────────────────────────────────────────────────────────────────────
// // // // // MAIN COMPONENT
// // // // // ─────────────────────────────────────────────────────────────────────────────
// // // // export default function AuraIntro({ onComplete }) {
// // // //     const canvasRef = useRef(null);
// // // //     const mouseRef = useRef({ x: 9999, y: 9999 });
// // // //     const exitingRef = useRef(false);

// // // //     const [progress, setProgress] = useState(0);
// // // //     const [showSkip, setShowSkip] = useState(false);
// // // //     // 'hidden' | 'orbit' | 'below' | 'out'
// // // //     const [taglinePhase, setTaglinePhase] = useState('hidden');
// // // //     const [fadeOut, setFadeOut] = useState(false);

// // // //     const triggerExit = useCallback(() => {
// // // //         if (exitingRef.current) return;
// // // //         exitingRef.current = true;
// // // //         setFadeOut(true);
// // // //         setTaglinePhase('out');
// // // //     }, []);

// // // //     useEffect(() => {
// // // //         const t = setTimeout(() => setShowSkip(true), 800);
// // // //         return () => clearTimeout(t);
// // // //     }, []);

// // // //     useEffect(() => {
// // // //         if (!fadeOut) return;
// // // //         const t = setTimeout(() => onComplete?.(), CONFIG.EXIT_DURATION * 1000);
// // // //         return () => clearTimeout(t);
// // // //     }, [fadeOut, onComplete]);

// // // //     // ── Main Three.js loop ──────────────────────────────────────────────────────
// // // //     useEffect(() => {
// // // //         if (!canvasRef.current) return;
// // // //         const canvas = canvasRef.current;
// // // //         const W = window.innerWidth;
// // // //         const H = window.innerHeight;

// // // //         const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
// // // //         renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
// // // //         renderer.setSize(W, H);
// // // //         renderer.setClearColor(0x04020e, 1);

// // // //         const scene = new THREE.Scene();
// // // //         const camera = new THREE.PerspectiveCamera(60, W / H, 0.1, 1000);
// // // //         camera.position.set(0, 0, CONFIG.CAMERA_START_Z);

// // // //         const N = CONFIG.PARTICLE_COUNT;
// // // //         const positions = new Float32Array(N * 3);
// // // //         const velocities = new Float32Array(N * 3);
// // // //         const targets = new Float32Array(N * 3);
// // // //         const colors = new Float32Array(N * 3);
// // // //         const sizes = new Float32Array(N);
// // // //         const phaseOffsets = new Float32Array(N);

// // // //         const palette = CONFIG.PALETTE.map(h => new THREE.Color(h));

// // // //         for (let i = 0; i < N; i++) {
// // // //             positions[i * 3] = (Math.random() - 0.5) * 140;
// // // //             positions[i * 3 + 1] = (Math.random() - 0.5) * 100;
// // // //             positions[i * 3 + 2] = (Math.random() - 0.5) * 80;
// // // //             velocities[i * 3] = (Math.random() - 0.5) * 0.30;
// // // //             velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.30;
// // // //             velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.10;
// // // //             const c = palette[Math.floor(Math.random() * palette.length)];
// // // //             colors[i * 3] = c.r; colors[i * 3 + 1] = c.g; colors[i * 3 + 2] = c.b;
// // // //             sizes[i] = 1.4 + Math.random() * 2.8;
// // // //             phaseOffsets[i] = Math.random() * Math.PI * 2;
// // // //         }

// // // //         const geo = new THREE.BufferGeometry();
// // // //         geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
// // // //         geo.setAttribute('aColor', new THREE.BufferAttribute(colors, 3));
// // // //         geo.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));

// // // //         const mat = new THREE.ShaderMaterial({
// // // //             uniforms: { uPixelRatio: { value: renderer.getPixelRatio() } },
// // // //             vertexShader: VERTEX_SHADER,
// // // //             fragmentShader: FRAGMENT_SHADER,
// // // //             transparent: true,
// // // //             depthWrite: false,
// // // //             blending: THREE.AdditiveBlending,
// // // //         });

// // // //         scene.add(new THREE.Points(geo, mat));

// // // //         const orbitalTargets = buildOrbitalTargets(N);

// // // //         let phase = 'scatter';
// // // //         let phaseTime = 0;
// // // //         let totalTime = 0;
// // // //         let textPts = null;
// // // //         let cameraTargetZ = CONFIG.CAMERA_START_Z;
// // // //         let raf;

// // // //         const TOTAL = CONFIG.SCATTER_DURATION + CONFIG.ORBIT_DURATION
// // // //             + CONFIG.COLLAPSE_DURATION + CONFIG.TEXT_DURATION;

// // // //         setTimeout(() => { textPts = sampleTextParticles('Aura', N, window.innerWidth); }, 100);

// // // //         function setTextTargets() {
// // // //             if (!textPts) return;
// // // //             for (let i = 0; i < N; i++) {
// // // //                 const pt = textPts[i % textPts.length];
// // // //                 targets[i * 3] = pt.x + (Math.random() - 0.5) * 0.6;
// // // //                 targets[i * 3 + 1] = pt.y + (Math.random() - 0.5) * 0.6;
// // // //                 targets[i * 3 + 2] = (Math.random() - 0.5) * 1.8;
// // // //             }
// // // //         }

// // // //         let lastT = performance.now();

// // // //         function tick(now) {
// // // //             raf = requestAnimationFrame(tick);
// // // //             const dt = Math.min((now - lastT) / 1000, 0.05);
// // // //             lastT = now;
// // // //             totalTime += dt;
// // // //             phaseTime += dt;

// // // //             setProgress(Math.min(totalTime / TOTAL, 1));

// // // //             // Phase transitions
// // // //             if (phase === 'scatter' && phaseTime >= CONFIG.SCATTER_DURATION) {
// // // //                 phase = 'orbit'; phaseTime = 0;
// // // //                 cameraTargetZ = CONFIG.CAMERA_ORBIT_Z;
// // // //                 setTaglinePhase('orbit');        // ← tagline appears inside ring
// // // //             }
// // // //             if (phase === 'orbit' && phaseTime >= CONFIG.ORBIT_DURATION) {
// // // //                 phase = 'collapse'; phaseTime = 0;
// // // //                 setTextTargets();
// // // //                 cameraTargetZ = CONFIG.CAMERA_TEXT_Z + 6;
// // // //                 setTaglinePhase('hidden');       // ← hide while particles collapse
// // // //             }
// // // //             if (phase === 'collapse' && phaseTime >= CONFIG.COLLAPSE_DURATION) {
// // // //                 phase = 'text'; phaseTime = 0;
// // // //                 cameraTargetZ = CONFIG.CAMERA_TEXT_Z;
// // // //                 setTaglinePhase('below');        // ← reappear well below particle text
// // // //             }
// // // //             if (phase === 'text' && phaseTime >= CONFIG.TEXT_DURATION) {
// // // //                 if (!exitingRef.current) {
// // // //                     exitingRef.current = true;
// // // //                     setFadeOut(true);
// // // //                     setTaglinePhase('out');
// // // //                 }
// // // //                 phase = 'exit'; phaseTime = 0;
// // // //             }
// // // //             if (exitingRef.current && phase !== 'exit') {
// // // //                 phase = 'exit'; phaseTime = 0;
// // // //             }

// // // //             // Camera
// // // //             camera.position.z += (cameraTargetZ - camera.position.z) * 0.028;
// // // //             const mx = mouseRef.current.x;
// // // //             const my = mouseRef.current.y;
// // // //             camera.position.x += (-mx * 2.5 - camera.position.x) * 0.022;
// // // //             camera.position.y += (my * 1.8 - camera.position.y) * 0.022;

// // // //             const halfFov = THREE.MathUtils.degToRad(30);
// // // //             const mwx = mx * camera.position.z * Math.tan(halfFov);
// // // //             const mwy = my * camera.position.z * Math.tan(halfFov) / (W / H);

// // // //             // Particle update
// // // //             const posAttr = geo.attributes.position;
// // // //             const colAttr = geo.attributes.aColor;

// // // //             for (let i = 0; i < N; i++) {
// // // //                 const ix = i * 3, iy = i * 3 + 1, iz = i * 3 + 2;
// // // //                 let px = positions[ix], py = positions[iy], pz = positions[iz];

// // // //                 if (phase === 'scatter') {
// // // //                     velocities[ix] *= 0.983; velocities[iy] *= 0.983; velocities[iz] *= 0.983;
// // // //                     px += velocities[ix]; py += velocities[iy]; pz += velocities[iz];
// // // //                     px -= px * 0.006; py -= py * 0.006;
// // // //                     if (px > 85) px = -85; if (px < -85) px = 85;
// // // //                     if (py > 65) py = -65; if (py < -65) py = 65;

// // // //                 } else if (phase === 'orbit') {
// // // //                     const ox = orbitalTargets[ix];
// // // //                     const oy = orbitalTargets[iy];
// // // //                     const oz = orbitalTargets[iz];
// // // //                     const angle = totalTime * 0.16;
// // // //                     const cosA = Math.cos(angle);
// // // //                     const sinA = Math.sin(angle);
// // // //                     const rotX = ox * cosA - oz * sinA;
// // // //                     const rotZ = ox * sinA + oz * cosA;
// // // //                     const wave = Math.sin(totalTime * 0.85 + phaseOffsets[i]) * 0.9;
// // // //                     px += (rotX + wave * 0.2 - px) * 0.05;
// // // //                     py += (oy + Math.sin(totalTime * 0.65 + phaseOffsets[i]) * 0.7 - py) * 0.05;
// // // //                     pz += (rotZ - pz) * 0.05;

// // // //                 } else if (phase === 'collapse') {
// // // //                     px += (targets[ix] - px) * 0.075;
// // // //                     py += (targets[iy] - py) * 0.075;
// // // //                     pz += (targets[iz] - pz) * 0.075;

// // // //                 } else if (phase === 'text') {
// // // //                     const dx = px - mwx, dy = py - mwy;
// // // //                     const dist = Math.sqrt(dx * dx + dy * dy);
// // // //                     if (dist < CONFIG.REPEL_RADIUS && dist > 0.01) {
// // // //                         const f = ((CONFIG.REPEL_RADIUS - dist) / CONFIG.REPEL_RADIUS) ** 2;
// // // //                         px += (dx / dist) * f * CONFIG.REPEL_STRENGTH;
// // // //                         py += (dy / dist) * f * CONFIG.REPEL_STRENGTH;
// // // //                         pz += Math.sin(totalTime * 3 + phaseOffsets[i]) * f * 0.8;
// // // //                     }
// // // //                     const ease = dist < CONFIG.REPEL_RADIUS ? 0.016 : 0.032;
// // // //                     px += (targets[ix] - px) * ease;
// // // //                     py += (targets[iy] - py) * ease;
// // // //                     pz += (targets[iz] - pz) * ease;
// // // //                     px += Math.sin(totalTime * 2.2 + phaseOffsets[i]) * 0.013;
// // // //                     py += Math.cos(totalTime * 1.9 + phaseOffsets[i]) * 0.013;

// // // //                 } else if (phase === 'exit') {
// // // //                     const angle = i * 2.39996;
// // // //                     const speed = phaseTime * 28;
// // // //                     px += Math.cos(angle) * speed * dt;
// // // //                     py += Math.sin(angle) * speed * dt;
// // // //                     pz += Math.sin(angle * 1.618) * speed * 0.5 * dt;
// // // //                 }

// // // //                 positions[ix] = px; positions[iy] = py; positions[iz] = pz;
// // // //                 posAttr.array[ix] = px; posAttr.array[iy] = py; posAttr.array[iz] = pz;

// // // //                 // Color pulsing — interpolate between palette hues only, no white
// // // //                 if (phase === 'text' || phase === 'collapse') {
// // // //                     const t = (Math.sin(totalTime * 1.7 + phaseOffsets[i]) + 1) * 0.5;
// // // //                     const c1 = palette[i % palette.length];
// // // //                     const c2 = palette[(i + 2) % palette.length];
// // // //                     colAttr.array[ix] = Math.min(c1.r + (c2.r - c1.r) * t * 0.5, 0.90);
// // // //                     colAttr.array[iy] = Math.min(c1.g + (c2.g - c1.g) * t * 0.5, 0.90);
// // // //                     colAttr.array[iz] = Math.min(c1.b + (c2.b - c1.b) * t * 0.5, 0.90);
// // // //                 }
// // // //             }

// // // //             posAttr.needsUpdate = true;
// // // //             if (phase === 'text' || phase === 'collapse') colAttr.needsUpdate = true;

// // // //             renderer.render(scene, camera);
// // // //         }

// // // //         raf = requestAnimationFrame(tick);

// // // //         const onResize = () => {
// // // //             const w = window.innerWidth, h = window.innerHeight;
// // // //             camera.aspect = w / h;
// // // //             camera.updateProjectionMatrix();
// // // //             renderer.setSize(w, h);
// // // //         };
// // // //         window.addEventListener('resize', onResize);

// // // //         return () => {
// // // //             cancelAnimationFrame(raf);
// // // //             window.removeEventListener('resize', onResize);
// // // //             renderer.dispose();
// // // //             geo.dispose();
// // // //             mat.dispose();
// // // //         };
// // // //         // eslint-disable-next-line react-hooks/exhaustive-deps
// // // //     }, []);

// // // //     // Mouse tracking
// // // //     useEffect(() => {
// // // //         const onMove = e => {
// // // //             mouseRef.current.x = (e.clientX / window.innerWidth) * 2 - 1;
// // // //             mouseRef.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
// // // //         };
// // // //         const onTouch = e => {
// // // //             const t = e.touches[0];
// // // //             mouseRef.current.x = (t.clientX / window.innerWidth) * 2 - 1;
// // // //             mouseRef.current.y = -(t.clientY / window.innerHeight) * 2 + 1;
// // // //         };
// // // //         window.addEventListener('mousemove', onMove);
// // // //         window.addEventListener('touchmove', onTouch, { passive: true });
// // // //         return () => {
// // // //             window.removeEventListener('mousemove', onMove);
// // // //             window.removeEventListener('touchmove', onTouch);
// // // //         };
// // // //     }, []);

// // // //     // ── Tagline style — changes per phase ──────────────────────────────────────
// // // //     // orbit: centered inside the rotating ring, small italic
// // // //     // below: positioned below the particle text with safe vertical gap
// // // //     const taglineVisible = taglinePhase === 'orbit' || taglinePhase === 'below';

// // // //     const taglineBase = {
// // // //         position: 'absolute',
// // // //         left: '50%',
// // // //         fontFamily: 'Georgia, serif',
// // // //         textTransform: 'uppercase',
// // // //         whiteSpace: 'nowrap',
// // // //         userSelect: 'none',
// // // //         pointerEvents: 'none',
// // // //         opacity: taglineVisible ? 1 : 0,
// // // //         transition: 'opacity 1.1s ease, top 0.9s ease, font-size 0.6s ease, letter-spacing 0.6s ease',
// // // //     };

// // // //     const taglineStyle = taglinePhase === 'orbit'
// // // //         ? {
// // // //             ...taglineBase,
// // // //             // Sit inside the ring — center of screen, vertically centered
// // // //             top: '50%',
// // // //             transform: 'translate(-50%, -50%)',
// // // //             fontSize: 'clamp(9px, 1.0vw, 12px)',
// // // //             letterSpacing: '0.28em',
// // // //             color: 'rgba(210, 190, 255, 0.65)',
// // // //             fontStyle: 'italic',
// // // //         }
// // // //         : taglinePhase === 'below'
// // // //             ? {
// // // //                 ...taglineBase,
// // // //                 // Below the "Aura" particle text.
// // // //                 // Particles sit near vertical center; push tagline 115–130px below.
// // // //                 top: 'calc(50% + 120px)',
// // // //                 transform: 'translateX(-50%)',
// // // //                 fontSize: 'clamp(10px, 1.2vw, 13px)',
// // // //                 letterSpacing: '0.32em',
// // // //                 color: 'rgba(180, 160, 255, 0.68)',
// // // //                 fontStyle: 'normal',
// // // //             }
// // // //             : {
// // // //                 // hidden / out — invisible, keep in DOM for smooth fade
// // // //                 ...taglineBase,
// // // //                 top: '50%',
// // // //                 transform: 'translate(-50%, -50%)',
// // // //                 fontSize: 'clamp(10px, 1.2vw, 13px)',
// // // //                 letterSpacing: '0.28em',
// // // //                 color: 'rgba(180, 160, 255, 0)',
// // // //             };

// // // //     // ── JSX ────────────────────────────────────────────────────────────────────
// // // //     return (
// // // //         <div style={{
// // // //             position: 'fixed',
// // // //             inset: 0,
// // // //             zIndex: 9999,
// // // //             background: '#04020e',
// // // //             opacity: fadeOut ? 0 : 1,
// // // //             transition: fadeOut ? `opacity ${CONFIG.EXIT_DURATION}s ease-in` : 'none',
// // // //             pointerEvents: fadeOut ? 'none' : 'all',
// // // //         }}>
// // // //             <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />

// // // //             {/* Tagline — floats in ring during orbit, moves below text during text phase */}
// // // //             <div style={taglineStyle}>
// // // //                 Where aesthetics meet soul
// // // //             </div>

// // // //             {/* Bottom UI */}
// // // //             <div style={{
// // // //                 position: 'absolute',
// // // //                 bottom: 0, left: 0, right: 0,
// // // //                 display: 'flex',
// // // //                 flexDirection: 'column',
// // // //                 alignItems: 'center',
// // // //                 paddingBottom: '48px',
// // // //                 gap: '20px',
// // // //                 pointerEvents: 'none',
// // // //             }}>
// // // //                 <div style={{
// // // //                     width: '120px',
// // // //                     height: '1px',
// // // //                     background: 'rgba(255,255,255,0.08)',
// // // //                     overflow: 'hidden',
// // // //                     opacity: showSkip ? 1 : 0,
// // // //                     transition: 'opacity 0.8s',
// // // //                 }}>
// // // //                     <div style={{
// // // //                         height: '100%',
// // // //                         width: `${progress * 100}%`,
// // // //                         background: 'linear-gradient(90deg, #7b68ee, #c084fc)',
// // // //                         transition: 'width 0.12s linear',
// // // //                     }} />
// // // //                 </div>

// // // //                 <button
// // // //                     onClick={triggerExit}
// // // //                     style={{
// // // //                         pointerEvents: showSkip ? 'all' : 'none',
// // // //                         cursor: 'pointer',
// // // //                         background: 'rgba(255,255,255,0.05)',
// // // //                         border: '1px solid rgba(255,255,255,0.16)',
// // // //                         color: 'rgba(255,255,255,0.60)',
// // // //                         fontFamily: 'sans-serif',
// // // //                         fontSize: '11px',
// // // //                         letterSpacing: '0.16em',
// // // //                         textTransform: 'uppercase',
// // // //                         padding: '10px 32px',
// // // //                         backdropFilter: 'blur(12px)',
// // // //                         borderRadius: '2px',
// // // //                         opacity: showSkip ? 1 : 0,
// // // //                         transition: 'opacity 0.8s, background 0.2s, color 0.2s',
// // // //                     }}
// // // //                     onMouseEnter={e => {
// // // //                         e.currentTarget.style.background = 'rgba(255,255,255,0.13)';
// // // //                         e.currentTarget.style.color = '#fff';
// // // //                     }}
// // // //                     onMouseLeave={e => {
// // // //                         e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
// // // //                         e.currentTarget.style.color = 'rgba(255,255,255,0.60)';
// // // //                     }}
// // // //                 >
// // // //                     Skip intro
// // // //                 </button>
// // // //             </div>

// // // //             {/* Corner branding */}
// // // //             <div style={{
// // // //                 position: 'absolute',
// // // //                 top: '32px',
// // // //                 left: '40px',
// // // //                 fontFamily: 'Georgia, serif',
// // // //                 fontSize: '22px',
// // // //                 letterSpacing: '0.18em',
// // // //                 color: 'rgba(255,255,255,0.10)',
// // // //                 userSelect: 'none',
// // // //                 pointerEvents: 'none',
// // // //             }}>
// // // //                 AURA
// // // //             </div>
// // // //         </div>
// // // //     );
// // // // }

// // // // // ─────────────────────────────────────────────────────────────────────────────
// // // // // GATE WRAPPER
// // // // // ─────────────────────────────────────────────────────────────────────────────
// // // // let _introSeen = false;

// // // // export function AuraIntroGate({ children }) {
// // // //     const [done, setDone] = useState(_introSeen);

// // // //     const handleComplete = useCallback(() => {
// // // //         _introSeen = true;
// // // //         setDone(true);
// // // //     }, []);

// // // //     if (done) return children;

// // // //     return (
// // // //         <>
// // // //             <AuraIntro onComplete={handleComplete} />
// // // //             <div style={{ visibility: 'hidden', position: 'absolute', inset: 0, pointerEvents: 'none' }}>
// // // //                 {children}
// // // //             </div>
// // // //         </>
// // // //     );
// // // // }


// // // // AuraIntro.jsx — Enhanced, color-corrected, tagline-in-orbit
// // // // DEPENDENCIES: npm install three
// // // //
// // // // USAGE:
// // // //   import { AuraIntroGate } from './AuraIntro';
// // // //   <AuraIntroGate><Home /></AuraIntroGate>

// // // import { useEffect, useRef, useState, useCallback } from 'react';
// // // import * as THREE from 'three';

// // // // ─────────────────────────────────────────────────────────────────────────────
// // // // CONFIG
// // // // ─────────────────────────────────────────────────────────────────────────────
// // // const CONFIG = {
// // //     PARTICLE_COUNT: 2800,
// // //     SCATTER_DURATION: 2.2,   // longer so streams are visible before orbit
// // //     ORBIT_DURATION: 4.5,   // slightly longer so tagline reads cleanly in ring
// // //     COLLAPSE_DURATION: 1.8,
// // //     TEXT_DURATION: 9.0,
// // //     EXIT_DURATION: 2.0,
// // //     REPEL_RADIUS: 10,
// // //     REPEL_STRENGTH: 8,
// // //     CAMERA_START_Z: 58,
// // //     CAMERA_ORBIT_Z: 48,
// // //     CAMERA_TEXT_Z: 36,
// // //     PALETTE: [
// // //         0x7b68ee, // indigo
// // //         0xc084fc, // violet
// // //         0x818cf8, // lavender
// // //         0xe879f9, // fuchsia
// // //         0xa78bfa, // purple
// // //         0x60a5fa, // blue accent
// // //     ],
// // // };

// // // // ─────────────────────────────────────────────────────────────────────────────
// // // // SHADERS
// // // // Core fix: multiply vColor by a brightness factor instead of adding white vec3.
// // // // This keeps the particle's own hue saturated — no blowout to white.
// // // // ─────────────────────────────────────────────────────────────────────────────
// // // const VERTEX_SHADER = /* glsl */`
// // //   attribute float aSize;
// // //   attribute vec3  aColor;
// // //   varying   vec3  vColor;
// // //   varying   float vDist;
// // //   uniform   float uPixelRatio;

// // //   void main() {
// // //     vColor = aColor;
// // //     vec4 mv = modelViewMatrix * vec4(position, 1.0);
// // //     vDist   = -mv.z;
// // //     float s = aSize * uPixelRatio * (300.0 / max(vDist, 1.0));
// // //     gl_PointSize = clamp(s, 1.0, 16.0);
// // //     gl_Position  = projectionMatrix * mv;
// // //   }
// // // `;

// // // const FRAGMENT_SHADER = /* glsl */`
// // //   varying vec3  vColor;
// // //   varying float vDist;

// // //   void main() {
// // //     vec2  uv = gl_PointCoord - 0.5;
// // //     float d  = length(uv);
// // //     if (d > 0.5) discard;

// // //     // Three layers — keep alpha controlled so additive blending stays colored
// // //     float core = 1.0 - smoothstep(0.0,  0.18, d);
// // //     float mid  = 1.0 - smoothstep(0.12, 0.36, d);
// // //     float glow = 1.0 - smoothstep(0.28, 0.50, d);

// // //     float a = core * 0.82 + mid * 0.32 + glow * 0.12;
// // //     a *= smoothstep(130.0, 16.0, vDist);

// // //     // Brighten toward own hue — multiply, not add white
// // //     vec3 col = vColor * (1.0 + core * 0.60 + mid * 0.20);

// // //     gl_FragColor = vec4(col, clamp(a, 0.0, 1.0));
// // //   }
// // // `;

// // // // ─────────────────────────────────────────────────────────────────────────────
// // // // HELPER — sample text pixels into Three.js world coords
// // // // ─────────────────────────────────────────────────────────────────────────────
// // // function sampleTextParticles(text, count, containerWidth) {
// // //     const offCanvas = document.createElement('canvas');
// // //     const fontSize = Math.floor(Math.min(containerWidth, 900) * 0.19);
// // //     offCanvas.width = Math.min(containerWidth, 900);
// // //     offCanvas.height = Math.round(fontSize * 1.6);
// // //     const ctx = offCanvas.getContext('2d');
// // //     ctx.clearRect(0, 0, offCanvas.width, offCanvas.height);
// // //     ctx.fillStyle = '#fff';
// // //     ctx.font = `bold ${fontSize}px Georgia, serif`;
// // //     ctx.textAlign = 'center';
// // //     ctx.textBaseline = 'middle';
// // //     ctx.fillText(text, offCanvas.width / 2, offCanvas.height / 2);

// // //     const imgData = ctx.getImageData(0, 0, offCanvas.width, offCanvas.height);
// // //     const pts = [];
// // //     for (let y = 0; y < offCanvas.height; y += 2) {
// // //         for (let x = 0; x < offCanvas.width; x += 2) {
// // //             if (imgData.data[(y * offCanvas.width + x) * 4 + 3] > 120) {
// // //                 pts.push({
// // //                     x: ((x / offCanvas.width) - 0.5) * 58,
// // //                     y: -((y / offCanvas.height) - 0.5) * 20,
// // //                 });
// // //             }
// // //         }
// // //     }
// // //     for (let i = pts.length - 1; i > 0; i--) {
// // //         const j = Math.floor(Math.random() * (i + 1));
// // //         [pts[i], pts[j]] = [pts[j], pts[i]];
// // //     }
// // //     const step = Math.max(1, Math.floor(pts.length / count));
// // //     const sampled = [];
// // //     for (let i = 0; i < pts.length && sampled.length < count; i += step) sampled.push(pts[i]);
// // //     while (sampled.length < count)
// // //         sampled.push(pts[Math.floor(Math.random() * pts.length)] ?? { x: 0, y: 0 });
// // //     return sampled.slice(0, count);
// // // }

// // // // ─────────────────────────────────────────────────────────────────────────────
// // // // HELPER — orbital target positions
// // // // ─────────────────────────────────────────────────────────────────────────────
// // // function buildOrbitalTargets(count) {
// // //     const shapes = [
// // //         ...Array.from({ length: 110 }, (_, i) => {
// // //             const a = (i / 110) * Math.PI * 2;
// // //             return { x: Math.cos(a) * 24, y: Math.sin(a) * 10, z: Math.sin(a * 2) * 5 };
// // //         }),
// // //         ...Array.from({ length: 70 }, (_, i) => {
// // //             const a = (i / 70) * Math.PI * 2;
// // //             return { x: Math.cos(a) * 16, y: Math.sin(a) * 7, z: Math.cos(a) * 7 };
// // //         }),
// // //         ...Array.from({ length: 40 }, (_, i) => {
// // //             const a = (i / 40) * Math.PI * 2;
// // //             return { x: Math.cos(a) * 8, y: Math.sin(a) * 3, z: Math.sin(a) * 8 };
// // //         }),
// // //         ...Array.from({ length: 120 }, () => ({
// // //             x: -14 + (Math.random() - 0.5) * 10,
// // //             y: 4 + (Math.random() - 0.5) * 12,
// // //             z: (Math.random() - 0.5) * 5,
// // //         })),
// // //         ...Array.from({ length: 120 }, () => ({
// // //             x: 14 + (Math.random() - 0.5) * 10,
// // //             y: -2 + (Math.random() - 0.5) * 10,
// // //             z: (Math.random() - 0.5) * 5,
// // //         })),
// // //         ...Array.from({ length: 80 }, () => ({
// // //             x: (Math.random() - 0.5) * 55,
// // //             y: (Math.random() - 0.5) * 32,
// // //             z: (Math.random() - 0.5) * 14,
// // //         })),
// // //     ];

// // //     const targets = new Float32Array(count * 3);
// // //     for (let i = 0; i < count; i++) {
// // //         const s = shapes[i % shapes.length];
// // //         targets[i * 3] = s.x + (Math.random() - 0.5) * 2.5;
// // //         targets[i * 3 + 1] = s.y + (Math.random() - 0.5) * 2.5;
// // //         targets[i * 3 + 2] = (s.z ?? 0) + (Math.random() - 0.5) * 1.5;
// // //     }
// // //     return targets;
// // // }

// // // // ─────────────────────────────────────────────────────────────────────────────
// // // // MAIN COMPONENT
// // // // ─────────────────────────────────────────────────────────────────────────────
// // // export default function AuraIntro({ onComplete }) {
// // //     const canvasRef = useRef(null);
// // //     const mouseRef = useRef({ x: 9999, y: 9999 });
// // //     const exitingRef = useRef(false);

// // //     const [progress, setProgress] = useState(0);
// // //     const [showSkip, setShowSkip] = useState(false);
// // //     // 'hidden' | 'orbit' | 'below' | 'out'
// // //     const [taglinePhase, setTaglinePhase] = useState('hidden');
// // //     const [fadeOut, setFadeOut] = useState(false);

// // //     const triggerExit = useCallback(() => {
// // //         if (exitingRef.current) return;
// // //         exitingRef.current = true;
// // //         setFadeOut(true);
// // //         setTaglinePhase('out');
// // //     }, []);

// // //     useEffect(() => {
// // //         const t = setTimeout(() => setShowSkip(true), 800);
// // //         return () => clearTimeout(t);
// // //     }, []);

// // //     useEffect(() => {
// // //         if (!fadeOut) return;
// // //         const t = setTimeout(() => onComplete?.(), CONFIG.EXIT_DURATION * 1000);
// // //         return () => clearTimeout(t);
// // //     }, [fadeOut, onComplete]);

// // //     // ── Main Three.js loop ──────────────────────────────────────────────────────
// // //     useEffect(() => {
// // //         if (!canvasRef.current) return;
// // //         const canvas = canvasRef.current;
// // //         const W = window.innerWidth;
// // //         const H = window.innerHeight;

// // //         const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
// // //         renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
// // //         renderer.setSize(W, H);
// // //         renderer.setClearColor(0x04020e, 1);

// // //         const scene = new THREE.Scene();
// // //         const camera = new THREE.PerspectiveCamera(60, W / H, 0.1, 1000);
// // //         camera.position.set(0, 0, CONFIG.CAMERA_START_Z);

// // //         const N = CONFIG.PARTICLE_COUNT;
// // //         const positions = new Float32Array(N * 3);
// // //         const velocities = new Float32Array(N * 3);
// // //         const targets = new Float32Array(N * 3);
// // //         const colors = new Float32Array(N * 3);
// // //         const sizes = new Float32Array(N);
// // //         const phaseOffsets = new Float32Array(N);

// // //         const palette = CONFIG.PALETTE.map(h => new THREE.Color(h));

// // //         for (let i = 0; i < N; i++) {
// // //             // Spawn from one of 4 screen edges (plus corners), well outside view
// // //             // so particles visibly stream IN from all directions on load
// // //             const edge = Math.floor(Math.random() * 4);
// // //             let sx, sy, sz, vx, vy, vz;
// // //             sz = (Math.random() - 0.5) * 60;
// // //             vz = (Math.random() - 0.5) * 0.08;

// // //             if (edge === 0) {
// // //                 // Left edge → stream rightward
// // //                 sx = -110 - Math.random() * 60;
// // //                 sy = (Math.random() - 0.5) * 110;
// // //                 vx = 0.35 + Math.random() * 0.55;
// // //                 vy = (Math.random() - 0.5) * 0.25;
// // //             } else if (edge === 1) {
// // //                 // Right edge → stream leftward
// // //                 sx = 110 + Math.random() * 60;
// // //                 sy = (Math.random() - 0.5) * 110;
// // //                 vx = -(0.35 + Math.random() * 0.55);
// // //                 vy = (Math.random() - 0.5) * 0.25;
// // //             } else if (edge === 2) {
// // //                 // Top edge → stream downward
// // //                 sx = (Math.random() - 0.5) * 160;
// // //                 sy = 80 + Math.random() * 40;
// // //                 vx = (Math.random() - 0.5) * 0.25;
// // //                 vy = -(0.30 + Math.random() * 0.45);
// // //             } else {
// // //                 // Bottom edge → stream upward
// // //                 sx = (Math.random() - 0.5) * 160;
// // //                 sy = -80 - Math.random() * 40;
// // //                 vx = (Math.random() - 0.5) * 0.25;
// // //                 vy = 0.30 + Math.random() * 0.45;
// // //             }

// // //             positions[i * 3] = sx;
// // //             positions[i * 3 + 1] = sy;
// // //             positions[i * 3 + 2] = sz;
// // //             velocities[i * 3] = vx;
// // //             velocities[i * 3 + 1] = vy;
// // //             velocities[i * 3 + 2] = vz;

// // //             const c = palette[Math.floor(Math.random() * palette.length)];
// // //             colors[i * 3] = c.r; colors[i * 3 + 1] = c.g; colors[i * 3 + 2] = c.b;
// // //             sizes[i] = 1.4 + Math.random() * 2.8;
// // //             phaseOffsets[i] = Math.random() * Math.PI * 2;
// // //         }

// // //         const geo = new THREE.BufferGeometry();
// // //         geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
// // //         geo.setAttribute('aColor', new THREE.BufferAttribute(colors, 3));
// // //         geo.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));

// // //         const mat = new THREE.ShaderMaterial({
// // //             uniforms: { uPixelRatio: { value: renderer.getPixelRatio() } },
// // //             vertexShader: VERTEX_SHADER,
// // //             fragmentShader: FRAGMENT_SHADER,
// // //             transparent: true,
// // //             depthWrite: false,
// // //             blending: THREE.AdditiveBlending,
// // //         });

// // //         scene.add(new THREE.Points(geo, mat));

// // //         const orbitalTargets = buildOrbitalTargets(N);

// // //         let phase = 'scatter';
// // //         let phaseTime = 0;
// // //         let totalTime = 0;
// // //         let textPts = null;
// // //         let cameraTargetZ = CONFIG.CAMERA_START_Z;
// // //         let raf;

// // //         const TOTAL = CONFIG.SCATTER_DURATION + CONFIG.ORBIT_DURATION
// // //             + CONFIG.COLLAPSE_DURATION + CONFIG.TEXT_DURATION;

// // //         setTimeout(() => { textPts = sampleTextParticles('Aura', N, window.innerWidth); }, 100);

// // //         function setTextTargets() {
// // //             if (!textPts) return;
// // //             for (let i = 0; i < N; i++) {
// // //                 const pt = textPts[i % textPts.length];
// // //                 targets[i * 3] = pt.x + (Math.random() - 0.5) * 0.6;
// // //                 targets[i * 3 + 1] = pt.y + (Math.random() - 0.5) * 0.6;
// // //                 targets[i * 3 + 2] = (Math.random() - 0.5) * 1.8;
// // //             }
// // //         }

// // //         let lastT = performance.now();

// // //         function tick(now) {
// // //             raf = requestAnimationFrame(tick);
// // //             const dt = Math.min((now - lastT) / 1000, 0.05);
// // //             lastT = now;
// // //             totalTime += dt;
// // //             phaseTime += dt;

// // //             setProgress(Math.min(totalTime / TOTAL, 1));

// // //             // Phase transitions
// // //             if (phase === 'scatter' && phaseTime >= CONFIG.SCATTER_DURATION) {
// // //                 phase = 'orbit'; phaseTime = 0;
// // //                 cameraTargetZ = CONFIG.CAMERA_ORBIT_Z;
// // //                 setTaglinePhase('orbit');        // ← tagline appears inside ring
// // //             }
// // //             if (phase === 'orbit' && phaseTime >= CONFIG.ORBIT_DURATION) {
// // //                 phase = 'collapse'; phaseTime = 0;
// // //                 setTextTargets();
// // //                 cameraTargetZ = CONFIG.CAMERA_TEXT_Z + 6;
// // //                 setTaglinePhase('hidden');       // ← hide while particles collapse
// // //             }
// // //             if (phase === 'collapse' && phaseTime >= CONFIG.COLLAPSE_DURATION) {
// // //                 phase = 'text'; phaseTime = 0;
// // //                 cameraTargetZ = CONFIG.CAMERA_TEXT_Z;
// // //                 setTaglinePhase('below');        // ← reappear well below particle text
// // //             }
// // //             if (phase === 'text' && phaseTime >= CONFIG.TEXT_DURATION) {
// // //                 if (!exitingRef.current) {
// // //                     exitingRef.current = true;
// // //                     setFadeOut(true);
// // //                     setTaglinePhase('out');
// // //                 }
// // //                 phase = 'exit'; phaseTime = 0;
// // //             }
// // //             if (exitingRef.current && phase !== 'exit') {
// // //                 phase = 'exit'; phaseTime = 0;
// // //             }

// // //             // Camera
// // //             camera.position.z += (cameraTargetZ - camera.position.z) * 0.028;
// // //             const mx = mouseRef.current.x;
// // //             const my = mouseRef.current.y;
// // //             camera.position.x += (-mx * 2.5 - camera.position.x) * 0.022;
// // //             camera.position.y += (my * 1.8 - camera.position.y) * 0.022;

// // //             const halfFov = THREE.MathUtils.degToRad(30);
// // //             const mwx = mx * camera.position.z * Math.tan(halfFov);
// // //             const mwy = my * camera.position.z * Math.tan(halfFov) / (W / H);

// // //             // Particle update
// // //             const posAttr = geo.attributes.position;
// // //             const colAttr = geo.attributes.aColor;

// // //             for (let i = 0; i < N; i++) {
// // //                 const ix = i * 3, iy = i * 3 + 1, iz = i * 3 + 2;
// // //                 let px = positions[ix], py = positions[iy], pz = positions[iz];

// // //                 if (phase === 'scatter') {
// // //                     // Very gentle decel — particles keep most of their speed and drift freely
// // //                     velocities[ix] *= 0.995; velocities[iy] *= 0.995; velocities[iz] *= 0.995;
// // //                     px += velocities[ix]; py += velocities[iy]; pz += velocities[iz];
// // //                     // Soft wrap so screen stays full of streaming dots
// // //                     if (px > 120) px = -120; if (px < -120) px = 120;
// // //                     if (py > 85) py = -85; if (py < -85) py = 85;

// // //                 } else if (phase === 'orbit') {
// // //                     const ox = orbitalTargets[ix];
// // //                     const oy = orbitalTargets[iy];
// // //                     const oz = orbitalTargets[iz];
// // //                     const angle = totalTime * 0.16;
// // //                     const cosA = Math.cos(angle);
// // //                     const sinA = Math.sin(angle);
// // //                     const rotX = ox * cosA - oz * sinA;
// // //                     const rotZ = ox * sinA + oz * cosA;
// // //                     const wave = Math.sin(totalTime * 0.85 + phaseOffsets[i]) * 0.9;
// // //                     px += (rotX + wave * 0.2 - px) * 0.05;
// // //                     py += (oy + Math.sin(totalTime * 0.65 + phaseOffsets[i]) * 0.7 - py) * 0.05;
// // //                     pz += (rotZ - pz) * 0.05;

// // //                 } else if (phase === 'collapse') {
// // //                     px += (targets[ix] - px) * 0.075;
// // //                     py += (targets[iy] - py) * 0.075;
// // //                     pz += (targets[iz] - pz) * 0.075;

// // //                 } else if (phase === 'text') {
// // //                     const dx = px - mwx, dy = py - mwy;
// // //                     const dist = Math.sqrt(dx * dx + dy * dy);
// // //                     if (dist < CONFIG.REPEL_RADIUS && dist > 0.01) {
// // //                         const f = ((CONFIG.REPEL_RADIUS - dist) / CONFIG.REPEL_RADIUS) ** 2;
// // //                         px += (dx / dist) * f * CONFIG.REPEL_STRENGTH;
// // //                         py += (dy / dist) * f * CONFIG.REPEL_STRENGTH;
// // //                         pz += Math.sin(totalTime * 3 + phaseOffsets[i]) * f * 0.8;
// // //                     }
// // //                     const ease = dist < CONFIG.REPEL_RADIUS ? 0.016 : 0.032;
// // //                     px += (targets[ix] - px) * ease;
// // //                     py += (targets[iy] - py) * ease;
// // //                     pz += (targets[iz] - pz) * ease;
// // //                     px += Math.sin(totalTime * 2.2 + phaseOffsets[i]) * 0.013;
// // //                     py += Math.cos(totalTime * 1.9 + phaseOffsets[i]) * 0.013;

// // //                 } else if (phase === 'exit') {
// // //                     const angle = i * 2.39996;
// // //                     const speed = phaseTime * 28;
// // //                     px += Math.cos(angle) * speed * dt;
// // //                     py += Math.sin(angle) * speed * dt;
// // //                     pz += Math.sin(angle * 1.618) * speed * 0.5 * dt;
// // //                 }

// // //                 positions[ix] = px; positions[iy] = py; positions[iz] = pz;
// // //                 posAttr.array[ix] = px; posAttr.array[iy] = py; posAttr.array[iz] = pz;

// // //                 // Color pulsing — interpolate between palette hues only, no white
// // //                 if (phase === 'text' || phase === 'collapse') {
// // //                     const t = (Math.sin(totalTime * 1.7 + phaseOffsets[i]) + 1) * 0.5;
// // //                     const c1 = palette[i % palette.length];
// // //                     const c2 = palette[(i + 2) % palette.length];
// // //                     colAttr.array[ix] = Math.min(c1.r + (c2.r - c1.r) * t * 0.5, 0.90);
// // //                     colAttr.array[iy] = Math.min(c1.g + (c2.g - c1.g) * t * 0.5, 0.90);
// // //                     colAttr.array[iz] = Math.min(c1.b + (c2.b - c1.b) * t * 0.5, 0.90);
// // //                 }
// // //             }

// // //             posAttr.needsUpdate = true;
// // //             if (phase === 'text' || phase === 'collapse') colAttr.needsUpdate = true;

// // //             renderer.render(scene, camera);
// // //         }

// // //         raf = requestAnimationFrame(tick);

// // //         const onResize = () => {
// // //             const w = window.innerWidth, h = window.innerHeight;
// // //             camera.aspect = w / h;
// // //             camera.updateProjectionMatrix();
// // //             renderer.setSize(w, h);
// // //         };
// // //         window.addEventListener('resize', onResize);

// // //         return () => {
// // //             cancelAnimationFrame(raf);
// // //             window.removeEventListener('resize', onResize);
// // //             renderer.dispose();
// // //             geo.dispose();
// // //             mat.dispose();
// // //         };
// // //         // eslint-disable-next-line react-hooks/exhaustive-deps
// // //     }, []);

// // //     // Mouse tracking
// // //     useEffect(() => {
// // //         const onMove = e => {
// // //             mouseRef.current.x = (e.clientX / window.innerWidth) * 2 - 1;
// // //             mouseRef.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
// // //         };
// // //         const onTouch = e => {
// // //             const t = e.touches[0];
// // //             mouseRef.current.x = (t.clientX / window.innerWidth) * 2 - 1;
// // //             mouseRef.current.y = -(t.clientY / window.innerHeight) * 2 + 1;
// // //         };
// // //         window.addEventListener('mousemove', onMove);
// // //         window.addEventListener('touchmove', onTouch, { passive: true });
// // //         return () => {
// // //             window.removeEventListener('mousemove', onMove);
// // //             window.removeEventListener('touchmove', onTouch);
// // //         };
// // //     }, []);

// // //     // ── Tagline style — changes per phase ──────────────────────────────────────
// // //     // orbit: centered inside the rotating ring, small italic
// // //     // below: positioned below the particle text with safe vertical gap
// // //     const taglineVisible = taglinePhase === 'orbit' || taglinePhase === 'below';

// // //     const taglineBase = {
// // //         position: 'absolute',
// // //         left: '50%',
// // //         fontFamily: 'Georgia, serif',
// // //         textTransform: 'uppercase',
// // //         whiteSpace: 'nowrap',
// // //         userSelect: 'none',
// // //         pointerEvents: 'none',
// // //         opacity: taglineVisible ? 1 : 0,
// // //         transition: 'opacity 1.1s ease, top 0.9s ease, font-size 0.6s ease, letter-spacing 0.6s ease',
// // //     };

// // //     const taglineStyle = taglinePhase === 'orbit'
// // //         ? {
// // //             ...taglineBase,
// // //             // Sit inside the ring — center of screen, vertically centered
// // //             top: '50%',
// // //             transform: 'translate(-50%, -50%)',
// // //             fontSize: 'clamp(9px, 1.0vw, 12px)',
// // //             letterSpacing: '0.28em',
// // //             color: 'rgba(210, 190, 255, 0.65)',
// // //             fontStyle: 'italic',
// // //         }
// // //         : taglinePhase === 'below'
// // //             ? {
// // //                 ...taglineBase,
// // //                 // Below the "Aura" particle text.
// // //                 // Particles sit near vertical center; push tagline 115–130px below.
// // //                 top: 'calc(50% + 120px)',
// // //                 transform: 'translateX(-50%)',
// // //                 fontSize: 'clamp(10px, 1.2vw, 13px)',
// // //                 letterSpacing: '0.32em',
// // //                 color: 'rgba(180, 160, 255, 0.68)',
// // //                 fontStyle: 'normal',
// // //             }
// // //             : {
// // //                 // hidden / out — invisible, keep in DOM for smooth fade
// // //                 ...taglineBase,
// // //                 top: '50%',
// // //                 transform: 'translate(-50%, -50%)',
// // //                 fontSize: 'clamp(10px, 1.2vw, 13px)',
// // //                 letterSpacing: '0.28em',
// // //                 color: 'rgba(180, 160, 255, 0)',
// // //             };

// // //     // ── JSX ────────────────────────────────────────────────────────────────────
// // //     return (
// // //         <div style={{
// // //             position: 'fixed',
// // //             inset: 0,
// // //             zIndex: 9999,
// // //             background: '#04020e',
// // //             opacity: fadeOut ? 0 : 1,
// // //             transition: fadeOut ? `opacity ${CONFIG.EXIT_DURATION}s ease-in` : 'none',
// // //             pointerEvents: fadeOut ? 'none' : 'all',
// // //         }}>
// // //             <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />

// // //             {/* Tagline — floats in ring during orbit, moves below text during text phase */}
// // //             <div style={taglineStyle}>
// // //                 Where aesthetics meet soul
// // //             </div>

// // //             {/* Bottom UI */}
// // //             <div style={{
// // //                 position: 'absolute',
// // //                 bottom: 0, left: 0, right: 0,
// // //                 display: 'flex',
// // //                 flexDirection: 'column',
// // //                 alignItems: 'center',
// // //                 paddingBottom: '48px',
// // //                 gap: '20px',
// // //                 pointerEvents: 'none',
// // //             }}>
// // //                 <div style={{
// // //                     width: '120px',
// // //                     height: '1px',
// // //                     background: 'rgba(255,255,255,0.08)',
// // //                     overflow: 'hidden',
// // //                     opacity: showSkip ? 1 : 0,
// // //                     transition: 'opacity 0.8s',
// // //                 }}>
// // //                     <div style={{
// // //                         height: '100%',
// // //                         width: `${progress * 100}%`,
// // //                         background: 'linear-gradient(90deg, #7b68ee, #c084fc)',
// // //                         transition: 'width 0.12s linear',
// // //                     }} />
// // //                 </div>

// // //                 <button
// // //                     onClick={triggerExit}
// // //                     style={{
// // //                         pointerEvents: showSkip ? 'all' : 'none',
// // //                         cursor: 'pointer',
// // //                         background: 'rgba(255,255,255,0.05)',
// // //                         border: '1px solid rgba(255,255,255,0.16)',
// // //                         color: 'rgba(255,255,255,0.60)',
// // //                         fontFamily: 'sans-serif',
// // //                         fontSize: '11px',
// // //                         letterSpacing: '0.16em',
// // //                         textTransform: 'uppercase',
// // //                         padding: '10px 32px',
// // //                         backdropFilter: 'blur(12px)',
// // //                         borderRadius: '2px',
// // //                         opacity: showSkip ? 1 : 0,
// // //                         transition: 'opacity 0.8s, background 0.2s, color 0.2s',
// // //                     }}
// // //                     onMouseEnter={e => {
// // //                         e.currentTarget.style.background = 'rgba(255,255,255,0.13)';
// // //                         e.currentTarget.style.color = '#fff';
// // //                     }}
// // //                     onMouseLeave={e => {
// // //                         e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
// // //                         e.currentTarget.style.color = 'rgba(255,255,255,0.60)';
// // //                     }}
// // //                 >
// // //                     Skip intro
// // //                 </button>
// // //             </div>

// // //             {/* Corner branding */}
// // //             <div style={{
// // //                 position: 'absolute',
// // //                 top: '32px',
// // //                 left: '40px',
// // //                 fontFamily: 'Georgia, serif',
// // //                 fontSize: '22px',
// // //                 letterSpacing: '0.18em',
// // //                 color: 'rgba(255,255,255,0.10)',
// // //                 userSelect: 'none',
// // //                 pointerEvents: 'none',
// // //             }}>
// // //                 AURA
// // //             </div>
// // //         </div>
// // //     );
// // // }

// // // // ─────────────────────────────────────────────────────────────────────────────
// // // // GATE WRAPPER
// // // // ─────────────────────────────────────────────────────────────────────────────
// // // let _introSeen = false;

// // // export function AuraIntroGate({ children }) {
// // //     const [done, setDone] = useState(_introSeen);

// // //     const handleComplete = useCallback(() => {
// // //         _introSeen = true;
// // //         setDone(true);
// // //     }, []);

// // //     if (done) return children;

// // //     return (
// // //         <>
// // //             <AuraIntro onComplete={handleComplete} />
// // //             <div style={{ visibility: 'hidden', position: 'absolute', inset: 0, pointerEvents: 'none' }}>
// // //                 {children}
// // //             </div>
// // //         </>
// // //     );
// // // }


// // import { useEffect, useRef, useState, useCallback } from 'react';
// // import * as THREE from 'three';

// // // ─────────────────────────────────────────────────────────────────────────────
// // // CONFIG
// // // ─────────────────────────────────────────────────────────────────────────────
// // const CONFIG = {
// //     PARTICLE_COUNT: 2800,
// //     SCATTER_DURATION: 2.2,   // longer so streams are visible before orbit
// //     ORBIT_DURATION: 4.5,   // slightly longer so tagline reads cleanly in ring
// //     COLLAPSE_DURATION: 1.8,
// //     TEXT_DURATION: 9.0,
// //     EXIT_DURATION: 2.0,
// //     REPEL_RADIUS: 10,
// //     REPEL_STRENGTH: 8,
// //     CAMERA_START_Z: 58,
// //     CAMERA_ORBIT_Z: 48,
// //     CAMERA_TEXT_Z: 36,
// //     PALETTE: [
// //         0x7b68ee, // indigo
// //         0xc084fc, // violet
// //         0x818cf8, // lavender
// //         0xe879f9, // fuchsia
// //         0xa78bfa, // purple
// //         0x60a5fa, // blue accent
// //     ],
// // };

// // // ─────────────────────────────────────────────────────────────────────────────
// // // SHADERS
// // // Core fix: multiply vColor by a brightness factor instead of adding white vec3.
// // // This keeps the particle's own hue saturated — no blowout to white.
// // // ─────────────────────────────────────────────────────────────────────────────
// // const VERTEX_SHADER = /* glsl */`
// //   attribute float aSize;
// //   attribute vec3  aColor;
// //   varying   vec3  vColor;
// //   varying   float vDist;
// //   uniform   float uPixelRatio;

// //   void main() {
// //     vColor = aColor;
// //     vec4 mv = modelViewMatrix * vec4(position, 1.0);
// //     vDist   = -mv.z;
// //     float s = aSize * uPixelRatio * (300.0 / max(vDist, 1.0));
// //     gl_PointSize = clamp(s, 1.0, 16.0);
// //     gl_Position  = projectionMatrix * mv;
// //   }
// // `;

// // const FRAGMENT_SHADER = /* glsl */`
// //   varying vec3  vColor;
// //   varying float vDist;

// //   void main() {
// //     vec2  uv = gl_PointCoord - 0.5;
// //     float d  = length(uv);
// //     if (d > 0.5) discard;

// //     // Three layers — keep alpha controlled so additive blending stays colored
// //     float core = 1.0 - smoothstep(0.0,  0.18, d);
// //     float mid  = 1.0 - smoothstep(0.12, 0.36, d);
// //     float glow = 1.0 - smoothstep(0.28, 0.50, d);

// //     float a = core * 0.82 + mid * 0.32 + glow * 0.12;
// //     a *= smoothstep(130.0, 16.0, vDist);

// //     // Brighten toward own hue — multiply, not add white
// //     vec3 col = vColor * (1.0 + core * 0.60 + mid * 0.20);

// //     gl_FragColor = vec4(col, clamp(a, 0.0, 1.0));
// //   }
// // `;

// // // ─────────────────────────────────────────────────────────────────────────────
// // // HELPER — sample text pixels into Three.js world coords
// // // ─────────────────────────────────────────────────────────────────────────────
// // function sampleTextParticles(text, count, containerWidth) {
// //     const offCanvas = document.createElement('canvas');
// //     const fontSize = Math.floor(Math.min(containerWidth, 900) * 0.19);
// //     offCanvas.width = Math.min(containerWidth, 900);
// //     offCanvas.height = Math.round(fontSize * 1.6);
// //     const ctx = offCanvas.getContext('2d');
// //     ctx.clearRect(0, 0, offCanvas.width, offCanvas.height);
// //     ctx.fillStyle = '#fff';
// //     ctx.font = `bold ${fontSize}px Georgia, serif`;
// //     ctx.textAlign = 'center';
// //     ctx.textBaseline = 'middle';
// //     ctx.fillText(text, offCanvas.width / 2, offCanvas.height / 2);

// //     const imgData = ctx.getImageData(0, 0, offCanvas.width, offCanvas.height);
// //     const pts = [];
// //     for (let y = 0; y < offCanvas.height; y += 2) {
// //         for (let x = 0; x < offCanvas.width; x += 2) {
// //             if (imgData.data[(y * offCanvas.width + x) * 4 + 3] > 120) {
// //                 pts.push({
// //                     x: ((x / offCanvas.width) - 0.5) * 58,
// //                     y: -((y / offCanvas.height) - 0.5) * 20,
// //                 });
// //             }
// //         }
// //     }
// //     for (let i = pts.length - 1; i > 0; i--) {
// //         const j = Math.floor(Math.random() * (i + 1));
// //         [pts[i], pts[j]] = [pts[j], pts[i]];
// //     }
// //     const step = Math.max(1, Math.floor(pts.length / count));
// //     const sampled = [];
// //     for (let i = 0; i < pts.length && sampled.length < count; i += step) sampled.push(pts[i]);
// //     while (sampled.length < count)
// //         sampled.push(pts[Math.floor(Math.random() * pts.length)] ?? { x: 0, y: 0 });
// //     return sampled.slice(0, count);
// // }

// // // ─────────────────────────────────────────────────────────────────────────────
// // // HELPER — orbital target positions
// // // ─────────────────────────────────────────────────────────────────────────────
// // function buildOrbitalTargets(count) {
// //     const shapes = [
// //         ...Array.from({ length: 110 }, (_, i) => {
// //             const a = (i / 110) * Math.PI * 2;
// //             return { x: Math.cos(a) * 24, y: Math.sin(a) * 10, z: Math.sin(a * 2) * 5 };
// //         }),
// //         ...Array.from({ length: 70 }, (_, i) => {
// //             const a = (i / 70) * Math.PI * 2;
// //             return { x: Math.cos(a) * 16, y: Math.sin(a) * 7, z: Math.cos(a) * 7 };
// //         }),
// //         ...Array.from({ length: 40 }, (_, i) => {
// //             const a = (i / 40) * Math.PI * 2;
// //             return { x: Math.cos(a) * 8, y: Math.sin(a) * 3, z: Math.sin(a) * 8 };
// //         }),
// //         ...Array.from({ length: 120 }, () => ({
// //             x: -14 + (Math.random() - 0.5) * 10,
// //             y: 4 + (Math.random() - 0.5) * 12,
// //             z: (Math.random() - 0.5) * 5,
// //         })),
// //         ...Array.from({ length: 120 }, () => ({
// //             x: 14 + (Math.random() - 0.5) * 10,
// //             y: -2 + (Math.random() - 0.5) * 10,
// //             z: (Math.random() - 0.5) * 5,
// //         })),
// //         ...Array.from({ length: 80 }, () => ({
// //             x: (Math.random() - 0.5) * 55,
// //             y: (Math.random() - 0.5) * 32,
// //             z: (Math.random() - 0.5) * 14,
// //         })),
// //     ];

// //     const targets = new Float32Array(count * 3);
// //     for (let i = 0; i < count; i++) {
// //         const s = shapes[i % shapes.length];
// //         targets[i * 3] = s.x + (Math.random() - 0.5) * 2.5;
// //         targets[i * 3 + 1] = s.y + (Math.random() - 0.5) * 2.5;
// //         targets[i * 3 + 2] = (s.z ?? 0) + (Math.random() - 0.5) * 1.5;
// //     }
// //     return targets;
// // }

// // // ─────────────────────────────────────────────────────────────────────────────
// // // MAIN COMPONENT
// // // ─────────────────────────────────────────────────────────────────────────────
// // export default function AuraIntro({ onComplete }) {
// //     const canvasRef = useRef(null);
// //     const mouseRef = useRef({ x: 9999, y: 9999 });
// //     const exitingRef = useRef(false);

// //     const [progress, setProgress] = useState(0);
// //     const [showSkip, setShowSkip] = useState(false);
// //     // 'hidden' | 'orbit' | 'below' | 'out'
// //     const [taglinePhase, setTaglinePhase] = useState('hidden');
// //     const [fadeOut, setFadeOut] = useState(false);

// //     const triggerExit = useCallback(() => {
// //         if (exitingRef.current) return;
// //         exitingRef.current = true;
// //         setFadeOut(true);
// //         setTaglinePhase('out');
// //     }, []);

// //     useEffect(() => {
// //         const t = setTimeout(() => setShowSkip(true), 800);
// //         return () => clearTimeout(t);
// //     }, []);

// //     useEffect(() => {
// //         if (!fadeOut) return;
// //         const t = setTimeout(() => onComplete?.(), CONFIG.EXIT_DURATION * 1000);
// //         return () => clearTimeout(t);
// //     }, [fadeOut, onComplete]);

// //     // ── Main Three.js loop ──────────────────────────────────────────────────────
// //     useEffect(() => {
// //         if (!canvasRef.current) return;
// //         const canvas = canvasRef.current;
// //         const W = window.innerWidth;
// //         const H = window.innerHeight;

// //         const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
// //         renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
// //         renderer.setSize(W, H);
// //         renderer.setClearColor(0x04020e, 1);

// //         const scene = new THREE.Scene();
// //         const camera = new THREE.PerspectiveCamera(60, W / H, 0.1, 1000);
// //         camera.position.set(0, 0, CONFIG.CAMERA_START_Z);

// //         const N = CONFIG.PARTICLE_COUNT;
// //         const positions = new Float32Array(N * 3);
// //         const velocities = new Float32Array(N * 3);
// //         const targets = new Float32Array(N * 3);
// //         const colors = new Float32Array(N * 3);
// //         const sizes = new Float32Array(N);
// //         const phaseOffsets = new Float32Array(N);

// //         const palette = CONFIG.PALETTE.map(h => new THREE.Color(h));

// //         for (let i = 0; i < N; i++) {
// //             // Start already spread across the full world space in all directions
// //             // so the very first frame shows dots everywhere, drifting freely
// //             positions[i * 3] = (Math.random() - 0.5) * 160;
// //             positions[i * 3 + 1] = (Math.random() - 0.5) * 110;
// //             positions[i * 3 + 2] = (Math.random() - 0.5) * 90;

// //             // Random direction velocities — every particle moves a different way
// //             const angle2D = Math.random() * Math.PI * 2;
// //             const speed = 0.18 + Math.random() * 0.38;
// //             velocities[i * 3] = Math.cos(angle2D) * speed;
// //             velocities[i * 3 + 1] = Math.sin(angle2D) * speed;
// //             velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.12;

// //             const c = palette[Math.floor(Math.random() * palette.length)];
// //             colors[i * 3] = c.r; colors[i * 3 + 1] = c.g; colors[i * 3 + 2] = c.b;
// //             sizes[i] = 1.4 + Math.random() * 2.8;
// //             phaseOffsets[i] = Math.random() * Math.PI * 2;
// //         }

// //         const geo = new THREE.BufferGeometry();
// //         geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
// //         geo.setAttribute('aColor', new THREE.BufferAttribute(colors, 3));
// //         geo.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));

// //         const mat = new THREE.ShaderMaterial({
// //             uniforms: { uPixelRatio: { value: renderer.getPixelRatio() } },
// //             vertexShader: VERTEX_SHADER,
// //             fragmentShader: FRAGMENT_SHADER,
// //             transparent: true,
// //             depthWrite: false,
// //             blending: THREE.AdditiveBlending,
// //         });

// //         scene.add(new THREE.Points(geo, mat));

// //         const orbitalTargets = buildOrbitalTargets(N);

// //         let phase = 'scatter';
// //         let phaseTime = 0;
// //         let totalTime = 0;
// //         let textPts = null;
// //         let cameraTargetZ = CONFIG.CAMERA_START_Z;
// //         let raf;

// //         const TOTAL = CONFIG.SCATTER_DURATION + CONFIG.ORBIT_DURATION
// //             + CONFIG.COLLAPSE_DURATION + CONFIG.TEXT_DURATION;

// //         setTimeout(() => { textPts = sampleTextParticles('Aura', N, window.innerWidth); }, 100);

// //         function setTextTargets() {
// //             if (!textPts) return;
// //             for (let i = 0; i < N; i++) {
// //                 const pt = textPts[i % textPts.length];
// //                 targets[i * 3] = pt.x + (Math.random() - 0.5) * 0.6;
// //                 targets[i * 3 + 1] = pt.y + (Math.random() - 0.5) * 0.6;
// //                 targets[i * 3 + 2] = (Math.random() - 0.5) * 1.8;
// //             }
// //         }

// //         let lastT = performance.now();

// //         function tick(now) {
// //             raf = requestAnimationFrame(tick);
// //             const dt = Math.min((now - lastT) / 1000, 0.05);
// //             lastT = now;
// //             totalTime += dt;
// //             phaseTime += dt;

// //             setProgress(Math.min(totalTime / TOTAL, 1));

// //             // Phase transitions
// //             if (phase === 'scatter' && phaseTime >= CONFIG.SCATTER_DURATION) {
// //                 phase = 'orbit'; phaseTime = 0;
// //                 cameraTargetZ = CONFIG.CAMERA_ORBIT_Z;
// //                 setTaglinePhase('orbit');        // ← tagline appears inside ring
// //             }
// //             if (phase === 'orbit' && phaseTime >= CONFIG.ORBIT_DURATION) {
// //                 phase = 'collapse'; phaseTime = 0;
// //                 setTextTargets();
// //                 cameraTargetZ = CONFIG.CAMERA_TEXT_Z + 6;
// //                 setTaglinePhase('hidden');       // ← hide while particles collapse
// //             }
// //             if (phase === 'collapse' && phaseTime >= CONFIG.COLLAPSE_DURATION) {
// //                 phase = 'text'; phaseTime = 0;
// //                 cameraTargetZ = CONFIG.CAMERA_TEXT_Z;
// //                 setTaglinePhase('below');        // ← reappear well below particle text
// //             }
// //             if (phase === 'text' && phaseTime >= CONFIG.TEXT_DURATION) {
// //                 if (!exitingRef.current) {
// //                     exitingRef.current = true;
// //                     setFadeOut(true);
// //                     setTaglinePhase('out');
// //                 }
// //                 phase = 'exit'; phaseTime = 0;
// //             }
// //             if (exitingRef.current && phase !== 'exit') {
// //                 phase = 'exit'; phaseTime = 0;
// //             }

// //             // Camera
// //             camera.position.z += (cameraTargetZ - camera.position.z) * 0.028;
// //             const mx = mouseRef.current.x;
// //             const my = mouseRef.current.y;
// //             camera.position.x += (-mx * 2.5 - camera.position.x) * 0.022;
// //             camera.position.y += (my * 1.8 - camera.position.y) * 0.022;

// //             const halfFov = THREE.MathUtils.degToRad(30);
// //             const mwx = mx * camera.position.z * Math.tan(halfFov);
// //             const mwy = my * camera.position.z * Math.tan(halfFov) / (W / H);

// //             // Particle update
// //             const posAttr = geo.attributes.position;
// //             const colAttr = geo.attributes.aColor;

// //             for (let i = 0; i < N; i++) {
// //                 const ix = i * 3, iy = i * 3 + 1, iz = i * 3 + 2;
// //                 let px = positions[ix], py = positions[iy], pz = positions[iz];

// //                 if (phase === 'scatter') {
// //                     // Barely decelerate — particles keep flowing in their own direction
// //                     velocities[ix] *= 0.997; velocities[iy] *= 0.997; velocities[iz] *= 0.997;
// //                     px += velocities[ix]; py += velocities[iy]; pz += velocities[iz];
// //                     // Wrap so particles that drift off one edge reappear on the other
// //                     if (px > 120) px = -120; if (px < -120) px = 120;
// //                     if (py > 85) py = -85; if (py < -85) py = 85;

// //                 } else if (phase === 'orbit') {
// //                     const ox = orbitalTargets[ix];
// //                     const oy = orbitalTargets[iy];
// //                     const oz = orbitalTargets[iz];
// //                     const angle = totalTime * 0.16;
// //                     const cosA = Math.cos(angle);
// //                     const sinA = Math.sin(angle);
// //                     const rotX = ox * cosA - oz * sinA;
// //                     const rotZ = ox * sinA + oz * cosA;
// //                     const wave = Math.sin(totalTime * 0.85 + phaseOffsets[i]) * 0.9;
// //                     px += (rotX + wave * 0.2 - px) * 0.05;
// //                     py += (oy + Math.sin(totalTime * 0.65 + phaseOffsets[i]) * 0.7 - py) * 0.05;
// //                     pz += (rotZ - pz) * 0.05;

// //                 } else if (phase === 'collapse') {
// //                     px += (targets[ix] - px) * 0.075;
// //                     py += (targets[iy] - py) * 0.075;
// //                     pz += (targets[iz] - pz) * 0.075;

// //                 } else if (phase === 'text') {
// //                     const dx = px - mwx, dy = py - mwy;
// //                     const dist = Math.sqrt(dx * dx + dy * dy);
// //                     if (dist < CONFIG.REPEL_RADIUS && dist > 0.01) {
// //                         const f = ((CONFIG.REPEL_RADIUS - dist) / CONFIG.REPEL_RADIUS) ** 2;
// //                         px += (dx / dist) * f * CONFIG.REPEL_STRENGTH;
// //                         py += (dy / dist) * f * CONFIG.REPEL_STRENGTH;
// //                         pz += Math.sin(totalTime * 3 + phaseOffsets[i]) * f * 0.8;
// //                     }
// //                     const ease = dist < CONFIG.REPEL_RADIUS ? 0.016 : 0.032;
// //                     px += (targets[ix] - px) * ease;
// //                     py += (targets[iy] - py) * ease;
// //                     pz += (targets[iz] - pz) * ease;
// //                     px += Math.sin(totalTime * 2.2 + phaseOffsets[i]) * 0.013;
// //                     py += Math.cos(totalTime * 1.9 + phaseOffsets[i]) * 0.013;

// //                 } else if (phase === 'exit') {
// //                     const angle = i * 2.39996;
// //                     const speed = phaseTime * 28;
// //                     px += Math.cos(angle) * speed * dt;
// //                     py += Math.sin(angle) * speed * dt;
// //                     pz += Math.sin(angle * 1.618) * speed * 0.5 * dt;
// //                 }

// //                 positions[ix] = px; positions[iy] = py; positions[iz] = pz;
// //                 posAttr.array[ix] = px; posAttr.array[iy] = py; posAttr.array[iz] = pz;

// //                 // Color pulsing — interpolate between palette hues only, no white
// //                 if (phase === 'text' || phase === 'collapse') {
// //                     const t = (Math.sin(totalTime * 1.7 + phaseOffsets[i]) + 1) * 0.5;
// //                     const c1 = palette[i % palette.length];
// //                     const c2 = palette[(i + 2) % palette.length];
// //                     colAttr.array[ix] = Math.min(c1.r + (c2.r - c1.r) * t * 0.5, 0.90);
// //                     colAttr.array[iy] = Math.min(c1.g + (c2.g - c1.g) * t * 0.5, 0.90);
// //                     colAttr.array[iz] = Math.min(c1.b + (c2.b - c1.b) * t * 0.5, 0.90);
// //                 }
// //             }

// //             posAttr.needsUpdate = true;
// //             if (phase === 'text' || phase === 'collapse') colAttr.needsUpdate = true;

// //             renderer.render(scene, camera);
// //         }

// //         raf = requestAnimationFrame(tick);

// //         const onResize = () => {
// //             const w = window.innerWidth, h = window.innerHeight;
// //             camera.aspect = w / h;
// //             camera.updateProjectionMatrix();
// //             renderer.setSize(w, h);
// //         };
// //         window.addEventListener('resize', onResize);

// //         return () => {
// //             cancelAnimationFrame(raf);
// //             window.removeEventListener('resize', onResize);
// //             renderer.dispose();
// //             geo.dispose();
// //             mat.dispose();
// //         };
// //         // eslint-disable-next-line react-hooks/exhaustive-deps
// //     }, []);

// //     // Mouse tracking
// //     useEffect(() => {
// //         const onMove = e => {
// //             mouseRef.current.x = (e.clientX / window.innerWidth) * 2 - 1;
// //             mouseRef.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
// //         };
// //         const onTouch = e => {
// //             const t = e.touches[0];
// //             mouseRef.current.x = (t.clientX / window.innerWidth) * 2 - 1;
// //             mouseRef.current.y = -(t.clientY / window.innerHeight) * 2 + 1;
// //         };
// //         window.addEventListener('mousemove', onMove);
// //         window.addEventListener('touchmove', onTouch, { passive: true });
// //         return () => {
// //             window.removeEventListener('mousemove', onMove);
// //             window.removeEventListener('touchmove', onTouch);
// //         };
// //     }, []);

// //     // ── Tagline style — changes per phase ──────────────────────────────────────
// //     // orbit: centered inside the rotating ring, small italic
// //     // below: positioned below the particle text with safe vertical gap
// //     const taglineVisible = taglinePhase === 'orbit' || taglinePhase === 'below';

// //     const taglineBase = {
// //         position: 'absolute',
// //         left: '50%',
// //         fontFamily: 'Georgia, serif',
// //         textTransform: 'uppercase',
// //         whiteSpace: 'nowrap',
// //         userSelect: 'none',
// //         pointerEvents: 'none',
// //         opacity: taglineVisible ? 1 : 0,
// //         transition: 'opacity 1.1s ease, top 0.9s ease, font-size 0.6s ease, letter-spacing 0.6s ease',
// //     };

// //     const taglineStyle = taglinePhase === 'orbit'
// //         ? {
// //             ...taglineBase,
// //             // Sit inside the ring — center of screen, vertically centered
// //             top: '50%',
// //             transform: 'translate(-50%, -50%)',
// //             fontSize: 'clamp(9px, 1.0vw, 12px)',
// //             letterSpacing: '0.28em',
// //             color: 'rgba(210, 190, 255, 0.65)',
// //             fontStyle: 'italic',
// //         }
// //         : taglinePhase === 'below'
// //             ? {
// //                 ...taglineBase,
// //                 // Below the "Aura" particle text.
// //                 // Particles sit near vertical center; push tagline 115–130px below.
// //                 top: 'calc(50% + 120px)',
// //                 transform: 'translateX(-50%)',
// //                 fontSize: 'clamp(10px, 1.2vw, 13px)',
// //                 letterSpacing: '0.32em',
// //                 color: 'rgba(180, 160, 255, 0.68)',
// //                 fontStyle: 'normal',
// //             }
// //             : {
// //                 // hidden / out — invisible, keep in DOM for smooth fade
// //                 ...taglineBase,
// //                 top: '50%',
// //                 transform: 'translate(-50%, -50%)',
// //                 fontSize: 'clamp(10px, 1.2vw, 13px)',
// //                 letterSpacing: '0.28em',
// //                 color: 'rgba(180, 160, 255, 0)',
// //             };

// //     // ── JSX ────────────────────────────────────────────────────────────────────
// //     return (
// //         <div style={{
// //             position: 'fixed',
// //             inset: 0,
// //             zIndex: 9999,
// //             background: '#04020e',
// //             opacity: fadeOut ? 0 : 1,
// //             transition: fadeOut ? `opacity ${CONFIG.EXIT_DURATION}s ease-in` : 'none',
// //             pointerEvents: fadeOut ? 'none' : 'all',
// //         }}>
// //             <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />

// //             {/* Tagline — floats in ring during orbit, moves below text during text phase */}
// //             <div style={taglineStyle}>
// //                 Where aesthetics meet soul
// //             </div>

// //             {/* Bottom UI */}
// //             <div style={{
// //                 position: 'absolute',
// //                 bottom: 0, left: 0, right: 0,
// //                 display: 'flex',
// //                 flexDirection: 'column',
// //                 alignItems: 'center',
// //                 paddingBottom: '48px',
// //                 gap: '20px',
// //                 pointerEvents: 'none',
// //             }}>
// //                 <div style={{
// //                     width: '120px',
// //                     height: '1px',
// //                     background: 'rgba(255,255,255,0.08)',
// //                     overflow: 'hidden',
// //                     opacity: showSkip ? 1 : 0,
// //                     transition: 'opacity 0.8s',
// //                 }}>
// //                     <div style={{
// //                         height: '100%',
// //                         width: `${progress * 100}%`,
// //                         background: 'linear-gradient(90deg, #7b68ee, #c084fc)',
// //                         transition: 'width 0.12s linear',
// //                     }} />
// //                 </div>

// //                 <button
// //                     onClick={triggerExit}
// //                     style={{
// //                         pointerEvents: showSkip ? 'all' : 'none',
// //                         cursor: 'pointer',
// //                         background: 'rgba(255,255,255,0.05)',
// //                         border: '1px solid rgba(255,255,255,0.16)',
// //                         color: 'rgba(255,255,255,0.60)',
// //                         fontFamily: 'sans-serif',
// //                         fontSize: '11px',
// //                         letterSpacing: '0.16em',
// //                         textTransform: 'uppercase',
// //                         padding: '10px 32px',
// //                         backdropFilter: 'blur(12px)',
// //                         borderRadius: '2px',
// //                         opacity: showSkip ? 1 : 0,
// //                         transition: 'opacity 0.8s, background 0.2s, color 0.2s',
// //                     }}
// //                     onMouseEnter={e => {
// //                         e.currentTarget.style.background = 'rgba(255,255,255,0.13)';
// //                         e.currentTarget.style.color = '#fff';
// //                     }}
// //                     onMouseLeave={e => {
// //                         e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
// //                         e.currentTarget.style.color = 'rgba(255,255,255,0.60)';
// //                     }}
// //                 >
// //                     Skip intro
// //                 </button>
// //             </div>

// //             {/* Corner branding */}
// //             <div style={{
// //                 position: 'absolute',
// //                 top: '32px',
// //                 left: '40px',
// //                 fontFamily: 'Georgia, serif',
// //                 fontSize: '22px',
// //                 letterSpacing: '0.18em',
// //                 color: 'rgba(255,255,255,0.10)',
// //                 userSelect: 'none',
// //                 pointerEvents: 'none',
// //             }}>
// //                 AURA
// //             </div>
// //         </div>
// //     );
// // }

// // // ─────────────────────────────────────────────────────────────────────────────
// // // GATE WRAPPER
// // // ─────────────────────────────────────────────────────────────────────────────
// // let _introSeen = false;

// // export function AuraIntroGate({ children }) {
// //     const [done, setDone] = useState(_introSeen);

// //     const handleComplete = useCallback(() => {
// //         _introSeen = true;
// //         setDone(true);
// //     }, []);

// //     if (done) return children;

// //     return (
// //         <>
// //             <AuraIntro onComplete={handleComplete} />
// //             <div style={{ visibility: 'hidden', position: 'absolute', inset: 0, pointerEvents: 'none' }}>
// //                 {children}
// //             </div>
// //         </>
// //     );
// // }






















// // // // // // AuraIntro.jsx
// // // // // // Drop this component into your React app and render it before <Home />.
// // // // // // It auto-transitions to your homepage after the animation, or on "Skip".
// // // // // //
// // // // // // USAGE in App.jsx (or wherever you handle routing):
// // // // // //   import AuraIntro from './components/AuraIntro';
// // // // // //
// // // // // //   In your router config, add a route for "/" that renders:
// // // // // //     <AuraIntroGate><Home /></AuraIntroGate>
// // // // // //
// // // // // //   Or use AuraIntro directly as a splash overlay (see AuraIntroGate below).
// // // // // //
// // // // // // DEPENDENCIES:
// // // // // //   npm install three
// // // // // //   (framer-motion is optional — only used for the tagline fade)

// // // // // import { useEffect, useRef, useState, useCallback } from 'react';
// // // // // import * as THREE from 'three';

// // // // // // ─────────────────────────────────────────────────────────────────────────────
// // // // // // CONFIG — tweak timings, counts, colors here
// // // // // // ─────────────────────────────────────────────────────────────────────────────
// // // // // const CONFIG = {
// // // // //     PARTICLE_COUNT: 2400,
// // // // //     SCATTER_DURATION: 1.2,   // seconds of free float
// // // // //     ORBIT_DURATION: 3.8,   // seconds of orbiting shapes
// // // // //     COLLAPSE_DURATION: 1.6,   // seconds morphing into text
// // // // //     TEXT_DURATION: 8.0,   // seconds holding "Aura"
// // // // //     EXIT_DURATION: 1.8,   // seconds of exit explosion
// // // // //     REPEL_RADIUS: 9,     // mouse repulsion radius (world units)
// // // // //     REPEL_STRENGTH: 7,
// // // // //     CAMERA_START_Z: 55,
// // // // //     CAMERA_TEXT_Z: 36,
// // // // //     PALETTE: [
// // // // //         0x7b68ee, // indigo
// // // // //         0xc084fc, // violet
// // // // //         0x818cf8, // lavender
// // // // //         0xe879f9, // fuchsia
// // // // //         0xa78bfa, // purple
// // // // //         0x60a5fa, // blue accent
// // // // //     ],
// // // // // };

// // // // // // ─────────────────────────────────────────────────────────────────────────────
// // // // // // HELPER — sample pixel positions from canvas text rendering
// // // // // // ─────────────────────────────────────────────────────────────────────────────
// // // // // function sampleTextParticles(text, count, containerWidth) {
// // // // //     const offCanvas = document.createElement('canvas');
// // // // //     const fontSize = Math.floor(Math.min(containerWidth, 900) * 0.18);
// // // // //     offCanvas.width = Math.min(containerWidth, 900);
// // // // //     offCanvas.height = Math.round(fontSize * 1.5);
// // // // //     const ctx = offCanvas.getContext('2d');
// // // // //     ctx.clearRect(0, 0, offCanvas.width, offCanvas.height);
// // // // //     ctx.fillStyle = '#fff';
// // // // //     ctx.font = `bold ${fontSize}px Georgia, serif`;
// // // // //     ctx.textAlign = 'center';
// // // // //     ctx.textBaseline = 'middle';
// // // // //     ctx.fillText(text, offCanvas.width / 2, offCanvas.height / 2);

// // // // //     const imgData = ctx.getImageData(0, 0, offCanvas.width, offCanvas.height);
// // // // //     const pts = [];
// // // // //     for (let y = 0; y < offCanvas.height; y += 2) {
// // // // //         for (let x = 0; x < offCanvas.width; x += 2) {
// // // // //             if (imgData.data[(y * offCanvas.width + x) * 4 + 3] > 100) {
// // // // //                 pts.push({
// // // // //                     x: ((x / offCanvas.width) - 0.5) * 56,
// // // // //                     y: -((y / offCanvas.height) - 0.5) * 18,
// // // // //                 });
// // // // //             }
// // // // //         }
// // // // //     }
// // // // //     // Fisher–Yates shuffle
// // // // //     for (let i = pts.length - 1; i > 0; i--) {
// // // // //         const j = Math.floor(Math.random() * (i + 1));
// // // // //         [pts[i], pts[j]] = [pts[j], pts[i]];
// // // // //     }
// // // // //     const step = Math.max(1, Math.floor(pts.length / count));
// // // // //     const sampled = [];
// // // // //     for (let i = 0; i < pts.length && sampled.length < count; i += step) sampled.push(pts[i]);
// // // // //     while (sampled.length < count) {
// // // // //         sampled.push(pts[Math.floor(Math.random() * pts.length)] ?? { x: 0, y: 0 });
// // // // //     }
// // // // //     return sampled.slice(0, count);
// // // // // }

// // // // // // ─────────────────────────────────────────────────────────────────────────────
// // // // // // HELPER — build orbital target positions
// // // // // // ─────────────────────────────────────────────────────────────────────────────
// // // // // function buildOrbitalTargets(count) {
// // // // //     const shapes = [
// // // // //         // Ring 1 — large orbit
// // // // //         ...Array.from({ length: 80 }, (_, i) => {
// // // // //             const a = (i / 80) * Math.PI * 2;
// // // // //             return { x: Math.cos(a) * 22, y: Math.sin(a) * 9, z: Math.sin(a * 2) * 4 };
// // // // //         }),
// // // // //         // Ring 2 — tilted inner ring
// // // // //         ...Array.from({ length: 60 }, (_, i) => {
// // // // //             const a = (i / 60) * Math.PI * 2;
// // // // //             return { x: Math.cos(a) * 15, y: Math.sin(a) * 6, z: Math.cos(a) * 6 };
// // // // //         }),
// // // // //         // Cluster: "bag" silhouette left
// // // // //         ...Array.from({ length: 100 }, () => ({
// // // // //             x: -13 + (Math.random() - 0.5) * 9,
// // // // //             y: 4 + (Math.random() - 0.5) * 11,
// // // // //             z: (Math.random() - 0.5) * 4,
// // // // //         })),
// // // // //         // Cluster: "cart" silhouette right
// // // // //         ...Array.from({ length: 100 }, () => ({
// // // // //             x: 13 + (Math.random() - 0.5) * 9,
// // // // //             y: -2 + (Math.random() - 0.5) * 9,
// // // // //             z: (Math.random() - 0.5) * 4,
// // // // //         })),
// // // // //         // Scattered sparkle particles
// // // // //         ...Array.from({ length: 60 }, () => ({
// // // // //             x: (Math.random() - 0.5) * 50,
// // // // //             y: (Math.random() - 0.5) * 30,
// // // // //             z: (Math.random() - 0.5) * 10,
// // // // //         })),
// // // // //     ];

// // // // //     const targets = new Float32Array(count * 3);
// // // // //     for (let i = 0; i < count; i++) {
// // // // //         const s = shapes[i % shapes.length];
// // // // //         targets[i * 3] = s.x + (Math.random() - 0.5) * 3;
// // // // //         targets[i * 3 + 1] = s.y + (Math.random() - 0.5) * 3;
// // // // //         targets[i * 3 + 2] = (s.z ?? 0) + (Math.random() - 0.5) * 2;
// // // // //     }
// // // // //     return targets;
// // // // // }

// // // // // // ─────────────────────────────────────────────────────────────────────────────
// // // // // // SHADERS
// // // // // // ─────────────────────────────────────────────────────────────────────────────
// // // // // const VERTEX_SHADER = `
// // // // //   attribute float size;
// // // // //   attribute vec3 myColor;
// // // // //   varying vec3 vMyColor;
// // // // //   varying float vDist;
// // // // //   uniform float uTime;
// // // // //   uniform float uPixelRatio;

// // // // //   void main() {
// // // // //     vMyColor = myColor;
// // // // //     vec4 mv = modelViewMatrix * vec4(position, 1.0);
// // // // //     vDist = -mv.z;
// // // // //     float s = size * uPixelRatio * (280.0 / max(vDist, 1.0));
// // // // //     gl_PointSize = clamp(s, 1.0, 16.0);
// // // // //     gl_Position  = projectionMatrix * mv;
// // // // //   }
// // // // // `;

// // // // // const FRAGMENT_SHADER = `
// // // // //   varying vec3 vMyColor;
// // // // //   varying float vDist;

// // // // //   void main() {
// // // // //     vec2  uv   = gl_PointCoord - 0.5;
// // // // //     float d    = length(uv);
// // // // //     if (d > 0.5) discard;
// // // // //     float core = 1.0 - smoothstep(0.0,  0.22, d);
// // // // //     float glow = 1.0 - smoothstep(0.18, 0.50, d);
// // // // //     float a    = core * 0.95 + glow * 0.35;
// // // // //     a         *= 1.0 - smoothstep(20.0, 120.0, vDist); // depth fade
// // // // //     vec3  col  = vMyColor + core * vec3(0.35, 0.25, 0.5);
// // // // //     gl_FragColor = vec4(col, a);
// // // // //   }
// // // // // `;

// // // // // // ─────────────────────────────────────────────────────────────────────────────
// // // // // // MAIN COMPONENT
// // // // // // ─────────────────────────────────────────────────────────────────────────────
// // // // // export default function AuraIntro({ onComplete }) {
// // // // //     const canvasRef = useRef(null);
// // // // //     const mouseRef = useRef({ x: 9999, y: 9999 });
// // // // //     const [progress, setProgress] = useState(0);
// // // // //     const [showSkip, setShowSkip] = useState(false);
// // // // //     const [showTagline, setShowTagline] = useState(false);
// // // // //     const [exiting, setExiting] = useState(false);

// // // // //     const triggerExit = useCallback(() => {
// // // // //         setExiting(true);
// // // // //     }, []);

// // // // //     useEffect(() => {
// // // // //         const timer = setTimeout(() => setShowSkip(true), 800);
// // // // //         return () => clearTimeout(timer);
// // // // //     }, []);

// // // // //     useEffect(() => {
// // // // //         if (!canvasRef.current) return;

// // // // //         const canvas = canvasRef.current;
// // // // //         const W = window.innerWidth;
// // // // //         const H = window.innerHeight;

// // // // //         // ── Renderer ──────────────────────────────────────────────────
// // // // //         const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
// // // // //         renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
// // // // //         renderer.setSize(W, H);
// // // // //         renderer.setClearColor(0x04020e, 1);

// // // // //         const scene = new THREE.Scene();
// // // // //         const camera = new THREE.PerspectiveCamera(60, W / H, 0.1, 1000);
// // // // //         camera.position.set(0, 0, CONFIG.CAMERA_START_Z);

// // // // //         // ── Particle buffers ──────────────────────────────────────────
// // // // //         const N = CONFIG.PARTICLE_COUNT;
// // // // //         const positions = new Float32Array(N * 3);
// // // // //         const velocities = new Float32Array(N * 3);
// // // // //         const targets = new Float32Array(N * 3);
// // // // //         const colors = new Float32Array(N * 3);
// // // // //         const sizes = new Float32Array(N);

// // // // //         const palette = CONFIG.PALETTE.map(h => new THREE.Color(h));

// // // // //         for (let i = 0; i < N; i++) {
// // // // //             positions[i * 3] = (Math.random() - 0.5) * 130;
// // // // //             positions[i * 3 + 1] = (Math.random() - 0.5) * 90;
// // // // //             positions[i * 3 + 2] = (Math.random() - 0.5) * 70;
// // // // //             velocities[i * 3] = (Math.random() - 0.5) * 0.25;
// // // // //             velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.25;
// // // // //             velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.08;
// // // // //             const c = palette[Math.floor(Math.random() * palette.length)];
// // // // //             colors[i * 3] = c.r; colors[i * 3 + 1] = c.g; colors[i * 3 + 2] = c.b;
// // // // //             sizes[i] = 1.4 + Math.random() * 2.8;
// // // // //         }

// // // // //         const geo = new THREE.BufferGeometry();
// // // // //         geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
// // // // //         geo.setAttribute('myColor', new THREE.BufferAttribute(colors, 3));
// // // // //         geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

// // // // //         const mat = new THREE.ShaderMaterial({
// // // // //             uniforms: {
// // // // //                 uTime: { value: 0 },
// // // // //                 uPixelRatio: { value: renderer.getPixelRatio() },
// // // // //             },
// // // // //             vertexShader: VERTEX_SHADER,
// // // // //             fragmentShader: FRAGMENT_SHADER,
// // // // //             transparent: true,
// // // // //             depthWrite: false,
// // // // //             blending: THREE.AdditiveBlending,
// // // // //         });

// // // // //         const points = new THREE.Points(geo, mat);
// // // // //         scene.add(points);

// // // // //         // ── Precompute orbital targets ─────────────────────────────────
// // // // //         const orbitalTargets = buildOrbitalTargets(N);
// // // // //         orbitalTargets.forEach((v, i) => { targets[i] = v; });

// // // // //         // ── State ─────────────────────────────────────────────────────
// // // // //         let phase = 'scatter';
// // // // //         let phaseTime = 0;
// // // // //         let totalTime = 0;
// // // // //         let textPts = null;
// // // // //         let cameraTargetZ = CONFIG.CAMERA_START_Z;
// // // // //         let exitTriggered = false;
// // // // //         let raf;

// // // // //         // Precompute text targets async (tiny delay so DOM is ready)
// // // // //         setTimeout(() => {
// // // // //             textPts = sampleTextParticles('Aura', N, window.innerWidth);
// // // // //         }, 80);

// // // // //         const TOTAL = CONFIG.SCATTER_DURATION + CONFIG.ORBIT_DURATION
// // // // //             + CONFIG.COLLAPSE_DURATION + CONFIG.TEXT_DURATION;

// // // // //         // ── Helpers ────────────────────────────────────────────────────
// // // // //         function setTextTargets() {
// // // // //             if (!textPts) return;
// // // // //             for (let i = 0; i < N; i++) {
// // // // //                 const pt = textPts[i % textPts.length];
// // // // //                 targets[i * 3] = pt.x + (Math.random() - 0.5) * 0.5;
// // // // //                 targets[i * 3 + 1] = pt.y + (Math.random() - 0.5) * 0.5;
// // // // //                 targets[i * 3 + 2] = (Math.random() - 0.5) * 1.5;
// // // // //             }
// // // // //         }

// // // // //         function doExitTrigger() {
// // // // //             if (exitTriggered) return;
// // // // //             exitTriggered = true;
// // // // //             setExiting(true);
// // // // //         }

// // // // //         // ── Clock ─────────────────────────────────────────────────────
// // // // //         let lastT = performance.now();

// // // // //         function tick(now) {
// // // // //             raf = requestAnimationFrame(tick);
// // // // //             const dt = Math.min((now - lastT) / 1000, 0.05);
// // // // //             lastT = now;
// // // // //             totalTime += dt;
// // // // //             phaseTime += dt;
// // // // //             mat.uniforms.uTime.value = totalTime;

// // // // //             // ── Progress ─────────────────────────────────────────────
// // // // //             setProgress(Math.min(totalTime / TOTAL, 1));

// // // // //             // ── Phase machine ─────────────────────────────────────────
// // // // //             if (phase === 'scatter' && phaseTime >= CONFIG.SCATTER_DURATION) {
// // // // //                 phase = 'orbit'; phaseTime = 0;
// // // // //             }
// // // // //             if (phase === 'orbit' && phaseTime >= CONFIG.ORBIT_DURATION) {
// // // // //                 phase = 'collapse'; phaseTime = 0;
// // // // //                 setTextTargets();
// // // // //                 cameraTargetZ = 42;
// // // // //             }
// // // // //             if (phase === 'collapse' && phaseTime >= CONFIG.COLLAPSE_DURATION) {
// // // // //                 phase = 'text'; phaseTime = 0;
// // // // //                 setShowTagline(true);
// // // // //                 cameraTargetZ = CONFIG.CAMERA_TEXT_Z;
// // // // //             }
// // // // //             if (phase === 'text' && phaseTime >= CONFIG.TEXT_DURATION) {
// // // // //                 doExitTrigger();
// // // // //             }
// // // // //             if (phase === 'exit' && phaseTime >= CONFIG.EXIT_DURATION) {
// // // // //                 onComplete?.();
// // // // //             }

// // // // //             // If exiting flag was set externally
// // // // //             if (exiting && phase !== 'exit') {
// // // // //                 phase = 'exit'; phaseTime = 0;
// // // // //             }

// // // // //             // ── Camera ────────────────────────────────────────────────
// // // // //             camera.position.z += (cameraTargetZ - camera.position.z) * 0.03;
// // // // //             const mx = mouseRef.current.x;
// // // // //             const my = mouseRef.current.y;
// // // // //             camera.position.x += (-mx * 3 - camera.position.x) * 0.025;
// // // // //             camera.position.y += (my * 2 - camera.position.y) * 0.025;

// // // // //             // Mouse in world coords (approx at z=0)
// // // // //             const halfFov = THREE.MathUtils.degToRad(30);
// // // // //             const aspect = W / H;
// // // // //             const mwx = mx * camera.position.z * Math.tan(halfFov);
// // // // //             const mwy = my * camera.position.z * Math.tan(halfFov) / aspect;

// // // // //             // ── Particle update ───────────────────────────────────────
// // // // //             const posAttr = geo.attributes.position;
// // // // //             const colAttr = geo.attributes.myColor;

// // // // //             for (let i = 0; i < N; i++) {
// // // // //                 const ix = i * 3, iy = i * 3 + 1, iz = i * 3 + 2;
// // // // //                 let px = positions[ix], py = positions[iy], pz = positions[iz];

// // // // //                 if (phase === 'scatter') {
// // // // //                     velocities[ix] *= 0.985; velocities[iy] *= 0.985; velocities[iz] *= 0.985;
// // // // //                     px += velocities[ix]; py += velocities[iy]; pz += velocities[iz];
// // // // //                     px -= px * 0.007; py -= py * 0.007;
// // // // //                     if (px > 80) px = -80; if (px < -80) px = 80;
// // // // //                     if (py > 60) py = -60; if (py < -60) py = 60;

// // // // //                 } else if (phase === 'orbit') {
// // // // //                     const tx = orbitalTargets[ix];
// // // // //                     const ty = orbitalTargets[iy];
// // // // //                     const tz = orbitalTargets[iz];
// // // // //                     const cos = Math.cos(totalTime * 0.14);
// // // // //                     const sin = Math.sin(totalTime * 0.14);
// // // // //                     const rotX = tx * cos - tz * sin;
// // // // //                     const rotZ = tx * sin + tz * cos;
// // // // //                     const wave = Math.sin(totalTime * 0.9 + i * 0.03) * 0.8;
// // // // //                     px += (rotX + wave * 0.15 - px) * 0.045;
// // // // //                     py += (ty + Math.sin(totalTime * 0.7 + i * 0.02) * 0.6 - py) * 0.045;
// // // // //                     pz += (rotZ - pz) * 0.045;

// // // // //                 } else if (phase === 'collapse') {
// // // // //                     const tx = targets[ix], ty = targets[iy], tz = targets[iz];
// // // // //                     px += (tx - px) * 0.07;
// // // // //                     py += (ty - py) * 0.07;
// // // // //                     pz += (tz - pz) * 0.07;

// // // // //                 } else if (phase === 'text') {
// // // // //                     const tx = targets[ix], ty = targets[iy], tz = targets[iz];
// // // // //                     // Mouse repulsion
// // // // //                     const dx = px - mwx, dy = py - mwy;
// // // // //                     const dist = Math.sqrt(dx * dx + dy * dy);
// // // // //                     if (dist < CONFIG.REPEL_RADIUS && dist > 0.01) {
// // // // //                         const f = ((CONFIG.REPEL_RADIUS - dist) / CONFIG.REPEL_RADIUS) ** 2;
// // // // //                         px += (dx / dist) * f * CONFIG.REPEL_STRENGTH;
// // // // //                         py += (dy / dist) * f * CONFIG.REPEL_STRENGTH;
// // // // //                         pz += Math.sin(totalTime * 3 + i) * f * 0.6;
// // // // //                     }
// // // // //                     // Spring back to text target
// // // // //                     const ease = dist < CONFIG.REPEL_RADIUS ? 0.018 : 0.03;
// // // // //                     px += (tx - px) * ease;
// // // // //                     py += (ty - py) * ease;
// // // // //                     pz += (tz - pz) * ease;
// // // // //                     // Shimmer
// // // // //                     px += Math.sin(totalTime * 2.1 + i * 0.11) * 0.012;
// // // // //                     py += Math.cos(totalTime * 1.8 + i * 0.07) * 0.012;

// // // // //                 } else if (phase === 'exit') {
// // // // //                     const angle = i * 2.39996; // golden angle
// // // // //                     const speed = phaseTime * 22;
// // // // //                     px += Math.cos(angle) * speed * dt;
// // // // //                     py += Math.sin(angle) * speed * dt;
// // // // //                     pz += Math.sin(angle * 1.5) * speed * 0.4 * dt;
// // // // //                 }

// // // // //                 positions[ix] = px; positions[iy] = py; positions[iz] = pz;
// // // // //                 posAttr.array[ix] = px; posAttr.array[iy] = py; posAttr.array[iz] = pz;

// // // // //                 // Color pulsing in text phase
// // // // //                 if (phase === 'text' || phase === 'collapse') {
// // // // //                     const t = (Math.sin(totalTime * 1.6 + i * 0.09) + 1) * 0.5;
// // // // //                     const c1 = palette[i % palette.length];
// // // // //                     const c2 = palette[(i + 2) % palette.length];
// // // // //                     colAttr.array[ix] = c1.r + (c2.r - c1.r) * t * 0.35;
// // // // //                     colAttr.array[iy] = c1.g + (c2.g - c1.g) * t * 0.35;
// // // // //                     colAttr.array[iz] = c1.b + (c2.b - c1.b) * t * 0.35;
// // // // //                 }
// // // // //             }

// // // // //             posAttr.needsUpdate = true;
// // // // //             if (phase === 'text' || phase === 'collapse') colAttr.needsUpdate = true;

// // // // //             // Exit opacity handled via canvas style (see JSX)
// // // // //             if (phase === 'exit') {
// // // // //                 const t = Math.min(phaseTime / CONFIG.EXIT_DURATION, 1);
// // // // //                 canvas.style.opacity = String(1 - t);
// // // // //             }

// // // // //             renderer.render(scene, camera);
// // // // //         }

// // // // //         raf = requestAnimationFrame(tick);

// // // // //         // ── Resize ────────────────────────────────────────────────────
// // // // //         const onResize = () => {
// // // // //             const w = window.innerWidth, h = window.innerHeight;
// // // // //             camera.aspect = w / h;
// // // // //             camera.updateProjectionMatrix();
// // // // //             renderer.setSize(w, h);
// // // // //         };
// // // // //         window.addEventListener('resize', onResize);

// // // // //         return () => {
// // // // //             cancelAnimationFrame(raf);
// // // // //             window.removeEventListener('resize', onResize);
// // // // //             renderer.dispose();
// // // // //             geo.dispose();
// // // // //             mat.dispose();
// // // // //         };
// // // // //         // eslint-disable-next-line react-hooks/exhaustive-deps
// // // // //     }, []);

// // // // //     // Mouse tracking
// // // // //     useEffect(() => {
// // // // //         const onMove = e => {
// // // // //             mouseRef.current.x = (e.clientX / window.innerWidth) * 2 - 1;
// // // // //             mouseRef.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
// // // // //         };
// // // // //         const onTouch = e => {
// // // // //             const t = e.touches[0];
// // // // //             mouseRef.current.x = (t.clientX / window.innerWidth) * 2 - 1;
// // // // //             mouseRef.current.y = -(t.clientY / window.innerHeight) * 2 + 1;
// // // // //         };
// // // // //         window.addEventListener('mousemove', onMove);
// // // // //         window.addEventListener('touchmove', onTouch, { passive: true });
// // // // //         return () => {
// // // // //             window.removeEventListener('mousemove', onMove);
// // // // //             window.removeEventListener('touchmove', onTouch);
// // // // //         };
// // // // //     }, []);

// // // // //     // Trigger completion when exiting
// // // // //     useEffect(() => {
// // // // //         if (!exiting) return;
// // // // //         const timer = setTimeout(() => onComplete?.(), CONFIG.EXIT_DURATION * 1000);
// // // // //         return () => clearTimeout(timer);
// // // // //     }, [exiting, onComplete]);

// // // // //     return (
// // // // //         <div style={{
// // // // //             position: 'fixed', inset: 0, zIndex: 9999,
// // // // //             background: '#04020e',
// // // // //             opacity: exiting ? 0 : 1,
// // // // //             transition: exiting ? `opacity ${CONFIG.EXIT_DURATION}s ease-in` : 'none',
// // // // //             pointerEvents: exiting ? 'none' : 'all',
// // // // //         }}>
// // // // //             {/* Three.js canvas */}
// // // // //             <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />

// // // // //             {/* Tagline */}
// // // // //             <div style={{
// // // // //                 position: 'absolute', top: '50%', left: '50%',
// // // // //                 transform: 'translate(-50%, calc(-50% + 60px))',
// // // // //                 fontFamily: 'Georgia, serif',
// // // // //                 fontSize: 'clamp(11px, 1.5vw, 15px)',
// // // // //                 letterSpacing: '0.28em',
// // // // //                 textTransform: 'uppercase',
// // // // //                 color: 'rgba(180, 160, 255, 0.75)',
// // // // //                 opacity: showTagline ? 1 : 0,
// // // // //                 transition: 'opacity 1.2s ease',
// // // // //                 whiteSpace: 'nowrap',
// // // // //                 userSelect: 'none',
// // // // //             }}>
// // // // //                 Where aesthetics meet soul
// // // // //             </div>

// // // // //             {/* Bottom UI */}
// // // // //             <div style={{
// // // // //                 position: 'absolute', bottom: 0, left: 0, right: 0,
// // // // //                 display: 'flex', flexDirection: 'column', alignItems: 'center',
// // // // //                 paddingBottom: '48px', gap: '20px',
// // // // //                 pointerEvents: 'none',
// // // // //             }}>
// // // // //                 {/* Progress bar */}
// // // // //                 <div style={{
// // // // //                     width: '120px', height: '1px',
// // // // //                     background: 'rgba(255,255,255,0.08)',
// // // // //                     overflow: 'hidden',
// // // // //                     opacity: showSkip ? 1 : 0,
// // // // //                     transition: 'opacity 0.8s',
// // // // //                 }}>
// // // // //                     <div style={{
// // // // //                         height: '100%',
// // // // //                         width: `${progress * 100}%`,
// // // // //                         background: 'linear-gradient(90deg, #7b68ee, #c084fc)',
// // // // //                         transition: 'width 0.12s linear',
// // // // //                     }} />
// // // // //                 </div>

// // // // //                 {/* Skip button */}
// // // // //                 <button
// // // // //                     onClick={triggerExit}
// // // // //                     style={{
// // // // //                         pointerEvents: showSkip ? 'all' : 'none',
// // // // //                         cursor: 'pointer',
// // // // //                         background: 'rgba(255,255,255,0.06)',
// // // // //                         border: '1px solid rgba(255,255,255,0.18)',
// // // // //                         color: 'rgba(255,255,255,0.65)',
// // // // //                         fontFamily: 'sans-serif',
// // // // //                         fontSize: '12px',
// // // // //                         letterSpacing: '0.14em',
// // // // //                         textTransform: 'uppercase',
// // // // //                         padding: '10px 30px',
// // // // //                         backdropFilter: 'blur(12px)',
// // // // //                         borderRadius: '2px',
// // // // //                         opacity: showSkip ? 1 : 0,
// // // // //                         transition: 'opacity 0.8s, background 0.25s, color 0.25s',
// // // // //                     }}
// // // // //                     onMouseEnter={e => {
// // // // //                         e.currentTarget.style.background = 'rgba(255,255,255,0.14)';
// // // // //                         e.currentTarget.style.color = '#fff';
// // // // //                     }}
// // // // //                     onMouseLeave={e => {
// // // // //                         e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
// // // // //                         e.currentTarget.style.color = 'rgba(255,255,255,0.65)';
// // // // //                     }}
// // // // //                 >
// // // // //                     Skip intro
// // // // //                 </button>
// // // // //             </div>

// // // // //             {/* Corner branding */}
// // // // //             <div style={{
// // // // //                 position: 'absolute', top: '32px', left: '40px',
// // // // //                 fontFamily: 'Georgia, serif',
// // // // //                 fontSize: '22px',
// // // // //                 letterSpacing: '0.15em',
// // // // //                 color: 'rgba(255,255,255,0.12)',
// // // // //                 userSelect: 'none',
// // // // //             }}>
// // // // //                 AURA
// // // // //             </div>
// // // // //         </div>
// // // // //     );
// // // // // }

// // // // // // ─────────────────────────────────────────────────────────────────────────────
// // // // // // GATE WRAPPER — wrap your <Home /> (or any page) with this
// // // // // // It shows the intro once per session, then renders children normally
// // // // // // ─────────────────────────────────────────────────────────────────────────────

// // // // // let memoryIntroSeen = false;

// // // // // export function AuraIntroGate({ children }) {
// // // // //     // Only show intro on full browser refresh or first load
// // // // //     const [done, setDone] = useState(memoryIntroSeen);

// // // // //     const handleComplete = useCallback(() => {
// // // // //         memoryIntroSeen = true;
// // // // //         setDone(true);
// // // // //     }, []);

// // // // //     return (
// // // // //         <>
// // // // //             {done ? children : (
// // // // //                 <>
// // // // //                     <AuraIntro onComplete={handleComplete} />
// // // // //                     {/* Render children behind the intro so they hydrate early */}
// // // // //                     <div style={{ visibility: 'hidden', position: 'absolute', inset: 0, pointerEvents: 'none' }}>
// // // // //                         {children}
// // // // //                     </div>
// // // // //                 </>
// // // // //             )}
// // // // //         </>
// // // // //     );
// // // // // }


// // // // // AuraIntro.jsx — Enhanced & fixed
// // // // // DEPENDENCIES: npm install three
// // // // //
// // // // // USAGE:
// // // // //   import { AuraIntroGate } from './AuraIntro';
// // // // //   <AuraIntroGate><Home /></AuraIntroGate>

// // // // import { useEffect, useRef, useState, useCallback } from 'react';
// // // // import * as THREE from 'three';

// // // // // ─────────────────────────────────────────────────────────────────────────────
// // // // // CONFIG
// // // // // ─────────────────────────────────────────────────────────────────────────────
// // // // const CONFIG = {
// // // //     PARTICLE_COUNT: 2800,
// // // //     SCATTER_DURATION: 1.4,
// // // //     ORBIT_DURATION: 4.2,
// // // //     COLLAPSE_DURATION: 1.8,
// // // //     TEXT_DURATION: 9.0,
// // // //     EXIT_DURATION: 2.0,
// // // //     REPEL_RADIUS: 10,
// // // //     REPEL_STRENGTH: 8,
// // // //     CAMERA_START_Z: 58,
// // // //     CAMERA_ORBIT_Z: 48,
// // // //     CAMERA_TEXT_Z: 36,
// // // //     PALETTE: [
// // // //         0x7b68ee, // indigo
// // // //         0xc084fc, // violet
// // // //         0x818cf8, // lavender
// // // //         0xe879f9, // fuchsia
// // // //         0xa78bfa, // purple
// // // //         0x60a5fa, // blue accent
// // // //     ],
// // // // };

// // // // // ─────────────────────────────────────────────────────────────────────────────
// // // // // SHADERS — use aColor to avoid Three.js built-in name collision
// // // // // ─────────────────────────────────────────────────────────────────────────────
// // // // const VERTEX_SHADER = /* glsl */`
// // // //   attribute float aSize;
// // // //   attribute vec3  aColor;
// // // //   varying   vec3  vColor;
// // // //   varying   float vDist;
// // // //   uniform   float uPixelRatio;

// // // //   void main() {
// // // //     vColor = aColor;
// // // //     vec4 mv = modelViewMatrix * vec4(position, 1.0);
// // // //     vDist   = -mv.z;
// // // //     float s = aSize * uPixelRatio * (300.0 / max(vDist, 1.0));
// // // //     gl_PointSize = clamp(s, 1.0, 18.0);
// // // //     gl_Position  = projectionMatrix * mv;
// // // //   }
// // // // `;

// // // // const FRAGMENT_SHADER = /* glsl */`
// // // //   varying vec3  vColor;
// // // //   varying float vDist;

// // // //   void main() {
// // // //     vec2  uv   = gl_PointCoord - 0.5;
// // // //     float d    = length(uv);
// // // //     if (d > 0.5) discard;

// // // //     float core = 1.0 - smoothstep(0.0,  0.20, d);
// // // //     float mid  = 1.0 - smoothstep(0.15, 0.38, d);
// // // //     float glow = 1.0 - smoothstep(0.30, 0.50, d);
// // // //     float a    = core * 1.0 + mid * 0.5 + glow * 0.25;
// // // //     a         *= smoothstep(130.0, 18.0, vDist);

// // // //     vec3 col   = vColor
// // // //                + core * vec3(0.40, 0.28, 0.55)
// // // //                + mid  * vec3(0.10, 0.05, 0.20);

// // // //     gl_FragColor = vec4(col, clamp(a, 0.0, 1.0));
// // // //   }
// // // // `;

// // // // // ─────────────────────────────────────────────────────────────────────────────
// // // // // HELPER — sample text pixels → world-space points (Three.js scale)
// // // // // ─────────────────────────────────────────────────────────────────────────────
// // // // function sampleTextParticles(text, count, containerWidth) {
// // // //     const offCanvas = document.createElement('canvas');
// // // //     const fontSize = Math.floor(Math.min(containerWidth, 900) * 0.19);
// // // //     offCanvas.width = Math.min(containerWidth, 900);
// // // //     offCanvas.height = Math.round(fontSize * 1.6);
// // // //     const ctx = offCanvas.getContext('2d');
// // // //     ctx.clearRect(0, 0, offCanvas.width, offCanvas.height);
// // // //     ctx.fillStyle = '#fff';
// // // //     ctx.font = `bold ${fontSize}px Georgia, serif`;
// // // //     ctx.textAlign = 'center';
// // // //     ctx.textBaseline = 'middle';
// // // //     ctx.fillText(text, offCanvas.width / 2, offCanvas.height / 2);

// // // //     const imgData = ctx.getImageData(0, 0, offCanvas.width, offCanvas.height);
// // // //     const pts = [];
// // // //     for (let y = 0; y < offCanvas.height; y += 2) {
// // // //         for (let x = 0; x < offCanvas.width; x += 2) {
// // // //             if (imgData.data[(y * offCanvas.width + x) * 4 + 3] > 120) {
// // // //                 pts.push({
// // // //                     // Map to Three.js world units — matched to CAMERA_TEXT_Z FOV
// // // //                     x: ((x / offCanvas.width) - 0.5) * 58,
// // // //                     y: -((y / offCanvas.height) - 0.5) * 20,
// // // //                 });
// // // //             }
// // // //         }
// // // //     }
// // // //     // Fisher–Yates shuffle
// // // //     for (let i = pts.length - 1; i > 0; i--) {
// // // //         const j = Math.floor(Math.random() * (i + 1));
// // // //         [pts[i], pts[j]] = [pts[j], pts[i]];
// // // //     }
// // // //     const step = Math.max(1, Math.floor(pts.length / count));
// // // //     const sampled = [];
// // // //     for (let i = 0; i < pts.length && sampled.length < count; i += step) sampled.push(pts[i]);
// // // //     while (sampled.length < count) {
// // // //         sampled.push(pts[Math.floor(Math.random() * pts.length)] ?? { x: 0, y: 0 });
// // // //     }
// // // //     return sampled.slice(0, count);
// // // // }

// // // // // ─────────────────────────────────────────────────────────────────────────────
// // // // // HELPER — orbital target positions
// // // // // ─────────────────────────────────────────────────────────────────────────────
// // // // function buildOrbitalTargets(count) {
// // // //     const shapes = [
// // // //         // Large elliptical ring
// // // //         ...Array.from({ length: 100 }, (_, i) => {
// // // //             const a = (i / 100) * Math.PI * 2;
// // // //             return { x: Math.cos(a) * 24, y: Math.sin(a) * 10, z: Math.sin(a * 2) * 5 };
// // // //         }),
// // // //         // Tilted inner ring
// // // //         ...Array.from({ length: 70 }, (_, i) => {
// // // //             const a = (i / 70) * Math.PI * 2;
// // // //             return { x: Math.cos(a) * 16, y: Math.sin(a) * 7, z: Math.cos(a) * 7 };
// // // //         }),
// // // //         // Small central ring
// // // //         ...Array.from({ length: 40 }, (_, i) => {
// // // //             const a = (i / 40) * Math.PI * 2;
// // // //             return { x: Math.cos(a) * 8, y: Math.sin(a) * 3, z: Math.sin(a) * 8 };
// // // //         }),
// // // //         // Left cluster
// // // //         ...Array.from({ length: 120 }, () => ({
// // // //             x: -14 + (Math.random() - 0.5) * 10,
// // // //             y: 4 + (Math.random() - 0.5) * 12,
// // // //             z: (Math.random() - 0.5) * 5,
// // // //         })),
// // // //         // Right cluster
// // // //         ...Array.from({ length: 120 }, () => ({
// // // //             x: 14 + (Math.random() - 0.5) * 10,
// // // //             y: -2 + (Math.random() - 0.5) * 10,
// // // //             z: (Math.random() - 0.5) * 5,
// // // //         })),
// // // //         // Sparkle cloud
// // // //         ...Array.from({ length: 80 }, () => ({
// // // //             x: (Math.random() - 0.5) * 55,
// // // //             y: (Math.random() - 0.5) * 32,
// // // //             z: (Math.random() - 0.5) * 14,
// // // //         })),
// // // //     ];

// // // //     const targets = new Float32Array(count * 3);
// // // //     for (let i = 0; i < count; i++) {
// // // //         const s = shapes[i % shapes.length];
// // // //         targets[i * 3] = s.x + (Math.random() - 0.5) * 2.5;
// // // //         targets[i * 3 + 1] = s.y + (Math.random() - 0.5) * 2.5;
// // // //         targets[i * 3 + 2] = (s.z ?? 0) + (Math.random() - 0.5) * 1.5;
// // // //     }
// // // //     return targets;
// // // // }

// // // // // ─────────────────────────────────────────────────────────────────────────────
// // // // // MAIN COMPONENT
// // // // // ─────────────────────────────────────────────────────────────────────────────
// // // // export default function AuraIntro({ onComplete }) {
// // // //     const canvasRef = useRef(null);
// // // //     const mouseRef = useRef({ x: 9999, y: 9999 });
// // // //     const exitingRef = useRef(false);           // ref so animation loop reads current value
// // // //     const [progress, setProgress] = useState(0);
// // // //     const [showSkip, setShowSkip] = useState(false);
// // // //     const [showTagline, setShowTagline] = useState(false);
// // // //     const [fadeOut, setFadeOut] = useState(false);

// // // //     const triggerExit = useCallback(() => {
// // // //         if (exitingRef.current) return;
// // // //         exitingRef.current = true;
// // // //         setFadeOut(true);
// // // //     }, []);

// // // //     // Show skip button after 800 ms
// // // //     useEffect(() => {
// // // //         const t = setTimeout(() => setShowSkip(true), 800);
// // // //         return () => clearTimeout(t);
// // // //     }, []);

// // // //     // Call onComplete after fade-out finishes
// // // //     useEffect(() => {
// // // //         if (!fadeOut) return;
// // // //         const t = setTimeout(() => onComplete?.(), CONFIG.EXIT_DURATION * 1000);
// // // //         return () => clearTimeout(t);
// // // //     }, [fadeOut, onComplete]);

// // // //     // ── Main Three.js effect ─────────────────────────────────────────────────
// // // //     useEffect(() => {
// // // //         if (!canvasRef.current) return;
// // // //         const canvas = canvasRef.current;
// // // //         const W = window.innerWidth;
// // // //         const H = window.innerHeight;

// // // //         // Renderer
// // // //         const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
// // // //         renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
// // // //         renderer.setSize(W, H);
// // // //         renderer.setClearColor(0x04020e, 1);

// // // //         const scene = new THREE.Scene();
// // // //         const camera = new THREE.PerspectiveCamera(60, W / H, 0.1, 1000);
// // // //         camera.position.set(0, 0, CONFIG.CAMERA_START_Z);

// // // //         // Particle buffers
// // // //         const N = CONFIG.PARTICLE_COUNT;
// // // //         const positions = new Float32Array(N * 3);
// // // //         const velocities = new Float32Array(N * 3);
// // // //         const targets = new Float32Array(N * 3);
// // // //         const colors = new Float32Array(N * 3);
// // // //         const sizes = new Float32Array(N);
// // // //         const phaseOffsets = new Float32Array(N);

// // // //         const palette = CONFIG.PALETTE.map(h => new THREE.Color(h));

// // // //         for (let i = 0; i < N; i++) {
// // // //             positions[i * 3] = (Math.random() - 0.5) * 140;
// // // //             positions[i * 3 + 1] = (Math.random() - 0.5) * 100;
// // // //             positions[i * 3 + 2] = (Math.random() - 0.5) * 80;
// // // //             velocities[i * 3] = (Math.random() - 0.5) * 0.30;
// // // //             velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.30;
// // // //             velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.10;
// // // //             const c = palette[Math.floor(Math.random() * palette.length)];
// // // //             colors[i * 3] = c.r;
// // // //             colors[i * 3 + 1] = c.g;
// // // //             colors[i * 3 + 2] = c.b;
// // // //             sizes[i] = 1.5 + Math.random() * 3.0;
// // // //             phaseOffsets[i] = Math.random() * Math.PI * 2;
// // // //         }

// // // //         const geo = new THREE.BufferGeometry();
// // // //         geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
// // // //         geo.setAttribute('aColor', new THREE.BufferAttribute(colors, 3));
// // // //         geo.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));

// // // //         const mat = new THREE.ShaderMaterial({
// // // //             uniforms: {
// // // //                 uPixelRatio: { value: renderer.getPixelRatio() },
// // // //             },
// // // //             vertexShader: VERTEX_SHADER,
// // // //             fragmentShader: FRAGMENT_SHADER,
// // // //             transparent: true,
// // // //             depthWrite: false,
// // // //             blending: THREE.AdditiveBlending,
// // // //         });

// // // //         const points = new THREE.Points(geo, mat);
// // // //         scene.add(points);

// // // //         // Precompute orbital targets
// // // //         const orbitalTargets = buildOrbitalTargets(N);

// // // //         // State machine
// // // //         let phase = 'scatter';
// // // //         let phaseTime = 0;
// // // //         let totalTime = 0;
// // // //         let textPts = null;
// // // //         let cameraTargetZ = CONFIG.CAMERA_START_Z;
// // // //         let raf;

// // // //         const TOTAL = CONFIG.SCATTER_DURATION + CONFIG.ORBIT_DURATION
// // // //             + CONFIG.COLLAPSE_DURATION + CONFIG.TEXT_DURATION;

// // // //         // Sample text after DOM settles
// // // //         setTimeout(() => {
// // // //             textPts = sampleTextParticles('Aura', N, window.innerWidth);
// // // //         }, 100);

// // // //         function setTextTargets() {
// // // //             if (!textPts) return;
// // // //             for (let i = 0; i < N; i++) {
// // // //                 const pt = textPts[i % textPts.length];
// // // //                 targets[i * 3] = pt.x + (Math.random() - 0.5) * 0.6;
// // // //                 targets[i * 3 + 1] = pt.y + (Math.random() - 0.5) * 0.6;
// // // //                 targets[i * 3 + 2] = (Math.random() - 0.5) * 1.8;
// // // //             }
// // // //         }

// // // //         let lastT = performance.now();

// // // //         function tick(now) {
// // // //             raf = requestAnimationFrame(tick);
// // // //             const dt = Math.min((now - lastT) / 1000, 0.05);
// // // //             lastT = now;
// // // //             totalTime += dt;
// // // //             phaseTime += dt;

// // // //             setProgress(Math.min(totalTime / TOTAL, 1));

// // // //             // ── Phase transitions ──────────────────────────────────────────
// // // //             if (phase === 'scatter' && phaseTime >= CONFIG.SCATTER_DURATION) {
// // // //                 phase = 'orbit'; phaseTime = 0;
// // // //                 cameraTargetZ = CONFIG.CAMERA_ORBIT_Z;
// // // //             }
// // // //             if (phase === 'orbit' && phaseTime >= CONFIG.ORBIT_DURATION) {
// // // //                 phase = 'collapse'; phaseTime = 0;
// // // //                 setTextTargets();
// // // //                 cameraTargetZ = CONFIG.CAMERA_TEXT_Z + 6;
// // // //             }
// // // //             if (phase === 'collapse' && phaseTime >= CONFIG.COLLAPSE_DURATION) {
// // // //                 phase = 'text'; phaseTime = 0;
// // // //                 setShowTagline(true);
// // // //                 cameraTargetZ = CONFIG.CAMERA_TEXT_Z;
// // // //             }
// // // //             if (phase === 'text' && phaseTime >= CONFIG.TEXT_DURATION) {
// // // //                 if (!exitingRef.current) {
// // // //                     exitingRef.current = true;
// // // //                     setFadeOut(true);
// // // //                 }
// // // //                 phase = 'exit'; phaseTime = 0;
// // // //             }

// // // //             // External skip
// // // //             if (exitingRef.current && phase !== 'exit') {
// // // //                 phase = 'exit'; phaseTime = 0;
// // // //             }

// // // //             // ── Camera ─────────────────────────────────────────────────────
// // // //             camera.position.z += (cameraTargetZ - camera.position.z) * 0.028;
// // // //             const mx = mouseRef.current.x;
// // // //             const my = mouseRef.current.y;
// // // //             camera.position.x += (-mx * 2.5 - camera.position.x) * 0.022;
// // // //             camera.position.y += (my * 1.8 - camera.position.y) * 0.022;

// // // //             // Mouse → world coords at z = 0 plane
// // // //             const halfFov = THREE.MathUtils.degToRad(30);
// // // //             const mwx = mx * camera.position.z * Math.tan(halfFov);
// // // //             const mwy = my * camera.position.z * Math.tan(halfFov) / (W / H);

// // // //             // ── Particle update ────────────────────────────────────────────
// // // //             const posAttr = geo.attributes.position;
// // // //             const colAttr = geo.attributes.aColor;

// // // //             for (let i = 0; i < N; i++) {
// // // //                 const ix = i * 3, iy = i * 3 + 1, iz = i * 3 + 2;
// // // //                 let px = positions[ix], py = positions[iy], pz = positions[iz];

// // // //                 if (phase === 'scatter') {
// // // //                     velocities[ix] *= 0.983; velocities[iy] *= 0.983; velocities[iz] *= 0.983;
// // // //                     px += velocities[ix]; py += velocities[iy]; pz += velocities[iz];
// // // //                     px -= px * 0.006; py -= py * 0.006;
// // // //                     if (px > 85) px = -85; if (px < -85) px = 85;
// // // //                     if (py > 65) py = -65; if (py < -65) py = 65;

// // // //                 } else if (phase === 'orbit') {
// // // //                     const ox = orbitalTargets[ix];
// // // //                     const oy = orbitalTargets[iy];
// // // //                     const oz = orbitalTargets[iz];
// // // //                     // Rotate the orbital target around Y axis
// // // //                     const angle = totalTime * 0.16;
// // // //                     const cosA = Math.cos(angle);
// // // //                     const sinA = Math.sin(angle);
// // // //                     const rotX = ox * cosA - oz * sinA;
// // // //                     const rotZ = ox * sinA + oz * cosA;
// // // //                     const wave = Math.sin(totalTime * 0.85 + phaseOffsets[i]) * 0.9;
// // // //                     px += (rotX + wave * 0.2 - px) * 0.05;
// // // //                     py += (oy + Math.sin(totalTime * 0.65 + phaseOffsets[i]) * 0.7 - py) * 0.05;
// // // //                     pz += (rotZ - pz) * 0.05;

// // // //                 } else if (phase === 'collapse') {
// // // //                     px += (targets[ix] - px) * 0.075;
// // // //                     py += (targets[iy] - py) * 0.075;
// // // //                     pz += (targets[iz] - pz) * 0.075;

// // // //                 } else if (phase === 'text') {
// // // //                     const dx = px - mwx, dy = py - mwy;
// // // //                     const dist = Math.sqrt(dx * dx + dy * dy);
// // // //                     if (dist < CONFIG.REPEL_RADIUS && dist > 0.01) {
// // // //                         const f = ((CONFIG.REPEL_RADIUS - dist) / CONFIG.REPEL_RADIUS) ** 2;
// // // //                         px += (dx / dist) * f * CONFIG.REPEL_STRENGTH;
// // // //                         py += (dy / dist) * f * CONFIG.REPEL_STRENGTH;
// // // //                         pz += Math.sin(totalTime * 3 + phaseOffsets[i]) * f * 0.8;
// // // //                     }
// // // //                     const ease = dist < CONFIG.REPEL_RADIUS ? 0.016 : 0.032;
// // // //                     px += (targets[ix] - px) * ease;
// // // //                     py += (targets[iy] - py) * ease;
// // // //                     pz += (targets[iz] - pz) * ease;
// // // //                     // Subtle shimmer
// // // //                     px += Math.sin(totalTime * 2.2 + phaseOffsets[i]) * 0.014;
// // // //                     py += Math.cos(totalTime * 1.9 + phaseOffsets[i]) * 0.014;

// // // //                 } else if (phase === 'exit') {
// // // //                     const angle = i * 2.39996; // golden angle in radians
// // // //                     const speed = phaseTime * 28;
// // // //                     px += Math.cos(angle) * speed * dt;
// // // //                     py += Math.sin(angle) * speed * dt;
// // // //                     pz += Math.sin(angle * 1.618) * speed * 0.5 * dt;
// // // //                 }

// // // //                 positions[ix] = px; positions[iy] = py; positions[iz] = pz;
// // // //                 posAttr.array[ix] = px; posAttr.array[iy] = py; posAttr.array[iz] = pz;

// // // //                 // Color pulsing during collapse + text
// // // //                 if (phase === 'text' || phase === 'collapse') {
// // // //                     const t = (Math.sin(totalTime * 1.7 + phaseOffsets[i]) + 1) * 0.5;
// // // //                     const c1 = palette[i % palette.length];
// // // //                     const c2 = palette[(i + 2) % palette.length];
// // // //                     colAttr.array[ix] = c1.r + (c2.r - c1.r) * t * 0.4;
// // // //                     colAttr.array[iy] = c1.g + (c2.g - c1.g) * t * 0.4;
// // // //                     colAttr.array[iz] = c1.b + (c2.b - c1.b) * t * 0.4;
// // // //                 }
// // // //             }

// // // //             posAttr.needsUpdate = true;
// // // //             if (phase === 'text' || phase === 'collapse') colAttr.needsUpdate = true;

// // // //             renderer.render(scene, camera);
// // // //         }

// // // //         raf = requestAnimationFrame(tick);

// // // //         const onResize = () => {
// // // //             const w = window.innerWidth, h = window.innerHeight;
// // // //             camera.aspect = w / h;
// // // //             camera.updateProjectionMatrix();
// // // //             renderer.setSize(w, h);
// // // //         };
// // // //         window.addEventListener('resize', onResize);

// // // //         return () => {
// // // //             cancelAnimationFrame(raf);
// // // //             window.removeEventListener('resize', onResize);
// // // //             renderer.dispose();
// // // //             geo.dispose();
// // // //             mat.dispose();
// // // //         };
// // // //         // eslint-disable-next-line react-hooks/exhaustive-deps
// // // //     }, []);

// // // //     // Mouse tracking
// // // //     useEffect(() => {
// // // //         const onMove = e => {
// // // //             mouseRef.current.x = (e.clientX / window.innerWidth) * 2 - 1;
// // // //             mouseRef.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
// // // //         };
// // // //         const onTouch = e => {
// // // //             const t = e.touches[0];
// // // //             mouseRef.current.x = (t.clientX / window.innerWidth) * 2 - 1;
// // // //             mouseRef.current.y = -(t.clientY / window.innerHeight) * 2 + 1;
// // // //         };
// // // //         window.addEventListener('mousemove', onMove);
// // // //         window.addEventListener('touchmove', onTouch, { passive: true });
// // // //         return () => {
// // // //             window.removeEventListener('mousemove', onMove);
// // // //             window.removeEventListener('touchmove', onTouch);
// // // //         };
// // // //     }, []);

// // // //     // ── JSX ────────────────────────────────────────────────────────────────────
// // // //     return (
// // // //         <div style={{
// // // //             position: 'fixed', inset: 0, zIndex: 9999,
// // // //             background: '#04020e',
// // // //             opacity: fadeOut ? 0 : 1,
// // // //             transition: fadeOut ? `opacity ${CONFIG.EXIT_DURATION}s ease-in` : 'none',
// // // //             pointerEvents: fadeOut ? 'none' : 'all',
// // // //         }}>
// // // //             {/* Three.js canvas */}
// // // //             <canvas
// // // //                 ref={canvasRef}
// // // //                 style={{ display: 'block', width: '100%', height: '100%' }}
// // // //             />

// // // //             {/* Tagline */}
// // // //             <div style={{
// // // //                 position: 'absolute', top: '50%', left: '50%',
// // // //                 transform: 'translate(-50%, calc(-50% + 64px))',
// // // //                 fontFamily: 'Georgia, serif',
// // // //                 fontSize: 'clamp(11px, 1.5vw, 15px)',
// // // //                 letterSpacing: '0.30em',
// // // //                 textTransform: 'uppercase',
// // // //                 color: 'rgba(180, 160, 255, 0.75)',
// // // //                 opacity: showTagline ? 1 : 0,
// // // //                 transition: 'opacity 1.4s ease',
// // // //                 whiteSpace: 'nowrap',
// // // //                 userSelect: 'none',
// // // //                 pointerEvents: 'none',
// // // //             }}>
// // // //                 Where aesthetics meet soul
// // // //             </div>

// // // //             {/* Bottom UI */}
// // // //             <div style={{
// // // //                 position: 'absolute', bottom: 0, left: 0, right: 0,
// // // //                 display: 'flex', flexDirection: 'column', alignItems: 'center',
// // // //                 paddingBottom: '48px', gap: '20px',
// // // //                 pointerEvents: 'none',
// // // //             }}>
// // // //                 {/* Progress bar */}
// // // //                 <div style={{
// // // //                     width: '120px', height: '1px',
// // // //                     background: 'rgba(255,255,255,0.08)',
// // // //                     overflow: 'hidden',
// // // //                     opacity: showSkip ? 1 : 0,
// // // //                     transition: 'opacity 0.8s',
// // // //                 }}>
// // // //                     <div style={{
// // // //                         height: '100%',
// // // //                         width: `${progress * 100}%`,
// // // //                         background: 'linear-gradient(90deg, #7b68ee, #c084fc)',
// // // //                         transition: 'width 0.12s linear',
// // // //                     }} />
// // // //                 </div>

// // // //                 {/* Skip button */}
// // // //                 <button
// // // //                     onClick={triggerExit}
// // // //                     style={{
// // // //                         pointerEvents: showSkip ? 'all' : 'none',
// // // //                         cursor: 'pointer',
// // // //                         background: 'rgba(255,255,255,0.05)',
// // // //                         border: '1px solid rgba(255,255,255,0.16)',
// // // //                         color: 'rgba(255,255,255,0.6)',
// // // //                         fontFamily: 'sans-serif',
// // // //                         fontSize: '11px',
// // // //                         letterSpacing: '0.16em',
// // // //                         textTransform: 'uppercase',
// // // //                         padding: '10px 32px',
// // // //                         backdropFilter: 'blur(12px)',
// // // //                         borderRadius: '2px',
// // // //                         opacity: showSkip ? 1 : 0,
// // // //                         transition: 'opacity 0.8s, background 0.2s, color 0.2s',
// // // //                     }}
// // // //                     onMouseEnter={e => {
// // // //                         e.currentTarget.style.background = 'rgba(255,255,255,0.13)';
// // // //                         e.currentTarget.style.color = '#fff';
// // // //                     }}
// // // //                     onMouseLeave={e => {
// // // //                         e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
// // // //                         e.currentTarget.style.color = 'rgba(255,255,255,0.6)';
// // // //                     }}
// // // //                 >
// // // //                     Skip intro
// // // //                 </button>
// // // //             </div>

// // // //             {/* Corner branding */}
// // // //             <div style={{
// // // //                 position: 'absolute', top: '32px', left: '40px',
// // // //                 fontFamily: 'Georgia, serif',
// // // //                 fontSize: '22px',
// // // //                 letterSpacing: '0.18em',
// // // //                 color: 'rgba(255,255,255,0.10)',
// // // //                 userSelect: 'none',
// // // //                 pointerEvents: 'none',
// // // //             }}>
// // // //                 AURA
// // // //             </div>
// // // //         </div>
// // // //     );
// // // // }

// // // // // ─────────────────────────────────────────────────────────────────────────────
// // // // // GATE WRAPPER
// // // // // ─────────────────────────────────────────────────────────────────────────────
// // // // let _introSeen = false;

// // // // export function AuraIntroGate({ children }) {
// // // //     const [done, setDone] = useState(_introSeen);

// // // //     const handleComplete = useCallback(() => {
// // // //         _introSeen = true;
// // // //         setDone(true);
// // // //     }, []);

// // // //     if (done) return children;

// // // //     return (
// // // //         <>
// // // //             <AuraIntro onComplete={handleComplete} />
// // // //             {/* Pre-hydrate children invisibly */}
// // // //             <div style={{ visibility: 'hidden', position: 'absolute', inset: 0, pointerEvents: 'none' }}>
// // // //                 {children}
// // // //             </div>
// // // //         </>
// // // //     );
// // // // }


// // // // AuraIntro.jsx — Enhanced, color-corrected, tagline-in-orbit
// // // // DEPENDENCIES: npm install three
// // // //
// // // // USAGE:
// // // //   import { AuraIntroGate } from './AuraIntro';
// // // //   <AuraIntroGate><Home /></AuraIntroGate>

// // // import { useEffect, useRef, useState, useCallback } from 'react';
// // // import * as THREE from 'three';

// // // // ─────────────────────────────────────────────────────────────────────────────
// // // // CONFIG
// // // // ─────────────────────────────────────────────────────────────────────────────
// // // const CONFIG = {
// // //     PARTICLE_COUNT: 2800,
// // //     SCATTER_DURATION: 1.4,
// // //     ORBIT_DURATION: 4.5,   // slightly longer so tagline reads cleanly in ring
// // //     COLLAPSE_DURATION: 1.8,
// // //     TEXT_DURATION: 9.0,
// // //     EXIT_DURATION: 2.0,
// // //     REPEL_RADIUS: 10,
// // //     REPEL_STRENGTH: 8,
// // //     CAMERA_START_Z: 58,
// // //     CAMERA_ORBIT_Z: 48,
// // //     CAMERA_TEXT_Z: 36,
// // //     PALETTE: [
// // //         0x7b68ee, // indigo
// // //         0xc084fc, // violet
// // //         0x818cf8, // lavender
// // //         0xe879f9, // fuchsia
// // //         0xa78bfa, // purple
// // //         0x60a5fa, // blue accent
// // //     ],
// // // };

// // // // ─────────────────────────────────────────────────────────────────────────────
// // // // SHADERS
// // // // Core fix: multiply vColor by a brightness factor instead of adding white vec3.
// // // // This keeps the particle's own hue saturated — no blowout to white.
// // // // ─────────────────────────────────────────────────────────────────────────────
// // // const VERTEX_SHADER = /* glsl */`
// // //   attribute float aSize;
// // //   attribute vec3  aColor;
// // //   varying   vec3  vColor;
// // //   varying   float vDist;
// // //   uniform   float uPixelRatio;

// // //   void main() {
// // //     vColor = aColor;
// // //     vec4 mv = modelViewMatrix * vec4(position, 1.0);
// // //     vDist   = -mv.z;
// // //     float s = aSize * uPixelRatio * (300.0 / max(vDist, 1.0));
// // //     gl_PointSize = clamp(s, 1.0, 16.0);
// // //     gl_Position  = projectionMatrix * mv;
// // //   }
// // // `;

// // // const FRAGMENT_SHADER = /* glsl */`
// // //   varying vec3  vColor;
// // //   varying float vDist;

// // //   void main() {
// // //     vec2  uv = gl_PointCoord - 0.5;
// // //     float d  = length(uv);
// // //     if (d > 0.5) discard;

// // //     // Three layers — keep alpha controlled so additive blending stays colored
// // //     float core = 1.0 - smoothstep(0.0,  0.18, d);
// // //     float mid  = 1.0 - smoothstep(0.12, 0.36, d);
// // //     float glow = 1.0 - smoothstep(0.28, 0.50, d);

// // //     float a = core * 0.82 + mid * 0.32 + glow * 0.12;
// // //     a *= smoothstep(130.0, 16.0, vDist);

// // //     // Brighten toward own hue — multiply, not add white
// // //     vec3 col = vColor * (1.0 + core * 0.60 + mid * 0.20);

// // //     gl_FragColor = vec4(col, clamp(a, 0.0, 1.0));
// // //   }
// // // `;

// // // // ─────────────────────────────────────────────────────────────────────────────
// // // // HELPER — sample text pixels into Three.js world coords
// // // // ─────────────────────────────────────────────────────────────────────────────
// // // function sampleTextParticles(text, count, containerWidth) {
// // //     const offCanvas = document.createElement('canvas');
// // //     const fontSize = Math.floor(Math.min(containerWidth, 900) * 0.19);
// // //     offCanvas.width = Math.min(containerWidth, 900);
// // //     offCanvas.height = Math.round(fontSize * 1.6);
// // //     const ctx = offCanvas.getContext('2d');
// // //     ctx.clearRect(0, 0, offCanvas.width, offCanvas.height);
// // //     ctx.fillStyle = '#fff';
// // //     ctx.font = `bold ${fontSize}px Georgia, serif`;
// // //     ctx.textAlign = 'center';
// // //     ctx.textBaseline = 'middle';
// // //     ctx.fillText(text, offCanvas.width / 2, offCanvas.height / 2);

// // //     const imgData = ctx.getImageData(0, 0, offCanvas.width, offCanvas.height);
// // //     const pts = [];
// // //     for (let y = 0; y < offCanvas.height; y += 2) {
// // //         for (let x = 0; x < offCanvas.width; x += 2) {
// // //             if (imgData.data[(y * offCanvas.width + x) * 4 + 3] > 120) {
// // //                 pts.push({
// // //                     x: ((x / offCanvas.width) - 0.5) * 58,
// // //                     y: -((y / offCanvas.height) - 0.5) * 20,
// // //                 });
// // //             }
// // //         }
// // //     }
// // //     for (let i = pts.length - 1; i > 0; i--) {
// // //         const j = Math.floor(Math.random() * (i + 1));
// // //         [pts[i], pts[j]] = [pts[j], pts[i]];
// // //     }
// // //     const step = Math.max(1, Math.floor(pts.length / count));
// // //     const sampled = [];
// // //     for (let i = 0; i < pts.length && sampled.length < count; i += step) sampled.push(pts[i]);
// // //     while (sampled.length < count)
// // //         sampled.push(pts[Math.floor(Math.random() * pts.length)] ?? { x: 0, y: 0 });
// // //     return sampled.slice(0, count);
// // // }

// // // // ─────────────────────────────────────────────────────────────────────────────
// // // // HELPER — orbital target positions
// // // // ─────────────────────────────────────────────────────────────────────────────
// // // function buildOrbitalTargets(count) {
// // //     const shapes = [
// // //         ...Array.from({ length: 110 }, (_, i) => {
// // //             const a = (i / 110) * Math.PI * 2;
// // //             return { x: Math.cos(a) * 24, y: Math.sin(a) * 10, z: Math.sin(a * 2) * 5 };
// // //         }),
// // //         ...Array.from({ length: 70 }, (_, i) => {
// // //             const a = (i / 70) * Math.PI * 2;
// // //             return { x: Math.cos(a) * 16, y: Math.sin(a) * 7, z: Math.cos(a) * 7 };
// // //         }),
// // //         ...Array.from({ length: 40 }, (_, i) => {
// // //             const a = (i / 40) * Math.PI * 2;
// // //             return { x: Math.cos(a) * 8, y: Math.sin(a) * 3, z: Math.sin(a) * 8 };
// // //         }),
// // //         ...Array.from({ length: 120 }, () => ({
// // //             x: -14 + (Math.random() - 0.5) * 10,
// // //             y: 4 + (Math.random() - 0.5) * 12,
// // //             z: (Math.random() - 0.5) * 5,
// // //         })),
// // //         ...Array.from({ length: 120 }, () => ({
// // //             x: 14 + (Math.random() - 0.5) * 10,
// // //             y: -2 + (Math.random() - 0.5) * 10,
// // //             z: (Math.random() - 0.5) * 5,
// // //         })),
// // //         ...Array.from({ length: 80 }, () => ({
// // //             x: (Math.random() - 0.5) * 55,
// // //             y: (Math.random() - 0.5) * 32,
// // //             z: (Math.random() - 0.5) * 14,
// // //         })),
// // //     ];

// // //     const targets = new Float32Array(count * 3);
// // //     for (let i = 0; i < count; i++) {
// // //         const s = shapes[i % shapes.length];
// // //         targets[i * 3] = s.x + (Math.random() - 0.5) * 2.5;
// // //         targets[i * 3 + 1] = s.y + (Math.random() - 0.5) * 2.5;
// // //         targets[i * 3 + 2] = (s.z ?? 0) + (Math.random() - 0.5) * 1.5;
// // //     }
// // //     return targets;
// // // }

// // // // ─────────────────────────────────────────────────────────────────────────────
// // // // MAIN COMPONENT
// // // // ─────────────────────────────────────────────────────────────────────────────
// // // export default function AuraIntro({ onComplete }) {
// // //     const canvasRef = useRef(null);
// // //     const mouseRef = useRef({ x: 9999, y: 9999 });
// // //     const exitingRef = useRef(false);

// // //     const [progress, setProgress] = useState(0);
// // //     const [showSkip, setShowSkip] = useState(false);
// // //     // 'hidden' | 'orbit' | 'below' | 'out'
// // //     const [taglinePhase, setTaglinePhase] = useState('hidden');
// // //     const [fadeOut, setFadeOut] = useState(false);

// // //     const triggerExit = useCallback(() => {
// // //         if (exitingRef.current) return;
// // //         exitingRef.current = true;
// // //         setFadeOut(true);
// // //         setTaglinePhase('out');
// // //     }, []);

// // //     useEffect(() => {
// // //         const t = setTimeout(() => setShowSkip(true), 800);
// // //         return () => clearTimeout(t);
// // //     }, []);

// // //     useEffect(() => {
// // //         if (!fadeOut) return;
// // //         const t = setTimeout(() => onComplete?.(), CONFIG.EXIT_DURATION * 1000);
// // //         return () => clearTimeout(t);
// // //     }, [fadeOut, onComplete]);

// // //     // ── Main Three.js loop ──────────────────────────────────────────────────────
// // //     useEffect(() => {
// // //         if (!canvasRef.current) return;
// // //         const canvas = canvasRef.current;
// // //         const W = window.innerWidth;
// // //         const H = window.innerHeight;

// // //         const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
// // //         renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
// // //         renderer.setSize(W, H);
// // //         renderer.setClearColor(0x04020e, 1);

// // //         const scene = new THREE.Scene();
// // //         const camera = new THREE.PerspectiveCamera(60, W / H, 0.1, 1000);
// // //         camera.position.set(0, 0, CONFIG.CAMERA_START_Z);

// // //         const N = CONFIG.PARTICLE_COUNT;
// // //         const positions = new Float32Array(N * 3);
// // //         const velocities = new Float32Array(N * 3);
// // //         const targets = new Float32Array(N * 3);
// // //         const colors = new Float32Array(N * 3);
// // //         const sizes = new Float32Array(N);
// // //         const phaseOffsets = new Float32Array(N);

// // //         const palette = CONFIG.PALETTE.map(h => new THREE.Color(h));

// // //         for (let i = 0; i < N; i++) {
// // //             positions[i * 3] = (Math.random() - 0.5) * 140;
// // //             positions[i * 3 + 1] = (Math.random() - 0.5) * 100;
// // //             positions[i * 3 + 2] = (Math.random() - 0.5) * 80;
// // //             velocities[i * 3] = (Math.random() - 0.5) * 0.30;
// // //             velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.30;
// // //             velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.10;
// // //             const c = palette[Math.floor(Math.random() * palette.length)];
// // //             colors[i * 3] = c.r; colors[i * 3 + 1] = c.g; colors[i * 3 + 2] = c.b;
// // //             sizes[i] = 1.4 + Math.random() * 2.8;
// // //             phaseOffsets[i] = Math.random() * Math.PI * 2;
// // //         }

// // //         const geo = new THREE.BufferGeometry();
// // //         geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
// // //         geo.setAttribute('aColor', new THREE.BufferAttribute(colors, 3));
// // //         geo.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));

// // //         const mat = new THREE.ShaderMaterial({
// // //             uniforms: { uPixelRatio: { value: renderer.getPixelRatio() } },
// // //             vertexShader: VERTEX_SHADER,
// // //             fragmentShader: FRAGMENT_SHADER,
// // //             transparent: true,
// // //             depthWrite: false,
// // //             blending: THREE.AdditiveBlending,
// // //         });

// // //         scene.add(new THREE.Points(geo, mat));

// // //         const orbitalTargets = buildOrbitalTargets(N);

// // //         let phase = 'scatter';
// // //         let phaseTime = 0;
// // //         let totalTime = 0;
// // //         let textPts = null;
// // //         let cameraTargetZ = CONFIG.CAMERA_START_Z;
// // //         let raf;

// // //         const TOTAL = CONFIG.SCATTER_DURATION + CONFIG.ORBIT_DURATION
// // //             + CONFIG.COLLAPSE_DURATION + CONFIG.TEXT_DURATION;

// // //         setTimeout(() => { textPts = sampleTextParticles('Aura', N, window.innerWidth); }, 100);

// // //         function setTextTargets() {
// // //             if (!textPts) return;
// // //             for (let i = 0; i < N; i++) {
// // //                 const pt = textPts[i % textPts.length];
// // //                 targets[i * 3] = pt.x + (Math.random() - 0.5) * 0.6;
// // //                 targets[i * 3 + 1] = pt.y + (Math.random() - 0.5) * 0.6;
// // //                 targets[i * 3 + 2] = (Math.random() - 0.5) * 1.8;
// // //             }
// // //         }

// // //         let lastT = performance.now();

// // //         function tick(now) {
// // //             raf = requestAnimationFrame(tick);
// // //             const dt = Math.min((now - lastT) / 1000, 0.05);
// // //             lastT = now;
// // //             totalTime += dt;
// // //             phaseTime += dt;

// // //             setProgress(Math.min(totalTime / TOTAL, 1));

// // //             // Phase transitions
// // //             if (phase === 'scatter' && phaseTime >= CONFIG.SCATTER_DURATION) {
// // //                 phase = 'orbit'; phaseTime = 0;
// // //                 cameraTargetZ = CONFIG.CAMERA_ORBIT_Z;
// // //                 setTaglinePhase('orbit');        // ← tagline appears inside ring
// // //             }
// // //             if (phase === 'orbit' && phaseTime >= CONFIG.ORBIT_DURATION) {
// // //                 phase = 'collapse'; phaseTime = 0;
// // //                 setTextTargets();
// // //                 cameraTargetZ = CONFIG.CAMERA_TEXT_Z + 6;
// // //                 setTaglinePhase('hidden');       // ← hide while particles collapse
// // //             }
// // //             if (phase === 'collapse' && phaseTime >= CONFIG.COLLAPSE_DURATION) {
// // //                 phase = 'text'; phaseTime = 0;
// // //                 cameraTargetZ = CONFIG.CAMERA_TEXT_Z;
// // //                 setTaglinePhase('below');        // ← reappear well below particle text
// // //             }
// // //             if (phase === 'text' && phaseTime >= CONFIG.TEXT_DURATION) {
// // //                 if (!exitingRef.current) {
// // //                     exitingRef.current = true;
// // //                     setFadeOut(true);
// // //                     setTaglinePhase('out');
// // //                 }
// // //                 phase = 'exit'; phaseTime = 0;
// // //             }
// // //             if (exitingRef.current && phase !== 'exit') {
// // //                 phase = 'exit'; phaseTime = 0;
// // //             }

// // //             // Camera
// // //             camera.position.z += (cameraTargetZ - camera.position.z) * 0.028;
// // //             const mx = mouseRef.current.x;
// // //             const my = mouseRef.current.y;
// // //             camera.position.x += (-mx * 2.5 - camera.position.x) * 0.022;
// // //             camera.position.y += (my * 1.8 - camera.position.y) * 0.022;

// // //             const halfFov = THREE.MathUtils.degToRad(30);
// // //             const mwx = mx * camera.position.z * Math.tan(halfFov);
// // //             const mwy = my * camera.position.z * Math.tan(halfFov) / (W / H);

// // //             // Particle update
// // //             const posAttr = geo.attributes.position;
// // //             const colAttr = geo.attributes.aColor;

// // //             for (let i = 0; i < N; i++) {
// // //                 const ix = i * 3, iy = i * 3 + 1, iz = i * 3 + 2;
// // //                 let px = positions[ix], py = positions[iy], pz = positions[iz];

// // //                 if (phase === 'scatter') {
// // //                     velocities[ix] *= 0.983; velocities[iy] *= 0.983; velocities[iz] *= 0.983;
// // //                     px += velocities[ix]; py += velocities[iy]; pz += velocities[iz];
// // //                     px -= px * 0.006; py -= py * 0.006;
// // //                     if (px > 85) px = -85; if (px < -85) px = 85;
// // //                     if (py > 65) py = -65; if (py < -65) py = 65;

// // //                 } else if (phase === 'orbit') {
// // //                     const ox = orbitalTargets[ix];
// // //                     const oy = orbitalTargets[iy];
// // //                     const oz = orbitalTargets[iz];
// // //                     const angle = totalTime * 0.16;
// // //                     const cosA = Math.cos(angle);
// // //                     const sinA = Math.sin(angle);
// // //                     const rotX = ox * cosA - oz * sinA;
// // //                     const rotZ = ox * sinA + oz * cosA;
// // //                     const wave = Math.sin(totalTime * 0.85 + phaseOffsets[i]) * 0.9;
// // //                     px += (rotX + wave * 0.2 - px) * 0.05;
// // //                     py += (oy + Math.sin(totalTime * 0.65 + phaseOffsets[i]) * 0.7 - py) * 0.05;
// // //                     pz += (rotZ - pz) * 0.05;

// // //                 } else if (phase === 'collapse') {
// // //                     px += (targets[ix] - px) * 0.075;
// // //                     py += (targets[iy] - py) * 0.075;
// // //                     pz += (targets[iz] - pz) * 0.075;

// // //                 } else if (phase === 'text') {
// // //                     const dx = px - mwx, dy = py - mwy;
// // //                     const dist = Math.sqrt(dx * dx + dy * dy);
// // //                     if (dist < CONFIG.REPEL_RADIUS && dist > 0.01) {
// // //                         const f = ((CONFIG.REPEL_RADIUS - dist) / CONFIG.REPEL_RADIUS) ** 2;
// // //                         px += (dx / dist) * f * CONFIG.REPEL_STRENGTH;
// // //                         py += (dy / dist) * f * CONFIG.REPEL_STRENGTH;
// // //                         pz += Math.sin(totalTime * 3 + phaseOffsets[i]) * f * 0.8;
// // //                     }
// // //                     const ease = dist < CONFIG.REPEL_RADIUS ? 0.016 : 0.032;
// // //                     px += (targets[ix] - px) * ease;
// // //                     py += (targets[iy] - py) * ease;
// // //                     pz += (targets[iz] - pz) * ease;
// // //                     px += Math.sin(totalTime * 2.2 + phaseOffsets[i]) * 0.013;
// // //                     py += Math.cos(totalTime * 1.9 + phaseOffsets[i]) * 0.013;

// // //                 } else if (phase === 'exit') {
// // //                     const angle = i * 2.39996;
// // //                     const speed = phaseTime * 28;
// // //                     px += Math.cos(angle) * speed * dt;
// // //                     py += Math.sin(angle) * speed * dt;
// // //                     pz += Math.sin(angle * 1.618) * speed * 0.5 * dt;
// // //                 }

// // //                 positions[ix] = px; positions[iy] = py; positions[iz] = pz;
// // //                 posAttr.array[ix] = px; posAttr.array[iy] = py; posAttr.array[iz] = pz;

// // //                 // Color pulsing — interpolate between palette hues only, no white
// // //                 if (phase === 'text' || phase === 'collapse') {
// // //                     const t = (Math.sin(totalTime * 1.7 + phaseOffsets[i]) + 1) * 0.5;
// // //                     const c1 = palette[i % palette.length];
// // //                     const c2 = palette[(i + 2) % palette.length];
// // //                     colAttr.array[ix] = Math.min(c1.r + (c2.r - c1.r) * t * 0.5, 0.90);
// // //                     colAttr.array[iy] = Math.min(c1.g + (c2.g - c1.g) * t * 0.5, 0.90);
// // //                     colAttr.array[iz] = Math.min(c1.b + (c2.b - c1.b) * t * 0.5, 0.90);
// // //                 }
// // //             }

// // //             posAttr.needsUpdate = true;
// // //             if (phase === 'text' || phase === 'collapse') colAttr.needsUpdate = true;

// // //             renderer.render(scene, camera);
// // //         }

// // //         raf = requestAnimationFrame(tick);

// // //         const onResize = () => {
// // //             const w = window.innerWidth, h = window.innerHeight;
// // //             camera.aspect = w / h;
// // //             camera.updateProjectionMatrix();
// // //             renderer.setSize(w, h);
// // //         };
// // //         window.addEventListener('resize', onResize);

// // //         return () => {
// // //             cancelAnimationFrame(raf);
// // //             window.removeEventListener('resize', onResize);
// // //             renderer.dispose();
// // //             geo.dispose();
// // //             mat.dispose();
// // //         };
// // //         // eslint-disable-next-line react-hooks/exhaustive-deps
// // //     }, []);

// // //     // Mouse tracking
// // //     useEffect(() => {
// // //         const onMove = e => {
// // //             mouseRef.current.x = (e.clientX / window.innerWidth) * 2 - 1;
// // //             mouseRef.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
// // //         };
// // //         const onTouch = e => {
// // //             const t = e.touches[0];
// // //             mouseRef.current.x = (t.clientX / window.innerWidth) * 2 - 1;
// // //             mouseRef.current.y = -(t.clientY / window.innerHeight) * 2 + 1;
// // //         };
// // //         window.addEventListener('mousemove', onMove);
// // //         window.addEventListener('touchmove', onTouch, { passive: true });
// // //         return () => {
// // //             window.removeEventListener('mousemove', onMove);
// // //             window.removeEventListener('touchmove', onTouch);
// // //         };
// // //     }, []);

// // //     // ── Tagline style — changes per phase ──────────────────────────────────────
// // //     // orbit: centered inside the rotating ring, small italic
// // //     // below: positioned below the particle text with safe vertical gap
// // //     const taglineVisible = taglinePhase === 'orbit' || taglinePhase === 'below';

// // //     const taglineBase = {
// // //         position: 'absolute',
// // //         left: '50%',
// // //         fontFamily: 'Georgia, serif',
// // //         textTransform: 'uppercase',
// // //         whiteSpace: 'nowrap',
// // //         userSelect: 'none',
// // //         pointerEvents: 'none',
// // //         opacity: taglineVisible ? 1 : 0,
// // //         transition: 'opacity 1.1s ease, top 0.9s ease, font-size 0.6s ease, letter-spacing 0.6s ease',
// // //     };

// // //     const taglineStyle = taglinePhase === 'orbit'
// // //         ? {
// // //             ...taglineBase,
// // //             // Sit inside the ring — center of screen, vertically centered
// // //             top: '50%',
// // //             transform: 'translate(-50%, -50%)',
// // //             fontSize: 'clamp(9px, 1.0vw, 12px)',
// // //             letterSpacing: '0.28em',
// // //             color: 'rgba(210, 190, 255, 0.65)',
// // //             fontStyle: 'italic',
// // //         }
// // //         : taglinePhase === 'below'
// // //             ? {
// // //                 ...taglineBase,
// // //                 // Below the "Aura" particle text.
// // //                 // Particles sit near vertical center; push tagline 115–130px below.
// // //                 top: 'calc(50% + 120px)',
// // //                 transform: 'translateX(-50%)',
// // //                 fontSize: 'clamp(10px, 1.2vw, 13px)',
// // //                 letterSpacing: '0.32em',
// // //                 color: 'rgba(180, 160, 255, 0.68)',
// // //                 fontStyle: 'normal',
// // //             }
// // //             : {
// // //                 // hidden / out — invisible, keep in DOM for smooth fade
// // //                 ...taglineBase,
// // //                 top: '50%',
// // //                 transform: 'translate(-50%, -50%)',
// // //                 fontSize: 'clamp(10px, 1.2vw, 13px)',
// // //                 letterSpacing: '0.28em',
// // //                 color: 'rgba(180, 160, 255, 0)',
// // //             };

// // //     // ── JSX ────────────────────────────────────────────────────────────────────
// // //     return (
// // //         <div style={{
// // //             position: 'fixed',
// // //             inset: 0,
// // //             zIndex: 9999,
// // //             background: '#04020e',
// // //             opacity: fadeOut ? 0 : 1,
// // //             transition: fadeOut ? `opacity ${CONFIG.EXIT_DURATION}s ease-in` : 'none',
// // //             pointerEvents: fadeOut ? 'none' : 'all',
// // //         }}>
// // //             <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />

// // //             {/* Tagline — floats in ring during orbit, moves below text during text phase */}
// // //             <div style={taglineStyle}>
// // //                 Where aesthetics meet soul
// // //             </div>

// // //             {/* Bottom UI */}
// // //             <div style={{
// // //                 position: 'absolute',
// // //                 bottom: 0, left: 0, right: 0,
// // //                 display: 'flex',
// // //                 flexDirection: 'column',
// // //                 alignItems: 'center',
// // //                 paddingBottom: '48px',
// // //                 gap: '20px',
// // //                 pointerEvents: 'none',
// // //             }}>
// // //                 <div style={{
// // //                     width: '120px',
// // //                     height: '1px',
// // //                     background: 'rgba(255,255,255,0.08)',
// // //                     overflow: 'hidden',
// // //                     opacity: showSkip ? 1 : 0,
// // //                     transition: 'opacity 0.8s',
// // //                 }}>
// // //                     <div style={{
// // //                         height: '100%',
// // //                         width: `${progress * 100}%`,
// // //                         background: 'linear-gradient(90deg, #7b68ee, #c084fc)',
// // //                         transition: 'width 0.12s linear',
// // //                     }} />
// // //                 </div>

// // //                 <button
// // //                     onClick={triggerExit}
// // //                     style={{
// // //                         pointerEvents: showSkip ? 'all' : 'none',
// // //                         cursor: 'pointer',
// // //                         background: 'rgba(255,255,255,0.05)',
// // //                         border: '1px solid rgba(255,255,255,0.16)',
// // //                         color: 'rgba(255,255,255,0.60)',
// // //                         fontFamily: 'sans-serif',
// // //                         fontSize: '11px',
// // //                         letterSpacing: '0.16em',
// // //                         textTransform: 'uppercase',
// // //                         padding: '10px 32px',
// // //                         backdropFilter: 'blur(12px)',
// // //                         borderRadius: '2px',
// // //                         opacity: showSkip ? 1 : 0,
// // //                         transition: 'opacity 0.8s, background 0.2s, color 0.2s',
// // //                     }}
// // //                     onMouseEnter={e => {
// // //                         e.currentTarget.style.background = 'rgba(255,255,255,0.13)';
// // //                         e.currentTarget.style.color = '#fff';
// // //                     }}
// // //                     onMouseLeave={e => {
// // //                         e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
// // //                         e.currentTarget.style.color = 'rgba(255,255,255,0.60)';
// // //                     }}
// // //                 >
// // //                     Skip intro
// // //                 </button>
// // //             </div>

// // //             {/* Corner branding */}
// // //             <div style={{
// // //                 position: 'absolute',
// // //                 top: '32px',
// // //                 left: '40px',
// // //                 fontFamily: 'Georgia, serif',
// // //                 fontSize: '22px',
// // //                 letterSpacing: '0.18em',
// // //                 color: 'rgba(255,255,255,0.10)',
// // //                 userSelect: 'none',
// // //                 pointerEvents: 'none',
// // //             }}>
// // //                 AURA
// // //             </div>
// // //         </div>
// // //     );
// // // }

// // // // ─────────────────────────────────────────────────────────────────────────────
// // // // GATE WRAPPER
// // // // ─────────────────────────────────────────────────────────────────────────────
// // // let _introSeen = false;

// // // export function AuraIntroGate({ children }) {
// // //     const [done, setDone] = useState(_introSeen);

// // //     const handleComplete = useCallback(() => {
// // //         _introSeen = true;
// // //         setDone(true);
// // //     }, []);

// // //     if (done) return children;

// // //     return (
// // //         <>
// // //             <AuraIntro onComplete={handleComplete} />
// // //             <div style={{ visibility: 'hidden', position: 'absolute', inset: 0, pointerEvents: 'none' }}>
// // //                 {children}
// // //             </div>
// // //         </>
// // //     );
// // // }


// // // AuraIntro.jsx — Enhanced, color-corrected, tagline-in-orbit
// // // DEPENDENCIES: npm install three
// // //
// // // USAGE:
// // //   import { AuraIntroGate } from './AuraIntro';
// // //   <AuraIntroGate><Home /></AuraIntroGate>

// // import { useEffect, useRef, useState, useCallback } from 'react';
// // import * as THREE from 'three';

// // // ─────────────────────────────────────────────────────────────────────────────
// // // CONFIG
// // // ─────────────────────────────────────────────────────────────────────────────
// // const CONFIG = {
// //     PARTICLE_COUNT: 2800,
// //     SCATTER_DURATION: 2.2,   // longer so streams are visible before orbit
// //     ORBIT_DURATION: 4.5,   // slightly longer so tagline reads cleanly in ring
// //     COLLAPSE_DURATION: 1.8,
// //     TEXT_DURATION: 9.0,
// //     EXIT_DURATION: 2.0,
// //     REPEL_RADIUS: 10,
// //     REPEL_STRENGTH: 8,
// //     CAMERA_START_Z: 58,
// //     CAMERA_ORBIT_Z: 48,
// //     CAMERA_TEXT_Z: 36,
// //     PALETTE: [
// //         0x7b68ee, // indigo
// //         0xc084fc, // violet
// //         0x818cf8, // lavender
// //         0xe879f9, // fuchsia
// //         0xa78bfa, // purple
// //         0x60a5fa, // blue accent
// //     ],
// // };

// // // ─────────────────────────────────────────────────────────────────────────────
// // // SHADERS
// // // Core fix: multiply vColor by a brightness factor instead of adding white vec3.
// // // This keeps the particle's own hue saturated — no blowout to white.
// // // ─────────────────────────────────────────────────────────────────────────────
// // const VERTEX_SHADER = /* glsl */`
// //   attribute float aSize;
// //   attribute vec3  aColor;
// //   varying   vec3  vColor;
// //   varying   float vDist;
// //   uniform   float uPixelRatio;

// //   void main() {
// //     vColor = aColor;
// //     vec4 mv = modelViewMatrix * vec4(position, 1.0);
// //     vDist   = -mv.z;
// //     float s = aSize * uPixelRatio * (300.0 / max(vDist, 1.0));
// //     gl_PointSize = clamp(s, 1.0, 16.0);
// //     gl_Position  = projectionMatrix * mv;
// //   }
// // `;

// // const FRAGMENT_SHADER = /* glsl */`
// //   varying vec3  vColor;
// //   varying float vDist;

// //   void main() {
// //     vec2  uv = gl_PointCoord - 0.5;
// //     float d  = length(uv);
// //     if (d > 0.5) discard;

// //     // Three layers — keep alpha controlled so additive blending stays colored
// //     float core = 1.0 - smoothstep(0.0,  0.18, d);
// //     float mid  = 1.0 - smoothstep(0.12, 0.36, d);
// //     float glow = 1.0 - smoothstep(0.28, 0.50, d);

// //     float a = core * 0.82 + mid * 0.32 + glow * 0.12;
// //     a *= smoothstep(130.0, 16.0, vDist);

// //     // Brighten toward own hue — multiply, not add white
// //     vec3 col = vColor * (1.0 + core * 0.60 + mid * 0.20);

// //     gl_FragColor = vec4(col, clamp(a, 0.0, 1.0));
// //   }
// // `;

// // // ─────────────────────────────────────────────────────────────────────────────
// // // HELPER — sample text pixels into Three.js world coords
// // // ─────────────────────────────────────────────────────────────────────────────
// // function sampleTextParticles(text, count, containerWidth) {
// //     const offCanvas = document.createElement('canvas');
// //     const fontSize = Math.floor(Math.min(containerWidth, 900) * 0.19);
// //     offCanvas.width = Math.min(containerWidth, 900);
// //     offCanvas.height = Math.round(fontSize * 1.6);
// //     const ctx = offCanvas.getContext('2d');
// //     ctx.clearRect(0, 0, offCanvas.width, offCanvas.height);
// //     ctx.fillStyle = '#fff';
// //     ctx.font = `bold ${fontSize}px Georgia, serif`;
// //     ctx.textAlign = 'center';
// //     ctx.textBaseline = 'middle';
// //     ctx.fillText(text, offCanvas.width / 2, offCanvas.height / 2);

// //     const imgData = ctx.getImageData(0, 0, offCanvas.width, offCanvas.height);
// //     const pts = [];
// //     for (let y = 0; y < offCanvas.height; y += 2) {
// //         for (let x = 0; x < offCanvas.width; x += 2) {
// //             if (imgData.data[(y * offCanvas.width + x) * 4 + 3] > 120) {
// //                 pts.push({
// //                     x: ((x / offCanvas.width) - 0.5) * 58,
// //                     y: -((y / offCanvas.height) - 0.5) * 20,
// //                 });
// //             }
// //         }
// //     }
// //     for (let i = pts.length - 1; i > 0; i--) {
// //         const j = Math.floor(Math.random() * (i + 1));
// //         [pts[i], pts[j]] = [pts[j], pts[i]];
// //     }
// //     const step = Math.max(1, Math.floor(pts.length / count));
// //     const sampled = [];
// //     for (let i = 0; i < pts.length && sampled.length < count; i += step) sampled.push(pts[i]);
// //     while (sampled.length < count)
// //         sampled.push(pts[Math.floor(Math.random() * pts.length)] ?? { x: 0, y: 0 });
// //     return sampled.slice(0, count);
// // }

// // // ─────────────────────────────────────────────────────────────────────────────
// // // HELPER — orbital target positions
// // // ─────────────────────────────────────────────────────────────────────────────
// // function buildOrbitalTargets(count) {
// //     const shapes = [
// //         ...Array.from({ length: 110 }, (_, i) => {
// //             const a = (i / 110) * Math.PI * 2;
// //             return { x: Math.cos(a) * 24, y: Math.sin(a) * 10, z: Math.sin(a * 2) * 5 };
// //         }),
// //         ...Array.from({ length: 70 }, (_, i) => {
// //             const a = (i / 70) * Math.PI * 2;
// //             return { x: Math.cos(a) * 16, y: Math.sin(a) * 7, z: Math.cos(a) * 7 };
// //         }),
// //         ...Array.from({ length: 40 }, (_, i) => {
// //             const a = (i / 40) * Math.PI * 2;
// //             return { x: Math.cos(a) * 8, y: Math.sin(a) * 3, z: Math.sin(a) * 8 };
// //         }),
// //         ...Array.from({ length: 120 }, () => ({
// //             x: -14 + (Math.random() - 0.5) * 10,
// //             y: 4 + (Math.random() - 0.5) * 12,
// //             z: (Math.random() - 0.5) * 5,
// //         })),
// //         ...Array.from({ length: 120 }, () => ({
// //             x: 14 + (Math.random() - 0.5) * 10,
// //             y: -2 + (Math.random() - 0.5) * 10,
// //             z: (Math.random() - 0.5) * 5,
// //         })),
// //         ...Array.from({ length: 80 }, () => ({
// //             x: (Math.random() - 0.5) * 55,
// //             y: (Math.random() - 0.5) * 32,
// //             z: (Math.random() - 0.5) * 14,
// //         })),
// //     ];

// //     const targets = new Float32Array(count * 3);
// //     for (let i = 0; i < count; i++) {
// //         const s = shapes[i % shapes.length];
// //         targets[i * 3] = s.x + (Math.random() - 0.5) * 2.5;
// //         targets[i * 3 + 1] = s.y + (Math.random() - 0.5) * 2.5;
// //         targets[i * 3 + 2] = (s.z ?? 0) + (Math.random() - 0.5) * 1.5;
// //     }
// //     return targets;
// // }

// // // ─────────────────────────────────────────────────────────────────────────────
// // // MAIN COMPONENT
// // // ─────────────────────────────────────────────────────────────────────────────
// // export default function AuraIntro({ onComplete }) {
// //     const canvasRef = useRef(null);
// //     const mouseRef = useRef({ x: 9999, y: 9999 });
// //     const exitingRef = useRef(false);

// //     const [progress, setProgress] = useState(0);
// //     const [showSkip, setShowSkip] = useState(false);
// //     // 'hidden' | 'orbit' | 'below' | 'out'
// //     const [taglinePhase, setTaglinePhase] = useState('hidden');
// //     const [fadeOut, setFadeOut] = useState(false);

// //     const triggerExit = useCallback(() => {
// //         if (exitingRef.current) return;
// //         exitingRef.current = true;
// //         setFadeOut(true);
// //         setTaglinePhase('out');
// //     }, []);

// //     useEffect(() => {
// //         const t = setTimeout(() => setShowSkip(true), 800);
// //         return () => clearTimeout(t);
// //     }, []);

// //     useEffect(() => {
// //         if (!fadeOut) return;
// //         const t = setTimeout(() => onComplete?.(), CONFIG.EXIT_DURATION * 1000);
// //         return () => clearTimeout(t);
// //     }, [fadeOut, onComplete]);

// //     // ── Main Three.js loop ──────────────────────────────────────────────────────
// //     useEffect(() => {
// //         if (!canvasRef.current) return;
// //         const canvas = canvasRef.current;
// //         const W = window.innerWidth;
// //         const H = window.innerHeight;

// //         const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
// //         renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
// //         renderer.setSize(W, H);
// //         renderer.setClearColor(0x04020e, 1);

// //         const scene = new THREE.Scene();
// //         const camera = new THREE.PerspectiveCamera(60, W / H, 0.1, 1000);
// //         camera.position.set(0, 0, CONFIG.CAMERA_START_Z);

// //         const N = CONFIG.PARTICLE_COUNT;
// //         const positions = new Float32Array(N * 3);
// //         const velocities = new Float32Array(N * 3);
// //         const targets = new Float32Array(N * 3);
// //         const colors = new Float32Array(N * 3);
// //         const sizes = new Float32Array(N);
// //         const phaseOffsets = new Float32Array(N);

// //         const palette = CONFIG.PALETTE.map(h => new THREE.Color(h));

// //         for (let i = 0; i < N; i++) {
// //             // Spawn from one of 4 screen edges (plus corners), well outside view
// //             // so particles visibly stream IN from all directions on load
// //             const edge = Math.floor(Math.random() * 4);
// //             let sx, sy, sz, vx, vy, vz;
// //             sz = (Math.random() - 0.5) * 60;
// //             vz = (Math.random() - 0.5) * 0.08;

// //             if (edge === 0) {
// //                 // Left edge → stream rightward
// //                 sx = -110 - Math.random() * 60;
// //                 sy = (Math.random() - 0.5) * 110;
// //                 vx = 0.35 + Math.random() * 0.55;
// //                 vy = (Math.random() - 0.5) * 0.25;
// //             } else if (edge === 1) {
// //                 // Right edge → stream leftward
// //                 sx = 110 + Math.random() * 60;
// //                 sy = (Math.random() - 0.5) * 110;
// //                 vx = -(0.35 + Math.random() * 0.55);
// //                 vy = (Math.random() - 0.5) * 0.25;
// //             } else if (edge === 2) {
// //                 // Top edge → stream downward
// //                 sx = (Math.random() - 0.5) * 160;
// //                 sy = 80 + Math.random() * 40;
// //                 vx = (Math.random() - 0.5) * 0.25;
// //                 vy = -(0.30 + Math.random() * 0.45);
// //             } else {
// //                 // Bottom edge → stream upward
// //                 sx = (Math.random() - 0.5) * 160;
// //                 sy = -80 - Math.random() * 40;
// //                 vx = (Math.random() - 0.5) * 0.25;
// //                 vy = 0.30 + Math.random() * 0.45;
// //             }

// //             positions[i * 3] = sx;
// //             positions[i * 3 + 1] = sy;
// //             positions[i * 3 + 2] = sz;
// //             velocities[i * 3] = vx;
// //             velocities[i * 3 + 1] = vy;
// //             velocities[i * 3 + 2] = vz;

// //             const c = palette[Math.floor(Math.random() * palette.length)];
// //             colors[i * 3] = c.r; colors[i * 3 + 1] = c.g; colors[i * 3 + 2] = c.b;
// //             sizes[i] = 1.4 + Math.random() * 2.8;
// //             phaseOffsets[i] = Math.random() * Math.PI * 2;
// //         }

// //         const geo = new THREE.BufferGeometry();
// //         geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
// //         geo.setAttribute('aColor', new THREE.BufferAttribute(colors, 3));
// //         geo.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));

// //         const mat = new THREE.ShaderMaterial({
// //             uniforms: { uPixelRatio: { value: renderer.getPixelRatio() } },
// //             vertexShader: VERTEX_SHADER,
// //             fragmentShader: FRAGMENT_SHADER,
// //             transparent: true,
// //             depthWrite: false,
// //             blending: THREE.AdditiveBlending,
// //         });

// //         scene.add(new THREE.Points(geo, mat));

// //         const orbitalTargets = buildOrbitalTargets(N);

// //         let phase = 'scatter';
// //         let phaseTime = 0;
// //         let totalTime = 0;
// //         let textPts = null;
// //         let cameraTargetZ = CONFIG.CAMERA_START_Z;
// //         let raf;

// //         const TOTAL = CONFIG.SCATTER_DURATION + CONFIG.ORBIT_DURATION
// //             + CONFIG.COLLAPSE_DURATION + CONFIG.TEXT_DURATION;

// //         setTimeout(() => { textPts = sampleTextParticles('Aura', N, window.innerWidth); }, 100);

// //         function setTextTargets() {
// //             if (!textPts) return;
// //             for (let i = 0; i < N; i++) {
// //                 const pt = textPts[i % textPts.length];
// //                 targets[i * 3] = pt.x + (Math.random() - 0.5) * 0.6;
// //                 targets[i * 3 + 1] = pt.y + (Math.random() - 0.5) * 0.6;
// //                 targets[i * 3 + 2] = (Math.random() - 0.5) * 1.8;
// //             }
// //         }

// //         let lastT = performance.now();

// //         function tick(now) {
// //             raf = requestAnimationFrame(tick);
// //             const dt = Math.min((now - lastT) / 1000, 0.05);
// //             lastT = now;
// //             totalTime += dt;
// //             phaseTime += dt;

// //             setProgress(Math.min(totalTime / TOTAL, 1));

// //             // Phase transitions
// //             if (phase === 'scatter' && phaseTime >= CONFIG.SCATTER_DURATION) {
// //                 phase = 'orbit'; phaseTime = 0;
// //                 cameraTargetZ = CONFIG.CAMERA_ORBIT_Z;
// //                 setTaglinePhase('orbit');        // ← tagline appears inside ring
// //             }
// //             if (phase === 'orbit' && phaseTime >= CONFIG.ORBIT_DURATION) {
// //                 phase = 'collapse'; phaseTime = 0;
// //                 setTextTargets();
// //                 cameraTargetZ = CONFIG.CAMERA_TEXT_Z + 6;
// //                 setTaglinePhase('hidden');       // ← hide while particles collapse
// //             }
// //             if (phase === 'collapse' && phaseTime >= CONFIG.COLLAPSE_DURATION) {
// //                 phase = 'text'; phaseTime = 0;
// //                 cameraTargetZ = CONFIG.CAMERA_TEXT_Z;
// //                 setTaglinePhase('below');        // ← reappear well below particle text
// //             }
// //             if (phase === 'text' && phaseTime >= CONFIG.TEXT_DURATION) {
// //                 if (!exitingRef.current) {
// //                     exitingRef.current = true;
// //                     setFadeOut(true);
// //                     setTaglinePhase('out');
// //                 }
// //                 phase = 'exit'; phaseTime = 0;
// //             }
// //             if (exitingRef.current && phase !== 'exit') {
// //                 phase = 'exit'; phaseTime = 0;
// //             }

// //             // Camera
// //             camera.position.z += (cameraTargetZ - camera.position.z) * 0.028;
// //             const mx = mouseRef.current.x;
// //             const my = mouseRef.current.y;
// //             camera.position.x += (-mx * 2.5 - camera.position.x) * 0.022;
// //             camera.position.y += (my * 1.8 - camera.position.y) * 0.022;

// //             const halfFov = THREE.MathUtils.degToRad(30);
// //             const mwx = mx * camera.position.z * Math.tan(halfFov);
// //             const mwy = my * camera.position.z * Math.tan(halfFov) / (W / H);

// //             // Particle update
// //             const posAttr = geo.attributes.position;
// //             const colAttr = geo.attributes.aColor;

// //             for (let i = 0; i < N; i++) {
// //                 const ix = i * 3, iy = i * 3 + 1, iz = i * 3 + 2;
// //                 let px = positions[ix], py = positions[iy], pz = positions[iz];

// //                 if (phase === 'scatter') {
// //                     // Very gentle decel — particles keep most of their speed and drift freely
// //                     velocities[ix] *= 0.995; velocities[iy] *= 0.995; velocities[iz] *= 0.995;
// //                     px += velocities[ix]; py += velocities[iy]; pz += velocities[iz];
// //                     // Soft wrap so screen stays full of streaming dots
// //                     if (px > 120) px = -120; if (px < -120) px = 120;
// //                     if (py > 85) py = -85; if (py < -85) py = 85;

// //                 } else if (phase === 'orbit') {
// //                     const ox = orbitalTargets[ix];
// //                     const oy = orbitalTargets[iy];
// //                     const oz = orbitalTargets[iz];
// //                     const angle = totalTime * 0.16;
// //                     const cosA = Math.cos(angle);
// //                     const sinA = Math.sin(angle);
// //                     const rotX = ox * cosA - oz * sinA;
// //                     const rotZ = ox * sinA + oz * cosA;
// //                     const wave = Math.sin(totalTime * 0.85 + phaseOffsets[i]) * 0.9;
// //                     px += (rotX + wave * 0.2 - px) * 0.05;
// //                     py += (oy + Math.sin(totalTime * 0.65 + phaseOffsets[i]) * 0.7 - py) * 0.05;
// //                     pz += (rotZ - pz) * 0.05;

// //                 } else if (phase === 'collapse') {
// //                     px += (targets[ix] - px) * 0.075;
// //                     py += (targets[iy] - py) * 0.075;
// //                     pz += (targets[iz] - pz) * 0.075;

// //                 } else if (phase === 'text') {
// //                     const dx = px - mwx, dy = py - mwy;
// //                     const dist = Math.sqrt(dx * dx + dy * dy);
// //                     if (dist < CONFIG.REPEL_RADIUS && dist > 0.01) {
// //                         const f = ((CONFIG.REPEL_RADIUS - dist) / CONFIG.REPEL_RADIUS) ** 2;
// //                         px += (dx / dist) * f * CONFIG.REPEL_STRENGTH;
// //                         py += (dy / dist) * f * CONFIG.REPEL_STRENGTH;
// //                         pz += Math.sin(totalTime * 3 + phaseOffsets[i]) * f * 0.8;
// //                     }
// //                     const ease = dist < CONFIG.REPEL_RADIUS ? 0.016 : 0.032;
// //                     px += (targets[ix] - px) * ease;
// //                     py += (targets[iy] - py) * ease;
// //                     pz += (targets[iz] - pz) * ease;
// //                     px += Math.sin(totalTime * 2.2 + phaseOffsets[i]) * 0.013;
// //                     py += Math.cos(totalTime * 1.9 + phaseOffsets[i]) * 0.013;

// //                 } else if (phase === 'exit') {
// //                     const angle = i * 2.39996;
// //                     const speed = phaseTime * 28;
// //                     px += Math.cos(angle) * speed * dt;
// //                     py += Math.sin(angle) * speed * dt;
// //                     pz += Math.sin(angle * 1.618) * speed * 0.5 * dt;
// //                 }

// //                 positions[ix] = px; positions[iy] = py; positions[iz] = pz;
// //                 posAttr.array[ix] = px; posAttr.array[iy] = py; posAttr.array[iz] = pz;

// //                 // Color pulsing — interpolate between palette hues only, no white
// //                 if (phase === 'text' || phase === 'collapse') {
// //                     const t = (Math.sin(totalTime * 1.7 + phaseOffsets[i]) + 1) * 0.5;
// //                     const c1 = palette[i % palette.length];
// //                     const c2 = palette[(i + 2) % palette.length];
// //                     colAttr.array[ix] = Math.min(c1.r + (c2.r - c1.r) * t * 0.5, 0.90);
// //                     colAttr.array[iy] = Math.min(c1.g + (c2.g - c1.g) * t * 0.5, 0.90);
// //                     colAttr.array[iz] = Math.min(c1.b + (c2.b - c1.b) * t * 0.5, 0.90);
// //                 }
// //             }

// //             posAttr.needsUpdate = true;
// //             if (phase === 'text' || phase === 'collapse') colAttr.needsUpdate = true;

// //             renderer.render(scene, camera);
// //         }

// //         raf = requestAnimationFrame(tick);

// //         const onResize = () => {
// //             const w = window.innerWidth, h = window.innerHeight;
// //             camera.aspect = w / h;
// //             camera.updateProjectionMatrix();
// //             renderer.setSize(w, h);
// //         };
// //         window.addEventListener('resize', onResize);

// //         return () => {
// //             cancelAnimationFrame(raf);
// //             window.removeEventListener('resize', onResize);
// //             renderer.dispose();
// //             geo.dispose();
// //             mat.dispose();
// //         };
// //         // eslint-disable-next-line react-hooks/exhaustive-deps
// //     }, []);

// //     // Mouse tracking
// //     useEffect(() => {
// //         const onMove = e => {
// //             mouseRef.current.x = (e.clientX / window.innerWidth) * 2 - 1;
// //             mouseRef.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
// //         };
// //         const onTouch = e => {
// //             const t = e.touches[0];
// //             mouseRef.current.x = (t.clientX / window.innerWidth) * 2 - 1;
// //             mouseRef.current.y = -(t.clientY / window.innerHeight) * 2 + 1;
// //         };
// //         window.addEventListener('mousemove', onMove);
// //         window.addEventListener('touchmove', onTouch, { passive: true });
// //         return () => {
// //             window.removeEventListener('mousemove', onMove);
// //             window.removeEventListener('touchmove', onTouch);
// //         };
// //     }, []);

// //     // ── Tagline style — changes per phase ──────────────────────────────────────
// //     // orbit: centered inside the rotating ring, small italic
// //     // below: positioned below the particle text with safe vertical gap
// //     const taglineVisible = taglinePhase === 'orbit' || taglinePhase === 'below';

// //     const taglineBase = {
// //         position: 'absolute',
// //         left: '50%',
// //         fontFamily: 'Georgia, serif',
// //         textTransform: 'uppercase',
// //         whiteSpace: 'nowrap',
// //         userSelect: 'none',
// //         pointerEvents: 'none',
// //         opacity: taglineVisible ? 1 : 0,
// //         transition: 'opacity 1.1s ease, top 0.9s ease, font-size 0.6s ease, letter-spacing 0.6s ease',
// //     };

// //     const taglineStyle = taglinePhase === 'orbit'
// //         ? {
// //             ...taglineBase,
// //             // Sit inside the ring — center of screen, vertically centered
// //             top: '50%',
// //             transform: 'translate(-50%, -50%)',
// //             fontSize: 'clamp(9px, 1.0vw, 12px)',
// //             letterSpacing: '0.28em',
// //             color: 'rgba(210, 190, 255, 0.65)',
// //             fontStyle: 'italic',
// //         }
// //         : taglinePhase === 'below'
// //             ? {
// //                 ...taglineBase,
// //                 // Below the "Aura" particle text.
// //                 // Particles sit near vertical center; push tagline 115–130px below.
// //                 top: 'calc(50% + 120px)',
// //                 transform: 'translateX(-50%)',
// //                 fontSize: 'clamp(10px, 1.2vw, 13px)',
// //                 letterSpacing: '0.32em',
// //                 color: 'rgba(180, 160, 255, 0.68)',
// //                 fontStyle: 'normal',
// //             }
// //             : {
// //                 // hidden / out — invisible, keep in DOM for smooth fade
// //                 ...taglineBase,
// //                 top: '50%',
// //                 transform: 'translate(-50%, -50%)',
// //                 fontSize: 'clamp(10px, 1.2vw, 13px)',
// //                 letterSpacing: '0.28em',
// //                 color: 'rgba(180, 160, 255, 0)',
// //             };

// //     // ── JSX ────────────────────────────────────────────────────────────────────
// //     return (
// //         <div style={{
// //             position: 'fixed',
// //             inset: 0,
// //             zIndex: 9999,
// //             background: '#04020e',
// //             opacity: fadeOut ? 0 : 1,
// //             transition: fadeOut ? `opacity ${CONFIG.EXIT_DURATION}s ease-in` : 'none',
// //             pointerEvents: fadeOut ? 'none' : 'all',
// //         }}>
// //             <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />

// //             {/* Tagline — floats in ring during orbit, moves below text during text phase */}
// //             <div style={taglineStyle}>
// //                 Where aesthetics meet soul
// //             </div>

// //             {/* Bottom UI */}
// //             <div style={{
// //                 position: 'absolute',
// //                 bottom: 0, left: 0, right: 0,
// //                 display: 'flex',
// //                 flexDirection: 'column',
// //                 alignItems: 'center',
// //                 paddingBottom: '48px',
// //                 gap: '20px',
// //                 pointerEvents: 'none',
// //             }}>
// //                 <div style={{
// //                     width: '120px',
// //                     height: '1px',
// //                     background: 'rgba(255,255,255,0.08)',
// //                     overflow: 'hidden',
// //                     opacity: showSkip ? 1 : 0,
// //                     transition: 'opacity 0.8s',
// //                 }}>
// //                     <div style={{
// //                         height: '100%',
// //                         width: `${progress * 100}%`,
// //                         background: 'linear-gradient(90deg, #7b68ee, #c084fc)',
// //                         transition: 'width 0.12s linear',
// //                     }} />
// //                 </div>

// //                 <button
// //                     onClick={triggerExit}
// //                     style={{
// //                         pointerEvents: showSkip ? 'all' : 'none',
// //                         cursor: 'pointer',
// //                         background: 'rgba(255,255,255,0.05)',
// //                         border: '1px solid rgba(255,255,255,0.16)',
// //                         color: 'rgba(255,255,255,0.60)',
// //                         fontFamily: 'sans-serif',
// //                         fontSize: '11px',
// //                         letterSpacing: '0.16em',
// //                         textTransform: 'uppercase',
// //                         padding: '10px 32px',
// //                         backdropFilter: 'blur(12px)',
// //                         borderRadius: '2px',
// //                         opacity: showSkip ? 1 : 0,
// //                         transition: 'opacity 0.8s, background 0.2s, color 0.2s',
// //                     }}
// //                     onMouseEnter={e => {
// //                         e.currentTarget.style.background = 'rgba(255,255,255,0.13)';
// //                         e.currentTarget.style.color = '#fff';
// //                     }}
// //                     onMouseLeave={e => {
// //                         e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
// //                         e.currentTarget.style.color = 'rgba(255,255,255,0.60)';
// //                     }}
// //                 >
// //                     Skip intro
// //                 </button>
// //             </div>

// //             {/* Corner branding */}
// //             <div style={{
// //                 position: 'absolute',
// //                 top: '32px',
// //                 left: '40px',
// //                 fontFamily: 'Georgia, serif',
// //                 fontSize: '22px',
// //                 letterSpacing: '0.18em',
// //                 color: 'rgba(255,255,255,0.10)',
// //                 userSelect: 'none',
// //                 pointerEvents: 'none',
// //             }}>
// //                 AURA
// //             </div>
// //         </div>
// //     );
// // }

// // // ─────────────────────────────────────────────────────────────────────────────
// // // GATE WRAPPER
// // // ─────────────────────────────────────────────────────────────────────────────
// // let _introSeen = false;

// // export function AuraIntroGate({ children }) {
// //     const [done, setDone] = useState(_introSeen);

// //     const handleComplete = useCallback(() => {
// //         _introSeen = true;
// //         setDone(true);
// //     }, []);

// //     if (done) return children;

// //     return (
// //         <>
// //             <AuraIntro onComplete={handleComplete} />
// //             <div style={{ visibility: 'hidden', position: 'absolute', inset: 0, pointerEvents: 'none' }}>
// //                 {children}
// //             </div>
// //         </>
// //     );
// // }


// import { useEffect, useRef, useState, useCallback } from 'react';
// import * as THREE from 'three';

// // ─────────────────────────────────────────────────────────────────────────────
// // CONFIG
// // ─────────────────────────────────────────────────────────────────────────────
// const CONFIG = {
//     PARTICLE_COUNT: 2800,
//     SCATTER_DURATION: 2.2,   // longer so streams are visible before orbit
//     ORBIT_DURATION: 4.5,   // slightly longer so tagline reads cleanly in ring
//     COLLAPSE_DURATION: 1.8,
//     TEXT_DURATION: 9.0,
//     EXIT_DURATION: 2.0,
//     REPEL_RADIUS: 10,
//     REPEL_STRENGTH: 8,
//     CAMERA_START_Z: 58,
//     CAMERA_ORBIT_Z: 48,
//     CAMERA_TEXT_Z: 36,
//     PALETTE: [
//         0x7b68ee, // indigo
//         0xc084fc, // violet
//         0x818cf8, // lavender
//         0xe879f9, // fuchsia
//         0xa78bfa, // purple
//         0x60a5fa, // blue accent
//     ],
// };

// // ─────────────────────────────────────────────────────────────────────────────
// // SHADERS
// // Core fix: multiply vColor by a brightness factor instead of adding white vec3.
// // This keeps the particle's own hue saturated — no blowout to white.
// // ─────────────────────────────────────────────────────────────────────────────
// const VERTEX_SHADER = /* glsl */`
//   attribute float aSize;
//   attribute vec3  aColor;
//   varying   vec3  vColor;
//   varying   float vDist;
//   uniform   float uPixelRatio;

//   void main() {
//     vColor = aColor;
//     vec4 mv = modelViewMatrix * vec4(position, 1.0);
//     vDist   = -mv.z;
//     float s = aSize * uPixelRatio * (300.0 / max(vDist, 1.0));
//     gl_PointSize = clamp(s, 1.0, 16.0);
//     gl_Position  = projectionMatrix * mv;
//   }
// `;

// const FRAGMENT_SHADER = /* glsl */`
//   varying vec3  vColor;
//   varying float vDist;

//   void main() {
//     vec2  uv = gl_PointCoord - 0.5;
//     float d  = length(uv);
//     if (d > 0.5) discard;

//     // Three layers — keep alpha controlled so additive blending stays colored
//     float core = 1.0 - smoothstep(0.0,  0.18, d);
//     float mid  = 1.0 - smoothstep(0.12, 0.36, d);
//     float glow = 1.0 - smoothstep(0.28, 0.50, d);

//     float a = core * 0.82 + mid * 0.32 + glow * 0.12;
//     a *= smoothstep(130.0, 16.0, vDist);

//     // Brighten toward own hue — multiply, not add white
//     vec3 col = vColor * (1.0 + core * 0.60 + mid * 0.20);

//     gl_FragColor = vec4(col, clamp(a, 0.0, 1.0));
//   }
// `;

// // ─────────────────────────────────────────────────────────────────────────────
// // HELPER — sample text pixels into Three.js world coords
// // ─────────────────────────────────────────────────────────────────────────────
// function sampleTextParticles(text, count, containerWidth) {
//     const offCanvas = document.createElement('canvas');
//     const fontSize = Math.floor(Math.min(containerWidth, 900) * 0.19);
//     offCanvas.width = Math.min(containerWidth, 900);
//     offCanvas.height = Math.round(fontSize * 1.6);
//     const ctx = offCanvas.getContext('2d');
//     ctx.clearRect(0, 0, offCanvas.width, offCanvas.height);
//     ctx.fillStyle = '#fff';
//     ctx.font = `bold ${fontSize}px Georgia, serif`;
//     ctx.textAlign = 'center';
//     ctx.textBaseline = 'middle';
//     ctx.fillText(text, offCanvas.width / 2, offCanvas.height / 2);

//     const imgData = ctx.getImageData(0, 0, offCanvas.width, offCanvas.height);
//     const pts = [];
//     for (let y = 0; y < offCanvas.height; y += 2) {
//         for (let x = 0; x < offCanvas.width; x += 2) {
//             if (imgData.data[(y * offCanvas.width + x) * 4 + 3] > 120) {
//                 pts.push({
//                     x: ((x / offCanvas.width) - 0.5) * 58,
//                     y: -((y / offCanvas.height) - 0.5) * 20,
//                 });
//             }
//         }
//     }
//     for (let i = pts.length - 1; i > 0; i--) {
//         const j = Math.floor(Math.random() * (i + 1));
//         [pts[i], pts[j]] = [pts[j], pts[i]];
//     }
//     const step = Math.max(1, Math.floor(pts.length / count));
//     const sampled = [];
//     for (let i = 0; i < pts.length && sampled.length < count; i += step) sampled.push(pts[i]);
//     while (sampled.length < count)
//         sampled.push(pts[Math.floor(Math.random() * pts.length)] ?? { x: 0, y: 0 });
//     return sampled.slice(0, count);
// }

// // ─────────────────────────────────────────────────────────────────────────────
// // HELPER — orbital target positions
// // ─────────────────────────────────────────────────────────────────────────────
// function buildOrbitalTargets(count) {
//     const shapes = [
//         ...Array.from({ length: 110 }, (_, i) => {
//             const a = (i / 110) * Math.PI * 2;
//             return { x: Math.cos(a) * 24, y: Math.sin(a) * 10, z: Math.sin(a * 2) * 5 };
//         }),
//         ...Array.from({ length: 70 }, (_, i) => {
//             const a = (i / 70) * Math.PI * 2;
//             return { x: Math.cos(a) * 16, y: Math.sin(a) * 7, z: Math.cos(a) * 7 };
//         }),
//         ...Array.from({ length: 40 }, (_, i) => {
//             const a = (i / 40) * Math.PI * 2;
//             return { x: Math.cos(a) * 8, y: Math.sin(a) * 3, z: Math.sin(a) * 8 };
//         }),
//         ...Array.from({ length: 120 }, () => ({
//             x: -14 + (Math.random() - 0.5) * 10,
//             y: 4 + (Math.random() - 0.5) * 12,
//             z: (Math.random() - 0.5) * 5,
//         })),
//         ...Array.from({ length: 120 }, () => ({
//             x: 14 + (Math.random() - 0.5) * 10,
//             y: -2 + (Math.random() - 0.5) * 10,
//             z: (Math.random() - 0.5) * 5,
//         })),
//         ...Array.from({ length: 80 }, () => ({
//             x: (Math.random() - 0.5) * 55,
//             y: (Math.random() - 0.5) * 32,
//             z: (Math.random() - 0.5) * 14,
//         })),
//     ];

//     const targets = new Float32Array(count * 3);
//     for (let i = 0; i < count; i++) {
//         const s = shapes[i % shapes.length];
//         targets[i * 3] = s.x + (Math.random() - 0.5) * 2.5;
//         targets[i * 3 + 1] = s.y + (Math.random() - 0.5) * 2.5;
//         targets[i * 3 + 2] = (s.z ?? 0) + (Math.random() - 0.5) * 1.5;
//     }
//     return targets;
// }

// // ─────────────────────────────────────────────────────────────────────────────
// // MAIN COMPONENT
// // ─────────────────────────────────────────────────────────────────────────────
// export default function AuraIntro({ onComplete }) {
//     const canvasRef = useRef(null);
//     const mouseRef = useRef({ x: 9999, y: 9999 });
//     const exitingRef = useRef(false);

//     const [progress, setProgress] = useState(0);
//     const [showSkip, setShowSkip] = useState(false);
//     // 'hidden' | 'orbit' | 'below' | 'out'
//     const [taglinePhase, setTaglinePhase] = useState('hidden');
//     const [fadeOut, setFadeOut] = useState(false);

//     const triggerExit = useCallback(() => {
//         if (exitingRef.current) return;
//         exitingRef.current = true;
//         setFadeOut(true);
//         setTaglinePhase('out');
//     }, []);

//     useEffect(() => {
//         const t = setTimeout(() => setShowSkip(true), 800);
//         return () => clearTimeout(t);
//     }, []);

//     useEffect(() => {
//         if (!fadeOut) return;
//         const t = setTimeout(() => onComplete?.(), CONFIG.EXIT_DURATION * 1000);
//         return () => clearTimeout(t);
//     }, [fadeOut, onComplete]);

//     // ── Main Three.js loop ──────────────────────────────────────────────────────
//     useEffect(() => {
//         if (!canvasRef.current) return;
//         const canvas = canvasRef.current;
//         const W = window.innerWidth;
//         const H = window.innerHeight;

//         const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
//         renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
//         renderer.setSize(W, H);
//         renderer.setClearColor(0x04020e, 1);

//         const scene = new THREE.Scene();
//         const camera = new THREE.PerspectiveCamera(60, W / H, 0.1, 1000);
//         camera.position.set(0, 0, CONFIG.CAMERA_START_Z);

//         const N = CONFIG.PARTICLE_COUNT;
//         const positions = new Float32Array(N * 3);
//         const velocities = new Float32Array(N * 3);
//         const targets = new Float32Array(N * 3);
//         const colors = new Float32Array(N * 3);
//         const sizes = new Float32Array(N);
//         const phaseOffsets = new Float32Array(N);

//         const palette = CONFIG.PALETTE.map(h => new THREE.Color(h));

//         for (let i = 0; i < N; i++) {
//             // Start far away in all directions (spherical distribution)
//             const theta = Math.random() * Math.PI * 2;
//             const phi = Math.acos((Math.random() * 2) - 1);
//             const r = 200 + Math.random() * 150;

//             const sx = r * Math.sin(phi) * Math.cos(theta);
//             const sy = r * Math.sin(phi) * Math.sin(theta);
//             const sz = r * Math.cos(phi);

//             positions[i * 3] = sx;
//             positions[i * 3 + 1] = sy;
//             positions[i * 3 + 2] = sz;

//             // Direct velocity inward toward the center
//             const speed = 1.0 + Math.random() * 1.5;
//             velocities[i * 3] = -sx * speed / r;
//             velocities[i * 3 + 1] = -sy * speed / r;
//             velocities[i * 3 + 2] = -sz * speed / r;

//             const c = palette[Math.floor(Math.random() * palette.length)];
//             colors[i * 3] = c.r; colors[i * 3 + 1] = c.g; colors[i * 3 + 2] = c.b;
//             sizes[i] = 1.4 + Math.random() * 2.8;
//             phaseOffsets[i] = Math.random() * Math.PI * 2;
//         }

//         const geo = new THREE.BufferGeometry();
//         geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
//         geo.setAttribute('aColor', new THREE.BufferAttribute(colors, 3));
//         geo.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));

//         const mat = new THREE.ShaderMaterial({
//             uniforms: { uPixelRatio: { value: renderer.getPixelRatio() } },
//             vertexShader: VERTEX_SHADER,
//             fragmentShader: FRAGMENT_SHADER,
//             transparent: true,
//             depthWrite: false,
//             blending: THREE.AdditiveBlending,
//         });

//         scene.add(new THREE.Points(geo, mat));

//         const orbitalTargets = buildOrbitalTargets(N);

//         let phase = 'scatter';
//         let phaseTime = 0;
//         let totalTime = 0;
//         let textPts = null;
//         let cameraTargetZ = CONFIG.CAMERA_START_Z;
//         let raf;

//         const TOTAL = CONFIG.SCATTER_DURATION + CONFIG.ORBIT_DURATION
//             + CONFIG.COLLAPSE_DURATION + CONFIG.TEXT_DURATION;

//         setTimeout(() => { textPts = sampleTextParticles('Aura', N, window.innerWidth); }, 100);

//         function setTextTargets() {
//             if (!textPts) return;
//             for (let i = 0; i < N; i++) {
//                 const pt = textPts[i % textPts.length];
//                 targets[i * 3] = pt.x + (Math.random() - 0.5) * 0.6;
//                 targets[i * 3 + 1] = pt.y + (Math.random() - 0.5) * 0.6;
//                 targets[i * 3 + 2] = (Math.random() - 0.5) * 1.8;
//             }
//         }

//         let lastT = performance.now();

//         function tick(now) {
//             raf = requestAnimationFrame(tick);
//             const dt = Math.min((now - lastT) / 1000, 0.05);
//             lastT = now;
//             totalTime += dt;
//             phaseTime += dt;

//             setProgress(Math.min(totalTime / TOTAL, 1));

//             // Phase transitions
//             if (phase === 'scatter' && phaseTime >= CONFIG.SCATTER_DURATION) {
//                 phase = 'orbit'; phaseTime = 0;
//                 cameraTargetZ = CONFIG.CAMERA_ORBIT_Z;
//                 setTaglinePhase('orbit');        // ← tagline appears inside ring
//             }
//             if (phase === 'orbit' && phaseTime >= CONFIG.ORBIT_DURATION) {
//                 phase = 'collapse'; phaseTime = 0;
//                 setTextTargets();
//                 cameraTargetZ = CONFIG.CAMERA_TEXT_Z + 6;
//                 setTaglinePhase('hidden');       // ← hide while particles collapse
//             }
//             if (phase === 'collapse' && phaseTime >= CONFIG.COLLAPSE_DURATION) {
//                 phase = 'text'; phaseTime = 0;
//                 cameraTargetZ = CONFIG.CAMERA_TEXT_Z;
//                 setTaglinePhase('below');        // ← reappear well below particle text
//             }
//             if (phase === 'text' && phaseTime >= CONFIG.TEXT_DURATION) {
//                 if (!exitingRef.current) {
//                     exitingRef.current = true;
//                     setFadeOut(true);
//                     setTaglinePhase('out');
//                 }
//                 phase = 'exit'; phaseTime = 0;
//             }
//             if (exitingRef.current && phase !== 'exit') {
//                 phase = 'exit'; phaseTime = 0;
//             }

//             // Camera
//             camera.position.z += (cameraTargetZ - camera.position.z) * 0.028;
//             const mx = mouseRef.current.x;
//             const my = mouseRef.current.y;
//             camera.position.x += (-mx * 2.5 - camera.position.x) * 0.022;
//             camera.position.y += (my * 1.8 - camera.position.y) * 0.022;

//             const halfFov = THREE.MathUtils.degToRad(30);
//             const mwx = mx * camera.position.z * Math.tan(halfFov);
//             const mwy = my * camera.position.z * Math.tan(halfFov) / (W / H);

//             // Particle update
//             const posAttr = geo.attributes.position;
//             const colAttr = geo.attributes.aColor;

//             for (let i = 0; i < N; i++) {
//                 const ix = i * 3, iy = i * 3 + 1, iz = i * 3 + 2;
//                 let px = positions[ix], py = positions[iy], pz = positions[iz];

//                 if (phase === 'scatter') {
//                     // Particles fly inwards from all directions
//                     velocities[ix] *= 0.99; // Slight deceleration
//                     velocities[iy] *= 0.99;
//                     velocities[iz] *= 0.99;
//                     px += velocities[ix]; py += velocities[iy]; pz += velocities[iz];

//                 } else if (phase === 'orbit') {
//                     const ox = orbitalTargets[ix];
//                     const oy = orbitalTargets[iy];
//                     const oz = orbitalTargets[iz];
//                     const angle = totalTime * 0.16;
//                     const cosA = Math.cos(angle);
//                     const sinA = Math.sin(angle);
//                     const rotX = ox * cosA - oz * sinA;
//                     const rotZ = ox * sinA + oz * cosA;
//                     const wave = Math.sin(totalTime * 0.85 + phaseOffsets[i]) * 0.9;
//                     px += (rotX + wave * 0.2 - px) * 0.05;
//                     py += (oy + Math.sin(totalTime * 0.65 + phaseOffsets[i]) * 0.7 - py) * 0.05;
//                     pz += (rotZ - pz) * 0.05;

//                 } else if (phase === 'collapse') {
//                     px += (targets[ix] - px) * 0.075;
//                     py += (targets[iy] - py) * 0.075;
//                     pz += (targets[iz] - pz) * 0.075;

//                 } else if (phase === 'text') {
//                     const dx = px - mwx, dy = py - mwy;
//                     const dist = Math.sqrt(dx * dx + dy * dy);
//                     if (dist < CONFIG.REPEL_RADIUS && dist > 0.01) {
//                         const f = ((CONFIG.REPEL_RADIUS - dist) / CONFIG.REPEL_RADIUS) ** 2;
//                         px += (dx / dist) * f * CONFIG.REPEL_STRENGTH;
//                         py += (dy / dist) * f * CONFIG.REPEL_STRENGTH;
//                         pz += Math.sin(totalTime * 3 + phaseOffsets[i]) * f * 0.8;
//                     }
//                     const ease = dist < CONFIG.REPEL_RADIUS ? 0.016 : 0.032;
//                     px += (targets[ix] - px) * ease;
//                     py += (targets[iy] - py) * ease;
//                     pz += (targets[iz] - pz) * ease;
//                     px += Math.sin(totalTime * 2.2 + phaseOffsets[i]) * 0.013;
//                     py += Math.cos(totalTime * 1.9 + phaseOffsets[i]) * 0.013;

//                 } else if (phase === 'exit') {
//                     const angle = i * 2.39996;
//                     const speed = phaseTime * 28;
//                     px += Math.cos(angle) * speed * dt;
//                     py += Math.sin(angle) * speed * dt;
//                     pz += Math.sin(angle * 1.618) * speed * 0.5 * dt;
//                 }

//                 positions[ix] = px; positions[iy] = py; positions[iz] = pz;
//                 posAttr.array[ix] = px; posAttr.array[iy] = py; posAttr.array[iz] = pz;

//                 // Color pulsing — interpolate between palette hues only, no white
//                 if (phase === 'text' || phase === 'collapse') {
//                     const t = (Math.sin(totalTime * 1.7 + phaseOffsets[i]) + 1) * 0.5;
//                     const c1 = palette[i % palette.length];
//                     const c2 = palette[(i + 2) % palette.length];
//                     colAttr.array[ix] = Math.min(c1.r + (c2.r - c1.r) * t * 0.5, 0.90);
//                     colAttr.array[iy] = Math.min(c1.g + (c2.g - c1.g) * t * 0.5, 0.90);
//                     colAttr.array[iz] = Math.min(c1.b + (c2.b - c1.b) * t * 0.5, 0.90);
//                 }
//             }

//             posAttr.needsUpdate = true;
//             if (phase === 'text' || phase === 'collapse') colAttr.needsUpdate = true;

//             renderer.render(scene, camera);
//         }

//         raf = requestAnimationFrame(tick);

//         const onResize = () => {
//             const w = window.innerWidth, h = window.innerHeight;
//             camera.aspect = w / h;
//             camera.updateProjectionMatrix();
//             renderer.setSize(w, h);
//         };
//         window.addEventListener('resize', onResize);

//         return () => {
//             cancelAnimationFrame(raf);
//             window.removeEventListener('resize', onResize);
//             renderer.dispose();
//             geo.dispose();
//             mat.dispose();
//         };
//         // eslint-disable-next-line react-hooks/exhaustive-deps
//     }, []);

//     // Mouse tracking
//     useEffect(() => {
//         const onMove = e => {
//             mouseRef.current.x = (e.clientX / window.innerWidth) * 2 - 1;
//             mouseRef.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
//         };
//         const onTouch = e => {
//             const t = e.touches[0];
//             mouseRef.current.x = (t.clientX / window.innerWidth) * 2 - 1;
//             mouseRef.current.y = -(t.clientY / window.innerHeight) * 2 + 1;
//         };
//         window.addEventListener('mousemove', onMove);
//         window.addEventListener('touchmove', onTouch, { passive: true });
//         return () => {
//             window.removeEventListener('mousemove', onMove);
//             window.removeEventListener('touchmove', onTouch);
//         };
//     }, []);

//     // ── Tagline style — changes per phase ──────────────────────────────────────
//     // orbit: centered inside the rotating ring, small italic
//     // below: positioned below the particle text with safe vertical gap
//     const taglineVisible = taglinePhase === 'orbit' || taglinePhase === 'below';

//     const taglineBase = {
//         position: 'absolute',
//         left: '50%',
//         fontFamily: 'Georgia, serif',
//         textTransform: 'uppercase',
//         whiteSpace: 'nowrap',
//         userSelect: 'none',
//         pointerEvents: 'none',
//         opacity: taglineVisible ? 1 : 0,
//         transition: 'opacity 1.1s ease, top 0.9s ease, font-size 0.6s ease, letter-spacing 0.6s ease',
//     };

//     const taglineStyle = taglinePhase === 'orbit'
//         ? {
//             ...taglineBase,
//             // Sit inside the ring — center of screen, vertically centered
//             top: '50%',
//             transform: 'translate(-50%, -50%)',
//             fontSize: 'clamp(9px, 1.0vw, 12px)',
//             letterSpacing: '0.28em',
//             color: 'rgba(210, 190, 255, 0.65)',
//             fontStyle: 'italic',
//         }
//         : taglinePhase === 'below'
//             ? {
//                 ...taglineBase,
//                 // Below the "Aura" particle text.
//                 // Particles sit near vertical center; push tagline 115–130px below.
//                 top: 'calc(50% + 120px)',
//                 transform: 'translateX(-50%)',
//                 fontSize: 'clamp(10px, 1.2vw, 13px)',
//                 letterSpacing: '0.32em',
//                 color: 'rgba(180, 160, 255, 0.68)',
//                 fontStyle: 'normal',
//             }
//             : {
//                 // hidden / out — invisible, keep in DOM for smooth fade
//                 ...taglineBase,
//                 top: '50%',
//                 transform: 'translate(-50%, -50%)',
//                 fontSize: 'clamp(10px, 1.2vw, 13px)',
//                 letterSpacing: '0.28em',
//                 color: 'rgba(180, 160, 255, 0)',
//             };

//     // ── JSX ────────────────────────────────────────────────────────────────────
//     return (
//         <div style={{
//             position: 'fixed',
//             inset: 0,
//             zIndex: 9999,
//             background: '#04020e',
//             opacity: fadeOut ? 0 : 1,
//             transition: fadeOut ? `opacity ${CONFIG.EXIT_DURATION}s ease-in` : 'none',
//             pointerEvents: fadeOut ? 'none' : 'all',
//         }}>
//             <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />

//             {/* Tagline — floats in ring during orbit, moves below text during text phase */}
//             <div style={taglineStyle}>
//                 Where aesthetics meet soul
//             </div>

//             {/* Bottom UI */}
//             <div style={{
//                 position: 'absolute',
//                 bottom: 0, left: 0, right: 0,
//                 display: 'flex',
//                 flexDirection: 'column',
//                 alignItems: 'center',
//                 paddingBottom: '48px',
//                 gap: '20px',
//                 pointerEvents: 'none',
//             }}>
//                 <div style={{
//                     width: '120px',
//                     height: '1px',
//                     background: 'rgba(255,255,255,0.08)',
//                     overflow: 'hidden',
//                     opacity: showSkip ? 1 : 0,
//                     transition: 'opacity 0.8s',
//                 }}>
//                     <div style={{
//                         height: '100%',
//                         width: `${progress * 100}%`,
//                         background: 'linear-gradient(90deg, #7b68ee, #c084fc)',
//                         transition: 'width 0.12s linear',
//                     }} />
//                 </div>

//                 <button
//                     onClick={triggerExit}
//                     style={{
//                         pointerEvents: showSkip ? 'all' : 'none',
//                         cursor: 'pointer',
//                         background: 'rgba(255,255,255,0.05)',
//                         border: '1px solid rgba(255,255,255,0.16)',
//                         color: 'rgba(255,255,255,0.60)',
//                         fontFamily: 'sans-serif',
//                         fontSize: '11px',
//                         letterSpacing: '0.16em',
//                         textTransform: 'uppercase',
//                         padding: '10px 32px',
//                         backdropFilter: 'blur(12px)',
//                         borderRadius: '2px',
//                         opacity: showSkip ? 1 : 0,
//                         transition: 'opacity 0.8s, background 0.2s, color 0.2s',
//                     }}
//                     onMouseEnter={e => {
//                         e.currentTarget.style.background = 'rgba(255,255,255,0.13)';
//                         e.currentTarget.style.color = '#fff';
//                     }}
//                     onMouseLeave={e => {
//                         e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
//                         e.currentTarget.style.color = 'rgba(255,255,255,0.60)';
//                     }}
//                 >
//                     Skip intro
//                 </button>
//             </div>

//             {/* Corner branding */}
//             <div style={{
//                 position: 'absolute',
//                 top: '32px',
//                 left: '40px',
//                 fontFamily: 'Georgia, serif',
//                 fontSize: '22px',
//                 letterSpacing: '0.18em',
//                 color: 'rgba(255,255,255,0.10)',
//                 userSelect: 'none',
//                 pointerEvents: 'none',
//             }}>
//                 AURA
//             </div>
//         </div>
//     );
// }

// // ─────────────────────────────────────────────────────────────────────────────
// // GATE WRAPPER
// // ─────────────────────────────────────────────────────────────────────────────
// let _introSeen = false;

// export function AuraIntroGate({ children }) {
//     const [done, setDone] = useState(_introSeen);

//     const handleComplete = useCallback(() => {
//         _introSeen = true;
//         setDone(true);
//     }, []);

//     if (done) return children;

//     return (
//         <>
//             <AuraIntro onComplete={handleComplete} />
//             <div style={{ visibility: 'hidden', position: 'absolute', inset: 0, pointerEvents: 'none' }}>
//                 {children}
//             </div>
//         </>
//     );
// }



// // // // // // AuraIntro.jsx
// // // // // // Drop this component into your React app and render it before <Home />.
// // // // // // It auto-transitions to your homepage after the animation, or on "Skip".
// // // // // //
// // // // // // USAGE in App.jsx (or wherever you handle routing):
// // // // // //   import AuraIntro from './components/AuraIntro';
// // // // // //
// // // // // //   In your router config, add a route for "/" that renders:
// // // // // //     <AuraIntroGate><Home /></AuraIntroGate>
// // // // // //
// // // // // //   Or use AuraIntro directly as a splash overlay (see AuraIntroGate below).
// // // // // //
// // // // // // DEPENDENCIES:
// // // // // //   npm install three
// // // // // //   (framer-motion is optional — only used for the tagline fade)

// // // // // import { useEffect, useRef, useState, useCallback } from 'react';
// // // // // import * as THREE from 'three';

// // // // // // ─────────────────────────────────────────────────────────────────────────────
// // // // // // CONFIG — tweak timings, counts, colors here
// // // // // // ─────────────────────────────────────────────────────────────────────────────
// // // // // const CONFIG = {
// // // // //     PARTICLE_COUNT: 2400,
// // // // //     SCATTER_DURATION: 1.2,   // seconds of free float
// // // // //     ORBIT_DURATION: 3.8,   // seconds of orbiting shapes
// // // // //     COLLAPSE_DURATION: 1.6,   // seconds morphing into text
// // // // //     TEXT_DURATION: 8.0,   // seconds holding "Aura"
// // // // //     EXIT_DURATION: 1.8,   // seconds of exit explosion
// // // // //     REPEL_RADIUS: 9,     // mouse repulsion radius (world units)
// // // // //     REPEL_STRENGTH: 7,
// // // // //     CAMERA_START_Z: 55,
// // // // //     CAMERA_TEXT_Z: 36,
// // // // //     PALETTE: [
// // // // //         0x7b68ee, // indigo
// // // // //         0xc084fc, // violet
// // // // //         0x818cf8, // lavender
// // // // //         0xe879f9, // fuchsia
// // // // //         0xa78bfa, // purple
// // // // //         0x60a5fa, // blue accent
// // // // //     ],
// // // // // };

// // // // // // ─────────────────────────────────────────────────────────────────────────────
// // // // // // HELPER — sample pixel positions from canvas text rendering
// // // // // // ─────────────────────────────────────────────────────────────────────────────
// // // // // function sampleTextParticles(text, count, containerWidth) {
// // // // //     const offCanvas = document.createElement('canvas');
// // // // //     const fontSize = Math.floor(Math.min(containerWidth, 900) * 0.18);
// // // // //     offCanvas.width = Math.min(containerWidth, 900);
// // // // //     offCanvas.height = Math.round(fontSize * 1.5);
// // // // //     const ctx = offCanvas.getContext('2d');
// // // // //     ctx.clearRect(0, 0, offCanvas.width, offCanvas.height);
// // // // //     ctx.fillStyle = '#fff';
// // // // //     ctx.font = `bold ${fontSize}px Georgia, serif`;
// // // // //     ctx.textAlign = 'center';
// // // // //     ctx.textBaseline = 'middle';
// // // // //     ctx.fillText(text, offCanvas.width / 2, offCanvas.height / 2);

// // // // //     const imgData = ctx.getImageData(0, 0, offCanvas.width, offCanvas.height);
// // // // //     const pts = [];
// // // // //     for (let y = 0; y < offCanvas.height; y += 2) {
// // // // //         for (let x = 0; x < offCanvas.width; x += 2) {
// // // // //             if (imgData.data[(y * offCanvas.width + x) * 4 + 3] > 100) {
// // // // //                 pts.push({
// // // // //                     x: ((x / offCanvas.width) - 0.5) * 56,
// // // // //                     y: -((y / offCanvas.height) - 0.5) * 18,
// // // // //                 });
// // // // //             }
// // // // //         }
// // // // //     }
// // // // //     // Fisher–Yates shuffle
// // // // //     for (let i = pts.length - 1; i > 0; i--) {
// // // // //         const j = Math.floor(Math.random() * (i + 1));
// // // // //         [pts[i], pts[j]] = [pts[j], pts[i]];
// // // // //     }
// // // // //     const step = Math.max(1, Math.floor(pts.length / count));
// // // // //     const sampled = [];
// // // // //     for (let i = 0; i < pts.length && sampled.length < count; i += step) sampled.push(pts[i]);
// // // // //     while (sampled.length < count) {
// // // // //         sampled.push(pts[Math.floor(Math.random() * pts.length)] ?? { x: 0, y: 0 });
// // // // //     }
// // // // //     return sampled.slice(0, count);
// // // // // }

// // // // // // ─────────────────────────────────────────────────────────────────────────────
// // // // // // HELPER — build orbital target positions
// // // // // // ─────────────────────────────────────────────────────────────────────────────
// // // // // function buildOrbitalTargets(count) {
// // // // //     const shapes = [
// // // // //         // Ring 1 — large orbit
// // // // //         ...Array.from({ length: 80 }, (_, i) => {
// // // // //             const a = (i / 80) * Math.PI * 2;
// // // // //             return { x: Math.cos(a) * 22, y: Math.sin(a) * 9, z: Math.sin(a * 2) * 4 };
// // // // //         }),
// // // // //         // Ring 2 — tilted inner ring
// // // // //         ...Array.from({ length: 60 }, (_, i) => {
// // // // //             const a = (i / 60) * Math.PI * 2;
// // // // //             return { x: Math.cos(a) * 15, y: Math.sin(a) * 6, z: Math.cos(a) * 6 };
// // // // //         }),
// // // // //         // Cluster: "bag" silhouette left
// // // // //         ...Array.from({ length: 100 }, () => ({
// // // // //             x: -13 + (Math.random() - 0.5) * 9,
// // // // //             y: 4 + (Math.random() - 0.5) * 11,
// // // // //             z: (Math.random() - 0.5) * 4,
// // // // //         })),
// // // // //         // Cluster: "cart" silhouette right
// // // // //         ...Array.from({ length: 100 }, () => ({
// // // // //             x: 13 + (Math.random() - 0.5) * 9,
// // // // //             y: -2 + (Math.random() - 0.5) * 9,
// // // // //             z: (Math.random() - 0.5) * 4,
// // // // //         })),
// // // // //         // Scattered sparkle particles
// // // // //         ...Array.from({ length: 60 }, () => ({
// // // // //             x: (Math.random() - 0.5) * 50,
// // // // //             y: (Math.random() - 0.5) * 30,
// // // // //             z: (Math.random() - 0.5) * 10,
// // // // //         })),
// // // // //     ];

// // // // //     const targets = new Float32Array(count * 3);
// // // // //     for (let i = 0; i < count; i++) {
// // // // //         const s = shapes[i % shapes.length];
// // // // //         targets[i * 3] = s.x + (Math.random() - 0.5) * 3;
// // // // //         targets[i * 3 + 1] = s.y + (Math.random() - 0.5) * 3;
// // // // //         targets[i * 3 + 2] = (s.z ?? 0) + (Math.random() - 0.5) * 2;
// // // // //     }
// // // // //     return targets;
// // // // // }

// // // // // // ─────────────────────────────────────────────────────────────────────────────
// // // // // // SHADERS
// // // // // // ─────────────────────────────────────────────────────────────────────────────
// // // // // const VERTEX_SHADER = `
// // // // //   attribute float size;
// // // // //   attribute vec3 myColor;
// // // // //   varying vec3 vMyColor;
// // // // //   varying float vDist;
// // // // //   uniform float uTime;
// // // // //   uniform float uPixelRatio;

// // // // //   void main() {
// // // // //     vMyColor = myColor;
// // // // //     vec4 mv = modelViewMatrix * vec4(position, 1.0);
// // // // //     vDist = -mv.z;
// // // // //     float s = size * uPixelRatio * (280.0 / max(vDist, 1.0));
// // // // //     gl_PointSize = clamp(s, 1.0, 16.0);
// // // // //     gl_Position  = projectionMatrix * mv;
// // // // //   }
// // // // // `;

// // // // // const FRAGMENT_SHADER = `
// // // // //   varying vec3 vMyColor;
// // // // //   varying float vDist;

// // // // //   void main() {
// // // // //     vec2  uv   = gl_PointCoord - 0.5;
// // // // //     float d    = length(uv);
// // // // //     if (d > 0.5) discard;
// // // // //     float core = 1.0 - smoothstep(0.0,  0.22, d);
// // // // //     float glow = 1.0 - smoothstep(0.18, 0.50, d);
// // // // //     float a    = core * 0.95 + glow * 0.35;
// // // // //     a         *= 1.0 - smoothstep(20.0, 120.0, vDist); // depth fade
// // // // //     vec3  col  = vMyColor + core * vec3(0.35, 0.25, 0.5);
// // // // //     gl_FragColor = vec4(col, a);
// // // // //   }
// // // // // `;

// // // // // // ─────────────────────────────────────────────────────────────────────────────
// // // // // // MAIN COMPONENT
// // // // // // ─────────────────────────────────────────────────────────────────────────────
// // // // // export default function AuraIntro({ onComplete }) {
// // // // //     const canvasRef = useRef(null);
// // // // //     const mouseRef = useRef({ x: 9999, y: 9999 });
// // // // //     const [progress, setProgress] = useState(0);
// // // // //     const [showSkip, setShowSkip] = useState(false);
// // // // //     const [showTagline, setShowTagline] = useState(false);
// // // // //     const [exiting, setExiting] = useState(false);

// // // // //     const triggerExit = useCallback(() => {
// // // // //         setExiting(true);
// // // // //     }, []);

// // // // //     useEffect(() => {
// // // // //         const timer = setTimeout(() => setShowSkip(true), 800);
// // // // //         return () => clearTimeout(timer);
// // // // //     }, []);

// // // // //     useEffect(() => {
// // // // //         if (!canvasRef.current) return;

// // // // //         const canvas = canvasRef.current;
// // // // //         const W = window.innerWidth;
// // // // //         const H = window.innerHeight;

// // // // //         // ── Renderer ──────────────────────────────────────────────────
// // // // //         const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
// // // // //         renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
// // // // //         renderer.setSize(W, H);
// // // // //         renderer.setClearColor(0x04020e, 1);

// // // // //         const scene = new THREE.Scene();
// // // // //         const camera = new THREE.PerspectiveCamera(60, W / H, 0.1, 1000);
// // // // //         camera.position.set(0, 0, CONFIG.CAMERA_START_Z);

// // // // //         // ── Particle buffers ──────────────────────────────────────────
// // // // //         const N = CONFIG.PARTICLE_COUNT;
// // // // //         const positions = new Float32Array(N * 3);
// // // // //         const velocities = new Float32Array(N * 3);
// // // // //         const targets = new Float32Array(N * 3);
// // // // //         const colors = new Float32Array(N * 3);
// // // // //         const sizes = new Float32Array(N);

// // // // //         const palette = CONFIG.PALETTE.map(h => new THREE.Color(h));

// // // // //         for (let i = 0; i < N; i++) {
// // // // //             positions[i * 3] = (Math.random() - 0.5) * 130;
// // // // //             positions[i * 3 + 1] = (Math.random() - 0.5) * 90;
// // // // //             positions[i * 3 + 2] = (Math.random() - 0.5) * 70;
// // // // //             velocities[i * 3] = (Math.random() - 0.5) * 0.25;
// // // // //             velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.25;
// // // // //             velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.08;
// // // // //             const c = palette[Math.floor(Math.random() * palette.length)];
// // // // //             colors[i * 3] = c.r; colors[i * 3 + 1] = c.g; colors[i * 3 + 2] = c.b;
// // // // //             sizes[i] = 1.4 + Math.random() * 2.8;
// // // // //         }

// // // // //         const geo = new THREE.BufferGeometry();
// // // // //         geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
// // // // //         geo.setAttribute('myColor', new THREE.BufferAttribute(colors, 3));
// // // // //         geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

// // // // //         const mat = new THREE.ShaderMaterial({
// // // // //             uniforms: {
// // // // //                 uTime: { value: 0 },
// // // // //                 uPixelRatio: { value: renderer.getPixelRatio() },
// // // // //             },
// // // // //             vertexShader: VERTEX_SHADER,
// // // // //             fragmentShader: FRAGMENT_SHADER,
// // // // //             transparent: true,
// // // // //             depthWrite: false,
// // // // //             blending: THREE.AdditiveBlending,
// // // // //         });

// // // // //         const points = new THREE.Points(geo, mat);
// // // // //         scene.add(points);

// // // // //         // ── Precompute orbital targets ─────────────────────────────────
// // // // //         const orbitalTargets = buildOrbitalTargets(N);
// // // // //         orbitalTargets.forEach((v, i) => { targets[i] = v; });

// // // // //         // ── State ─────────────────────────────────────────────────────
// // // // //         let phase = 'scatter';
// // // // //         let phaseTime = 0;
// // // // //         let totalTime = 0;
// // // // //         let textPts = null;
// // // // //         let cameraTargetZ = CONFIG.CAMERA_START_Z;
// // // // //         let exitTriggered = false;
// // // // //         let raf;

// // // // //         // Precompute text targets async (tiny delay so DOM is ready)
// // // // //         setTimeout(() => {
// // // // //             textPts = sampleTextParticles('Aura', N, window.innerWidth);
// // // // //         }, 80);

// // // // //         const TOTAL = CONFIG.SCATTER_DURATION + CONFIG.ORBIT_DURATION
// // // // //             + CONFIG.COLLAPSE_DURATION + CONFIG.TEXT_DURATION;

// // // // //         // ── Helpers ────────────────────────────────────────────────────
// // // // //         function setTextTargets() {
// // // // //             if (!textPts) return;
// // // // //             for (let i = 0; i < N; i++) {
// // // // //                 const pt = textPts[i % textPts.length];
// // // // //                 targets[i * 3] = pt.x + (Math.random() - 0.5) * 0.5;
// // // // //                 targets[i * 3 + 1] = pt.y + (Math.random() - 0.5) * 0.5;
// // // // //                 targets[i * 3 + 2] = (Math.random() - 0.5) * 1.5;
// // // // //             }
// // // // //         }

// // // // //         function doExitTrigger() {
// // // // //             if (exitTriggered) return;
// // // // //             exitTriggered = true;
// // // // //             setExiting(true);
// // // // //         }

// // // // //         // ── Clock ─────────────────────────────────────────────────────
// // // // //         let lastT = performance.now();

// // // // //         function tick(now) {
// // // // //             raf = requestAnimationFrame(tick);
// // // // //             const dt = Math.min((now - lastT) / 1000, 0.05);
// // // // //             lastT = now;
// // // // //             totalTime += dt;
// // // // //             phaseTime += dt;
// // // // //             mat.uniforms.uTime.value = totalTime;

// // // // //             // ── Progress ─────────────────────────────────────────────
// // // // //             setProgress(Math.min(totalTime / TOTAL, 1));

// // // // //             // ── Phase machine ─────────────────────────────────────────
// // // // //             if (phase === 'scatter' && phaseTime >= CONFIG.SCATTER_DURATION) {
// // // // //                 phase = 'orbit'; phaseTime = 0;
// // // // //             }
// // // // //             if (phase === 'orbit' && phaseTime >= CONFIG.ORBIT_DURATION) {
// // // // //                 phase = 'collapse'; phaseTime = 0;
// // // // //                 setTextTargets();
// // // // //                 cameraTargetZ = 42;
// // // // //             }
// // // // //             if (phase === 'collapse' && phaseTime >= CONFIG.COLLAPSE_DURATION) {
// // // // //                 phase = 'text'; phaseTime = 0;
// // // // //                 setShowTagline(true);
// // // // //                 cameraTargetZ = CONFIG.CAMERA_TEXT_Z;
// // // // //             }
// // // // //             if (phase === 'text' && phaseTime >= CONFIG.TEXT_DURATION) {
// // // // //                 doExitTrigger();
// // // // //             }
// // // // //             if (phase === 'exit' && phaseTime >= CONFIG.EXIT_DURATION) {
// // // // //                 onComplete?.();
// // // // //             }

// // // // //             // If exiting flag was set externally
// // // // //             if (exiting && phase !== 'exit') {
// // // // //                 phase = 'exit'; phaseTime = 0;
// // // // //             }

// // // // //             // ── Camera ────────────────────────────────────────────────
// // // // //             camera.position.z += (cameraTargetZ - camera.position.z) * 0.03;
// // // // //             const mx = mouseRef.current.x;
// // // // //             const my = mouseRef.current.y;
// // // // //             camera.position.x += (-mx * 3 - camera.position.x) * 0.025;
// // // // //             camera.position.y += (my * 2 - camera.position.y) * 0.025;

// // // // //             // Mouse in world coords (approx at z=0)
// // // // //             const halfFov = THREE.MathUtils.degToRad(30);
// // // // //             const aspect = W / H;
// // // // //             const mwx = mx * camera.position.z * Math.tan(halfFov);
// // // // //             const mwy = my * camera.position.z * Math.tan(halfFov) / aspect;

// // // // //             // ── Particle update ───────────────────────────────────────
// // // // //             const posAttr = geo.attributes.position;
// // // // //             const colAttr = geo.attributes.myColor;

// // // // //             for (let i = 0; i < N; i++) {
// // // // //                 const ix = i * 3, iy = i * 3 + 1, iz = i * 3 + 2;
// // // // //                 let px = positions[ix], py = positions[iy], pz = positions[iz];

// // // // //                 if (phase === 'scatter') {
// // // // //                     velocities[ix] *= 0.985; velocities[iy] *= 0.985; velocities[iz] *= 0.985;
// // // // //                     px += velocities[ix]; py += velocities[iy]; pz += velocities[iz];
// // // // //                     px -= px * 0.007; py -= py * 0.007;
// // // // //                     if (px > 80) px = -80; if (px < -80) px = 80;
// // // // //                     if (py > 60) py = -60; if (py < -60) py = 60;

// // // // //                 } else if (phase === 'orbit') {
// // // // //                     const tx = orbitalTargets[ix];
// // // // //                     const ty = orbitalTargets[iy];
// // // // //                     const tz = orbitalTargets[iz];
// // // // //                     const cos = Math.cos(totalTime * 0.14);
// // // // //                     const sin = Math.sin(totalTime * 0.14);
// // // // //                     const rotX = tx * cos - tz * sin;
// // // // //                     const rotZ = tx * sin + tz * cos;
// // // // //                     const wave = Math.sin(totalTime * 0.9 + i * 0.03) * 0.8;
// // // // //                     px += (rotX + wave * 0.15 - px) * 0.045;
// // // // //                     py += (ty + Math.sin(totalTime * 0.7 + i * 0.02) * 0.6 - py) * 0.045;
// // // // //                     pz += (rotZ - pz) * 0.045;

// // // // //                 } else if (phase === 'collapse') {
// // // // //                     const tx = targets[ix], ty = targets[iy], tz = targets[iz];
// // // // //                     px += (tx - px) * 0.07;
// // // // //                     py += (ty - py) * 0.07;
// // // // //                     pz += (tz - pz) * 0.07;

// // // // //                 } else if (phase === 'text') {
// // // // //                     const tx = targets[ix], ty = targets[iy], tz = targets[iz];
// // // // //                     // Mouse repulsion
// // // // //                     const dx = px - mwx, dy = py - mwy;
// // // // //                     const dist = Math.sqrt(dx * dx + dy * dy);
// // // // //                     if (dist < CONFIG.REPEL_RADIUS && dist > 0.01) {
// // // // //                         const f = ((CONFIG.REPEL_RADIUS - dist) / CONFIG.REPEL_RADIUS) ** 2;
// // // // //                         px += (dx / dist) * f * CONFIG.REPEL_STRENGTH;
// // // // //                         py += (dy / dist) * f * CONFIG.REPEL_STRENGTH;
// // // // //                         pz += Math.sin(totalTime * 3 + i) * f * 0.6;
// // // // //                     }
// // // // //                     // Spring back to text target
// // // // //                     const ease = dist < CONFIG.REPEL_RADIUS ? 0.018 : 0.03;
// // // // //                     px += (tx - px) * ease;
// // // // //                     py += (ty - py) * ease;
// // // // //                     pz += (tz - pz) * ease;
// // // // //                     // Shimmer
// // // // //                     px += Math.sin(totalTime * 2.1 + i * 0.11) * 0.012;
// // // // //                     py += Math.cos(totalTime * 1.8 + i * 0.07) * 0.012;

// // // // //                 } else if (phase === 'exit') {
// // // // //                     const angle = i * 2.39996; // golden angle
// // // // //                     const speed = phaseTime * 22;
// // // // //                     px += Math.cos(angle) * speed * dt;
// // // // //                     py += Math.sin(angle) * speed * dt;
// // // // //                     pz += Math.sin(angle * 1.5) * speed * 0.4 * dt;
// // // // //                 }

// // // // //                 positions[ix] = px; positions[iy] = py; positions[iz] = pz;
// // // // //                 posAttr.array[ix] = px; posAttr.array[iy] = py; posAttr.array[iz] = pz;

// // // // //                 // Color pulsing in text phase
// // // // //                 if (phase === 'text' || phase === 'collapse') {
// // // // //                     const t = (Math.sin(totalTime * 1.6 + i * 0.09) + 1) * 0.5;
// // // // //                     const c1 = palette[i % palette.length];
// // // // //                     const c2 = palette[(i + 2) % palette.length];
// // // // //                     colAttr.array[ix] = c1.r + (c2.r - c1.r) * t * 0.35;
// // // // //                     colAttr.array[iy] = c1.g + (c2.g - c1.g) * t * 0.35;
// // // // //                     colAttr.array[iz] = c1.b + (c2.b - c1.b) * t * 0.35;
// // // // //                 }
// // // // //             }

// // // // //             posAttr.needsUpdate = true;
// // // // //             if (phase === 'text' || phase === 'collapse') colAttr.needsUpdate = true;

// // // // //             // Exit opacity handled via canvas style (see JSX)
// // // // //             if (phase === 'exit') {
// // // // //                 const t = Math.min(phaseTime / CONFIG.EXIT_DURATION, 1);
// // // // //                 canvas.style.opacity = String(1 - t);
// // // // //             }

// // // // //             renderer.render(scene, camera);
// // // // //         }

// // // // //         raf = requestAnimationFrame(tick);

// // // // //         // ── Resize ────────────────────────────────────────────────────
// // // // //         const onResize = () => {
// // // // //             const w = window.innerWidth, h = window.innerHeight;
// // // // //             camera.aspect = w / h;
// // // // //             camera.updateProjectionMatrix();
// // // // //             renderer.setSize(w, h);
// // // // //         };
// // // // //         window.addEventListener('resize', onResize);

// // // // //         return () => {
// // // // //             cancelAnimationFrame(raf);
// // // // //             window.removeEventListener('resize', onResize);
// // // // //             renderer.dispose();
// // // // //             geo.dispose();
// // // // //             mat.dispose();
// // // // //         };
// // // // //         // eslint-disable-next-line react-hooks/exhaustive-deps
// // // // //     }, []);

// // // // //     // Mouse tracking
// // // // //     useEffect(() => {
// // // // //         const onMove = e => {
// // // // //             mouseRef.current.x = (e.clientX / window.innerWidth) * 2 - 1;
// // // // //             mouseRef.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
// // // // //         };
// // // // //         const onTouch = e => {
// // // // //             const t = e.touches[0];
// // // // //             mouseRef.current.x = (t.clientX / window.innerWidth) * 2 - 1;
// // // // //             mouseRef.current.y = -(t.clientY / window.innerHeight) * 2 + 1;
// // // // //         };
// // // // //         window.addEventListener('mousemove', onMove);
// // // // //         window.addEventListener('touchmove', onTouch, { passive: true });
// // // // //         return () => {
// // // // //             window.removeEventListener('mousemove', onMove);
// // // // //             window.removeEventListener('touchmove', onTouch);
// // // // //         };
// // // // //     }, []);

// // // // //     // Trigger completion when exiting
// // // // //     useEffect(() => {
// // // // //         if (!exiting) return;
// // // // //         const timer = setTimeout(() => onComplete?.(), CONFIG.EXIT_DURATION * 1000);
// // // // //         return () => clearTimeout(timer);
// // // // //     }, [exiting, onComplete]);

// // // // //     return (
// // // // //         <div style={{
// // // // //             position: 'fixed', inset: 0, zIndex: 9999,
// // // // //             background: '#04020e',
// // // // //             opacity: exiting ? 0 : 1,
// // // // //             transition: exiting ? `opacity ${CONFIG.EXIT_DURATION}s ease-in` : 'none',
// // // // //             pointerEvents: exiting ? 'none' : 'all',
// // // // //         }}>
// // // // //             {/* Three.js canvas */}
// // // // //             <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />

// // // // //             {/* Tagline */}
// // // // //             <div style={{
// // // // //                 position: 'absolute', top: '50%', left: '50%',
// // // // //                 transform: 'translate(-50%, calc(-50% + 60px))',
// // // // //                 fontFamily: 'Georgia, serif',
// // // // //                 fontSize: 'clamp(11px, 1.5vw, 15px)',
// // // // //                 letterSpacing: '0.28em',
// // // // //                 textTransform: 'uppercase',
// // // // //                 color: 'rgba(180, 160, 255, 0.75)',
// // // // //                 opacity: showTagline ? 1 : 0,
// // // // //                 transition: 'opacity 1.2s ease',
// // // // //                 whiteSpace: 'nowrap',
// // // // //                 userSelect: 'none',
// // // // //             }}>
// // // // //                 Where aesthetics meet soul
// // // // //             </div>

// // // // //             {/* Bottom UI */}
// // // // //             <div style={{
// // // // //                 position: 'absolute', bottom: 0, left: 0, right: 0,
// // // // //                 display: 'flex', flexDirection: 'column', alignItems: 'center',
// // // // //                 paddingBottom: '48px', gap: '20px',
// // // // //                 pointerEvents: 'none',
// // // // //             }}>
// // // // //                 {/* Progress bar */}
// // // // //                 <div style={{
// // // // //                     width: '120px', height: '1px',
// // // // //                     background: 'rgba(255,255,255,0.08)',
// // // // //                     overflow: 'hidden',
// // // // //                     opacity: showSkip ? 1 : 0,
// // // // //                     transition: 'opacity 0.8s',
// // // // //                 }}>
// // // // //                     <div style={{
// // // // //                         height: '100%',
// // // // //                         width: `${progress * 100}%`,
// // // // //                         background: 'linear-gradient(90deg, #7b68ee, #c084fc)',
// // // // //                         transition: 'width 0.12s linear',
// // // // //                     }} />
// // // // //                 </div>

// // // // //                 {/* Skip button */}
// // // // //                 <button
// // // // //                     onClick={triggerExit}
// // // // //                     style={{
// // // // //                         pointerEvents: showSkip ? 'all' : 'none',
// // // // //                         cursor: 'pointer',
// // // // //                         background: 'rgba(255,255,255,0.06)',
// // // // //                         border: '1px solid rgba(255,255,255,0.18)',
// // // // //                         color: 'rgba(255,255,255,0.65)',
// // // // //                         fontFamily: 'sans-serif',
// // // // //                         fontSize: '12px',
// // // // //                         letterSpacing: '0.14em',
// // // // //                         textTransform: 'uppercase',
// // // // //                         padding: '10px 30px',
// // // // //                         backdropFilter: 'blur(12px)',
// // // // //                         borderRadius: '2px',
// // // // //                         opacity: showSkip ? 1 : 0,
// // // // //                         transition: 'opacity 0.8s, background 0.25s, color 0.25s',
// // // // //                     }}
// // // // //                     onMouseEnter={e => {
// // // // //                         e.currentTarget.style.background = 'rgba(255,255,255,0.14)';
// // // // //                         e.currentTarget.style.color = '#fff';
// // // // //                     }}
// // // // //                     onMouseLeave={e => {
// // // // //                         e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
// // // // //                         e.currentTarget.style.color = 'rgba(255,255,255,0.65)';
// // // // //                     }}
// // // // //                 >
// // // // //                     Skip intro
// // // // //                 </button>
// // // // //             </div>

// // // // //             {/* Corner branding */}
// // // // //             <div style={{
// // // // //                 position: 'absolute', top: '32px', left: '40px',
// // // // //                 fontFamily: 'Georgia, serif',
// // // // //                 fontSize: '22px',
// // // // //                 letterSpacing: '0.15em',
// // // // //                 color: 'rgba(255,255,255,0.12)',
// // // // //                 userSelect: 'none',
// // // // //             }}>
// // // // //                 AURA
// // // // //             </div>
// // // // //         </div>
// // // // //     );
// // // // // }

// // // // // // ─────────────────────────────────────────────────────────────────────────────
// // // // // // GATE WRAPPER — wrap your <Home /> (or any page) with this
// // // // // // It shows the intro once per session, then renders children normally
// // // // // // ─────────────────────────────────────────────────────────────────────────────

// // // // // let memoryIntroSeen = false;

// // // // // export function AuraIntroGate({ children }) {
// // // // //     // Only show intro on full browser refresh or first load
// // // // //     const [done, setDone] = useState(memoryIntroSeen);

// // // // //     const handleComplete = useCallback(() => {
// // // // //         memoryIntroSeen = true;
// // // // //         setDone(true);
// // // // //     }, []);

// // // // //     return (
// // // // //         <>
// // // // //             {done ? children : (
// // // // //                 <>
// // // // //                     <AuraIntro onComplete={handleComplete} />
// // // // //                     {/* Render children behind the intro so they hydrate early */}
// // // // //                     <div style={{ visibility: 'hidden', position: 'absolute', inset: 0, pointerEvents: 'none' }}>
// // // // //                         {children}
// // // // //                     </div>
// // // // //                 </>
// // // // //             )}
// // // // //         </>
// // // // //     );
// // // // // }


// // // // // AuraIntro.jsx — Enhanced & fixed
// // // // // DEPENDENCIES: npm install three
// // // // //
// // // // // USAGE:
// // // // //   import { AuraIntroGate } from './AuraIntro';
// // // // //   <AuraIntroGate><Home /></AuraIntroGate>

// // // // import { useEffect, useRef, useState, useCallback } from 'react';
// // // // import * as THREE from 'three';

// // // // // ─────────────────────────────────────────────────────────────────────────────
// // // // // CONFIG
// // // // // ─────────────────────────────────────────────────────────────────────────────
// // // // const CONFIG = {
// // // //     PARTICLE_COUNT: 2800,
// // // //     SCATTER_DURATION: 1.4,
// // // //     ORBIT_DURATION: 4.2,
// // // //     COLLAPSE_DURATION: 1.8,
// // // //     TEXT_DURATION: 9.0,
// // // //     EXIT_DURATION: 2.0,
// // // //     REPEL_RADIUS: 10,
// // // //     REPEL_STRENGTH: 8,
// // // //     CAMERA_START_Z: 58,
// // // //     CAMERA_ORBIT_Z: 48,
// // // //     CAMERA_TEXT_Z: 36,
// // // //     PALETTE: [
// // // //         0x7b68ee, // indigo
// // // //         0xc084fc, // violet
// // // //         0x818cf8, // lavender
// // // //         0xe879f9, // fuchsia
// // // //         0xa78bfa, // purple
// // // //         0x60a5fa, // blue accent
// // // //     ],
// // // // };

// // // // // ─────────────────────────────────────────────────────────────────────────────
// // // // // SHADERS — use aColor to avoid Three.js built-in name collision
// // // // // ─────────────────────────────────────────────────────────────────────────────
// // // // const VERTEX_SHADER = /* glsl */`
// // // //   attribute float aSize;
// // // //   attribute vec3  aColor;
// // // //   varying   vec3  vColor;
// // // //   varying   float vDist;
// // // //   uniform   float uPixelRatio;

// // // //   void main() {
// // // //     vColor = aColor;
// // // //     vec4 mv = modelViewMatrix * vec4(position, 1.0);
// // // //     vDist   = -mv.z;
// // // //     float s = aSize * uPixelRatio * (300.0 / max(vDist, 1.0));
// // // //     gl_PointSize = clamp(s, 1.0, 18.0);
// // // //     gl_Position  = projectionMatrix * mv;
// // // //   }
// // // // `;

// // // // const FRAGMENT_SHADER = /* glsl */`
// // // //   varying vec3  vColor;
// // // //   varying float vDist;

// // // //   void main() {
// // // //     vec2  uv   = gl_PointCoord - 0.5;
// // // //     float d    = length(uv);
// // // //     if (d > 0.5) discard;

// // // //     float core = 1.0 - smoothstep(0.0,  0.20, d);
// // // //     float mid  = 1.0 - smoothstep(0.15, 0.38, d);
// // // //     float glow = 1.0 - smoothstep(0.30, 0.50, d);
// // // //     float a    = core * 1.0 + mid * 0.5 + glow * 0.25;
// // // //     a         *= smoothstep(130.0, 18.0, vDist);

// // // //     vec3 col   = vColor
// // // //                + core * vec3(0.40, 0.28, 0.55)
// // // //                + mid  * vec3(0.10, 0.05, 0.20);

// // // //     gl_FragColor = vec4(col, clamp(a, 0.0, 1.0));
// // // //   }
// // // // `;

// // // // // ─────────────────────────────────────────────────────────────────────────────
// // // // // HELPER — sample text pixels → world-space points (Three.js scale)
// // // // // ─────────────────────────────────────────────────────────────────────────────
// // // // function sampleTextParticles(text, count, containerWidth) {
// // // //     const offCanvas = document.createElement('canvas');
// // // //     const fontSize = Math.floor(Math.min(containerWidth, 900) * 0.19);
// // // //     offCanvas.width = Math.min(containerWidth, 900);
// // // //     offCanvas.height = Math.round(fontSize * 1.6);
// // // //     const ctx = offCanvas.getContext('2d');
// // // //     ctx.clearRect(0, 0, offCanvas.width, offCanvas.height);
// // // //     ctx.fillStyle = '#fff';
// // // //     ctx.font = `bold ${fontSize}px Georgia, serif`;
// // // //     ctx.textAlign = 'center';
// // // //     ctx.textBaseline = 'middle';
// // // //     ctx.fillText(text, offCanvas.width / 2, offCanvas.height / 2);

// // // //     const imgData = ctx.getImageData(0, 0, offCanvas.width, offCanvas.height);
// // // //     const pts = [];
// // // //     for (let y = 0; y < offCanvas.height; y += 2) {
// // // //         for (let x = 0; x < offCanvas.width; x += 2) {
// // // //             if (imgData.data[(y * offCanvas.width + x) * 4 + 3] > 120) {
// // // //                 pts.push({
// // // //                     // Map to Three.js world units — matched to CAMERA_TEXT_Z FOV
// // // //                     x: ((x / offCanvas.width) - 0.5) * 58,
// // // //                     y: -((y / offCanvas.height) - 0.5) * 20,
// // // //                 });
// // // //             }
// // // //         }
// // // //     }
// // // //     // Fisher–Yates shuffle
// // // //     for (let i = pts.length - 1; i > 0; i--) {
// // // //         const j = Math.floor(Math.random() * (i + 1));
// // // //         [pts[i], pts[j]] = [pts[j], pts[i]];
// // // //     }
// // // //     const step = Math.max(1, Math.floor(pts.length / count));
// // // //     const sampled = [];
// // // //     for (let i = 0; i < pts.length && sampled.length < count; i += step) sampled.push(pts[i]);
// // // //     while (sampled.length < count) {
// // // //         sampled.push(pts[Math.floor(Math.random() * pts.length)] ?? { x: 0, y: 0 });
// // // //     }
// // // //     return sampled.slice(0, count);
// // // // }

// // // // // ─────────────────────────────────────────────────────────────────────────────
// // // // // HELPER — orbital target positions
// // // // // ─────────────────────────────────────────────────────────────────────────────
// // // // function buildOrbitalTargets(count) {
// // // //     const shapes = [
// // // //         // Large elliptical ring
// // // //         ...Array.from({ length: 100 }, (_, i) => {
// // // //             const a = (i / 100) * Math.PI * 2;
// // // //             return { x: Math.cos(a) * 24, y: Math.sin(a) * 10, z: Math.sin(a * 2) * 5 };
// // // //         }),
// // // //         // Tilted inner ring
// // // //         ...Array.from({ length: 70 }, (_, i) => {
// // // //             const a = (i / 70) * Math.PI * 2;
// // // //             return { x: Math.cos(a) * 16, y: Math.sin(a) * 7, z: Math.cos(a) * 7 };
// // // //         }),
// // // //         // Small central ring
// // // //         ...Array.from({ length: 40 }, (_, i) => {
// // // //             const a = (i / 40) * Math.PI * 2;
// // // //             return { x: Math.cos(a) * 8, y: Math.sin(a) * 3, z: Math.sin(a) * 8 };
// // // //         }),
// // // //         // Left cluster
// // // //         ...Array.from({ length: 120 }, () => ({
// // // //             x: -14 + (Math.random() - 0.5) * 10,
// // // //             y: 4 + (Math.random() - 0.5) * 12,
// // // //             z: (Math.random() - 0.5) * 5,
// // // //         })),
// // // //         // Right cluster
// // // //         ...Array.from({ length: 120 }, () => ({
// // // //             x: 14 + (Math.random() - 0.5) * 10,
// // // //             y: -2 + (Math.random() - 0.5) * 10,
// // // //             z: (Math.random() - 0.5) * 5,
// // // //         })),
// // // //         // Sparkle cloud
// // // //         ...Array.from({ length: 80 }, () => ({
// // // //             x: (Math.random() - 0.5) * 55,
// // // //             y: (Math.random() - 0.5) * 32,
// // // //             z: (Math.random() - 0.5) * 14,
// // // //         })),
// // // //     ];

// // // //     const targets = new Float32Array(count * 3);
// // // //     for (let i = 0; i < count; i++) {
// // // //         const s = shapes[i % shapes.length];
// // // //         targets[i * 3] = s.x + (Math.random() - 0.5) * 2.5;
// // // //         targets[i * 3 + 1] = s.y + (Math.random() - 0.5) * 2.5;
// // // //         targets[i * 3 + 2] = (s.z ?? 0) + (Math.random() - 0.5) * 1.5;
// // // //     }
// // // //     return targets;
// // // // }

// // // // // ─────────────────────────────────────────────────────────────────────────────
// // // // // MAIN COMPONENT
// // // // // ─────────────────────────────────────────────────────────────────────────────
// // // // export default function AuraIntro({ onComplete }) {
// // // //     const canvasRef = useRef(null);
// // // //     const mouseRef = useRef({ x: 9999, y: 9999 });
// // // //     const exitingRef = useRef(false);           // ref so animation loop reads current value
// // // //     const [progress, setProgress] = useState(0);
// // // //     const [showSkip, setShowSkip] = useState(false);
// // // //     const [showTagline, setShowTagline] = useState(false);
// // // //     const [fadeOut, setFadeOut] = useState(false);

// // // //     const triggerExit = useCallback(() => {
// // // //         if (exitingRef.current) return;
// // // //         exitingRef.current = true;
// // // //         setFadeOut(true);
// // // //     }, []);

// // // //     // Show skip button after 800 ms
// // // //     useEffect(() => {
// // // //         const t = setTimeout(() => setShowSkip(true), 800);
// // // //         return () => clearTimeout(t);
// // // //     }, []);

// // // //     // Call onComplete after fade-out finishes
// // // //     useEffect(() => {
// // // //         if (!fadeOut) return;
// // // //         const t = setTimeout(() => onComplete?.(), CONFIG.EXIT_DURATION * 1000);
// // // //         return () => clearTimeout(t);
// // // //     }, [fadeOut, onComplete]);

// // // //     // ── Main Three.js effect ─────────────────────────────────────────────────
// // // //     useEffect(() => {
// // // //         if (!canvasRef.current) return;
// // // //         const canvas = canvasRef.current;
// // // //         const W = window.innerWidth;
// // // //         const H = window.innerHeight;

// // // //         // Renderer
// // // //         const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
// // // //         renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
// // // //         renderer.setSize(W, H);
// // // //         renderer.setClearColor(0x04020e, 1);

// // // //         const scene = new THREE.Scene();
// // // //         const camera = new THREE.PerspectiveCamera(60, W / H, 0.1, 1000);
// // // //         camera.position.set(0, 0, CONFIG.CAMERA_START_Z);

// // // //         // Particle buffers
// // // //         const N = CONFIG.PARTICLE_COUNT;
// // // //         const positions = new Float32Array(N * 3);
// // // //         const velocities = new Float32Array(N * 3);
// // // //         const targets = new Float32Array(N * 3);
// // // //         const colors = new Float32Array(N * 3);
// // // //         const sizes = new Float32Array(N);
// // // //         const phaseOffsets = new Float32Array(N);

// // // //         const palette = CONFIG.PALETTE.map(h => new THREE.Color(h));

// // // //         for (let i = 0; i < N; i++) {
// // // //             positions[i * 3] = (Math.random() - 0.5) * 140;
// // // //             positions[i * 3 + 1] = (Math.random() - 0.5) * 100;
// // // //             positions[i * 3 + 2] = (Math.random() - 0.5) * 80;
// // // //             velocities[i * 3] = (Math.random() - 0.5) * 0.30;
// // // //             velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.30;
// // // //             velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.10;
// // // //             const c = palette[Math.floor(Math.random() * palette.length)];
// // // //             colors[i * 3] = c.r;
// // // //             colors[i * 3 + 1] = c.g;
// // // //             colors[i * 3 + 2] = c.b;
// // // //             sizes[i] = 1.5 + Math.random() * 3.0;
// // // //             phaseOffsets[i] = Math.random() * Math.PI * 2;
// // // //         }

// // // //         const geo = new THREE.BufferGeometry();
// // // //         geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
// // // //         geo.setAttribute('aColor', new THREE.BufferAttribute(colors, 3));
// // // //         geo.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));

// // // //         const mat = new THREE.ShaderMaterial({
// // // //             uniforms: {
// // // //                 uPixelRatio: { value: renderer.getPixelRatio() },
// // // //             },
// // // //             vertexShader: VERTEX_SHADER,
// // // //             fragmentShader: FRAGMENT_SHADER,
// // // //             transparent: true,
// // // //             depthWrite: false,
// // // //             blending: THREE.AdditiveBlending,
// // // //         });

// // // //         const points = new THREE.Points(geo, mat);
// // // //         scene.add(points);

// // // //         // Precompute orbital targets
// // // //         const orbitalTargets = buildOrbitalTargets(N);

// // // //         // State machine
// // // //         let phase = 'scatter';
// // // //         let phaseTime = 0;
// // // //         let totalTime = 0;
// // // //         let textPts = null;
// // // //         let cameraTargetZ = CONFIG.CAMERA_START_Z;
// // // //         let raf;

// // // //         const TOTAL = CONFIG.SCATTER_DURATION + CONFIG.ORBIT_DURATION
// // // //             + CONFIG.COLLAPSE_DURATION + CONFIG.TEXT_DURATION;

// // // //         // Sample text after DOM settles
// // // //         setTimeout(() => {
// // // //             textPts = sampleTextParticles('Aura', N, window.innerWidth);
// // // //         }, 100);

// // // //         function setTextTargets() {
// // // //             if (!textPts) return;
// // // //             for (let i = 0; i < N; i++) {
// // // //                 const pt = textPts[i % textPts.length];
// // // //                 targets[i * 3] = pt.x + (Math.random() - 0.5) * 0.6;
// // // //                 targets[i * 3 + 1] = pt.y + (Math.random() - 0.5) * 0.6;
// // // //                 targets[i * 3 + 2] = (Math.random() - 0.5) * 1.8;
// // // //             }
// // // //         }

// // // //         let lastT = performance.now();

// // // //         function tick(now) {
// // // //             raf = requestAnimationFrame(tick);
// // // //             const dt = Math.min((now - lastT) / 1000, 0.05);
// // // //             lastT = now;
// // // //             totalTime += dt;
// // // //             phaseTime += dt;

// // // //             setProgress(Math.min(totalTime / TOTAL, 1));

// // // //             // ── Phase transitions ──────────────────────────────────────────
// // // //             if (phase === 'scatter' && phaseTime >= CONFIG.SCATTER_DURATION) {
// // // //                 phase = 'orbit'; phaseTime = 0;
// // // //                 cameraTargetZ = CONFIG.CAMERA_ORBIT_Z;
// // // //             }
// // // //             if (phase === 'orbit' && phaseTime >= CONFIG.ORBIT_DURATION) {
// // // //                 phase = 'collapse'; phaseTime = 0;
// // // //                 setTextTargets();
// // // //                 cameraTargetZ = CONFIG.CAMERA_TEXT_Z + 6;
// // // //             }
// // // //             if (phase === 'collapse' && phaseTime >= CONFIG.COLLAPSE_DURATION) {
// // // //                 phase = 'text'; phaseTime = 0;
// // // //                 setShowTagline(true);
// // // //                 cameraTargetZ = CONFIG.CAMERA_TEXT_Z;
// // // //             }
// // // //             if (phase === 'text' && phaseTime >= CONFIG.TEXT_DURATION) {
// // // //                 if (!exitingRef.current) {
// // // //                     exitingRef.current = true;
// // // //                     setFadeOut(true);
// // // //                 }
// // // //                 phase = 'exit'; phaseTime = 0;
// // // //             }

// // // //             // External skip
// // // //             if (exitingRef.current && phase !== 'exit') {
// // // //                 phase = 'exit'; phaseTime = 0;
// // // //             }

// // // //             // ── Camera ─────────────────────────────────────────────────────
// // // //             camera.position.z += (cameraTargetZ - camera.position.z) * 0.028;
// // // //             const mx = mouseRef.current.x;
// // // //             const my = mouseRef.current.y;
// // // //             camera.position.x += (-mx * 2.5 - camera.position.x) * 0.022;
// // // //             camera.position.y += (my * 1.8 - camera.position.y) * 0.022;

// // // //             // Mouse → world coords at z = 0 plane
// // // //             const halfFov = THREE.MathUtils.degToRad(30);
// // // //             const mwx = mx * camera.position.z * Math.tan(halfFov);
// // // //             const mwy = my * camera.position.z * Math.tan(halfFov) / (W / H);

// // // //             // ── Particle update ────────────────────────────────────────────
// // // //             const posAttr = geo.attributes.position;
// // // //             const colAttr = geo.attributes.aColor;

// // // //             for (let i = 0; i < N; i++) {
// // // //                 const ix = i * 3, iy = i * 3 + 1, iz = i * 3 + 2;
// // // //                 let px = positions[ix], py = positions[iy], pz = positions[iz];

// // // //                 if (phase === 'scatter') {
// // // //                     velocities[ix] *= 0.983; velocities[iy] *= 0.983; velocities[iz] *= 0.983;
// // // //                     px += velocities[ix]; py += velocities[iy]; pz += velocities[iz];
// // // //                     px -= px * 0.006; py -= py * 0.006;
// // // //                     if (px > 85) px = -85; if (px < -85) px = 85;
// // // //                     if (py > 65) py = -65; if (py < -65) py = 65;

// // // //                 } else if (phase === 'orbit') {
// // // //                     const ox = orbitalTargets[ix];
// // // //                     const oy = orbitalTargets[iy];
// // // //                     const oz = orbitalTargets[iz];
// // // //                     // Rotate the orbital target around Y axis
// // // //                     const angle = totalTime * 0.16;
// // // //                     const cosA = Math.cos(angle);
// // // //                     const sinA = Math.sin(angle);
// // // //                     const rotX = ox * cosA - oz * sinA;
// // // //                     const rotZ = ox * sinA + oz * cosA;
// // // //                     const wave = Math.sin(totalTime * 0.85 + phaseOffsets[i]) * 0.9;
// // // //                     px += (rotX + wave * 0.2 - px) * 0.05;
// // // //                     py += (oy + Math.sin(totalTime * 0.65 + phaseOffsets[i]) * 0.7 - py) * 0.05;
// // // //                     pz += (rotZ - pz) * 0.05;

// // // //                 } else if (phase === 'collapse') {
// // // //                     px += (targets[ix] - px) * 0.075;
// // // //                     py += (targets[iy] - py) * 0.075;
// // // //                     pz += (targets[iz] - pz) * 0.075;

// // // //                 } else if (phase === 'text') {
// // // //                     const dx = px - mwx, dy = py - mwy;
// // // //                     const dist = Math.sqrt(dx * dx + dy * dy);
// // // //                     if (dist < CONFIG.REPEL_RADIUS && dist > 0.01) {
// // // //                         const f = ((CONFIG.REPEL_RADIUS - dist) / CONFIG.REPEL_RADIUS) ** 2;
// // // //                         px += (dx / dist) * f * CONFIG.REPEL_STRENGTH;
// // // //                         py += (dy / dist) * f * CONFIG.REPEL_STRENGTH;
// // // //                         pz += Math.sin(totalTime * 3 + phaseOffsets[i]) * f * 0.8;
// // // //                     }
// // // //                     const ease = dist < CONFIG.REPEL_RADIUS ? 0.016 : 0.032;
// // // //                     px += (targets[ix] - px) * ease;
// // // //                     py += (targets[iy] - py) * ease;
// // // //                     pz += (targets[iz] - pz) * ease;
// // // //                     // Subtle shimmer
// // // //                     px += Math.sin(totalTime * 2.2 + phaseOffsets[i]) * 0.014;
// // // //                     py += Math.cos(totalTime * 1.9 + phaseOffsets[i]) * 0.014;

// // // //                 } else if (phase === 'exit') {
// // // //                     const angle = i * 2.39996; // golden angle in radians
// // // //                     const speed = phaseTime * 28;
// // // //                     px += Math.cos(angle) * speed * dt;
// // // //                     py += Math.sin(angle) * speed * dt;
// // // //                     pz += Math.sin(angle * 1.618) * speed * 0.5 * dt;
// // // //                 }

// // // //                 positions[ix] = px; positions[iy] = py; positions[iz] = pz;
// // // //                 posAttr.array[ix] = px; posAttr.array[iy] = py; posAttr.array[iz] = pz;

// // // //                 // Color pulsing during collapse + text
// // // //                 if (phase === 'text' || phase === 'collapse') {
// // // //                     const t = (Math.sin(totalTime * 1.7 + phaseOffsets[i]) + 1) * 0.5;
// // // //                     const c1 = palette[i % palette.length];
// // // //                     const c2 = palette[(i + 2) % palette.length];
// // // //                     colAttr.array[ix] = c1.r + (c2.r - c1.r) * t * 0.4;
// // // //                     colAttr.array[iy] = c1.g + (c2.g - c1.g) * t * 0.4;
// // // //                     colAttr.array[iz] = c1.b + (c2.b - c1.b) * t * 0.4;
// // // //                 }
// // // //             }

// // // //             posAttr.needsUpdate = true;
// // // //             if (phase === 'text' || phase === 'collapse') colAttr.needsUpdate = true;

// // // //             renderer.render(scene, camera);
// // // //         }

// // // //         raf = requestAnimationFrame(tick);

// // // //         const onResize = () => {
// // // //             const w = window.innerWidth, h = window.innerHeight;
// // // //             camera.aspect = w / h;
// // // //             camera.updateProjectionMatrix();
// // // //             renderer.setSize(w, h);
// // // //         };
// // // //         window.addEventListener('resize', onResize);

// // // //         return () => {
// // // //             cancelAnimationFrame(raf);
// // // //             window.removeEventListener('resize', onResize);
// // // //             renderer.dispose();
// // // //             geo.dispose();
// // // //             mat.dispose();
// // // //         };
// // // //         // eslint-disable-next-line react-hooks/exhaustive-deps
// // // //     }, []);

// // // //     // Mouse tracking
// // // //     useEffect(() => {
// // // //         const onMove = e => {
// // // //             mouseRef.current.x = (e.clientX / window.innerWidth) * 2 - 1;
// // // //             mouseRef.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
// // // //         };
// // // //         const onTouch = e => {
// // // //             const t = e.touches[0];
// // // //             mouseRef.current.x = (t.clientX / window.innerWidth) * 2 - 1;
// // // //             mouseRef.current.y = -(t.clientY / window.innerHeight) * 2 + 1;
// // // //         };
// // // //         window.addEventListener('mousemove', onMove);
// // // //         window.addEventListener('touchmove', onTouch, { passive: true });
// // // //         return () => {
// // // //             window.removeEventListener('mousemove', onMove);
// // // //             window.removeEventListener('touchmove', onTouch);
// // // //         };
// // // //     }, []);

// // // //     // ── JSX ────────────────────────────────────────────────────────────────────
// // // //     return (
// // // //         <div style={{
// // // //             position: 'fixed', inset: 0, zIndex: 9999,
// // // //             background: '#04020e',
// // // //             opacity: fadeOut ? 0 : 1,
// // // //             transition: fadeOut ? `opacity ${CONFIG.EXIT_DURATION}s ease-in` : 'none',
// // // //             pointerEvents: fadeOut ? 'none' : 'all',
// // // //         }}>
// // // //             {/* Three.js canvas */}
// // // //             <canvas
// // // //                 ref={canvasRef}
// // // //                 style={{ display: 'block', width: '100%', height: '100%' }}
// // // //             />

// // // //             {/* Tagline */}
// // // //             <div style={{
// // // //                 position: 'absolute', top: '50%', left: '50%',
// // // //                 transform: 'translate(-50%, calc(-50% + 64px))',
// // // //                 fontFamily: 'Georgia, serif',
// // // //                 fontSize: 'clamp(11px, 1.5vw, 15px)',
// // // //                 letterSpacing: '0.30em',
// // // //                 textTransform: 'uppercase',
// // // //                 color: 'rgba(180, 160, 255, 0.75)',
// // // //                 opacity: showTagline ? 1 : 0,
// // // //                 transition: 'opacity 1.4s ease',
// // // //                 whiteSpace: 'nowrap',
// // // //                 userSelect: 'none',
// // // //                 pointerEvents: 'none',
// // // //             }}>
// // // //                 Where aesthetics meet soul
// // // //             </div>

// // // //             {/* Bottom UI */}
// // // //             <div style={{
// // // //                 position: 'absolute', bottom: 0, left: 0, right: 0,
// // // //                 display: 'flex', flexDirection: 'column', alignItems: 'center',
// // // //                 paddingBottom: '48px', gap: '20px',
// // // //                 pointerEvents: 'none',
// // // //             }}>
// // // //                 {/* Progress bar */}
// // // //                 <div style={{
// // // //                     width: '120px', height: '1px',
// // // //                     background: 'rgba(255,255,255,0.08)',
// // // //                     overflow: 'hidden',
// // // //                     opacity: showSkip ? 1 : 0,
// // // //                     transition: 'opacity 0.8s',
// // // //                 }}>
// // // //                     <div style={{
// // // //                         height: '100%',
// // // //                         width: `${progress * 100}%`,
// // // //                         background: 'linear-gradient(90deg, #7b68ee, #c084fc)',
// // // //                         transition: 'width 0.12s linear',
// // // //                     }} />
// // // //                 </div>

// // // //                 {/* Skip button */}
// // // //                 <button
// // // //                     onClick={triggerExit}
// // // //                     style={{
// // // //                         pointerEvents: showSkip ? 'all' : 'none',
// // // //                         cursor: 'pointer',
// // // //                         background: 'rgba(255,255,255,0.05)',
// // // //                         border: '1px solid rgba(255,255,255,0.16)',
// // // //                         color: 'rgba(255,255,255,0.6)',
// // // //                         fontFamily: 'sans-serif',
// // // //                         fontSize: '11px',
// // // //                         letterSpacing: '0.16em',
// // // //                         textTransform: 'uppercase',
// // // //                         padding: '10px 32px',
// // // //                         backdropFilter: 'blur(12px)',
// // // //                         borderRadius: '2px',
// // // //                         opacity: showSkip ? 1 : 0,
// // // //                         transition: 'opacity 0.8s, background 0.2s, color 0.2s',
// // // //                     }}
// // // //                     onMouseEnter={e => {
// // // //                         e.currentTarget.style.background = 'rgba(255,255,255,0.13)';
// // // //                         e.currentTarget.style.color = '#fff';
// // // //                     }}
// // // //                     onMouseLeave={e => {
// // // //                         e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
// // // //                         e.currentTarget.style.color = 'rgba(255,255,255,0.6)';
// // // //                     }}
// // // //                 >
// // // //                     Skip intro
// // // //                 </button>
// // // //             </div>

// // // //             {/* Corner branding */}
// // // //             <div style={{
// // // //                 position: 'absolute', top: '32px', left: '40px',
// // // //                 fontFamily: 'Georgia, serif',
// // // //                 fontSize: '22px',
// // // //                 letterSpacing: '0.18em',
// // // //                 color: 'rgba(255,255,255,0.10)',
// // // //                 userSelect: 'none',
// // // //                 pointerEvents: 'none',
// // // //             }}>
// // // //                 AURA
// // // //             </div>
// // // //         </div>
// // // //     );
// // // // }

// // // // // ─────────────────────────────────────────────────────────────────────────────
// // // // // GATE WRAPPER
// // // // // ─────────────────────────────────────────────────────────────────────────────
// // // // let _introSeen = false;

// // // // export function AuraIntroGate({ children }) {
// // // //     const [done, setDone] = useState(_introSeen);

// // // //     const handleComplete = useCallback(() => {
// // // //         _introSeen = true;
// // // //         setDone(true);
// // // //     }, []);

// // // //     if (done) return children;

// // // //     return (
// // // //         <>
// // // //             <AuraIntro onComplete={handleComplete} />
// // // //             {/* Pre-hydrate children invisibly */}
// // // //             <div style={{ visibility: 'hidden', position: 'absolute', inset: 0, pointerEvents: 'none' }}>
// // // //                 {children}
// // // //             </div>
// // // //         </>
// // // //     );
// // // // }


// // // // AuraIntro.jsx — Enhanced, color-corrected, tagline-in-orbit
// // // // DEPENDENCIES: npm install three
// // // //
// // // // USAGE:
// // // //   import { AuraIntroGate } from './AuraIntro';
// // // //   <AuraIntroGate><Home /></AuraIntroGate>

// // // import { useEffect, useRef, useState, useCallback } from 'react';
// // // import * as THREE from 'three';

// // // // ─────────────────────────────────────────────────────────────────────────────
// // // // CONFIG
// // // // ─────────────────────────────────────────────────────────────────────────────
// // // const CONFIG = {
// // //     PARTICLE_COUNT: 2800,
// // //     SCATTER_DURATION: 1.4,
// // //     ORBIT_DURATION: 4.5,   // slightly longer so tagline reads cleanly in ring
// // //     COLLAPSE_DURATION: 1.8,
// // //     TEXT_DURATION: 9.0,
// // //     EXIT_DURATION: 2.0,
// // //     REPEL_RADIUS: 10,
// // //     REPEL_STRENGTH: 8,
// // //     CAMERA_START_Z: 58,
// // //     CAMERA_ORBIT_Z: 48,
// // //     CAMERA_TEXT_Z: 36,
// // //     PALETTE: [
// // //         0x7b68ee, // indigo
// // //         0xc084fc, // violet
// // //         0x818cf8, // lavender
// // //         0xe879f9, // fuchsia
// // //         0xa78bfa, // purple
// // //         0x60a5fa, // blue accent
// // //     ],
// // // };

// // // // ─────────────────────────────────────────────────────────────────────────────
// // // // SHADERS
// // // // Core fix: multiply vColor by a brightness factor instead of adding white vec3.
// // // // This keeps the particle's own hue saturated — no blowout to white.
// // // // ─────────────────────────────────────────────────────────────────────────────
// // // const VERTEX_SHADER = /* glsl */`
// // //   attribute float aSize;
// // //   attribute vec3  aColor;
// // //   varying   vec3  vColor;
// // //   varying   float vDist;
// // //   uniform   float uPixelRatio;

// // //   void main() {
// // //     vColor = aColor;
// // //     vec4 mv = modelViewMatrix * vec4(position, 1.0);
// // //     vDist   = -mv.z;
// // //     float s = aSize * uPixelRatio * (300.0 / max(vDist, 1.0));
// // //     gl_PointSize = clamp(s, 1.0, 16.0);
// // //     gl_Position  = projectionMatrix * mv;
// // //   }
// // // `;

// // // const FRAGMENT_SHADER = /* glsl */`
// // //   varying vec3  vColor;
// // //   varying float vDist;

// // //   void main() {
// // //     vec2  uv = gl_PointCoord - 0.5;
// // //     float d  = length(uv);
// // //     if (d > 0.5) discard;

// // //     // Three layers — keep alpha controlled so additive blending stays colored
// // //     float core = 1.0 - smoothstep(0.0,  0.18, d);
// // //     float mid  = 1.0 - smoothstep(0.12, 0.36, d);
// // //     float glow = 1.0 - smoothstep(0.28, 0.50, d);

// // //     float a = core * 0.82 + mid * 0.32 + glow * 0.12;
// // //     a *= smoothstep(130.0, 16.0, vDist);

// // //     // Brighten toward own hue — multiply, not add white
// // //     vec3 col = vColor * (1.0 + core * 0.60 + mid * 0.20);

// // //     gl_FragColor = vec4(col, clamp(a, 0.0, 1.0));
// // //   }
// // // `;

// // // // ─────────────────────────────────────────────────────────────────────────────
// // // // HELPER — sample text pixels into Three.js world coords
// // // // ─────────────────────────────────────────────────────────────────────────────
// // // function sampleTextParticles(text, count, containerWidth) {
// // //     const offCanvas = document.createElement('canvas');
// // //     const fontSize = Math.floor(Math.min(containerWidth, 900) * 0.19);
// // //     offCanvas.width = Math.min(containerWidth, 900);
// // //     offCanvas.height = Math.round(fontSize * 1.6);
// // //     const ctx = offCanvas.getContext('2d');
// // //     ctx.clearRect(0, 0, offCanvas.width, offCanvas.height);
// // //     ctx.fillStyle = '#fff';
// // //     ctx.font = `bold ${fontSize}px Georgia, serif`;
// // //     ctx.textAlign = 'center';
// // //     ctx.textBaseline = 'middle';
// // //     ctx.fillText(text, offCanvas.width / 2, offCanvas.height / 2);

// // //     const imgData = ctx.getImageData(0, 0, offCanvas.width, offCanvas.height);
// // //     const pts = [];
// // //     for (let y = 0; y < offCanvas.height; y += 2) {
// // //         for (let x = 0; x < offCanvas.width; x += 2) {
// // //             if (imgData.data[(y * offCanvas.width + x) * 4 + 3] > 120) {
// // //                 pts.push({
// // //                     x: ((x / offCanvas.width) - 0.5) * 58,
// // //                     y: -((y / offCanvas.height) - 0.5) * 20,
// // //                 });
// // //             }
// // //         }
// // //     }
// // //     for (let i = pts.length - 1; i > 0; i--) {
// // //         const j = Math.floor(Math.random() * (i + 1));
// // //         [pts[i], pts[j]] = [pts[j], pts[i]];
// // //     }
// // //     const step = Math.max(1, Math.floor(pts.length / count));
// // //     const sampled = [];
// // //     for (let i = 0; i < pts.length && sampled.length < count; i += step) sampled.push(pts[i]);
// // //     while (sampled.length < count)
// // //         sampled.push(pts[Math.floor(Math.random() * pts.length)] ?? { x: 0, y: 0 });
// // //     return sampled.slice(0, count);
// // // }

// // // // ─────────────────────────────────────────────────────────────────────────────
// // // // HELPER — orbital target positions
// // // // ─────────────────────────────────────────────────────────────────────────────
// // // function buildOrbitalTargets(count) {
// // //     const shapes = [
// // //         ...Array.from({ length: 110 }, (_, i) => {
// // //             const a = (i / 110) * Math.PI * 2;
// // //             return { x: Math.cos(a) * 24, y: Math.sin(a) * 10, z: Math.sin(a * 2) * 5 };
// // //         }),
// // //         ...Array.from({ length: 70 }, (_, i) => {
// // //             const a = (i / 70) * Math.PI * 2;
// // //             return { x: Math.cos(a) * 16, y: Math.sin(a) * 7, z: Math.cos(a) * 7 };
// // //         }),
// // //         ...Array.from({ length: 40 }, (_, i) => {
// // //             const a = (i / 40) * Math.PI * 2;
// // //             return { x: Math.cos(a) * 8, y: Math.sin(a) * 3, z: Math.sin(a) * 8 };
// // //         }),
// // //         ...Array.from({ length: 120 }, () => ({
// // //             x: -14 + (Math.random() - 0.5) * 10,
// // //             y: 4 + (Math.random() - 0.5) * 12,
// // //             z: (Math.random() - 0.5) * 5,
// // //         })),
// // //         ...Array.from({ length: 120 }, () => ({
// // //             x: 14 + (Math.random() - 0.5) * 10,
// // //             y: -2 + (Math.random() - 0.5) * 10,
// // //             z: (Math.random() - 0.5) * 5,
// // //         })),
// // //         ...Array.from({ length: 80 }, () => ({
// // //             x: (Math.random() - 0.5) * 55,
// // //             y: (Math.random() - 0.5) * 32,
// // //             z: (Math.random() - 0.5) * 14,
// // //         })),
// // //     ];

// // //     const targets = new Float32Array(count * 3);
// // //     for (let i = 0; i < count; i++) {
// // //         const s = shapes[i % shapes.length];
// // //         targets[i * 3] = s.x + (Math.random() - 0.5) * 2.5;
// // //         targets[i * 3 + 1] = s.y + (Math.random() - 0.5) * 2.5;
// // //         targets[i * 3 + 2] = (s.z ?? 0) + (Math.random() - 0.5) * 1.5;
// // //     }
// // //     return targets;
// // // }

// // // // ─────────────────────────────────────────────────────────────────────────────
// // // // MAIN COMPONENT
// // // // ─────────────────────────────────────────────────────────────────────────────
// // // export default function AuraIntro({ onComplete }) {
// // //     const canvasRef = useRef(null);
// // //     const mouseRef = useRef({ x: 9999, y: 9999 });
// // //     const exitingRef = useRef(false);

// // //     const [progress, setProgress] = useState(0);
// // //     const [showSkip, setShowSkip] = useState(false);
// // //     // 'hidden' | 'orbit' | 'below' | 'out'
// // //     const [taglinePhase, setTaglinePhase] = useState('hidden');
// // //     const [fadeOut, setFadeOut] = useState(false);

// // //     const triggerExit = useCallback(() => {
// // //         if (exitingRef.current) return;
// // //         exitingRef.current = true;
// // //         setFadeOut(true);
// // //         setTaglinePhase('out');
// // //     }, []);

// // //     useEffect(() => {
// // //         const t = setTimeout(() => setShowSkip(true), 800);
// // //         return () => clearTimeout(t);
// // //     }, []);

// // //     useEffect(() => {
// // //         if (!fadeOut) return;
// // //         const t = setTimeout(() => onComplete?.(), CONFIG.EXIT_DURATION * 1000);
// // //         return () => clearTimeout(t);
// // //     }, [fadeOut, onComplete]);

// // //     // ── Main Three.js loop ──────────────────────────────────────────────────────
// // //     useEffect(() => {
// // //         if (!canvasRef.current) return;
// // //         const canvas = canvasRef.current;
// // //         const W = window.innerWidth;
// // //         const H = window.innerHeight;

// // //         const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
// // //         renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
// // //         renderer.setSize(W, H);
// // //         renderer.setClearColor(0x04020e, 1);

// // //         const scene = new THREE.Scene();
// // //         const camera = new THREE.PerspectiveCamera(60, W / H, 0.1, 1000);
// // //         camera.position.set(0, 0, CONFIG.CAMERA_START_Z);

// // //         const N = CONFIG.PARTICLE_COUNT;
// // //         const positions = new Float32Array(N * 3);
// // //         const velocities = new Float32Array(N * 3);
// // //         const targets = new Float32Array(N * 3);
// // //         const colors = new Float32Array(N * 3);
// // //         const sizes = new Float32Array(N);
// // //         const phaseOffsets = new Float32Array(N);

// // //         const palette = CONFIG.PALETTE.map(h => new THREE.Color(h));

// // //         for (let i = 0; i < N; i++) {
// // //             positions[i * 3] = (Math.random() - 0.5) * 140;
// // //             positions[i * 3 + 1] = (Math.random() - 0.5) * 100;
// // //             positions[i * 3 + 2] = (Math.random() - 0.5) * 80;
// // //             velocities[i * 3] = (Math.random() - 0.5) * 0.30;
// // //             velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.30;
// // //             velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.10;
// // //             const c = palette[Math.floor(Math.random() * palette.length)];
// // //             colors[i * 3] = c.r; colors[i * 3 + 1] = c.g; colors[i * 3 + 2] = c.b;
// // //             sizes[i] = 1.4 + Math.random() * 2.8;
// // //             phaseOffsets[i] = Math.random() * Math.PI * 2;
// // //         }

// // //         const geo = new THREE.BufferGeometry();
// // //         geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
// // //         geo.setAttribute('aColor', new THREE.BufferAttribute(colors, 3));
// // //         geo.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));

// // //         const mat = new THREE.ShaderMaterial({
// // //             uniforms: { uPixelRatio: { value: renderer.getPixelRatio() } },
// // //             vertexShader: VERTEX_SHADER,
// // //             fragmentShader: FRAGMENT_SHADER,
// // //             transparent: true,
// // //             depthWrite: false,
// // //             blending: THREE.AdditiveBlending,
// // //         });

// // //         scene.add(new THREE.Points(geo, mat));

// // //         const orbitalTargets = buildOrbitalTargets(N);

// // //         let phase = 'scatter';
// // //         let phaseTime = 0;
// // //         let totalTime = 0;
// // //         let textPts = null;
// // //         let cameraTargetZ = CONFIG.CAMERA_START_Z;
// // //         let raf;

// // //         const TOTAL = CONFIG.SCATTER_DURATION + CONFIG.ORBIT_DURATION
// // //             + CONFIG.COLLAPSE_DURATION + CONFIG.TEXT_DURATION;

// // //         setTimeout(() => { textPts = sampleTextParticles('Aura', N, window.innerWidth); }, 100);

// // //         function setTextTargets() {
// // //             if (!textPts) return;
// // //             for (let i = 0; i < N; i++) {
// // //                 const pt = textPts[i % textPts.length];
// // //                 targets[i * 3] = pt.x + (Math.random() - 0.5) * 0.6;
// // //                 targets[i * 3 + 1] = pt.y + (Math.random() - 0.5) * 0.6;
// // //                 targets[i * 3 + 2] = (Math.random() - 0.5) * 1.8;
// // //             }
// // //         }

// // //         let lastT = performance.now();

// // //         function tick(now) {
// // //             raf = requestAnimationFrame(tick);
// // //             const dt = Math.min((now - lastT) / 1000, 0.05);
// // //             lastT = now;
// // //             totalTime += dt;
// // //             phaseTime += dt;

// // //             setProgress(Math.min(totalTime / TOTAL, 1));

// // //             // Phase transitions
// // //             if (phase === 'scatter' && phaseTime >= CONFIG.SCATTER_DURATION) {
// // //                 phase = 'orbit'; phaseTime = 0;
// // //                 cameraTargetZ = CONFIG.CAMERA_ORBIT_Z;
// // //                 setTaglinePhase('orbit');        // ← tagline appears inside ring
// // //             }
// // //             if (phase === 'orbit' && phaseTime >= CONFIG.ORBIT_DURATION) {
// // //                 phase = 'collapse'; phaseTime = 0;
// // //                 setTextTargets();
// // //                 cameraTargetZ = CONFIG.CAMERA_TEXT_Z + 6;
// // //                 setTaglinePhase('hidden');       // ← hide while particles collapse
// // //             }
// // //             if (phase === 'collapse' && phaseTime >= CONFIG.COLLAPSE_DURATION) {
// // //                 phase = 'text'; phaseTime = 0;
// // //                 cameraTargetZ = CONFIG.CAMERA_TEXT_Z;
// // //                 setTaglinePhase('below');        // ← reappear well below particle text
// // //             }
// // //             if (phase === 'text' && phaseTime >= CONFIG.TEXT_DURATION) {
// // //                 if (!exitingRef.current) {
// // //                     exitingRef.current = true;
// // //                     setFadeOut(true);
// // //                     setTaglinePhase('out');
// // //                 }
// // //                 phase = 'exit'; phaseTime = 0;
// // //             }
// // //             if (exitingRef.current && phase !== 'exit') {
// // //                 phase = 'exit'; phaseTime = 0;
// // //             }

// // //             // Camera
// // //             camera.position.z += (cameraTargetZ - camera.position.z) * 0.028;
// // //             const mx = mouseRef.current.x;
// // //             const my = mouseRef.current.y;
// // //             camera.position.x += (-mx * 2.5 - camera.position.x) * 0.022;
// // //             camera.position.y += (my * 1.8 - camera.position.y) * 0.022;

// // //             const halfFov = THREE.MathUtils.degToRad(30);
// // //             const mwx = mx * camera.position.z * Math.tan(halfFov);
// // //             const mwy = my * camera.position.z * Math.tan(halfFov) / (W / H);

// // //             // Particle update
// // //             const posAttr = geo.attributes.position;
// // //             const colAttr = geo.attributes.aColor;

// // //             for (let i = 0; i < N; i++) {
// // //                 const ix = i * 3, iy = i * 3 + 1, iz = i * 3 + 2;
// // //                 let px = positions[ix], py = positions[iy], pz = positions[iz];

// // //                 if (phase === 'scatter') {
// // //                     velocities[ix] *= 0.983; velocities[iy] *= 0.983; velocities[iz] *= 0.983;
// // //                     px += velocities[ix]; py += velocities[iy]; pz += velocities[iz];
// // //                     px -= px * 0.006; py -= py * 0.006;
// // //                     if (px > 85) px = -85; if (px < -85) px = 85;
// // //                     if (py > 65) py = -65; if (py < -65) py = 65;

// // //                 } else if (phase === 'orbit') {
// // //                     const ox = orbitalTargets[ix];
// // //                     const oy = orbitalTargets[iy];
// // //                     const oz = orbitalTargets[iz];
// // //                     const angle = totalTime * 0.16;
// // //                     const cosA = Math.cos(angle);
// // //                     const sinA = Math.sin(angle);
// // //                     const rotX = ox * cosA - oz * sinA;
// // //                     const rotZ = ox * sinA + oz * cosA;
// // //                     const wave = Math.sin(totalTime * 0.85 + phaseOffsets[i]) * 0.9;
// // //                     px += (rotX + wave * 0.2 - px) * 0.05;
// // //                     py += (oy + Math.sin(totalTime * 0.65 + phaseOffsets[i]) * 0.7 - py) * 0.05;
// // //                     pz += (rotZ - pz) * 0.05;

// // //                 } else if (phase === 'collapse') {
// // //                     px += (targets[ix] - px) * 0.075;
// // //                     py += (targets[iy] - py) * 0.075;
// // //                     pz += (targets[iz] - pz) * 0.075;

// // //                 } else if (phase === 'text') {
// // //                     const dx = px - mwx, dy = py - mwy;
// // //                     const dist = Math.sqrt(dx * dx + dy * dy);
// // //                     if (dist < CONFIG.REPEL_RADIUS && dist > 0.01) {
// // //                         const f = ((CONFIG.REPEL_RADIUS - dist) / CONFIG.REPEL_RADIUS) ** 2;
// // //                         px += (dx / dist) * f * CONFIG.REPEL_STRENGTH;
// // //                         py += (dy / dist) * f * CONFIG.REPEL_STRENGTH;
// // //                         pz += Math.sin(totalTime * 3 + phaseOffsets[i]) * f * 0.8;
// // //                     }
// // //                     const ease = dist < CONFIG.REPEL_RADIUS ? 0.016 : 0.032;
// // //                     px += (targets[ix] - px) * ease;
// // //                     py += (targets[iy] - py) * ease;
// // //                     pz += (targets[iz] - pz) * ease;
// // //                     px += Math.sin(totalTime * 2.2 + phaseOffsets[i]) * 0.013;
// // //                     py += Math.cos(totalTime * 1.9 + phaseOffsets[i]) * 0.013;

// // //                 } else if (phase === 'exit') {
// // //                     const angle = i * 2.39996;
// // //                     const speed = phaseTime * 28;
// // //                     px += Math.cos(angle) * speed * dt;
// // //                     py += Math.sin(angle) * speed * dt;
// // //                     pz += Math.sin(angle * 1.618) * speed * 0.5 * dt;
// // //                 }

// // //                 positions[ix] = px; positions[iy] = py; positions[iz] = pz;
// // //                 posAttr.array[ix] = px; posAttr.array[iy] = py; posAttr.array[iz] = pz;

// // //                 // Color pulsing — interpolate between palette hues only, no white
// // //                 if (phase === 'text' || phase === 'collapse') {
// // //                     const t = (Math.sin(totalTime * 1.7 + phaseOffsets[i]) + 1) * 0.5;
// // //                     const c1 = palette[i % palette.length];
// // //                     const c2 = palette[(i + 2) % palette.length];
// // //                     colAttr.array[ix] = Math.min(c1.r + (c2.r - c1.r) * t * 0.5, 0.90);
// // //                     colAttr.array[iy] = Math.min(c1.g + (c2.g - c1.g) * t * 0.5, 0.90);
// // //                     colAttr.array[iz] = Math.min(c1.b + (c2.b - c1.b) * t * 0.5, 0.90);
// // //                 }
// // //             }

// // //             posAttr.needsUpdate = true;
// // //             if (phase === 'text' || phase === 'collapse') colAttr.needsUpdate = true;

// // //             renderer.render(scene, camera);
// // //         }

// // //         raf = requestAnimationFrame(tick);

// // //         const onResize = () => {
// // //             const w = window.innerWidth, h = window.innerHeight;
// // //             camera.aspect = w / h;
// // //             camera.updateProjectionMatrix();
// // //             renderer.setSize(w, h);
// // //         };
// // //         window.addEventListener('resize', onResize);

// // //         return () => {
// // //             cancelAnimationFrame(raf);
// // //             window.removeEventListener('resize', onResize);
// // //             renderer.dispose();
// // //             geo.dispose();
// // //             mat.dispose();
// // //         };
// // //         // eslint-disable-next-line react-hooks/exhaustive-deps
// // //     }, []);

// // //     // Mouse tracking
// // //     useEffect(() => {
// // //         const onMove = e => {
// // //             mouseRef.current.x = (e.clientX / window.innerWidth) * 2 - 1;
// // //             mouseRef.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
// // //         };
// // //         const onTouch = e => {
// // //             const t = e.touches[0];
// // //             mouseRef.current.x = (t.clientX / window.innerWidth) * 2 - 1;
// // //             mouseRef.current.y = -(t.clientY / window.innerHeight) * 2 + 1;
// // //         };
// // //         window.addEventListener('mousemove', onMove);
// // //         window.addEventListener('touchmove', onTouch, { passive: true });
// // //         return () => {
// // //             window.removeEventListener('mousemove', onMove);
// // //             window.removeEventListener('touchmove', onTouch);
// // //         };
// // //     }, []);

// // //     // ── Tagline style — changes per phase ──────────────────────────────────────
// // //     // orbit: centered inside the rotating ring, small italic
// // //     // below: positioned below the particle text with safe vertical gap
// // //     const taglineVisible = taglinePhase === 'orbit' || taglinePhase === 'below';

// // //     const taglineBase = {
// // //         position: 'absolute',
// // //         left: '50%',
// // //         fontFamily: 'Georgia, serif',
// // //         textTransform: 'uppercase',
// // //         whiteSpace: 'nowrap',
// // //         userSelect: 'none',
// // //         pointerEvents: 'none',
// // //         opacity: taglineVisible ? 1 : 0,
// // //         transition: 'opacity 1.1s ease, top 0.9s ease, font-size 0.6s ease, letter-spacing 0.6s ease',
// // //     };

// // //     const taglineStyle = taglinePhase === 'orbit'
// // //         ? {
// // //             ...taglineBase,
// // //             // Sit inside the ring — center of screen, vertically centered
// // //             top: '50%',
// // //             transform: 'translate(-50%, -50%)',
// // //             fontSize: 'clamp(9px, 1.0vw, 12px)',
// // //             letterSpacing: '0.28em',
// // //             color: 'rgba(210, 190, 255, 0.65)',
// // //             fontStyle: 'italic',
// // //         }
// // //         : taglinePhase === 'below'
// // //             ? {
// // //                 ...taglineBase,
// // //                 // Below the "Aura" particle text.
// // //                 // Particles sit near vertical center; push tagline 115–130px below.
// // //                 top: 'calc(50% + 120px)',
// // //                 transform: 'translateX(-50%)',
// // //                 fontSize: 'clamp(10px, 1.2vw, 13px)',
// // //                 letterSpacing: '0.32em',
// // //                 color: 'rgba(180, 160, 255, 0.68)',
// // //                 fontStyle: 'normal',
// // //             }
// // //             : {
// // //                 // hidden / out — invisible, keep in DOM for smooth fade
// // //                 ...taglineBase,
// // //                 top: '50%',
// // //                 transform: 'translate(-50%, -50%)',
// // //                 fontSize: 'clamp(10px, 1.2vw, 13px)',
// // //                 letterSpacing: '0.28em',
// // //                 color: 'rgba(180, 160, 255, 0)',
// // //             };

// // //     // ── JSX ────────────────────────────────────────────────────────────────────
// // //     return (
// // //         <div style={{
// // //             position: 'fixed',
// // //             inset: 0,
// // //             zIndex: 9999,
// // //             background: '#04020e',
// // //             opacity: fadeOut ? 0 : 1,
// // //             transition: fadeOut ? `opacity ${CONFIG.EXIT_DURATION}s ease-in` : 'none',
// // //             pointerEvents: fadeOut ? 'none' : 'all',
// // //         }}>
// // //             <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />

// // //             {/* Tagline — floats in ring during orbit, moves below text during text phase */}
// // //             <div style={taglineStyle}>
// // //                 Where aesthetics meet soul
// // //             </div>

// // //             {/* Bottom UI */}
// // //             <div style={{
// // //                 position: 'absolute',
// // //                 bottom: 0, left: 0, right: 0,
// // //                 display: 'flex',
// // //                 flexDirection: 'column',
// // //                 alignItems: 'center',
// // //                 paddingBottom: '48px',
// // //                 gap: '20px',
// // //                 pointerEvents: 'none',
// // //             }}>
// // //                 <div style={{
// // //                     width: '120px',
// // //                     height: '1px',
// // //                     background: 'rgba(255,255,255,0.08)',
// // //                     overflow: 'hidden',
// // //                     opacity: showSkip ? 1 : 0,
// // //                     transition: 'opacity 0.8s',
// // //                 }}>
// // //                     <div style={{
// // //                         height: '100%',
// // //                         width: `${progress * 100}%`,
// // //                         background: 'linear-gradient(90deg, #7b68ee, #c084fc)',
// // //                         transition: 'width 0.12s linear',
// // //                     }} />
// // //                 </div>

// // //                 <button
// // //                     onClick={triggerExit}
// // //                     style={{
// // //                         pointerEvents: showSkip ? 'all' : 'none',
// // //                         cursor: 'pointer',
// // //                         background: 'rgba(255,255,255,0.05)',
// // //                         border: '1px solid rgba(255,255,255,0.16)',
// // //                         color: 'rgba(255,255,255,0.60)',
// // //                         fontFamily: 'sans-serif',
// // //                         fontSize: '11px',
// // //                         letterSpacing: '0.16em',
// // //                         textTransform: 'uppercase',
// // //                         padding: '10px 32px',
// // //                         backdropFilter: 'blur(12px)',
// // //                         borderRadius: '2px',
// // //                         opacity: showSkip ? 1 : 0,
// // //                         transition: 'opacity 0.8s, background 0.2s, color 0.2s',
// // //                     }}
// // //                     onMouseEnter={e => {
// // //                         e.currentTarget.style.background = 'rgba(255,255,255,0.13)';
// // //                         e.currentTarget.style.color = '#fff';
// // //                     }}
// // //                     onMouseLeave={e => {
// // //                         e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
// // //                         e.currentTarget.style.color = 'rgba(255,255,255,0.60)';
// // //                     }}
// // //                 >
// // //                     Skip intro
// // //                 </button>
// // //             </div>

// // //             {/* Corner branding */}
// // //             <div style={{
// // //                 position: 'absolute',
// // //                 top: '32px',
// // //                 left: '40px',
// // //                 fontFamily: 'Georgia, serif',
// // //                 fontSize: '22px',
// // //                 letterSpacing: '0.18em',
// // //                 color: 'rgba(255,255,255,0.10)',
// // //                 userSelect: 'none',
// // //                 pointerEvents: 'none',
// // //             }}>
// // //                 AURA
// // //             </div>
// // //         </div>
// // //     );
// // // }

// // // // ─────────────────────────────────────────────────────────────────────────────
// // // // GATE WRAPPER
// // // // ─────────────────────────────────────────────────────────────────────────────
// // // let _introSeen = false;

// // // export function AuraIntroGate({ children }) {
// // //     const [done, setDone] = useState(_introSeen);

// // //     const handleComplete = useCallback(() => {
// // //         _introSeen = true;
// // //         setDone(true);
// // //     }, []);

// // //     if (done) return children;

// // //     return (
// // //         <>
// // //             <AuraIntro onComplete={handleComplete} />
// // //             <div style={{ visibility: 'hidden', position: 'absolute', inset: 0, pointerEvents: 'none' }}>
// // //                 {children}
// // //             </div>
// // //         </>
// // //     );
// // // }


// // // AuraIntro.jsx — Enhanced, color-corrected, tagline-in-orbit
// // // DEPENDENCIES: npm install three
// // //
// // // USAGE:
// // //   import { AuraIntroGate } from './AuraIntro';
// // //   <AuraIntroGate><Home /></AuraIntroGate>

// // import { useEffect, useRef, useState, useCallback } from 'react';
// // import * as THREE from 'three';

// // // ─────────────────────────────────────────────────────────────────────────────
// // // CONFIG
// // // ─────────────────────────────────────────────────────────────────────────────
// // const CONFIG = {
// //     PARTICLE_COUNT: 2800,
// //     SCATTER_DURATION: 2.2,   // longer so streams are visible before orbit
// //     ORBIT_DURATION: 4.5,   // slightly longer so tagline reads cleanly in ring
// //     COLLAPSE_DURATION: 1.8,
// //     TEXT_DURATION: 9.0,
// //     EXIT_DURATION: 2.0,
// //     REPEL_RADIUS: 10,
// //     REPEL_STRENGTH: 8,
// //     CAMERA_START_Z: 58,
// //     CAMERA_ORBIT_Z: 48,
// //     CAMERA_TEXT_Z: 36,
// //     PALETTE: [
// //         0x7b68ee, // indigo
// //         0xc084fc, // violet
// //         0x818cf8, // lavender
// //         0xe879f9, // fuchsia
// //         0xa78bfa, // purple
// //         0x60a5fa, // blue accent
// //     ],
// // };

// // // ─────────────────────────────────────────────────────────────────────────────
// // // SHADERS
// // // Core fix: multiply vColor by a brightness factor instead of adding white vec3.
// // // This keeps the particle's own hue saturated — no blowout to white.
// // // ─────────────────────────────────────────────────────────────────────────────
// // const VERTEX_SHADER = /* glsl */`
// //   attribute float aSize;
// //   attribute vec3  aColor;
// //   varying   vec3  vColor;
// //   varying   float vDist;
// //   uniform   float uPixelRatio;

// //   void main() {
// //     vColor = aColor;
// //     vec4 mv = modelViewMatrix * vec4(position, 1.0);
// //     vDist   = -mv.z;
// //     float s = aSize * uPixelRatio * (300.0 / max(vDist, 1.0));
// //     gl_PointSize = clamp(s, 1.0, 16.0);
// //     gl_Position  = projectionMatrix * mv;
// //   }
// // `;

// // const FRAGMENT_SHADER = /* glsl */`
// //   varying vec3  vColor;
// //   varying float vDist;

// //   void main() {
// //     vec2  uv = gl_PointCoord - 0.5;
// //     float d  = length(uv);
// //     if (d > 0.5) discard;

// //     // Three layers — keep alpha controlled so additive blending stays colored
// //     float core = 1.0 - smoothstep(0.0,  0.18, d);
// //     float mid  = 1.0 - smoothstep(0.12, 0.36, d);
// //     float glow = 1.0 - smoothstep(0.28, 0.50, d);

// //     float a = core * 0.82 + mid * 0.32 + glow * 0.12;
// //     a *= smoothstep(130.0, 16.0, vDist);

// //     // Brighten toward own hue — multiply, not add white
// //     vec3 col = vColor * (1.0 + core * 0.60 + mid * 0.20);

// //     gl_FragColor = vec4(col, clamp(a, 0.0, 1.0));
// //   }
// // `;

// // // ─────────────────────────────────────────────────────────────────────────────
// // // HELPER — sample text pixels into Three.js world coords
// // // ─────────────────────────────────────────────────────────────────────────────
// // function sampleTextParticles(text, count, containerWidth) {
// //     const offCanvas = document.createElement('canvas');
// //     const fontSize = Math.floor(Math.min(containerWidth, 900) * 0.19);
// //     offCanvas.width = Math.min(containerWidth, 900);
// //     offCanvas.height = Math.round(fontSize * 1.6);
// //     const ctx = offCanvas.getContext('2d');
// //     ctx.clearRect(0, 0, offCanvas.width, offCanvas.height);
// //     ctx.fillStyle = '#fff';
// //     ctx.font = `bold ${fontSize}px Georgia, serif`;
// //     ctx.textAlign = 'center';
// //     ctx.textBaseline = 'middle';
// //     ctx.fillText(text, offCanvas.width / 2, offCanvas.height / 2);

// //     const imgData = ctx.getImageData(0, 0, offCanvas.width, offCanvas.height);
// //     const pts = [];
// //     for (let y = 0; y < offCanvas.height; y += 2) {
// //         for (let x = 0; x < offCanvas.width; x += 2) {
// //             if (imgData.data[(y * offCanvas.width + x) * 4 + 3] > 120) {
// //                 pts.push({
// //                     x: ((x / offCanvas.width) - 0.5) * 58,
// //                     y: -((y / offCanvas.height) - 0.5) * 20,
// //                 });
// //             }
// //         }
// //     }
// //     for (let i = pts.length - 1; i > 0; i--) {
// //         const j = Math.floor(Math.random() * (i + 1));
// //         [pts[i], pts[j]] = [pts[j], pts[i]];
// //     }
// //     const step = Math.max(1, Math.floor(pts.length / count));
// //     const sampled = [];
// //     for (let i = 0; i < pts.length && sampled.length < count; i += step) sampled.push(pts[i]);
// //     while (sampled.length < count)
// //         sampled.push(pts[Math.floor(Math.random() * pts.length)] ?? { x: 0, y: 0 });
// //     return sampled.slice(0, count);
// // }

// // // ─────────────────────────────────────────────────────────────────────────────
// // // HELPER — orbital target positions
// // // ─────────────────────────────────────────────────────────────────────────────
// // function buildOrbitalTargets(count) {
// //     const shapes = [
// //         ...Array.from({ length: 110 }, (_, i) => {
// //             const a = (i / 110) * Math.PI * 2;
// //             return { x: Math.cos(a) * 24, y: Math.sin(a) * 10, z: Math.sin(a * 2) * 5 };
// //         }),
// //         ...Array.from({ length: 70 }, (_, i) => {
// //             const a = (i / 70) * Math.PI * 2;
// //             return { x: Math.cos(a) * 16, y: Math.sin(a) * 7, z: Math.cos(a) * 7 };
// //         }),
// //         ...Array.from({ length: 40 }, (_, i) => {
// //             const a = (i / 40) * Math.PI * 2;
// //             return { x: Math.cos(a) * 8, y: Math.sin(a) * 3, z: Math.sin(a) * 8 };
// //         }),
// //         ...Array.from({ length: 120 }, () => ({
// //             x: -14 + (Math.random() - 0.5) * 10,
// //             y: 4 + (Math.random() - 0.5) * 12,
// //             z: (Math.random() - 0.5) * 5,
// //         })),
// //         ...Array.from({ length: 120 }, () => ({
// //             x: 14 + (Math.random() - 0.5) * 10,
// //             y: -2 + (Math.random() - 0.5) * 10,
// //             z: (Math.random() - 0.5) * 5,
// //         })),
// //         ...Array.from({ length: 80 }, () => ({
// //             x: (Math.random() - 0.5) * 55,
// //             y: (Math.random() - 0.5) * 32,
// //             z: (Math.random() - 0.5) * 14,
// //         })),
// //     ];

// //     const targets = new Float32Array(count * 3);
// //     for (let i = 0; i < count; i++) {
// //         const s = shapes[i % shapes.length];
// //         targets[i * 3] = s.x + (Math.random() - 0.5) * 2.5;
// //         targets[i * 3 + 1] = s.y + (Math.random() - 0.5) * 2.5;
// //         targets[i * 3 + 2] = (s.z ?? 0) + (Math.random() - 0.5) * 1.5;
// //     }
// //     return targets;
// // }

// // // ─────────────────────────────────────────────────────────────────────────────
// // // MAIN COMPONENT
// // // ─────────────────────────────────────────────────────────────────────────────
// // export default function AuraIntro({ onComplete }) {
// //     const canvasRef = useRef(null);
// //     const mouseRef = useRef({ x: 9999, y: 9999 });
// //     const exitingRef = useRef(false);

// //     const [progress, setProgress] = useState(0);
// //     const [showSkip, setShowSkip] = useState(false);
// //     // 'hidden' | 'orbit' | 'below' | 'out'
// //     const [taglinePhase, setTaglinePhase] = useState('hidden');
// //     const [fadeOut, setFadeOut] = useState(false);

// //     const triggerExit = useCallback(() => {
// //         if (exitingRef.current) return;
// //         exitingRef.current = true;
// //         setFadeOut(true);
// //         setTaglinePhase('out');
// //     }, []);

// //     useEffect(() => {
// //         const t = setTimeout(() => setShowSkip(true), 800);
// //         return () => clearTimeout(t);
// //     }, []);

// //     useEffect(() => {
// //         if (!fadeOut) return;
// //         const t = setTimeout(() => onComplete?.(), CONFIG.EXIT_DURATION * 1000);
// //         return () => clearTimeout(t);
// //     }, [fadeOut, onComplete]);

// //     // ── Main Three.js loop ──────────────────────────────────────────────────────
// //     useEffect(() => {
// //         if (!canvasRef.current) return;
// //         const canvas = canvasRef.current;
// //         const W = window.innerWidth;
// //         const H = window.innerHeight;

// //         const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
// //         renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
// //         renderer.setSize(W, H);
// //         renderer.setClearColor(0x04020e, 1);

// //         const scene = new THREE.Scene();
// //         const camera = new THREE.PerspectiveCamera(60, W / H, 0.1, 1000);
// //         camera.position.set(0, 0, CONFIG.CAMERA_START_Z);

// //         const N = CONFIG.PARTICLE_COUNT;
// //         const positions = new Float32Array(N * 3);
// //         const velocities = new Float32Array(N * 3);
// //         const targets = new Float32Array(N * 3);
// //         const colors = new Float32Array(N * 3);
// //         const sizes = new Float32Array(N);
// //         const phaseOffsets = new Float32Array(N);

// //         const palette = CONFIG.PALETTE.map(h => new THREE.Color(h));

// //         for (let i = 0; i < N; i++) {
// //             // Spawn from one of 4 screen edges (plus corners), well outside view
// //             // so particles visibly stream IN from all directions on load
// //             const edge = Math.floor(Math.random() * 4);
// //             let sx, sy, sz, vx, vy, vz;
// //             sz = (Math.random() - 0.5) * 60;
// //             vz = (Math.random() - 0.5) * 0.08;

// //             if (edge === 0) {
// //                 // Left edge → stream rightward
// //                 sx = -110 - Math.random() * 60;
// //                 sy = (Math.random() - 0.5) * 110;
// //                 vx = 0.35 + Math.random() * 0.55;
// //                 vy = (Math.random() - 0.5) * 0.25;
// //             } else if (edge === 1) {
// //                 // Right edge → stream leftward
// //                 sx = 110 + Math.random() * 60;
// //                 sy = (Math.random() - 0.5) * 110;
// //                 vx = -(0.35 + Math.random() * 0.55);
// //                 vy = (Math.random() - 0.5) * 0.25;
// //             } else if (edge === 2) {
// //                 // Top edge → stream downward
// //                 sx = (Math.random() - 0.5) * 160;
// //                 sy = 80 + Math.random() * 40;
// //                 vx = (Math.random() - 0.5) * 0.25;
// //                 vy = -(0.30 + Math.random() * 0.45);
// //             } else {
// //                 // Bottom edge → stream upward
// //                 sx = (Math.random() - 0.5) * 160;
// //                 sy = -80 - Math.random() * 40;
// //                 vx = (Math.random() - 0.5) * 0.25;
// //                 vy = 0.30 + Math.random() * 0.45;
// //             }

// //             positions[i * 3] = sx;
// //             positions[i * 3 + 1] = sy;
// //             positions[i * 3 + 2] = sz;
// //             velocities[i * 3] = vx;
// //             velocities[i * 3 + 1] = vy;
// //             velocities[i * 3 + 2] = vz;

// //             const c = palette[Math.floor(Math.random() * palette.length)];
// //             colors[i * 3] = c.r; colors[i * 3 + 1] = c.g; colors[i * 3 + 2] = c.b;
// //             sizes[i] = 1.4 + Math.random() * 2.8;
// //             phaseOffsets[i] = Math.random() * Math.PI * 2;
// //         }

// //         const geo = new THREE.BufferGeometry();
// //         geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
// //         geo.setAttribute('aColor', new THREE.BufferAttribute(colors, 3));
// //         geo.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));

// //         const mat = new THREE.ShaderMaterial({
// //             uniforms: { uPixelRatio: { value: renderer.getPixelRatio() } },
// //             vertexShader: VERTEX_SHADER,
// //             fragmentShader: FRAGMENT_SHADER,
// //             transparent: true,
// //             depthWrite: false,
// //             blending: THREE.AdditiveBlending,
// //         });

// //         scene.add(new THREE.Points(geo, mat));

// //         const orbitalTargets = buildOrbitalTargets(N);

// //         let phase = 'scatter';
// //         let phaseTime = 0;
// //         let totalTime = 0;
// //         let textPts = null;
// //         let cameraTargetZ = CONFIG.CAMERA_START_Z;
// //         let raf;

// //         const TOTAL = CONFIG.SCATTER_DURATION + CONFIG.ORBIT_DURATION
// //             + CONFIG.COLLAPSE_DURATION + CONFIG.TEXT_DURATION;

// //         setTimeout(() => { textPts = sampleTextParticles('Aura', N, window.innerWidth); }, 100);

// //         function setTextTargets() {
// //             if (!textPts) return;
// //             for (let i = 0; i < N; i++) {
// //                 const pt = textPts[i % textPts.length];
// //                 targets[i * 3] = pt.x + (Math.random() - 0.5) * 0.6;
// //                 targets[i * 3 + 1] = pt.y + (Math.random() - 0.5) * 0.6;
// //                 targets[i * 3 + 2] = (Math.random() - 0.5) * 1.8;
// //             }
// //         }

// //         let lastT = performance.now();

// //         function tick(now) {
// //             raf = requestAnimationFrame(tick);
// //             const dt = Math.min((now - lastT) / 1000, 0.05);
// //             lastT = now;
// //             totalTime += dt;
// //             phaseTime += dt;

// //             setProgress(Math.min(totalTime / TOTAL, 1));

// //             // Phase transitions
// //             if (phase === 'scatter' && phaseTime >= CONFIG.SCATTER_DURATION) {
// //                 phase = 'orbit'; phaseTime = 0;
// //                 cameraTargetZ = CONFIG.CAMERA_ORBIT_Z;
// //                 setTaglinePhase('orbit');        // ← tagline appears inside ring
// //             }
// //             if (phase === 'orbit' && phaseTime >= CONFIG.ORBIT_DURATION) {
// //                 phase = 'collapse'; phaseTime = 0;
// //                 setTextTargets();
// //                 cameraTargetZ = CONFIG.CAMERA_TEXT_Z + 6;
// //                 setTaglinePhase('hidden');       // ← hide while particles collapse
// //             }
// //             if (phase === 'collapse' && phaseTime >= CONFIG.COLLAPSE_DURATION) {
// //                 phase = 'text'; phaseTime = 0;
// //                 cameraTargetZ = CONFIG.CAMERA_TEXT_Z;
// //                 setTaglinePhase('below');        // ← reappear well below particle text
// //             }
// //             if (phase === 'text' && phaseTime >= CONFIG.TEXT_DURATION) {
// //                 if (!exitingRef.current) {
// //                     exitingRef.current = true;
// //                     setFadeOut(true);
// //                     setTaglinePhase('out');
// //                 }
// //                 phase = 'exit'; phaseTime = 0;
// //             }
// //             if (exitingRef.current && phase !== 'exit') {
// //                 phase = 'exit'; phaseTime = 0;
// //             }

// //             // Camera
// //             camera.position.z += (cameraTargetZ - camera.position.z) * 0.028;
// //             const mx = mouseRef.current.x;
// //             const my = mouseRef.current.y;
// //             camera.position.x += (-mx * 2.5 - camera.position.x) * 0.022;
// //             camera.position.y += (my * 1.8 - camera.position.y) * 0.022;

// //             const halfFov = THREE.MathUtils.degToRad(30);
// //             const mwx = mx * camera.position.z * Math.tan(halfFov);
// //             const mwy = my * camera.position.z * Math.tan(halfFov) / (W / H);

// //             // Particle update
// //             const posAttr = geo.attributes.position;
// //             const colAttr = geo.attributes.aColor;

// //             for (let i = 0; i < N; i++) {
// //                 const ix = i * 3, iy = i * 3 + 1, iz = i * 3 + 2;
// //                 let px = positions[ix], py = positions[iy], pz = positions[iz];

// //                 if (phase === 'scatter') {
// //                     // Very gentle decel — particles keep most of their speed and drift freely
// //                     velocities[ix] *= 0.995; velocities[iy] *= 0.995; velocities[iz] *= 0.995;
// //                     px += velocities[ix]; py += velocities[iy]; pz += velocities[iz];
// //                     // Soft wrap so screen stays full of streaming dots
// //                     if (px > 120) px = -120; if (px < -120) px = 120;
// //                     if (py > 85) py = -85; if (py < -85) py = 85;

// //                 } else if (phase === 'orbit') {
// //                     const ox = orbitalTargets[ix];
// //                     const oy = orbitalTargets[iy];
// //                     const oz = orbitalTargets[iz];
// //                     const angle = totalTime * 0.16;
// //                     const cosA = Math.cos(angle);
// //                     const sinA = Math.sin(angle);
// //                     const rotX = ox * cosA - oz * sinA;
// //                     const rotZ = ox * sinA + oz * cosA;
// //                     const wave = Math.sin(totalTime * 0.85 + phaseOffsets[i]) * 0.9;
// //                     px += (rotX + wave * 0.2 - px) * 0.05;
// //                     py += (oy + Math.sin(totalTime * 0.65 + phaseOffsets[i]) * 0.7 - py) * 0.05;
// //                     pz += (rotZ - pz) * 0.05;

// //                 } else if (phase === 'collapse') {
// //                     px += (targets[ix] - px) * 0.075;
// //                     py += (targets[iy] - py) * 0.075;
// //                     pz += (targets[iz] - pz) * 0.075;

// //                 } else if (phase === 'text') {
// //                     const dx = px - mwx, dy = py - mwy;
// //                     const dist = Math.sqrt(dx * dx + dy * dy);
// //                     if (dist < CONFIG.REPEL_RADIUS && dist > 0.01) {
// //                         const f = ((CONFIG.REPEL_RADIUS - dist) / CONFIG.REPEL_RADIUS) ** 2;
// //                         px += (dx / dist) * f * CONFIG.REPEL_STRENGTH;
// //                         py += (dy / dist) * f * CONFIG.REPEL_STRENGTH;
// //                         pz += Math.sin(totalTime * 3 + phaseOffsets[i]) * f * 0.8;
// //                     }
// //                     const ease = dist < CONFIG.REPEL_RADIUS ? 0.016 : 0.032;
// //                     px += (targets[ix] - px) * ease;
// //                     py += (targets[iy] - py) * ease;
// //                     pz += (targets[iz] - pz) * ease;
// //                     px += Math.sin(totalTime * 2.2 + phaseOffsets[i]) * 0.013;
// //                     py += Math.cos(totalTime * 1.9 + phaseOffsets[i]) * 0.013;

// //                 } else if (phase === 'exit') {
// //                     const angle = i * 2.39996;
// //                     const speed = phaseTime * 28;
// //                     px += Math.cos(angle) * speed * dt;
// //                     py += Math.sin(angle) * speed * dt;
// //                     pz += Math.sin(angle * 1.618) * speed * 0.5 * dt;
// //                 }

// //                 positions[ix] = px; positions[iy] = py; positions[iz] = pz;
// //                 posAttr.array[ix] = px; posAttr.array[iy] = py; posAttr.array[iz] = pz;

// //                 // Color pulsing — interpolate between palette hues only, no white
// //                 if (phase === 'text' || phase === 'collapse') {
// //                     const t = (Math.sin(totalTime * 1.7 + phaseOffsets[i]) + 1) * 0.5;
// //                     const c1 = palette[i % palette.length];
// //                     const c2 = palette[(i + 2) % palette.length];
// //                     colAttr.array[ix] = Math.min(c1.r + (c2.r - c1.r) * t * 0.5, 0.90);
// //                     colAttr.array[iy] = Math.min(c1.g + (c2.g - c1.g) * t * 0.5, 0.90);
// //                     colAttr.array[iz] = Math.min(c1.b + (c2.b - c1.b) * t * 0.5, 0.90);
// //                 }
// //             }

// //             posAttr.needsUpdate = true;
// //             if (phase === 'text' || phase === 'collapse') colAttr.needsUpdate = true;

// //             renderer.render(scene, camera);
// //         }

// //         raf = requestAnimationFrame(tick);

// //         const onResize = () => {
// //             const w = window.innerWidth, h = window.innerHeight;
// //             camera.aspect = w / h;
// //             camera.updateProjectionMatrix();
// //             renderer.setSize(w, h);
// //         };
// //         window.addEventListener('resize', onResize);

// //         return () => {
// //             cancelAnimationFrame(raf);
// //             window.removeEventListener('resize', onResize);
// //             renderer.dispose();
// //             geo.dispose();
// //             mat.dispose();
// //         };
// //         // eslint-disable-next-line react-hooks/exhaustive-deps
// //     }, []);

// //     // Mouse tracking
// //     useEffect(() => {
// //         const onMove = e => {
// //             mouseRef.current.x = (e.clientX / window.innerWidth) * 2 - 1;
// //             mouseRef.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
// //         };
// //         const onTouch = e => {
// //             const t = e.touches[0];
// //             mouseRef.current.x = (t.clientX / window.innerWidth) * 2 - 1;
// //             mouseRef.current.y = -(t.clientY / window.innerHeight) * 2 + 1;
// //         };
// //         window.addEventListener('mousemove', onMove);
// //         window.addEventListener('touchmove', onTouch, { passive: true });
// //         return () => {
// //             window.removeEventListener('mousemove', onMove);
// //             window.removeEventListener('touchmove', onTouch);
// //         };
// //     }, []);

// //     // ── Tagline style — changes per phase ──────────────────────────────────────
// //     // orbit: centered inside the rotating ring, small italic
// //     // below: positioned below the particle text with safe vertical gap
// //     const taglineVisible = taglinePhase === 'orbit' || taglinePhase === 'below';

// //     const taglineBase = {
// //         position: 'absolute',
// //         left: '50%',
// //         fontFamily: 'Georgia, serif',
// //         textTransform: 'uppercase',
// //         whiteSpace: 'nowrap',
// //         userSelect: 'none',
// //         pointerEvents: 'none',
// //         opacity: taglineVisible ? 1 : 0,
// //         transition: 'opacity 1.1s ease, top 0.9s ease, font-size 0.6s ease, letter-spacing 0.6s ease',
// //     };

// //     const taglineStyle = taglinePhase === 'orbit'
// //         ? {
// //             ...taglineBase,
// //             // Sit inside the ring — center of screen, vertically centered
// //             top: '50%',
// //             transform: 'translate(-50%, -50%)',
// //             fontSize: 'clamp(9px, 1.0vw, 12px)',
// //             letterSpacing: '0.28em',
// //             color: 'rgba(210, 190, 255, 0.65)',
// //             fontStyle: 'italic',
// //         }
// //         : taglinePhase === 'below'
// //             ? {
// //                 ...taglineBase,
// //                 // Below the "Aura" particle text.
// //                 // Particles sit near vertical center; push tagline 115–130px below.
// //                 top: 'calc(50% + 120px)',
// //                 transform: 'translateX(-50%)',
// //                 fontSize: 'clamp(10px, 1.2vw, 13px)',
// //                 letterSpacing: '0.32em',
// //                 color: 'rgba(180, 160, 255, 0.68)',
// //                 fontStyle: 'normal',
// //             }
// //             : {
// //                 // hidden / out — invisible, keep in DOM for smooth fade
// //                 ...taglineBase,
// //                 top: '50%',
// //                 transform: 'translate(-50%, -50%)',
// //                 fontSize: 'clamp(10px, 1.2vw, 13px)',
// //                 letterSpacing: '0.28em',
// //                 color: 'rgba(180, 160, 255, 0)',
// //             };

// //     // ── JSX ────────────────────────────────────────────────────────────────────
// //     return (
// //         <div style={{
// //             position: 'fixed',
// //             inset: 0,
// //             zIndex: 9999,
// //             background: '#04020e',
// //             opacity: fadeOut ? 0 : 1,
// //             transition: fadeOut ? `opacity ${CONFIG.EXIT_DURATION}s ease-in` : 'none',
// //             pointerEvents: fadeOut ? 'none' : 'all',
// //         }}>
// //             <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />

// //             {/* Tagline — floats in ring during orbit, moves below text during text phase */}
// //             <div style={taglineStyle}>
// //                 Where aesthetics meet soul
// //             </div>

// //             {/* Bottom UI */}
// //             <div style={{
// //                 position: 'absolute',
// //                 bottom: 0, left: 0, right: 0,
// //                 display: 'flex',
// //                 flexDirection: 'column',
// //                 alignItems: 'center',
// //                 paddingBottom: '48px',
// //                 gap: '20px',
// //                 pointerEvents: 'none',
// //             }}>
// //                 <div style={{
// //                     width: '120px',
// //                     height: '1px',
// //                     background: 'rgba(255,255,255,0.08)',
// //                     overflow: 'hidden',
// //                     opacity: showSkip ? 1 : 0,
// //                     transition: 'opacity 0.8s',
// //                 }}>
// //                     <div style={{
// //                         height: '100%',
// //                         width: `${progress * 100}%`,
// //                         background: 'linear-gradient(90deg, #7b68ee, #c084fc)',
// //                         transition: 'width 0.12s linear',
// //                     }} />
// //                 </div>

// //                 <button
// //                     onClick={triggerExit}
// //                     style={{
// //                         pointerEvents: showSkip ? 'all' : 'none',
// //                         cursor: 'pointer',
// //                         background: 'rgba(255,255,255,0.05)',
// //                         border: '1px solid rgba(255,255,255,0.16)',
// //                         color: 'rgba(255,255,255,0.60)',
// //                         fontFamily: 'sans-serif',
// //                         fontSize: '11px',
// //                         letterSpacing: '0.16em',
// //                         textTransform: 'uppercase',
// //                         padding: '10px 32px',
// //                         backdropFilter: 'blur(12px)',
// //                         borderRadius: '2px',
// //                         opacity: showSkip ? 1 : 0,
// //                         transition: 'opacity 0.8s, background 0.2s, color 0.2s',
// //                     }}
// //                     onMouseEnter={e => {
// //                         e.currentTarget.style.background = 'rgba(255,255,255,0.13)';
// //                         e.currentTarget.style.color = '#fff';
// //                     }}
// //                     onMouseLeave={e => {
// //                         e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
// //                         e.currentTarget.style.color = 'rgba(255,255,255,0.60)';
// //                     }}
// //                 >
// //                     Skip intro
// //                 </button>
// //             </div>

// //             {/* Corner branding */}
// //             <div style={{
// //                 position: 'absolute',
// //                 top: '32px',
// //                 left: '40px',
// //                 fontFamily: 'Georgia, serif',
// //                 fontSize: '22px',
// //                 letterSpacing: '0.18em',
// //                 color: 'rgba(255,255,255,0.10)',
// //                 userSelect: 'none',
// //                 pointerEvents: 'none',
// //             }}>
// //                 AURA
// //             </div>
// //         </div>
// //     );
// // }

// // // ─────────────────────────────────────────────────────────────────────────────
// // // GATE WRAPPER
// // // ─────────────────────────────────────────────────────────────────────────────
// // let _introSeen = false;

// // export function AuraIntroGate({ children }) {
// //     const [done, setDone] = useState(_introSeen);

// //     const handleComplete = useCallback(() => {
// //         _introSeen = true;
// //         setDone(true);
// //     }, []);

// //     if (done) return children;

// //     return (
// //         <>
// //             <AuraIntro onComplete={handleComplete} />
// //             <div style={{ visibility: 'hidden', position: 'absolute', inset: 0, pointerEvents: 'none' }}>
// //                 {children}
// //             </div>
// //         </>
// //     );
// // }


// import { useEffect, useRef, useState, useCallback } from 'react';
// import * as THREE from 'three';

// // ─────────────────────────────────────────────────────────────────────────────
// // CONFIG
// // ─────────────────────────────────────────────────────────────────────────────
// const CONFIG = {
//     PARTICLE_COUNT: 2800,
//     SCATTER_DURATION: 2.2,   // longer so streams are visible before orbit
//     ORBIT_DURATION: 4.5,   // slightly longer so tagline reads cleanly in ring
//     COLLAPSE_DURATION: 1.8,
//     TEXT_DURATION: 9.0,
//     EXIT_DURATION: 2.0,
//     REPEL_RADIUS: 10,
//     REPEL_STRENGTH: 8,
//     CAMERA_START_Z: 58,
//     CAMERA_ORBIT_Z: 48,
//     CAMERA_TEXT_Z: 36,
//     PALETTE: [
//         0x7b68ee, // indigo
//         0xc084fc, // violet
//         0x818cf8, // lavender
//         0xe879f9, // fuchsia
//         0xa78bfa, // purple
//         0x60a5fa, // blue accent
//     ],
// };

// // ─────────────────────────────────────────────────────────────────────────────
// // SHADERS
// // Core fix: multiply vColor by a brightness factor instead of adding white vec3.
// // This keeps the particle's own hue saturated — no blowout to white.
// // ─────────────────────────────────────────────────────────────────────────────
// const VERTEX_SHADER = /* glsl */`
//   attribute float aSize;
//   attribute vec3  aColor;
//   varying   vec3  vColor;
//   varying   float vDist;
//   uniform   float uPixelRatio;

//   void main() {
//     vColor = aColor;
//     vec4 mv = modelViewMatrix * vec4(position, 1.0);
//     vDist   = -mv.z;
//     float s = aSize * uPixelRatio * (300.0 / max(vDist, 1.0));
//     gl_PointSize = clamp(s, 1.0, 16.0);
//     gl_Position  = projectionMatrix * mv;
//   }
// `;

// const FRAGMENT_SHADER = /* glsl */`
//   varying vec3  vColor;
//   varying float vDist;

//   void main() {
//     vec2  uv = gl_PointCoord - 0.5;
//     float d  = length(uv);
//     if (d > 0.5) discard;

//     // Three layers — keep alpha controlled so additive blending stays colored
//     float core = 1.0 - smoothstep(0.0,  0.18, d);
//     float mid  = 1.0 - smoothstep(0.12, 0.36, d);
//     float glow = 1.0 - smoothstep(0.28, 0.50, d);

//     float a = core * 0.82 + mid * 0.32 + glow * 0.12;
//     a *= smoothstep(130.0, 16.0, vDist);

//     // Brighten toward own hue — multiply, not add white
//     vec3 col = vColor * (1.0 + core * 0.60 + mid * 0.20);

//     gl_FragColor = vec4(col, clamp(a, 0.0, 1.0));
//   }
// `;

// // ─────────────────────────────────────────────────────────────────────────────
// // HELPER — sample text pixels into Three.js world coords
// // ─────────────────────────────────────────────────────────────────────────────
// function sampleTextParticles(text, count, containerWidth) {
//     const offCanvas = document.createElement('canvas');
//     const fontSize = Math.floor(Math.min(containerWidth, 900) * 0.19);
//     offCanvas.width = Math.min(containerWidth, 900);
//     offCanvas.height = Math.round(fontSize * 1.6);
//     const ctx = offCanvas.getContext('2d');
//     ctx.clearRect(0, 0, offCanvas.width, offCanvas.height);
//     ctx.fillStyle = '#fff';
//     ctx.font = `bold ${fontSize}px Georgia, serif`;
//     ctx.textAlign = 'center';
//     ctx.textBaseline = 'middle';
//     ctx.fillText(text, offCanvas.width / 2, offCanvas.height / 2);

//     const imgData = ctx.getImageData(0, 0, offCanvas.width, offCanvas.height);
//     const pts = [];
//     for (let y = 0; y < offCanvas.height; y += 2) {
//         for (let x = 0; x < offCanvas.width; x += 2) {
//             if (imgData.data[(y * offCanvas.width + x) * 4 + 3] > 120) {
//                 pts.push({
//                     x: ((x / offCanvas.width) - 0.5) * 58,
//                     y: -((y / offCanvas.height) - 0.5) * 20,
//                 });
//             }
//         }
//     }
//     for (let i = pts.length - 1; i > 0; i--) {
//         const j = Math.floor(Math.random() * (i + 1));
//         [pts[i], pts[j]] = [pts[j], pts[i]];
//     }
//     const step = Math.max(1, Math.floor(pts.length / count));
//     const sampled = [];
//     for (let i = 0; i < pts.length && sampled.length < count; i += step) sampled.push(pts[i]);
//     while (sampled.length < count)
//         sampled.push(pts[Math.floor(Math.random() * pts.length)] ?? { x: 0, y: 0 });
//     return sampled.slice(0, count);
// }

// // ─────────────────────────────────────────────────────────────────────────────
// // HELPER — orbital target positions
// // ─────────────────────────────────────────────────────────────────────────────
// function buildOrbitalTargets(count) {
//     const shapes = [
//         ...Array.from({ length: 110 }, (_, i) => {
//             const a = (i / 110) * Math.PI * 2;
//             return { x: Math.cos(a) * 24, y: Math.sin(a) * 10, z: Math.sin(a * 2) * 5 };
//         }),
//         ...Array.from({ length: 70 }, (_, i) => {
//             const a = (i / 70) * Math.PI * 2;
//             return { x: Math.cos(a) * 16, y: Math.sin(a) * 7, z: Math.cos(a) * 7 };
//         }),
//         ...Array.from({ length: 40 }, (_, i) => {
//             const a = (i / 40) * Math.PI * 2;
//             return { x: Math.cos(a) * 8, y: Math.sin(a) * 3, z: Math.sin(a) * 8 };
//         }),
//         ...Array.from({ length: 120 }, () => ({
//             x: -14 + (Math.random() - 0.5) * 10,
//             y: 4 + (Math.random() - 0.5) * 12,
//             z: (Math.random() - 0.5) * 5,
//         })),
//         ...Array.from({ length: 120 }, () => ({
//             x: 14 + (Math.random() - 0.5) * 10,
//             y: -2 + (Math.random() - 0.5) * 10,
//             z: (Math.random() - 0.5) * 5,
//         })),
//         ...Array.from({ length: 80 }, () => ({
//             x: (Math.random() - 0.5) * 55,
//             y: (Math.random() - 0.5) * 32,
//             z: (Math.random() - 0.5) * 14,
//         })),
//     ];

//     const targets = new Float32Array(count * 3);
//     for (let i = 0; i < count; i++) {
//         const s = shapes[i % shapes.length];
//         targets[i * 3] = s.x + (Math.random() - 0.5) * 2.5;
//         targets[i * 3 + 1] = s.y + (Math.random() - 0.5) * 2.5;
//         targets[i * 3 + 2] = (s.z ?? 0) + (Math.random() - 0.5) * 1.5;
//     }
//     return targets;
// }

// // ─────────────────────────────────────────────────────────────────────────────
// // MAIN COMPONENT
// // ─────────────────────────────────────────────────────────────────────────────
// export default function AuraIntro({ onComplete }) {
//     const canvasRef = useRef(null);
//     const mouseRef = useRef({ x: 9999, y: 9999 });
//     const exitingRef = useRef(false);

//     const [progress, setProgress] = useState(0);
//     const [showSkip, setShowSkip] = useState(false);
//     // 'hidden' | 'orbit' | 'below' | 'out'
//     const [taglinePhase, setTaglinePhase] = useState('hidden');
//     const [fadeOut, setFadeOut] = useState(false);

//     const triggerExit = useCallback(() => {
//         if (exitingRef.current) return;
//         exitingRef.current = true;
//         setFadeOut(true);
//         setTaglinePhase('out');
//     }, []);

//     useEffect(() => {
//         const t = setTimeout(() => setShowSkip(true), 800);
//         return () => clearTimeout(t);
//     }, []);

//     useEffect(() => {
//         if (!fadeOut) return;
//         const t = setTimeout(() => onComplete?.(), CONFIG.EXIT_DURATION * 1000);
//         return () => clearTimeout(t);
//     }, [fadeOut, onComplete]);

//     // ── Main Three.js loop ──────────────────────────────────────────────────────
//     useEffect(() => {
//         if (!canvasRef.current) return;
//         const canvas = canvasRef.current;
//         const W = window.innerWidth;
//         const H = window.innerHeight;

//         const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
//         renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
//         renderer.setSize(W, H);
//         renderer.setClearColor(0x04020e, 1);

//         const scene = new THREE.Scene();
//         const camera = new THREE.PerspectiveCamera(60, W / H, 0.1, 1000);
//         camera.position.set(0, 0, CONFIG.CAMERA_START_Z);

//         const N = CONFIG.PARTICLE_COUNT;
//         const positions = new Float32Array(N * 3);
//         const velocities = new Float32Array(N * 3);
//         const targets = new Float32Array(N * 3);
//         const colors = new Float32Array(N * 3);
//         const sizes = new Float32Array(N);
//         const phaseOffsets = new Float32Array(N);

//         const palette = CONFIG.PALETTE.map(h => new THREE.Color(h));

//         for (let i = 0; i < N; i++) {
//             // Start far away in all directions (spherical distribution)
//             const theta = Math.random() * Math.PI * 2;
//             const phi = Math.acos((Math.random() * 2) - 1);
//             const r = 200 + Math.random() * 150;

//             const sx = r * Math.sin(phi) * Math.cos(theta);
//             const sy = r * Math.sin(phi) * Math.sin(theta);
//             const sz = r * Math.cos(phi);

//             positions[i * 3] = sx;
//             positions[i * 3 + 1] = sy;
//             positions[i * 3 + 2] = sz;

//             // Direct velocity inward toward the center
//             const speed = 1.0 + Math.random() * 1.5;
//             velocities[i * 3] = -sx * speed / r;
//             velocities[i * 3 + 1] = -sy * speed / r;
//             velocities[i * 3 + 2] = -sz * speed / r;

//             const c = palette[Math.floor(Math.random() * palette.length)];
//             colors[i * 3] = c.r; colors[i * 3 + 1] = c.g; colors[i * 3 + 2] = c.b;
//             sizes[i] = 1.4 + Math.random() * 2.8;
//             phaseOffsets[i] = Math.random() * Math.PI * 2;
//         }

//         const geo = new THREE.BufferGeometry();
//         geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
//         geo.setAttribute('aColor', new THREE.BufferAttribute(colors, 3));
//         geo.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));

//         const mat = new THREE.ShaderMaterial({
//             uniforms: { uPixelRatio: { value: renderer.getPixelRatio() } },
//             vertexShader: VERTEX_SHADER,
//             fragmentShader: FRAGMENT_SHADER,
//             transparent: true,
//             depthWrite: false,
//             blending: THREE.AdditiveBlending,
//         });

//         scene.add(new THREE.Points(geo, mat));

//         const orbitalTargets = buildOrbitalTargets(N);

//         let phase = 'scatter';
//         let phaseTime = 0;
//         let totalTime = 0;
//         let textPts = null;
//         let cameraTargetZ = CONFIG.CAMERA_START_Z;
//         let raf;

//         const TOTAL = CONFIG.SCATTER_DURATION + CONFIG.ORBIT_DURATION
//             + CONFIG.COLLAPSE_DURATION + CONFIG.TEXT_DURATION;

//         document.fonts.ready.then(() => {
//             textPts = sampleTextParticles('Aura', N, window.innerWidth);
//         });

//         function setTextTargets() {
//             if (!textPts) return;
//             for (let i = 0; i < N; i++) {
//                 const pt = textPts[i % textPts.length];
//                 targets[i * 3] = pt.x + (Math.random() - 0.5) * 0.6;
//                 targets[i * 3 + 1] = pt.y + (Math.random() - 0.5) * 0.6;
//                 targets[i * 3 + 2] = (Math.random() - 0.5) * 1.8;
//             }
//         }

//         let lastT = performance.now();

//         function tick(now) {
//             raf = requestAnimationFrame(tick);
//             const dt = Math.min((now - lastT) / 1000, 0.05);
//             lastT = now;
//             const fpsScale = dt * 60; // Scale physics to 60fps
//             totalTime += dt;
//             phaseTime += dt;

//             setProgress(Math.min(totalTime / TOTAL, 1));

//             // Phase transitions
//             if (phase === 'scatter' && phaseTime >= CONFIG.SCATTER_DURATION) {
//                 phase = 'orbit'; phaseTime = 0;
//                 cameraTargetZ = CONFIG.CAMERA_ORBIT_Z;
//                 setTaglinePhase('orbit');        // ← tagline appears inside ring
//             }
//             if (phase === 'orbit' && phaseTime >= CONFIG.ORBIT_DURATION) {
//                 phase = 'collapse'; phaseTime = 0;
//                 setTextTargets();
//                 cameraTargetZ = CONFIG.CAMERA_TEXT_Z + 6;
//                 setTaglinePhase('hidden');       // ← hide while particles collapse
//             }
//             if (phase === 'collapse' && phaseTime >= CONFIG.COLLAPSE_DURATION) {
//                 phase = 'text'; phaseTime = 0;
//                 cameraTargetZ = CONFIG.CAMERA_TEXT_Z;
//                 setTaglinePhase('below');        // ← reappear well below particle text
//             }
//             if (phase === 'text' && phaseTime >= CONFIG.TEXT_DURATION) {
//                 if (!exitingRef.current) {
//                     exitingRef.current = true;
//                     setFadeOut(true);
//                     setTaglinePhase('out');
//                 }
//                 phase = 'exit'; phaseTime = 0;
//             }
//             if (exitingRef.current && phase !== 'exit') {
//                 phase = 'exit'; phaseTime = 0;
//             }

//             // Camera
//             camera.position.z += (cameraTargetZ - camera.position.z) * 0.028;
//             const mx = mouseRef.current.x;
//             const my = mouseRef.current.y;
//             camera.position.x += (-mx * 2.5 - camera.position.x) * 0.022;
//             camera.position.y += (my * 1.8 - camera.position.y) * 0.022;

//             const halfFov = THREE.MathUtils.degToRad(30);
//             const mwx = mx * camera.position.z * Math.tan(halfFov);
//             const mwy = my * camera.position.z * Math.tan(halfFov) / (W / H);

//             // Particle update
//             const posAttr = geo.attributes.position;
//             const colAttr = geo.attributes.aColor;

//             for (let i = 0; i < N; i++) {
//                 const ix = i * 3, iy = i * 3 + 1, iz = i * 3 + 2;
//                 let px = positions[ix], py = positions[iy], pz = positions[iz];

//                 if (phase === 'scatter') {
//                     // Particles fly inwards from all directions
//                     const decel = Math.pow(0.99, fpsScale);
//                     velocities[ix] *= decel;
//                     velocities[iy] *= decel;
//                     velocities[iz] *= decel;
//                     px += velocities[ix] * fpsScale;
//                     py += velocities[iy] * fpsScale;
//                     pz += velocities[iz] * fpsScale;

//                 } else if (phase === 'orbit') {
//                     const ox = orbitalTargets[ix];
//                     const oy = orbitalTargets[iy];
//                     const oz = orbitalTargets[iz];
//                     const angle = totalTime * 0.16;
//                     const cosA = Math.cos(angle);
//                     const sinA = Math.sin(angle);
//                     const rotX = ox * cosA - oz * sinA;
//                     const rotZ = ox * sinA + oz * cosA;
//                     const wave = Math.sin(totalTime * 0.85 + phaseOffsets[i]) * 0.9;
//                     px += (rotX + wave * 0.2 - px) * (0.05 * fpsScale);
//                     py += (oy + Math.sin(totalTime * 0.65 + phaseOffsets[i]) * 0.7 - py) * (0.05 * fpsScale);
//                     pz += (rotZ - pz) * (0.05 * fpsScale);

//                 } else if (phase === 'collapse' || phase === 'text') {
//                     const dx = px - mwx, dy = py - mwy;
//                     const dist = Math.sqrt(dx * dx + dy * dy);

//                     if (dist < CONFIG.REPEL_RADIUS && dist > 0.01) {
//                         const f = ((CONFIG.REPEL_RADIUS - dist) / CONFIG.REPEL_RADIUS) ** 2;
//                         px += (dx / dist) * f * CONFIG.REPEL_STRENGTH * fpsScale;
//                         py += (dy / dist) * f * CONFIG.REPEL_STRENGTH * fpsScale;
//                         pz += Math.sin(totalTime * 3 + phaseOffsets[i]) * f * 0.8 * fpsScale;
//                     }

//                     // Mathematically correct framerate-independent easing
//                     let baseEase = phase === 'collapse' ? 0.075 : (dist < CONFIG.REPEL_RADIUS ? 0.016 : 0.032);
//                     let ease = 1 - Math.pow(1 - baseEase, fpsScale);

//                     px += (targets[ix] - px) * ease;
//                     py += (targets[iy] - py) * ease;
//                     pz += (targets[iz] - pz) * ease;

//                     if (phase === 'text') {
//                         // Subtle shimmer
//                         px += Math.sin(totalTime * 2.2 + phaseOffsets[i]) * 0.014 * fpsScale;
//                         py += Math.cos(totalTime * 1.9 + phaseOffsets[i]) * 0.014 * fpsScale;
//                     }

//                 } else if (phase === 'exit') {
//                     const angle = i * 2.39996;
//                     const speed = phaseTime * 28;
//                     px += Math.cos(angle) * speed * dt;
//                     py += Math.sin(angle) * speed * dt;
//                     pz += Math.sin(angle * 1.618) * speed * 0.5 * dt;
//                 }

//                 positions[ix] = px; positions[iy] = py; positions[iz] = pz;
//                 posAttr.array[ix] = px; posAttr.array[iy] = py; posAttr.array[iz] = pz;

//                 // Color pulsing — interpolate between palette hues only, no white
//                 if (phase === 'text' || phase === 'collapse') {
//                     const t = (Math.sin(totalTime * 1.7 + phaseOffsets[i]) + 1) * 0.5;
//                     const c1 = palette[i % palette.length];
//                     const c2 = palette[(i + 2) % palette.length];
//                     colAttr.array[ix] = Math.min(c1.r + (c2.r - c1.r) * t * 0.5, 0.90);
//                     colAttr.array[iy] = Math.min(c1.g + (c2.g - c1.g) * t * 0.5, 0.90);
//                     colAttr.array[iz] = Math.min(c1.b + (c2.b - c1.b) * t * 0.5, 0.90);
//                 }
//             }

//             posAttr.needsUpdate = true;
//             if (phase === 'text' || phase === 'collapse') colAttr.needsUpdate = true;

//             renderer.render(scene, camera);
//         }

//         raf = requestAnimationFrame(tick);

//         const onResize = () => {
//             const w = window.innerWidth, h = window.innerHeight;
//             camera.aspect = w / h;
//             camera.updateProjectionMatrix();
//             renderer.setSize(w, h);
//         };
//         window.addEventListener('resize', onResize);

//         return () => {
//             cancelAnimationFrame(raf);
//             window.removeEventListener('resize', onResize);
//             renderer.dispose();
//             geo.dispose();
//             mat.dispose();
//         };
//         // eslint-disable-next-line react-hooks/exhaustive-deps
//     }, []);

//     // Mouse tracking
//     useEffect(() => {
//         const onMove = e => {
//             mouseRef.current.x = (e.clientX / window.innerWidth) * 2 - 1;
//             mouseRef.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
//         };
//         const onTouch = e => {
//             const t = e.touches[0];
//             mouseRef.current.x = (t.clientX / window.innerWidth) * 2 - 1;
//             mouseRef.current.y = -(t.clientY / window.innerHeight) * 2 + 1;
//         };
//         window.addEventListener('mousemove', onMove);
//         window.addEventListener('touchmove', onTouch, { passive: true });
//         return () => {
//             window.removeEventListener('mousemove', onMove);
//             window.removeEventListener('touchmove', onTouch);
//         };
//     }, []);

//     // ── Tagline style — changes per phase ──────────────────────────────────────
//     // orbit: centered inside the rotating ring, small italic
//     // below: positioned below the particle text with safe vertical gap
//     const taglineVisible = taglinePhase === 'orbit' || taglinePhase === 'below';

//     const taglineBase = {
//         position: 'absolute',
//         left: '50%',
//         fontFamily: 'Georgia, serif',
//         textTransform: 'uppercase',
//         whiteSpace: 'nowrap',
//         userSelect: 'none',
//         pointerEvents: 'none',
//         opacity: taglineVisible ? 1 : 0,
//         transition: 'opacity 0.4s ease, top 0.9s ease, font-size 0.6s ease, letter-spacing 0.6s ease',
//     };

//     const taglineStyle = taglinePhase === 'orbit'
//         ? {
//             ...taglineBase,
//             // Sit inside the ring — center of screen, vertically centered
//             top: '50%',
//             transform: 'translate(-50%, -50%)',
//             fontSize: 'clamp(9px, 1.0vw, 12px)',
//             letterSpacing: '0.28em',
//             color: 'rgba(210, 190, 255, 0.65)',
//             fontStyle: 'italic',
//         }
//         : taglinePhase === 'below'
//             ? {
//                 ...taglineBase,
//                 // Below the "Aura" particle text.
//                 // Particles sit near vertical center; push tagline 115–130px below.
//                 top: 'calc(50% + 120px)',
//                 transform: 'translateX(-50%)',
//                 fontSize: 'clamp(10px, 1.2vw, 13px)',
//                 letterSpacing: '0.32em',
//                 color: 'rgba(180, 160, 255, 0.68)',
//                 fontStyle: 'normal',
//             }
//             : {
//                 // hidden / out — invisible, keep in DOM for smooth fade
//                 ...taglineBase,
//                 top: '50%',
//                 transform: 'translate(-50%, -50%)',
//                 fontSize: 'clamp(10px, 1.2vw, 13px)',
//                 letterSpacing: '0.28em',
//                 color: 'rgba(180, 160, 255, 0)',
//             };

//     // ── JSX ────────────────────────────────────────────────────────────────────
//     return (
//         <div style={{
//             position: 'fixed',
//             inset: 0,
//             zIndex: 9999,
//             background: '#04020e',
//             opacity: fadeOut ? 0 : 1,
//             transition: fadeOut ? `opacity ${CONFIG.EXIT_DURATION}s ease-in` : 'none',
//             pointerEvents: fadeOut ? 'none' : 'all',
//         }}>
//             <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />

//             {/* Tagline — floats in ring during orbit, moves below text during text phase */}
//             <div style={taglineStyle}>
//                 Where aesthetics meet soul
//             </div>

//             {/* Bottom UI */}
//             <div style={{
//                 position: 'absolute',
//                 bottom: 0, left: 0, right: 0,
//                 display: 'flex',
//                 flexDirection: 'column',
//                 alignItems: 'center',
//                 paddingBottom: '48px',
//                 gap: '20px',
//                 pointerEvents: 'none',
//             }}>
//                 <div style={{
//                     width: '120px',
//                     height: '1px',
//                     background: 'rgba(255,255,255,0.08)',
//                     overflow: 'hidden',
//                     opacity: showSkip ? 1 : 0,
//                     transition: 'opacity 0.8s',
//                 }}>
//                     <div style={{
//                         height: '100%',
//                         width: `${progress * 100}%`,
//                         background: 'linear-gradient(90deg, #7b68ee, #c084fc)',
//                         transition: 'width 0.12s linear',
//                     }} />
//                 </div>

//                 <button
//                     onClick={triggerExit}
//                     style={{
//                         pointerEvents: showSkip ? 'all' : 'none',
//                         cursor: 'pointer',
//                         background: 'rgba(255,255,255,0.05)',
//                         border: '1px solid rgba(255,255,255,0.16)',
//                         color: 'rgba(255,255,255,0.60)',
//                         fontFamily: 'sans-serif',
//                         fontSize: '11px',
//                         letterSpacing: '0.16em',
//                         textTransform: 'uppercase',
//                         padding: '10px 32px',
//                         backdropFilter: 'blur(12px)',
//                         borderRadius: '2px',
//                         opacity: showSkip ? 1 : 0,
//                         transition: 'opacity 0.8s, background 0.2s, color 0.2s',
//                     }}
//                     onMouseEnter={e => {
//                         e.currentTarget.style.background = 'rgba(255,255,255,0.13)';
//                         e.currentTarget.style.color = '#fff';
//                     }}
//                     onMouseLeave={e => {
//                         e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
//                         e.currentTarget.style.color = 'rgba(255,255,255,0.60)';
//                     }}
//                 >
//                     Skip intro
//                 </button>
//             </div>

//             {/* Corner branding */}
//             <div style={{
//                 position: 'absolute',
//                 top: '32px',
//                 left: '40px',
//                 fontFamily: 'Georgia, serif',
//                 fontSize: '22px',
//                 letterSpacing: '0.18em',
//                 color: 'rgba(255,255,255,0.10)',
//                 userSelect: 'none',
//                 pointerEvents: 'none',
//             }}>
//                 AURA
//             </div>
//         </div>
//     );
// }

// // ─────────────────────────────────────────────────────────────────────────────
// // GATE WRAPPER
// // ─────────────────────────────────────────────────────────────────────────────
// let _introSeen = false;

// export function AuraIntroGate({ children }) {
//     const [done, setDone] = useState(_introSeen);

//     const handleComplete = useCallback(() => {
//         _introSeen = true;
//         setDone(true);
//     }, []);

//     if (done) return children;

//     return (
//         <>
//             <AuraIntro onComplete={handleComplete} />
//             <div style={{ visibility: 'hidden', position: 'absolute', inset: 0, pointerEvents: 'none' }}>
//                 {children}
//             </div>
//         </>
//     );
// }


import { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';

// ─────────────────────────────────────────────────────────────────────────────
// CONFIG
// ─────────────────────────────────────────────────────────────────────────────
const CONFIG = {
    PARTICLE_COUNT: 2800,
    SCATTER_DURATION: 2.2,   // longer so streams are visible before orbit
    ORBIT_DURATION: 4.5,   // slightly longer so tagline reads cleanly in ring
    COLLAPSE_DURATION: 1.8,
    TEXT_DURATION: 9.0,
    EXIT_DURATION: 2.0,
    REPEL_RADIUS: 10,
    REPEL_STRENGTH: 8,
    CAMERA_START_Z: 58,
    CAMERA_ORBIT_Z: 48,
    CAMERA_TEXT_Z: 36,
    PALETTE: [
        0x7b68ee, // indigo
        0xc084fc, // violet
        0x818cf8, // lavender
        0xe879f9, // fuchsia
        0xa78bfa, // purple
        0x60a5fa, // blue accent
    ],
};

// ─────────────────────────────────────────────────────────────────────────────
// SHADERS
// Core fix: multiply vColor by a brightness factor instead of adding white vec3.
// This keeps the particle's own hue saturated — no blowout to white.
// ─────────────────────────────────────────────────────────────────────────────
const VERTEX_SHADER = /* glsl */`
  attribute float aSize;
  attribute vec3  aColor;
  varying   vec3  vColor;
  varying   float vDist;
  uniform   float uPixelRatio;

  void main() {
    vColor = aColor;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vDist   = -mv.z;
    float s = aSize * uPixelRatio * (300.0 / max(vDist, 1.0));
    gl_PointSize = clamp(s, 1.0, 16.0);
    gl_Position  = projectionMatrix * mv;
  }
`;

const FRAGMENT_SHADER = /* glsl */`
  varying vec3  vColor;
  varying float vDist;

  void main() {
    vec2  uv = gl_PointCoord - 0.5;
    float d  = length(uv);
    if (d > 0.5) discard;

    // Three layers — keep alpha controlled so additive blending stays colored
    float core = 1.0 - smoothstep(0.0,  0.18, d);
    float mid  = 1.0 - smoothstep(0.12, 0.36, d);
    float glow = 1.0 - smoothstep(0.28, 0.50, d);

    float a = core * 0.82 + mid * 0.32 + glow * 0.12;
    a *= smoothstep(130.0, 16.0, vDist);

    // Brighten toward own hue — multiply, not add white
    vec3 col = vColor * (1.0 + core * 0.60 + mid * 0.20);

    gl_FragColor = vec4(col, clamp(a, 0.0, 1.0));
  }
`;

// ─────────────────────────────────────────────────────────────────────────────
// HELPER — sample text pixels into Three.js world coords
// ─────────────────────────────────────────────────────────────────────────────
function sampleTextParticles(text, count, containerWidth) {
    const offCanvas = document.createElement('canvas');
    const fontSize = Math.floor(Math.min(containerWidth, 900) * 0.19);
    offCanvas.width = Math.min(containerWidth, 900);
    offCanvas.height = Math.round(fontSize * 1.6);
    const ctx = offCanvas.getContext('2d');
    ctx.clearRect(0, 0, offCanvas.width, offCanvas.height);
    ctx.fillStyle = '#fff';
    ctx.font = `bold ${fontSize}px Georgia, serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, offCanvas.width / 2, offCanvas.height / 2);

    const imgData = ctx.getImageData(0, 0, offCanvas.width, offCanvas.height);
    const pts = [];
    for (let y = 0; y < offCanvas.height; y += 2) {
        for (let x = 0; x < offCanvas.width; x += 2) {
            if (imgData.data[(y * offCanvas.width + x) * 4 + 3] > 120) {
                pts.push({
                    x: ((x / offCanvas.width) - 0.5) * 58,
                    y: -((y / offCanvas.height) - 0.5) * 20,
                });
            }
        }
    }
    for (let i = pts.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [pts[i], pts[j]] = [pts[j], pts[i]];
    }
    const step = Math.max(1, Math.floor(pts.length / count));
    const sampled = [];
    for (let i = 0; i < pts.length && sampled.length < count; i += step) sampled.push(pts[i]);
    while (sampled.length < count)
        sampled.push(pts[Math.floor(Math.random() * pts.length)] ?? { x: 0, y: 0 });
    return sampled.slice(0, count);
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPER — orbital target positions
// ─────────────────────────────────────────────────────────────────────────────
function buildOrbitalTargets(count) {
    const shapes = [
        ...Array.from({ length: 110 }, (_, i) => {
            const a = (i / 110) * Math.PI * 2;
            return { x: Math.cos(a) * 24, y: Math.sin(a) * 10, z: Math.sin(a * 2) * 5 };
        }),
        ...Array.from({ length: 70 }, (_, i) => {
            const a = (i / 70) * Math.PI * 2;
            return { x: Math.cos(a) * 16, y: Math.sin(a) * 7, z: Math.cos(a) * 7 };
        }),
        ...Array.from({ length: 40 }, (_, i) => {
            const a = (i / 40) * Math.PI * 2;
            return { x: Math.cos(a) * 8, y: Math.sin(a) * 3, z: Math.sin(a) * 8 };
        }),
        ...Array.from({ length: 120 }, () => ({
            x: -14 + (Math.random() - 0.5) * 10,
            y: 4 + (Math.random() - 0.5) * 12,
            z: (Math.random() - 0.5) * 5,
        })),
        ...Array.from({ length: 120 }, () => ({
            x: 14 + (Math.random() - 0.5) * 10,
            y: -2 + (Math.random() - 0.5) * 10,
            z: (Math.random() - 0.5) * 5,
        })),
        ...Array.from({ length: 80 }, () => ({
            x: (Math.random() - 0.5) * 55,
            y: (Math.random() - 0.5) * 32,
            z: (Math.random() - 0.5) * 14,
        })),
    ];

    const targets = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
        const s = shapes[i % shapes.length];
        targets[i * 3] = s.x + (Math.random() - 0.5) * 2.5;
        targets[i * 3 + 1] = s.y + (Math.random() - 0.5) * 2.5;
        targets[i * 3 + 2] = (s.z ?? 0) + (Math.random() - 0.5) * 1.5;
    }
    return targets;
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default function AuraIntro({ onComplete }) {
    const canvasRef = useRef(null);
    const mouseRef = useRef({ x: 9999, y: 9999 });
    const exitingRef = useRef(false);

    const [progress, setProgress] = useState(0);
    const [showSkip, setShowSkip] = useState(false);
    // 'hidden' | 'orbit' | 'below' | 'out'
    const [taglinePhase, setTaglinePhase] = useState('hidden');
    const [fadeOut, setFadeOut] = useState(false);

    const triggerExit = useCallback(() => {
        if (exitingRef.current) return;
        exitingRef.current = true;
        setFadeOut(true);
        setTaglinePhase('out');
    }, []);

    useEffect(() => {
        const t = setTimeout(() => setShowSkip(true), 800);
        return () => clearTimeout(t);
    }, []);

    useEffect(() => {
        if (!fadeOut) return;
        const t = setTimeout(() => onComplete?.(), CONFIG.EXIT_DURATION * 1000);
        return () => clearTimeout(t);
    }, [fadeOut, onComplete]);

    // ── Main Three.js loop ──────────────────────────────────────────────────────
    useEffect(() => {
        if (!canvasRef.current) return;
        const canvas = canvasRef.current;
        const W = window.innerWidth;
        const H = window.innerHeight;

        const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(W, H);
        renderer.setClearColor(0x04020e, 1);

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(60, W / H, 0.1, 1000);
        camera.position.set(0, 0, CONFIG.CAMERA_START_Z);

        const N = CONFIG.PARTICLE_COUNT;
        const positions = new Float32Array(N * 3);
        const velocities = new Float32Array(N * 3);
        const targets = new Float32Array(N * 3);
        const colors = new Float32Array(N * 3);
        const sizes = new Float32Array(N);
        const phaseOffsets = new Float32Array(N);

        const palette = CONFIG.PALETTE.map(h => new THREE.Color(h));

        for (let i = 0; i < N; i++) {
            // Start far away in all directions (spherical distribution)
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos((Math.random() * 2) - 1);
            const r = 200 + Math.random() * 150;

            const sx = r * Math.sin(phi) * Math.cos(theta);
            const sy = r * Math.sin(phi) * Math.sin(theta);
            const sz = r * Math.cos(phi);

            positions[i * 3] = sx;
            positions[i * 3 + 1] = sy;
            positions[i * 3 + 2] = sz;

            // Direct velocity inward toward the center
            const speed = 1.0 + Math.random() * 1.5;
            velocities[i * 3] = -sx * speed / r;
            velocities[i * 3 + 1] = -sy * speed / r;
            velocities[i * 3 + 2] = -sz * speed / r;

            const c = palette[Math.floor(Math.random() * palette.length)];
            colors[i * 3] = c.r; colors[i * 3 + 1] = c.g; colors[i * 3 + 2] = c.b;
            sizes[i] = 1.4 + Math.random() * 2.8;
            phaseOffsets[i] = Math.random() * Math.PI * 2;
        }

        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geo.setAttribute('aColor', new THREE.BufferAttribute(colors, 3));
        geo.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));

        const mat = new THREE.ShaderMaterial({
            uniforms: { uPixelRatio: { value: renderer.getPixelRatio() } },
            vertexShader: VERTEX_SHADER,
            fragmentShader: FRAGMENT_SHADER,
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
        });

        scene.add(new THREE.Points(geo, mat));

        const orbitalTargets = buildOrbitalTargets(N);

        let phase = 'scatter';
        let phaseTime = 0;
        let totalTime = 0;
        let textPts = null;
        let cameraTargetZ = CONFIG.CAMERA_START_Z;
        let raf;

        const TOTAL = CONFIG.SCATTER_DURATION + CONFIG.ORBIT_DURATION
            + CONFIG.COLLAPSE_DURATION + CONFIG.TEXT_DURATION;

        setTimeout(() => { textPts = sampleTextParticles('Aura', N, window.innerWidth); }, 100);

        function setTextTargets() {
            if (!textPts) return;
            for (let i = 0; i < N; i++) {
                const pt = textPts[i % textPts.length];
                targets[i * 3] = pt.x + (Math.random() - 0.5) * 0.6;
                targets[i * 3 + 1] = pt.y + (Math.random() - 0.5) * 0.6;
                targets[i * 3 + 2] = (Math.random() - 0.5) * 1.8;
            }
        }

        let lastT = performance.now();

        function tick(now) {
            raf = requestAnimationFrame(tick);
            const dt = Math.min((now - lastT) / 1000, 0.05);
            lastT = now;
            totalTime += dt;
            phaseTime += dt;

            setProgress(Math.min(totalTime / TOTAL, 1));

            // Phase transitions
            if (phase === 'scatter' && phaseTime >= CONFIG.SCATTER_DURATION) {
                phase = 'orbit'; phaseTime = 0;
                cameraTargetZ = CONFIG.CAMERA_ORBIT_Z;
                setTaglinePhase('orbit');        // ← tagline appears inside ring
            }
            if (phase === 'orbit' && phaseTime >= CONFIG.ORBIT_DURATION) {
                phase = 'collapse'; phaseTime = 0;
                setTextTargets();
                cameraTargetZ = CONFIG.CAMERA_TEXT_Z + 6;
                setTaglinePhase('hidden');       // ← hide while particles collapse
            }
            if (phase === 'collapse' && phaseTime >= CONFIG.COLLAPSE_DURATION) {
                phase = 'text'; phaseTime = 0;
                cameraTargetZ = CONFIG.CAMERA_TEXT_Z;
                setTaglinePhase('below');        // ← reappear well below particle text
            }
            if (phase === 'text' && phaseTime >= CONFIG.TEXT_DURATION) {
                if (!exitingRef.current) {
                    exitingRef.current = true;
                    setFadeOut(true);
                    setTaglinePhase('out');
                }
                phase = 'exit'; phaseTime = 0;
            }
            if (exitingRef.current && phase !== 'exit') {
                phase = 'exit'; phaseTime = 0;
            }

            // Camera
            camera.position.z += (cameraTargetZ - camera.position.z) * 0.028;
            const mx = mouseRef.current.x;
            const my = mouseRef.current.y;
            camera.position.x += (-mx * 2.5 - camera.position.x) * 0.022;
            camera.position.y += (my * 1.8 - camera.position.y) * 0.022;

            const halfFov = THREE.MathUtils.degToRad(30);
            const mwx = mx * camera.position.z * Math.tan(halfFov);
            const mwy = my * camera.position.z * Math.tan(halfFov) / (W / H);

            // Particle update
            const posAttr = geo.attributes.position;
            const colAttr = geo.attributes.aColor;

            for (let i = 0; i < N; i++) {
                const ix = i * 3, iy = i * 3 + 1, iz = i * 3 + 2;
                let px = positions[ix], py = positions[iy], pz = positions[iz];

                if (phase === 'scatter') {
                    // Particles fly inwards from all directions
                    velocities[ix] *= 0.99; // Slight deceleration
                    velocities[iy] *= 0.99;
                    velocities[iz] *= 0.99;
                    px += velocities[ix]; py += velocities[iy]; pz += velocities[iz];

                } else if (phase === 'orbit') {
                    const ox = orbitalTargets[ix];
                    const oy = orbitalTargets[iy];
                    const oz = orbitalTargets[iz];
                    const angle = totalTime * 0.16;
                    const cosA = Math.cos(angle);
                    const sinA = Math.sin(angle);
                    const rotX = ox * cosA - oz * sinA;
                    const rotZ = ox * sinA + oz * cosA;
                    const wave = Math.sin(totalTime * 0.85 + phaseOffsets[i]) * 0.9;
                    px += (rotX + wave * 0.2 - px) * 0.05;
                    py += (oy + Math.sin(totalTime * 0.65 + phaseOffsets[i]) * 0.7 - py) * 0.05;
                    pz += (rotZ - pz) * 0.05;

                } else if (phase === 'collapse') {
                    px += (targets[ix] - px) * 0.075;
                    py += (targets[iy] - py) * 0.075;
                    pz += (targets[iz] - pz) * 0.075;

                } else if (phase === 'text') {
                    const dx = px - mwx, dy = py - mwy;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < CONFIG.REPEL_RADIUS && dist > 0.01) {
                        const f = ((CONFIG.REPEL_RADIUS - dist) / CONFIG.REPEL_RADIUS) ** 2;
                        px += (dx / dist) * f * CONFIG.REPEL_STRENGTH;
                        py += (dy / dist) * f * CONFIG.REPEL_STRENGTH;
                        pz += Math.sin(totalTime * 3 + phaseOffsets[i]) * f * 0.8;
                    }
                    const ease = dist < CONFIG.REPEL_RADIUS ? 0.016 : 0.032;
                    px += (targets[ix] - px) * ease;
                    py += (targets[iy] - py) * ease;
                    pz += (targets[iz] - pz) * ease;
                    px += Math.sin(totalTime * 2.2 + phaseOffsets[i]) * 0.013;
                    py += Math.cos(totalTime * 1.9 + phaseOffsets[i]) * 0.013;

                } else if (phase === 'exit') {
                    const angle = i * 2.39996;
                    const speed = phaseTime * 28;
                    px += Math.cos(angle) * speed * dt;
                    py += Math.sin(angle) * speed * dt;
                    pz += Math.sin(angle * 1.618) * speed * 0.5 * dt;
                }

                positions[ix] = px; positions[iy] = py; positions[iz] = pz;
                posAttr.array[ix] = px; posAttr.array[iy] = py; posAttr.array[iz] = pz;

                // Color pulsing — interpolate between palette hues only, no white
                if (phase === 'text' || phase === 'collapse') {
                    const t = (Math.sin(totalTime * 1.7 + phaseOffsets[i]) + 1) * 0.5;
                    const c1 = palette[i % palette.length];
                    const c2 = palette[(i + 2) % palette.length];
                    colAttr.array[ix] = Math.min(c1.r + (c2.r - c1.r) * t * 0.5, 0.90);
                    colAttr.array[iy] = Math.min(c1.g + (c2.g - c1.g) * t * 0.5, 0.90);
                    colAttr.array[iz] = Math.min(c1.b + (c2.b - c1.b) * t * 0.5, 0.90);
                }
            }

            posAttr.needsUpdate = true;
            if (phase === 'text' || phase === 'collapse') colAttr.needsUpdate = true;

            renderer.render(scene, camera);
        }

        raf = requestAnimationFrame(tick);

        const onResize = () => {
            const w = window.innerWidth, h = window.innerHeight;
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
            renderer.setSize(w, h);
        };
        window.addEventListener('resize', onResize);

        return () => {
            cancelAnimationFrame(raf);
            window.removeEventListener('resize', onResize);
            renderer.dispose();
            geo.dispose();
            mat.dispose();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Mouse tracking
    useEffect(() => {
        const onMove = e => {
            mouseRef.current.x = (e.clientX / window.innerWidth) * 2 - 1;
            mouseRef.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
        };
        const onTouch = e => {
            const t = e.touches[0];
            mouseRef.current.x = (t.clientX / window.innerWidth) * 2 - 1;
            mouseRef.current.y = -(t.clientY / window.innerHeight) * 2 + 1;
        };
        window.addEventListener('mousemove', onMove);
        window.addEventListener('touchmove', onTouch, { passive: true });
        return () => {
            window.removeEventListener('mousemove', onMove);
            window.removeEventListener('touchmove', onTouch);
        };
    }, []);

    // ── Tagline style — changes per phase ──────────────────────────────────────
    // orbit: centered inside the rotating ring, small italic
    // below: positioned below the particle text with safe vertical gap
    const taglineVisible = taglinePhase === 'orbit' || taglinePhase === 'below';

    const taglineBase = {
        position: 'absolute',
        left: '50%',
        fontFamily: 'Georgia, serif',
        textTransform: 'uppercase',
        whiteSpace: 'nowrap',
        userSelect: 'none',
        pointerEvents: 'none',
        opacity: taglineVisible ? 1 : 0,
        transition: 'opacity 1.1s ease, top 0.9s ease, font-size 0.6s ease, letter-spacing 0.6s ease',
    };

    const taglineStyle = taglinePhase === 'orbit'
        ? {
            ...taglineBase,
            // Sit inside the ring — center of screen, vertically centered
            top: '50%',
            transform: 'translate(-50%, -50%)',
            fontSize: 'clamp(9px, 1.0vw, 12px)',
            letterSpacing: '0.28em',
            color: 'rgba(210, 190, 255, 0.65)',
            fontStyle: 'italic',
        }
        : taglinePhase === 'below'
            ? {
                ...taglineBase,
                // Below the "Aura" particle text.
                // Particles sit near vertical center; push tagline 115–130px below.
                top: 'calc(50% + 120px)',
                transform: 'translateX(-50%)',
                fontSize: 'clamp(10px, 1.2vw, 13px)',
                letterSpacing: '0.32em',
                color: 'rgba(180, 160, 255, 0.68)',
                fontStyle: 'normal',
            }
            : {
                // hidden / out — invisible, keep in DOM for smooth fade
                ...taglineBase,
                top: '50%',
                transform: 'translate(-50%, -50%)',
                fontSize: 'clamp(10px, 1.2vw, 13px)',
                letterSpacing: '0.28em',
                color: 'rgba(180, 160, 255, 0)',
            };

    // ── JSX ────────────────────────────────────────────────────────────────────
    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: '#04020e',
            opacity: fadeOut ? 0 : 1,
            transition: fadeOut ? `opacity ${CONFIG.EXIT_DURATION}s ease-in` : 'none',
            pointerEvents: fadeOut ? 'none' : 'all',
        }}>
            <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />

            {/* Tagline — floats in ring during orbit, moves below text during text phase */}
            <div style={taglineStyle}>
                Where aesthetics meet soul
            </div>

            {/* Bottom UI */}
            <div style={{
                position: 'absolute',
                bottom: 0, left: 0, right: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                paddingBottom: '48px',
                gap: '20px',
                pointerEvents: 'none',
            }}>
                <div style={{
                    width: '120px',
                    height: '1px',
                    background: 'rgba(255,255,255,0.08)',
                    overflow: 'hidden',
                    opacity: showSkip ? 1 : 0,
                    transition: 'opacity 0.8s',
                }}>
                    <div style={{
                        height: '100%',
                        width: `${progress * 100}%`,
                        background: 'linear-gradient(90deg, #7b68ee, #c084fc)',
                        transition: 'width 0.12s linear',
                    }} />
                </div>

                <button
                    onClick={triggerExit}
                    style={{
                        pointerEvents: showSkip ? 'all' : 'none',
                        cursor: 'pointer',
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.16)',
                        color: 'rgba(255,255,255,0.60)',
                        fontFamily: 'sans-serif',
                        fontSize: '11px',
                        letterSpacing: '0.16em',
                        textTransform: 'uppercase',
                        padding: '10px 32px',
                        backdropFilter: 'blur(12px)',
                        borderRadius: '2px',
                        opacity: showSkip ? 1 : 0,
                        transition: 'opacity 0.8s, background 0.2s, color 0.2s',
                    }}
                    onMouseEnter={e => {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.13)';
                        e.currentTarget.style.color = '#fff';
                    }}
                    onMouseLeave={e => {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                        e.currentTarget.style.color = 'rgba(255,255,255,0.60)';
                    }}
                >
                    Skip intro
                </button>
            </div>

            {/* Corner branding */}
            <div style={{
                position: 'absolute',
                top: '32px',
                left: '40px',
                fontFamily: 'Georgia, serif',
                fontSize: '22px',
                letterSpacing: '0.18em',
                color: 'rgba(255,255,255,0.10)',
                userSelect: 'none',
                pointerEvents: 'none',
            }}>
                AURA
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// GATE WRAPPER
// ─────────────────────────────────────────────────────────────────────────────
let _introSeen = false;

export function AuraIntroGate({ children }) {
    const [done, setDone] = useState(_introSeen);

    const handleComplete = useCallback(() => {
        _introSeen = true;
        setDone(true);
    }, []);

    if (done) return children;

    return (
        <>
            <AuraIntro onComplete={handleComplete} />
            <div style={{ visibility: 'hidden', position: 'absolute', inset: 0, pointerEvents: 'none' }}>
                {children}
            </div>
        </>
    );
}