from rest_framework import viewsets, filters, status, permissions
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied
from rest_framework.authtoken.models import Token
from django.contrib.auth import logout
from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend
from .models import Service, ServiceCategory, GalleryImage, Appointment, Review, ContactMessage, User, Transaction, Notification
from .serializers import (
    ServiceSerializer, ServiceCategorySerializer, GalleryImageSerializer, AppointmentSerializer,
    ReviewSerializer, ContactMessageSerializer, UserSerializer,
    RegisterSerializer, LoginSerializer, TransactionSerializer, NotificationSerializer
)
from .mpesa import MpesaClient
import logging

logger = logging.getLogger(__name__)


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def register_view(request):
    """User registration endpoint"""
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        token, created = Token.objects.get_or_create(user=user)
        return Response({
            'token': token.key,
            'user': UserSerializer(user).data
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def login_view(request):
    """User login endpoint"""
    serializer = LoginSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.validated_data['user']
        token, created = Token.objects.get_or_create(user=user)
        return Response({
            'token': token.key,
            'user': UserSerializer(user).data
        })
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def logout_view(request):
    """User logout endpoint"""
    request.user.auth_token.delete()
    logout(request)
    return Response({'message': 'Successfully logged out.'}, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def profile_view(request):
    """Get current user profile"""
    serializer = UserSerializer(request.user)
    return Response(serializer.data)


@api_view(['PATCH'])
@permission_classes([permissions.IsAuthenticated])
def update_profile_view(request):
    """Update current user profile"""
    user = request.user
    serializer = UserSerializer(user, data=request.data, partial=True)
    
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ServiceCategoryViewSet(viewsets.ModelViewSet):
    """
    API endpoint for service categories with nested services.
    GET /api/service-categories/ - List all categories with their services
    GET /api/service-categories/{id}/ - Get category details with services
    POST /api/service-categories/ - Create category (admin only)
    PUT/PATCH /api/service-categories/{id}/ - Update category (admin only)
    DELETE /api/service-categories/{id}/ - Delete category (admin only)
    """
    queryset = ServiceCategory.objects.all()
    serializer_class = ServiceCategorySerializer
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['display_order', 'name']

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAdminUser()]
        return [permissions.AllowAny()]


class UserViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing users (admin only).
    GET /api/users/ - List all users
    GET /api/users/{id}/ - Get user details
    PATCH /api/users/{id}/ - Update user (deactivate, change role, etc.)
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAdminUser]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['username', 'email', 'first_name', 'last_name']
    ordering_fields = ['date_joined', 'username']


class ServiceViewSet(viewsets.ModelViewSet):
    """
    API endpoint for nail services.
    GET /api/services/ - List all services
    GET /api/services/{id}/ - Get service details
    POST /api/services/ - Create service (admin only)
    PUT/PATCH /api/services/{id}/ - Update service (admin only)
    DELETE /api/services/{id}/ - Delete service (admin only)
    GET /api/services/featured/ - Get featured services
    """
    queryset = Service.objects.all()
    serializer_class = ServiceSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'is_featured']
    search_fields = ['name', 'description']
    ordering_fields = ['price', 'duration', 'name']

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAdminUser()]
        return [permissions.AllowAny()]

    @action(detail=False, methods=['get'])
    def featured(self, request):
        """Get featured services"""
        featured_services = self.queryset.filter(is_featured=True, is_active=True)
        serializer = self.get_serializer(featured_services, many=True)
        return Response(serializer.data)


class GalleryImageViewSet(viewsets.ModelViewSet):
    """
    API endpoint for gallery images.
    GET /api/gallery/ - List all gallery images
    GET /api/gallery/{id}/ - Get image details
    POST /api/gallery/ - Upload gallery image (admin only)
    PUT/PATCH /api/gallery/{id}/ - Update gallery image (admin only)
    DELETE /api/gallery/{id}/ - Delete gallery image (admin only)
    GET /api/gallery/featured/ - Get featured images
    """
    queryset = GalleryImage.objects.all()
    serializer_class = GalleryImageSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['service', 'is_featured']
    ordering_fields = ['created_at']

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAdminUser()]
        return [permissions.AllowAny()]

    @action(detail=False, methods=['get'])
    def featured(self, request):
        """Get featured gallery images"""
        featured_images = self.queryset.filter(is_featured=True)
        serializer = self.get_serializer(featured_images, many=True)
        return Response(serializer.data)


class AppointmentViewSet(viewsets.ModelViewSet):
    """
    API endpoint for appointments.
    POST /api/appointments/ - Create new appointment
    GET /api/appointments/ - List user's own appointments (or all for admins)
    GET /api/appointments/{id}/ - Get appointment details
    PUT/PATCH /api/appointments/{id}/ - Update appointment (admin or owner)
    DELETE /api/appointments/{id}/ - Delete appointment (admin or owner)
    """
    queryset = Appointment.objects.all()
    serializer_class = AppointmentSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['status', 'appointment_date', 'payment_status']
    ordering_fields = ['-appointment_date', '-created_at']
    ordering = ['-appointment_date', '-appointment_time']

    def get_permissions(self):
        # Admin users have full access, regular users need authentication
        if self.request.user and self.request.user.is_staff:
            return [permissions.IsAdminUser()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        # Users can view their own appointments, admins can view all
        queryset = super().get_queryset()
        if self.request.user.is_staff:
            return queryset
        # Regular users can only see their own appointments
        return queryset.filter(user=self.request.user)

    def perform_create(self, serializer):
        # Automatically set the user from the request
        serializer.save(user=self.request.user)
    
    def perform_update(self, serializer):
        # Admin can update any appointment, regular users only their own
        if not self.request.user.is_staff:
            if serializer.instance.user != self.request.user:
                raise PermissionDenied("You can only update your own appointments")
        serializer.save()
    
    def perform_destroy(self, instance):
        # Admin can delete any appointment, regular users only their own
        if not self.request.user.is_staff:
            if instance.user != self.request.user:
                raise PermissionDenied("You can only delete your own appointments")
        instance.delete()


class ReviewViewSet(viewsets.ModelViewSet):
    """
    API endpoint for reviews.
    GET /api/reviews/ - List approved reviews
    POST /api/reviews/ - Submit new review
    """
    queryset = Review.objects.filter(is_approved=True)
    serializer_class = ReviewSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['service', 'rating']
    ordering_fields = ['created_at', 'rating']

    def get_queryset(self):
        # Public users can only see approved reviews
        if self.request.user.is_staff:
            return Review.objects.all()
        return super().get_queryset()


class ContactMessageViewSet(viewsets.ModelViewSet):
    """
    API endpoint for contact messages.
    POST /api/contact/ - Submit contact message (public)
    GET /api/contact/ - List all messages (admin only)
    PATCH /api/contact/{id}/ - Mark as read/unread (admin only)
    DELETE /api/contact/{id}/ - Delete message (admin only)
    """
    queryset = ContactMessage.objects.all()
    serializer_class = ContactMessageSerializer
    ordering_fields = ['-created_at']
    ordering = ['-created_at']

    def get_permissions(self):
        if self.action == 'create':
            return [permissions.AllowAny()]
        return [permissions.IsAdminUser()]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response(
            {"message": "Thank you for your message! We'll get back to you soon."},
            status=status.HTTP_201_CREATED
        )

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAdminUser])
    def reply(self, request, pk=None):
        """Admin reply to contact message"""
        contact_message = self.get_object()
        admin_reply = request.data.get('admin_reply', '')
        
        if not admin_reply:
            return Response(
                {"error": "Reply message is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Update contact message with reply
        contact_message.admin_reply = admin_reply
        contact_message.replied_at = timezone.now()
        contact_message.save()
        
        # Find the user by email to create notification
        try:
            user = User.objects.get(email=contact_message.email)
            # Create notification for the user
            Notification.objects.create(
                user=user,
                title=f"Reply to: {contact_message.subject}",
                message=admin_reply,
                notification_type='contact_reply',
                related_contact_message=contact_message
            )
        except User.DoesNotExist:
            # User doesn't have an account, skip notification
            pass
        
        serializer = self.get_serializer(contact_message)
        return Response(serializer.data)


class NotificationViewSet(viewsets.ModelViewSet):
    """
    API endpoint for user notifications.
    GET /api/notifications/ - List user's notifications
    PATCH /api/notifications/{id}/ - Mark as read
    DELETE /api/notifications/{id}/ - Delete notification
    POST /api/notifications/mark_all_read/ - Mark all as read
    """
    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]
    ordering = ['-created_at']

    def get_queryset(self):
        # Users can only see their own notifications
        if self.request.user.is_staff:
            return Notification.objects.all()
        return Notification.objects.filter(user=self.request.user)

    def get_permissions(self):
        return [permissions.IsAuthenticated()]

    @action(detail=False, methods=['post'])
    def mark_all_read(self, request):
        """Mark all notifications as read for the current user"""
        updated = Notification.objects.filter(
            user=request.user,
            is_read=False
        ).update(is_read=True)
        return Response({"updated": updated})


class TransactionViewSet(viewsets.ModelViewSet):
    """
    API endpoint for viewing and managing transaction history.
    GET /api/transactions/ - List transactions
    GET /api/transactions/{id}/ - Get transaction details
    PATCH /api/transactions/{id}/ - Update transaction (admin only)
    """
    queryset = Transaction.objects.all()
    serializer_class = TransactionSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['status', 'appointment']
    ordering_fields = ['-initiated_at', '-completed_at']
    ordering = ['-initiated_at']
    permission_classes = [permissions.IsAuthenticated]

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAdminUser()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        # Users can view their own transactions, admins can view all
        queryset = super().get_queryset()
        if self.request.user.is_staff:
            return queryset
        # Regular users can only see their own transactions
        return queryset.filter(user=self.request.user)


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def initiate_payment(request):
    """
    Initiate M-Pesa STK Push payment for an appointment
    
    Expected payload:
    {
        "appointment_id": 123,
        "phone_number": "0712345678"
    }
    """
    appointment_id = request.data.get('appointment_id')
    phone_number = request.data.get('phone_number')
    
    if not appointment_id or not phone_number:
        return Response(
            {'error': 'appointment_id and phone_number are required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        appointment = Appointment.objects.get(id=appointment_id)
    except Appointment.DoesNotExist:
        return Response(
            {'error': 'Appointment not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    # Check if already paid
    if appointment.payment_status == 'completed':
        return Response(
            {'error': 'This appointment has already been paid for'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Get service price
    amount = int(appointment.service.price)
    
    # Initialize M-Pesa client
    mpesa = MpesaClient()
    
    # Initiate STK push
    result = mpesa.stk_push(
        phone_number=phone_number,
        amount=amount,
        account_reference='Verdelle Nails',
        transaction_desc=f'Payment for {appointment.service.name}'
    )
    
    if result.get('success'):
        # Update appointment with payment details
        appointment.payment_status = 'initiated'
        appointment.payment_phone = phone_number
        appointment.mpesa_checkout_request_id = result.get('CheckoutRequestID')
        appointment.save()
        
        return Response({
            'success': True,
            'message': result.get('CustomerMessage', 'Payment request sent to your phone'),
            'CheckoutRequestID': result.get('CheckoutRequestID'),
            'appointment_id': appointment.id
        }, status=status.HTTP_200_OK)
    else:
        return Response({
            'success': False,
            'error': result.get('error', 'Payment initiation failed')
        }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def mpesa_callback(request):
    """
    M-Pesa callback endpoint to receive payment status updates
    """
    logger.info(f"M-Pesa callback received: {request.data}")
    
    try:
        # Parse M-Pesa callback data
        data = request.data
        body = data.get('Body', {})
        stk_callback = body.get('stkCallback', {})
        
        result_code = stk_callback.get('ResultCode')
        checkout_request_id = stk_callback.get('CheckoutRequestID')
        
        # Find appointment by checkout request ID
        try:
            appointment = Appointment.objects.get(mpesa_checkout_request_id=checkout_request_id)
        except Appointment.DoesNotExist:
            logger.error(f"Appointment not found for CheckoutRequestID: {checkout_request_id}")
            return Response({'ResultCode': 0, 'ResultDesc': 'Accepted'})
        
        if result_code == 0:
            # Payment successful
            callback_metadata = stk_callback.get('CallbackMetadata', {})
            items = callback_metadata.get('Item', [])
            
            # Extract transaction details
            transaction_id = None
            amount = None
            
            for item in items:
                if item.get('Name') == 'MpesaReceiptNumber':
                    transaction_id = item.get('Value')
                elif item.get('Name') == 'Amount':
                    amount = item.get('Value')
            
            # Update appointment
            appointment.payment_status = 'completed'
            appointment.mpesa_transaction_id = transaction_id
            appointment.amount_paid = amount
            appointment.payment_date = timezone.now()
            appointment.status = 'confirmed'  # Auto-confirm on payment
            appointment.save()
            
            # Create Transaction record
            Transaction.objects.create(
                user=appointment.user,
                appointment=appointment,
                amount=amount,
                mpesa_receipt_number=transaction_id,
                phone_number=appointment.phone,
                status='completed',
                transaction_date=timezone.now()
            )
            
            logger.info(f"Payment completed for appointment {appointment.id}")
        elif result_code in [1032, 1037, 2032]:
            # Payment cancelled or timed out by user
            # 1032: Request cancelled by user
            # 1037: DS timeout - user didn't enter PIN in time
            # 2032: Request cancelled
            result_desc = stk_callback.get('ResultDesc', 'Payment cancelled')
            appointment.payment_status = 'cancelled'
            appointment.save()
            logger.info(f"Payment cancelled for appointment {appointment.id}: {result_desc}")
        else:
            # Payment failed for other reasons
            result_desc = stk_callback.get('ResultDesc', 'Payment failed')
            appointment.payment_status = 'failed'
            appointment.save()
            logger.warning(f"Payment failed for appointment {appointment.id} (code {result_code}): {result_desc}")
        
        return Response({'ResultCode': 0, 'ResultDesc': 'Accepted'})
    
    except Exception as e:
        logger.error(f"Error processing M-Pesa callback: {str(e)}")
        return Response({'ResultCode': 1, 'ResultDesc': 'Error'})


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def check_payment_status(request, appointment_id):
    """
    Check the payment status of an appointment by querying M-Pesa directly
    """
    try:
        appointment = Appointment.objects.get(id=appointment_id)
        logger.info(f"Checking payment status for appointment {appointment_id}, current status: {appointment.payment_status}, CheckoutRequestID: {appointment.mpesa_checkout_request_id}")
        
        # If payment is still pending/initiated and we have a checkout request ID, query M-Pesa
        if appointment.payment_status in ['pending', 'initiated'] and appointment.mpesa_checkout_request_id:
            logger.info(f"Querying M-Pesa for appointment {appointment_id}")
            mpesa = MpesaClient()
            result = mpesa.query_transaction(appointment.mpesa_checkout_request_id)
            
            if result.get('success'):
                data = result.get('data', {})
                result_code = str(data.get('ResultCode', ''))
                result_desc = data.get('ResultDesc', '')
                logger.info(f"M-Pesa query result code: {result_code}, description: {result_desc}")
                
                if result_code == '0':
                    # Payment successful - extract details
                    callback_metadata = data.get('CallbackMetadata', {})
                    items = callback_metadata.get('Item', [])
                    
                    transaction_id = None
                    amount = None
                    
                    for item in items:
                        if item.get('Name') == 'MpesaReceiptNumber':
                            transaction_id = item.get('Value')
                        elif item.get('Name') == 'Amount':
                            amount = item.get('Value')
                    
                    # Update appointment
                    appointment.payment_status = 'completed'
                    appointment.mpesa_transaction_id = transaction_id
                    appointment.amount_paid = amount or appointment.service.price
                    appointment.payment_date = timezone.now()
                    appointment.status = 'confirmed'
                    appointment.save()
                    
                    # Create Transaction record
                    Transaction.objects.create(
                        user=appointment.user,
                        appointment=appointment,
                        amount=amount or appointment.service.price,
                        mpesa_receipt_number=transaction_id,
                        phone_number=appointment.phone,
                        status='completed',
                        transaction_date=timezone.now()
                    )
                    
                    logger.info(f"Payment verified and completed for appointment {appointment.id}")
                    
                elif result_code in ['1032', '1037', '1', '2032']:
                    # Payment cancelled, timed out, or failed
                    # 1032: Request cancelled by user
                    # 1037: DS timeout - user didn't enter PIN in time
                    # 1: Insufficient balance
                    # 2032: Request cancelled by user
                    appointment.payment_status = 'cancelled'
                    appointment.save()
                    logger.info(f"Payment cancelled/failed for appointment {appointment.id}: {result_desc}")
                    
                elif result_code != '':
                    # Any other error code means payment failed
                    appointment.payment_status = 'failed'
                    appointment.save()
                    logger.warning(f"Payment failed for appointment {appointment.id} with code {result_code}: {result_desc}")

            else:
                logger.error(f"Failed to query M-Pesa: {result.get('error')}")
        
        return Response({
            'appointment_id': appointment.id,
            'payment_status': appointment.payment_status,
            'mpesa_transaction_id': appointment.mpesa_transaction_id,
            'amount_paid': appointment.amount_paid,
            'payment_date': appointment.payment_date,
            'appointment_status': appointment.status
        })
    except Appointment.DoesNotExist:
        return Response(
            {'error': 'Appointment not found'},
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def verify_manual_payment(request):
    """
    Submit payment for manual verification using M-Pesa receipt number.
    Payment will be marked as 'pending_verification' and requires admin approval.
    
    Expected payload:
    {
        "appointment_id": 123,
        "mpesa_receipt": "SH12XY34ZA"
    }
    """
    appointment_id = request.data.get('appointment_id')
    mpesa_receipt = request.data.get('mpesa_receipt', '').strip().upper()
    
    if not appointment_id or not mpesa_receipt:
        return Response(
            {'error': 'appointment_id and mpesa_receipt are required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        appointment = Appointment.objects.get(id=appointment_id)
    except Appointment.DoesNotExist:
        return Response(
            {'error': 'Appointment not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    # Check if already paid
    if appointment.payment_status == 'completed':
        return Response(
            {'error': 'This appointment has already been paid for'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Validate receipt format (M-Pesa receipts are typically 10 characters)
    if len(mpesa_receipt) < 8 or len(mpesa_receipt) > 12:
        return Response(
            {'error': 'Invalid M-Pesa receipt format. Please check and try again.'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # SECURITY: Check if receipt code has been used before
    duplicate_check = Appointment.objects.filter(
        mpesa_transaction_id=mpesa_receipt
    ).exclude(id=appointment_id).first()
    
    if duplicate_check:
        logger.warning(f"Duplicate receipt attempt: {mpesa_receipt} already used for appointment {duplicate_check.id}")
        return Response(
            {'error': 'This receipt code has already been used. Please contact support if this is an error.'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Check in Transaction table as well
    duplicate_transaction = Transaction.objects.filter(
        mpesa_receipt_number=mpesa_receipt
    ).first()
    
    if duplicate_transaction:
        logger.warning(f"Duplicate receipt attempt: {mpesa_receipt} already in transactions")
        return Response(
            {'error': 'This receipt code has already been used. Please contact support if this is an error.'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Mark as pending verification instead of completed
    appointment.payment_status = 'pending_verification'
    appointment.mpesa_transaction_id = mpesa_receipt
    appointment.amount_paid = appointment.service.price
    appointment.payment_date = timezone.now()
    # Don't confirm the appointment yet - wait for admin approval
    appointment.save()
    
    logger.info(f"Manual payment submitted for verification - appointment {appointment.id}, receipt {mpesa_receipt}")
    
    return Response({
        'success': True,
        'message': 'Payment submitted for verification. An admin will verify your M-Pesa receipt and confirm your appointment within 24 hours. You will receive a confirmation email once approved.',
        'appointment_id': appointment.id,
        'payment_status': appointment.payment_status,
        'appointment_status': appointment.status
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([permissions.IsAdminUser])
def approve_manual_payment(request, appointment_id):
    """
    Admin endpoint to approve or reject manual payment verification.
    Requires admin authentication.
    
    Expected payload:
    {
        "action": "approve" or "reject",
        "reason": "optional reason for rejection"
    }
    """
    action = request.data.get('action')
    reason = request.data.get('reason', '')
    
    if action not in ['approve', 'reject']:
        return Response(
            {'error': 'action must be either "approve" or "reject"'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        appointment = Appointment.objects.get(id=appointment_id)
    except Appointment.DoesNotExist:
        return Response(
            {'error': 'Appointment not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    if appointment.payment_status != 'pending_verification':
        return Response(
            {'error': f'Appointment is not pending verification. Current status: {appointment.payment_status}'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    if action == 'approve':
        # Approve the payment
        appointment.payment_status = 'completed'
        appointment.status = 'confirmed'
        appointment.save()
        
        # Create Transaction record
        Transaction.objects.create(
            user=appointment.user,
            appointment=appointment,
            amount=appointment.amount_paid,
            mpesa_receipt_number=appointment.mpesa_transaction_id,
            phone_number=appointment.phone,
            status='completed',
            transaction_date=appointment.payment_date
        )
        
        logger.info(f"Admin approved manual payment for appointment {appointment.id}")
        
        return Response({
            'success': True,
            'message': f'Payment approved for appointment {appointment.id}',
            'appointment_status': appointment.status,
            'payment_status': appointment.payment_status
        })
    
    else:  # reject
        appointment.payment_status = 'failed'
        appointment.mpesa_transaction_id = None
        appointment.save()
        
        logger.info(f"Admin rejected manual payment for appointment {appointment.id}. Reason: {reason}")
        
        return Response({
            'success': True,
            'message': f'Payment rejected for appointment {appointment.id}',
            'reason': reason
        })
