"""
ASGI config for verdelle_nails project.
"""

import os
from django.core.asgi import get_asgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'verdelle_nails.settings')

application = get_asgi_application()
