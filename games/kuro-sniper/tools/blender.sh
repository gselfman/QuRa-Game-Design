#!/bin/bash
set -euo pipefail

# Keep Blender automation independent from Intel/Apple Silicon Homebrew PATH order.
ks_blender_bin="${BLENDER_BIN:-}"
if [ -z "$ks_blender_bin" ]; then
  for ks_candidate in /Applications/Blender.app/Contents/MacOS/Blender /opt/homebrew/bin/blender /usr/local/bin/blender; do
    if [ -x "$ks_candidate" ]; then
      ks_blender_bin="$ks_candidate"
      break
    fi
  done
fi
if [ -z "$ks_blender_bin" ] || [ ! -x "$ks_blender_bin" ]; then
  printf '%s\n' 'Blender not found. Install Blender.app or set BLENDER_BIN to its executable.' >&2
  exit 1
fi
exec "$ks_blender_bin" "$@"
