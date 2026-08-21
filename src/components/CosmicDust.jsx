import { useEffect, useRef } from 'react';
import { isWebGLAvailable } from '../utils/webgl.js';
import './CosmicDust.css';

// ─────────────────────────────────────────────────────────────────────────
// "Cosmic Dust" — ported verbatim (geometry, shaders, colors, motion,
// postprocessing pipeline) from a standalone r0.143.0 Three.js spec.
//
// Loaded via CDN dynamic import at the EXACT pinned version rather than the
// app's own npm `three` (^0.169), for two reasons:
//   1. `THREE.WebGL1Renderer`, used here, was removed in newer Three.js
//      releases — the app's installed version doesn't have it at all.
//   2. Fidelity: this is a from-spec recreation with exact shader math and
//      composer wiring; pinning the exact version avoids any behavior drift
//      from Three's ongoing color-management/renderer changes.
// This is intentionally a second, isolated Three.js runtime — it never
// imports or shares state with the app's own `three` (used by Scene3D on
// the Hero page).
// ─────────────────────────────────────────────────────────────────────────

const THREE_VERSION = '0.143.0';
const CDN = `https://unpkg.com/three@${THREE_VERSION}`;
const THREE_URL = `${CDN}/build/three.module.js`;

// ── Isolated ESM resolver for the postprocessing addons ────────────────────
// The addon files (EffectComposer.js, RenderPass.js, UnrealBloomPass.js, …)
// import core classes from the BARE specifier 'three' — browsers can't
// resolve a bare specifier without an importmap, and injecting one at this
// point (well after the app's own module scripts have already run) isn't
// reliably supported. Worse, unpkg's `?module` bare-specifier rewriting
// resolves 'three' to `@latest`, not the pinned 0.143.0 — that would load a
// SECOND, different Three.js instance for the addons' internals, and mixing
// two module instances (this THREE.Scene vs. that THREE.Scene) is exactly
// the kind of class-identity mismatch that can silently break rendering.
//
// So: fetch each file's source as text, rewrite every import specifier to
// point at either the exact same THREE_URL (for 'three') or a recursively
// resolved Blob URL (for relative addon-to-addon imports), and import THAT.
// Memoized per source URL so shared dependencies (e.g. Pass.js, needed by
// four different files) are fetched/rewritten once and every consumer
// shares the exact same resulting module instance.
const patchedUrlCache = new Map();

function toAbsoluteUrl(specifier, baseUrl) {
  return specifier === 'three' ? THREE_URL : new URL(specifier, baseUrl).href;
}

function getPatchedModuleUrl(absoluteUrl) {
  if (absoluteUrl === THREE_URL) return Promise.resolve(THREE_URL);
  if (patchedUrlCache.has(absoluteUrl)) return patchedUrlCache.get(absoluteUrl);

  const promise = (async () => {
    const res = await fetch(absoluteUrl);
    if (!res.ok) throw new Error(`[CosmicDust] failed to fetch ${absoluteUrl}: ${res.status}`);
    const src = await res.text();

    const importRe = /from\s+(['"])([^'"]+)\1/g;
    const specifiers = new Set();
    let match;
    while ((match = importRe.exec(src))) specifiers.add(match[2]);

    let patched = src;
    for (const spec of specifiers) {
      const depAbsoluteUrl = toAbsoluteUrl(spec, absoluteUrl);
      const depPatchedUrl = await getPatchedModuleUrl(depAbsoluteUrl);
      const escaped = spec.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const specifierRe = new RegExp(`from(\\s+)(['"])${escaped}\\2`, 'g');
      patched = patched.replace(specifierRe, `from$1'${depPatchedUrl}'`);
    }

    const blob = new Blob([patched], { type: 'text/javascript' });
    return URL.createObjectURL(blob);
  })();

  patchedUrlCache.set(absoluteUrl, promise);
  return promise;
}

async function importPatched(absoluteUrl) {
  const patchedUrl = await getPatchedModuleUrl(absoluteUrl);
  return import(/* @vite-ignore */ patchedUrl);
}

function hexToVec3(THREE, hex) {
  const n = parseInt(hex.slice(1), 16);
  return new THREE.Vector3(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255);
}

const VERTEX_SHADER = `
attribute float size;
uniform float iTime;
uniform vec3 iShift;
uniform vec2 iResolution;
uniform vec3 iAnimation;
uniform float uDepth;
varying float transparency;
varying float warmness;
vec3 warp3d(vec3 pos, float t) {
  float curv = 0.9, a = 1.9, b = 0.25, b2 = 0.03, c = 0.02;
  pos *= 2.;
  pos.x += curv * sin(c * t + a * pos.y) + t * b2;
  pos.y += curv * cos(c * t + a * pos.x);
  pos.z += curv * cos(c * t + a * pos.y);
  pos.z += curv * sin(c * t + a * pos.x) + t * b;
  pos.z = abs(pos.z);
  return pos.xyz;
}
void main() {
  vec3 v = warp3d(position, iTime);
  // bigger uDepth spreads the field deeper → motes drift in from further away
  v = uDepth * (2. * fract(v + iShift) - 1.) + iAnimation;
  vec4 vpos = modelViewMatrix * vec4(v, 1.);
  transparency = step(length(v), uDepth);
  warmness = step(.75, fract(size * 7.13));
  gl_PointSize = size * iResolution.y / 1000. / -vpos.z;
  gl_Position = projectionMatrix * vpos;
}
`;

const FRAGMENT_SHADER = `
varying float transparency; varying float warmness;
uniform float iAlpha; uniform vec3 uCool; uniform vec3 uWarm;
void main() {
  vec3 color = mix(uCool * .8, uWarm * .8, warmness);
  float tex = smoothstep(1., .3, length(2. * gl_PointCoord - 1.));
  gl_FragColor = vec4(tex * color, tex * transparency * iAlpha);
}
`;

const FINAL_VERTEX_SHADER = `varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position, 1.0); }`;

const FINAL_FRAGMENT_SHADER = `
uniform float iTime; uniform sampler2D tDiffuse; uniform sampler2D bloomTexture; uniform sampler2D torusTexture; uniform sampler2D haloTexture;
uniform vec3 uBg; uniform vec3 uFlameA; uniform vec3 uFlameB; uniform float uFlameAmt;
varying vec2 vUv;
vec3 warp3d(vec3 pos, float t){ float curv=.8,a=1.9,b=0.7; pos*=2.;
  pos.x+=curv*sin(t+a*pos.y)+t*b; pos.y+=curv*cos(t+a*pos.x);
  pos.y+=curv*sin(t+a*pos.z)+t*b; pos.z+=curv*cos(t+a*pos.y);
  pos.z+=curv*sin(t+a*pos.x)+t*b; pos.x+=curv*cos(t+a*pos.z);
  return 0.5+0.5*cos(pos.xyz+vec3(1,2,4)); }
void main(){
  vec2 uv = 2.*vUv - 1.;
  vec3 w = pow(warp3d(vec3(uv.x, sin(uv.y), uv.y), iTime*1.5), vec3(1.5));
  vec3 flame = 1.5*uFlameA*w.x; flame*=w.y; flame += uFlameB*w.z;
  flame *= smoothstep(0.25, 1., abs(uv.y));
  float md = smoothstep(-0.7, 1., -uv.y*uv.x); flame *= md*md;
  vec3 bg = uBg * (1.0 - 0.4 * length(uv));
  vec3 halo = texture2D(haloTexture, vUv).xyz;
  gl_FragColor = vec4(bg + flame*uFlameAmt + texture2D(bloomTexture, vUv).xyz + texture2D(torusTexture, vUv).xyz + texture2D(tDiffuse, vUv).xyz + halo, 1.);
}
`;

async function loadThreeModules() {
  // three.module.js itself has no external imports, so it loads directly —
  // this is the single shared instance every patched addon is rewritten to
  // import from too (see getPatchedModuleUrl above).
  const THREE = await import(/* @vite-ignore */ THREE_URL);

  const [{ EffectComposer }, { RenderPass }, { UnrealBloomPass }, { ShaderPass }, { GammaCorrectionShader }, { CopyShader }] =
    await Promise.all([
      importPatched(`${CDN}/examples/jsm/postprocessing/EffectComposer.js`),
      importPatched(`${CDN}/examples/jsm/postprocessing/RenderPass.js`),
      importPatched(`${CDN}/examples/jsm/postprocessing/UnrealBloomPass.js`),
      importPatched(`${CDN}/examples/jsm/postprocessing/ShaderPass.js`),
      // These two are fully self-contained (no imports at all), so no
      // patching is needed — a plain dynamic import is enough.
      import(/* @vite-ignore */ `${CDN}/examples/jsm/shaders/GammaCorrectionShader.js`),
      import(/* @vite-ignore */ `${CDN}/examples/jsm/shaders/CopyShader.js`),
    ]);

  return { THREE, EffectComposer, RenderPass, UnrealBloomPass, ShaderPass, GammaCorrectionShader, CopyShader };
}

function setupScene(canvas, modules) {
  const { THREE, EffectComposer, RenderPass, UnrealBloomPass, ShaderPass, GammaCorrectionShader, CopyShader } = modules;

  const LAYERS = { NONE: 0, TORUS_SCENE: 1, BLOOM_SCENE: 2, ENTIRE_SCENE: 3 };

  const renderer = new THREE.WebGL1Renderer({ canvas, antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.VSMShadowMap;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);
  scene.fog = new THREE.Fog(0x000000, 0, 22);

  const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 80);
  camera.position.set(0, 0, 3);
  camera.layers.enable(LAYERS.TORUS_SCENE);
  camera.layers.enable(LAYERS.BLOOM_SCENE);
  camera.layers.enable(LAYERS.ENTIRE_SCENE);
  scene.add(camera);

  const renderPass = new RenderPass(scene, camera);

  const torusComposer = new EffectComposer(renderer);
  torusComposer.renderToScreen = false;
  torusComposer.addPass(renderPass);
  torusComposer.addPass(new ShaderPass(GammaCorrectionShader));
  torusComposer.addPass(new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 0.3, 0.3, 0));
  torusComposer.addPass(new ShaderPass(CopyShader));

  const bloomComposer = new EffectComposer(renderer);
  bloomComposer.renderToScreen = false;
  bloomComposer.addPass(renderPass);
  bloomComposer.addPass(new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 0.5, 0.7, 0));
  bloomComposer.addPass(new ShaderPass(GammaCorrectionShader));

  const FinalPass = {
    uniforms: {
      iTime: { value: 0 },
      tDiffuse: { value: null },
      torusTexture: { value: null },
      bloomTexture: { value: null },
      haloTexture: { value: null },
      uBg: { value: hexToVec3(THREE, '#1a0a04') },
      uFlameA: { value: hexToVec3(THREE, '#ff7a2a') },
      uFlameB: { value: hexToVec3(THREE, '#ffce5a') },
      uFlameAmt: { value: 0.2 },
    },
    vertexShader: FINAL_VERTEX_SHADER,
    fragmentShader: FINAL_FRAGMENT_SHADER,
  };

  const finalPass = new ShaderPass(FinalPass);
  finalPass.uniforms.bloomTexture.value = bloomComposer.renderTarget1.texture;
  finalPass.uniforms.torusTexture.value = torusComposer.renderTarget1.texture;

  const finalComposer = new EffectComposer(renderer);
  finalComposer.addPass(renderPass);
  finalComposer.addPass(finalPass);

  // ── points ──────────────────────────────────────────────────────────────
  const count = 940;
  const positions = [];
  const sizes = [];
  for (let i = 0; i < count; i++) {
    positions.push(2 * Math.random() - 1, 2 * Math.random() - 1, 2 * Math.random() - 1);
    sizes.push(25 + 25 * Math.random());
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));

  const uniforms = {
    iTime: { value: 0 },
    iShift: { value: new THREE.Vector3() },
    iAlpha: { value: 0 },
    iAnimation: { value: new THREE.Vector3(0, 0, 0) },
    iResolution: { value: { x: window.innerWidth * window.devicePixelRatio, y: window.innerHeight * window.devicePixelRatio } },
    uDepth: { value: 3.7 },
    uCool: { value: hexToVec3(THREE, '#b3401f') },
    uWarm: { value: hexToVec3(THREE, '#ffc46b') },
  };

  const material = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: VERTEX_SHADER,
    fragmentShader: FRAGMENT_SHADER,
    transparent: true,
  });
  material.stencil = false;

  const points = new THREE.Points(geometry, material);
  points.position.set(0, 0, -1);
  points.layers.enable(LAYERS.ENTIRE_SCENE);
  scene.add(points);

  // ── fade-in ────────────────────────────────────────────────────────────
  const DUST_ALPHA = 0.68;
  const APPEAR_MS = 2200;
  let appearStart = null;
  let appearRaf = 0;
  function appearIn(now) {
    if (appearStart === null) appearStart = now;
    const t = Math.min(1, (now - appearStart) / APPEAR_MS);
    const eased = t * t * t * (t * (t * 6 - 15) + 10);
    uniforms.iAlpha.value = eased * DUST_ALPHA;
    if (t < 1) appearRaf = requestAnimationFrame(appearIn);
  }
  appearRaf = requestAnimationFrame(appearIn);

  // ── per-frame point update ────────────────────────────────────────────
  const DRIFT_SPEED = 0.4;
  function flyPointsRender() {
    uniforms.iTime.value = performance.now() / 1000;
    uniforms.iShift.value.add(camera.position.clone().multiplyScalar(0.0022 * DRIFT_SPEED));
  }

  // ── render loop ────────────────────────────────────────────────────────
  let raf = 0;
  function tick() {
    finalPass.uniforms.iTime.value = performance.now() / 1000;
    flyPointsRender();
    camera.layers.set(LAYERS.TORUS_SCENE);
    torusComposer.render();
    camera.layers.set(LAYERS.BLOOM_SCENE);
    bloomComposer.render();
    camera.layers.set(LAYERS.ENTIRE_SCENE);
    finalComposer.render();
    raf = requestAnimationFrame(tick);
  }
  raf = requestAnimationFrame(tick);

  // ── resize ─────────────────────────────────────────────────────────────
  function onResize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const dpr = window.devicePixelRatio;

    renderer.setPixelRatio(dpr);
    renderer.setSize(w, h, false);

    camera.aspect = w / h;
    camera.updateProjectionMatrix();

    [torusComposer, bloomComposer, finalComposer].forEach((composer) => {
      composer.setPixelRatio(dpr);
      composer.setSize(w, h);
    });

    uniforms.iResolution.value = { x: w * dpr, y: h * dpr };
  }
  onResize();
  window.addEventListener('resize', onResize);

  return function dispose() {
    cancelAnimationFrame(raf);
    cancelAnimationFrame(appearRaf);
    window.removeEventListener('resize', onResize);
    geometry.dispose();
    material.dispose();
    torusComposer.dispose();
    bloomComposer.dispose();
    finalComposer.dispose();
    renderer.dispose();
  };
}

export default function CosmicDust() {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!isWebGLAvailable()) return undefined;

    let cancelled = false;
    let dispose = null;

    loadThreeModules()
      .then((modules) => {
        if (cancelled || !canvasRef.current) return;
        dispose = setupScene(canvasRef.current, modules);
      })
      .catch((err) => {
        console.warn('[CosmicDust] failed to load Three.js from CDN — background disabled.', err);
      });

    return () => {
      cancelled = true;
      if (dispose) dispose();
    };
  }, []);

  return <canvas ref={canvasRef} id="cosmic-dust" aria-hidden="true" />;
}
