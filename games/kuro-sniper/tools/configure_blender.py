"""Save the locally verified Apple Silicon profile without resetting other preferences."""
import json
from pathlib import Path

import bpy

existing = Path(bpy.utils.user_resource('CONFIG')) / 'userpref.blend'
if existing.is_file():
    bpy.ops.wm.read_userpref()
bpy.context.preferences.system.gpu_backend = 'METAL'
cycles = bpy.context.preferences.addons['cycles'].preferences
# EEVEE uses the verified Metal graphics backend. Keep Cycles on its verified
# CPU path until an explicit Cycles-GPU kernel compilation test completes.
cycles.compute_device_type = 'NONE'
bpy.ops.wm.save_userpref()
print(json.dumps({
    'blenderVersion': bpy.app.version_string,
    'graphicsBackend': bpy.context.preferences.system.gpu_backend,
    'cyclesComputeDeviceType': cycles.compute_device_type,
    'preferencesSaved': True,
    'preservesExistingPreferences': True,
}))
