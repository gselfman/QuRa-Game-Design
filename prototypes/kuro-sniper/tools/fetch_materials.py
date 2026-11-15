"""Prepare small, offline CC0 PBR assets. No runtime network requests."""
import json, urllib.request, io, hashlib
from pathlib import Path
from PIL import Image
OUT=Path(__file__).resolve().parents[1]/'public/assets/materials'
OUT.mkdir(parents=True,exist_ok=True)
HEAD={'User-Agent':'QuRaGameArt/1.0 (local game asset preparation)'}
def get(url):
 with urllib.request.urlopen(urllib.request.Request(url,headers=HEAD),timeout=120) as r:return r.read()
credits=[]
for label,slug in [('wood','wood_floor_deck'),('grass','aerial_grass_rock')]:
 meta=json.loads(get('https://api.polyhaven.com/files/'+slug));images={}
 for channel in ('Diffuse','nor_gl','Rough','AO'):
  f=meta[channel]['1k']['jpg'];raw=get(f['url'])
  assert hashlib.md5(raw).hexdigest()==f['md5']
  images[channel]=Image.open(io.BytesIO(raw)).convert('RGB')
 images['Diffuse'].save(OUT/(label+'-color.webp'),quality=90)
 images['nor_gl'].save(OUT/(label+'-normal.webp'),lossless=True)
 rough=images['Rough'].convert('L');ao=images['AO'].convert('L')
 Image.merge('RGB',(ao,rough,Image.new('L',rough.size,0))).save(OUT/(label+'-orm.webp'),lossless=True)
 credits.append({'name':slug,'source':'https://polyhaven.com/a/'+slug,'license':'CC0-1.0','resolution':'1k','channels':['diffuse','normal OpenGL','AO/roughness/metallic']})
slug='kloofendal_48d_partly_cloudy_puresky';meta=json.loads(get('https://api.polyhaven.com/files/'+slug))
raw=get(meta['tonemapped']['url']);im=Image.open(io.BytesIO(raw));im.resize((2048,1024),Image.Resampling.LANCZOS).save(OUT/'sky.webp',quality=90)
f=meta['hdri']['1k']['hdr'];raw=get(f['url']);assert hashlib.md5(raw).hexdigest()==f['md5'];(OUT/'sky-light.hdr').write_bytes(raw)
credits.append({'name':slug,'source':'https://polyhaven.com/a/'+slug,'license':'CC0-1.0','resolution':'sky 2k / light 1k','authors':['Greg Zaal','Dimitrios Savva','Jarod Guest']})
(OUT/'CREDITS.json').write_text(json.dumps({'provider':'Poly Haven','provider_url':'https://polyhaven.com','assets':credits},indent=2)+'\n')
print('Prepared',sum(p.stat().st_size for p in OUT.iterdir()),'bytes of offline CC0 materials')
