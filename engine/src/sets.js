// ================= sets and props (Parvati's home, the northern forest, effects)
const P_=makeParvati(),BOY=makeBoy(),G=makeGanesha(),EL=makeElephant();
[P_,BOY,G,EL].forEach(o=>kail.add(o.root));
const ganas=[makeChar({skin:'#e9b48a',top:'#f08a2a',bottom:'#fbf3e2',kind:'gana',seed:1}),makeChar({skin:'#c08a63',top:'#c5462f',bottom:'#fbf3e2',kind:'gana',seed:2}),makeChar({skin:'#f2c9a0',top:'#e8a23a',bottom:'#fbf3e2',kind:'gana',seed:3})];
ganas.forEach(c=>kail.add(c.root));

cast.forEach(c=>{scene.remove(c.root);kail.add(c.root)});

// ---- ground height (matches the Kailash snow plane) and the courtyard in front of Parvati's home
const HX=-14,HZ=2.2,CR=4.8,Y0=.62;
function gY(x,z){const dx=x-HX,dz=z-HZ;if(dx*dx+dz*dz<CR*CR)return Y0;return .35*Math.sin(.35*x)*Math.sin(-.4*z)+.2*Math.sin(.9*x-.7*z)}
function put(o,x,z,yaw=0,s=1){o.root.position.set(x,gY(x,z)+.03,z);o.root.rotation.set(0,yaw,0);o.root.scale.setScalar(s);o.root.visible=true}

// ---- Parvati's home: wall, arched wooden door, pillars, toran, diyas
const home=new THREE.Group();kail.add(home);
const HM={wall:clay('#f4e3c6'),wall2:clay('#e9cfa8'),wood:clay('#b5703f'),woodD:clay('#8a4f2a'),dark:clay('#4a3446'),stone:clay('#e6dccd'),leaf:clay('#5fa85a'),mari:clay('#ff9d1c'),flame:new THREE.MeshBasicMaterial({color:'#ffd45a',fog:false})};
{ add(new THREE.CylinderGeometry(CR,CR+.15,1.4,64),HM.stone,[HX,Y0-.7,HZ],[1,1,1],[0,0,0],home);
  add(new THREE.TorusGeometry(CR+.02,.08,10,80),HM.wall2,[HX,Y0,HZ],[1,1,1],[Math.PI/2,0,0],home);
  add(new RoundedBoxGeometry(7.4,3.8,1.2,4,.18),HM.wall,[HX,Y0+1.9,-.6],[1,1,1],[0,0,0],home);
  add(new RoundedBoxGeometry(8.0,.55,1.9,4,.25),M.snow,[HX,Y0+3.9,-.55],[1,1,1],[0,0,0],home);
  add(new RoundedBoxGeometry(7.6,.3,1.5,4,.12),HM.wall2,[HX,Y0+.15,-.45],[1,1,1],[0,0,0],home);
  // dome on top
  add(new THREE.SphereGeometry(1.2,32,16,0,Math.PI*2,0,Math.PI/2),M.snow,[HX,Y0+4.1,-.6],[1,.9,1],[0,0,0],home);
  add(new THREE.ConeGeometry(.12,.5,16),M.gold,[HX,Y0+5.4,-.6],[1,1,1],[0,0,0],home);
  // door recess + arch
  add(new THREE.BoxGeometry(1.9,2.5,.2),HM.dark,[HX,Y0+1.25,.02],[1,1,1],[0,0,0],home);
  add(new THREE.CylinderGeometry(.95,.95,.2,40,1,false,-Math.PI/2,Math.PI),HM.dark,[HX,Y0+2.5,.02],[1,1,1],[Math.PI/2,0,0],home);
  add(new THREE.TorusGeometry(1.05,.11,12,48,Math.PI),M.gold,[HX,Y0+2.5,.1],[1,1,1],[0,0,0],home);
  for(const s of [-1,1])add(new THREE.BoxGeometry(.2,2.5,.25),M.gold,[HX+s*1.05,Y0+1.25,.1],[1,1,1],[0,0,0],home);
  // pillars
  for(const s of [-1,1]){const x=HX+s*1.9;add(new THREE.CylinderGeometry(.22,.24,3.1,24),HM.wall2,[x,Y0+1.75,.35],[1,1,1],[0,0,0],home);
    add(new THREE.CylinderGeometry(.34,.34,.22,24),M.gold,[x,Y0+.2,.35],[1,1,1],[0,0,0],home);add(new THREE.CylinderGeometry(.36,.26,.3,24),M.gold,[x,Y0+3.4,.35],[1,1,1],[0,0,0],home)}
  // little arched windows
  for(const s of [-1,1]){const x=HX+s*2.9;add(new THREE.BoxGeometry(.7,.8,.1),HM.dark,[x,Y0+1.9,.02],[1,1,1],[0,0,0],home);
    add(new THREE.CylinderGeometry(.35,.35,.1,24,1,false,-Math.PI/2,Math.PI),HM.dark,[x,Y0+2.3,.02],[1,1,1],[Math.PI/2,0,0],home);
    add(new THREE.TorusGeometry(.42,.06,8,24,Math.PI),M.gold,[x,Y0+2.3,.07],[1,1,1],[0,0,0],home)}
  // toran: mango leaves and marigolds across the door
  for(let i=0;i<11;i++){const u=i/10,x=HX+lerp(-1.3,1.3,u),y=Y0+3.35-Math.sin(u*Math.PI)*.18;
    add(SPH,i%2?HM.mari:HM.leaf,[x,y-(i%2?0:.16),.5],i%2?[.1,.1,.1]:[.07,.17,.03],[0,0,0],home)}
}
// door leaves (hinged at the outer edges)
const doors=[-1,1].map(s=>{const g=new THREE.Group();g.position.set(HX+s*.9,Y0,.12);home.add(g);
  add(new THREE.BoxGeometry(.88,2.45,.12),HM.wood,[-s*.44,1.23,0],[1,1,1],[0,0,0],g);
  for(let k=0;k<3;k++)add(new THREE.BoxGeometry(.7,.06,.04),HM.woodD,[-s*.44,.5+k*.75,.07],[1,1,1],[0,0,0],g);
  for(let k=0;k<6;k++)add(SPH,M.gold,[-s*(.15+(k%2)*.55),.3+Math.floor(k/2)*.85,.08],[.04,.04,.03],[0,0,0],g);
  add(new THREE.TorusGeometry(.07,.02,8,16),M.gold,[-s*.78,1.25,.09],[1,1,1],[0,0,0],g);return g});
// diyas on the step
function diya(parent,x,y,z){const g=new THREE.Group();g.position.set(x,y,z);parent.add(g);
  add(new THREE.SphereGeometry(.16,24,12,0,Math.PI*2,Math.PI/2,Math.PI/2),clay('#c9622f'),[0,.16,0],[1,.6,1],[0,0,0],g);
  const fl=add(new THREE.ConeGeometry(.045,.16,12),HM.flame,[0,.25,0],[1,1,1],[0,0,0],g);fl.castShadow=false;g.userData.fl=fl;return g}
const homeDiyas=[diya(home,HX-1.45,Y0,1.0),diya(home,HX+1.45,Y0,1.0)];
const diyaL=new THREE.PointLight('#ffb347',0,6,2);kail.add(diyaL);

// ---- the north: snowy pine forest
const forest=new THREE.Group();kail.add(forest);const FX=16,FZ=-1;
function pine(x,z,s){const y=gY(x,z),g=new THREE.Group();g.position.set(x,y,z);g.scale.setScalar(s);forest.add(g);
  add(new THREE.CylinderGeometry(.14,.18,.8,12),clay('#7a5236'),[0,.4,0],[1,1,1],[0,0,0],g);
  for(let k=0;k<3;k++){add(new THREE.ConeGeometry(1.0-k*.24,1.1,24),clay(k%2?'#4f9466':'#5aa271'),[0,1.0+k*.62,0],[1,1,1],[0,0,0],g);
    add(new THREE.ConeGeometry(.42-k*.1,.4,24),M.snow,[0,1.38+k*.62,0],[1,1,1],[0,0,0],g)}return g}
[[-3.4,-3.2,1.5],[-1.2,-4.6,1.9],[1.6,-4.0,1.6],[3.8,-2.6,1.3],[-4.8,-.8,1.2],[5.4,-.4,1.1],[-2.6,2.6,.9],[6.6,-4.4,1.7],[-6.2,-4.2,1.8]].forEach(([x,z,s])=>pine(FX+x,FZ+z,s));

// ---- props: Shiva's trident in hand, the fallen staff, the glow of revival, holy water, petals, fury rings, snow puffs, worship seat
const tri2h=new THREE.Group();kail.add(tri2h);const tri2=trident();tri2.position.y=-2.2;tri2h.add(tri2);
const triGlow=new THREE.PointLight('#ffd27a',0,8,2);tri2h.add(triGlow);triGlow.position.y=2.4;
const staff2=new THREE.Group();kail.add(staff2);add(new THREE.CylinderGeometry(.045,.045,2.0,12),GM.staff,[0,0,0],[1,1,1],[0,0,0],staff2);
add(SPH,GM.gold,[0,1.0,0],[.07,.07,.07],[0,0,0],staff2);add(SPH,GM.gold,[0,-1.0,0],[.05,.05,.05],[0,0,0],staff2);
const glowTex=halo.material.map;
const orbM=new THREE.MeshBasicMaterial({color:'#ffe7a0',transparent:true,opacity:.85,fog:false});
const orbG=add(new THREE.SphereGeometry(1,40,24),orbM,[0,0,0],[1,1,1],[0,0,0],kail);orbG.castShadow=false;
const orbH=new THREE.Mesh(new THREE.PlaneGeometry(1,1),new THREE.MeshBasicMaterial({map:glowTex,transparent:true,depthWrite:false,fog:false,opacity:1}));kail.add(orbH);
const orbL=new THREE.PointLight('#ffd98a',0,10,1.6);kail.add(orbL);
const waterM=gloss('#7cc8ff');const drops=[];for(let i=0;i<30;i++){const m=add(SPH,waterM,[0,0,0],[.06,.08,.06],[0,0,0],kail);m.castShadow=false;drops.push(m)}
const petalM=['#ff9d1c','#ffc93a','#e8453c','#ff7aa2'].map(c=>clay(c));const petals=[];
for(let i=0;i<70;i++){const m=add(SPH,petalM[i%4],[0,0,0],[.09,.025,.07],[0,0,0],kail);m.castShadow=false;petals.push(m)}
const ringM=new THREE.MeshBasicMaterial({color:'#ff6a3d',transparent:true,opacity:.8,fog:false});
const rings=[];for(let i=0;i<4;i++){const m=add(new THREE.TorusGeometry(1,.035,8,64),ringM.clone(),[0,0,0],[1,1,1],[Math.PI/2,0,0],kail);m.castShadow=false;rings.push(m)}
const furyL=new THREE.PointLight('#ff4a2a',0,9,1.5);kail.add(furyL);
const snowP=[];for(let i=0;i<12;i++){const m=add(lumpy(3,.12,i+3),M.snow,[0,0,0],[1,1,1],[0,0,0],kail);m.castShadow=false;snowP.push(m)}
const seatG=new THREE.Group();kail.add(seatG);
add(new THREE.CylinderGeometry(.85,.95,.4,40),clay('#c8283c'),[0,.2,0],[1,1,1],[0,0,0],seatG);
add(new THREE.TorusGeometry(.86,.06,10,40),M.gold,[0,.4,0],[1,1,1],[Math.PI/2,0,0],seatG);add(new THREE.TorusGeometry(.95,.06,10,40),M.gold,[0,.02,0],[1,1,1],[Math.PI/2,0,0],seatG);
for(let i=0;i<10;i++){const a=i/10*6.28;add(SPH,clay('#ffb3c7'),[Math.cos(a)*.95,.25,Math.sin(a)*.95],[.22,.12,.1],[0,-a,0],seatG)}
const seatDiyas=[0,1,2,3,4,5].map(i=>{const a=Math.PI*.15+i/5*Math.PI*.7;return diya(seatG,Math.cos(a)*1.55,0,Math.sin(a)*1.55)});

