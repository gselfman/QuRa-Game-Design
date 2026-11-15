import {Scene,TransformNode,Mesh,MeshBuilder,Texture,StandardMaterial,Color3,Vector3} from '@babylonjs/core';
export class CharacterRig {
  root:TransformNode;body:TransformNode;head:TransformNode;wingL:TransformNode;wingR:TransformNode;legL:TransformNode;legR:TransformNode;
  meshes:Mesh[]=[];materials:StandardMaterial[]=[];rest:Record<string,Vector3>={};
  constructor(scene:Scene,parent:TransformNode,public code:string,recipe:any,textures:Record<string,Texture>){
    this.root=new TransformNode(code+'-puppet',scene);this.root.parent=parent;
    const sx=1.28/600,sy=1.62/760,foot=recipe.foot;
    const joint=(name:string,x:number,y:number,p:TransformNode)=>{const n=new TransformNode(code+'-'+name,scene);n.parent=p;n.position.set((x-300)*sx,(foot-y)*sy,0);return n;};
    this.body=joint('body',360,500,this.root);
    const sub=(name:string,x:number,y:number)=>{const n=joint(name,x,y,this.body);n.position.subtractInPlace(this.body.position);return n;};
    this.head=sub('head',380,315);this.wingL=sub('wingL',475,360);this.wingR=sub('wingR',300,360);
    this.legL=joint('legL',325,555,this.root);this.legR=joint('legR',405,555,this.root);
    const joints:Record<string,TransformNode>={body:this.body,head:this.head,wingL:this.wingL,wingR:this.wingR,legL:this.legL,legR:this.legR};
    for(const layer of recipe.layers){
      const [x0,y0,x1,y1]=layer.rect,j=joints[layer.joint];
      const mesh=MeshBuilder.CreatePlane(code+'-'+layer.role,{width:(x1-x0)*sx,height:(y1-y0)*sy,sideOrientation:Mesh.DOUBLESIDE},scene);
      mesh.parent=j;const abs=j.position.add(j.parent===this.body?this.body.position:Vector3.Zero());
      mesh.position.set(((x0+x1)/2-300)*sx-abs.x,(foot-(y0+y1)/2)*sy-abs.y,-layer.z*.00018);
      const m=new StandardMaterial(mesh.name+'-mat',scene);m.diffuseTexture=textures[layer.url];m.useAlphaFromDiffuseTexture=true;m.backFaceCulling=false;m.emissiveColor=new Color3(.30,.30,.30);m.specularColor=Color3.Black();m.transparencyMode=2;
      mesh.material=m;mesh.alphaIndex=2+layer.z;mesh.isPickable=false;this.meshes.push(mesh);this.materials.push(m);
    }
    for(const name of ['body','head','wingL','wingR','legL','legR'])this.rest[name]=(this as any)[name].position.clone();
  }
  animate(time:number,mode:string,age=0,speed=0,stepPhase?:number){
    for(const name of ['body','head','wingL','wingR','legL','legR']){const node=(this as any)[name] as TransformNode;node.position.copyFrom(this.rest[name]);node.rotation.setAll(0);}
    const seed=this.code.split('').reduce((n,c)=>n+c.charCodeAt(0),0),phase=time*2.2+seed*.31;
    const dance=mode==='dance',fool=mode==='fool',flying=mode==='fly'||mode==='fall',walk=mode==='walk'||mode==='ground',run=mode==='run',peck=mode==='peck';
    const groove=Math.sin(time*Math.PI*3),step=Math.sin((walk||run)&&stepPhase!==undefined?stepPhase:time*(run?11+Math.abs(speed)*1.6:8+Math.abs(speed)*2)+seed);
    this.body.rotation.z=dance?.10*groove:fool?Math.sin(time*7)*.10:run?Math.sign(speed)*.055:Math.sin(phase*.7)*.012;
    this.body.position.y+=dance?.035+.035*Math.cos(time*Math.PI*6):walk||run?Math.abs(step)*(run?.028:.016):Math.sin(phase)*.007;
    this.head.rotation.z=dance?-.16*groove:Math.sin(phase*.46)*.06;
    this.head.position.x+=Math.sin(phase*.31)*.012;
    this.head.position.y+=dance?Math.sin(time*Math.PI*3+.6)*.025:0;
    this.wingL.rotation.z=flying?-.2+Math.sin(time*28+seed)*.72:dance?-.24+Math.sin(time*Math.PI*3+.9)*.38:fool?Math.sin(time*8)*.24:Math.sin(phase)*.035;
    this.wingR.rotation.z=flying?.2-Math.sin(time*28+seed)*.72:dance?.18-Math.sin(time*Math.PI*3+.9)*.42:fool?-Math.sin(time*8)*.24:-Math.sin(phase)*.035;
    if(walk||run||dance){
      const stride=dance?groove:step,lift=dance?.08:run?.085:.045,swing=dance?.14:run?.25:.20;
      this.legL.rotation.z=swing*stride;this.legR.rotation.z=-swing*stride;
      this.legL.position.y+=Math.max(0,stride)*lift;this.legR.position.y+=Math.max(0,-stride)*lift;
      this.legL.position.x+=stride*(run?.11:walk?.05:.018);this.legR.position.x-=stride*(run?.11:walk?.05:.018);
      if(walk||run){this.head.rotation.z-=step*(run?.055:.025);this.wingL.rotation.z+=step*(run?.14:.06);this.wingR.rotation.z-=step*(run?.14:.06);}
    }
    if(flying){this.legL.rotation.z=.22;this.legR.rotation.z=-.22;this.legL.position.y+=.07;this.legR.position.y+=.07;this.head.rotation.z+=Math.sin(time*12)*.06;}
    if(mode==='release'){this.body.position.y-=.035;this.head.rotation.z=-.10;this.wingL.rotation.z=-.2;this.wingR.rotation.z=.2;}
    if(mode==='land'){this.body.position.y-=.035;this.wingL.rotation.z=-.24;this.wingR.rotation.z=.24;this.head.position.y-=.025;}
    if(peck){const dip=Math.pow(Math.max(0,Math.sin(time*7.8+seed)),4);this.head.position.y-=dip*.15;this.head.position.x+=dip*.035;this.head.rotation.z+=dip*.32;this.body.position.y-=dip*.025;this.body.rotation.z+=dip*.035;}
    if(mode==='look'||mode==='turn'){this.head.rotation.z+=Math.sin(time*2.4+seed)*.10;this.head.position.x+=Math.sin(time*1.7+seed)*.02;this.wingL.rotation.z+=.045;}
    if(mode==='professor'){this.head.rotation.z=-.13+Math.sin(time*2)*.04;this.wingR.rotation.z=.21;this.wingL.rotation.z=-.18;}
    if(mode==='fighter'){this.wingL.rotation.z=-.26+Math.sin(time*6)*.045;this.head.rotation.z=.05;this.body.rotation.z=-.025;}
  }
  dispose(){this.root.dispose();this.materials.forEach(m=>m.dispose());}
}
