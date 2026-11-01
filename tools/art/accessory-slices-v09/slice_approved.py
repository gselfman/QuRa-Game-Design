"""Lossless pixel partition of the six selected accessory-only images.
No retargeting, warping, repainting or reconstruction of hidden surfaces.
All exports share a 1200x1520 canvas and rebuild the cleaned source exactly.
"""
from pathlib import Path
import sys,json,hashlib,math,shutil,argparse
sys.path.insert(0,str(Path(__file__).parent/'deps'))
import cv2,numpy as np
from scipy import ndimage
from PIL import Image,ImageDraw,ImageFont,ImageChops
from raster_io import atomic
args=argparse.ArgumentParser();args.add_argument('--sources',type=Path);args.add_argument('--out',type=Path);args.add_argument('--work',type=Path);args=args.parse_args()
R=args.work or Path(__file__).parent;R.mkdir(parents=True,exist_ok=True);SRC=args.sources or R/'final-extracted';P=args.out or R/'QURA_accessory_slices_v09';P.mkdir(parents=True,exist_ok=True);SIZE=(1200,1520)
def blank():return Image.new('RGBA',SIZE)
def poly(points):
 m=Image.new('L',SIZE);ImageDraw.Draw(m).polygon([(round(x*2),round(y*2)) for x,y in points],fill=255);return m

def rect(box):
 x,y,x2,y2=box;return poly([(x,y),(x2,y),(x2,y2),(x,y2)])
def ell(box):
 m=Image.new('L',SIZE);ImageDraw.Draw(m).ellipse(tuple(round(v*2) for v in box),fill=255);return m

def un(*ms):
 m=Image.new('L',SIZE)
 for a in ms:m=ImageChops.lighter(m,a)
 return m

def diff(a,b):return ImageChops.multiply(a,ImageChops.invert(b))
from slice_geometry import masks
NAMES={'C01':'Ряба','C02':'Боевик','C03':'Дурочка','C04':'Профессор','C05':'Монах','C06':'Гламурочка'}
ITEMS={'C01':['hat','glasses','vest','bag','boots'],'C02':['bandana','aviators','cartridges','vest','water_toy','boots'],'C03':['scarf','glasses','beads','vest','shopper_flute','ring07'],'C04':['pencil','glasses','coat','magnifier','satchel','crocs'],'C05':['hat','third_eye','beads','robe','cloth_bag','sandals'],'C06':['hat','glasses','diamonds','vest','bag_h','anklets']}
TITLE={'hat':'Шляпа','glasses':'Очки','vest':'Жилет','bag':'Сумка с ремнём','boots':'Пара ботинок','bandana':'Повязка','aviators':'Авиаторы','cartridges':'Патроны','water_toy':'Водяная пушка с ремнём','scarf':'Платок','beads':'Бусы','shopper_flute':'Шопер с дудкой','ring07':'Кольцо 07','pencil':'Карандаш','coat':'Халат','magnifier':'Лупа на шнурке','satchel':'Сумка с блокнотом','crocs':'Пара кроксов','third_eye':'Третий глаз','robe':'Одеяние с поясом','cloth_bag':'Тканевая сумка','sandals':'Пара сандалий','diamonds':'Бриллиантовое ожерелье','bag_h':'Сумка H с ремнём','anklets':'Пара браслетов'}
# Visible front-over-back order determines ownership of pixels where items touch.
PRIORITY={'C01':['vest','bag','hat','glasses','boots'],'C02':['vest','water_toy','cartridges','bandana','aviators','boots'],'C03':['vest','shopper_flute','beads','scarf','glasses','ring07'],'C04':['coat','satchel','magnifier','glasses','pencil','crocs'],'C05':['robe','cloth_bag','beads','hat','third_eye','sandals'],'C06':['vest','bag_h','diamonds','hat','glasses','anklets']}
MAN={'version':'v09 accessory slices','canvas_px':[1200,1520],'origin_px':[0,0],'source_set':'six most recent accessory-only images selected by the user','files':[],'sources':[],'limitations':'Only visible source pixels are cut. Hidden cloth or other surfaces behind overlapping items are not invented.'};TEST=[];AT=[]
for c,keys in ITEMS.items():
 src=SRC/(c+'.png')
 if not src.exists():src=SRC/(c+'-original-selected-sheet.png')
 a=np.array(Image.open(src).convert('RGBA'));a[a[:,:,3]<4]=0;m=masks(c)
 # Use each item's original alpha and color verbatim. One visible pixel belongs to one layer only.
 lab=np.zeros(a.shape[:2],np.uint8);ids={k:i+1 for i,k in enumerate(keys)};fg=a[:,:,3]>0
 for k in PRIORITY[c]:lab[m[k]&fg]=ids[k]
 # Complete anti-aliased borders that lie just outside hand-marked semantic regions.
 missing=fg&(lab==0)
 if missing.any():
  _,nearest=ndimage.distance_transform_edt(lab==0,return_indices=True);lab[missing]=lab[nearest[0][missing],nearest[1][missing]]
 if np.any(fg&(lab==0)):raise RuntimeError(c+' has unassigned visible pixels')
 # Snap the hand-marked shared boundaries to the existing image edges.
 # Transparent source pixels remain transparent; no colors or shapes are painted.
 for k in PRIORITY[c]:
  if k in ['vest','coat','robe','hat','scarf','bandana','boots','crocs','sandals','anklets','ring07','pencil','glasses','aviators','third_eye']:continue
  target=lab==ids[k]
  other=fg&~target
  dt=ndimage.distance_transform_edt(~target)
  do=ndimage.distance_transform_edt(~other)
  ys,xs=np.where(target);x0=max(0,xs.min()-40);x1=min(1200,xs.max()+41);y0=max(0,ys.min()-40);y1=min(1520,ys.max()+41)
  gm=np.zeros(lab.shape,np.uint8);gm[fg]=cv2.GC_PR_BGD;gm[target]=cv2.GC_PR_FGD
  gm[target&(do>22)]=cv2.GC_FGD;gm[other&(dt>22)]=cv2.GC_BGD
  region=gm[y0:y1,x0:x1].copy()
  if np.sum(region==cv2.GC_FGD)<10:continue
  bgr=cv2.cvtColor(a[y0:y1,x0:x1,:3],cv2.COLOR_RGB2BGR)
  cv2.grabCut(bgr,region,None,np.zeros((1,65),np.float64),np.zeros((1,65),np.float64),4,cv2.GC_INIT_WITH_MASK)
  pred=np.zeros_like(fg);pred[y0:y1,x0:x1]=np.isin(region,[cv2.GC_FGD,cv2.GC_PR_FGD]);pred&=fg&(dt<=22)
  lab[target&~pred]=0;lab[pred]=ids[k]
  missing=fg&(lab==0)
  if missing.any():
   _,nearest=ndimage.distance_transform_edt(lab==0,return_indices=True);lab[missing]=lab[nearest[0][missing],nearest[1][missing]]
 # Thin rims and cords use their existing material at the shared seam.
 hsv=cv2.cvtColor(a[:,:,:3],cv2.COLOR_RGB2HSV);H,S,V=[hsv[:,:,i]for i in range(3)];yy,xx=np.indices(lab.shape)
 if c=='C02':
  blue=(H>77)&(H<117)&(S>100)&(V>45)&(yy>600)&(yy<870)&(xx>540)&(xx<1045)&fg
  lab[ndimage.binary_dilation(blue,iterations=1)&fg]=ids['water_toy']
  gold=(H>8)&(H<46)&(S>75)&(V>75)&fg
  lab[gold&(xx>560)&(xx<1080)&(yy>356)&(yy<565)]=ids['aviators']
 elif c=='C03':
  pink=(H>145)&(H<177)&(S>150)&(V>100)&fg
  expand=ndimage.binary_dilation(m['glasses'],iterations=14)
  pink=pink&expand;cc,n=ndimage.label(pink);area=ndimage.sum(pink,cc,range(1,n+1));largest=int(np.argmax(area))+1
  rim=ndimage.binary_fill_holes(cc==largest);rim=ndimage.binary_dilation(rim,iterations=2)&fg
  lab[(lab==ids['glasses'])&~rim]=ids['scarf'];lab[rim]=ids['glasses']
 elif c=='C04':
  cord=ndimage.binary_dilation(m['magnifier']&(yy<792),iterations=10)&(a[:,:,0]>a[:,:,1]*1.3)&(a[:,:,1]<170)&(a[:,:,2]<130)&fg
  lab[cord]=ids['magnifier']
 elif c=='C05':
  cream=(a[:,:,0]>170)&(a[:,:,1]>120)&(a[:,:,0]<a[:,:,1]*1.25)
  lab[(lab==ids['beads'])&cream]=ids['robe']
  core=m['third_eye']&(a[:,:,3]>20);labs,n=ndimage.label(core);areas=ndimage.sum(core,labs,range(1,n+1));main=int(np.argmax(areas))+1
  maincore=labs==main;othercore=core&~maincore
  dm=ndimage.distance_transform_edt(~maincore);do=ndimage.distance_transform_edt(~othercore)
  eye=m['third_eye']&fg&(dm<=do)
  lab[lab==ids['third_eye']]=ids['hat'];lab[eye]=ids['third_eye']
 elif c=='C06':
  gold=(H>14)&(H<39)&(S>195)&(V>110)&m['glasses']&fg
  gold=ndimage.binary_dilation(gold,iterations=2)&fg
  old=(lab==ids['glasses']);lab[old&~gold]=ids['hat'];lab[gold]=ids['glasses']
  lab[(lab==ids['glasses'])&(yy<305)&(xx<775)]=ids['hat']
  pink=(S>95)&((H>145)|(H<4))&(V>70)
  jewels=m['diamonds']&fg&~pink
  lab[jewels]=ids['diamonds']
  extra=(lab==ids['diamonds'])&pink
  lab[extra&m['bag_h']]=ids['bag_h'];lab[extra&~m['bag_h']]=ids['vest']
  lab[(lab==ids['bag_h'])&(xx>830)&(yy>950)&(yy<1030)]=ids['vest']
  neckline=np.array(poly([(370,296),(486,296),(486,345),(479,353),(469,361),(455,363),(444,356),(430,351),(419,348),(410,343),(400,340),(389,332),(380,328),(370,325)]))>0
  lab[(lab==ids['vest'])&neckline]=ids['diamonds']
 # Keep the original separately. Tiny detached seam crumbs are retained for audit,
 # while the accessory files contain only the substantial connected artwork.
 original=a.copy();removed=np.zeros_like(fg)
 for k in keys:
  p=lab==ids[k];cc,n=ndimage.label(ndimage.binary_dilation(p,iterations=2));areas=ndimage.sum(p,cc,range(1,n+1))
  threshold=400 if k in ['vest','coat','robe','hat','scarf','bandana','glasses','aviators'] else 180
  keep=np.flatnonzero(areas>=threshold)+1
  if k=='cartridges':keep=[int(np.argmax(areas))+1]
  if c=='C02' and k=='vest':keep=(np.argsort(areas)[-2:]+1).tolist()
  removed|=p&~np.isin(cc,keep)
  if k not in ['third_eye','magnifier','glasses','aviators']:
   strong=ndimage.binary_dilation(p&(a[:,:,3]>90),iterations=4)
   removed|=p&~strong
  if c=='C06' and k=='vest':
   solid=ndimage.binary_opening(p&(a[:,:,3]>50),iterations=3)
   removed|=p&~ndimage.binary_dilation(solid,iterations=5)
 a[removed]=0;lab[removed]=0
 (P/'sources').mkdir(exist_ok=True);atomic(Image.fromarray(original),P/'sources'/(c+'-original-selected-sheet.png'))
 residue=original.copy();residue[~removed]=0;atomic(Image.fromarray(residue),P/'sources'/(c+'-seam-residuals.png'))
 clean=Image.fromarray(a);atomic(clean,P/'sources'/(c+'-selected-sheet.png'));atomic(clean,R/(c+'-selected-clean.png'))
 rebuild=blank();items=[]
 for k in keys:
  part=a.copy();part[lab!=ids[k]]=0;im=Image.fromarray(part);path=P/c/(k+'.png');path.parent.mkdir(exist_ok=True);atomic(im,path);rebuild.alpha_composite(im);bb=im.getbbox()
  if bb is None:raise RuntimeError(c+'/'+k+' is empty')
  it={'file':str(path.relative_to(P)),'character':c,'character_name':NAMES[c],'accessory':k,'label':TITLE[k],'bbox_px':list(bb),'size_px':list(SIZE),'sha256':hashlib.sha256(path.read_bytes()).hexdigest()};items.append(it);MAN['files'].append(it)
 aa=np.array(rebuild);delta=np.abs(aa.astype(np.int16)-a.astype(np.int16));qa={'character':c,'parts':len(keys),'different_pixels':int(np.any(delta,axis=2).sum()),'max_channel_error':int(delta.max()),'seam_residual_pixels':int(removed.sum())};TEST.append(qa)
 if qa['different_pixels']:raise RuntimeError(str(qa))
 atomic(rebuild,P/'sources'/(c+'-rebuilt.png'));MAN['sources'].append({'character':c,'file':'sources/'+c+'-selected-sheet.png','parts':len(keys),'recomposition':qa})
 # One source + tightly packed part crops per Figma upload, all at original pixel resolution.
 W=2400;x=0;y=0;rh=0;tiles=[{'kind':'source','file':'sources/'+c+'-selected-sheet.png','bbox_px':[0,0,1200,1520],'crop_size':[1200,1520]}]
 for it in items:tiles.append({'kind':'part',**it,'crop_size':[it['bbox_px'][2]-it['bbox_px'][0],it['bbox_px'][3]-it['bbox_px'][1]]})
 for t in tiles:
  w,h=t['crop_size']
  if x+w>W:x=0;y+=rh+8;rh=0
  t['atlas_xy']=[x,y];x+=w+8;rh=max(rh,h)
 H=y+rh;atlas=Image.new('RGBA',(W,H))
 for t in tiles:
  im=Image.open(P/t['file']).convert('RGBA').crop(t['bbox_px']);atlas.alpha_composite(im,tuple(t['atlas_xy']))
 ap=R/(c+'-slices-atlas.png');atomic(atlas,ap);AT.append({'character':c,'path':str(ap.resolve()),'size':[W,H],'tiles':tiles})
# Human review: every accessory cropped only for this JPG preview, never for the game PNG export.
font=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',18);big=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',25)
cv=Image.new('RGB',(1800,6*320),'#e4e3de');dr=ImageDraw.Draw(cv)
for ci,c in enumerate(ITEMS):
 dr.text((15,ci*320+8),NAMES[c],font=big,fill='#222')
 for j,k in enumerate(ITEMS[c]):
  it=next(it for it in MAN['files'] if it['character']==c and it['accessory']==k);im=Image.open(P/it['file']).convert('RGBA').crop(it['bbox_px']);im.thumbnail((275,235));x=j*300;y=ci*320;cv.paste(im,(x+(300-im.width)//2,y+47),im);dr.text((x+12,y+287),TITLE[k],font=font,fill='#222')
cv.save(R/'QuRa_35_accessory_slices_v09.jpg',quality=95)
proof=Image.new('RGB',(1800,6*430),'#dddcd7');d=ImageDraw.Draw(proof)
for ci,c in enumerate(ITEMS):
 for j,kind in enumerate(['selected-sheet','rebuilt']):
  im=Image.open(P/'sources'/(c+'-'+kind+'.png')).convert('RGBA');im.thumbnail((570,390));proof.paste(im,(j*600+(600-im.width)//2,ci*430+35),im)
 d.text((1220,ci*430+120),NAMES[c],font=big,fill='#222');d.text((1220,ci*430+165),str(len(ITEMS[c]))+' PNG · 0 отличий',font=big,fill='#222')
 d.text((15,ci*430+7),'Исходный лист',font=font,fill='#222');d.text((615,ci*430+7),'Обратная сборка',font=font,fill='#222')
proof.save(R/'QuRa_slicing_roundtrip_v09.jpg',quality=94)
(P/'manifest.json').write_text(json.dumps(MAN,ensure_ascii=False,indent=2));(R/'slice-manifest-v09.json').write_text(json.dumps(MAN,ensure_ascii=False,indent=2));(R/'slice-qa-v09.json').write_text(json.dumps({'parts':len(MAN['files']),'sheets':6,'checks':TEST},ensure_ascii=False,indent=2));(R/'slice-atlases-v09.json').write_text(json.dumps(AT,ensure_ascii=False,indent=2))
print(json.dumps({'parts':len(MAN['files']),'tests':TEST,'atlas_sizes':[(a['character'],a['size'],Path(a['path']).stat().st_size) for a in AT]},ensure_ascii=False))
