// Inputs: ASSETS uploaded sprites, STATE, NATIVE. Existing master IDs are retained.
await figma.setCurrentPageAsync(await figma.getNodeByIdAsync('108:2'));
await figma.loadFontAsync({family:'Inter',style:'Regular'});
const page=figma.currentPage,created=[],mutated=[],deleted=[],emotions={},headProps={},exportSlots=[];
function tr(n){created.push(n.id);return n;}
function pixel(p,hash,w,h){const r=tr(figma.createRectangle());p.appendChild(r);r.name='RGBA_MASTER';r.resize(w,h);r.x=0;r.y=0;r.fills=[{type:'IMAGE',imageHash:hash,scaleMode:'FILL'}];r.constraints={horizontal:'SCALE',vertical:'SCALE'};return r;}
function component(name,w=600,h=680){const c=tr(figma.createComponent());page.appendChild(c);c.name=name;c.resize(w,h);c.fills=[];c.clipsContent=true;return c;}
function auto(p,name,dir='VERTICAL'){const n=tr(figma.createAutoLayout(dir,{name,itemSpacing:28}));p.appendChild(n);n.fills=[];return n;}
function label(p,s,size=18){const n=tr(figma.createText());p.appendChild(n);n.fontName={family:'Inter',style:'Regular'};n.fontSize=size;n.characters=s;n.fills=[{type:'SOLID',color:{r:.1,g:.12,b:.15}}];return n;}
for(const a of ASSETS){
 if(!a.success)throw Error('Asset upload failed: '+a.name);
 let target=null;
 if(a.kind==='part')target=STATE.layers[a.character][a.key];
 if(a.kind==='feet_native')target=NATIVE.feet[a.character].native;
 if(a.kind==='feet_perch')target=NATIVE.feet[a.character].perch;
 if(a.kind==='wear_garment')target=NATIVE.wear[a.character].garment;
 if(a.kind==='wear_face')target=NATIVE.wear[a.character].face;
 if(a.kind==='wear_bag')target=NATIVE.wear[a.character].bag;
 if(a.kind==='head_native_base')target=NATIVE.heads[a.character].clipped;
 if(target){const m=await figma.getNodeByIdAsync(target);for(const ch of m.children){deleted.push(ch.id);ch.remove();}if(['part','feet_native','feet_perch','head_native_base'].includes(a.kind))m.resizeWithoutConstraints(600,680);pixel(m,a.imageHash,m.width,m.height);m.exportSettings=[{format:'PNG',suffix:'@2x',constraint:{type:'SCALE',value:2}}];mutated.push(m.id);}
 if(a.kind==='emotion'){
  const m=component('QuRa/v05/'+a.character+'/Emotion/'+a.emotion+'/'+a.headType);m.x=16000+['joy','surprise','determination','sadness'].indexOf(a.emotion)*650;m.y=3500+(Number(a.character.slice(1))-1)*1550+(a.headType==='hat'?750:0);pixel(m,a.imageHash,600,680);m.description='Approved expression sheet registered to the shared head. Hair silhouette is kept from the approved base. Fixed face landmarks; choose this component in the head Expression slot.';m.exportSettings=[{format:'PNG',suffix:'@2x',constraint:{type:'SCALE',value:2}}];emotions[a.character]??={};emotions[a.character][a.emotion]??={};emotions[a.character][a.emotion][a.headType]=m.id;
 }
}
// Source imports were temporary placements. Masters now retain every imageHash.
for(const a of ASSETS){if(a.placedOnNodeId){const n=await figma.getNodeByIdAsync(a.placedOnNodeId);if(n){deleted.push(n.id);n.remove();}}}
const names={C01:'Ряба',C02:'Боевик',C03:'Дурочка',C04:'Профессор',C05:'Монах',C06:'Гламурочка'};
const board=auto(page,'v05_EMOTIONS_REGISTERED');board.x=13000;board.y=3800;board.paddingTop=40;board.paddingBottom=40;board.paddingLeft=40;board.paddingRight=40;board.fills=[{type:'SOLID',color:{r:.96,g:.97,b:.98}}];label(board,'24 эмоции · одна посадка головы и аксессуаров',30);label(board,'Утверждённые листы: меняются черты лица; причёска, очки и головной убор сохраняют положение.',17);
const previews=[];
for(const cid of Object.keys(names)){
 const row=auto(board,cid,'HORIZONTAL');row.itemSpacing=40;
 const native=await figma.getNodeByIdAsync(NATIVE.heads[cid].native),bare=await figma.getNodeByIdAsync(NATIVE.heads[cid].bare);
 headProps[cid]={native:Object.keys(native.componentPropertyDefinitions).find(k=>k.startsWith('Выражение')),bare:Object.keys(bare.componentPropertyDefinitions).find(k=>k.startsWith('Выражение'))};
 for(const [ei,e]of ['base','joy','surprise','determination','sadness'].entries()){
  const cell=auto(row,cid+'_'+e);label(cell,names[cid]+' · '+['База','Радость','Удивление','Решимость','Грусть'][ei]);
  const v=tr(figma.createFrame());cell.appendChild(v);v.name='HEAD_VIEWPORT';v.resize(400,390);v.fills=[];v.clipsContent=true;
  const hi=tr(native.createInstance());v.appendChild(hi);hi.name='HEAD_MODULE';hi.x=-160;hi.y=50;
  if(e!=='base')hi.setProperties({[headProps[cid].native]:emotions[cid][e].hat||emotions[cid][e].bare});
  const rig=await figma.getNodeByIdAsync(NATIVE.poses[cid].CARD.id),face=rig.findOne(n=>n.name==='FACE_ITEM');const f=tr(face.clone());v.appendChild(f);f.componentPropertyReferences={};f.x-=160;f.y+=50;f.visible=true;
  previews.push({character:cid,emotion:e,id:v.id,head:hi.id});
 }
}
// Every native item has a transparent full-canvas export with an identical origin.
const slotKeys={head:['hat','bandana','scarf','pencil'],face:['glasses','aviators','third_eye'],body:['vest','coat','robe'],neck:['beads','cartridges','diamonds','magnifier'],bag:['bag','water_toy','shopper_flute','satchel','cloth_bag','bag_h'],feet:['boots','crocs','sandals','ring07','anklets']};
let row=0;
for(const cid of Object.keys(names)){
 const card=await figma.getNodeByIdAsync(NATIVE.poses[cid].CARD.id),assembly=card.children.find(n=>n.name==='POSE_ASSEMBLY');let col=0;
 for(const item of STATE.nativeMasters.filter(x=>x.character===cid)){
  const role=Object.keys(slotKeys).find(k=>slotKeys[k].includes(item.key));let source;
  if(role==='head'){const h=await figma.getNodeByIdAsync(NATIVE.heads[cid].native);source=h.children.find(n=>n.name==='HEADWEAR');}
  else source=assembly.children.find(n=>n.name===({face:'FACE_ITEM',body:'GARMENT',neck:'NECK_ITEM',bag:'BAG_AND_STRAP',feet:'FEET'})[role]);
  if(!source)throw Error('Missing slot '+cid+'/'+item.key);
  const m=component('QuRa/v05/Export/'+cid+'/'+item.key,600,760);m.x=11000+col*650;m.y=8500+row*820;m.description='Registered transparent gear layer. Virtual canvas 600x760; body origin (0,40). Foreground wings occlude this item in assembly. Seated poses hide bags and feet items.';
  const copy=tr(source.clone());m.appendChild(copy);copy.componentPropertyReferences={};copy.visible=true;copy.x=source.x;copy.y=source.y+40;m.exportSettings=[{format:'PNG',suffix:'@2x',constraint:{type:'SCALE',value:2}}];exportSlots.push({character:cid,key:item.key,role,id:m.id});col++;
 }
 row++;
}
return {createdNodeIds:created,mutatedNodeIds:mutated,deletedNodeIds:deleted,emotions,headProps,board:board.id,previews,exportSlots};
