import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

// Use environment variable or fallback to hardcoded URL
const API_BASE = process.env.REACT_APP_API_URL || 'https://verdellenails.up.railway.app/api';
// Add base URL for media files
const BACKEND_BASE = process.env.REACT_APP_BACKEND_URL || 'https://verdellenails.up.railway.app';

const Gallery = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    fetchGallery();
  }, []);

  // Function to convert relative URLs to absolute URLs
  const getAbsoluteImageUrl = (relativeUrl) => {
    if (!relativeUrl) return '';
    
    // If it's already an absolute URL, return it
    if (relativeUrl.startsWith('http://') || relativeUrl.startsWith('https://')) {
      return relativeUrl;
    }
    
    // If it starts with /media/, prepend the backend URL
    if (relativeUrl.startsWith('/media/')) {
      return `${BACKEND_BASE}${relativeUrl}`;
    }
    
    // If it's just a filename, construct the URL
    if (relativeUrl.includes('.')) {
      return `${BACKEND_BASE}/media/${relativeUrl}`;
    }
    
    return relativeUrl;
  };

  const fetchGallery = async () => {
    try {
      console.log('Fetching gallery from:', `${API_BASE}/gallery/`);
      const response = await fetch(`${API_BASE}/gallery/`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Gallery data:', data);
      
      // Process images to convert URLs to absolute
      const processedImages = (data.results || data).map(image => ({
        ...image,
        // Store original image URL for reference
        original_image: image.image,
        // Convert to absolute URL
        image: getAbsoluteImageUrl(image.image)
      }));
      
      setImages(processedImages);
    } catch (error) {
      console.error('Error fetching gallery:', error);
    } finally {
      setLoading(false);
    }
  };

  const openLightbox = (image) => {
    setSelectedImage(image);
  };

  const closeLightbox = () => {
    setSelectedImage(null);
  };

  return (
    <GalleryContainer>
      <Container>
        {loading ? (
          <LoadingText>Loading gallery...</LoadingText>
        ) : images.length === 0 ? (
          <EmptyState>
            <h3>No images available yet</h3>
            <p>Check back soon for our latest nail art creations!</p>
          </EmptyState>
        ) : (
          <GalleryGrid>
            {images.map((image, index) => (
              <GalleryItem
                key={image.id}
                as={motion.div}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                whileHover={{ scale: 1.05 }}
                onClick={() => openLightbox(image)}
              >
                <GalleryImage 
                  src={image.image} 
                  alt={image.title}
                  onError={(e) => {
                    console.error('Failed to load image:', image.image);
                    console.log('Original URL:', image.original_image);
                    // Show a placeholder if image fails to load
                    e.target.src = 'https://via.placeholder.com/400x400/FFC9C9/333333?text=Image+Not+Available';
                  }}
                />
                <GalleryOverlay>
                  <GalleryTitle>{image.title}</GalleryTitle>
                  {image.service_name && (
                    <GalleryService>{image.service_name}</GalleryService>
                  )}
                </GalleryOverlay>
              </GalleryItem>
            ))}
          </GalleryGrid>
        )}
      </Container>

      {selectedImage && (
        <Lightbox onClick={closeLightbox}>
          <LightboxContent onClick={(e) => e.stopPropagation()}>
            <CloseButton onClick={closeLightbox}>&times;</CloseButton>
            <LightboxImage 
              src={selectedImage.image} 
              alt={selectedImage.title}
              onError={(e) => {
                console.error('Failed to load lightbox image:', selectedImage.image);
                e.target.src = 'https://via.placeholder.com/600x400/FFC9C9/333333?text=Image+Not+Available';
              }}
            />
            <LightboxInfo>
              <h3>{selectedImage.title}</h3>
              {selectedImage.description && <p>{selectedImage.description}</p>}
              {selectedImage.service_name && (
                <ServiceTag>{selectedImage.service_name}</ServiceTag>
              )}
            </LightboxInfo>
          </LightboxContent>
        </Lightbox>
      )}
    </GalleryContainer>
  );
};

// All styled components remain exactly the same...
const GalleryContainer = styled.div`
  min-height: 100vh;
  padding-bottom: ${props => props.theme.spacing.xxl};
`;

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: ${props => props.theme.spacing.xxl} ${props => props.theme.spacing.lg};
  padding-top: 120px;

  @media (max-width: ${props => props.theme.breakpoints.tablet}) {
    padding: ${props => props.theme.spacing.xl} ${props => props.theme.spacing.md};
    padding-top: 100px;
  }

  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    padding: ${props => props.theme.spacing.lg} ${props => props.theme.spacing.sm};
    padding-top: 90px;
  }
`;

const GalleryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: ${props => props.theme.spacing.lg};

  @media (max-width: ${props => props.theme.breakpoints.desktop}) {
    grid-template-columns: repeat(3, 1fr);
  }

  @media (max-width: ${props => props.theme.breakpoints.tablet}) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 600px) {
    grid-template-columns: repeat(1, 1fr);
  }
  
  @media (max-width: 450px) {
    gap: ${props => props.theme.spacing.sm};
  }
`;

const GalleryItem = styled.div`
  position: relative;
  overflow: hidden;
  border-radius: 15px;
  cursor: pointer;
  aspect-ratio: 1;
  box-shadow: ${props => props.theme.shadows.medium};
`;

const GalleryImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform ${props => props.theme.transitions.medium};

  ${GalleryItem}:hover & {
    transform: scale(1.1);
  }
`;

const GalleryOverlay = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to top, rgba(0,0,0,0.8), transparent);
  padding: ${props => props.theme.spacing.lg};
  transform: translateY(100%);
  transition: transform ${props => props.theme.transitions.medium};

  ${GalleryItem}:hover & {
    transform: translateY(0);
  }
`;

const GalleryTitle = styled.h3`
  color: ${props => props.theme.colors.white};
  font-size: ${props => props.theme.fontSizes.large};
  margin-bottom: ${props => props.theme.spacing.xs};
`;

const GalleryService = styled.p`
  color: ${props => props.theme.colors.primary};
  font-size: ${props => props.theme.fontSizes.small};
`;

const Lightbox = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: ${props => props.theme.spacing.lg};
`;

const LightboxContent = styled.div`
  position: relative;
  max-width: 900px;
  max-height: 90vh;
  background: ${props => props.theme.colors.white};
  border-radius: 15px;
  overflow: hidden;
`;

const CloseButton = styled.button`
  position: absolute;
  top: ${props => props.theme.spacing.md};
  right: ${props => props.theme.spacing.md};
  background: ${props => props.theme.colors.white};
  width: 40px;
  height: 40px;
  border-radius: 50%;
  font-size: 2rem;
  line-height: 1;
  z-index: 1;
  color: ${props => props.theme.colors.secondary};

  &:hover {
    background: ${props => props.theme.colors.primary};
    color: ${props => props.theme.colors.white};
  }
`;

const LightboxImage = styled.img`
  width: 100%;
  max-height: 60vh;
  object-fit: contain;
`;

const LightboxInfo = styled.div`
  padding: ${props => props.theme.spacing.lg};

  h3 {
    margin-bottom: ${props => props.theme.spacing.sm};
  }

  p {
    color: ${props => props.theme.colors.textLight};
    margin-bottom: ${props => props.theme.spacing.md};
  }
`;

const ServiceTag = styled.span`
  display: inline-block;
  background: ${props => props.theme.colors.primary};
  color: ${props => props.theme.colors.white};
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.md};
  border-radius: 20px;
  font-size: ${props => props.theme.fontSizes.small};
`;

const LoadingText = styled.p`
  text-align: center;
  font-size: ${props => props.theme.fontSizes.large};
  color: ${props => props.theme.colors.textLight};
  padding: ${props => props.theme.spacing.xxl};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${props => props.theme.spacing.xxl};

  h3 {
    margin-bottom: ${props => props.theme.spacing.md};
  }

  p {
    color: ${props => props.theme.colors.textLight};
  }
`;

export default Gallery;