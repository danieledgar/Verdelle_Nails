from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic.base import RedirectView
from django.views.static import serve # <--- IMPORT THIS

urlpatterns = [
    path('', RedirectView.as_view(url=settings.FRONTEND_URL)),
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),

    # --- THE MANUAL OVERRIDE ---
    # This forces Django to serve files at /media/ even in production
    re_path(r'^media/(?P<path>.*)$', serve, {
        'document_root': settings.MEDIA_ROOT,
    }),
]

# Keep this for your local computer development
if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
