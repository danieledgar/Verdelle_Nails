"""
WSGI config for verdelle_nails project.
"""

import os
from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'verdelle_nails.settings')

application = get_wsgi_application()
