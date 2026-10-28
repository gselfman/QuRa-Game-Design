var activeSlot=0,lastRound=0,hintText='',localMode=null;
function sideName(side){var ids=S.p[side].slots.filter(Boolean);return ids.length?ids.map(function(id){return C(id).n}).join(' · '):'состав не выбран'}
function visibleTeamName(side){if(side===ROLE)return sideName(side);if(S.phase==='pick')return S.p[side].ready?'🔒 Состав подтверждён':'🔒 Соперник формирует команду';return sideName(side)}
function modeName(m){return m==='target'?'🎯 JRPG — свободная цель':'🧱 Стенка на стенку'}
function modePicker(){var synced=S.p[ROLE].mode,my=localMode||synced,op=ROLE===1?2:1,other=S.p[op].mode;return'<h2>Выберите правила боя</h2><div class="modegrid"><button data-mode="wall" class="modecard '+(my==='wall'?'sel':'')+'"><b>🧱 Стенка на стенку</b><span>Курочка №1 сражается с №1, №2 с №2, №3 с №3. После выбывания цели пары автоматически сдвигаются.</span></button><button data-mode="target" class="modecard '+(my==='target'?'sel':'')+'"><b>🎯 JRPG — свободная цель</b><span>Для каждой Атаки, Манёвра и Special вы сами выбираете любую живую курочку противника. Можно фокусировать одну цель всей командой.</span></button></div><div class="modewait">'+(my?'Ваш выбор: <b>'+modeName(my)+'</b>. '+(synced===my?'✓ синхронизирован. ':'⏳ ждём соединения/синхронизации. '):'Вы ещё не выбрали режим. ')+(other?'Соперник выбрал: <b>'+modeName(other)+'</b>.':'Соперник ещё выбирает.')+(my&&other&&my!==other?'<br><b>⚠️ Режимы не совпадают — один из игроков должен изменить выбор.</b>':'')+'</div>'}
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
function actionHelp(c,move,target){if(!move)return'<div class="actionhelp muted">Выберите действие — здесь появится объяснение последствий.</div>';var b=expectedBase(c,target),name=target?target.n:'соперница';if(move==='attack')return'<div class="actionhelp"><b>⚔️ Выбрана Атака</b><p>Базовый удар по '+name+(b?' ≈ <b>'+b+' HP</b>.':' зависит от её Защиты.')+'</p><ul><li>против ⚔️ Атаки — обе получают урон; более быстрая получает небольшой бонус;</li><li>против 🛡️ Защиты — проходит лишь слабая часть удара, затем вы получаете контратаку;</li><li>против 🎯 Манёвра — <b>лучший сценарий</b>: Атака усиливается примерно ×1,45;</li><li>против ✨ Special — часть удара проходит, но Special соперницы не отменяется.</li></ul></div>';if(move==='defend')return'<div class="actionhelp"><b>🛡️ Выбрана Защита</b><p>Курочка не выбирает цель и готовится принять входящие действия.</p><ul><li>против ⚔️ Атаки — <b>лучший сценарий</b>: почти весь удар блокируется и вы контратакуете;</li><li>против 🛡️ Защиты — обе стороны теряют ход без урона;</li><li>против 🎯 Манёвра — <b>плохой сценарий</b>: Манёвр обходит блок и срабатывает полностью;</li><li>против ✨ Special — прямой урон Special уменьшается примерно вдвое.</li></ul></div>';if(move==='maneuver')return'<div class="actionhelp"><b>🎯 '+c.m+'</b><p>'+maneuverDesc(c)+'</p><ul><li>против 🛡️ Защиты — <b>лучший сценарий</b>: Манёвр проходит полностью;</li><li>против ⚔️ Атаки — опасно: Атака ловит вас во время подготовки;</li><li>против 🎯 Манёвра — преимущество у более быстрой курочки;</li><li>против ✨ Special — Манёвр срабатывает, но Special противника тоже может пройти.</li></ul></div>';return'<div class="actionhelp"><b>✨ '+c.x+'</b><p>'+specialDesc(c)+'</p><ul><li>против 🛡️ Защиты — эффект заметно слабее;</li><li>против остальных действий — Special проходит с полным прямым эффектом;</li><li>готовый Special виден сопернику, поэтому можно блефовать и вместо него выбрать Манёвр.</li></ul></div>'}
function targetPicker(c){if(S.mode!=='target')return'';var move=localMoves[c.pos],need=move&&move!=='defend';if(!need)return move==='defend'?'<div class="targetbox">🛡️ Защите цель не нужна.</div>':'<div class="targetbox muted">После выбора Атаки / Манёвра / Special выберите цель.</div>';var op=ROLE===1?2:1,targets=(S.f[op]||[]).filter(function(x){return x&&!x.dead});return'<div class="targetbox"><b>Цель:</b><div class="targetbuttons">'+targets.map(function(t){return'<button data-target-pos="'+c.pos+'" data-target="'+t.pos+'" class="'+(localTargets[c.pos]===t.pos?'on':'')+'">'+t.i+' '+t.n+' ❤️'+t.hp+'</button>'}).join('')+'</div></div>'}
function currentTarget(c){if(S.mode!=='target')return autoTarget(c);var op=ROLE===1?2:1,pos=localTargets[c.pos];return (S.f[op]||[]).find(function(x){return x&&!x.dead&&x.pos===pos})||null}
function autoTarget(c){var op=ROLE===1?2:1,a=S.f[op]||[],same=a[c.pos];if(same&&!same.dead)return same;for(var k=0;k<3;k++){var p=(c.pos+k)%3,t=a[p];if(t&&!t.dead)return t}return null}
function moveButtons(c){var m=localMoves[c.pos],locked=S.p[ROLE].moved,target=currentTarget(c);return'<div class="moves">'+['attack','defend','maneuver','special'].map(function(x){var text=x==='attack'?'⚔️ Атака':x==='defend'?'🛡️ Защита':x==='maneuver'?'🎯 '+c.m:'✨ '+c.x;var dis=locked||(x==='special'&&c.q<100);return'<button data-pos="'+c.pos+'" data-move="'+x+'" class="'+(m===x?'on':'')+'" '+(dis?'disabled':'')+'>'+text+'</button>'}).join('')+'</div>'+targetPicker(c)+actionHelp(c,m,target)}
function teamRoundClass(side){if(!S.last||!S.last.teamWinner)return'';return S.last.teamWinner===side?'team-round-win':'team-round-lose'}
function fighterRoundClass(c,side){
 if(!S.last||!S.last.clashes)return'';var w=0,l=0;
 S.last.clashes.forEach(function(x){var involved=(x.sideA===side&&x.posA===c.pos)||(x.sideB===side&&x.posB===c.pos);if(!involved)return;var gw=x.globalWinner||x.w;if(!gw)return;if(gw===side)w++;else l++});
 return w>l?'chicken-round-win':l>w?'chicken-round-lose':'';
}
function tacticalHint(){
 var op=ROLE===1?2:1,mine=(S.f[ROLE]||[]).filter(function(x){return !x.dead}),enemy=(S.f[op]||[]).filter(function(x){return !x.dead}),tips=[];
 if(!mine.length||!enemy.length)return'Бой уже завершён.';
 var danger=enemy.filter(function(x){return x.q>=100}),weak=enemy.slice().sort(function(a,b){return a.hp-b.hp})[0],myWeak=mine.slice().sort(function(a,b){return a.hp-b.hp})[0],ready=mine.filter(function(x){return x.q>=100});
 if(danger.length)tips.push('⚠️ У соперника заряжен Special: '+danger.map(function(x){return x.n}).join(', ')+'. Курочке с низким HP стоит рассмотреть Защиту, но помните: соперник может блефовать Манёвром.');
 if(ready.length)tips.push('✨ У вас готов Special: '+ready.map(function(x){return x.n}).join(', ')+'. Если цель уже сильно ранена — это шанс добить; против здоровой цели не жмите Special автоматически, потому что заряд виден и провоцирует Защиту.');
 if(S.mode==='target'&&weak)tips.push('🎯 JRPG: самая уязвимая цель сейчас — '+weak.n+' (❤️ '+weak.hp+'). Фокус двух курочек может быстро создать численное преимущество.');
 if(enemy.length===1&&mine.length>1)tips.push('🧠 У соперника осталась одна курочка. Не выбирайте всем троим одинаковое действие: разнесите Атаку / Защиту / Манёвр, чтобы один удачный ответ не законтрил всю команду.');
 if(myWeak&&myWeak.hp/myWeak.max<.35)tips.push('❤️ '+myWeak.n+' критически ранена ('+myWeak.hp+' HP). Если её потеря ломает план команды, Защита сейчас ценнее лишнего небольшого урона.');
 var counts={attack:0,defend:0,maneuver:0,special:0},seen={};
 (S.history||[]).forEach(function(r){(r.clashes||[]).forEach(function(x){[['sideA','posA','ma'],['sideB','posB','mb']].forEach(function(k){if(x[k[0]]===op){var key=r.round+'-'+x[k[1]];if(!seen[key]){seen[key]=1;counts[x[k[2]]]++}}})})});
 var total=counts.attack+counts.defend+counts.maneuver+counts.special,top=Object.keys(counts).sort(function(a,b){return counts[b]-counts[a]})[0];
 if(total>=3&&counts[top]/total>=.45){var counterMove=top==='attack'?'Защита':top==='defend'?'Манёвр':top==='maneuver'?'Атака':'Защита';tips.push('📊 По истории соперник чаще выбирает «'+(top==='attack'?'Атака':top==='defend'?'Защита':top==='maneuver'?'Манёвр':'Special')+'» ('+counts[top]+' из '+total+'). Базовый ответ — '+counterMove+', но не становитесь предсказуемым.')}
 if(!tips.length)tips.push('Сейчас явного тактического перевеса нет. Разведите действия по команде и постарайтесь получить информацию о привычках соперника, не повторяя один и тот же паттерн.');
 return'<b>Тактический разбор</b><ul>'+tips.map(function(t){return'<li>'+t+'</li>'}).join('')+'</ul>';
}
function scoutPanel(){var r=S.p[ROLE]&&S.p[ROLE].scoutReveal;if(!r)return'';return'<div class="scoutresult">🔭 <b>Разведка, раунд '+r.round+':</b> '+r.name+' выбрала <b>'+r.label+'</b>'+(r.target?' → цель '+r.target:'')+'.</div>'}
function escHtml(s){return String(s==null?'':s).replace(/[&<>"']/g,function(ch){return({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[ch]})}
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
 var quick=['👋 Привет!','👏 Красивый ход!','🔥 Вот это бой!','😱 Вот это да!','😂 Ха!','🍀 Повезло!','😈 Я это задумал!','🛡️ Читаю тебя','🎯 Попробуй угадай','🤝 GG','🔁 Реванш?'];
 var emoji=['😄','😂','😱','👏','🔥','😈','💀','🐔','🍀','🤝'];
 var rows=(chatLog||[]).slice(-24).map(function(m){return'<div class="chatmsg '+(m.from===ROLE?'mine':'theirs')+'"><span>'+escHtml(m.text)+'</span></div>'}).join('');
 return'<aside class="chatpanel"><div class="chathead"><b>💬 Чат с соперником</b><span class="tiny">быстрые реплики и реакции</span></div><div id="chatMessages" class="chatmessages">'+(rows||'<div class="muted">Бросьте первую реплику 👋</div>')+'</div><div class="quickchat">'+quick.map(function(q){return'<button data-chat="'+escHtml(q)+'">'+escHtml(q)+'</button>'}).join('')+'</div><div class="emojibar">'+emoji.map(function(e){return'<button data-chat="'+e+'" class="emojiBtn">'+e+'</button>'}).join('')+'</div><div class="chatinput"><input id="chatInput" maxlength="140" placeholder="Написать сопернику…"><button id="chatSend">➤</button></div></aside>';
}
function opponentBubble(){
 var op=ROLE===1?2:1,m=(chatLog||[]).slice().reverse().find(function(x){return x.from===op});if(!m)return'';
 return'<div class="opponentbubble">💬 '+escHtml(m.text)+'</div>';
}
function bindChatControls(){
 document.querySelectorAll('[data-chat]').forEach(function(b){b.onclick=function(){sendChat(b.dataset.chat,'quick')}});
 if($('#chatSend'))$('#chatSend').onclick=function(){var i=$('#chatInput');if(i&&i.value.trim()){sendChat(i.value,'text');i.value=''}};
 if($('#chatInput'))$('#chatInput').onkeydown=function(e){if(e.key==='Enter'){e.preventDefault();var b=$('#chatSend');if(b)b.click()}};
 var cm=$('#chatMessages');if(cm)cm.scrollTop=cm.scrollHeight;
}
function fighterCard(c,side){if(!c)return'<div class="fighter dead">Пусто</div>';var hp=Math.max(0,c.hp/c.max*100);return'<div class="fighter '+(c.dead?'dead ':'')+fighterRoundClass(c,side)+'"><span class="pos">Место '+(c.pos+1)+'</span><div class="big">'+c.i+'</div><b>'+c.n+'</b><div>❤️ '+c.hp+'/'+c.max+'</div><div class="bar"><i style="width:'+hp+'%"></i></div><div>✨ '+c.q+'/100</div><div class="bar sp"><i style="width:'+c.q+'%"></i></div>'+(side===ROLE&&!c.dead&&S.phase==='fight'?moveButtons(c):'')+'</div>'}
function roundResult(){if(!S.last)return'<div class="round"><b>После первого раунда здесь появятся сразу все столкновения.</b></div>';var l=S.last,tw=l.teamWinner,head=tw?'Раунд '+l.round+': победила команда '+sideName(tw):'Раунд '+l.round+': командная ничья';var clashes=l.clashes.map(function(c,i){var gw=c.globalWinner||c.w,won=gw===ROLE,tip=c.tipsBySide?c.tipsBySide[ROLE]:(c.tips&&c.tips[ROLE]?c.tips[ROLE]:'');return'<div class="clash '+(won?'win':'')+'"><b>Столкновение '+(i+1)+': '+c.a+' '+c.la+' VS '+c.b+' '+c.lb+'</b><div class="why">'+c.why+'</div><div class="tiny">'+c.a+': ❤️ '+c.before[0]+' → '+c.after[0]+' · '+c.b+': ❤️ '+c.before[1]+' → '+c.after[1]+'</div>'+(c.details&&c.details.length?'<div class="tiny">'+c.details.join(' · ')+'</div>':'')+(tip?'<div class="coach">💡 '+tip+'</div>':'')+'</div>'}).join('');return'<div class="round"><div class="score">'+head+' · '+l.wins[0]+':'+l.wins[1]+'</div><div class="tiny" style="text-align:center">'+modeName(l.mode||S.mode)+'</div><div class="clashes">'+clashes+'</div></div>'}
function render(){var op=ROLE===1?2:1;$('#role').textContent='Сторона '+ROLE;$('#room').textContent=room;
 if(S.phase==='mode'){$('#teams').innerHTML='';$('#notice').textContent=connected?'Сначала оба игрока должны выбрать одинаковый режим боя.':'Ждём соединения со вторым игроком…';$('#main').innerHTML='<div class="pregamegrid"><div>'+modePicker()+'</div>'+chatPanel()+'</div>';document.querySelectorAll('[data-mode]').forEach(function(b){b.onclick=function(){localMode=b.dataset.mode;if(connected)send({t:'mode',mode:localMode});render()}});bindChatControls();return}
 $('#teams').innerHTML='<div class="teamline"><b>Ваш состав:</b> '+sideName(ROLE)+'</div><div class="teamline"><b>Соперник:</b> '+visibleTeamName(op)+'</div>';
 if(S.phase==='pick'){$('#notice').textContent=connected?(S.p[op].ready?'🔒 Соперник уже подтвердил скрытый состав. Ваш режим: '+modeName(S.mode):'Режим: '+modeName(S.mode)+'. Выберите трёх разных курочек. Состав соперника раскроется только после готовности обеих сторон.'):'Ждём соединения со вторым игроком…';$('#main').innerHTML='<div class="pregamegrid"><div>'+slotPicker()+'</div>'+chatPanel()+'</div>';document.querySelectorAll('[data-slot]').forEach(function(b){b.onclick=function(){activeSlot=+b.dataset.slot;render()}});document.querySelectorAll('[data-chick]').forEach(function(b){b.onclick=function(){localSlots[activeSlot]=b.dataset.chick;send({t:'slots',slots:localSlots.slice()});activeSlot=Math.min(2,activeSlot+1);render()}});if($('#ready'))$('#ready').onclick=function(){if(connected)send({t:'ready'})};bindChatControls();return}
 if(S.round!==lastRound){lastRound=S.round;localMoves={};localTargets={};hintText=''}
 var mine=S.f[ROLE]||[],theirs=S.f[op]||[];$('#notice').textContent=S.phase==='done'?'Бой завершён':S.p[op].moved&&!S.p[ROLE].moved?'⚡ Соперник уже выбрал ходы всей команды. Ваша очередь.':S.p[ROLE].moved?'✓ Ходы вашей команды зафиксированы. Ждём соперника…':'Режим: '+modeName(S.mode)+'. Выберите действие для каждой живой курочки'+(S.mode==='target'?' и цель для каждого атакующего действия.':'.');
 var scoutUsed=S.p[ROLE]&&S.p[ROLE].scoutUsed,canScout=S.phase==='fight'&&!scoutUsed&&!S.p[ROLE].moved&&S.p[op].moved;
 $('#main').innerHTML='<div class="gamegrid"><div class="battlecolumn"><section class="teamzone '+teamRoundClass(ROLE)+'"><h2>Ваша команда</h2><div class="battlefield">'+mine.map(function(c){return fighterCard(c,ROLE)}).join('')+'</div></section><section class="teamzone '+teamRoundClass(op)+'"><h2>Команда соперника</h2>'+opponentBubble()+'<div class="battlefield">'+theirs.map(function(c){return fighterCard(c,op)}).join('')+'</div></section><div class="battletools"><button id="hintBtn">💡 Подсказка</button><button id="scoutBtn" '+(canScout?'':'disabled')+'>🔭 '+(scoutUsed?'Разведка использована':S.p[op].moved?'Разведка':'Разведка — ждём ход соперника')+'</button></div>'+scoutPanel()+(hintText?'<div class="hintresult">'+hintText+'</div>':'')+(S.phase==='fight'?'<button id="submit" class="primary submit">Зафиксировать ходы команды</button>':'')+roundResult()+(S.phase==='done'?'<div class="finish">'+(S.winner===3?'🤝 Двойной нокаут':S.winner===ROLE?'🏆 Ваша команда выиграла бой!':'🏆 Команда соперника выиграла бой.')+'</div>':'')+battleHistory()+'</div>'+chatPanel()+'</div>';
 bindChatControls();if($('#copyEpic'))$('#copyEpic').onclick=function(){var t=epicPlainText();navigator.clipboard&&navigator.clipboard.writeText(t).then(function(){var b=$('#copyEpic');if(b)b.textContent='✓ Скопировано'}).catch(function(){})};if($('#shareEpic'))$('#shareEpic').onclick=function(){var t=epicPlainText();if(navigator.share)navigator.share({title:'QuRa Arena — летопись боя',text:t}).catch(function(){});else if(navigator.clipboard)navigator.clipboard.writeText(t)};var cm=$('#chatMessages');if(cm)cm.scrollTop=cm.scrollHeight;if($('#hintBtn'))$('#hintBtn').onclick=function(){hintText=tacticalHint();render()};if($('#scoutBtn'))$('#scoutBtn').onclick=function(){if(canScout)send({t:'scout'})};document.querySelectorAll('[data-move]').forEach(function(b){b.onclick=function(){var pos=+b.dataset.pos,m=b.dataset.move;localMoves[pos]=m;if(m==='defend')delete localTargets[pos];render()}});
 document.querySelectorAll('[data-target]').forEach(function(b){b.onclick=function(){localTargets[+b.dataset.targetPos]=+b.dataset.target;render()}});
 var live=mine.filter(function(c){return !c.dead});if($('#submit')){var ok=live.every(function(c){var m=localMoves[c.pos];return !!m&&(S.mode!=='target'||m==='defend'||localTargets[c.pos]!==undefined)})&&!S.p[ROLE].moved;$('#submit').disabled=!ok;$('#submit').onclick=function(){var payload={};live.forEach(function(c){payload[c.pos]={move:localMoves[c.pos],target:localTargets[c.pos]===undefined?null:localTargets[c.pos]}});send({t:'moves',moves:payload})}}
}
net();render();