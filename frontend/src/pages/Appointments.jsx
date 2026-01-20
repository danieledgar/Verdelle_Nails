import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FaCalendarAlt, FaClock, FaCheckCircle, FaTimesCircle, FaHourglassHalf, FaMoneyBillWave, FaReceipt, FaPrint, FaStar, FaStarHalfAlt } from 'react-icons/fa';

const API_BASE = process.env.REACT_APP_API_URL;

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showReceipt, setShowReceipt] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewAppointment, setReviewAppointment] = useState(null);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const navigate = useNavigate();
  const receiptRef = useRef();

  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo({ top: 0, behavior: 'smooth' });
    fetchAppointments();
    
    // Add print styles
    const style = document.createElement('style');
    style.innerHTML = `
      @media print {
        @page {
          size: A4;
          margin: 10mm;
        }
        body * {
          visibility: hidden;
        }
        .print-receipt, .print-receipt * {
          visibility: visible;
        }
        .print-receipt {
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
          page-break-after: avoid;
          page-break-inside: avoid;
        }
        .no-print {
          display: none !important;
        }
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const fetchAppointments = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('Fetching from:', `${API_BASE}/appointments/`); // Debug log
      const response = await fetch(`${API_BASE}/appointments/`, {
        headers: {
          'Authorization': `Token ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      const appointmentsList = data.results || data;
      // Sort by appointment date and time, most recent first
      const sorted = appointmentsList.sort((a, b) => {
        const dateA = new Date(`${a.appointment_date}T${a.appointment_time}`);
        const dateB = new Date(`${b.appointment_date}T${b.appointment_time}`);
        return dateB - dateA;
      });
      setAppointments(sorted);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed':
        return <FaCheckCircle color="#28a745" />;
      case 'completed':
        return <FaCheckCircle color="#007bff" />;
      case 'cancelled':
        return <FaTimesCircle color="#dc3545" />;
      default:
        return <FaHourglassHalf color="#ffc107" />;
    }
  };

  const getPaymentStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <FaCheckCircle color="#28a745" />;
      case 'failed':
        return <FaTimesCircle color="#dc3545" />;
      case 'initiated':
        return <FaHourglassHalf color="#ffc107" />;
      default:
        return <FaHourglassHalf color="#6c757d" />;
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const handlePrintReceipt = (appointment) => {
    setSelectedAppointment(appointment);
    setShowReceipt(true);
    // Update document title for print
    const originalTitle = document.title;
    document.title = 'Verdelle Nails - Receipt';
    setTimeout(() => {
      window.print();
      document.title = originalTitle;
    }, 100);
  };

  const closeReceipt = () => {
    setShowReceipt(false);
    setSelectedAppointment(null);
  };

  const handleReviewPrompt = (appointment) => {
    setReviewAppointment(appointment);
    setShowReviewModal(true);
    setRating(0);
    setHoverRating(0);
    setReviewComment('');
  };

  const closeReviewModal = () => {
    setShowReviewModal(false);
    setReviewAppointment(null);
    setRating(0);
    setHoverRating(0);
    setReviewComment('');
  };

  const handleSubmitReview = async () => {
    if (!rating || !reviewComment.trim()) {
      alert('Please provide both a rating and a comment for your review.');
      return;
    }

    setSubmittingReview(true);
    try {
      const token = localStorage.getItem('token');
      console.log('Submitting review to:', `${API_BASE}/reviews/`); // Debug log
      const response = await fetch(`${API_BASE}/reviews/`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customer_name: reviewAppointment.customer_name,
          rating: rating,
          comment: reviewComment,
          service: reviewAppointment.service,
          appointment: reviewAppointment.id,
        }),
      });

      if (response.ok) {
        alert('Thank you for your review! It will be published after approval.');
        closeReviewModal();
        fetchAppointments(); // Refresh to update review status
      } else {
        const errorData = await response.json();
        alert(`Failed to submit review: ${JSON.stringify(errorData)}`);
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Failed to submit review. Please try again.');
    } finally {
      setSubmittingReview(false);
    }
  };

  // Lock body scroll when modals are open
  useEffect(() => {
    if (showReceipt || showReviewModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showReceipt, showReviewModal]);

  return (
    <AppointmentsContainer>
      <Container>
        {loading ? (
          <LoadingText>Loading appointments...</LoadingText>
        ) : appointments.length === 0 ? (
          <EmptyState>
            <EmptyIcon>
              <FaCalendarAlt size={60} />
            </EmptyIcon>
            <EmptyTitle>No Appointments Yet</EmptyTitle>
            <EmptyText>You haven't booked any appointments. Start your journey to beautiful nails!</EmptyText>
            <BookButton onClick={() => navigate('/booking')}>
              Book an Appointment
            </BookButton>
          </EmptyState>
        ) : (
          <AppointmentsGrid>
            {appointments.map((appointment, index) => (
              <AppointmentCard
                key={appointment.id}
                as={motion.div}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <CardHeader>
                  <ServiceName>{appointment.service_name}</ServiceName>
                  <StatusBadge status={appointment.status}>
                    {getStatusIcon(appointment.status)}
                    <span>{appointment.status}</span>
                  </StatusBadge>
                </CardHeader>

                <AppointmentDetails>
                  <DetailRow>
                    <DetailLabel>
                      <FaCalendarAlt />
                      Date
                    </DetailLabel>
                    <DetailValue>{formatDate(appointment.appointment_date)}</DetailValue>
                  </DetailRow>

                  <DetailRow>
                    <DetailLabel>
                      <FaClock />
                      Time
                    </DetailLabel>
                    <DetailValue>{formatTime(appointment.appointment_time)}</DetailValue>
                  </DetailRow>

                  <DetailRow>
                    <DetailLabel>
                      <FaMoneyBillWave />
                      Amount
                    </DetailLabel>
                    <DetailValue>KES {parseFloat(appointment.service_price).toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</DetailValue>
                  </DetailRow>

                  <PaymentSection>
                    <PaymentStatus status={appointment.payment_status}>
                      {getPaymentStatusIcon(appointment.payment_status)}
                      <PaymentText>
                        Payment: <strong>{appointment.payment_status}</strong>
                      </PaymentText>
                    </PaymentStatus>
                    
                    {appointment.mpesa_transaction_id && (
                      <ReceiptInfo>
                        <FaReceipt />
                        <span>Receipt: {appointment.mpesa_transaction_id}</span>
                      </ReceiptInfo>
                    )}
                    
                    {appointment.payment_date && (
                      <PaymentDate>
                        Paid on: {formatDate(appointment.payment_date)}
                      </PaymentDate>
                    )}
                  </PaymentSection>

                  {appointment.notes && (
                    <NotesSection>
                      <NotesLabel>Notes:</NotesLabel>
                      <NotesText>{appointment.notes}</NotesText>
                    </NotesSection>
                  )}
                </AppointmentDetails>

                {appointment.payment_status !== 'completed' && appointment.status !== 'cancelled' && (
                  <CardFooter>
                    <PayNowButton onClick={() => navigate('/payment', { state: { appointment } })}>
                      Complete Payment
                    </PayNowButton>
                  </CardFooter>
                )}

                {appointment.payment_status === 'completed' && appointment.status === 'completed' && (
                  <CardFooter>
                    <PrintButton onClick={() => handlePrintReceipt(appointment)}>
                      <FaPrint /> Print Receipt
                    </PrintButton>
                    <ReviewButton onClick={() => handleReviewPrompt(appointment)}>
                      <FaStar /> Write a Review
                    </ReviewButton>
                  </CardFooter>
                )}

                {appointment.payment_status === 'completed' && appointment.status === 'confirmed' && (
                  <CardFooter>
                    <PrintButton onClick={() => handlePrintReceipt(appointment)}>
                      <FaPrint /> Print Receipt
                    </PrintButton>
                  </CardFooter>
                )}
              </AppointmentCard>
            ))}
          </AppointmentsGrid>
        )}

        {!loading && appointments.length > 0 && (
          <BottomActions>
            <BookButton onClick={() => navigate('/booking')}>
              Book Another Appointment
            </BookButton>
          </BottomActions>
        )}
      </Container>

      {showReceipt && selectedAppointment && (
        <ReceiptModal ref={receiptRef}>
          <ReceiptContent className="print-receipt">
            <ReceiptHeader>
              <BusinessName>Verdelle Nails</BusinessName>
              <BusinessTagline>Elegance at your fingertips</BusinessTagline>
              <ReceiptTitle>PAYMENT RECEIPT</ReceiptTitle>
            </ReceiptHeader>

            <ReceiptBody>
              <ReceiptSection>
                <SectionTitle>Appointment Details</SectionTitle>
                <ReceiptRow>
                  <ReceiptLabel>Receipt No:</ReceiptLabel>
                  <ReceiptValue>{selectedAppointment.mpesa_transaction_id}</ReceiptValue>
                </ReceiptRow>
                <ReceiptRow>
                  <ReceiptLabel>Appointment ID:</ReceiptLabel>
                  <ReceiptValue>#{selectedAppointment.id}</ReceiptValue>
                </ReceiptRow>
                <ReceiptRow>
                  <ReceiptLabel>Service:</ReceiptLabel>
                  <ReceiptValue>{selectedAppointment.service_name}</ReceiptValue>
                </ReceiptRow>
                <ReceiptRow>
                  <ReceiptLabel>Date:</ReceiptLabel>
                  <ReceiptValue>{formatDate(selectedAppointment.appointment_date)}</ReceiptValue>
                </ReceiptRow>
                <ReceiptRow>
                  <ReceiptLabel>Time:</ReceiptLabel>
                  <ReceiptValue>{formatTime(selectedAppointment.appointment_time)}</ReceiptValue>
                </ReceiptRow>
              </ReceiptSection>

              <ReceiptSection>
                <SectionTitle>Customer Details</SectionTitle>
                <ReceiptRow>
                  <ReceiptLabel>Name:</ReceiptLabel>
                  <ReceiptValue>{selectedAppointment.customer_name}</ReceiptValue>
                </ReceiptRow>
                <ReceiptRow>
                  <ReceiptLabel>Email:</ReceiptLabel>
                  <ReceiptValue>{selectedAppointment.customer_email}</ReceiptValue>
                </ReceiptRow>
                <ReceiptRow>
                  <ReceiptLabel>Phone:</ReceiptLabel>
                  <ReceiptValue>{selectedAppointment.customer_phone}</ReceiptValue>
                </ReceiptRow>
              </ReceiptSection>

              <ReceiptSection>
                <SectionTitle>Payment Information</SectionTitle>
                <ReceiptRow>
                  <ReceiptLabel>M-Pesa Receipt:</ReceiptLabel>
                  <ReceiptValue>{selectedAppointment.mpesa_transaction_id}</ReceiptValue>
                </ReceiptRow>
                <ReceiptRow>
                  <ReceiptLabel>Payment Phone:</ReceiptLabel>
                  <ReceiptValue>{selectedAppointment.payment_phone}</ReceiptValue>
                </ReceiptRow>
                <ReceiptRow>
                  <ReceiptLabel>Payment Date:</ReceiptLabel>
                  <ReceiptValue>{formatDate(selectedAppointment.payment_date)}</ReceiptValue>
                </ReceiptRow>
                <ReceiptRow>
                  <ReceiptLabel>Status:</ReceiptLabel>
                  <ReceiptValue style={{ color: '#28a745', fontWeight: 'bold' }}>PAID</ReceiptValue>
                </ReceiptRow>
              </ReceiptSection>

              <ReceiptTotal>
                <TotalLabel>Total Amount Paid</TotalLabel>
                <TotalValue>KES {parseFloat(selectedAppointment.amount_paid || selectedAppointment.service_price).toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TotalValue>
              </ReceiptTotal>

              <ReceiptFooter>
                <FooterText>Thank you for choosing Verdelle Nails!</FooterText>
                <FooterText>For inquiries, contact us at info@verdellenails.com</FooterText>
                <PrintDate>Printed on: {new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}</PrintDate>
              </ReceiptFooter>
            </ReceiptBody>

            <CloseReceiptButton onClick={closeReceipt} className="no-print">
              Close
            </CloseReceiptButton>
          </ReceiptContent>
        </ReceiptModal>
      )}

      {showReviewModal && reviewAppointment && (
        <ReviewModal onClick={closeReviewModal}>
          <ReviewContent onClick={(e) => e.stopPropagation()}>
            <ReviewHeader>
              <h2>Rate Your Experience</h2>
              <p>How was your {reviewAppointment.service_name} service?</p>
            </ReviewHeader>

            <ReviewBody>
              <RatingSection>
                <RatingLabel>Your Rating</RatingLabel>
                <StarRating>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      filled={star <= (hoverRating || rating)}
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                    >
                      <FaStar />
                    </Star>
                  ))}
                </StarRating>
                {rating > 0 && (
                  <RatingText>
                    {rating === 5 && 'Excellent! 🌟'}
                    {rating === 4 && 'Very Good! 👍'}
                    {rating === 3 && 'Good 👌'}
                    {rating === 2 && 'Fair 😐'}
                    {rating === 1 && 'Poor 😞'}
                  </RatingText>
                )}
              </RatingSection>

              <CommentSection>
                <CommentLabel>Your Review</CommentLabel>
                <CommentTextarea
                  placeholder="Share your experience with us... What did you like? What could we improve?"
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  rows={5}
                />
              </CommentSection>

              <ReviewActions>
                <CancelButton onClick={closeReviewModal}>Maybe Later</CancelButton>
                <SubmitButton 
                  onClick={handleSubmitReview}
                  disabled={submittingReview || !rating || !reviewComment.trim()}
                >
                  {submittingReview ? 'Submitting...' : 'Submit Review'}
                </SubmitButton>
              </ReviewActions>
            </ReviewBody>
          </ReviewContent>
        </ReviewModal>
      )}
    </AppointmentsContainer>
  );
};

// Styled Components
const AppointmentsContainer = styled.div`
  min-height: calc(100vh - 180px);
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.background} 0%, ${({ theme }) => theme.colors.accent}11 100%);
`;

const PageHeader = styled.div`
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.primary} 0%, ${({ theme }) => theme.colors.accent} 100%);
  color: ${({ theme }) => theme.colors.white};
  padding: ${({ theme }) => theme.spacing.xxl} ${({ theme }) => theme.spacing.lg};
  text-align: center;
`;

const PageTitle = styled.h1`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: ${({ theme }) => theme.fontSizes.xxxlarge};
  margin-bottom: ${({ theme }) => theme.spacing.sm};

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    font-size: ${({ theme }) => theme.fontSizes.xxlarge};
  }
`;

const PageSubtitle = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.large};
  opacity: 0.9;
`;

const Container = styled.div`
  max-width: 1200px;
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
  background: ${({ theme }) => theme.colors.white};
  border-radius: 16px;
  box-shadow: ${({ theme }) => theme.shadows.medium};
`;

const EmptyIcon = styled.div`
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const EmptyTitle = styled.h2`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: ${({ theme }) => theme.fontSizes.xxlarge};
  color: ${({ theme }) => theme.colors.secondary};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const EmptyText = styled.p`
  color: ${({ theme }) => theme.colors.textLight};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  font-size: ${({ theme }) => theme.fontSizes.medium};
`;

const AppointmentsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: ${({ theme }) => theme.spacing.lg};

  @media (max-width: ${({ theme }) => theme.breakpoints.desktop}) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    grid-template-columns: 1fr;
  }

  @media (max-width: 450px) {
    gap: ${({ theme }) => theme.spacing.md};
  }
`;

const AppointmentCard = styled.div`
  background: ${({ theme }) => theme.colors.white};
  border-radius: 10px;
  padding: ${({ theme }) => theme.spacing.sm};
  box-shadow: ${({ theme }) => theme.shadows.medium};
  transition: all ${({ theme }) => theme.transitions.medium};

  &:hover {
    box-shadow: ${({ theme }) => theme.shadows.large};
    transform: translateY(-4px);
  }
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${({ theme }) => theme.spacing.xs};
  padding-bottom: ${({ theme }) => theme.spacing.xs};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const ServiceName = styled.h3`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: ${({ theme }) => theme.fontSizes.medium};
  color: ${({ theme }) => theme.colors.secondary};
  margin: 0;
`;

const StatusBadge = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  border-radius: 20px;
  font-size: ${({ theme }) => theme.fontSizes.small};
  font-weight: 600;
  text-transform: capitalize;
  background: ${({ status }) => {
    switch (status) {
      case 'confirmed':
        return '#28a74522';
      case 'completed':
        return '#007bff22';
      case 'cancelled':
        return '#dc354522';
      default:
        return '#ffc10722';
    }
  }};
  color: ${({ status }) => {
    switch (status) {
      case 'confirmed':
        return '#28a745';
      case 'completed':
        return '#007bff';
      case 'cancelled':
        return '#dc3545';
      default:
        return '#ffc107';
    }
  }};
`;

const AppointmentDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const DetailRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const DetailLabel = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  color: ${({ theme }) => theme.colors.textLight};
  font-weight: 500;
  font-size: ${({ theme }) => theme.fontSizes.small};

  svg {
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const DetailValue = styled.div`
  color: ${({ theme }) => theme.colors.text};
  font-weight: 600;
  font-size: ${({ theme }) => theme.fontSizes.medium};
`;

const PaymentSection = styled.div`
  background: ${({ theme }) => theme.colors.accent}08;
  padding: ${({ theme }) => theme.spacing.xs};
  border-radius: 6px;
  margin-top: ${({ theme }) => theme.spacing.xs};
`;

const PaymentStatus = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
  
  svg {
    font-size: ${({ theme }) => theme.fontSizes.medium};
  }
`;

const PaymentText = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.small};
  color: ${({ theme }) => theme.colors.text};
  text-transform: capitalize;
`;

const ReceiptInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  font-size: ${({ theme }) => theme.fontSizes.small};
  color: ${({ theme }) => theme.colors.textLight};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
  
  svg {
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const PaymentDate = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.small};
  color: ${({ theme }) => theme.colors.textLight};
  font-style: italic;
`;

const NotesSection = styled.div`
  margin-top: ${({ theme }) => theme.spacing.sm};
  padding-top: ${({ theme }) => theme.spacing.sm};
  border-top: 1px solid ${({ theme }) => theme.colors.border};
`;

const NotesLabel = styled.div`
  font-weight: 600;
  color: ${({ theme }) => theme.colors.secondary};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
  font-size: ${({ theme }) => theme.fontSizes.small};
`;

const NotesText = styled.p`
  color: ${({ theme }) => theme.colors.textLight};
  font-size: ${({ theme }) => theme.fontSizes.small};
  margin: 0;
  font-style: italic;
`;

const CardFooter = styled.div`
  margin-top: ${({ theme }) => theme.spacing.lg};
  padding-top: ${({ theme }) => theme.spacing.md};
  border-top: 1px solid ${({ theme }) => theme.colors.border};
`;

const PayNowButton = styled.button`
  width: 100%;
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.primary} 0%, ${({ theme }) => theme.colors.accent} 100%);
  color: ${({ theme }) => theme.colors.white};
  border: none;
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  border-radius: 8px;
  font-size: ${({ theme }) => theme.fontSizes.medium};
  font-weight: 600;
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.medium};

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.shadows.medium};
  }
`;

const BottomActions = styled.div`
  margin-top: ${({ theme }) => theme.spacing.xxl};
  text-align: center;
`;

const BookButton = styled.button`
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.primary} 0%, ${({ theme }) => theme.colors.accent} 100%);
  color: ${({ theme }) => theme.colors.white};
  border: none;
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.xl};
  border-radius: 8px;
  font-size: ${({ theme }) => theme.fontSizes.medium};
  font-weight: 600;
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.medium};

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.shadows.large};
  }
`;

const PrintButton = styled.button`
  width: 100%;
  background: ${({ theme }) => theme.colors.white};
  color: ${({ theme }) => theme.colors.primary};
  border: 2px solid ${({ theme }) => theme.colors.primary};
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  border-radius: 8px;
  font-size: ${({ theme }) => theme.fontSizes.medium};
  font-weight: 600;
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.medium};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.sm};

  &:hover {
    background: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.white};
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.shadows.medium};
  }

  svg {
    font-size: ${({ theme }) => theme.fontSizes.large};
  }
`;

const ReceiptModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: ${({ theme }) => theme.spacing.lg};
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;

  @media print {
    position: static;
    background: white;
    padding: 0;
  }
`;

const ReceiptContent = styled.div`
  background: white;
  max-width: 380px;
  width: 100%;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: ${({ theme }) => theme.shadows.large};

  @media print {
    max-width: 100%;
    box-shadow: none;
    border-radius: 0;
    font-size: 11px;
  }
`;

const ReceiptHeader = styled.div`
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.primary} 0%, ${({ theme }) => theme.colors.accent} 100%);
  color: white;
  padding: ${({ theme }) => theme.spacing.xs};
  text-align: center;

  @media print {
    padding: 8px;
    background: #c9a684;
  }
`;

const BusinessName = styled.h1`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: ${({ theme }) => theme.fontSizes.xlarge};
  margin-bottom: 0;

  @media print {
    font-size: 18px;
    margin-bottom: 2px;
  }
`;

const BusinessTagline = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.small};
  opacity: 0.9;
  margin-bottom: ${({ theme }) => theme.spacing.xs};

  @media print {
    font-size: 11px;
    margin-bottom: 6px;
  }
`;

const ReceiptTitle = styled.h2`
  font-size: ${({ theme }) => theme.fontSizes.medium};
  font-weight: 700;
  letter-spacing: 1px;
  border-top: 2px solid rgba(255, 255, 255, 0.3);
  padding-top: ${({ theme }) => theme.spacing.xs};
  margin-top: ${({ theme }) => theme.spacing.xs};

  @media print {
    font-size: 12px;
    letter-spacing: 0.5px;
    padding-top: 4px;
    margin-top: 4px;
    border-top: 1px solid rgba(255, 255, 255, 0.3);
  }
`;

const ReceiptBody = styled.div`
  padding: ${({ theme }) => theme.spacing.xs};

  @media print {
    padding: 8px 12px;
  }
`;

const ReceiptSection = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.xs};
  padding-bottom: ${({ theme }) => theme.spacing.xs};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};

  &:last-of-type {
    border-bottom: none;
  }

  @media print {
    margin-bottom: 6px;
    padding-bottom: 6px;
    page-break-inside: avoid;
  }
`;

const SectionTitle = styled.h3`
  font-size: ${({ theme }) => theme.fontSizes.small};
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
  font-weight: 600;

  @media print {
    font-size: 12px;
    margin-bottom: 4px;
  }
`;

const ReceiptRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2px 0;

  @media print {
    padding: 2px 0;
  }
`;

const ReceiptLabel = styled.span`
  color: ${({ theme }) => theme.colors.textLight};
  font-size: ${({ theme }) => theme.fontSizes.small};
`;

const ReceiptValue = styled.span`
  color: ${({ theme }) => theme.colors.text};
  font-weight: 600;
  font-size: ${({ theme }) => theme.fontSizes.small};
  text-align: right;
`;

const ReceiptTotal = styled.div`
  background: ${({ theme }) => theme.colors.primary}11;
  padding: ${({ theme }) => theme.spacing.xs};
  border-radius: 6px;
  margin: ${({ theme }) => theme.spacing.xs} 0;
  display: flex;
  justify-content: space-between;
  align-items: center;

  @media print {
    padding: 8px;
    margin: 8px 0;
    page-break-inside: avoid;
  }
`;

const TotalLabel = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.small};
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};

  @media print {
    font-size: 12px;
  }
`;

const TotalValue = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.large};
  font-weight: 700;
  color: ${({ theme }) => theme.colors.primary};

  @media print {
    font-size: 16px;
  }
`;

const ReceiptFooter = styled.div`
  text-align: center;
  margin-top: ${({ theme }) => theme.spacing.xs};
  padding-top: ${({ theme }) => theme.spacing.xs};
  border-top: 2px solid ${({ theme }) => theme.colors.border};

  @media print {
    margin-top: 8px;
    padding-top: 8px;
    page-break-inside: avoid;
  }
`;

const FooterText = styled.p`
  color: ${({ theme }) => theme.colors.textLight};
  font-size: ${({ theme }) => theme.fontSizes.small};
  margin-bottom: 2px;

  @media print {
    font-size: 8px;
    margin-bottom: 1px;
  }
`;

const PrintDate = styled.p`
  color: ${({ theme }) => theme.colors.textLight};
  font-size: ${({ theme }) => theme.fontSizes.small};
  margin-top: ${({ theme }) => theme.spacing.xs};
  font-style: italic;

  @media print {
    font-size: 8px;
    margin-top: 4px;
  }
`;

const CloseReceiptButton = styled.button`
  width: 100%;
  background: ${({ theme }) => theme.colors.secondary};
  color: white;
  border: none;
  padding: ${({ theme }) => theme.spacing.xs};
  font-size: ${({ theme }) => theme.fontSizes.small};
  font-weight: 600;
  cursor: pointer;
  transition: background ${({ theme }) => theme.transitions.fast};

  &:hover {
    background: ${({ theme }) => theme.colors.text};
  }

  @media print {
    display: none;
  }
`;

const ReviewButton = styled.button`
  width: 100%;
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.primary} 0%, ${({ theme }) => theme.colors.accent} 100%);
  color: ${({ theme }) => theme.colors.white};
  border: none;
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  border-radius: 8px;
  font-size: ${({ theme }) => theme.fontSizes.medium};
  font-weight: 600;
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.medium};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-top: ${({ theme }) => theme.spacing.sm};

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.shadows.medium};
  }

  svg {
    font-size: ${({ theme }) => theme.fontSizes.large};
  }
`;

const ReviewModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: ${({ theme }) => theme.spacing.lg};
  overflow-y: auto;
`;

const ReviewContent = styled.div`
  background: white;
  max-width: 500px;
  width: 100%;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: ${({ theme }) => theme.shadows.large};
`;

const ReviewHeader = styled.div`
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.primary} 0%, ${({ theme }) => theme.colors.accent} 100%);
  color: white;
  padding: ${({ theme }) => theme.spacing.lg};
  text-align: center;

  h2 {
    font-family: ${({ theme }) => theme.fonts.heading};
    font-size: ${({ theme }) => theme.fontSizes.xxlarge};
    margin-bottom: ${({ theme }) => theme.spacing.sm};
  }

  p {
    font-size: ${({ theme }) => theme.fontSizes.medium};
    opacity: 0.95;
  }
`;

const ReviewBody = styled.div`
  padding: ${({ theme }) => theme.spacing.xl};
`;

const RatingSection = styled.div`
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const RatingLabel = styled.h3`
  font-size: ${({ theme }) => theme.fontSizes.large};
  color: ${({ theme }) => theme.colors.secondary};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  font-weight: 600;
`;

const StarRating = styled.div`
  display: flex;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const Star = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  font-size: 2.5rem;
  color: ${({ filled, theme }) => filled ? theme.colors.accent : '#ddd'};
  transition: all ${({ theme }) => theme.transitions.fast};
  padding: 0;

  &:hover {
    transform: scale(1.2);
  }

  svg {
    filter: ${({ filled }) => filled ? 'drop-shadow(0 2px 4px rgba(201, 166, 132, 0.3))' : 'none'};
  }
`;

const RatingText = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.medium};
  color: ${({ theme }) => theme.colors.primary};
  font-weight: 600;
  margin-top: ${({ theme }) => theme.spacing.sm};
`;

const CommentSection = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const CommentLabel = styled.h3`
  font-size: ${({ theme }) => theme.fontSizes.large};
  color: ${({ theme }) => theme.colors.secondary};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  font-weight: 600;
`;

const CommentTextarea = styled.textarea`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.md};
  border: 2px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  font-size: ${({ theme }) => theme.fontSizes.medium};
  font-family: ${({ theme }) => theme.fonts.body};
  resize: vertical;
  transition: border-color ${({ theme }) => theme.transitions.fast};

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }

  &::placeholder {
    color: ${({ theme }) => theme.colors.textLight};
  }
`;

const ReviewActions = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
`;

const CancelButton = styled.button`
  flex: 1;
  background: ${({ theme }) => theme.colors.white};
  color: ${({ theme }) => theme.colors.text};
  border: 2px solid ${({ theme }) => theme.colors.border};
  padding: ${({ theme }) => theme.spacing.md};
  border-radius: 8px;
  font-size: ${({ theme }) => theme.fontSizes.medium};
  font-weight: 600;
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.medium};

  &:hover {
    background: ${({ theme }) => theme.colors.border};
  }
`;

const SubmitButton = styled.button`
  flex: 1;
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.primary} 0%, ${({ theme }) => theme.colors.accent} 100%);
  color: ${({ theme }) => theme.colors.white};
  border: none;
  padding: ${({ theme }) => theme.spacing.md};
  border-radius: 8px;
  font-size: ${({ theme }) => theme.fontSizes.medium};
  font-weight: 600;
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.medium};

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.shadows.medium};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export default Appointments;
