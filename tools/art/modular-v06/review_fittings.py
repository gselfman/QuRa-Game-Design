import ast,json
from pathlib import Path
from PIL import Image,ImageDraw
R=Path(__file__).parent;O=R/'QURA_modular_v06'
mod=ast.parse((R/'build_v06.py').read_text());FITS=next(ast.literal_eval(n.value) for n in mod.body if isinstance(n,ast.Assign) and any(isinstance(t,ast.Name) and t.id=='FITS' for t in n.targets))
def read(c,p):return Image.open(O/c/(p+'.png')).convert('RGBA')
b=Image.new('RGB',(8*350,6*490),'#dddcd7');d=ImageDraw.Draw(b)
for row,(c,f) in enumerate(FITS.items()):
 options=['base','head','face','body','neck','bag','feet','all']
 for col,slot in enumerate(options):
  out=Image.new('RGBA',(1200,1520));out.alpha_composite(read(c,'wear/'+f['feet']) if slot in ['feet','all'] else read(c,'parts/feet'))
  if slot in ['head','all']:out.alpha_composite(read(c,'wear/'+f['head'][0]+'_back'))
  out.alpha_composite(read(c,'parts/body'))
  for role,key in [('body',f['body'][0]),('neck',f['neck'][0] if f['neck'] else None),('bag',f['bag'][0])]:
   if key and slot in [role,'all']:out.alpha_composite(read(c,'wear/'+key))
  for k in ['farWing','nearWing']:out.alpha_composite(read(c,'parts/'+k))
  out.alpha_composite(read(c,'head_native_base' if slot in ['head','all'] else 'parts/head'))
  if slot in ['head','all']:out.alpha_composite(read(c,'wear/'+f['head'][0]))
  if slot in ['face','all']:out.alpha_composite(read(c,'wear/'+f['face']))
  out=out.crop(out.getbbox());out.thumbnail((340,445));b.paste(out,(col*350+(350-out.width)//2,row*490+35),out);d.text((col*350+8,row*490+10),c+' '+slot,fill='black')
b.save(R/'review_individual_v06.jpg',quality=95)
# Checks decode every PNG, including its pixel payload; dimensions alone do not detect truncation.
errors=[];m=json.loads((O/'manifest.json').read_text())
for x in m['files']:
 try:
  im=Image.open(O/x['file']);im.load();wanted=(768,768) if x['kind']=='shop' else (1200,1520)
  if im.size!=wanted or im.mode!='RGBA':errors.append(x['file']+': mode/size')
 except Exception as e:errors.append(x['file']+': '+str(e))
(R/'png-validation.json').write_text(json.dumps({'png_files':len(m['files']),'errors':errors},indent=2));print(json.dumps({'png_files':len(m['files']),'errors':errors}))
