const ROLE=+window.QURA_ROLE,qs=new URLSearchParams(location.search),room=(qs.get('room')||'lab1027').replace(/[^a-zA-Z0-9_-]/g,'').slice(0,40)||'lab1027';
const selfId=`qura-${room}-p${ROLE}`,hostId=`qura-${room}-p1`;
const R=[
{id:'r',n:'Ряба',i:'🐔',role:'Универсал',hp:108,a:24,d:21,s:18,m:'Скорлупа',x:'Золотая скорлупа'},
{id:'b',n:'Боевик',i:'🥊',role:'Танк-боец',hp:112,a:26,d:23,s:14,m:'Провокация',x:'Ответочка'},
{id:'f',n:'Дурочка',i:'🤪',role:'Риск / скорость',hp:102,a:24,d:17,s:26,m:'Финт',x:'Авось!'},
{id:'p',n:'Профессор',i:'🤓',role:'Контроль',hp:102,a:25,d:19,s:22,m:'Анализ',x:'Расчёт'},
{id:'m',n:'Монах',i:'🧘',role:'Выживание',hp:110,a:21,d:24,s:15,m:'Медитация',x:'Благодать'},
{id:'g',n:'Гламурочка',i:'😎',role:'Дебафф / скорость',hp:102,a:23,d:19,s:24,m:'Позирование',x:'Ослепительный выход'}];
const MOVE={attack:'⚔️ Атака',defend:'🛡️ Защита',maneuver:'🎯 Манёвр',special:'✨ Особый приём'};
let peer,conn,connected=false,retry,localTeam=[];
let state={phase:'lobby',format:1,round:0,players:{1:{team:[],ready:false,moved:false},2:{team:[],ready:false,moved:false}},fighters:{1:[],2:[]},active:{1:0,2:0},last:null,winner:0},host=null;
const $=s=>document.querySelector(s),status=$('#netStatus'),notice=$('#notice');
function clone(c){return {...c,max:c.hp,q:0,shield:0,boost:0,weaken:0,dead:false}}function fighter(id){return clone(R.find(x=>x.id===id))}
function current(side,st=host){let a=st.fighters[side],i=st.active[side]||0;while(i<a.length&&a[i].dead)i++;st.active[side]=i;return a[i]||null}
function charge(c,v){c.q=Math.min(100,c.q+v)}function take(d,v){if(d.shield){let q=Math.min(d.shield,v);d.shield-=q;v-=q}v=Math.max(0,Math.round(v));d.hp=Math.max(0,d.hp-v);if(!d.hp)d.dead=true;return v}
function baseDamage(a,d,m=1){let v=(20+1.15*a.a-.72*d.d)*m;if(a.boost){v*=1+a.boost;a.boost=0}if(a.weaken){v*=1-a.weaken;a.weaken=0}return Math.max(5,v)}function hit(a,d,m){return take(d,baseDamage(a,d,m))}function counter(d,a){return take(a,15+.45*d.d-.18*a.d)}
function maneuver(c,e){let v=0,detail='';if(c.id==='r'){c.shield+=10;v=take(e,24);detail=`Скорлупа: ${v} урона и +10 щита.`}else if(c.id==='b'){c.boost=Math.max(c.boost,.18);v=take(e,25);detail=`Провокация: ${v} урона; следующая Атака +18%.`}else if(c.id==='f'){c.boost=Math.max(c.boost,.20);v=take(e,31);detail=`Финт: ${v} урона; следующая Атака +20%.`}else if(c.id==='p'){e.q=Math.max(0,e.q-18);v=take(e,26);detail=`Анализ: ${v} урона и −18 заряда Special врага.`}else if(c.id==='m'){let h=Math.min(c.max-c.hp,12);c.hp+=h;v=take(e,24);detail=`Медитация: ${v} урона и лечение ${h} HP.`}else{e.weaken=Math.max(e.weaken,.22);v=take(e,27);detail=`Позирование: ${v} урона; следующая Атака врага −22%.`}return{v,detail}}
