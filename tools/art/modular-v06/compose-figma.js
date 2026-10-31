await figma.setCurrentPageAsync(await figma.getNodeByIdAsync('156:1552'));
await figma.loadFontAsync({family:'Inter',style:'Regular'});
const page=figma.currentPage,created=[],mutated=[],nodes={},heads={},rigs={},boards={};
const tr=n=>{created.push(n.id);return n;};
for(const [key,value]of Object.entries(MASTERS))nodes[key]=await figma.getNodeByIdAsync(value.component);
function frame(name){const n=tr(figma.createComponent());page.appendChild(n);n.name=name;n.resize(600,760);n.fills=[];n.clipsContent=false;return n;}
function inst(key,parent,name){if(!nodes[key])throw Error('Missing '+key);const i=tr(nodes[key].createInstance());parent.appendChild(i);i.x=0;i.y=0;i.name=name||key;return i;}
function text(p,s,size=20){const n=tr(figma.createText());p.appendChild(n);n.fontName={family:'Inter',style:'Regular'};n.fontSize=size;n.characters=s;n.fills=[{type:'SOLID',color:{r:.1,g:.12,b:.14}}];return n;}
function al(p,name,dir='VERTICAL'){const n=tr(figma.createAutoLayout(dir));p.appendChild(n);n.name=name;n.itemSpacing=24;n.fills=[];return n;}
function board(name,title,x,y){const n=al(page,name);n.x=x;n.y=y;n.paddingTop=32;n.paddingLeft=32;n.paddingRight=32;n.paddingBottom=32;n.fills=[{type:'SOLID',color:{r:.91,g:.90,b:.88}}];text(n,title,28);return n;}
function cell(parent,title){const c=al(parent,title);text(c,title,17);return c;}
for(const [cid,f]of Object.entries(FITS)){
 heads[cid]={};
 for(const kind of ['bare','native']){
  const c=frame('QuRa/v06/'+cid+'/Head/'+kind);c.x=15500+(kind==='bare'?0:640);c.y=(Number(cid.slice(1))-1)*800;
  if(kind==='native')inst(cid+'/wear/'+f.head[0]+'_back.png',c,'HEADWEAR_BACK');
  const h=inst(cid+(kind==='bare'?'/parts/head.png':'/head_native_base.png'),c,'EXPRESSION');
  const prop=c.addComponentProperty('Эмоция','INSTANCE_SWAP',nodes[cid+(kind==='bare'?'/parts/head.png':'/head_native_base.png')].id);h.componentPropertyReferences={mainComponent:prop};
  if(kind==='native')inst(cid+'/wear/'+f.head[0]+'.png',c,'HEADWEAR_FRONT');
  c.description='v06 '+kind+' head module. Headwear back → registered expression → headwear front. Use Expression swap for four emotions.';heads[cid][kind]={id:c.id,prop};
 }
 rigs[cid]={};
 for(const pose of ['CARD','PERCH','NEST']){
  const c=frame('QuRa/v06/'+cid+'/'+pose);c.x=17100+['CARD','PERCH','NEST'].indexOf(pose)*640;c.y=(Number(cid.slice(1))-1)*800;
  if(pose==='NEST')inst('props/nest_back.png',c,'NEST_BACK');
  if(pose==='PERCH'){inst('props/perch.png',c,'PERCH');inst(cid+'/feet_perch.png',c,'FEET_PERCH');}
  if(pose==='CARD'){const i=inst(cid+'/wear/'+f.feet+'.png',c,'FEET');const pr=c.addComponentProperty('Лапы / обувь','INSTANCE_SWAP',nodes[cid+'/wear/'+f.feet+'.png'].id);i.componentPropertyReferences={mainComponent:pr};}
  inst(cid+'/parts/body.png',c,'BODY');
  for(const [slot,key]of [['Одежда',f.body[0]],['Сумка',pose==='CARD'?f.bag[0]:null],['На шее',f.neck?f.neck[0]:null]])if(key){const i=inst(cid+'/wear/'+key+'.png',c,slot);const pr=c.addComponentProperty(slot,'BOOLEAN',true);i.componentPropertyReferences={visible:pr};}
  inst(cid+'/parts/farWing.png',c,'FAR_WING');inst(cid+'/parts/nearWing.png',c,'NEAR_WING');
  const hm=await figma.getNodeByIdAsync(heads[cid].native.id);const hi=tr(hm.createInstance());c.appendChild(hi);hi.x=0;hi.y=0;hi.name='HEAD_MODULE';const hp=c.addComponentProperty('Голова / убор','INSTANCE_SWAP',hm.id);hi.componentPropertyReferences={mainComponent:hp};
  const face=inst(cid+'/wear/'+f.face+'.png',c,'FACE');const fp=c.addComponentProperty('Очки / третий глаз','BOOLEAN',true);face.componentPropertyReferences={visible:fp};
  if(pose==='NEST')inst('props/nest_front_eggs.png',c,'NEST_FRONT');
  c.description='v06 static modular pose. Native equipment registered to this character. Sitting poses omit bags and shoes.';c.exportSettings=[{format:'PNG',constraint:{type:'SCALE',value:2},suffix:''}];rigs[cid][pose]=c.id;
 }
}
const b=board('v06_18_POSES','v06 · 6 персонажей × 3 позы · проверка посадки',300,300);boards.poses=b.id;
text(b,'Головные уборы: зад / голова / перед. Очки: две точки глаз. Сумки и обувь — только стоя.',18);
for(const [cid,f]of Object.entries(FITS)){const row=al(b,cid,'HORIZONTAL');for(const pose of ['CARD','PERCH','NEST']){const c=cell(row,NAMES[cid]+' · '+pose);const m=await figma.getNodeByIdAsync(rigs[cid][pose]);const i=tr(m.createInstance());c.appendChild(i);i.rescale(.72);}}
const eb=board('v06_30_HEAD_STATES','v06 · крупная проверка голов и эмоций',2400,300);boards.emotions=eb.id;
for(const [cid,f]of Object.entries(FITS)){const row=al(eb,cid,'HORIZONTAL');for(const [ei,e]of ['base','joy','surprise','determination','sadness'].entries()){
 const c=cell(row,NAMES[cid]+' · '+['База','Радость','Удивление','Решимость','Грусть'][ei]);const v=tr(figma.createFrame());c.appendChild(v);v.name=cid+'_'+e+'_HEAD_VIEW';v.resize(400,330);v.fills=[];v.clipsContent=true;
 const hm=await figma.getNodeByIdAsync(heads[cid].native.id),hi=tr(hm.createInstance());v.appendChild(hi);hi.x=-140;hi.y=0;
 if(e!=='base'){const suffix=['C01','C03','C05','C06'].includes(cid)?'hat':'bare';hi.setProperties({[heads[cid].native.prop]:nodes[cid+'/emotions/'+e+'_'+suffix+'.png'].id});}
 const face=inst(cid+'/wear/'+f.face+'.png',v,'FACE');face.x=-140;face.y=0;
}}
const ib=board('v06_SINGLE_ITEM_FITS','v06 · каждый аксессуар отдельно на базовой курочке',300,6200);boards.individual=ib.id;
text(ib,'Слева — база; далее отдельные предметы; справа — комплект. Ретушь под убором входит в модуль головы.',18);
for(const [cid,f]of Object.entries(FITS)){
 const row=al(ib,cid,'HORIZONTAL');const options=[['База',null],['Убор','head'],['Очки','face'],['Одежда','body'],...(f.neck?[['На шее','neck']]:[]),['Сумка','bag'],['Лапы','feet'],['Комплект','all']];
 for(const [title,slot]of options){const c=cell(row,NAMES[cid]+' · '+title);const r=tr(figma.createFrame());c.appendChild(r);r.resize(600,760);r.fills=[];r.clipsContent=false;
 const foot=inst(cid+(slot==='feet'||slot==='all'?'/wear/'+f.feet+'.png':'/parts/feet.png'),r,'FEET');inst(cid+'/parts/body.png',r,'BODY');
 for(const [role,key]of [['body',f.body[0]],['bag',f.bag[0]],['neck',f.neck?f.neck[0]:null]])if(key&&(slot===role||slot==='all'))inst(cid+'/wear/'+key+'.png',r,role);
 inst(cid+'/parts/farWing.png',r,'FAR_WING');inst(cid+'/parts/nearWing.png',r,'NEAR_WING');
 const hm=await figma.getNodeByIdAsync(heads[cid][slot==='head'||slot==='all'?'native':'bare'].id),hi=tr(hm.createInstance());r.appendChild(hi);hi.x=0;hi.y=0;
 if(slot==='face'||slot==='all')inst(cid+'/wear/'+f.face+'.png',r,'FACE');r.rescale(.48);
 }
}
return {createdNodeIds:created,mutatedNodeIds:mutated,heads,rigs,boards};
