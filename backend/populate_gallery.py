#!/usr/bin/env python
"""
Script to populate gallery with sample nail art images.
Run this after placing your images in backend/media/gallery/
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'verdelle_nails.settings')
django.setup()

from api.models import GalleryImage, Service

def create_gallery_images():
    """Create gallery entries for nail art showcase"""
    
    # Sample gallery data - update with your actual image filenames
    gallery_data = [
        {
            'title': 'French Manicure Elegance',
            'description': 'Classic French manicure with a modern twist',
            'image': 'french_nails_1.jpg',
            'is_featured': True
        },
        {
            'title': 'Glitter Ombre Nails',
            'description': 'Beautiful gradient effect with gold glitter accents',
            'image': 'glitter_ombre.jpg',
            'is_featured': True
        },
        {
            'title': 'Floral Nail Art',
            'description': 'Hand-painted delicate flowers on nude base',
            'image': 'floral_art.jpg',
            'is_featured': True
        },
        {
            'title': 'Geometric Design',
            'description': 'Modern geometric patterns in pastel colors',
            'image': 'geometric_nails.jpg',
            'is_featured': False
        },
        {
            'title': 'Chrome Mirror Finish',
            'description': 'Stunning chrome mirror effect in silver',
            'image': 'chrome_nails.jpg',
            'is_featured': True
        },
        {
            'title': 'Matte Black Stiletto',
            'description': 'Bold matte black stiletto nails with gold accent',
            'image': 'matte_black.jpg',
            'is_featured': False
        },
        {
            'title': 'Pastel Rainbow',
            'description': 'Soft pastel rainbow ombre design',
            'image': 'pastel_rainbow.jpg',
            'is_featured': False
        },
        {
            'title': 'Marble Effect Nails',
            'description': 'Elegant white marble effect with gold veins',
            'image': 'marble_nails.jpg',
            'is_featured': True
        },
        {
            'title': 'Red Velvet Luxury',
            'description': 'Deep red velvet finish with crystal accents',
            'image': 'red_velvet.jpg',
            'is_featured': False
        },
        {
            'title': 'Tropical Paradise',
            'description': 'Vibrant tropical designs with palm leaves',
            'image': 'tropical_nails.jpg',
            'is_featured': False
        },
        {
            'title': 'Nude Minimalist',
            'description': 'Simple nude nails with delicate line art',
            'image': 'nude_minimal.jpg',
            'is_featured': False
        },
        {
            'title': 'Holographic Magic',
            'description': 'Holographic powder creating rainbow effect',
            'image': 'holographic.jpg',
            'is_featured': True
        },
    ]
    
    created_count = 0
    skipped_count = 0
    
    for data in gallery_data:
        # Check if image already exists
        if GalleryImage.objects.filter(title=data['title']).exists():
            print(f"⏭️  Skipping '{data['title']}' - already exists")
            skipped_count += 1
            continue
        
        # Create the gallery entry
        # Note: For actual images, place them in backend/media/gallery/ folder
        gallery_image = GalleryImage.objects.create(
            title=data['title'],
            description=data['description'],
            image=f"gallery/{data['image']}",  # Will reference gallery/filename.jpg
            is_featured=data['is_featured']
        )
        
        print(f"✅ Created: {data['title']}")
        created_count += 1
    
    print(f"\n{'='*50}")
    print(f"Gallery population complete!")
    print(f"Created: {created_count} images")
    print(f"Skipped: {skipped_count} images")
    print(f"{'='*50}")
    
    if created_count > 0:
        print(f"\n⚠️  IMPORTANT: Place your actual image files in:")
        print(f"   backend/media/gallery/")
        print(f"\nOr use Django admin to upload images:")
        print(f"   http://localhost:8000/admin/api/galleryimage/")

if __name__ == '__main__':
    print("Populating gallery with nail art images...")
    print("="*50)
    create_gallery_images()
