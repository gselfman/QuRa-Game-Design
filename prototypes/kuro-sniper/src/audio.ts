// Layered prototype sound design. Weapon profiles are synthesized, not recordings
// of a particular firearm; canonical QuRa clucks are local samples.
export const WEAPON_SOUNDS:Record<string,{crack:number,body:number,tail:number,cutoff:number,bolt:number,casing:number}>={
  airgun:{crack:.035,body:240,tail:.10,cutoff:950,bolt:.26,casing:0},
  classic:{crack:.11,body:118,tail:.72,cutoff:6200,bolt:.46,casing:2400},
  sport:{crack:.075,body:170,tail:.38,cutoff:3800,bolt:.34,casing:3100},
  sniper:{crack:.14,body:91,tail:.9,cutoff:7200,bolt:.52,casing:2100},
  precision:{crack:.16,body:76,tail:1.08,cutoff:8200,bolt:.48,casing:1850},
  final:{crack:.20,body:59,tail:1.35,cutoff:9600,bolt:.55,casing:1550},
};
export class AudioDirector {
  ctx:AudioContext|null=null;master:GainNode|null=null;enabled=true;volume=.38;lastBeat=-1;lastChirp=0;
  weaponKey='';weaponClips:Record<string,Record<string,string>>={};
  samples:Record<string,AudioBuffer>={};active=new Set<AudioScheduledSourceNode>();generation=0;loaded=false;lastMusicStep=-1;musicStart=-1;lastGravityStep=-1;gravityActive=false;musicStem:{source:AudioBufferSourceNode,gain:GainNode}|null=null;gravityStem:{source:AudioBufferSourceNode,gain:GainNode}|null=null;
  start(){if(!this.ctx){this.ctx=new AudioContext();this.master=this.ctx.createGain();const limiter=this.ctx.createDynamicsCompressor();limiter.threshold.value=-15;limiter.ratio.value=8;limiter.attack.value=.003;limiter.release.value=.2;this.master.connect(limiter);limiter.connect(this.ctx.destination);}void this.ctx.resume();this.master!.gain.value=this.enabled?this.volume:0;if(!this.loaded){this.loaded=true;for(const name of ['hen-cluck','glamour-jazz','gravity-field'])void fetch(`/assets/audio/${name}.wav`).then(r=>r.arrayBuffer()).then(b=>this.ctx!.decodeAudioData(b)).then(b=>this.samples[name]=b).catch(()=>{});void fetch('/assets/audio/weapons/manifest.json').then(r=>r.json()).then(async data=>{for(const [key,clips] of Object.entries(data.weapons??{})){this.weaponClips[key]=clips as Record<string,string>;for(const [event,file] of Object.entries(clips as Record<string,string>)){const buffer=await fetch('/assets/audio/weapons/'+file).then(r=>r.arrayBuffer()).then(b=>this.ctx!.decodeAudioData(b));this.samples['weapon:'+key+':'+event]=buffer;}}}).catch(()=>{});}}
  set(enabled:boolean,volume=this.volume){this.enabled=enabled;this.volume=volume;if(this.master)this.master.gain.value=enabled?volume:0;if(!enabled)this.stop();}
  stop(){this.generation++;this.lastMusicStep=-1;this.musicStart=-1;this.lastGravityStep=-1;this.gravityActive=false;this.musicStem=null;this.gravityStem=null;for(const n of this.active){try{n.stop();}catch{}}this.active.clear();}
  track(n:AudioScheduledSourceNode,cleanup:()=>void){this.active.add(n);n.onended=()=>{this.active.delete(n);n.disconnect();cleanup();};}
  tone(freq:number,duration:number,level:number,type:OscillatorType='sine',end?:number,delay=0){if(!this.ctx||!this.master||!this.enabled)return;const now=this.ctx.currentTime+delay,o=this.ctx.createOscillator(),g=this.ctx.createGain();o.type=type;o.frequency.setValueAtTime(freq,now);if(end)o.frequency.exponentialRampToValueAtTime(Math.max(10,end),now+duration);g.gain.setValueAtTime(.001,now);g.gain.linearRampToValueAtTime(level,now+Math.min(.008,duration*.2));g.gain.exponentialRampToValueAtTime(.001,now+duration);o.connect(g);g.connect(this.master);o.start(now);o.stop(now+duration+.01);this.track(o,()=>g.disconnect());}
  noise(duration:number,level:number,cutoff=900,delay=0,type:BiquadFilterType='lowpass'){if(!this.ctx||!this.master||!this.enabled)return;const count=Math.ceil(this.ctx.sampleRate*duration),buffer=this.ctx.createBuffer(1,count,this.ctx.sampleRate);const a=buffer.getChannelData(0);for(let i=0;i<count;i++)a[i]=(Math.random()*2-1)*Math.exp(-i/count*6);const source=this.ctx.createBufferSource(),gain=this.ctx.createGain(),filter=this.ctx.createBiquadFilter();source.buffer=buffer;filter.type=type;filter.frequency.value=cutoff;gain.gain.value=level;source.connect(filter);filter.connect(gain);gain.connect(this.master);source.start(this.ctx.currentTime+delay);this.track(source,()=>{filter.disconnect();gain.disconnect();});}
  sample(name:string,level:number,rate=1,delay=0){if(!this.ctx||!this.master||!this.enabled||!this.samples[name])return false;const s=this.ctx.createBufferSource(),g=this.ctx.createGain();s.buffer=this.samples[name];s.playbackRate.value=rate;g.gain.value=level;s.connect(g);g.connect(this.master);s.start(this.ctx.currentTime+delay);this.track(s,()=>g.disconnect());return true;}
  reed(freq:number,duration:number,level:number){
    if(!this.ctx||!this.master||!this.enabled)return;const now=this.ctx.currentTime,o=this.ctx.createOscillator(),v=this.ctx.createOscillator(),vg=this.ctx.createGain(),g=this.ctx.createGain(),filter=this.ctx.createBiquadFilter();
    o.type='sawtooth';o.frequency.setValueAtTime(freq*.98,now);o.frequency.exponentialRampToValueAtTime(freq,now+.07);v.frequency.value=5.1;vg.gain.value=freq*.003;v.connect(vg);vg.connect(o.frequency);filter.type='lowpass';filter.frequency.value=1250;filter.Q.value=1.2;
    g.gain.setValueAtTime(.001,now);g.gain.linearRampToValueAtTime(level,now+.045);g.gain.exponentialRampToValueAtTime(.001,now+duration);o.connect(filter);filter.connect(g);g.connect(this.master);v.start(now);o.start(now);o.stop(now+duration);this.track(o,()=>{v.stop();v.disconnect();vg.disconnect();filter.disconnect();g.disconnect();});
  }
  stem(name:string,level:number){
    if(!this.ctx||!this.master||!this.samples[name])return null;const source=this.ctx.createBufferSource(),gain=this.ctx.createGain();source.buffer=this.samples[name];source.loop=true;gain.gain.setValueAtTime(.001,this.ctx.currentTime);gain.gain.linearRampToValueAtTime(level,this.ctx.currentTime+.08);source.connect(gain);gain.connect(this.master);this.active.add(source);source.start();source.onended=()=>{this.active.delete(source);source.disconnect();gain.disconnect();};return {source,gain};
  }
  fadeStem(stem:{source:AudioBufferSourceNode,gain:GainNode}|null){if(!stem||!this.ctx)return;stem.gain.gain.cancelScheduledValues(this.ctx.currentTime);stem.gain.gain.setTargetAtTime(0,this.ctx.currentTime,.06);try{stem.source.stop(this.ctx.currentTime+.22);}catch{}}
  abilityMusic(time:number,sensory:string,gravity:boolean,ads:boolean){
    if(this.samples['glamour-jazz']&&this.samples['gravity-field']&&this.ctx){
      if(sensory==='glamour'){if(!this.musicStem)this.musicStem=this.stem('glamour-jazz',ads?.55:.75);this.musicStem?.gain.gain.setTargetAtTime(ads?.55:.75,this.ctx.currentTime,.08);}else if(this.musicStem){this.fadeStem(this.musicStem);this.musicStem=null;}
      if(gravity){if(!this.gravityStem)this.gravityStem=this.stem('gravity-field',sensory==='glamour'?.45:.7);}else if(this.gravityStem){this.fadeStem(this.gravityStem);this.gravityStem=null;}
      return;
    }
    if(sensory==='glamour'){
      if(this.musicStart<0)this.musicStart=time;const step=Math.floor((time-this.musicStart)*3),level=ads?.65:1;
      if(step!==this.lastMusicStep){this.lastMusicStep=step;const melody=[392,0,466.16,523.25,587.33,523.25,466.16,349.23],note=melody[step%8];if(note)this.reed(note,.38,.048*level);
        if(step%2===0){const bass=[55,65.41,73.42,82.41][Math.floor(step/2)%4];this.tone(bass,.48,.11*level,'triangle',bass*.97);this.tone(bass*2,.25,.025*level);}
        this.noise(.07,.025*level,4200,0,'highpass');if(step%4===2){this.noise(.14,.036*level,1700,0,'bandpass');this.tone(220,.04,.02*level,'triangle',100);}
      }
    }else{this.musicStart=-1;this.lastMusicStep=-1;}
    if(gravity){if(!this.gravityActive)this.play('gravity');const step=Math.floor(time/.7);if(step!==this.lastGravityStep){this.lastGravityStep=step;this.tone(62,.95,.026,'sine',54);this.tone(125,1.05,.016,'sine',131);this.noise(.8,.018,950,0,'bandpass');if(step%2===0)this.tone([392,493.88,587.33][step%3],.8,.017,'sine',undefined,.12);}}else this.lastGravityStep=-1;this.gravityActive=gravity;
  }
  weapon(family:string){
    const p=WEAPON_SOUNDS[family]||WEAPON_SOUNDS.airgun;
    if(!this.sample('weapon:'+this.weaponKey+':fire',.85)){this.noise(p.crack,.8,p.cutoff);this.tone(p.body,p.tail*.55,.35,'triangle',p.body*.38);this.noise(p.tail,.26,650,.025);this.tone(family==='airgun'?1350:2900,.025,.08,'triangle',400);}
    // Bolt unlock, extraction, cartridge hitting wood, bolt closing.
    if(!this.sample('weapon:'+this.weaponKey+':boltOpen',.7,1,p.bolt)){this.noise(.075,.10,2100,p.bolt);this.tone(480,.05,.065,'square',240,p.bolt+.08);}
    if(p.casing&&!this.sample('weapon:'+this.weaponKey+':casing',.7,1,p.bolt+.16)){for(const [i,amp] of [[0,.09],[1,.045],[2,.02]]){this.tone(p.casing*(1+i*.17),.11,amp,'sine',undefined,p.bolt+.16+i*.09);}this.noise(.07,.06,4500,p.bolt+.18);}
    if(!this.sample('weapon:'+this.weaponKey+':boltClose',.7,1,p.bolt+.32)){this.noise(.055,.12,1400,p.bolt+.32);this.tone(220,.04,.06,'triangle',100,p.bolt+.34);}
  }
  play(name:string,family='airgun'){
    if(name==='fire')this.weapon(family);
    if(name==='hit'){this.tone(1720,.65,.22,'sine',1550);this.tone(2700,.35,.065);this.noise(.075,.11,800,.14);this.tone(270,.08,.09,'triangle',90,.2);this.sample('hen-cluck',.50,1.04,.23);}
    if(name==='hen'){if(!this.sample('hen-cluck',.65,1.17)){this.tone(420,.2,.17,'triangle',240);this.tone(560,.22,.12,'triangle',320,.16);}this.noise(.35,.10,1200);}
    if(name==='miss'){// A short, distinct descending double buzz.
      this.tone(230,.18,.12,'sawtooth',145);this.tone(155,.22,.10,'triangle',83,.14);
    }
    if(name==='land'){this.noise(.13,.09,650);this.tone(85,.12,.08,'triangle',40);this.sample('hen-cluck',.28,1.02,.1);}
    if(name==='cluck'){const rate=({ryaba:1,fool:1.16,professor:.92,fighter:.84,glamour:1.12} as Record<string,number>)[family]||1;if(!this.sample('hen-cluck',.34,rate)){this.tone(430,.14,.08,'triangle',260);this.tone(510,.16,.06,'triangle',310,.1);}}
    if(name==='gravity'){this.tone(86,.85,.04,'triangle',40);this.tone(520,.65,.026,'sine',90);this.noise(.5,.024,1400,.1,'bandpass');}
    if(name==='round'||name==='won'){[523,659,784].forEach((n,i)=>this.tone(n,.45,.1,'sine',undefined,i*.09));}
    if(name==='water'){this.noise(.7,.24,3800);this.noise(.9,.09,900,.08);}
    if(name==='wipe'){this.noise(1.1,.11,2800);this.noise(.4,.06,1300,.65);}
    if(name==='breath'||name==='exhale')this.noise(.6,.05,400);
    if(name==='click')this.tone(480,.06,.055,'sine',350);
    if(name==='pop'){this.noise(.065,.4,3600);this.tone(320,.09,.1,'sine',70);}
  }
  tick(time:number,pulse:number,ads:boolean,sensory='none',gravity=false){if(!this.ctx||!this.enabled)return;this.abilityMusic(time,sensory,gravity,ads);const beat=Math.floor(time*pulse/60);if(beat!==this.lastBeat){this.lastBeat=beat;if(ads){this.tone(58,.12,.045);this.tone(51,.13,.028,'sine',undefined,.14);}}if(time-this.lastChirp>8){this.lastChirp=time;this.tone(1100,.12,.025,'sine',1800);this.tone(1400,.14,.018,'sine',2200,.19);}}
}
