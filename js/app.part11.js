// @@PART js/app.part11.js (11/19) lines 2151-2428 of the original module script -- stripped by build.mjs
function buildSpecials(bm, mats) {
  const g = bm.g, sp = g.head.special, L = bm.L, out = [], fr = {}, s = {};
  if (sp === 'none' || sp === 'horns' || bm.billStart !== null) return out;
  const add = (geo, mat) => { const m = new THREE.Mesh(geo, mat); m.frustumCulled = false; out.push(m); return m; };
  bm.frame(0.003, fr); bm.section(0.03, s); const snX = fr.px, snY = fr.py;
  const loftSpike = (uBase, len, taperY, taperZ, droop, widen) => {
    /* base ring sampled ON the skin at uBase → the junction is vertex-coincident with the body, no seam */
    const M = 18, N = 14, ring = [], pos = [], idx = [], p = {}, frB = {}; bm.frame(uBase, frB);
    let cy = 0, cz = 0;
    for (let j = 0; j < M; j++) { bm.rawSurface(uBase, -Math.PI / 2 + j / M * TAU, p); ring.push([p.x, p.y, p.z]); cy += p.y / M; cz += p.z / M; }
    const fwdX = -frB.tx, fwdY = -frB.ty, tipX = frB.px + fwdX * len, tipY = cy + fwdY * len - droop * len;
    for (let i = 0; i <= N; i++) {
      const f = i / N, ease = Math.pow(f, .9), shrink = Math.pow(1 - f, .9) * (1 - f * .15) + .02;
      const axX = lerp(frB.px, tipX, ease), axY = lerp(cy, tipY, ease) - droop * len * f * f;
      for (let j = 0; j < M; j++) {
        const [bx, by, bz] = ring[j];
        const sy = shrink * lerp(1, taperY, f), szf = shrink * lerp(1, taperZ, f) * (1 + widen * Math.sin(Math.PI * f) * .6);
        pos.push(i === 0 ? bx : axX, i === 0 ? by : axY + (by - cy) * sy, i === 0 ? bz : (bz - cz) * szf + cz);
      }
    }
    for (let i = 0; i < N; i++) for (let j = 0; j < M; j++) { const a = i * M + j, b = i * M + (j + 1) % M, c = a + M, d = b + M; idx.push(a, b, c, b, d, c); }
    const tip = pos.length / 3; pos.push(tipX + fwdX * len * .015, tipY, 0);
    for (let j = 0; j < M; j++) idx.push(tip, N * M + j, N * M + (j + 1) % M);
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setIndex(idx); geo.computeVertexNormals(); skinAttributes(geo, bm); return geo;
  };
  if (sp === 'bill' || sp === 'sword') { add(loftSpike(.006, g.head.specialLen * L, sp === 'sword' ? .3 : .55, sp === 'sword' ? 1.1 : .6, .05, 0), mats.body); }
  else if (sp === 'rostrum' || sp === 'paddle') { const len = g.head.specialLen * L, w = g.head.specialWidth * L * (sp === 'paddle' ? 2 : 1); add(loftSpike(.008, len, sp === 'paddle' ? .22 : .14, Math.max(.6, w / Math.max(.001, bm.bp.width(.06) * L)), .01, sp === 'paddle' ? .5 : .15), mats.body);
    if (sp === 'rostrum') { const n = Math.max(6, Math.floor(len / (0.03 * L))), cone = new THREE.ConeGeometry(1, 1, 4, 1); cone.translate(0, 0.5, 0); const inst = new THREE.InstancedMesh(cone, mats.tooth, n * 2); const M = new THREE.Matrix4(), P = new THREE.Vector3(), Q = new THREE.Quaternion(), Sc = new THREE.Vector3(0.004 * L, 0.03 * L, 0.004 * L), up = new THREE.Vector3(0, 1, 0); let k = 0;
      for (let i = 0; i < n; i++) for (const side of [1, -1]) { P.set(snX + len * 0.05 + (i + 0.5) / n * len * 0.85, snY, side * w * 0.5); Q.setFromUnitVectors(up, new THREE.Vector3(0, 0, side)); M.compose(P, Q, Sc); inst.setMatrixAt(k++, M); }
      cone.setAttribute('aJaw', new THREE.InstancedBufferAttribute(new Float32Array(n * 2), 1)); inst.frustumCulled = false; out.push(inst); } }
  else if (sp === 'esca') { const len = g.head.specialLen * L; const u0 = bm.h * 0.3; bm.frame(u0, fr); bm.section(u0, s); const p0 = new THREE.Vector3(fr.px + fr.nx * s.dUp * 0.98, fr.py + fr.ny * s.dUp * 0.98, 0); const p1 = p0.clone().add(new THREE.Vector3(len * 0.35, len * 0.75, 0)), p2 = p0.clone().add(new THREE.Vector3(len * 0.95, len * 0.45, 0));
    add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([p0, p1, p2]), 8, Math.max(0.001, 0.006 * L), 4, false), mats.simple); const bulb = new THREE.SphereGeometry(Math.max(0.004, 0.018 * L), 8, 6); bulb.translate(p2.x, p2.y, p2.z); add(bulb, mats.glow); bm.lureTip = p2; }
  else if (sp === 'whip') { bm.frame(1, fr); bm.section(1, s); const len = g.head.specialLen * L; const geo = new THREE.CylinderGeometry(0.0015 * L, Math.max(0.002, (s.dUp + s.dDn) * 0.45), len, 6, 1); geo.rotateZ(Math.PI / 2); geo.translate(fr.px - len * 0.5, fr.py, 0); add(geo, mats.simple); }
  return out;
}
function landmarks3D(bm) { const lm = bm.lm, p = {}, out = []; const spec = { snout: [0.004, 0], mouthCorner: [lm.mouthCorner, 'm'], eye: [lm.eye, 'e'], preopercle: [lm.preopercle, 0], operculum: [lm.operculum, 0], pectoralBase: [lm.pectoralBase, 0], pelvicBase: [lm.pelvicBase, -Math.PI / 2], vent: [lm.vent, -Math.PI / 2], analOrigin: [lm.analOrigin, -Math.PI / 2], analEnd: [lm.analEnd, -Math.PI / 2], dorsalOrigin: [lm.dorsalOrigin, Math.PI / 2], dorsalEnd: [lm.dorsalEnd, Math.PI / 2], peduncleStart: [lm.peduncleStart, Math.PI / 2], caudalBase: [0.999, Math.PI / 2] };
  const fr = {}, s = {}; for (const k in spec) { const [u, th] = spec[k]; if (th === 'm') { bm.frame(u, fr); bm.section(u, s); const ym = bm.mouthLineY(u, s); out.push({ name: k, x: fr.px + fr.nx * ym, y: fr.py + fr.ny * ym, z: bm.halfWidthAtY(s, ym) }); } else if (th === 'e') { bm.frame(u, fr); bm.section(u, s); out.push({ name: k, x: fr.px + fr.nx * bm.eyeY, y: fr.py + fr.ny * bm.eyeY, z: bm.halfWidthAtY(s, bm.eyeY) }); } else { bm.surface(u, th, p); out.push({ name: k, x: p.x, y: p.y, z: p.z }); } } return out; }
/**
 * Build a renderable fish from a genome.
 * @returns {{group:THREE.Group, uniforms:Object, materials:Object, bm:BodyModel, info:Object, dispose:()=>void}}
 */
function buildFish(g, opts = {}) {
  const q = QUALITY[opts.quality || 'hero'], bm = new BodyModel(g), f = g.fins, lm = bm.lm, maxD = bm.maxD; const geos = [];
  bm.lod = !q.detail;
  const bodyGeo = buildBodyGeometry(bm, q.S, q.R); geos.push(bodyGeo);
  const uni = makeUniforms(g, bm), mats = makeMaterials(g, uni, !!opts.instanced);
  uni.uDetail.value = q.detail ? 1 : 0;
  const group = new THREE.Group(); let tris = bodyGeo.index.count / 3; const parts = {};
  const body = opts.instanced ? new THREE.InstancedMesh(bodyGeo, mats.body, opts.instanced) : new THREE.Mesh(bodyGeo, mats.body); body.frustumCulled = false; group.add(body); parts.body = body;
  const fb = new FinBuilder(); const rc = n => q.detail ? clamp(Math.round(n), 8, 40) : 5; const sf = d => d.spines / Math.max(1, d.spines + d.rays);
  if (f.dorsal.present && f.dorsal.count > 0) {
    if (bm.a.separatedDorsal) {
      const n = q.detail ? clamp(f.dorsal.spines, 6, 16) : 5;
      for (let i = 0; i < n; i++) { const s = lerp(lm.dorsalOrigin, lm.dorsalEnd, i / n), e = lerp(lm.dorsalOrigin, lm.dorsalEnd, (i + .65) / n); addRidgeFin(fb, bm, { u0: s, u1: e, height: f.dorsal.height * maxD, sweep: .4, shape: 'triangle', side: 1, rays: 5, spineFrac: .2, opacity: 1, flex: .25, kind: 'dorsal', kindId: 1, K: q.detail ? 3 : 1 }); }
    } else addRidgeFin(fb, bm, { u0: lm.dorsalOrigin, u1: lm.dorsalEnd, height: f.dorsal.height * maxD, sweep: f.dorsal.sweep, shape: f.dorsal.shape, side: 1, rays: rc(f.dorsal.spines + f.dorsal.rays), spineFrac: sf(f.dorsal), opacity: f.dorsal.opacity, flex: f.dorsal.flex, kind: 'dorsal', kindId: 1, K: q.K });
    if (f.dorsal.count >= 2) addRidgeFin(fb, bm, { u0: lm.dorsal2Origin, u1: lm.dorsal2End, height: f.dorsal2.height * maxD, sweep: f.dorsal.sweep, shape: f.dorsal2.shape, side: 1, rays: rc(f.dorsal2.spines + f.dorsal2.rays), spineFrac: sf(f.dorsal2), opacity: f.dorsal.opacity, flex: f.dorsal.flex, kind: 'dorsal', cfg: 'dorsal2', kindId: 1, K: q.K });
    if (f.dorsal.count === 3) addRidgeFin(fb, bm, { u0: lm.dorsal3Origin, u1: lm.dorsal3End, height: f.dorsal3.height * maxD, sweep: .2, shape: f.dorsal3.shape, side: 1, rays: rc(f.dorsal3.rays), spineFrac: 0, opacity: f.dorsal.opacity, flex: f.dorsal.flex, kind: 'dorsal', cfg: 'dorsal3', kindId: 1, K: q.K });
  }
  if (f.anal.present) addRidgeFin(fb, bm, { u0: lm.analOrigin, u1: lm.analEnd, height: f.anal.height * maxD, sweep: f.anal.sweep, shape: f.anal.shape, side: -1, rays: rc(f.anal.spines + f.anal.rays), spineFrac: sf(f.anal), opacity: f.anal.opacity, flex: f.anal.flex, kind: 'anal', kindId: 2, K: q.K });
  if (f.pectoral.present && !['ray', 'benthicShark'].includes(bm.a.family)) {
    addPectoral(fb, bm, 1, q.K, rc(f.pectoral.rays)); addPectoral(fb, bm, -1, q.K, rc(f.pectoral.rays));
  }
  if (f.pelvic.present) { addPelvic(fb, bm, 1, q.K, rc(f.pelvic.rays)); addPelvic(fb, bm, -1, q.K, rc(f.pelvic.rays)); }
  if (f.adipose.present && q.detail) addRidgeFin(fb, bm, { u0: lm.adipose - 0.012, u1: lm.adipose + 0.012, height: f.adipose.size * bm.L * 0.8, sweep: 0.5, shape: 'rounded', side: 1, rays: 4, spineFrac: 0, opacity: 1, flex: 0.1, kind: 'adipose', kindId: 6, K: 2 });
  if (f.finlets.count > 0 && q.detail) { const n = f.finlets.count, a0 = (f.dorsal.count === 3 ? lm.dorsal3End : f.dorsal.count === 2 ? lm.dorsal2End : lm.dorsalEnd) + 0.015, a1 = lm.peduncleStart - 0.01;
    for (let i = 0; i < n; i++) { const u = lerp(a0, a1, (i + 0.5) / n); addRidgeFin(fb, bm, { u0: u - 0.006, u1: u + 0.006, height: maxD * 0.09, sweep: 0.9, shape: 'falcate', side: 1, rays: 3, spineFrac: 0, opacity: 1, flex: 0.2, kind: 'finlet', kindId: 7, K: 2 }); if (f.anal.present) addRidgeFin(fb, bm, { u0: u - 0.006, u1: u + 0.006, height: maxD * 0.09, sweep: 0.9, shape: 'falcate', side: -1, rays: 3, spineFrac: 0, opacity: 1, flex: 0.2, kind: 'finlet', kindId: 7, K: 2 }); } }
  let caudal = null; if (f.caudal.present) caudal = addCaudal(fb, bm, q.K, q.detail ? clamp(f.caudal.rays, 7, 40) : 7);
  const finGeo = fb.build(); geos.push(finGeo); tris += finGeo.index.count / 3;
  const fins = opts.instanced ? new THREE.InstancedMesh(finGeo, mats.fin, opts.instanced) : new THREE.Mesh(finGeo, mats.fin); fins.frustumCulled = false; fins.renderOrder = 2; group.add(fins); parts.fins = fins;
  if (q.detail && !opts.instanced) {
    if (!bm.oralDisc && bm.a.family !== 'ray') {
      const jaw = buildJawGeometry(bm); geos.push(jaw.geo); tris += jaw.geo.index.count / 3; bm.pivotX = jaw.pivot.x; uni.uJawPivot.value.set(jaw.pivot.x, jaw.pivot.y); uni.uJawOpenMax.value = jaw.openAngle;
      const jawMesh = new THREE.Mesh(jaw.geo, mats.jaw); jawMesh.frustumCulled = false; group.add(jawMesh); parts.jaw = jawMesh;
    } else { bm.pivotX = bm.headX; uni.uJawOpenMax.value = 0; }
    if (g.head.operculum) { const og = buildOperculum(bm); geos.push(og); tris += og.index.count / 3; const om = new THREE.Mesh(og, mats.jaw); om.frustumCulled = false; group.add(om); parts.operculum = om; }
    for (const mesh of [...buildMouthDetails(bm, mats), buildGills(bm, mats), buildNostrils(bm, mats)]) { geos.push(mesh.geometry); group.add(mesh); }
    for (const e of buildEyes(bm, q.eye, mats)) { geos.push(e.geometry); tris += e.geometry.index.count / 3; group.add(e); }
    const teeth = bm.oralDisc ? null : buildTeeth(bm, mats); if (teeth) { geos.push(teeth.geometry); tris += teeth.geometry.index.count / 3 * teeth.count; group.add(teeth); parts.teeth = teeth; }
    const barb = buildBarbels(bm, mats); if (barb) { geos.push(barb.geometry); tris += barb.geometry.index.count / 3; group.add(barb); if (bm.barbelTip && g.skin.photophores > 0) { const bulb = new THREE.SphereGeometry(Math.max(0.003, 0.012 * bm.L), 8, 6); bulb.translate(bm.barbelTip.x, bm.barbelTip.y, bm.barbelTip.z); geos.push(bulb); const bm2 = new THREE.Mesh(bulb, mats.glow); group.add(bm2); } }
    for (const m of buildSpecials(bm, mats)) { geos.push(m.geometry); tris += m.geometry.index.count / 3 * (m.count || 1); group.add(m); }
  } else { bm.pivotX = bm.headX; }
  if (!q.detail) for (const e of buildEyes(bm, 7, mats)) {
    geos.push(e.geometry);
    const mesh = opts.instanced ? new THREE.InstancedMesh(e.geometry, e.material, opts.instanced) : e;
    mesh.frustumCulled = false; group.add(mesh);
  }
  if (!q.detail && g.head.special !== 'none') for (const source of buildSpecials(bm, mats)) {
    if (source.isInstancedMesh) { source.geometry.dispose(); continue; }
    if (!source.geometry.getAttribute('aBody')) skinAttributes(source.geometry, bm);
    const mesh = opts.instanced ? new THREE.InstancedMesh(source.geometry, mats.body, opts.instanced) : new THREE.Mesh(source.geometry, source.material === mats.glow ? mats.glow : mats.body);
    mesh.frustumCulled = false; geos.push(mesh.geometry); group.add(mesh);
  }
  tris = 0; group.traverse(mesh => { if (mesh.isMesh) tris += (mesh.geometry.index ? mesh.geometry.index.count : mesh.geometry.attributes.position.count) / 3 * (mesh.isInstancedMesh && !opts.instanced ? mesh.count : 1); });
  group.rotation.x = g.body.roll * Math.PI / 180;
  const box = new THREE.Box3().setFromObject(group);
  const info = { tris: Math.round(tris), quality: opts.quality || 'hero', anatomy: bm.a.label, caudalAR: caudal ? +caudal.ar.toFixed(2) : 0, caudalSpan: caudal ? caudal.span : 0, finAreas: fb.areas, rays: fb.rays, finBases: fb.bases, attachments: fb.attachments, landmarks3D: landmarks3D(bm), bounds: box, spine: bm.spine };
  return { group, uniforms: uni, materials: mats, bm, info, parts, geos, dispose() { geos.forEach(x => x.dispose()); for (const k in mats) { const m = mats[k]; if (m && m.dispose) m.dispose(); } (mats._eyes || []).forEach(m => m.dispose()); } };
}
FG.buildFish = buildFish; FG.BodyModel = BodyModel;
/* ╔══════════════════════════════════════════════════════════════════╗
   ║ 9. SHADERS & MATERIALS (procedural skin, fins, eyes, swim wave)  ║
   ╚══════════════════════════════════════════════════════════════════╝ */
const ENV = { uTime: { value: 0 }, uLightDir: { value: new THREE.Vector3(0.3, 1, 0.5).normalize() }, uLightCol: { value: new THREE.Color(1, 1, 1) }, uFillDir: { value: new THREE.Vector3(-.5, .35, -.6).normalize() }, uFillCol: { value: new THREE.Color(.19, .23, .27) }, uSkyCol: { value: new THREE.Color(0.5, 0.6, 0.7) }, uGroundCol: { value: new THREE.Color(0.15, 0.15, 0.18) }, uFogCol: { value: new THREE.Color(0.05, 0.3, 0.5) }, uFogDensity: { value: 0 } };
const FLAP = { anguilliform: .15, subcarangiform: .25, carangiform: .2, thunniform: .08, ostraciiform: .35, labriform: .8, rajiform: 0, hippocampiform: .5 };
const GLSL_SWIM = /* glsl */`
uniform float uTime, uCycle, uLen, uHeadX, uFreq, uAmp, uAmpHead, uEnvPow, uWaveK, uFlap, uBreath, uInflate, uJawAngle, uJawProtrude, uPhase, uBurst;
uniform int uMode; uniform vec2 uJawPivot;
#ifdef SCHOOL
attribute float aPhase;
#endif
float fishU(float x){ return clamp((uHeadX - x)/uLen, 0.0, 1.6); }
float waveZ(float u, float ph){ float env = mix(uAmpHead, 1.0, pow(clamp(u,0.0,1.0), uEnvPow)); if(u>1.0) env = 1.0 + (u-1.0)*0.45; return sin(u*uWaveK*6.2831853 - (uCycle+ph)*6.2831853) * uAmp * uLen * env * (1.0+0.25*uBurst); }
vec3 inflateDisp(vec3 p){ if(uInflate<=0.0) return vec3(0.0); float u=fishU(p.x); vec3 d = normalize(vec3(0.0, p.y, p.z)+vec3(0.0,1e-5,0.0)); return d * uInflate * uLen * 0.2 * exp(-pow((u-0.45)/0.28,2.0)); }
float phaseOf(){
#ifdef SCHOOL
  return aPhase;
#else
  return uPhase;
#endif
}
mat4 modelM(){
#ifdef USE_INSTANCING
  return modelMatrix * instanceMatrix;
#else
  return modelMatrix;
#endif
}
void applyWave(inout vec3 p, inout vec3 n, float ph){ float e = 0.01*uLen; float w = waveZ(fishU(p.x), ph); float dzdx = (waveZ(fishU(p.x+e),ph) - waveZ(fishU(p.x-e),ph))/(2.0*e); p.z += w; n = normalize(vec3(n.x - dzdx*n.z, n.y, n.z)); }
`;
const GLSL_COMMON_FS = /* glsl */`
uniform vec3 uLightDir, uLightCol, uFillDir, uFillCol, uSkyCol, uGroundCol, uFogCol; uniform float uFogDensity, uTime;
float hash12(vec2 p){ vec3 p3 = fract(vec3(p.xyx)*0.1031); p3 += dot(p3, p3.yzx+33.33); return fract((p3.x+p3.y)*p3.z); }
float vnoise(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.0-2.0*f); return mix(mix(hash12(i),hash12(i+vec2(1,0)),f.x), mix(hash12(i+vec2(0,1)),hash12(i+vec2(1,1)),f.x), f.y); }
float fbm(vec2 p){ float v=0.0, a=0.5; for(int i=0;i<3;i++){ v+=a*vnoise(p); p=p*2.03+vec2(17.1,9.3); a*=0.5; } return v; }
vec3 hsv2rgb(vec3 c){ vec3 p=abs(fract(c.xxx+vec3(0.0,2.0/3.0,1.0/3.0))*6.0-3.0); return c.z*mix(vec3(1.0),clamp(p-1.0,0.0,1.0),c.y); }
float fogAmt(vec3 wp){ float d = length(cameraPosition-wp); return 1.0 - exp(-pow(d*uFogDensity,2.0)); }
vec3 wetLight(vec3 col, vec3 N, vec3 P, float gloss, float sss){
  vec3 V=normalize(cameraPosition-P), L=normalize(uLightDir), H=normalize(V+L);
  float nv=max(.001,dot(N,V)), nl=max(.001,dot(N,L)), nh=max(.001,dot(N,H)), vh=max(.001,dot(V,H));
  float rough=mix(.53,.25,gloss), a2=pow(rough,4.0), denom=nh*nh*(a2-1.0)+1.0;
  float D=a2/(3.14159265*denom*denom), k=pow(rough+1.0,2.0)*.125;
  float G=nv/(nv*(1.0-k)+k)*nl/(nl*(1.0-k)+k), F=.028+.972*pow(1.0-vh,5.0);
  float spec=min(1.6,D*G*F/max(.001,4.0*nv*nl));
  vec3 amb=mix(uGroundCol,uSkyCol,N.y*.5+.5);
  vec3 R=reflect(-V,N); float box=pow(max(0.0,dot(R,normalize(vec3(.4,.82,.43)))),mix(12.0,65.0,gloss));
  float rim=pow(1.0-nv,4.0), wrap=clamp((dot(N,L)+.2)/1.2,0.0,1.0);
  float fill=clamp((dot(N,normalize(uFillDir))+.12)/1.12,0.0,1.0);
  return col*(amb*.65+uLightCol*wrap*.83+uFillCol*fill) + uLightCol*spec*nl + (box*.14+rim*.045)*uSkyCol + col*sss*rim*.2;
}
`;
const GLSL_PIGMENT = /* glsl */`
uniform vec3 uBase,uBelly,uAccent,uGlow,uBandCol;
uniform float uPatScale,uPatStrength,uCounter,uSeed,uFineness,uFlat,uBand,uRay;
uniform int uPattern;
float verticalOf(float ang){ float v=uFlat>.5 ? sin(ang*6.2831853) : -cos(ang*6.2831853); return uRay>.5 ? clamp(v*5.0,-1.0,1.0) : v; }
vec3 skinPigment(float u,float ang){
  float vert=verticalOf(ang); vec2 pc=vec2(u*uFineness*.8,vert*1.2)*uPatScale+uSeed; float nz=fbm(pc*3.0);
  float cs=smoothstep(-.38,.48,vert+(nz-.5)*.12); vec3 col=mix(uBase,uBelly,uCounter*(1.0-cs)); float m=0.0;
  if(uPattern==1) m=smoothstep(.30,.40,abs(fract(vert*1.6*uPatScale+nz*.10)-.5));
  else if(uPattern==2) m=smoothstep(.27,.38,abs(fract(u*uFineness*1.1*uPatScale+nz*.045)-.5));
  else if(uPattern==3){ vec2 sp=vec2(u*uFineness*2.2,vert*2.0)*uPatScale*2.7, cell=floor(sp), l=fract(sp)-.5;
    float j=hash12(cell+uSeed); l-=(vec2(hash12(cell+1.7+uSeed),hash12(cell+3.1+uSeed))-.5)*.5;
    float rr=.1+.1*j; m=(1.0-smoothstep(rr-.03,rr+.02,length(l)))*step(.22,j)*smoothstep(-.55,-.1,vert); }
  else if(uPattern==4) m=1.0-smoothstep(.025,.07,abs(fbm(pc*2.5)-.5));
  else if(uPattern==5) m=smoothstep(.38,.65,sin(u*uFineness*1.6*uPatScale*3.1416)*.5+.5)*smoothstep(-.25,.45,vert);
  else if(uPattern==6) m=smoothstep(.38,.61,fbm(pc*2.2));
  else if(uPattern==7) m=smoothstep(.43,.51,fbm(pc*1.6));
  else if(uPattern==8){ float d=length(vec2((u-.74)*uFineness*1.2,(vert-.25)*.9)/(.35*uPatScale));
    m=(1.0-smoothstep(.75,.85,d))*.95; float ring=smoothstep(.85,.95,d)-smoothstep(1.05,1.2,d); col=mix(col,uBelly,ring*.8*uPatStrength); }
  col=mix(col,uAccent,m*uPatStrength);
  if(uBand>0.0){ float band=(1.0-smoothstep(.07,.2,abs(vert-.02)+(nz-.5)*.06))*smoothstep(.1,.3,u)*uBand; col=mix(col,uBandCol,band); }
  return col;
}
`;
const VS_BODY = GLSL_SWIM + /* glsl */`
attribute vec4 aBody; varying vec3 vN, vWP, vLP; varying vec4 vBody; varying vec2 vCirc;
void main(){ vec3 p = position; vec3 n = normal; float ph = phaseOf();
  p += inflateDisp(p);
  if(aBody.z>2.9 && aBody.z<3.1) p += n*aBody.w*uBreath*uLen*.0028;
  if(aBody.z>6.8) p += n*aBody.w*uBreath*uLen*.0005;
#ifdef JAW
  if(aBody.z < 2.0){ vec2 d = p.xy - uJawPivot; float a = -uJawAngle*aBody.w; float c = cos(a), s = sin(a); p.xy = uJawPivot + vec2(c*d.x - s*d.y, s*d.x + c*d.y); p.x += uJawProtrude*aBody.w; n.xy = vec2(c*n.x - s*n.y, s*n.x + c*n.y); }
#endif
  applyWave(p, n, ph); mat4 mm = modelM(); vec4 wp = mm*vec4(p,1.0); vWP = wp.xyz; vLP = p; vN = normalize(mat3(mm)*n); vBody = aBody; vCirc=vec2(cos(aBody.y*6.2831853),sin(aBody.y*6.2831853)); gl_Position = projectionMatrix*viewMatrix*wp; }`;
const FS_BODY = GLSL_COMMON_FS + GLSL_PIGMENT + /* glsl */`
uniform float uLen,uScaleSize,uIrid,uGloss,uPhoto,uTrans,uHeadU,uMouthU,uLateral,uElectric,uDetail,uMouthStart,uMouthTipF,uMouthCornerF,uManta,uJawAngle;
uniform int uScale; varying vec3 vN,vWP,vLP; varying vec4 vBody; varying vec2 vCirc;
float scaleHeight(vec2 sc){
  if(uScale==4 || uScale==6) return 0.0;
  vec2 p=sc; if(uScale==2 || uScale==5) p=vec2(sc.x+sc.y,sc.y-sc.x)*.7071;
  p.x+=mod(floor(p.y),2.0)*.5; vec2 cell=floor(p), q=fract(p)-.5;
  float jitter=hash12(cell+uSeed);
  q+=(vec2(jitter,hash12(cell+uSeed+1.3))-.5)*.035;
  /* imbricate scale: a fan whose free (posterior, +x) edge rides over the next scale */
  vec2 e=vec2(q.x*.86-.1, q.y*1.05);
  float d=(uScale==2 || uScale==5) ? abs(e.x)+abs(e.y) : length(e);
  if(uScale==1) d+=.02*sin(atan(e.y,e.x)*9.0+jitter*6.0)*step(0.0,e.x);   /* ctenoid comb edge */
  float body=1.0-smoothstep(.40,.50,d);
  float ramp=.35+.65*smoothstep(-.45,.32,e.x);                              /* rises toward the free edge */
  float lip=smoothstep(.30,.44,d)*step(-.05,e.x);                           /* shadowed step over the next scale */
  return body*ramp*(.85+.3*jitter)-lip*.35;
}
float scaleTone(vec2 sc){ vec2 p=sc; if(uScale==2 || uScale==5) p=vec2(sc.x+sc.y,sc.y-sc.x)*.7071; p.x+=mod(floor(p.y),2.0)*.5; return hash12(floor(p)+uSeed+9.0); }
void main(){
  float u=vBody.x, ang=fract(atan(vCirc.y,vCirc.x)/6.2831853+1.0), vert=verticalOf(ang);
  vec3 N=normalize(vN); if(!gl_FrontFacing) N=-N; vec3 V=normalize(cameraPosition-vWP);
  vec3 col=skinPigment(u,ang); float tissue=vBody.z;
  if(uManta<.5 && tissue<.5 && u>=uMouthStart && u<=uMouthU){
    float t=smoothstep(uMouthStart,uMouthU,u);
    float level=mix(uMouthTipF,uMouthCornerF,t)-.025*sin(3.14159265*t);
    float fade=smoothstep(uMouthStart,uMouthStart+.012,u)*(1.0-smoothstep(uMouthU-.014,uMouthU,u));
    float crease=exp(-pow((vert-level)/(.023+uJawAngle*.26),2.0))*fade;
    col=mix(col,uBase*.3,crease*.55);
  }
  vec2 sc=vec2(u*uFineness*34.0,ang*27.0*(1.0+.22*uFineness))/uScaleSize;
  if(uScale==3) sc*=2.2; if(uScale==5) sc*=.5;
  float h=scaleHeight(sc), visible=1.0-smoothstep(.4,1.7,length(fwidth(sc)));
  if(uDetail>.4 && tissue<.5 && uScale!=4 && uScale!=6){
    float scaleFade=uScale==3 ? 1.0 : smoothstep(uHeadU*.55,uHeadU,u);
    vec3 dx=dFdx(vWP), dy=dFdy(vWP), r1=cross(dy,N), r2=cross(N,dx); float det=dot(dx,r1);
    float hx=scaleHeight(sc+dFdx(sc))-h, hy=scaleHeight(sc+dFdy(sc))-h;
    float scaleRelief=uScale==3 ? .00035 : uScale==2 || uScale==5 ? .0015 : .0011;
    vec3 grad=sign(det)*(hx*r1+hy*r2)*(uLen/max(1.25,uFineness))*scaleRelief*uScaleSize*visible*scaleFade;
    N=normalize(max(abs(det),1e-12)*N-grad);
    col*=1.0+.025*(h-.4)*visible*scaleFade+.035*(scaleTone(sc)-.5)*visible*scaleFade;
  }
  if(uScale==6){ float rows=min(abs(vert-.9),min(abs(abs(vert)-.35),abs(vert+.9)));
    float plate=(1.0-smoothstep(.015,.1,rows))*pow(.5+.5*sin(u*uFineness*31.0),2.0)*step(uHeadU,u); col*=1.0+.14*plate; }
  float line=exp(-pow((vert-.08*sin(u*3.0))/.018,2.0))*step(uHeadU,u)*uLateral; col*=1.0-.16*line;
  if(tissue>.5 && tissue<2.0) col=mix(vec3(.30,.11,.115),vec3(.07,.02,.025),smoothstep(-.2,.9,vert*.5+.5))*(.85+.15*sin(u*70.0));
  if(tissue>5.4 && tissue<6.6) col=mix(col,vec3(.065,.04,.043),.55);
  if(tissue>6.6) col*=.9;
  float microGloss=clamp(uGloss+(scaleTone(sc)-.5)*visible*.08,0.0,1.0);
  vec3 c=wetLight(col,N,vWP,tissue>.5&&tissue<2.0 ? .65 : microGloss,uTrans+.12);
  float nv=max(0.0,dot(N,V)); vec3 film=mix(uBase,uBelly,.65)+vec3(.04,.055,.08)*sin(nv*13.0+u*2.0);
  c+=max(vec3(0.0),film)*uIrid*.048*pow(1.0-nv,1.4);
  if(uPhoto>.5) for(int row=0;row<2;row++){
    float rv=row==0 ? -.52 : -.81, n=max(1.0,floor(uPhoto/2.0)), pu=(u-uHeadU)/(1.0-uHeadU)*n;
    float dotp=1.0-smoothstep(.07,.13,length(vec2(fract(pu)-.5,(vert-rv)*n*.36)));
    c+=uGlow*dotp*step(uHeadU,u)*step(u,.99)*( .85+.15*sin(uTime*2.5+floor(pu)))*1.7;
  }
  if(uElectric>.5) c+=vec3(.2,.35,.65)*uElectric*pow(max(0.0,sin(uTime*5.0+u*16.0)),24.0)*smoothstep(.3,.8,u)*.14;
  c=mix(c,uFogCol,fogAmt(vWP)); gl_FragColor=vec4(c,mix(1.0,.86,uTrans));
}`;
const VS_FIN = GLSL_SWIM + /* glsl */`
attribute vec4 aFin; attribute vec4 aFin2; attribute vec4 aSkin; attribute vec3 aBase; varying vec3 vN, vWP; varying vec4 vFin, vFin2, vSkin; varying vec2 vCirc;
void main(){ vec3 p = position; vec3 n = normal; float ph = phaseOf(); p += inflateDisp(aBase);
  float kind = aFin.w, lenT = aFin.y, rayT = aFin.x, flex = aFin.z; float u = aSkin.x; float t = uCycle + ph;
  float mobile=smoothstep(.12,.8,lenT), tissue=mix(1.0,.13,aSkin.z);
  float rip = sin(rayT*9.0 + t*8.0 + u*4.0) * flex * mobile*mobile * uLen * .008*tissue;
  if(uMode == 7 && kind == 1.0) rip = sin(rayT*12.0 - t*14.0) * lenT*lenT * uLen * 0.03;
  if((kind == 2.0 || kind == 1.0) && uMode == 0 && flex > 0.9) rip = sin(rayT*14.0 - t*7.0) * lenT*lenT*uLen*0.03;
  p.z += rip*mobile;
  if(kind == 3.0){ if(uMode == 6){ p.y += sin(u*uWaveK*8.5 - t*6.2831853) * mobile*mobile * uLen * .065; } else { float f = uFlap * sin(t*6.2831853 + ph) * (1.0+0.3*uBurst); if(uMode==7) f = .3*sin(t*12.0); p.y += f * mobile*mobile * uLen * .065; } }
  applyWave(p, n, ph); mat4 mm = modelM(); vec4 wp = mm*vec4(p,1.0); vWP = wp.xyz; vN = normalize(mat3(mm)*n); vFin = aFin; vFin2 = aFin2; vSkin=aSkin; vCirc=vec2(cos(aSkin.y*6.2831853),sin(aSkin.y*6.2831853)); gl_Position = projectionMatrix*viewMatrix*wp; }`;
const FS_FIN = GLSL_COMMON_FS + GLSL_PIGMENT + /* glsl */`
uniform vec3 uFinCol; uniform float uIrid,uGloss; varying vec3 vN, vWP; varying vec4 vFin, vFin2, vSkin; varying vec2 vCirc;
void main(){ float rayT = vFin.x, lenT = vFin.y, op = vFin2.x, memb = vFin2.y, sf = vFin2.z, R = vFin2.w;
  float rl = abs(fract(rayT*(R-1.0)+0.5)-0.5); float isSpine = step(rayT, sf - 0.001); float rayW = mix(0.08, 0.16, isSpine)*(1.0-0.5*lenT); float ray = 1.0 - smoothstep(rayW, rayW+0.08, rl);
  float branch=1.0-smoothstep(.055,.12,abs(fract(rayT*(R-1.0)*2.0+.5)-.5));
  ray=mix(ray,max(ray*.55,branch*.65),smoothstep(.55,.86,lenT)*(1.0-isSpine));
  if(lenT > memb && ray < .55 && vSkin.z<.5) discard;
  float root=1.0-smoothstep(.06,.42,lenT), ang=fract(atan(vCirc.y,vCirc.x)/6.2831853+1.0);
  vec3 skin=skinPigment(vSkin.x,ang), col=mix(uFinCol,skin,root);
  if(vSkin.z>.5) col=mix(skin,uFinCol*.9,smoothstep(.28,1.0,lenT)*.18);
  else {
    col*=1.0-.09*ray*(1.0-root);
    if(uPattern==2 || uPattern==3) col=mix(col,uAccent,(1.0-root)*uPatStrength*.35*smoothstep(.3,.44,abs(fract(rayT*R*.35)-.5)));
  }
  float a=mix(max(.22,op*(1.0-.28*lenT)+ray*.08),1.0,root);
  if(vSkin.z>.5) a=1.0;
  vec3 N=normalize(vN); if(!gl_FrontFacing) N=-N;
  vec3 c=wetLight(col,N,vWP,uGloss*.85,(1.0-vSkin.z)*(1.0-root)*.6);
  c+=col*uLightCol*pow(max(0.0,dot(-N,normalize(uLightDir))),2.0)*(1.0-vSkin.z)*(1.0-root)*.15;
  float fog=fogAmt(vWP); c=mix(c,uFogCol,fog); gl_FragColor=vec4(c,a);
}`;
const VS_EYE = GLSL_SWIM + /* glsl */`
varying vec3 vN, vWP, vLN; void main(){ vec3 p = position; vec3 n = normal; vLN = normal; p+=inflateDisp(p); applyWave(p, n, phaseOf()); mat4 mm = modelM(); vec4 wp = mm*vec4(p,1.0); vWP = wp.xyz; vN = normalize(mat3(mm)*n); gl_Position = projectionMatrix*viewMatrix*wp; }`;
