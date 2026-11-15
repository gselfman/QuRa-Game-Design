"""Headless Blender capability probe. Creates a diagnostic cube, not a game asset."""
import argparse
import json
import math
import sys
from pathlib import Path

import bpy
import gpu
from mathutils import Vector

arguments = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
parser = argparse.ArgumentParser()
parser.add_argument('--output', required=True)
parser.add_argument('--engine', choices=['CYCLES', 'BLENDER_EEVEE'], default='CYCLES')
options = parser.parse_args(arguments)
output = Path(options.output).expanduser().resolve()
output.mkdir(parents=True, exist_ok=True)
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)
bpy.ops.mesh.primitive_cube_add(size=1, location=(0, 0, 0.5))
probe = bpy.context.object
probe.name = 'KS_DIAGNOSTIC_CUBE_NOT_CHARACTER'
material = bpy.data.materials.new('KS_DIAGNOSTIC_AMBER')
material.diffuse_color = (0.8, 0.27, 0.035, 1.0)
probe.data.materials.append(material)
probe.rotation_euler.z = 0
probe.keyframe_insert(data_path='rotation_euler', frame=1)
probe.rotation_euler.z = 0.6
probe.keyframe_insert(data_path='rotation_euler', frame=30)
bpy.context.scene.render.fps = 30
bpy.context.scene.frame_start = 1
bpy.context.scene.frame_end = 30
bpy.context.scene.frame_set(1)
scene = bpy.context.scene
scene.render.engine = options.engine
if options.engine == 'CYCLES':
    scene.cycles.device = 'CPU'
    scene.cycles.samples = 12
scene.render.resolution_x = 512
scene.render.resolution_y = 512
scene.render.resolution_percentage = 100
scene.world.color = (0.12, 0.12, 0.12)
bpy.ops.object.camera_add(location=(3, -4, 3))
camera = bpy.context.object
camera.rotation_euler = (Vector((0, 0, 0.5)) - camera.location).to_track_quat('-Z', 'Y').to_euler()
scene.camera = camera
bpy.ops.object.light_add(type='AREA', location=(1, -2, 4))
bpy.context.object.data.energy = 500
bpy.context.object.data.shape = 'DISK'
bpy.context.object.data.size = 4
scene.render.image_settings.file_format = 'PNG'
scene.render.filepath = str(output / 'probe.png')
bpy.ops.wm.save_as_mainfile(filepath=str(output / 'probe.blend'))
bpy.ops.export_scene.gltf(filepath=str(output / 'probe.glb'), export_format='GLB', export_animations=True)
bpy.ops.render.render(write_still=True)
graphics_backend = gpu.platform.backend_type_get()
# Round-trip the exported file to exercise the installed import/export add-on.
probe_name = probe.name
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.context.scene.render.fps = 30
bpy.ops.import_scene.gltf(filepath=str(output / 'probe.glb'))
restored = bpy.data.objects.get('KS_DIAGNOSTIC_CUBE_NOT_CHARACTER')
if restored is None or restored.animation_data is None or restored.animation_data.action is None:
    raise RuntimeError('GLB round-trip did not restore the diagnostic animation')
bpy.context.scene.frame_set(1)
start_rotation = restored.rotation_quaternion.copy() if restored.rotation_mode == 'QUATERNION' else restored.rotation_euler.to_quaternion()
bpy.context.scene.frame_set(30)
end_rotation = restored.rotation_quaternion.copy() if restored.rotation_mode == 'QUATERNION' else restored.rotation_euler.to_quaternion()
rotation_delta = start_rotation.rotation_difference(end_rotation).angle
if rotation_delta < 0.1:
    raise RuntimeError('Imported animation did not change the diagnostic cube rotation')
report = {
    'purpose': 'diagnostic cube only; no production chicken model or rig tested',
    'blenderVersion': bpy.app.version_string,
    'files': ['probe.blend', 'probe.glb', 'probe.png'],
    'frames': [1, 30],
    'fps': 30,
    'mesh': probe_name,
    'glbBytes': (output / 'probe.glb').stat().st_size,
    'pngBytes': (output / 'probe.png').stat().st_size,
    'animationRoundTrip': True,
    'rotationChangeDegrees': math.degrees(rotation_delta),
    'renderEngine': 'CYCLES_CPU' if options.engine == 'CYCLES' else options.engine,
    'graphicsBackend': graphics_backend,
}
(output / 'probe-report.json').write_text(json.dumps(report, ensure_ascii=False, indent=2))
print(json.dumps(report, ensure_ascii=False))
