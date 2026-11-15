"""Generate the prototype's original fictional sporting props with Blender.

Blender coordinates: barrel points -Y, Z up. glTF export: barrel +Z, Y up.
No external meshes/textures. These are decorative game props, not weapon plans.
"""
import argparse
import json
import math
import sys
from pathlib import Path

import bpy
from mathutils import Vector

arguments = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
parser = argparse.ArgumentParser()
parser.add_argument('--output', required=True)
args = parser.parse_args(arguments)
OUT = Path(args.output).resolve()
OUT.mkdir(parents=True, exist_ok=True)


def material(name, rgb, metallic=0, roughness=.45, alpha=1):
    m = bpy.data.materials.get(name) or bpy.data.materials.new(name)
    m.use_nodes = True
    p = m.node_tree.nodes.get('Principled BSDF')
    p.inputs['Base Color'].default_value = (*rgb, alpha)
    p.inputs['Metallic'].default_value = metallic
    p.inputs['Roughness'].default_value = roughness
    p.inputs['Alpha'].default_value = alpha
    m.diffuse_color = (*rgb, alpha)
    if alpha < 1:
        m.surface_render_method = 'DITHERED'
    return m


M = {
    'metal': material('Graphite | brushed sporting metal', (.045, .054, .064), .82, .3),
    'steel': material('Satin stainless details', (.31, .35, .39), .9, .27),
    'wood': material('Warm walnut', (.24, .073, .027), .0, .36),
    'wood_hi': material('Walnut edge grain', (.39, .145, .052), .0, .4),
    'rubber': material('Soft matte contact pads', (.018, .022, .025), .0, .85),
    'brass': material('Warm brass', (.64, .35, .105), .78, .28),
    'olive': material('Olive enamel', (.18, .22, .115), .28, .4),
    'sand': material('Desert sand enamel', (.48, .37, .22), .3, .42),
    'bronze': material('Bronze optic', (.31, .19, .1), .75, .29),
    'glass': material('Blue coated optical glass', (.065, .19, .24), .28, .12, .68),
    'red': material('Target latch painted crimson', (.57, .045, .027), .12, .35),
    'plank': material('Honey oak platform', (.38, .195, .075), .0, .55),
    'plank_hi': material('Honey oak light edge', (.52, .30, .11), .0, .5),
}


def reset():
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete(use_global=False)


def finish(obj, name, mat, bevel=0):
    obj.name = name
    obj.data.materials.append(M[mat])
    if bevel:
        mod = obj.modifiers.new('Soft manufactured edges', 'BEVEL')
        mod.width = bevel
        mod.segments = 3
        bpy.context.view_layer.objects.active = obj
        bpy.ops.object.modifier_apply(modifier=mod.name)
        normal = obj.modifiers.new('Weighted normals', 'WEIGHTED_NORMAL')
        bpy.ops.object.modifier_apply(modifier=normal.name)
    return obj


def box(name, location, scale, mat, bevel=.006):
    bpy.ops.mesh.primitive_cube_add(size=1, location=location)
    obj = bpy.context.object
    obj.dimensions = scale
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    return finish(obj, name, mat, bevel)


def cylinder(name, location, radius, length, mat, axis='Y', vertices=24):
    bpy.ops.mesh.primitive_cylinder_add(vertices=vertices, radius=radius, depth=length, location=location)
    obj = bpy.context.object
    if axis == 'Y':
        obj.rotation_euler.x = math.pi / 2
    elif axis == 'X':
        obj.rotation_euler.y = math.pi / 2
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    finish(obj, name, mat, min(.002, radius / 7))
    for poly in obj.data.polygons:
        poly.use_smooth = True
    return obj


def sphere(name, location, radius, mat):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=16, ring_count=8, radius=radius, location=location)
    obj = finish(bpy.context.object, name, mat)
    for p in obj.data.polygons:
        p.use_smooth = True
    return obj


def prism(name, yz, half_width, mat, bevel=.008):
    vertices = [(-half_width, y, z) for y, z in yz] + [(half_width, y, z) for y, z in yz]
    count = len(yz)
    faces = [tuple(range(count - 1, -1, -1)), tuple(range(count, 2 * count))]
    faces += [(i, (i + 1) % count, (i + 1) % count + count, i + count) for i in range(count)]
    mesh = bpy.data.meshes.new(name)
    mesh.from_pydata(vertices, [], faces)
    mesh.update()
    obj = bpy.data.objects.new(name, mesh)
    bpy.context.collection.objects.link(obj)
    return finish(obj, name, mat, bevel)


def tube(name, points, radius, mat):
    curve = bpy.data.curves.new(name, 'CURVE')
    curve.dimensions = '3D'
    curve.resolution_u = 2
    curve.bevel_depth = radius
    curve.bevel_resolution = 2
    spline = curve.splines.new('POLY')
    spline.points.add(len(points) - 1)
    for p, co in zip(spline.points, points):
        p.co = (*co, 1)
    obj = bpy.data.objects.new(name, curve)
    bpy.context.collection.objects.link(obj)
    obj.data.materials.append(M[mat])
    bpy.context.view_layer.objects.active = obj
    obj.select_set(True)
    bpy.ops.object.convert(target='MESH')
    obj.select_set(False)
    return obj


def scope(style, long=False):
    center = -.085
    length = .34 if long else .27
    housing = 'bronze' if style == 'precision' else 'metal'
    cylinder('scope_body', (0, center, .242), .029, length, housing)
    cylinder('scope_objective', (0, center - length/2 - .026, .242), .042 if long else .037, .066, housing)
    cylinder('scope_eyepiece', (0, center + length/2 + .012, .242), .035, .055, 'rubber')
    cylinder('scope_glass_front', (0, center - length/2 - .061, .242), .034 if long else .029, .002, 'glass')
    cylinder('scope_glass_rear', (0, center + length/2 + .04, .242), .027, .002, 'glass')
    for y in [center-.08, center+.075]:
        cylinder('scope_mount_ring', (0, y, .242), .032, .016, 'metal')
        box('scope_mount_foot', (0, y, .174), (.058, .036, .08), 'metal', .003)
    cylinder('scope_elevation_dial', (0, center, .282), .022, .03, 'metal', axis='Z')
    cylinder('scope_windage_dial', (.04, center, .242), .019, .026, 'metal', axis='X')
    for y in [center + length/2 - .003, center - length/2 + .035]:
        cylinder('scope_gold_detail', (0, y, .242), .031, .004, 'brass')


def gun(kind):
    reset()
    finish_stock = 'wood' if kind in ['airgun', 'sport', 'precision'] else 'olive' if kind == 'sniper' else 'sand'
    receiver_mat = 'sand' if kind == 'final' else 'metal'
    barrel_length = {'airgun':.55, 'sport':.54, 'sniper':.65, 'precision':.62, 'final':.68}[kind]
    muzzle_y = -.235 - barrel_length
    # Root grip sits near world origin. The butt extends behind +Y, muzzle toward -Y.
    cylinder('barrel', (0, -.235 - barrel_length/2, .105), .017 if kind == 'airgun' else .023, barrel_length, 'metal')
    cylinder('capsule_muzzle_rim', (0, muzzle_y-.006, .105), .022 if kind=='airgun' else .031, .035, 'steel')
    cylinder('capsule_muzzle_dark', (0, muzzle_y-.025, .105), .014 if kind=='airgun' else .020, .0015, 'rubber')
    box('receiver', (0, -.07, .096), (.082, .34, .084), receiver_mat)
    box('receiver_top_rail', (0, -.065, .145), (.056, .30, .014), 'metal', .002)
    for y in [-.19,-.15,-.11,-.07,-.03,.01,.05]:
        box('rail_tooth', (0, y, .157), (.061, .009, .009), 'metal', .001)
    cylinder('bolt', (.045, .025, .094), .013, .11, 'steel')
    tube('bolt_handle', [(.047,.069,.096),(.087,.075,.082),(.103,.075,.052)], .006, 'steel')
    sphere('bolt_knob', (.103,.075,.045), .015, 'metal')
    prism('pistol_grip', [(.025,.06),(.09,.06),(.16,-.11),(.103,-.14),(.066,-.10)], .034, 'wood' if kind=='airgun' else 'rubber')
    tube('trigger_guard', [(0,-.09,.04),(0,-.107,-.024),(0,-.075,-.06),(0,.019,-.064),(0,.065,-.022),(0,.061,.02)], .007, 'metal')
    tube('decorative_trigger', [(0,-.018,.04),(0,-.01,-.017),(0,-.035,-.029)], .006, 'brass' if kind=='airgun' else 'steel')

    if kind in ['airgun','sport']:
        prism('sculpted_walnut_stock', [(.09,.10),(.18,.105),(.27,.072),(.43,.065),(.50,.08),(.52,-.16),(.45,-.17),(.26,-.025),(.17,-.018)], .043, finish_stock, .012)
        prism('buttpad', [(.495,.088),(.525,.079),(.54,-.166),(.507,-.17)], .048, 'rubber', .006)
        prism('fore_end', [(-.355,.065),(-.35,.015),(-.235,-.012),(-.07,.015),(-.06,.065)], .045, 'wood', .01)
        for x in [-.044,.044]:
            for y in [.285,.325,.365]:
                box('walnut_checkering', (x,y,-.001), (.002,.022,.025), 'wood_hi', .001)
    else:
        # Distinct adjustable chassis with open structural stock.
        box('chassis_fore_end', (0,-.25,.047), (.095,.35,.057), finish_stock)
        box('chassis_rear_spine', (0,.255,.058), (.061,.30,.06), receiver_mat)
        box('adjustable_cheekpiece', (0,.35,.115), (.095,.22,.056), 'wood' if kind=='precision' else finish_stock, .01)
        cylinder('stock_support_upper', (0,.35,.046), .015,.29,'steel')
        cylinder('stock_support_lower', (0,.35,-.065), .012,.29,'steel')
        box('shoulder_stock', (0,.495,-.016), (.10,.07,.23), finish_stock, .01)
        box('shoulder_rubber', (0,.539,-.016), (.105,.028,.22), 'rubber', .008)
        box('capsule_cartridge', (0,-.04,-.045), (.058,.09,.095), 'metal')
        for x in [-.049,.049]:
            for y in [-.365,-.31,-.255,-.2,-.145]:
                box('chassis_vent', (x,y,.048), (.002,.03,.022), 'rubber', .001)
        # Folded/support bipod, cosmetic joints remain separate for runtime.
        cylinder('bipod_hinge', (0,-.36,.002), .019,.12,'steel',axis='X')
        for side in [-1,1]:
            a=Vector((side*.047,-.36,.0)); z=Vector((side*.12,-.47,-.25))
            mid=(a+z)/2
            bpy.ops.mesh.primitive_cylinder_add(vertices=16,radius=.009,depth=(z-a).length,location=mid)
            leg=bpy.context.object
            leg.rotation_euler=(z-a).to_track_quat('Z','Y').to_euler()
            finish(leg,'bipod_leg', 'metal')
            box('bipod_rubber_foot', z, (.038,.045,.018),'rubber',.005)

    # All rifles have original cosmetic brass details.
    for y in [-.18,.048]:
        cylinder('receiver_side_screw', (.043,y,.10), .006,.003,'brass',axis='X',vertices=12)
    if kind=='airgun':
        box('open_rear_sight', (0,.03,.159), (.05,.027,.034),'metal',.003)
        box('open_front_sight', (0,muzzle_y+.055,.147), (.012,.02,.055),'metal',.002)
        # Compact reflex housing, no scope magnification.
        box('reflex_base', (0,-.07,.175), (.057,.065,.019),'metal',.003)
        tube('reflex_frame', [(-.03,-.09,.182),(-.03,-.09,.238),(0,-.09,.25),(.03,-.09,.238),(.03,-.09,.182)],.005,'metal')
    else:
        scope(kind,kind in ['sniper','precision','final'])
    # Consistent root node, so assets can be positioned by parent transform.
    root=bpy.data.objects.new('KS_WEAPON_ROOT',None)
    bpy.context.collection.objects.link(root)
    for obj in list(bpy.context.scene.objects):
        if obj!=root:
            obj.parent=root
    root['family']=kind
    root['barrel_direction']='glTF +Z'
    root['root']='grip area'


def station():
    reset()
    for x in [-.21,.21]:
        box('upright', (x,0,.64), (.085,.11,1.28),'plank',.009)
        box('station_foot', (x,0,.055), (.15,.55,.11),'plank',.012)
    box('station_crossbar', (0,0,1.17), (.61,.14,.12),'plank_hi',.01)
    box('station_lower_brace', (0,.02,.3), (.57,.09,.08),'plank',.006)
    cylinder('hinge_axle', (0,-.18,1.4), .022,.78,'steel',axis='X')
    hinge=bpy.data.objects.new('platform_hinge',None)
    hinge.location=(0,-.18,1.4)
    bpy.context.collection.objects.link(hinge)
    platform=box('folding_platform', (0,0,1.425), (.78,.44,.065),'plank_hi',.013)
    platform.parent=hinge
    platform.matrix_parent_inverse=hinge.matrix_world.inverted()
    for x in [-.31,.31]:
        box('hinge_mount', (x,-.18,1.35), (.045,.09,.13),'metal',.005)
    box('latch', (0,-.11,1.27), (.052,.05,.14),'red',.006)
    for x in [-.24,.24]:
        cylinder('bolt_head', (x,-.077,1.17),.012,.009,'brass',vertices=12)
    # Target position is metadata, actual moving disk is controlled by game code.
    root=bpy.data.objects.new('KS_STATION_ROOT',None)
    bpy.context.collection.objects.link(root)
    for obj in list(bpy.context.scene.objects):
        if obj!=root and obj.parent is None:
            obj.parent=root
    root['target_center_blender']=[0,-.16,.88]
    root['perch_top_blender']=[0,0,1.458]


def export(name):
    # Mobile-friendly material batches. Keep optical surfaces and the bolt
    # separate so the runtime can hide glass or animate the bolt if desired.
    if name.startswith('ks-rifle-'):
        keep = {'bolt','bolt_handle','bolt_knob','scope_glass_front','scope_glass_rear'}
        groups = {}
        for obj in list(bpy.context.scene.objects):
            if obj.type == 'MESH' and obj.name not in keep:
                groups.setdefault(obj.data.materials[0].name, []).append(obj)
        for label, objects in groups.items():
            if len(objects) < 2:
                continue
            bpy.ops.object.select_all(action='DESELECT')
            for obj in objects:
                obj.select_set(True)
            bpy.context.view_layer.objects.active = objects[0]
            bpy.ops.object.join()
            bpy.context.object.name = 'static_batch_' + label.split(' | ')[0].replace(' ', '_')
        bpy.ops.object.select_all(action='DESELECT')
    file=OUT/f'{name}.glb'
    bpy.ops.export_scene.gltf(filepath=str(file),export_format='GLB',export_animations=False,export_extras=True,export_cameras=False,export_lights=False)
    vertices=sum(len(o.data.vertices) for o in bpy.context.scene.objects if o.type=='MESH')
    bounds=[]
    for obj in bpy.context.scene.objects:
        if obj.type=='MESH':
            bounds.extend(obj.matrix_world@Vector(c) for c in obj.bound_box)
    low=[min(v[i] for v in bounds) for i in range(3)]
    high=[max(v[i] for v in bounds) for i in range(3)]
    # Blender XYZ -> glTF X,Z,-Y.
    gltf_low=[low[0],low[2],-high[1]]
    gltf_high=[high[0],high[2],-low[1]]
    return {'file':file.name,'bytes':file.stat().st_size,'vertices':vertices,'meshes':sum(o.type=='MESH' for o in bpy.context.scene.objects),'gltfBounds':{'min':gltf_low,'max':gltf_high}}


results=[]
for kind in ['airgun','sport','sniper','precision','final']:
    gun(kind)
    results.append(export(f'ks-rifle-{kind}'))
station()
results.append(export('ks-target-station'))
(OUT/'models-manifest.json').write_text(json.dumps({'schemaVersion':1,'units':'meters','axes':'glTF Y up, muzzle +Z','weaponsRoot':'grip area at origin','assets':results},indent=2))
print(json.dumps(results,indent=2))
