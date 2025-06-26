// ProductColorVariant admin image preview and delete logic

document.addEventListener('DOMContentLoaded', function () {
    // Image preview for new uploads
    const imageInput = document.querySelector('input[name="images"]');
    const previewContainer = document.createElement('div');
    previewContainer.id = 'image-upload-preview';
    previewContainer.style.display = 'flex';
    previewContainer.style.flexWrap = 'wrap';
    previewContainer.style.marginTop = '10px';
    if (imageInput) {
        imageInput.parentNode.appendChild(previewContainer);
        imageInput.addEventListener('change', function (e) {
            previewContainer.innerHTML = '';
            Array.from(e.target.files).forEach(file => {
                const reader = new FileReader();
                reader.onload = function (ev) {
                    const img = document.createElement('img');
                    img.src = ev.target.result;
                    img.style.maxHeight = '100px';
                    img.style.marginRight = '10px';
                    img.style.borderRadius = '5px';
                    img.style.boxShadow = '0 2px 8px #0002';
                    previewContainer.appendChild(img);
                };
                reader.readAsDataURL(file);
            });
        });
    }

    // Multi-delete for existing images
    const gallery = document.getElementById('existing-image-gallery');
    if (gallery) {
        // Add Delete Selected button
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Delete Selected';
        deleteBtn.type = 'button';
        deleteBtn.style.margin = '10px 0';
        deleteBtn.className = 'button danger';
        gallery.parentNode.insertBefore(deleteBtn, gallery);

        deleteBtn.addEventListener('click', function () {
            const checked = gallery.querySelectorAll('input[type="checkbox"]:checked');
            if (checked.length === 0) {
                alert('Select images to delete.');
                return;
            }
            if (!confirm('Delete selected images?')) return;
            const ids = Array.from(checked).map(cb => cb.value);
            fetch(getDeleteUrl(), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCSRFToken(),
                },
                body: JSON.stringify({ ids }),
            })
            .then(resp => resp.json())
            .then(data => {
                if (data.success) {
                    ids.forEach(id => {
                        const row = gallery.querySelector('[data-image-id="' + id + '"]');
                        if (row) row.remove();
                    });
                } else {
                    alert('Failed to delete images: ' + (data.error || 'Unknown error'));
                }
            });
        });

        // Single delete
        gallery.querySelectorAll('.delete-image-btn').forEach(btn => {
            btn.addEventListener('click', function () {
                const id = btn.dataset.imageId;
                if (!confirm('Delete this image?')) return;
                fetch(getDeleteUrl(), {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': getCSRFToken(),
                    },
                    body: JSON.stringify({ ids: [id] }),
                })
                .then(resp => resp.json())
                .then(data => {
                    if (data.success) {
                        const row = gallery.querySelector('[data-image-id="' + id + '"]');
                        if (row) row.remove();
                    } else {
                        alert('Failed to delete image: ' + (data.error || 'Unknown error'));
                    }
                });
            });
        });
    }

    function getCSRFToken() {
        // Try to get from cookie first
        const name = 'csrftoken';
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const c = cookies[i].trim();
            if (c.startsWith(name + '=')) {
                return decodeURIComponent(c.substring(name.length + 1));
            }
        }
        // Fallback: try to get from the admin's hidden input
        const input = document.querySelector('input[name=csrfmiddlewaretoken]');
        if (input) {
            return input.value;
        }
        return '';
    }

    function getDeleteUrl() {
        // Remove trailing 'change/' if present, then add 'delete-images/'
        let path = window.location.pathname;
        if (path.endsWith('change/')) {
            path = path.replace(/change\/$/, '');
        }
        return path + 'delete-images/';
    }
}); 