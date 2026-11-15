"""Use canonical registered QuRa layers; never repaint faces or outfits."""
import json
from pathlib import Path
from PIL import Image
ROOT=Path(__file__).resolve().parents[1]
DESIGN=next(p for p in (ROOT.parent/'qura-game-design',ROOT.parents[1]) if (p/'docs/visual/manifests/2026-11-02_characters_v12_web.json').exists())
manifest=json.loads((DESIGN/'docs/visual/manifests/2026-11-02_characters_v12_web.json').read_text())
files={f['id']:f for f in manifest['files']};out=ROOT/'public/assets/rigs';out.mkdir(parents=True,exist_ok=True)
rigs={}
feet={'ryaba':670,'fool':664,'professor':653,'fighter':663,'glamour':689}
for code in feet:
 layers=[]
 for i,entry in enumerate(manifest['characters'][code]['default_layers']):
  f=files[entry['file_id']];im=Image.open(DESIGN/f['webp']).convert('RGBA');role=entry['role'].lower()
  joint='body'
  if any(s in role for s in ('head','hat','glasses','bandana','pencil')):joint='head'
  if 'left_wing' in role:joint='wingL'
  if 'right_wing' in role:joint='wingR'
  if any(s in role for s in ('left boot','left croc','left anklet')):joint='legL'
  if any(s in role for s in ('right boot','right croc','right anklet')):joint='legR'
  if 'water toy' in role:joint='wingL'
  pieces=[(joint,im)]
  if 'legs' in role and not any(s in role for s in ('croc','boot')):
   # Split only registered anatomy, preserving separate outfits above it.
   a=im.copy();b=im.copy();a.paste((0,0,0,0),(360,0,600,760));b.paste((0,0,0,0),(0,0,360,760));pieces=[('legL',a),('legR',b)]
  for part,pic in pieces:
   bounds=pic.getchannel('A').point(lambda a:255 if a>12 else 0).getbbox()
   if not bounds:continue
   x0,y0,x1,y1=bounds;x0=max(0,x0-3);y0=max(0,y0-3);x1=min(600,x1+3);y1=min(760,y1+3)
   name=f'{code}-{i:02d}-{part}.webp';pic.crop((x0,y0,x1,y1)).save(out/name,quality=95)
   layers.append({'url':'/assets/rigs/'+name,'rect':[x0,y0,x1,y1],'z':entry['z'],'joint':part,'role':entry['role']})
 rigs[code]={'foot':feet[code],'layers':layers,'source':'QuRa canonical v12 registered anatomy and outfit layers'}
(out/'rigs.json').write_text(json.dumps(rigs,ensure_ascii=False,indent=2)+'\n')
print('Prepared',sum(len(r['layers']) for r in rigs.values()),'canonical animation layers')
