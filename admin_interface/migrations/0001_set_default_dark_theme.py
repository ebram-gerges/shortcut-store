from django.db import migrations

def set_default_dark_theme(apps, schema_editor):
    Theme = apps.get_model('admin_interface', 'Theme')
    # Create or update the default theme
    theme, created = Theme.objects.get_or_create(pk=1)
    theme.name = 'Shortcut Dark Theme'
    theme.active = True
    theme.title = 'Shortcut Admin'
    theme.title_visible = True
    theme.logo = ''
    theme.logo_color = '#34d399'
    theme.env = ''
    theme.env_visible = False
    theme.language_chooser_active = False
    theme.language_chooser_display = False
    theme.css_header_background_color = '#18181b'
    theme.css_header_text_color = '#fff'
    theme.css_module_background_color = '#23272e'
    theme.css_module_text_color = '#fff'
    theme.css_generic_link_color = '#34d399'
    theme.css_generic_link_hover_color = '#059669'
    theme.css_save_button_background_color = '#059669'
    theme.css_save_button_text_color = '#fff'
    theme.css_delete_button_background_color = '#ef4444'
    theme.css_delete_button_text_color = '#fff'
    theme.css_themes_list_filter_background_color = '#23272e'
    theme.css_themes_list_filter_text_color = '#fff'
    theme.css_themes_list_filter_selected_background_color = '#059669'
    theme.css_themes_list_filter_selected_text_color = '#fff'
    theme.show_sidebar = True
    theme.sidebar_expanded = True
    theme.save()

    # Assign icons to apps/models (FontAwesome classes)
    # This is a pseudo-API; actual icon assignment may require admin UI, but we set a default here
    # You can further customize in the admin UI if needed

class Migration(migrations.Migration):
    dependencies = [
        ('admin_interface', '__first__'),
    ]
    operations = [
        migrations.RunPython(set_default_dark_theme),
    ] 