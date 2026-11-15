"""Validate the design package and numeric feasibility; does not run a game."""
import json
import math
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
REPO = ROOT.parents[1]

def read(name):
    return json.loads((ROOT / 'data' / name).read_text())

b = read('balance.json')
sources = read('asset-sources.json')
screens = read('screen-prompts.json')['prompts']
assets = read('asset-prompts.json')['jobs']
rounds = read('round-plan.json')['rounds']
events = read('animation-events.json')
assert len(b['levels']) == 10
assert [l['id'] for l in b['levels']] == list(range(1, 11))
assert b['levels'][-1]['distanceM'] == 1000
assert len(b['characters']) == 5
character_ids = {c['id'] for c in b['characters']}
assert character_ids == {'C01', 'C02', 'C03', 'C04', 'C06'}
assert [r['characterIds'] for r in b['rounds']] == [
    ['C01'], ['C01', 'C03'], ['C01', 'C03', 'C04'],
    ['C01', 'C03', 'C04', 'C02'], ['C01', 'C03', 'C04', 'C02', 'C06']]
hits = sum(len(r['characterIds']) for r in b['rounds'])
assert hits == b['rules']['requiredHitsPerLevel'] == 15
assert hits * (len(b['levels'])-1)+b['rules']['finale']['requiredHits'] == 140
ammo = b['rules']['ammoPerLevel']
fail = b['rules']['mistakesToFail']
assert (ammo, fail) == (18, 3)
assert ammo - hits == 3 and ammo - hits - (fail - 1) == 1
score = b['scoring']
maximum = hits * (score['hit'] + score['centerBonus']) + sum(
    min(i * score['streakStep'], score['streakMax']) for i in range(hits)
) + score['flawlessLevelBonus']
assert maximum == score['maxScorePerLevel'] == 3050
loadouts = {w['id']: w for w in b['loadouts']}
assert len(loadouts) == 9
assert len({w['family'] for w in loadouts.values()}) == 5
assert len(rounds) == 46 and len({r['id'] for r in rounds}) == 46
for level in b['levels']:
    weapon = loadouts[level['loadoutId']]
    assert 1 <= weapon['defaultMagnification'] <= weapon['maxMagnification']
    actual = [r for r in rounds if r['levelId'] == level['id']]
    assert len(actual) == (1 if level.get('mode')=='balloons' else 5)
    assert sum(r['goals'] for r in actual) == (5 if level.get('mode')=='balloons' else 15)
    assert all(r['characterIds'] == (b['rounds'][-1]['characterIds'] if level.get('mode')=='balloons' else b['rounds'][r['roundId'] - 1]['characterIds']) for r in actual)
    assert all(not r['resetAmmo'] and not r['resetMistakes'] for r in actual)
    theta = math.radians(b['aim']['baseVerticalFovDeg'])
    height = b['aim']['minimumViewportHeightCssPx']
    maximum_m = weapon['maxMagnification']
    diameter = height * level['targetDiameterM'] / (2 * level['distanceM'] * math.tan(theta / 2)) * maximum_m
    assert diameter >= b['aim']['minScopedTargetCssPx'], (level['id'], diameter)
    lens_diameter = height * b['aim']['scopeDiameterHeightRatio']
    scope_fov = 2 * math.atan((lens_diameter / height) * math.tan(theta / 2) / maximum_m)
    measured_m = (lens_diameter / height) * math.tan(theta / 2) / math.tan(scope_fov / 2)
    assert math.isclose(measured_m, maximum_m, rel_tol=1e-10)
    print(f"L{level['id']}: {level['distanceM']} m, max {maximum_m}x, target {diameter:.1f} CSS px")
assert len(screens) == 20 and len({p['id'] for p in screens}) == 20
for level in b['levels']:
    pair = [p for p in screens if p['levelId'] == level['id']]
    assert {p['view'] for p in pair} == {'world', 'scope'}
assert len(assets) == 29 and len({p['id'] for p in assets}) == 29
assert all(len(p['prompt']) > 500 for p in screens + assets)
for c in sources['characters']:
    assert c['id'] in character_ids and ':' in c['nodeId']
    assert (REPO / c['existingPng']).is_file(), c['existingPng']
assert len(events['requiredClips']) == len(set(events['requiredClips'])) == 15
assert [e['timeMs'] for e in events['success']] == sorted(e['timeMs'] for e in events['success'])
for document in ROOT.glob('*.md'):
    for link in re.findall(r'\[[^\]]*\]\(([^)]+)\)', document.read_text()):
        if re.match(r'^[a-zA-Z]+:', link) or link.startswith('#'):
            continue
        assert (document.parent / link.split('#')[0]).exists(), (document.name, link)
for script in ('blender_probe.py', 'blender_metal_check.py', 'configure_blender.py'):
    compile((ROOT / 'tools' / script).read_text(), script, 'exec')
print('PASS: 10 levels / 46 rounds / 140 targets; ammo, score, references, 49 briefs, lens geometry and links.')
print('NOT RUN by this validator: game runtime, live optics rendering, animation quality, real-device FPS or Blender. See blender-environment.json for separate installed-tool checks.')
