export const LANE_WIDTH=3.15;
export const OUTFITS=[{name:'Sunrise',color:0xf2dfb5},{name:'Lagoon',color:0x64bbaa},{name:'Afterhours',color:0x9b8abd}];
export const BOARDS=[{name:'Daybreaker',color:0xff7647},{name:'Seafoam',color:0x68c6ba},{name:'Lemonade',color:0xe9c850}];
export class RunnerEngine{
 constructor(random=Math.random){this.random=random;this.reset()}
 reset(){this.phase='menu';this.lane=0;this.x=0;this.y=0;this.vy=0;this.slide=0;this.speed=18;this.distance=0;this.score=0;this.coins=0;this.time=0;this.jumpCount=0;this.dodgeCount=0;this.boardTime=0;this.boards=2;this.magnetTime=0;this.shoesTime=0;this.invincible=0;this.entities=[];this.events=[];this.spawnAt=0;this.row=0;this.combo=0;this.nextId=1;this.floor=0;this.reason='';}
 start(){this.reset();this.phase='running';for(let z=-35;z>=-155;z-=28)this.spawnRow(z);}
 emit(type,data={}){this.events.push({type,...data})}
 takeEvents(){const e=this.events;this.events=[];return e}
 action(action){if(this.phase!=='running')return false;if(action==='left'||action==='right'){const before=this.lane;this.lane=Math.max(-1,Math.min(1,this.lane+(action==='left'?-1:1)));if(before!==this.lane)this.emit('switch');return before!==this.lane}
  if(action==='jump'&&this.y<=this.floor+.08){this.vy=this.shoesTime>0?17:12.4;this.slide=0;this.jumpCount++;this.emit('jump');return true}
  if(action==='slide'){if(this.y>this.floor+.1)this.vy=-19;this.slide=.85;this.emit('slide');return true}
  if(action==='board'&&this.boards>0&&this.boardTime<=0){this.boards--;this.boardTime=14;this.emit('board');return true}return false;
 }
 add(type,lane,z,extra={}){const e={id:this.nextId++,type,lane,z,y:type==='coin'?1.1:0,...extra};this.entities.push(e);this.emit('spawn',{entity:e});return e}
 spawnRow(z){const r=this.row++,safe=r===0?0:Math.floor(this.random()*3)-1;const obstacleLanes=[-1,0,1].filter(l=>l!==safe);let train=null;
  if(r===0){this.add('train',-1,z,{length:11,ramp:false,color:0x67b9a8});this.add('hurdle',1,z)}
  else{const count=r<3?1:(this.random()<.28?1:2);for(let i=0;i<count;i++){const lane=obstacleLanes[i];const roll=this.random();const type=roll<.47?'train':roll<.75?'hurdle':'arch';const e=this.add(type,lane,z,{length:11,ramp:type==='train'&&r%3===0,color:r%2?0x68b9ac:0xe7ad5f});if(e.ramp)train=e;}}
  for(let j=0;j<6;j++)this.add('coin',safe,z+10-j*2.25);
  if(train){for(let j=0;j<5;j++)this.add('coin',train.lane,z+4-j*1.9,{y:4.2});}
  if(r>1&&r%5===3)this.add(r%10===3?'magnet':'shoes',safe,z+15,{y:1.45});
 }
 hit(entity){if(this.invincible>0)return;if(this.boardTime>0){this.boardTime=0;this.invincible=2.1;this.emit('shield');for(const e of this.entities)if(e.type!=='coin'&&Math.abs(e.z)<18)e.dead=true;return;}
  this.phase='gameover';this.reason=entity.type==='train'?'That train had other plans.':entity.type==='arch'?'Keep it low. Roll under the barrier.':'A little jump goes a long way.';this.emit('crash',{entity});
 }
 update(dt){if(this.phase!=='running')return;dt=Math.min(.05,Math.max(0,dt));this.time+=dt;this.speed=Math.min(33,18+this.distance*.006);const ds=this.speed*dt;this.distance+=ds;this.score=Math.floor(this.distance*10)+this.coins*50;this.x+=(this.lane*LANE_WIDTH-this.x)*Math.min(1,dt*15);this.slide=Math.max(0,this.slide-dt);for(const name of ['boardTime','magnetTime','shoesTime','invincible'])this[name]=Math.max(0,this[name]-dt);
  for(const e of this.entities)e.z+=ds;
  let floor=0;for(const e of this.entities){if(e.dead||e.type!=='train'||Math.abs(this.x-e.lane*LANE_WIDTH)>.9)continue;const front=e.z+e.length/2;if(e.ramp&&front<0&&front>-5){floor=Math.max(floor,3.35*(1+front/5))}if(Math.abs(e.z)<e.length/2+.15&&this.y>=3.05)floor=Math.max(floor,3.35)}
  this.floor=floor;this.vy-=29*dt;this.y+=this.vy*dt;if(this.y<=floor){this.y=floor;this.vy=0}if(this.slide>0&&floor>2)this.slide=0;
  for(const e of this.entities){if(e.dead)continue;const dx=Math.abs(this.x-e.lane*LANE_WIDTH);if(e.type==='coin'){
    if(this.magnetTime>0&&e.z>-13&&e.z<3){e.y+=(this.y+1-e.y)*dt*9;e.attract=(e.attract||0)+dt*9;}
    if((dx<1.1&&Math.abs(e.z)<.9&&Math.abs(this.y+1.05-e.y)<1.2)||(this.magnetTime>0&&e.z>-4&&e.z<2)){e.dead=true;this.coins++;this.combo++;this.emit('coin',{entity:e});if(this.combo%25===0)this.emit('coinMilestone',{amount:this.combo});}
   }else if(e.type==='magnet'||e.type==='shoes'){
    if(dx<1.1&&Math.abs(e.z)<1.1&&Math.abs(this.y+1.1-e.y)<1.7){e.dead=true;this[e.type==='magnet'?'magnetTime':'shoesTime']=12;this.emit('powerup',{power:e.type});}
   }else{
    if(dx<.88){if(e.type==='train'&&Math.abs(e.z)<e.length/2+.15&&this.y<3.03)this.hit(e);else if(e.type==='hurdle'&&Math.abs(e.z)<.65&&this.y<1.02)this.hit(e);else if(e.type==='arch'&&Math.abs(e.z)<.6&&this.slide<=0&&this.y<3.8)this.hit(e);}
    if(e.z>8&&!e.passed){e.passed=true;this.dodgeCount++;this.emit('dodge')}
   }
   if(e.z>22)e.dead=true;
  }
  this.entities=this.entities.filter(e=>!e.dead);
  const lastZ=this.entities.reduce((m,e)=>Math.min(m,e.z),0);if(lastZ>-150)this.spawnRow(lastZ-28);
  this.score=Math.floor(this.distance*10)+this.coins*50;
 }
}
