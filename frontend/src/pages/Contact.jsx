import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FaMapMarkerAlt, FaPhone, FaEnvelope, FaClock } from 'react-icons/fa';
import { contactAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Contact = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [responseMessage, setResponseMessage] = useState({ type: '', text: '' });

  // Pre-fill form with user data if logged in
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.username || '',
        email: user.email || '',
        phone: user.phone_number || '',
      }));
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResponseMessage({ type: '', text: '' });

    try {
      await contactAPI.send(formData);
      setResponseMessage({
        type: 'success',
        text: 'Thank you for your message! We\'ll get back to you soon.',
      });
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
      });
    } catch (error) {
      setResponseMessage({
        type: 'error',
        text: 'Failed to send message. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ContactContainer>
      <Container>
        <ContactGrid>
          <ContactInfo
            as={motion.div}
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <InfoTitle>Get in Touch</InfoTitle>
            <InfoText>
              Have questions or want to schedule an appointment? 
              Reach out to us and we'll respond as soon as possible.
            </InfoText>

            <InfoItems>
              <InfoItem>
                <InfoIcon><FaMapMarkerAlt /></InfoIcon>
                <InfoContent>
                  <InfoLabel>Address</InfoLabel>
                  <InfoValue>123 Beauty Street, City, State 12345</InfoValue>
                </InfoContent>
              </InfoItem>

              <InfoItem>
                <InfoIcon><FaPhone /></InfoIcon>
                <InfoContent>
                  <InfoLabel>Phone</InfoLabel>
                  <InfoValue>(555) 123-4567</InfoValue>
                </InfoContent>
              </InfoItem>

              <InfoItem>
                <InfoIcon><FaEnvelope /></InfoIcon>
                <InfoContent>
                  <InfoLabel>Email</InfoLabel>
                  <InfoValue>info@verdellenails.com</InfoValue>
                </InfoContent>
              </InfoItem>

              <InfoItem>
                <InfoIcon><FaClock /></InfoIcon>
                <InfoContent>
                  <InfoLabel>Hours</InfoLabel>
                  <InfoValue>
                    Mon-Fri: 9:00 AM - 7:00 PM<br />
                    Sat: 10:00 AM - 6:00 PM<br />
                    Sun: Closed
                  </InfoValue>
                </InfoContent>
              </InfoItem>
            </InfoItems>
          </ContactInfo>

          <ContactForm
            as={motion.form}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            onSubmit={handleSubmit}
          >
            {responseMessage.text && (
              <Message type={responseMessage.type}>
                {responseMessage.text}
              </Message>
            )}

            <FormGroup>
              <Label>Name</Label>
              <Input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Your name"
                disabled={!!user}
              />
            </FormGroup>

            <FormGroup>
              <Label>Email</Label>
              <Input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="your@email.com"
                disabled={!!user}
              />
            </FormGroup>

            <FormGroup>
              <Label>Phone</Label>
              <Input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="(555) 123-4567"
                disabled={!!user}
              />
            </FormGroup>

            <FormGroup>
              <Label>Subject *</Label>
              <Input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required
                placeholder="How can we help?"
              />
            </FormGroup>

            <FormGroup>
              <Label>Message *</Label>
              <TextArea
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                placeholder="Your message..."
                rows="6"
              />
            </FormGroup>

            <SubmitButton type="submit" disabled={loading}>
              {loading ? 'Sending...' : 'Send Message'}
            </SubmitButton>
          </ContactForm>
        </ContactGrid>
      </Container>
    </ContactContainer>
  );
};

const ContactContainer = styled.div`
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
  }`;

const ContactGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${props => props.theme.spacing.xxl};

  @media (max-width: ${props => props.theme.breakpoints.desktop}) {
    grid-template-columns: 1fr;
    gap: ${props => props.theme.spacing.xl};
  }
`;

const ContactInfo = styled.div`
  background: ${props => props.theme.colors.white};
  padding: ${props => props.theme.spacing.xl};
  border-radius: 15px;
  box-shadow: ${props => props.theme.shadows.medium};

  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    padding: ${props => props.theme.spacing.md};
  }

  @media (max-width: 450px) {
    padding: ${props => props.theme.spacing.sm};
    border-radius: 10px;
  }
`;

const InfoTitle = styled.h2`
  margin-bottom: ${props => props.theme.spacing.md};
  color: ${props => props.theme.colors.secondary};
`;

const InfoText = styled.p`
  color: ${props => props.theme.colors.textLight};
  line-height: 1.8;
  margin-bottom: ${props => props.theme.spacing.xl};
`;

const InfoItems = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.lg};
`;

const InfoItem = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.md};

  @media (max-width: 450px) {
    gap: ${props => props.theme.spacing.sm};
  }
`;

const InfoIcon = styled.div`
  width: 50px;
  height: 50px;
  background: linear-gradient(135deg, ${props => props.theme.colors.primary}, ${props => props.theme.colors.accent});
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.theme.colors.white};
  font-size: ${props => props.theme.fontSizes.large};
  flex-shrink: 0;

  @media (max-width: 450px) {
    width: 40px;
    height: 40px;
    font-size: ${props => props.theme.fontSizes.medium};
  }
`;

const InfoContent = styled.div`
  flex: 1;
`;

const InfoLabel = styled.div`
  font-weight: 600;
  color: ${props => props.theme.colors.secondary};
  margin-bottom: ${props => props.theme.spacing.xs};

  @media (max-width: 450px) {
    font-size: ${props => props.theme.fontSizes.small};
  }
`;

const InfoValue = styled.div`
  color: ${props => props.theme.colors.textLight};
  line-height: 1.6;
`;

const ContactForm = styled.form`
  background: ${props => props.theme.colors.white};
  padding: ${props => props.theme.spacing.xl};
  border-radius: 15px;
  box-shadow: ${props => props.theme.shadows.medium};

  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    padding: ${props => props.theme.spacing.md};
  }

  @media (max-width: 450px) {
    padding: ${props => props.theme.spacing.sm};
    border-radius: 10px;
  }
`;

const Message = styled.div`
  padding: ${props => props.theme.spacing.md};
  border-radius: 8px;
  margin-bottom: ${props => props.theme.spacing.lg};
  background: ${props => props.type === 'success' 
    ? 'rgba(76, 175, 80, 0.1)' 
    : 'rgba(244, 67, 54, 0.1)'};
  color: ${props => props.type === 'success' 
    ? props.theme.colors.success 
    : props.theme.colors.error};
  border: 1px solid ${props => props.type === 'success' 
    ? props.theme.colors.success 
    : props.theme.colors.error};
`;

const FormGroup = styled.div`
  margin-bottom: ${props => props.theme.spacing.lg};

  @media (max-width: 450px) {
    margin-bottom: ${props => props.theme.spacing.md};
  }
`;

const Label = styled.label`
  display: block;
  font-weight: 500;
  margin-bottom: ${props => props.theme.spacing.xs};
  color: ${props => props.theme.colors.secondary};
`;

const Input = styled.input`
  width: 100%;
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  border: 2px solid ${props => props.theme.colors.border};
  border-radius: 8px;
  font-size: ${props => props.theme.fontSizes.medium};
  transition: border-color ${props => props.theme.transitions.fast};
  box-sizing: border-box;

  &:focus {
    border-color: ${props => props.theme.colors.primary};
  }

  @media (max-width: 450px) {
    padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.sm};
    font-size: ${props => props.theme.fontSizes.small};
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  border: 2px solid ${props => props.theme.colors.border};
  border-radius: 8px;
  font-size: ${props => props.theme.fontSizes.medium};
  resize: vertical;
  transition: border-color ${props => props.theme.transitions.fast};
  box-sizing: border-box;

  &:focus {
    border-color: ${props => props.theme.colors.primary};
  }

  @media (max-width: 450px) {
    padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.sm};
    font-size: ${props => props.theme.fontSizes.small};
  }
`;

const SubmitButton = styled.button`
  width: 100%;
  padding: ${props => props.theme.spacing.md};
  background: ${props => props.theme.colors.primary};
  color: ${props => props.theme.colors.white};
  font-size: ${props => props.theme.fontSizes.large};
  font-weight: 600;
  border-radius: 30px;
  transition: all ${props => props.theme.transitions.medium};

  &:hover:not(:disabled) {
    background: ${props => props.theme.colors.accent};
    transform: translateY(-2px);
    box-shadow: ${props => props.theme.shadows.large};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    &:hover:not(:disabled) {
      transform: none;
    }
  }

  @media (max-width: 450px) {
    padding: ${props => props.theme.spacing.sm};
    font-size: ${props => props.theme.fontSizes.medium};
  }
`;

export default Contact;
