"""Headless Blender capability probe. Creates a diagnostic cube, not a game asset."""
import argparse
import json
import sys
from pathlib import Path

import bpy

arguments = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
parser = argparse.ArgumentParser()
parser.add_argument('--output', required=True)
options = parser.parse_args(arguments)
output = Path(options.output).expanduser().resolve()
output.mkdir(parents=True, exist_ok=True)
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)
bpy.ops.mesh.primitive_cube_add(size=1, location=(0, 0, 0.5))
probe = bpy.context.object
probe.name = 'KS_DIAGNOSTIC_CUBE_NOT_CHARACTER'
probe.rotation_euler.z = 0
probe.keyframe_insert(data_path='rotation_euler', frame=1)
probe.rotation_euler.z = 0.6
probe.keyframe_insert(data_path='rotation_euler', frame=30)
bpy.context.scene.render.fps = 30
bpy.context.scene.frame_start = 1
bpy.context.scene.frame_end = 30
bpy.context.scene.frame_set(1)
bpy.ops.wm.save_as_mainfile(filepath=str(output / 'probe.blend'))
bpy.ops.export_scene.gltf(filepath=str(output / 'probe.glb'), export_format='GLB', export_animations=True)
report = {
    'purpose': 'diagnostic cube only; no production chicken model or rig tested',
    'blenderVersion': bpy.app.version_string,
    'files': ['probe.blend', 'probe.glb'],
    'frames': [1, 30],
    'fps': 30,
    'mesh': probe.name,
    'glbBytes': (output / 'probe.glb').stat().st_size,
}
(output / 'probe-report.json').write_text(json.dumps(report, ensure_ascii=False, indent=2))
print(json.dumps(report, ensure_ascii=False))
