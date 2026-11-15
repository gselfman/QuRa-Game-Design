"""Reference-guided real CC0 surfaces; downloads are used only during authoring."""
import json, urllib.request, io, hashlib
from pathlib import Path
from PIL import Image
OUT=Path(__file__).resolve().parents[1]/'public/assets/materials'
HEAD={'User-Agent':'QuRaGameArt/1.1 (local reference material preparation)'}
def get(url):
 with urllib.request.urlopen(urllib.request.Request(url,headers=HEAD),timeout=120) as r:return r.read()
credits=json.loads((OUT/'CREDITS.json').read_text())
for label,slug in [('ref-wall','weathered_brown_planks'),('ref-floor','old_wood_floor'),('ref-grass','leafy_grass')]:
 meta=json.loads(get('https://api.polyhaven.com/files/'+slug));images={}
 for channel in ('Diffuse','nor_gl','Rough','AO'):
  f=meta[channel]['1k']['jpg'];raw=get(f['url']);assert hashlib.md5(raw).hexdigest()==f['md5'];images[channel]=Image.open(io.BytesIO(raw)).convert('RGB')
 images['Diffuse'].save(OUT/(label+'-color.webp'),quality=92)
 images['nor_gl'].save(OUT/(label+'-normal.webp'),lossless=True)
 rough=images['Rough'].convert('L');ao=images['AO'].convert('L')
 Image.merge('RGB',(ao,rough,Image.new('L',rough.size,0))).save(OUT/(label+'-orm.webp'),lossless=True)
 credits['assets']=[a for a in credits['assets'] if a.get('name')!=slug]
 credits['assets'].append({'name':slug,'source':'https://polyhaven.com/a/'+slug,'license':'CC0-1.0','resolution':'1k','role':label,'channels':['diffuse','normal OpenGL','AO/roughness/metallic']})
 print('Prepared',label,flush=True)
(OUT/'CREDITS.json').write_text(json.dumps(credits,indent=2)+'\n')
