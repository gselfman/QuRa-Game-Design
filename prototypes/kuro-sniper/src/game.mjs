export const CAST = [
  { id:'C01', code:'ryaba', name:'Ряба', role:'Спокойная цель', color:'#d9a75d' },
  { id:'C03', code:'fool', name:'Дурочка', role:'Раскачивает мишень', color:'#a3d4b4' },
  { id:'C04', code:'professor', name:'Профессор', role:'Искривляет траекторию', color:'#76d8dd' },
  { id:'C02', code:'fighter', name:'Боевик', role:'Заливает оптику', color:'#e59578' },
  { id:'C06', code:'glamour', name:'Гламурочка', role:'Заставляет волноваться', color:'#e8a5c7' },
];

export const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
export const lerp=(a,b,t)=>a+(b-a)*t;
export function scopeFov(baseFov,height,diameter,magnification){return 2*Math.atan(diameter/height*Math.tan(baseFov/2)/magnification);}
export function maxScore(hits=15){return hits*150+Array.from({length:hits},(_,i)=>Math.min(i*10,40)).reduce((a,b)=>a+b,0)+300;}
export function resolveImpact(point, targets, diameter){
  for(const target of targets){
    if(target.solved||target.penaltyUntil>0)continue;
    const radius=Math.hypot(point.x-target.x,point.y-target.y)/(diameter/2);
    if(radius<=1)return {kind:'target',targetId:target.id,center:radius<=.25,radius};
    const dx=Math.abs(point.x-target.x),dy=point.y-1.45;
    if(dx<.56&&dy>.03&&dy<1.30)return {kind:'hen',targetId:target.id};
  }
  return {kind:'miss'};
}

export class GameCore {
  constructor(balance,onEvent=(_event)=>{}){
    this.balance=balance;this.onEvent=onEvent;this.level=balance.levels[0];this.loadout=balance.loadouts[0];
    this.time=0;this.state='menu';this.paused=false;this.training=false;this.quiet=false;this.targets=[];
    this.score=0;this.ammo=18;this.mistakes=0;this.round=1;this.shots=0;this.hits=0;this.centers=0;this.streak=0;
    this.breath=100;this.holding=false;this.holdTime=0;this.lockout=0;this.stress=0;this.pulse=72;this.water=0;this.reduceSway=false;
    this.wiping=0;this.shot=null;this.cooldown=0;this.recoveryDelay=0;this.transition=0;this.phase='rest';this.sensory='none';this.sensoryTimer=0;this.abilityClock=0;this.abilityIndex=0;this.lastResult=null;
  }
  emit(type,data={}){this.onEvent({type,...data});}
  start(levelId=1,training=false){
    this.level=this.balance.levels.find(x=>x.id===levelId)||this.balance.levels[0];
    this.loadout=this.balance.loadouts.find(x=>x.id===this.level.loadoutId);
    this.training=training;this.score=0;this.ammo=18;this.mistakes=0;this.round=1;this.shots=0;this.hits=0;this.centers=0;this.streak=0;
    this.breath=100;this.stress=0;this.pulse=72;this.water=0;this.wiping=0;this.holding=false;this.lockout=0;this.holdTime=0;
    this.time=0;this.shot=null;this.cooldown=0;this.recoveryDelay=0;this.transition=0;this.paused=false;this.lastResult=null;this.state='playing';this.abilityClock=0;this.sensory='none';this.sensoryTimer=0;this.abilityIndex=0;this.setupRound();
    this.emit('start',{levelId:this.level.id,training});
  }
  setupRound(){
    const count=this.round;
    this.targets=CAST.slice(0,count).map((c,i)=>({id:c.id,code:c.code,name:c.name,baseX:(i-(count-1)/2)*1.9,x:(i-(count-1)/2)*1.9,y:.88,solved:false,solvedAt:-1,penaltyUntil:0,ability:0}));
    this.sensory='none';this.sensoryTimer=0;this.abilityClock=0;this.emit('round',{round:this.round,targets:this.targets});
  }
  get wind(){return this.quiet?0:this.level.windStrength*Math.sin(this.time*.32+this.level.id*.73);}
  get professorActive(){return !this.quiet&&this.targets.some(t=>t.code==='professor'&&!t.solved&&!t.penaltyUntil&&t.ability>.1);}
  target(id){return this.targets.find(t=>t.id===id);}
  hold(value){
    if(!value){if(this.holding)this.recoveryDelay=.6;this.holding=false;this.holdTime=0;return;}
    if(this.state==='playing'&&!this.paused&&this.breath>=25&&this.lockout<=0&&!this.wiping){this.holding=true;this.holdTime=0;this.emit('breath');}
  }
  wipe(){if(this.state==='playing'&&!this.paused&&this.water>.02&&!this.wiping&&!this.shot){this.wiping=.8;this.hold(false);this.emit('wipe');return true;}return false;}
  setPaused(value){if(['playing','transition'].includes(this.state)){this.paused=value;this.hold(false);this.emit('pause',{paused:value});}}
  aimSway(){
    if(this.quiet)return {x:0,y:0};
    const a=this.level.targetDiameterM/2/this.level.distanceM;
    const base=a*(.5+this.stress*.28)*(this.reduceSway?.45:1);
    const h=this.holding?.2:1;
    const heartbeat=Math.pow(Math.max(0,Math.sin(this.time*this.pulse/60*Math.PI*2)),12);
    return {x:Math.sin(this.time*1.28)*base*.45*h,y:Math.sin(this.time*1.57)*base*h+heartbeat*a*.17*(this.holding?.6:1)};
  }
  fire(origin,direction){
    if(this.state!=='playing'||this.paused||this.shot||this.cooldown>0||this.wiping||(!this.training&&this.ammo<=0))return false;
    if(direction.z<=.1)return false;
    this.ammo=Math.max(0,this.ammo-1);this.shots++;this.cooldown=this.loadout.cooldownS;
    const travel=(this.level.distanceM-origin.z)/direction.z;
    const wind=this.wind*this.level.targetDiameterM*.38;
    const directX=origin.x+direction.x*travel;
    const prof=this.targets.find(t=>t.code==='professor'&&!t.solved&&!t.penaltyUntil);
    const field=this.professorActive&&prof&&Math.abs(directX-prof.x)<.9?this.level.targetDiameterM*.38*this.level.abilityIntensity:0;
    this.shot={origin:{...origin},direction:{...direction},time:0,duration:this.level.flightTimeS,travel,wind,field,point:{...origin}};
    this.emit('fire');return true;
  }
  update(dt,inOptics=false){
    if(!this.paused&&['won','lost'].includes(this.state)){this.time+=dt;for(const t of this.targets)t.penaltyUntil=Math.max(0,t.penaltyUntil-dt);return;}
    if(this.paused||!['playing','transition'].includes(this.state))return;
    this.time+=dt;this.lockout=Math.max(0,this.lockout-dt);this.cooldown=Math.max(0,this.cooldown-dt);this.recoveryDelay=Math.max(0,this.recoveryDelay-dt);
    if(this.holding){
      this.holdTime+=dt;this.breath=Math.max(0,this.breath-25*dt);
      if(this.breath<=0||this.holdTime>=3){this.holding=false;this.holdTime=0;this.lockout=2;this.recoveryDelay=.6;this.emit('exhale');}
    }else if(!this.recoveryDelay)this.breath=Math.min(100,this.breath+20*dt);
    this.stress=clamp(this.stress-dt*(inOptics?.025:.08)+(this.sensory==='glamour'?dt*.12*this.level.abilityIntensity:0),0,1);
    const bpm=clamp(72+28*this.stress+(this.sensory==='glamour'?20*this.level.abilityIntensity:0),60,120);
    this.pulse=lerp(this.pulse,bpm,1-Math.exp(-dt/2));this.water=Math.max(0,this.water-dt*.15);
    if(this.wiping>0){this.wiping=Math.max(0,this.wiping-dt);this.water=Math.max(0,this.water-dt*2);if(this.wiping===0)this.emit('wiped');}
    for(const t of this.targets){
      if(t.penaltyUntil){t.penaltyUntil=Math.max(0,t.penaltyUntil-dt);if(!t.penaltyUntil)this.emit('returned',{targetId:t.id});}
      t.ability=0;t.x=t.baseX;t.y=.88;
      if(t.solved||t.penaltyUntil||this.quiet)continue;
      if(t.code==='fool'){
        const phase=this.time%5.7;t.ability=phase>.7&&phase<3.7?1:0;
        if(t.ability){t.x+=Math.sin((phase-.7)*3.3)*this.level.targetDiameterM*.75*this.level.abilityIntensity;t.y+=Math.sin((phase-.7)*6.6)*.045*this.level.abilityIntensity;}
      }
      if(t.code==='professor')t.ability=this.time%7>1&&this.time%7<4?1:0;
    }
    if(!this.quiet)this.updateSensory(dt);
    if(this.shot){
      const s=this.shot;s.time=Math.min(s.duration,s.time+dt);const f=s.time/s.duration;
      s.point={x:s.origin.x+s.direction.x*s.travel*f+(s.wind+s.field)*f*f,y:s.origin.y+s.direction.y*s.travel*f,z:s.origin.z+s.direction.z*s.travel*f};
      if(s.time>=s.duration){const result=resolveImpact(s.point,this.targets,this.level.targetDiameterM);this.shot=null;this.resolve(result);}
    }
    if(this.state==='transition'){
      this.transition-=dt;
      if(this.transition<=0){this.round++;this.state='playing';this.setupRound();}
    }
  }
  updateSensory(dt){
    this.abilityClock+=dt;
    if(this.sensoryTimer>0){
      this.sensoryTimer-=dt;
      if(this.sensory==='water-warning'&&this.sensoryTimer<=0){
        if(this.targets.some(t=>t.code==='fighter'&&!t.solved&&!t.penaltyUntil)){this.water=Math.min(1,this.water+.75*this.level.abilityIntensity);this.emit('water');}
        this.sensory='none';this.abilityClock=0;
      }else if(this.sensory==='glamour-warning'&&this.sensoryTimer<=0){
        if(this.targets.some(t=>t.code==='glamour'&&!t.solved&&!t.penaltyUntil)){this.sensory='glamour';this.sensoryTimer=3;this.emit('show');}else {this.sensory='none';this.abilityClock=0;}
      }else if(this.sensoryTimer<=0){this.sensory='none';this.abilityClock=0;}
      return;
    }
    if(this.abilityClock<5||this.state!=='playing')return;
    const candidates=this.targets.filter(t=>!t.solved&&!t.penaltyUntil&&['fighter','glamour'].includes(t.code));
    if(!candidates.length)return;
    const c=candidates[this.abilityIndex++%candidates.length];this.sensory=c.code==='fighter'?'water-warning':'glamour-warning';this.sensoryTimer=1;this.emit('warning',{code:c.code});
  }
  resolve(result){
    if(this.state!=='playing')return;
    const t=this.target(result.targetId);
    if(result.kind==='target'&&(!t||t.solved))return;
    if(result.kind==='target'&&t&&!t.solved){
      t.solved=true;t.solvedAt=this.time;t.ability=0;this.hits++;if(result.center)this.centers++;
      const earned=100+(result.center?50:0)+Math.min(this.streak*10,40);this.score+=earned;this.streak++;this.stress=Math.max(0,this.stress-.08);
      if((t.code==='fighter'&&this.sensory.startsWith('water'))||(t.code==='glamour'&&this.sensory.startsWith('glamour'))){this.sensory='none';this.sensoryTimer=0;this.abilityClock=0;}
      this.lastResult={...result,earned};this.emit('hit',{...result,earned});
      if(this.targets.every(x=>x.solved)){
        if(this.round===5){if(this.mistakes===0)this.score+=300;this.state='won';this.hold(false);this.emit('won',{score:this.score});}
        else {this.state='transition';this.transition=1.6;this.emit('round-clear',{round:this.round});}
      }
    }else {
      this.mistakes++;this.streak=0;this.stress=clamp(this.stress+(result.kind==='hen'?.18:.12),0,1);
      if(result.kind==='hen'&&t){this.score=Math.max(0,this.score-100);t.penaltyUntil=1.8;}
      this.lastResult=result;this.emit(result.kind==='hen'?'hen':'miss',result);
      if(!this.training&&this.mistakes>=3){this.state='lost';this.hold(false);this.emit('lost');}
      if(this.training&&this.ammo<=0)this.ammo=18;
    }
  }
}
