export class AudioDirector {
  ctx:AudioContext|null=null;master:GainNode|null=null;enabled=true;volume=.38;lastBeat=-1;lastChirp=0;
  start(){if(!this.ctx){this.ctx=new AudioContext();this.master=this.ctx.createGain();this.master.connect(this.ctx.destination);}this.ctx.resume();this.master!.gain.value=this.enabled?this.volume:0;}
  set(enabled:boolean,volume=this.volume){this.enabled=enabled;this.volume=volume;if(this.master)this.master.gain.value=enabled?volume:0;}
  tone(freq:number,duration:number,level:number,type:OscillatorType='sine',end?:number,delay=0){if(!this.ctx||!this.master||!this.enabled)return;const now=this.ctx.currentTime+delay,o=this.ctx.createOscillator(),g=this.ctx.createGain();o.type=type;o.frequency.setValueAtTime(freq,now);if(end)o.frequency.exponentialRampToValueAtTime(Math.max(10,end),now+duration);g.gain.setValueAtTime(.001,now);g.gain.linearRampToValueAtTime(level,now+.008);g.gain.exponentialRampToValueAtTime(.001,now+duration);o.connect(g);g.connect(this.master);o.start(now);o.stop(now+duration+.01);o.onended=()=>{o.disconnect();g.disconnect();};}
  noise(duration:number,level:number,cutoff=900){if(!this.ctx||!this.master||!this.enabled)return;const count=Math.ceil(this.ctx.sampleRate*duration),buffer=this.ctx.createBuffer(1,count,this.ctx.sampleRate);const a=buffer.getChannelData(0);for(let i=0;i<count;i++)a[i]=(Math.random()*2-1)*Math.pow(1-i/count,2);const source=this.ctx.createBufferSource(),gain=this.ctx.createGain(),filter=this.ctx.createBiquadFilter();source.buffer=buffer;filter.type='lowpass';filter.frequency.value=cutoff;gain.gain.value=level;source.connect(filter);filter.connect(gain);gain.connect(this.master);source.start();source.onended=()=>{source.disconnect();filter.disconnect();gain.disconnect();};}
  play(name:string){
    if(name==='fire'){this.noise(.13,.65,1800);this.tone(115,.15,.32,'triangle',45);this.tone(650,.025,.08,'sine',180);}
    if(name==='hit'){this.tone(1720,.65,.22,'sine',1550);this.tone(2700,.35,.065);}
    if(name==='hen'){this.tone(420,.2,.17,'triangle',240);this.tone(560,.22,.12,'triangle',320,.16);this.noise(.22,.08,1200);}
    if(name==='miss')this.tone(190,.16,.12,'triangle',100);
    if(name==='round'||name==='won'){[523,659,784].forEach((n,i)=>this.tone(n,.45,.1,'sine',undefined,i*.09));}
    if(name==='water'||name==='wipe')this.noise(.5,.12,2800);
    if(name==='breath'||name==='exhale')this.noise(.6,.05,400);
    if(name==='click')this.tone(480,.06,.055,'sine',350);
  }
  tick(time:number,pulse:number,ads:boolean){if(!this.ctx||!this.enabled)return;const beat=Math.floor(time*pulse/60);if(beat!==this.lastBeat){this.lastBeat=beat;if(ads){this.tone(58,.12,.045);this.tone(51,.13,.028,'sine',undefined,.14);}}if(time-this.lastChirp>8){this.lastChirp=time;this.tone(1100,.12,.025,'sine',1800);this.tone(1400,.14,.018,'sine',2200,.19);}}
}
