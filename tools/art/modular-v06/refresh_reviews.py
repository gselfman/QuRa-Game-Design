import ast
from pathlib import Path
from PIL import Image,ImageDraw
R=Path(__file__).parent;OUT=R/'QURA_modular_v06';ROOT=R;SIZE=(1200,1520)
mod=ast.parse((R/'build_v06.py').read_text())
for n in mod.body:
 if isinstance(n,ast.Assign):
  for t in n.targets:
   if isinstance(t,ast.Name) and t.id in ['FITS','NAMES']:globals()[t.id]=ast.literal_eval(n.value)
PARTS={};GEAR={}
def read(c,p):return Image.open(OUT/c/(p+'.png')).convert('RGBA')
for c,f in FITS.items():
 PARTS[c]={k:read(c,'parts/'+k) for k in ['body','head','feet','farWing','nearWing']};PARTS[c]['head_native']=read(c,'head_native_base');PARTS[c]['feet_perch']=read(c,'feet_perch')
 GEAR[c]={k:read(c,'wear/'+key) for k,key in [('head_front',f['head'][0]),('head_back',f['head'][0]+'_back'),('body',f['body'][0]),('face',f['face']),('bag',f['bag'][0]),('feet',f['feet'])]}
 if f['neck']:GEAR[c]['neck']=read(c,'wear/'+f['neck'][0])
PROPS={p.stem:Image.open(p).convert('RGBA') for p in (OUT/'props').glob('*.png')}
for n in mod.body:
 if isinstance(n,ast.FunctionDef) and n.name in ['compose','board']:exec(compile(ast.Module(body=[n],type_ignores=[]),str(R/'build_v06.py'),'exec'),globals())
for c in FITS:
 im=compose(c);im=im.crop(im.getbbox());im.thumbnail((700,900));bg=Image.new('RGB',(740,940),'#dfdfdf');bg.paste(im,((740-im.width)//2,20),im);bg.save(R/(c+'-after.jpg'),quality=95)
board('poses').save(R/'review_18_poses_v06.jpg',quality=94);board('emotions').save(R/'review_30_emotions_v06.jpg',quality=94)
