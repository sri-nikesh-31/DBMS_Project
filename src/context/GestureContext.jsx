// // GestureContext.jsx
// // Place in: src/context/GestureContext.jsx
// //
// // Add to your index.html <head> BEFORE your app scripts:
// //   <script src="https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js" crossorigin="anonymous"></script>
// //   <script src="https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js" crossorigin="anonymous"></script>

// import { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';

// const GestureCtx = createContext(null);

// // ─────────────────────────────────────────────────────────────────────────────
// // GestureProvider — wrap your entire app with this once in App.jsx
// // It manages the MediaPipe Hands session and exposes gesture data globally.
// // The floating cursor overlay is rendered here so it appears above everything.
// // ─────────────────────────────────────────────────────────────────────────────
// export function GestureProvider({ children }) {
//     const [gestureEnabled, setGestureEnabled] = useState(false);
//     const [isCameraReady, setIsCameraReady] = useState(false);

//     // ── gestureRef holds live data read by animation loops (no re-render cost)
//     const gestureRef = useRef({
//         fingertip: null,        // NDC {x,y} — index tip, smoothed
//         thumbtip: null,         // NDC {x,y}
//         isPinching: false,
//         pinchJustStarted: false,// true for exactly one frame on pinch edge
//         pinchPoint: null,       // NDC midpoint of index+thumb when pinching
//         isOpenHand: false,
//         isPointing: false,
//         twoHandsClose: false,
//         twoHandsCenter: null,   // NDC midpoint between two wrists
//         scrollDeltaY: 0,        // px/frame scroll — consumed by gesture scroll loop
//     });

//     // ── UI state (triggers re-render only for cursor overlay)
//     const [cursorState, setCursorState] = useState({
//         x: -999, y: -999, active: false, isPinch: false,
//     });

//     const videoRef = useRef(null);
//     const cameraInstRef = useRef(null);
//     const handsInstRef = useRef(null);
//     const smoothRef = useRef({ x: -999, y: -999 });
//     const prevPinchRef = useRef(false);
//     const prevIndexYRef = useRef(null);

//     // ── startGestures: initialise MediaPipe + webcam ──────────────────────────
//     const startGestures = useCallback(async () => {
//         if (!window.Hands || !window.Camera) {
//             console.error(
//                 '[GestureContext] MediaPipe not loaded.\n' +
//                 'Add to index.html <head>:\n' +
//                 '  <script src="https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js" crossorigin="anonymous"></script>\n' +
//                 '  <script src="https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js" crossorigin="anonymous"></script>'
//             );
//             return;
//         }

//         // Create hidden video element if needed
//         let video = videoRef.current;
//         if (!video) {
//             video = document.createElement('video');
//             video.style.cssText = 'position:fixed;width:1px;height:1px;opacity:0;pointer-events:none;top:-9999px;';
//             video.setAttribute('playsinline', '');
//             document.body.appendChild(video);
//             videoRef.current = video;
//         }

//         const hands = new window.Hands({
//             locateFile: f => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${f}`,
//         });

//         hands.setOptions({
//             maxNumHands: 2,
//             modelComplexity: 1,
//             minDetectionConfidence: 0.7,
//             minTrackingConfidence: 0.7,
//         });

//         hands.onResults(results => {
//             const g = gestureRef.current;
//             const wasPinching = prevPinchRef.current;

//             if (results.multiHandLandmarks?.length > 0) {
//                 const h1 = results.multiHandLandmarks[0];
//                 const h2 = results.multiHandLandmarks[1];

//                 // NDC: camera is horizontally mirrored, so flip X
//                 const ndc = pt => ({
//                     x: (1 - pt.x) * 2 - 1,
//                     y: -(pt.y * 2 - 1),
//                 });

//                 const idx = ndc(h1[8]);   // index fingertip
//                 const thm = ndc(h1[4]);   // thumb tip
//                 const mid = ndc(h1[12]);  // middle fingertip
//                 const rng = ndc(h1[16]);  // ring fingertip
//                 const wrst = ndc(h1[0]);  // wrist

//                 // Exponential smooth for cursor
//                 const alpha = 0.38;
//                 if (smoothRef.current.x === -999) {
//                     smoothRef.current = { x: idx.x, y: idx.y };
//                 } else {
//                     smoothRef.current.x += (idx.x - smoothRef.current.x) * alpha;
//                     smoothRef.current.y += (idx.y - smoothRef.current.y) * alpha;
//                 }

//                 const d2 = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

//                 const isPinch = d2(idx, thm) < 0.12;
//                 const isOpen = d2(mid, wrst) > 0.80 && d2(rng, wrst) > 0.65 && !isPinch;
//                 const isPoint = !isOpen && d2(idx, wrst) > 0.6 && d2(mid, wrst) < 0.5 && !isPinch;

//                 // Scroll: vertical motion of index tip while pointing
//                 let scrollDY = 0;
//                 if (isPoint && prevIndexYRef.current !== null) {
//                     // +Y in NDC = up on screen; hand moving up = natural scroll up
//                     const dy = (idx.y - prevIndexYRef.current) * window.innerHeight * 1.8;
//                     scrollDY = -dy; // flip so hand-up = scroll up (matches real scroll direction)
//                 }
//                 prevIndexYRef.current = isPoint ? idx.y : null;

//                 // Two-hand detection
//                 let twoClose = false, twoCenter = null;
//                 if (h2) {
//                     const w2 = ndc(h2[0]);
//                     if (d2(wrst, w2) < 0.80) {
//                         twoClose = true;
//                         twoCenter = { x: (wrst.x + w2.x) / 2, y: (wrst.y + w2.y) / 2 };
//                     }
//                 }

//                 const pinchMid = {
//                     x: (smoothRef.current.x + thm.x) / 2,
//                     y: (smoothRef.current.y + thm.y) / 2,
//                 };

//                 // Write to ref
//                 g.fingertip = { ...smoothRef.current };
//                 g.thumbtip = { x: thm.x, y: thm.y };
//                 g.isPinching = isPinch;
//                 g.pinchJustStarted = isPinch && !wasPinching;
//                 g.pinchPoint = isPinch ? pinchMid : null;
//                 g.isOpenHand = isOpen;
//                 g.isPointing = isPoint;
//                 g.twoHandsClose = twoClose;
//                 g.twoHandsCenter = twoCenter;
//                 g.scrollDeltaY = scrollDY;

//                 prevPinchRef.current = isPinch;

//                 // Screen coords for cursor overlay
//                 const sx = (smoothRef.current.x + 1) / 2 * window.innerWidth;
//                 const sy = (-smoothRef.current.y + 1) / 2 * window.innerHeight;
//                 setCursorState({ x: sx, y: sy, active: true, isPinch });

//                 // ── Auto scroll (for regular HTML pages) ──────────────────
//                 if (isPoint && Math.abs(scrollDY) > 0.5) {
//                     window.scrollBy({ top: scrollDY * 0.55, behavior: 'auto' });
//                 }

//                 // ── Auto click on pinch ───────────────────────────────────
//                 if (isPinch && !wasPinching) {
//                     const el = document.elementFromPoint(sx, sy);
//                     if (el) {
//                         const target = el.closest('button, a, [role="button"], [data-gesture-click]');
//                         if (target) {
//                             target.click();
//                         }
//                     }
//                 }

//             } else {
//                 // No hands detected
//                 g.fingertip = null;
//                 g.thumbtip = null;
//                 g.isPinching = false;
//                 g.pinchJustStarted = false;
//                 g.pinchPoint = null;
//                 g.isOpenHand = false;
//                 g.isPointing = false;
//                 g.twoHandsClose = false;
//                 g.twoHandsCenter = null;
//                 g.scrollDeltaY = 0;
//                 smoothRef.current = { x: -999, y: -999 };
//                 prevIndexYRef.current = null;
//                 prevPinchRef.current = false;
//                 setCursorState(p => ({ ...p, active: false }));
//             }
//         });

//         handsInstRef.current = hands;

//         const cam = new window.Camera(video, {
//             onFrame: async () => {
//                 if (handsInstRef.current) {
//                     await handsInstRef.current.send({ image: video });
//                 }
//             },
//             width: 640,
//             height: 480,
//         });

//         cameraInstRef.current = cam;

//         try {
//             await cam.start();
//             setIsCameraReady(true);
//         } catch (err) {
//             console.error('[GestureContext] Camera error:', err);
//         }
//     }, []);

//     // ── stopGestures: tear everything down ───────────────────────────────────
//     const stopGestures = useCallback(() => {
//         cameraInstRef.current?.stop?.();
//         handsInstRef.current?.close?.();
//         cameraInstRef.current = null;
//         handsInstRef.current = null;
//         if (videoRef.current?.srcObject) {
//             videoRef.current.srcObject.getTracks().forEach(t => t.stop());
//             videoRef.current.srcObject = null;
//         }
//         prevPinchRef.current = false;
//         smoothRef.current = { x: -999, y: -999 };
//         setIsCameraReady(false);
//         setCursorState({ x: -999, y: -999, active: false, isPinch: false });
//     }, []);

//     // ── toggleGestures ────────────────────────────────────────────────────────
//     const toggleGestures = useCallback(() => {
//         setGestureEnabled(prev => {
//             const next = !prev;
//             if (next) startGestures();
//             else stopGestures();
//             return next;
//         });
//     }, [startGestures, stopGestures]);

//     // Cleanup on unmount
//     useEffect(() => () => stopGestures(), [stopGestures]);

//     const value = {
//         gestureEnabled,
//         isCameraReady,
//         gestureRef,       // stable ref — safe to read in rAF loops
//         cursorState,      // reactive — use for UI that renders based on cursor
//         toggleGestures,
//         startGestures,
//         stopGestures,
//     };

//     return (
//         <GestureCtx.Provider value={value}>
//             {children}

//             {/* ── Global gesture cursor overlay ────────────────────────────
//                 Renders on top of all pages once gesture mode is on.
//                 This is the single source of truth for the visual cursor.    */}
//             {gestureEnabled && cursorState.active && (
//                 <div
//                     aria-hidden="true"
//                     style={{
//                         position: 'fixed',
//                         left: cursorState.x,
//                         top: cursorState.y,
//                         width: cursorState.isPinch ? 22 : 14,
//                         height: cursorState.isPinch ? 22 : 14,
//                         transform: 'translate(-50%, -50%)',
//                         borderRadius: '50%',
//                         background: cursorState.isPinch
//                             ? 'rgba(255,255,255,0.95)'
//                             : 'rgba(255,255,255,0.55)',
//                         boxShadow: cursorState.isPinch
//                             ? '0 0 24px 6px rgba(192,132,252,0.85)'
//                             : '0 0 10px 2px rgba(123,104,238,0.55)',
//                         pointerEvents: 'none',
//                         zIndex: 99999,
//                         transition: 'width 0.1s, height 0.1s, box-shadow 0.1s',
//                     }}
//                 />
//             )}
//         </GestureCtx.Provider>
//     );
// }

// // ─────────────────────────────────────────────────────────────────────────────
// // useGesture — access gesture state in any component
// //
// // Example:
// //   const { gestureEnabled, gestureRef } = useGesture();
// //
// //   // For animation loops — read gestureRef.current.isPinching etc.
// //   // For reactive UI — use gestureEnabled, cursorState from context
// // ─────────────────────────────────────────────────────────────────────────────
// export function useGesture() {
//     const ctx = useContext(GestureCtx);
//     if (!ctx) throw new Error('useGesture() must be used inside <GestureProvider>');
//     return ctx;
// }

// // ─────────────────────────────────────────────────────────────────────────────
// // useGestureScroll — convenience hook for components with custom scroll areas
// // Usage: attach the returned ref to a scrollable container
// //
// //   const scrollRef = useGestureScroll();
// //   return <div ref={scrollRef} style={{ overflowY: 'auto', height: '100%' }}>...</div>
// // ─────────────────────────────────────────────────────────────────────────────
// export function useGestureScroll() {
//     const { gestureEnabled, gestureRef, cursorState } = useGesture();
//     const containerRef = useRef(null);

//     useEffect(() => {
//         if (!gestureEnabled) return;

//         let raf;
//         function loop() {
//             raf = requestAnimationFrame(loop);
//             const g = gestureRef.current;
//             const el = containerRef.current;
//             if (!el || !g.isPointing || Math.abs(g.scrollDeltaY) < 0.5) return;

//             // Check if cursor is over this element
//             const rect = el.getBoundingClientRect();
//             const { x, y } = cursorState;
//             if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
//                 el.scrollBy({ top: g.scrollDeltaY * 0.55, behavior: 'auto' });
//             }
//         }
//         raf = requestAnimationFrame(loop);
//         return () => cancelAnimationFrame(raf);
//     }, [gestureEnabled, gestureRef, cursorState]);

//     return containerRef;
// }

// // ─────────────────────────────────────────────────────────────────────────────
// // useGestureHover — returns true when gesture cursor hovers over a ref'd element
// //
// //   const hoverRef = useRef(null);
// //   const isHovered = useGestureHover(hoverRef);
// //   return <div ref={hoverRef} style={{ opacity: isHovered ? 1 : 0.5 }}>...</div>
// // ─────────────────────────────────────────────────────────────────────────────
// export function useGestureHover(elementRef) {
//     const { gestureEnabled, cursorState } = useGesture();
//     const [isHovered, setIsHovered] = useState(false);

//     useEffect(() => {
//         if (!gestureEnabled || !cursorState.active) { setIsHovered(false); return; }
//         const el = elementRef.current;
//         if (!el) return;
//         const rect = el.getBoundingClientRect();
//         const { x, y } = cursorState;
//         setIsHovered(x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom);
//     }, [gestureEnabled, cursorState, elementRef]);

//     return isHovered;
// }



import { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';

const GestureCtx = createContext(null);

export function GestureProvider({ children }) {
    const [gestureEnabled, setGestureEnabled] = useState(false);
    const [isCameraReady, setIsCameraReady] = useState(false);

    const gestureRef = useRef({
        fingertip: null,
        thumbtip: null,
        isPinching: false,
        pinchJustStarted: false,
        pinchPoint: null,
        isOpenHand: false,
        isPointing: false,
        twoHandsClose: false,
        twoHandsCenter: null,
        scrollDeltaY: 0,
    });

    const [cursorState, setCursorState] = useState({
        x: -999, y: -999, active: false, isPinch: false,
    });

    const videoRef = useRef(null);
    const cameraInstRef = useRef(null);
    const handsInstRef = useRef(null);
    const smoothRef = useRef({ x: -999, y: -999 });
    const prevPinchRef = useRef(false);
    const prevIndexYRef = useRef(null);

    const startGestures = useCallback(async () => {
        if (!window.Hands || !window.Camera) {
            console.error('[GestureContext] MediaPipe not loaded. Check index.html scripts.');
            return;
        }

        let video = videoRef.current;
        if (!video) {
            video = document.createElement('video');
            video.style.cssText = 'position:fixed;width:1px;height:1px;opacity:0;pointer-events:none;top:-9999px;left:-9999px;';
            video.setAttribute('playsinline', '');
            video.setAttribute('muted', '');
            document.body.appendChild(video);
            videoRef.current = video;
        }

        try {
            const hands = new window.Hands({
                locateFile: f => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${f}`,
            });

            hands.setOptions({
                maxNumHands: 2,
                modelComplexity: 1,
                minDetectionConfidence: 0.7,
                minTrackingConfidence: 0.7,
            });

            hands.onResults(results => {
                const g = gestureRef.current;
                const wasPinching = prevPinchRef.current;

                if (results.multiHandLandmarks?.length > 0) {
                    const h1 = results.multiHandLandmarks[0];
                    const h2 = results.multiHandLandmarks[1];

                    const ndc = pt => ({
                        x: (1 - pt.x) * 2 - 1,
                        y: -(pt.y * 2 - 1),
                    });

                    const idx = ndc(h1[8]);
                    const thm = ndc(h1[4]);
                    const mid = ndc(h1[12]);
                    const rng = ndc(h1[16]);
                    const wrst = ndc(h1[0]);

                    const alpha = 0.38;
                    if (smoothRef.current.x === -999) {
                        smoothRef.current = { x: idx.x, y: idx.y };
                    } else {
                        smoothRef.current.x += (idx.x - smoothRef.current.x) * alpha;
                        smoothRef.current.y += (idx.y - smoothRef.current.y) * alpha;
                    }

                    const d2 = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

                    const isPinch = d2(idx, thm) < 0.12;
                    const isOpen = d2(mid, wrst) > 0.80 && d2(rng, wrst) > 0.65 && !isPinch;
                    const isPoint = !isOpen && d2(idx, wrst) > 0.6 && d2(mid, wrst) < 0.5 && !isPinch;

                    let scrollDY = 0;
                    if (isPoint && prevIndexYRef.current !== null) {
                        const dy = (idx.y - prevIndexYRef.current) * window.innerHeight * 1.8;
                        scrollDY = -dy;
                    }
                    prevIndexYRef.current = isPoint ? idx.y : null;

                    let twoClose = false, twoCenter = null;
                    if (h2) {
                        const w2 = ndc(h2[0]);
                        if (d2(wrst, w2) < 0.80) {
                            twoClose = true;
                            twoCenter = { x: (wrst.x + w2.x) / 2, y: (wrst.y + w2.y) / 2 };
                        }
                    }

                    const pinchMid = {
                        x: (smoothRef.current.x + thm.x) / 2,
                        y: (smoothRef.current.y + thm.y) / 2,
                    };

                    g.fingertip = { ...smoothRef.current };
                    g.thumbtip = { x: thm.x, y: thm.y };
                    g.isPinching = isPinch;
                    g.pinchJustStarted = isPinch && !wasPinching;
                    g.pinchPoint = isPinch ? pinchMid : null;
                    g.isOpenHand = isOpen;
                    g.isPointing = isPoint;
                    g.twoHandsClose = twoClose;
                    g.twoHandsCenter = twoCenter;
                    g.scrollDeltaY = scrollDY;

                    prevPinchRef.current = isPinch;

                    const sx = (smoothRef.current.x + 1) / 2 * window.innerWidth;
                    const sy = (-smoothRef.current.y + 1) / 2 * window.innerHeight;
                    setCursorState({ x: sx, y: sy, active: true, isPinch });

                    if (isPoint && Math.abs(scrollDY) > 0.5) {
                        window.scrollBy({ top: scrollDY * 0.55, behavior: 'auto' });
                    }

                    if (isPinch && !wasPinching) {
                        const el = document.elementFromPoint(sx, sy);
                        if (el) {
                            const target = el.closest('button, a, [role="button"], [data-gesture-click]');
                            if (target) target.click();
                        }
                    }

                } else {
                    g.fingertip = null;
                    g.thumbtip = null;
                    g.isPinching = false;
                    g.pinchJustStarted = false;
                    g.pinchPoint = null;
                    g.isOpenHand = false;
                    g.isPointing = false;
                    g.twoHandsClose = false;
                    g.twoHandsCenter = null;
                    g.scrollDeltaY = 0;
                    smoothRef.current = { x: -999, y: -999 };
                    prevIndexYRef.current = null;
                    prevPinchRef.current = false;
                    setCursorState(p => ({ ...p, active: false }));
                }
            });

            handsInstRef.current = hands;

            const cam = new window.Camera(video, {
                onFrame: async () => {
                    if (handsInstRef.current) {
                        await handsInstRef.current.send({ image: video });
                    }
                },
                width: 640,
                height: 480,
            });

            cameraInstRef.current = cam;
            await cam.start();
            setIsCameraReady(true);

        } catch (err) {
            console.error('[GestureContext] Failed to start gestures:', err);
        }
    }, []);

    const stopGestures = useCallback(() => {
        try {
            cameraInstRef.current?.stop?.();
            handsInstRef.current?.close?.();
        } catch (_) { }
        cameraInstRef.current = null;
        handsInstRef.current = null;
        if (videoRef.current?.srcObject) {
            videoRef.current.srcObject.getTracks().forEach(t => t.stop());
            videoRef.current.srcObject = null;
        }
        prevPinchRef.current = false;
        smoothRef.current = { x: -999, y: -999 };
        setIsCameraReady(false);
        setCursorState({ x: -999, y: -999, active: false, isPinch: false });
    }, []);

    const toggleGestures = useCallback(() => {
        setGestureEnabled(prev => {
            const next = !prev;
            if (next) startGestures();
            else stopGestures();
            return next;
        });
    }, [startGestures, stopGestures]);

    useEffect(() => () => stopGestures(), [stopGestures]);

    const value = {
        gestureEnabled,
        isCameraReady,
        gestureRef,
        cursorState,
        toggleGestures,
        startGestures,
        stopGestures,
    };

    return (
        <GestureCtx.Provider value={value}>
            {children}
            {gestureEnabled && cursorState.active && (
                <div
                    aria-hidden="true"
                    style={{
                        position: 'fixed',
                        left: cursorState.x,
                        top: cursorState.y,
                        width: cursorState.isPinch ? 22 : 14,
                        height: cursorState.isPinch ? 22 : 14,
                        transform: 'translate(-50%, -50%)',
                        borderRadius: '50%',
                        background: cursorState.isPinch
                            ? 'rgba(255,255,255,0.95)'
                            : 'rgba(255,255,255,0.55)',
                        boxShadow: cursorState.isPinch
                            ? '0 0 24px 6px rgba(192,132,252,0.85)'
                            : '0 0 10px 2px rgba(123,104,238,0.55)',
                        pointerEvents: 'none',
                        zIndex: 99999,
                        transition: 'width 0.1s, height 0.1s, box-shadow 0.1s',
                    }}
                />
            )}
        </GestureCtx.Provider>
    );
}

// Safe fallback — returns dummy values if used outside GestureProvider
// so the app never crashes even if provider is missing
export function useGesture() {
    const ctx = useContext(GestureCtx);

    if (!ctx) {
        console.warn('[useGesture] Used outside <GestureProvider>. Returning safe fallback.');
        return {
            gestureEnabled: false,
            isCameraReady: false,
            gestureRef: {
                current: {
                    fingertip: null, thumbtip: null,
                    isPinching: false, pinchJustStarted: false, pinchPoint: null,
                    isOpenHand: false, isPointing: false,
                    twoHandsClose: false, twoHandsCenter: null, scrollDeltaY: 0,
                },
            },
            cursorState: { x: -999, y: -999, active: false, isPinch: false },
            toggleGestures: () => { },
            startGestures: () => { },
            stopGestures: () => { },
        };
    }

    return ctx;
}

// Attach to any scrollable container for gesture scrolling
export function useGestureScroll() {
    const { gestureEnabled, gestureRef, cursorState } = useGesture();
    const containerRef = useRef(null);

    useEffect(() => {
        if (!gestureEnabled) return;
        let raf;
        function loop() {
            raf = requestAnimationFrame(loop);
            const g = gestureRef.current;
            const el = containerRef.current;
            if (!el || !g.isPointing || Math.abs(g.scrollDeltaY) < 0.5) return;
            const rect = el.getBoundingClientRect();
            const { x, y } = cursorState;
            if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
                el.scrollBy({ top: g.scrollDeltaY * 0.55, behavior: 'auto' });
            }
        }
        raf = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(raf);
    }, [gestureEnabled, gestureRef, cursorState]);

    return containerRef;
}

// Returns true when gesture cursor hovers the referenced element
export function useGestureHover(elementRef) {
    const { gestureEnabled, cursorState } = useGesture();
    const [isHovered, setIsHovered] = useState(false);

    useEffect(() => {
        if (!gestureEnabled || !cursorState.active) { setIsHovered(false); return; }
        const el = elementRef.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const { x, y } = cursorState;
        setIsHovered(x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom);
    }, [gestureEnabled, cursorState, elementRef]);

    return isHovered;
}