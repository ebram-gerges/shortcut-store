// ProductColorVariant admin image preview and delete logic

// Remove all custom multi-upload and gallery JS. Rely on Django admin's default inline upload.
// (This file intentionally left mostly blank to restore default behavior) 

// Drag-and-drop and multi-file upload for custom upload area
function setupCustomUploadAreas() {
    document.querySelectorAll('.custom-upload-area').forEach(function(area) {
        const variantId = area.getAttribute('data-variant-id');
        const input = area.querySelector('.custom-upload-input');
        // Click to open file picker
        area.addEventListener('click', function(e) {
            if (e.target === area || e.target.classList.contains('custom-upload-area')) {
                input.click();
            }
        });
        // Drag over
        area.addEventListener('dragover', function(e) {
            e.preventDefault();
            area.classList.add('dragover');
        });
        area.addEventListener('dragleave', function(e) {
            area.classList.remove('dragover');
        });
        // Drop
        area.addEventListener('drop', function(e) {
            e.preventDefault();
            area.classList.remove('dragover');
            input.files = e.dataTransfer.files;
            handleFilesUpload(input.files, variantId);
        });
        // File input change
        input.addEventListener('change', function(e) {
            handleFilesUpload(input.files, variantId);
        });
    });
}

function handleFilesUpload(files, variantId) {
    if (!files.length) return;
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
        formData.append('images', files[i]);
    }
    fetch(`/admin/products/productcolorvariant/upload-images/${variantId}/`, {
        method: 'POST',
        headers: { 'X-CSRFToken': getCSRFToken() },
        body: formData
    })
    .then(resp => resp.json())
    .then(data => {
        if (data.success) {
            window.location.reload();
        } else {
            alert('Failed to upload images: ' + (data.error || 'Unknown error'));
        }
    });
}

// Multi-image upload for ProductColorVariantImage inline
function setupMultiImageInlineUpload() {
    // Find all inlines for ProductColorVariantImage
    document.querySelectorAll('.inline-group[data-inline-type]').forEach(function(inlineGroup) {
        // Only target ProductColorVariantImage inlines
        const legend = inlineGroup.querySelector('h2, .inline_label');
        if (!legend || !/color variant image/i.test(legend.textContent)) return;
        // Add button and input if not already present
        if (inlineGroup.querySelector('.multi-image-upload-btn')) return;
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.textContent = 'Add multiple images';
        btn.className = 'multi-image-upload-btn';
        btn.style = 'margin-bottom:10px;margin-right:10px;background:#1976d2;color:#fff;padding:6px 16px;border:none;border-radius:6px;font-size:15px;cursor:pointer;';
        const input = document.createElement('input');
        input.type = 'file';
        input.multiple = true;
        input.accept = 'image/*';
        input.style = 'display:none;';
        btn.addEventListener('click', function() { input.click(); });
        input.addEventListener('change', function(e) {
            const files = Array.from(input.files);
            if (!files.length) return;
            const addRowBtn = inlineGroup.querySelector('.add-row a, .add-row button');
            if (!addRowBtn) return;
            files.forEach(function(file, idx) {
                addRowBtn.click();
                setTimeout(function() {
                    // Find the last inline row (newly added)
                    const rows = inlineGroup.querySelectorAll('.dynamic-productcolorvariantimage');
                    const lastRow = rows[rows.length - 1];
                    if (lastRow) {
                        const fileInput = lastRow.querySelector('input[type="file"][name$="-image"]');
                        if (fileInput) {
                            // Create a DataTransfer to set the file input value
                            const dt = new DataTransfer();
                            dt.items.add(file);
                            fileInput.files = dt.files;
                        }
                    }
                }, 100 * (idx + 1)); // Stagger to allow DOM update
            });
            input.value = '';
        });
        legend.parentNode.insertBefore(btn, legend.nextSibling);
        legend.parentNode.insertBefore(input, btn.nextSibling);
    });
}

document.addEventListener('DOMContentLoaded', setupCustomUploadAreas);
document.addEventListener('DOMContentLoaded', setupMultiImageInlineUpload); 