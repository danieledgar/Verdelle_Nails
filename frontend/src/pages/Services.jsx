import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FaHandSparkles, FaShoePrints, FaShieldAlt, FaMagic, FaPaintBrush, FaLeaf, FaSpa, FaClock } from 'react-icons/fa';
import { servicesAPI } from '../services/api';

const API_BASE = process.env.REACT_APP_API_URL;

const Services = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchServiceCategories();
  }, []);

  const fetchServiceCategories = async () => {
    try {
      const response = await fetch(`${API_BASE}/service-categories/`);
      const data = await response.json();
      console.log('Categories data:', data); // Debug log
      setCategories(data.results || data);
    } catch (error) {
      console.error('Error fetching service categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const iconMap = {
    'FaHandSparkles': FaHandSparkles,
    'FaShoePrints': FaShoePrints,
    'FaShieldAlt': FaShieldAlt,
    'FaMagic': FaMagic,
    'FaPaintBrush': FaPaintBrush,
    'FaLeaf': FaLeaf,
    'FaSpa': FaSpa,
  };

  const getIcon = (iconName) => {
    const IconComponent = iconMap[iconName] || FaSpa;
    return <IconComponent />;
  };

  return (
    <ServicesContainer>
      <Container>
        {loading ? (
          <LoadingText>Loading services...</LoadingText>
        ) : categories.length === 0 ? (
          <EmptyState>
            <h3>No services available at the moment</h3>
            <p>Please check back later or contact us for more information.</p>
          </EmptyState>
        ) : (
          <>
            {categories.map((category, catIndex) => (
              <CategorySection
                key={category.id}
                as={motion.div}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: catIndex * 0.1 }}
              >
                <CategoryHeader>
                  <CategoryIcon>{getIcon(category.icon)}</CategoryIcon>
                  <CategoryInfo>
                    <CategoryTitle>{category.name}</CategoryTitle>
                    {category.focus && <CategoryFocus>{category.focus}</CategoryFocus>}
                    {category.description && <CategoryDescription>{category.description}</CategoryDescription>}
                  </CategoryInfo>
                </CategoryHeader>

                {/* Direct services under this category */}
                {category.services && category.services.length > 0 && (
                  <ServicesGrid>
                    {category.services.map((service, svcIndex) => (
                      <ServiceCard
                        key={service.id}
                        as={motion.div}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: catIndex * 0.1 + svcIndex * 0.05 }}
                        whileHover={{ y: -5, boxShadow: '0 8px 24px rgba(0,0,0,0.2)' }}
                      >
                        <ServiceContent>
                          <ServiceName>{service.name}</ServiceName>
                          {service.description && <ServiceDescription>{service.description}</ServiceDescription>}
                          
                          <ServiceDetails>
                            <DetailItem>
                              <FaClock />
                              <span>{service.duration} min</span>
                            </DetailItem>
                            <DetailItem>
                              <PriceTag>KES {parseFloat(service.price).toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</PriceTag>
                            </DetailItem>
                          </ServiceDetails>
                        </ServiceContent>

                        <BookButton onClick={() => navigate('/booking', { state: { service } })}>
                          Book Now
                        </BookButton>
                      </ServiceCard>
                    ))}
                  </ServicesGrid>
                )}

                {/* Subcategories with their services */}
                {category.subcategories && category.subcategories.length > 0 && (
                  <>
                    {category.subcategories.map((subcategory, subIndex) => (
                      <SubcategorySection key={subcategory.id || subIndex}>
                        <SubcategoryTitle>{subcategory.name}</SubcategoryTitle>
                        
                        {subcategory.services && subcategory.services.length > 0 && (
                          <ServicesGrid>
                            {subcategory.services.map((service, svcIndex) => (
                              <ServiceCard
                                key={service.id}
                                as={motion.div}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.3, delay: catIndex * 0.1 + subIndex * 0.05 + svcIndex * 0.05 }}
                                whileHover={{ y: -5, boxShadow: '0 8px 24px rgba(0,0,0,0.2)' }}
                              >
                                <ServiceContent>
                                  <ServiceName>{service.name}</ServiceName>
                                  {service.description && <ServiceDescription>{service.description}</ServiceDescription>}
                                  
                                  <ServiceDetails>
                                    <DetailItem>
                                      <FaClock />
                                      <span>{service.duration} min</span>
                                    </DetailItem>
                                    <DetailItem>
                                      <PriceTag>KES {parseFloat(service.price).toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</PriceTag>
                                    </DetailItem>
                                  </ServiceDetails>
                                </ServiceContent>

                                <BookButton onClick={() => navigate('/booking', { state: { service } })}>
                                  Book Now
                                </BookButton>
                              </ServiceCard>
                            ))}
                          </ServicesGrid>
                        )}
                      </SubcategorySection>
                    ))}
                  </>
                )}
              </CategorySection>
            ))}
          </>
        )}
      </Container>
    </ServicesContainer>
  );
};

const ServicesContainer = styled.div`
  min-height: calc(100vh - 180px);
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.background} 0%, ${({ theme }) => theme.colors.accent}11 100%);
`;

const Container = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacing.xxl} ${({ theme }) => theme.spacing.lg};
  padding-top: 120px;
  
  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    padding: ${({ theme }) => theme.spacing.xl} ${({ theme }) => theme.spacing.md};
    padding-top: 100px;
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    padding: ${({ theme }) => theme.spacing.lg} ${({ theme }) => theme.spacing.sm};
    padding-top: 90px;
  }
`;

const LoadingText = styled.div`
  text-align: center;
  font-size: ${({ theme }) => theme.fontSizes.large};
  color: ${({ theme }) => theme.colors.text};
  padding: ${({ theme }) => theme.spacing.xxl};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${({ theme }) => theme.spacing.xxl};
   
  h3 {
    font-family: ${({ theme }) => theme.fonts.heading};
    font-size: ${({ theme }) => theme.fontSizes.xlarge};
    color: ${({ theme }) => theme.colors.secondary};
    margin-bottom: ${({ theme }) => theme.spacing.md};
  }
   
  p {
    color: ${({ theme }) => theme.colors.textLight};
  }
`;

const CategorySection = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.xxl};
  background: ${({ theme }) => theme.colors.white};
  border-radius: 16px;
  padding: ${({ theme }) => theme.spacing.xl};
  box-shadow: ${({ theme }) => theme.shadows.medium};

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    padding: ${({ theme }) => theme.spacing.lg};
  }
`;

const CategoryHeader = styled.div`
  display: flex;
  align-items: flex-start;
  gap: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  padding-bottom: ${({ theme }) => theme.spacing.lg};
  border-bottom: 2px solid ${({ theme }) => theme.colors.primary};

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    flex-direction: column;
    text-align: center;
    align-items: center;
  }
`;

const CategoryIcon = styled.div`
  font-size: 60px;
  color: ${({ theme }) => theme.colors.primary};
  min-width: 80px;
  display: flex;
  align-items: center;
  justify-content: center;

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    font-size: 50px;
    min-width: auto;
  }
`;

const CategoryInfo = styled.div`
  flex: 1;
`;

const CategoryTitle = styled.h2`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: ${({ theme }) => theme.fontSizes.xxlarge};
  color: ${({ theme }) => theme.colors.secondary};
  margin-bottom: ${({ theme }) => theme.spacing.xs};

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    font-size: ${({ theme }) => theme.fontSizes.xlarge};
  }
`;

const CategoryFocus = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.medium};
  color: ${({ theme }) => theme.colors.primary};
  font-weight: 600;
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  font-style: italic;
`;

const CategoryDescription = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.medium};
  color: ${({ theme }) => theme.colors.text};
  line-height: 1.6;
`;

const SubcategorySection = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const SubcategoryTitle = styled.h3`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: ${({ theme }) => theme.fontSizes.xlarge};
  color: ${({ theme }) => theme.colors.secondary};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  padding-left: ${({ theme }) => theme.spacing.md};
  border-left: 4px solid ${({ theme }) => theme.colors.primary};
`;

const ServicesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    grid-template-columns: 1fr;
    gap: ${({ theme }) => theme.spacing.md};
  }
`;

const ServiceCard = styled.div`
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.white} 0%, ${({ theme }) => theme.colors.accent}08 100%);
  border-radius: 12px;
  padding: ${({ theme }) => theme.spacing.lg};
  border: 2px solid ${({ theme }) => theme.colors.border};
  transition: all ${({ theme }) => theme.transitions.medium};
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 220px;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    padding: ${({ theme }) => theme.spacing.md};
    min-height: 200px;
  }
`;

const ServiceContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const ServiceName = styled.h4`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: ${({ theme }) => theme.fontSizes.large};
  color: ${({ theme }) => theme.colors.secondary};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  font-weight: 600;
`;

const ServiceDescription = styled.p`
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.fontSizes.small};
  line-height: 1.6;
  margin-bottom: ${({ theme }) => theme.spacing.md};
  flex: 1;
`;

const ServiceDetails = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.sm} 0;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    flex-wrap: wrap;
  }
`;

const DetailItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  color: ${({ theme }) => theme.colors.textLight};
  font-size: ${({ theme }) => theme.fontSizes.small};
  font-weight: 600;

  svg {
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const PriceTag = styled.span`
  color: ${({ theme }) => theme.colors.primary};
  font-weight: 700;
  font-size: ${({ theme }) => theme.fontSizes.medium};
`;

const BookButton = styled.button`
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.primary} 0%, ${({ theme }) => theme.colors.accent} 100%);
  color: ${({ theme }) => theme.colors.white};
  border: none;
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
  border-radius: 8px;
  font-size: ${({ theme }) => theme.fontSizes.medium};
  font-weight: 600;
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.medium};
  width: 100%;
  margin-top: auto;

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.shadows.medium};
  }

  &:active {
    transform: translateY(0);
  }
`;

export default Services;
