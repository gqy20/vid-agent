#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
FRONTS="$ROOT/fronts"
PUBLIC_FONTS="$ROOT/remotion/public/fonts"
MISANS_SRC="$ROOT/remotion/src/font-assets/misans/Normal"
MISANS_PUBLIC="$PUBLIC_FONTS/misans/Normal"

mkdir -p "$FRONTS" "$PUBLIC_FONTS" "$MISANS_SRC" "$MISANS_PUBLIC"

copy_font() {
  local src="$1"
  local name="$2"
  if [[ ! -f "$src" ]]; then
    echo "Missing font: $src" >&2
    exit 1
  fi
  cp "$src" "$FRONTS/$name"
  cp "$src" "$PUBLIC_FONTS/$name"
}

copy_font "/usr/share/fonts/opentype/inter/Inter-Regular.otf" "Inter-Regular.otf"
copy_font "/usr/share/fonts/opentype/inter/Inter-Medium.otf" "Inter-Medium.otf"
copy_font "/usr/share/fonts/opentype/inter/Inter-SemiBold.otf" "Inter-SemiBold.otf"
copy_font "/usr/share/fonts/opentype/inter/Inter-Bold.otf" "Inter-Bold.otf"
copy_font "/usr/share/fonts/opentype/inter/Inter-Black.otf" "Inter-Black.otf"
copy_font "/usr/share/fonts/JetBrainsMono/JetBrainsMono-Regular.ttf" "JetBrainsMono-Regular.ttf"
copy_font "/usr/share/fonts/JetBrainsMono/JetBrainsMono-Bold.ttf" "JetBrainsMono-Bold.ttf"
copy_font "/usr/share/fonts/truetype/noto/NotoSans-Regular.ttf" "NotoSans-Regular.ttf"
copy_font "/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc" "NotoSansCJK-Regular.ttc"
copy_font "/usr/share/fonts/opentype/noto/NotoSansCJK-Medium.ttc" "NotoSansCJK-Medium.ttc"
copy_font "/usr/share/fonts/opentype/noto/NotoSansCJK-Bold.ttc" "NotoSansCJK-Bold.ttc"

tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT

npm pack misans@4.1.0 --pack-destination "$tmp" >/tmp/git-course-misans-pack.txt
pack="$(cat /tmp/git-course-misans-pack.txt)"
mkdir -p "$tmp/misans"
tar -xzf "$tmp/$pack" -C "$tmp/misans" --strip-components=1

for file in \
  MiSans-Heavy.117.woff2 \
  MiSans-Heavy.118.woff2 \
  MiSans-Heavy.119.woff2 \
  MiSans-Heavy.latin.woff2
do
  cp "$tmp/misans/lib/Normal/$file" "$MISANS_SRC/$file"
  cp "$tmp/misans/lib/Normal/$file" "$MISANS_PUBLIC/$file"
done

echo "Git course fonts synced:"
echo "  $FRONTS"
echo "  $PUBLIC_FONTS"
echo "  $MISANS_SRC"
