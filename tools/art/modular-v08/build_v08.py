"""Registered fit corrections measured on the six original 600x760 canvases.
No character redraw. Existing raster gear is fitted by landmarks and front surface masks.
Exports retain the 1200x1520 registration canvas.
"""
from pathlib import Path
import json, io, os, math
import numpy as np
from PIL import Image,ImageDraw,ImageFont,ImageChops,ImageFilter
from scipy.interpolate import RBFInterpolator
R=Path(__file__).resolve().parent; OLD=Path(os.environ.get('QURA_V07_ROOT',R.parent/'modular-v07/QURA_modular_v07')); OUT=Path(os.environ.get('QURA_OUTPUT_ROOT',R/'QURA_modular_v08'));SIZE=(1200,1520)
CHANGED={};PROFILE={}
def blank():return Image.new('RGBA',SIZE)
def rd(c,p,root=OUT):return Image.open(root/c/(p+'.png')).convert('RGBA')
def atomic(im,path):
 a=np.array(im);a[a[:,:,3]==0,:3]=0;im=Image.fromarray(a)
 b=io.BytesIO();im.save(b,format='PNG',compress_level=4);tmp=path.with_suffix('.pending')
 with open(tmp,'wb') as f:f.write(b.getvalue());f.flush();os.fsync(f.fileno())
 tmp.replace(path)
def save(c,k,im):
 rel=f'{c}/wear/{k}.png';atomic(im,OUT/rel);CHANGED[rel]={'file':rel,'character':c};return im
def similarity(im,src,dst):
 p,q=[complex(*v) for v in src];u,v=[complex(*v) for v in dst];z=(v-u)/(q-p);off=u-z*p;a,b=z.real,z.imag;tx,ty=off.real*2,off.imag*2;den=a*a+b*b
 return im.transform(SIZE,Image.Transform.AFFINE,(a/den,b/den,(-a*tx-b*ty)/den,-b/den,a/den,(b*tx-a*ty)/den),Image.Resampling.BICUBIC)
def warp(im,src,dst):
 # Inverse thin plate spline on a 20px mesh, coordinates use a 600x760 design canvas.
 f=RBFInterpolator(np.array(dst,dtype=float),np.array(src,dtype=float),kernel='thin_plate_spline',smoothing=0)
 mesh=[];step=40
 for y in range(0,1520,step):
  for x in range(0,1200,step):
   x2=min(x+step,1200);y2=min(y+step,1520)
   v=f(np.array([[x/2,y/2],[x/2,y2/2],[x2/2,y2/2],[x2/2,y/2]]))*2
   mesh.append(((x,y,x2,y2),tuple(v.ravel())))
 return im.transform(SIZE,Image.Transform.MESH,mesh,Image.Resampling.BICUBIC)
def fitted(c,k,src,dst,kind='similarity'):
 im=rd(c,'wear/'+k,OLD);out=(similarity if kind=='similarity' else warp)(im,src,dst);save(c,k,out)
 PROFILE.setdefault(c,{})[k]={'method':kind,'source_landmarks':src,'target_landmarks':dst,'canvas':'600 x 760 (export x2)'}
 return out
# Optical centers are traced on actual bare heads. Fitting uses lens centers, never a sprite bounding box.
EYES={
'C01':('glasses',[[340,204],[409,227]],[[342,204],[411,223]]),
'C02':('aviators',[[358,209],[433,232]],[[359,205],[431,222]]),
'C03':('glasses',[[355,207],[427,232]],[[353,195],[426,224]]),
'C04':('glasses',[[333,220],[401,243]],[[334,222],[400,247]]),
'C06':('glasses',[[396,181],[462,207]],[[395,184],[465,210]])}
for c,(k,s,d) in EYES.items():fitted(c,k,s,d)
# Headwear contact line follows the scalp rather than the catalogue illustration's angle.
HATS={
'C01':([[318,146],[449,103]],[[314,121],[452,145]]),
'C05':([[329,166],[469,145]],[[326,138],[473,159]]),
'C06':([[337,139],[493,105]],[[343,119],[499,146]])}
for c,(s,d) in HATS.items():
 for k in ['hat','hat_back']:fitted(c,k,s,d)
fitted('C02','bandana',[[316,143],[392,147],[483,165],[395,135],[395,158],[280,165]],[[316,150],[392,159],[470,174],[395,142],[395,167],[292,176]],'tps')
fitted('C03','scarf',[[300,160],[490,181],[374,83],[278,197],[502,130],[336,92]],[[305,146],[488,161],[381,87],[298,190],[486,128],[344,94]],'tps')
# The bandana's hanging tie is behind the temple, clear of the near aviator lens.
band=rd('C02','wear/bandana');keepband=Image.new('L',SIZE,255);d=ImageDraw.Draw(keepband)
d.polygon([(v[0]*2,v[1]*2) for v in [(292,151),(343,148),(354,188),(347,224),(291,218)]],fill=0)
keepband=keepband.filter(ImageFilter.GaussianBlur(1.0));back=band.copy();back.putalpha(ImageChops.multiply(band.getchannel('A'),ImageChops.invert(keepband)));front=band.copy();front.putalpha(ImageChops.multiply(band.getchannel('A'),keepband));save('C02','bandana',front);save('C02','bandana_back',back)
PROFILE['C02']['bandana']['hanging_tie']='behind temple, clear of near lens'

# The scarf's hanging ends pass behind the head, not across the left eye and glasses.
scarf=rd('C03','wear/scarf');keep=Image.new('L',SIZE,255);d=ImageDraw.Draw(keep)
d.polygon([(v[0]*2,v[1]*2) for v in [(245,120),(365,128),(370,180),(365,235),(245,235)]],fill=0)
keep=keep.filter(ImageFilter.GaussianBlur(1.0));back=scarf.copy();back.putalpha(ImageChops.multiply(scarf.getchannel('A'),ImageChops.invert(keep)))
front=scarf.copy();front.putalpha(ImageChops.multiply(scarf.getchannel('A'),keep));save('C03','scarf',front);save('C03','scarf_back',back)
PROFILE['C03']['scarf']['hanging_ends']='behind head, clear of eye sockets'
# Small contact shadows at the hat band are clipped to the real original head.
for c in HATS:
 hat=rd(c,'wear/hat');a=hat.getchannel('A').filter(ImageFilter.GaussianBlur(2.4));shift=Image.new('L',SIZE);shift.paste(a,(0,6));head=rd(c,'head_native_base').getchannel('A');a=ImageChops.multiply(shift,head).point(lambda v:round(v*.23));sh=Image.new('RGBA',SIZE,(74,42,22,0));sh.putalpha(a);sh.alpha_composite(hat);save(c,'hat',sh)

# Forehead center follows the beak/face axis, not the center of the hat.
fitted('C05','third_eye',[[395,159],[395,170]],[[423,174],[423,185]])
# Individual torso seams: shoulder, neckline, chest and hem anchors.
CLOTH={
'C01':('vest',[[294,340],[434,352],[409,425],[400,516],[271,509],[490,505]],[[310,344],[434,349],[414,424],[405,518],[286,517],[488,510]]),
'C02':('vest',[[304,343],[447,344],[436,435],[421,534],[284,520],[514,520]],[[316,350],[448,350],[432,433],[423,529],[297,519],[505,518]]),
'C03':('vest',[[307,333],[466,337],[406,415],[398,524],[282,516],[518,518]],[[316,339],[461,340],[410,419],[402,524],[298,520],[507,522]]),
'C04':('coat',[[292,330],[430,333],[270,395],[414,456],[390,540],[500,500],[260,490]],[[310,337],[425,336],[291,390],[405,451],[385,532],[484,500],[278,491]]),
'C05':('robe',[[348,333],[433,334],[421,378],[405,426],[320,520],[498,509]],[[342,330],[437,337],[411,377],[407,421],[312,521],[490,523]]),
'C06':('vest',[[342,342],[460,352],[433,429],[432,465],[375,540],[500,468],[326,440]],[[332,346],[467,350],[420,413],[426,462],[372,534],[490,472],[326,437]])}
for c,(k,s,d) in CLOTH.items():fitted(c,k,s,d,'tps')
# Front necklace follows the base of the neck; remove the raised side-heavy arc.
fitted('C05','beads',[[353,326],[480,339],[430,374]],[[340,325],[449,331],[398,354]],'tps')
# Bags: move forward onto the flank under the right wing. The tail is not an anchor.
# All rects use actual design-canvas coordinates, unlike v07's undocumented +40 y.
BAGS={
'C01':('bag',(288,477,100,105),(329,352)),
'C02':('water_toy',(256,492,195,91),(345,352)),
'C03':('shopper_flute',(279,456,91,96),(331,346)),
'C04':('satchel',(277,482,100,82),(327,354)),
'C05':('cloth_bag',(288,483,91,80),(343,345)),
'C06':('bag_h',(300,485,94,75),(354,356))}
for c,(k,(x,y,w,h),shoulder) in BAGS.items():
 old=rd(c,'wear/'+k,OLD)
 # Extract only the bag body from the v07 placed artwork; no old straight strap.
 crops={'C01':(180,480,285,595),'C02':(125,496,335,596),'C03':(143,473,265,595),'C04':(163,495,280,581),'C05':(178,494,283,576),'C06':(170,480,282,565)}
 bb=crops[c];art=old.crop(tuple(round(t*2) for t in bb))
 if art.getbbox():art=art.crop(art.getbbox())
 art=art.resize((round(w*2),round(h*2)),Image.Resampling.LANCZOS)
 bag=blank();dr=ImageDraw.Draw(bag);end=(x+w*.52,y+7)
 color={'C01':'#b45720','C02':'#1672a7','C03':'#d6427e','C04':'#723d26','C05':'#ba9c62','C06':'#d5687c'}[c]
 if c=='C02':
  dr.line([(shoulder[0]*2,shoulder[1]*2),(end[0]*2,end[1]*2)],fill='#303537',width=11)
  dr.line([(shoulder[0]*2+2,shoulder[1]*2),(end[0]*2+2,end[1]*2)],fill='#677174',width=3)
 else:
  dr.line([(shoulder[0]*2,shoulder[1]*2),(end[0]*2,end[1]*2)],fill=color,width=8)
  bag.putalpha(ImageChops.multiply(bag.getchannel('A'),rd(c,'parts/right_wing').getchannel('A')))
 bag.alpha_composite(art,(round(x*2),round(y*2)))
 if c=='C03':
  # Preserve the exposed flute as part of the shopper, following the moved bag.
  flute=old.crop((139*2,424*2,182*2,492*2));flute=flute.resize((56,90),Image.Resampling.LANCZOS);bag.alpha_composite(flute,((x+7)*2,(y-43)*2))
 save(c,k,bag);PROFILE.setdefault(c,{})[k]={'body_rect':[x,y,w,h],'shoulder':shoulder,'side':'right flank, under foreground wing, forward of tail'}
FITS={'C01':('hat','glasses','vest',None,'bag','boots'),'C02':('bandana','aviators','vest','cartridges','water_toy','boots'),'C03':('scarf','glasses','vest','beads','shopper_flute','ring07'),'C04':('pencil','glasses','coat','magnifier','satchel','crocs'),'C05':('hat','third_eye','robe','beads','cloth_bag','sandals'),'C06':('hat','glasses','vest','diamonds','bag_h','anklets')}
def compose(c,pose='CARD',emotion='base',selected=None,right_wing=True):
 h,f,g,n,b,ft=FITS[c];on={'head','face','body','neck','bag','feet'} if selected is None else set(selected);out=blank()
 if pose=='NEST':out.alpha_composite(rd('props','nest_back'))
 if pose=='PERCH':out.alpha_composite(rd('props','perch'));out.alpha_composite(rd(c,'feet_perch'))
 if pose=='CARD':out.alpha_composite(rd(c,'wear/'+ft) if 'feet'in on else rd(c,'parts/feet'))
 if 'head'in on:out.alpha_composite(rd(c,'wear/'+h+'_back'))
 out.alpha_composite(rd(c,'parts/body'))
 for role,key in [('body',g),('bag',b),('neck',n)]:
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
NAMES=['Ряба','Боевик','Дурочка','Профессор','Монах','Гламурочка'];font=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',25)
bd=Image.new('RGB',(1500,1500),'#dbdad6');dr=ImageDraw.Draw(bd)
for i,c in enumerate(FITS):
 for pose in ['CARD','PERCH','NEST']:atomic(compose(c,pose),OUT/c/'composites'/(pose+'.png'))
 im=compose(c);im=im.crop(im.getbbox());im.thumbnail((720,880));bg=Image.new('RGB',(760,940),'#dbdad6');bg.paste(im,((760-im.width)//2,20),im);bg.save(R/(c+'-review-v08.jpg'),quality=95)
 im=compose(c).crop(compose(c).getbbox());im.thumbnail((480,660));x=(i%3)*500;y=(i//3)*750;bd.paste(im,(x+(500-im.width)//2,y+45),im);dr.text((x+15,y+10),NAMES[i]+' · v08',font=font,fill='#222222')
bd.save(R/'QuRa_v08_review.jpg',quality=95)
(R/'changed-layers-v08.json').write_text(json.dumps(CHANGED,ensure_ascii=False,indent=2));(R/'landmarks-v08.json').write_text(json.dumps(PROFILE,ensure_ascii=False,indent=2))
print(json.dumps({'updated':len(CHANGED)}))
