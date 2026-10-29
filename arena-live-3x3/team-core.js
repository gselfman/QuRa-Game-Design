'use strict';
var ROLE=+window.QURA_ROLE,qs=new URLSearchParams(location.search),room=(qs.get('room')||'team3-test').replace(/[^a-zA-Z0-9_-]/g,'').slice(0,40)||'team3-test';
var NETVER='mqtt6',mqttClient=null,brokerConnected=false,connected=false,opponentSeen=0,presenceTimer=null,monitorTimer=null,stateTimer=null,cmdTimer=null,lastNetError='',lastStateRev=0,pendingCmd=null,pendingCmdAck=false,localSlots=[null,null,null],localMoves={},localTargets={},chatLog=[],chatSeen={};
var baseTopic='qura/arena3/'+NETVER+'/'+room,topicState=baseTopic+'/state',topicCmd=baseTopic+'/cmd',topicPresence=baseTopic+'/presence/',topicChat=baseTopic+'/chat',topicAck=baseTopic+'/ack/2';
var R=[
{id:'r',n:'Ряба',i:'🐔',hp:108,a:24,d:21,s:18,m:'Скорлупа',x:'Золотая скорлупа'},
{id:'b',n:'Боевик',i:'🥊',hp:112,a:26,d:23,s:14,m:'Провокация',x:'Ответочка'},
{id:'f',n:'Дурочка',i:'🤪',hp:102,a:24,d:17,s:26,m:'Финт',x:'Авось!'},
{id:'p',n:'Профессор',i:'🤓',hp:102,a:25,d:19,s:22,m:'Анализ',x:'Расчёт'},
{id:'m',n:'Монах',i:'🧘',hp:110,a:21,d:24,s:15,m:'Медитация',x:'Благодать'},
{id:'g',n:'Гламурочка',i:'😎',hp:102,a:23,d:19,s:24,m:'Позирование',x:'Ослепительный выход'}];
var S={phase:'mode',mode:null,round:0,p:{1:{mode:null,crest:null,slots:[null,null,null],ready:false,moved:false,moveAck:null,rematch:false},2:{mode:null,crest:null,slots:[null,null,null],ready:false,moved:false,moveAck:null,rematch:false}},f:{1:[],2:[]},last:null,history:[],winner:0,rematchNotice:null},H=null;
function $(s){return document.querySelector(s)}function C(id){return R.find(function(x){return x.id===id})}function clone(c,pos){return Object.assign({},c,{max:c.hp,q:0,shield:0,boost:0,weaken:0,dead:false,pos:pos})}
function living(side,st){st=st||H;return st.f[side].filter(function(c){return c&&!c.dead})}function byPos(side,pos,st){st=st||H;var c=st.f[side][pos];return c&&!c.dead?c:null}function nextLiving(side,pos,st){st=st||H;for(var k=0;k<3;k++){var p=(pos+k)%3,c=byPos(side,p,st);if(c)return c}return null}
function pairings(st){st=st||H;var a=living(1,st),b=living(2,st);if(!a.length||!b.length)return[];var anchor=a.length>=b.length?1:2,other=anchor===1?2:1;return living(anchor,st).map(function(c){var o=byPos(other,c.pos,st)||nextLiving(other,c.pos,st);return anchor===1?{a:c,b:o}:{a:o,b:c}})}
function charge(c,v){c.q=Math.min(100,c.q+v)}function take(c,v){if(c.shield){var z=Math.min(c.shield,v);c.shield-=z;v-=z}v=Math.max(0,Math.round(v));c.hp=Math.max(0,c.hp-v);if(!c.hp)c.dead=true;return v}
function baseDamage(a,d,m){m=m||1;var v=(20+1.15*a.a-.72*d.d)*m;if(a.boost){v*=1+a.boost;a.boost=0}if(a.weaken){v*=1-a.weaken;a.weaken=0}return Math.max(5,v)}function hit(a,d,m){return take(d,baseDamage(a,d,m||1))}function counter(d,a){return take(a,15+.45*d.d-.18*a.d)}
function maneuver(c,e){var v=0,detail='';if(c.id==='r'){c.shield+=10;v=take(e,24);detail='Скорлупа: −'+v+' HP, +10 щита'}else if(c.id==='b'){c.boost=Math.max(c.boost,.18);v=take(e,25);detail='Провокация: −'+v+' HP, следующая Атака +18%'}else if(c.id==='f'){c.boost=Math.max(c.boost,.20);v=take(e,31);detail='Финт: −'+v+' HP, следующая Атака +20%'}else if(c.id==='p'){e.q=Math.max(0,e.q-18);v=take(e,26);detail='Анализ: −'+v+' HP, −18 Special врага'}else if(c.id==='m'){var h=Math.min(c.max-c.hp,12);c.hp+=h;v=take(e,24);detail='Медитация: −'+v+' HP, лечение '+h+' HP'}else{e.weaken=Math.max(e.weaken,.22);v=take(e,27);detail='Позирование: −'+v+' HP, следующая Атака врага −22%'}return{v:v,detail:detail}}
function special(c,e,guard,rng){c.q=0;var v=0,detail='';if(c.id==='r'){var sh=guard?14:18;c.shield+=sh;v=take(e,guard?11:25);detail='Золотая скорлупа: −'+v+' HP, +'+sh+' щита'}else if(c.id==='b'){v=take(e,46*(guard?.45:1));detail='Ответочка: −'+v+' HP'+(guard?' (Защита)':'')}else if(c.id==='f'){var raw=rng<.10?0:(rng<.35?58:43);v=take(e,raw*(guard?.45:1));detail=raw?'Авось!: −'+v+' HP'+(guard?' (Защита)':''):'Авось!: не повезло — 0 урона'}else if(c.id==='p'){v=take(e,45*(guard?.5:1));detail='Расчёт: −'+v+' HP'+(guard?' (Защита)':'')}else if(c.id==='m'){var h2=Math.min(c.max-c.hp,27);c.hp+=h2;v=take(e,18*(guard?.5:1));detail='Благодать: +'+h2+' HP себе, −'+v+' HP врагу'}else{e.weaken=Math.max(e.weaken,.30);v=take(e,41*(guard?.5:1));detail='Ослепительный выход: −'+v+' HP, следующая Атака врага −30%'}return{v:v,detail:detail}}
function label(c,m){return m==='attack'?'⚔️ Атака':m==='defend'?'🛡️ Защита':m==='maneuver'?'🎯 '+c.m:'✨ '+c.x}function coach(m){if(m==='attack')return'Против Атаки попробуйте Защиту: блок уменьшает урон и даёт контратаку.';if(m==='defend')return'Против Защиты попробуйте Манёвр: он обходит блок.';if(m==='maneuver')return'Против Манёвра попробуйте Атаку: соперница открыта во время подготовки.';return'Против Special Защита уменьшает прямой эффект, но соперник может блефовать Манёвром.'}
function clash(a,b,ma,mb,rng){var before=[a.hp,b.hp],da=0,db=0,w=0,why='',details=[];if(ma==='special'||mb==='special'){if(ma==='special'){var sa=special(a,b,mb==='defend',rng);da+=sa.v;details.push(a.n+': '+sa.detail)}if(mb==='special'){var sb=special(b,a,ma==='defend',1-rng);db+=sb.v;details.push(b.n+': '+sb.detail)}if(ma!=='special'&&ma==='attack'){var va=hit(a,b,.35);da+=va;details.push(a.n+' атакует сквозь Special: −'+va+' HP')}if(mb!=='special'&&mb==='attack'){var vb=hit(b,a,.35);db+=vb;details.push(b.n+' атакует сквозь Special: −'+vb+' HP')}if(ma!=='special'&&ma==='maneuver'){var ra=maneuver(a,b);da+=ra.v;details.push(a.n+': '+ra.detail)}if(mb!=='special'&&mb==='maneuver'){var rb=maneuver(b,a);db+=rb.v;details.push(b.n+': '+rb.detail)}why=(ma==='defend'||mb==='defend')?'Защита уменьшила прямой Special.':'Special дал сильный эффект.'}else if(ma===mb){if(ma==='attack'){var v1=hit(a,b,a.s>b.s?1.10:1),v2=hit(b,a,b.s>a.s?1.10:1);da+=v1;db+=v2;why='Обе атаковали: обе получили урон, Скорость дала небольшой бонус.'}else if(ma==='defend'){why='Обе защищались: урона нет.'}else{if(a.s>=b.s){var r1=maneuver(a,b),z1=hit(b,a,.45);da+=r1.v;db+=z1;w=1}else{var r2=maneuver(b,a),z2=hit(a,b,.45);db+=r2.v;da+=z2;w=2}why='Обе выбрали Манёвр: более быстрая курочка провела его полностью.'}}else{var k=ma[0]+mb[0];if(k==='am'){da=hit(a,b,1.45);w=1;why='Атака победила Манёвр: соперница открылась во время подготовки.'}else if(k==='ma'){db=hit(b,a,1.45);w=2;why='Атака победила Манёвр: соперница открылась во время подготовки.'}else if(k==='md'){var m1=maneuver(a,b);da=m1.v;w=1;why='Манёвр победил Защиту: блок ждал прямой удар.'}else if(k==='dm'){var m2=maneuver(b,a);db=m2.v;w=2;why='Манёвр победил Защиту: блок ждал прямой удар.'}else if(k==='da'){db=hit(b,a,.22);da=counter(a,b);w=1;why='Защита победила Атаку: блок превратил удар в контратаку.'}else if(k==='ad'){da=hit(a,b,.22);db=counter(b,a);w=2;why='Защита победила Атаку: блок превратил удар в контратаку.'}}if(!w){if(da>db+5)w=1;else if(db>da+5)w=2}charge(a,w===1?35:w===2?15:20);charge(b,w===2?35:w===1?15:20);return{a:a.n,b:b.n,ma:ma,mb:mb,la:label(a,ma),lb:label(b,mb),w:w,why:why,details:details,before:before,after:[a.hp,b.hp],tips:{1:w===2?coach(mb):'',2:w===1?coach(ma):''}}}
function resolveWallHost(){
 var pairs=pairings(),res=[],wins=[0,0],seed=Math.random();
 pairs.forEach(function(p,i){
   var oa=H.p[1].moves[p.a.pos],ob=H.p[2].moves[p.b.pos],ma=oa&&oa.move,mb=ob&&ob.move;
   var r=clash(p.a,p.b,ma,mb,(seed+i*.271)%1);r.sideA=1;r.sideB=2;r.posA=p.a.pos;r.posB=p.b.pos;r.globalWinner=r.w;res.push(r);if(r.w)wins[r.w-1]++
 });
 finishRound(res,wins);
}
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
function resolveTargetHost(){
 var actions=[],seed=Math.random();
 [1,2].forEach(function(side){living(side).forEach(function(c){var o=H.p[side].moves[c.pos];if(o&&o.move)actions.push({side:side,c:c,o:o})})});
 actions.sort(function(x,y){if(x.o.move==='defend'&&y.o.move!=='defend')return-1;if(y.o.move==='defend'&&x.o.move!=='defend')return 1;return y.c.s-x.c.s});
 var res=[],wins=[0,0],seenDef={};
 actions.forEach(function(a,i){
   if(a.c.dead)return;
   if(a.o.move==='defend'){if(!seenDef[a.side+'-'+a.c.pos]){charge(a.c,18);seenDef[a.side+'-'+a.c.pos]=1}return}
   var enemy=a.side===1?2:1,target=byPos(enemy,+a.o.target,H)||nextLiving(enemy,+a.o.target,H);if(!target)return;
   var to=H.p[enemy].moves[target.pos]||{move:'attack'},r=targetOutcome(a.c,target,a.o.move,to.move,(seed+i*.173)%1);
   r.sourceSide=a.side;r.targetSide=enemy;r.sideA=a.side;r.sideB=enemy;r.posA=a.c.pos;r.posB=target.pos;r.globalWinner=r.w===1?a.side:r.w===2?enemy:0;r.tipsBySide={1:'',2:''};if(r.globalWinner){var loser=r.globalWinner===1?2:1;r.tipsBySide[loser]=loser===a.side?coach(to.move):coach(a.o.move)}res.push(r);if(r.w===1)wins[a.side-1]++;else if(r.w===2)wins[enemy-1]++;
 });
 finishRound(res,wins);
}
function finishRound(res,wins){
 var tw=wins[0]>wins[1]?1:wins[1]>wins[0]?2:0;
 H.last={round:H.round,mode:H.mode,clashes:res,wins:wins,teamWinner:tw};H.history.push(JSON.parse(JSON.stringify(H.last)));
 H.p[1].moves=H.p[2].moves=null;H.p[1].moved=H.p[2].moved=false;H.p[1].moveAck=H.p[2].moveAck=null;H.resolving=false;
 if(!living(1).length||!living(2).length){H.phase='done';H.winner=living(1).length?1:living(2).length?2:3}else H.round++;
 publish()
}
function resolveHost(){if(H.mode==='target')resolveTargetHost();else resolveWallHost()}
function viewFor(side){
 var hidden=[null,null,null],p1={mode:H.p[1].mode,crest:H.p[1].crest||null,slots:H.p[1].slots.slice(),ready:H.p[1].ready,moved:H.p[1].moved,moveAck:H.p[1].moveAck||null,rematch:!!H.p[1].rematch},p2={mode:H.p[2].mode,crest:H.p[2].crest||null,slots:H.p[2].slots.slice(),ready:H.p[2].ready,moved:H.p[2].moved,moveAck:H.p[2].moveAck||null,rematch:!!H.p[2].rematch};
 if(H.phase==='pick'){if(side===1)p2.slots=hidden.slice();else p1.slots=hidden.slice()}
 return JSON.parse(JSON.stringify({rev:H.rev||0,phase:H.phase,mode:H.mode,round:H.round,p:{1:p1,2:p2},f:(H.phase==='mode'||H.phase==='pick')?{1:[],2:[]}:H.f,last:H.last,history:H.history,winner:H.winner,rematchNotice:H.rematchNotice||null,engineError:H.engineError||null}))
}
function mqttPub(topic,obj,opts){if(mqttClient&&mqttClient.connected){mqttClient.publish(topic,typeof obj==='string'?obj:JSON.stringify(obj),Object.assign({qos:0,retain:false},opts||{}))}}
function broadcastState(){if(ROLE===1&&H)mqttPub(topicState,{t:'state',s:viewFor(2),ts:Date.now()},{qos:1,retain:true})}
function publish(){H.rev=(H.rev||0)+1;S=viewFor(1);broadcastState();try{render()}catch(e){console.error('QuRa render error',e);H.uiError=String(e&&e.message||e)}}
function startRematch(){
 H.f[1]=H.p[1].slots.map(function(id,pos){return clone(C(id),pos)});
 H.f[2]=H.p[2].slots.map(function(id,pos){return clone(C(id),pos)});
 H.phase='fight';H.round=1;H.last=null;H.history=[];H.winner=0;H.rematchNotice=null;H.engineError=null;H.uiError=null;
 [1,2].forEach(function(side){H.p[side].moves=null;H.p[side].moved=false;H.p[side].moveAck=null;H.p[side].rematch=false});H.resolving=false;
 publish()
}
function tryStartPick(){
 if(H.phase!=='mode')return false;
 var a=H.p[1],b=H.p[2];
 if(a.mode&&b.mode&&a.mode===b.mode&&a.crest&&b.crest&&a.crest!==b.crest){
   H.mode=a.mode;H.phase='pick';return true
 }
 return false
}
function host(side,m){
 if(!m)return;
 if(m.t==='mode'&&H.phase==='mode'){H.p[side].mode=(m.mode==='wall'||m.mode==='target')?m.mode:null;tryStartPick()}
 if(m.t==='crest'&&H.phase==='mode'){var cr=String(m.crest||'').slice(0,8),other=side===1?2:1;if(cr&&H.p[other].crest!==cr)H.p[side].crest=cr;else if(cr===H.p[other].crest)H.p[side].crest=null;tryStartPick()}
 if(m.t==='slots'&&H.phase==='pick'){H.p[side].slots=m.slots;H.p[side].ready=false}
 if(m.t==='ready'&&H.phase==='pick')H.p[side].ready=true;
 if(m.t==='moves'&&H.phase==='fight'){H.engineError=null;var mr=+m.round||H.round;if(mr===H.round){if(!H.p[side].moved){H.p[side].moves=m.moves;H.p[side].moved=true;H.p[side].moveAck=m.commandId||('r'+H.round+'-p'+side)}if(side===2)mqttPub(topicAck,{t:'move-ack',commandId:m.commandId||null,round:H.round,accepted:true,ts:Date.now()},{qos:1})}}
 if(m.t==='rematch'&&H.phase==='done'){H.rematchNotice=null;H.p[side].rematch=true;if(H.p[1].rematch&&H.p[2].rematch){startRematch();return}publish();return}
 if(m.t==='rematch-decline'&&H.phase==='done'){H.p[1].rematch=false;H.p[2].rematch=false;H.rematchNotice={type:'declined',by:side,ts:Date.now()};publish();return}
 if(H.phase==='pick'&&H.p[1].ready&&H.p[2].ready&&H.p[1].slots.every(Boolean)&&H.p[2].slots.every(Boolean)){H.f[1]=H.p[1].slots.map(function(id,pos){return clone(C(id),pos)});H.f[2]=H.p[2].slots.map(function(id,pos){return clone(C(id),pos)});H.phase='fight';H.round=1}
 if(H.phase==='fight'&&H.p[1].moved&&H.p[2].moved&&!H.resolving){H.resolving=true;publish();setTimeout(function(){if(H&&H.phase==='fight'&&H.resolving){try{resolveHost()}catch(e){console.error('QuRa battle resolve error',e);H.engineError=String(e&&e.message||e);H.resolving=false;publish()}}},250);return}
 publish()
}
function sendPendingCommand(){if(ROLE!==2||!pendingCmd||pendingCmdAck)return;mqttPub(topicCmd,{from:2,msg:pendingCmd,ts:Date.now()},{qos:1})}
function send(m){
 if(ROLE===1){host(1,m);return}
 if(m&&m.t==='moves'){
   if(!m.commandId)m.commandId='p2-r'+(m.round||S.round)+'-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,6);
   pendingCmd=m;pendingCmdAck=false;sendPendingCommand();
   if(cmdTimer)clearInterval(cmdTimer);cmdTimer=setInterval(function(){if(pendingCmd&&!pendingCmdAck)sendPendingCommand();else{clearInterval(cmdTimer);cmdTimer=null}},700);
 }else mqttPub(topicCmd,{from:2,msg:m,ts:Date.now()},{qos:1})
}
function sendChat(text,kind){
 text=String(text||'').replace(/\s+/g,' ').trim().slice(0,140);if(!text||!mqttClient||!mqttClient.connected)return;
 var msg={id:ROLE+'-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,7),from:ROLE,text:text,kind:kind||'text',ts:Date.now()};
 receiveChat(msg);
 mqttPub(topicChat,msg,{qos:1})
}
function renderChatOnly(){
 try{
   var box=$('#chatMessages');
   if(box){
     box.innerHTML=chatLog.slice(-24).map(function(m){return'<div class="chatmsg '+(m.from===ROLE?'mine':'theirs')+'"><span>'+escHtml(m.text)+'</span></div>'}).join('')||'<div class="muted">Бросьте первую реплику 👋</div>';
     box.scrollTop=box.scrollHeight
   }
   var bubble=$('#opponentBubble'),op=ROLE===1?2:1,last=chatLog.slice().reverse().find(function(x){return x.from===op});
   if(bubble){bubble.innerHTML=last?'💬 '+escHtml(last.text):'';bubble.style.display=last?'block':'none'}
 }catch(e){console.error('QuRa chat update error',e)}
}
function receiveChat(m){
 if(!m||!m.id||chatSeen[m.id])return;chatSeen[m.id]=1;
 chatLog.push({id:m.id,from:+m.from,text:String(m.text||'').slice(0,140),kind:m.kind||'text',ts:+m.ts||Date.now()});
 if(chatLog.length>60)chatLog=chatLog.slice(-60);
 renderChatOnly()
}
function netStatus(t){var el=$('#net');if(el)el.textContent=t}
function syncPendingMode(){try{if(typeof localMode!=='undefined'&&localMode&&connected)send({t:'mode',mode:localMode})}catch(e){}}
function markOpponent(role){
 if(role===ROLE)return;
 opponentSeen=Date.now();
 if(!connected){connected=true;netStatus('🟢 Соперник подключён через облачную комнату');syncPendingMode();if(ROLE===1)publish();render()}
}
function publishPresence(){mqttPub(topicPresence+ROLE,{role:ROLE,ts:Date.now(),room:room})}
function restartNetwork(){
 try{if(mqttClient)mqttClient.end(true)}catch(e){}
 mqttClient=null;brokerConnected=false;connected=false;opponentSeen=0;lastNetError='';
 if(presenceTimer){clearInterval(presenceTimer);presenceTimer=null}
 if(monitorTimer){clearInterval(monitorTimer);monitorTimer=null}
 if(stateTimer){clearInterval(stateTimer);stateTimer=null}
 if(cmdTimer){clearInterval(cmdTimer);cmdTimer=null}pendingCmd=null;pendingCmdAck=false;
 netStatus('🟡 Перезапуск облачной комнаты…');setTimeout(net,300)
}
function net(){
 if(!window.mqtt){netStatus('🔴 Не загрузилась библиотека MQTT. Обновите страницу.');return}
 netStatus('🟡 Подключаемся к облачной комнате…');
 if(ROLE===1&&!H){
   H={rev:0,phase:'mode',mode:null,round:0,resolving:false,engineError:null,uiError:null,p:{1:{mode:null,crest:null,slots:[null,null,null],ready:false,moves:null,moved:false,moveAck:null,rematch:false},2:{mode:null,crest:null,slots:[null,null,null],ready:false,moves:null,moved:false,moveAck:null,rematch:false}},f:{1:[],2:[]},last:null,history:[],winner:0,rematchNotice:null}
 }
 var clientId='qura3_'+ROLE+'_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,9);
 mqttClient=mqtt.connect('wss://broker.emqx.io:8084/mqtt',{clientId:clientId,clean:true,keepalive:20,reconnectPeriod:1500,connectTimeout:7000,protocolVersion:4});
 mqttClient.on('connect',function(){
   brokerConnected=true;lastNetError='';
   netStatus('🟡 Облако подключено. Ждём соперника…');
   mqttClient.subscribe(topicPresence+'+',{qos:0});mqttClient.subscribe(topicChat,{qos:1});
   if(ROLE===1){mqttClient.subscribe(topicCmd,{qos:1});mqttPub(topicState,'',{qos:1,retain:true});setTimeout(publish,120);if(stateTimer)clearInterval(stateTimer);stateTimer=setInterval(function(){if(H&&mqttClient&&mqttClient.connected)broadcastState()},900)}
   else{mqttClient.subscribe(topicState,{qos:1});mqttClient.subscribe(topicAck,{qos:1})}
   publishPresence();
   if(presenceTimer)clearInterval(presenceTimer);
   presenceTimer=setInterval(publishPresence,1800);
   if(monitorTimer)clearInterval(monitorTimer);
   monitorTimer=setInterval(function(){
     if(opponentSeen&&Date.now()-opponentSeen<5500){
       if(!connected){connected=true;netStatus('🟢 Соперник подключён через облачную комнату');syncPendingMode();render()}
     }else if(connected){
       connected=false;netStatus('🟡 Облако подключено. Соперник временно не виден…');render()
     }
   },1000);
   render()
 });
 mqttClient.on('message',function(topic,payload){
   var txt='';try{txt=payload.toString()}catch(e){return}
   if(topic.indexOf(topicPresence)===0){try{var p=JSON.parse(txt);markOpponent(+p.role)}catch(e){};return}
   if(topic===topicChat){try{receiveChat(JSON.parse(txt))}catch(e){};return}
   if(ROLE===2&&topic===topicAck){try{var ack=JSON.parse(txt);if(ack&&ack.t==='move-ack'&&pendingCmd&&(!ack.commandId||ack.commandId===pendingCmd.commandId)){pendingCmdAck=true;if(cmdTimer){clearInterval(cmdTimer);cmdTimer=null}}}catch(e){};return}
   if(ROLE===1&&topic===topicCmd){try{var cmd=JSON.parse(txt);if(cmd&&cmd.from===2)host(2,cmd.msg)}catch(e){};return}
   if(ROLE===2&&topic===topicState&&txt){try{var st=JSON.parse(txt);if(st&&st.t==='state'&&st.s){var rev=+st.s.rev||0;if(rev>lastStateRev){lastStateRev=rev;S=st.s;if(S.p&&S.p[2]&&S.p[2].moved){pendingCmdAck=true;if(cmdTimer){clearInterval(cmdTimer);cmdTimer=null}}render()}}}catch(e){}}
 });
 mqttClient.on('reconnect',function(){brokerConnected=false;netStatus('🟠 Переподключаемся к облачной комнате…')});
 mqttClient.on('offline',function(){brokerConnected=false;connected=false;netStatus('🟠 Облако недоступно, повторяем…');render()});
 mqttClient.on('close',function(){brokerConnected=false;connected=false;netStatus('🟠 Соединение с облаком закрыто, повторяем…');render()});
 mqttClient.on('error',function(e){lastNetError=e&&e.message?e.message:'mqtt';netStatus('🟠 Ошибка облачной комнаты: '+lastNetError)})
}
