// Predictable run / stop / turn cycles, in seconds and metres.
export const BALLOON_PATTERNS={
 ryaba:{title:'Два шага — поклевать',move:3.2,hold:3.8,span:2.4,offset:0,rest:'peck'},
 fool:{title:'Рывок — замереть',move:2.4,hold:2.8,span:2.8,offset:1.4,rest:'look'},
 professor:{title:'Прогулка — задуматься',move:4.2,hold:4.6,span:2.0,offset:2.5,rest:'professor'},
 fighter:{title:'Перебежка — дозор',move:2.8,hold:3.2,span:3.0,offset:.6,rest:'fighter'},
 glamour:{title:'Пройти — потанцевать',move:3.6,hold:3.8,span:2.4,offset:3.0,rest:'dance'},
};
export function balloonMotion(code,time,baseX=0){
 const p=BALLOON_PATTERNS[code]||BALLOON_PATTERNS.ryaba,leg=p.move+p.hold,cycle=leg*2,clock=(time+p.offset)%cycle,back=clock>=leg,s=clock%leg,dir=back?-1:1,turnS=.4,stopped=s>=p.move;
 const u=Math.min(1,s/p.move),ease=(1-Math.cos(u*Math.PI))/2,from=back?p.span/2:-p.span/2;
 const x=baseX+from+dir*p.span*ease,velocity=stopped?0:dir*p.span*Math.PI/(2*p.move)*Math.sin(u*Math.PI);
 const turn=stopped?Math.max(0,(s-(leg-turnS))/turnS):0,facing=turn<.5?dir:-dir;
 const travelled=Math.floor((time+p.offset)/leg)*p.span+p.span*ease;
 return {x,bodyX:x-.10*velocity,y:2.8+Math.sin(time*1.6+p.offset)*.045,velocityX:velocity,stepPhase:travelled/.38*Math.PI*2,mode:stopped?(turn>0?'turn':p.rest):'run',facing,turnScale:turn>0?Math.max(.14,Math.abs(Math.cos(turn*Math.PI))):1,stopRemainingS:stopped?leg-s:0,pattern:p.title};
}
