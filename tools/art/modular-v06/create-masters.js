await figma.setCurrentPageAsync(await figma.getNodeByIdAsync('156:1552'));
const page=figma.currentPage,created=[],masters={};
for(const [index,a]of ASSETS.entries()){
 const name='QuRa/v06/'+a.file.replace('.png','');let c=page.children.find(n=>n.name===name);let r;
 if(!c){c=figma.createComponent();page.appendChild(c);created.push(c.id);c.name=name;c.resize(600,760);c.fills=[];c.clipsContent=false;c.x=7000+(index%12)*640;c.y=Math.floor(index/12)*800;r=figma.createRectangle();c.appendChild(r);created.push(r.id);r.name='REGISTERED_RGBA';r.resize(600,760);r.x=0;r.y=0;r.fills=[];c.description='v06 registered layer. Canvas 1200×1520 at 2× export; preserve transparent margins. Shop view is separate. '+a.kind;c.exportSettings=[{format:'PNG',constraint:{type:'SCALE',value:2},suffix:''}];}else r=c.children[0];
 masters[a.file]={component:c.id,target:r.id,kind:a.kind};
}
return {createdNodeIds:created,masters,count:Object.keys(masters).length};
