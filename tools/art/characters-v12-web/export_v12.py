"""Export the unchanged v12 PNGs, registered WebP files and explicit assembly recipes."""
from pathlib import Path
import argparse, hashlib, io, json, os, re
from PIL import Image

CODES = dict(zip(['C01','C02','C03','C04','C05','C06'], ['ryaba','fighter','fool','professor','monk','glamour']))
SLOTS = {'hat':'head','bandana':'head','scarf':'head','pencil':'head','glasses':'eyes','aviators':'eyes','third_eye':'eyes','vest':'body','coat':'body','robe':'body','bag':'bag','water_toy':'bag','shopper_flute':'bag','satchel':'bag','cloth_bag':'bag','bag_h':'bag','beads':'neck','diamonds':'neck','cartridges':'neck','magnifier':'neck','boots':'feet','crocs':'feet','sandals':'feet','ring07':'feet','anklets':'feet'}
SIZE = (1200,1520)

def sha(data):
    return hashlib.sha256(data).hexdigest()

def atomic(path, data):
    path.parent.mkdir(parents=True, exist_ok=True)
    tmp=path.with_suffix(path.suffix+'.pending')
    with tmp.open('wb') as f:
        f.write(data); f.flush(); os.fsync(f.fileno())
    tmp.replace(path)

def png_bytes(im):
    b=io.BytesIO(); im.save(b,format='PNG',compress_level=4); return b.getvalue()

def slug(s):
    return re.sub(r'[^a-z0-9]+','_',s.lower()).strip('_')

def export(source, emotion_source, repo):
    old=json.loads((source/'manifest.json').read_text())
    root=repo/'assets/characters/v12'
    manifest_path=repo/'docs/visual/manifests/2026-11-02_characters_v12_web.json'
    previous={f['png']:f for f in json.loads(manifest_path.read_text())['files']} if manifest_path.exists() else {}
    files=[]; by_source={}; recipes={}; groups={}
    item_for={f:key for key,parts in old['equipment_groups'].items() for f in parts}
    layer_for={l['file']:l for c in old['characters'].values() for l in c['layers']}

    def add(rel, data, cid, kind, role, item=None, slot=None, z=None, provenance='wardrobe_v12', extra=None):
        im=Image.open(io.BytesIO(data)); im.load()
        assert im.size==SIZE and im.mode=='RGBA', rel
        assert im.getchannel('A').getextrema()[0]==0, rel
        png=root/rel; atomic(png,data)
        code=CODES[cid]
        if rel==cid+'/CARD.png': webrel='full_'+code+'.webp'
        elif rel==cid+'/NO_BAG.png': webrel='clothing_only_'+code+'.webp'
        else:
            parts=Path(rel).parts
            dirs=[CODES.get(x,x) for x in parts[:-1]]
            webrel='/'.join(dirs+[slug(Path(rel).stem)+'.webp'])
        web=root/'web'/webrel
        cached=previous.get(png.relative_to(repo).as_posix())
        if cached and cached['sha256']['png']==sha(data) and web.exists() and sha(web.read_bytes())==cached['sha256']['webp']:
            wb=web.read_bytes();lossless=cached['webp_lossless'];quality=cached['webp_quality']
        else:
            small=im.resize((600,760),Image.Resampling.LANCZOS)
            b=io.BytesIO(); small.save(b,format='WEBP',lossless=True,quality=100,method=6,exact=True)
            lossless=True; quality=100
            if len(b.getvalue())>=300000:
                lossless=False; quality=95
                while True:
                    b=io.BytesIO(); small.save(b,format='WEBP',quality=quality,method=6,alpha_quality=100,exact=True)
                    if len(b.getvalue())<300000:break
                    quality-=5
                    assert quality>=75, rel
            wb=b.getvalue(); atomic(web,wb)
        with Image.open(web)as test:
            test.load(); assert test.size==(600,760) and test.mode=='RGBA'
            assert test.getchannel('A').getextrema()[0]==0
        entry={'id':slug(code+'_'+rel),'character':code,'source_character':cid,'type':kind,'role':role,
               'item':item,'slot':slot,'z':z,'png':png.relative_to(repo).as_posix(),'webp':web.relative_to(repo).as_posix(),
               'png_size':[1200,1520],'webp_size':[600,760],'png_bytes':len(data),'webp_bytes':len(wb),
               'sha256':{'png':sha(data),'webp':sha(wb)},'webp_lossless':lossless,'webp_quality':quality,
               'source':provenance}
        if extra:entry.update(extra)
        files.append(entry); by_source[rel]=entry
        return entry

    originals=sorted(source.rglob('*.png'))
    assert len(originals)==95
    for p in originals:
        rel=p.relative_to(source).as_posix(); cid=Path(rel).parts[0]; assert cid in CODES
        l=layer_for.get(rel); item=item_for.get(rel); z=l['z']if l else 3 if rel.endswith('/base/legs_bare.png')else None
        if item:
            role=l['name']; name=item.split('/')[1]
            back=role.startswith('far carry strap')or role.startswith('scarf tail')or role.startswith('pencil behind')or 'sandal platform'in role
            kind='item_back'if back else'item_front'; slot=SLOTS[name]
        elif l:
            kind='body_part'; role=l['name']; slot=None
        elif '/base/'in rel:
            kind='body_part'; role='legs_bare_fallback'; slot=None
        else:
            kind='composite'; role='full_outfit'if rel.endswith('/CARD.png')else'clothing_only_proof'; slot=None
        add(rel,p.read_bytes(),cid,kind,role,item,slot,z)

    for cid, c in old['characters'].items():
        code=CODES[cid]
        layers=[]
        for l in c['layers']:
            entry=by_source[l['file']]
            layers.append({'file_id':entry['id'],'z':l['z'],'item':entry['item'],'type':entry['type'],'role':l['name']})
        anatomy={l.get('source'):by_source[l['file']] for l in c['layers'] if l['source_type']=='anatomy'}
        bare_head=add('heads/'+code+'/base_bare.png',(emotion_source/cid/'parts/head.png').read_bytes(),cid,'head_base','head_bare_base',z=70,
                      provenance='existing registered v08 bare base head; comb retained when headwear is off',extra={'headwear_variant':'bare','replaces_role':'head_native_base'})
        base_parts=[by_source[cid+'/base/legs_bare.png']]+[anatomy[cid+'/'+n] for n in ['parts/torso.png','parts/left_wing.png','parts/right_wing.png']]+[bare_head]
        base_z=[3,10,60,61,70]; body=Image.new('RGBA',SIZE)
        for part in base_parts:body.alpha_composite(Image.open(repo/part['png']).convert('RGBA'))
        body_entry=add('body/full_'+code+'.png',png_bytes(body),cid,'body','undressed_full_body',provenance='composed from unchanged v12 anatomy')
        recipes[code]={'source_character':cid,'title':c['name'],'default_items':[k for k in old['equipment_groups']if k.startswith(cid+'/')],
                       'default_layers':layers,'bare_layers':[{'file_id':part['id'],'z':z}for part,z in zip(base_parts,base_z)],
                       'undressed_body_file_id':body_entry['id'],'full_file_id':by_source[cid+'/CARD.png']['id'],
                       'clothing_only_file_id':by_source[cid+'/NO_BAG.png']['id'],
                       'footwear_policy':{'closed_boots_hide_bare_legs':cid in ['C01','C02'],
                                          'crocs_replace_full_legs_with_upper_legs':cid=='C04',
                                          'sandals_keep_bare_legs_between_platform_and_straps':cid=='C05',
                                          'rings_and_anklets_keep_bare_legs':cid in ['C03','C06']}}
        for emotion in ['joy','surprise','determination','sadness']:
            for variant in ['bare','hat']:
                p=emotion_source/cid/'emotions'/(emotion+'_'+variant+'.png')
                if not p.exists():
                    # Fighter and Professor use the same existing head with/without gear.
                    continue
                add('emotions/'+code+'/'+p.name,p.read_bytes(),cid,'head_emotion','replacement_head',z=70,
                    provenance='existing registered v08 emotion; no regeneration',
                    extra={'emotion':emotion,'headwear_variant':variant,'replaces_role':'head_native_base'})
    for key, parts in old['equipment_groups'].items():
        name=key.split('/')[1]; code=CODES[key.split('/')[0]]
        groups[key]={'character':code,'slot':SLOTS[name],'file_ids':[by_source[f]['id']for f in parts],
                     'standing_visible':True,'seated_visible':name not in ['bag','water_toy','shopper_flute','satchel','cloth_bag','bag_h','boots','crocs','sandals','ring07','anklets']}
    assert len(files)==147
    assert sum(x['type'].startswith('item_')for x in files)==49
    assert sum(len(x['default_layers'])for x in recipes.values())==77
    assert all(x['webp_bytes']<300000 for x in files)
    manifest={'schema_version':1,'batch':'characters_v12_web','status':'QA','source_status':old['status'],
              'source_library_file_id':'libfile_7567c5743e348191814cc91cd3ca3831','source_library_version':1,
              'figma':old['figma'],'coordinate_system':{'png':[1200,1520],'webp':[600,760],'origin':[0,0],'trim':False,'web_scale':0.5},
              'counts':{'unchanged_original_png':95,'extra_undressed_bodies':6,'existing_bare_base_heads':6,'existing_emotion_head_variants':40,
                        'emotion_expressions':24,'png':147,'webp':147,'equipment_groups':35,'equipment_parts':49,'default_anatomy_parts':28,'default_layers':77},
              'composition_contract':'Use the interleaved default_layers recipe. A flat undressed body is a preview fallback, not a substitute for torso/head/wings/legs in an equipped assembly. Swapping footwear must follow footwear_policy. Never crop the registration canvas.',
              'characters':recipes,'equipment_groups':groups,'files':files,
              'qa':{'original_95_png_unchanged':True,'png_and_webp_decode':'passed','dimensions_and_transparency':'passed','webp_limit_bytes':300000,'max_webp_bytes':max(x['webp_bytes']for x in files),'browser_assembly':'pending','owner_approval_not_set_by_agent':True}}
    path=repo/'docs/visual/manifests/2026-11-02_characters_v12_web.json'
    atomic(path,(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n').encode())
    print(json.dumps({'manifest':str(path),'png':len(files),'webp':len(files),'max_webp_bytes':manifest['qa']['max_webp_bytes'],'lossy_webp':sum(not x['webp_lossless']for x in files)}))

if __name__=='__main__':
    p=argparse.ArgumentParser(); p.add_argument('--source',type=Path,required=True);p.add_argument('--emotions',type=Path,required=True);p.add_argument('--repo',type=Path,required=True)
    a=p.parse_args();export(a.source,a.emotions,a.repo)
