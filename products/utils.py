import os
from PIL import Image
from django.conf import settings

# Target sizes (width in px)
IMAGE_SIZES = [400, 800, 1200, 2000]
IMAGE_FORMATS = ["webp", "avif"]  # AVIF support depends on Pillow version


def get_output_path(instance, original_path, size, fmt):
    """
    Generate output path for resized/converted image.
    """
    base, ext = os.path.splitext(original_path)
    return f"{base}_{size}w.{fmt}"


def process_image_variants(image_field, instance=None):
    """
    Given a Django ImageField, generate multiple sizes and formats (WebP/AVIF).
    Returns a dict: {format: {size: path}}
    """
    if not image_field:
        return {}
    try:
        img = Image.open(image_field)
    except Exception as e:
        print(f"[Image Processing] Failed to open image: {e}")
        return {}
    original_path = image_field.name
    output = {}
    for fmt in IMAGE_FORMATS:
        output[fmt] = {}
        for size in IMAGE_SIZES:
            try:
                img_copy = img.copy()
                # Resize, maintaining aspect ratio
                w_percent = size / float(img_copy.width)
                h_size = int((float(img_copy.height) * float(w_percent)))
                img_resized = img_copy.resize((size, h_size), Image.LANCZOS)
                out_path = get_output_path(instance, original_path, size, fmt)
                full_out_path = os.path.join(settings.MEDIA_ROOT, out_path)
                os.makedirs(os.path.dirname(full_out_path), exist_ok=True)
                save_kwargs = {"quality": 85}
                if fmt == "webp":
                    save_kwargs["method"] = 6
                img_resized.save(full_out_path, fmt.upper(), **save_kwargs)
                output[fmt][size] = out_path
            except Exception as e:
                print(f"[Image Processing] Failed for {fmt} {size}: {e}")
    return output 