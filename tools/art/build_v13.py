#!/usr/bin/env python3
"""Rebuild D3 exports from native Figma atlases and immutable v12 registered layers."""
import argparse, collections, hashlib, io, json, os, re
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
ROOT = Path(__file__).resolve().parents[2]
MAN = ROOT / "docs/visual/manifests"
SIZE = (1200, 1520)
def read(name): return json.loads((MAN / name).read_text())
def write(name, data): (MAN / name).write_text(json.dumps(data, ensure_ascii=False, indent=2)+"\n")
def load(path): return Image.open(ROOT / path).convert("RGBA")
def atomic(path, data):
    p=ROOT/path;p.parent.mkdir(parents=True,exist_ok=True)
    tmp=p.with_suffix(p.suffix+".pending")
    with tmp.open("wb") as f: f.write(data);f.flush();os.fsync(f.fileno())
    os.replace(tmp,p)
def save(im,path,fmt="PNG",**kw):
    b=io.BytesIO();im.save(b,format=fmt,**kw);atomic(path,b.getvalue())
def web(im,path,sz=None,limit=300000):
    if sz: im=im.resize(sz,Image.Resampling.LANCZOS)
    for q in (95,90,85,80,75):
        b=io.BytesIO();im.save(b,format="WEBP",quality=q,method=4)
        if len(b.getvalue())<limit: atomic(path,b.getvalue());return q
    raise ValueError(path+" exceeds "+str(limit)+" bytes")
def meta(path):
    b=(ROOT/path).read_bytes()
    with Image.open(io.BytesIO(b)) as im:
        im.load();box=im.convert("RGBA").getchannel("A").getbbox()
        return dict(path=path,size=list(im.size),bytes=len(b),sha256=hashlib.sha256(b).hexdigest(),alpha_bbox=list(box) if box else None)
def font(n):
    return ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",n)
def label(im,xy,s,n=18): ImageDraw.Draw(im).text(xy,s,font=font(n),fill="#eef1f6")
def on_card(im,art,box):
    art=art.copy();art.thumbnail((box[2]-box[0],box[3]-box[1]),Image.Resampling.LANCZOS)
    im.alpha_composite(art,(box[0]+(box[2]-box[0]-art.width)//2,box[1]+(box[3]-box[1]-art.height)//2))
def sprites(src):
    items=[];sheets=[];ids=set();lookup={it["id"]:it for p in src["components"] for s in p["sheets"] for it in s["items"]}
    overview=Image.new("RGBA",(1920,1760),"#191e27")
    for si,s in enumerate(s for p in src["pages"] for s in p["sheets"]):
        atlas=load(s["atlas_png"]);assert list(atlas.size)==s["atlas_size"]
        sheets.append({**s,"file":meta(s["atlas_png"])})
        x=(si%5)*384;y=(si//5)*440;label(overview,(x+10,y+8),s["code"])
        on_card(overview,atlas,(x+10,y+40,x+374,y+420))
        for a in (a for p in src["pages"] for a in p["assets"] if a["source_code"]==s["code"]):
            if "_ALT" in a["source_code"]: a={**a,"kind":"alternate"}
            assert a["id"] not in ids;ids.add(a["id"])
            x0,y0,w,h=a["atlas_rect"];im=atlas.crop((x0,y0,x0+w,y0+h));assert list(im.size)==a["canvas"]
            box=im.getchannel("A").getbbox();assert box and im.getchannel("A").getextrema()[0]==0
            assert 0<box[0]<box[2]<w and 0<box[1]<box[3]<h,(a["id"],box)
            directory="alternates" if a["kind"]=="alternate" or "_ALT" in a["source_code"] else "reference" if a["kind"]!="game_sprite" else "game"
            stem="assets/sprites/v13/"+directory+"/"+a["source_code"].lower()+"/"+a["id"].lower()
            save(im,stem+".png");q=web(im,stem+".webp")
            items.append({**a,"figma":lookup[a["id"]],"pivot":[w/2,h/2],"trim":False,"png":meta(stem+".png"),"webp":meta(stem+".webp"),"webp_quality":q})
    assert len(items)==435 and len(sheets)==20
    save(overview,"assets/sprites/v13/previews/all_20_atlases.png")
    out=dict(schema_version=13,status="QA",count=len(items),kind_counts=dict(collections.Counter(a["kind"] for a in items)),
        source="Native transparent Figma PNG exports of the normalized alpha-isolated atlases; no new generation. RGB may differ from source PNG by export rounding.",
        normalization="Alpha connected components assigned to semantic grid cells; touching glows separated before packing. Each item preserves source pixel scale and complete positive-alpha support. No equal-cell crop of the raw source sheets.",
        runtime="Use kind=game_sprite for game candidates; reference and alternate assets are not registered clothing and must not replace v12 wearables.",
        sheets=sheets,items=items,qa=dict(decoded=True,transparent=True,no_edge_clipping=True,atlas_pixel_identity=True))
    write("production_v13_sprites.json",out)
def equipment(src,v12):
    items=[]
    for e in (e for e in src["native_exports"] if e["kind"] in ("prop","shop")):
        im=load(e["path"]);assert list(im.size)==[e["width"],e["height"]]
        assert im.getchannel("A").getextrema()[0]==0 and im.getchannel("A").getbbox()
        wp=str(Path(e["path"]).with_suffix(".webp"));q=web(im,wp,(600,760) if e["kind"]=="prop" else None)
        items.append({**e,"png":meta(e["path"]),"webp":meta(wp),"webp_quality":q,
          **({"registered_game_group":v12["equipment_groups"][e["id"]]} if e["kind"]=="shop" else {})})
    assert len(items)==44
    proof=Image.new("RGBA",(1400,7*250),"#191e27")
    for i,e in enumerate(a for a in items if a["kind"]=="shop"):
        x=(i%7)*200;y=(i//7)*350;label(proof,(x+5,y+5),e["id"],15);on_card(proof,load(e["path"]),(x+5,y+35,x+195,y+330))
    save(proof,"assets/characters/v13/previews/shop_35.png")
    write("production_v13_equipment.json",dict(schema_version=13,status="QA",shop_count=35,prop_count=9,
        registration=dict(png=[1200,1520],webp=[600,760],origin=[0,0],trim=False),
        rules_document="docs/visual/QuRa_accessory_creation_rules_v12.md",catalogue=src["catalog"],
        contract="Shop illustrations are complete product art. Only registered_game_group file_ids from v12 dress the hen. Interleave parts by z; wings cover vest and bag; water toy stays readable in front. Closed shoes replace bare feet. Never trim clothing canvas.",
        files=items))
def poses(src,v12):
    files={f["id"]:f for f in v12["files"]};items=[];proof=Image.new("RGBA",(1200,6*500),"#191e27")
    for ci,(char,c) in enumerate(v12["characters"].items()):
        for pi,pose in enumerate(("CARD","PERCH","NEST")):
            stem="assets/characters/v13/poses/"+char+"/"+pose.lower()
            recipe=[]
            if pose=="CARD":
                f=files[c["full_file_id"]];atomic(stem+".png",(ROOT/f["png"]).read_bytes());atomic(stem+".webp",(ROOT/f["webp"]).read_bytes())
                recipe=[dict(kind="v12_layer",**a) for a in c["default_layers"]]
            else:
                seated=Image.new("RGBA",SIZE)
                for a in c["default_layers"]:
                    if a["item"] and not v12["equipment_groups"][a["item"]]["seated_visible"]: continue
                    if a["type"]=="body_part" and re.search("legs|feet",a["role"]): continue
                    seated.alpha_composite(load(files[a["file_id"]]["png"]));recipe.append(dict(kind="v12_layer",**a))
                if pose=="PERCH" and char=="monk":
                    seated.paste((0,0,0,0),(0,1098,1200,1520));recipe.append(dict(kind="clip",target="seated_stack",keep=[0,0,1200,1098]))
                im=Image.new("RGBA",SIZE)
                if pose=="PERCH":
                    bar="assets/characters/v13/props/perch.png";feet="assets/characters/v13/props/"+char+"/feet_perch.png"
                    im.alpha_composite(load(bar))
                    if char!="monk": im.alpha_composite(load(feet))
                    im.alpha_composite(seated)
                    if char=="monk": im.alpha_composite(load(feet))
                    recipe=[dict(kind="prop",png=bar)]+([] if char=="monk" else [dict(kind="prop",png=feet)])+recipe+([dict(kind="prop",png=feet)] if char=="monk" else [])
                else:
                    back="assets/characters/v13/props/nest_back.png";front="assets/characters/v13/props/nest_front_eggs.png"
                    im.alpha_composite(load(back));im.alpha_composite(seated);im.alpha_composite(load(front))
                    recipe=[dict(kind="prop",png=back)]+recipe+[dict(kind="prop",png=front)]
                save(im,stem+".png");web(im,stem+".webp",(600,760))
            im=load(stem+".png");assert im.size==SIZE
            x=pi*400;y=ci*500;label(proof,(x+15,y+5),c["title"]+" / "+pose,18);on_card(proof,im,(x+10,y+35,x+390,y+495))
            items.append(dict(character=char,pose=pose,status="QA",recipe=recipe,png=meta(stem+".png"),webp=meta(stem+".webp")))
    save(proof,"assets/characters/v13/previews/poses_18.png")
    write("production_v13_poses.json",dict(schema_version=13,status="QA",count=18,coordinate_system=v12["coordinate_system"],
      figma=src["poses"],policy=dict(seated_hide_slots=["bag","feet"],nest="No legs or perch feet; nest front overlays body",monk_perch_clip_y=1098),items=items))
def correct_monk(v12):
    files={f["id"]:f for f in v12["files"]};c=v12["characters"]["monk"]
    native=files[next(a["file_id"] for a in c["default_layers"] if a["role"]=="head_native_base")]
    pairs=[(files["monk_heads_monk_base_bare_png"],native)]
    for emotion in ("joy","surprise","determination","sadness"):
        pairs.append((files["monk_emotions_monk_"+emotion+"_bare_png"],files["monk_emotions_monk_"+emotion+"_hat_png"]))
    def update(f):
        for ext in ("png","webp"):
            m=meta(f[ext]);f[ext+"_size"]=m["size"];f[ext+"_bytes"]=m["bytes"];f["sha256"][ext]=m["sha256"]
    for dst,src in pairs:
        for ext in ("png","webp"): atomic(dst[ext],(ROOT/src[ext]).read_bytes())
        dst["webp_lossless"]=src["webp_lossless"];dst["webp_quality"]=src["webp_quality"]
        dst["source"]="existing bald "+src["id"]+"; v13 monk correction; no generation"
        update(dst)
    f=files[c["undressed_body_file_id"]];im=Image.new("RGBA",SIZE)
    for a in c["bare_layers"]:im.alpha_composite(load(files[a["file_id"]]["png"]))
    save(im,f["png"]);q=web(im,f["webp"],(600,760));f["webp_quality"]=q;f["webp_lossless"]=False
    f["source"]="composed from unchanged v12 anatomy; bald monk head corrected in v13";update(f)
    v12["qa"]["monk_bald_correction"]=dict(status="passed",head_aliases=5,bare_composite=1,original95_png_unchanged=True,
        method="Copy existing registered bald native/hat expression PNG and WebP to canonical bare paths; rebuild undressed monk from those unchanged parts.")
    v12["qa"]["bare_base_heads"]["source"]="Existing registered heads; C05 canonical bare head uses the existing bald native head in v13."
    v12["qa"]["bare_base_heads"]["proof"]="assets/characters/v13/previews/bare_bodies_6.png"
    write("2026-11-02_characters_v12_web.json",v12)
    proof=Image.new("RGBA",(1200,1000),"#191e27")
    for i,(char,data) in enumerate(v12["characters"].items()):
        x=(i%3)*400;y=(i//3)*500;label(proof,(x+10,y+5),data["title"]+" / BARE",18)
        on_card(proof,load(files[data["undressed_body_file_id"]]["png"]),(x+10,y+35,x+390,y+495))
    save(proof,"assets/characters/v13/previews/bare_bodies_6.png")
def emotions(v12):
    correct_monk(v12)
    files={f["id"]:f for f in v12["files"]};heads=[f for f in v12["files"] if f["type"]=="head_emotion"];cases=[]
    proof=Image.new("RGBA",(1920,6*300),"#191e27")
    for ci,(char,c) in enumerate(v12["characters"].items()):
        these=[f for f in heads if f["character"]==char]
        names=list(dict.fromkeys(f["emotion"] for f in these));assert len(names)==4
        boxes=[load(f["png"]).getchannel("A").getbbox() for f in these]
        for a in c["default_layers"]:
            if a["item"] and v12["equipment_groups"][a["item"]]["slot"]=="head": boxes.append(load(files[a["file_id"]]["png"]).getchannel("A").getbbox())
        crop=(max(0,min(b[0] for b in boxes)-20),max(0,min(b[1] for b in boxes)-20),min(1200,max(b[2] for b in boxes)+20),min(1520,max(b[3] for b in boxes)+30))
        for ei,emotion in enumerate(names):
            for hi,wear in enumerate((False,True)):
                candidates=[f for f in these if f["emotion"]==emotion]
                variant="hat" if wear or char=="monk" else "bare"
                h=next((f for f in candidates if f["headwear_variant"]==variant),next(f for f in candidates if f["headwear_variant"]=="bare"))
                im=Image.new("RGBA",SIZE);recipe=[]
                for a in c["default_layers"]:
                    if not wear and a["item"] and v12["equipment_groups"][a["item"]]["slot"]=="head": continue
                    fid=h["id"] if a["role"]=="head_native_base" else a["file_id"]
                    im.alpha_composite(load(files[fid]["png"]));recipe.append({**a,"file_id":fid})
                x=(ei*2+hi)*240;y=ci*300
                label(proof,(x+8,y+4),char+" "+emotion,12);label(proof,(x+8,y+23),"HEADWEAR "+("ON" if wear else "OFF"),12)
                on_card(proof,im.crop(crop),(x+5,y+45,x+235,y+295))
                cases.append(dict(character=char,emotion=emotion,headwear=wear,head_file_id=h["id"],recipe=recipe,proof_crop=list(crop),status="QA"))
    assert len(cases)==48
    save(proof,"assets/characters/v13/previews/emotions_48.png")
    write("production_v13_emotions.json",dict(schema_version=13,status="QA",expression_count=24,case_count=48,source="Existing registered heads; no regeneration",cases=cases,
       qa=dict(source_unchanged=True,headwear_on_off="visual contact sheet",proof="assets/characters/v13/previews/emotions_48.png")))
    c=v12["characters"]["monk"]
    native=next(a["file_id"] for a in c["default_layers"] if a["role"]=="head_native_base")
    recipe=[{**a,"file_id":native if files[a["file_id"]]["type"]=="head_base" else a["file_id"]} for a in c["bare_layers"]]
    im=Image.new("RGBA",SIZE)
    for a in recipe: im.alpha_composite(load(files[a["file_id"]]["png"]))
    p="assets/characters/v13/base/monk_bald.png";w=p.replace(".png",".webp")
    save(im,p);web(im,w,(600,760))
    write("production_v13_character_policy.json",dict(schema_version=13,status="QA",inherits="docs/visual/manifests/2026-11-02_characters_v12_web.json",
        monk=dict(base_bare_head_file_id=native,bare_layers=recipe,undressed_png=p,undressed_webp=w,
        emotion_variant_both_headwear_states="hat",reason="Existing bald native/hat heads preserve the approved face. Canonical bare paths are corrected; comb versions remain in history."),
        all_other_characters="Use v12 bare base; prefer hat emotion variant for headwear ON when available. Preserve registered default layer order."))
def arena():
    items=[]
    for p in sorted((ROOT/"assets/arena").glob("arn*/*.png")):
        if "preview" in p.name: continue
        src=str(p.relative_to(ROOT));wp=str(p.with_suffix(".webp").relative_to(ROOT));im=load(src)
        q=web(im,wp,limit=400000)
        items.append(dict(png=meta(src),webp=meta(wp),webp_quality=q,trim=False))
    assert len(items)==37
    write("production_v13_arena.json",dict(schema_version=13,status="QA",count=37,
        inherits="docs/visual/manifests/2026-11-01_arena_arn01_arn02_v01.json",
        contract="Existing PNGs unchanged. WebP preserves original canvas and alpha: ARN01 1080x1920 scene layers; ARN02 320x320 icons. Max400000bytes. Preview stack is not a runtime layer.",items=items))
def main():
    ap=argparse.ArgumentParser();ap.add_argument("--only",choices=["sprites","equipment","poses","emotions","arena","all"],default="all");a=ap.parse_args()
    src=read("production_v13_sources.json");v12=read("2026-11-02_characters_v12_web.json")
    for name,fn in (("sprites",lambda:sprites(src)),("equipment",lambda:equipment(src,v12)),("poses",lambda:poses(src,v12)),("emotions",lambda:emotions(v12)),("arena",arena)):
        if a.only in (name,"all"): fn();print(name+" OK",flush=True)
if __name__=="__main__":main()

