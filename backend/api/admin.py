from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import Service, GalleryImage, Appointment, Review, ContactMessage, User, Transaction


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ['username', 'email', 'first_name', 'last_name', 'phone_number', 'loyalty_points', 'is_staff']
    list_filter = ['is_staff', 'is_active', 'preferred_contact']
    search_fields = ['username', 'email', 'first_name', 'last_name', 'phone_number']
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Additional Info', {'fields': ('phone_number', 'date_of_birth', 'profile_picture', 'preferred_contact', 'loyalty_points')}),
    )
    add_fieldsets = BaseUserAdmin.add_fieldsets + (
        ('Additional Info', {'fields': ('email', 'phone_number')}),
    )


@admin.register(Service)
class ServiceAdmin(admin.ModelAdmin):
    list_display = ['name', 'price', 'duration', 'is_featured', 'created_at']
    list_filter = ['is_featured']
    search_fields = ['name', 'description']


@admin.register(GalleryImage)
class GalleryImageAdmin(admin.ModelAdmin):
    list_display = ['title', 'service', 'is_featured', 'created_at']
    list_filter = ['is_featured', 'service']
    search_fields = ['title', 'description']


@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):
    list_display = ['customer_name', 'service', 'appointment_date', 'appointment_time', 'status', 'created_at']
    list_filter = ['status', 'appointment_date']
    search_fields = ['customer_name', 'customer_email', 'customer_phone']
    date_hierarchy = 'appointment_date'


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ['customer_name', 'rating', 'service', 'is_approved', 'created_at']
    list_filter = ['is_approved', 'rating']
    search_fields = ['customer_name', 'comment']
    actions = ['approve_reviews']

    def approve_reviews(self, request, queryset):
        queryset.update(is_approved=True)
    approve_reviews.short_description = "Approve selected reviews"


@admin.register(ContactMessage)
class ContactMessageAdmin(admin.ModelAdmin):
    list_display = ['name', 'subject', 'email', 'is_read', 'created_at']
    list_filter = ['is_read']
    search_fields = ['name', 'email', 'subject', 'message']
    actions = ['mark_as_read']

    def mark_as_read(self, request, queryset):
        queryset.update(is_read=True)
    mark_as_read.short_description = "Mark selected as read"


@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'mpesa_transaction_id', 'amount', 'status', 'phone_number', 'initiated_at', 'completed_at']
    list_filter = ['status', 'initiated_at', 'completed_at']
    search_fields = ['user__username', 'user__email', 'mpesa_transaction_id', 'phone_number', 'account_reference']
    readonly_fields = ['initiated_at', 'completed_at']
    date_hierarchy = 'initiated_at'
    fieldsets = (
        ('User Information', {
            'fields': ('user', 'appointment')
        }),
        ('Transaction Details', {
            'fields': ('mpesa_transaction_id', 'mpesa_checkout_request_id', 'phone_number', 'amount', 'account_reference', 'transaction_description')
        }),
        ('Status', {
            'fields': ('status', 'result_code', 'result_description')
        }),
        ('Timestamps', {
            'fields': ('initiated_at', 'completed_at')
        }),
    )
