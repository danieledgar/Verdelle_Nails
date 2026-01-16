#!/usr/bin/env python
"""
Script to create gallery entries.
Upload images via Django Admin: http://localhost:8000/admin/api/galleryimage/
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'verdelle_nails.settings')
django.setup()

from api.models import GalleryImage

def create_gallery_entries():
    """Create gallery entries - images can be uploaded via admin"""
    
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
    
    for data in gallery_data:
        if GalleryImage.objects.filter(title=data['title']).exists():
            print(f"⏭️  Skipping '{data['title']}' - already exists")
            continue
        
        # Create entry with blank image - will upload via admin
        GalleryImage.objects.create(
            title=data['title'],
            description=data['description'],
            is_featured=data['featured'],
            image=''  # Empty - will be uploaded via admin
        )
        
        print(f"✅ Created: {data['title']}")
        created_count += 1
    
    print(f"\n{'='*60}")
    print(f"Gallery entries created: {created_count}")
    print(f"{'='*60}")
    print(f"\n📸 Next steps:")
    print(f"1. Go to: http://localhost:8000/admin/api/galleryimage/")
    print(f"2. Click on each entry and upload nail art images")
    print(f"3. Or use the first script (populate_gallery.py) if you have image files")

if __name__ == '__main__':
    print("Creating gallery entries...")
    print("="*60)
    create_gallery_entries()
