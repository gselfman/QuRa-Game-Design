"""Bake existing approved masks into RGBA for predictable nested-component rendering."""
exec((__import__('pathlib').Path(__file__).parent/'prepare_sprites.py').read_text())

def polygon(points,w,h):return 'M'+' L'.join(f'{x*w} {y*h}' for x,y in points)+' Z'
def ellipse(cx,cy,rx,ry):
    k=.55228475
    return f'M{cx-rx} {cy} C{cx-rx} {cy-ry*k} {cx-rx*k} {cy-ry} {cx} {cy-ry} C{cx+rx*k} {cy-ry} {cx+rx} {cy-ry*k} {cx+rx} {cy} C{cx+rx} {cy+ry*k} {cx+rx*k} {cy+ry} {cx} {cy+ry} C{cx-rx*k} {cy+ry} {cx-rx} {cy+ry*k} {cx-rx} {cy} Z'

for c in CONFIG:
    cid=c['id'];f=FITS[cid]
    if 'bodyHole' in f:
        im=shops['qura_'+cid.lower()+'_'+f['body']].copy();w,h=im.size;hole=polygon(f['bodyHole'],w,h)
        if cid=='C01':hole='M88 0 L283 0 C326 32 327 104 271 145 C196 105 130 65 88 0 Z'
        if cid=='C06':hole='M65 0 L236 0 C256 42 258 95 214 133 C157 77 101 30 65 0 Z'
        im=cut(im,ImageChops.invert(mask(hole,im.size,1)));save(im,cid+'/wear_garment',kind='wear_garment',character=cid)
    if f['face']['key']=='glasses':
        im=shops['qura_'+cid.lower()+'_glasses'].copy();w,h=im.size
        if cid=='C01':d=ellipse(.528*w,.49*h,.119*w,.405*h)+' '+ellipse(.836*w,.49*h,.095*w,.398*h)
        if cid=='C04':d=ellipse(.44*w,.47*h,.165*w,.40*h)+' '+ellipse(.82*w,.57*h,.14*w,.33*h)
        if cid=='C03':d=polygon([[.345,.19],[.445,.14],[.61,.36],[.60,.59],[.54,.87],[.44,.88],[.36,.62]],w,h)+' '+polygon([[.744,.39],[.91,.23],[.90,.62],[.85,.86],[.78,.83]],w,h)
        if cid=='C06':d=polygon([[.19,.29],[.28,.29],[.43,.43],[.45,.64],[.40,.86],[.29,.84],[.22,.64]],w,h)+' '+polygon([[.63,.43],[.77,.24],[.89,.23],[.85,.67],[.78,.86],[.65,.82],[.60,.66]],w,h)
        lens=mask(d,im.size,1);im=cut(im,ImageChops.invert(lens));base=Image.new('RGBA',im.size)
        if cid in ['C03','C06']:
            base=Image.new('RGBA',im.size,(242,61,122,46) if cid=='C03' else (184,120,33,46));base=cut(base,lens)
        base.alpha_composite(im);save(base,cid+'/wear_face',kind='wear_face',character=cid)
    bag=shops['qura_'+cid.lower()+'_'+f['bag']['key']];x,y,w,h=f['bag']['crop'];bag=bag.crop((round(x*bag.width),round(y*bag.height),round((x+w)*bag.width),round((y+h)*bag.height)));save(bag,cid+'/wear_bag',kind='wear_bag',character=cid)

pm=json.loads((ROOT/'perch-masks.json').read_text());ps=json.loads((ROOT/'perch-feet.json').read_text())
for c in CONFIG:
    cid=c['id'];p=ps[cid];x,y,w,h=p['box'];im=source(p['hash']).crop((x,y,x+w,y+h));im=cut(im,mask(pm[cid],(w,h),1));out=blank();fw=195 if c['bodyType']=='slim' else 230;px=260 if cid=='C04' else 300 if cid=='C06' else 285;place(out,im,(px,488,fw,fw*h/w));save(out,cid+'/feet_perch',kind='feet_perch',character=cid)

(ROOT/'sprite-assets.json').write_text(json.dumps(ASSETS,ensure_ascii=False,indent=2))
print(json.dumps({'baked_assets':len(ASSETS)}))
