from io import BytesIO
from pathlib import Path
import re
import struct

from PIL import Image, ImageFilter


ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "assets"
PHOTOS = ASSETS / "photos"

PHOTO_FILES = {
    "square_spacious": "ChatGPT Image May 31, 2026, 12_53_20 PM (1).png",
    "square_zoomed": "ChatGPT Image May 31, 2026, 12_53_20 PM (2).png",
    "square_medium": "ChatGPT Image May 31, 2026, 12_53_20 PM (3).png",
    "square_icon_96": "ChatGPT Image May 31, 2026, 12_53_22 PM (4).png",
    "square_android_512": "ChatGPT Image May 31, 2026, 12_53_23 PM (5).png",
    "square_android_192": "ChatGPT Image May 31, 2026, 12_53_25 PM (6).png",
    "square_apple": "ChatGPT Image May 31, 2026, 12_53_26 PM (7).png",
    "og": "ChatGPT Image May 31, 2026, 12_53_27 PM (8).png",
    "twitter": "ChatGPT Image May 31, 2026, 12_53_29 PM (9).png",
}

ICON_OUTPUTS = {
    "favicon-16x16.png": ("square_zoomed", 16),
    "favicon-32x32.png": ("square_zoomed", 32),
    "favicon-96x96.png": ("square_icon_96", 96),
    "apple-touch-icon.png": ("square_apple", 180),
    "android-chrome-192x192.png": ("square_android_192", 192),
    "android-chrome-512x512.png": ("square_android_512", 512),
}

ICO_OUTPUTS = {
    16: "square_zoomed",
    32: "square_zoomed",
    48: "square_medium",
    96: "square_icon_96",
}


def source_path(key):
    return PHOTOS / PHOTO_FILES[key]


def load_rgb(key):
    path = source_path(key)
    if not path.exists():
        raise FileNotFoundError(f"Missing source asset: {path}")
    return Image.open(path).convert("RGB")


def cover(image, size):
    target_w, target_h = size
    ratio = max(target_w / image.width, target_h / image.height)
    resized = image.resize(
        (round(image.width * ratio), round(image.height * ratio)),
        Image.Resampling.LANCZOS,
    )
    left = (resized.width - target_w) // 2
    top = (resized.height - target_h) // 2
    return resized.crop((left, top, left + target_w, top + target_h))


def contain_with_soft_padding(image, size):
    target_w, target_h = size
    ratio = min(target_w / image.width, target_h / image.height)
    fitted = image.resize(
        (round(image.width * ratio), round(image.height * ratio)),
        Image.Resampling.LANCZOS,
    )

    background = cover(image, size).filter(ImageFilter.GaussianBlur(18))
    overlay = Image.new("RGB", size, "#9b613c")
    background = Image.blend(background, overlay, 0.24)

    x = (target_w - fitted.width) // 2
    y = (target_h - fitted.height) // 2
    background.paste(fitted, (x, y))
    return background


def save_icon_set():
    for output_name, (source_key, size) in ICON_OUTPUTS.items():
        cover(load_rgb(source_key), (size, size)).save(ASSETS / output_name, optimize=True)

    save_ico(ROOT / "favicon.ico", [
        (size, cover(load_rgb(source_key), (size, size)))
        for size, source_key in ICO_OUTPUTS.items()
    ])


def save_ico(output_path, frames):
    png_frames = []
    for size, image in frames:
        buffer = BytesIO()
        image.convert("RGBA").save(buffer, format="PNG")
        png_frames.append((size, buffer.getvalue()))

    directory_size = 6 + len(png_frames) * 16
    offset = directory_size
    entries = []
    payloads = []
    for size, payload in png_frames:
        entries.append(
            struct.pack(
                "<BBBBHHII",
                size if size < 256 else 0,
                size if size < 256 else 0,
                0,
                0,
                1,
                32,
                len(payload),
                offset,
            )
        )
        payloads.append(payload)
        offset += len(payload)

    with output_path.open("wb") as file:
        file.write(struct.pack("<HHH", 0, 1, len(png_frames)))
        for entry in entries:
            file.write(entry)
        for payload in payloads:
            file.write(payload)


def write_brand_source_note():
    mapping_lines = "\n".join(
        f"  <text x=\"88\" y=\"{300 + index * 30}\" fill=\"#fff4df\" font-family=\"Arial, sans-serif\" font-size=\"18\">{label}</text>"
        for index, label in enumerate(
            [
                "(1) spacious square: retained source variant",
                "(2) zoomed square: favicon 16, favicon 32, ICO 16/32",
                "(3) medium square: ICO 48",
                "(4) 96 square: favicon 96 and ICO 96",
                "(5) square: android-chrome-512x512.png",
                "(6) square: android-chrome-192x192.png",
                "(7) square: apple-touch-icon.png",
                "(8) wide: og-image.png and og-image.jpg",
                "(9) wide: twitter-image.png and twitter-image.jpg with soft padding",
                "Profile picture.png: profile-540.webp and profile-1080.webp",
            ]
        )
    )
    note = f"""<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630" role="img" aria-labelledby="title desc">
  <title>Arabinda Saha web asset source note</title>
  <desc>Web assets are exported from the nine final authored PNGs in assets/photos. Generated by scripts/generate_web_assets.py.</desc>
  <rect width="1200" height="630" rx="36" fill="#9b613c"/>
  <rect x="58" y="58" width="1084" height="514" rx="28" fill="#f5ead9" opacity="0.18"/>
  <text x="86" y="150" fill="#fff4df" font-family="Georgia, serif" font-size="64" font-weight="700">Arabinda Saha</text>
  <text x="88" y="220" fill="#ffd9ad" font-family="Arial, sans-serif" font-size="32">Web asset source mapping</text>
  <text x="88" y="260" fill="#fff4df" font-family="Arial, sans-serif" font-size="22">Canonical source folder: assets/photos</text>
{mapping_lines}
</svg>
"""
    (ASSETS / "brand-source.svg").write_text(note, encoding="utf-8")


def save_profile_variants():
    profile_path = ASSETS / "Profile picture.png"
    if not profile_path.exists():
        raise FileNotFoundError(f"Missing profile asset: {profile_path}")

    profile = Image.open(profile_path).convert("RGBA")
    for size in (360, 540, 1080):
        profile.resize((size, size), Image.Resampling.LANCZOS).save(
            ASSETS / f"profile-{size}.webp",
            "WEBP",
            quality=82,
            method=6,
        )


def save_social_cards():
    og = cover(load_rgb("og"), (1200, 630))
    twitter = contain_with_soft_padding(load_rgb("twitter"), (1200, 675))

    og.save(ASSETS / "og-image.png", optimize=True)
    og.save(ASSETS / "og-image.jpg", "JPEG", quality=82, optimize=True, progressive=True)

    twitter.save(ASSETS / "twitter-image.png", optimize=True)
    twitter.save(ASSETS / "twitter-image.jpg", "JPEG", quality=82, optimize=True, progressive=True)


def minify_css():
    src_path = ROOT / "styles.src.css"
    dest_path = ROOT / "styles.css"
    if not src_path.exists():
        raise FileNotFoundError(f"Missing source stylesheet: {src_path}")

    css = src_path.read_text(encoding="utf-8")
    css = re.sub(r'/\*.*?\*/', '', css, flags=re.DOTALL)
    css = re.sub(r'\s+', ' ', css)
    css = re.sub(r'\s*([\{\}:;\,])\s*', r'\1', css)
    css = re.sub(r';\}', '}', css)
    dest_path.write_text(css.strip(), encoding="utf-8")


def main():
    ASSETS.mkdir(exist_ok=True)

    save_icon_set()
    save_profile_variants()
    save_social_cards()
    write_brand_source_note()
    minify_css()


if __name__ == "__main__":
    main()
