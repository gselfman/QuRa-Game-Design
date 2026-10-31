"""Export deterministic registered layers from approved raster art and Figma geometry."""
from raster_utils import *
import shutil,zipfile
G=json.loads((ROOT/'export-geometry.json').read_text())
STATE=json.loads((ROOT/'figma-state.json').read_text())
DEST=ROOT/'QURA_modular_v05'
DEST.mkdir(exist_ok=True)
CANVAS=(1200,1520)
files=[]
def write(im,path,**meta):
    p=DEST/(path+'.png');p.parent.mkdir(parents=True,exist_ok=True)
    ar=np.array(im);ar[ar[:,:,3]==0,:3]=0
    buf=io.BytesIO();Image.fromarray(ar).save(buf,format='PNG',compress_level=7)
    p.write_bytes(buf.getvalue());files.append({'file':str(p.relative_to(DEST)),**meta})
def pad(im):
    out=Image.new('RGBA',CANVAS);out.alpha_composite(im,(0,80));return out
def read(cid,name):return Image.open(OUT/cid/(name+'.png')).convert('RGBA')
def warp(im,g):
    a,b,tx=g['t'][0];d,e,ty=g['t'][1];sx=g['w']*2/im.width;sy=g['h']*2/im.height
    mat=np.array([[a*sx,b*sy,tx*2],[d*sx,e*sy,(ty+40)*2],[0,0,1]])
    inv=np.linalg.inv(mat);return im.transform(CANVAS,Image.Transform.AFFINE,tuple(inv[:2].flatten()),Image.Resampling.BICUBIC)
def geo(cid,name):return next(x for x in G[cid] if x['name']==name)
def shop(cid,key):return shops['qura_'+cid.lower()+'_'+key].copy()
# The new aviator frame is shared by shop and wear; lens cutout is identical.
avsrc=Image.open(WORK/'generated_images/exec-caeb70f1-7d2e-458a-9115-8c0ce1daffbd.png').convert('RGBA').crop((0,320,1254,950)).resize((2006,1008),Image.Resampling.LANCZOS)
ex=next(x for x in G['aviator'] if x['name']=='LENS_INTERIOR_EXCLUSION')['paths'][0]['data']
keep=mask(ex,avsrc.size,2);frame=cut(avsrc,keep);lenses=Image.new('RGBA',avsrc.size,(31,38,26,140));lenses=cut(lenses,ImageChops.invert(keep));lenses.alpha_composite(frame);aviators=lenses
vest=Image.open(WORK/'generated_images/exec-2741b3c1-c7db-4fdb-8183-c462fd52b18a.png').convert('RGBA').crop((100,90,1256,1130))
parts={};gear={};heads={}
for c in CONFIG:
    cid=c['id'];f=FITS[cid];parts[cid]={};gear[cid]={}
    for key in ['body','head','feet','nearWing','farWing']:
        im=pad(read(cid,'parts/'+key));parts[cid][key]=im;write(im,cid+'/parts/'+key,kind='part',character=cid)
    for key in ['feet_native','feet_perch']:
        im=pad(read(cid,key));parts[cid][key]=im;write(im,cid+'/'+key,kind='feet',character=cid)
    heads[cid]=pad(read(cid,'head_native_base')) if cid in ['C01','C05'] else parts[cid]['head']
    if cid in ['C01','C05']:write(heads[cid],cid+'/head_native_base',kind='head',character=cid)
    for p in (OUT/cid/'emotions').glob('*.png'):write(pad(Image.open(p).convert('RGBA')),cid+'/emotions/'+p.stem,kind='emotion',character=cid)
    hw=geo(cid,'HEAD_MODULE')['children'][0];gear[cid]['head']=warp(shop(cid,f['head']['key']),hw)
    fa=aviators if cid=='C02' else shop(cid,'third_eye') if cid=='C05' else read(cid,'wear_face')
    gear[cid]['face']=warp(fa,geo(cid,'FACE_ITEM'))
    gear[cid]['body']=warp(vest if cid=='C02' else read(cid,'wear_garment'),geo(cid,'GARMENT'))
    if f['neck']:gear[cid]['neck']=warp(shop(cid,f['neck']['key']),geo(cid,'NECK_ITEM'))
    bag=Image.new('RGBA',CANVAS);r=f['bag']['rect'];sc=c['shoulder'];end=[r[0]+r[2]*.5,r[1]+8];ctrl=[sc[0]+66,sc[1]+32]
    points=[]
    for t in np.linspace(0,1,80):points.append((2*((1-t)**2*sc[0]+2*(1-t)*t*ctrl[0]+t*t*end[0]),2*((1-t)**2*sc[1]+2*(1-t)*t*ctrl[1]+t*t*end[1]+40)))
    ImageDraw.Draw(bag).line(points,fill=tuple(round(v*255) for v in f['bag']['color'])+(255,),width=10 if cid=='C02' else 14)
    bag.alpha_composite(warp(read(cid,'wear_bag'),{'w':r[2],'h':r[3],'t':[[1,0,r[0]],[0,1,r[1]]]}));gear[cid]['bag']=bag
    gear[cid]['feet']=parts[cid]['feet_native']
    roles={f['head']['key']:'head',f['face']['key']:'face',f['body']:'body',f['bag']['key']:'bag',f['feet']['key']:'feet'}
    if f['neck']:roles[f['neck']['key']]='neck'
    for item in [x for x in STATE['nativeMasters'] if x['character']==cid]:
        key=item['key'];role=roles[key];write(gear[cid][role],cid+'/wear/'+key,kind='wear',role=role,character=cid)
        art=aviators if cid=='C02' and key=='aviators' else vest if cid=='C02' and key=='vest' else shop(cid,key)
        bb=art.getbbox();art=art.crop(bb);thumbnail=Image.new('RGBA',(768,768));art.thumbnail((672,672),Image.Resampling.LANCZOS);thumbnail.alpha_composite(art,((768-art.width)//2,(768-art.height)//2));write(thumbnail,cid+'/shop/'+key,kind='shop',role=role,character=cid)
# Shared straw nest and perch. Nest front also includes the pastel eggs.
nest=Image.open(WORK/'generated_images/exec-c6209a89-4669-49b5-a3d5-99f71d6bbbd8.png').convert('RGBA')
outer='M60 540 Q60 330 325 230 Q750 70 1160 235 Q1410 285 1480 560 L1460 730 Q1350 910 850 958 Q350 970 110 780 Z'
front='M60 600 Q250 640 430 597 Q423 510 480 489 Q545 477 580 566 Q620 536 671 552 Q710 569 719 607 Q755 539 804 555 Q837 568 850 629 Q878 554 933 572 Q977 581 991 621 Q973 547 1015 522 Q1088 480 1113 550 L1140 644 Q1330 590 1480 611 L1480 1024 L0 1024 Z'
nb=cut(nest,mask(outer,nest.size,1));nf=cut(nb,mask(front,nest.size,1));rect={'w':600,'h':400,'t':[[1,0,0],[0,1,280]]}
nb=warp(nb,rect);nf=warp(nf,rect);write(nb,'props/nest_back',kind='prop');write(nf,'props/nest_front_eggs',kind='prop')
rail=Image.new('RGBA',CANVAS);dr=ImageDraw.Draw(rail);dr.rounded_rectangle((40,1098,1160,1174),radius=38,fill=(140,74,26,255))
for j in range(4):dr.line((90+j*40,1116+j*10,1060-j*70,1120+j*8),fill=(92,43,13,190),width=3)
write(rail,'props/perch',kind='prop')
preview=Image.new('RGB',(1200,6*520),(238,240,243));draw=ImageDraw.Draw(preview)
for ci,c in enumerate(CONFIG):
    cid=c['id'];p=parts[cid];g=gear[cid]
    for pi,pose in enumerate(['CARD','PERCH','NEST']):
        out=Image.new('RGBA',CANVAS)
        if pose=='NEST':out.alpha_composite(nb)
        if pose=='PERCH':out.alpha_composite(rail);out.alpha_composite(p['feet_perch'])
        if pose=='CARD':out.alpha_composite(g['feet'])
        for im in [p['body'],g['body']]:out.alpha_composite(im)
        if pose=='CARD':out.alpha_composite(g['bag'])
        if 'neck' in g:out.alpha_composite(g['neck'])
        for im in [p['farWing'],p['nearWing'],heads[cid],g['head'],g['face']]:out.alpha_composite(im)
        if pose=='NEST':out.alpha_composite(nf)
        write(out,cid+'/composites/'+pose,kind='composite',character=cid,pose=pose)
        small=out.resize((390,494),Image.Resampling.LANCZOS);preview.paste(small,(pi*400,ci*520+20),small);draw.text((pi*400+10,ci*520+5),cid+' '+pose,fill=(20,25,30))
preview.save(DEST/'review_18_poses.jpg',quality=90)
manifest={'version':'v05','canvas_px':list(CANVAS),'virtual_canvas':[600,760],'scale':2,'body_origin_px':[0,80],'pivot_normalized':[0.5,0.5],'character_names':{'C01':'Ряба','C02':'Боевик','C03':'Дурочка','C04':'Профессор','C05':'Монах','C06':'Гламурочка'},'emotion_order':['base','joy','surprise','determination','sadness'],'draw_order':['nest_back_or_perch','feet','body','garment','bag','neck','farWing','nearWing','head','headwear','face','nest_front_eggs'],'seated_hidden':['bag','feet_native'],'notes':['All wearable and character layers use the same canvas. Do not trim independently.','Feet native replaces bare feet. The anklet, ring and sandal layers include their approved feet.','Use hat head variants for C01/C05 with native hats; use bare variants otherwise.','Foreground wings occlude bags in assembly. Do not cut wing-shaped holes into shop artwork.','Static pose assembly. Hidden body surfaces are not restored for unrestricted skeletal animation.','Native items are registered to their own character. Shared pilot items have separate character fit profiles.'],'files':files}
(DEST/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2))
print(json.dumps({'png_files':len(files),'folder':str(DEST)}))
