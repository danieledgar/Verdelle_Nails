#!/usr/bin/env python
"""
Script to populate gallery with placeholder nail art images.
This uses URLs to placeholder images until you add real photos.
"""
import os
import django
import requests
from io import BytesIO
from django.core.files.base import ContentFile

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'verdelle_nails.settings')
django.setup()

from api.models import GalleryImage, Service

def download_placeholder_image(width=600, height=600, text="Nails"):
    """Download a placeholder image"""
    try:
        # Using picsum.photos for random images
        url = f"https://picsum.photos/{width}/{height}"
        response = requests.get(url, timeout=10)
        if response.status_code == 200:
            return ContentFile(response.content)
    except Exception as e:
        print(f"Error downloading image: {e}")
    return None

def create_gallery_with_placeholders():
    """Create gallery entries with placeholder images"""
    
    gallery_data = [
        {'title': 'French Manicure Elegance', 'description': 'Classic French manicure with a modern twist', 'featured': True},
        {'title': 'Glitter Ombre Nails', 'description': 'Beautiful gradient effect with gold glitter accents', 'featured': True},
        {'title': 'Floral Nail Art', 'description': 'Hand-painted delicate flowers on nude base', 'featured': True},
        {'title': 'Geometric Design', 'description': 'Modern geometric patterns in pastel colors', 'featured': False},
        {'title': 'Chrome Mirror Finish', 'description': 'Stunning chrome mirror effect in silver', 'featured': True},
        {'title': 'Matte Black Stiletto', 'description': 'Bold matte black stiletto nails with gold accent', 'featured': False},
        {'title': 'Pastel Rainbow', 'description': 'Soft pastel rainbow ombre design', 'featured': False},
        {'title': 'Marble Effect Nails', 'description': 'Elegant white marble effect with gold veins', 'featured': True},
        {'title': 'Red Velvet Luxury', 'description': 'Deep red velvet finish with crystal accents', 'featured': False},
        {'title': 'Tropical Paradise', 'description': 'Vibrant tropical designs with palm leaves', 'featured': False},
        {'title': 'Nude Minimalist', 'description': 'Simple nude nails with delicate line art', 'featured': False},
        {'title': 'Holographic Magic', 'description': 'Holographic powder creating rainbow effect', 'featured': True},
    ]
    
    created_count = 0
    
    for idx, data in enumerate(gallery_data, 1):
        if GalleryImage.objects.filter(title=data['title']).exists():
            print(f"⏭️  Skipping '{data['title']}' - already exists")
            continue
        
        print(f"📸 Creating: {data['title']}...")
        
        # Download placeholder image
        image_content = download_placeholder_image()
        
        if image_content:
            gallery_image = GalleryImage.objects.create(
                title=data['title'],
                description=data['description'],
                is_featured=data['featured']
            )
            
            # Save the image
            filename = f"nail_art_{idx}.jpg"
            gallery_image.image.save(filename, image_content, save=True)
            
            print(f"✅ Created: {data['title']}")
            created_count += 1
        else:
            print(f"❌ Failed to create: {data['title']}")
    
    print(f"\n{'='*50}")
    print(f"Gallery population complete!")
    print(f"Created: {created_count} images")
    print(f"{'='*50}")
    print(f"\n💡 TIP: Replace placeholder images with real nail art photos via:")
    print(f"   Django Admin: http://localhost:8000/admin/api/galleryimage/")

if __name__ == '__main__':
    print("Populating gallery with placeholder images...")
    print("="*50)
    create_gallery_with_placeholders()
