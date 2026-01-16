import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { FaFacebook, FaInstagram, FaMapMarkerAlt, FaPhone, FaEnvelope } from 'react-icons/fa';

// X (Twitter) Icon Component
const XIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" style={{ width: '1em', height: '1em', fill: 'currentColor' }}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
  </svg>
);

const Footer = () => {
  return (
    <FooterContainer>
      <FooterContent>
        <FooterSection>
          <FooterTitle>Verdelle Nails</FooterTitle>
          <FooterText>
            Your destination for premium nail care and elegant nail art. 
            Experience luxury and relaxation.
          </FooterText>
          <SocialLinks>
            <SocialLink href="https://facebook.com" target="_blank" rel="noopener noreferrer">
              <FaFacebook />
            </SocialLink>
            <SocialLink href="https://instagram.com" target="_blank" rel="noopener noreferrer">
              <FaInstagram />
            </SocialLink>
            <SocialLink href="https://x.com" target="_blank" rel="noopener noreferrer">
              <XIcon />
            </SocialLink>
          </SocialLinks>
        </FooterSection>

        <FooterSection className="quick-links">
          <FooterTitle>Quick Links</FooterTitle>
          <FooterLinks>
            <FooterLink to="/services">Services</FooterLink>
            <FooterLink to="/gallery">Gallery</FooterLink>
            <FooterLink to="/booking">Book Appointment</FooterLink>
            <FooterLink to="/contact">Contact Us</FooterLink>
          </FooterLinks>
        </FooterSection>

        <FooterSection>
          <FooterTitle>Contact Info</FooterTitle>
          <ContactInfo>
            <ContactItem>
              <FaMapMarkerAlt />
              <span>123 Beauty Street, City, State 12345</span>
            </ContactItem>
            <ContactItem>
              <FaPhone />
              <span>(555) 123-4567</span>
            </ContactItem>
            <ContactItem>
              <FaEnvelope />
              <span>info@verdellenails.com</span>
            </ContactItem>
          </ContactInfo>
        </FooterSection>

        <FooterSection className="opening-hours">
          <FooterTitle>Opening Hours</FooterTitle>
          <OpeningHours>
            <HoursItem>
              <span>Monday - Friday</span>
              <span>9:00 AM - 7:00 PM</span>
            </HoursItem>
            <HoursItem>
              <span>Saturday</span>
              <span>10:00 AM - 6:00 PM</span>
            </HoursItem>
            <HoursItem>
              <span>Sunday</span>
              <span>Closed</span>
            </HoursItem>
          </OpeningHours>
        </FooterSection>
      </FooterContent>

      <FooterBottom>
        <p>&copy; 2026 Verdelle Nails. All rights reserved.</p>
      </FooterBottom>
    </FooterContainer>
  );
};

const FooterContainer = styled.footer`
  background: ${props => props.theme.colors.secondary};
  color: ${props => props.theme.colors.white};
  margin-top: ${props => props.theme.spacing.xl};
`;

const FooterContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: ${props => props.theme.spacing.lg} ${props => props.theme.spacing.md};
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: ${props => props.theme.spacing.lg};

  @media (max-width: ${props => props.theme.breakpoints.tablet}) {
    grid-template-columns: 1fr;
    gap: ${props => props.theme.spacing.md};
    padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.sm};
  }

  @media (max-width: 450px) {
    padding: ${props => props.theme.spacing.sm};
    gap: ${props => props.theme.spacing.sm};
  }
`;

const FooterSection = styled.div`
  @media (max-width: 450px) {
    &.quick-links,
    &.opening-hours {
      display: none;
    }
  }
`;

const FooterTitle = styled.h3`
  color: ${props => props.theme.colors.primary};
  margin-bottom: ${props => props.theme.spacing.sm};
  font-size: ${props => props.theme.fontSizes.medium};
`;

const FooterText = styled.p`
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.5;
  font-size: ${props => props.theme.fontSizes.small};
`;

const SocialLinks = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.sm};
  margin-top: ${props => props.theme.spacing.sm};
`;

const SocialLink = styled.a`
  width: 35px;
  height: 35px;
  border-radius: 50%;
  background: ${props => props.theme.colors.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${props => props.theme.fontSizes.medium};
  color: ${props => props.theme.colors.white};
  transition: all ${props => props.theme.transitions.medium};

  &:hover {
    background: ${props => props.theme.colors.accent};
    transform: translateY(-3px);
  }
`;

const FooterLinks = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.xs};
`;

const FooterLink = styled(Link)`
  color: rgba(255, 255, 255, 0.8);
  transition: color ${props => props.theme.transitions.fast};
  font-size: ${props => props.theme.fontSizes.small};

  &:hover {
    color: ${props => props.theme.colors.primary};
    padding-left: ${props => props.theme.spacing.xs};
  }
`;

const ContactInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.sm};
`;

const ContactItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
  color: rgba(255, 255, 255, 0.8);
  font-size: ${props => props.theme.fontSizes.small};

  svg {
    color: ${props => props.theme.colors.primary};
    font-size: ${props => props.theme.fontSizes.medium};
  }
`;

const OpeningHours = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.xs};
`;

const HoursItem = styled.div`
  display: flex;
  justify-content: space-between;
  color: rgba(255, 255, 255, 0.8);
  padding: ${props => props.theme.spacing.xs} 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  font-size: ${props => props.theme.fontSizes.small};

  span:first-child {
    font-weight: 500;
  }
`;

const FooterBottom = styled.div`
  text-align: center;
  padding: ${props => props.theme.spacing.md};
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.6);
  font-size: ${props => props.theme.fontSizes.small};
`;

export default Footer;
