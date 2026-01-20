import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { appointmentsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const API_BASE = process.env.REACT_APP_API_URL;

const Booking = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const preselectedService = location.state?.service;
  
  const [categories, setCategories] = useState([]);
  const [bookingForSelf, setBookingForSelf] = useState(true);
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    service: preselectedService?.id || '',
    appointment_date: '',
    appointment_time: '',
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    fetchServiceCategories();
    
    // Auto-fill user details if logged in
    if (user) {
      setFormData(prev => ({
        ...prev,
        customer_name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username,
        customer_email: user.email || '',
        customer_phone: user.phone_number || '',
      }));
    }
  }, [user]);

  const fetchServiceCategories = async () => {
    try {
      const response = await fetch(`${API_BASE}/service-categories/`);
      const data = await response.json();
      setCategories(data.results || data);
    } catch (error) {
      console.error('Error fetching service categories:', error);
    }
  };

  // Flatten all services from all categories
  const allServices = categories.flatMap(cat => cat.services || []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleBookingTypeChange = (forSelf) => {
    setBookingForSelf(forSelf);
    
    if (forSelf && user) {
      // Auto-fill with user details
      setFormData(prev => ({
        ...prev,
        customer_name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username,
        customer_email: user.email || '',
        customer_phone: user.phone_number || '',
      }));
    } else {
      // Clear customer details for someone else
      setFormData(prev => ({
        ...prev,
        customer_name: '',
        customer_email: '',
        customer_phone: '',
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await appointmentsAPI.create(formData);
      const appointmentData = response.data;
      
      // Redirect to payment page with appointment details
      navigate('/payment', { 
        state: { 
          appointment: appointmentData
        } 
      });
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to book appointment. Please try again.',
      });
      setLoading(false);
    }
  };

  return (
    <BookingContainer>
      <Container>
        <BookingForm
          as={motion.form}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          onSubmit={handleSubmit}
        >
          {message.text && (
            <Message type={message.type}>
              {message.text}
            </Message>
          )}

          {user && (
            <BookingTypeSection>
              <BookingTypeLabel>Who is this appointment for?</BookingTypeLabel>
              <BookingTypeButtons>
                <BookingTypeButton
                  type="button"
                  active={bookingForSelf}
                  onClick={() => handleBookingTypeChange(true)}
                >
                  For Myself
                </BookingTypeButton>
                <BookingTypeButton
                  type="button"
                  active={!bookingForSelf}
                  onClick={() => handleBookingTypeChange(false)}
                >
                  For Someone Else
                </BookingTypeButton>
              </BookingTypeButtons>
              {!bookingForSelf && (
                <InfoText>Please enter the details of the person you're booking for</InfoText>
              )}
            </BookingTypeSection>
          )}

          <FormRow>
            <FormGroup>
              <Label>{bookingForSelf ? 'Full Name *' : 'Their Full Name *'}</Label>
              <Input
                type="text"
                name="customer_name"
                value={formData.customer_name}
                onChange={handleChange}
                required
                placeholder={bookingForSelf ? "Enter your name" : "Enter their name"}
              />
            </FormGroup>

            <FormGroup>
              <Label>{bookingForSelf ? 'Email *' : 'Their Email *'}</Label>
              <Input
                type="email"
                name="customer_email"
                value={formData.customer_email}
                onChange={handleChange}
                required
                placeholder={bookingForSelf ? "your@email.com" : "their@email.com"}
              />
            </FormGroup>
          </FormRow>

          <FormRow>
            <FormGroup>
              <Label>{bookingForSelf ? 'Phone Number *' : 'Their Phone Number *'}</Label>
              <Input
                type="tel"
                name="customer_phone"
                value={formData.customer_phone}
                onChange={handleChange}
                required
                placeholder={bookingForSelf ? "(555) 123-4567" : "Their phone number"}
              />
            </FormGroup>

            <FormGroup>
              <Label>Select Service *</Label>
              <Select
                name="service"
                value={formData.service}
                onChange={handleChange}
                required
              >
                <option value="">Choose a service</option>
                {categories.map((category) => (
                  <optgroup key={category.id} label={category.name}>
                    {category.services && category.services.map((service) => (
                      <option key={service.id} value={service.id}>
                        {service.name} - KES {parseFloat(service.price).toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ({service.duration} min)
                      </option>
                    ))}
                  </optgroup>
                ))}
              </Select>
              {preselectedService && (
                <SelectedServiceInfo>
                  Selected: {preselectedService.name}
                </SelectedServiceInfo>
              )}
            </FormGroup>
          </FormRow>

          <FormRow>
            <FormGroup>
              <Label>Appointment Date *</Label>
              <Input
                type="date"
                name="appointment_date"
                value={formData.appointment_date}
                onChange={handleChange}
                required
                min={new Date().toISOString().split('T')[0]}
              />
            </FormGroup>

            <FormGroup>
              <Label>Appointment Time *</Label>
              <Input
                type="time"
                name="appointment_time"
                value={formData.appointment_time}
                onChange={handleChange}
                required
              />
            </FormGroup>
          </FormRow>

          <FormGroup>
            <Label>Additional Notes</Label>
            <TextArea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Any special requests or preferences..."
              rows="4"
            />
          </FormGroup>

          <SubmitButton type="submit" disabled={loading}>
            {loading ? 'Booking...' : 'Book Appointment'}
          </SubmitButton>
        </BookingForm>
      </Container>
    </BookingContainer>
  );
};

const BookingContainer = styled.div`
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
  max-width: 800px;
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

const BookingForm = styled.form`
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

const FormRow = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: ${props => props.theme.spacing.lg};
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  font-weight: 500;
  margin-bottom: ${props => props.theme.spacing.xs};
  color: ${props => props.theme.colors.secondary};
`;

const Input = styled.input`
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  border: 2px solid ${props => props.theme.colors.border};
  border-radius: 8px;
  font-size: ${props => props.theme.fontSizes.medium};
  transition: border-color ${props => props.theme.transitions.fast};

  &:focus {
    border-color: ${props => props.theme.colors.primary};
  }
`;

const Select = styled.select`
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  border: 2px solid ${props => props.theme.colors.border};
  border-radius: 8px;
  font-size: ${props => props.theme.fontSizes.medium};
  transition: border-color ${props => props.theme.transitions.fast};
  background: ${props => props.theme.colors.white};
  cursor: pointer;

  &:focus {
    border-color: ${props => props.theme.colors.primary};
  }
`;

const TextArea = styled.textarea`
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  border: 2px solid ${props => props.theme.colors.border};
  border-radius: 8px;
  font-size: ${props => props.theme.fontSizes.medium};
  resize: vertical;
  transition: border-color ${props => props.theme.transitions.fast};

  &:focus {
    border-color: ${props => props.theme.colors.primary};
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
  margin-top: ${props => props.theme.spacing.lg};
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
`;

const SelectedServiceInfo = styled.div`
  margin-top: ${props => props.theme.spacing.xs};
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.sm};
  background: ${props => props.theme.colors.primary}22;
  color: ${props => props.theme.colors.primary};
  border-radius: 4px;
  font-size: ${props => props.theme.fontSizes.small};
  font-weight: 600;
`;

const BookingTypeSection = styled.div`
  margin-bottom: ${props => props.theme.spacing.xl};
  padding: ${props => props.theme.spacing.lg};
  background: ${props => props.theme.colors.primary}11;
  border-radius: 12px;
  border: 1px solid ${props => props.theme.colors.primary}33;
`;

const BookingTypeLabel = styled.div`
  font-weight: 600;
  font-size: ${props => props.theme.fontSizes.medium};
  color: ${props => props.theme.colors.secondary};
  margin-bottom: ${props => props.theme.spacing.md};
  text-align: center;
`;

const BookingTypeButtons = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.md};
  justify-content: center;
  margin-bottom: ${props => props.theme.spacing.sm};
`;

const BookingTypeButton = styled.button`
  flex: 1;
  max-width: 200px;
  padding: ${props => props.theme.spacing.md};
  background: ${props => props.active 
    ? props.theme.colors.primary 
    : props.theme.colors.white};
  color: ${props => props.active 
    ? props.theme.colors.white 
    : props.theme.colors.secondary};
  border: 2px solid ${props => props.theme.colors.primary};
  border-radius: 8px;
  font-weight: 600;
  font-size: ${props => props.theme.fontSizes.medium};
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${props => props.theme.shadows.medium};
    background: ${props => props.active 
      ? props.theme.colors.primary 
      : props.theme.colors.primary}11;
  }
`;

const InfoText = styled.p`
  font-size: ${props => props.theme.fontSizes.small};
  color: ${props => props.theme.colors.textLight};
  text-align: center;
  margin: 0;
  padding-top: ${props => props.theme.spacing.sm};
`;

export default Booking;
