import {
  Engine,Scene,FreeCamera,Camera,Vector3,Color3,Color4,HemisphericLight,DirectionalLight,
  MeshBuilder,Mesh,TransformNode,StandardMaterial,PBRMaterial,DynamicTexture,Texture,
  ShadowGenerator,SceneLoader,AssetContainer,RenderTargetTexture,ShaderMaterial,Effect,Matrix,
} from '@babylonjs/core';
import '@babylonjs/loaders/glTF';
import {scopeFov,clamp} from './game.mjs';

type Actor={root:TransformNode,bird:Mesh,station:TransformNode,hinge:TransformNode|null,target:Mesh,targetRoot:TransformNode,halo:Mesh,card:Texture,perch:Texture,id:string,code:string,groundX:number,perchY:number,cardY:number};
const FOOT_ANCHORS:Record<string,number[]>={ryaba:[623,670],fool:[594,664],professor:[601,653],fighter:[614,663],glamour:[599,689]};
const C=(s:string)=>Color3.FromHexString(s);
export class World {
  engine:Engine;scene:Scene;camera:FreeCamera;scopeCamera:FreeCamera;scope:RenderTargetTexture;
  overlay:Scene;lens:Mesh;lensShader:ShaderMaterial;weaponScene:Scene;weaponCamera:FreeCamera;
  environment:TransformNode;actors:Actor[]=[];guns:Record<string,TransformNode>={};gun:TransformNode|null=null;
  stationContainer:AssetContainer|null=null;shadow:ShadowGenerator;sun:DirectionalLight;
  materials:Record<string,any>={};textures:Record<string,Texture>={};diameter=300;yaw=0;pitch=-.05;recoil=0;ads=0;magnification=1;
  particles:any[]=[];level:any;core:any;ready=false;menu=true;elapsed=0;bullet:Mesh;
  levelMaterials:any[]=[];buildingEnvironment=false;
  onFrame:((dt:number)=>void)|null=null;resizeObserver:ResizeObserver;low=false;
  constructor(public canvas:HTMLCanvasElement){
    this.engine=new Engine(canvas,true,{preserveDrawingBuffer:true,stencil:true,alpha:false,powerPreference:'high-performance'});
    this.engine.setHardwareScalingLevel(Math.max(1,window.devicePixelRatio/1.5));
    this.scene=new Scene(this.engine);this.scene.clearColor=new Color4(.66,.78,.83,1);
    this.scene.ambientColor=new Color3(.35,.32,.25);
    this.scene.fogMode=Scene.FOGMODE_EXP2;this.scene.fogDensity=.00028;this.scene.fogColor=new Color3(.76,.83,.82);
    this.camera=new FreeCamera('world-camera',new Vector3(0,1.5,0),this.scene);this.camera.minZ=.05;this.camera.maxZ=3600;this.camera.fov=50*Math.PI/180;this.camera.fovMode=Camera.FOVMODE_VERTICAL_FIXED;
    this.camera.setTarget(new Vector3(0,.88,10));this.scene.activeCamera=this.camera;
    this.scopeCamera=new FreeCamera('scope-camera',this.camera.position.clone(),this.scene);this.scopeCamera.minZ=.05;this.scopeCamera.maxZ=3600;this.scopeCamera.fovMode=Camera.FOVMODE_VERTICAL_FIXED;
    const hemi=new HemisphericLight('sky-light',new Vector3(.2,1,-.3),this.scene);hemi.intensity=.78;hemi.groundColor=C('#8a7952');
    this.sun=new DirectionalLight('sun',new Vector3(-.45,-1,.35),this.scene);this.sun.position=new Vector3(15,30,-15);this.sun.intensity=2.5;this.sun.diffuse=C('#ffdfac');
    this.shadow=new ShadowGenerator(1024,this.sun);this.shadow.useBlurExponentialShadowMap=true;this.shadow.blurKernel=12;this.shadow.darkness=.18;
    this.materials.wood=this.woodMaterial('oak','#9b663c');this.materials.darkWood=this.woodMaterial('walnut','#553a29');this.materials.cream=this.mat('cream','#f4e5c6');this.materials.red=this.mat('red','#b7533d');this.materials.gold=this.mat('gold','#ddb86a',.55,.35);this.materials.metal=this.mat('metal','#3e4645',.7,.33);this.materials.green=this.mat('green','#658353');
    this.environment=new TransformNode('environment',this.scene);
    this.scope=new RenderTargetTexture('scope-view',{width:768,height:768},this.scene,false,false,0,false,Texture.BILINEAR_SAMPLINGMODE);this.scope.activeCamera=this.scopeCamera;this.scope.ignoreCameraViewport=true;this.scope.renderList=null;this.scene.customRenderTargets.push(this.scope);
    this.overlay=new Scene(this.engine);this.overlay.autoClear=false;this.overlay.autoClearDepthAndStencil=true;
    const ortho=new FreeCamera('lens-composite',new Vector3(0,0,-10),this.overlay);ortho.mode=Camera.ORTHOGRAPHIC_CAMERA;ortho.setTarget(Vector3.Zero());this.overlay.activeCamera=ortho;
    Effect.ShadersStore.ksLensVertexShader='precision highp float;attribute vec3 position;attribute vec2 uv;uniform mat4 worldViewProjection;varying vec2 vUV;void main(){vUV=uv;gl_Position=worldViewProjection*vec4(position,1.0);}';
    Effect.ShadersStore.ksLensFragmentShader='precision highp float;varying vec2 vUV;uniform sampler2D lensView;uniform float visible;void main(){float d=length(vUV-0.5)*2.0;if(d>1.0||visible<0.01)discard;vec3 col=texture2D(lensView,vUV).rgb;float edge=smoothstep(0.82,1.0,d);col*=1.0-edge*0.13;gl_FragColor=vec4(col,visible);}';
    this.lensShader=new ShaderMaterial('lens-compositor',this.overlay,{vertex:'ksLens',fragment:'ksLens'},{attributes:['position','uv'],uniforms:['worldViewProjection','visible'],samplers:['lensView'],needAlphaBlending:true});this.lensShader.setTexture('lensView',this.scope);this.lensShader.setFloat('visible',0);this.lensShader.backFaceCulling=false;this.lensShader.disableDepthWrite=true;
    this.lens=MeshBuilder.CreatePlane('round-lens',{size:1},this.overlay);this.lens.material=this.lensShader;this.lens.isPickable=false;
    this.weaponScene=new Scene(this.engine);this.weaponScene.autoClear=false;this.weaponScene.autoClearDepthAndStencil=true;
    this.weaponCamera=new FreeCamera('hands-camera',Vector3.Zero(),this.weaponScene);this.weaponCamera.setTarget(new Vector3(0,0,1));this.weaponCamera.minZ=.01;this.weaponCamera.fov=.95;this.weaponScene.activeCamera=this.weaponCamera;
    const gunlight=new HemisphericLight('gun-sky',new Vector3(0,1,-1),this.weaponScene);gunlight.intensity=1.7;gunlight.groundColor=C('#5c5143');const key=new DirectionalLight('gun-key',new Vector3(-1,-1,1),this.weaponScene);key.intensity=3;key.diffuse=C('#ffe2ae');
    this.bullet=MeshBuilder.CreateSphere('capsule',{diameter:.025,segments:6},this.scene);this.bullet.material=this.mat('capsule','#ffd785',.15,.4);this.bullet.setEnabled(false);
    this.resizeObserver=new ResizeObserver(()=>this.resize());this.resizeObserver.observe(canvas);this.resize();
  }
  mat(name:string,hex:string,metallic=0,roughness=.85,scene=this.scene){const m=new PBRMaterial(name,scene);m.albedoColor=C(hex).toLinearSpace();m.metallic=metallic;m.roughness=roughness;m.environmentIntensity=.7;if(this.buildingEnvironment)this.levelMaterials.push(m);return m;}
  woodMaterial(name:string,hex:string){
    const m=this.mat(name,hex,0,.7);const t=new DynamicTexture(name+'-grain',{width:256,height:512},this.scene,false);const ctx=t.getContext();ctx.fillStyle=hex;ctx.fillRect(0,0,256,512);
    for(let i=0;i<60;i++){ctx.strokeStyle=i%3?'rgba(36,19,9,.035)':'rgba(255,232,190,.06)';ctx.lineWidth=i%5===0?2:1;ctx.beginPath();const x=(i*73)%256;ctx.moveTo(x,0);for(let y=0;y<=512;y+=16)ctx.lineTo(x+Math.sin(y*.025+i)*2.8,y);ctx.stroke();}
    t.update();m.albedoTexture=t;m.albedoColor=Color3.White();return m;
  }
  box(name:string,pos:number[],scale:number[],mat:any,parent=this.environment){const m=MeshBuilder.CreateBox(name,{width:scale[0],height:scale[1],depth:scale[2]},this.scene);m.position.set(pos[0],pos[1],pos[2]);m.material=mat;m.parent=parent;m.receiveShadows=true;return m;}
  async load(onProgress:(n:number)=>void){
    const codes=['ryaba','fool','professor','fighter','glamour'];let done=0;
    await Promise.all(codes.flatMap(code=>['perch','card'].map(async pose=>{const t=await new Promise<Texture>((resolve,reject)=>{const tex=new Texture(`/assets/characters/${code}/${pose}.webp`,this.scene,false,true,Texture.TRILINEAR_SAMPLINGMODE,()=>resolve(tex),(_,e)=>reject(e));tex.hasAlpha=true;});this.textures[`${code}-${pose}`]=t;onProgress(++done/16);})));
    this.stationContainer=await SceneLoader.LoadAssetContainerAsync('/assets/models/','ks-target-station.glb',this.scene);onProgress(++done/16);
    await Promise.all(['airgun','sport','sniper','precision','final'].map(async family=>{const container=await SceneLoader.LoadAssetContainerAsync('/assets/models/',`ks-rifle-${family}.glb`,this.weaponScene);container.addAllToScene();for(const m of container.materials)if(m instanceof PBRMaterial){m.metallic=Math.min(m.metallic??0,.4);m.roughness=Math.max(m.roughness??.5,.4);}const root=new TransformNode('gun-'+family,this.weaponScene);for(const r of container.rootNodes)r.parent=root;root.setEnabled(false);this.guns[family]=root;onProgress(++done/16);}));
    this.ready=true;
    this.engine.runRenderLoop(()=>{const dt=Math.min(this.engine.getDeltaTime()/1000,.05);this.onFrame?.(dt);this.render(dt);});
  }
  setup(level:any,loadout:any,core:any,menu=false){
    this.level=level;this.core=core;this.menu=menu;this.yaw=0;this.pitch=Math.atan2(.88-1.5,level.distanceM);this.magnification=loadout.maxMagnification;this.recoil=0;this.ads=0;
    this.environment.dispose(false,false);this.levelMaterials.forEach(m=>m.dispose());this.levelMaterials=[];this.environment=new TransformNode('environment',this.scene);this.particles.forEach(p=>p.mesh.dispose());this.particles=[];this.buildingEnvironment=true;this.buildEnvironment(level);this.buildingEnvironment=false;
    Object.values(this.guns).forEach(g=>g.setEnabled(false));this.gun=this.guns[loadout.family]||this.guns.airgun;if(this.gun){this.gun.setEnabled(true);this.gun.scaling.setAll(.7);}
    this.camera.position.set(0,1.5,0);this.sun.position.set(15,30,level.distanceM-18);this.shadow.getShadowMap()!.renderList=[];
  }
  buildEnvironment(level:any){
    const d=level.distanceM,indoor=level.id<=2;
    this.scene.clearColor=indoor?new Color4(.29,.24,.18,1):new Color4(.65,.79,.86,1);this.scene.fogDensity=indoor?0:.00024;
    this.sun.intensity=indoor?1.3:1.25;this.sun.diffuse=C(level.id===9?'#ffce98':'#ffe1b1');
    if(indoor){
      const w=13;for(let x=-w/2;x<w/2;x+=.65){this.box('back-plank',[x,2.1,d+.75],[.64,4.2,.14],x%1>.2?this.materials.wood:this.materials.darkWood);}
      for(let z=2;z<d+1;z+=.65)this.box('floor-board',[0,-.06,z],[w,.12,.64],this.materials.wood);
      this.box('rear-crossbeam',[0,3.45,d+.52],[13,.26,.3],this.materials.darkWood);
      const velvet=this.mat('velvet-green','#50624d');
      this.box('target-backdrop',[0,1.8,d+.60],[9.2,3.05,.04],velvet);
      for(const x of [-4.65,4.65])this.box('backdrop-gold-trim',[x,1.8,d+.54],[.045,3.12,.035],this.materials.gold);
      const sign=MeshBuilder.CreatePlane('fairground-sign',{width:3.25,height:.5},this.scene);sign.parent=this.environment;sign.position.set(0,3.25,d+.46);const signTex=new DynamicTexture('sign',{width:1024,height:160},this.scene,false);const sx=signTex.getContext() as CanvasRenderingContext2D;sx.fillStyle='#334438';sx.fillRect(0,0,1024,160);sx.strokeStyle='#cbb27e';sx.lineWidth=3;sx.strokeRect(8,8,1008,144);sx.fillStyle='#f2d79d';sx.textAlign='center';sx.font='bold 57px Onest';sx.fillText('QuRa  /  ДОБРЫЙ ТИР',512,100);signTex.update();const sm=new StandardMaterial('sign-mat',this.scene);sm.diffuseTexture=signTex;sm.emissiveColor=new Color3(.25,.25,.25);sign.material=sm;this.levelMaterials.push(sm);
      for(const x of [-6.2,6.2]){this.box('side-pillar',[x,2.25,d-1],[.3,4.5,.35],this.materials.darkWood);this.box('side-wall',[x,1.4,d/2],[.15,2.8,d],this.materials.wood);}
      const awningZ=Math.min(6,d-1);for(let x=-6.3;x<=6;x+=.65){const a=this.box('awning',[x,3.7,awningZ],[.65,.1,2],Math.round(x/.65)%2?this.materials.cream:this.materials.red);a.rotation.x=-.07;this.box('awning-valance',[x,3.48,awningZ-1],[.65,.4,.06],Math.round(x/.65)%2?this.materials.cream:this.materials.red);}
      for(let x=-5.6;x<6;x+=1.4){const bulb=MeshBuilder.CreateSphere('warm-bulb',{diameter:.12,segments:8},this.scene);bulb.position.set(x,3.35,awningZ-.8);bulb.parent=this.environment;const m=new StandardMaterial('bulb',this.scene);m.emissiveColor=C('#ffcb73');bulb.material=m;}
      this.box('counter',[0,.52,1.05],[13,.15,.7],this.materials.darkWood);
      for(const x of [-5.2,5.2]){const barrel=MeshBuilder.CreateCylinder('seed-barrel',{height:.8,diameterTop:.55,diameterBottom:.63,tessellation:16},this.scene);barrel.parent=this.environment;barrel.position.set(x,.4,d-1);barrel.material=this.materials.wood;for(const y of [.15,.65]){const band=MeshBuilder.CreateTorus('barrel-band',{diameter:.60,thickness:.045,tessellation:24},this.scene);band.parent=this.environment;band.position.set(x,y,d-1);band.material=this.materials.metal;}}
    }else{
      const ground=MeshBuilder.CreateGround('meadow',{width:3200,height:3600,subdivisions:1},this.scene);ground.position.z=1500;ground.material=this.mat('grass',level.id===8?'#b29c57':level.id===9?'#a7914e':'#8a9d69');ground.parent=this.environment;ground.receiveShadows=true;
      const nearMat=this.mat('near-grass','#70854d');for(let i=0;i<42;i++){const x=(i%2?1:-1)*(2.7+(i%9)*1.7),z=3+i*2.3;const m=MeshBuilder.CreateCylinder('grass-stem',{height:.18+(i%4)*.1,diameterTop:0,diameterBottom:.06,tessellation:3},this.scene);m.position.set(x,.12,z);m.material=nearMat;m.parent=this.environment;}
      this.box('shooting-table',[0,.48,.95],[3,.12,1.2],this.materials.darkWood);
      for(const x of [-3.8,3.8]){this.box('target-beam',[x,.16,d],[.18,.32,12],this.materials.darkWood);}
      for(let i=0;i<18;i++){
        const x=(i%2?-1:1)*(8+(i%7)*6),z=d-4+(i*19)%140;
        this.tree(x,z,2+(i%4)*.7,i);
      }
      for(let x=-10;x<=10;x+=2){this.box('fence-post',[x,.55,d+3],[.12,1.1,.12],this.materials.darkWood);}
      for(const y of [.35,.75])this.box('fence-rail',[0,y,d+3],[23,.08,.07],this.materials.wood);
      const pole=this.box('windsock-pole',[-5,1.7,d-1],[.06,3.4,.06],this.materials.metal);
      const sock=MeshBuilder.CreateCylinder('windsock',{height:1.1,diameterTop:.15,diameterBottom:.32,tessellation:12},this.scene);sock.parent=this.environment;sock.position.set(-4.5,3.1,d-1);sock.rotation.z=-Math.PI/2;sock.material=this.materials.red;pole.isPickable=false;
      if(level.id===5){this.box('barn',[9,2.8,d+12],[7,5.6,7],this.materials.red);const roof=this.box('barn-roof',[9,5.7,d+12],[7.8,.2,8],this.materials.darkWood);roof.rotation.z=-.12;this.box('barn-door',[9,1.5,d+8.45],[2.5,3,.05],this.materials.darkWood);}
      if([6,8,9].includes(level.id))this.windmill(-18,d+30);
      if(level.id===9){for(const x of [-3.8,3.8])this.box('terrace-pillar',[x,2.6,1.5],[.3,5.2,.3],this.materials.darkWood);this.box('terrace-roof',[0,4.3,1],[8.5,.24,4],this.materials.wood);}
      for(let i=0;i<7;i++){const cloud=MeshBuilder.CreateSphere('cloud',{diameter:24+(i%3)*10,segments:8},this.scene);cloud.scaling.y=.25;cloud.scaling.z=.7;cloud.position.set((i-3)*120,90+(i%3)*12,d+280+i*90);cloud.material=this.materials.cream;cloud.parent=this.environment;}
      for(let i=0;i<5;i++){const hill=MeshBuilder.CreateSphere('far-hill',{diameter:300+i*30,segments:12},this.scene);hill.scaling.y=.22;hill.position.set((i-2)*220,-10,d+650);hill.material=this.mat('hill'+i,i%2?'#779486':'#94a58c');hill.parent=this.environment;}
    }
  }
  tree(x:number,z:number,h:number,i:number){
    const trunk=MeshBuilder.CreateCylinder('tree-trunk',{height:h,diameterTop:.18,diameterBottom:.35,tessellation:6},this.scene);trunk.position.set(x,h/2,z);trunk.material=this.materials.darkWood;trunk.parent=this.environment;
    const leaf=this.mat('leaf'+i,i%3===0?'#688853':i%3===1?'#84995a':'#a8a46a');
    for(let j=0;j<3;j++){const crown=MeshBuilder.CreateIcoSphere('tree-crown',{radius:h*.65,subdivisions:1,flat:false},this.scene);crown.position.set(x+(j-1)*h*.35,h+(j%2)*h*.4,z+(j%2)*.4);crown.scaling.y=1.15;crown.material=leaf;crown.parent=this.environment;}
  }
  windmill(x:number,z:number){
    this.box('windmill-tower',[x,3,z],[2,6,2],this.materials.cream);const hub=new TransformNode('windmill-hub',this.scene);hub.parent=this.environment;hub.position.set(x,5,z-1.2);hub.metadata={windmill:true};
    for(let i=0;i<4;i++){const blade=this.box('windmill-blade',[0,0,0],[.35,4.4,.1],this.materials.darkWood,hub);blade.position.y=2;const pivot=new TransformNode('blade-pivot',this.scene);pivot.parent=hub;blade.parent=pivot;pivot.rotation.z=i*Math.PI/2;}
  }
  setActors(targets:any[]){
    this.shadow.getShadowMap()!.renderList=[];
    for(const a of this.actors){a.bird.material?.dispose();a.target.material?.dispose(false,true);a.halo.material?.dispose();a.root.dispose();a.station.dispose();a.targetRoot.dispose();a.halo.dispose();}this.actors=[];
    for(const t of targets){
      const inst=this.stationContainer!.instantiateModelsToScene(n=>t.id+'-'+n,false);const station=new TransformNode(t.id+'-station',this.scene);for(const r of inst.rootNodes)r.parent=station;station.position.set(t.baseX,0,this.level.distanceM+.15);
      const hinge=station.getChildTransformNodes().find(n=>n.name.includes('platform_hinge'))||null;
      const root=new TransformNode(t.id+'-bird',this.scene);root.position.set(t.baseX,1.47,this.level.distanceM-.12);
      const perchY=(FOOT_ANCHORS[t.code][0]/760-.5)*1.62,cardY=(FOOT_ANCHORS[t.code][1]/760-.5)*1.62;
      const bird=MeshBuilder.CreatePlane(t.id+'-canonical',{width:1.28,height:1.62,sideOrientation:Mesh.DOUBLESIDE},this.scene);bird.parent=root;bird.position.y=perchY;
      const m=new StandardMaterial(t.id+'-image',this.scene);m.diffuseTexture=this.textures[t.code+'-perch'];m.useAlphaFromDiffuseTexture=true;m.backFaceCulling=false;m.emissiveColor=new Color3(.45,.45,.45);m.specularColor=Color3.Black();m.transparencyMode=2;bird.material=m;bird.alphaIndex=2;
      const targetRoot=new TransformNode(t.id+'-disk-root',this.scene);targetRoot.position.set(t.baseX,.88,this.level.distanceM);
      const disk=MeshBuilder.CreateDisc(t.id+'-bullseye',{radius:this.level.targetDiameterM/2,tessellation:48,sideOrientation:Mesh.DOUBLESIDE},this.scene);disk.parent=targetRoot;
      const texture=new DynamicTexture(t.id+'-target-texture',{width:256,height:256},this.scene,false);const ctx=texture.getContext();
      for(const [r,c] of [[128,'#e9dfbb'],[116,'#bd4d3a'],[93,'#f8efdb'],[68,'#bd4d3a'],[40,'#f8efdb'],[22,'#ba4c39']] as [number,string][]){ctx.fillStyle=c;ctx.beginPath();ctx.arc(128,128,r,0,Math.PI*2);ctx.fill();}texture.update();
      const dm=new StandardMaterial(t.id+'-target-material',this.scene);dm.diffuseTexture=texture;dm.emissiveColor=new Color3(.32,.32,.32);dm.specularColor=new Color3(.15,.15,.15);disk.material=dm;
      const rim=MeshBuilder.CreateTorus(t.id+'-brass-ring',{diameter:this.level.targetDiameterM+.025,thickness:.024,tessellation:40},this.scene);rim.rotation.x=Math.PI/2;rim.parent=targetRoot;rim.position.z=.012;rim.material=this.materials.gold;
      const chain=MeshBuilder.CreateCylinder(t.id+'-chain',{height:.27,diameter:.018,tessellation:6},this.scene);chain.parent=targetRoot;chain.position.y=this.level.targetDiameterM/2+.12;chain.material=this.materials.metal;
      const halo=MeshBuilder.CreateTorus(t.id+'-ability-halo',{diameter:1.9,thickness:.025,tessellation:48},this.scene);halo.rotation.x=Math.PI/2;halo.position.set(t.baseX,1.6,this.level.distanceM-.18);const hm=new StandardMaterial('halo',this.scene);hm.emissiveColor=t.code==='glamour'?C('#f8aad6'):C('#82e4dd');hm.alpha=.6;halo.material=hm;halo.setEnabled(false);
      for(const mesh of station.getChildMeshes())this.shadow.addShadowCaster(mesh);this.shadow.addShadowCaster(bird);
      this.actors.push({id:t.id,code:t.code,root,bird,station,hinge,target:disk,targetRoot,halo,card:this.textures[t.code+'-card'],perch:this.textures[t.code+'-perch'],groundX:t.baseX,perchY,cardY});
    }
  }
  setAds(value:boolean){this.ads=value?1:0;this.resize();}
  resize(){
    this.engine.resize();const w=this.engine.getRenderWidth(),h=this.engine.getRenderHeight();this.diameter=Math.min(h*.76,w*.46);
    const camera=this.overlay.activeCamera as FreeCamera;camera.orthoLeft=-w/2;camera.orthoRight=w/2;camera.orthoTop=h/2;camera.orthoBottom=-h/2;
    this.lens.scaling.set(this.diameter,this.diameter,1);this.lens.position.set(0,0,0);
    const cssH=this.canvas.clientHeight,cssW=this.canvas.clientWidth;document.documentElement.style.setProperty('--lens',`${Math.min(cssH*.76,cssW*.46)}px`);
  }
  direction(){return new Vector3(Math.sin(this.yaw)*Math.cos(this.pitch),Math.sin(this.pitch),Math.cos(this.yaw)*Math.cos(this.pitch));}
  aimDelta(dx:number,dy:number,sensitivity=1){
    const f=2*Math.tan(this.camera.fov/2)/this.canvas.clientHeight/(this.ads?this.magnification:1)*sensitivity;
    const limit=Math.atan2(7,this.level.distanceM)+.12;this.yaw=clamp(this.yaw+dx*f,-limit,limit);this.pitch=clamp(this.pitch-dy*f,-.32,.32);
  }
  targetWorldPoint(id:string){const t=this.core.target(id);return t?new Vector3(t.x,t.y,this.level.distanceM):null;}
  aimAt(id:string){const p=this.targetWorldPoint(id);if(p){const v=p.subtract(this.camera.position);this.yaw=Math.atan2(v.x,v.z);this.pitch=Math.atan2(v.y,Math.hypot(v.x,v.z));}}
  fireEffect(){this.recoil=1;}
  featherBurst(id:string){const a=this.actors.find(a=>a.id===id);if(!a)return;for(let i=0;i<14;i++){const mesh=MeshBuilder.CreatePlane('feather',{width:.07,height:.18,sideOrientation:Mesh.DOUBLESIDE},this.scene);mesh.material=this.materials.cream;mesh.position=a.root.position.add(new Vector3(0,.6,0));mesh.position.z-=.1;this.particles.push({mesh,velocity:new Vector3(Math.sin(i*2.4)*1.2,.8+(i%4)*.3,-.3),age:0});}}
  render(dt:number){
    if(!this.ready||!this.level)return;this.elapsed+=dt;
    const running=!this.core.paused;const sway=this.core.aimSway();
    const dir=new Vector3(Math.sin(this.yaw+sway.x)*Math.cos(this.pitch+sway.y),Math.sin(this.pitch+sway.y),Math.cos(this.yaw+sway.x)*Math.cos(this.pitch+sway.y));
    this.camera.setTarget(this.camera.position.add(dir));this.scopeCamera.position.copyFrom(this.camera.position);this.scopeCamera.setTarget(this.camera.position.add(dir));
    this.scopeCamera.fov=scopeFov(this.camera.fov,this.engine.getRenderHeight(),this.diameter,this.magnification);
    this.scene.renderTargetsEnabled=this.ads>0&&this.level.id!==1;this.lensShader.setFloat('visible',this.ads);
    if(this.gun){this.recoil=Math.max(0,this.recoil-dt*6);const breath=Math.sin(this.core.time*1.57)*.0025;
      this.gun.position.set(this.ads?.02:.31,this.ads?-.19:-.30+breath,.80-this.recoil*.06);this.gun.rotation.set(this.recoil*.04,-.05,-.025);
      this.gun.scaling.setAll(.7);
    }
    for(const a of this.actors){
      const t=this.core.target(a.id);if(!t)continue;
      const m=a.bird.material as StandardMaterial;
      a.root.position.x=t.x;a.station.position.x=t.x;a.targetRoot.position.x=t.x;a.targetRoot.position.y=t.y;
      a.root.position.y=1.47+Math.sin(this.core.time*2+a.id.charCodeAt(2))*.012;a.root.rotation.z=a.code==='fool'&&t.ability?Math.sin(this.core.time*5)*.12*this.level.abilityIntensity:Math.sin(this.core.time*.8)*.008;
      a.root.scaling.set(1,1+Math.sin(this.core.time*1.9)*.006,1);
      if(a.hinge){a.hinge.rotationQuaternion=null;a.hinge.rotation.x=t.solved?-Math.min(1,(this.core.time-t.solvedAt)*5)*1.4:0;}
      if(t.solved){
        const age=this.core.time-t.solvedAt;const f=clamp((age-.18)/.65,0,1);
        a.root.position.y=1.47*(1-f)+Math.sin(f*Math.PI)*.13;
        a.root.position.x=t.baseX+(age>1?Math.sin((age-1)*.6+t.baseX)*.28:Math.sin(f*Math.PI)*.14);
        a.root.rotation.z=age<1?Math.sin(f*Math.PI*5)*.1:Math.sin(age*5)*.015;
        a.root.scaling.y=age>.85&&age<1.15?.92:1;
        m.diffuseTexture=a.card;
        a.targetRoot.rotation.x=Math.sin(Math.min(age,2)*6)*.25*Math.max(0,1-age/2);a.targetRoot.position.y=t.y-.05;
        a.bird.position.y=a.cardY+(age>1.6?Math.sin(age*3)*.018:0);
      }else if(t.penaltyUntil){const p=1-t.penaltyUntil/1.8;a.root.position.y=1.47+Math.sin(p*Math.PI)*1.2;a.root.position.x=t.baseX+Math.sin(p*Math.PI*2)*.4;a.root.rotation.z=Math.sin(p*Math.PI*10)*.15;m.diffuseTexture=a.card;a.bird.position.y=a.cardY;
      }else {m.diffuseTexture=a.perch;a.bird.position.y=a.perchY;}
      a.halo.setEnabled(!t.solved&&!t.penaltyUntil&&((a.code==='professor'&&this.core.professorActive)||(a.code==='glamour'&&this.core.sensory==='glamour')));a.halo.rotation.z=this.core.time*.9;a.halo.scaling.setAll(1+Math.sin(this.core.time*3)*.035);
    }
    if(this.core.shot){this.bullet.setEnabled(true);this.bullet.position.copyFromFloats(this.core.shot.point.x,this.core.shot.point.y,this.core.shot.point.z);}else this.bullet.setEnabled(false);
    if(running){for(const p of this.particles){p.age+=dt;p.velocity.y-=dt*1.2;p.mesh.position.addInPlace(p.velocity.scale(dt));p.mesh.rotation.z+=dt*2;if(p.age>2)p.mesh.dispose();}this.particles=this.particles.filter(p=>p.age<2);for(const n of this.environment.getChildTransformNodes())if(n.metadata?.windmill)n.rotation.z+=dt*.35;}
    this.scene.render();this.weaponScene.render();if(this.ads&&this.level.id!==1)this.overlay.render();
  }
  currentShotRay(){const s=this.core.aimSway(),yaw=this.yaw+s.x,pitch=this.pitch+s.y;return {origin:{x:this.camera.position.x,y:this.camera.position.y,z:this.camera.position.z},direction:{x:Math.sin(yaw)*Math.cos(pitch),y:Math.sin(pitch),z:Math.cos(yaw)*Math.cos(pitch)}};}
  project(id:string){const p=this.targetWorldPoint(id);if(!p)return null;const pos=Vector3.Project(p,Matrix.Identity(),this.scene.getTransformMatrix(),this.camera.viewport.toGlobal(this.engine.getRenderWidth(),this.engine.getRenderHeight()));return {x:pos.x/this.engine.getRenderWidth()*this.canvas.clientWidth,y:pos.y/this.engine.getRenderHeight()*this.canvas.clientHeight};}
}
