import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { galleryAPI } from '../services/api';

const API_BASE = process.env.REACT_APP_API_URL;

const Gallery = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    fetchGallery();
  }, []);

  const fetchGallery = async () => {
    try {
      const response = await galleryAPI.getAll();
      setImages(response.data.results || response.data);
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
                <GalleryImage src={image.image} alt={image.title} />
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
            <LightboxImage src={selectedImage.image} alt={selectedImage.title} />
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

const GalleryContainer = styled.div`
  min-height: 100vh;
  padding-bottom: ${props => props.theme.spacing.xxl};
`;

const PageHeader = styled.div`
  background: linear-gradient(135deg, rgba(201, 166, 132, 0.1) 0%, rgba(212, 175, 142, 0.1) 100%);
  padding: ${props => props.theme.spacing.xxl} ${props => props.theme.spacing.lg};
  text-align: center;
`;

const PageTitle = styled.h1`
  margin-bottom: ${props => props.theme.spacing.md};
`;

const PageSubtitle = styled.p`
  font-size: ${props => props.theme.fontSizes.large};
  color: ${props => props.theme.colors.textLight};
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
  }`;

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
