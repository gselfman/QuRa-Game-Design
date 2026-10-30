// Frozen pre-T2 JRPG target resolver from arena-live-3x3/team-core.js on main. Test fixture ONLY; never loaded in browser.
function targetOutcome(actor,target,move,targetMove,rng){
 var before=[actor.hp,target.hp],v=0,w=0,why='',detail='';
 if(move==='defend'){charge(actor,18);return{a:actor.n,b:target.n,ma:move,mb:targetMove,la:label(actor,move),lb:label(target,targetMove),w:0,why:'Защита — стойка. Её эффект проявится, когда эту курочку атакуют.',details:[],before:before,after:[actor.hp,target.hp],tips:{1:'',2:''}}}
 if(move==='attack'){
   if(targetMove==='defend'){v=hit(actor,target,.22);var cv=counter(target,actor);w=2;why='Цель выбрала Защиту: прямой удар почти заблокирован, а атакующая курочка получила контратаку.';detail='Атака: −'+v+' HP цели; контратака: −'+cv+' HP атакующей.'}
   else if(targetMove==='maneuver'){v=hit(actor,target,1.45);w=1;why='Атака поймала цель на Манёвре: во время подготовки Манёвра цель открыта.';detail='Усиленная Атака: −'+v+' HP.'}
   else if(targetMove==='special'){v=hit(actor,target,.35);why='Цель готовит Special: часть Атаки проходит, но Special не отменяется.';detail='Атака сквозь Special: −'+v+' HP.'}
   else{v=hit(actor,target,actor.s>target.s?1.10:1);why='Обе курочки действуют агрессивно. Скорость даёт небольшой бонус к Атаке.';detail='Атака: −'+v+' HP.'}
 } else if(move==='maneuver'){
   if(targetMove==='attack'){v=take(target,10);why='Цель выбрала Атаку: прямое давление срывает подготовку Манёвра.';detail='Манёвр сорван: проходит только −'+v+' HP без персонального бонуса.'}
   else {var rm=maneuver(actor,target);v=rm.v;detail=rm.detail;w=targetMove==='defend'?1:0;why=targetMove==='defend'?'Манёвр обошёл Защиту: цель ждала прямую Атаку.':'Манёвр сработал со своим персональным эффектом.'}
 } else if(move==='special'){
   var rs=special(actor,target,targetMove==='defend',rng);v=rs.v;detail=rs.detail;w=targetMove==='defend'?0:1;why=targetMove==='defend'?'Цель прочитала Special и Защитой снизила его прямой эффект.':'Special применён по выбранной цели.'
 }
 charge(actor,w===1?35:20);
 return{a:actor.n,b:target.n,ma:move,mb:targetMove,la:label(actor,move),lb:label(target,targetMove),w:w,why:why,details:[detail],before:before,after:[actor.hp,target.hp],tips:{1:w===2?coach(targetMove):'',2:w===1?coach(move):''}};
}
