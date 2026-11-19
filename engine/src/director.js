// ================= DIRECTOR: plays a story spec (window.STORY) against the voice timeline (window.TL)
// Everything here is generic: a story only chooses sets, spots, characters, poses, actions and effects by name.
const ST=window.STORY, TLD=window.TL, LN=TLD.lines, IDS=ST.order;
const $=id=>document.getElementById(id);
const flick=t=>.9+.1*Math.sin(t*23)+.06*Math.sin(t*37);
const blinkF=(t,k)=>((t+k)%3.9)>3.75?.1:1;
const SKY={dawn:['#8f9fe8','#f6b49c','#ffe0c2'],calm:['#7d8fe0','#f4ad97','#ffdcbc'],dusk:['#4f5592','#a184b0','#e2bfc4'],
  fury:['#4a1430','#b5373b','#ee8a5a'],gold:['#8a9de8','#ffc28c','#fff0cc'],night:['#1d2150','#4a3f7a','#8f6f9a']};
function setSky(a,b,p){['top','mid','bot'].forEach((k,i)=>skyU[k].value.set(SKY[a][i]).lerp(new THREE.Color(SKY[b][i]),p));scene.fog.color.copy(skyU.bot.value).lerp(skyU.mid.value,.4)}
function kailash(){scene.fog.near=POSTER?60:24;scene.fog.far=POSTER?220:75;ocean.visible=false;kail.visible=true;if(rope)rope.visible=false;puffs.forEach(m=>m.visible=false)}

// ---- the cast registry (only approved characters live here)
const devas=[cast[0],cast[1],cast[2]],asuras=[cast[3],cast[4],cast[5]];
const CH={parvati:P_,boy:BOY,ganesha:G,elephant:EL};
devas.forEach((c,i)=>CH['deva'+(i+1)]=c);asuras.forEach((c,i)=>CH['asura'+(i+1)]=c);sages.forEach((c,i)=>CH['sage'+(i+1)]=c);ganas.forEach((c,i)=>CH['gana'+(i+1)]=c);
[...sages].forEach(c=>{if(c.root.parent!==kail){scene.remove(c.root);kail.add(c.root)}});
const isPerson=c=>!!c.lean;   // makeChar figures (devas, asuras, sages, ganas)
function rootOf(who){return who==='shiva'?shiva.g:CH[who].root}

// ---- sets and their named spots (x,z in world units)
const FXX=16,FZZ=-1;
const SETS={
 kailash:{key:[V(-5,11,9),V(0,2,0)],spots:{seat:[0,0],front:[0,3.0],left:[-2.2,3.2],right:[2.2,3.2],far_left:[-4,4.6],far_right:[4,4.6],
   front_left:[-1.6,5.6],front_right:[1.6,5.6],front_far:[0,6.3],off_left:[-9,6],off_right:[9,6]}},
 home:{key:[V(HX-5,13,11),V(HX,1.5,1.5)],spots:{door:[HX,1.25],inside:[HX,-.4],center:[HX,2.4],left:[HX-1.8,2.0],right:[HX+1.9,1.6],
   far_left:[HX-3.2,3.4],far_right:[HX+3.4,3.4],front_left:[HX-2.4,5.0],front_right:[HX+2.4,5.0],front:[HX,5.6],
   step_left:[HX-1.3,2.4],step_right:[HX+1.2,2.8],off_left:[HX-6.5,4.2],off_right:[HX+6.5,4.2]}},
 forest:{key:[V(FXX-5,12,FZZ+10),V(FXX,1,FZZ)],spots:{center:[FXX,FZZ+1.4],clearing:[FXX+1.4,FZZ+.4],left:[FXX-2,FZZ+2.4],right:[FXX+2,FZZ+2.4],
   front_left:[FXX-1.6,FZZ+3.6],front_right:[FXX+1.6,FZZ+3.6],off_left:[FXX-7,FZZ+3],off_right:[FXX+7,FZZ+3]}}};
function spot(set,s){if(Array.isArray(s))return s;const p=SETS[set].spots[s];if(!p)throw new Error('unknown spot '+s+' in '+set);return p}

// ---- poses available per character (anything else falls back to rest)
const SHIVA_POSES=['rest','bless','med','hold','point','raise','blessH','drink'];
function applyPose(who,o,a,b,p){
  if(who==='shiva'){shiva.pose(a,b,p);return}
  if(who==='parvati'){P_.pose(a,b,p);return}
  if(isPerson(o)){const H=PERSON_HANDS,x=H[a]||H.rest,y=H[b]||H.rest;o.setHands(vl(x[0],y[0],p),vl(x[1],y[1],p));return}
}
const PERSON_HANDS={rest:[V(-.42,.72,.15),V(.42,.72,.15)],namaste:[V(-.06,1.18,.5),V(.06,1.18,.5)],cheer:[V(-.35,1.75,.25),V(.35,1.75,.25)],
  afraid:[V(-.35,1.35,.35),V(.35,1.35,.35)],offer:[V(-.3,1.05,.55),V(.3,1.05,.55)],fight:[V(-.3,1.3,.5),V(.3,1.5,.4)],down:[V(-.5,.5,.2),V(.5,.5,.2)]};

// ---- shot timing helpers: fractions are of the SHOT (s0 to s1)
let SH=null; // current shot info {s0,s1,t0,t1}
const fr=(t,a)=>SH.s0+(SH.s1-SH.s0)*a;
const pr=(t,a,b)=>prog(t,fr(t,a),fr(t,b));

// ---- place one cast member for this frame
const BOXES=[];
function placeCast(t,set,c){
  const who=c.who,o=who==='shiva'?null:CH[who];
  let [x,z]=c.seated?[0,0]:spot(set,c.at),yaw=0;
  if(c.to){const [x2,z2]=spot(set,c.to),w=c.walk||[0,.6];const q=ez(pr(t,w[0],w[1]));
    const dx=x2-x,dz=z2-z;x=lerp(x,x2,q);z=lerp(z,z2,q);if(c.face_walk!==false&&q>0&&q<1)yaw=Math.atan2(dx,dz)}
  if(typeof c.yaw==='number')yaw=c.yaw;else if(c.yaw==='away')yaw=Math.PI;else if(c.yaw==='right')yaw=Math.PI/2;else if(c.yaw==='left')yaw=-Math.PI/2;
  else if(typeof c.yaw==='string'&&c.yaw.startsWith('face:')){const tw=c.yaw.slice(5),r=rootOf(tw);const dx=r.position.x-x,dz=r.position.z-z;yaw=Math.atan2(dx,dz)}
  if(c.to&&c.walk&&c.face_walk!==false){const q=pr(t,c.walk[0],c.walk[1]);if(q>0&&q<1){const [x1,z1]=spot(set,c.at),[x2,z2]=spot(set,c.to);yaw=Math.atan2(x2-x1,z2-z1)}}
  const sc=c.scale||1,moving=c.to&&c.walk&&pr(t,c.walk[0],c.walk[1])>0&&pr(t,c.walk[0],c.walk[1])<1;
  if(who==='shiva'){
    if(c.seated){shiva.setStand(false);shiva.g.position.set(0,1.28,0);shiva.g.rotation.y=0;shiva.g.scale.setScalar(1);tri.visible=true;
      halo.position.set(0,1.28+2.75,-1.3);halo.scale.setScalar(3.8);halo.rotation.set(0,0,0)}
    else{const s=.8*sc;shiva.setStand(true);const y=gY(x,z);shiva.g.position.set(x,y+1.3*s,z);shiva.g.rotation.y=yaw;shiva.g.scale.setScalar(s);
      halo.position.set(x-Math.sin(yaw)*1.3*s,shiva.g.position.y+2.75*s,z-Math.cos(yaw)*1.3*s);halo.scale.setScalar(3.8*s)}
    shiva.g.visible=true;halo.visible=true;
  }else{o.root.position.set(x,gY(x,z)+.03,z);o.root.rotation.set(0,yaw,0);o.root.scale.setScalar(sc);o.root.visible=true}
  const r=rootOf(who);
  if(moving)r.position.y+=Math.abs(Math.sin(t*(who==='shiva'?5.5:7.5)))*(who==='shiva'?.06:.05);
  // pose
  const P=c.pose||'rest';if(Array.isArray(P)){const [a,b,p0,p1]=P;applyPose(who,o,a,b,ez(pr(t,p0??0,p1??.3)))}else applyPose(who,o,P,P,0);
  // face
  const f=who==='shiva'?shiva.f:o.f;
  if(f){let mood=c.mood||'calm',mouth=c.mouth||'smile',open=blinkF(t,(c.blink_seed||0)+who.length*.37);
    if(c.mood_to&&t>fr(t,c.mood_to[1]))mood=c.mood_to[0];
    if(c.eyes_closed&&t<fr(t,c.eyes_closed))open=.1;if(c.eyes==='closed')open=.1;
    if(c.talk&&t>fr(t,c.talk[0])&&t<fr(t,c.talk[1])&&Math.sin(t*16)>0)mouth='oh';
    f.set(open,mood,mouth)}
  // extra actions
  for(const a of c.act||[]){const k=a.do;
    if(k==='appear'){const q=ez(pr(t,a.at,a.at+(a.dur||.25)));r.scale.setScalar(sc*(.2+.8*q));r.visible=q>.01}
    else if(k==='exit'){if(t>fr(t,a.at))r.visible=false}
    else if(k==='enter'){if(t<fr(t,a.at))r.visible=false}
    else if(k==='bow'&&isPerson(o))o.lean.rotation.x=(a.amount||.3)*ez(pr(t,a.at||0,(a.at||0)+.1))+.05*Math.sin(t*3);
    else if(k==='tremble')r.position.x+=Math.sin(t*40+who.length)*.02;
    else if(k==='hop')r.position.y+=Math.abs(Math.sin(t*5+who.length))*(a.height||.12);
    else if(k==='lift')r.position.y+=a.y||.4;
    else if(k==='lean_back'&&isPerson(o))o.lean.rotation.x=-.12;
    else if(k==='head_tilt'&&o&&o.H)o.H.rotation.z=Math.sin(t*1.5)*.06;
    else if(k==='sway_trunk'&&who==='elephant')EL.H.rotation.set(Math.sin(t*1.3)*.05,Math.sin(t*.9)*.08,0);
    else if(k==='knockback'&&isPerson(o)){const h=fr(t,a.at),run=a.run||.9,q=prog(t,h-run,h),fly=prog(t,h,h+.7);const [dx,dz]=a.dir||[1.6,1.0];
      if(fly>0){r.position.x+=dx*ez(fly);r.position.z+=dz*ez(fly);r.position.y+=fly<1?Math.sin(fly*Math.PI)*1.1:0;o.yaw.rotation.y=fly<1?fly*6.28:0}
      if(fly>=1){o.lean.rotation.x=-.35;o.f.set(.1,'worried','oh');applyPose(who,o,'down','down',0)}else if(q>0){o.lean.rotation.x=.25;applyPose(who,o,'fight','fight',0);o.f.set(1,'angry','smile')}
      if(fly>0&&fly<.9)snowP.slice(0,4).forEach((m,k2)=>{m.visible=true;m.position.set(r.position.x-dx*ez(fly)+(rnd(k2)-.5)*1.2,r.position.y-.6+fly*.8,r.position.z-dz*ez(fly)+(rnd(k2+9)-.5)*.8);m.scale.setScalar(.25*(1-fly)+.08)})}
    else if(k==='staff'&&who==='boy'){const mode=t>fr(t,a.from||0)?a.mode:(a.before||'hold');boyStaff(mode,Math.sin(t*5)*.15+lerp(-.4,.6,(t*1.4)%1))}
    else if(k==='walk_in_place')r.position.y+=Math.abs(Math.sin(t*7.5))*.05;
  }
  if(who==='shiva'&&!c.seated&&['hold','point','raise','blessH'].some(x=>x===P||(Array.isArray(P)&&P.includes(x)))){
    const rz=c.raise?lerp(0,.35,ez(pr(t,c.raise[0],c.raise[1]))):0;holdTri(rz)}
}
function holdTri(rz=0){shiva.g.updateMatrixWorld(true);const hw=new THREE.Vector3();shiva.hands[1].getWorldPosition(hw);tri2h.visible=true;tri2h.position.copy(hw);
  tri2h.rotation.set(0,shiva.g.rotation.y,rz);tri2h.scale.setScalar(shiva.g.scale.x*.95)}
function boyStaff(mode,a=0){const s=BOY.staff;
  if(mode==='hold'){BOY.setHands(V(-.42,.72,.15),V(.5,1.0,.3));s.position.set(.52,1.02,.32);s.rotation.set(0,0,0)}
  else if(mode==='block'){BOY.setHands(V(-.42,1.0,.48),V(.42,1.0,.48));s.position.set(0,1.0,.52);s.rotation.set(0,0,Math.PI/2)}
  else{const c=V(.15,1.15,.5);BOY.setHands(V(-.1+Math.cos(a)*.15,1.1+Math.sin(a)*.15,.5),V(.3,1.15,.5));s.position.copy(c);s.rotation.set(0,0,a)}}

// ---- effects
function petalsFall(t,cx,cz,on){petals.forEach((m,i)=>{const sp=.55+rnd(i)*.35,life=((t*sp*.25)+rnd(i+7))%1;m.visible=on>0;
  m.position.set(cx+(rnd(i+3)-.5)*9+Math.sin(t*1.3+i)*.3,lerp(8.5,.3,life),cz+(rnd(i+5)-.5)*5);m.rotation.set(t*2+i,t*1.3+i*.7,t+i);m.scale.set(.09*on,.025,.07*on)})}
function wpos(who,dy=0){const r=rootOf(who);r.updateMatrixWorld(true);return r.localToWorld(V(0,dy,0))}
function applyFx(t,set,fx){
  for(const e of fx){const k=e.kind;
    if(k==='petals'){const c=e.at?spot(set,e.at):SETS[set].spots.center||[0,3];petalsFall(t,c[0],c[1]+.6,ez(pr(t,e.from||0,(e.from||0)+.15)))}
    else if(k==='flash'){$('flash').style.opacity=cl((t-fr(t,e.at)+.12)/.12)*(1-cl((t-fr(t,e.at)-.3)/.45))}
    else if(k==='rings'){const c=wpos(e.on),on=ez(pr(t,e.from||0,(e.from||0)+.1));rings.forEach((m,i)=>{const q=((t-fr(t,e.from||0))*.55+i/4)%1;m.visible=on>0;
      m.position.set(c.x,c.y+.15+q*.3,c.z);m.scale.setScalar(.6+q*(e.size||3.4));m.material.opacity=.8*(1-q)*on})}
    else if(k==='light'){const c=wpos(e.on||'',1.6);const L=e.color==='red'?furyL:orbL;L.color.set(e.color==='red'?'#ff4a2a':'#ffd98a');L.position.copy(c).add(V(0,0,1));L.intensity=(e.power||5)*ez(pr(t,e.from||0,(e.from||0)+.15))*(1+.15*Math.sin(t*6))}
    else if(k==='sparkle'){const c=e.on?wpos(e.on,1.2):V(...spot(set,e.at),0);const q=pr(t,e.from||0,e.to||1),app=ez(q);
      orbH.visible=true;orbH.position.copy(c);orbH.scale.setScalar(lerp(.5,3.4,ez(pr(t,e.from||0,(e.from||0)+.25)))*(1-.65*ez(pr(t,(e.to||1)-.1,(e.to||1)+.05))));orbH.lookAt(cam.position);
      orbL.position.copy(c).add(V(0,.3,.4));orbL.intensity=2.2*(1-app);
      drops.forEach((m,i)=>{m.visible=q>0&&q<1;m.material=M.gold;const a=t*3+i*.7,r=lerp(1.3,.1,app)*(.6+rnd(i)*.5);m.position.set(c.x+Math.cos(a)*r,c.y-.8+rnd(i+2)*1.8,c.z+Math.sin(a)*r*.6);m.scale.setScalar(.05)})}
    else if(k==='orb_reveal'){const c=wpos(e.who,1.3),burst=ez(prog(t,fr(t,e.at)-.15,fr(t,e.at)+.6));
      orbG.visible=burst<1;orbG.position.copy(c);orbG.scale.set(lerp(1.05,1.6,burst),lerp(1.35,2.0,burst),lerp(1.05,1.6,burst));orbM.opacity=.85*(1-burst);
      orbH.visible=true;orbH.position.copy(c);orbH.scale.setScalar(lerp(5.2,7,burst)*(1-.6*burst)*(1+.05*Math.sin(t*5)));orbH.lookAt(cam.position);
      orbL.position.copy(c).add(V(0,.5,1.2));orbL.intensity=lerp(3,1.2,burst);
      const r=rootOf(e.who);if(burst<.2)r.visible=false;if(CH[e.who]&&CH[e.who].f&&t<fr(t,e.at)+.5)CH[e.who].f.set(.1,'calm','smile')}
    else if(k==='drops'){const to=wpos(e.to,1.3);drops.forEach((m,i)=>{m.material=waterM;const src=e.from[i%e.from.length],q=((t-SH.s0)*.9+rnd(i))%1,s=wpos(src,1.25);
      s.add(V(0,0,.3));m.visible=t<fr(t,e.until||1);const pp=vl(s,to,q);pp.y+=Math.sin(q*Math.PI)*.9;m.position.copy(pp);m.scale.set(.06,.08,.06)})}
    else if(k==='fallen_staff'){staff2.visible=true;const [x,z]=spot(set,e.at);staff2.position.set(x,gY(x,z)+.06,z);staff2.rotation.set(0,.5,Math.PI/2)}
    else if(k==='seat'){seatG.visible=true;const [x,z]=spot(set,e.at);seatG.position.set(x,gY(x,z),z);seatDiyas.forEach(d=>d.userData.fl.scale.setScalar(flick(t+d.position.x)))}
    else if(k==='trident_glow'){triGlow.intensity=6*ez(pr(t,e.from||0,e.to||.5))*(1+.2*Math.sin(t*30))}
    else if(k==='doors'){const open=ez(pr(t,e.open||0,(e.open||0)+.12))*(1-ez(pr(t,e.close??2,(e.close??2)+.12)));doors.forEach((d,i)=>d.rotation.y=(i?1:-1)*-1.3*open)}
    else if(k==='tint'){grade.uniforms.tint.value.set(...e.rgb)}
    else if(k==='dim'){hemi.intensity=.7;key.intensity=1.5;key.color.set('#d8c6ff')}
  }
}

// ---- automatic camera: frames the named characters inside the safe area (above the captions)
const _b=new THREE.Box3(),_v=new THREE.Vector3(),_tb=new THREE.Box3();
// bounding box of what is actually visible (Box3.setFromObject would also count hidden parts like the other snake pose)
function visBox(root,out){out.makeEmpty();root.updateMatrixWorld(true);root.traverseVisible(o=>{if(o.isMesh&&o.geometry&&o.position.y>-9){if(!o.geometry.boundingBox)o.geometry.computeBoundingBox();
  _tb.copy(o.geometry.boundingBox).applyMatrix4(o.matrixWorld);out.union(_tb)}});return out}
const ANG={front:[0,.16],low:[0,.02],high:[0,.42],left:[-.42,.16],right:[.42,.16],high_left:[-.35,.4],high_right:[.35,.4]};
function frameCam(t,cs,set){
  const pts=[];if(cs.spot){const [x,z]=spot(set,cs.spot),y=gY(x,z);pts.push(V(x-1.1,y,z-.8),V(x+1.1,y+.7,z+.8))}for(const w of cs.frame){const r=rootOf(w);if(!r.visible)continue;visBox(r,_b);if(_b.isEmpty())continue;
    if(w==='shiva'&&!shiva.stand){_b.min.y=Math.max(_b.min.y,0)}pts.push(_b.min.clone(),_b.max.clone())}
  if(!pts.length||pts.some(v=>!isFinite(v.x))){pts.length=0;for(const w of cs.frame){const r=rootOf(w);pts.push(V(r.position.x-.6,r.position.y,r.position.z-.5),V(r.position.x+.6,r.position.y+2.6,r.position.z+.5))}}
  if(!pts.length)pts.push(V(0,0,0),V(0,3,0));
  const bb=new THREE.Box3().setFromPoints(pts),c=bb.getCenter(new THREE.Vector3()),sz=bb.getSize(new THREE.Vector3());
  const [ax,ay]=ANG[cs.angle||'front'];const orb=cs.orbit?lerp(-cs.orbit,cs.orbit,ez(SHP)):0;
  const dir=V(Math.sin(ax+orb),ay,Math.cos(ax+orb)).normalize();
  const fov=cs.fov||30,th=Math.tan(fov*Math.PI/360),asp=W/H;
  const wspan=Math.max(sz.x,sz.z*.6)+.6,hspan=sz.y+.3;
  const fitH=cs.fit_h||.56,fitW=cs.fit_w||.9;   // subject uses at most this share of frame height / width
  let d=Math.max(hspan/(2*th*fitH),wspan/(2*th*asp*fitW))+sz.z*.5;
  d*=(cs.zoom||1)*lerp(1+(cs.push??.12),1,ez(SHP));
  const visH=2*d*th,center=cs.center_y??.42;            // subject centre sits this far down the frame
  const tgt=V(c.x+(cs.shift_x||0),c.y-(.5-center)*visH,c.z);   // look below the subject so it sits at `center`
  const pos=tgt.clone().add(dir.multiplyScalar(d)).add(sway(t,.025));
  cam.position.copy(pos);cam.fov=fov;cam.updateProjectionMatrix();cam.lookAt(tgt);cam.updateMatrixWorld(true);bokeh.uniforms.focus.value=pos.distanceTo(c);
}
function sway(t,a=.04,f=.35){return V(Math.sin(t*f*6.28)*a,Math.sin(t*f*4.1+1)*a*.7,0)}
let SHP=0;

// ---- layout check: every framed character must sit inside the safe area (above captions, below title/verse)
window.CHECK=[];
function checkFrame(t,id,cs,shot){
  const top=(shot.verse?.20:IDS[0]===id&&t<LN[id].t1+.4?.20:.08),bot=.73;
  for(const w of cs.frame){const r=rootOf(w);if(!r.visible)continue;visBox(r,_b);
    const cs8=[];for(const x of [_b.min.x,_b.max.x])for(const y of [_b.min.y,_b.max.y])for(const z of [_b.min.z,_b.max.z]){_v.set(x,y,z).project(cam);cs8.push([(_v.x*.5+.5),(-_v.y*.5+.5)])}
    const xs=cs8.map(p=>p[0]),ys=cs8.map(p=>p[1]),x0=Math.min(...xs),x1=Math.max(...xs),y0=Math.min(...ys),y1=Math.max(...ys);
    const probs=[];if(x0<-.005||x1>1.005)probs.push('cut off at the side');if(y0<top-.04)probs.push('head too high (under the title)');
    if(y1>bot+.035)probs.push('reaches into the captions');if(x1-x0<.06)probs.push('too small to read');
    if(probs.length)window.CHECK.push(`${id} @${t.toFixed(1)}s: ${w} ${probs.join(', ')}`)}
  // characters on screen but not framed must be fully in or fully out (half a body at the edge looks like a mistake)
  for(const c of shot.cast||[]){const w=c.who;if(cs.frame.includes(w))continue;const r=rootOf(w);if(!r.visible)continue;visBox(r,_b);if(_b.isEmpty())continue;
    const xs=[];for(const x of [_b.min.x,_b.max.x])for(const z of [_b.min.z,_b.max.z]){_v.set(x,(_b.min.y+_b.max.y)/2,z).project(cam);xs.push(_v.x*.5+.5)}
    const a=Math.min(...xs),b=Math.max(...xs);if((a<0&&b>0.04)||(b>1&&a<.96))window.CHECK.push(`${id} @${t.toFixed(1)}s: ${w} is half off the edge (add it to cam.frame or move it to an off_ spot)`)}
}

// ================= text
const UI={en:{src:"Source: "},hi:{src:"स्रोत: "}};
let lang='en',capKey=-1;
const PILLS=(ST.pills||[]).map(p=>({...p,el:(()=>{const d=document.createElement('div');d.className='pill '+(p.style||'');$('pills').appendChild(d);return d})()}));
function pillTime(p,which){const x=LN[p.line],a=p[which];return x.s0+(x.s1-x.s0)*a}
function fitLine(d,max,base){d.style.fontSize=base+'px';const s=document.createElement('span');s.textContent=d.textContent;s.style.whiteSpace='nowrap';d.textContent='';d.appendChild(s);
  const w=s.getBoundingClientRect().width;d.textContent=s.textContent;if(w>max)d.style.fontSize=Math.floor(base*max/w)+'px'}
function setLang(l){lang=l;capKey=-1;$('title').children[0].textContent=ST.title[l][0];$('title').children[1].textContent=ST.title[l][1];
  fitLine($('title').children[0],1000,62);fitLine($('title').children[1],1000,122);
  PILLS.forEach(p=>{p.el.textContent=p.text[l];p.el.classList.toggle('hi',l==='hi')})}
function text(t){
  const tt=$('title'),he=LN[IDS[0]].t1+.35;tt.style.opacity=win(t,-1,he,.25);
  tt.children[0].style.transform=`translateY(${(1-eo(t/.35))*-30}px)`;tt.children[0].style.opacity=eo(t/.3);
  const p2=eo((t-.45)/.35);tt.children[1].style.transform=`scale(${lerp(1.6,1,p2)})`;tt.children[1].style.opacity=cl((t-.45)/.12);
  const cap=$('cap'),sub=$('sub'),CHK=TLD.cap[lang];let k=-1;CHK.forEach((c,i)=>{if(t>=c.t0&&t<c.t1)k=i});
  if(k<0){cap.style.opacity=0;sub.style.opacity=0}else{
    const c=CHK[k];
    if(capKey!==k){capKey=k;cap.innerHTML='';
      if(c.big){const sp=document.createElement('span');sp.className='w hl';sp.textContent=c.big;cap.appendChild(sp)}
      else c.words.forEach(w=>{if(w.br){cap.appendChild(document.createElement('br'));return}const sp=document.createElement('span');sp.className='w'+(w.hl?' hl':'');sp.textContent=w.w;cap.appendChild(sp)});
      cap.className='ol'+(c.big?' big':'');sub.textContent=c.sub||''}
    cap.style.top=(c.big?1440:1470)+'px';cap.style.opacity=cl((c.t1-t)/.15);
    if(c.big){const sp=cap.querySelector('.w'),p=eo((t-c.t0)/.3);sp.style.opacity=p;sp.style.transform=`scale(${lerp(1.5,1,p)})`}
    else{const ws=c.words.filter(w=>!w.br);[...cap.querySelectorAll('.w')].forEach((sp,i)=>{const p=eo((t-ws[i].t+.05)/.18);sp.style.opacity=p;sp.style.transform=`translateY(${(1-p)*20}px) scale(${lerp(.85,1,p)})`})}
    if(c.sub){sub.style.top='1545px';sub.style.opacity=ez((t-c.tsub)/.3)*cl((c.t1-t)/.15)}else sub.style.opacity=0}
  // verse block (Sanskrit line + meaning) for lines that quote scripture
  const vv=$('verse');let vl_=null;for(const id of IDS){const x=LN[id];if(ST.shots[id].verse&&t>=x.s0&&t<x.s1)vl_=[id,x]}
  if(vl_){const v=ST.shots[vl_[0]].verse[lang];vv.children[0].textContent=v[0];vv.children[1].textContent=v[1];vv.children[2].textContent=v[2];vv.style.top='150px';
    vv.style.opacity=win(t,vl_[1].s0+.2,Math.min(vl_[1].s1,TLD.dur-.2),.35)}else vv.style.opacity=0;
  const st=$('src');let sl=null;for(const id in LN){const x=LN[id];if(x.src&&t>=x.s0&&t<x.s1&&!ST.shots[id]?.verse)sl=x}
  if(sl){st.textContent=(sl.src.plain?'':UI[lang].src)+sl.src[lang];st.style.opacity=win(t,sl.s0+.15,Math.min(sl.s1,TLD.dur-.3),.25)}else st.style.opacity=0;
  PILLS.forEach(p=>{const a0=pillTime(p,'a'),a1=pillTime(p,'b'),o=win(t,a0,a1,.25);p.el.style.opacity=o;if(o<=0)return;
    let x=540,y=420;if(p.on){const r=rootOf(p.on);if(r.visible){visBox(r,_b);const a=V((_b.min.x+_b.max.x)/2,_b.max.y+.35,(_b.min.z+_b.max.z)/2).project(cam);x=(a.x*.5+.5)*W;y=(-a.y*.5+.5)*H}}
    y=Math.max(y,250);x=Math.min(Math.max(x,200),880);const pp=eo((t-a0)/.3);p.el.style.left=x+'px';p.el.style.top=y+'px';p.el.style.transform=`translate(-50%,-50%) scale(${lerp(.4,1,pp)})`});
}

// ================= frame
function reset(){
  kailash();Object.values(CH).forEach(o=>{o.root.visible=false;o.root.scale.setScalar(1);o.root.rotation.set(0,0,0)});cast.forEach(c=>c.root.visible=false);
  shiva.g.visible=false;tri.visible=false;tri2h.visible=false;triGlow.intensity=0;staff2.visible=false;orbG.visible=orbH.visible=false;orbL.intensity=0;drops.forEach(m=>m.visible=false);
  petals.forEach(m=>m.visible=false);rings.forEach(m=>m.visible=false);furyL.intensity=0;snowP.forEach(m=>m.visible=false);seatG.visible=false;forest.visible=true;home.visible=true;
  glowL.intensity=0;poisonL.intensity=0;halo.visible=false;orb.visible=false;diyaL.intensity=0;
  grade.uniforms.tint.value.set(1,1,1);$('flash').style.opacity=0;
  rim.position.set(5,6,-7);hemi.intensity=.95;key.intensity=2.5;key.color.set('#ffe6c8');setSky('dawn','dawn',0);
  shiva.pose('rest');shiva.f.set(1,'calm','smile');shiva.throatState(ST.throat??2);shiva.setSnake(ST.snake||'neck');
  P_.pose('rest');P_.f.set(1,'calm','smile');BOY.f.set(1,'calm','smile');boyStaff('hold');G.f.set(1,'calm','smile');G.H.rotation.set(0,0,0);EL.H.rotation.set(0,0,0);
  for(const c of [...cast,...sages,...ganas]){c.lean.rotation.set(0,0,0);c.lean.position.set(0,0,0);c.yaw.rotation.set(0,0,0);c.setHands(V(-.42,.72,.15),V(.42,.72,.15));c.f.set(1,'calm','smile')}
  doors.forEach(d=>d.rotation.y=0);
  clouds.forEach(c=>{c.position.x=c.userData.x??(c.userData.x=c.position.x)});
}
function render(t,opts={}){
  let k=0;IDS.forEach((id,i)=>{if(t>=LN[id].s0)k=i});const id=IDS[k],x=LN[id],shot=ST.shots[id];
  reset();
  SH={s0:x.s0,s1:Math.min(x.s1,TLD.dur),t0:x.t0,t1:x.t1};SHP=prog(t,SH.s0,SH.s1);
  clouds.forEach((c,i)=>{c.position.x=c.userData.x+Math.sin(t*.12+i)*.8});
  const set=shot.set||'kailash';
  if(set==='forest')home.visible=false;
  const S=SETS[set];setKey(S.key[0],S.key[1],9);
  const sky=shot.sky||['dawn','dawn'];setSky(sky[0],sky[1]||sky[0],ez(SHP));
  if(set==='home'){diyaL.position.set(HX,Y0+1,1.3);diyaL.intensity=1.2*flick(t)}
  if(shot.light==='dim'){hemi.intensity=.7;key.intensity=1.5;key.color.set('#d8c6ff')}
  if(shot.light==='warm_red'){hemi.intensity=.62;key.color.set('#ffd2c0')}
  // the shot may switch to a second part (e.g. after a flash): fields in `then` override from `then.at`
  let sh=shot;if(shot.then&&t>=fr(t,shot.then.at))sh={...shot,...shot.then};
  for(const c of sh.cast||[])placeCast(t,set,c);
  applyFx(t,set,sh.fx||[]);
  frameCam(t,sh.cam||{frame:(sh.cast||[]).map(c=>c.who)},set);
  if(halo.visible)halo.lookAt(cam.position);
  if(window.camOverride){const CO=window.camOverride;cam.position.set(...CO[0]);cam.fov=CO[2];cam.updateProjectionMatrix();cam.lookAt(V(...CO[1]))}
  scene.updateMatrixWorld(true);if(opts.check)checkFrame(t,id,sh.cam||{frame:(sh.cast||[]).map(c=>c.who)},sh);
  comp.render();text(t);
}
window.coverText=()=>{for(const k of ['cap','sub','src','verse','pills'])$(k).style.opacity=0;PILLS.forEach(p=>p.el.style.opacity=0);$('flash').style.opacity=0;
  const tt=$('title');tt.style.opacity=1;tt.style.top='200px';for(const d of tt.children){d.style.opacity=1;d.style.transform='none'}};
window.rootOf=rootOf;window.visBox=visBox;window.THREE=THREE;window.cam=cam;
window.render=render;window.setLang=setLang;window.textOnly=text;window.TL=TLD;window.SCENES=IDS.map(i=>[i,LN[i].s0,LN[i].t0,LN[i].t1]);
setLang(new URLSearchParams(location.search).get('lang')||'en');
await document.fonts.load('800 40px Baloo','अ a');await document.fonts.load('700 40px Baloo','अ a');await document.fonts.ready;
render(0);window.done=true;
</script></body></html>
