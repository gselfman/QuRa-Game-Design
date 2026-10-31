from pathlib import Path
import numpy as np
import io,os
def atomic(im,p):
 buf=io.BytesIO();im.save(buf,format="PNG",compress_level=3);tmp=p.with_suffix(".pending")
 with open(tmp,"wb") as f:f.write(buf.getvalue());f.flush();os.fsync(f.fileno())
 tmp.replace(p)
from PIL import Image,ImageChops,ImageFilter,ImageDraw
from scipy import ndimage
R=Path(__file__).parent
G={'C01':'exec-e6335da3-21da-46ad-9c57-2584e3354c23.png','C03':'exec-745ac3f8-14c7-4d35-964d-b85295d295e0.png','C06':'exec-09646b38-0ea1-472a-b6d5-9bba07778371.png'}
def centers(im,cid):
 if cid=='C01':return [[505,675],[770,767]] if im.width>1000 else [[240,333],[374,379]]
 a=np.array(im).astype(float);h,w=a.shape[:2];yy,xx=np.indices((h,w));region=(yy>h*.27)&(yy<h*.78)&(xx>w*.2)&(xx<w*.92)&(a[:,:,3]>128)
 if cid=='C03':
  masks=[region&(a[:,:,2]>a[:,:,0]*1.4)&(a[:,:,2]>a[:,:,1]*1.05)&(xx<w*.60),region&(a[:,:,1]>a[:,:,0]*1.35)&(a[:,:,1]>a[:,:,2]*1.15)&(xx>w*.50)]
 else:
  masks=[region&(a[:,:,1]>a[:,:,0]*1.3)&(a[:,:,2]>a[:,:,0]*1.25)&(xx>w*.62),region&(a[:,:,1]>a[:,:,0]*1.3)&(a[:,:,2]>a[:,:,0]*1.25)&(xx>w*.62)]
  masks[0]=region&(a[:,:,1]>a[:,:,0]*1.3)&(a[:,:,2]>a[:,:,0]*1.25)&(xx<w*.62)
 out=[]
 for m in masks:
  labs,num=ndimage.label(m);objects=ndimage.find_objects(labs);candidates=[]
  for i,sl in enumerate(objects,1):
   area=np.count_nonzero(labs[sl]==i)
   if area>10:
    cy,cx=ndimage.center_of_mass(m,labs,i);candidates.append((area,cx,cy))
  area,cx,cy=max(candidates);out.append([cx,cy])
 return out
for cid,path in G.items():
 gen=Image.open(R.parent/'generated_images'/path).convert('RGBA');orig=Image.open(R/(cid+'-head-edit.png')).convert('RGBA')
 src=centers(gen,cid);dst=centers(orig,cid);print(cid,src,dst)
 p,q=[complex(*x) for x in src];u,v=[complex(*x) for x in dst];z=(v-u)/(q-p);off=u-z*p;a,b=z.real,z.imag;tx,ty=off.real,off.imag;den=a*a+b*b
 registered=gen.transform(orig.size,Image.Transform.AFFINE,(a/den,b/den,(-a*tx-b*ty)/den,-b/den,a/den,(b*tx-a*ty)/den),Image.Resampling.BICUBIC)
 # Retouch only the comb/scalp zone; retain the original face and lower curls exactly.
 m=Image.new('L',orig.size);dr=ImageDraw.Draw(m)
 if cid=='C01':dr.polygon([(235,0),(650,0),(650,260),(470,320),(365,290),(275,220)],fill=255)
 elif cid=='C03':dr.polygon([(270,0),(650,0),(650,310),(500,325),(400,310),(320,220),(275,150)],fill=255)
 else:dr.polygon([(280,0),(650,0),(650,320),(530,340),(380,300),(340,210)],fill=255)
 m=m.filter(ImageFilter.GaussianBlur(6));patch=registered.copy();patch.putalpha(ImageChops.multiply(patch.getchannel('A'),m));native=orig.copy();native.putalpha(ImageChops.multiply(orig.getchannel('A'),ImageChops.invert(m)));native.alpha_composite(patch)
 full=Image.new('RGBA',(1200,1520));full.alpha_composite(native,(450,65));atomic(full,R/(cid+'-head-retouched-registered.png'))
 fullpatch=Image.new('RGBA',(1200,1520));fullpatch.alpha_composite(patch,(450,65));atomic(fullpatch,R/(cid+'-scalp-repair.png'))
 fm=Image.new('L',(1200,1520));fm.paste(m,(450,65));atomic(fm,R/(cid+'-scalp-mask.png'))
