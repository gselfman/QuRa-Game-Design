import {
  Engine,Scene,FreeCamera,Camera,Vector3,Color3,Color4,HemisphericLight,DirectionalLight,
  MeshBuilder,Mesh,TransformNode,StandardMaterial,PBRMaterial,DynamicTexture,Texture,
  ShadowGenerator,SceneLoader,AssetContainer,RenderTargetTexture,ShaderMaterial,Effect,Matrix,
  HDRCubeTexture,Vector4,VertexData,Vector2,Viewport,PointLight,Quaternion,
} from '@babylonjs/core';
import '@babylonjs/loaders/glTF';
import {scopeFov,clamp} from './game.mjs';
import {CharacterRig} from './character';
import {henMotion,groundMotions} from './hen-motion.mjs';
import {dressLocation,makeDetailedWindmill,buildOpenStable} from './location-details';
import {WEAPON_SOUNDS} from './audio';

type Actor={root:TransformNode,bird:Mesh,rig:CharacterRig,station:TransformNode,hinge:TransformNode|null,target:Mesh,targetRoot:TransformNode,halo:Mesh,card:Texture,perch:Texture,id:string,code:string,groundX:number,perchY:number,cardY:number,landed:boolean,lastCluck:number};
const FOOT_ANCHORS:Record<string,number[]>={ryaba:[623,670],fool:[594,664],professor:[601,653],fighter:[614,663],glamour:[599,689]};
const C=(s:string)=>Color3.FromHexString(s);
export class World {
  private glContext:WebGLRenderingContext|WebGL2RenderingContext;
  engine:Engine;scene:Scene;camera:FreeCamera;scopeCamera:FreeCamera;scope!:RenderTargetTexture;scopeStatus={mode:'independent-world-list',frames:0,contextRestores:0};
  overlay:Scene;lens:Mesh;lensShader:ShaderMaterial;weaponScene:Scene;weaponCamera:FreeCamera;
  environment:TransformNode;actors:Actor[]=[];guns:Record<string,TransformNode>={};gun:TransformNode|null=null;
  stationContainer:AssetContainer|null=null;shadow:ShadowGenerator;sun:DirectionalLight;
  materials:Record<string,any>={};textures:Record<string,Texture>={};diameter=300;yaw=0;pitch=-.05;recoil=0;ads=0;magnification=1;
  particles:any[]=[];level:any;core:any;ready=false;menu=true;elapsed=0;bullet:Mesh;
  levelMaterials:any[]=[];buildingEnvironment=false;
  onFrame:((dt:number)=>void)|null=null;resizeObserver:ResizeObserver;low=false;
  onReaction:((name:string,code?:string)=>void)|null=null;bulbs:Mesh[]=[];detailRoot:TransformNode|null=null;
  rigRecipes:any={};sky:Mesh|null=null;skyLight:HDRCubeTexture|null=null;weaponCycle=100;weaponProfile='airgun';casingEjected=true;casings:any[]=[];
  constructor(public canvas:HTMLCanvasElement){
    this.engine=new Engine(canvas,true,{preserveDrawingBuffer:true,stencil:true,alpha:false,powerPreference:'high-performance'});
    this.glContext=(canvas.getContext('webgl2')||canvas.getContext('webgl')) as WebGLRenderingContext|WebGL2RenderingContext;
    this.engine.setHardwareScalingLevel(1/Math.min(window.devicePixelRatio||1,1.5));
    this.scene=new Scene(this.engine);this.scene.clearColor=new Color4(.66,.78,.83,1);
    this.scene.ambientColor=new Color3(.35,.32,.25);
    this.scene.fogMode=Scene.FOGMODE_EXP2;this.scene.fogDensity=.00028;this.scene.fogColor=new Color3(.76,.83,.82);
    this.camera=new FreeCamera('world-camera',new Vector3(0,1.5,0),this.scene);this.camera.minZ=.05;this.camera.maxZ=3600;this.camera.fov=50*Math.PI/180;this.camera.fovMode=Camera.FOVMODE_VERTICAL_FIXED;
    this.camera.setTarget(new Vector3(0,.88,10));this.scene.activeCamera=this.camera;
    this.scopeCamera=new FreeCamera('scope-camera',this.camera.position.clone(),this.scene);this.scopeCamera.minZ=.05;this.scopeCamera.maxZ=3600;this.scopeCamera.fovMode=Camera.FOVMODE_VERTICAL_FIXED;
    const hemi=new HemisphericLight('sky-light',new Vector3(.2,1,-.3),this.scene);hemi.intensity=.78;hemi.groundColor=C('#8a7952');
    this.sun=new DirectionalLight('sun',new Vector3(-.45,-1,.35),this.scene);this.sun.position=new Vector3(15,30,-15);this.sun.intensity=2.5;this.sun.diffuse=C('#ffdfac');
    this.shadow=new ShadowGenerator(1024,this.sun);this.shadow.useBlurExponentialShadowMap=true;this.shadow.blurKernel=12;this.shadow.darkness=.18;
    this.materials.wood=this.woodMaterial('oak','#9b663c');this.materials.darkWood=this.woodMaterial('walnut','#553a29');this.materials.floor=this.photoMaterial('worn-floor','ref-floor');this.materials.floor.albedoColor=new Color3(1.1,1,.85);this.materials.cream=this.mat('cream','#f4e5c6');this.materials.red=this.mat('red','#b7533d');this.materials.gold=this.mat('gold','#ddb86a',.55,.35);this.materials.metal=this.mat('metal','#3e4645',.7,.33);this.materials.green=this.mat('green','#658353');
    this.materials.feather=this.featherMaterial();this.materials.clothCream=this.clothMaterial('canvas-cream','#e9ddc4');this.materials.clothRed=this.clothMaterial('canvas-red','#b75c46');
    this.environment=new TransformNode('environment',this.scene);
    this.replaceScopeTarget(768);
    this.overlay=new Scene(this.engine);this.overlay.autoClear=false;this.overlay.autoClearDepthAndStencil=true;
    const ortho=new FreeCamera('lens-composite',new Vector3(0,0,-10),this.overlay);ortho.mode=Camera.ORTHOGRAPHIC_CAMERA;ortho.setTarget(Vector3.Zero());this.overlay.activeCamera=ortho;
    Effect.ShadersStore.ksLensVertexShader='precision highp float;attribute vec3 position;attribute vec2 uv;uniform mat4 worldViewProjection;varying vec2 vUV;void main(){vUV=uv;gl_Position=worldViewProjection*vec4(position,1.0);}';
    Effect.ShadersStore.ksLensFragmentShader=`precision highp float;varying vec2 vUV;uniform sampler2D lensView;uniform float visible,time,fieldRadius;uniform vec2 fieldCenter;void main(){float d=length(vUV-0.5)*2.0;if(d>1.0||visible<0.01)discard;vec2 uv=vUV;if(fieldRadius>0.0001){vec2 delta=uv-fieldCenter;float r=length(delta)/max(.001,fieldRadius);float mask=(1.0-smoothstep(.6,1.0,r))*smoothstep(.08,.28,r)*step(.001,fieldRadius);uv+=vec2(-delta.y,delta.x)*sin(time*2.0+r*8.0)*.095*mask;uv+=normalize(delta+vec2(.00001))*sin(r*18.0-time*3.0)*fieldRadius*.018*mask;}vec3 col=texture2D(lensView,clamp(uv,vec2(0.001),vec2(0.999))).rgb;float edge=smoothstep(0.82,1.0,d);col*=1.0-edge*0.13;gl_FragColor=vec4(col,visible);}`;
    this.lensShader=new ShaderMaterial('lens-compositor',this.overlay,{vertex:'ksLens',fragment:'ksLens'},{attributes:['position','uv'],uniforms:['worldViewProjection','visible','time','fieldRadius','fieldCenter'],samplers:['lensView'],needAlphaBlending:true});this.lensShader.setTexture('lensView',this.scope);this.lensShader.setFloat('visible',0);this.lensShader.setFloat('fieldRadius',0);this.lensShader.setVector2('fieldCenter',Vector2.Zero());this.lensShader.backFaceCulling=false;this.lensShader.disableDepthWrite=true;
    this.lens=MeshBuilder.CreatePlane('round-lens',{size:1},this.overlay);this.lens.material=this.lensShader;this.lens.isPickable=false;
    this.weaponScene=new Scene(this.engine);this.weaponScene.autoClear=false;this.weaponScene.autoClearDepthAndStencil=true;
    this.weaponCamera=new FreeCamera('hands-camera',Vector3.Zero(),this.weaponScene);this.weaponCamera.setTarget(new Vector3(0,0,1));this.weaponCamera.minZ=.01;this.weaponCamera.fov=.95;this.weaponScene.activeCamera=this.weaponCamera;
    const gunlight=new HemisphericLight('gun-sky',new Vector3(0,1,-1),this.weaponScene);gunlight.intensity=.95;gunlight.groundColor=C('#5c5143');const key=new DirectionalLight('gun-key',new Vector3(-1,-1,1),this.weaponScene);key.intensity=2.2;key.diffuse=C('#ffe2ae');
    this.bullet=MeshBuilder.CreateSphere('capsule',{diameter:.025,segments:6},this.scene);this.bullet.material=this.mat('capsule','#ffd785',.15,.4);this.bullet.setEnabled(false);
    this.engine.onContextRestoredObservable.add(()=>{this.scopeStatus.contextRestores++;this.replaceScopeTarget(this.scope.getSize().width);this.resize();});
    this.resizeObserver=new ResizeObserver(()=>this.resize());this.resizeObserver.observe(canvas);this.resize();
  }
  private replaceScopeTarget(resolution:number){
    const previous=this.scope;
    if(previous){const index=this.scene.customRenderTargets.indexOf(previous);if(index>=0)this.scene.customRenderTargets.splice(index,1);previous.dispose();}
    const target=new RenderTargetTexture('scope-view',{width:resolution,height:resolution},this.scene,false,false,0,false,Texture.BILINEAR_SAMPLINGMODE);
    target.activeCamera=this.scopeCamera;target.ignoreCameraViewport=true;
    // The primary camera's cached active list can be empty/stale. Build optics
    // from the live world, including newly spawned targets, every single pass.
    target.renderList=[];target.getCustomRenderList=()=>this.scene.meshes;target.forceLayerMaskCheck=true;
    target.onAfterRenderObservable.add(()=>this.scopeStatus.frames++);
    this.scope=target;this.scene.customRenderTargets.push(target);this.lensShader?.setTexture('lensView',target);
    if(previous)this.engine.wipeCaches(true);
  }
  mat(name:string,hex:string,metallic=0,roughness=.85,scene=this.scene){const m=new PBRMaterial(name,scene);m.albedoColor=C(hex).toLinearSpace();m.metallic=metallic;m.roughness=roughness;m.environmentIntensity=.7;if(this.buildingEnvironment)this.levelMaterials.push(m);return m;}
  woodMaterial(name:string,hex:string){
    const m=this.photoMaterial(name,'ref-wall');m.albedoColor=name==='walnut'?new Color3(.49,.35,.24):new Color3(.97,.83,.64);return m;
  }
  clothMaterial(name:string,hex:string){
    const m=this.mat(name,hex,0,.97),t=new DynamicTexture(name+'-weave',{width:128,height:128},this.scene,false),ctx=t.getContext();
    ctx.fillStyle='#e8e2d6';ctx.fillRect(0,0,128,128);
    for(let i=0;i<128;i+=2){ctx.strokeStyle=i%4?'#c6c0b4':'#ffffff';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(i,0);ctx.lineTo(i,128);ctx.moveTo(0,i);ctx.lineTo(128,i);ctx.stroke();}
    t.update();t.uScale=12;t.vScale=12;m.albedoTexture=t;return m;
  }
  photoMaterial(name:string,type:string,u=1,v=1){
    const m=this.mat(name,'#ffffff',0,1);
    const map=(suffix:string,linear=false)=>{const t=new Texture(`/assets/materials/${type}-${suffix}.webp`,this.scene);t.uScale=u;t.vScale=v;t.anisotropicFilteringLevel=8;t.gammaSpace=!linear;return t;};
    const albedo=type==='ref-grass'?new Texture('/assets/materials/meadow-albedo-v1.png',this.scene):map('color');albedo.uScale=u;albedo.vScale=v;albedo.anisotropicFilteringLevel=8;m.albedoTexture=albedo;m.bumpTexture=map('normal',true);m.bumpTexture.level=.65;m.invertNormalMapX=true;m.invertNormalMapY=true;
    m.metallicTexture=map('orm',true);m.useAmbientOcclusionFromMetallicTextureRed=true;m.useRoughnessFromMetallicTextureAlpha=false;m.useRoughnessFromMetallicTextureGreen=true;m.useMetallnessFromMetallicTextureBlue=true;return m;
  }
  box(name:string,pos:number[],scale:number[],mat:any,parent=this.environment){const [w,h,d]=scale,uv=(a:number,b:number)=>new Vector4(0,0,a/2,b/2);const m=MeshBuilder.CreateBox(name,{width:w,height:h,depth:d,faceUV:[uv(w,h),uv(w,h),uv(d,h),uv(d,h),uv(w,d),uv(w,d)]},this.scene);m.position.set(pos[0],pos[1],pos[2]);m.material=mat;m.parent=parent;m.receiveShadows=true;return m;}
  async load(onProgress:(n:number)=>void){
    this.rigRecipes=await fetch('/assets/rigs/rigs.json').then(r=>r.json());
    await Promise.all(Object.values(this.rigRecipes).flatMap((r:any)=>r.layers).map(async (l:any)=>{this.textures[l.url]=await new Promise<Texture>((resolve,reject)=>{const t=new Texture(l.url,this.scene,false,true,Texture.TRILINEAR_SAMPLINGMODE,()=>resolve(t),(_,e)=>reject(e));t.hasAlpha=true;});}));
    const woodland=await new Promise<Texture>((resolve,reject)=>{const t=new Texture('/assets/materials/woodland-panorama-v1.png',this.scene,false,true,Texture.TRILINEAR_SAMPLINGMODE,()=>resolve(t),(_,e)=>reject(e));});
    Effect.ShadersStore.ksBackdropVertexShader=Effect.ShadersStore.ksLensVertexShader;
    Effect.ShadersStore.ksBackdropFragmentShader='precision highp float;varying vec2 vUV;uniform sampler2D backdropView;void main(){gl_FragColor=texture2D(backdropView,vUV);}';
    this.sky=MeshBuilder.CreatePlane('woodland-distant-backdrop',{width:7400,height:3700},this.scene);this.sky.position.set(0,100,3100);this.sky.isPickable=false;
    const backdrop=new ShaderMaterial('woodland-distant-backdrop-material',this.scene,{vertex:'ksBackdrop',fragment:'ksBackdrop'},{attributes:['position','uv'],uniforms:['worldViewProjection'],samplers:['backdropView']});backdrop.setTexture('backdropView',woodland);this.sky.material=backdrop;this.sky.setEnabled(false);
    await Promise.all(['/assets/materials/meadow-albedo-v1.png','/assets/foliage/meadow-flowers-v1.png','/assets/foliage/oak-v1.png','/assets/posters/poultry-yard-promo-figma.png','/assets/materials/dry-hay-v1.png','/assets/stable/horse-chestnut-v1.png'].map(async url=>{this.textures[url]=await new Promise<Texture>((resolve,reject)=>{const t=new Texture(url,this.scene,false,true,Texture.TRILINEAR_SAMPLINGMODE,()=>resolve(t),(_,e)=>reject(e));});}));

    this.skyLight=new HDRCubeTexture('/assets/materials/sky-light.hdr',this.scene,128,false,true,false,true);
    this.scene.environmentTexture=this.skyLight;this.scene.environmentIntensity=.55;this.weaponScene.environmentTexture=this.skyLight;this.weaponScene.environmentIntensity=.75;
    const codes=['ryaba','fool','professor','fighter','glamour'];let done=0;
    await Promise.all(codes.flatMap(code=>['perch','card'].map(async pose=>{const t=await new Promise<Texture>((resolve,reject)=>{const tex=new Texture(`/assets/characters/${code}/${pose}.webp`,this.scene,false,true,Texture.TRILINEAR_SAMPLINGMODE,()=>resolve(tex),(_,e)=>reject(e));tex.hasAlpha=true;});this.textures[`${code}-${pose}`]=t;onProgress(++done/16);})));
    this.stationContainer=await SceneLoader.LoadAssetContainerAsync('/assets/models/v03/','ks-target-station.glb',this.scene);onProgress(++done/16);
    for(const mesh of this.stationContainer.meshes)if(mesh.material?.name.includes('Honey oak'))mesh.material=this.materials.wood;
    const walnut=await new Promise<Texture>((resolve,reject)=>{const t=new Texture('/assets/materials/rifle-walnut-v1.png',this.weaponScene,false,true,Texture.TRILINEAR_SAMPLINGMODE,()=>resolve(t),(_,e)=>reject(e));});walnut.anisotropicFilteringLevel=8;
    const micro=new DynamicTexture('brushed-metal-microdetail',{width:256,height:256},this.weaponScene,false),ctx=micro.getContext() as CanvasRenderingContext2D,im=ctx.createImageData(256,256);
    for(let y=0;y<256;y++)for(let x=0;x<256;x++){const i=(y*256+x)*4,nx=Math.sin(x*.53+Math.sin(y*.025))*.055,ny=Math.cos(y*.31)*.015;im.data[i]=128+nx*127;im.data[i+1]=128+ny*127;im.data[i+2]=255;im.data[i+3]=255;}ctx.putImageData(im,0,0);micro.update();micro.gammaSpace=false;
    await Promise.all(['airgun','sport','sniper','precision','final'].map(async family=>{
      const container=await SceneLoader.LoadAssetContainerAsync('/assets/models/v03/',`ks-rifle-${family}.glb`,this.weaponScene);container.addAllToScene();
      for(const m of container.materials)if(m instanceof PBRMaterial){m.environmentIntensity=1;
        if(m.name.includes('walnut')||m.name.includes('Walnut')){m.albedoTexture=walnut;m.albedoColor=Color3.White();m.bumpTexture=micro;m.bumpTexture.level=.12;m.clearCoat.isEnabled=true;m.clearCoat.intensity=.26;m.clearCoat.roughness=.22;m.roughness=.38;}
        else if(m.name.includes('glass')){m.roughness=.09;m.clearCoat.isEnabled=true;m.clearCoat.intensity=1;m.clearCoat.roughness=.05;}
        else if((m.metallic??0)>.5){m.bumpTexture=micro;m.bumpTexture.level=.14;m.roughness=Math.max(.22,m.roughness??.3);}
      }
      const root=new TransformNode('gun-'+family,this.weaponScene);for(const r of container.rootNodes)r.parent=root;
      for(const mesh of root.getChildMeshes())if(['bolt','bolt_handle','bolt_knob'].includes(mesh.name)){mesh.metadata={...mesh.metadata,boltRest:{position:mesh.position.clone(),rotation:mesh.rotationQuaternion?.clone()??Quaternion.FromEulerAngles(mesh.rotation.x,mesh.rotation.y,mesh.rotation.z)}};}
      root.setEnabled(false);this.guns[family]=root;onProgress(++done/16);
    }));

    await Promise.all(this.weaponScene.meshes.filter(m=>m.material instanceof PBRMaterial).map(m=>m.material!.forceCompilationAsync(m)));
    this.ready=true;
    this.engine.runRenderLoop(()=>{if(document.hidden||this.glContext.isContextLost())return;const dt=Math.min(this.engine.getDeltaTime()/1000,.05);this.onFrame?.(dt);this.render(dt);});
  }
  setup(level:any,loadout:any,core:any,menu=false){
    this.level=level;this.core=core;this.menu=menu;this.yaw=0;this.pitch=Math.atan2(.88-1.5,level.distanceM);this.magnification=loadout.maxMagnification;this.recoil=0;this.ads=0;this.weaponCycle=100;this.casingEjected=true;this.weaponProfile=loadout.id==='classic_bolt'?'classic':loadout.family;this.casings.forEach(c=>c.mesh.dispose());this.casings=[];
    // The distant optic needs a suitable near plane to retain depth precision
    // on a 24-bit mobile depth buffer (otherwise 1-km balloons self-intersect).
    this.scopeCamera.minZ=Math.max(.1,level.distanceM*.04);
    this.bulbs=[];this.environment.dispose(false,false);this.levelMaterials.forEach(m=>m.dispose());this.levelMaterials=[];this.environment=new TransformNode('environment',this.scene);this.particles.forEach(p=>p.mesh.dispose());this.particles=[];this.buildingEnvironment=true;this.buildEnvironment(level);this.buildingEnvironment=false;
    Object.values(this.guns).forEach(g=>g.setEnabled(false));this.gun=this.guns[loadout.family]||this.guns.airgun;if(this.gun){this.gun.setEnabled(true);this.gun.scaling.setAll(.7);}
    this.camera.position.set(0,1.5,0);this.sun.position.set(15,30,level.distanceM-18);this.shadow.getShadowMap()!.renderList=[];
  }
  buildEnvironment(level:any){
    const d=level.distanceM,indoor=level.id<=2;
    this.sky?.setEnabled(level.id!==1);this.scene.environmentIntensity=indoor?.4:.65;
    this.scene.clearColor=indoor?new Color4(.29,.24,.18,1):new Color4(.65,.79,.86,1);this.scene.fogDensity=indoor?0:level.id>=9?.00008:.00016;
    this.sun.intensity=level.id===2?1.65:indoor?1.3:1.25;this.sun.diffuse=C(level.id===9?'#ffce98':'#ffe1b1');
    if(level.id===2){buildOpenStable(this,level);}else if(indoor){
      const w=13;if(level.id===1){this.scatterHay(d);this.advertPoster(d);}for(let x=-w/2;x<w/2;x+=.65){this.box('back-plank',[x,2.1,d+.75],[.64,4.2,.14],x%1>.2?this.materials.wood:this.materials.darkWood);}
      const floor=MeshBuilder.CreateGround('weathered-floor',{width:w,height:d+2},this.scene);floor.parent=this.environment;floor.position.set(0,0,d/2);floor.material=this.materials.floor;floor.receiveShadows=true;
      for(const t of [this.materials.floor.albedoTexture,this.materials.floor.bumpTexture,this.materials.floor.metallicTexture]){t.uScale=w/3;t.vScale=(d+2)/3;}
      this.box('rear-crossbeam',[0,3.45,d+.52],[13,.26,.3],this.materials.darkWood);
      this.box('target-backdrop',[0,1.8,d+.60],[9.2,3.05,.04],this.materials.darkWood);
      for(const x of [-4.65,4.65])this.box('backdrop-gold-trim',[x,1.8,d+.54],[.045,3.12,.035],this.materials.gold);
      const sign=MeshBuilder.CreatePlane('fairground-sign',{width:3.25,height:.5},this.scene);sign.parent=this.environment;sign.position.set(0,3.88,d+.46);const signTex=new DynamicTexture('sign',{width:1024,height:160},this.scene,false);const sx=signTex.getContext() as CanvasRenderingContext2D;sx.fillStyle='#334438';sx.fillRect(0,0,1024,160);sx.strokeStyle='#cbb27e';sx.lineWidth=3;sx.strokeRect(8,8,1008,144);sx.fillStyle='#f2d79d';sx.textAlign='center';sx.font='bold 57px Onest';sx.fillText('QuRa  /  ДОБРЫЙ ТИР',512,100);signTex.update();const sm=new StandardMaterial('sign-mat',this.scene);sm.diffuseTexture=signTex;sm.emissiveColor=new Color3(.25,.25,.25);sign.material=sm;this.levelMaterials.push(sm);
      for(const x of [-6.2,6.2]){this.box('side-pillar',[x,2.25,d-1],[.3,4.5,.35],this.materials.darkWood);this.box('side-wall',[x,1.4,d/2],[.15,2.8,d],this.materials.wood);}
      const awningZ=Math.min(6,d-1);for(let x=-6.3;x<=6;x+=.65){const fabric=Math.round(x/.65)%2?this.materials.clothCream:this.materials.clothRed;
        const a=MeshBuilder.CreateGround('curved-canvas-awning',{width:.65,height:2,subdivisions:12,updatable:true},this.scene);const p=a.getVerticesData('position')!;for(let i=0;i<p.length;i+=3)p[i+1]=-.18*Math.sin((p[i+2]+1)*Math.PI/2);a.updateVerticesData('position',p);a.refreshBoundingInfo();a.parent=this.environment;a.position.set(x,3.7,awningZ);a.material=fabric;(fabric as PBRMaterial).backFaceCulling=false;
        this.box('awning-valance',[x,3.48,awningZ-1],[.65,.4,.045],fabric);
        const hem=MeshBuilder.CreateCylinder('rounded-fabric-hem',{height:.65,diameter:.08,tessellation:12},this.scene);hem.parent=this.environment;hem.position.set(x,3.28,awningZ-1);hem.rotation.z=Math.PI/2;hem.material=fabric;
      }
      for(const x of [-3.5,3.5]){const light=new PointLight('warm-fairground-lamp',new Vector3(x,3.2,d-.6),this.scene);light.parent=this.environment;light.diffuse=C('#ffd298');light.intensity=7;light.range=6;light.metadata={twinkle:true,phase:x};}
      for(let x=-5.6;x<6;x+=1.4){const bulb=MeshBuilder.CreateSphere('warm-bulb',{diameter:.12,segments:8},this.scene);bulb.position.set(x,3.08-Math.sin((x+5.6)/11.2*Math.PI)*.09,awningZ-1.08);bulb.parent=this.environment;const m=new StandardMaterial('bulb',this.scene);m.emissiveColor=C('#ffcb73');bulb.material=m;bulb.metadata={phase:x*.75};this.bulbs.push(bulb);this.levelMaterials.push(m);}
      const cable=MeshBuilder.CreateLines('festoon-cable',{points:Array.from({length:33},(_,i)=>{const x=-5.7+i*11.4/32;return new Vector3(x,3.26-Math.sin(i/32*Math.PI)*.09,awningZ-1.08);})},this.scene);cable.parent=this.environment;cable.color=C('#514433');
      this.box('counter',[0,.52,1.05],[13,.15,.7],this.materials.darkWood);
      for(const x of [-5.2,5.2]){const barrel=MeshBuilder.CreateCylinder('seed-barrel',{height:.8,diameterTop:.55,diameterBottom:.63,tessellation:16},this.scene);barrel.parent=this.environment;barrel.position.set(x,.4,d-1);barrel.material=this.materials.wood;for(const y of [.15,.65]){const band=MeshBuilder.CreateTorus('barrel-band',{diameter:.60,thickness:.045,tessellation:24},this.scene);band.parent=this.environment;band.position.set(x,y,d-1);band.material=this.materials.metal;}}
    }else{
      const ground=MeshBuilder.CreateGround('meadow',{width:3200,height:3600,subdivisions:1},this.scene);ground.position.z=1500;ground.material=this.photoMaterial('meadow-scan','ref-grass',3200,3600);ground.parent=this.environment;ground.receiveShadows=true;this.grassClumps(d);this.forestCards(d);
      this.box('shooting-table',[0,.86,2.4],[3,.12,1.2],this.materials.darkWood);
      for(const x of [-3.8,3.8]){this.box('target-beam',[x,.16,d],[.18,.32,12],this.materials.darkWood);}

      for(let x=-10;x<=10;x+=2){this.box('fence-post',[x,.55,d+3],[.12,1.1,.12],this.materials.darkWood);}
      for(const y of [.35,.75])this.box('fence-rail',[0,y,d+3],[23,.08,.07],this.materials.wood);
      const pole=this.box('windsock-pole',[-5,1.7,d-1],[.06,3.4,.06],this.materials.metal);
      const sock=MeshBuilder.CreateCylinder('windsock',{height:1.1,diameterTop:.15,diameterBottom:.32,tessellation:12},this.scene);sock.parent=this.environment;sock.position.set(-4.5,3.1,d-1);sock.rotation.z=-Math.PI/2;sock.material=this.materials.red;pole.isPickable=false;

      if([6,8,9].includes(level.id))this.windmill(-18,d+30);
      if(level.id===9){for(const x of [-3.8,3.8])this.box('terrace-pillar',[x,2.6,1.5],[.3,5.2,.3],this.materials.darkWood);this.box('terrace-roof',[0,4.3,1],[8.5,.24,4],this.materials.wood);}

    }
    this.detailRoot=dressLocation(this,level);
  }
  advertPoster(distance:number){
    // A small paper poster on the inner right wall, outside the target backdrop.
    const w=.80,h=w*941/1672;
    const mount=new TransformNode('poultry-yard-side-wall-mount',this.scene);mount.parent=this.environment;mount.position.set(6.11,1.95,distance-.40);mount.rotation.y=Math.PI/2;
    const poster=MeshBuilder.CreatePlane('poultry-yard-original-figma-poster',{width:w,height:h},this.scene);poster.parent=mount;poster.isPickable=false;
    const m=new StandardMaterial('poultry-yard-poster-material',this.scene);m.diffuseTexture=this.textures['/assets/posters/poultry-yard-promo-figma.png'];m.diffuseColor=new Color3(.62,.60,.55);m.emissiveColor=Color3.Black();m.specularColor=Color3.Black();poster.material=m;this.levelMaterials.push(m);
    for(const side of [-1,1])this.box('poster-oak-frame',[side*(w/2+.015),0,-.012],[.03,h+.06,.025],this.materials.darkWood,mount);
    for(const side of [-1,1])this.box('poster-oak-frame',[0,side*(h/2+.015),-.012],[w+.06,.03,.025],this.materials.darkWood,mount);
  }
  scatterHay(distance:number){
    const mask=new DynamicTexture('hay-patch-opacity',{width:256,height:256},this.scene,false),mc=mask.getContext() as CanvasRenderingContext2D;mc.clearRect(0,0,256,256);const gradient=mc.createRadialGradient(128,128,42,128,128,126);gradient.addColorStop(0,'rgba(255,255,255,.98)');gradient.addColorStop(.65,'rgba(255,255,255,.85)');gradient.addColorStop(1,'rgba(255,255,255,0)');mc.fillStyle=gradient;mc.fillRect(0,0,256,256);mask.update();mask.hasAlpha=true;
    const material=this.mat('loose-hay-beds','#ffffff',0,1);const texture=this.textures['/assets/materials/dry-hay-v1.png'].clone();texture.uScale=3.5;texture.vScale=2.0;material.albedoTexture=texture;material.opacityTexture=mask;material.transparencyMode=2;material.backFaceCulling=false;
    for(let i=0;i<7;i++){const patch=MeshBuilder.CreateGround('loose-hay-patch',{width:i<5?3.2:2.5,height:2.2},this.scene);patch.parent=this.environment;patch.position.set(i<5?(i-2)*2.3:i%2?-4.6:4.6,.018,distance-(i<5?.8:4.0));patch.rotation.y=Math.sin(i*2.4)*.18;patch.material=material;patch.receiveShadows=true;patch.isPickable=false;}
    const positions:number[]=[],indices:number[]=[],colors:number[]=[],normals:number[]=[];
    const rand=(i:number,n:number)=>{const x=Math.sin(i*127.1+n*311.7)*43758.5453;return x-Math.floor(x);};
    for(let i=0;i<2300;i++){
      let x=(rand(i,1)-.5)*11.8,z=1.7+rand(i,2)*(distance-.9),lift=0;
      if(i<1200){const side=i%2?1:-1;x=side*(3.5+rand(i,3)*2.2);z=distance-1.8+rand(i,4)*2;lift=Math.max(0,1-Math.hypot(x-side*4.5,z-(distance-.7))/1.5)*.10;}
      const angle=rand(i,5)*Math.PI*2,len=.11+rand(i,6)*.29,width=.003+rand(i,7)*.004,dx=Math.cos(angle),dz=Math.sin(angle),nx=-dz*width/2,nz=dx*width/2,b=positions.length/3;
      for(let j=0;j<4;j++){const p=j/3,yy=.012+lift+Math.sin(p*Math.PI)*(.003+rand(i,8)*.015),xx=x+dx*len*(p-.5),zz=z+dz*len*(p-.5);positions.push(xx+nx,yy,zz+nz,xx-nx,yy,zz-nz);const shade=.65+rand(i,9)*.35;for(let k=0;k<2;k++)colors.push(.80*shade,.59*shade,.25*shade,1);if(j<3){const q=b+j*2;indices.push(q,q+1,q+2,q+1,q+3,q+2);}}
    }
    VertexData.ComputeNormals(positions,indices,normals);const data=new VertexData();data.positions=positions;data.indices=indices;data.normals=normals;data.colors=colors;const mesh=new Mesh('scattered-straw-and-hay',this.scene);data.applyToMesh(mesh);mesh.parent=this.environment;mesh.material=this.mat('dry-hay','#ffffff',0,1);(mesh.material as PBRMaterial).backFaceCulling=false;mesh.receiveShadows=true;mesh.isPickable=false;
    // A few actual grains below the platforms make pecking have a visible subject.
    for(let i=0;i<42;i++){const grain=MeshBuilder.CreateSphere('scattered-seed',{diameter:.025,segments:4},this.scene);grain.scaling.set(1.35,.45,.7);grain.position.set((rand(i,11)-.5)*9,.014,distance-.25-rand(i,12)*1.5);grain.parent=this.environment;grain.material=this.materials.gold;grain.isPickable=false;}
  }
  grassClumps(distance:number){
    const positions:number[]=[],indices:number[]=[],colors:number[]=[],normals:number[]=[],uvs:number[]=[];
    for(let i=0;i<1600;i++){
      const seed=(n:number)=>{const x=Math.sin(i*127.1+n*311.7)*43758.5453;return x-Math.floor(x);};
      const x=(seed(1)-.5)*32,z=seed(2)<.65?2+seed(3)*40:distance-7+seed(3)*15;
      if(Math.abs(x)<.6&&z<6)continue;
      const h=.19+seed(4)*.22,w=h*2,angle=seed(6)*6.28;
      for(let side=0;side<2;side++){const dx=Math.cos(angle+side*Math.PI/2)*w/2,dz=Math.sin(angle+side*Math.PI/2)*w/2,b=positions.length/3;
        positions.push(x-dx,-.025,z-dz,x+dx,-.025,z+dz,x+dx,h,z+dz,x-dx,h,z-dz);uvs.push(0,0,1,0,1,1,0,1);indices.push(b,b+1,b+2,b,b+2,b+3);const shade=.78+seed(7)*.22;for(let k=0;k<4;k++)colors.push(shade,shade,shade,1);
      }
    }
    VertexData.ComputeNormals(positions,indices,normals);const data=new VertexData();data.positions=positions;data.indices=indices;data.normals=normals;data.colors=colors;data.uvs=uvs;
    const mesh=new Mesh('meadow-flowers',this.scene);data.applyToMesh(mesh);mesh.parent=this.environment;
    const material=new StandardMaterial('flowering-meadow-cutout',this.scene),tex=new Texture('/assets/foliage/meadow-flowers-v1.png',this.scene,false,true);tex.hasAlpha=true;tex.anisotropicFilteringLevel=4;material.diffuseTexture=tex;material.useAlphaFromDiffuseTexture=true;material.transparencyMode=1;material.alphaCutOff=.4;material.backFaceCulling=false;material.emissiveColor=new Color3(.15,.15,.15);material.specularColor=Color3.Black();mesh.material=material;this.levelMaterials.push(material);mesh.receiveShadows=true;mesh.metadata={detail:true};
  }
  forestCards(distance:number){
    const positions:number[]=[],indices:number[]=[],uvs:number[]=[],normals:number[]=[];
    for(let i=0;i<28;i++){const h=4.8+(i%5)*.45,w=h*.72,x=(i-13.5)*3.8,z=distance+45+(i%3)*11,b=positions.length/3;
      positions.push(x-w/2,0,z,x+w/2,0,z,x+w/2,h,z,x-w/2,h,z);uvs.push(i%2?1:0,0,i%2?0:1,0,i%2?0:1,1,i%2?1:0,1);indices.push(b,b+1,b+2,b,b+2,b+3);
    }
    VertexData.ComputeNormals(positions,indices,normals);const data=new VertexData();data.positions=positions;data.indices=indices;data.normals=normals;data.uvs=uvs;
    const mesh=new Mesh('detailed-forest',this.scene);data.applyToMesh(mesh);mesh.parent=this.environment;
    const m=new StandardMaterial('oak-foliage',this.scene);m.diffuseTexture=this.textures['/assets/foliage/oak-v1.png'];m.diffuseTexture.hasAlpha=true;m.useAlphaFromDiffuseTexture=true;m.transparencyMode=1;m.alphaCutOff=.45;m.backFaceCulling=false;m.emissiveColor=new Color3(.20,.20,.20);m.specularColor=Color3.Black();mesh.material=m;this.levelMaterials.push(m);
  }
  windmill(x:number,z:number){return makeDetailedWindmill(this,x,z);}
  setActors(targets:any[]){
    this.shadow.getShadowMap()!.renderList=[];
    for(const a of this.actors){a.rig.dispose();a.bird.material?.dispose();a.target.material?.dispose(false,true);a.halo.material?.dispose();a.root.dispose();a.station.dispose();a.targetRoot.dispose();a.halo.dispose();}this.actors=[];
    for(const t of targets){
      const inst=this.stationContainer!.instantiateModelsToScene(n=>t.id+'-'+n,false);const station=new TransformNode(t.id+'-station',this.scene);for(const r of inst.rootNodes)r.parent=station;station.position.set(t.baseX,0,this.level.distanceM+.15);
      const hinge=station.getChildTransformNodes().find(n=>n.name.includes('platform_hinge'))||null;
      const root=new TransformNode(t.id+'-bird',this.scene);root.position.set(t.baseX,1.47,this.level.distanceM-.12);
      const perchY=(FOOT_ANCHORS[t.code][0]/760-.5)*1.62,cardY=(FOOT_ANCHORS[t.code][1]/760-.5)*1.62;
      const bird=MeshBuilder.CreatePlane(t.id+'-canonical',{width:1.28,height:1.62,sideOrientation:Mesh.DOUBLESIDE},this.scene);bird.parent=root;bird.position.y=perchY;
      const m=new StandardMaterial(t.id+'-image',this.scene);m.diffuseTexture=this.textures[t.code+'-perch'];m.useAlphaFromDiffuseTexture=true;m.backFaceCulling=false;m.emissiveColor=new Color3(.45,.45,.45);m.specularColor=Color3.Black();m.transparencyMode=2;bird.material=m;bird.alphaIndex=2;
      const rig=new CharacterRig(this.scene,root,t.code,this.rigRecipes[t.code],this.textures);bird.setEnabled(false);
      const targetRoot=new TransformNode(t.id+'-disk-root',this.scene);targetRoot.position.set(t.baseX,.88,this.level.distanceM);
      const disk=MeshBuilder.CreateDisc(t.id+'-bullseye',{radius:this.level.targetDiameterM/2,tessellation:48,sideOrientation:Mesh.DOUBLESIDE},this.scene);disk.parent=targetRoot;
      const texture=new DynamicTexture(t.id+'-target-texture',{width:256,height:256},this.scene,false);const ctx=texture.getContext();
      for(const [r,c] of [[128,'#e9dfbb'],[116,'#bd4d3a'],[93,'#f8efdb'],[68,'#bd4d3a'],[40,'#f8efdb'],[22,'#ba4c39']] as [number,string][]){ctx.fillStyle=c;ctx.beginPath();ctx.arc(128,128,r,0,Math.PI*2);ctx.fill();}texture.update();
      const dm=new StandardMaterial(t.id+'-target-material',this.scene);dm.diffuseTexture=texture;dm.emissiveColor=new Color3(.32,.32,.32);dm.specularColor=new Color3(.15,.15,.15);disk.material=dm;
      const rim=MeshBuilder.CreateTorus(t.id+'-brass-ring',{diameter:this.level.targetDiameterM+.025,thickness:.024,tessellation:40},this.scene);rim.rotation.x=Math.PI/2;rim.parent=targetRoot;rim.position.z=.012;rim.material=this.materials.gold;
      const chain=MeshBuilder.CreateCylinder(t.id+'-chain',{height:.27,diameter:.018,tessellation:6},this.scene);chain.parent=targetRoot;chain.position.y=this.level.targetDiameterM/2+.12;chain.material=this.materials.metal;
      if(this.level.mode==='balloons'){
        station.setEnabled(false);disk.setEnabled(false);rim.setEnabled(false);chain.setEnabled(false);root.position.y=.03;
        const balloon=MeshBuilder.CreateSphere(t.id+'-balloon',{diameter:this.level.targetDiameterM,segments:24},this.scene);balloon.scaling.y=1.18;balloon.parent=targetRoot;
        const bm=this.mat(t.id+'-latex',({ryaba:'#e7b64b',fool:'#6dba80',professor:'#6bbdd4',fighter:'#e37d61',glamour:'#dd8bb8'} as any)[t.code],0,.24);bm.clearCoat.isEnabled=true;bm.clearCoat.intensity=.7;balloon.material=bm;
        const knot=MeshBuilder.CreateCylinder(t.id+'-balloon-knot',{diameterTop:.025,diameterBottom:.09,height:.09,tessellation:12},this.scene);knot.parent=targetRoot;knot.position.y=-this.level.targetDiameterM*.61;knot.material=bm;
        const string=MeshBuilder.CreateCylinder(t.id+'-balloon-string',{diameter:.009,height:1,tessellation:4},this.scene);string.parent=targetRoot;string.material=this.materials.cream;string.metadata={string:true};
      }
      const halo=t.code==='professor'?this.vortex(t.id):MeshBuilder.CreateTorus(t.id+'-ability-halo',{diameter:1.9,thickness:.012,tessellation:48},this.scene);
      if(t.code!=='professor'){halo.rotation.x=Math.PI/2;const hm=new StandardMaterial('halo',this.scene);hm.emissiveColor=C('#f8aad6');hm.alpha=.3;halo.material=hm;}
      halo.position.set(t.baseX,1.3,this.level.distanceM-.48);halo.setEnabled(false);
      for(const mesh of station.getChildMeshes())this.shadow.addShadowCaster(mesh);this.shadow.addShadowCaster(bird);
      this.actors.push({id:t.id,code:t.code,root,bird,rig,station,hinge,target:disk,targetRoot,halo,card:this.textures[t.code+'-card'],perch:this.textures[t.code+'-perch'],groundX:t.baseX,perchY,cardY,landed:false,lastCluck:-20});
    }
  }
  vortex(id:string){
    Effect.ShadersStore.ksFieldVertexShader=Effect.ShadersStore.ksLensVertexShader;
    Effect.ShadersStore.ksFieldFragmentShader=`precision highp float;varying vec2 vUV;uniform float time;void main(){vec2 p=(vUV-.5)*2.0;float r=length(p);if(r>1.0)discard;float a=atan(p.y,p.x);float edge=exp(-pow((r-.77)*30.0,2.0));float flow=pow(max(0.0,sin(a*5.0+r*19.0-time*3.2)),18.0);float swirl=flow*smoothstep(.12,.4,r)*(1.0-smoothstep(.72,1.0,r));float grid=pow(max(0.0,sin(a*13.0-r*12.0+time)),45.0)*exp(-pow((r-.76)*8.0,2.0));float opacity=edge*.55+swirl*.34+grid*.5;vec3 col=mix(vec3(.3,.78,.83),vec3(1.0,.79,.36),.5+.5*sin(a*2.0+time));gl_FragColor=vec4(col,opacity);}`;
    const mat=new ShaderMaterial(id+'-field',this.scene,{vertex:'ksField',fragment:'ksField'},{attributes:['position','uv'],uniforms:['worldViewProjection','time'],needAlphaBlending:true});mat.backFaceCulling=false;mat.disableDepthWrite=true;mat.setFloat('time',0);
    const mesh=MeshBuilder.CreatePlane(id+'-gravity-volume',{size:2.05,sideOrientation:Mesh.DOUBLESIDE},this.scene);mesh.material=mat;mesh.alphaIndex=1;return mesh;
  }
  setAds(value:boolean){this.clampAim();this.ads=value?1:0;this.resize();}
  resize(){
    if(this.glContext.isContextLost())return;
    this.engine.resize();const w=this.engine.getRenderWidth(),h=this.engine.getRenderHeight();this.diameter=Math.min(h*.76,w*.46);
    const camera=this.overlay.activeCamera as FreeCamera;camera.orthoLeft=-w/2;camera.orthoRight=w/2;camera.orthoTop=h/2;camera.orthoBottom=-h/2;
    this.lens.scaling.set(this.diameter,this.diameter,1);this.lens.position.set(0,0,0);
    const cssH=this.canvas.clientHeight,cssW=this.canvas.clientWidth;document.documentElement.style.setProperty('--lens',`${Math.min(cssH*.76,cssW*.46)}px`);
    const pixels=Math.ceil(Math.min(cssH*.76,cssW*.46)*Math.min(devicePixelRatio,2)/256)*256;
    const resolution=clamp(pixels,512,this.low?768:1536);
    if(this.scope.getSize().width!==resolution)this.replaceScopeTarget(resolution);
  }
  direction(){return new Vector3(Math.sin(this.yaw)*Math.cos(this.pitch),Math.sin(this.pitch),Math.cos(this.yaw)*Math.cos(this.pitch));}
  clampAim(){
    if(!this.level||!this.core?.targets.length)return;
    const d=this.level.distanceM,extra=this.level.mode==='balloons'?7:2.5;
    const xs=this.core.targets.map((t:any)=>t.baseX),lo=Math.min(...xs)-extra,hi=Math.max(...xs)+extra;
    const indoor=this.level.id<=2;this.yaw=clamp(this.yaw,Math.atan2(indoor?Math.min(-1.2,Math.min(...xs)-1.2):Math.min(-6,lo),d),Math.atan2(indoor?Math.max(1.2,Math.max(...xs)+1.2):Math.max(6,hi),d));
    this.pitch=clamp(this.pitch,Math.atan2(-.25-this.camera.position.y,d),Math.atan2(4.4-this.camera.position.y,d));
  }
  overview(){
    const targets=this.core.targets.filter((t:any)=>!t.solved&&!t.penaltyUntil);if(!targets.length)return;
    targets.sort((a:any,b:any)=>Math.abs(Math.atan2(a.x,this.level.distanceM)-this.yaw)-Math.abs(Math.atan2(b.x,this.level.distanceM)-this.yaw));
    const t=targets[0];this.yaw=Math.atan2(t.x,this.level.distanceM);this.pitch=Math.atan2((this.level.mode==='balloons'?1.35:1.6)-this.camera.position.y,this.level.distanceM);this.clampAim();
  }
  aimDelta(dx:number,dy:number,sensitivity=1){
    const scale=this.ads?1/this.magnification:Math.min(1,35/this.level.distanceM);
    const f=2*Math.tan(this.camera.fov/2)/this.canvas.clientHeight*scale*sensitivity;
    this.yaw+=dx*f;this.pitch-=dy*f;this.clampAim();
  }
  targetWorldPoint(id:string){const t=this.core.target(id);return t?new Vector3(t.x,t.y,this.level.distanceM):null;}
  scopeGuide(){
    if(!this.ads||this.level.id<2)return '';
    const points=this.core.targets.filter((t:any)=>!t.solved&&!t.penaltyUntil).map((t:any)=>{
      const p=Vector3.Project(new Vector3(t.x,t.y,this.level.distanceM),Matrix.Identity(),this.scopeCamera.getTransformationMatrix(),new Viewport(0,0,1,1));return {x:p.x-.5,y:p.y-.5};
    });
    if(!points.length||points.some((p:any)=>Math.hypot(p.x,p.y)<.43))return '';
    points.sort((a:any,b:any)=>Math.hypot(a.x,a.y)-Math.hypot(b.x,b.y));const p=points[0],angle=Math.atan2(p.y,p.x),arrows=['→','↘','↓','↙','←','↖','↑','↗'];return 'ЦЕЛЬ '+arrows[(Math.round(angle/(Math.PI/4))+8)%8];
  }
  aimAt(id:string){const p=this.targetWorldPoint(id);if(p){const v=p.subtract(this.camera.position);this.yaw=Math.atan2(v.x,v.z);this.pitch=Math.atan2(v.y,Math.hypot(v.x,v.z));}}
  fireEffect(){this.recoil=1;this.weaponCycle=0;this.casingEjected=false;}
  ejectCasing(){
    if(!this.gun)return;const mesh=MeshBuilder.CreateCylinder('ejected-cartridge-case',{height:.045,diameter:.010,tessellation:12},this.weaponScene),mat=this.weaponScene.getMaterialByName('cartridge-case-brass') as PBRMaterial||this.mat('cartridge-case-brass','#c79f4b',.85,.25,this.weaponScene);mesh.material=mat;mesh.position=this.gun.position.add(new Vector3(.05,.07,.03));mesh.rotation.z=Math.PI/2;this.casings.push({mesh,age:0,velocity:new Vector3(.45,.55,-.12)});
  }
  featherMaterial(){
    const t=new DynamicTexture('soft-feather-cutout',{width:64,height:128},this.scene,false),c=t.getContext() as CanvasRenderingContext2D;c.clearRect(0,0,64,128);
    c.fillStyle='#f3dfb7';c.beginPath();c.moveTo(32,5);c.bezierCurveTo(54,28,58,74,34,111);c.bezierCurveTo(7,81,10,32,32,5);c.fill();
    c.strokeStyle='#fff4d7';c.lineWidth=1.4;c.beginPath();c.moveTo(32,9);c.lineTo(33,123);c.stroke();
    c.strokeStyle='#c3a97f';c.lineWidth=.6;for(let y=21;y<104;y+=5){const w=Math.sin((y-5)/107*Math.PI)*18;c.beginPath();c.moveTo(32,y);c.lineTo(32-w,y-9);c.moveTo(33,y+2);c.lineTo(33+w,y-8);c.stroke();}t.update();t.hasAlpha=true;
    const m=new StandardMaterial('soft-feather-material',this.scene);m.diffuseTexture=t;m.useAlphaFromDiffuseTexture=true;m.backFaceCulling=false;m.emissiveColor=new Color3(.4,.4,.4);m.specularColor=Color3.Black();m.transparencyMode=2;return m;
  }
  featherBurst(id:string,count=14){const a=this.actors.find(a=>a.id===id);if(!a)return;
    for(let i=0;i<count;i++){const mesh=MeshBuilder.CreatePlane('floating-feather',{width:.055+(i%3)*.012,height:.15+(i%4)*.025},this.scene);mesh.material=this.materials.feather;mesh.billboardMode=Mesh.BILLBOARDMODE_ALL;mesh.isPickable=false;mesh.position=a.root.position.add(new Vector3(0,.55,-.07));this.particles.push({mesh,velocity:new Vector3(Math.sin(i*2.4+this.core.time)*.85,.6+(i%4)*.25,Math.cos(i*2.4)*.25),age:0,life:2.8+(i%3)*.3,spin:(i%2?1:-1)*(1+i%3)});}
  }
  render(dt:number){
    if(!this.ready||!this.level)return;this.elapsed+=dt;
    const running=!this.core.paused;if(this.detailRoot&&this.detailRoot.isEnabled()===this.low)this.detailRoot.setEnabled(!this.low);const sway=this.core.aimSway();
    const dir=new Vector3(Math.sin(this.yaw+sway.x)*Math.cos(this.pitch+sway.y),Math.sin(this.pitch+sway.y),Math.cos(this.yaw+sway.x)*Math.cos(this.pitch+sway.y));
    const focalPoint=this.camera.position.add(dir.scale(Math.max(10,this.level.distanceM)));
    this.camera.setTarget(focalPoint);this.scopeCamera.position.copyFrom(this.camera.position);this.scopeCamera.setTarget(focalPoint);
    this.scopeCamera.fov=scopeFov(this.camera.fov,this.engine.getRenderHeight(),this.diameter,this.magnification);
    this.lensShader.setFloat('time',this.core.time);this.lensShader.setFloat('fieldRadius',0);
    const prof=this.core.targets.find((t:any)=>t.code==='professor'&&!t.solved&&!t.penaltyUntil);
    if(prof&&this.core.professorActive&&!this.low){const p=Vector3.Project(new Vector3(prof.x,1.3,this.level.distanceM-.48),Matrix.Identity(),this.scopeCamera.getTransformationMatrix(),new Viewport(0,0,768,768));this.lensShader.setVector2('fieldCenter',new Vector2(p.x/768,1-p.y/768));this.lensShader.setFloat('fieldRadius',1.025/(this.level.distanceM*Math.tan(this.scopeCamera.fov/2)*2));}
    this.scene.renderTargetsEnabled=this.ads>0&&this.level.id!==1;this.lensShader.setFloat('visible',this.ads);
    if(this.gun){if(running)this.weaponCycle+=dt;const profile=WEAPON_SOUNDS[this.weaponProfile]||WEAPON_SOUNDS.airgun,t=this.weaponCycle-profile.bolt,pull=t<0?0:t<.12?t/.12:t<.28?1:t<.42?1-(t-.28)/.14:0;
      for(const mesh of this.gun.getChildMeshes())if(mesh.metadata?.boltRest){const rest=mesh.metadata.boltRest;mesh.position.copyFrom(rest.position);mesh.position.z-=pull*.045;mesh.rotationQuaternion=rest.rotation.multiply(Quaternion.FromEulerAngles(0,0,-Math.sin(Math.max(0,Math.min(1,t/.42))*Math.PI)*.32));}
      if(profile.casing&&!this.casingEjected&&this.weaponCycle>profile.bolt+.12){this.casingEjected=true;this.ejectCasing();}
      this.recoil=Math.max(0,this.recoil-dt*6);const breath=Math.sin(this.core.time*1.57)*.0025;
      this.gun.position.set(this.ads?.02:.31,this.ads?-.19:-.30+breath,.80-this.recoil*.06);this.gun.rotation.set(this.recoil*.04,-.05,-.025);
      this.gun.scaling.setAll(.7);
    }
    const grounded=groundMotions(this.core.targets,this.core.time);
    for(const a of this.actors){
      const t=this.core.target(a.id);if(!t)continue;const time=this.core.time,m=a.bird.material as StandardMaterial;
      a.rig.root.setEnabled(!this.low);a.bird.setEnabled(this.low);if(!t.solved&&this.level.mode!=='balloons'){a.rig.root.scaling.x=1;a.bird.scaling.x=1;}
      a.root.position.set(t.x,1.47,this.level.distanceM-.12);a.root.rotation.set(0,0,0);a.root.scaling.setAll(1);
      a.station.position.x=t.x;a.targetRoot.position.x=t.x;a.targetRoot.position.y=t.y;
      if(this.level.mode==='balloons'){
        const speed=this.core.state==='playing'?(t.velocityX??0):0;a.root.position.x=t.bodyX??t.x;a.root.position.y=.03+Math.abs(Math.sin(t.stepPhase??time*11))*.025;a.root.rotation.z=Math.sign(speed)*.035;
        a.rig.animate(time,t.penaltyUntil?'fly':this.core.state!=='playing'?'look':t.mode??'run',0,speed,t.stepPhase);a.rig.root.scaling.x=(t.facing??1)*(t.turnScale??1);a.bird.scaling.x=t.facing??1;
        if(t.penaltyUntil)a.root.position.y+=Math.sin((1-t.penaltyUntil/1.8)*Math.PI)*.65;
        a.targetRoot.setEnabled(!t.solved);a.halo.setEnabled(false);
        for(const child of a.targetRoot.getChildMeshes())if(child.metadata?.string){const vertical=t.y-this.level.targetDiameterM*.59-a.root.position.y-1.16,dx=a.root.position.x-t.x;child.scaling.y=Math.hypot(vertical,dx);child.position.set(dx/2,-this.level.targetDiameterM*.59-vertical/2,0);child.rotation.z=Math.atan2(dx,vertical);}
        continue;
      }
      const dancing=a.code==='glamour'&&this.core.sensory==='glamour'&&!t.solved&&!t.penaltyUntil;
      if(a.hinge){a.hinge.rotationQuaternion=null;a.hinge.rotation.x=t.solved?-Math.min(1,(time-t.solvedAt)*5)*1.4:0;}
      if(t.solved){
        const pose=grounded.get(t.id)??henMotion(t,time),age=time-t.solvedAt;a.root.position.set(pose.x,pose.y,this.level.distanceM+pose.z);a.root.rotation.z=pose.roll;a.root.scaling.set(1+(1-pose.squash)*.32,pose.squash,1);
        a.rig.animate(time,t.penaltyUntil?'fly':pose.mode,age,pose.speed,pose.stepPhase);if(Math.abs(pose.speed)>.03)a.rig.root.scaling.x=Math.sign(pose.speed);a.bird.scaling.x=a.rig.root.scaling.x;
        if(t.penaltyUntil)a.root.position.y+=Math.sin((1-t.penaltyUntil/1.8)*Math.PI)*.65;
        if(pose.grounded&&!a.landed){a.landed=true;this.featherBurst(a.id,3);this.onReaction?.('land',a.code);}
        if(pose.mode==='look'&&time-a.lastCluck>4.5){a.lastCluck=time;this.onReaction?.('cluck',a.code);}
        m.diffuseTexture=a.card;a.bird.position.y=a.cardY;a.targetRoot.rotation.x=Math.sin(Math.min(age,2)*6)*.25*Math.max(0,1-age/2);a.targetRoot.position.y=t.y-.05;
      }else if(t.penaltyUntil){const p=1-t.penaltyUntil/1.8;a.root.position.y=1.47+Math.sin(p*Math.PI)*1.2;a.root.position.x=t.baseX+Math.sin(p*Math.PI*2)*.4;a.root.rotation.z=Math.sin(p*Math.PI*10)*.15;a.rig.animate(time,'fly');m.diffuseTexture=a.card;a.bird.position.y=a.cardY;
      }else{
        const mode=dancing?'dance':a.code==='fool'&&t.ability?'fool':a.code==='professor'&&this.core.professorActive?'professor':a.code==='fighter'&&this.core.sensory==='water-warning'?'fighter':'idle';a.rig.animate(time,mode);
        a.root.position.y+=Math.sin(time*2+a.id.charCodeAt(2))*.006;
        if(dancing){a.root.position.x+=Math.sin(time*Math.PI*3)*.09;a.root.position.y+=.025+Math.abs(Math.sin(time*Math.PI*3))*.025;}
        m.diffuseTexture=a.perch;a.bird.position.y=a.perchY;
      }
      a.halo.setEnabled(!t.solved&&!t.penaltyUntil&&((a.code==='professor'&&this.core.professorActive)||(a.code==='glamour'&&this.core.sensory==='glamour')));a.halo.rotation.z=time*.9;a.halo.scaling.setAll(1+Math.sin(time*3)*.035);
      if(a.halo.material instanceof ShaderMaterial){a.halo.material.setFloat('time',time);a.halo.position.x=t.x;}
    }
    if(this.core.shot){this.bullet.setEnabled(true);this.bullet.position.copyFromFloats(this.core.shot.point.x,this.core.shot.point.y,this.core.shot.point.z);}else this.bullet.setEnabled(false);
    if(running){for(const p of this.particles){p.age+=dt;p.velocity.y=Math.max(-.8,p.velocity.y-dt*2.4);p.velocity.x+=(this.core.wind*.08-p.velocity.x*.35)*dt;p.mesh.position.addInPlace(p.velocity.scale(dt));p.mesh.position.y=Math.max(.025,p.mesh.position.y);p.mesh.rotation.z+=dt*p.spin;p.mesh.visibility=Math.max(0,1-p.age/p.life);if(p.age>p.life)p.mesh.dispose();}this.particles=this.particles.filter(p=>p.age<p.life);for(const n of this.environment.getChildTransformNodes())if(n.metadata?.windmill)n.rotation.z+=dt*.35;else if(n.metadata?.flutter)n.rotation.y=Math.sin(this.core.time*2+n.metadata.phase)*(.12+Math.abs(this.core.wind)*.3);}
    if(running){for(const c of this.casings){c.age+=dt;c.velocity.y-=dt*2.4;c.mesh.position.addInPlace(c.velocity.scale(dt));c.mesh.rotation.x+=dt*10;c.mesh.rotation.z+=dt*7;if(c.age>1.2)c.mesh.dispose();}this.casings=this.casings.filter(c=>c.age<=1.2);}
    for(const horse of this.environment.getChildMeshes())if(horse.metadata?.horse){horse.scaling.y=1+Math.sin(this.core.time*1.1+horse.metadata.phase)*.002;horse.rotation.z=Math.sin(this.core.time*.25+horse.metadata.phase)*.003;}
    for(const flag of this.detailRoot?.getChildMeshes()??[])if(flag.metadata?.flutter)flag.rotation.y=Math.sin(this.core.time*2+flag.metadata.phase)*(.12+Math.abs(this.core.wind)*.3);
    for(const bulb of this.bulbs){const f=.80+.14*Math.sin(this.core.time*1.5+bulb.metadata.phase)+.04*Math.sin(this.core.time*4.7+bulb.metadata.phase);(bulb.material as StandardMaterial).emissiveColor.copyFromFloats(1*f,.64*f,.25*f);}
    for(const light of this.scene.lights)if(light.metadata?.twinkle)light.intensity=7*(.88+.12*Math.sin(this.core.time*1.5+light.metadata.phase));
    this.scene.render();this.weaponScene.render();if(this.ads&&this.level.id!==1)this.overlay.render();
  }
  currentShotRay(){const s=this.core.aimSway(),yaw=this.yaw+s.x,pitch=this.pitch+s.y;return {origin:{x:this.camera.position.x,y:this.camera.position.y,z:this.camera.position.z},direction:{x:Math.sin(yaw)*Math.cos(pitch),y:Math.sin(pitch),z:Math.cos(yaw)*Math.cos(pitch)}};}
  project(id:string){const p=this.targetWorldPoint(id);if(!p)return null;const pos=Vector3.Project(p,Matrix.Identity(),this.scene.getTransformMatrix(),this.camera.viewport.toGlobal(this.engine.getRenderWidth(),this.engine.getRenderHeight()));return {x:pos.x/this.engine.getRenderWidth()*this.canvas.clientWidth,y:pos.y/this.engine.getRenderHeight()*this.canvas.clientHeight};}
}
