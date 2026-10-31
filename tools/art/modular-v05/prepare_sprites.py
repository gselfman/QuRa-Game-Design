"""Deterministic cuts/registration of approved raster sheets; no image generation.
Virtual canvas 600x680, exported at 2x. Inputs and outputs stay separately versioned.
"""
from pathlib import Path
import json, math, io, os
import numpy as np
from PIL import Image, ImageDraw, ImageChops, ImageFilter
from fontTools.pens.basePen import BasePen
from fontTools.svgLib.path import parse_path
from scipy import ndimage

ROOT=Path(__file__).resolve().parent
WORK=ROOT.parent
OUT=ROOT/'sprites'
OUT.mkdir(exist_ok=True)
S=2
SIZE=(600*S,680*S)
CONFIG=json.loads((ROOT/'characters.json').read_text())
FITS=json.loads((ROOT/'native-fits.json').read_text())
RAW=json.loads((ROOT/'catalog-raw.json').read_text())
INDEX={x['hash']:WORK/x['path'] for x in json.loads((WORK/'local-images-index.json').read_text())}
INDEX.update({'dc231a9d92b8c57f780aadd43297855e5236ada9':WORK/'generated_images/exec-7aeb0999-678d-41f1-9150-685e8959c5b5.png','0e1428647f1a5f46ffbfd088195cc3ac5f72ff09':WORK/'generated_images/exec-b3434f3d-cff8-48de-98f0-4028614a8597.png'})

class FlatPen(BasePen):
    def __init__(self):super().__init__(None);self.paths=[];self.p=[]
    def _moveTo(self,p):
        if self.p:self.paths.append(self.p)
        self.p=[p]
    def _lineTo(self,p):self.p.append(p)
    def _curveToOne(self,a,b,c):
        p=self._getCurrentPoint()
        for t in np.linspace(0,1,30)[1:]:
            u=1-t;self.p.append(tuple(u**3*p[i]+3*u*u*t*a[i]+3*u*t*t*b[i]+t**3*c[i] for i in range(2)))
    def _qCurveToOne(self,a,b):
        p=self._getCurrentPoint()
        for t in np.linspace(0,1,24)[1:]:
            u=1-t;self.p.append(tuple(u*u*p[i]+2*u*t*a[i]+t*t*b[i] for i in range(2)))
    def _closePath(self):self.paths.append(self.p);self.p=[]
    def _endPath(self):
        if self.p:self.paths.append(self.p);self.p=[]

def mask(d,size=SIZE,scale=S,union=False):
    pen=FlatPen();parse_path(d,pen);pen._endPath();result=Image.new('L',size)
    for poly in pen.paths:
        m=Image.new('L',size);ImageDraw.Draw(m).polygon([(x*scale,y*scale) for x,y in poly],fill=255)
        result=ImageChops.lighter(result,m) if union else ImageChops.difference(result,m)
    return result

def cut(im,m):
    a=im.copy();a.putalpha(ImageChops.multiply(a.getchannel('A'),m));return a

def source(hash):return Image.open(INDEX[hash]).convert('RGBA')
def blank():return Image.new('RGBA',SIZE)
def place(canvas,img,rect):
    x,y,w,h=rect;canvas.alpha_composite(img.resize((round(w*S),round(h*S)),Image.Resampling.LANCZOS),(round(x*S),round(y*S)))
def save(im,name,**meta):
    p=OUT/(name+'.png');p.parent.mkdir(parents=True,exist_ok=True)
    arr=np.array(im);arr[arr[:,:,3]==0,:3]=0;im=Image.fromarray(arr)
    buf=io.BytesIO();im.save(buf,format='PNG',compress_level=7);tmp=p.with_suffix('.pending')
    with open(tmp,'wb') as stream:stream.write(buf.getvalue());stream.flush();os.fsync(stream.fileno())
    tmp.replace(p)
    ASSETS.append({'name':name,'path':str(p),'width':im.width,'height':im.height,**meta});return p
def registered_source(c,hash=None):
    im=source(hash or c['hash']);im=im.resize((600*S,round(600*S*im.height/im.width)),Image.Resampling.LANCZOS);out=blank();out.alpha_composite(im);return out
ASSETS=[]
shops={}
for item in RAW:
    x,y,w,h=item['box'];im=source(item['hash']).crop((x,y,x+w,y+h));im=cut(im,mask(item['path'],(w,h),1));shops[item['id']]=im

parts={}
for c in CONFIG:
    cid=c['id'];base=registered_source(c);headsrc=registered_source(c,c.get('headHash',c['hash']))
    pm={k:mask(c[k]) for k in ['head','nearWing','farWing']}
    # Full lower rectangle prevents loss of outer claw tips from approximate leg polygons.
    pm['feet']=mask(c['feet']+' M0 535 L600 535 L600 680 L0 680 Z',union=True)
    body=Image.new('L',SIZE,255)
    for m in pm.values():body=ImageChops.subtract(body,m)
    limit={'C01':536,'C02':513,'C03':520,'C04':513,'C05':520,'C06':530}[cid]
    ImageDraw.Draw(body).rectangle((0,limit*S,SIZE[0],SIZE[1]),fill=0);pm['body']=body
    parts[cid]={}
    for key,m in pm.items():
        im=cut(headsrc if key=='head' else base,m);parts[cid][key]=im;save(im,cid+'/parts/'+key,kind='part',character=cid,key=key)
    ft=FITS[cid]['feet'];shoe=shops['qura_'+cid.lower()+'_'+ft['key']];native=blank()
    if ft['mode']=='replace':
        r=list(ft['rect']);
        if cid=='C01':r[1]=475
        if cid=='C02':shoe=shoe.crop((0,0,shoe.width,264))
        place(native,shoe,r)
    elif ft['mode']=='upperleg':
        upper=parts[cid]['feet'].copy();a=upper.getchannel('A');ImageDraw.Draw(a).rectangle((0,ft['legBottom']*S,SIZE[0],SIZE[1]),fill=0);upper.putalpha(a);native.alpha_composite(upper);place(native,shoe,ft['rect'])
    elif ft['mode']=='ring':native.alpha_composite(parts[cid]['feet']);place(native,shoe,ft['rect'])
    elif ft['mode']=='anklets':
        native.alpha_composite(parts[cid]['feet'])
        for j,r in enumerate(ft['rects']):place(native,shoe.crop((shoe.width*j//2,0,shoe.width*(j+1)//2,shoe.height)),r)
    elif ft['mode']=='sandals':
        r=[220,543,310,97];place(native,shoe,r);native.alpha_composite(parts[cid]['feet'])
        arr=np.array(shoe);yy=np.arange(shoe.height)[:,None];dark=(arr[:,:,0]<185)&(arr[:,:,1]<115)&(arr[:,:,2]<90)&(arr[:,:,3]>128)&(yy<shoe.height*.64)
        dark=ndimage.binary_fill_holes(ndimage.binary_closing(dark,iterations=2));dark=ndimage.binary_dilation(dark,iterations=1);strap=cut(shoe,Image.fromarray((dark*255).astype('uint8')));place(native,strap,r)
    save(native,cid+'/feet_native',kind='feet_native',character=cid)

FACE={
'C01':'M309 112 Q350 90 391 120 Q430 119 449 149 L460 207 Q442 230 415 236 L410 271 L353 275 L341 245 Q295 239 288 203 Q287 163 309 112 Z',
'C02':'M318 117 Q345 98 382 125 L413 140 Q443 117 465 141 L478 205 L470 245 Q447 266 420 267 L413 289 L366 282 L351 260 Q318 251 309 223 Z',
'C03':'M321 106 Q358 91 391 123 L420 131 Q456 128 470 159 L482 218 Q461 248 425 249 L419 281 L366 286 L350 256 Q310 243 301 207 Z',
'C04':'M300 134 Q333 107 364 141 L394 155 Q420 133 438 162 L449 220 Q434 245 408 250 L403 283 L348 287 L330 258 Q290 240 282 210 Z',
'C05':'M326 119 Q359 103 389 127 L424 136 Q448 123 465 144 L471 195 Q451 211 426 220 L422 264 L366 269 L359 231 Q329 216 318 185 Z',
'C06':'M360 108 Q390 88 423 114 L452 127 Q480 113 496 141 L504 197 Q484 225 453 230 L447 266 L395 268 L384 238 Q350 225 344 182 Z'}
FACE.update({
'C01':'M294 100 Q350 75 402 108 L439 110 Q467 140 465 210 Q445 245 418 250 L418 295 L340 295 L334 251 Q294 239 282 205 Z',
'C02':'M307 104 Q350 86 395 112 L435 106 L477 125 L485 245 Q460 271 420 281 L420 312 L350 312 L342 269 Q307 249 302 218 Z',
'C03':'M307 91 Q358 74 399 112 L439 116 Q473 125 484 168 L488 225 Q465 252 428 260 L425 300 L352 300 L343 260 Q304 247 294 207 Z',
'C04':'M288 116 Q337 95 376 129 L413 133 Q443 143 455 178 L457 231 Q435 252 413 259 L410 305 L337 305 L326 262 Q287 245 276 209 Z',
'C05':'M319 104 Q365 88 400 112 L441 111 Q470 115 476 151 L480 197 Q452 216 425 216 L420 226 Q390 235 355 226 Q330 216 312 180 Z',
'C06':'M348 93 Q395 73 435 103 L471 99 Q500 108 509 143 L511 201 Q489 230 454 238 L450 290 L386 290 L381 240 Q344 224 338 180 Z'})
TARGET={'C01':[(338,160),(404,184)],'C02':[(358,166),(430,189)],'C03':[(353,157),(429,185)],'C04':[(337,178),(401,201)],'C05':[(372,154),(437,171)],'C06':[(392,140),(462,164)]}
LANDMARKS={
'C01':[[[285,172],[366,196]],[[796,178],[874,201]],[[287,548],[371,570]],[[796,543],[876,568]]],
'C02':[[[258,181],[361,209]],[[802,187],[881,211]],[[266,553],[361,577]],[[800,565],[880,588]]],
'C03':[[[280,211],[375,242]],[[795,217],[893,248]],[[284,577],[380,601]],[[793,582],[890,609]]],
'C04':[[[272,288],[350,314]],[[801,294],[875,320]],[[274,708],[354,733]],[[797,711],[874,738]]],
'C05':[[[261,200],[376,222]],[[807,202],[927,220]],[[266,659],[373,679]],[[809,664],[923,682]]],
'C06':[[[274,180],[361,213]],[[803,183],[891,214]],[[278,552],[366,579]],[[805,555],[892,582]]]}
emotions=json.loads((ROOT/'emotion-sources.json').read_text());REG=[]
for c in CONFIG:
    cid=c['id'];src=next(x for x in emotions if x['character']==cid);sheet=source(src['hash']);ratio=sheet.width/src['reviewWidth']
    nativeBase=parts[cid]['head'].copy()
    if cid=='C01':nativeBase=cut(nativeBase,ImageChops.invert(mask(FITS[cid]['head']['comb'])))
    if cid=='C05':nativeBase=cut(registered_source(c,'0e1428647f1a5f46ffbfd088195cc3ac5f72ff09'),mask(c['head']))
    if cid in ['C01','C05']:save(nativeBase,cid+'/head_native_base',kind='head_native_base',character=cid)
    for ei,name in enumerate(['joy','surprise','determination','sadness']):
        p,q=[complex(x*ratio,y*ratio) for x,y in LANDMARKS[cid][ei]];u,v=[complex(*z) for z in TARGET[cid]];z=(v-u)/(q-p);a,b=z.real,z.imag;offset=u-z*p;tx,ty=offset.real,offset.imag;den=a*a+b*b
        coeff=(a/(den*S),b/(den*S),(-a*tx-b*ty)/den,-b/(den*S),a/(den*S),(b*tx-a*ty)/den)
        mapped=sheet.transform(SIZE,Image.Transform.AFFINE,coeff,Image.Resampling.BICUBIC)
        if cid=='C04':
            ar=np.array(mapped)
            for xx in range(310*S,430*S):
                yy=np.flatnonzero(ar[240*S:301*S,xx,3]>245)
                if len(yy):
                    end=int(yy[-1])+240*S
                    if end<300*S:ar[end:301*S,xx]=ar[end,xx]
            mapped=Image.fromarray(ar)
        faceMask=mask(FACE[cid]).filter(ImageFilter.GaussianBlur(2*S))
        # Source emotions include a comb tip. Keep the registered base forehead
        # in this region; do not import the tip into the clean under-hat head.
        if cid=='C05':
            forehead=mask('M410 88 L477 88 L477 126 Q449 132 416 124 Z').filter(ImageFilter.GaussianBlur(2*S))
            faceMask=ImageChops.subtract(faceMask,forehead)
        face=cut(mapped,faceMask)
        for kind,base in [('bare',parts[cid]['head']),('hat',nativeBase)] if cid in ['C01','C05'] else [('bare',parts[cid]['head'])]:
            output=cut(base,ImageChops.invert(faceMask));output.alpha_composite(face);output=cut(output,mask(c['head']));
            if cid=='C01' and kind=='hat':output=cut(output,ImageChops.invert(mask(FITS[cid]['head']['comb'])))
            save(output,cid+'/emotions/'+name+'_'+kind,kind='emotion',character=cid,emotion=name,headType=kind)
        REG.append({'character':cid,'emotion':name,'sourceNode':src['id'],'sourceHash':src['hash'],'previewLandmarks':LANDMARKS[cid][ei],'targetLandmarks':TARGET[cid],'transform':[[a,-b,tx],[b,a,ty]],'faceMask':FACE[cid]})
(ROOT/'sprite-assets.json').write_text(json.dumps(ASSETS,ensure_ascii=False,indent=2))
(ROOT/'emotion-registration.json').write_text(json.dumps(REG,ensure_ascii=False,indent=2))
# Compact inspection board: base head and four fitted emotions for every character.
review=Image.new('RGB',(1500,6*330),(230,232,234));draw=ImageDraw.Draw(review)
for row,c in enumerate(CONFIG):
    cid=c['id'];ims=[parts[cid]['head']]+[Image.open(OUT/(cid+'/emotions/'+e+'_bare.png')) for e in ['joy','surprise','determination','sadness']]
    for col,im in enumerate(ims):
        cell=im.crop((170*S,0,560*S,320*S));cell.thumbnail((290,290));review.paste(cell,(col*300,row*330+26),cell);draw.text((col*300+6,row*330+6),cid+' '+['base','joy','surprise','determination','sadness'][col],fill='black')
review.save(ROOT/'registered-emotions-review.jpg')
print(json.dumps({'assets':len(ASSETS),'emotions':len(REG),'output':str(OUT)}))
