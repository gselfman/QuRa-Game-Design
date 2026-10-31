// Inputs: CONFIG character list, STATE component ledger, FITS registrations, PERCH raster cuts.
// Run once. All masters are shared; only registration and occlusion differ by character.
await figma.setCurrentPageAsync(await figma.getNodeByIdAsync('108:2'));
await figma.loadFontAsync({family:'Inter',style:'Regular'});
const page=figma.currentPage,created=[],masters={},wear={},heads={},feet={},poses={},previewIds=[];
function tr(n){created.push(n.id);return n;}
function comp(name,w=600,h=680){const n=tr(figma.createComponent());page.appendChild(n);n.name=name;n.resize(w,h);n.fills=[];n.clipsContent=true;return n;}
function frame(p,name,w=600,h=680){const n=tr(figma.createFrame());p.appendChild(n);n.name=name;n.resize(w,h);n.fills=[];n.clipsContent=true;return n;}
function inst(p,m,name,rect){const n=tr(m.createInstance());p.appendChild(n);n.name=name;n.x=0;n.y=0;if(rect){n.resize(rect[2],rect[3]);n.x=rect[0];n.y=rect[1];}return n;}
function path(p,d,name,mask=false,fill={type:'SOLID',color:{r:1,g:1,b:1}}){const n=tr(figma.createVector());p.appendChild(n);n.name=name;n.vectorPaths=[{windingRule:'EVENODD',data:d}];n.fills=fill?[fill]:[];n.isMask=mask;return n;}
function rectPath(w,h){return `M0 0 L${w} 0 L${w} ${h} L0 ${h} Z`;}
function polygon(points,w,h){return points.map((p,i)=>(i?'L':'M')+(p[0]*w)+' '+(p[1]*h)).join(' ')+' Z';}
function pixel(p,hash,w,h,x=0,y=0){const n=tr(figma.createRectangle());p.appendChild(n);n.name='source_pixels';n.resize(w,h);n.x=x;n.y=y;n.fills=[{type:'IMAGE',imageHash:hash,scaleMode:'FILL'}];n.constraints={horizontal:'SCALE',vertical:'SCALE'};return n;}
function scaleChildren(n){for(const ch of n.children){if('constraints'in ch)ch.constraints={horizontal:'SCALE',vertical:'SCALE'};}}
function ellipsePath(cx,cy,rx,ry){const k=.55228475;return `M${cx-rx} ${cy} C${cx-rx} ${cy-ry*k} ${cx-rx*k} ${cy-ry} ${cx} ${cy-ry} C${cx+rx*k} ${cy-ry} ${cx+rx} ${cy-ry*k} ${cx+rx} ${cy} C${cx+rx} ${cy+ry*k} ${cx+rx*k} ${cy+ry} ${cx} ${cy+ry} C${cx-rx*k} ${cy+ry} ${cx-rx} ${cy+ry*k} ${cx-rx} ${cy} Z`;}
for(const item of STATE.nativeMasters)masters[item.character+'_'+item.key]=await figma.getNodeByIdAsync(item.id);
let mx=100,my=12700;
function park(n){n.x=mx;n.y=my;mx+=650;if(mx>4100){mx=100;my+=750;}return n;}
// Once-only item corrections: remove the inside back wall of clothes.
for(const c of CONFIG){const f=FITS[c.id],src=masters[c.id+'_'+f.body];let garment=src;if(f.bodyHole){garment=park(comp('QuRa/v05/Wear/'+c.id+'/'+f.body,src.width,src.height));path(garment,rectPath(src.width,src.height)+' '+polygon(f.bodyHole,src.width,src.height),'OPEN_NECKLINE',true);inst(garment,src,'MASTER_PIXELS');scaleChildren(garment);}wear[c.id]={garment:garment.id};}
// Lens interiors are transparent; back temple arms must not cross the eyes.
for(const c of CONFIG){const f=FITS[c.id].face,src=masters[c.id+'_'+f.key];if(f.key==='aviators'||f.key==='third_eye'){wear[c.id].face=src.id;continue;}
 const w=src.width,h=src.height;let d;
 if(c.id==='C01')d=ellipsePath(.528*w,.49*h,.119*w,.405*h)+' '+ellipsePath(.836*w,.49*h,.095*w,.398*h);
 if(c.id==='C04')d=ellipsePath(.44*w,.47*h,.165*w,.40*h)+' '+ellipsePath(.82*w,.57*h,.14*w,.33*h);
 if(c.id==='C03')d=polygon([[.345,.19],[.445,.14],[.61,.36],[.60,.59],[.54,.87],[.44,.88],[.36,.62]],w,h)+' '+polygon([[.744,.39],[.91,.23],[.90,.62],[.85,.86],[.78,.83]],w,h);
 if(c.id==='C06')d=polygon([[.19,.29],[.28,.29],[.43,.43],[.45,.64],[.40,.86],[.29,.84],[.22,.64]],w,h)+' '+polygon([[.63,.43],[.77,.24],[.89,.23],[.85,.67],[.78,.86],[.65,.82],[.60,.66]],w,h);
 const m=park(comp('QuRa/v05/Wear/'+c.id+'/glasses',w,h));if(c.id==='C03'||c.id==='C06')path(m,d,'TRANSPARENT_LENSES',false,{type:'SOLID',color:c.id==='C03'?{r:.95,g:.24,b:.48}:{r:.72,g:.47,b:.13},opacity:.18});const outer=frame(m,'FRAME_ONLY',w,h);path(outer,rectPath(w,h)+' '+d,'REMOVE_BACK_ARMS',true);inst(outer,src,'MASTER_PIXELS');scaleChildren(outer);scaleChildren(m);wear[c.id].face=m.id;
}
// Shared nest: same image, separate back/front masks. Eggs belong to the front layer.
const nestHash=STATE.nestHash,nestW=1536,nestH=1024;
const outerNest='M60 540 Q60 330 325 230 Q750 70 1160 235 Q1410 285 1480 560 L1460 730 Q1350 910 850 958 Q350 970 110 780 Z';
const frontNest='M60 600 Q250 640 430 597 Q423 510 480 489 Q545 477 580 566 Q620 536 671 552 Q710 569 719 607 Q755 539 804 555 Q837 568 850 629 Q878 554 933 572 Q977 581 991 621 Q973 547 1015 522 Q1088 480 1113 550 L1140 644 Q1330 590 1480 611 L1480 1024 L0 1024 Z';
function scaledPath(parent,d,name){const n=path(parent,d,name,true),x=n.x,y=n.y;n.rescale(600/1536);n.x=x*600/1536;n.y=y*600/1536;return n;}
const nestBack=park(comp('QuRa/v05/Props/NestBack',600,400));scaledPath(nestBack,outerNest,'STRAW_CONTOUR');pixel(nestBack,nestHash,600,400);scaleChildren(nestBack);
const nestFront=park(comp('QuRa/v05/Props/NestFrontEggs',600,400));const frontGroup=frame(nestFront,'FRONT',600,400);scaledPath(frontGroup,frontNest,'FRONT_MASK');const nestInner=frame(frontGroup,'NEST',600,400);scaledPath(nestInner,outerNest,'STRAW_CONTOUR');pixel(nestInner,nestHash,600,400);scaleChildren(nestInner);scaleChildren(frontGroup);scaleChildren(nestFront);
// Simple shared perch rail; toes are placed over it.
const rail=park(comp('QuRa/v05/Props/Perch',600,80));const beam=tr(figma.createRectangle());rail.appendChild(beam);beam.name='WOOD';beam.resize(560,38);beam.x=20;beam.y=20;beam.cornerRadius=19;beam.fills=[{type:'GRADIENT_LINEAR',gradientTransform:[[0,1,0],[1,0,0]],gradientStops:[{position:0,color:{r:.72,g:.43,b:.19,a:1}},{position:.35,color:{r:.49,g:.24,b:.08,a:1}},{position:1,color:{r:.27,g:.11,b:.04,a:1}}]}];for(let j=0;j<4;j++){const grain=path(rail,`M${45+j*20} ${29+j*5} Q250 ${23+j*4} ${530-j*35} ${31+j*4}`,'GRAIN_'+j,false,null);grain.strokes=[{type:'SOLID',color:{r:.31,g:.14,b:.05},opacity:.5}];grain.strokeWeight=1.5;}scaleChildren(rail);
for(let ci=0;ci<CONFIG.length;ci++){
 const c=CONFIG[ci],f=FITS[c.id],parts={};for(const[k,id]of Object.entries(STATE.layers[c.id]))parts[k]=await figma.getNodeByIdAsync(id);
 // Registered head modules keep the expression slot independent of the hat.
 const bareHead=park(comp('QuRa/v05/'+c.id+'/Head/Bare')),nativeHead=park(comp('QuRa/v05/'+c.id+'/Head/Native'));
 for(const [head,isDressed]of [[bareHead,false],[nativeHead,true]]){const canvas=frame(head,'HEAD_CANVAS');if(isDressed&&f.head.comb)path(canvas,rectPath(600,680)+' '+f.head.comb,'COMB_OCCLUSION',true);const hi=inst(canvas,parts.head,'EXPRESSION');const ep=head.addComponentProperty('Выражение','INSTANCE_SWAP',parts.head.id);hi.componentPropertyReferences={mainComponent:ep};if(isDressed)inst(head,masters[c.id+'_'+f.head.key],'HEADWEAR',f.head.rect);scaleChildren(head);}
 bareHead.clipsContent=false;nativeHead.clipsContent=false;heads[c.id]={bare:bareHead.id,native:nativeHead.id};
 // Foot replacement and decoration are distinct modules.
 const nativeFeet=park(comp('QuRa/v05/'+c.id+'/Feet/Native')),ft=f.feet,shoe=masters[c.id+'_'+ft.key];
 if(ft.mode==='ring'||ft.mode==='anklets'||ft.mode==='sandals')inst(nativeFeet,parts.feet,'BARE_FEET');
 if(ft.mode==='upperleg'){const legs=frame(nativeFeet,'UPPER_LEGS');path(legs,rectPath(600,ft.legBottom),'LEG_MASK',true);inst(legs,parts.feet,'BARE_LEGS');}
 if(ft.mode==='sandals'){const sole=inst(nativeFeet,shoe,'WOOD_SANDALS',ft.rect);nativeFeet.insertChild(0,sole);const straps=frame(nativeFeet,'SANDAL_STRAPS');path(straps,`M220 579 L530 579 L530 610 L220 610 Z`,'STRAP_COVERAGE',true);inst(straps,shoe,'STRAPS',ft.rect);}
 else if(ft.mode==='anklets'){for(let j=0;j<2;j++){const r=ft.rects[j],crop=frame(nativeFeet,'ANKLET_'+j,r[2],r[3]);crop.x=r[0];crop.y=r[1];const z=inst(crop,shoe,'BRACELET_HALF');z.resize(r[2]*2,r[3]);z.x=-j*r[2];}}
 else inst(nativeFeet,shoe,'FOOT_ITEM',ft.rect);
 scaleChildren(nativeFeet);feet[c.id]={bare:parts.feet.id,native:nativeFeet.id};
 const p=PERCH[c.id],b=p.box,perchFeet=park(comp('QuRa/v05/'+c.id+'/Feet/Perch',600,680));const crop=frame(perchFeet,'GRIPPING_FEET',b[2],b[3]);pixel(crop,p.hash,p.sourceSize[0],p.sourceSize[1],-b[0],-b[1]);scaleChildren(crop);const fw=c.bodyType==='slim'?195:230;crop.resize(fw,fw*b[3]/b[2]);crop.x=c.id==='C04'?260:c.id==='C06'?300:285;crop.y=488;scaleChildren(perchFeet);feet[c.id].perch=perchFeet.id;
 const garment=await figma.getNodeByIdAsync(wear[c.id].garment),face=await figma.getNodeByIdAsync(wear[c.id].face);
 // Bag body uses the same shop artwork, with one reusable cross-body strap.
 const bagMaster=masters[c.id+'_'+f.bag.key],bagBody=park(comp('QuRa/v05/Wear/'+c.id+'/BagBody',bagMaster.width*f.bag.crop[2],bagMaster.height*f.bag.crop[3]));const bi=inst(bagBody,bagMaster,'MASTER_PIXELS');bi.x=-bagMaster.width*f.bag.crop[0];bi.y=-bagMaster.height*f.bag.crop[1];scaleChildren(bagBody);wear[c.id].bag=bagBody.id;
 poses[c.id]={};
 for(let pi=0;pi<3;pi++){
  const pose=['CARD','PERCH','NEST'][pi],rig=comp('QuRa/v05/'+c.id+'/Native/'+pose);rig.x=5000+pi*700;rig.y=3500+ci*800;rig.description='Registered native outfit. Same head angle and gear masters in all three poses. Bags and foot items are absent in seated poses. Static assembly; hidden surfaces are not restored for articulated animation.';
  rig.exportSettings=[{format:'PNG',suffix:'@2x',constraint:{type:'SCALE',value:2}}];
  if(pose==='NEST')inst(rig,nestBack,'NEST_BACK',[0,280,600,400]);
  if(pose==='PERCH')inst(rig,rail,'PERCH_RAIL',[0,489,600,80]);
  if(pose==='PERCH')inst(rig,perchFeet,'GRIPPING_FEET');
  inst(rig,parts.body,'BODY');
  if(pose==='CARD'){const fi=inst(rig,nativeFeet,'FEET');const fp=rig.addComponentProperty('Лапы / обувь','INSTANCE_SWAP',nativeFeet.id);fi.componentPropertyReferences={mainComponent:fp};}
  const vi=inst(rig,garment,'GARMENT',c.garment),vp=rig.addComponentProperty('Одежда','BOOLEAN',true);vi.componentPropertyReferences={visible:vp};
  if(pose==='CARD'){const bg=frame(rig,'BAG_AND_STRAP');const r=f.bag.rect,sc=c.shoulder;const strap=path(bg,`M${sc[0]} ${sc[1]} Q${sc[0]+66} ${sc[1]+32} ${r[0]+r[2]*.5} ${r[1]+8}`,'SHOULDER_STRAP',false,null);strap.strokes=[{type:'SOLID',color:{r:f.bag.color[0],g:f.bag.color[1],b:f.bag.color[2]}}];strap.strokeWeight=c.id==='C02'?5:7;strap.strokeCap='ROUND';inst(bg,bagBody,'BAG_BODY',r);const bp=rig.addComponentProperty('Сумка','BOOLEAN',true);bg.componentPropertyReferences={visible:bp};}
  if(f.neck){const ni=inst(rig,masters[c.id+'_'+f.neck.key],'NECK_ITEM',f.neck.rect),np=rig.addComponentProperty('На шее','BOOLEAN',true);ni.componentPropertyReferences={visible:np};}
  inst(rig,parts.farWing,'FAR_WING');inst(rig,parts.nearWing,'NEAR_WING');
  const hi=inst(rig,nativeHead,'HEAD_MODULE'),hp=rig.addComponentProperty('Голова / убор','INSTANCE_SWAP',nativeHead.id);hi.componentPropertyReferences={mainComponent:hp};
  let fi;
  if(f.face.key==='aviators'){fi=inst(rig,face,'FACE_ITEM');fi.rescale(c.glassesScale);fi.x=c.eyeBridge[0]-635*c.glassesScale;fi.y=c.eyeBridge[1]-155*c.glassesScale;}
  else if(f.face.rect)fi=inst(rig,face,'FACE_ITEM',f.face.rect);
  else{fi=inst(rig,face,'FACE_ITEM');fi.rescale(f.face.width/face.width);const px=f.face.anchor[0]*fi.width,py=f.face.anchor[1]*fi.height,a=(c.glassesRotation||0)*Math.PI/180,co=Math.cos(a),si=Math.sin(a);fi.relativeTransform=[[co,-si,c.eyeBridge[0]-co*px+si*py],[si,co,c.eyeBridge[1]-si*px-co*py]];}
  const fp=rig.addComponentProperty('Очки / третий глаз','BOOLEAN',true);fi.componentPropertyReferences={visible:fp};
  if(pose==='NEST')inst(rig,nestFront,'NEST_FRONT_EGGS',[0,280,600,400]);
  const children=rig.children.slice(),assembly=frame(rig,'POSE_ASSEMBLY');assembly.clipsContent=false;for(const child of children)assembly.appendChild(child);assembly.y=40;rig.resize(600,760);
  poses[c.id][pose]={id:rig.id,headProperty:hp,faceProperty:fp};
 }
}
function auto(p,name,dir='VERTICAL'){const n=tr(figma.createAutoLayout(dir,{name,itemSpacing:28}));p.appendChild(n);n.fills=[];return n;}
function label(p,s,size=20){const n=tr(figma.createText());p.appendChild(n);n.fontName={family:'Inter',style:'Regular'};n.fontSize=size;n.characters=s;n.fills=[{type:'SOLID',color:{r:.1,g:.12,b:.15}}];return n;}
const board=auto(page,'v05_NATIVE_18_POSES');board.x=11000;board.y=100;board.paddingTop=40;board.paddingBottom=40;board.paddingLeft=40;board.paddingRight=40;board.fills=[{type:'SOLID',color:{r:.96,g:.97,b:.98}}];label(board,'Родные комплекты · 6 персонажей × 3 позы',30);label(board,'Сборки для проверки. Общие головы и предметы; сумки и обувь только стоя.',17);
for(const c of CONFIG){const row=auto(board,c.id,'HORIZONTAL');row.itemSpacing=60;for(const pose of ['CARD','PERCH','NEST']){const cell=auto(row,c.id+'_'+pose);label(cell,c.name+' · '+pose,18);const n=inst(cell,await figma.getNodeByIdAsync(poses[c.id][pose].id),'PREVIEW');n.rescale(.65);previewIds.push({character:c.id,pose,id:n.id});}}
return {createdNodeIds:created,wear,heads,feet,poses,nest:{back:nestBack.id,front:nestFront.id},rail:rail.id,board:board.id,previewIds};
