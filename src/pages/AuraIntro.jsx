import { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { useGesture } from '../context/GestureContext';

const CONFIG = {
    PARTICLE_COUNT: 2800,
    SCATTER_DURATION: 2.2,
    ORBIT_DURATION: 4.5,
    COLLAPSE_DURATION: 1.8,
    TEXT_DURATION: 9.0,
    EXIT_DURATION: 2.0,
    REPEL_RADIUS: 10,
    REPEL_STRENGTH: 8,
    CAMERA_START_Z: 58,
    CAMERA_ORBIT_Z: 48,
    CAMERA_TEXT_Z: 36,
    PALETTE: [
        0x7b68ee,
        0xc084fc,
        0x818cf8,
        0xe879f9,
        0xa78bfa,
        0x60a5fa,
    ],
};

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
    float core = 1.0 - smoothstep(0.0,  0.18, d);
    float mid  = 1.0 - smoothstep(0.12, 0.36, d);
    float glow = 1.0 - smoothstep(0.28, 0.50, d);
    float a = core * 0.82 + mid * 0.32 + glow * 0.12;
    a *= smoothstep(130.0, 16.0, vDist);
    vec3 col = vColor * (1.0 + core * 0.60 + mid * 0.20);
    gl_FragColor = vec4(col, clamp(a, 0.0, 1.0));
  }
`;

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
    for (let y = 0; y < offCanvas.height; y += 2)
        for (let x = 0; x < offCanvas.width; x += 2)
            if (imgData.data[(y * offCanvas.width + x) * 4 + 3] > 120)
                pts.push({
                    x: ((x / offCanvas.width) - 0.5) * 58,
                    y: -((y / offCanvas.height) - 0.5) * 20,
                });
    for (let i = pts.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [pts[i], pts[j]] = [pts[j], pts[i]];
    }
    const step = Math.max(1, Math.floor(pts.length / count));
    const sampled = [];
    for (let i = 0; i < pts.length && sampled.length < count; i += step)
        sampled.push(pts[i]);
    while (sampled.length < count)
        sampled.push(pts[Math.floor(Math.random() * pts.length)] ?? { x: 0, y: 0 });
    return sampled.slice(0, count);
}

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

export default function AuraIntro({ onComplete }) {
    const canvasRef = useRef(null);
    const mouseRef = useRef({ x: 9999, y: 9999 });
    const exitingRef = useRef(false);

    const [progress, setProgress] = useState(0);
    const [showSkip, setShowSkip] = useState(false);
    const [taglinePhase, setTaglinePhase] = useState('hidden');
    const [fadeOut, setFadeOut] = useState(false);

    const { gestureEnabled, isCameraReady, gestureRef, toggleGestures } = useGesture();

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

    // ── Three.js animation loop ───────────────────────────────────────────────
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
            positions[i * 3] = (Math.random() - 0.5) * 140;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 100;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 80;
            velocities[i * 3] = (Math.random() - 0.5) * 0.30;
            velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.30;
            velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.10;
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

        setTimeout(() => {
            textPts = sampleTextParticles('Aura', N, window.innerWidth);
        }, 100);

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

            // ── Phase transitions ─────────────────────────────────────────────
            if (phase === 'scatter' && phaseTime >= CONFIG.SCATTER_DURATION) {
                phase = 'orbit'; phaseTime = 0;
                cameraTargetZ = CONFIG.CAMERA_ORBIT_Z;
                setTaglinePhase('orbit');
            }
            if (phase === 'orbit' && phaseTime >= CONFIG.ORBIT_DURATION) {
                phase = 'collapse'; phaseTime = 0;
                setTextTargets();
                cameraTargetZ = CONFIG.CAMERA_TEXT_Z + 6;
                setTaglinePhase('hidden');
            }
            if (phase === 'collapse' && phaseTime >= CONFIG.COLLAPSE_DURATION) {
                phase = 'text'; phaseTime = 0;
                cameraTargetZ = CONFIG.CAMERA_TEXT_Z;
                setTaglinePhase('below');
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

            // ── Camera ────────────────────────────────────────────────────────
            camera.position.z += (cameraTargetZ - camera.position.z) * 0.028;
            const mx = mouseRef.current.x;
            const my = mouseRef.current.y;
            camera.position.x += (-mx * 2.5 - camera.position.x) * 0.022;
            camera.position.y += (my * 1.8 - camera.position.y) * 0.022;

            const halfFov = THREE.MathUtils.degToRad(30);
            const aspect = W / H;
            const camZ = camera.position.z;
            const mwx = mx * camZ * Math.tan(halfFov);
            const mwy = my * camZ * Math.tan(halfFov) / aspect;

            // ── Gesture world coords ──────────────────────────────────────────
            const g = gestureRef.current;
            let gwx = 0, gwy = 0;
            if (g.fingertip) {
                gwx = g.fingertip.x * camZ * Math.tan(halfFov);
                gwy = g.fingertip.y * camZ * Math.tan(halfFov) / aspect;
            }
            let gpx = 0, gpy = 0;
            if (g.pinchPoint) {
                gpx = g.pinchPoint.x * camZ * Math.tan(halfFov);
                gpy = g.pinchPoint.y * camZ * Math.tan(halfFov) / aspect;
            }

            // ── Particle update ───────────────────────────────────────────────
            const posAttr = geo.attributes.position;
            const colAttr = geo.attributes.aColor;

            for (let i = 0; i < N; i++) {
                const ix = i * 3, iy = ix + 1, iz = ix + 2;
                let px = positions[ix], py = positions[iy], pz = positions[iz];

                if (phase === 'scatter') {
                    velocities[ix] *= 0.99;
                    velocities[iy] *= 0.99;
                    velocities[iz] *= 0.99;
                    px += velocities[ix]; py += velocities[iy]; pz += velocities[iz];
                    if (px > 85) px = -85; if (px < -85) px = 85;
                    if (py > 65) py = -65; if (py < -65) py = 65;

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
                    // Mouse repulsion
                    const dx = px - mwx;
                    const dy = py - mwy;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < CONFIG.REPEL_RADIUS && dist > 0.01) {
                        const f = ((CONFIG.REPEL_RADIUS - dist) / CONFIG.REPEL_RADIUS) ** 2;
                        px += (dx / dist) * f * CONFIG.REPEL_STRENGTH;
                        py += (dy / dist) * f * CONFIG.REPEL_STRENGTH;
                        pz += Math.sin(totalTime * 3 + phaseOffsets[i]) * f * 0.8;
                    }

                    // Gesture interactions
                    if (gestureEnabled && g.fingertip) {
                        const gdx = px - gwx;
                        const gdy = py - gwy;
                        const gDist = Math.sqrt(gdx * gdx + gdy * gdy);

                        if (g.isPinching && g.pinchPoint) {
                            const pdx = px - gpx;
                            const pdy = py - gpy;
                            const pDist = Math.sqrt(pdx * pdx + pdy * pdy);
                            if (g.pinchJustStarted && pDist < 22) {
                                const f = Math.max(0, 1 - pDist / 22);
                                velocities[ix] += (pdx / (pDist + 0.1)) * f * 2.0;
                                velocities[iy] += (pdy / (pDist + 0.1)) * f * 2.0;
                            } else if (pDist < 18) {
                                const f = Math.max(0, 1 - pDist / 18);
                                px -= (pdx / (pDist + 0.1)) * f * 0.55;
                                py -= (pdy / (pDist + 0.1)) * f * 0.55;
                                pz += Math.sin(totalTime * 6 + phaseOffsets[i]) * f * 0.6;
                            }
                        } else if (g.isOpenHand && gDist < 28) {
                            const f = Math.max(0, 1 - gDist / 28);
                            px -= (gdx / (gDist + 0.1)) * f * 0.12;
                            py -= (gdy / (gDist + 0.1)) * f * 0.12;
                        } else if (g.isPointing && gDist < 14) {
                            const f = Math.max(0, 1 - gDist / 14);
                            px += (gdx / (gDist + 0.1)) * f * 0.45;
                            py += (gdy / (gDist + 0.1)) * f * 0.45;
                        }

                        if (g.twoHandsClose && g.twoHandsCenter) {
                            const cwx = g.twoHandsCenter.x * camZ * Math.tan(halfFov);
                            const cwy = g.twoHandsCenter.y * camZ * Math.tan(halfFov) / aspect;
                            const cdx = px - cwx;
                            const cdy = py - cwy;
                            const cDist = Math.sqrt(cdx * cdx + cdy * cdy);
                            if (cDist < 35) {
                                const wv = Math.sin(cDist * 0.5 - totalTime * 4);
                                pz += wv * 0.7 * Math.max(0, 1 - cDist / 35);
                            }
                        }
                    }

                    // Velocity decay + spring back
                    velocities[ix] *= 0.88;
                    velocities[iy] *= 0.88;
                    velocities[iz] *= 0.88;
                    px += velocities[ix];
                    py += velocities[iy];
                    pz += velocities[iz];

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

                // Color pulsing
                if (phase === 'text' || phase === 'collapse') {
                    const t2 = (Math.sin(totalTime * 1.7 + phaseOffsets[i]) + 1) * 0.5;
                    const c1 = palette[i % palette.length];
                    const c2 = palette[(i + 2) % palette.length];
                    let extraGlow = 0;
                    if (gestureEnabled && g.isPinching && g.pinchPoint) {
                        const pdx = px - gpx;
                        const pdy = py - gpy;
                        const pDist = Math.sqrt(pdx * pdx + pdy * pdy);
                        if (pDist < 18) extraGlow = Math.max(0, 1 - pDist / 18) * 0.3;
                    }
                    colAttr.array[ix] = Math.min(c1.r + (c2.r - c1.r) * t2 * 0.5 + extraGlow, 0.95);
                    colAttr.array[iy] = Math.min(c1.g + (c2.g - c1.g) * t2 * 0.5 + extraGlow, 0.95);
                    colAttr.array[iz] = Math.min(c1.b + (c2.b - c1.b) * t2 * 0.5 + extraGlow, 0.95);
                }
            }

            g.pinchJustStarted = false;
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

    // ── Mouse / touch tracking ────────────────────────────────────────────────
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

    // ── Tagline styles ────────────────────────────────────────────────────────
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

    const taglineStyle =
        taglinePhase === 'orbit'
            ? { ...taglineBase, top: '50%', transform: 'translate(-50%, -50%)', fontSize: 'clamp(9px, 1.0vw, 12px)', letterSpacing: '0.28em', color: 'rgba(210,190,255,0.65)', fontStyle: 'italic' }
            : taglinePhase === 'below'
                ? { ...taglineBase, top: 'calc(50% + 120px)', transform: 'translateX(-50%)', fontSize: 'clamp(10px, 1.2vw, 13px)', letterSpacing: '0.32em', color: 'rgba(180,160,255,0.68)', fontStyle: 'normal' }
                : { ...taglineBase, top: '50%', transform: 'translate(-50%, -50%)', fontSize: 'clamp(10px, 1.2vw, 13px)', letterSpacing: '0.28em', color: 'rgba(180,160,255,0)' };

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: '#04020e',
            opacity: fadeOut ? 0 : 1,
            transition: fadeOut ? `opacity ${CONFIG.EXIT_DURATION}s ease-in` : 'none',
            pointerEvents: fadeOut ? 'none' : 'all',
        }}>
            <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />

            {/* Tagline */}
            <div style={taglineStyle}>Where aesthetics meet soul</div>

            {/* Bottom UI */}
            <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0,
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                paddingBottom: '48px', gap: '20px',
                pointerEvents: 'none',
            }}>
                {/* Progress bar */}
                <div style={{
                    width: '120px', height: '1px',
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

                {/* Buttons */}
                <div style={{
                    display: 'flex', gap: '16px',
                    opacity: showSkip ? 1 : 0,
                    transition: 'opacity 0.8s',
                    pointerEvents: showSkip ? 'all' : 'none',
                }}>
                    {/* Gesture toggle */}
                    <button
                        onClick={toggleGestures}
                        style={{
                            cursor: 'pointer',
                            background: gestureEnabled ? 'rgba(123,104,238,0.22)' : 'rgba(255,255,255,0.05)',
                            border: `1px solid ${gestureEnabled ? 'rgba(123,104,238,0.55)' : 'rgba(255,255,255,0.16)'}`,
                            color: gestureEnabled ? '#c4b5fd' : 'rgba(255,255,255,0.60)',
                            fontFamily: 'sans-serif', fontSize: '11px',
                            letterSpacing: '0.16em', textTransform: 'uppercase',
                            padding: '10px 28px', backdropFilter: 'blur(12px)',
                            borderRadius: '2px', transition: 'all 0.2s',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = gestureEnabled ? 'rgba(123,104,238,0.35)' : 'rgba(255,255,255,0.13)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = gestureEnabled ? 'rgba(123,104,238,0.22)' : 'rgba(255,255,255,0.05)'; }}
                    >
                        {!gestureEnabled
                            ? '✋ Enable Gestures'
                            : isCameraReady
                                ? '✋ Gestures On'
                                : 'Starting Camera...'}
                    </button>

                    {/* Skip intro */}
                    <button
                        onClick={triggerExit}
                        style={{
                            cursor: 'pointer',
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid rgba(255,255,255,0.16)',
                            color: 'rgba(255,255,255,0.60)',
                            fontFamily: 'sans-serif', fontSize: '11px',
                            letterSpacing: '0.16em', textTransform: 'uppercase',
                            padding: '10px 32px', backdropFilter: 'blur(12px)',
                            borderRadius: '2px', transition: 'all 0.2s',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.13)'; e.currentTarget.style.color = '#fff'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'rgba(255,255,255,0.60)'; }}
                    >
                        Skip intro
                    </button>
                </div>
            </div>

            {/* Corner branding */}
            <div style={{
                position: 'absolute', top: '32px', left: '40px',
                fontFamily: 'Georgia, serif', fontSize: '22px',
                letterSpacing: '0.18em', color: 'rgba(255,255,255,0.10)',
                userSelect: 'none', pointerEvents: 'none',
            }}>
                AURA
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Gate wrapper — shows intro once per session, then renders children
// ─────────────────────────────────────────────────────────────────────────────
let _introSeen = false;

export function AuraIntroGate({ children }) {
    const [done, setDone] = useState(_introSeen);
    const handleComplete = useCallback(() => { _introSeen = true; setDone(true); }, []);

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