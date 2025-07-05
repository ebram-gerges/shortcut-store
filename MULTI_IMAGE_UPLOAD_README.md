# Multi-Image Upload for Product Color Variants

## Overview

This implementation provides a secure and user-friendly way to upload multiple images for product color variants in the Django admin interface. The solution includes both bulk upload functionality and quick upload options with comprehensive security measures.

## Features

### 🔒 Security Features
- **Permission-based access control**: Only users with `add_productcolorvariantimage` permission can upload images
- **File type validation**: Only JPG, PNG, GIF, and WebP files are allowed
- **File size limits**: Maximum 5MB per image
- **Image verification**: Uses PIL/Pillow to verify uploaded files are valid images
- **CSRF protection**: All uploads are protected against cross-site request forgery
- **Admin logging**: All upload actions are logged in Django's admin log
- **Staff-only access**: Only staff members can access upload functionality

### 🎨 User Interface Features
- **Drag & drop interface**: Users can drag files directly into the upload area
- **Image preview**: See thumbnail previews before uploading
- **Progress indicators**: Visual feedback during upload process
- **Bulk upload**: Upload up to 10 images at once
- **Quick upload**: Direct upload from the color variant edit page
- **Error handling**: Clear error messages for validation failures
- **Success feedback**: Confirmation messages after successful uploads

### 📱 Responsive Design
- Mobile-friendly interface
- Flexible grid layouts
- Touch-friendly buttons and controls

## Usage

### Method 1: Bulk Upload Page

1. Navigate to the Django admin
2. Go to **Products** → **Product Color Variants**
3. Click **"Bulk Upload Images"** at the top of the page
4. Select the color variant from the dropdown
5. Enter optional alt text for the images
6. Either drag & drop images or click to browse
7. Review the image previews
8. Click **"Upload Images"** to submit

### Method 2: Quick Upload from Product Edit Page

1. Navigate to **Products** → **Products**
2. Edit any product
3. In the color variant inline section, find the **"Image Gallery"**
4. Click **"Quick Add Images"** button
5. Select images using the file picker
6. Images will be uploaded immediately

### Method 3: Direct Bulk Upload Link

Access the bulk upload page directly:
```
/admin/products/productcolorvariant/action/bulk-upload-images/
```

## File Requirements

- **Supported formats**: JPG, JPEG, PNG, GIF, WebP
- **Maximum file size**: 5MB per image
- **Maximum files per upload**: 10 images
- **Image validation**: Files are verified to be valid images

## Security Implementation

### Permission Checks
```python
# Check if user has permission to add ProductColorVariantImage
if not request.user.has_perm('products.add_productcolorvariantimage'):
    raise PermissionDenied("You don't have permission to upload images.")
```

### File Validation
```python
# File type validation
valid_extensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp']
max_size = 5 * 1024 * 1024  # 5MB

# Image verification using PIL
if PILImage:
    img = PILImage.open(file)
    img.verify()
```

### Admin Logging
```python
# Log upload actions
LogEntry.objects.create(
    user=request.user,
    content_type=ContentType.objects.get_for_model(ProductColorVariant),
    object_id=color_variant.id,
    object_repr=str(color_variant),
    action_flag=ADDITION,
    change_message=f"Bulk uploaded {len(created_images)} images"
)
```

## API Endpoints

### Bulk Upload View
- **URL**: `/admin/products/productcolorvariant/action/bulk-upload-images/`
- **Method**: GET (form display), POST (form submission)
- **Authentication**: Staff member required
- **Permissions**: `products.add_productcolorvariantimage`

### Quick Upload View
- **URL**: `/admin/products/productcolorvariant/upload-images/<variant_id>/`
- **Method**: POST
- **Authentication**: Staff member required
- **Permissions**: `products.add_productcolorvariantimage`
- **Response**: JSON with success/error status

## Error Handling

### Client-Side Validation
- File type checking before upload
- File size validation
- Maximum file count limits
- Image preview generation

### Server-Side Validation
- Comprehensive file validation
- Permission checking
- Database constraint validation
- Exception handling with user-friendly messages

### Error Messages
- **File type errors**: "Invalid file type: filename.ext. Only JPG, PNG, GIF, and WebP are allowed."
- **File size errors**: "File too large: filename.ext. Maximum size is 5MB."
- **Permission errors**: "You don't have permission to upload images."
- **General errors**: Clear, descriptive error messages for all failure cases

## Form Implementation

### ProductColorVariantBulkImageUploadForm
- **Color Variant Selection**: Dropdown with all available color variants
- **Multi-file Upload**: HTML5 multiple file input with validation
- **Alt Text**: Optional field for image accessibility
- **Custom Validation**: Comprehensive file validation in `clean_images()` method
- **Batch Processing**: `save()` method handles multiple image creation

## Database Schema

### ProductColorVariantImage Model
```python
class ProductColorVariantImage(models.Model):
    color_variant = models.ForeignKey(ProductColorVariant, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='color_variant_images/')
    alt_text = models.CharField(max_length=200, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
```

## Installation Requirements

Ensure these packages are installed:
```
pillow>=10.2.0  # For image processing and validation
django>=5.2.1   # Core Django framework
```

## Troubleshooting

### Common Issues

1. **"PIL not available" warnings**
   - Install Pillow: `pip install Pillow`
   - Image validation will be skipped if PIL is not available

2. **Permission denied errors**
   - Ensure user has `products.add_productcolorvariantimage` permission
   - Check that user is staff member

3. **File upload fails**
   - Check file size (max 5MB)
   - Verify file type (JPG, PNG, GIF, WebP only)
   - Ensure proper form encoding (`enctype="multipart/form-data"`)

4. **JavaScript errors**
   - Ensure modern browser with FileReader API support
   - Check for JavaScript console errors

### Debug Mode
Enable Django debug mode to see detailed error messages:
```python
DEBUG = True
```

## Customization

### Modify File Limits
Edit in `products/forms.py`:
```python
# Change maximum file count
if len(files) > 10:  # Change 10 to desired limit

# Change maximum file size
max_size = 5 * 1024 * 1024  # Change 5MB to desired size
```

### Add New File Types
Edit in `products/forms.py`:
```python
valid_extensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp']  # Add new types
```

### Custom Styling
Modify CSS in `templates/admin/bulk_upload_color_variant_images.html`:
```css
.upload-container {
    max-width: 1000px;  /* Adjust width */
    /* Add custom styles */
}
```

## Performance Considerations

- **File Size**: Large images are automatically validated before upload
- **Batch Processing**: Multiple images are processed in a single database transaction
- **Memory Usage**: Images are processed one at a time to manage memory
- **Database Indexing**: Proper indexes on `color_variant` foreign key

## Browser Compatibility

- **Modern browsers**: Full functionality with drag & drop
- **IE11+**: Basic functionality without advanced features
- **Mobile browsers**: Touch-friendly interface
- **File API**: Requires browsers with FileReader support

## Future Enhancements

- **Image resizing**: Automatic thumbnail generation
- **Cloud storage**: Integration with AWS S3, Google Cloud Storage
- **AJAX uploads**: Real-time progress tracking
- **Image editing**: Basic cropping and rotation tools
- **Batch operations**: Delete multiple images at once

## Support

For issues or questions about this implementation:
1. Check the troubleshooting section above
2. Review Django admin documentation
3. Verify file permissions and Django settings
4. Check browser console for JavaScript errors