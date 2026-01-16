import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaStar, FaCalendarAlt, FaAward } from 'react-icons/fa';

const Home = () => {
  return (
    <HomeContainer>
      <HeroSection>
        <HeroContent
          as={motion.div}
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <HeroTitle>Welcome to Verdelle Nails</HeroTitle>
          <HeroSubtitle>Premium Nail Care & Elegant Nail Art</HeroSubtitle>
          <HeroText>
            Experience luxury and relaxation at our premium nail salon. 
            We provide exceptional nail care services with attention to every detail.
          </HeroText>
          <HeroButtons>
            <PrimaryButton to="/booking">Book Appointment</PrimaryButton>
            <SecondaryButton to="/services">View Services</SecondaryButton>
          </HeroButtons>
        </HeroContent>
      </HeroSection>

      <FeaturesSection>
        <Container>
          <SectionTitle>Why Choose Verdelle Nails</SectionTitle>
          <FeaturesGrid>
            <FeatureCard
              as={motion.div}
              whileHover={{ y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <FeatureIcon><FaStar /></FeatureIcon>
              <FeatureTitle>Premium Quality</FeatureTitle>
              <FeatureText>
                We use only the finest products and techniques to ensure 
                exceptional results every time.
              </FeatureText>
            </FeatureCard>

            <FeatureCard
              as={motion.div}
              whileHover={{ y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <FeatureIcon><FaCalendarAlt /></FeatureIcon>
              <FeatureTitle>Easy Booking</FeatureTitle>
              <FeatureText>
                Book your appointment online 24/7 with our convenient 
                scheduling system.
              </FeatureText>
            </FeatureCard>

            <FeatureCard
              as={motion.div}
              whileHover={{ y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <FeatureIcon><FaAward /></FeatureIcon>
              <FeatureTitle>Expert Staff</FeatureTitle>
              <FeatureText>
                Our certified nail technicians are highly skilled and 
                passionate about their craft.
              </FeatureText>
            </FeatureCard>
          </FeaturesGrid>
        </Container>
      </FeaturesSection>

      <CTASection>
        <CTAContent
          as={motion.div}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <CTATitle>Ready for a Luxurious Experience?</CTATitle>
          <CTAText>Book your appointment today and let us pamper you</CTAText>
          <PrimaryButton to="/booking">Book Now</PrimaryButton>
        </CTAContent>
      </CTASection>
    </HomeContainer>
  );
};

const HomeContainer = styled.div`
  min-height: 100vh;
`;

const HeroSection = styled.section`
  background: linear-gradient(135deg, rgba(201, 166, 132, 0.1) 0%, rgba(212, 175, 142, 0.1) 100%);
  padding: ${props => props.theme.spacing.xxl} ${props => props.theme.spacing.lg};
  min-height: 600px;
  display: flex;
  align-items: center;
  justify-content: center;

  @media (max-width: ${props => props.theme.breakpoints.tablet}) {
    padding: ${props => props.theme.spacing.xl} ${props => props.theme.spacing.md};
    min-height: 500px;
  }
`;

const HeroContent = styled.div`
  text-align: center;
  max-width: 800px;
`;

const HeroTitle = styled.h1`
  font-size: 3.5rem;
  margin-bottom: ${props => props.theme.spacing.md};
  color: ${props => props.theme.colors.secondary};

  @media (max-width: ${props => props.theme.breakpoints.tablet}) {
    font-size: 2.5rem;
  }
`;

const HeroSubtitle = styled.h2`
  font-size: ${props => props.theme.fontSizes.xlarge};
  color: ${props => props.theme.colors.primary};
  margin-bottom: ${props => props.theme.spacing.lg};
  font-weight: 400;
`;

const HeroText = styled.p`
  font-size: ${props => props.theme.fontSizes.large};
  color: ${props => props.theme.colors.textLight};
  margin-bottom: ${props => props.theme.spacing.xl};
  line-height: 1.8;
`;

const HeroButtons = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.md};
  justify-content: center;
  flex-wrap: wrap;
`;

const PrimaryButton = styled(Link)`
  background: ${props => props.theme.colors.primary};
  color: ${props => props.theme.colors.white};
  padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.xl};
  border-radius: 30px;
  font-weight: 500;
  font-size: ${props => props.theme.fontSizes.medium};
  transition: all ${props => props.theme.transitions.medium};
  display: inline-block;

  &:hover {
    background: ${props => props.theme.colors.accent};
    transform: translateY(-2px);
    box-shadow: ${props => props.theme.shadows.large};
  }
`;

const SecondaryButton = styled(Link)`
  background: transparent;
  color: ${props => props.theme.colors.primary};
  padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.xl};
  border: 2px solid ${props => props.theme.colors.primary};
  border-radius: 30px;
  font-weight: 500;
  font-size: ${props => props.theme.fontSizes.medium};
  transition: all ${props => props.theme.transitions.medium};
  display: inline-block;

  &:hover {
    background: ${props => props.theme.colors.primary};
    color: ${props => props.theme.colors.white};
    transform: translateY(-2px);
  }
`;

const FeaturesSection = styled.section`
  padding: ${props => props.theme.spacing.xxl} ${props => props.theme.spacing.lg};
`;

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const SectionTitle = styled.h2`
  text-align: center;
  margin-bottom: ${props => props.theme.spacing.xl};
  color: ${props => props.theme.colors.secondary};
`;

const FeaturesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: ${props => props.theme.spacing.xl};

  @media (max-width: ${props => props.theme.breakpoints.tablet}) {
    grid-template-columns: 1fr;
  }
`;

const FeatureCard = styled.div`
  background: ${props => props.theme.colors.white};
  padding: ${props => props.theme.spacing.xl};
  border-radius: 15px;
  box-shadow: ${props => props.theme.shadows.medium};
  text-align: center;
  transition: all ${props => props.theme.transitions.medium};
`;

const FeatureIcon = styled.div`
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, ${props => props.theme.colors.primary}, ${props => props.theme.colors.accent});
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto ${props => props.theme.spacing.lg};
  font-size: 2rem;
  color: ${props => props.theme.colors.white};
`;

const FeatureTitle = styled.h3`
  margin-bottom: ${props => props.theme.spacing.md};
  color: ${props => props.theme.colors.secondary};
`;

const FeatureText = styled.p`
  color: ${props => props.theme.colors.textLight};
  line-height: 1.8;
`;

const CTASection = styled.section`
  background: linear-gradient(135deg, ${props => props.theme.colors.primary}, ${props => props.theme.colors.accent});
  padding: ${props => props.theme.spacing.xxl} ${props => props.theme.spacing.lg};
  text-align: center;
`;

const CTAContent = styled.div`
  max-width: 800px;
  margin: 0 auto;
`;

const CTATitle = styled.h2`
  color: ${props => props.theme.colors.white};
  margin-bottom: ${props => props.theme.spacing.md};
`;

const CTAText = styled.p`
  color: ${props => props.theme.colors.white};
  font-size: ${props => props.theme.fontSizes.large};
  margin-bottom: ${props => props.theme.spacing.xl};
`;

export default Home;
