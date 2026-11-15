// Shared deterministic motion in metres. Foot origin stays above the floor.
// The presentation is layered 2.5D; ballistic motion itself uses gravity.
export const HEN_GRAVITY=9.81;
export const HEN_RELEASE_S=.16;
export const HEN_FALL_S=Math.sqrt(2*1.44/HEN_GRAVITY);
export const HEN_LAND_S=.24;
const cap=(v,a,b)=>Math.min(b,Math.max(a,v));
export function henMotion(target,time){
 const age=Math.max(0,time-target.solvedAt),seed=target.id.charCodeAt(target.id.length-1),direction=seed%2?1:-1,startX=target.fallX??target.baseX;
 const fallEnd=HEN_RELEASE_S+HEN_FALL_S,landEnd=fallEnd+HEN_LAND_S;
 if(age<HEN_RELEASE_S)return {x:startX,y:1.47-Math.sin(age/HEN_RELEASE_S*Math.PI)*.025,z:-.12,mode:'release',age,speed:0,roll:direction*.06*Math.sin(age*18),squash:1,grounded:false};
 if(age<fallEnd){const t=age-HEN_RELEASE_S,p=t/HEN_FALL_S;return {x:startX+direction*.15*p,y:.03+1.44-.5*HEN_GRAVITY*t*t,z:-.12-.25*p,mode:'fall',age,speed:0,roll:direction*Math.sin(p*Math.PI)*.14,squash:1,grounded:false};}
 if(age<landEnd){const t=age-fallEnd,p=t/HEN_LAND_S;return {x:startX+direction*.15,y:.03+Math.abs(Math.sin(t*22))*.035*Math.exp(-t*12),z:-.37,mode:'land',age,speed:0,roll:direction*.04*Math.sin(p*Math.PI*2),squash:1-.14*Math.sin(p*Math.PI),grounded:true};}
 const groundAge=age-landEnd,period=8.6+(seed%3)*.2,cycle=Math.floor(groundAge/period),phase=groundAge%period,walkS=3.8,dir=direction*(cycle%2?-1:1);
 const from=cycle===0?direction*.15:-dir*1.3,to=dir*1.3,p=cap(phase/walkS,0,1),ease=p*p*(3-2*p);
 const distance=(cycle===0?0:1.15+Math.max(0,cycle-1)*2.6)+Math.abs(to-from)*ease;
 const mode=phase<walkS?'walk':phase<walkS+.3?'turn':phase<6.6?'peck':'look';
 return {x:startX+from+(to-from)*ease,y:.03,z:-.37-.16*Math.sin(p*Math.PI),mode,age,phase,speed:phase<walkS?(to-from)*6*p*(1-p)/walkS:0,roll:mode==='walk'?Math.sin(groundAge*9)*.018:0,squash:1,stepPhase:distance/.28*Math.PI*2,grounded:true};
}

// Keep grounded hens from passing through one another while preserving their lanes.
export function groundMotions(targets,time){
 const poses=new Map();for(const t of targets)if(t.solved&&t.bodyY!==.03)poses.set(t.id,henMotion(t,time));
 const ordered=targets.filter(t=>poses.get(t.id)?.grounded).sort((a,b)=>a.baseX-b.baseX);
 for(let pass=0;pass<3;pass++)for(let i=1;i<ordered.length;i++){const left=poses.get(ordered[i-1].id),right=poses.get(ordered[i].id),gap=right.x-left.x;if(gap<.9){const push=(.9-gap)/2;left.x-=push;right.x+=push;for(const p of [left,right]){p.mode='look';p.speed=0;p.roll=0;}}}
 return poses;
}
