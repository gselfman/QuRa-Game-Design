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
  samples:Record<string,AudioBuffer>={};active=new Set<AudioScheduledSourceNode>();generation=0;loaded=false;
  start(){if(!this.ctx){this.ctx=new AudioContext();this.master=this.ctx.createGain();const limiter=this.ctx.createDynamicsCompressor();limiter.threshold.value=-15;limiter.ratio.value=8;limiter.attack.value=.003;limiter.release.value=.2;this.master.connect(limiter);limiter.connect(this.ctx.destination);}void this.ctx.resume();this.master!.gain.value=this.enabled?this.volume:0;if(!this.loaded){this.loaded=true;for(const name of ['hen-cluck'])void fetch(`/assets/audio/${name}.wav`).then(r=>r.arrayBuffer()).then(b=>this.ctx!.decodeAudioData(b)).then(b=>this.samples[name]=b).catch(()=>{});}}
  set(enabled:boolean,volume=this.volume){this.enabled=enabled;this.volume=volume;if(this.master)this.master.gain.value=enabled?volume:0;if(!enabled)this.stop();}
  stop(){this.generation++;for(const n of this.active){try{n.stop();}catch{}}this.active.clear();}
  track(n:AudioScheduledSourceNode,cleanup:()=>void){this.active.add(n);n.onended=()=>{this.active.delete(n);n.disconnect();cleanup();};}
  tone(freq:number,duration:number,level:number,type:OscillatorType='sine',end?:number,delay=0){if(!this.ctx||!this.master||!this.enabled)return;const now=this.ctx.currentTime+delay,o=this.ctx.createOscillator(),g=this.ctx.createGain();o.type=type;o.frequency.setValueAtTime(freq,now);if(end)o.frequency.exponentialRampToValueAtTime(Math.max(10,end),now+duration);g.gain.setValueAtTime(.001,now);g.gain.linearRampToValueAtTime(level,now+Math.min(.008,duration*.2));g.gain.exponentialRampToValueAtTime(.001,now+duration);o.connect(g);g.connect(this.master);o.start(now);o.stop(now+duration+.01);this.track(o,()=>g.disconnect());}
  noise(duration:number,level:number,cutoff=900,delay=0,type:BiquadFilterType='lowpass'){if(!this.ctx||!this.master||!this.enabled)return;const count=Math.ceil(this.ctx.sampleRate*duration),buffer=this.ctx.createBuffer(1,count,this.ctx.sampleRate);const a=buffer.getChannelData(0);for(let i=0;i<count;i++)a[i]=(Math.random()*2-1)*Math.exp(-i/count*6);const source=this.ctx.createBufferSource(),gain=this.ctx.createGain(),filter=this.ctx.createBiquadFilter();source.buffer=buffer;filter.type=type;filter.frequency.value=cutoff;gain.gain.value=level;source.connect(filter);filter.connect(gain);gain.connect(this.master);source.start(this.ctx.currentTime+delay);this.track(source,()=>{filter.disconnect();gain.disconnect();});}
  sample(name:string,level:number,rate=1,delay=0){if(!this.ctx||!this.master||!this.enabled||!this.samples[name])return false;const s=this.ctx.createBufferSource(),g=this.ctx.createGain();s.buffer=this.samples[name];s.playbackRate.value=rate;g.gain.value=level;s.connect(g);g.connect(this.master);s.start(this.ctx.currentTime+delay);this.track(s,()=>g.disconnect());return true;}
  weapon(family:string){
    const p=WEAPON_SOUNDS[family]||WEAPON_SOUNDS.airgun;
    this.noise(p.crack,.8,p.cutoff);this.tone(p.body,p.tail*.55,.35,'triangle',p.body*.38);this.noise(p.tail,.26,650,.025);
    this.tone(family==='airgun'?1350:2900,.025,.08,'triangle',400);
    // Bolt unlock, extraction, cartridge hitting wood, bolt closing.
    this.noise(.075,.10,2100,p.bolt);this.tone(480,.05,.065,'square',240,p.bolt+.08);
    if(p.casing){for(const [i,amp] of [[0,.09],[1,.045],[2,.02]]){this.tone(p.casing*(1+i*.17),.11,amp,'sine',undefined,p.bolt+.16+i*.09);}this.noise(.07,.06,4500,p.bolt+.18);}
    this.noise(.055,.12,1400,p.bolt+.32);this.tone(220,.04,.06,'triangle',100,p.bolt+.34);
  }
  play(name:string,family='airgun'){
    if(name==='fire')this.weapon(family);
    if(name==='hit'){this.tone(1720,.65,.22,'sine',1550);this.tone(2700,.35,.065);this.noise(.075,.11,800,.14);this.tone(270,.08,.09,'triangle',90,.2);this.noise(.12,.08,450,.68);this.sample('hen-cluck',.50,1.04,.23);}
    if(name==='hen'){if(!this.sample('hen-cluck',.65,1.17)){this.tone(420,.2,.17,'triangle',240);this.tone(560,.22,.12,'triangle',320,.16);}this.noise(.35,.10,1200);}
    if(name==='miss'){// A short, distinct descending double buzz.
      this.tone(230,.18,.12,'sawtooth',145);this.tone(155,.22,.10,'triangle',83,.14);
    }
    if(name==='round'||name==='won'){[523,659,784].forEach((n,i)=>this.tone(n,.45,.1,'sine',undefined,i*.09));}
    if(name==='water'){this.noise(.7,.24,3800);this.noise(.9,.09,900,.08);}
    if(name==='wipe'){this.noise(1.1,.11,2800);this.noise(.4,.06,1300,.65);}
    if(name==='breath'||name==='exhale')this.noise(.6,.05,400);
    if(name==='click')this.tone(480,.06,.055,'sine',350);
    if(name==='pop'){this.noise(.065,.4,3600);this.tone(320,.09,.1,'sine',70);}
  }
  tick(time:number,pulse:number,ads:boolean){if(!this.ctx||!this.enabled)return;const beat=Math.floor(time*pulse/60);if(beat!==this.lastBeat){this.lastBeat=beat;if(ads){this.tone(58,.12,.045);this.tone(51,.13,.028,'sine',undefined,.14);}}if(time-this.lastChirp>8){this.lastChirp=time;this.tone(1100,.12,.025,'sine',1800);this.tone(1400,.14,.018,'sine',2200,.19);}}
}
