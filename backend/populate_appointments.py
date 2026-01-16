import os
import django
from datetime import datetime, timedelta
from decimal import Decimal

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'verdelle_nails.settings')
django.setup()

from api.models import Appointment, Service, User
from django.utils import timezone

def create_sample_appointments():
    print("Creating sample appointments...")
    print("=" * 60)
    
    # Get existing users
    users = User.objects.all()
    if not users.exists():
        print("⚠️  No users found. Please create users first.")
        return
    
    user = users.first()
    
    # Get existing services
    services = Service.objects.all()[:5]
    if not services.exists():
        print("⚠️  No services found. Please run populate_services.py first.")
        return
    
    # Clear existing appointments
    Appointment.objects.all().delete()
    
    appointments_data = [
        {
            'service': services[0],
            'customer_name': 'Jane Doe',
            'customer_email': 'jane@example.com',
            'customer_phone': '0712345678',
            'appointment_date': timezone.now().date() + timedelta(days=2),
            'appointment_time': '10:00',
            'status': 'pending',
            'payment_status': 'pending',
            'amount_paid': Decimal('0.00'),
            'notes': 'First time customer',
        },
        {
            'service': services[1],
            'customer_name': 'Mary Smith',
            'customer_email': 'mary@example.com',
            'customer_phone': '0723456789',
            'appointment_date': timezone.now().date() + timedelta(days=3),
            'appointment_time': '14:00',
            'status': 'confirmed',
            'payment_status': 'completed',
            'amount_paid': services[1].price,
            'notes': 'Regular customer',
        },
        {
            'service': services[2],
            'customer_name': 'Sarah Johnson',
            'customer_email': 'sarah@example.com',
            'customer_phone': '0734567890',
            'appointment_date': timezone.now().date() - timedelta(days=1),
            'appointment_time': '11:00',
            'status': 'completed',
            'payment_status': 'completed',
            'amount_paid': services[2].price,
            'notes': 'Very satisfied',
        },
        {
            'service': services[3],
            'customer_name': 'Emily Brown',
            'customer_email': 'emily@example.com',
            'customer_phone': '0745678901',
            'appointment_date': timezone.now().date() + timedelta(days=1),
            'appointment_time': '15:30',
            'status': 'confirmed',
            'payment_status': 'completed',
            'amount_paid': services[3].price,
            'notes': 'Special occasion',
        },
        {
            'service': services[4],
            'customer_name': 'Lisa Wilson',
            'customer_email': 'lisa@example.com',
            'customer_phone': '0756789012',
            'appointment_date': timezone.now().date() - timedelta(days=3),
            'appointment_time': '09:00',
            'status': 'completed',
            'payment_status': 'completed',
            'amount_paid': services[4].price,
            'notes': 'Excellent service',
        },
        {
            'service': services[0],
            'customer_name': 'Anna Davis',
            'customer_email': 'anna@example.com',
            'customer_phone': '0767890123',
            'appointment_date': timezone.now().date() + timedelta(days=5),
            'appointment_time': '13:00',
            'status': 'pending',
            'payment_status': 'pending',
            'amount_paid': Decimal('0.00'),
            'notes': 'Requested specific technician',
        },
    ]
    
    created_count = 0
    total_revenue = Decimal('0.00')
    
    for apt_data in appointments_data:
        try:
            appointment = Appointment.objects.create(
                user=user,
                **apt_data
            )
            
            if apt_data['payment_status'] == 'completed':
                total_revenue += apt_data['amount_paid']
            
            status_icon = '✓' if apt_data['status'] == 'completed' else '⏳' if apt_data['status'] == 'confirmed' else '📅'
            print(f"{status_icon} Created: {apt_data['customer_name']} - {apt_data['service'].name} ({apt_data['status']})")
            created_count += 1
        except Exception as e:
            print(f"❌ Error creating appointment for {apt_data['customer_name']}: {e}")
    
    print("=" * 60)
    print(f"✓ Successfully created {created_count} appointments")
    print(f"💰 Total revenue from paid appointments: KSh {total_revenue}")
    print("=" * 60)

if __name__ == '__main__':
    create_sample_appointments()
