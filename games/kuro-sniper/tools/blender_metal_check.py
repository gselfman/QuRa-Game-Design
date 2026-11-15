"""Render a small Metal test; optionally save Cycles device preferences."""
import argparse
import json
import sys
from pathlib import Path

import bpy

arguments = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
parser = argparse.ArgumentParser()
parser.add_argument('--output', required=True)
parser.add_argument('--save-preferences', action='store_true')
parser.add_argument('--kernel-optimization', choices=['OFF', 'INTERSECT', 'FULL'], default='INTERSECT')
options = parser.parse_args(arguments)
output = Path(options.output).expanduser().resolve()
output.mkdir(parents=True, exist_ok=True)
existing_preferences = Path(bpy.utils.user_resource('CONFIG')) / 'userpref.blend'
if options.save_preferences and existing_preferences.is_file():
    # --factory-startup is useful for a repeatable test scene, but should not
    # reset unrelated preferences when applying the Cycles device selection.
    bpy.ops.wm.read_userpref()
preferences = bpy.context.preferences.addons['cycles'].preferences
preferences.compute_device_type = 'METAL'
preferences.kernel_optimization_level = options.kernel_optimization
preferences.get_devices()
print('Metal device discovery completed', flush=True)
devices = []
for device in preferences.devices:
    device.use = device.type == 'METAL'
    devices.append({'name': device.name, 'type': device.type, 'enabled': bool(device.use)})
if not any(d['type'] == 'METAL' and d['enabled'] for d in devices):
    raise RuntimeError('No Metal render device was found; preferences were not saved')
print(json.dumps({'devices': devices}), flush=True)
scene = bpy.context.scene
scene.render.engine = 'CYCLES'
scene.cycles.device = 'GPU'
scene.cycles.samples = 4
scene.render.resolution_x = 256
scene.render.resolution_y = 256
scene.render.resolution_percentage = 100
scene.render.image_settings.file_format = 'PNG'
scene.render.filepath = str(output / 'metal-probe.png')
print('Starting Metal test render', flush=True)
bpy.ops.render.render(write_still=True)
if options.save_preferences:
    bpy.ops.wm.save_userpref()
report = {
    'blenderVersion': bpy.app.version_string,
    'devices': devices,
    'renderEngine': 'CYCLES_METAL_GPU',
    'renderPassed': True,
    'preferencesSaved': options.save_preferences,
    'kernelOptimization': options.kernel_optimization,
    'pngBytes': (output / 'metal-probe.png').stat().st_size,
    'note': 'New scenes must also select Cycles GPU; factory-startup may ignore saved user preferences.',
}
(output / 'metal-report.json').write_text(json.dumps(report, ensure_ascii=False, indent=2))
print(json.dumps(report, ensure_ascii=False))
