import numpy as np
from PIL import Image,ImageDraw,ImageChops
from fontTools.pens.basePen import BasePen
from fontTools.svgLib.path import parse_path
SIZE=(1200,1360)
S=2
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

