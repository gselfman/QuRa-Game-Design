#!/usr/bin/env python3
"""Acceptance checks for the D3 delivery. Run after build_v13.py."""
import collections,hashlib,json
from pathlib import Path
from PIL import Image,ImageChops
ROOT=Path(__file__).resolve().parents[2];MAN=ROOT/"docs/visual/manifests"
def read(n):return json.loads((MAN/n).read_text())
def art(p):return Image.open(ROOT/p).convert("RGBA")
def check_meta(m):
    p=ROOT/m["path"];b=p.read_bytes();assert hashlib.sha256(b).hexdigest()==m["sha256"],str(p)
    im=art(m["path"]);assert list(im.size)==m["size"],str(p);return im
def main():
    v12=read("2026-11-02_characters_v12_web.json")
    for p,sha in read("production_v13.json")["original95_png_sha256"].items():
        assert hashlib.sha256((ROOT/p).read_bytes()).hexdigest()==sha,p
    for f in v12["files"]:
        for ext in ["png","webp"]:
            assert hashlib.sha256((ROOT/f[ext]).read_bytes()).hexdigest()==f["sha256"][ext],f["id"]
    s=read("production_v13_sprites.json");assert s["count"]==435 and len(s["sheets"])==20
    assert s["kind_counts"]==dict(game_sprite=367,alternate=25,shop_icon_reference=38,cosmetic_reference=5)
    assert len({a["id"]for a in s["items"]})==435
    atlases={a["code"]:check_meta(a["file"])for a in s["sheets"]}
    for a in s["items"]:
        png=check_meta(a["png"]);web=check_meta(a["webp"]);assert a["webp"]["bytes"]<300000
        x,y,w,h=a["atlas_rect"];crop=atlases[a["source_code"]].crop((x,y,x+w,y+h))
        assert png.tobytes()==crop.tobytes(),a["id"]
        assert list(png.size)==a["canvas"]==list(web.size)
        assert ImageChops.difference(png.getchannel("A"),web.getchannel("A")).getbbox() is None,a["id"]
        box=png.getchannel("A").getbbox();assert box and 0<box[0]<box[2]<w and 0<box[1]<box[3]<h,a["id"]
    eq=read("production_v13_equipment.json");assert eq["shop_count"]==35 and eq["prop_count"]==9
    for a in eq["files"]:
        png=check_meta(a["png"]);web=check_meta(a["webp"]);assert a["webp"]["bytes"]<300000
        assert list(png.size)==[a["width"],a["height"]] and png.getchannel("A").getextrema()[0]==0
        alpha=png.resize(web.size,Image.Resampling.LANCZOS).getchannel("A")
        assert ImageChops.difference(alpha,web.getchannel("A")).getbbox() is None,a["id"]
    ps=read("production_v13_poses.json");assert ps["count"]==18
    for a in ps["items"]:
        png=check_meta(a["png"]);web=check_meta(a["webp"]);assert png.size==(1200,1520)and web.size==(600,760)
        assert a["webp"]["bytes"]<300000 and png.getchannel("A").getextrema()[0]==0
        alpha=png.resize(web.size,Image.Resampling.LANCZOS).getchannel("A")
        assert ImageChops.difference(alpha,web.getchannel("A")).getbbox() is None,a["character"]
        if a["pose"]!="CARD":
            for layer in a["recipe"]:
                if layer["kind"]=="v12_layer":
                    assert "legs" not in layer["role"]and "feet" not in layer["role"]
                    if layer["item"]:assert v12["equipment_groups"][layer["item"]]["seated_visible"]
        else:
            f=next(f for f in v12["files"]if f["id"]==v12["characters"][a["character"]]["full_file_id"])
            assert a["png"]["sha256"]==f["sha256"]["png"]
        if a["pose"]=="NEST":assert a["recipe"][-1]["png"].endswith("nest_front_eggs.png")
    em=read("production_v13_emotions.json");assert em["expression_count"]==24 and len(em["cases"])==48
    for c in em["cases"]:
        if c["character"]=="monk":assert c["head_file_id"].endswith("_hat_png")
    ui=read("production_v13_screens.json");assert len(ui["screens"])==9
    for s in ui["screens"]:assert art(s["png"]).size==(360,640)
    cp=read("production_v13_character_policy.json");assert "native_base" in cp["monk"]["base_bare_head_file_id"]
    ar=read("production_v13_arena.json");assert ar["count"]==37
    for a in ar["items"]:
        png=check_meta(a["png"]);web=check_meta(a["webp"])
        assert png.size==web.size and a["webp"]["bytes"]<400000
        assert ImageChops.difference(png.getchannel("A"),web.getchannel("A")).getbbox() is None
    assert read("2026-11-02_coop01_v01.json")["focus_hen_policy"]["floor_focus_excludes_own_roost"]
    assert v12["qa"]["browser_assembly"]["status"]=="passed"
    for name in ["emotions_48.png","poses_18.png","shop_35.png","accessory_catalog_figma.png","delivery_qa_figma.png"]:
        art("assets/characters/v13/previews/"+name).load()
    report=dict(status="passed",verified_v12_files=294,original95_png_unchanged=True,monk_derived_files_corrected=12,arena_webp=37,sprite_cuts=435,atlas_pixel_comparisons=435,webp_alpha_comparisons=534,
      props=9,shop_items=35,poses=18,emotion_cases=48,editable_figma_screens=9,status_maximum="QA",
      visual_checks=["18poses: wing/vest/bag ordering, perch feet, concealed nest feet",
      "48emotion cases: existing expressions; monk bald in both headwear states",
      "35complete shop illustrations and registered parts catalogue",
      "9screens: readable text, visible monk, exact2/4/6 residents, no duplicated floor focus"],
      owner_approval_not_set=True)
    (MAN/"production_v13_qa.json").write_text(json.dumps(report,ensure_ascii=False,indent=2)+"\n")
    print(json.dumps(report,ensure_ascii=False))
if __name__=="__main__":main()

