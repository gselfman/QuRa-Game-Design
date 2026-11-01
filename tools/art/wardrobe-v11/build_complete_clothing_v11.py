"""Use complete wardrobe sources, repair lower-edge clipping from complete shop art,
and demonstrate every garment on its bird with no bags or straps present."""
from pathlib import Path
import json,io,os,shutil
import numpy as np
from scipy import ndimage
from PIL import Image,ImageDraw,ImageFont,ImageChops
R=Path(os.environ.get('QURA_WORK_DIR',str(Path(__file__).parent)));B=Path(os.environ.get('QURA_BASE_DIR',str(R.parent/'modular-v08/QURA_modular_v08')));OLD=R/'QURA_tryon_v10';P=R/'QURA_wardrobe_v11';P.mkdir(parents=True,exist_ok=True);SIZE=(1200,1520)
CFG=json.loads((R/'fit-config-v10.json').read_text());ITEM={'C01':'vest','C02':'vest','C03':'vest','C04':'coat','C05':'robe','C06':'vest'};N={c:d['name']for c,d in CFG['characters'].items()}
def atomic(im,p):
 p.parent.mkdir(parents=True,exist_ok=True);z=io.BytesIO();im.save(z,format='PNG',compress_level=4);t=p.with_suffix('.pending')
 with t.open('wb')as f:f.write(z.getvalue());f.flush();os.fsync(f.fileno())
 t.replace(p)
def matrix(s,anchor):
 x,y=anchor;return [[s,0,x-s*x],[0,s,y-s*y]]
M={'C01':matrix(1,(390,330)),'C02':matrix(1,(400,330)),'C03':matrix(1.07,(400,325)),'C04':matrix(1.2,(385,328)),'C05':matrix(1.22,(410,325)),'C06':matrix(1.04,(431,339))}
def warp(im,m):
 t=np.eye(3);t[:2]=m;t[0,2]*=2;t[1,2]*=2;inv=np.linalg.inv(t);return im.transform(SIZE,Image.Transform.AFFINE,tuple(inv[:2].flatten()),resample=Image.Resampling.BICUBIC)
manifest={'version':'v11 complete clothing','status':'prepared for owner review','canvas_px':[1200,1520],'garments':{},'characters':{}}
font=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',25)
boards={k:Image.new('RGB',(1800,1680),'#e3e2dc')for k in ['NO_BAG','FULL']}
for ci,(c,key)in enumerate(ITEM.items()):
 original=Image.open(B/c/'wear'/(key+'.png')).convert('RGBA');a=np.array(original);bb=original.getbbox();im=original.copy();repairs=0
 # Use the uncut catalogue front for garments with earlier rectangular hem nicks.
 if c in ['C04','C05']:
  shop=Image.open(B/c/'shop'/(key+'.png')).convert('RGBA');shop=shop.crop(shop.getbbox()).resize((bb[2]-bb[0],bb[3]-bb[1]),Image.Resampling.LANCZOS);donor=Image.new('RGBA',SIZE);donor.alpha_composite(shop,(bb[0],bb[1]));da=np.array(donor)
  yy=np.indices(a.shape[:2])[0];w=np.clip((yy-(bb[1]+.56*(bb[3]-bb[1])))/12,0,1)[:,:,None];oa=a[:,:,3:4].astype(float)/255;na=da[:,:,3:4].astype(float)/255;alpha=oa*(1-w)+na*w;rgb=a[:,:,:3]*oa*(1-w)+da[:,:,:3]*na*w;rgb=np.divide(rgb,alpha,out=np.zeros_like(rgb),where=alpha>0);mixed=np.concatenate([rgb,alpha*255],axis=2).clip(0,255).astype('uint8');repairs=int(((mixed[:,:,3]>0)&(a[:,:,3]==0)).sum());im=Image.fromarray(mixed)
 # Keep garment artwork, remove detached low-alpha needles from earlier exports.
 a=np.array(im);cc,n=ndimage.label(ndimage.binary_dilation(a[:,:,3]>70,iterations=2));areas=ndimage.sum(a[:,:,3]>70,cc,range(1,n+1));keep=np.flatnonzero(areas>150)+1;a[~np.isin(cc,keep)]=0;im=warp(Image.fromarray(a),M[c])
 if c=='C03':
  # The vest is open in front. The internal back strip must not cover the bird.
  a=np.array(im);a[365*2:522*2,414*2:445*2]=0
  arm=Image.new('L',SIZE);ImageDraw.Draw(arm).polygon([(x*2,y*2)for x,y in [(276,410),(312,408),(332,367),(340,361),(341,372),(335,398),(321,420),(305,432),(287,436),(278,430)]],fill=255)
  blue=(a[:,:,0]<80)&(a[:,:,1]<145)&(a[:,:,2]<180)&(a[:,:,2]>a[:,:,0]*1.2);a[(np.array(arm)>0)&blue]=0;im=Image.fromarray(a)
 atomic(im,P/c/'clothing'/f'{key}.png')
 garment_file=c+'/clothing/'+key+'.png';manifest['garments'][c]={'file':garment_file,'accessory':key,'source':'v08/wear/'+key,'uncut_reference':'v08/shop/'+key,'matrix':M[c],'hem_repair_pixels':repairs,'no_bag_or_strap_cutouts':True}
 # Show only the bird and its complete garment; nothing can conceal missing cloth.
 clean=Image.new('RGBA',SIZE)
 for f in ['parts/legs_bare','parts/torso']:clean.alpha_composite(Image.open(B/c/(f+'.png')).convert('RGBA'))
 clean.alpha_composite(im)
 for f in ['parts/left_wing','parts/right_wing','head_native_base']:clean.alpha_composite(Image.open(B/c/(f+'.png')).convert('RGBA'))
 atomic(clean,P/c/'NO_BAG.png')
 # Retain the fitted full outfit, replacing both the cut garment and its patchwork underlay.
 full=Image.new('RGBA',SIZE);items=[];inserted=False
 for l in CFG['characters'][c]['layers']:
  if l['source_type']=='underlay':continue
  if l['source_type']=='accessory'and l['source']==c+'/'+key+'.png':
   full.alpha_composite(im);items.append({'file':garment_file,'name':'complete '+key,'z':20,'source_type':'complete_clothing'});inserted=True;continue
  path=OLD/l['output'];full.alpha_composite(Image.open(path).convert('RGBA'));target=P/l['output'];target.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(path,target);items.append({'file':l['output'],'name':l['name'],'z':l['z'],'source_type':l['source_type'],'source':l['source']})
 assert inserted;atomic(full,P/c/'CARD.png');manifest['characters'][c]={'name':N[c],'full_outfit':c+'/CARD.png','without_bag':c+'/NO_BAG.png','layers':items}
 for tag,img in [('NO_BAG',clean),('FULL',full)]:
  img=img.copy();img.thumbnail((570,760));x=ci%3*600;y=ci//3*840;boards[tag].paste(img,(x+(600-img.width)//2,y+55),img);ImageDraw.Draw(boards[tag]).text((x+18,y+12),N[c],font=font,fill='#222')
for tag,b in boards.items():b.save(R/('QuRa_v11_'+tag+'.jpg'),quality=95)
(P/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2));(R/'manifest-v11.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2));print(json.dumps({'garments':6,'without_bag':6,'full_outfits':6,'repairs':{c:v['hem_repair_pixels']for c,v in manifest['garments'].items()}}))
