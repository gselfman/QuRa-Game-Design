await figma.setCurrentPageAsync(await figma.getNodeByIdAsync('108:2'));
const page=figma.currentPage, created=[];
function track(n){created.push(n.id);return n;}
function frame(name,w,h,parent=page){const f=track(figma.createFrame());parent.appendChild(f);f.name=name;f.resize(w,h);f.fills=[];f.clipsContent=true;return f;}
function component(name,w,h){const c=track(figma.createComponent());page.appendChild(c);c.name=name;c.resize(w,h);c.fills=[];c.clipsContent=true;return c;}
function pixels(parent,hash,w,h,x=0,y=0){const r=track(figma.createRectangle());parent.appendChild(r);r.name='source_pixels';r.constraints={horizontal:'SCALE',vertical:'SCALE'};r.resize(w,h);r.x=x;r.y=y;r.fills=[{type:'IMAGE',imageHash:hash,scaleMode:'FILL'}];return r;}
function path(parent,data,name,mask=false,fill={type:'SOLID',color:{r:1,g:1,b:1}}){const v=track(figma.createVector());parent.appendChild(v);v.name=name;v.vectorPaths=[{windingRule:'EVENODD',data}];v.fills=[fill];v.isMask=mask;return v;}
function instance(parent,master,name,x=0,y=0,s=1){const i=track(master.createInstance());parent.appendChild(i);i.name=name;i.rescale(s);i.x=x;i.y=y;return i;}

const av=await figma.getNodeByIdAsync('110:8'),vest=await figma.getNodeByIdAsync('110:13'),bag=await figma.getNodeByIdAsync('110:15');
const layers={},rigs={};
for(let ci=0;ci<CONFIG.length;ci++){
 const c=CONFIG[ci],h=600*c.sourceSize[1]/c.sourceSize[0];
 const paths={body:'M 0 0 L 600 0 L 600 '+h+' L 0 '+h+' Z '+c.head+' '+c.feet+' '+c.nearWing+' '+c.farWing,head:c.head,feet:c.feet,nearWing:c.nearWing,farWing:c.farWing};
 const parts={};let pi=0;
 for(const [key,d]of Object.entries(paths)){const part=component('QuRa/v05/'+c.id+'/'+key,600,680);part.x=100+pi*650;part.y=5000+ci*750;path(part,d,'PART_MASK',true);pixels(part,key==='head'?(c.headHash||c.hash):c.hash,600,h);parts[key]=part;pi++;}
 layers[c.id]=Object.fromEntries(Object.entries(parts).map(([k,v])=>[k,v.id]));
 const rig=component('QuRa/v05/'+c.id+'/CARD',600,680);rig.x=5000+ci*650;rig.y=1800;rig.description='Static modular character. Change equipment with component booleans. Head, feet and wings are independent. Body profile: '+c.bodyType;
 instance(rig,parts.body,'BODY');instance(rig,parts.feet,'BARE_FEET');
 const wornVest=instance(rig,vest,'VEST',...c.garment.slice(0,2));wornVest.resize(c.garment[2],c.garment[3]);
 const bagGroup=frame('BAG_AND_STRAP',600,680,rig);const bx=c.bag[0],by=c.bag[1],bw=c.bag[2],bh=c.bag[3];
 const strap=track(figma.createVector());bagGroup.appendChild(strap);strap.name='SHOULDER_STRAP';strap.vectorPaths=[{windingRule:'NONZERO',data:`M${c.shoulder[0]} ${c.shoulder[1]} Q${c.shoulder[0]+60} ${c.shoulder[1]+27} ${bx+bw*.55} ${by+5}`}];strap.fills=[];strap.strokes=[{type:'SOLID',color:{r:.72,g:.24,b:.32}}];strap.strokeWeight=7;strap.strokeCap='ROUND';
 const wornBag=instance(bagGroup,bag,'BAG',bx,by);wornBag.resize(bw,bh);
 instance(rig,parts.farWing,'FAR_WING');instance(rig,parts.nearWing,'NEAR_WING');instance(rig,parts.head,'HEAD');
 const wornAv=instance(rig,av,'GLASSES',c.eyeBridge[0]-635*c.glassesScale,c.eyeBridge[1]-155*c.glassesScale,c.glassesScale);
 if(c.glassesRotation){const a=c.glassesRotation*Math.PI/180,co=Math.cos(a),si=Math.sin(a),px=635*c.glassesScale,py=155*c.glassesScale;wornAv.relativeTransform=[[co,-si,c.eyeBridge[0]-co*px+si*py],[si,co,c.eyeBridge[1]-si*px-co*py]];}
 const props={vest:rig.addComponentProperty('Жилет','BOOLEAN',false),bag:rig.addComponentProperty('Сумка','BOOLEAN',false),glasses:rig.addComponentProperty('Авиаторы','BOOLEAN',false)};
 wornVest.componentPropertyReferences={visible:props.vest};bagGroup.componentPropertyReferences={visible:props.bag};wornAv.componentPropertyReferences={visible:props.glasses};wornVest.visible=false;bagGroup.visible=false;wornAv.visible=false;
 rigs[c.id]={id:rig.id,props};
}

return {createdNodeIds:created,layers,rigs};