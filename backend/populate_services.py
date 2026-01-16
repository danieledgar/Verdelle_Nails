"""
Script to populate the database with service categories and services
Run with: python manage.py shell < populate_services.py
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'verdelle_nails.settings')
django.setup()

from api.models import ServiceCategory, Service

# Clear existing data
Service.objects.all().delete()
ServiceCategory.objects.all().delete()

# Service categories and their services
categories_data = [
    {
        'name': 'Manicure Services',
        'description': 'Complete hand and nail care treatments designed to pamper and beautify your hands',
        'focus': 'Hand and nail care',
        'icon': 'FaHandSparkles',
        'display_order': 1,
        'services': [
            {'name': 'Classic Manicure', 'description': 'Traditional nail care with shaping, cuticle treatment, and polish', 'duration': 45, 'price': 25.00},
            {'name': 'Express Manicure', 'description': 'Quick nail care perfect for busy schedules', 'duration': 30, 'price': 18.00},
            {'name': 'Luxury Manicure', 'description': 'Premium hand treatment with exfoliation, massage, and nourishing mask', 'duration': 60, 'price': 45.00},
            {'name': 'Gel Manicure', 'description': 'Long-lasting gel polish application with superior shine', 'duration': 60, 'price': 40.00},
            {'name': 'French Manicure', 'description': 'Classic French tip design with natural or gel polish', 'duration': 50, 'price': 35.00},
        ]
    },
    {
        'name': 'Pedicure Services',
        'description': 'Luxurious foot and toenail treatments for ultimate relaxation and beauty',
        'focus': 'Foot and toenail care',
        'icon': 'FaShoePrints',
        'display_order': 2,
        'services': [
            {'name': 'Classic Pedicure', 'description': 'Complete foot care with nail shaping, cuticle care, and polish', 'duration': 50, 'price': 35.00},
            {'name': 'Express Pedicure', 'description': 'Quick foot refresh for those on the go', 'duration': 35, 'price': 25.00},
            {'name': 'Luxury Pedicure', 'description': 'Indulgent treatment with callus removal, exfoliation, massage, and mask', 'duration': 75, 'price': 55.00},
            {'name': 'Gel Pedicure', 'description': 'Long-lasting gel polish for your toes', 'duration': 60, 'price': 45.00},
            {'name': 'Spa Pedicure', 'description': 'Ultimate relaxation with aromatherapy, hot towels, and paraffin wax', 'duration': 90, 'price': 65.00},
        ]
    },
    {
        'name': 'Gel & Strengthening Treatments',
        'description': 'Professional treatments to strengthen and enhance your natural nails',
        'focus': 'Long-lasting and natural nail enhancement',
        'icon': 'FaShieldAlt',
        'display_order': 3,
        'services': [
            {'name': 'Gel Overlay', 'description': 'Protective gel coating for natural nail strength and shine', 'duration': 45, 'price': 35.00},
            {'name': 'BIAB Treatment', 'description': 'Builder in a Bottle for natural nail growth and protection', 'duration': 60, 'price': 50.00},
            {'name': 'Nail Strengthening Treatment', 'description': 'Specialized treatment to repair and strengthen weak nails', 'duration': 40, 'price': 30.00},
            {'name': 'Gel Removal', 'description': 'Safe and gentle gel polish removal', 'duration': 30, 'price': 15.00},
        ]
    },
    {
        'name': 'Acrylics & Nail Extensions',
        'description': 'Create beautiful, long-lasting nail extensions with various techniques',
        'focus': 'Length, structure, durability',
        'icon': 'FaMagic',
        'display_order': 4,
        'services': [
            {'name': 'Acrylic Full Set', 'description': 'Complete set of durable acrylic nail extensions', 'duration': 90, 'price': 65.00},
            {'name': 'Acrylic Refill', 'description': 'Maintain your acrylic extensions with growth refill', 'duration': 60, 'price': 45.00},
            {'name': 'Gel Extensions', 'description': 'Natural-looking gel nail extensions', 'duration': 90, 'price': 70.00},
            {'name': 'Polygel Extensions', 'description': 'Lightweight, flexible nail extensions with polygel', 'duration': 90, 'price': 75.00},
            {'name': 'Extension Removal', 'description': 'Safe removal of acrylic or gel extensions', 'duration': 45, 'price': 25.00},
        ]
    },
    {
        'name': 'Nail Art & Design',
        'description': 'Express your creativity with custom nail art and stunning designs',
        'focus': 'Aesthetic enhancement and creativity',
        'icon': 'FaPaintBrush',
        'display_order': 5,
        'services': [
            {'name': 'Basic Nail Art', 'description': 'Simple designs and patterns per nail', 'duration': 15, 'price': 5.00},
            {'name': 'Advanced Nail Art', 'description': 'Intricate designs with multiple colors and techniques', 'duration': 30, 'price': 15.00},
            {'name': 'Custom Design', 'description': 'Personalized artwork created just for you', 'duration': 45, 'price': 25.00},
            {'name': 'French Tips', 'description': 'Classic or modern French tip design', 'duration': 20, 'price': 10.00},
            {'name': 'Ombre Nails', 'description': 'Beautiful gradient color transition', 'duration': 30, 'price': 20.00},
            {'name': 'Chrome / Mirror Finish', 'description': 'Stunning metallic chrome effect', 'duration': 25, 'price': 18.00},
            {'name': '3D Nail Art', 'description': 'Dimensional designs with gems, flowers, and embellishments', 'duration': 40, 'price': 30.00},
        ]
    },
    {
        'name': 'Natural & Botanical Treatments',
        'description': 'Eco-inspired wellness treatments for healthy, beautiful nails',
        'focus': 'Nail health, wellness, and eco-inspired care',
        'icon': 'FaLeaf',
        'display_order': 6,
        'services': [
            {'name': 'Herbal Nail Treatment', 'description': 'Nourishing treatment with natural botanical extracts', 'duration': 40, 'price': 35.00},
            {'name': 'Cuticle Repair Treatment', 'description': 'Intensive cuticle nourishment and repair', 'duration': 30, 'price': 20.00},
            {'name': 'Paraffin Wax Treatment', 'description': 'Warm paraffin therapy for deep hydration', 'duration': 35, 'price': 25.00},
            {'name': 'Hydrating Hand & Foot Mask', 'description': 'Luxurious mask treatment for soft, supple skin', 'duration': 30, 'price': 22.00},
            {'name': 'Nail Repair (Single Nail)', 'description': 'Targeted repair for damaged or broken nails', 'duration': 15, 'price': 12.00},
        ]
    },
    {
        'name': 'Foot Care & Wellness',
        'description': 'Specialized foot treatments for health and relaxation',
        'focus': 'Specialized foot treatments',
        'icon': 'FaSpa',
        'display_order': 7,
        'services': [
            {'name': 'Callus Removal', 'description': 'Professional removal of rough, hardened skin', 'duration': 30, 'price': 25.00},
            {'name': 'Heel Repair Treatment', 'description': 'Intensive treatment for cracked, dry heels', 'duration': 40, 'price': 30.00},
            {'name': 'Anti-Fungal Treatment', 'description': 'Therapeutic treatment for nail fungus prevention', 'duration': 45, 'price': 35.00},
            {'name': 'Foot Scrub & Massage', 'description': 'Exfoliating scrub followed by relaxing massage', 'duration': 45, 'price': 40.00},
        ]
    },
]

print("Creating service categories and services...")

for cat_data in categories_data:
    # Create category
    services_data = cat_data.pop('services')
    category = ServiceCategory.objects.create(**cat_data)
    print(f"\nCreated category: {category.name}")
    
    # Create services for this category
    for idx, service_data in enumerate(services_data):
        service_data['category'] = category
        service_data['display_order'] = idx + 1
        service = Service.objects.create(**service_data)
        print(f"  - Created service: {service.name} (${service.price})")

print(f"\n✓ Successfully created {ServiceCategory.objects.count()} categories")
print(f"✓ Successfully created {Service.objects.count()} services")
