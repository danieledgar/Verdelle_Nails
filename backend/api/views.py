from rest_framework import viewsets, filters, status, permissions
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied
from rest_framework.authtoken.models import Token
from django.contrib.auth import logout
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt
from django_filters.rest_framework import DjangoFilterBackend
from .models import Service, ServiceCategory, GalleryImage, Appointment, Review, ContactMessage, User, Transaction, Notification
from .serializers import (
    ServiceSerializer, ServiceCategorySerializer, GalleryImageSerializer, AppointmentSerializer,
    ReviewSerializer, ContactMessageSerializer, UserSerializer,
    RegisterSerializer, LoginSerializer, TransactionSerializer, NotificationSerializer
)
from .mpesa import MpesaClient
import logging
import json
import traceback

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
    queryset = ServiceCategory.objects.all()
    serializer_class = ServiceCategorySerializer
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['display_order', 'name']

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAdminUser()]
        return [permissions.AllowAny()]


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAdminUser]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['username', 'email', 'first_name', 'last_name']
    ordering_fields = ['date_joined', 'username']


class ServiceViewSet(viewsets.ModelViewSet):
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
        featured_services = self.queryset.filter(is_featured=True, is_active=True)
        serializer = self.get_serializer(featured_services, many=True)
        return Response(serializer.data)


class GalleryImageViewSet(viewsets.ModelViewSet):
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
        featured_images = self.queryset.filter(is_featured=True)
        serializer = self.get_serializer(featured_images, many=True)
        return Response(serializer.data)


class AppointmentViewSet(viewsets.ModelViewSet):
    queryset = Appointment.objects.all()
    serializer_class = AppointmentSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['status', 'appointment_date', 'payment_status']
    ordering_fields = ['-appointment_date', '-created_at']
    ordering = ['-appointment_date', '-appointment_time']

    def get_permissions(self):
        if self.request.user and self.request.user.is_staff:
            return [permissions.IsAdminUser()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        queryset = super().get_queryset()
        if self.request.user.is_staff:
            return queryset
        return queryset.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def perform_update(self, serializer):
        if not self.request.user.is_staff and serializer.instance.user != self.request.user:
            raise PermissionDenied("You don't have permission to update this appointment")
        serializer.save()


class ReviewViewSet(viewsets.ModelViewSet):
    queryset = Review.objects.filter(is_approved=True)
    serializer_class = ReviewSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['service', 'rating']
    ordering_fields = ['-created_at', 'rating']

    def get_permissions(self):
        if self.action == 'create':
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class ContactMessageViewSet(viewsets.ModelViewSet):
    queryset = ContactMessage.objects.all()
    serializer_class = ContactMessageSerializer
    filter_backends = [filters.OrderingFilter]
    ordering = ['-created_at']

    def get_permissions(self):
        if self.action == 'create':
            return [permissions.AllowAny()]
        return [permissions.IsAdminUser()]


class TransactionViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Transaction.objects.all()
    serializer_class = TransactionSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['status', 'initiated_at']
    ordering = ['-initiated_at']

    def get_queryset(self):
        queryset = super().get_queryset()
        if self.request.user.is_staff:
            return queryset
        return queryset.filter(user=self.request.user)


class NotificationViewSet(viewsets.ModelViewSet):
    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.OrderingFilter]
    ordering = ['-created_at']

    def get_queryset(self):
        return self.queryset.filter(user=self.request.user)

    @action(detail=False, methods=['post'])
    def mark_all_read(self, request):
        self.get_queryset().update(is_read=True)
        return Response({'message': 'All notifications marked as read'})


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def initiate_payment(request):
    """
    Initiate M-Pesa STK Push payment
    
    Expected payload:
    {
        "appointment_id": 123,
        "phone_number": "254712345678"
    }
    """
    try:
        appointment_id = request.data.get('appointment_id')
        phone_number = request.data.get('phone_number')
        
        logger.info(f"Payment initiation request - Appointment: {appointment_id}, Phone: {phone_number}")
        
        if not appointment_id or not phone_number:
            return Response(
                {'error': 'appointment_id and phone_number are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            appointment = Appointment.objects.get(id=appointment_id)
        except Appointment.DoesNotExist:
            logger.error(f"Appointment {appointment_id} not found")
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
        
        # Initialize M-Pesa client
        mpesa_client = MpesaClient()
        
        # Initiate STK Push
        result = mpesa_client.stk_push(
            phone_number=phone_number,
            amount=int(appointment.service.price),
            account_reference=f'APT{appointment.id}',
            transaction_desc=f'Payment for {appointment.service.name}'
        )
        
        if result.get('success'):
            # Update appointment with checkout request ID
            appointment.mpesa_checkout_request_id = result.get('CheckoutRequestID')
            appointment.payment_status = 'initiated'
            appointment.payment_phone = phone_number
            appointment.save()
            
            logger.info(f"STK Push initiated successfully for appointment {appointment.id}")
            
            return Response({
                'success': True,
                'message': 'Payment prompt sent to your phone. Please enter your M-Pesa PIN.',
                'CheckoutRequestID': result.get('CheckoutRequestID'),
                'MerchantRequestID': result.get('MerchantRequestID')
            })
        else:
            logger.error(f"STK Push failed for appointment {appointment.id}: {result.get('error')}")
            return Response(
                {'error': result.get('error', 'Payment initiation failed')},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    except Exception as e:
        logger.error(f"Error in initiate_payment: {str(e)}")
        logger.error(traceback.format_exc())
        return Response(
            {'error': f'Server error: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
@csrf_exempt
def mpesa_callback(request):
    """
    M-Pesa callback endpoint to receive payment confirmation
    This is called by Safaricom when payment is processed
    """
    try:
        # Log the raw callback data
        callback_data = json.loads(request.body.decode('utf-8'))
        logger.info(f"M-Pesa Callback received: {json.dumps(callback_data, indent=2)}")
        
        # Extract callback data
        body = callback_data.get('Body', {})
        stk_callback = body.get('stkCallback', {})
        
        result_code = str(stk_callback.get('ResultCode', ''))
        result_desc = stk_callback.get('ResultDesc', '')
        checkout_request_id = stk_callback.get('CheckoutRequestID', '')
        
        logger.info(f"Processing callback - CheckoutRequestID: {checkout_request_id}, ResultCode: {result_code}")
        
        # Find appointment by CheckoutRequestID
        try:
            appointment = Appointment.objects.get(mpesa_checkout_request_id=checkout_request_id)
            logger.info(f"Found appointment {appointment.id} for checkout request {checkout_request_id}")
        except Appointment.DoesNotExist:
            logger.error(f"No appointment found for CheckoutRequestID: {checkout_request_id}")
            return Response({'ResultCode': 0, 'ResultDesc': 'Accepted'})
        
        # Process based on result code
        if result_code == '0':
            # Payment successful
            logger.info(f"Payment SUCCESSFUL for appointment {appointment.id}")
            
            # Extract callback metadata
            callback_metadata = stk_callback.get('CallbackMetadata', {})
            items = callback_metadata.get('Item', [])
            
            # Parse metadata items
            metadata = {}
            for item in items:
                name = item.get('Name')
                value = item.get('Value')
                metadata[name] = value
            
            mpesa_receipt = metadata.get('MpesaReceiptNumber', '')
            amount_paid = metadata.get('Amount', 0)
            transaction_date_str = metadata.get('TransactionDate', '')
            phone_number = metadata.get('PhoneNumber', appointment.payment_phone)
            
            logger.info(f"Payment details - Receipt: {mpesa_receipt}, Amount: {amount_paid}, Phone: {phone_number}")
            
            # Parse transaction date
            transaction_date = timezone.now()
            if transaction_date_str:
                try:
                    from datetime import datetime
                    transaction_date = datetime.strptime(str(transaction_date_str), '%Y%m%d%H%M%S')
                    from django.utils.timezone import make_aware
                    transaction_date = make_aware(transaction_date)
                except Exception as e:
                    logger.warning(f"Could not parse transaction date: {transaction_date_str}, error: {e}")
            
            # Update appointment
            appointment.payment_status = 'completed'
            appointment.status = 'confirmed'
            appointment.mpesa_transaction_id = mpesa_receipt
            appointment.amount_paid = amount_paid
            appointment.payment_date = transaction_date
            appointment.payment_phone = phone_number
            appointment.save()
            
            # Create Transaction record
            try:
                # Check if transaction already exists
                existing_transaction = Transaction.objects.filter(
                    mpesa_transaction_id=mpesa_receipt
                ).first()
                
                if not existing_transaction:
                    transaction = Transaction.objects.create(
                        user=appointment.user,
                        appointment=appointment,
                        mpesa_transaction_id=mpesa_receipt,
                        mpesa_checkout_request_id=checkout_request_id,
                        phone_number=phone_number,
                        amount=amount_paid,
                        status='completed',
                        result_code=result_code,
                        result_description=result_desc,
                        completed_at=transaction_date,
                        account_reference=f'APT{appointment.id}',
                        transaction_description=f'Payment for {appointment.service.name}'
                    )
                    logger.info(f"Transaction record created: ID {transaction.id}, Receipt: {mpesa_receipt}")
                else:
                    logger.info(f"Transaction already exists for receipt {mpesa_receipt}")
            except Exception as e:
                logger.error(f"Error creating transaction record: {str(e)}")
                logger.error(traceback.format_exc())
            
            # Create notification for user
            try:
                Notification.objects.create(
                    user=appointment.user,
                    title='Payment Successful',
                    message=f'Your payment of KES {amount_paid} for {appointment.service.name} on {appointment.appointment_date} has been confirmed.',
                    notification_type='appointment'
                )
                logger.info(f"Notification created for user {appointment.user.id}")
            except Exception as e:
                logger.error(f"Error creating notification: {str(e)}")
            
            logger.info(f"Payment processing completed successfully for appointment {appointment.id}")
            
        elif result_code in ['1032', '1037', '2032']:
            # Payment cancelled by user or timed out
            logger.info(f"Payment CANCELLED for appointment {appointment.id}: {result_desc}")
            appointment.payment_status = 'cancelled'
            appointment.save()
            
        else:
            # Payment failed
            logger.warning(f"Payment FAILED for appointment {appointment.id} - Code: {result_code}, Desc: {result_desc}")
            appointment.payment_status = 'failed'
            appointment.save()
        
        # Always return success to M-Pesa
        return Response({
            'ResultCode': 0,
            'ResultDesc': 'Accepted'
        })
        
    except json.JSONDecodeError as e:
        logger.error(f"Invalid JSON in callback: {str(e)}")
        return Response({
            'ResultCode': 1,
            'ResultDesc': 'Invalid JSON'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    except Exception as e:
        logger.error(f"Error processing M-Pesa callback: {str(e)}")
        logger.error(traceback.format_exc())
        # Still return success to M-Pesa to avoid retries
        return Response({
            'ResultCode': 0,
            'ResultDesc': 'Accepted'
        })


# 
@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def check_payment_status(request, appointment_id):
    """
    Check payment status WITHOUT modifying the appointment status during polling.
    Only the callback should update to 'completed' or 'failed'.
    """
    try:
        logger.info(f"Checking payment status for appointment {appointment_id}")
        
        appointment = Appointment.objects.get(id=appointment_id)
        
        # CRITICAL: Don't query M-Pesa during polling - just return current status
        # Let the callback handle status updates
        
        return Response({
            'appointment_id': appointment.id,
            'payment_status': appointment.payment_status,
            'mpesa_transaction_id': appointment.mpesa_transaction_id,
            'amount_paid': float(appointment.amount_paid) if appointment.amount_paid else None,
            'payment_date': appointment.payment_date,
            'appointment_status': appointment.status
        })
        
    except Appointment.DoesNotExist:
        logger.error(f"Appointment {appointment_id} not found")
        return Response(
            {'error': 'Appointment not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        logger.error(f"Error checking payment status: {str(e)}")
        return Response(
            {
                'error': str(e),
                'appointment_id': appointment_id,
                'payment_status': 'error'
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def verify_manual_payment(request):
    """
    Submit payment for manual verification using M-Pesa receipt number.
    """
    try:
        appointment_id = request.data.get('appointment_id')
        mpesa_receipt = request.data.get('mpesa_receipt', '').strip().upper()
        
        logger.info(f"Manual verification request - Appointment: {appointment_id}, Receipt: {mpesa_receipt}")
        
        if not appointment_id or not mpesa_receipt:
            return Response(
                {'error': 'appointment_id and mpesa_receipt are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            appointment = Appointment.objects.get(id=appointment_id)
        except Appointment.DoesNotExist:
            logger.error(f"Appointment {appointment_id} not found")
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
        
        # Validate receipt format
        if len(mpesa_receipt) < 8 or len(mpesa_receipt) > 12:
            return Response(
                {'error': 'Invalid M-Pesa receipt format. Please check and try again.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check for duplicates in appointments
        duplicate_check = Appointment.objects.filter(
            mpesa_transaction_id=mpesa_receipt
        ).exclude(id=appointment_id).first()
        
        if duplicate_check:
            logger.warning(f"Duplicate receipt in appointments: {mpesa_receipt}")
            return Response(
                {'error': 'This receipt code has already been used. Please contact support if this is an error.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check for duplicates in transactions
        duplicate_transaction = Transaction.objects.filter(
            mpesa_transaction_id=mpesa_receipt
        ).first()
        
        if duplicate_transaction:
            logger.warning(f"Duplicate receipt in transactions: {mpesa_receipt}")
            return Response(
                {'error': 'This receipt code has already been used. Please contact support if this is an error.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Mark as pending verification
        appointment.payment_status = 'pending_verification'
        appointment.mpesa_transaction_id = mpesa_receipt
        appointment.amount_paid = appointment.service.price
        appointment.payment_date = timezone.now()
        appointment.save()
        
        logger.info(f"Manual payment submitted for verification - appointment {appointment.id}, receipt {mpesa_receipt}")
        
        return Response({
            'success': True,
            'message': 'Payment submitted for verification. An admin will verify your M-Pesa receipt and confirm your appointment within 24 hours.',
            'appointment_id': appointment.id,
            'payment_status': appointment.payment_status,
            'appointment_status': appointment.status
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Error in verify_manual_payment: {str(e)}")
        logger.error(traceback.format_exc())
        return Response(
            {'error': f'Server error: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([permissions.IsAdminUser])
def approve_manual_payment(request, appointment_id):
    """
    Admin endpoint to approve or reject manual payment verification.
    """
    try:
        action = request.data.get('action')
        reason = request.data.get('reason', '')
        
        logger.info(f"Admin approval request - Appointment: {appointment_id}, Action: {action}")
        
        if action not in ['approve', 'reject']:
            return Response(
                {'error': 'action must be either "approve" or "reject"'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            appointment = Appointment.objects.get(id=appointment_id)
        except Appointment.DoesNotExist:
            logger.error(f"Appointment {appointment_id} not found")
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
            try:
                Transaction.objects.create(
                    user=appointment.user,
                    appointment=appointment,
                    mpesa_transaction_id=appointment.mpesa_transaction_id,
                    phone_number=appointment.payment_phone,
                    amount=appointment.amount_paid,
                    status='completed',
                    result_code='0',
                    result_description='Manually verified by admin',
                    completed_at=appointment.payment_date,
                    account_reference=f'APT{appointment.id}',
                    transaction_description=f'Manual verification - {appointment.service.name}'
                )
                logger.info(f"Transaction created for manually approved payment - appointment {appointment.id}")
            except Exception as e:
                logger.error(f"Error creating transaction during approval: {str(e)}")
            
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
            
    except Exception as e:
        logger.error(f"Error in approve_manual_payment: {str(e)}")
        logger.error(traceback.format_exc())
        return Response(
            {'error': f'Server error: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )