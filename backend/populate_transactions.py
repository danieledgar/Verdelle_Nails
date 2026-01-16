import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'verdelle_nails.settings')
django.setup()

from api.models import Transaction, User
from datetime import datetime, timedelta
from decimal import Decimal

def populate_transactions():
    """Create sample transactions matching the appointment data"""
    
    # Clear existing transactions
    Transaction.objects.all().delete()
    print("Cleared existing transactions")
    
    # Get a user (we'll use the first available user)
    try:
        user = User.objects.first()
        if not user:
            print("No users found. Please create a user first.")
            return
    except Exception as e:
        print(f"Error getting user: {e}")
        return
    
    transactions_data = [
        {
            'user': user,
            'phone_number': '254712345678',
            'amount': Decimal('45.00'),
            'status': 'completed',
            'mpesa_checkout_request_id': 'ws_CO_16012026153000001',
            'mpesa_transaction_id': 'QAB1CD2EFG',
            'initiated_at': datetime(2026, 1, 17, 15, 30),
            'completed_at': datetime(2026, 1, 17, 15, 35),
        },
        {
            'user': user,
            'phone_number': '254723456789',
            'amount': Decimal('8.00'),
            'status': 'completed',
            'mpesa_checkout_request_id': 'ws_CO_19012026140000002',
            'mpesa_transaction_id': 'QBC2DE3FGH',
            'initiated_at': datetime(2026, 1, 19, 14, 0),
            'completed_at': datetime(2026, 1, 19, 14, 5),
        },
        {
            'user': user,
            'phone_number': '254734567890',
            'amount': Decimal('35.00'),
            'status': 'pending',
            'mpesa_checkout_request_id': 'ws_CO_18012026100000003',
            'mpesa_transaction_id': None,
            'initiated_at': datetime(2026, 1, 18, 10, 0),
            'completed_at': None,
        },
        {
            'user': user,
            'phone_number': '254745678901',
            'amount': Decimal('35.00'),
            'status': 'pending',
            'mpesa_checkout_request_id': 'ws_CO_21012026130000004',
            'mpesa_transaction_id': None,
            'initiated_at': datetime(2026, 1, 21, 13, 0),
            'completed_at': None,
        },
        {
            'user': user,
            'phone_number': '254756789012',
            'amount': Decimal('75.00'),
            'status': 'initiated',
            'mpesa_checkout_request_id': 'ws_CO_15012026090000005',
            'mpesa_transaction_id': None,
            'initiated_at': datetime(2026, 1, 15, 9, 0),
            'completed_at': None,
        },
        {
            'user': user,
            'phone_number': '254767890123',
            'amount': Decimal('60.00'),
            'status': 'failed',
            'mpesa_checkout_request_id': 'ws_CO_14012026160000006',
            'mpesa_transaction_id': None,
            'initiated_at': datetime(2026, 1, 14, 16, 0),
            'completed_at': None,
        }
    ]
    
    created_count = 0
    for txn_data in transactions_data:
        try:
            transaction = Transaction.objects.create(**txn_data)
            created_count += 1
            print(f"✓ Created transaction: {transaction.mpesa_checkout_request_id} - KSh {transaction.amount} ({transaction.status})")
        except Exception as e:
            print(f"✗ Error creating transaction: {e}")
    
    print(f"\n✅ Successfully created {created_count} transactions")
    
    # Show summary
    total_transactions = Transaction.objects.count()
    completed = Transaction.objects.filter(status='completed').count()
    pending = Transaction.objects.filter(status='pending').count()
    initiated = Transaction.objects.filter(status='initiated').count()
    failed = Transaction.objects.filter(status='failed').count()
    total_revenue = sum(float(t.amount) for t in Transaction.objects.filter(status='completed'))
    
    print(f"\n📊 Transaction Summary:")
    print(f"   Total: {total_transactions}")
    print(f"   Completed: {completed}")
    print(f"   Pending: {pending}")
    print(f"   Initiated: {initiated}")
    print(f"   Failed: {failed}")
    print(f"   Total Revenue: KSh {total_revenue:.2f}")

if __name__ == '__main__':
    populate_transactions()
