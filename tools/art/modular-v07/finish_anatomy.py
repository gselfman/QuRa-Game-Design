from pathlib import Path
from PIL import Image,ImageChops,ImageDraw,ImageFilter
from scipy import ndimage
import numpy as np,json,io,os,ast
R=Path(__file__).parent;OUT=R/'QURA_modular_v07';OLD=Path(os.environ.get('QURA_V06_ROOT',R.parent/'modular-v06/QURA_modular_v06'));SIZE=(1200,1520)
def atomic(im,p):
 ar=np.array(im);ar[ar[:,:,3]==0,:3]=0;im=Image.fromarray(ar);b=io.BytesIO();im.save(b,format='PNG',compress_level=3);tmp=p.with_suffix('.pending')
 with open(tmp,'wb') as f:f.write(b.getvalue());f.flush();os.fsync(f.fileno())
 tmp.replace(p)
def box(im):
 a=np.array(im);lab,n=ndimage.label(a[:,:,3]>40);areas=ndimage.sum(a[:,:,3]>40,lab,range(1,n+1));keep=np.isin(lab,np.flatnonzero(areas>max(500,areas.max()*.015))+1);yy,xx=np.where(keep);return min(xx),min(yy),max(xx)+1,max(yy)+1
im=Image.open(R/'generated_sources/torsos.png').convert('RGBA')
ellipses={'C01':[175,268,520,535],'C02':[170,266,530,516],'C03':[185,273,545,523],'C04':[165,280,510,518],'C05':[195,281,510,519],'C06':[220,289,525,535]}
atlas=Image.new('RGBA',(3600,3040));items=[];manifest=json.loads((OUT/'manifest.json').read_text());existing={x['file'] for x in manifest['files']}
for i,c in enumerate(ellipses):
 old=Image.open(OLD/c/'parts/body.png').convert('RGBA');a=np.array(old);yy,xx=np.indices(a.shape[:2])
 if c in ['C04','C05','C06']:a[yy<280]=0
 # Yellow shin fragments do not belong in the torso. Full leg sprites remain separate.
 yellow=(a[:,:,0]>80)&(a[:,:,1]>40)&(a[:,:,2]<100)&(a[:,:,0]>a[:,:,1]*1.1)&(a[:,:,1]>a[:,:,2]*1.25)&(yy>(480+40)*2)&(xx>360)&(xx<1080);a[yellow]=0;old=Image.fromarray(a)
 cell=im.crop((round((i%3)*im.width/3),round((i//3)*im.height/2),round((i%3+1)*im.width/3),round((i//3+1)*im.height/2)))
 cb=box(cell);ob=box(old);patch=cell.crop(cb).resize((ob[2]-ob[0],ob[3]-ob[1]),Image.Resampling.LANCZOS);registered=Image.new('RGBA',SIZE);registered.alpha_composite(patch,(int(ob[0]),int(ob[1])))
 ar=np.array(registered);valid=ar[:,:,3]>128;nearest=ndimage.distance_transform_edt(~valid,return_distances=False,return_indices=True);ar[:,:,:3]=ar[nearest[0],nearest[1],:3];ar[:,:,3]=255
 e=Image.new('L',SIZE);ImageDraw.Draw(e).ellipse(tuple(round(v*2) if k%2==0 else round((v+40)*2) for k,v in enumerate(ellipses[c])),fill=255);e=e.filter(ImageFilter.GaussianBlur(1.2));under=registered.copy();under.putalpha(ImageChops.multiply(e,registered.getchannel('A')));under.alpha_composite(old);under.putalpha(ImageChops.subtract(under.getchannel('A'),Image.open(OLD/c/'parts/feet.png').getchannel('A')))
 atomic(under,OUT/c/'parts/body.png');atlas.alpha_composite(under,((i%3)*1200,(i//3)*1520));items.append({'file':c+'/parts/body.png','character':c,'col':i%3,'row':i//3,'cols':3,'rows':2})
 for name,source in [('torso','body'),('right_wing','nearWing'),('left_wing','farWing'),('legs_bare','feet')]:
  src=OUT/c/'parts'/(source+'.png');dest=OUT/c/'parts'/(name+'.png');dest.write_bytes(src.read_bytes());rel=str(dest.relative_to(OUT))
  if rel not in existing:manifest['files'].append({'file':rel,'kind':'anatomy','character':c,'role':name});existing.add(rel)
atomic(atlas,R/'anatomy-torsos-atlas.png');(R/'anatomy-atlas-v07.json').write_text(json.dumps({'path':str(R/'anatomy-torsos-atlas.png'),'cols':3,'rows':2,'files':items},indent=2))
manifest['anatomy']={'torso':'parts/torso.png','right_wing':'parts/right_wing.png','left_wing':'parts/left_wing.png','legs':'parts/legs_bare.png','right_wing_z':'above garment and bag','footwear':'replace LEGS_MODULE, do not overlay two leg sprites'};(OUT/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2))
# Use the existing composition functions without rerunning the accessory generator.
mod=ast.parse((R/'build_v07.py').read_text());FITS={}
for n in mod.body:
 if isinstance(n,ast.Assign):
  for t in n.targets:
   if isinstance(t,ast.Name) and t.id=='FITS':FITS=ast.literal_eval(n.value)
def blank():return Image.new('RGBA',SIZE)
for n in mod.body:
 if isinstance(n,ast.FunctionDef) and n.name in ['rd','compose']:exec(compile(ast.Module(body=[n],type_ignores=[]),str(R/'build_v07.py'),'exec'),globals())
for c in FITS:
 for pose in ['CARD','PERCH','NEST']:atomic(compose(c,pose),OUT/c/'composites'/(pose+'.png'))
 p=compose(c);p=p.crop(p.getbbox());p.thumbnail((720,900));bg=Image.new('RGB',(760,940),'#dddcd7');bg.paste(p,((760-p.width)//2,20),p);bg.save(R/(c+'-review.jpg'),quality=95)
print(json.dumps({'restored_torsos':6,'anatomy_aliases':24,'png_files':len(manifest['files'])}))
