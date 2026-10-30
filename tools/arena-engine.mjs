// QuRa Arena deterministic research engine — T2; no browser, network or ledger.
// PROTOTYPE parity target: arena-live-3x3/team-core.js; numbers are unchanged.
export const HEROES = Object.freeze([
{id:'r',name:'Ряба',hp:108,attack:24,defense:21,speed:18},
{id:'b',name:'Боевик',hp:112,attack:26,defense:23,speed:14},
{id:'f',name:'Дурочка',hp:102,attack:24,defense:17,speed:26},
{id:'p',name:'Профессор',hp:102,attack:25,defense:19,speed:22},
{id:'m',name:'Монах',hp:110,attack:21,defense:24,speed:15},
{id:'g',name:'Гламурочка',hp:102,attack:23,defense:19,speed:24}
]);
export const ACTIONS=Object.freeze(['attack','defend','maneuver','special']);
const num=v=>Math.max(0,Math.round(v));
export function seeded(seed=20261030){let x=seed>>>0;return()=>((x=Math.imul(x,1664525)+1013904223>>>0)/4294967296)}
export function createFighter(id,{level=4,stats={}}={}){
 const hero=HEROES.find(h=>h.id===id);if(!hero)throw Error('unknown hero');
 return {id,name:hero.name,hp:stats.hp??hero.hp,maxHp:stats.hp??hero.hp,a:stats.attack??hero.attack,d:stats.defense??hero.defense,s:stats.speed??hero.speed,q:0,shield:0,boost:0,weaken:0,dead:false,level};
}
export function legal(f){return f&&!f.dead&&f.hp>0?(f.q>=100?ACTIONS:ACTIONS.slice(0,3)):[]}
export function take(f,raw){
 let n=Math.max(0,raw);if(f.shield>0){const absorbed=Math.min(f.shield,n);f.shield-=absorbed;n-=absorbed}
 const hp=num(n);f.hp=Math.max(0,f.hp-hp);f.dead=f.hp===0;return hp
}
function charge(f,v){f.q=Math.min(100,Math.max(0,f.q+v))}
function baseDamage(a,d,m=1){
 let value=(20+1.15*a.a-.72*d.d)*m;
 if(a.boost){value*=1+a.boost;a.boost=0}
 if(a.weaken){value*=1-a.weaken;a.weaken=0}
 return Math.max(5,value);
}
function hit(a,d,m=1){return take(d,baseDamage(a,d,m))}
function counter(d,a){return take(a,15+.45*d.d-.18*a.d)}
export function maneuver(c,e){
 if(c.id==='r'){c.shield+=10;return take(e,24)}
 if(c.id==='b'){c.boost=Math.max(c.boost,.18);return take(e,25)}
 if(c.id==='f'){c.boost=Math.max(c.boost,.20);return take(e,31)}
 if(c.id==='p'){e.q=Math.max(0,e.q-18);return take(e,26)}
 if(c.id==='m'){c.hp=Math.min(c.maxHp,c.hp+12);return take(e,24)}
 e.weaken=Math.max(e.weaken,.22);return take(e,27)
}
export function special(c,e,defended,rng){
 c.q=0;
 if(c.id==='r'){c.shield+=defended?14:18;return take(e,defended?11:25)}
 if(c.id==='b')return take(e,46*(defended?.45:1));
 if(c.id==='f')return take(e,(rng<.10?0:rng<.35?58:43)*(defended?.45:1));
 if(c.id==='p')return take(e,45*(defended?.5:1));
 if(c.id==='m'){c.hp=Math.min(c.maxHp,c.hp+27);return take(e,18*(defended?.5:1))}
 e.weaken=Math.max(e.weaken,.30);return take(e,41*(defended?.5:1))
}
export function resolveClash(a,b,ma,mb,randomValue=.5){
 if(!legal(a).includes(ma)||!legal(b).includes(mb))throw Error('illegal or dead fighter action');
 let da=0,db=0,w=0;const hpA=a.hp,hpB=b.hp;
 if(ma==='special'||mb==='special'){
  if(ma==='special')da+=special(a,b,mb==='defend',randomValue);
  if(mb==='special')db+=special(b,a,ma==='defend',1-randomValue);
  if(ma==='attack')da+=hit(a,b,.35);
  if(mb==='attack')db+=hit(b,a,.35);
  if(ma==='maneuver')da+=maneuver(a,b);
  if(mb==='maneuver')db+=maneuver(b,a);
 }else if(ma===mb){
  if(ma==='attack'){da+=hit(a,b,a.s>b.s?1.10:1);db+=hit(b,a,b.s>a.s?1.10:1)}
  if(ma==='maneuver'){
   if(a.s>=b.s){da+=maneuver(a,b);db+=hit(b,a,.45);w=1}
   else{db+=maneuver(b,a);da+=hit(a,b,.45);w=2}
  }
 }else{
  const k=ma[0]+mb[0];
  if(k==='am'){da=hit(a,b,1.45);w=1}
  else if(k==='ma'){db=hit(b,a,1.45);w=2}
  else if(k==='md'){da=maneuver(a,b);w=1}
  else if(k==='dm'){db=maneuver(b,a);w=2}
  else if(k==='da'){db=hit(b,a,.22);da=counter(a,b);w=1}
  else if(k==='ad'){da=hit(a,b,.22);db=counter(b,a);w=2}
 }
 if(!w){if(da>db+5)w=1;else if(db>da+5)w=2}
 charge(a,w===1?35:w===2?15:20);charge(b,w===2?35:w===1?15:20);
 return {ma,mb,w,damageToA:hpA-a.hp,damageToB:hpB-b.hp,after:[a.hp,b.hp],charge:[a.q,b.q]};
}
export function fight1v1(idA,idB,{seed=1,maxRounds=30,strategyA='random',strategyB='random'}={}){
 const a=createFighter(idA),b=createFighter(idB),rng=seeded(seed);const history=[];let winner=0;
 for(let round=1;round<=maxRounds;round++){
  const ma=choose(a,b,strategyA,rng),mb=choose(b,a,strategyB,rng);
  const outcome=resolveClash(a,b,ma,mb,rng());history.push({round,...outcome});
  if(a.dead||b.dead){winner=a.dead&&b.dead?3:a.dead?2:1;break}
 }
 if(!winner){winner=a.hp/a.maxHp>b.hp/b.maxHp?1:b.hp/b.maxHp>a.hp/a.maxHp?2:3}
 return {winner,rounds:history.length,history,remaining:[a.hp,b.hp]};
}
function evaluate(a,b,actA,actB){
 const ca={...a},cb={...b};resolveClash(ca,cb,actA,actB,.5);
 return ((cb.hp-b.hp)-(ca.hp-a.hp)) + .28*(ca.hp-a.hp-cb.hp+b.hp) + .22*(ca.shield-a.shield-cb.shield+b.shield) + .09*(ca.q-a.q-cb.q+b.q) + (cb.dead?50:0)-(ca.dead?50:0);
}
export function equilibrium(a,b,iterations=24){
 const la=legal(a),lb=legal(b),scores=la.map(x=>lb.map(y=>evaluate(a,b,x,y)));
 // approximate mixed minimax via simultaneous multiplicative weights.
 let pa=la.map(()=>1/la.length),pb=lb.map(()=>1/lb.length),avgA=pa.map(()=>0),avgB=pb.map(()=>0);
 for(let t=0;t<iterations;t++){
  for(let i=0;i<pa.length;i++)avgA[i]+=pa[i]/iterations;
  for(let j=0;j<pb.length;j++)avgB[j]+=pb[j]/iterations;
  const va=pa.map((_,i)=>scores[i].reduce((z,s,j)=>z+s*pb[j],0));
  const vb=pb.map((_,j)=>-scores.reduce((z,row,i)=>z+row[j]*pa[i],0));
  const eta=.025;const na=va.map(v=>Math.exp(Math.max(-20,Math.min(20,eta*v)))),nb=vb.map(v=>Math.exp(Math.max(-20,Math.min(20,eta*v))));
  pa=pa.map((p,i)=>p*na[i]);pb=pb.map((p,j)=>p*nb[j]);
  let za=pa.reduce((x,y)=>x+y),zb=pb.reduce((x,y)=>x+y);
  pa=pa.map(x=>x/za);pb=pb.map(x=>x/zb);
 }
 return {actions:la,probabilities:avgA};
}
export function choose(a,b,style,rng){
 const choices=legal(a);if(!choices.length)throw Error('dead fighter');
 if(style==='random')return choices[Math.floor(rng()*choices.length)];
 if(style==='greedy'){
  return choices.map(x=>({x,value:legal(b).reduce((sum,y)=>sum+evaluate(a,b,x,y),0)/legal(b).length})).sort((u,v)=>v.value-u.value)[0].x;
 }
 if(style==='equilibrium'){const mix=equilibrium(a,b),v=rng();let sum=0;for(let i=0;i<mix.actions.length;i++){sum+=mix.probabilities[i];if(v<=sum)return mix.actions[i]}return mix.actions.at(-1)}
 throw Error('unknown strategy');
}
export function createTeam(ids){if(ids.length<1||ids.length>3)throw Error('team size 1..3');return ids.map((id,pos)=>Object.assign(createFighter(id),{pos}))}
export function pairings(teamA,teamB){
 const alive=t=>t.filter(c=>!c.dead);const a=alive(teamA),b=alive(teamB);
 if(!a.length||!b.length)return[];
 const anchor=a.length>=b.length?1:2,other=anchor===1?b:a;
 return (anchor===1?a:b).map(c=>{const target=other.find(x=>x.pos===c.pos)||other.slice().sort((u,v)=>((u.pos-c.pos+3)%3)-((v.pos-c.pos+3)%3))[0];return anchor===1?[c,target]:[target,c]})
}
export function resolveWall(teamA,teamB,movesA,movesB,rng=seeded(1)){
 const results=[];for(const [a,b] of pairings(teamA,teamB)){
  if(a.dead||b.dead)continue;
  results.push(resolveClash(a,b,movesA[a.pos],movesB[b.pos],rng()));
 }
 return results
}
export function assertInvariants(team){for(const f of team){if(f.hp<0||f.hp>f.maxHp||f.q<0||f.q>100||Boolean(f.dead)!==(f.hp===0))throw Error('bad fighter state')}}

/**
 * JRPG target-mode adaptation of the browser prototype.
 * Actions are resolved defend-first then by current speed, with fallback to
 * next living enemy at/after the selected slot (prototype retarget rule).
 */
export function resolveTarget(teamA,teamB,movesA,movesB,rng=seeded(1)){
 const teams=[teamA,teamB],moves=[movesA,movesB],actions=[];
 for(let side=0;side<2;side++)for(const c of teams[side]){
  if(!c.dead){const cmd=moves[side][c.pos];if(cmd?.move)actions.push({side,c,move:cmd.move,target:cmd.target??c.pos})}
 }
 actions.sort((a,b)=>(a.move==='defend'?-1:0)-(b.move==='defend'?-1:0)||b.c.s-a.c.s);
 const results=[],defended=new Set();
 for(const act of actions){
  if(act.c.dead)continue;
  if(act.move==='defend'){
   if(!defended.has(act.c)){charge(act.c,18);defended.add(act.c)}
   continue;
  }
  const enemies=teams[1-act.side].filter(e=>!e.dead);
  if(!enemies.length)break;
  const target=enemies.find(e=>e.pos===act.target)||
    enemies.slice().sort((a,b)=>((a.pos-act.target+3)%3)-((b.pos-act.target+3)%3))[0];
  const enemyMove=moves[1-act.side][target.pos]?.move||'attack';
  const before=[act.c.hp,target.hp];let winner=0,damage=0;
  if(act.move==='attack'){
   if(enemyMove==='defend'){damage=hit(act.c,target,.22);counter(target,act.c);winner=2}
   else if(enemyMove==='maneuver'){damage=hit(act.c,target,1.45);winner=1}
   else if(enemyMove==='special')damage=hit(act.c,target,.35);
   else damage=hit(act.c,target,act.c.s>target.s?1.10:1);
  }else if(act.move==='maneuver'){
   if(enemyMove==='attack')damage=take(target,10);
   else {damage=maneuver(act.c,target);winner=enemyMove==='defend'?1:0}
  }else if(act.move==='special'){
   if(act.c.q<100)throw Error('illegal special');
   damage=special(act.c,target,enemyMove==='defend',rng());
   winner=enemyMove==='defend'?0:1;
  }else throw Error('illegal action');
  charge(act.c,winner===1?35:20);
  results.push({side:act.side+1,actorPos:act.c.pos,targetPos:target.pos,move:act.move,opponentMove:enemyMove,damage,before,after:[act.c.hp,target.hp],winner});
 }
 assertInvariants([...teamA,...teamB]);return results;
}

export const DEFENSE_TACTICS=Object.freeze(['aggressive','cautious','tricky']);
export function chooseDefense(f,enemy,tactic,rng){
 if(!DEFENSE_TACTICS.includes(tactic))throw Error('unknown defense tactic');
 const moves=legal(f),weights={
  aggressive:{attack:4,defend:1,maneuver:2,special:3},
  cautious:{attack:2,defend:4,maneuver:2,special:3},
  tricky:{attack:2,defend:2,maneuver:4,special:3}
 }[tactic];
 const total=moves.reduce((n,k)=>n+weights[k],0);let needle=rng()*total;
 for(const move of moves){needle-=weights[move];if(needle<=0)return move}return moves.at(-1)
}
export function fight3v3(teamIdsA,teamIdsB,{seed=1,maxRounds=30,strategyA='equilibrium',strategyB='equilibrium'}={}){
 const A=createTeam(teamIdsA),B=createTeam(teamIdsB),rng=seeded(seed),history=[];
 for(let round=1;round<=maxRounds;round++){
  const moveA=[],moveB=[];
  for(const c of A)if(!c.dead){const e=B.find(b=>!b.dead);if(e)moveA[c.pos]=DEFENSE_TACTICS.includes(strategyA)?chooseDefense(c,e,strategyA,rng):choose(c,e,strategyA,rng)}
  for(const c of B)if(!c.dead){const e=A.find(a=>!a.dead);if(e)moveB[c.pos]=DEFENSE_TACTICS.includes(strategyB)?chooseDefense(c,e,strategyB,rng):choose(c,e,strategyB,rng)}
  const clashes=resolveWall(A,B,moveA,moveB,rng);history.push({round,clashes,aliveA:A.filter(x=>!x.dead).length,aliveB:B.filter(x=>!x.dead).length});
  if(!A.some(x=>!x.dead)||!B.some(x=>!x.dead))break;
 }
 const aliveA=A.filter(x=>!x.dead).length,aliveB=B.filter(x=>!x.dead).length;
 return {winner:aliveA&& !aliveB?1:aliveB&&!aliveA?2:!aliveA&&!aliveB?3:0,rounds:history.length,history,remaining:[aliveA,aliveB]};
}
