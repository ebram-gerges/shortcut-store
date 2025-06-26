class Theme(models.Model):
    # ... existing fields ...
    class Media:
        css = {
            'all': ('admin/css/custom_admin_icons.css',)
        } 