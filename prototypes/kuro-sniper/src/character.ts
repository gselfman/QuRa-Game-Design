import {Scene,TransformNode,Mesh,MeshBuilder,Texture,StandardMaterial,Color3,Vector3} from '@babylonjs/core';
export class CharacterRig {
  root:TransformNode;body:TransformNode;head:TransformNode;wingL:TransformNode;wingR:TransformNode;legL:TransformNode;legR:TransformNode;
  meshes:Mesh[]=[];materials:StandardMaterial[]=[];
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
  }
  animate(time:number,mode:string,age=0){
    const phase=time*2.4+this.code.length*.8,dance=mode==='dance',fool=mode==='fool',flying=mode==='fly',walk=mode==='ground';
    const groove=dance?Math.sin(time*8):0,step=walk?Math.sin(time*7):groove;
    this.body.rotation.z=(dance?.11:fool?.09:.012)*Math.sin(dance?time*8:phase*.7);
    this.body.position.y=(this.code==='glamour'?(689-500):(this.code==='ryaba'?670-500:this.code==='fool'?664-500:this.code==='fighter'?663-500:653-500))*1.62/760;
    this.body.position.y+=dance?.045+.045*Math.cos(time*16):walk?Math.abs(step)*.018:Math.sin(phase)*.006;
    this.head.rotation.z=dance?-.17*groove:Math.sin(phase*.43)*.038;
    this.head.rotation.y=Math.sin(phase*.3)*.045;
    this.head.position.y=(500-315)*1.62/760+(dance?Math.sin(time*8+.6)*.025:walk?Math.max(0,Math.sin(time*4))*.025:0);
    this.wingL.rotation.z=flying?Math.sin(time*32)*.8:dance?-.25+Math.sin(time*8+.9)*.38:fool?Math.sin(time*8)*.2:Math.sin(phase)*.025;
    this.wingR.rotation.z=flying?-Math.sin(time*32)*.8:dance?.18-Math.sin(time*8+.9)*.42:fool?-Math.sin(time*8)*.2:-Math.sin(phase)*.025;
    this.legL.rotation.z=(dance?.14:walk?.10:0)*step;this.legR.rotation.z=-this.legL.rotation.z;
    this.legL.position.y=(this.code==='glamour'?689-555:this.code==='ryaba'?670-555:this.code==='fool'?664-555:this.code==='fighter'?663-555:653-555)*1.62/760+Math.max(0,step)*(dance?.085:walk?.025:0);
    this.legR.position.y=this.legL.position.y-Math.max(0,step)*(dance?.085:walk?.025:0)+Math.max(0,-step)*(dance?.085:walk?.025:0);
    if(walk&&age>1.6)this.head.rotation.z+=Math.pow(Math.max(0,Math.sin(time*3)),6)*.22;
  }
  dispose(){this.root.dispose();this.materials.forEach(m=>m.dispose());}
}
