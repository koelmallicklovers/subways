import test from 'node:test';
import assert from 'node:assert/strict';
import { RunnerEngine } from './engine.js';
function empty(){const e=new RunnerEngine(()=>.5);e.start();e.entities=[];e.events=[];e.spawnRow=()=>{};return e;}
const advance=(e,t)=>{for(let i=0;i<t*120;i++)e.update(1/120)};
test('lane changes stay inside the tracks and settle smoothly',()=>{const e=empty();for(let i=0;i<5;i++)e.action('right');advance(e,.6);assert.equal(e.lane,1);assert.ok(Math.abs(e.x-3.15)<.01);for(let i=0;i<5;i++)e.action('left');assert.equal(e.lane,-1)});
test('coins are collected once and contribute to score',()=>{const e=empty();e.add('coin',0,-1);advance(e,.2);assert.equal(e.coins,1);assert.equal(e.score,Math.floor(e.distance*10)+50);assert.ok(!e.entities.some(x=>x.type==='coin'))});
test('a grounded runner crashes into a low hurdle',()=>{const e=empty();e.add('hurdle',0,-2);advance(e,.2);assert.equal(e.phase,'gameover')});
test('jump clears a hurdle, returns to ground, and disallows double jumping',()=>{const e=empty();e.add('hurdle',0,-7);assert.equal(e.action('jump'),true);advance(e,.2);assert.equal(e.action('jump'),false);advance(e,1);assert.equal(e.phase,'running');assert.equal(e.y,0);assert.equal(e.jumpCount,1)});
test('rolling clears an overhead barrier; standing does not',()=>{const e=empty();e.add('arch',0,-4);e.action('slide');advance(e,.5);assert.equal(e.phase,'running');const f=empty();f.add('arch',0,-4);advance(f,.5);assert.equal(f.phase,'gameover')});
test('hoverboards absorb a crash, expire, and consume inventory',()=>{const e=empty();e.action('board');assert.equal(e.boards,1);e.add('train',0,-6,{length:11});advance(e,.1);assert.equal(e.phase,'running');assert.equal(e.boardTime,0);assert.ok(e.invincible>0);assert.ok(e.events.some(x=>x.type==='shield'));advance(e,2.5);e.add('train',0,-6,{length:11});advance(e,.1);assert.equal(e.phase,'gameover')});
test('ramps carry the runner onto a train roof, then back down',()=>{const e=empty();e.add('train',0,-12,{length:11,ramp:true});advance(e,.7);assert.equal(e.phase,'running');assert.ok(e.y>=3.3);advance(e,1.3);assert.equal(e.phase,'running');assert.equal(e.y,0)});
test('magnet collects coins from other lanes',()=>{const e=empty();e.magnetTime=5;e.add('coin',1,-5);advance(e,.3);assert.equal(e.coins,1)});
test('super sneakers jump higher and powers expire',()=>{const a=empty(),b=empty();b.shoesTime=12;a.action('jump');b.action('jump');advance(a,.4);advance(b,.4);assert.ok(b.y>a.y+1);advance(b,13);assert.equal(b.shoesTime,0)});
test('pause freezes distance, entities, and power-up timers',()=>{const e=empty();e.magnetTime=5;e.add('coin',1,-10);e.phase='paused';advance(e,2);assert.equal(e.distance,0);assert.equal(e.magnetTime,5);assert.equal(e.entities[0].z,-10)});
test('generated obstacle rows always leave a safe lane',()=>{let seed=734;const rng=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/2**32};const e=new RunnerEngine(rng);for(let i=0;i<500;i++){e.entities=[];e.spawnRow(-100);const obstacles=e.entities.filter(x=>['hurdle','arch','train'].includes(x.type));assert.ok(new Set(obstacles.map(x=>x.lane)).size<=2)}});
test('restart clears the previous run and restores boards',()=>{const e=empty();e.score=1200;e.coins=25;e.boards=0;e.phase='gameover';e.start();assert.equal(e.score,0);assert.equal(e.coins,0);assert.equal(e.boards,2);assert.equal(e.phase,'running')});
