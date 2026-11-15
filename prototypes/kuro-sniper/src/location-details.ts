import {Mesh,MeshBuilder,TransformNode,Vector3,Color3,StandardMaterial,DynamicTexture,VertexData,ShaderMaterial,Effect} from '@babylonjs/core';
import type {World} from './world';
const C=(s:string)=>Color3.FromHexString(s);
// Near props establish place without changing target distance or either camera.
export function dressLocation(w:World,level:any){
 const scene=w.scene,root=new TransformNode('location-detail-L'+level.id,scene);root.parent=w.environment;const d=level.distanceM;
 const box=(name:string,p:number[],s:number[],m:any)=>w.box(name,p,s,m,root);
 const cyl=(name:string,p:number[],h:number,top:number,bottom:number,m:any,n=24)=>{const a=MeshBuilder.CreateCylinder(name,{height:h,diameterTop:top,diameterBottom:bottom,tessellation:n},scene);a.position.set(...p as [number,number,number]);a.parent=root;a.material=m;a.receiveShadows=true;return a;};
 const torus=(name:string,p:number[],diameter:number,thickness:number,m:any)=>{const a=MeshBuilder.CreateTorus(name,{diameter,thickness,tessellation:32},scene);a.position.set(...p as [number,number,number]);a.parent=root;a.material=m;return a;};
 const wood=w.materials.wood,dark=w.materials.darkWood,metal=w.materials.metal,gold=w.materials.gold,cream=w.materials.cream;
 const board=(text:string,x=-2.1,z=3.7)=>{box('distance-board-stake',[x,.44,z+.035],[.07,.88,.07],dark);const a=MeshBuilder.CreatePlane('distance-board-'+text,{width:1.05,height:.52},scene);a.parent=root;a.position.set(x,.93,z);
  const t=new DynamicTexture('distance-board-text',{width:512,height:256},scene,false),c=t.getContext() as CanvasRenderingContext2D;c.fillStyle='#d6c29a';c.fillRect(0,0,512,256);c.strokeStyle='#715437';c.lineWidth=12;c.strokeRect(10,10,492,236);c.font='bold 94px Onest';c.textAlign='center';c.fillStyle='#4a3623';c.fillText(text,256,168);t.update();const m=new StandardMaterial('distance-board-material',scene);m.diffuseTexture=t;m.emissiveColor=new Color3(.15,.15,.15);m.specularColor=Color3.Black();a.material=m;w.levelMaterials.push(m);};
 const crate=(x:number,y:number,z:number,size=.75)=>{box('feed-crate',[x,y+size/2,z],[size,size,size],wood);for(const side of [-1,1]){box('crate-rim',[x+side*size*.45,y+size/2,z-size*.51],[.07,size,.055],dark);box('crate-rim',[x,y+size*(side===1?.95:.05),z-size*.51],[size,.07,.055],dark);}const strap=box('crate-diagonal-brace',[x,y+size/2,z-size*.55],[size*1.18,.065,.035],wood);strap.rotation.z=.7;};
 const sack=(x:number,z:number)=>{const a=MeshBuilder.CreateLathe('canvas-feed-sack',{shape:[new Vector3(0,.035,0),new Vector3(.22,.035,0),new Vector3(.29,.13,0),new Vector3(.28,.35,0),new Vector3(.23,.53,0),new Vector3(.07,.66,0),new Vector3(.12,.72,0),new Vector3(.10,.75,0)],tessellation:32,sideOrientation:Mesh.DOUBLESIDE},scene);a.parent=root;a.position.set(x,0,z);a.material=w.materials.clothCream;
  const positions=a.getVerticesData('position')!;for(let i=0;i<positions.length;i+=3){const angle=Math.atan2(positions[i+2],positions[i]),crease=1+.045*Math.sin(angle*7+positions[i+1]*5);positions[i]*=crease;positions[i+2]*=crease*.82;}a.setVerticesData('position',positions);cyl('sack-tie',[x,.65,z],.025,.15,.15,dark,16);
  const patch=box('feed-sack-label',[x,.32,z-.232],[.24,.18,.006],w.materials.wood);patch.rotation.x=.12;};
 const hay=w.mat('hay-bale-fibres-L'+level.id,'#ffffff',0,1);const hayPhoto=w.textures['/assets/materials/dry-hay-v1.png'].clone();hayPhoto.uScale=3;hayPhoto.vScale=1;hay.albedoTexture=hayPhoto;
 const bale=(x:number,z:number,round=false)=>{if(round){const a=cyl('round-straw-bale',[x,.62,z],1.05,1.25,1.25,hay);a.rotation.z=Math.PI/2;for(const side of [-1,1]){const r=torus('bale-binding',[x+side*.34,.62,z],1.26,.018,dark);r.rotation.z=Math.PI/2;}}else{box('bound-hay-bale',[x,.32,z],[1.1,.64,.68],hay);for(const side of [-1,1])box('bale-binding',[x+side*.33,.32,z-.35],[.018,.66,.018],dark);}};
 const milkCan=(x:number,z:number)=>{cyl('milk-can',[x,.36,z],.65,.34,.37,metal);cyl('milk-can-shoulder',[x,.72,z],.16,.21,.34,metal);cyl('milk-can-neck',[x,.83,z],.1,.22,.22,metal);torus('milk-can-rim',[x,.88,z],.24,.018,gold);for(const side of [-1,1]){const a=torus('milk-can-handle',[x+side*.21,.65,z],.16,.018,metal);a.rotation.x=Math.PI/2;}};
 const wheel=(x:number,z:number)=>{const a=torus('old-cart-wheel',[x,.49,z],.95,.065,dark);a.rotation.x=Math.PI/2;for(let i=0;i<4;i++){const spoke=box('wheel-spoke',[x,.49,z],[.035,.88,.035],wood);spoke.rotation.z=i*Math.PI/4;}const hub=cyl('wheel-hub',[x,.49,z],.14,.15,.15,metal);hub.rotation.x=Math.PI/2;};
 const lantern=(x:number,y:number,z:number)=>{cyl('lantern-top',[x,y+.20,z],.06,.21,.28,metal);cyl('lantern-bottom',[x,y-.20,z],.07,.26,.22,metal);const glow=w.mat('warm-lantern-glass-'+x,'#ffcc76',0,.2);glow.emissiveColor=C('#e5a74b');box('lantern-glass',[x,y,z],[.18,.34,.18],glow);for(const sx of [-1,1])for(const sz of [-1,1])box('lantern-frame',[x+sx*.105,y,z+sz*.105],[.02,.38,.02],metal);torus('lantern-hanger',[x,y+.30,z],.14,.015,metal);};
 const pennants=(z:number,width=24)=>{const cable=MeshBuilder.CreateLines('festival-bunting-rope',{points:[new Vector3(-width/2,4,z),new Vector3(0,3.7,z),new Vector3(width/2,4,z)]},scene);cable.parent=root;cable.color=C('#a89065');for(let i=0;i<15;i++){const x=(i-7)*width/14,a=new Mesh('cloth-pennant',scene),v=new VertexData();v.positions=[-.30,0,0,.30,0,0,0,-.55,0];v.indices=[0,1,2];v.normals=[0,0,-1,0,0,-1,0,0,-1];v.uvs=[0,1,1,1,.5,0];v.applyToMesh(a);a.parent=root;a.position.set(x,3.7+Math.abs(x)/(width/2)*.3,z);a.material=i%2?w.materials.clothRed:w.materials.clothCream;a.metadata={flutter:true,phase:i};}};
 const barn=(x:number,z:number,width=12)=>{const red=w.photoMaterial('weathered-red-barn','ref-wall');red.albedoColor=new Color3(.95,.28,.16);box('barn-board-walls',[x,2.6,z],[width,5.2,7],red);for(const side of [-1,1]){const roof=box('barn-pitched-roof',[x+side*width/4,5.85,z],[Math.hypot(width/2,1.3)+.4,.16,8],dark);roof.rotation.z=-side*Math.atan2(1.3,width/2);}
  const gable=new Mesh('barn-front-gable',scene),v=new VertexData();v.positions=[-width/2,0,0,width/2,0,0,0,1.3,0];v.indices=[0,2,1];v.normals=[0,0,-1,0,0,-1,0,0,-1];v.uvs=[0,0,1,0,.5,1];v.applyToMesh(gable);gable.position.set(x,5.2,z-3.51);gable.parent=root;gable.material=red;
  for(const side of [-1,1]){box('barn-sliding-door',[x+side*.77,1.50,z-3.54],[1.5,3,.06],wood);const brace=box('barn-door-cross-brace',[x+side*.77,1.5,z-3.60],[.075,3.2,.04],cream);brace.rotation.z=side*.40;box('barn-corner-trim',[x+side*(width/2-.08),2.6,z-3.55],[.14,5.2,.07],cream);}
  box('barn-loft-window',[x,4.3,z-3.55],[1.7,1.0,.07],dark);for(const y of [3.82,4.78])box('loft-window-trim',[x,y,z-3.60],[1.8,.07,.05],cream);box('loft-crossbar',[x,4.3,z-3.61],[.06,1,.06],cream);};
 const sandbag=(x:number,z:number)=>{const a=MeshBuilder.CreateSphere('shooting-rest-sandbag',{diameter:.5,segments:16},scene);a.parent=root;a.position.set(x,.95,z);a.scaling.set(1.35,.40,.8);a.material=w.materials.clothCream;};
 const caseBox=(x:number,z:number)=>{box('range-equipment-case',[x,1.00,z],[.64,.24,.38],w.materials.green);for(const side of [-1,1])box('case-latch',[x+side*.22,1.0,z-.20],[.045,.09,.025],gold);};
 const rocks=(x:number,z:number)=>{const m=w.mat('river-stone-L'+level.id,'#8a8a7c',0,.98);for(let i=0;i<6;i++){const a=MeshBuilder.CreateIcoSphere('rounded-path-stone',{radius:.18+(i%3)*.06,subdivisions:2,flat:false},scene);a.parent=root;a.position.set(x+Math.sin(i*2.4)*.55,.08,z+Math.cos(i*2.4)*.55);a.scaling.set(1.3,.6,1);a.material=m;}};
 if(level.id===1){pennants(d+.35,11);crate(-4.8,0,d-1.6,.55);sack(4.9,d-1.4);wheel(-5.35,d-1.5);lantern(-4.9,2.8,d-.2);}
 if(level.id===2){
  board('25 М',-2.2,3.8);for(let z=4;z<d;z+=4){box('gallery-roof-truss',[0,3.8,z],[12,.18,.22],dark);for(const side of [-1,1]){const a=box('gallery-truss-brace',[side*2.6,4.0,z],[5.5,.13,.14],wood);a.rotation.z=side*.14;}}
  for(const x of [-3.2,3.2])box('shooting-lane-divider',[x,.12,d/2],[.12,.24,d],dark);
  for(const side of [-1,1]){box('trophy-wall-shelf',[side*4.8,1.6,6],[1.35,.1,.55],dark);const x=side*4.8;cyl('golden-trophy-cup',[x,1.95,5.9],.32,.35,.16,gold);cyl('trophy-stem',[x,1.71,5.9],.20,.06,.06,gold);box('trophy-base',[x,1.64,5.9],[.32,.07,.26],dark);for(const s of [-1,1]){const h=torus('trophy-handle',[x+s*.20,1.95,5.9],.20,.025,gold);h.rotation.x=Math.PI/2;}lantern(side*5.1,2.7,8);}
 }
 if(level.id>=3){board(level.id===10?'ФИНАЛ':level.distanceM+' М');rocks(-2.7,5.5);}
 if(level.id===3){crate(-2.7,0,4.6,.65);sack(-1.8,4.2);}
 if(level.id===4){bale(-3.3,5,true);box('near-fence-rail',[-3.2,.65,5.3],[3.3,.10,.10],wood);for(const x of [-4.7,-1.7])box('near-fence-post',[x,.5,5.3],[.13,1,.13],dark);barn(-18,d+35,8);}
 if(level.id===5){barn(0,d+12,14);bale(-3.4,4.8);bale(-3.4,5.0,true);bale(3.0,5.2);milkCan(-2.1,4.4);wheel(-3.8,4.0);crate(3.6,0,4.2,.75);sack(2.4,4.7);}
 if(level.id===6){sandbag(-.7,2.35);caseBox(-1.25,2.6);crate(-3.3,0,5.5,.65);}
 if(level.id===7){rocks(-3.1,4);rocks(3.1,5.3);caseBox(-1.1,2.6);sandbag(-.4,2.4);}
 if(level.id===8){bale(-3.5,5.5,true);bale(3.3,6.1,true);sandbag(-.65,2.4);cyl('water-canteen',[-1.2,1.10,2.5],.32,.14,.14,metal);cyl('canteen-cap',[-1.2,1.29,2.5],.05,.07,.07,dark);}
 if(level.id===9){
  const deck=MeshBuilder.CreateGround('terrace-wooden-deck',{width:9,height:7},scene);deck.parent=root;deck.position.set(0,.025,2);deck.material=w.materials.floor;deck.receiveShadows=true;
  for(const side of [-1,1]){box('terrace-side-rail',[side*4.0,1.1,2.3],[.10,.12,5.2],dark);for(let z=.2;z<5;z+=.7)box('terrace-baluster',[side*4.0,.56,z],[.075,1.05,.075],wood);lantern(side*3.6,3.65,2.2);}
  caseBox(-1.1,2.6);sandbag(-.4,2.4);}
 if(level.id===10){
  for(let x=-28;x<=28;x+=4)box('yard-fence-post',[x,.6,d+5],[.13,1.2,.13],dark);for(const y of [.35,.82])box('yard-fence-rail',[0,y,d+5],[58,.085,.085],wood);pennants(d+5,52);barn(34,d+20,9);bale(-30,d+10,true);crate(-2.8,0,4.5,.7);sack(-1.9,4.4);}
 return root;
}

export function makeDetailedWindmill(w:World,x:number,z:number){
 const root=new TransformNode('windmill-detailed',w.scene);root.parent=w.environment;root.position.set(x,0,z);const mat=w.mat('weathered-windmill-plaster','#c9c1a8',0,.95);
 const tower=MeshBuilder.CreateCylinder('tapered-windmill-tower',{height:6.4,diameterTop:1.9,diameterBottom:3.0,tessellation:16},w.scene);tower.parent=root;tower.position.y=3.2;tower.material=mat;
 const roof=MeshBuilder.CreateCylinder('windmill-conical-roof',{height:1.6,diameterTop:0,diameterBottom:2.8,tessellation:20},w.scene);roof.parent=root;roof.position.y=7.1;roof.material=w.materials.darkWood;
 w.box('mill-door',[0,.95,-1.45],[.75,1.9,.08],w.materials.darkWood,root);for(const y of [3.4,5.1])w.box('mill-window',[0,y,-1.1],[.44,.62,.07],w.materials.metal,root);
 const hub=new TransformNode('windmill-hub',w.scene);hub.parent=root;hub.position.set(0,6,-1.6);hub.metadata={windmill:true};
 for(let i=0;i<4;i++){const arm=new TransformNode('windmill-sail-arm',w.scene);arm.parent=hub;arm.rotation.z=i*Math.PI/2;
  w.box('mill-sail-spine',[0,1.8,0],[.13,3.6,.10],w.materials.darkWood,arm);w.box('mill-canvas-sail',[.34,2.45,.02],[.68,2.0,.025],w.materials.clothCream,arm);
  for(let k=0;k<6;k++)w.box('mill-sail-lath',[.28,1.4+k*.38,-.01],[1.05,.07,.07],w.materials.wood,arm);
 }
 return root;
}

// A sunlit stable range: actual gaps between posts, exterior meadow and calm horses.
export function buildOpenStable(w:World,level:any){
 const d=level.distanceM,scene=w.scene,wood=w.materials.wood,dark=w.materials.darkWood,trim=w.materials.cream;
 const box=(n:string,p:number[],s:number[],m:any)=>w.box(n,p,s,m);
 const floor=MeshBuilder.CreateGround('stable-worn-plank-floor',{width:13,height:d+2},scene);floor.parent=w.environment;floor.position.z=d/2;floor.material=w.materials.floor;floor.receiveShadows=true;
 for(const tex of [w.materials.floor.albedoTexture,w.materials.floor.bumpTexture,w.materials.floor.metallicTexture]){tex.uScale=13/3;tex.vScale=(d+2)/3;}
 const outside=MeshBuilder.CreateGround('stable-exterior-meadow',{width:150,height:140},scene);outside.parent=w.environment;outside.position.set(0,-.025,35);outside.material=w.photoMaterial('stable-outdoor-grass','ref-grass',35,35);
 box('stable-target-back-wall',[0,2.4,d+.8],[13,.1+4.7,.18],wood);box('stable-quiet-target-panel',[0,1.8,d+.66],[9.3,3.15,.06],dark);
 for(const side of [-1,1]){
  box('stable-low-side-wall',[side*6.4,.5,d/2],[.18,1,d+1],wood);
  box('stable-window-top-beam',[side*6.4,3.65,d/2],[.18,.30,d+1],dark);
  for(let z=2;z<d;z+=4.5){
   box('stable-window-post',[side*6.4,2.25,z],[.20,4.5,.20],dark);
   box('stable-window-sill',[side*6.32,1.10,z+2.1],[.30,.12,3.7],trim);
   box('stable-window-header',[side*6.32,3.35,z+2.1],[.25,.12,3.7],trim);
   const shutter=box('open-stable-window-shutter',[side*6.48,2.20,z+.15],[.07,2.15,1.25],wood);shutter.rotation.y=side*1.22;
   const light=MeshBuilder.CreateGround('sunlight-through-stable-window',{width:2.6,height:3.3},scene);light.parent=w.environment;light.position.set(side*3.9,.008,z+1.4);light.rotation.y=side*.4;
   const mat=new StandardMaterial('soft-stable-window-light',scene);mat.diffuseColor=C('#ffe3a1');mat.emissiveColor=C('#b58a43');mat.specularColor=Color3.Black();mat.alpha=.10;light.material=mat;light.isPickable=false;w.levelMaterials.push(mat);
  }
  for(const z of [7,13]){
   for(const y of [.6,1.15])box('horse-stall-rail',[side*3.75,y,z+1.8],[.11,.1,4.4],dark);
   for(const dz of [-.4,4])box('horse-stall-post',[side*3.75,.78,z+dz],[.16,1.56,.16],wood);
   const horse=MeshBuilder.CreatePlane('calm-horse-in-side-stall',{width:3.25,height:2.17,sideOrientation:Mesh.DOUBLESIDE},scene);horse.parent=w.environment;horse.position.set(side*4.7,1.13,z+2.0);horse.scaling.x=side;
   const hm=new StandardMaterial('chestnut-horse-coat',scene);hm.diffuseTexture=w.textures['/assets/stable/horse-chestnut-v1.png'];hm.diffuseTexture.hasAlpha=true;hm.useAlphaFromDiffuseTexture=true;hm.transparencyMode=1;hm.alphaCutOff=.65;hm.backFaceCulling=false;hm.emissiveColor=new Color3(.16,.16,.16);hm.specularColor=Color3.Black();horse.material=hm;horse.isPickable=false;horse.metadata={horse:true,phase:z+side};w.levelMaterials.push(hm);
  }
 }
 for(let z=2;z<d+1;z+=4.5){
  box('stable-roof-crossbeam',[0,4.05,z],[13.1,.20,.24],dark);
  for(const side of [-1,1]){const brace=box('stable-sloped-roof-rafter',[side*3.25,4.65,z],[6.8,.14,.18],wood);brace.rotation.z=-side*.18;}
 }
 for(const side of [-1,1]){const roof=box('stable-weathered-roof',[side*3.3,4.7,d/2],[6.9,.14,d+3],wood);roof.rotation.z=-side*.18;}
 box('stable-roof-ridge',[0,5.35,d/2],[.22,.22,d+3],dark);
 w.scatterHay(d);
}
