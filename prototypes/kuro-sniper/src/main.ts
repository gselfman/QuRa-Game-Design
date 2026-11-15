import './style.css';
import balance from './balance.json';
import {GameCore,CAST,clamp} from './game.mjs';
import {World} from './world';
import {AudioDirector} from './audio';

const icons:Record<string,string>={
  aim:'<circle cx="12" cy="12" r="7"/><path d="M12 1v6m0 10v6M1 12h6m10 0h6"/>',
  shoot:'<path d="M7 21h10V9c0-4-5-8-5-8S7 5 7 9v12Z" fill="currentColor" fill-opacity=".25"/><path d="M7 10h10M7 17h10M6 23h12"/>',
  breath:'<path d="M10 3v7c-1-4-3-4-5-1-2 3-3 8-1 10 2 2 5 0 6-2V9m4-6v7c1-4 3-4 5-1 2 3 3 8 1 10-2 2-5 0-6-2V9m-4-2 2-2 2 2"/>',
  heart:'<path d="M20.8 4.6a5.3 5.3 0 0 0-7.5 0L12 6l-1.3-1.4a5.3 5.3 0 0 0-7.5 7.5L12 21l8.8-8.9a5.3 5.3 0 0 0 0-7.5Z"/>',
  pause:'<path d="M8 5v14M16 5v14"/>',
  sound:'<path d="m11 4-6 5H2v6h3l6 5V4Zm4 4a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14"/>',
  wind:'<path d="M2 8h13a3 3 0 1 0-3-3M2 12h17a3 3 0 1 1-3 3M2 16h6"/>',
  arrow:'<path d="M4 12h16m-6-6 6 6-6 6"/>',
  close:'<path d="m6 6 12 12M6 18 18 6"/>',
  wipe:'<path d="m3 15 12-12 6 6-12 12H3v-6Zm2-2 6 6M16 3l5 5"/>',
  capsule:'<path d="M9 20h6V9c0-4-3-7-3-7S9 5 9 9v11ZM9 16h6M8 22h8"/>',
  settings:'<path d="M4 6h16M4 12h16M4 18h16"/><circle cx="8" cy="6" r="2"/><circle cx="16" cy="12" r="2"/><circle cx="10" cy="18" r="2"/>',
  back:'<path d="m14 5-7 7 7 7"/>',
  flag:'<path d="M5 22V3c5-4 9 4 14 0v11c-5 4-9-4-14 0"/>',
  star:'<path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8-6.2-3.2L5.8 21 7 14.2l-5-4.9 6.9-1L12 2Z"/>',
};
const icon=(name:string)=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name]||icons.aim}</svg>`;
const $=<T extends HTMLElement=HTMLElement>(s:string)=>document.querySelector<T>(s)!;
const app=$('#app');
app.innerHTML=`
<canvas id="world" aria-label="Игровой тир. Перетаскивайте изображение для наведения."></canvas>
<div class="cinema-shade"></div>
<div id="loading"><div class="brand">QuRa<span>ИГРЫ С ХАРАКТЕРОМ</span></div><div class="load-emblem">${icon('aim')}</div><h1>Куро Снайпер</h1><p id="load-label">Готовим тир и встречаем курочек…</p><div class="load-track"><i id="load-bar"></i></div></div>
<div id="hud" class="hidden">
 <header class="hud-top"><div class="level-label"><span id="level-label">БУДКА</span><strong>Уровень <b id="level-no">01</b><small>/ 10</small></strong><div class="round-dots" id="round-dots"></div></div>
 <div class="score-block"><span>ОЧКИ</span><strong id="score">0</strong><div id="score-float"></div></div>
 <div class="top-right"><div class="mistakes"><span>ОШИБКИ</span><div id="mistakes"><i></i><i></i><i></i></div></div><button id="pause" class="icon-button" aria-label="Пауза">${icon('pause')}</button></div></header>
 <div id="wind" class="wind hidden">${icon('wind')}<span id="wind-label">ВЕТЕР →</span><i id="wind-strength"></i></div>
 <div id="reticle"><i></i><b></b></div>
 <div id="scope-housing" class="hidden"><div class="scope-rim"></div><div class="crosshair"><i></i><b></b><em></em></div><div class="scope-fine-scale">· &nbsp; · &nbsp; · &nbsp; · &nbsp; ·</div><div id="water-drops"></div><div id="wipe-sweep"></div><span class="optic-mark">Q / PRECISION OPTICS</span></div>
 <div id="zoom-controls" class="hidden"><button id="zoom-out" aria-label="Уменьшить увеличение">−</button><strong id="zoom-value">4×</strong><button id="zoom-in" aria-label="Увеличить увеличение">+</button></div>
 <div id="hint" class="hint">${icon('aim')}<span>Цель — мишень <b>под платформой</b></span></div>
 <div id="ability" class="ability hidden"></div>
 <div id="hit-marker"></div><button id="scope-guide" class="hidden" aria-label="Вернуться к обзору курочек"></button>
 <div id="toast" role="status" aria-live="polite"></div>
 <div class="vitals"><div class="pulse-line"><span class="heart-icon">${icon('heart')}</span><div><span>ПУЛЬС</span><strong id="pulse">72</strong></div><svg id="ecg" viewBox="0 0 150 36"><path id="ecg-path" d="M0 25H150"/></svg></div><div class="breath-line"><span>${icon('breath')} ДЫХАНИЕ</span><strong id="breath-label">Спокойное</strong></div><div class="breath-track"><i id="breath-fill"></i></div></div>
 <div class="ammo"><span id="capsule-icons"></span><div><strong id="ammo">18</strong><small id="ammo-capacity">/18</small><span>ПАТРОНЫ</span></div><i></i><div><strong id="solved">0</strong><small id="total">/1</small><span>МИШЕНИ</span></div></div>
 <button id="breath" class="round-button breath-button" aria-label="Задержать дыхание">${icon('breath')}<span>ЗАДЕРЖАТЬ</span></button>
 <div class="right-controls"><button id="wipe" class="utility hidden" aria-label="Протереть линзу">${icon('wipe')}<span>Протереть</span></button><button id="aim" class="round-button aim-button" aria-label="Прицел" aria-pressed="false">${icon('aim')}<span>ПРИЦЕЛ</span></button><button id="fire" class="fire-button" aria-label="Выстрел">${icon('shoot')}<span>ВЫСТРЕЛ</span></button></div>
 <div class="desktop-hint">Тянуть — навести <i>·</i> ПКМ — прицел <i>·</i> Пробел — выстрел <i>·</i> Shift — дыхание <i>·</i> F — найти курочек</div>
 <div id="round-banner" class="hidden"><span>ЧИСТОЕ ПОПАДАНИЕ</span><strong>Раунд пройден</strong><p>Курочки в безопасности</p></div>
</div>
<div id="menus" class="hidden">
 <div class="menu-nav"><div class="brand">QuRa<span>ИГРЫ С ХАРАКТЕРОМ</span></div><div class="nav-tools"><span class="mode-tag">ДОБРЫЙ ТИР · 0.3.1</span><button class="icon-button" id="menu-sound" aria-label="Звук">${icon('sound')}</button><button class="icon-button" id="menu-settings" aria-label="Настройки">${icon('settings')}</button></div></div>
 <section id="home" class="menu-view"><div class="home-copy"><div class="eyebrow"><i></i> ТОЧНОСТЬ. ВЫДЕРЖКА. КУРОЧКИ.</div><h1>КУРО<br><span>СНАЙПЕР</span></h1><p>Поймай момент.<br>Попади в мишень. Перехитри курочек.</p><div class="start-row"><button class="primary" id="start">В тир ${icon('arrow')}</button><button class="secondary" id="choose">Выбрать уровень</button></div><button id="training" class="text-button">${icon('aim')} Спокойная тренировка <span>без ограничения ошибок</span></button><div class="home-rule">${icon('heart')} <span>Курочкам — семечки.<br>Капсулам — мишени.</span></div></div><div class="home-character"><div class="hero-orbit"></div><img src="/assets/characters/ryaba/perch.webp" alt="Каноническая Ряба QuRa"><span class="hero-caption"><i></i> Знакомьтесь, Ряба.<small>Она верит в вашу меткость.</small></span></div><div class="cast-strip">${CAST.map(c=>`<div><img src="/assets/characters/${c.code}/perch.webp" alt="${c.name}"><span>${c.name}</span></div>`).join('')}<span class="cast-note">ПЯТЬ ХАРАКТЕРОВ.<br>ДЕСЯТЬ ИСПЫТАНИЙ.</span></div></section>
 <section id="level-select" class="menu-view hidden"><div class="section-heading"><button class="icon-button back-home" aria-label="Назад">${icon('back')}</button><div><div class="eyebrow">ОТ БУДКИ ДО КИЛОМЕТРА</div><h2>Выберите дистанцию</h2></div></div><div class="level-grid" id="level-grid"></div></section>
 <section id="settings" class="menu-view hidden"><div class="section-heading"><button class="icon-button back-settings" aria-label="Назад">${icon('back')}</button><div><div class="eyebrow">УДОБНО ИМЕННО ВАМ</div><h2>Настройки</h2></div></div><div class="settings-card"><label><span>Звуки тира<small>Выстрелы, курочки, дыхание</small></span><input id="setting-sound" type="checkbox"></label><label><span>Громкость</span><input id="setting-volume" type="range" min="0" max="100"></label><label><span>Чувствительность прицела</span><input id="setting-sensitivity" type="range" min="30" max="180"></label><label><span>Меньше покачивания<small>Для спокойной тренировки</small></span><input id="setting-calm" type="checkbox"></label><label><span>Управление для левши</span><input id="setting-left" type="checkbox"></label><label><span>Лёгкая графика<small>Меньше теней, ниже разрешение</small></span><input id="setting-low" type="checkbox"></label></div></section>
</div>
<div id="modal" class="hidden"><div class="modal-card" id="modal-card"></div></div>
<div id="rotate"><div>${icon('aim')}</div><h2>Разверните телефон</h2><p>Курочки уже заняли свои места.<br>Удобнее целиться горизонтально.</p></div>`;

let settings:any={sound:true,volume:38,sensitivity:100,calm:false,left:false,low:false};let records:Record<string,any>={};
try{settings={...settings,...JSON.parse(localStorage.getItem('ks-settings')||'{}')};records=JSON.parse(localStorage.getItem('ks-records')||'{}');}catch{}
const audio=new AudioDirector();audio.set(settings.sound,settings.volume/100);
let world:World;let core:GameCore;let view='home',inGame=false,ads=false,settingsFromPause=false;let resultTimer=0,bannerTimer=0,toastTimer=0,scoreTimer=0,uiClock=0;let accumulator=0;let settled=false;let resumeTimer=0;let qaFreeze=false;let touchHoldTimer:any=null;
const qa=new URLSearchParams(location.search).has('qa');

function toast(message:string){$('#toast').textContent=message;$('#toast').classList.add('visible');$('#hud').classList.add('toast-active');toastTimer=2.1;}
function showModal(html:string){$('#modal-card').innerHTML=html;$('#modal').classList.remove('hidden');$('#modal-card').querySelector<HTMLButtonElement>('button')?.focus();}
function closeModal(){$('#modal').classList.add('hidden');}
function findYard(){if(!inGame||core.paused||core.state!=='playing')return;setAds(false);world.magnification=core.level.mode==='balloons'?64:Math.min(96,core.loadout.maxMagnification);world.overview();toast(matchMedia('(pointer:coarse)').matches?'Курочки впереди. Нажмите «Прицел».':'Курочки впереди. Прицел — Q или правая кнопка мыши.');}
function setAds(value:boolean){ads=value;const reflex=core.level.id===1;world.setAds(value);$('#scope-housing').classList.toggle('hidden',!value||reflex);$('#reticle').classList.toggle('hidden',value&&!reflex);$('#reticle').classList.toggle('red-dot',value&&reflex);$('#aim').classList.toggle('active',value);$('#aim').setAttribute('aria-pressed',String(value));$('#zoom-controls').classList.toggle('hidden',!value||core.loadout.maxMagnification<=1);$('#zoom-controls').classList.toggle('fixed',core.loadout.defaultMagnification===core.loadout.maxMagnification);audio.play('click');}
function event(e:any){
  if(e.type==='round'){world?.setActors(core.targets);$('#round-dots').innerHTML=Array.from({length:core.level.mode==='balloons'?1:5},(_,i)=>`<i class="${i<core.round?'active':''}"></i>`).join('');if(inGame){setAds(false);world.aimAt(core.targets[0].id);if(core.round>1){const c=CAST[core.round-1];toast(`${c.name}: ${c.role.toLowerCase()}`);}}}
  if(['fire','hit','hen','miss','water','wipe','breath','exhale','won'].includes(e.type))audio.play(e.type==='hit'&&core.level.mode==='balloons'?'pop':e.type,core.loadout.id==='classic_bolt'?'classic':core.loadout.family);
  if(e.type==='fire'){world.fireEffect();$('#fire').classList.add('firing');setTimeout(()=>$('#fire').classList.remove('firing'),120);}
  if(e.type==='hit'){if(core.level.mode!=='balloons')world.featherBurst(e.targetId,6);$('#hit-marker').className='success';setTimeout(()=>$('#hit-marker').className='',500);$('#score-float').textContent=`+${e.earned}${e.center?' · В ЦЕНТР!':''}`;$('#score-float').classList.add('show');scoreTimer=1.3;}
  if(e.type==='hen'){world.featherBurst(e.targetId);toast('В мишень, а не в курочку!');$('#hit-marker').className='penalty';setTimeout(()=>$('#hit-marker').className='',450);}
  if(e.type==='miss'){toast('Мимо. Выдохните и попробуйте ещё раз.');}
  if(e.type==='warning'){toast(e.code==='fighter'?'Боевик поднимает водяной бластер…':'Гламурочка готовит выступление…');}
  if(e.type==='water')toast('Капли на оптике — линзу можно протереть');
  if(e.type==='round-clear'){core.hold(false);bannerTimer=1.45;$('#round-banner').classList.remove('hidden');audio.play('round');}
  if(e.type==='won'||e.type==='lost'){resultTimer=1.65;settled=false;core.hold(false);}
}

async function boot(){
  try{
    core=new GameCore(balance,event);world=new World($('#world') as HTMLCanvasElement);world.onReaction=(name,code)=>audio.play(name,code);
    await world.load(n=>{$('#load-bar').style.width=`${Math.min(n,1)*100}%`;});
    world.setup(balance.levels[0],balance.loadouts[0],core,true);core.start(1,true);core.round=5;core.setupRound();core.state='menu';
    world.onFrame=frame;applySettings();$('#loading').classList.add('loaded');setTimeout(()=>$('#loading').classList.add('hidden'),500);$('#menus').classList.remove('hidden');renderLevelGrid();bind();
    if(qa){(window as any).__KS_QA__={core,world,audio,start:(id:number=1)=>start(id,false),aim:(id:string)=>world.aimAt(id),freeze:(v:boolean)=>{qaFreeze=v;core.quiet=v;},advance:(s:number)=>{for(let t=0;t<s;t+=1/120)core.update(1/120,ads);},ads:(v:boolean)=>setAds(v),project:(id:string)=>world.project(id),get state(){return {state:core.state,level:core.level.id,round:core.round,ammo:core.ammo,score:core.score,mistakes:core.mistakes,ads,water:core.water};}};}
  }catch(error){console.error(error);$('#load-label').innerHTML='Не удалось загрузить сцену. <button class="text-button" onclick="location.reload()">Попробовать ещё раз</button>';}
}

function start(levelId:number,training:boolean){
  audio.stop();audio.start();inGame=true;view='game';resultTimer=0;scoreTimer=0;toastTimer=0;$('#score-float').classList.remove('show');$('#toast').classList.remove('visible');settled=false;resumeTimer=0;closeModal();$('#menus').classList.add('hidden');$('#hud').classList.remove('hidden');$('#round-banner').classList.add('hidden');
  const level=balance.levels.find(l=>l.id===levelId)!;const loadout=balance.loadouts.find(l=>l.id===level.loadoutId)!;
  world.setup(level,loadout,core);core.start(levelId,training);core.quiet=qaFreeze;world.magnification=level.entryMagnification??loadout.maxMagnification;setAds(false);
  $('#level-label').textContent=`${level.environmentTitle.toUpperCase()} · ${level.distanceM} М`;
  $('#level-no').textContent=String(levelId).padStart(2,'0');$('#wind').classList.toggle('hidden',levelId<3);$('#hint').classList.remove('hidden');$('#ammo-capacity').textContent=level.mode==='balloons'?'/8':'/18';$('#hint span').innerHTML=level.mode==='balloons'?'Лопните <b>пять шариков</b>. Курочек бережём!':'Цель — мишень <b>под платформой</b>';toast(training?'Тренировка: ошибки не заканчивают попытку':level.mode==='balloons'?'Пять шариков · 1 км · берите упреждение':'Цель — круглая мишень под платформой');
  updateHUD();
}
function showHome(){
  audio.stop();closeModal();inGame=false;view='home';ads=false;world.setAds(false);$('#scope-housing').classList.add('hidden');$('#hud').classList.add('hidden');$('#menus').classList.remove('hidden');showView('home');
  world.setup(balance.levels[0],balance.loadouts[0],core,true);core.start(1,true);core.round=5;core.setupRound();core.state='menu';core.quiet=false;renderLevelGrid();
}
function showView(name:string){view=name;for(const id of ['home','level-select','settings'])$('#'+id).classList.toggle('hidden',id!==name);}
function renderLevelGrid(){
  $('#level-grid').innerHTML=balance.levels.map(l=>{const r=records[l.id],w=balance.loadouts.find(w=>w.id===l.loadoutId)!;return `<button class="level-card env-${l.environmentId}" data-level="${l.id}"><div><span class="level-index">${String(l.id).padStart(2,'0')}</span><span class="level-distance">${l.distanceM}<small>М</small></span></div><span class="level-place">${l.environmentTitle}</span><span class="level-weapon">${w.title}</span><span class="level-record">${r?'★'.repeat(3-Math.min(r.mistakes,2))+' &nbsp; '+r.score+' очков':l.mode==='balloons'?'Пять шариков · движущиеся цели':'Пять раундов · '+(l.id<3?'Без ветра':'Ветер и характеры')}</span></button>`;}).join('');
  $('#level-grid').querySelectorAll<HTMLButtonElement>('[data-level]').forEach(b=>b.onclick=()=>start(Number(b.dataset.level),false));
}
function pause(){if(!inGame||!['playing','transition'].includes(core.state))return;core.setPaused(true);audio.stop();showModal(`<div class="eyebrow">МОМЕНТ ДЛЯ ВЫДОХА</div><h2>Пауза</h2><p>Курочки никуда не торопятся.</p><button class="primary" id="resume">Продолжить ${icon('arrow')}</button><button class="secondary" id="restart">Начать уровень заново</button><button class="text-button" id="pause-settings">${icon('settings')} Настройки</button><button class="text-button" id="quit">В главное меню</button>`);$('#resume').onclick=resume;$('#restart').onclick=()=>start(core.level.id,core.training);$('#quit').onclick=showHome;$('#pause-settings').onclick=()=>{closeModal();settingsFromPause=true;$('#menus').classList.remove('hidden');showView('settings');};}
function resume(){closeModal();resumeTimer=1.1;toast('Приготовьтесь…');setTimeout(()=>{if(inGame&&resumeTimer>0){core.setPaused(false);resumeTimer=0;}},1100);}
function result(){
  if(settled)return;settled=true;const won=core.state==='won',stars=won?3-Math.min(2,core.mistakes):0;
  if(won&&!core.training){const old=records[core.level.id];if(!old||old.score<core.score){records[core.level.id]={score:core.score,mistakes:core.mistakes};try{localStorage.setItem('ks-records',JSON.stringify(records));}catch{}}}
  const accuracy=core.shots?Math.round(core.hits/core.shots*100):0;
  showModal(`<div class="result-icon ${won?'won':''}">${icon(won?'flag':'aim')}</div><div class="eyebrow">${core.level.environmentTitle.toUpperCase()} · ${core.level.distanceM} М</div><h2>${won?'Красивый выстрел!':'Ещё одна попытка?'}</h2><p>${won?(core.level.mode==='balloons'?'Все шарики лопнули. Курочки гуляют дальше.':'Все курочки внизу. Все в безопасности.'):'Три ошибки. Сделайте выдох — и снова в тир.'}</p>${won?`<div class="stars">${'★'.repeat(stars)}<span>${'★'.repeat(3-stars)}</span></div>`:''}<div class="result-stats"><div><strong>${core.score}</strong><span>ОЧКОВ</span></div><div><strong>${accuracy}%</strong><span>ТОЧНОСТЬ</span></div><div><strong>${core.centers}</strong><span>В ЦЕНТР</span></div></div><button class="primary" id="next">${won&&core.level.id<balance.levels.length?'Следующая дистанция':'Повторить уровень'} ${icon('arrow')}</button><button class="secondary" id="result-levels">Выбрать уровень</button><button class="text-button" id="result-home">В главное меню</button>`);
  $('#next').onclick=()=>start(won&&core.level.id<balance.levels.length?core.level.id+1:core.level.id,core.training);$('#result-levels').onclick=()=>{showHome();showView('level-select');};$('#result-home').onclick=showHome;
}
function shoot(){
  if(!inGame||!$('#modal').classList.contains('hidden')||core.paused||view!=='game')return;
  audio.start();const ray=world.currentShotRay();
  const blocked=core.targets.some(t=>t.penaltyUntil>0&&Math.abs(ray.origin.x+ray.direction.x/ray.direction.z*core.level.distanceM-t.x)<core.level.targetDiameterM&&Math.abs(ray.origin.y+ray.direction.y/ray.direction.z*core.level.distanceM-t.y)<core.level.targetDiameterM);
  if(blocked){toast('Дайте курочке вернуться на платформу');return;}
  if(!core.fire(ray.origin,ray.direction)&&core.wiping)toast('Ещё мгновение — линза будет чистой');
}
function updateHUD(){
  $('#score').textContent=core.score.toLocaleString('ru');$('#ammo').textContent=String(core.ammo).padStart(2,'0');$('#solved').textContent=String(core.targets.filter(t=>t.solved).length);$('#total').textContent='/'+core.targets.length;
  $('#mistakes').querySelectorAll('i').forEach((n,i)=>n.classList.toggle('used',i<core.mistakes));$('#pulse').textContent=String(Math.round(core.pulse));$('#breath-fill').style.width=`${core.breath}%`;
  $('#breath-label').textContent=core.holding?'Задержано':core.lockout>0?'Восстановление':core.breath<35?'Глубокий выдох':'Спокойное';$('#breath').classList.toggle('active',core.holding);$('#breath-fill').classList.toggle('low',core.breath<30);
  $('#fire').classList.toggle('cooling',!!core.shot||core.cooldown>0||core.wiping>0||core.state!=='playing');$('#wipe').classList.toggle('hidden',core.water<.06||!ads);$('#wipe-sweep').classList.toggle('wiping',core.wiping>0);
  const guide=world.scopeGuide();$('#scope-guide').textContent=guide.replace('ЦЕЛЬ','ОБЗОР');$('#scope-guide').classList.toggle('hidden',!guide);$('#zoom-value').textContent=`${Math.round(world.magnification)}×`;($('#zoom-in') as HTMLButtonElement).disabled=world.magnification>=core.loadout.maxMagnification-.01;($('#zoom-out') as HTMLButtonElement).disabled=world.magnification<=core.loadout.defaultMagnification+.01;$('#wind-label').textContent=`ВЕТЕР ${core.wind>=0?'→':'←'}`;$('#wind-strength').style.width=`${Math.abs(core.wind)*40+4}px`;
  const path=[];for(let x=0;x<=150;x+=2){const phase=(x/150+core.time*core.pulse/60)%1;let y=24;if(phase>.30&&phase<.38)y-=Math.sin((phase-.3)/.08*Math.PI)*5;if(phase>.48&&phase<.54)y+=Math.sin((phase-.48)/.06*Math.PI)*7;if(phase>.54&&phase<.59)y-=Math.sin((phase-.54)/.05*Math.PI)*21;if(phase>.59&&phase<.64)y+=Math.sin((phase-.59)/.05*Math.PI)*10;path.push(`${x===0?'M':'L'}${x} ${y}`);}$('#ecg-path').setAttribute('d',path.join(''));
  $('.heart-icon').style.transform=`scale(${1+Math.pow(Math.max(0,Math.sin(core.time*core.pulse/60*Math.PI*2)),10)*.18})`;
  $('#water-drops').classList.toggle('hidden',core.water<=.015);$('#water-drops').style.opacity=String(core.water);$('#ability').classList.toggle('hidden',core.sensory==='none'&&!core.professorActive);
  $('#ability').textContent=core.sensory==='glamour'?'♫ Гламурочка волнует публику':core.sensory==='water-warning'?'Боевик готовит залп':core.professorActive?'Поле Профессора активно':'';
  $('#capsule-icons').innerHTML=Array.from({length:Math.min(core.ammo,5)},()=>icon('capsule')).join('');
}
function frame(dt:number){
  if(!core)return;
  if(inGame&&!qaFreeze){accumulator+=dt;while(accumulator>=1/120){core.update(1/120,ads);accumulator-=1/120;}}
  if(!inGame){core.time+=dt;}
  if(inGame&&!core.paused){audio.tick(core.time,core.pulse,ads,core.state==='playing'?core.sensory:'none',core.state==='playing'&&core.professorActive);if(resultTimer>0){resultTimer-=dt;if(resultTimer<=0)result();}}
  if(toastTimer>0){toastTimer-=dt;if(toastTimer<=0){$('#toast').classList.remove('visible');$('#hud').classList.remove('toast-active');}}
  if(scoreTimer>0){scoreTimer-=dt;if(scoreTimer<=0)$('#score-float').classList.remove('show');}
  if(bannerTimer>0){bannerTimer-=dt;if(bannerTimer<=0)$('#round-banner').classList.add('hidden');}
  if(inGame&&core.time>8)$('#hint').classList.add('hidden');
  uiClock+=dt;if(uiClock>.08){uiClock=0;if(inGame)updateHUD();}
}
function applySettings(){
  audio.set(settings.sound,settings.volume/100);document.body.classList.toggle('left-hand',settings.left);$('#menu-sound').classList.toggle('muted',!settings.sound);
  if(world){world.low=settings.low;world.engine.setHardwareScalingLevel(settings.low?1:1/Math.min(devicePixelRatio||1,1.5));world.scene.shadowsEnabled=!settings.low;world.resize();}
  $('#setting-sound').toggleAttribute('checked',settings.sound);($('#setting-sound') as HTMLInputElement).checked=settings.sound;
  for(const k of ['calm','left','low'])($('#setting-'+k) as HTMLInputElement).checked=settings[k];
  ($('#setting-volume') as HTMLInputElement).value=String(settings.volume);($('#setting-sensitivity') as HTMLInputElement).value=String(settings.sensitivity);
  if(core){core.quiet=qaFreeze;core.reduceSway=settings.calm;}
  try{localStorage.setItem('ks-settings',JSON.stringify(settings));}catch{}
}
function bind(){
  $('#start').onclick=()=>start(1,false);$('#training').onclick=()=>start(1,true);$('#choose').onclick=()=>{audio.start();showView('level-select');};$('#menu-settings').onclick=()=>{audio.start();settingsFromPause=false;showView('settings');};$('#menu-sound').onclick=()=>{audio.start();settings.sound=!settings.sound;applySettings();};
  document.querySelectorAll('.back-home').forEach(e=>(e as HTMLElement).onclick=()=>showView('home'));
  $('.back-settings').onclick=()=>{if(settingsFromPause){$('#menus').classList.add('hidden');view='game';pause();}else showView('home');};
  $('#scope-guide').onclick=findYard;$('#pause').onclick=pause;$('#aim').onclick=()=>{if(!core.paused&&core.state==='playing')setAds(!ads);};
  $('#fire').addEventListener('pointerdown',e=>{e.preventDefault();shoot();});
  const breath=$('#breath');breath.addEventListener('pointerdown',e=>{e.preventDefault();(e.target as HTMLElement).closest('button')?.setPointerCapture(e.pointerId);core.hold(true);});
  for(const name of ['pointerup','pointercancel','lostpointercapture'])breath.addEventListener(name,()=>core.hold(false));
  $('#wipe').onclick=()=>core.wipe();
  const zoom=(factor:number)=>{world.magnification=clamp(world.magnification*factor,Math.min(core.loadout.defaultMagnification,core.loadout.maxMagnification),core.loadout.maxMagnification);updateHUD();};$('#zoom-in').onclick=()=>zoom(1.35);$('#zoom-out').onclick=()=>zoom(1/1.35);
  let drag:{id:number,x:number,y:number}|null=null;
  const canvas=world.canvas;
  canvas.addEventListener('pointerdown',e=>{if(e.pointerType==='mouse'&&e.button!==0)return;if(!inGame||core.paused||view!=='game')return;e.preventDefault();drag={id:e.pointerId,x:e.clientX,y:e.clientY};canvas.setPointerCapture(e.pointerId);});
  canvas.addEventListener('pointermove',e=>{if(drag&&drag.id===e.pointerId&&!core.paused){world.aimDelta(e.clientX-drag.x,e.clientY-drag.y,settings.sensitivity/100);drag.x=e.clientX;drag.y=e.clientY;}});
  for(const name of ['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(name,()=>drag=null);
  canvas.addEventListener('contextmenu',e=>{e.preventDefault();if(inGame&&!core.paused)setAds(!ads);});
  addEventListener('keydown',e=>{if(!inGame)return;if(['Space','ShiftLeft','ShiftRight','Escape','KeyQ','KeyF','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code))e.preventDefault();if(e.repeat&&e.code==='Space')return;if(e.code==='Space')shoot();if(e.code.startsWith('Shift'))core.hold(true);if(e.code==='KeyQ'&&!core.paused)setAds(!ads);if(e.code==='KeyF')findYard();if(e.code==='Escape'){if(core.paused)resume();else pause();}if(e.code.startsWith('Arrow'))world.aimDelta(e.code==='ArrowLeft'?-5:e.code==='ArrowRight'?5:0,e.code==='ArrowUp'?-5:e.code==='ArrowDown'?5:0);});
  addEventListener('keyup',e=>{if(e.code.startsWith('Shift'))core.hold(false);});
  document.addEventListener('visibilitychange',()=>{if(document.hidden&&inGame&&!core.paused)pause();});
  addEventListener('blur',()=>{drag=null;core.hold(false);if(inGame&&!core.paused)pause();});
  const orientation=()=>{if(innerHeight>innerWidth&&inGame&&!core.paused)pause();};addEventListener('resize',orientation);
  for(const k of ['sound','calm','left','low'])$('#setting-'+k).addEventListener('change',e=>{settings[k]=(e.target as HTMLInputElement).checked;applySettings();});
  for(const k of ['volume','sensitivity'])$('#setting-'+k).addEventListener('input',e=>{settings[k]=Number((e.target as HTMLInputElement).value);applySettings();});
  $('#water-drops').innerHTML=Array.from({length:24},(_,i)=>`<i style="left:${8+(i*29)%84}%;top:${5+(i*31)%86}%;width:${22+(i%5)*11}px;height:${28+(i%5)*14}px;transform:rotate(${i*17}deg)"></i>`).join('');
}
boot();
