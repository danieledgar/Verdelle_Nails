"""
URL configuration for Verdelle Nails project.
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic.base import RedirectView
import os # Import os just in case you need it for paths

urlpatterns = [
    path('', RedirectView.as_view(url=settings.FRONTEND_URL)),
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),
]

# --- THE FIX ---
# We allow serving media files even if DEBUG is False (Production)
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

# Static files (CSS/JS) are usually handled by Whitenoise, so we keep this check
if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
