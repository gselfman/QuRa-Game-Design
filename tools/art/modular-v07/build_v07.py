"""Owner fitting corrections: right-side bags and redrawn front wearable surfaces."""
from pathlib import Path
import json,math,io,os,shutil
import numpy as np
from PIL import Image,ImageDraw,ImageChops,ImageFilter
from scipy import ndimage
from geometry import mask,cut
R=Path(__file__).parent;OLD=Path(os.environ.get('QURA_V06_ROOT',R.parent/'modular-v06/QURA_modular_v06'));OUT=R/'QURA_modular_v07';OUT.mkdir(exist_ok=True)
SIZE=(1200,1520);CHANGED={};PROFILE={}
M=json.loads((OLD/'manifest.json').read_text())
for f in M['files']:
 p=OUT/f['file'];p.parent.mkdir(parents=True,exist_ok=True)
 if not p.exists():shutil.copy(OLD/f['file'],p)
GEN=json.loads((R/'generated-atlases.json').read_text())

def atomic(im,p):
 b=io.BytesIO();im.save(b,format='PNG',compress_level=3);tmp=p.with_suffix('.pending')
 with open(tmp,'wb') as f:f.write(b.getvalue());f.flush();os.fsync(f.fileno())
 tmp.replace(p)
def save(c,key,im):
 rel=c+'/wear/'+key+'.png';atomic(im,OUT/rel);CHANGED[rel]={'file':rel,'character':c};return im
def load(c,rel):return Image.open(OLD/c/(rel+'.png')).convert('RGBA')
def shop(c,key):
 im=load(c,'shop/'+key);return im.crop(im.getbbox())
def blank():return Image.new('RGBA',SIZE)
def crop(im,rect):
 x,y,x2,y2=rect;im=im.crop((round(x*im.width),round(y*im.height),round(x2*im.width),round(y2*im.height)));return im.crop(im.getbbox())
def asset(c,key):
 src=Path(GEN[c]['path']);src=src if src.is_absolute() else R/src;im=Image.open(src).convert('RGBA');im=crop(im,GEN[c]['cells'][key])
 if key not in ['beads']:
  ar=np.array(im);labs,n=ndimage.label(ar[:,:,3]>8)
  if n:
   areas=ndimage.sum(ar[:,:,3]>8,labs,range(1,n+1));big=int(np.argmax(areas))+1;keep=ndimage.binary_dilation(labs==big,iterations=2);ar[:,:,3]*=keep;im=Image.fromarray(ar);im=im.crop(im.getbbox())
 return im
def nmask(path,im):
 import re
 vals=re.findall(r'[A-Za-z]|[-+]?(?:\d*\.)?\d+',path);out=[];axis=0
 for v in vals:
  if v.isalpha():out.append(v);axis=0
  else:out.append(str(float(v)*(im.width if axis%2==0 else im.height)));axis+=1
 return mask(' '.join(out),im.size,1).filter(ImageFilter.GaussianBlur(.5))
def place(im,rect,angle=0):
 x,y,w,h=rect;scaled=im.resize((round(w*2),round(h*2)),Image.Resampling.LANCZOS)
 if angle:scaled=scaled.rotate(-angle,Image.Resampling.BICUBIC,expand=True)
 out=blank();out.alpha_composite(scaled,(round((x+w/2)*2-scaled.width/2),round((y+40+h/2)*2-scaled.height/2)));return out

def neutral_lenses(im,alpha=48):
 a=np.array(im).astype(float);mx=a[:,:,:3].max(2);mn=a[:,:,:3].min(2);sat=(mx-mn)/np.maximum(mx,1)
 m=(sat<.24)&(a[:,:,3]>100)&(mx>30);labels,n=ndimage.label(m);areas=ndimage.sum(m,labels,range(1,n+1));ids=np.argsort(areas)[-2:]+1;m=np.isin(labels,ids);m=ndimage.binary_fill_holes(ndimage.binary_closing(m,iterations=2));m=ndimage.binary_dilation(m,iterations=1);lens=Image.fromarray((m*255).astype('uint8'))
 frame=cut(im,ImageChops.invert(lens));t=Image.new('RGBA',im.size,(70,84,76,alpha));t=cut(t,lens);t.alpha_composite(frame);return t

def eyes(im,src,dst,cid):
 p,q=[complex(x*im.width,y*im.height) for x,y in src];u,v=[complex(*z) for z in dst];z=(v-u)/(q-p);off=u-z*p;a,b=z.real,z.imag;tx,ty=off.real,off.imag;den=a*a+b*b
 cf=(a/(den*2),b/(den*2),(-a*tx-b*(ty+40))/den,-b/(den*2),a/(den*2),(b*tx-a*(ty+40))/den)
 PROFILE[cid]['face']={'source_landmarks':src,'target_eye_centers':dst,'rotation':math.degrees(math.atan2(b,a))};return im.transform(SIZE,Image.Transform.AFFINE,cf,Image.Resampling.BICUBIC)
def shift_old(c,key,dx,dy,angle=0,center=None):
 im=load(c,'wear/'+key)
 if angle:im=im.rotate(-angle,Image.Resampling.BICUBIC,center=(center[0]*2,(center[1]+40)*2))
 out=blank();out.alpha_composite(im,(round(dx*2),round(dy*2)));return out

CFG={
'C01':{'bag':('bag',[180,440,105,115]),'shoulder':[285,310]},
'C02':{'bag':('water_toy',[125,456,210,100]),'shoulder':[300,320],'head':('bandana',[278,81,211,90],7),'body':None},
'C03':{'bag':('shopper_flute',[143,433,122,122]),'shoulder':[306,312],'head':('scarf',[263,23,260,155],0),'body':None},
'C04':{'bag':('satchel',[163,455,117,86]),'shoulder':[280,315],'body':('coat',[232,284,270,224])},
'C05':{'bag':('cloth_bag',[178,454,105,82]),'shoulder':[318,315],'head':('hat',[275,19,245,133],0),'body':('robe',[283,287,215,216])},
'C06':{'bag':('bag_h',[170,440,112,85]),'shoulder':[345,325],'head':('hat',[314,20,220,114],11),'body':('vest',[309,300,193,203])}}

for c,cf in CFG.items():
 PROFILE[c]={'bag_side':'anatomical right / viewer left','bag':cf['bag'][1],'shoulder':cf['shoulder'],'changes':[]}
 # Right-side bag/body. Front straps remain behind the foreground wing.
 key,rect=cf['bag']
 if c=='C02':art=asset(c,'water_toy')
 else:
  art=shop(c,key);cr={'C01':(.49,.26,1,1),'C03':(0,.36,1,1),'C04':(.04,.34,1,1),'C05':(0,.40,1,1),'C06':(0,.48,1,1)}[c];art=crop(art,cr)
 bag=place(art,rect);strap=blank();dr=ImageDraw.Draw(strap);start=cf['shoulder'];end=[rect[0]+rect[2]*.70,rect[1]+12];color={'C01':'#b45720','C02':'#1672a7','C03':'#d6427e','C04':'#723d26','C05':'#ba9c62','C06':'#d5687c'}[c]
 dr.line([(start[0]*2,(start[1]+40)*2),(end[0]*2,(end[1]+40)*2)],fill=color,width=8)
 if c=='C03':
  old=shop(c,key);flute=cut(old,nmask('M.75 .03 L.94 .01 L.99 .46 L.68 .46 Z',old));flute=flute.crop((int(.67*old.width),0,old.width,int(.50*old.height)));bag.alpha_composite(place(flute,[139,384,43,68]))
 strap.alpha_composite(bag);save(c,key,strap);PROFILE[c]['changes'].append('bag/right side; foreground wing occludes strap and upper bag')
 if 'head'in cf:
  key,rect,angle=cf['head'];art=asset(c,key);save(c,key,place(art,rect,angle));save(c,key+'_back',blank());PROFILE[c]['head']={'rect':rect,'rotation':angle,'rear_surface':'omitted in worn layer'}
 if cf.get('body'):
  key,rect=cf['body'];art=asset(c,key);cloth=place(art,rect)
  body=load(c,'parts/body').getchannel('A')
  for wing in ['nearWing','farWing']:body=ImageChops.lighter(body,load(c,'parts/'+wing).getchannel('A'))
  fit=body.filter(ImageFilter.MaxFilter(9 if c=='C04' else 5));cloth=cut(cloth,fit);save(c,key,cloth);PROFILE[c]['body']={'rect':rect,'clip':'actual registered torso silhouette','rear_neckline':'not drawn'}
 if c=='C02':
  im=neutral_lenses(asset(c,'aviators'),55);save(c,'aviators',eyes(im,[[.32,.44],[.81,.60]],[[358,169],[431,191]],c))
 if c=='C04':save(c,'glasses',shift_old(c,'glasses',1,1,-2,[368,190]))
 if c=='C06':
  im=asset(c,'glasses')
  lm=ImageChops.lighter(nmask('M.14 .25 C.22 .04 .42 .32 .44 .48 C.46 .72 .33 .89 .22 .75 C.15 .61 .12 .37 .14 .25 Z',im),nmask('M.62 .47 C.68 .29 .83 .21 .90 .26 C.94 .43 .83 .79 .72 .84 C.58 .91 .55 .68 .62 .47 Z',im))
  im=cut(im,ImageChops.invert(lm));save(c,'glasses',eyes(im,[[.275,.49],[.748,.54]],[[395,143],[462,164]],c))
 if c=='C05':
  save(c,'third_eye',place(shop(c,'third_eye'),[383,108,24,22]));save(c,'beads',place(asset(c,'beads'),[350,279,134,68],0));PROFILE[c]['third_eye']=[395,119];PROFILE[c]['neck']='front U only, no rear arc'
 if c in ['C03','C04','C06']:
  feet=load(c,'parts/feet')
  if c=='C03':feet.alpha_composite(place(asset(c,'ring07'),[279,515,22,11],-3));fk='ring07';PROFILE[c]['ankle_front']=[290,520.5]
  if c=='C04':
   a=feet.getchannel('A');ImageDraw.Draw(a).rectangle((0,(543+40)*2,SIZE[0],SIZE[1]),fill=0);feet.putalpha(a)
   feet.alpha_composite(place(asset(c,'crocs_green'),[162,525,145,82]));feet.alpha_composite(place(asset(c,'crocs_purple'),[325,526,155,86]));fk='crocs';PROFILE[c]['foot_front']={'green':[162,525,145,82],'purple':[325,526,155,86],'heel_back':'omitted'}
  if c=='C06':
   for key,r in [('anklet_left',[316,542,27,13]),('anklet_right',[397,542,28,13])]:feet.alpha_composite(place(asset(c,key),r))
   fk='anklets';PROFILE[c]['ankle_front']=[[329.5,548.5],[411,548.5]]
  save(c,fk,feet);atomic(feet,OUT/c/'feet_native.png');CHANGED[c+'/feet_native.png']={'file':c+'/feet_native.png','character':c,'alias_of':c+'/wear/'+fk+'.png'}

# Rebuild the real modular poses from registered layers, preserving the same canvas.
FITS={'C01':('hat','glasses','vest',None,'bag','boots'),'C02':('bandana','aviators','vest','cartridges','water_toy','boots'),'C03':('scarf','glasses','vest','beads','shopper_flute','ring07'),'C04':('pencil','glasses','coat','magnifier','satchel','crocs'),'C05':('hat','third_eye','robe','beads','cloth_bag','sandals'),'C06':('hat','glasses','vest','diamonds','bag_h','anklets')}
def rd(c,p):return Image.open(OUT/c/(p+'.png')).convert('RGBA')
def compose(c,pose='CARD',emotion='base',selected=None,right_wing=True):
 h,f,g,n,b,ft=FITS[c];on={'head','face','body','neck','bag','feet'} if selected is None else set(selected);out=blank()
 if pose=='NEST':out.alpha_composite(rd('props','nest_back'))
 if pose=='PERCH':out.alpha_composite(rd('props','perch'));out.alpha_composite(rd(c,'feet_perch'))
 if pose=='CARD':out.alpha_composite(rd(c,'wear/'+ft) if 'feet'in on else rd(c,'parts/feet'))
 if 'head'in on:out.alpha_composite(rd(c,'wear/'+h+'_back'))
 out.alpha_composite(rd(c,'parts/body'))
 for role,key in [('body',g),('neck',n),('bag',b)]:
  if key and role in on and not(role=='bag' and pose!='CARD'):out.alpha_composite(rd(c,'wear/'+key))
 for k in ['farWing','nearWing']:
  if k!='nearWing' or right_wing:out.alpha_composite(rd(c,'parts/'+k))
 head=rd(c,'head_native_base' if 'head'in on else 'parts/head')
 if emotion!='base':head=rd(c,'emotions/'+emotion+('_hat' if c in ['C01','C03','C05','C06'] and 'head'in on else '_bare'))
 out.alpha_composite(head)
 if 'head'in on:out.alpha_composite(rd(c,'wear/'+h))
 if 'face'in on:out.alpha_composite(rd(c,'wear/'+f))
 if pose=='NEST':out.alpha_composite(rd('props','nest_front_eggs'))
 return out
for c in CFG:
 for pose in ['CARD','PERCH','NEST']:atomic(compose(c,pose),OUT/c/'composites'/(pose+'.png'))
 im=compose(c);im=im.crop(im.getbbox());im.thumbnail((720,900));bg=Image.new('RGB',(760,940),'#dddcd7');bg.paste(im,((760-im.width)//2,20),im);bg.save(R/(c+'-review.jpg'),quality=95)
bd=Image.new('RGB',(1800,3*960),'#dddcd7');dr=ImageDraw.Draw(bd)
for i,c in enumerate(CFG):
 im=compose(c);im=im.crop(im.getbbox());im.thumbnail((850,880));x=(i%2)*900;y=(i//2)*960;bd.paste(im,(x+(900-im.width)//2,y+50),im);dr.text((x+20,y+15),c+' v07',fill='black')
bd.save(R/'review_six_v07.jpg',quality=95)
# One atlas per character: six network writes, unchanged component IDs.
AT=[]
for c in CFG:
 items=[x for x in CHANGED.values() if x['character']==c and not x.get('alias_of')];cols=min(3,len(items));rows=math.ceil(len(items)/cols);atlas=Image.new('RGBA',(1200*cols,1520*rows))
 for i,it in enumerate(items):
  col=i%cols;row=i//cols;atlas.alpha_composite(Image.open(OUT/it['file']).convert('RGBA'),(col*1200,row*1520));it.update(col=col,row=row,cols=cols,rows=rows)
 atomic(atlas,R/(c+'-registered-atlas.png'));AT.append({'character':c,'path':str(R/(c+'-registered-atlas.png')),'cols':cols,'rows':rows,'files':items})
 for it in [x for x in CHANGED.values() if x['character']==c and x.get('alias_of')]:
  src=CHANGED[it['alias_of']];it.update({k:src[k] for k in ['col','row','cols','rows']})
(R/'changed-layers-v07.json').write_text(json.dumps(CHANGED,ensure_ascii=False,indent=2));(R/'registered-atlases-v07.json').write_text(json.dumps(AT,ensure_ascii=False,indent=2));(R/'fitting-profiles-v07.json').write_text(json.dumps(PROFILE,ensure_ascii=False,indent=2))
M['version']='v07';M['changes']='Owner corrections: anatomical right bags, front-only redrawn wearable surfaces, torso clipping, ankle and eye anchors.';(OUT/'manifest.json').write_text(json.dumps(M,ensure_ascii=False,indent=2))
print(json.dumps({'changed':len(CHANGED),'atlases':len(AT)}))
