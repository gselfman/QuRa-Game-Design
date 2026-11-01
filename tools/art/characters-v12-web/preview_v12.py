"""Check all default recipes and create file-based fixtures for browser screenshots."""
from pathlib import Path
from PIL import Image,ImageChops,ImageStat,ImageDraw
import argparse,json,html,os,io

def run(repo,out):
    repo=repo.resolve();out.mkdir(parents=True,exist_ok=True);out=out.resolve()
    mp=repo/'docs/visual/manifests/2026-11-02_characters_v12_web.json'
    m=json.loads(mp.read_text());lookup={f['id']:f for f in m['files']};results=[]
    for code,c in m['characters'].items():
        layers=sorted(c['default_layers'],key=lambda l:l['z']);render=Image.new('RGBA',(600,760))
        for layer in layers:render.alpha_composite(Image.open(repo/lookup[layer['file_id']]['webp']).convert('RGBA'))
        reference=Image.open(repo/lookup[c['full_file_id']]['png']).convert('RGBA').resize((600,760),Image.Resampling.LANCZOS)
        mask=ImageChops.lighter(render.getchannel('A'),reference.getchannel('A')).point(lambda p:255 if p else 0)
        values=ImageStat.Stat(ImageChops.difference(render,reference),mask).mean
        metrics={'character':code,'rgb_mae':sum(values[:3])/3,'alpha_mae':values[3],'layer_count':len(layers),'pixel_check':'passed'}
        assert metrics['rgb_mae']<6 and metrics['alpha_mae']<3,metrics
        results.append(metrics)
        if code not in ['ryaba','fighter']:continue
        # A deterministic raster proof, explicitly not a browser screenshot.
        proof=Image.new('RGBA',(1200,800),(227,226,220,255));proof.alpha_composite(render,(0,40));proof.alpha_composite(reference,(600,40))
        draw=ImageDraw.Draw(proof);draw.text((20,15),code+' | REGISTERED WEBP LAYERS',fill=(36,32,26));draw.text((620,15),'ORIGINAL V12 PNG | NOT A BROWSER CAPTURE',fill=(36,32,26))
        target=repo/'assets/characters/previews'/('v12_'+code+'_registered_proof.png');target.parent.mkdir(parents=True,exist_ok=True)
        data=io.BytesIO();proof.save(data,format='PNG')
        temporary=target.with_suffix('.tmp')
        with temporary.open('wb') as stream:stream.write(data.getvalue());stream.flush();os.fsync(stream.fileno())
        os.replace(temporary,target)
        def src(p):return html.escape(Path(os.path.relpath(repo/p,out)).as_posix(),quote=True)
        imgs=''.join('<img src="'+src(lookup[l['file_id']]['webp'])+'" alt="'+html.escape(l['role'],quote=True)+'">'for l in layers)
        title=html.escape(c['title'])
        document='''<!doctype html><html lang="ru"><meta charset="utf-8"><title>QuRa v12 browser assembly</title><style>*{box-sizing:border-box}body{margin:0;width:1200px;background:#e3e2dc;color:#24201a;font:20px system-ui}header{height:80px;padding:12px 24px;display:flex;gap:40px}header div{width:560px}b{display:block;font-size:23px;margin-bottom:3px}small{font-size:15px}main{display:flex}.stage{position:relative;width:600px;height:760px}.stage img{position:absolute;left:0;top:0;width:600px;height:760px}pre{margin:0;padding:12px 24px;font:14px monospace}</style><header><div><b>'''+title+''' · послойная сборка</b><small>WebP 600 × 760 · исходный порядок z</small></div><div><b>Эталон v12</b><small>Исходный PNG · Figma 235:142</small></div></header><main><div class="stage">'''+imgs+'''</div><div class="stage"><img src="'''+src(lookup[c['full_file_id']]['png'])+'''" alt="Эталон v12"></div></main><pre id="qa-result" role="status">Loading images</pre><script>window.addEventListener('load',()=>{const images=Array.from(document.images);document.querySelector('#qa-result').textContent=JSON.stringify({character:''' +json.dumps(code)+''',images:images.length,loaded:images.every(im=>im.complete&&im.naturalWidth>0),canvas:[600,760]})})</script></html>'''
        (out/('v12_'+code+'.html')).write_text(document)
    m['qa']['registered_recipe_pixel_comparison']={'status':'passed','reference':'original PNG resized to 600x760 with Lanczos','results':results}
    mp.write_text(json.dumps(m,ensure_ascii=False,indent=2)+'\n')
    (out/'pixel-comparison.json').write_text(json.dumps(results,indent=2)+'\n')
    print(json.dumps({'fixtures':str(out),'results':results}))

if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('--repo',type=Path,required=True);p.add_argument('--out',type=Path,required=True);a=p.parse_args();run(a.repo,a.out)
