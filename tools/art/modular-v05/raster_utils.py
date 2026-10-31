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
