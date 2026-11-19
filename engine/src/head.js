<!DOCTYPE html><html><head><meta charset="utf-8">
<style>
@font-face{font-family:Baloo;font-weight:800;src:url(../fonts/fontsource-baloo-2-5.3.0/package/files/baloo-2-latin-800-normal.woff2) format("woff2");unicode-range:U+0000-00FF,U+2000-206F}
@font-face{font-family:Baloo;font-weight:800;src:url(../fonts/fontsource-baloo-2-5.3.0/package/files/baloo-2-devanagari-800-normal.woff2) format("woff2");unicode-range:U+0900-097F,U+1CD0-1CFF,U+200C-200D,U+20B9,U+25CC,U+A830-A839,U+A8E0-A8FF}
@font-face{font-family:Baloo;font-weight:700;src:url(../fonts/fontsource-baloo-2-5.3.0/package/files/baloo-2-latin-700-normal.woff2) format("woff2");unicode-range:U+0000-00FF,U+2000-206F}
@font-face{font-family:Baloo;font-weight:700;src:url(../fonts/fontsource-baloo-2-5.3.0/package/files/baloo-2-devanagari-700-normal.woff2) format("woff2");unicode-range:U+0900-097F,U+1CD0-1CFF,U+200C-200D,U+20B9,U+25CC,U+A830-A839,U+A8E0-A8FF}
html,body{margin:0;background:#000;overflow:hidden}
body.poster #title,body.poster #cap,body.poster #sub,body.poster #pills,body.poster #src,body.poster #verse{display:none!important}
#stage{position:relative;width:1080px;height:1920px;overflow:hidden;font-family:Baloo,sans-serif}
canvas{position:absolute;left:0;top:0;display:block}
.ol{-webkit-text-stroke:13px #221a3c;paint-order:stroke fill}
#title{position:absolute;left:40px;width:1000px;top:170px;text-align:center;color:#fff;font-weight:800;line-height:1.0}
#title .a{font-size:62px}#title .b{font-size:122px;color:#ffae21}
#flash{position:absolute;left:0;top:0;width:1080px;height:1920px;background:#fff8ec;opacity:0;pointer-events:none}
#cap{position:absolute;left:50px;width:980px;text-align:center;color:#fff;font-weight:800;font-size:76px;line-height:1.12;transform:translateY(-50%)}
#cap .w{display:inline-block;margin:0 .12em;white-space:nowrap}
#cap .hl{color:#ffae21}
#cap.big{font-size:136px;letter-spacing:.03em}
#cap.sm{font-size:66px}
#cap.big .hl{color:#7fb4ff}
#sub{position:absolute;left:50px;width:980px;text-align:center;color:#fff;font-weight:700;font-size:56px}
.pill{position:absolute;padding:10px 30px 4px;border-radius:60px;font-weight:800;font-size:38px;letter-spacing:.14em;transform:translate(-50%,-50%);white-space:nowrap;
 background:#fff7ea;color:#2b2240;box-shadow:0 6px 0 rgba(40,25,60,.25),0 10px 30px rgba(0,0,0,.25)}
.pill.or{background:#ffae21;color:#2b1a08}.pill.gr{background:#7ed957;color:#13300c}
.pill.hi{letter-spacing:.02em;font-size:46px;padding:6px 32px 4px}
#src{position:absolute;left:60px;width:960px;text-align:center;color:#fff;font-weight:700;font-size:34px;top:1318px;-webkit-text-stroke:9px #221a3c}
#verse{position:absolute;left:70px;width:940px;text-align:center;color:#fff;font-weight:700}
#verse .s{font-size:32px;opacity:.95}#verse .e{font-size:38px;line-height:1.2;margin-top:8px}#verse .v{font-size:50px;line-height:1.25;color:#ffae21;margin-top:6px}
</style>
<script type="importmap">{"imports":{"three":"./package/build/three.module.js","three/addons/":"./package/examples/jsm/"}}</script>
</head><body><div id="stage">
<div id="flash"></div><div id="title" class="ol"><div class="a"></div><div class="b"></div></div>
<div id="verse" class="ol"><div class="s"></div><div class="v"></div><div class="e"></div></div>
<div id="cap" class="ol"></div><div id="sub" class="ol"></div>
<div id="pills"></div><div id="src" class="ol"></div>
</div>
<script type="module">
import * as THREE from 'three';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import {EffectComposer} from 'three/addons/postprocessing/EffectComposer.js';
import {RenderPass} from 'three/addons/postprocessing/RenderPass.js';
import {BokehPass} from 'three/addons/postprocessing/BokehPass.js';
import {ShaderPass} from 'three/addons/postprocessing/ShaderPass.js';
import {OutputPass} from 'three/addons/postprocessing/OutputPass.js';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {mergeVertices} from 'three/addons/utils/BufferGeometryUtils.js';
{const q=new URLSearchParams(location.search);await import(q.get('spec')||'../work/spec.js')}   // sets window.STORY and window.TL

const QS=new URLSearchParams(location.search),W=+QS.get('w')||1080,H=+QS.get('h')||1920,POSTER=QS.has('poster'), V=(x,y,z)=>new THREE.Vector3(x,y,z);
if(POSTER){document.body.classList.add('poster');const st=document.getElementById('stage');st.style.width=W+'px';st.style.height=H+'px'}
const cl=(x,a=0,b=1)=>Math.max(a,Math.min(b,x)), lerp=(a,b,p)=>a+(b-a)*p, ez=p=>{p=cl(p);return p*p*(3-2*p)}, eo=p=>1-Math.pow(1-cl(p),3);
const prog=(t,a,b)=>cl((t-a)/(b-a)), win=(t,a,b,d=.3)=>cl((t-a)/d)*cl((b-t)/d);
const rnd=i=>{const x=Math.sin(i*127.1+311.7)*43758.5453;return x-Math.floor(x)};
const vl=(a,b,p)=>a.clone().lerp(b,p);

// ---------------- renderer
const renderer=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});
renderer.setSize(W,H);renderer.setPixelRatio(+QS.get("pr")||1);
renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFShadowMap;
renderer.toneMapping=THREE.NeutralToneMapping;renderer.toneMappingExposure=1.0;
document.getElementById('stage').prepend(renderer.domElement);
const scene=new THREE.Scene();
scene.environment=new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(),0.04).texture;scene.environmentIntensity=.42;
scene.fog=new THREE.Fog('#ffd9bf',22,70);

// ---------------- clay material
function clayBump(){const c=document.createElement('canvas');c.width=c.height=512;const x=c.getContext('2d');
  x.fillStyle='#808080';x.fillRect(0,0,512,512);let s=11;const r=()=>{s=(s*16807)%2147483647;return s/2147483647};
  for(let i=0;i<700;i++){const g=Math.floor(96+r()*64);x.fillStyle=`rgba(${g},${g},${g},.3)`;x.beginPath();x.ellipse(r()*512,r()*512,8+r()*30,5+r()*16,r()*3.14,0,6.3);x.fill()}
  for(let i=0;i<60;i++){x.strokeStyle=`rgba(${r()<.5?70:180},${r()<.5?70:180},${r()<.5?70:180},.18)`;x.lineWidth=1.5;const cx=r()*512,cy=r()*512;for(let k=0;k<4;k++){x.beginPath();x.arc(cx,cy,6+k*5,r()*6,r()*6+2.4);x.stroke()}}
  for(let i=0;i<7000;i++){const g=Math.floor(104+r()*48);x.fillStyle=`rgba(${g},${g},${g},.45)`;x.fillRect(r()*512,r()*512,1.5,1.5)}
  const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(2,2);return t}
const bump=clayBump();
function tigerTex(rot){const c=document.createElement('canvas');c.width=512;c.height=256;const x=c.getContext('2d');x.fillStyle='#f39a35';x.fillRect(0,0,512,256);
  let s=5;const r=()=>{s=(s*16807)%2147483647;return s/2147483647};x.strokeStyle='#3a2416';x.lineCap='round';
  for(let i=0;i<18;i++){const x0=i*28.4+r()*10,y0=r()*70,len=90+r()*120;x.lineWidth=5+r()*6;x.beginPath();x.moveTo(x0,y0);
    for(let k=1;k<=6;k++){x.lineTo(x0+Math.sin(k*1.3+i)*7,y0+len*k/6)}x.stroke()}
  const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.wrapS=t.wrapT=THREE.RepeatWrapping;if(rot){t.center.set(.5,.5);t.rotation=Math.PI/2}return t}
const clay=(color,o={})=>new THREE.MeshPhysicalMaterial({color,roughness:.78,sheen:.5,sheenRoughness:.55,sheenColor:new THREE.Color(color).lerp(new THREE.Color('#fff'),.55),bumpMap:bump,bumpScale:1.1,...o});
const gloss=c=>new THREE.MeshPhysicalMaterial({color:c,roughness:.22,clearcoat:.6});
const SPH=new THREE.SphereGeometry(1,40,28), CYL=new THREE.CylinderGeometry(1,1,1,24,1,true);
function add(geo,mat,p=[0,0,0],s=[1,1,1],r=[0,0,0],parent=scene){const m=new THREE.Mesh(geo,mat);m.position.set(...p);m.scale.set(...s);m.rotation.set(...r);m.castShadow=m.receiveShadow=true;parent.add(m);return m}
// limb = cylinder + joint spheres, posable between two points
function limb(r,mat,parent){const o={c:add(CYL,mat,[0,0,0],[r,1,r],[0,0,0],parent),a:add(SPH,mat,[0,0,0],[r,r,r],[0,0,0],parent),b:add(SPH,mat,[0,0,0],[r,r,r],[0,0,0],parent),
  set(p,q){this.a.position.copy(p);this.b.position.copy(q);this.c.position.copy(p).add(q).multiplyScalar(.5);const d=q.clone().sub(p),L=d.length()||1e-4;
    this.c.scale.y=L;this.c.quaternion.setFromUnitVectors(V(0,1,0),d.divideScalar(L))}};return o}
function lumpy(detail=3,amt=.12,seed=1){let g0=new THREE.IcosahedronGeometry(1,detail);g0.deleteAttribute('normal');g0.deleteAttribute('uv');const g=mergeVertices(g0),p=g.attributes.position,v=new THREE.Vector3();
  for(let i=0;i<p.count;i++){v.fromBufferAttribute(p,i);const n=1+amt*(Math.sin(v.x*3.1+seed)*Math.sin(v.y*2.7+seed*2)*Math.sin(v.z*3.3+seed*3)+.4*Math.sin(v.x*7+v.z*5+seed));v.multiplyScalar(n);p.setXYZ(i,v.x,v.y,v.z)}
  g.computeVertexNormals();return g}

const M={ash:clay('#c3cff0'),hair:clay('#2a2338'),tiger:clay('#ffffff',{map:tigerTex(0)}),tiger2:clay('#ffffff',{map:tigerTex(1)}),stripe:clay('#3b2518'),white:clay('#fbf6ec'),gold:clay('#f3b733',{metalness:.15}),
 bead:clay('#7b4329'),snake:clay('#3fae7a'),snakeB:clay('#a6e3a1'),eye:gloss('#1b1626'),blush:clay('#f49aa6'),red:clay('#d8382f'),
 rock:clay('#9c90b6'),snow:clay('#f6f1f4'),mtn:clay('#b8b6e4'),mtn2:clay('#d4c3e6'),moon:clay('#fff0b8',{emissive:'#ffd76a',emissiveIntensity:.45}),
 milk:clay('#ffffff',{vertexColors:true,roughness:.45,sheen:.3}),mandara:clay('#a77c55'),tree:clay('#4f9e5a'),tree2:clay('#2f7f57'),shell:clay('#6d9a4f'),
 poisonP:clay('#5b2c86',{emissive:'#2c0b4a',emissiveIntensity:.5}),poisonG:clay('#93cf3a',{emissive:'#2f5a10',emissiveIntensity:.35}),poisonD:clay('#3a1f5c',{emissive:'#1a0830',emissiveIntensity:.5}),
 cloud:clay('#fffaf4'),drum:clay('#c8342c'),ivory:clay('#f1e4c6'),dark:clay('#3a2a4a')};
const throatMat=clay('#c3cff0',{emissive:'#000000'});

// ---------------- sky
const skyU={top:{value:new THREE.Color('#8fa0e6')},mid:{value:new THREE.Color('#f7b7a0')},bot:{value:new THREE.Color('#ffe2c4')}};
const sky=new THREE.Mesh(new THREE.SphereGeometry(90,32,16),new THREE.ShaderMaterial({uniforms:skyU,side:THREE.BackSide,depthWrite:false,fog:false,
 vertexShader:`varying vec3 p;void main(){p=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
 fragmentShader:`uniform vec3 top,mid,bot;varying vec3 p;void main(){float h=normalize(p).y;vec3 c=h>0.08?mix(mid,top,smoothstep(.08,.55,h)):mix(bot,mid,smoothstep(-.1,.08,h));gl_FragColor=vec4(c,1.);}`}));
scene.add(sky);

// ---------------- lights
const key=new THREE.DirectionalLight('#ffe6c8',2.5);key.castShadow=true;key.shadow.mapSize.set(2048,2048);key.shadow.radius=6;key.shadow.bias=-.0005;key.shadow.normalBias=.02;
scene.add(key,key.target);
const hemi=new THREE.HemisphereLight('#cbd5ff','#b393a8',.9);scene.add(hemi);
const rim=new THREE.DirectionalLight('#ffb48c',1.3);scene.add(rim);
const glowL=new THREE.PointLight('#4b7bff',0,2.4,2);scene.add(glowL);
const poisonL=new THREE.PointLight('#7c3dff',0,14,1.5);scene.add(poisonL);
function setKey(pos,target,box){key.position.copy(pos);key.target.position.copy(target);const c=key.shadow.camera;c.left=-box;c.right=box;c.top=box;c.bottom=-box;c.near=1;c.far=60;c.updateProjectionMatrix()}

// ================= characters
function face(g,{y,r,eyeX=.36,eyeY=0,eyeS=1,brow='calm',mustache=false}){
  const z=d=>Math.sqrt(Math.max(0,r*r-d*d));const f={eyes:[],shut:[],brows:[]};
  for(const s of [-1,1]){
    const ex=s*eyeX*r, ey=y+eyeY*r;
    const e=add(SPH,M.eye,[ex,ey,z(Math.hypot(eyeX*r,eyeY*r))*.97],[.13*r*eyeS,.17*r*eyeS,.07*r],[0,s*.35,0],g);
    add(SPH,M.white,[.05*r*eyeS,.07*r*eyeS,.6],[.28,.25,.5],[0,0,0],e); f.eyes.push(e);
    const sh=add(new THREE.TorusGeometry(.12*r,.022*r,8,20,Math.PI),M.eye,[ex,ey,z(eyeX*r)*.99],[1,1,1],[0,s*.3,Math.PI],g);sh.visible=false;f.shut.push(sh);
    add(SPH,M.blush,[s*.58*r,y-.2*r,z(.6*r)*.93],[.16*r,.09*r,.05*r],[0,s*.62,0],g);
    const b=add(new THREE.CapsuleGeometry(.025*r,.16*r,6,12),M.hair,[ex,ey+.27*r,z(.42*r)*.98],[1,1,1],[0,s*.3,Math.PI/2],g);b.userData.s=s;f.brows.push(b);
  }
  f.smile=add(new THREE.TorusGeometry(.11*r,.024*r,8,20,Math.PI),M.eye,[0,y-.3*r,z(.3*r)*.99],[1,1,1],[0,0,Math.PI],g);
  f.oh=add(SPH,M.eye,[0,y-.33*r,z(.33*r)*.97],[.07*r,.09*r,.04*r],[0,0,0],g);f.oh.visible=false;
  if(mustache)for(const s of [-1,1])add(new THREE.CapsuleGeometry(.04*r,.2*r,6,12),M.hair,[s*.12*r,y-.2*r,z(.2*r)*.99],[1,1,1],[0,0,Math.PI/2-s*.5],g);
  f.set=(open=1,mood='calm',mouth='smile')=>{
    f.eyes.forEach(e=>{e.visible=open>.15;e.scale.y=Math.abs(e.scale.x)*1.3*cl(open,.15,1)});f.shut.forEach(e=>e.visible=open<=.15);
    f.brows.forEach(b=>{const s=b.userData.s;b.rotation.z=Math.PI/2+(mood==='angry'?s*.45:mood==='worried'?-s*.4:0)});
    f.smile.visible=mouth==='smile';f.oh.visible=mouth==='oh'};
  return f}

function makeChar({skin,top,bottom,kind,seed=0}){
  const root=new THREE.Group(),lean=new THREE.Group(),yaw=new THREE.Group(),m=new THREE.Group();root.add(lean);lean.add(yaw);yaw.add(m);
  const S=clay(skin),T=clay(top),B=clay(bottom);
  for(const s of [-1,1]){add(new THREE.CapsuleGeometry(.13,.18,8,16),B,[s*.15,.22,0],[1,1,1],[0,0,0],m);add(SPH,S,[s*.16,.06,.1],[.13,.08,.18],[0,0,0],m)}
  add(new THREE.CylinderGeometry(.33,.42,.42,32),B,[0,.48,0],[1,1,.9],[0,0,0],m);
  add(new THREE.CapsuleGeometry(.36,.28,10,28),T,[0,.92,0],[1,1,.88],[0,0,0],m);
  add(new THREE.TorusGeometry(.355,.055,10,32),kind==='deva'?M.gold:kind==='sage'?clay('#8a5a3a'):M.dark,[0,.68,0],[1,1,.9],[Math.PI/2,0,0],m);
  if(kind==='deva')add(new THREE.TorusGeometry(.3,.04,8,28,Math.PI),M.gold,[0,1.18,.02],[1,.75,1.05],[Math.PI/2+.25,0,0],m);
  const hy=1.72,hr=.56;
  add(SPH,S,[0,hy,0],[hr,hr*.96,hr*.95],[0,0,0],m);
  add(new THREE.SphereGeometry(1,32,16,0,Math.PI*2,0,1.62),kind==='sage'?M.white:M.hair,[0,hy+.02,-.04],[hr*1.05,hr,hr*1.02],[-.62,0,0],m);
  for(const s of [-1,1])add(SPH,S,[s*hr*.98,hy-.04,0],[.09,.12,.07],[0,0,0],m);
  const f=face(m,{y:hy,r:hr,eyeX:.34,eyeY:-.02,brow:kind==='asura'?'angry':'calm',mustache:kind==='asura'&&seed%2===0});
  if(kind==='deva'){
    add(new THREE.CylinderGeometry(.3,.36,.28,28),M.gold,[0,hy+.44,-.02],[1,1,1],[-.12,0,0],m);
    for(let i=0;i<5;i++){const a=(i-2)*.5;add(new THREE.ConeGeometry(.07,.2,12),M.gold,[Math.sin(a)*.27,hy+.65,Math.cos(a)*.24-.06],[1,1,1],[-.12,0,0],m)}
    add(SPH,M.red,[0,hy+.45,.31],[.07,.08,.05],[0,0,0],m);
  }else if(kind==='asura'){
    add(new THREE.CylinderGeometry(.3,.36,.26,28),clay('#7b2346'),[0,hy+.43,-.02],[1,1,1],[-.12,0,0],m);
    for(let i=0;i<5;i++){const a=(i-2)*.5;add(new THREE.ConeGeometry(.055,.26,12),clay('#c9c6da'),[Math.sin(a)*.27,hy+.67,Math.cos(a)*.24-.06],[1,1,1],[-.12,0,0],m)}
    add(SPH,clay('#ffd23a'),[0,hy+.44,.31],[.06,.07,.04],[0,0,0],m);
  }else if(kind==='gana'){ // Shiva's attendant: top-knot, ash tripundra, rudraksha
    add(SPH,M.hair,[0,hy+.56,-.08],[.17,.16,.17],[0,0,0],m);
    for(let i=0;i<3;i++)add(new THREE.CapsuleGeometry(.014,.26,6,10),M.white,[0,hy+.2+i*.05,hr*.93-i*.02],[1,1,1],[-.28-i*.05,0,Math.PI/2],m);
    for(let i=0;i<11;i++){const a=-1.1+i*.22;add(SPH,M.bead,[Math.sin(a)*.3,1.24-Math.cos(a)*.2,.27+Math.cos(a)*.06],[.04,.04,.04],[0,0,0],m)}
  }else{ // sage (prajapati): white top-knot, beard and moustache
    add(SPH,M.white,[0,hy+.56,-.12],[.2,.19,.2],[0,0,0],m);add(new THREE.TorusGeometry(.13,.05,10,24),M.white,[0,hy+.48,-.1],[1,1,1],[Math.PI/2-.3,0,0],m);
    add(lumpy(3,.07,5),M.white,[0,hy-.38,.33],[.3,.3,.17],[.25,0,0],m);
    for(const s of [-1,1])add(new THREE.CapsuleGeometry(.045,.2,6,12),M.white,[s*.12,hy-.2,hr*.93],[1,1,1],[0,0,Math.PI/2-s*.35],m);
    f.brows.forEach(b=>b.material=M.white);
  }
  const arms=[limb(.1,T,m),limb(.1,T,m)],hands=[add(SPH,S,[0,0,0],[.12,.12,.12],[0,0,0],m),add(SPH,S,[0,0,0],[.12,.12,.12],[0,0,0],m)];
  const sh=[V(-.36,1.08,0),V(.36,1.08,0)];
  const c={root,lean,yaw,m,f,kind,
    setHands(l,r){[l,r].forEach((h,i)=>{const p=sh[i],d=h.clone().sub(p);if(d.length()>.62)d.setLength(.62);const q=p.clone().add(d);arms[i].set(p,q);hands[i].position.copy(q)})},
    handsTo(wl,wr){root.updateMatrixWorld(true);c.setHands(m.worldToLocal(wl.clone()),m.worldToLocal(wr.clone()))}};
  c.setHands(V(-.42,.72,.15),V(.42,.72,.15));f.set(1,kind==='asura'?'angry':'calm');
  return c}

// ---------------- Shiva
function makeShiva(){
  const g=new THREE.Group(),A=M.ash;
  const seat=new THREE.Group(),stand=new THREE.Group();g.add(seat,stand);stand.visible=false;
  add(SPH,M.tiger,[0,.36,.08],[1.3,.42,1.05],[0,0,0],seat);
  add(new THREE.CylinderGeometry(.66,.86,1.15,32),M.tiger,[0,.32,0],[1,1,.85],[0,0,0],stand);
  add(new THREE.TorusGeometry(.67,.05,10,40),M.bead,[0,.86,0],[1,1,.85],[Math.PI/2,0,0],stand);
  for(const s of [-1,1]){add(new THREE.CapsuleGeometry(.2,.75,8,16),A,[s*.3,-.55,0],[1,1,1],[0,0,0],stand);add(SPH,A,[s*.32,-1.2,.12],[.2,.12,.28],[0,0,0],stand)}
  const shin=[limb(.25,M.tiger2,seat),limb(.25,M.tiger2,seat)];shin[0].set(V(-.95,.42,.45),V(.45,.36,.88));shin[1].set(V(.95,.46,.42),V(-.45,.42,.84));
  for(const s of [-1,1])add(SPH,A,[s*.62,.62,.86],[.17,.11,.24],[.25,s*.4,0],seat);
  add(new THREE.CapsuleGeometry(.6,.5,12,32),A,[0,1.08,0],[1,1,.84],[0,0,0],g);
  const throat=add(SPH,throatMat,[0,1.86,0],[.36,.27,.33],[0,0,0],g);
  const hy=2.62,hr=.82;
  add(SPH,A,[0,hy,0],[hr,hr*.96,hr*.95],[0,0,0],g);
  add(new THREE.SphereGeometry(1,40,20,0,Math.PI*2,0,1.95),M.hair,[0,hy+.03,-.06],[hr*1.06,hr*1.0,hr*1.03],[-.82,0,0],g);
  for(const s of [-1,1])add(SPH,A,[s*hr*.97,hy-.06,.02],[.12,.17,.1],[0,0,0],g);
  for(const s of [-1,1])add(new THREE.TorusGeometry(.08,.025,8,20),M.gold,[s*hr*.99,hy-.26,.03],[1,1,1],[0,Math.PI/2,0],g);
  add(new THREE.TorusGeometry(.36,.15,14,32),M.hair,[0,hy+.83,-.12],[1,1,1],[Math.PI/2-.2,0,0],g);
  add(new THREE.TorusGeometry(.24,.13,14,32),M.hair,[0,hy+1.0,-.14],[1,1,1],[Math.PI/2-.2,0,0],g);
  add(SPH,M.hair,[0,hy+1.15,-.15],[.2,.2,.2],[0,0,0],g);
  for(let i=0;i<6;i++){const s=i<3?-1:1,k=i%3;const l=limb(.12,M.hair,g);l.set(V(s*(.45+k*.12),hy-.05,-.45-k*.08),V(s*(.62+k*.16),1.45-k*.12,-.55-k*.1))}
  const cres=new THREE.Shape();cres.absarc(0,0,.3,-1.3,1.95,false);cres.absarc(.13,.09,.24,1.8,-1.1,true);
  add(new THREE.ExtrudeGeometry(cres,{depth:.06,bevelEnabled:true,bevelSize:.025,bevelThickness:.025,bevelSegments:4,curveSegments:24}),M.moon,[.42,hy+.98,.05],[1,1,1],[0,-.2,.5],g);
  const f=face(g,{y:hy,r:hr,eyeX:.33,eyeY:-.05,eyeS:.95});
  for(let i=0;i<3;i++)add(new THREE.CapsuleGeometry(.017,.34-i*.03,6,12),M.white,[0,hy+.2+i*.055,hr*.93-i*.022],[1,1,1],[-.28-i*.05,0,Math.PI/2],g);
  add(SPH,M.red,[0,hy+.255,hr*.94],[.032,.068,.03],[-.32,0,0],g);
  for(let i=0;i<19;i++){const a=-1.25+i*(2.5/18);add(SPH,M.bead,[Math.sin(a)*.56,1.62-Math.cos(a)*.42,.36+Math.cos(a)*.17],[.065,.065,.065],[0,0,0],g)}
  // Vasuki, two positions: 'shoulder' (keeps the blue throat visible, for Neelkantha stories) and 'neck' (classic look)
  const snakeG={shoulder:new THREE.Group(),neck:new THREE.Group()};snakeG.shoulder.scale.x=-1;snakeG.neck.scale.x=-1;g.add(snakeG.shoulder,snakeG.neck);
  function hood(parent,pos,rot){const sn=new THREE.Group();sn.position.set(...pos);sn.rotation.set(...rot);parent.add(sn);
    // cobra hood: wide flat spread growing out of the body, pale belly plates on the front, head on top
    const spread=new THREE.Group();spread.rotation.x=-.12;sn.add(spread);
    add(SPH,M.snake,[0,0,0],[.25,.3,.075],[0,0,0],spread);
    add(SPH,M.snake,[0,-.24,-.01],[.12,.14,.075],[0,0,0],spread);
    add(SPH,M.snakeB,[0,-.03,.05],[.15,.23,.035],[0,0,0],spread);
    const band=clay('#7cc98f');
    for(let i=0;i<5;i++){const y=.14-i*.075,w=.13*Math.sqrt(Math.max(.2,1-((y+.03)/.24)**2));add(SPH,band,[0,y,.078],[w,.012,.01],[0,0,0],spread)}
    const hd=new THREE.Group();hd.position.set(0,.3,.05);hd.rotation.x=.25;sn.add(hd);
    add(SPH,M.snake,[0,0,.02],[.12,.09,.16],[0,0,0],hd);
    add(SPH,M.snakeB,[0,-.035,.05],[.09,.05,.12],[0,0,0],hd);
    for(const k of [-1,1]){add(SPH,M.eye,[k*.075,.035,.07],[.026,.03,.026],[0,0,0],hd);add(SPH,M.white,[k*.08,.045,.088],[.008,.008,.008],[0,0,0],hd)}
    add(new THREE.ConeGeometry(.014,.14,8),M.red,[0,-.03,.2],[1,1,1],[Math.PI/2,0,0],hd)}
  { const pts=[];for(let i=0;i<=48;i++){const a=-Math.PI*.5+i/48*Math.PI*2*1.05;pts.push(V(Math.cos(a)*.66,1.5+.13*(1-Math.sin(a))*.5+.03*Math.sin(a*3),Math.sin(a)*-.5+.02))}
    pts.push(V(.72,1.72,.14),V(.84,2.02,.32),V(.88,2.3,.5));
    add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts,false,'centripetal'),180,.105,16),M.snake,[0,0,0],[1,1,1],[0,0,0],snakeG.shoulder);
    add(new THREE.ConeGeometry(.105,.3,16),M.snake,[pts[0].x-.12,pts[0].y,pts[0].z],[1,1,1],[0,0,Math.PI/2],snakeG.shoulder);
    hood(snakeG.shoulder,[.88,2.58,.55],[0,-.28,.06]) }
  { const pts=[];for(let i=0;i<=64;i++){const u=i/64,a=Math.PI*.5+u*Math.PI*2*1.62;pts.push(V(Math.cos(a)*.42,1.72+u*.26+.02*Math.sin(a*2),Math.sin(a)*-.4+.02))}
    pts.push(V(.55,2.08,.26),V(.78,2.28,.42),V(.88,2.46,.52));
    add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts,false,'centripetal'),220,.1,16),M.snake,[0,0,0],[1,1,1],[0,0,0],snakeG.neck);
    hood(snakeG.neck,[.88,2.74,.57],[0,-.28,.06]) }
  // arms
  const arms=[[limb(.17,A,g),limb(.15,A,g)],[limb(.17,A,g),limb(.15,A,g)]],hands=[add(SPH,A,[0,0,0],[.17,.15,.12],[0,0,0],g),add(SPH,A,[0,0,0],[.17,.15,.12],[0,0,0],g)];
  const bangles=[add(new THREE.TorusGeometry(.17,.035,8,24),M.bead,[0,0,0],[1,1,1],[0,0,0],g),add(new THREE.TorusGeometry(.17,.035,8,24),M.bead,[0,0,0],[1,1,1],[0,0,0],g)];
  const sh=[V(-.56,1.42,0),V(.56,1.42,0)];
  const P={rest:[[V(-.95,1.0,.25),V(-.92,.66,.72)],[V(.95,1.0,.25),V(.92,.66,.72)]],
    bless:[[V(-1.0,1.02,.45),V(-.98,1.66,.66)],[V(.95,1.0,.25),V(.92,.66,.72)]],
    cup:[[V(-.8,1.02,.5),V(-.14,1.3,.95)],[V(.8,1.02,.5),V(.14,1.3,.95)]],
    drink:[[V(-.72,1.5,.75),V(-.12,2.18,1.05)],[V(.72,1.5,.75),V(.12,2.18,1.05)]],
    med:[[V(-.88,1.0,.32),V(-.17,.86,.8)],[V(.88,1.0,.32),V(.17,.9,.82)]],
    point:[[V(-1.05,1.55,.35),V(-1.6,1.85,.75)],[V(.95,1.05,.35),V(.95,.85,.85)]],
    hold:[[V(-.95,1.0,.25),V(-.92,.66,.72)],[V(.95,1.05,.35),V(.95,.85,.85)]],
    raise:[[V(-.95,1.0,.25),V(-.92,.66,.72)],[V(1.0,1.8,.3),V(.95,2.5,.55)]],
    blessH:[[V(-1.0,1.02,.45),V(-.98,1.66,.66)],[V(.95,1.05,.35),V(.95,.85,.85)]]};
  const s={g,f,throat,hy,hands,setStand(b){seat.visible=!b;stand.visible=b;this.stand=b},
    setSnake(m){snakeG.shoulder.visible=m!=='neck';snakeG.neck.visible=m==='neck';s.snake=m},
    pose(a,b='rest',p=0){const ib=x=>x==='bless'||x==='blessH';const wb=(ib(a)?1-p:0)+(ib(b)?p:0);hands[0].scale.set(lerp(.17,.16,wb),lerp(.15,.22,wb),lerp(.12,.075,wb));hands[0].rotation.set(lerp(0,-.15,wb),0,lerp(0,.12,wb));
      for(let i=0;i<2;i++){const e=vl(P[a][i][0],P[b][i][0],p),h=vl(P[a][i][1],P[b][i][1],p);arms[i][0].set(sh[i],e);arms[i][1].set(e,h);hands[i].position.copy(h);
      bangles[i].position.copy(vl(e,h,.78));bangles[i].quaternion.setFromUnitVectors(V(0,0,1),h.clone().sub(e).normalize())}},
    throatState(k,flick=0){ // k: 0 skin, 1 poison, 2 blue (fractional blends)
      const c0=new THREE.Color('#c3cff0'),c1=new THREE.Color('#5b2f8a'),c2=new THREE.Color('#1d46c9');
      const col=k<=1?c0.clone().lerp(c1,k):c1.clone().lerp(c2,k-1);throatMat.color.copy(col);
      const e=k<=1?new THREE.Color('#2a0a45').multiplyScalar(k*(.8+flick)):new THREE.Color('#1238b8').multiplyScalar(lerp(.15,.45,k-1)*(1+flick));throatMat.emissive.copy(e)}};
  s.pose('rest');f.set(1);return s}

// ---------------- props
function trident(){const g=new THREE.Group();
  add(new THREE.CylinderGeometry(.06,.06,4.4,16),M.gold,[0,2.2,0],[1,1,1],[0,0,0],g);
  add(new THREE.TorusGeometry(.36,.065,12,32,Math.PI),M.gold,[0,4.42,0],[1,1,1],[0,0,Math.PI],g);
  add(new THREE.CylinderGeometry(.065,.065,.55,16),M.gold,[0,4.6,0],[1,1,1],[0,0,0],g);
  for(const x of [-.36,0,.36])add(new THREE.ConeGeometry(.12,.42,16),M.gold,[x,x?4.6:4.98,0],[1,1,.55],[0,0,0],g);
  add(new THREE.ConeGeometry(.2,.26,24),M.drum,[0,3.86,0],[1,1,1],[0,0,0],g);add(new THREE.ConeGeometry(.2,.26,24),M.drum,[0,3.62,0],[1,1,1],[Math.PI,0,0],g);
  add(new THREE.TorusGeometry(.2,.03,8,24),M.gold,[0,3.98,0],[1,1,1],[Math.PI/2,0,0],g);add(new THREE.TorusGeometry(.2,.03,8,24),M.gold,[0,3.5,0],[1,1,1],[Math.PI/2,0,0],g);
  return g}
function cloud(parent,p,s){const g=new THREE.Group();g.position.set(...p);g.scale.setScalar(s);parent.add(g);
  [[0,0,0,1],[.9,-.15,.1,.75],[-.9,-.2,0,.7],[.4,.45,0,.7],[-.35,.35,.1,.6],[1.6,-.3,0,.5],[-1.55,-.3,0,.45]].forEach(([x,y,z,r])=>add(SPH,M.cloud,[x,y,z],[r,r*.85,r*.8],[0,0,0],g));return g}
function mountain(parent,p,h,r,mat,seed){const pts=[];for(let i=0;i<=24;i++){const k=i/24;pts.push(new THREE.Vector2(r*Math.pow(1-k,1.15)*(1+.04*Math.sin(k*19+seed))+.02,h*k))}
  const geo=new THREE.LatheGeometry(pts,40),pp=geo.attributes.position,v=new THREE.Vector3();
  for(let i=0;i<pp.count;i++){v.fromBufferAttribute(pp,i);const a=Math.atan2(v.z,v.x),n=1+.08*Math.sin(a*5+seed)+.05*Math.sin(a*11+v.y);pp.setXYZ(i,v.x*n,v.y,v.z*n)}geo.computeVertexNormals();
  const m=add(geo,mat,p,[1,1,1],[0,seed,0],parent);
  const cap=geo.clone(),cp=cap.attributes.position;for(let i=0;i<cp.count;i++){v.fromBufferAttribute(cp,i);const k=v.y/h;const sc=k<.6?0.001:1.035;if(k<.6)v.set(v.x*.05,h*.6+ (k*h*.0),v.z*.05);else v.set(v.x*sc,v.y+.02,v.z*sc);cp.setXYZ(i,v.x,v.y,v.z)}cap.computeVertexNormals();
  add(cap,M.snow,p,[1,1,1],[0,seed,0],parent);return m}

// ================= KAILASH SET
const kail=new THREE.Group();scene.add(kail);
{ const gg=new THREE.PlaneGeometry(120,120,90,90),gp=gg.attributes.position;
  for(let i=0;i<gp.count;i++){const x=gp.getX(i),y=gp.getY(i);gp.setZ(i,.35*Math.sin(x*.35)*Math.sin(y*.4)+.2*Math.sin(x*.9+y*.7))}gg.computeVertexNormals();
  add(gg,M.snow,[0,0,0],[1,1,1],[-Math.PI/2,0,0],kail);
  add(lumpy(3,.1,2),M.rock,[0,.25,0],[2.2,1.1,1.9],[0,.3,0],kail);
  add(lumpy(3,.12,5),M.rock,[1.6,.1,.7],[.9,.6,.8],[0,0,0],kail);add(lumpy(3,.12,7),M.rock,[-1.7,.05,.5],[1.0,.55,.9],[0,0,0],kail);
  add(lumpy(3,.06,9),M.tiger,[0,1.16,.1],[1.6,.13,1.3],[0,0,0],kail);
  for(const [x,z,s] of [[-5,-3,1.8],[4.5,-4,2.2],[-3,4,1.0],[6,2,1.4],[-7,1,1.6]])add(lumpy(2,.15,x),M.snow,[x,-.2,z],[s*1.4,s*.7,s],[0,x,0],kail);
  mountain(kail,[0,0,-34],22,13,M.mtn,1);mountain(kail,[-14,0,-26],13,8,M.mtn2,2);mountain(kail,[13,0,-24],15,8,M.mtn2,3);
  mountain(kail,[-24,0,-40],18,11,M.mtn,4);mountain(kail,[24,0,-38],19,11,M.mtn,5);
  add(SPH,M.moon,[-9,17,-45],[3,3,.6],[0,0,0],kail);
}
const shiva=makeShiva();shiva.setSnake(new URLSearchParams(location.search).get('snake')||(window.TL&&window.TL.snake)||'shoulder');window.setSnake=m=>shiva.setSnake(m);shiva.g.position.set(0,1.28,0);kail.add(shiva.g);
const tri=trident();tri.position.set(1.55,.75,-.6);tri.rotation.z=-.06;kail.add(tri);
const halo=(()=>{const c=document.createElement('canvas');c.width=c.height=256;const x=c.getContext('2d'),gr=x.createRadialGradient(128,128,0,128,128,128);
  gr.addColorStop(0,'rgba(255,236,180,.95)');gr.addColorStop(.62,'rgba(255,218,140,.85)');gr.addColorStop(.7,'rgba(255,214,130,.55)');gr.addColorStop(1,'rgba(255,214,130,0)');x.fillStyle=gr;x.fillRect(0,0,256,256);
  const m=new THREE.Mesh(new THREE.PlaneGeometry(1,1),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(c),transparent:true,depthWrite:false,fog:false}));m.position.set(0,1.28+2.75,-1.3);m.scale.setScalar(3.8);kail.add(m);return m})();
const clouds=[cloud(kail,[-6,6.5,-9],1.3),cloud(kail,[6.5,8,-12],1.6),cloud(kail,[-3,10,-16],1.2),cloud(kail,[9,4,-6],1.0)];

// ================= OCEAN SET
const ocean=new THREE.Group();scene.add(ocean);ocean.visible=false;
const seaG=new THREE.PlaneGeometry(80,80,150,150);seaG.rotateX(-Math.PI/2);
const sea0=seaG.attributes.position.array.slice();seaG.setAttribute('color',new THREE.BufferAttribute(new Float32Array(seaG.attributes.position.count*3),3));
const sea=add(seaG,M.milk,[0,0,0],[1,1,1],[0,0,0],ocean);sea.castShadow=false;
const mandara=new THREE.Group();mandara.scale.setScalar(.72);ocean.add(mandara);
{ const pts=[];for(let i=0;i<=30;i++){const k=i/30;pts.push(new THREE.Vector2(1.35*(1-k*.55)*Math.sqrt(cl(1-Math.pow(cl((k-.72)/.28),2)))*(1+.03*Math.sin(k*23))+.005,-1+k*7.6))}
  const geo=new THREE.LatheGeometry(pts,36);add(geo,M.mandara,[0,0,0],[1,1,1],[0,0,0],mandara);
  for(let i=0;i<18;i++){const y=rnd(i)*5.6,a=rnd(i+40)*6.28,r=(1.35*(1-((y+1)/7.6)*.55))+.05;const tr=add(lumpy(2,.12,i),i%3?M.tree:M.tree2,[Math.cos(a)*r,y,Math.sin(a)*r],[.32+rnd(i+9)*.2,.3+rnd(i+3)*.2,.32],[0,a,0],mandara)}
  add(SPH,M.shell,[0,-.3,0],[1.9,.6,1.75],[0,0,0],ocean);
  for(let i=0;i<9;i++){const a=i*.7;add(SPH,clay('#557c3e'),[Math.cos(a)*1.4,.05,Math.sin(a)*1.25],[.45,.18,.45],[0,0,0],ocean)}
}
const isl=[];for(const [x,z] of [[-1.5,3.4],[-1.5,4.9],[-1.6,6.3],[1.5,-3.4],[1.5,-4.9],[1.6,-6.3]]){isl.push(add(lumpy(2,.12,x*z),M.rock,[x,-.15,z],[.75,.42,.68],[0,x,0],ocean))}
const ropeMat=M.snake;let rope=null;
const sHead=new THREE.Group();ocean.add(sHead);
add(SPH,M.snake,[0,0,0],[.3,.24,.42],[0,0,0],sHead);add(SPH,M.snake,[0,.1,-.25],[.6,.5,.12],[.25,0,0],sHead);add(SPH,M.snakeB,[0,.05,-.18],[.42,.36,.1],[.25,0,0],sHead);
for(const s of [-1,1]){add(SPH,M.eye,[s*.16,.1,.25],[.05,.05,.05],[0,0,0],sHead)}add(new THREE.ConeGeometry(.03,.25,8),M.red,[0,-.05,.5],[1,1,1],[Math.PI/2,0,0],sHead);
// poison puffs
const puffGeo=[lumpy(4,.09,1),lumpy(4,.1,4),lumpy(4,.08,7)];const puffs=[];
for(let i=0;i<34;i++){const m=add(puffGeo[i%3],i%4===3?M.poisonG:i%2?M.poisonP:M.poisonD,[0,0,0],[1,1,1],[0,0,0],scene);m.visible=false;m.castShadow=false;puffs.push(m)}
const orb=add(lumpy(4,.1,3),M.poisonP,[0,0,0],[1,1,1],[0,0,0],kail);orb.visible=false;
const orbBits=[];for(let i=0;i<7;i++){const m=add(puffGeo[i%3],M.poisonG,[0,0,0],[1,1,1],[0,0,0],orb);orbBits.push(m)}

// ================= cast: 3 devas + 3 asuras
const cast=[
 makeChar({skin:'#f3cfa6',top:'#ffd45c',bottom:'#fbf3e2',kind:'deva',seed:0}),makeChar({skin:'#c98f62',top:'#ffe08a',bottom:'#fbf3e2',kind:'deva',seed:1}),makeChar({skin:'#e3b089',top:'#ffc93e',bottom:'#fbf3e2',kind:'deva',seed:2}),
 makeChar({skin:'#d9a37a',top:'#9b3d77',bottom:'#4b3a6b',kind:'asura',seed:0}),makeChar({skin:'#a76f48',top:'#7e3a8f',bottom:'#3e3460',kind:'asura',seed:1}),makeChar({skin:'#f0c39a',top:'#a2405f',bottom:'#4b3a6b',kind:'asura',seed:2})];
cast.forEach(c=>scene.add(c.root));
const sages=[makeChar({skin:'#e7b88e',top:'#f2a03c',bottom:'#fbf3e2',kind:'sage',seed:1}),makeChar({skin:'#c48a5e',top:'#f6b65a',bottom:'#fbf3e2',kind:'sage',seed:2}),makeChar({skin:'#f1c9a2',top:'#ec9431',bottom:'#fbf3e2',kind:'sage',seed:3})];
sages.forEach(c=>scene.add(c.root));

// ================= camera + post
const cam=new THREE.PerspectiveCamera(30,W/H,.1,200);
const comp=new EffectComposer(renderer);comp.addPass(new RenderPass(scene,cam));
const bokeh=new BokehPass(scene,cam,{focus:10,aperture:.00012,maxblur:.007});comp.addPass(bokeh);
const grade=new ShaderPass({uniforms:{tDiffuse:{value:null},tint:{value:new THREE.Color(1,1,1)},vig:{value:.32}},
 vertexShader:`varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
 fragmentShader:`uniform sampler2D tDiffuse;uniform vec3 tint;uniform float vig;varying vec2 vUv;void main(){vec4 c=texture2D(tDiffuse,vUv);vec2 d=(vUv-.5)*vec2(1.,1.25);float v=1.-vig*smoothstep(.25,.85,length(d));c.rgb*=tint*v;gl_FragColor=c;}`});
comp.addPass(grade);comp.addPass(new OutputPass());
