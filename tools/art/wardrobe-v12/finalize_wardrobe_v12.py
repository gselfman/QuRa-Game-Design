"""Apply the final garment registration correction to the v11 wardrobe package."""
from pathlib import Path
import io, os, json, hashlib, shutil
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(os.environ.get('QURA_V12_WORK_DIR', Path(__file__).parent))
SOURCE = Path(os.environ.get('QURA_V11_PACKAGE', ROOT.parent / 'tryon-v10/QURA_wardrobe_v11'))
OUT = ROOT / 'QURA_wardrobe_v12'
SIZE = (1200, 1520)
SHIFTS = {'C01': (-24, 0), 'C05': (-24, 0), 'C06': (-24, 0)}

def save_png(im, path):
    path.parent.mkdir(parents=True, exist_ok=True)
    b = io.BytesIO()
    im.save(b, format='PNG', compress_level=4)
    temp = path.with_suffix('.pending')
    with temp.open('wb') as f:
        f.write(b.getvalue()); f.flush(); os.fsync(f.fileno())
    temp.replace(path)

def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

def points_bbox(path):
    with Image.open(path) as im:
        return list(im.getchannel('A').getbbox())

shutil.copytree(SOURCE, OUT, dirs_exist_ok=True)
for p in OUT.glob('*_Figma.jpg'):
    p.unlink()
manifest = json.loads((SOURCE/'manifest.json').read_text())
manifest['version'] = 'v12 final standing wardrobe'
manifest['status'] = 'standing wardrobe corrected; other poses and emotions require separate QA'
manifest['registration'] = {'origin_px': [0, 0], 'trim_transparent_canvas': False, 'figma_canvas': [600, 760], 'png_pixels_per_figma_unit': 2}
manifest['final_adjustments'] = {c: {'garment_translation_px': list(delta), 'reason': 'Remove left-screen wing-to-garment gap'} for c, delta in SHIFTS.items()}
qa = {'version': 'v12', 'garments': 6, 'equipment_groups': len(manifest['equipment_groups']), 'full_pose_layers': 0,
      'same_clothing_file_with_and_without_bags': True, 'source_heads_regenerated': False,
      'native_figma_boards_visually_checked': False, 'checks': []}
font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 25)
boards = {tag: Image.new('RGB', (1800, 1680), '#e3e2dc') for tag in ['NO_BAG', 'FULL']}
guides = {'version': 'v12', 'canvas_px': list(SIZE), 'origin_px': [0, 0],
          'side_convention': 'left/right mean screen coordinates',
          'reference_type': 'Final fitted sprite silhouettes; alpha bounds are check frames, not anatomical anchors',
          'equipment': {}, 'eye_anchor_pairs_px': {
              'C01': [[692,410],[830,448]], 'C02': [[718,410],[862,444]],
              'C03': [[708,398],[856,446]], 'C04': [[668,444],[800,494]],
              'C06': [[794,370],[934,422]]}}
for ci, (c, data) in enumerate(manifest['characters'].items()):
    garment = manifest['garments'][c]
    gp = OUT / garment['file']
    original = Image.open(SOURCE/garment['file']).convert('RGBA')
    shifted = Image.new('RGBA', SIZE)
    delta = SHIFTS.get(c, (0,0))
    shifted.alpha_composite(original, delta)
    if c in SHIFTS:
        save_png(shifted, gp)
        garment['matrix'][0][2] += delta[0]/2
        garment['matrix'][1][2] += delta[1]/2
    garment['sha256'] = sha(gp)
    garment['final_translation_px'] = list(delta)
    garment['bbox_px'] = points_bbox(gp)
    # Assemble clothing alone from unmodified base anatomy, retaining bare legs.
    anatomy = {x['source']: OUT/x['file'] for x in data['layers'] if x['source_type'] == 'anatomy'}
    clean = Image.new('RGBA', SIZE)
    clean.alpha_composite(Image.open(OUT/c/'base/legs_bare.png').convert('RGBA'))
    clean.alpha_composite(Image.open(anatomy[c+'/parts/torso.png']).convert('RGBA'))
    clean.alpha_composite(shifted)
    for name in ['parts/left_wing.png', 'parts/right_wing.png', 'head_native_base.png']:
        clean.alpha_composite(Image.open(anatomy[c+'/'+name]).convert('RGBA'))
    save_png(clean, OUT/data['without_bag'])
    full = Image.new('RGBA', SIZE)
    for layer in data['layers']:
        full.alpha_composite(Image.open(OUT/layer['file']).convert('RGBA'))
    save_png(full, OUT/data['full_outfit'])
    qa['full_pose_layers'] += len(data['layers'])
    qa['checks'].append({'character':c, 'complete_clothing':garment['file'], 'same_file_in_full_and_no_bag':True,
                         'translation_px':list(delta), 'RGBA':True, 'canvas':list(SIZE),
                         'unchanged_non_clothing_layers': all(sha(OUT/x['file']) == sha(SOURCE/x['file']) for x in data['layers'] if x['source_type'] != 'complete_clothing')})
    for tag, im in [('NO_BAG', clean), ('FULL', full)]:
        thumb = im.copy(); thumb.thumbnail((570,760))
        x = ci%3*600; y = ci//3*840
        boards[tag].paste(thumb,(x+(600-thumb.width)//2,y+55),thumb)
        ImageDraw.Draw(boards[tag]).text((x+18,y+12),data['name'],font=font,fill='#222')
for key, files in manifest['equipment_groups'].items():
    guides['equipment'][key] = {'parts':[]}
    for file in files:
        layers = [l for v in manifest['characters'].values() for l in v['layers'] if l['file']==file]
        guides['equipment'][key]['parts'].append({'file':file,'bbox_px':points_bbox(OUT/file),
                                                 'z': layers[0]['z'], 'name':layers[0]['name']})
for p in OUT.rglob('*.png'):
    with Image.open(p) as im:
        assert im.mode=='RGBA' and im.size==SIZE, str(p)
        assert im.getchannel('A').getextrema()[0]==0, str(p)
        im.load()
qa['all_png_canvas_mode_transparency_checked'] = True
qa['png_files'] = len(list(OUT.rglob('*.png')))
assert qa['full_pose_layers']==77 and qa['equipment_groups']==35
for tag, board in boards.items():
    board.save(ROOT/('QuRa_v12_'+tag+'.jpg'), quality=95)
for name, obj in [('manifest.json',manifest),('qa.json',qa),('slot-guides.json',guides)]:
    (OUT/name).write_text(json.dumps(obj,ensure_ascii=False,indent=2)+'\n')
shutil.copyfile(ROOT/'ACCESSORY_RULES_RU.md', OUT/'ACCESSORY_RULES_RU.md')
readme=(SOURCE/'README_RU.txt').read_text().replace('v11','v12')
readme += '\nФинальная правка v12: одежда Рябы, Монаха и Гламурочки смещена влево на 24 пикселя PNG внутри общего холста. Остальные спрайты сохранены.\nПравила нового предмета: ACCESSORY_RULES_RU.md. Эталоны слотов и порядок частей: slot-guides.json.\n'
(OUT/'README_RU.txt').write_text(readme)
print(json.dumps({'package':str(OUT),'pngs':qa['png_files'],'layers':77,'equipment_groups':35,'shifted':list(SHIFTS)}))
