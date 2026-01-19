from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import Service, ServiceCategory, GalleryImage, Appointment, Review, ContactMessage, User, Transaction, Notification

# --- USER SERIALIZERS ---
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'phone_number', 
                  'date_of_birth', 'profile_picture', 'preferred_contact', 'loyalty_points', 
                  'is_active', 'is_staff', 'is_superuser', 'date_joined', 'created_at']
        read_only_fields = ['id', 'loyalty_points', 'created_at', 'date_joined']

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8, style={'input_type': 'password'})
    password_confirm = serializers.CharField(write_only=True, min_length=8, style={'input_type': 'password'})

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password_confirm', 'first_name', 
                  'last_name', 'phone_number']

    def validate(self, data):
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError({"password": "Passwords must match."})
        return data

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        user = User.objects.create_user(**validated_data)
        return user

class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True, style={'input_type': 'password'})

    def validate(self, data):
        username = data.get('username')
        password = data.get('password')

        if username and password:
            user = authenticate(username=username, password=password)
            if not user:
                raise serializers.ValidationError("Invalid credentials.")
            if not user.is_active:
                raise serializers.ValidationError("User account is disabled.")
            data['user'] = user
        else:
            raise serializers.ValidationError("Must include username and password.")
        return data

# --- SERVICE SERIALIZERS (Crucial for your page!) ---
class ServiceSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    
    class Meta:
        model = Service
        # Note: 'duration' is included here!
        fields = ['id', 'category', 'category_name', 'name', 'description', 'duration', 
                  'price', 'image', 'is_featured', 'is_active', 'created_at']

class ServiceCategorySerializer(serializers.ModelSerializer):
    services = serializers.SerializerMethodField()
    
    class Meta:
        model = ServiceCategory
        fields = ['id', 'name', 'description', 'focus', 'icon', 'display_order', 'services']
    
    def get_services(self, obj):
        services = obj.services.filter(is_active=True)
        return ServiceSerializer(services, many=True).data

# --- OTHER SERIALIZERS ---
class GalleryImageSerializer(serializers.ModelSerializer):
    service_name = serializers.CharField(source='service.name', read_only=True)
    class Meta:
        model = GalleryImage
        fields = ['id', 'title', 'description', 'image', 'service', 'service_name', 'is_featured', 'created_at']

class AppointmentSerializer(serializers.ModelSerializer):
    service_name = serializers.CharField(source='service.name', read_only=True)
    service_price = serializers.DecimalField(source='service.price', max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = Appointment
        fields = ['id', 'user', 'customer_name', 'customer_email', 'customer_phone', 'service', 'service_name', 
                  'service_price', 'appointment_date', 'appointment_time', 'notes', 'status', 
                  'payment_status', 'payment_phone', 'mpesa_transaction_id', 'amount_paid', 
                  'payment_date', 'created_at']
        read_only_fields = ['user', 'service_price', 'service_name', 'mpesa_transaction_id', 
                           'payment_date', 'created_at']

    def validate(self, data):
        appointment_date = data.get('appointment_date')
        appointment_time = data.get('appointment_time')
        if appointment_date and appointment_time:
            existing = Appointment.objects.filter(
                appointment_date=appointment_date,
                appointment_time=appointment_time
            ).exclude(status='cancelled')
            if self.instance:
                existing = existing.exclude(pk=self.instance.pk)
            if existing.exists():
                raise serializers.ValidationError("This time slot is already booked.")
        return data

class ReviewSerializer(serializers.ModelSerializer):
    service_name = serializers.CharField(source='service.name', read_only=True)
    class Meta:
        model = Review
        fields = ['id', 'customer_name', 'rating', 'comment', 'service', 'service_name', 'appointment', 'is_approved', 'created_at']
        read_only_fields = ['is_approved', 'created_at']

class ContactMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactMessage
        fields = ['id', 'name', 'email', 'phone', 'subject', 'message', 'admin_reply', 'is_read', 'replied_at', 'created_at']
        read_only_fields = ['created_at', 'replied_at']

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['id', 'user', 'title', 'message', 'notification_type', 'is_read', 'related_contact_message', 'created_at']
        read_only_fields = ['created_at']

class TransactionSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    appointment_id = serializers.IntegerField(source='appointment.id', read_only=True)
    
    class Meta:
        model = Transaction
        fields = ['id', 'user', 'username', 'appointment', 'appointment_id', 
                  'mpesa_transaction_id', 'mpesa_checkout_request_id', 'phone_number', 
                  'amount', 'status', 'result_code', 'result_description', 
                  'initiated_at', 'completed_at', 'account_reference', 'transaction_description']
        read_only_fields = ['user', 'username', 'appointment_id', 'result_code', 'result_description', 
                           'initiated_at', 'account_reference', 'transaction_description']
        # Force Railway Rebuild - timestamp 1
