// DATA and HASHES are supplied by the local verified atlas registry.
const page=await figma.getNodeByIdAsync('219:2');
await figma.setCurrentPageAsync(page);
if(page.children.some(n=>n.name==='QuRa · 35 аксессуаров · v09')) return {exists:true,boardId:page.children.find(n=>n.name==='QuRa · 35 аксессуаров · v09').id};
await figma.loadFontAsync({family:'Inter',style:'Regular'});
const created=[],mutated=[],components={},rows=[],proofRows=[];
const mark=n=>{created.push(n.id);return n;};
const solid=(r,g,b)=>[{type:'SOLID',color:{r,g,b}}];
function textNode(str,size=20){const t=mark(figma.createText());t.fontName={family:'Inter',style:'Regular'};t.fontSize=size;t.characters=str;t.fills=solid(.12,.13,.15);return t;}
function stack(name,dir,gap){const f=mark(figma.createAutoLayout());f.name=name;f.layoutMode=dir;f.itemSpacing=gap;f.primaryAxisSizingMode='AUTO';f.counterAxisSizingMode='AUTO';f.fills=[];return f;}
function fixed(name,w,h){const f=mark(figma.createFrame());f.name=name;f.resize(w,h);f.fills=[];f.clipsContent=true;return f;}
function tileWindow(parent,atlas,tile){const b=tile.bbox_px,xy=tile.atlas_xy;const f=fixed(tile.file,(b[2]-b[0])/2,(b[3]-b[1])/2);parent.appendChild(f);f.x=b[0]/2;f.y=b[1]/2;const r=mark(figma.createRectangle());f.appendChild(r);r.name='Original pixels';r.resize(atlas.size[0]/2,atlas.size[1]/2);r.x=-xy[0]/2;r.y=-xy[1]/2;r.fills=[{type:'IMAGE',imageHash:HASHES[atlas.character],scaleMode:'FILL'}];return f;}
const board=stack('QuRa · 35 аксессуаров · v09','VERTICAL',28);page.appendChild(board);board.x=400;board.y=400;board.paddingTop=32;board.paddingBottom=32;board.paddingLeft=32;board.paddingRight=32;board.fills=solid(.90,.90,.88);
board.appendChild(textNode('QuRa · 35 отдельных аксессуаров',34));
board.appendChild(textNode('6 персонажей · PNG 1200 × 1520 · общее начало координат',21));
board.appendChild(textNode('Нарезаны видимые части. Скрытые участки одежды требуют отдельной дорисовки.',18));
const proof=stack('QuRa · обратная сборка · v09','VERTICAL',24);page.appendChild(proof);proof.x=2400;proof.y=400;proof.paddingTop=28;proof.paddingBottom=28;proof.paddingLeft=28;proof.paddingRight=28;proof.fills=solid(.90,.90,.88);
proof.appendChild(textNode('Проверка обратной сборки',28));proof.appendChild(textNode('Слева — очищенный исходный лист. Справа — отдельные слои.',16));
for(let ci=0;ci<DATA.length;ci++){
 const a=DATA[ci],parts=a.tiles.filter(t=>t.kind==='part'),c=a.character;
 const section=stack(c+' · '+parts[0].character_name,'VERTICAL',12);board.appendChild(section);section.appendChild(textNode(parts[0].character_name,26));const row=stack(c+' — аксессуары','HORIZONTAL',14);section.appendChild(row);
 const group=stack(c+' — исходник и сборка','VERTICAL',8);proof.appendChild(group);group.appendChild(textNode(parts[0].character_name+' · '+parts.length+' PNG',23));const compare=stack(c+' comparison','HORIZONTAL',24);group.appendChild(compare);
 const src=fixed(c+' · исходный лист',600,760);tileWindow(src,a,a.tiles[0]);compare.appendChild(src);src.rescale(.45);
 const rebuilt=fixed(c+' · обратная сборка',600,760);compare.appendChild(rebuilt);
 const ids=[];
 for(let j=0;j<parts.length;j++){
  const t=parts[j],name='QuRa/v09/'+c+'/'+t.accessory;
  if(page.findOne(n=>n.type==='COMPONENT'&&n.name===name)) throw new Error('Component already exists: '+name);
  // Fixed sprite geometry follows createComponentWithVariants base component recipe.
  const comp=mark(figma.createComponent());comp.name=name;comp.resize(600,760);comp.fills=[];comp.clipsContent=true;page.appendChild(comp);comp.x=3600+j*660;comp.y=400+ci*900;comp.description=t.label+'. Видимая часть выбранного исходника; PNG 1200×1520, начало (0,0). Не обрезать поля. Скрытые поверхности не восстановлены.';comp.exportSettings=[{format:'PNG',constraint:{type:'SCALE',value:2},suffix:''}];tileWindow(comp,a,t);components[t.file]=comp.id;ids.push(comp.id);
  const card=stack(t.label,'VERTICAL',10);row.appendChild(card);const thumb=fixed(t.label+' preview',280,225);card.appendChild(thumb);const ins=mark(comp.createInstance());thumb.appendChild(ins);const b=t.bbox_px,bw=(b[2]-b[0])/2,bh=(b[3]-b[1])/2,s=Math.min(260/bw,215/bh);ins.rescale(s);ins.x=(280-bw*s)/2-b[0]/2*s;ins.y=(225-bh*s)/2-b[1]/2*s;const lab=textNode(t.label,18);card.appendChild(lab);
  const ri=mark(comp.createInstance());rebuilt.appendChild(ri);ri.x=0;ri.y=0;
 }
 rebuilt.rescale(.45);rows.push({character:c,sectionId:section.id,componentIds:ids});proofRows.push({character:c,sourceId:src.id,rebuildId:rebuilt.id});
}
figma.viewport.scrollAndZoomIntoView([board]);
return {pageId:page.id,boardId:board.id,proofId:proof.id,components,rows,proofRows,count:Object.keys(components).length,bounds:{width:board.width,height:board.height},createdNodeIds:created,mutatedNodeIds:mutated};
