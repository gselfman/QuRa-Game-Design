var activeSlot=0,lastRound=0,hintText='',localMode=null,localCrest=null,clairvoyanceOn=false,localSubmitPending=false,lastSubmittedPayload=null;
var CRESTS=['🐺','🦁','🐀','🐇','🔥','💧','💨','🌳','⚔️','🛡️','🏰','🪖','🐍','🎸','☀️','🌙','✝️'];
function escHtml(s){return String(s==null?'':s).replace(/[&<>\"']/g,function(ch){return({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'})[ch]})}
function crestOf(side){return S.p&&S.p[side]&&S.p[side].crest?S.p[side].crest:'◻️'}
function sideName(side){var ids=(S.p&&S.p[side]&&S.p[side].slots?S.p[side].slots:[]).filter(Boolean);return ids.length?ids.map(function(id){var ch=C(id);return ch?ch.n:'?'}).join(' · '):'состав не выбран'}
function teamLabel(side){return crestOf(side)+' '+sideName(side)}
function chickenLabel(name,side){return crestOf(side)+' '+name}
function visibleTeamName(side){if(side===ROLE)return teamLabel(side);if(S.phase==='pick')return S.p[side].ready?'🔒 '+crestOf(side)+' Состав подтверждён':'🔒 '+crestOf(side)+' Соперник формирует команду';return teamLabel(side)}
function modeName(m){return m==='target'?'🎯 JRPG — свободная цель':'🧱 Стенка на стенку'}
function modePicker(){
 var synced=S.p[ROLE].mode,my=localMode||synced,op=ROLE===1?2:1,other=S.p[op].mode;
 var syncedC=S.p[ROLE].crest||null,myC=localCrest||syncedC,otherC=S.p[op].crest||null;
 var crestBtns=CRESTS.map(function(cr){var occupied=otherC===cr,sel=myC===cr;return'<button data-crest="'+cr+'" class="crestbtn '+(sel?'sel ':'')+(occupied?'occupied':'')+'" '+(occupied?'disabled':'')+'>'+cr+'</button>'}).join('');
 var conflict=myC&&otherC===myC&&syncedC!==myC?'<div class="cresterror">Этот герб уже выбрал соперник — выберите другой.</div>':'';
 return'<h2>1. Выберите правила боя</h2><div class="modegrid"><button data-mode="wall" class="modecard '+(my==='wall'?'sel':'')+'"><b>🧱 Стенка на стенку</b><span>Курочка №1 сражается с №1, №2 с №2, №3 с №3. После выбывания курочки линии автоматически перестраиваются; одна курочка может оказаться против двух или трёх.</span></button><button data-mode="target" class="modecard '+(my==='target'?'sel':'')+'"><b>🎯 JRPG — свободная цель</b><span>Для Атаки, Манёвра и Special каждая курочка сама выбирает любую живую цель. Команда может сфокусировать одну противницу.</span></button></div><h2>2. Выберите герб команды</h2><div class="cresthelp">Герб будет стоять рядом с каждой вашей курочкой в бою и летописи. Одинаковый герб двум игрокам выбрать нельзя.</div><div class="crestgrid">'+crestBtns+'</div>'+conflict+'<div class="modewait">'+(my?'Режим: <b>'+modeName(my)+'</b>. '+(synced===my?'✓':'⏳'):'Режим ещё не выбран. ')+' '+(myC?'Герб: <b class="crestlarge">'+myC+'</b>. '+(syncedC===myC?'✓':'⏳'):'Герб ещё не выбран. ')+'<br>'+(other?'Соперник: <b>'+modeName(other)+'</b>. ':'Соперник ещё выбирает режим. ')+(otherC?'Герб соперника: <b class="crestlarge">'+otherC+'</b>.':'')+'</div>';
}
function slotPicker(){var used=localSlots.filter(Boolean);var slots=localSlots.map(function(id,i){var c=id?C(id):null;return'<button class="slot '+(activeSlot===i?'sel':'')+'" data-slot="'+i+'"><span class="pos">Место '+(i+1)+'</span>'+(c?'<div class="ico">'+c.i+'</div><h3>'+c.n+'</h3><div class="tiny">❤️'+c.hp+' ⚔️'+c.a+' 🛡️'+c.d+' ⚡'+c.s+'</div>':'<h3>Выберите курочку</h3><div class="tiny">Сначала выберите место, затем курочку ниже.</div>')+'</button>'}).join('');var cards=R.map(function(c){var u=used.includes(c.id);return'<button class="card '+(u?'used':'')+'" data-chick="'+c.id+'" '+(u?'disabled':'')+'><span class="ico">'+c.i+'</span><b>'+c.n+'</b><span class="gold">'+c.m+' · '+c.x+'</span><span>❤️'+c.hp+' ⚔️'+c.a+' 🛡️'+c.d+' ⚡'+c.s+'</span></button>'}).join('');return'<div class="modebadge">'+modeName(S.mode)+'</div><h2>Расставьте 3 курочек</h2><div class="slots">'+slots+'</div><h3>Доступные курочки</h3><div class="roster">'+cards+'</div><button id="ready" class="primary" '+(localSlots.every(Boolean)&&connected?'':'disabled')+'>'+(S.p[ROLE].ready?'✓ Состав подтверждён':'Подтвердить состав и расстановку')+'</button>'}
function expectedBase(c,t){if(!t)return null;return Math.max(5,Math.round(20+1.15*c.a-.72*t.d))}
function maneuverDesc(c){
 if(c.id==='r')return'<b>Что происходит:</b> Ряба резко разбивает золотую скорлупу крылом. Сотни мелких острых осколков летят веером: от них трудно закрыться обычным блоком, а самые крупные кусочки остаются вокруг Рябы как импровизированная броня.<br><b>Эффект:</b> 24 урона + 10 щита. Особенно хорош против Защиты.';
 if(c.id==='b')return'<b>Что происходит:</b> Боевик идёт напролом, толкает соперницу и нарочно выводит её из равновесия. Пока та приходит в себя, Боевик уже занял удобную позицию для следующего тяжёлого удара.<br><b>Эффект:</b> 25 урона; следующая Атака Боевика сильнее на 18%.';
 if(c.id==='f')return'<b>Что происходит:</b> Дурочка делает совершенно нелепый финт — будто побежала в одну сторону, споткнулась, развернулась и внезапно оказалась с другой. Предсказать её невозможно, поэтому следующий удар приходит оттуда, откуда его не ждут.<br><b>Эффект:</b> 31 урона; следующая Атака Дурочки сильнее на 20%.';
 if(c.id==='p')return'<b>Что происходит:</b> Профессор мгновенно считывает стойку соперницы, замечает подготовку её главного приёма и точным вмешательством сбивает расчёт и ритм атаки.<br><b>Эффект:</b> 26 урона и −18 заряда Special у цели.';
 if(c.id==='m')return'<b>Что происходит:</b> Монах на мгновение замирает, уходит от суеты боя и восстанавливает внутреннее равновесие. Спокойствие возвращает силы, а короткое точное движение не даёт противнице воспользоваться паузой.<br><b>Эффект:</b> 24 урона + восстановление до 12 HP.';
 return'<b>Что происходит:</b> Гламурочка демонстративно позирует прямо посреди боя. Соперница на секунду теряет концентрацию, сбивается с ритма и следующий удар наносит уже без прежней уверенности.<br><b>Эффект:</b> 27 урона; следующая Атака цели слабее на 22%.';
}
function specialDesc(c){
 if(c.id==='r')return'<b>Что происходит:</b> Ряба вызывает целую Золотую скорлупу и взрывает её вокруг себя. Золотые осколки прошивают пространство перед ней, а оставшиеся фрагменты собираются вокруг Рябы в плотный защитный кокон.<br><b>Эффект:</b> около 25 урона + 18 щита. Если противница угадала и выбрала Защиту — около 11 урона, но Ряба всё равно получает 14 щита.';
 if(c.id==='b')return'<b>Что происходит:</b> Боевик терпеливо ждёт долю секунды, а затем вкладывается в один тяжёлый ответный удар всем корпусом. Это не хитрость — это чистая мощь.<br><b>Эффект:</b> около 46 урона. Правильная Защита способна погасить удар примерно до 21.';
 if(c.id==='f')return'<b>Что происходит:</b> Дурочка кричит «Авось!» и делает то, чего не ожидал вообще никто — иногда даже она сама. Может промахнуться, может попасть очень больно, а может выдать совершенно безумный удар.<br><b>Эффект:</b> 10% — 0 урона; 65% — около 43; 25% — около 58. Защита режет успешный урон примерно вдвое.';
 if(c.id==='p')return'<b>Что происходит:</b> Профессор заканчивает расчёт: угол, дистанция, момент и слабая точка уже известны. Никакой суеты — один выверенный удар туда, где он даст максимальный результат.<br><b>Эффект:</b> около 45 точного урона. Защита снижает его примерно до 23.';
 if(c.id==='m')return'<b>Что происходит:</b> Монах собирает Благодать и на короткое время будто успокаивает само поле боя. Он восстанавливает собственные силы, а противницу накрывает ответная волна этой энергии.<br><b>Эффект:</b> восстановление до 27 HP себе + около 18 урона цели. Защита цели снижает урон примерно до 9, но лечение Монаха сохраняется.';
 return'<b>Что происходит:</b> Гламурочка устраивает Ослепительный выход — настолько эффектный и наглый, что соперница теряет темп и на следующую атаку ей уже не хватает концентрации.<br><b>Эффект:</b> около 41 урона + следующая Атака цели слабее на 30%. Защита снижает прямой урон примерно до 20, но эффект сбитой концентрации остаётся.';
}
function actionHelp(c,move,target){
 if(!move)return'<details class="actionhelp"><summary>ℹ️ Что делает выбранное действие</summary><div class="muted">Сначала выберите Атаку, Защиту, Манёвр или Special.</div></details>';
 var base=expectedBase(c,target),name=target?target.n:'соперница',title='',body='';
 if(move==='attack'){
   title='⚔️ Атака';
   body='<p>Базовый удар по '+name+(base?' ≈ <b>'+base+' HP</b>.':' зависит от защиты цели.')+'</p><ul><li>против ⚔️ Атаки — обмен ударами, скорость даёт небольшой перевес;</li><li>против 🛡️ Защиты — большая часть удара блокируется, вы рискуете получить контратаку;</li><li>против 🎯 Манёвра — <b>лучший сценарий</b>: удар усиливается примерно ×1,45;</li><li>против ✨ Special — часть удара проходит, но Special не отменяется.</li></ul>';
 }else if(move==='defend'){
   title='🛡️ Защита';
   body='<p>Курочка принимает защитную стойку. Цель не выбирается.</p><ul><li>против ⚔️ Атаки — <b>лучший сценарий</b>: блок + контратака;</li><li>против 🛡️ Защиты — никто не получает урон;</li><li>против 🎯 Манёвра — <b>опасно</b>: Манёвр обходит блок;</li><li>против ✨ Special — прямой урон Special заметно уменьшается.</li></ul>';
 }else if(move==='maneuver'){
   title='🎯 '+c.m;body='<p>'+maneuverDesc(c)+'</p><ul><li>против 🛡️ Защиты — Манёвр раскрывается полностью;</li><li>против ⚔️ Атаки — подготовку могут сорвать прямым давлением;</li><li>против 🎯 Манёвра — важна скорость;</li><li>против ✨ Special — ваш приём срабатывает, но Special тоже может пройти.</li></ul>';
 }else{
   title='✨ '+c.x;body='<p>'+specialDesc(c)+'</p><ul><li>против 🛡️ Защиты — прямой эффект слабее;</li><li>против остальных действий — Special проходит сильнее;</li><li>заряженный Special виден сопернику, поэтому сам факт готовности создаёт возможность для блефа.</li></ul>';
 }
 return'<details class="actionhelp" open><summary>'+title+' — описание эффекта</summary>'+body+'</details>';
}
function copyFighter(c){return JSON.parse(JSON.stringify(c))}
function wallOpponents(c){
 var pairs=pairings(S),op=ROLE===1?2:1,out=[];
 pairs.forEach(function(p){if(ROLE===1&&p.a&&p.a.pos===c.pos&&p.b&&!p.b.dead)out.push(p.b);if(ROLE===2&&p.b&&p.b.pos===c.pos&&p.a&&!p.a.dead)out.push(p.a)});
 return out.filter(function(x,i,a){return a.findIndex(function(y){return y.pos===x.pos})===i});
}
function previewTargets(c){
 var op=ROLE===1?2:1;
 return S.mode==='target'?(S.f[op]||[]).filter(function(x){return x&&!x.dead}):wallOpponents(c);
}
function previewOutcome(c,e,myMove,enemyMove){
 if(enemyMove==='special'&&e.q<100)return{unavailable:true,text:'Special недоступен — заряд '+e.q+'/100'};
 var mc=copyFighter(c),ec=copyFighter(e),r,myAfter,enemyAfter,win=false,lose=false;
 try{
  if(S.mode==='wall'){
    if(ROLE===1){r=clash(mc,ec,myMove,enemyMove,.5);myAfter=r.after[0];enemyAfter=r.after[1];win=r.w===1;lose=r.w===2}
    else{r=clash(ec,mc,enemyMove,myMove,.5);myAfter=r.after[1];enemyAfter=r.after[0];win=r.w===2;lose=r.w===1}
  }else if(myMove==='defend'){
    r=targetOutcome(ec,mc,enemyMove,'defend',.5);myAfter=r.after[1];enemyAfter=r.after[0];win=r.w===2;lose=r.w===1
  }else{
    r=targetOutcome(mc,ec,myMove,enemyMove,.5);myAfter=r.after[0];enemyAfter=r.after[1];win=r.w===1;lose=r.w===2
  }
 }catch(err){return{text:'прогноз недоступен: '+escHtml(err.message||err)}}
 var verdict=enemyAfter<=0&&myAfter<=0?'💥 двойной нокаут':enemyAfter<=0?'💀 вы добиваете '+e.n:myAfter<=0?'☠️ ваша '+c.n+' погибнет':win?'✅ вы выигрываете столкновение':lose?'❌ вы проигрываете столкновение':'➖ без чистого победителя';
 var suffix=(c.id==='f'&&myMove==='special')?' · «Авось!» вероятностный, показан средний сценарий':'';
 return{text:verdict+' · '+c.n+' ❤️'+myAfter+' · '+e.n+' ❤️'+enemyAfter+suffix};
}
function clairvoyancePanel(c,myMove){
 if(!clairvoyanceOn||!myMove)return'';
 var targets=previewTargets(c);if(!targets.length)return'<div class="clairpanel">🔮 Нет доступных столкновений для прогноза.</div>';
 var moves=['attack','defend','maneuver','special'];
 return'<div class="clairpanel"><div class="clairtitle">🔮 Ясновидение — возможные исходы</div><div class="tiny">Прототип будущего бафа «Всевидящий». Прогноз считается тем же Battle Engine.</div>'+targets.map(function(e){return'<div class="clairtarget"><b>'+chickenLabel(e.n,ROLE===1?2:1)+' ❤️'+e.hp+'</b>'+moves.map(function(em){var p=previewOutcome(c,e,myMove,em),lbl=em==='attack'?'⚔️ Атака':em==='defend'?'🛡️ Защита':em==='maneuver'?'🎯 '+e.m:'✨ '+e.x;return'<div class="clairrow '+(p.unavailable?'muted':'')+'"><span>'+lbl+'</span><strong>'+p.text+'</strong></div>'}).join('')+'</div>'}).join('')+'</div>';
}
function targetPicker(c){if(S.mode!=='target')return'';var move=localMoves[c.pos],need=move&&move!=='defend';if(!need)return move==='defend'?'<div class="targetbox">🛡️ Защите цель не нужна.</div>':'<div class="targetbox muted">После выбора Атаки / Манёвра / Special выберите цель.</div>';var op=ROLE===1?2:1,targets=(S.f[op]||[]).filter(function(x){return x&&!x.dead});return'<div class="targetbox"><b>Цель:</b><div class="targetbuttons">'+targets.map(function(t){return'<button data-target-pos="'+c.pos+'" data-target="'+t.pos+'" class="'+(localTargets[c.pos]===t.pos?'on':'')+'">'+t.i+' '+t.n+' ❤️'+t.hp+'</button>'}).join('')+'</div></div>'}
function currentTarget(c){if(S.mode!=='target')return autoTarget(c);var op=ROLE===1?2:1,pos=localTargets[c.pos];return (S.f[op]||[]).find(function(x){return x&&!x.dead&&x.pos===pos})||null}
function autoTarget(c){var op=ROLE===1?2:1,a=S.f[op]||[],same=a[c.pos];if(same&&!same.dead)return same;for(var k=0;k<3;k++){var p=(c.pos+k)%3,t=a[p];if(t&&!t.dead)return t}return null}
function moveButtons(c){var m=localMoves[c.pos],locked=S.p[ROLE].moved,target=currentTarget(c);return'<div class="moves">'+['attack','defend','maneuver','special'].map(function(x){var text=x==='attack'?'⚔️ Атака':x==='defend'?'🛡️ Защита':x==='maneuver'?'🎯 '+c.m:'✨ '+c.x;var dis=locked||(x==='special'&&c.q<100);return'<button data-pos="'+c.pos+'" data-move="'+x+'" class="'+(m===x?'on':'')+'" '+(dis?'disabled':'')+'>'+text+'</button>'}).join('')+'</div>'+targetPicker(c)+actionHelp(c,m,target)+clairvoyancePanel(c,m)}
function teamRoundClass(side){if(!S.last||!S.last.teamWinner)return'';return S.last.teamWinner===side?'team-round-win':'team-round-lose'}
function fighterRoundClass(c,side){
 if(!S.last||!S.last.clashes)return'';var w=0,l=0;
 S.last.clashes.forEach(function(x){var involved=(x.sideA===side&&x.posA===c.pos)||(x.sideB===side&&x.posB===c.pos);if(!involved)return;var gw=x.globalWinner||x.w;if(!gw)return;if(gw===side)w++;else l++});
 return w>l?'chicken-round-win':l>w?'chicken-round-lose':'';
}
function survivorStrategy(ch,enemy){
 var low=ch.hp/ch.max<.38,ready=ch.q>=100,weak=enemy.slice().sort(function(a,b){return a.hp-b.hp})[0];
 if(ch.id==='r'){
   if(ready)return'🐔 Ряба осталась одна, но это её сильнейший камбэк-сценарий. Золотая скорлупа уже готова: Special сейчас особенно ценен, потому что в «Стенке» один выбор может отработать сразу против нескольких соперниц. Если играете JRPG — добивайте самую раненую цель ('+weak.n+', '+weak.hp+' HP), если это безопасно.';
   return low?'🐔 Ряба критически ранена. Ищите выживание через Защиту или «Скорлупу»: щит сейчас важнее чистого урона. Цель — дожить до заряда Special.':'🐔 Ряба одна против нескольких: не спешите с обычной Атакой. «Скорлупа» одновременно наносит урон и создаёт щит — это лучший способ нарастить шанс на камбэк и зарядить Special.';
 }
 if(ch.id==='m'){
   if(ready&&ch.hp<ch.max)return'🧘 Монах остался один и ранен: «Благодать» уже готова. Это лучший момент совместить лечение и урон, чтобы пережить ещё один цикл атак.';
   return low?'🧘 Монах на грани. Ставка на выживание: Медитация/Защита и накопление Special. Сейчас лечение ценнее попытки быстро добить здоровую цель.':'🧘 Монах может тянуть бой. Используйте Медитацию, когда ожидаете Защиту соперника, и берегите HP — его сила в затяжном камбэке.';
 }
 if(ch.id==='b'){
   if(ready)return'🥊 Боевик один против нескольких, но «Ответочка» заряжена. Ищите цель, которую Special способен добить; если соперники ждут Special и закрываются, Провокация наказывает их Защиту и усиливает следующую Атаку.';
   return low?'🥊 Боевик сильно ранен. Не разменивайтесь вслепую: Защита против ожидаемой Атаки даст контрудар, а Провокация полезна против защитного соперника.':'🥊 Боевик любит силовые размены, но против численного большинства важно сначала создать выгодный следующий удар через Провокацию.';
 }
 if(ch.id==='f'){
   if(ready)return'🤪 Дурочка осталась одна. «Авось!» даёт реальный шанс перевернуть бой, но это риск: если есть почти добитая цель, Special оправдан; против полной команды учитывайте шанс промаха.';
   return'🤪 Дурочка должна использовать скорость и непредсказуемость: Атака хороша против ожидаемого Манёвра, Финт — против Защиты. Не повторяйте один паттерн два раунда подряд.';
 }
 if(ch.id==='p'){
   if(ready)return'🤓 Профессор остался один и «Расчёт» готов. Ищите самую раненую цель для гарантированного давления; если у опасного врага почти готов Special, «Анализ» может быть ценнее обычного урона.';
   return'🤓 Профессор в меньшинстве должен играть от информации: «Анализ» снижает заряд Special врага. Приоритет — сбить самый опасный заряженный приём, а не просто бить ближайшего.';
 }
 if(ready)return'😎 Гламурочка одна, но «Ослепительный выход» готов: удар одновременно ослабляет следующую Атаку цели. Выбирайте самого опасного атакующего соперника.';
 return low?'😎 Гламурочка сильно ранена. Позирование полезно, если надо ослабить следующую Атаку опасной цели; против прямого давления рассмотрите Защиту.':'😎 Гламурочка может пережить численный перевес через контроль: Позирование уменьшает следующую Атаку врага, поэтому выбирайте самого опасного атакующего.';
}
function tacticalHint(){
 var op=ROLE===1?2:1,mine=(S.f[ROLE]||[]).filter(function(x){return x&&!x.dead}),enemy=(S.f[op]||[]).filter(function(x){return x&&!x.dead}),tips=[];
 if(!mine.length||!enemy.length)return'<b>Тактический разбор</b><ul><li>Бой уже завершён.</li></ul>';
 var score=mine.length+'×'+enemy.length,enemyReady=enemy.filter(function(x){return x.q>=100}),myReady=mine.filter(function(x){return x.q>=100});
 tips.push('📍 Состояние поля: <b>'+score+'</b>. У вас '+mine.length+' живых курочек, у соперника '+enemy.length+'.');

 if(mine.length===1){
   tips.push(survivorStrategy(mine[0],enemy));
   if(enemyReady.length)tips.push('⚠️ У соперника заряжены Special: '+enemyReady.map(function(x){return chickenLabel(x.n,op)}).join(', ')+'. С одной оставшейся курочкой нельзя позволить себе случайно принять несколько мощных ударов без Защиты.');
 }else if(enemy.length===1){
   var lone=enemy[0];
   tips.push('🎯 У соперника осталась одна '+chickenLabel(lone.n,op)+'. Не выбирайте всей командой одинаковое действие: одиночная курочка одним удачным контрходом может наказать сразу несколько ваших.');
   if(lone.q>=100)tips.push('🚨 У одиночной '+lone.n+' Special 100/100. Разведите Атаку / Защиту / Манёвр между своими курочками, чтобы один её Special или контрход не выиграл весь раунд.');
   if(S.mode==='target')tips.push('В JRPG все живые курочки могут давить одну цель, но действия лучше разнообразить: фокус цели ≠ одинаковые кнопки.');
 }else{
   if(S.mode==='target'){
     var weak=enemy.slice().sort(function(a,b){return a.hp-b.hp})[0];
     if(mine.length>=2&&weak.hp/weak.max<.55)tips.push('🎯 Есть реальная цель для фокуса: '+chickenLabel(weak.n,op)+' — '+weak.hp+' HP. Двумя курочками можно попробовать создать численное преимущество, но третью не обязательно отправлять туда же.');
     else tips.push('🎯 В JRPG сейчас нет очевидной почти добитой цели. Не фокусируйте всех автоматически: распределение целей может лучше защищать от контрходов.');
   }
   if(myReady.length)tips.push('✨ Ваши готовые Special: '+myReady.map(function(x){return chickenLabel(x.n,ROLE)}).join(', ')+'. Смотрите прежде всего на возможность добивания и на ожидаемую Защиту соперника.');
   if(enemyReady.length)tips.push('⚠️ У соперника готовы Special: '+enemyReady.map(function(x){return chickenLabel(x.n,op)}).join(', ')+'. Курочка с низким HP напротив такого врага особенно уязвима.');
 }

 if(S.mode==='wall'){
   var ps=pairings(S),incoming={};
   ps.forEach(function(p){var me=ROLE===1?p.a:p.b;if(me)incoming[me.pos]=(incoming[me.pos]||0)+1});
   Object.keys(incoming).forEach(function(pos){if(incoming[pos]>1){var ch=(S.f[ROLE]||[])[+pos];if(ch&&!ch.dead)tips.push('🧱 '+chickenLabel(ch.n,ROLE)+' в следующем раунде участвует сразу в '+incoming[pos]+' столкновениях. Её один выбранный ход будет проверен против нескольких соперниц — выбирайте действие с учётом всех линий, а не одной.') }});
 }

 var counts={attack:0,defend:0,maneuver:0,special:0},seen={};
 (S.history||[]).forEach(function(r){(r.clashes||[]).forEach(function(x){[['sideA','posA','ma'],['sideB','posB','mb']].forEach(function(k){if(x[k[0]]===op){var key=r.round+'-'+x[k[1]];if(!seen[key]){seen[key]=1;counts[x[k[2]]]++}}})})});
 var total=counts.attack+counts.defend+counts.maneuver+counts.special,top=Object.keys(counts).sort(function(a,b){return counts[b]-counts[a]})[0];
 if(total>=4&&counts[top]/total>=.5){var cn=top==='attack'?'Защита':top==='defend'?'Манёвр':top==='maneuver'?'Атака':'Защита';tips.push('📊 Замеченный паттерн: соперник использовал «'+(top==='attack'?'Атаку':top==='defend'?'Защиту':top==='maneuver'?'Манёвр':'Special')+'» '+counts[top]+' раз из '+total+'. Базовый контрответ — '+cn+', но повторять его автоматически опасно: соперник тоже видит историю.')}
 return'<b>Тактический разбор</b><ul>'+tips.slice(0,5).map(function(t){return'<li>'+t+'</li>'}).join('')+'</ul>';
}
function charByName(n){return R.find(function(c){return c.n===n})||{n:n,id:'?',m:'Манёвр',x:'Special'}}
function moveLead(n,m){
 var c=charByName(n);
 if(m==='attack'){
  if(c.id==='r')return'Ряба рванулась вперёд, подхватив темп коротким резким ударом крыла';
  if(c.id==='b')return'Боевик пошёл напролом и вложил весь корпус в тяжёлый прямой удар';
  if(c.id==='f')return'Дурочка совершенно непредсказуемо метнулась вперёд и атаковала с неудобного угла';
  if(c.id==='p')return'Профессор холодно выверил дистанцию и нанёс точный, почти учебниковый удар';
  if(c.id==='m')return'Монах без лишнего движения сделал короткий и спокойный выпад';
  return'Гламурочка эффектно шагнула навстречу и нанесла быстрый, почти сценический удар';
 }
 if(m==='defend'){
  if(c.id==='r')return'Ряба собрала крылья и приготовилась принять удар на себя';
  if(c.id==='b')return'Боевик встал намертво, превратив стойку в живую стену';
  if(c.id==='f')return'Дурочка внезапно присела и закрылась так странно, что понять её план было невозможно';
  if(c.id==='p')return'Профессор заранее вычислил траекторию атаки и занял идеальную оборонительную позицию';
  if(c.id==='m')return'Монах замер, успокоил дыхание и встретил опасность без единого лишнего движения';
  return'Гламурочка прикрылась с таким видом, будто даже оборона была частью номера';
 }
 if(m==='maneuver'){
  if(c.id==='r')return'Ряба ударила по золотой скорлупе: та разлетелась веером острых осколков, а крупные фрагменты сомкнулись вокруг неё защитным панцирем';
  if(c.id==='b')return'Боевик включил «Провокацию»: обманным движением заставил соперницу раскрыться и тут же занял позицию для следующего тяжёлого удара';
  if(c.id==='f')return'Дурочка начала свой безумный «Финт»: дёрнулась в одну сторону, будто споткнулась, развернулась и возникла совсем не там, где её ждали';
  if(c.id==='p')return'Профессор применил «Анализ»: за долю секунды считал стойку соперницы и начал разрушать подготовку её главного приёма';
  if(c.id==='m')return'Монах ушёл в «Медитацию»: на мгновение отрешился от схватки, вернул себе силы и сохранил контроль над дистанцией';
  return'Гламурочка включила «Позирование»: эффектно замерла в идеальной позе, заставив соперницу на миг забыть, что вообще идёт бой';
 }
 if(c.id==='r')return'Ряба призвала «Золотую скорлупу»: вокруг неё вспыхнул золотой кокон, готовый разлететься режущим градом осколков';
 if(c.id==='b')return'Боевик приготовил «Ответочку» — один чудовищно тяжёлый удар, в который собирался вложить всё сразу';
 if(c.id==='f')return'Дурочка крикнула «Авось!» и затеяла нечто, исход чего не смог бы предсказать даже Профессор';
 if(c.id==='p')return'Профессор завершил «Расчёт»: угол, дистанция и слабая точка сошлись в одну идеальную линию атаки';
 if(c.id==='m')return'Монах призвал «Благодать»: вокруг него будто стих шум боя, а силы начали возвращаться';
 return'Гламурочка вышла на «Ослепительный выход» — настолько яркий, что сопернице стало трудно следить и за боем, и за самой собой';
}
function deathLine(n){return'<span class="deathline">💀 '+n+' не выдержала натиска, пошатнулась и выбыла из боя.</span>'}
function literaryClash(x){
 var A=x.a,B=x.b,ma=x.ma,mb=x.mb,gw=x.globalWinner||x.w,parts=[];
 if(ma==='attack'&&mb==='maneuver'){
   parts.push(moveLead(B,'maneuver')+'. Но '+A+' не дала трюку раскрыться: '+moveLead(A,'attack')+'. Манёвр оказался прерван прямым давлением.');
 }else if(ma==='maneuver'&&mb==='attack'){
   parts.push(moveLead(A,'maneuver')+'. Однако '+B+' не стала разгадывать замысел и просто пошла вперёд: '+moveLead(B,'attack')+'. Подготовка манёвра была сорвана.');
 }else if(ma==='maneuver'&&mb==='defend'){
   parts.push(moveLead(B,'defend')+'. Именно этого и ждала '+A+': '+moveLead(A,'maneuver')+'. Обычная защита оказалась рассчитана на прямой удар и не спасла от хитрости.');
 }else if(ma==='defend'&&mb==='maneuver'){
   parts.push(moveLead(A,'defend')+'. Но '+B+' отказалась бить в лоб: '+moveLead(B,'maneuver')+'. Защитная стойка не успела перестроиться под нестандартный приём.');
 }else if(ma==='attack'&&mb==='defend'){
   parts.push(moveLead(A,'attack')+'. '+B+' прочитала намерение заранее: '+moveLead(B,'defend')+'. Удар вязнет в блоке, а ответная контратака заставляет атакующую пожалеть о прямолинейности.');
 }else if(ma==='defend'&&mb==='attack'){
   parts.push(moveLead(B,'attack')+'. '+A+' встретила удар именно так, как готовилась: '+moveLead(A,'defend')+'. Большая часть атаки гасится, и тут же следует ответ.');
 }else if(ma==='attack'&&mb==='attack'){
   parts.push(moveLead(A,'attack')+', а '+B+' в ту же секунду ответила собственной атакой. Они сошлись без хитростей — чистый обмен ударами, где быстрота решала, кому достанется лишняя доля преимущества.');
 }else if(ma==='defend'&&mb==='defend'){
   parts.push(moveLead(A,'defend')+', и '+B+' сделала то же самое. Несколько долгих мгновений обе выжидали чужую ошибку — но никто не решился первым раскрыться.');
 }else if(ma==='maneuver'&&mb==='maneuver'){
   parts.push(moveLead(A,'maneuver')+'. Навстречу '+moveLead(B,'maneuver')+'. На поле столкнулись две хитрости сразу; преимущество досталось той, кто быстрее довела свой замысел до конца.');
 }else if(ma==='special'&&mb==='defend'){
   parts.push(moveLead(A,'special')+'. '+B+' успела подготовиться: '+moveLead(B,'defend')+'. Special всё же прорвался сквозь оборону, но потерял значительную часть своей силы.');
 }else if(ma==='defend'&&mb==='special'){
   parts.push(moveLead(B,'special')+'. '+A+' увидела угрозу и '+moveLead(A,'defend')+'. Защита смягчила страшный удар, но полностью остановить его не смогла.');
 }else if(ma==='special'||mb==='special'){
   var sn=ma==='special'?A:B,om=ma==='special'?B:A;
   parts.push(moveLead(sn,'special')+'. '+om+' не сумела полностью погасить этот момент — на поле развернулся главный приём '+sn+'.');
 }else{
   parts.push(moveLead(A,ma)+'. '+moveLead(B,mb)+'. '+x.why);
 }
 if(x.before&&x.after){
   var lossA=x.before[0]-x.after[0],lossB=x.before[1]-x.after[1];
   if(gw){var wn=gw===x.sideA?A:B;parts.push('<span class="epicwinner">В этой сцене верх берёт '+wn+'.</span>')}
   else if(lossA||lossB)parts.push('Никто не получил чистой победы, но обмен оставил след на обеих сторонах.');
   if(x.before[0]>0&&x.after[0]===0)parts.push(deathLine(A));
   if(x.before[1]>0&&x.after[1]===0)parts.push(deathLine(B));
 }
 return parts.join(' ');
}
function pressureIntro(r){
 if(r.mode!=='target')return'';
 var counts={},names={};
 (r.clashes||[]).forEach(function(x){var k=x.sideB+'-'+x.posB;counts[k]=(counts[k]||0)+1;names[k]=x.b});
 var hot=Object.keys(counts).filter(function(k){return counts[k]>=2}).sort(function(a,b){return counts[b]-counts[a]})[0];
 if(!hot)return'';
 var n=counts[hot],who=names[hot];return'<p class="pressure">⚡ В этом раунде '+who+' оказалась в центре настоящей охоты: '+(n===2?'две':'три')+' атаки сошлись на одной цели. Ей пришлось одним выбранным решением отвечать сразу на несколько угроз.</p>';
}
function epicRound(r){
 var title=r.teamWinner?'Раунд '+r.round+'. Инициатива у команды '+sideName(r.teamWinner)+'.':'Раунд '+r.round+'. Ни одна сторона не смогла вырвать явный перевес.';
 var scenes=(r.clashes||[]).map(function(x){return'<p class="epicscene">'+literaryClash(x)+'</p>'}).join('');
 var finale=r.teamWinner?'<p class="roundfinal">К концу раунда поле осталось за командой <b>'+sideName(r.teamWinner)+'</b>. Счёт столкновений — '+r.wins[0]+':'+r.wins[1]+'.</p>':'<p class="roundfinal">Раунд закончился без явного хозяина поля: '+r.wins[0]+':'+r.wins[1]+'.</p>';
 return'<article class="epicround"><h3>⚔️ '+title+'</h3>'+pressureIntro(r)+scenes+finale+'</article>';
}
function tacticsRound(r){
 return'<details class="tactics"><summary>⚙️ Тактика и расчёт раунда '+r.round+'</summary>'+(r.clashes||[]).map(function(x){var gw=x.globalWinner||x.w,winner=gw?(gw===x.sideA?x.a:x.b):'без чистой победы',tip=x.tipsBySide?x.tipsBySide[ROLE]:(x.tips&&x.tips[ROLE]?x.tips[ROLE]:'');return'<div class="historyclash"><b>'+x.a+' '+x.la+' VS '+x.b+' '+x.lb+'</b><div>Результат: '+winner+'. '+x.why+'</div><div class="tiny">'+x.a+' ❤️ '+x.before[0]+'→'+x.after[0]+' · '+x.b+' ❤️ '+x.before[1]+'→'+x.after[1]+'</div>'+(x.details&&x.details.length?'<div class="tiny">'+x.details.join(' · ')+'</div>':'')+(tip?'<div class="historytip">На будущее: '+tip+'</div>':'')+'</div>'}).join('')+'</details>';
}
function epicPlainText(){
 var h=(S.history||[]);if(!h.length)return'Летопись боя пока пуста.';
 var box=document.createElement('div');box.innerHTML=h.map(function(r){return epicRound(r)}).join('');
 return'🐔 QuRa Arena — летопись боя\n\n'+box.innerText.trim()+'\n\nИтог: '+(S.winner===3?'двойной нокаут':S.winner?('победила команда '+sideName(S.winner)):'бой продолжается');
}
function battleHistory(){
 var h=(S.history||[]).slice().reverse();if(!h.length)return'<div class="history"><h2>📜 Летопись боя</h2><div class="muted">После первого раунда здесь начнёт складываться история сражения.</div></div>';
 return'<div class="history"><div class="historyhead"><h2>📜 Летопись боя</h2><div><button id="copyEpic">📋 Копировать</button><button id="shareEpic">↗ Поделиться</button></div></div><div class="epicintro">Не протокол ударов, а история того, как разворачивалась схватка.</div>'+h.map(function(r){return epicRound(r)+tacticsRound(r)}).join('')+'</div>';
}
function chatPanel(){
 var quick=['✅ Да','❌ Нет','👋 Привет!','👏 Красивый ход!','🔥 Вот это бой!','😱 Вот это да!','😂 Ха!','🍀 Повезло!','😈 Я это задумал!','🛡️ Читаю тебя','🎯 Попробуй угадай','🤝 GG','🔁 Реванш?'];
 var emoji=['😄','😂','😱','👏','🔥','😈','💀','🐔','🍀','🤝'];
 var rows=(chatLog||[]).slice(-24).map(function(m){return'<div class="chatmsg '+(m.from===ROLE?'mine':'theirs')+'"><span>'+escHtml(m.text)+'</span></div>'}).join('');
 return'<aside class="chatpanel"><div class="chathead"><b>💬 Чат с соперником</b><span class="tiny">быстрые реплики и реакции</span></div><div id="chatMessages" class="chatmessages">'+(rows||'<div class="muted">Бросьте первую реплику 👋</div>')+'</div><div class="quickchat">'+quick.map(function(q){return'<button data-chat="'+escHtml(q)+'">'+escHtml(q)+'</button>'}).join('')+'</div><div class="emojibar">'+emoji.map(function(e){return'<button data-chat="'+e+'" class="emojiBtn">'+e+'</button>'}).join('')+'</div><div class="chatinput"><input id="chatInput" maxlength="140" placeholder="Написать сопернику…"><button id="chatSend">➤</button></div></aside>';
}
function safeChatPanel(){try{return chatPanel()}catch(e){console.error('QuRa chat render error',e);return'<aside class="chatpanel chaterror"><b>💬 Чат временно недоступен</b><div class="tiny">Игровой экран продолжает работать.</div></aside>'}}
function opponentBubble(){
 var op=ROLE===1?2:1,m=(chatLog||[]).slice().reverse().find(function(x){return x.from===op});
 return'<div id="opponentBubble" class="opponentbubble" style="'+(m?'':'display:none')+'">'+(m?'💬 '+escHtml(m.text):'')+'</div>';
}
function rematchControls(){
 var op=ROLE===1?2:1,my=!!(S.p[ROLE]&&S.p[ROLE].rematch),other=!!(S.p[op]&&S.p[op].rematch);
 if(S.phase!=='done')return'<button id="rematchBtn" disabled>🔁 Реванш — после боя</button>';
 if(other&&!my)return'<div class="rematchchoice"><button id="rematchYes">✅ Да, реванш</button><button id="rematchNo">❌ Нет</button></div>';
 if(my)return'<button id="rematchBtn" disabled>🔁 Ждём ответ соперника…</button>';
 return'<button id="rematchBtn">🔁 Предложить реванш</button>';
}
function bindChatControls(){
 try{document.querySelectorAll('[data-chat]').forEach(function(b){b.onclick=function(){sendChat(b.dataset.chat,'quick')}});
 if($('#chatSend'))$('#chatSend').onclick=function(){var i=$('#chatInput');if(i&&i.value.trim()){sendChat(i.value,'text');i.value=''}};
 if($('#chatInput'))$('#chatInput').onkeydown=function(e){if(e.key==='Enter'){e.preventDefault();var b=$('#chatSend');if(b)b.click()}};
 var cm=$('#chatMessages');if(cm)cm.scrollTop=cm.scrollHeight}catch(e){console.error('QuRa chat bind error',e)}
}
function moveSyncStatus(){
 if(S.phase!=='fight')return'';if(S.engineError)return'<div class="movestatus syncerror"><b>⚠️ Ошибка расчёта раунда</b><div>'+escHtml(S.engineError)+'</div><div class="tiny">Ошибка уже показана вместо вечного зависания. Пришлите этот текст.</div></div>';
 var op=ROLE===1?2:1,me=!!(S.p[ROLE]&&S.p[ROLE].moved),other=!!(S.p[op]&&S.p[op].moved);
 if(me)localSubmitPending=false;
 var mine=me?'🟢 подтверждён арбитром':localSubmitPending?'🟡 отправляется…':'⚪ ещё не отправлен';
 var theirs=other?'🟢 подтверждён':'⚪ ждём';
 var both=me&&other?'<div class="syncboth">⚔️ Оба хода подтверждены. Рассчитываем раунд…</div>':'';
 var retry=localSubmitPending&&!me&&lastSubmittedPayload?'<button id="retryMove" class="retrymove">↻ Повторить отправку хода</button>':'';
 return'<div class="movestatus"><b>Синхронизация раунда '+S.round+'</b><div>Ваш ход: '+mine+'</div><div>Ход соперника: '+theirs+'</div>'+both+retry+'</div>';
}
function fighterCard(c,side){if(!c)return'<div class="fighter dead">Пусто</div>';var hp=Math.max(0,c.hp/c.max*100);return'<div class="fighter '+(c.dead?'dead ':'')+fighterRoundClass(c,side)+'"><span class="pos">Место '+(c.pos+1)+'</span><div class="big">'+c.i+'</div><b class="fightername">'+crestOf(side)+' '+c.n+'</b><div>❤️ '+c.hp+'/'+c.max+'</div><div class="bar"><i style="width:'+hp+'%"></i></div><div>✨ '+c.q+'/100</div><div class="bar sp"><i style="width:'+c.q+'%"></i></div>'+(side===ROLE&&!c.dead&&S.phase==='fight'?moveButtons(c):'')+'</div>'}
function roundResult(){if(!S.last)return'<div class="round"><b>После первого раунда здесь появятся сразу все столкновения.</b></div>';var l=S.last,tw=l.teamWinner,head=tw?'Раунд '+l.round+': победила команда '+teamLabel(tw):'Раунд '+l.round+': командная ничья';var clashes=l.clashes.map(function(c,i){var gw=c.globalWinner||c.w,won=gw===ROLE,tip=c.tipsBySide?c.tipsBySide[ROLE]:(c.tips&&c.tips[ROLE]?c.tips[ROLE]:'');return'<div class="clash '+(won?'win':'')+'"><b>Столкновение '+(i+1)+': '+c.a+' '+c.la+' VS '+c.b+' '+c.lb+'</b><div class="why">'+c.why+'</div><div class="tiny">'+c.a+': ❤️ '+c.before[0]+' → '+c.after[0]+' · '+c.b+': ❤️ '+c.before[1]+' → '+c.after[1]+'</div>'+(c.details&&c.details.length?'<div class="tiny">'+c.details.join(' · ')+'</div>':'')+(tip?'<div class="coach">💡 '+tip+'</div>':'')+'</div>'}).join('');return'<div class="round"><div class="score">'+head+' · '+l.wins[0]+':'+l.wins[1]+'</div><div class="tiny" style="text-align:center">'+modeName(l.mode||S.mode)+'</div><div class="clashes">'+clashes+'</div></div>'}
function render(){var op=ROLE===1?2:1;$('#role').textContent='Сторона '+ROLE;$('#room').textContent=room;
 if(S.phase==='mode'){$('#teams').innerHTML='';$('#notice').textContent=connected?'Сначала оба игрока должны выбрать одинаковый режим боя.':'Ждём соединения со вторым игроком…';$('#main').innerHTML='<div class="pregamegrid"><div>'+modePicker()+'</div>'+safeChatPanel()+'</div>';document.querySelectorAll('[data-mode]').forEach(function(b){b.onclick=function(){localMode=b.dataset.mode;if(connected)send({t:'mode',mode:localMode});render()}});document.querySelectorAll('[data-crest]').forEach(function(b){b.onclick=function(){localCrest=b.dataset.crest;if(connected)send({t:'crest',crest:localCrest});render()}});bindChatControls();return}
 $('#teams').innerHTML='<div class="teamline"><b>Ваш состав:</b> '+teamLabel(ROLE)+'</div><div class="teamline"><b>Соперник:</b> '+visibleTeamName(op)+'</div>';
 if(S.phase==='pick'){$('#notice').textContent=connected?(S.p[op].ready?'🔒 Соперник уже подтвердил скрытый состав. Ваш режим: '+modeName(S.mode):'Режим: '+modeName(S.mode)+'. Выберите трёх разных курочек. Состав соперника раскроется только после готовности обеих сторон.'):'Ждём соединения со вторым игроком…';$('#main').innerHTML='<div class="pregamegrid"><div>'+slotPicker()+'</div>'+safeChatPanel()+'</div>';document.querySelectorAll('[data-slot]').forEach(function(b){b.onclick=function(){activeSlot=+b.dataset.slot;render()}});document.querySelectorAll('[data-chick]').forEach(function(b){b.onclick=function(){localSlots[activeSlot]=b.dataset.chick;send({t:'slots',slots:localSlots.slice()});activeSlot=Math.min(2,activeSlot+1);render()}});if($('#ready'))$('#ready').onclick=function(){if(connected)send({t:'ready'})};bindChatControls();return}
 if(S.round!==lastRound){lastRound=S.round;localMoves={};localTargets={};hintText='';localSubmitPending=false;lastSubmittedPayload=null}
 var mine=S.f[ROLE]||[],theirs=S.f[op]||[];$('#notice').textContent=S.phase==='done'?'Бой завершён':S.p[op].moved&&!S.p[ROLE].moved?'⚡ Соперник уже выбрал ходы всей команды. Ваша очередь.':S.p[ROLE].moved?'✓ Ходы вашей команды зафиксированы. Ждём соперника…':'Режим: '+modeName(S.mode)+'. Выберите действие для каждой живой курочки'+(S.mode==='target'?' и цель для каждого атакующего действия.':'.');
 var myRematch=!!(S.p[ROLE]&&S.p[ROLE].rematch),opRematch=!!(S.p[op]&&S.p[op].rematch),canRematch=S.phase==='done'&&!myRematch;
 $('#main').innerHTML='<div class="gamegrid"><div class="battlecolumn"><section class="teamzone '+teamRoundClass(ROLE)+'"><h2>Ваша команда</h2><div class="battlefield">'+mine.map(function(c){return fighterCard(c,ROLE)}).join('')+'</div></section><section class="teamzone '+teamRoundClass(op)+'"><h2>Команда соперника</h2>'+opponentBubble()+'<div class="battlefield">'+theirs.map(function(c){return fighterCard(c,op)}).join('')+'</div></section>'+moveSyncStatus()+'<div class="battletools"><button id="hintBtn" title="В прототипе бесплатно; в продуктовой версии — платная тактическая помощь">💡 Подсказка</button>'+rematchControls()+'</div>'+(opRematch&&!myRematch&&S.phase==='done'?'<div class="rematchnote">🔁 Соперник предлагает реванш теми же командами и в том же режиме. Выберите Да или Нет.</div>':'')+(S.rematchNotice&&S.rematchNotice.type==='declined'?'<div class="rematchdeclined">'+(S.rematchNotice.by===ROLE?'Вы отказались от реванша.':'Соперник отказался от реванша.')+'</div>':'')+(hintText?'<div class="hintresult">'+hintText+'</div>':'')+(S.phase==='fight'?'<button id="submit" class="primary submit">Зафиксировать ходы команды</button>':'')+roundResult()+(S.phase==='done'?'<div class="finish">'+(S.winner===3?'🤝 Двойной нокаут':S.winner===ROLE?'🏆 Ваша команда выиграла бой!':'🏆 Команда соперника выиграла бой.')+'</div>':'')+battleHistory()+'</div>'+safeChatPanel()+'</div>';
 bindChatControls();if($('#copyEpic'))$('#copyEpic').onclick=function(){var t=epicPlainText();navigator.clipboard&&navigator.clipboard.writeText(t).then(function(){var b=$('#copyEpic');if(b)b.textContent='✓ Скопировано'}).catch(function(){})};if($('#shareEpic'))$('#shareEpic').onclick=function(){var t=epicPlainText();if(navigator.share)navigator.share({title:'QuRa Arena — летопись боя',text:t}).catch(function(){});else if(navigator.clipboard)navigator.clipboard.writeText(t)};var cm=$('#chatMessages');if(cm)cm.scrollTop=cm.scrollHeight;if($('#retryMove'))$('#retryMove').onclick=function(){if(lastSubmittedPayload){localSubmitPending=true;send({t:'moves',round:S.round,moves:lastSubmittedPayload});render()}};if($('#hintBtn'))$('#hintBtn').onclick=function(){hintText=tacticalHint();render()};if($('#rematchBtn'))$('#rematchBtn').onclick=function(){if(S.phase==='done'&&!myRematch)send({t:'rematch'})};if($('#rematchYes'))$('#rematchYes').onclick=function(){send({t:'rematch'})};if($('#rematchNo'))$('#rematchNo').onclick=function(){send({t:'rematch-decline'})};document.querySelectorAll('[data-move]').forEach(function(b){b.onclick=function(){var pos=+b.dataset.pos,m=b.dataset.move;localMoves[pos]=m;if(m==='defend')delete localTargets[pos];render()}});
 document.querySelectorAll('[data-target]').forEach(function(b){b.onclick=function(){localTargets[+b.dataset.targetPos]=+b.dataset.target;render()}});
 var live=mine.filter(function(c){return !c.dead});if($('#submit')){var ok=live.every(function(c){var m=localMoves[c.pos];return !!m&&(S.mode!=='target'||m==='defend'||localTargets[c.pos]!==undefined)})&&!S.p[ROLE].moved;$('#submit').disabled=!ok;$('#submit').onclick=function(){var payload={};live.forEach(function(c){payload[c.pos]={move:localMoves[c.pos],target:localTargets[c.pos]===undefined?null:localTargets[c.pos]}});lastSubmittedPayload=payload;localSubmitPending=true;send({t:'moves',round:S.round,moves:payload});render()}}
}
net();render();