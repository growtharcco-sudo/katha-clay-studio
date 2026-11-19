// ================= Ganesha story characters
const GM={pSkin:clay('#f6d3b2'),gSkin:clay('#ef8a6c'),sari:clay('#d42f4a'),sariD:clay('#a81e38'),gold:M.gold,dhoti:clay('#ffc23a'),sash:clay('#d8382f'),
  ear:clay('#f6a58f'),tusk:clay('#fbf3e0'),modak:clay('#fff1d6'),jasmine:clay('#ffffff'),staff:clay('#8a5a33'),eleph:clay('#a9a5c8'),elephIn:clay('#d9b3c2')};

function makeParvati(){
  const root=new THREE.Group(),m=new THREE.Group();root.add(m);const S=GM.pSkin;
  // sari: flared skirt with gold border and pleats
  add(new THREE.CylinderGeometry(.42,.78,1.15,40),GM.sari,[0,.6,0],[1,1,.9],[0,0,0],m);
  add(new THREE.TorusGeometry(.77,.05,10,48),GM.gold,[0,.05,0],[1,1,.9],[Math.PI/2,0,0],m);
  for(let i=0;i<5;i++)add(new THREE.CapsuleGeometry(.035,.7,6,10),GM.sariD,[-.12+i*.06,.55,.6-.02*Math.abs(i-2)],[1,1,1],[.18,0,(i-2)*.05],m);
  for(const s of [-1,1])add(SPH,S,[s*.17,.04,.42],[.12,.07,.16],[0,0,0],m);
  // blouse + waist
  add(new THREE.CapsuleGeometry(.36,.3,10,28),GM.sariD,[0,1.38,0],[1,1,.85],[0,0,0],m);
  add(new THREE.CylinderGeometry(.34,.4,.16,32),S,[0,1.12,0],[1,1,.85],[0,0,0],m);
  // pallu: drape from right hip over left shoulder
  const pc=new THREE.CatmullRomCurve3([V(-.42,.9,.28),V(-.1,1.25,.4),V(.25,1.6,.3),V(.36,1.78,0),V(.3,1.5,-.35),V(.2,.8,-.45)]);
  add(new THREE.TubeGeometry(pc,60,.11,12),GM.sari,[0,0,0],[1,1,1],[0,0,0],m);
  add(new THREE.TorusGeometry(.24,.035,10,32,Math.PI),GM.gold,[0,1.62,.16],[1,.8,1],[Math.PI/2+.3,0,0],m);
  // head
  const hy=2.25,hr=.62;add(SPH,S,[0,hy,0],[hr,hr*.96,hr*.95],[0,0,0],m);
  add(new THREE.SphereGeometry(1,40,20,0,Math.PI*2,0,1.85),M.hair,[0,hy+.03,-.05],[hr*1.06,hr,hr*1.03],[-.78,0,0],m);
  add(SPH,M.hair,[0,hy+.25,-.62],[.34,.32,.3],[0,0,0],m);
  for(const sd of [-1,1]){const l=limb(.16,M.hair,m);l.set(V(sd*.5,hy+.05,-.2),V(sd*.48,hy-.75,-.18));const l2=limb(.13,M.hair,m);l2.set(V(sd*.38,hy+.1,-.42),V(sd*.36,hy-.9,-.38))}
  for(let i=0;i<6;i++)add(SPH,M.hair,[0,hy-.2-i*.17,-.7+i*.015],[.13-i*.008,.11,.12],[0,0,0],m);
  add(SPH,M.red,[0,hy-1.25,-.62],[.07,.07,.07],[0,0,0],m);
  add(new THREE.TorusGeometry(.42,.045,10,40,Math.PI),GM.gold,[0,hy+.38,-.06],[1,.55,1],[-.55,0,0],m);
  for(let i=0;i<5;i++){const a=(i-2)*.42;add(new THREE.ConeGeometry(.045,.13,10),GM.gold,[Math.sin(a)*.4,hy+.55+(i===2?.04:0),Math.cos(a)*.18-.12],[1,1,1],[-.55,0,0],m)}
  for(let i=0;i<14;i++){const a=i/14*Math.PI*2;add(SPH,GM.jasmine,[Math.cos(a)*.33,hy+.25+Math.sin(a)*.31,-.62-.02],[.05,.05,.05],[0,0,0],m)}
  for(const s of [-1,1])add(SPH,S,[s*hr*.97,hy-.05,.02],[.09,.13,.07],[0,0,0],m);
  for(const s of [-1,1]){add(new THREE.ConeGeometry(.07,.12,16,1,true),GM.gold,[s*hr*.99,hy-.25,.04],[1,1,1],[0,0,0],m);add(SPH,GM.gold,[s*hr*.99,hy-.17,.04],[.035,.035,.035],[0,0,0],m)}
  const f=face(m,{y:hy,r:hr,eyeX:.32,eyeY:-.06,eyeS:.95});
  f.smile.material=clay('#c8283c');
  add(SPH,M.red,[0,hy+.15,hr*.98],[.035,.035,.02],[0,0,0],m);                    // bindi
  add(new THREE.CapsuleGeometry(.018,.22,6,10),M.red,[0,hy+.56,hr*.55],[1,1,1],[-.9,0,0],m); // sindoor in the parting
  add(new THREE.CapsuleGeometry(.012,.3,6,10),GM.gold,[0,hy+.48,hr*.72],[1,1,1],[-.75,0,0],m); // maang tikka chain
  add(SPH,GM.gold,[0,hy+.33,hr*.93],[.05,.06,.03],[0,0,0],m);add(SPH,M.red,[0,hy+.33,hr*.96],[.025,.03,.02],[0,0,0],m);
  // arms
  const arms=[[limb(.11,GM.sariD,m),limb(.1,S,m)],[limb(.11,GM.sariD,m),limb(.1,S,m)]],hands=[add(SPH,S,[0,0,0],[.13,.16,.07],[0,0,0],m),add(SPH,S,[0,0,0],[.12,.12,.1],[0,0,0],m)];
  const bang=[[],[]];for(let i=0;i<2;i++)for(let k=0;k<3;k++)bang[i].push(add(new THREE.TorusGeometry(.105,.022,8,20),k%2?M.red:GM.gold,[0,0,0],[1,1,1],[0,0,0],m));
  const sh=[V(-.38,1.55,0),V(.38,1.55,0)];
  const P={rest:[[V(-.55,1.15,.1),V(-.5,.8,.22)],[V(.55,1.15,.1),V(.5,.8,.22)]],
    bless:[[V(-.62,1.2,.25),V(-.6,1.62,.42)],[V(.55,1.15,.1),V(.5,.8,.22)]],
    grief:[[V(-.4,1.4,.45),V(-.15,1.95,.6)],[V(.4,1.4,.45),V(.15,1.95,.6)]],
    reach:[[V(-.55,1.4,.4),V(-.6,1.5,.85)],[V(.55,1.4,.4),V(.6,1.5,.85)]],
    fury:[[V(-.62,1.2,.15),V(-.84,.86,.32)],[V(.62,1.2,.15),V(.84,.86,.32)]],
    point:[[V(-.62,1.45,.35),V(-.82,1.62,.86)],[V(.55,1.15,.1),V(.5,.8,.22)]],
    namaste:[[V(-.5,1.2,.35),V(-.07,1.5,.5)],[V(.5,1.2,.35),V(.07,1.5,.5)]]};
  const o={root,m,f,pose(a,b='rest',p=0){for(let i=0;i<2;i++){const e=vl(P[a][i][0],P[b][i][0],p),h=vl(P[a][i][1],P[b][i][1],p);arms[i][0].set(sh[i],e);arms[i][1].set(e,h);hands[i].position.copy(h);
      bang[i].forEach((g,k)=>{g.position.copy(vl(e,h,.72+k*.07));g.quaternion.setFromUnitVectors(V(0,0,1),h.clone().sub(e).normalize())})}}};
  o.pose('rest');f.set(1);return o}

function makeBoy(){ // the boy Parvati shaped, before the elephant head
  const root=new THREE.Group(),m=new THREE.Group();root.add(m);const S=GM.pSkin;
  for(const s of [-1,1]){add(new THREE.CapsuleGeometry(.13,.2,8,16),S,[s*.15,.22,0],[1,1,1],[0,0,0],m);add(SPH,S,[s*.16,.06,.1],[.13,.08,.18],[0,0,0],m)}
  add(new THREE.CylinderGeometry(.34,.42,.4,32),GM.dhoti,[0,.5,0],[1,1,.9],[0,0,0],m);
  add(new THREE.CapsuleGeometry(.35,.28,10,28),S,[0,.92,0],[1,1,.88],[0,0,0],m);
  add(new THREE.TorusGeometry(.35,.06,10,32),GM.sash,[0,.7,0],[1,1,.9],[Math.PI/2,0,0],m);
  add(new THREE.TorusGeometry(.22,.035,8,28,Math.PI),GM.gold,[0,1.17,.03],[1,.8,1],[Math.PI/2+.3,0,0],m);
  const hy=1.72,hr=.56;add(SPH,S,[0,hy,0],[hr,hr*.96,hr*.95],[0,0,0],m);
  add(new THREE.SphereGeometry(1,32,16,0,Math.PI*2,0,1.55),M.hair,[0,hy+.03,-.04],[hr*1.05,hr,hr*1.02],[-.6,0,0],m);
  add(SPH,M.hair,[0,hy+.58,-.1],[.17,.16,.17],[0,0,0],m);
  for(const s of [-1,1])add(SPH,S,[s*hr*.98,hy-.04,0],[.09,.12,.07],[0,0,0],m);
  const f=face(m,{y:hy,r:hr,eyeX:.34,eyeY:-.02});add(SPH,M.red,[0,hy+.17,hr*.97],[.03,.045,.02],[0,0,0],m);
  const arms=[limb(.1,S,m),limb(.1,S,m)],hands=[add(SPH,S,[0,0,0],[.12,.12,.12],[0,0,0],m),add(SPH,S,[0,0,0],[.12,.12,.12],[0,0,0],m)];
  const staff=new THREE.Group();m.add(staff);add(new THREE.CylinderGeometry(.045,.045,2.0,12),GM.staff,[0,0,0],[1,1,1],[0,0,0],staff);
  add(SPH,GM.gold,[0,1.0,0],[.07,.07,.07],[0,0,0],staff);add(SPH,GM.gold,[0,-1.0,0],[.05,.05,.05],[0,0,0],staff);
  const sh=[V(-.36,1.08,0),V(.36,1.08,0)];
  const o={root,m,f,staff,setHands(l,r){[l,r].forEach((h,i)=>{const p=sh[i],d=h.clone().sub(p);if(d.length()>.62)d.setLength(.62);const q=p.clone().add(d);arms[i].set(p,q);hands[i].position.copy(q)})}};
  o.setHands(V(-.42,.72,.15),V(.5,1.0,.3));staff.position.set(.52,1.02,.32);f.set(1,'calm','smile');o.hy=hy;return o}

function makeGanesha(){ // child Ganesha: elephant head, red complexion, right tusk broken, trunk curls to his left
  const root=new THREE.Group(),m=new THREE.Group();root.add(m);const S=GM.gSkin;
  for(const s of [-1,1]){add(new THREE.CapsuleGeometry(.15,.16,8,16),S,[s*.17,.22,0],[1,1,1],[0,0,0],m);add(SPH,S,[s*.18,.06,.1],[.14,.08,.19],[0,0,0],m)}
  add(new THREE.CylinderGeometry(.4,.46,.36,32),GM.dhoti,[0,.48,0],[1,1,.92],[0,0,0],m);
  add(SPH,S,[0,.95,.05],[.5,.5,.47],[0,0,0],m);                                   // round belly
  add(new THREE.TorusGeometry(.47,.06,10,40),GM.sash,[0,.68,.02],[1,1,.95],[Math.PI/2,0,0],m);
  add(new THREE.TorusGeometry(.3,.04,8,28,Math.PI),GM.gold,[0,1.33,.06],[1,.8,1],[Math.PI/2+.35,0,0],m);
  for(let i=0;i<9;i++){const a=-.9+i*.225;add(SPH,GM.gold,[Math.sin(a)*.3,1.36-Math.cos(a)*.22+.05,.24+Math.cos(a)*.08],[.035,.035,.035],[0,0,0],m)}
  // elephant head
  const hy=1.86,H=new THREE.Group();H.position.set(0,hy,0);m.add(H);
  add(SPH,S,[0,0,0],[.6,.56,.55],[0,0,0],H);
  add(SPH,S,[0,-.12,.36],[.3,.3,.28],[0,0,0],H);                                   // muzzle
  for(const s of [-1,1]){const e=new THREE.Group();e.position.set(s*.56,-.02,-.08);e.rotation.set(0,s*.35,s*-.15);H.add(e);
    add(SPH,S,[s*.12,0,0],[.36,.42,.06],[0,0,0],e);add(SPH,GM.ear,[s*.12,-.02,.03],[.26,.31,.04],[0,0,0],e)}
  const tc=new THREE.CatmullRomCurve3([V(0,-.12,.5),V(0,-.42,.56),V(.06,-.7,.48),V(.22,-.86,.42),V(.34,-.8,.48),V(.32,-.68,.56)]);
  const tg=new THREE.TubeGeometry(tc,80,.11,16),tp=tg.attributes.position,v=new THREE.Vector3();  // taper the trunk
  for(let i=0;i<tp.count;i++){v.fromBufferAttribute(tp,i);const seg=Math.floor(i/17)/80,c=tc.getPoint(seg),k=lerp(1,.55,seg);tp.setXYZ(i,c.x+(v.x-c.x)*k,c.y+(v.y-c.y)*k,c.z+(v.z-c.z)*k)}tg.computeVertexNormals();
  add(tg,S,[0,0,0],[1,1,1],[0,0,0],H);
  for(let i=0;i<4;i++){const p=tc.getPoint(.15+i*.12);add(new THREE.TorusGeometry(.085-i*.008,.012,6,20),clay('#d9725a'),[p.x,p.y,p.z],[1,1,1],[Math.PI/2-.2,0,0],H)}
  add(new THREE.ConeGeometry(.055,.3,16),GM.tusk,[.2,-.28,.5],[1,1,1],[1.9,0,.35],H);   // his left tusk: whole
  add(new THREE.ConeGeometry(.055,.09,16),GM.tusk,[-.19,-.24,.47],[1,1,1],[1.9,0,-.35],H); // his right tusk: broken stub
  const f=face(H,{y:.08,r:.58,eyeX:.38,eyeY:0,eyeS:.75});f.smile.visible=false;f.smile.position.y=-10;f.oh.position.y=-10;
  add(new THREE.CapsuleGeometry(.025,.16,6,10),M.red,[0,.36,.5],[1,1,1],[-.5,0,0],H);  // tilak
  add(SPH,GM.gold,[0,.18,.53],[.03,.03,.02],[0,0,0],H);
  // crown (mukut)
  add(new THREE.CylinderGeometry(.3,.38,.22,32),GM.gold,[0,.52,-.04],[1,1,1],[-.15,0,0],H);
  add(new THREE.ConeGeometry(.3,.42,32),GM.gold,[0,.82,-.08],[1,1,1],[-.15,0,0],H);
  add(SPH,M.red,[0,.56,.3],[.06,.07,.04],[-.15,0,0],H);add(SPH,GM.gold,[0,1.06,-.12],[.06,.06,.06],[0,0,0],H);
  for(let i=0;i<7;i++){const a=(i-3)*.42;add(SPH,M.red,[Math.sin(a)*.34,.45,Math.cos(a)*.3-.04],[.03,.03,.03],[0,0,0],H)}
  // arms: right hand blessing (abhaya), left hand holds a modak
  const arms=[[limb(.13,S,m),limb(.12,S,m)],[limb(.13,S,m),limb(.12,S,m)]],hands=[add(SPH,S,[0,0,0],[.15,.2,.08],[0,0,0],m),add(SPH,S,[0,0,0],[.14,.13,.12],[0,0,0],m)];
  const sh=[V(-.46,1.28,0),V(.46,1.28,0)];arms[0][0].set(sh[0],V(-.72,.98,.25));arms[0][1].set(V(-.72,.98,.25),V(-.7,1.42,.42));hands[0].position.set(-.7,1.42,.42);
  arms[1][0].set(sh[1],V(.66,.95,.3));arms[1][1].set(V(.66,.95,.3),V(.52,.98,.62));hands[1].position.set(.52,.98,.62);
  const modak=new THREE.Group();modak.position.set(.5,1.12,.66);m.add(modak);add(new THREE.SphereGeometry(.13,24,16),GM.modak,[0,0,0],[1,.85,1],[0,0,0],modak);
  add(new THREE.ConeGeometry(.09,.14,24),GM.modak,[0,.15,0],[1,1,1],[0,0,0],modak);
  for(let i=0;i<8;i++){const a=i/8*6.28;add(new THREE.CapsuleGeometry(.012,.14,4,8),clay('#f2dcb6'),[Math.cos(a)*.105,.05,Math.sin(a)*.105],[1,1,1],[Math.sin(a)*.4,0,-Math.cos(a)*.4],modak)}
  for(const i of [0,1]){add(new THREE.TorusGeometry(.13,.03,8,20),GM.gold,[sh[i].x*1.3,1.05,.15],[1,1,1],[1.2,0,0],m)}
  f.set(1,'calm','smile');return {root,m,f,H}}

function makeElephant(){ // the single-tusked elephant the gods met in the north
  const root=new THREE.Group(),m=new THREE.Group();root.add(m);const E=GM.eleph;
  add(SPH,E,[0,1.25,0],[.95,.75,1.25],[0,0,0],m);
  for(const [x,z] of [[-.5,.7],[.5,.7],[-.5,-.7],[.5,-.7]]){add(new THREE.CapsuleGeometry(.24,.6,8,16),E,[x,.48,z],[1,1,1],[0,0,0],m);add(new THREE.CylinderGeometry(.26,.26,.06,20),clay('#d8d0e8'),[x,.04,z+.02],[1,1,1],[0,0,0],m)}
  const H=new THREE.Group();H.position.set(0,1.65,1.25);m.add(H);
  add(SPH,E,[0,0,0],[.55,.55,.5],[0,0,0],H);
  for(const s of [-1,1]){add(SPH,E,[s*.62,-.05,-.15],[.08,.5,.45],[0,s*.2,0],H);add(SPH,GM.elephIn,[s*.58,-.05,-.12],[.04,.38,.33],[0,s*.2,0],H)}
  const tc=new THREE.CatmullRomCurve3([V(0,-.1,.4),V(0,-.5,.62),V(0,-.95,.62),V(0,-1.25,.5),V(0,-1.3,.62)]);
  add(new THREE.TubeGeometry(tc,60,.14,16),E,[0,0,0],[1,1,1],[0,0,0],H);
  add(new THREE.ConeGeometry(.07,.55,16),GM.tusk,[.24,-.38,.42],[1,1,1],[1.4,0,.3],H);            // one tusk only
  for(const s of [-1,1]){add(SPH,M.eye,[s*.3,.12,.42],[.06,.07,.04],[0,s*.4,0],H);add(SPH,M.white,[s*.3+.02,.14,.455],[.018,.018,.01],[0,0,0],H)}
  add(new THREE.CapsuleGeometry(.04,.5,6,10),E,[0,1.15,-1.3],[1,1,1],[.4,0,0],m);
  return {root,m,H}}
