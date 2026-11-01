import * as THREE from './vendor/three.module.min.js';

export { THREE };
export const LANE = 3.15;
const materials=new Map(), boxes=new THREE.BoxGeometry(1,1,1), spheres=new Map(), cylinders=new Map();
export function material(color){if(!materials.has(color))materials.set(color,new THREE.MeshStandardMaterial({color,roughness:.8,metalness:.03}));return materials.get(color)}
export function box(parent,x,y,z,w,h,d,color){const m=new THREE.Mesh(boxes,material(color));m.position.set(x,y,z);m.scale.set(w,h,d);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m}
export function ball(parent,x,y,z,r,color,scale=[1,1,1]){const key=8; if(!spheres.has(key))spheres.set(key,new THREE.SphereGeometry(1,10,7));const m=new THREE.Mesh(spheres.get(key),material(color));m.position.set(x,y,z);m.scale.set(r*scale[0],r*scale[1],r*scale[2]);m.castShadow=true;parent.add(m);return m}
export function cylinder(parent,x,y,z,rt,rb,h,color,n=10){const key=[rt,rb,h,n].join(',');if(!cylinders.has(key))cylinders.set(key,new THREE.CylinderGeometry(rt,rb,h,n));const m=new THREE.Mesh(cylinders.get(key),material(color));m.position.set(x,y,z);m.castShadow=true;parent.add(m);return m}
function signTexture(text,bg,fg,width=512){const canvas=document.createElement('canvas');canvas.width=width;canvas.height=160;const c=canvas.getContext('2d');c.fillStyle=bg;c.fillRect(0,0,width,160);c.fillStyle=fg;c.textAlign='center';c.textBaseline='middle';c.font='900 68px Arial';c.fillText(text,width/2,84);const t=new THREE.CanvasTexture(canvas);t.colorSpace=THREE.SRGBColorSpace;return t}
function placard(parent,text,x,y,z,w,h,bg='#f7de82',fg='#325b53'){const mesh=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshStandardMaterial({map:signTexture(text,bg,fg),side:THREE.DoubleSide}));mesh.position.set(x,y,z);parent.add(mesh);return mesh}
function batch(root){root.updateMatrixWorld(true);const buckets=new Map();root.traverse(obj=>{if(!obj.isMesh)return;const key=obj.geometry.uuid+obj.material.uuid;if(!buckets.has(key))buckets.set(key,{g:obj.geometry,m:obj.material,items:[]});buckets.get(key).items.push(obj.matrixWorld.clone())});root.clear();for(const b of buckets.values()){const m=new THREE.InstancedMesh(b.g,b.m,b.items.length);b.items.forEach((mat,i)=>m.setMatrixAt(i,mat));m.castShadow=true;m.receiveShadow=true;root.add(m)}return root}
function tree(parent,x,z,size=1){cylinder(parent,x,1.8*size,z,.15*size,.23*size,3.6*size,0x9a7753,7);ball(parent,x,3.8*size,z,1.25*size,0x80a96e,[1,1.4,1]);ball(parent,x-.4*size,3.6*size,z+.25,1*size,0xa9c174,[1,1.1,1]);}
function shrub(parent,x,z,w=2){box(parent,x,.55,z,w,.6,1.2,0xf2d3a2);for(let i=0;i<3;i++)ball(parent,x-w/3+i*w/3,1.1,z,.65,0x80a56d,[1,1,.8])}
function building(parent,x,z,w,h,d,color,seed){box(parent,x,h/2,z,w,h,d,color);box(parent,x,h+.15,z,w+.25,.3,d+.25,0xf4dfbb);box(parent,x,h+.4,z,w-.6,.35,d-.6,0xc1b5a1);const front=z+d/2+.015;for(let iy=1.8;iy<h-.8;iy+=2.2){for(let ix=x-w/2+.8;ix<x+w/2-.5;ix+=1.45){box(parent,ix,iy,front,.72,1.25,.06,0x526e70);box(parent,ix,iy-.65,front+.08,.96,.09,.22,0xf3e2c7);box(parent,ix,iy+.1,front+.045,.06,1.1,.04,0x9db8ae);}}
  const side=x<0?x+w/2+.025:x-w/2-.025;for(let iy=1.8;iy<h-.8;iy+=2.2){for(let iz=z-d/2+1;iz<z+d/2-.6;iz+=1.8){box(parent,side,iy,iz,.07,1.2,.82,0x597b7a);box(parent,side,iy-.65,iz,.22,.08,1.02,0xf4dfbd)}}
  if(seed%2===0){box(parent,x,h+1.2,z,.8,1.3,.8,0x9eada6);box(parent,x,h+1.9,z,1.1,.18,1.1,0x6f8f85)}
  if(seed%3===0){box(parent,side+(x<0?.3:-.3),1.8,z,.9,.15,d*.7,0xf67a57);for(let i=0;i<5;i++)box(parent,side+(x<0?.3:-.3),1.84,z-d*.35+i*d*.14,.95,.07,d*.07,0xf9e9bf)}
}
export function makeCity(scene){
  scene.background=new THREE.Color(0xc5e5df);scene.fog=new THREE.Fog(0xc5e5df,55,170);
  scene.add(new THREE.HemisphereLight(0xfff8db,0x739c94,2.4));
  const sun=new THREE.DirectionalLight(0xffedd1,3.3);sun.position.set(-25,45,15);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);sun.shadow.camera.left=-28;sun.shadow.camera.right=28;sun.shadow.camera.top=30;sun.shadow.camera.bottom=-40;sun.shadow.camera.far=100;sun.shadow.normalBias=.08;sun.shadow.bias=-.0004;scene.add(sun);scene.add(sun.target);sun.target.position.set(0,0,-14);
  const ground=box(scene,0,-.6,-80,500,1,500,0xc8d1b1);ground.castShadow=false;
  const chunks=[];const palette=[0xe4ab85,0x8fc3bb,0xe7cc91,0xb3c6a2,0xdcb895,0x9db9ba];
  for(let k=0;k<4;k++){const chunk=new THREE.Group();
    box(chunk,0,-.15,-30,10.7,.3,60,0x9ca69b);
    for(let l=-1;l<=1;l++){
      box(chunk,l*LANE,-.045,-30,2.62,.12,60,0xaab1a3);
      for(let i=0;i<30;i++)box(chunk,l*LANE,.025,-i*2,2.32,.12,.32,0x8a8c7c);
      for(const s of [-1,1]){box(chunk,l*LANE+s*.83,.12,-30,.095,.16,60,0xe2dbbf);box(chunk,l*LANE+s*.83,.19,-30,.15,.055,60,0xd0d6cd)}
    }
    for(const side of [-1,1]){
      box(chunk,side*6,.02,-30,1.3,.42,60,0xf0d9ae);box(chunk,side*5.4,.22,-30,.14,.08,60,0xffe8b9);
      box(chunk,side*7.4,-.02,-30,1.4,.22,60,0xd7c6a6);
      for(let i=0;i<5;i++){const z=-7-i*12;const h=7+((k*7+i*5+(side+1)*2)%8)*1.4;building(chunk,side*(11+((i+k)%2)*.7),z,5.9,h,8.8,palette[(i+k+(side+1))%palette.length],i+k);if(i%2===0)tree(chunk,side*6.9,z+4,.75);else shrub(chunk,side*6.8,z+4,1.2)}
      for(let i=0;i<4;i++){const z=-3-i*16;cylinder(chunk,side*5.95,3,z,.065,.09,5.5,0x668b82,6);box(chunk,side*5.6,5.65,z,.8,.12,.18,0x668b82);box(chunk,side*5.35,5.55,z,.4,.1,.4,0xfce7b5)}
      box(chunk,side*5.25,.65,-30,.1,1.1,60,0xa2b6a2);
      for(let i=0;i<15;i++)box(chunk,side*5.25,.8,-i*4,.14,1.4,.14,0x678d7d);
      box(chunk,side*5.25,1.35,-30,.12,.12,60,0xd5dfbf);
    }
    if(k%2===0){for(const s of [-1,1])box(chunk,s*5.1,4.8,-35,.23,9.6,.32,0x6e9b91);box(chunk,0,9.5,-35,10.5,.25,.35,0x6e9b91);box(chunk,0,8.7,-35,10.5,.12,.18,0x86ada0);for(let i=-4;i<=4;i+=2){const cross=box(chunk,i,9.1,-35,1.2,.09,.12,0x86ada0);cross.rotation.z=.7;}}
    batch(chunk);chunk.position.z=30-k*60;scene.add(chunk);chunks.push(chunk);
  }
  const sky=new THREE.Group();for(let i=0;i<12;i++){const x=(i%2===0?-1:1)*(20+(i*11)%60),z=-55-i*15;for(let j=0;j<4;j++)ball(sky,x+j*3,24+(i%4)*4,z,3.5,0xfffae8,[1.6,.38,1]);}batch(sky);scene.add(sky);
  const startArch=new THREE.Group();for(const s of [-1,1])box(startArch,s*5.2,4.2,-25,.45,8.4,.45,0x547e72);box(startArch,0,8.5,-25,11.1,1.3,.5,0xf9d481);placard(startArch,'SUNNY SIDE',0,8.48,-24.73,8.8,1.05,'#f9d481','#3c6658');scene.add(startArch);
  return {chunks,startArch,update(ds){for(const chunk of chunks){chunk.position.z+=ds;if(chunk.position.z>90)chunk.position.z-=240}startArch.position.z+=ds;if(startArch.position.z>60)startArch.visible=false},reset(){chunks.forEach((c,i)=>c.position.z=30-i*60);startArch.position.z=0;startArch.visible=true}};
}
export function makeTrain(color=0x68b8a7,length=11){
  const g=new THREE.Group();box(g,0,.45,0,2.75,.5,length,0x496f6d);box(g,0,1.85,0,2.76,2.45,length,color);box(g,0,3.13,0,2.58,.33,length-.2,0xf7e6b6);box(g,0,1.05,0,2.82,.17,length+.02,0xf6d486);box(g,0,1.25,0,2.84,.08,length+.02,0xeef0cd);const front=length/2+.04;box(g,0,2.18,front,2.16,.94,.06,0x344f5b);box(g,0,2.24,front+.04,.1,.86,.05,0xa0cab8);box(g,0,2.53,front+.05,2.08,.06,.03,0xc4dfcb);box(g,0,1.05,front,.72,.2,.12,0xf5e1b2);for(const s of [-1,1]){box(g,s*.94,.89,front+.04,.3,.22,.12,0xffefb8);box(g,s*1.4,1.9,-.2,.04,1.8,1.02,0xadd1bc);box(g,s*1.43,1.95,-.2,.04,1.5,.07,0x668d80);for(let i=0;i<4;i++){const z=-length/2+1.4+i*(length-2.8)/3;box(g,s*1.395,2.24,z,.045,.88,1.35,0x3f6873);box(g,s*1.43,2.5,z,.025,.055,1.3,0xa8d8cf)}for(const z of [-length*.33,length*.33]){const wheel=cylinder(g,s*1.15,.35,z,.31,.31,.36,0x334e4e,12);wheel.rotation.z=Math.PI/2;}}
  box(g,0,3.42,-.7,1.25,.25,2.8,0xd8d4ad);box(g,0,3.58,-.7,.9,.12,1.4,0xb5bda1);
  const graffiti=placard(g,'RUSH',0,1.53,front+.05,1.6,.42,'#68b8a7','#fff0b4');graffiti.rotation.z=-.08;
  return g;
}
export function makeBarrier(type){const g=new THREE.Group();if(type==='hurdle'){
  for(const x of [-1.08,1.08]){box(g,x,.53,0,.2,1.06,.28,0xf5dfb3);box(g,x,.1,0,.6,.16,.8,0x6c8272)}box(g,0,.81,0,2.5,.55,.3,0xf5e3b8);for(let i=-2;i<=2;i++){const s=box(g,i*.48,.81,.16,.24,.54,.025,0xe9764b);s.rotation.z=-.42;}
  }else{for(const x of [-1.15,1.15]){box(g,x,1.8,0,.18,3.6,.24,0x597c6d);box(g,x,.12,0,.5,.2,.65,0x5f7b6b)}box(g,0,2.9,0,2.65,1.4,.35,0xf0bd58);box(g,0,2.23,.19,2.65,.15,.07,0xfef0c4);for(let i=-2;i<=2;i++){const s=box(g,i*.5,2.9,.19,.23,1.35,.035,0xe36f49);s.rotation.z=-.2;}box(g,0,3.85,0,.45,.3,.32,0xff8050);}
  return g;
}
export function makeBoard(color=0xff7647){const g=new THREE.Group();box(g,0,.08,0,.64,.16,1.5,color);for(const z of [-.75,.75])ball(g,0,.1,z,.32,color,[1,.25,1]);box(g,0,.18,0,.4,.04,1.05,0x344f56);for(const z of [-.5,.5])box(g,0,-.06,z,.64,.12,.2,0x7acdd0);const stripe=box(g,0,.21,0,.12,.01,.8,0xf7d879);stripe.rotation.y=.25;return g}
export function makeRunner(color=0xf2dfb5){
  const root=new THREE.Group(),body=new THREE.Group();root.add(body);
  const torso=box(body,0,1.38,0,.66,.73,.43,color);ball(body,0,1.78,-.04,.36,color,[1,.6,.85]);
  box(body,0,1.17,.24,.42,.18,.04,color);box(body,0,1.4,.245,.08,.22,.025,0xff8d58);box(body,-.12,1.63,.24,.025,.27,.025,0xfff5db);box(body,.12,1.63,.24,.025,.27,.025,0xfff5db);
  box(body,0,1.42,-.33,.47,.54,.22,0xe4aa49);box(body,0,1.32,-.46,.3,.2,.05,0xf8cc67);for(const x of [-.21,.21])box(body,x,1.45,.25,.065,.65,.055,0xdba74d);
  const head=new THREE.Group();head.position.y=1.97;body.add(head);ball(head,0,0,0,.29,0xc7875b,[.9,1.08,.9]);box(head,0,-.03,.265,.29,.08,.05,0xd89667);for(const x of [-.1,.1]){box(head,x,.05,.25,.045,.07,.035,0x3d4238);ball(head,x*2.6,0,0,.075,0xc7875b,[1,1.2,.7]);}box(head,0,-.13,.255,.12,.025,.015,0xf9e1b2);ball(head,0,.17,-.01,.29,0x374a42,[1,.55,1]);ball(head,0,.24,-.02,.3,0xf66d49,[1,.65,1.05]);box(head,0,.25,-.26,.4,.06,.28,0xf66d49);box(head,0,.27,.265,.19,.12,.03,0xf4dfba);
  const arms=[],legs=[];for(const side of [-1,1]){const arm=new THREE.Group();arm.position.set(side*.42,1.65,0);body.add(arm);box(arm,0,-.23,0,.23,.5,.25,color);ball(arm,0,-.56,.025,.115,0xc98a60,[1,1.3,1]);arm.rotation.z=side*.12;arms.push(arm);const leg=new THREE.Group();leg.position.set(side*.18,1.04,0);body.add(leg);box(leg,0,-.34,0,.255,.64,.28,0x4f88a7);box(leg,0,-.69,.02,.24,.18,.28,0x397796);box(leg,0,-.89,.08,.28,.24,.48,0xf9e8c8);box(leg,0,-.95,.1,.3,.1,.5,0xe66949);box(leg,0,-.8,.23,.22,.07,.12,0xfef5db);legs.push(leg);}
  const board=makeBoard();board.position.y=.04;board.visible=false;root.add(board);
  const shadow=new THREE.Mesh(new THREE.CircleGeometry(.66,24),new THREE.MeshBasicMaterial({color:0x385e50,transparent:true,opacity:.2,depthWrite:false}));shadow.rotation.x=-Math.PI/2;shadow.position.y=.025;sceneDummy(root,shadow);
  return {root,body,head,arms,legs,torso,board,shadow,setColor(c){torso.material=material(c);for(const arm of arms)arm.children[0].material=material(c);body.children[1].material=material(c);},setBoard(c){board.traverse(m=>{if(m.isMesh&&m.material===material(0xff7647))m.material=material(c)})},animate(t,running,jumping,sliding,boarding){board.visible=boarding;const swing=running?Math.sin(t*15):Math.sin(t*2)*.12;body.position.y=boarding?.22:(running?Math.abs(Math.sin(t*15))*.07:Math.sin(t*2)*.025);body.rotation.x=sliding?-1.3:(boarding?-.07:0);body.position.z=sliding?.25:0;body.scale.y=sliding?.55:1;arms[0].rotation.x=sliding?-1.9:boarding?-.4:jumping?-1.1:swing*.65;arms[1].rotation.x=sliding?-1.9:boarding?.5:jumping?-1.1:-swing*.65;arms[0].rotation.z=boarding?-.85:-.12;arms[1].rotation.z=boarding?.85:.12;legs[0].rotation.x=sliding?.5:boarding?.1:jumping?-.6:-swing*.75;legs[1].rotation.x=sliding?.7:boarding?-.15:jumping?.3:swing*.75;head.rotation.y=running?0:Math.sin(t*.6)*.2;board.rotation.z=Math.sin(t*5)*.03;}};
}
function sceneDummy(root,shadow){root.userData.shadow=shadow;}
const coinGeometry=new THREE.CylinderGeometry(.34,.34,.11,14),coinMat=new THREE.MeshStandardMaterial({color:0xffd353,metalness:.45,roughness:.25}),coinRing=new THREE.TorusGeometry(.24,.024,4,14);
export function makeCoin(){const g=new THREE.Group();const disk=new THREE.Mesh(coinGeometry,coinMat);disk.rotation.x=Math.PI/2;disk.castShadow=true;g.add(disk);const ring=new THREE.Mesh(coinRing,material(0xffed9b));ring.position.z=.065;g.add(ring);const slash=box(g,0,0,.07,.075,.27,.02,0xffef9d);slash.rotation.z=-.2;return g}
export function makePowerup(type){const g=new THREE.Group();const color=type==='magnet'?0xee6a4e:0x96c9d4;const orb=new THREE.Mesh(new THREE.IcosahedronGeometry(.68,1),new THREE.MeshStandardMaterial({color,transparent:true,opacity:.32,metalness:.3,roughness:.2}));g.add(orb);if(type==='magnet'){for(const x of [-.22,.22]){box(g,x,.1,0,.18,.6,.2,0xf5d8af);box(g,x,.28,0,.19,.21,.22,0xf47152)}box(g,0,-.23,0,.6,.18,.2,0xf47152);}else{const shoe=box(g,0,0,0,.5,.3,.7,0xfcf3d6);box(g,0,-.14,.03,.54,.1,.77,0x6bbfc3);box(g,0,.11,-.15,.4,.24,.35,0xfbbd4d);shoe.rotation.z=.15;}return g}
