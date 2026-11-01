import io,os
import numpy as np
from PIL import Image
def atomic(im,path):
 a=np.array(im.convert('RGBA'));a[a[:,:,3]<4]=0;im=Image.fromarray(a)
 b=io.BytesIO();im.save(b,format='PNG',compress_level=4);tmp=path.with_suffix('.pending')
 with open(tmp,'wb') as f:f.write(b.getvalue());f.flush();os.fsync(f.fileno())
 tmp.replace(path)
