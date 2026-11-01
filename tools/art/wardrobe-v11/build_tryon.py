"""Fit existing registered sprites by similarities and depth masks; do not redraw birds."""
from pathlib import Path
import json,math,io,os
import numpy as np
from PIL import Image,ImageDraw,ImageFont,ImageChops
R=Path(os.environ.get('QURA_WORK_DIR',str(Path(__file__).parent)));BASE=Path(os.environ.get('QURA_BASE_DIR',str(R.parent/'modular-v08/QURA_modular_v08')));SRC=Path(os.environ.get('QURA_ACCESSORY_DIR',str(R/'inputs/QURA_accessory_slices_v09')));OUT=R/'QURA_tryon_v10';OUT.mkdir(parents=True,exist_ok=True);SIZE=(1200,1520)
NAMES={'C01':'Ряба','C02':'Боевик','C03':'Дурочка','C04':'Профессор','C05':'Монах','C06':'Гламурочка'}
REG=json.loads((SRC/'manifest.json').read_text());IDS={x['file']:x['figma_component_id']for x in REG['files']};AN=json.loads((R/'anatomy-map.json').read_text());AN={x['name'].replace('QuRa/v08/',''):x['id']for x in AN};E=json.loads((R/'eye-pins.json').read_text())
E['C01']['target_eyes']=[[346,205],[415,224]];E['C03']['target_eyes']=[[354,199],[428,223]];E['C06']['target_eyes']=[[397,185],[467,211]]
def atomic(im,p):
 p.parent.mkdir(parents=True,exist_ok=True);b=io.BytesIO();im.save(b,format='PNG',compress_level=4);tmp=p.with_suffix('.pending')
 with tmp.open('wb')as f:f.write(b.getvalue());f.flush();os.fsync(f.fileno())
 tmp.replace(p)
def identity():return [[1,0,0],[0,1,0]]
def fit(src,dst):
 p,q=[complex(*x)for x in src];u,v=[complex(*x)for x in dst];s=(v-u)/(q-p);t=u-s*p;return [[s.real,-s.imag,t.real],[s.imag,s.real,t.imag]]
def move(s=1,anchor=(0,0),delta=(0,0),rotate=0):
 a=math.radians(rotate);u=s*math.cos(a);v=s*math.sin(a);x,y=anchor;return [[u,-v,x-u*x+v*y+delta[0]],[v,u,y-v*x-u*y+delta[1]]]
def translate_after(m,dx,dy):
 m=[x.copy()for x in m];m[0][2]+=dx;m[1][2]+=dy;return m
def rect(b):
 x,y,r,d=b;return [(x,y),(r,y),(r,d),(x,d)]
def map_points(m,pts):return [(m[0][0]*x+m[0][1]*y+m[0][2],m[1][0]*x+m[1][1]*y+m[1][2])for x,y in pts]
def unmap_points(m,pts):
 t=np.eye(3);t[:2]=m;return map_points(np.linalg.inv(t)[:2],pts)
LAY={c:[]for c in NAMES}
def add(c,key,m=None,clip=None,inverse=False,z=0,label=None,base=False):
 f=c+'/'+key+'.png';path=(BASE if base else SRC)/f;fid=AN[c+'/'+key]if base else IDS[f]
 LAY[c].append({'source':f,'source_type':'anatomy'if base else'accessory','component_id':fid,'matrix':m or identity(),'clip':clip,'inverse_clip':inverse,'z':z,'name':label or key,'source_path':str(path.resolve())})
UNDER_IDS={'C01':'161:36','C02':'161:72','C03':'161:118','C04':'161:156','C05':'161:202','C06':'161:248'}
def underfill(c,key,hole,garment_matrix,donor_matrix=None):
 dm=donor_matrix or identity();target=map_points(garment_matrix,hole);clip=unmap_points(dm,target);f=c+'/wear/'+key+'.png'
 LAY[c].append({'source':f,'source_type':'underlay','component_id':UNDER_IDS[c],'matrix':dm,'clip':clip,'inverse_clip':False,'z':19,'name':'occluded cloth — existing wardrobe pixels','source_path':str((BASE/f).resolve())})
for c in NAMES:
 # Closed footwear replaces the complete bare foot; open sandals retain the foot.
 if c in ['C03','C05','C06']:add(c,'parts/legs_bare',base=True,z=3)
 if c=='C04':add(c,'parts/legs_bare',base=True,z=3,clip=rect([0,0,600,570]),label='upper legs — claws hidden')
 add(c,'parts/torso',base=True,z=10)
 add(c,'parts/left_wing',base=True,z=60)
 add(c,'parts/right_wing',base=True,z=61)
 add(c,'head_native_base',base=True,z=70)
 if c in E:
  key='aviators'if c=='C02'else'glasses';m=fit(E[c]['source_lens_centers'],E[c]['target_eyes']);add(c,key,m,z=90,label='glasses — optical centers')
 if c=='C01':
  gm=move(.96,(389,335));add(c,'vest',gm,z=20);underfill(c,'vest',rect([225,495,390,640]),gm)
  body=rect([215,500,385,640]);add(c,'bag',clip=body,inverse=True,z=30,label='bag strap');add(c,'bag',move(.88,(294,565),delta=(135,-25)),clip=body,z=31,label='bag — front right flank')
  add(c,'hat',move(.9,(385,160)),z=80)
  for side,sc,src,dst,box in [('left',1.12,(270.9,633.5),(268.2,558),[140,600,340,760]),('right',1.1,(418.8,629.5),(385.7,558),[350,600,580,760])]:add(c,'boots',move(sc,src,(dst[0]-src[0],dst[1]-src[1])),clip=rect(box),z=2,label=side+' boot')
 elif c=='C02':
  add(c,'vest',z=20);underfill(c,'vest',[(275,438),(390,444),(505,540),(480,570),(275,550)],identity());add(c,'cartridges',move(.94,(401,328),delta=(0,-5)),z=45);add(c,'bandana',move(.90,(388,165)),z=80)
  gun=move(.85,(398,447),delta=(90,5));add(c,'water_toy',move(1,delta=(-25,0)),clip=rect([470,300,550,435]),z=1,label='far carry strap — behind torso')
  add(c,'water_toy',gun,clip=rect([250,300,470,445]),z=35,label='near carry strap')
  add(c,'water_toy',gun,clip=rect([250,445,570,600]),z=65,label='water toy — visible in front of wing')
  for side,sc,src,dst,box in [('left',.88,(273.4,559),(288.7,519),[140,540,340,750]),('right',.83,(447.5,570.5),(410,536),[350,540,590,750])]:add(c,'boots',move(sc,src,(dst[0]-src[0],dst[1]-src[1])),clip=rect(box),z=2,label=side+' boot')
 elif c=='C03':
  gm=move(.98,(406,325),delta=(-5,0));add(c,'vest',gm,z=20);underfill(c,'vest',rect([280,466,388,565]),gm,move(1.04,(400,325)));add(c,'beads',move(.98,(401,335),delta=(-6,-7)),z=45)
  bm=move(.95,(300,520),delta=(130,-10));add(c,'shopper_flute',bm,z=30,label='shopper — front right flank')
  add(c,'shopper_flute',bm,clip=rect([334,426,371,484]),z=65,label='flute above wing')
  sm=move(.92,(400,180),delta=(-4,4));tail=rect([500,235,560,340]);add(c,'scarf',sm,clip=tail,inverse=True,z=80,label='scarf wrapped over crown');add(c,'scarf',translate_after(sm,-30,-12),clip=tail,z=69,label='scarf tail tucked behind head')
  add(c,'ring07',move(.62,(440,623),delta=(-162,-51),rotate=12),z=95,label='07 ring — visible left ankle')
 elif c=='C04':
  gm=move(.93,(385,315));add(c,'coat',gm,z=20);underfill(c,'coat',rect([198,465,363,620]),gm,move(1.25,(385,328)))
  add(c,'satchel',move(.9,(0,310),delta=(140,0)),z=30,label='satchel — front right flank')
  add(c,'magnifier',move(.9,(423,435),delta=(-17,-5)),z=45)
  pm=move(.85,(337,155),delta=(-27,10),rotate=-5);add(c,'pencil',pm,z=68,label='pencil behind hair');add(c,'pencil',pm,clip=rect([0,0,600,131]),z=85,label='pencil visible shaft')
  for side,src,dst,box in [('left',(246,641),(252,565),[80,610,335,760]),('right',(416,646),(389,565),[340,610,590,760])]:add(c,'crocs',move(.78,src,(dst[0]-src[0],dst[1]-src[1])),clip=rect(box),z=4,label=side+' croc — upper leg retained')
 elif c=='C05':
  gm=move(.9,(410,310));add(c,'robe',gm,z=20);underfill(c,'robe',rect([220,470,380,630]),gm,move(1.25,(410,325)));add(c,'beads',move(.84,(410,320)),z=45)
  strap=[(449,411),(463,418),(365,509),(354,516),(342,495)];body=[(220,470),(337,470),(348,482),(380,500),(380,620),(220,620)]
  add(c,'cloth_bag',gm,clip=strap,z=30,label='cloth shoulder strap')
  add(c,'cloth_bag',translate_after(gm,110,-10),clip=body,z=31,label='cloth bag — front right flank')
  add(c,'hat',move(.94,(414,165)),z=80)
  add(c,'third_eye',move(.75,(421,169),delta=(-7,-5)),z=90,label='third eye — forehead axis')
  straps=[(207,699),(215,685),(229,671),(242,665),(256,661),(269,663),(280,669),(290,680),(301,695),(303,707),(290,714),(288,703),(280,689),(269,680),(258,677),(248,679),(236,686),(225,700),(219,710),(208,710)]
  straps2=[(426,699),(440,675),(455,663),(471,658),(487,662),(501,672),(514,690),(516,704),(503,708),(501,697),(490,682),(476,676),(463,678),(450,686),(440,704),(434,712)]
  for side,src,dst,box,front in [('left',(270,700),(293,631),[180,650,355,760],straps),('right',(461,698),(450,626),[360,650,565,760],straps2)]:
   sm=move(.84,src,(dst[0]-src[0],dst[1]-src[1]));add(c,'sandals',sm,clip=rect(box),z=1,label=side+' wooden sandal platform');add(c,'sandals',sm,clip=front,z=5,label=side+' sandal strap over foot')
 elif c=='C06':
  gm=move(.97,(431,339));add(c,'vest',gm,z=20);underfill(c,'vest',rect([270,453,410,585]),gm);add(c,'diamonds',gm,z=45)
  add(c,'bag_h',move(.93,(390,340),delta=(100,-5)),z=30,label='H bag — front right flank')
  add(c,'hat',move(.92,(430,150)),z=80)
  for side,src,dst,box in [('left',(337.5,633.5),(333,617),[300,610,375,655]),('right',(421.5,628),(411,608),[390,600,460,655])]:add(c,'anklets',move(.75,src,(dst[0]-src[0],dst[1]-src[1])),clip=rect(box),z=95,label=side+' anklet — leg shaft')
MAN={'version':'v10 try-on','canvas_px':list(SIZE),'source_wardrobe':'v09 selected accessory slices','source_anatomy':'v08 locked bird layers','status':'try-on / owner review pending','characters':{}}
def render_layer(it):
 im=Image.open(it['source_path']).convert('RGBA')
 if it['clip']:
  mask=Image.new('L',SIZE);ImageDraw.Draw(mask).polygon([(round(x*2),round(y*2))for x,y in it['clip']],fill=255)
  if it['inverse_clip']:mask=ImageChops.invert(mask)
  im.putalpha(ImageChops.multiply(im.getchannel('A'),mask))
 M=np.array(it['matrix'],float);M[:,2]*=2;T=np.eye(3);T[:2]=M;inv=np.linalg.inv(T)
 return im.transform(SIZE,Image.Transform.AFFINE,tuple(inv[:2].flatten()),resample=Image.Resampling.BICUBIC)
cv=Image.new('RGB',(1800,1680),'#e3e2dc');dr=ImageDraw.Draw(cv);font=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',25)
for ci,c in enumerate(NAMES):
 out=Image.new('RGBA',SIZE);layers=sorted(LAY[c],key=lambda a:a['z'])
 for i,it in enumerate(layers):
  im=render_layer(it);name=f'{i:02d}-'+it['name'].replace('/','_').replace(' ','_')+'.png';atomic(im,OUT/c/'layers'/name);it['output']=c+'/layers/'+name;out.alpha_composite(im)
 atomic(out,OUT/c/'CARD.png');MAN['characters'][c]={'name':NAMES[c],'layers':layers,'composite':c+'/CARD.png'}
 out.thumbnail((570,760));x=ci%3*600;y=ci//3*840;cv.paste(out,(x+(600-out.width)//2,y+55),out);dr.text((x+18,y+12),NAMES[c],font=font,fill='#222')
cv.save(R/'QuRa_tryon_v10.jpg',quality=95);(R/'fit-config-v10.json').write_text(json.dumps(MAN,ensure_ascii=False,indent=2));(OUT/'fit-config-v10.json').write_text(json.dumps(MAN,ensure_ascii=False,indent=2));print(json.dumps({'characters':6,'layers':sum(len(v['layers'])for v in MAN['characters'].values()),'preview':str(R/'QuRa_tryon_v10.jpg')},ensure_ascii=False))
