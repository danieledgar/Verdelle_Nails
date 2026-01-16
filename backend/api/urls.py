from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    UserViewSet, ServiceViewSet, ServiceCategoryViewSet, GalleryImageViewSet, AppointmentViewSet,
    ReviewViewSet, ContactMessageViewSet, TransactionViewSet, NotificationViewSet,
    register_view, login_view, logout_view, profile_view, update_profile_view,
    initiate_payment, mpesa_callback, check_payment_status, verify_manual_payment, approve_manual_payment
)

router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'service-categories', ServiceCategoryViewSet)
router.register(r'services', ServiceViewSet)
router.register(r'gallery', GalleryImageViewSet)
router.register(r'appointments', AppointmentViewSet)
router.register(r'reviews', ReviewViewSet)
router.register(r'contact', ContactMessageViewSet)
router.register(r'transactions', TransactionViewSet)
router.register(r'notifications', NotificationViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('auth/register/', register_view, name='register'),
    path('auth/login/', login_view, name='login'),
    path('auth/logout/', logout_view, name='logout'),
    path('auth/profile/', profile_view, name='profile'),
    path('auth/profile/update/', update_profile_view, name='update_profile'),
    path('mpesa/initiate/', initiate_payment, name='initiate_payment'),
    path('mpesa/callback/', mpesa_callback, name='mpesa_callback'),
    path('mpesa/status/<int:appointment_id>/', check_payment_status, name='check_payment_status'),
    path('mpesa/verify/', verify_manual_payment, name='verify_manual_payment'),
    path('mpesa/approve/<int:appointment_id>/', approve_manual_payment, name='approve_manual_payment'),
]
