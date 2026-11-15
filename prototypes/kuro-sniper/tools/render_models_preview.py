"""Render one compact, neutral-light contact sheet of the five original props."""
import argparse
import json
import math
import sys
from pathlib import Path
import bpy
from mathutils import Vector

argv=sys.argv[sys.argv.index('--')+1:]
parser=argparse.ArgumentParser()
parser.add_argument('--models',required=True)
args=parser.parse_args(argv)
folder=Path(args.models)
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)
for index,name in enumerate(['airgun','sport','sniper','precision','final']):
    before=set(bpy.data.objects)
    bpy.ops.import_scene.gltf(filepath=str(folder/f'ks-rifle-{name}.glb'))
    added=set(bpy.data.objects)-before
    group=bpy.data.objects.new('preview_'+name,None)
    bpy.context.collection.objects.link(group)
    for obj in added:
        if obj.parent is None:
            obj.parent=group
    group.location=(0,0,(4-index)*.6)

scene=bpy.context.scene
scene.render.engine='BLENDER_EEVEE'
scene.render.resolution_x=1300
scene.render.resolution_y=1400
scene.render.resolution_percentage=100
scene.render.image_settings.file_format='PNG'
scene.world.color=(.5,.5,.5)
scene.view_settings.view_transform='AgX'
bpy.ops.mesh.primitive_plane_add(size=200,location=(-.3,0,0))
bg=bpy.context.object
bg.rotation_euler.y=math.pi/2
mat=bpy.data.materials.new('Preview warm cream');mat.diffuse_color=(.65,.60,.52,1)
bg.data.materials.append(mat)
for location,energy,size in [((3,-3,6),1700,5),((4,4,3),800,4),((1,0,6),600,3)]:
    bpy.ops.object.light_add(type='AREA',location=location)
    light=bpy.context.object;light.data.energy=energy;light.data.shape='DISK';light.data.size=size
    light.rotation_euler=(Vector((0,0,1.2))-light.location).to_track_quat('-Z','Y').to_euler()
bpy.ops.object.camera_add(location=(5,-2.7,3.0))
camera=bpy.context.object
camera.rotation_euler=(Vector((0,-.1,1.2))-camera.location).to_track_quat('-Z','Y').to_euler()
camera.data.type='ORTHO';camera.data.ortho_scale=3.35
scene.camera=camera
scene.render.filepath=str(folder/'rifles-preview.png')
bpy.ops.render.render(write_still=True)
print(json.dumps({'preview':str(folder/'rifles-preview.png')}))
