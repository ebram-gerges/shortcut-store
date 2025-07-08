# Project Memory: Shortcut Store

## Project Metadata
- **Stack:** Django backend, Nginx, static/media file serving, frontend (details TBD)
- **Deployment:** Linux server, Nginx as reverse proxy/static file server
- **Database:** SQLite (db.sqlite3 present)
- **Current Directory Structure:** Standard Django + custom folders

## Current Task
Troubleshoot and fix Nginx so it correctly serves media files (images, uploads) for the Django project. The main issue is persistent 404 errors for media files, even though files exist and permissions appear correct.

## Notes
- Previous issues included: Django admin login, static files, Nginx config, frontend hero section not showing images due to 404s from API.
- Debugging so far: Nginx config checked, permissions checked, Nginx reinstalled, debug logging enabled, minimal config tested, files confirmed on disk.
- Next step: Isolate Nginx by serving a test file directly from the media directory, bypassing Django.

--- 