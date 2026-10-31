"""Register approved artwork to body landmarks and remove hidden surfaces.
Shop artwork stays intact. All wearing files preserve the shared canvas.
"""
from pathlib import Path
import sys,json,math,shutil,io,os
import numpy as np
from PIL import Image,ImageDraw,ImageChops,ImageFilter
from geometry import mask,cut
ROOT=Path(__file__).parent
OLD=Path(os.environ.get('QURA_V05_ROOT',ROOT.parent/'QURA_modular_v05'))
OUT=ROOT/'QURA_modular_v06';OUT.mkdir(exist_ok=True)
SIZE=(1200,1520);S=2
EYES={'C01':[[338,160],[404,184]],'C02':[[358,166],[430,189]],'C03':[[353,157],[429,185]],'C04':[[337,178],[401,201]],'C05':[[372,154],[437,171]],'C06':[[392,140],[462,164]]}
NAMES={'C01':'Ряба','C02':'Боевик','C03':'Дурочка','C04':'Профессор','C05':'Монах','C06':'Гламурочка'}
FITS={
'C01':{'head':('hat',[220,10,315,157]),'face':'glasses','body':('vest',[238,275,262,237]),'neck':None,'bag':('bag',[443,391,82,98]),'feet':'boots'},
'C02':{'head':('bandana',[280,73,204,93]),'face':'aviators','body':('vest',[248,283,275,222]),'neck':('cartridges',[329,276,167,93]),'bag':('water_toy',[427,382,114,68]),'feet':'boots'},
'C03':{'head':('scarf',[273,4,244,168]),'face':'glasses','body':('vest',[253,280,277,218]),'neck':('beads',[338,276,161,128]),'bag':('shopper_flute',[491,393,89,100]),'feet':'ring07'},
'C04':{'head':('pencil',[270,49,50,64]),'face':'glasses','body':('coat',[227,291,277,216]),'neck':('magnifier',[343,286,79,112]),'bag':('satchel',[439,401,96,67]),'feet':'crocs'},
'C05':{'head':('hat',[272,-2,253,134]),'face':'third_eye','body':('robe',[281,282,222,223]),'neck':('beads',[347,282,137,87]),'bag':('cloth_bag',[459,404,77,55]),'feet':'sandals'},
'C06':{'head':('hat',[300,5,246,133]),'face':'glasses','body':('vest',[307,292,208,217]),'neck':('diamonds',[379,286,120,62]),'bag':('bag_h',[464,404,72,49]),'feet':'anklets'}}
HEAD_CUT={
'C01':'M0 0 L1 0 L1 .25 Q.94 .17 .84 .21 L.12 .83 L0 .88 Z',
'C02':'M0 0 L.35 0 L.37 .27 Q.60 .19 1 .26 L1 1 L0 1 Z',
'C05':'M0 0 L1 0 L1 .53 Q.78 .37 .49 .50 Q.20 .60 0 .82 Z',
'C06':'M0 0 L1 0 L1 .29 Q.89 .15 .75 .24 Q.40 .50 0 .88 Z'}
NECK_HOLE={
'C01':'M.20 0 L.76 0 Q.82 .17 .69 .39 Q.41 .19 .20 0 Z',
'C03':'M.38 0 L.73 0 L.75 .18 L.68 .42 L.66 .76 L.59 .76 L.57 .35 Z',
'C04':'M.32 0 L.75 0 Q.82 .20 .75 .43 L.70 .44 Q.52 .15 .32 0 Z',
'C05':'M.38 0 L.67 0 Q.71 .15 .625 .285 Q.49 .13 .38 0 Z',
'C06':'M.19 0 L.74 0 Q.82 .18 .68 .37 Q.43 .14 .19 0 Z'}
ARMHOLE={
'C01':'M.10 .06 Q.03 .22 .07 .48 Q.09 .60 .16 .53 Q.23 .28 .10 .06 Z',
'C03':'M.28 .04 Q.13 .16 .12 .40 L.25 .37 L.36 .16 Z',
'C04':'M.13 .06 Q.02 .15 .10 .49 L.16 .48 Q.28 .23 .13 .06 Z',
'C05':'M.24 .10 Q.15 .08 .12 .22 L.08 .39 Q.22 .42 .29 .24 Z',
'C06':'M.09 .11 Q.02 .24 .065 .48 Q.14 .48 .18 .29 Z'}
LENS={
'C01':['M.405 .12 C.30 .20 .34 .90 .51 .90 C.69 .89 .72 .13 .54 .10 Z','M.79 .10 C.66 .10 .68 .87 .83 .88 C.99 .88 1 .10 .85 .10 Z'],
'C02':['M.12 .16 C.18 -.01 .43 -.02 .53 .19 C.67 .52 .42 .88 .22 .82 C.08 .79 .09 .34 .12 .16 Z','M.70 .30 C.73 .17 .87 .22 .93 .40 C1 .64 .98 .96 .89 .96 C.73 .91 .63 .61 .70 .30 Z'],
'C03':['M.32 .18 Q.45 .06 .60 .31 L.58 .65 Q.54 .91 .40 .83 Q.34 .62 .32 .18 Z','M.73 .37 Q.84 .25 .92 .25 L.90 .60 Q.87 .85 .78 .82 L.71 .58 Z'],
'C04':['M.26 .40 C.25 .17 .39 .02 .47 .09 C.61 .12 .58 .77 .43 .89 C.32 .96 .25 .73 .26 .40 Z','M.71 .33 Q.86 .08 .91 .43 Q.98 .77 .86 .90 Q.73 1 .71 .64 Z'],
'C06':['M.20 .24 C.30 .08 .46 .28 .50 .40 C.53 .67 .42 .95 .32 .88 C.22 .80 .18 .47 .20 .24 Z','M.64 .40 C.73 .22 .85 .17 .91 .22 C.93 .49 .84 .89 .74 .91 C.65 .93 .61 .76 .61 .55 Z']}
LENS_CENTERS={'C01':[[.52,.49],[.84,.49]],'C02':[[.34,.44],[.82,.60]],'C03':[[.46,.52],[.81,.56]],'C04':[[.425,.49],[.815,.57]],'C06':[[.30,.51],[.75,.52]]}
# After trimming unused arms, these two landmarks remain in the original crop coordinates.
FILES=[];PROFILES={};GEAR={};PARTS={}
def save(im,rel,**meta):
 p=OUT/(rel+'.png');p.parent.mkdir(parents=True,exist_ok=True);ar=np.array(im);ar[ar[:,:,3]==0,:3]=0;buf=io.BytesIO();Image.fromarray(ar).save(buf,format='PNG',compress_level=3);tmp=p.with_suffix('.tmp');f=open(tmp,'wb');f.write(buf.getvalue());f.flush();os.fsync(f.fileno());f.close();tmp.replace(p);FILES.append({'file':str(p.relative_to(OUT)),**meta});return im

def art(cid,key):
 im=Image.open(OLD/cid/'shop'/(key+'.png')).convert('RGBA');return im.crop(im.getbbox())
def nmask(path,im):
 # SVG normalized coordinates scale in x and y independently.
 import re
 vals=re.findall(r'[A-Za-z]|[-+]?(?:\d*\.)?\d+',path);out=[];axis=0
 for v in vals:
  if v.isalpha():out.append(v);axis=0
  else:out.append(str(float(v)*(im.width if axis%2==0 else im.height)));axis+=1
 return mask(' '.join(out),im.size,1).filter(ImageFilter.GaussianBlur(.6))
def place(im,r):
 x,y,w,h=r;out=Image.new('RGBA',SIZE);im=im.resize((round(w*S),round(h*S)),Image.Resampling.LANCZOS);out.alpha_composite(im,(round(x*S),round((y+40)*S)));return out

def eye_warp(cid,im):
 p,q=[complex(x*im.width,y*im.height) for x,y in LENS_CENTERS[cid]];u,v=[complex(*x) for x in EYES[cid]];z=(v-u)/(q-p);off=u-z*p;a,b=z.real,z.imag;tx,ty=off.real,off.imag;den=a*a+b*b
 coeff=(a/(den*S),b/(den*S),(-a*tx-b*(ty+40))/den,-b/(den*S),a/(den*S),(b*tx-a*(ty+40))/den)
 PROFILES[cid]['face_landmarks']={'source_normalized':LENS_CENTERS[cid],'target':EYES[cid],'scale':abs(z),'rotation_degrees':math.degrees(math.atan2(b,a))}
 return im.transform(SIZE,Image.Transform.AFFINE,coeff,Image.Resampling.BICUBIC)

def erase_comb(im,cid):
 # Only the comb above the brow is hidden by native headwear; preserve hair.
 a=np.array(im);yy=np.arange(SIZE[1])[:,None];xx=np.arange(SIZE[0])[None,:]
 if cid=='C01':region=(yy<2*(40+135))&(xx>350*2)&(xx<470*2)
 elif cid=='C03':region=(yy<2*(40+172))&(xx>385*2)&(xx<485*2)
 elif cid=='C06':region=(yy<2*(40+139))&(xx>375*2)&(xx<525*2)
 else:return im
 red=(a[:,:,0]>a[:,:,1]*1.6)&(a[:,:,0]>a[:,:,2]*1.2)&(a[:,:,0]>120)&region
 a[red]=0;return Image.fromarray(a)

for cid,f in FITS.items():
 PROFILES[cid]={'headwear':f['head'][1],'eyes':EYES[cid],'shoulder':[{'C01':300,'C02':321,'C03':315,'C04':294,'C05':328,'C06':354}[cid],{'C01':284,'C02':287,'C03':285,'C04':297,'C05':293,'C06':302}[cid]],'garment':f['body'][1],'bag':f['bag'][1],'roles':{}}
 g={};p={};GEAR[cid]=g;PARTS[cid]=p
 for path in (OLD/cid/'parts').glob('*.png'):
  im=Image.open(path).convert('RGBA');p[path.stem]=im;save(im,cid+'/parts/'+path.stem,kind='part',character=cid)
 # Native worn heads have an anatomically intact scalp, not rectangular notches.
 base=Image.open(OLD/cid/'head_native_base.png').convert('RGBA') if cid=='C05' else p['head'].copy()
 base=erase_comb(base,cid)
 if cid in ['C01','C03','C06'] and (ROOT/(cid+'-head-retouched-registered.png')).exists():base=Image.open(ROOT/(cid+'-head-retouched-registered.png')).convert('RGBA')
 p['head_native']=base;save(base,cid+'/head_native_base',kind='head',character=cid)
 for path in (OLD/cid/'emotions').glob('*.png'):
  if cid=='C01' and path.stem.endswith('_hat') and (ROOT/(cid+'-head-retouched-registered.png')).exists():continue
  im=Image.open(path).convert('RGBA')
  # Keep the existing registered expression but use a no-comb head for native hats.
  if path.stem.endswith('_hat') and cid=='C01':
   full=Image.open(OLD/cid/'emotions'/(path.stem.replace('_hat','_bare')+'.png')).convert('RGBA');im=erase_comb(full,cid)
  save(im,cid+'/emotions/'+path.stem,kind='emotion',character=cid)
  if cid in ['C01','C03','C06'] and path.stem.endswith('_bare') and (ROOT/(cid+'-head-retouched-registered.png')).exists():
   # Only the upper scalp correction is reused across native headwear expressions.
   repair=Image.open(ROOT/(cid+'-scalp-repair.png')).convert('RGBA')
   m=Image.open(ROOT/(cid+'-scalp-mask.png')).convert('L')
   native=cut(im,ImageChops.invert(m));native.alpha_composite(repair)
   if cid=='C01' and path.stem=='determination_bare':
    forehead=Image.new('L',SIZE);ImageDraw.Draw(forehead).ellipse((780,324,820,368),fill=255);skin=cut(base,forehead);native=cut(native,ImageChops.invert(forehead));native.alpha_composite(skin)
   save(native,cid+'/emotions/'+path.stem.replace('_bare','_hat'),kind='emotion',character=cid)
 hk,hr=f['head'];im=art(cid,hk)
 if cid in HEAD_CUT:
  front=cut(im,nmask(HEAD_CUT[cid],im));back=cut(im,ImageChops.invert(nmask(HEAD_CUT[cid],im)))
  g['head_front']=place(front,hr);g['head_back']=place(back,hr)
 else:g['head_front']=place(im,hr);g['head_back']=Image.new('RGBA',SIZE)
 save(g['head_front'],cid+'/wear/'+hk,kind='wear',slot='head_front',character=cid)
 save(g['head_back'],cid+'/wear/'+hk+'_back',kind='wear_back',slot='head_back',character=cid)
 key=f['face'];im=art(cid,key)
 if cid in LENS:
  lenses=Image.new('L',im.size)
  for path in LENS[cid]:lenses=ImageChops.lighter(lenses,nmask(path,im))
  if cid=='C01':
   lenses=Image.new('L',im.size);dr=ImageDraw.Draw(lenses)
   for cx,cy,rx,ry in [(.528,.49,.112,.385),(.836,.49,.088,.378)]:dr.ellipse(((cx-rx)*im.width,(cy-ry)*im.height,(cx+rx)*im.width,(cy+ry)*im.height),fill=255)
  front=cut(im,ImageChops.invert(lenses))
  # The long folded rear arm is not a front-facing feature; remove it.
  arms={'C01':.35,'C02':.09,'C03':.26,'C04':.235,'C06':.06}[cid]
  am=Image.new('L',im.size,255);ImageDraw.Draw(am).rectangle((0,0,int(arms*im.width),im.height),fill=0);front=cut(front,am)
  if cid in ['C01','C02','C06']:
   # Preserve the gold frame; gray lens interiors and folded arms are not worn geometry.
   from scipy import ndimage
   ar=np.array(im).astype(float);gold=(ar[:,:,0]>ar[:,:,1]*1.015)&(ar[:,:,1]>ar[:,:,2]*1.13)&(ar[:,:,3]>10)
   edge=ndimage.binary_dilation(gold,iterations=1)
   frameAlpha=Image.fromarray((edge*255).astype('uint8'));front=cut(im,frameAlpha);front=cut(front,am);front=cut(front,ImageChops.invert(lenses))
  g['face']=eye_warp(cid,front)
 else:g['face']=place(im,[389,115,26,23])
 save(g['face'],cid+'/wear/'+key,kind='wear',slot='face',character=cid)
 key,rect=f['body'];im=art(cid,key)
 if cid=='C06':
  im=Image.open(ROOT/'C06-vest-front-source.png').convert('RGBA');im=im.crop((3,1,319,337))
 for paths in [NECK_HOLE,ARMHOLE]:
  if cid in paths and not(cid=='C06' and paths is NECK_HOLE):im=cut(im,ImageChops.invert(nmask(paths[cid],im)))
 # The tactical vest source was already drawn open at the back of the neck.
 g['body']=place(im,rect);save(g['body'],cid+'/wear/'+key,kind='wear',slot='body',character=cid)
 if f['neck']:
  key,r=f['neck'];im=art(cid,key)
  if cid!='C04':
   path='M0 .25 Q.5 .46 1 .24 L1 1 L0 1 Z' if cid in ['C02','C03','C05'] else 'M0 .15 Q.5 .40 1 .12 L1 1 L0 1 Z'
   im=cut(im,nmask(path,im))
  g['neck']=place(im,r);save(g['neck'],cid+'/wear/'+key,kind='wear',slot='neck',character=cid)
 key,r=f['bag'];im=art(cid,key)
 crops={'C01':(.49,.26,1,1),'C02':(0,.40,1,1),'C03':(0,.36,1,1),'C04':(.04,.34,1,1),'C05':(0,.40,1,1),'C06':(0,.48,1,1)}
 x,y,x2,y2=crops[cid];im=im.crop((int(x*im.width),int(y*im.height),int(x2*im.width),int(y2*im.height)))
 g['bag']=place(im,r)
 if cid=='C03':
  original=art(cid,key);flute=cut(original,nmask('M.75 .03 L.94 .01 L.99 .46 L.68 .46 Z',original));flute=flute.crop((int(.67*original.width),0,original.width,int(.50*original.height)))
  g['bag'].alpha_composite(place(flute,[r[0]+r[2]*.60,r[1]-45,39,62]))
 # Registered front strap follows the shoulder to the bag and sits under wings.
 strap=Image.new('RGBA',SIZE);dr=ImageDraw.Draw(strap);start=PROFILES[cid]['shoulder'];end=[r[0]+r[2]*.45,r[1]+8];start=[335,320] if cid=='C02' else start;points=[]
 for t in np.linspace(0,1,100):
  points.append((2*((1-t)*start[0]+t*end[0]),2*((1-t)*start[1]+t*end[1]+40)))
 colors={'C01':'#b45720','C02':'#1672a7','C03':'#d6427e','C04':'#723d26','C05':'#ba9c62','C06':'#d5687c'}
 dr.line(points,fill=colors[cid],width=8);strap.alpha_composite(g['bag']);g['bag']=strap;save(strap,cid+'/wear/'+key,kind='wear',slot='bag',character=cid)
 key=f['feet'];g['feet']=Image.open(OLD/cid/'feet_native.png').convert('RGBA');save(g['feet'],cid+'/wear/'+key,kind='wear',slot='feet',character=cid)
 for key in ['feet_native','feet_perch']:p[key]=Image.open(OLD/cid/(key+'.png')).convert('RGBA');save(p[key],cid+'/'+key,kind='feet',character=cid)
 for path in (OLD/cid/'shop').glob('*.png'):save(Image.open(path).convert('RGBA'),cid+'/shop/'+path.stem,kind='shop',character=cid)

for path in (OLD/'props').glob('*.png'):save(Image.open(path).convert('RGBA'),'props/'+path.stem,kind='prop')
PROPS={p.stem:Image.open(p).convert('RGBA') for p in (OUT/'props').glob('*.png')}
def compose(cid,pose='CARD',emotion='base',on=None):
 p=PARTS[cid];g=GEAR[cid];out=Image.new('RGBA',SIZE);on=set(g) if on is None else on
 if pose=='NEST':out.alpha_composite(PROPS['nest_back'])
 if pose=='PERCH':out.alpha_composite(PROPS['perch']);out.alpha_composite(p['feet_perch'])
 if pose=='CARD':out.alpha_composite(g['feet'] if 'feet'in on else p['feet'])
 if 'head_front'in on:out.alpha_composite(g['head_back'])
 out.alpha_composite(p['body'])
 for k in ['body','bag','neck']:
  if k in g and k in on and not(k=='bag' and pose!='CARD'):out.alpha_composite(g[k])
 out.alpha_composite(p['farWing']);out.alpha_composite(p['nearWing'])
 head=p['head_native'] if 'head_front'in on else p['head']
 if emotion!='base':
  suffix='hat' if cid in ['C01','C03','C05','C06'] and 'head_front'in on else 'bare';head=Image.open(OUT/cid/'emotions'/(emotion+'_'+suffix+'.png')).convert('RGBA')
  if 'head_front'in on and cid in ['C03','C06'] and not (ROOT/(cid+'-head-retouched-registered.png')).exists():head=erase_comb(head,cid)
 out.alpha_composite(head)
 for k in ['head_front','face']:
  if k in on:out.alpha_composite(g[k])
 if pose=='NEST':out.alpha_composite(PROPS['nest_front_eggs'])
 return out

def board(mode):
 cols=3 if mode=='poses' else 5
 b=Image.new('RGB',(cols*450,6*600),'#e6e4df');d=ImageDraw.Draw(b)
 for row,cid in enumerate(FITS):
  opts=['CARD','PERCH','NEST'] if mode=='poses' else ['base','joy','surprise','determination','sadness']
  for col,k in enumerate(opts):
   im=compose(cid,k) if mode=='poses' else compose(cid,emotion=k)
   bb=im.getbbox();im=im.crop(bb);im.thumbnail((420,550));b.paste(im,(col*450+(450-im.width)//2,row*600+40),im);d.text((col*450+10,row*600+12),cid+' '+k,fill='black')
 return b
for cid in FITS:
 for pose in ['CARD','PERCH','NEST']:save(compose(cid,pose),cid+'/composites/'+pose,kind='composite',character=cid)
board('poses').save(ROOT/'review_18_poses_v06.jpg',quality=94)
board('emotions').save(ROOT/'review_30_emotions_v06.jpg',quality=94)
for cid in FITS:
 im=compose(cid);bb=im.getbbox();im=im.crop(bb);im.thumbnail((700,900));bg=Image.new('RGB',(740,940),'#dfdfdf');bg.paste(im,((740-im.width)//2,20),im);bg.save(ROOT/(cid+'-after.jpg'),quality=95)
(ROOT/'fitting-profiles-v06.json').write_text(json.dumps(PROFILES,ensure_ascii=False,indent=2))
(OUT/'manifest.json').write_text(json.dumps({'version':'v06','canvas_px':list(SIZE),'virtual_origin':[0,40],'draw_order':['props_back','feet','headwear_back','body','garment','bag','neck_front','farWing','nearWing','head','headwear_front','face_front','nest_front'],'files':FILES},ensure_ascii=False,indent=2))
print(json.dumps({'files':len(FILES),'output':str(OUT)}))
