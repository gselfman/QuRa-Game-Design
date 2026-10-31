// Figma Plugin API. Configuration is injected as CONFIG before this file.
// Component/variant construction follows figma-generate-library helper pattern.
await figma.setCurrentPageAsync(await figma.getNodeByIdAsync('108:2'));
const page=figma.currentPage, created=[];
function track(n){created.push(n.id);return n;}
function frame(name,w,h,parent=page){const f=track(figma.createFrame());parent.appendChild(f);f.name=name;f.resize(w,h);f.fills=[];f.clipsContent=true;return f;}
function component(name,w,h){const c=track(figma.createComponent());page.appendChild(c);c.name=name;c.resize(w,h);c.fills=[];c.clipsContent=true;return c;}
function pixels(parent,hash,w,h,x=0,y=0){const r=track(figma.createRectangle());parent.appendChild(r);r.name='source_pixels';r.constraints={horizontal:'SCALE',vertical:'SCALE'};r.resize(w,h);r.x=x;r.y=y;r.fills=[{type:'IMAGE',imageHash:hash,scaleMode:'FILL'}];return r;}
function path(parent,data,name,mask=false,fill={type:'SOLID',color:{r:1,g:1,b:1}}){const v=track(figma.createVector());parent.appendChild(v);v.name=name;v.vectorPaths=[{windingRule:'EVENODD',data}];v.fills=[fill];v.isMask=mask;return v;}
function instance(parent,master,name,x=0,y=0,s=1){const i=track(master.createInstance());parent.appendChild(i);i.name=name;i.rescale(s);i.x=x;i.y=y;return i;}
const none=component('QuRa/v05/Gear/None',100,100);none.x=100;none.y=1800;
const av=component('QuRa/v05/Gear/Aviators',1003.2,504);av.x=300;av.y=1800;
const near='M 149 128 C 172 51 241 34 313 34 C 418 32 514 63 554 109 C 588 146 590 189 568 235 C 543 301 492 349 430 385 C 352 430 259 448 196 411 C 151 382 131 339 125 278 C 115 213 124 169 149 128 Z';
const far='M 700 155 C 729 117 777 135 817 150 C 903 177 954 225 954 287 C 961 366 942 427 909 454 C 866 492 821 473 785 450 C 730 411 698 341 687 275 C 676 219 677 183 700 155 Z';
path(av,near+' '+far,'DARK_TRANSLUCENT_LENSES',false,{type:'SOLID',color:{r:.12,g:.15,b:.10},opacity:.55});
const rim=frame('OPAQUE_FRAME',1003.2,504,av);path(rim,'M 0 0 L 1003.2 0 L 1003.2 504 L 0 504 Z '+near+' '+far,'LENS_INTERIOR_EXCLUSION',true);pixels(rim,'7bcb81a2941873885089ef9ee5a5c7a7a0d06aae',1003.2,1003.2,0,-256);
av.description='Classic aviators. Single master for shop and equipment. Anchor: bridge=(635,155). Lenses 55% opacity, frame opaque. Shared shallow 3/4 view.';
const vest=component('QuRa/v05/Gear/CamoVest',1156,1040);vest.x=1500;vest.y=1800;pixels(vest,'602c47ffc9c50d32edd6e0c372f1bf96e69a3c48',1312,1199,-100,-90);vest.description='Complete front panel; no rear wall. Wings render above this item. Fit by regular/slim torso profile.';
const bag=component('QuRa/v05/Gear/BagH',314,214);bag.x=2800;bag.y=1800;pixels(bag,'14f677ac0eff586ec2e5c63860c365497428621e',1024,1536,-110,-443);bag.description='Bag body; shared shoulder strap is assembled from shoulder to bag. Foreground wing controls occlusion.';
const catalog={none:none.id,aviators:av.id,vest:vest.id,bag:bag.id};
const layers={},rigs={};
for(let ci=0;ci<CONFIG.length;ci++){
 const c=CONFIG[ci],h=600*c.sourceSize[1]/c.sourceSize[0];
 const paths={body:'M 0 0 L 600 0 L 600 '+h+' L 0 '+h+' Z '+c.head+' '+c.feet+' '+c.nearWing+' '+c.farWing,head:c.head,feet:c.feet,nearWing:c.nearWing,farWing:c.farWing};
 const parts={};let pi=0;
 for(const [key,d]of Object.entries(paths)){const part=component('QuRa/v05/'+c.id+'/'+key,600,680);part.x=100+pi*650;part.y=3100+ci*750;path(part,d,'PART_MASK',true);pixels(part,c.hash,600,h);parts[key]=part;pi++;}
 layers[c.id]=Object.fromEntries(Object.entries(parts).map(([k,v])=>[k,v.id]));
 const rig=component('QuRa/v05/'+c.id+'/CARD',600,680);rig.x=3500+ci*650;rig.y=1800;rig.description='Static modular character. Change equipment with component booleans. Head, feet and wings are independent. Body profile: '+c.bodyType;
 instance(rig,parts.body,'BODY');instance(rig,parts.feet,'BARE_FEET');
 const wornVest=instance(rig,vest,'VEST',...c.garment.slice(0,2));wornVest.resize(c.garment[2],c.garment[3]);
 const bagGroup=frame('BAG_AND_STRAP',600,680,rig);const bx=c.bag[0],by=c.bag[1],bw=c.bag[2],bh=c.bag[3];
 const strap=track(figma.createVector());bagGroup.appendChild(strap);strap.name='SHOULDER_STRAP';strap.vectorPaths=[{windingRule:'NONZERO',data:`M${c.shoulder[0]} ${c.shoulder[1]} Q${c.shoulder[0]+60} ${c.shoulder[1]+27} ${bx+bw*.55} ${by+5}`}];strap.fills=[];strap.strokes=[{type:'SOLID',color:{r:.72,g:.24,b:.32}}];strap.strokeWeight=7;strap.strokeCap='ROUND';
 const wornBag=instance(bagGroup,bag,'BAG',bx,by);wornBag.resize(bw,bh);
 instance(rig,parts.farWing,'FAR_WING');instance(rig,parts.nearWing,'NEAR_WING');instance(rig,parts.head,'HEAD');
 const wornAv=instance(rig,av,'GLASSES',c.eyeBridge[0]-635*c.glassesScale,c.eyeBridge[1]-155*c.glassesScale,c.glassesScale);
 const props={vest:rig.addComponentProperty('Жилет','BOOLEAN',false),bag:rig.addComponentProperty('Сумка','BOOLEAN',false),glasses:rig.addComponentProperty('Авиаторы','BOOLEAN',false)};
 wornVest.componentPropertyReferences={visible:props.vest};bagGroup.componentPropertyReferences={visible:props.bag};wornAv.componentPropertyReferences={visible:props.glasses};wornVest.visible=false;bagGroup.visible=false;wornAv.visible=false;
 rigs[c.id]={id:rig.id,props};
}
await figma.loadFontAsync({family:'Onest',style:'Regular'});await figma.loadFontAsync({family:'Onest',style:'Bold'});
function label(parent,str,size=24){const t=track(figma.createText());parent.appendChild(t);t.fontName={family:'Onest',style:size>28?'Bold':'Regular'};t.fontSize=size;t.characters=str;t.fills=[{type:'SOLID',color:{r:.12,g:.13,b:.15}}];return t;}
const board=track(figma.createAutoLayout('VERTICAL',{name:'v05_SHARED_MASTERS_PILOT',itemSpacing:32,paddingTop:32,paddingBottom:32,paddingLeft:32,paddingRight:32}));page.appendChild(board);board.x=100;board.y=100;board.fills=[{type:'SOLID',color:{r:.95,g:.94,b:.91}}];label(board,'ОДНИ МАСТЕРА · ДВА ТИПА КОРПУСА',38);label(board,'Исходные лица сохранены. Предметы связаны с общими компонентами. Это техническая примерка совместимости.');
const stateDefs=[['База',{}],['Авиаторы',{glasses:true}],['Жилет',{vest:true}],['Сумка',{bag:true}],['Вместе',{glasses:true,vest:true,bag:true}]],previews=[];
for(const c of CONFIG){const row=track(figma.createAutoLayout('HORIZONTAL',{name:c.name,itemSpacing:28}));board.appendChild(row);row.fills=[];for(const [name,enabled]of stateDefs){const cell=track(figma.createAutoLayout('VERTICAL',{name:c.id+' '+name,itemSpacing:10}));row.appendChild(cell);cell.fills=[];label(cell,c.name+' · '+name,20);const master=await figma.getNodeByIdAsync(rigs[c.id].id);const i=instance(cell,master,name,0,0,.58);i.setProperties(Object.fromEntries(Object.entries(enabled).map(([k,v])=>[rigs[c.id].props[k],v])));previews.push({character:c.id,state:name,id:i.id});}}
return {createdNodeIds:created,pageId:page.id,catalog,layers,rigs,boardId:board.id,previews};
