import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FaCheckCircle, FaTimesCircle, FaSpinner, FaPhone, FaMoneyBillWave } from 'react-icons/fa';

const Payment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const appointment = location.state?.appointment;
  
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState('idle'); // idle, processing, checking, success, failed, timeout, manual
  const [message, setMessage] = useState('');
  const [checkoutRequestId, setCheckoutRequestId] = useState('');
  const [checkCount, setCheckCount] = useState(0);
  const [mpesaReceipt, setMpesaReceipt] = useState('');
  const [verifyingReceipt, setVerifyingReceipt] = useState(false);

  useEffect(() => {
    if (!appointment) {
      navigate('/booking');
    }
  }, [appointment, navigate]);

  useEffect(() => {
    let interval;
    const MAX_CHECKS = 40; // Stop after 2 minutes (40 checks * 3 seconds)
    
    if (paymentStatus === 'checking' && appointment && checkCount < MAX_CHECKS) {
      // Poll for payment status every 3 seconds
      interval = setInterval(() => {
        checkPaymentStatus();
        setCheckCount(prev => prev + 1);
      }, 3000);
    } else if (checkCount >= MAX_CHECKS && paymentStatus === 'checking') {
      // Timeout - stop checking
      setPaymentStatus('timeout');
      setMessage('Payment verification timed out. Please check your M-Pesa messages or contact support.');
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [paymentStatus, appointment, checkCount]);

  const formatPhoneNumber = (phone) => {
    // Remove spaces and special characters
    phone = phone.replace(/[\s\-\(\)]/g, '');
    
    // Convert to Kenyan format (254XXXXXXXXX)
    if (phone.startsWith('0')) {
      return '254' + phone.substring(1);
    } else if (phone.startsWith('+254')) {
      return phone.substring(1);
    } else if (phone.startsWith('254')) {
      return phone;
    }
    return '254' + phone;
  };

  const handleInitiatePayment = async () => {
    if (!phoneNumber) {
      setMessage('Please enter your M-Pesa phone number');
      return;
    }

    setLoading(true);
    setMessage('');
    setPaymentStatus('processing');

    try {
      const response = await fetch('http://127.0.0.1:8000/api/mpesa/initiate/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          appointment_id: appointment.id,
          phone_number: formatPhoneNumber(phoneNumber),
        }),
      });

      const data = await response.json();

      if (data.success) {
        setCheckoutRequestId(data.CheckoutRequestID);
        setMessage(data.message || 'Please check your phone and enter your M-Pesa PIN');
        setPaymentStatus('checking');
      } else {
        setMessage(data.error || 'Payment initiation failed. Please try again.');
        setPaymentStatus('failed');
      }
    } catch (error) {
      console.error('Payment error:', error);
      setMessage('An error occurred. Please try again.');
      setPaymentStatus('failed');
    } finally {
      setLoading(false);
    }
  };

  const checkPaymentStatus = async () => {
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/mpesa/status/${appointment.id}/`
      );
      const data = await response.json();

      if (data.payment_status === 'completed') {
        setPaymentStatus('success');
        setMessage('Payment successful! Your appointment has been confirmed.');
      } else if (data.payment_status === 'cancelled') {
        setPaymentStatus('cancelled');
        setMessage('Payment was cancelled. You can try again or use manual verification.');
      } else if (data.payment_status === 'failed') {
        setPaymentStatus('failed');
        setMessage('Payment failed. Please try again or use manual verification.');
      } else if (data.payment_status === 'pending_verification') {
        setPaymentStatus('manual');
        setMessage('Payment submitted for manual verification. An admin will review your payment within 24 hours.');
      }
    } catch (error) {
      console.error('Error checking payment status:', error);
    }
  };

  const handleManualVerification = async () => {
    if (!mpesaReceipt || mpesaReceipt.trim().length < 8) {
      setMessage('Please enter a valid M-Pesa receipt number (e.g., SH12XY34ZA)');
      return;
    }

    setVerifyingReceipt(true);
    setMessage('');

    try {
      const response = await fetch('http://127.0.0.1:8000/api/mpesa/verify/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          appointment_id: appointment.id,
          mpesa_receipt: mpesaReceipt.trim().toUpperCase(),
        }),
      });

      const data = await response.json();

      if (data.success) {
        setPaymentStatus('success');
        setMessage(data.message);
      } else {
        setMessage(data.error || 'Verification failed. Please check your receipt number.');
      }
    } catch (error) {
      console.error('Verification error:', error);
      setMessage('An error occurred during verification. Please try again.');
    } finally {
      setVerifyingReceipt(false);
    }
  };

  if (!appointment) {
    return null;
  }

  return (
    <PaymentContainer>
      

      <Container>
        <PaymentCard
          as={motion.div}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Appointment Summary */}
          <Section>
            <SectionTitle>Appointment Details</SectionTitle>
            <DetailRow>
              <DetailLabel>Service:</DetailLabel>
              <DetailValue>{appointment.service_name}</DetailValue>
            </DetailRow>
            <DetailRow>
              <DetailLabel>Date:</DetailLabel>
              <DetailValue>{appointment.appointment_date}</DetailValue>
            </DetailRow>
            <DetailRow>
              <DetailLabel>Time:</DetailLabel>
              <DetailValue>{appointment.appointment_time}</DetailValue>
            </DetailRow>
            <DetailRow>
              <DetailLabel>Customer:</DetailLabel>
              <DetailValue>{appointment.customer_name}</DetailValue>
            </DetailRow>
            <TotalRow>
              <TotalLabel>Total Amount:</TotalLabel>
              <TotalValue>KES {parseFloat(appointment.service_price).toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TotalValue>
            </TotalRow>
          </Section>

          {/* Payment Status Display */}
          {paymentStatus === 'success' && (
            <StatusMessage type="success">
              <FaCheckCircle size={50} />
              <StatusTitle>Payment Successful!</StatusTitle>
              <StatusText>{message}</StatusText>
              <StatusText>Transaction ID: {appointment.mpesa_transaction_id || 'Pending'}</StatusText>
              <BackButton onClick={() => navigate('/dashboard')}>
                Go to Dashboard
              </BackButton>
            </StatusMessage>
          )}

          {paymentStatus === 'cancelled' && (
            <StatusMessage type="warning">
              <FaTimesCircle size={50} />
              <StatusTitle>Payment Cancelled</StatusTitle>
              <StatusText>{message}</StatusText>
              <StatusText>You cancelled the payment request or didn't enter your PIN in time.</StatusText>
              <RetryButton onClick={() => {
                setPaymentStatus('idle');
                setCheckCount(0);
                setMessage('');
              }}>
                Try Again
              </RetryButton>
              <BackButton onClick={() => setPaymentStatus('manual')}>
                Verify Manual Payment
              </BackButton>
            </StatusMessage>
          )}

          {paymentStatus === 'failed' && (
            <StatusMessage type="error">
              <FaTimesCircle size={50} />
              <StatusTitle>Payment Failed</StatusTitle>
              <StatusText>{message}</StatusText>
              <RetryButton onClick={() => {
                setPaymentStatus('idle');
                setCheckCount(0);
              }}>
                Try Again
              </RetryButton>
              <BackButton onClick={() => setPaymentStatus('manual')}>
                Verify Manual Payment
              </BackButton>
            </StatusMessage>
          )}

          {paymentStatus === 'timeout' && (
            <StatusMessage type="error">
              <FaTimesCircle size={50} />
              <StatusTitle>Verification Timeout</StatusTitle>
              <StatusText>{message}</StatusText>
              <StatusText>If payment was deducted, please verify manually using your M-Pesa receipt.</StatusText>
              <RetryButton onClick={() => setPaymentStatus('manual')}>
                Verify Payment Manually
              </RetryButton>
              <BackButton onClick={() => navigate('/dashboard')}>
                Go to Dashboard
              </BackButton>
            </StatusMessage>
          )}

          {paymentStatus === 'manual' && (
            <Section>
              <SectionTitle>Manual Payment Verification</SectionTitle>
              <InfoText>
                If you've already paid via M-Pesa, enter your M-Pesa receipt number below to verify your payment.
                You can find this in your M-Pesa message (e.g., SH12XY34ZA).
              </InfoText>
              
              <FormGroup>
                <Label>M-Pesa Receipt Number</Label>
                <PhoneInput
                  type="text"
                  placeholder="e.g., SH12XY34ZA"
                  value={mpesaReceipt}
                  onChange={(e) => setMpesaReceipt(e.target.value.toUpperCase())}
                  disabled={verifyingReceipt}
                  maxLength={12}
                />
                <HintText>
                  Enter the M-Pesa confirmation code from your SMS (usually 10 characters)
                </HintText>
              </FormGroup>

              {message && (
                <InfoMessage>{message}</InfoMessage>
              )}

              <PayButton
                onClick={handleManualVerification}
                disabled={verifyingReceipt || !mpesaReceipt}
              >
                {verifyingReceipt ? (
                  <>
                    <FaSpinner className="spinning" /> Verifying...
                  </>
                ) : (
                  'Verify Payment'
                )}
              </PayButton>

              <SecurityNote>
                <small>
                  Can't find your receipt? Check your M-Pesa messages or dial *334# to view your transaction history.
                </small>
              </SecurityNote>
              
              <BackButton onClick={() => {
                setPaymentStatus('idle');
                setCheckCount(0);
                setMpesaReceipt('');
              }}>
                Back to Payment
              </BackButton>
            </Section>
          )}

          {paymentStatus === 'checking' && (
            <StatusMessage type="processing">
              <Spinner>
                <FaSpinner size={50} />
              </Spinner>
              <StatusTitle>Processing Payment</StatusTitle>
              <StatusText>{message}</StatusText>
              <StatusText>Waiting for confirmation... ({Math.floor(checkCount * 3 / 60)}:{(checkCount * 3 % 60).toString().padStart(2, '0')})</StatusText>
              <ManualVerifyLink onClick={() => setPaymentStatus('manual')}>
                Already paid? Verify manually
              </ManualVerifyLink>
            </StatusMessage>
          )}

          {/* Payment Form */}
          {(paymentStatus === 'idle' || paymentStatus === 'processing') && (
            <Section>
              <SectionTitle>
                <FaMoneyBillWave /> M-Pesa Payment
              </SectionTitle>
              <InfoText>
                Enter your M-Pesa registered phone number to receive a payment prompt.
              </InfoText>
              
              <FormGroup>
                <Label>
                  <FaPhone /> M-Pesa Phone Number
                </Label>
                <PhoneInput
                  type="tel"
                  placeholder="0712 345 678"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  disabled={loading || paymentStatus === 'processing'}
                />
                <HintText>
                  Enter the phone number registered with M-Pesa (e.g., 0712345678)
                </HintText>
              </FormGroup>

              {message && paymentStatus === 'processing' && (
                <InfoMessage>{message}</InfoMessage>
              )}

              <PayButton
                onClick={handleInitiatePayment}
                disabled={loading || !phoneNumber || paymentStatus === 'processing'}
              >
                {loading ? (
                  <>
                    <FaSpinner className="spinning" /> Processing...
                  </>
                ) : (
                  <>Pay KES {parseFloat(appointment.service_price).toLocaleString('en-KE', { minimumFractionDigits: 2 })}</>
                )}
              </PayButton>

              <SecurityNote>
                <small>
                  🔒 Your payment is secure and processed through Safaricom M-Pesa.
                  You will receive a prompt on your phone to enter your M-Pesa PIN.
                </small>
              </SecurityNote>
            </Section>
          )}
        </PaymentCard>
      </Container>
    </PaymentContainer>
  );
};

// Styled Components
const PaymentContainer = styled.div`
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
  max-width: 700px;
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacing.xxl} ${({ theme }) => theme.spacing.lg};

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    padding: ${({ theme }) => theme.spacing.xl} ${({ theme }) => theme.spacing.md};
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    padding: ${({ theme }) => theme.spacing.lg} ${({ theme }) => theme.spacing.sm};
  }

  @media (max-width: 450px) {
    padding: ${({ theme }) => theme.spacing.sm};
  }
`;

const PaymentCard = styled.div`
  background: ${({ theme }) => theme.colors.white};
  border-radius: 16px;
  padding: ${({ theme }) => theme.spacing.xxl};
  box-shadow: ${({ theme }) => theme.shadows.large};

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    padding: ${({ theme }) => theme.spacing.lg};
    border-radius: 12px;
  }

  @media (max-width: 450px) {
    padding: ${({ theme }) => theme.spacing.md};
    border-radius: 10px;
  }
`;

const Section = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  
  &:last-child {
    margin-bottom: 0;
  }

  @media (max-width: 450px) {
    margin-bottom: ${({ theme }) => theme.spacing.lg};
  }
`;

const SectionTitle = styled.h2`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: ${({ theme }) => theme.fontSizes.xlarge};
  color: ${({ theme }) => theme.colors.secondary};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  
  svg {
    color: ${({ theme }) => theme.colors.primary};
  }

  @media (max-width: 450px) {
    font-size: ${({ theme }) => theme.fontSizes.large};
    margin-bottom: ${({ theme }) => theme.spacing.md};
  }
`;

const DetailRow = styled.div`
  display: flex;
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing.sm} 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const DetailLabel = styled.span`
  color: ${({ theme }) => theme.colors.textLight};
  font-weight: 500;
`;

const DetailValue = styled.span`
  color: ${({ theme }) => theme.colors.text};
  font-weight: 600;
`;

const TotalRow = styled(DetailRow)`
  margin-top: ${({ theme }) => theme.spacing.md};
  padding-top: ${({ theme }) => theme.spacing.md};
  border-top: 2px solid ${({ theme }) => theme.colors.primary};
  border-bottom: none;
`;

const TotalLabel = styled(DetailLabel)`
  font-size: ${({ theme }) => theme.fontSizes.large};
  color: ${({ theme }) => theme.colors.secondary};
`;

const TotalValue = styled(DetailValue)`
  font-size: ${({ theme }) => theme.fontSizes.xlarge};
  color: ${({ theme }) => theme.colors.primary};
`;

const StatusMessage = styled.div`
  text-align: center;
  padding: ${({ theme }) => theme.spacing.xxl};
  
  svg {
    color: ${({ type, theme }) => 
      type === 'success' ? '#28a745' : 
      type === 'error' ? '#dc3545' : 
      theme.colors.primary};
    margin-bottom: ${({ theme }) => theme.spacing.lg};
  }

  @media (max-width: 450px) {
    padding: ${({ theme }) => theme.spacing.lg};
  }
`;

const Spinner = styled.div`
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  
  svg {
    animation: spin 1s linear infinite;
  }
`;

const StatusTitle = styled.h3`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: ${({ theme }) => theme.fontSizes.xlarge};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  color: ${({ theme }) => theme.colors.secondary};
`;

const StatusText = styled.p`
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const InfoText = styled.p`
  color: ${({ theme }) => theme.colors.textLight};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  line-height: 1.6;
`;

const FormGroup = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const Label = styled.label`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  font-weight: 600;
  color: ${({ theme }) => theme.colors.secondary};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  
  svg {
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const PhoneInput = styled.input`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.md};
  border: 2px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  font-size: ${({ theme }) => theme.fontSizes.medium};
  transition: all ${({ theme }) => theme.transitions.fast};
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.primary}22;
  }

  &:disabled {
    background-color: ${({ theme }) => theme.colors.border};
    cursor: not-allowed;
  }

  @media (max-width: 450px) {
    padding: ${({ theme }) => theme.spacing.sm};
    font-size: ${({ theme }) => theme.fontSizes.small};
  }
`;

const HintText = styled.small`
  display: block;
  color: ${({ theme }) => theme.colors.textLight};
  margin-top: ${({ theme }) => theme.spacing.xs};
`;

const InfoMessage = styled.div`
  background: ${({ theme }) => theme.colors.primary}11;
  border-left: 4px solid ${({ theme }) => theme.colors.primary};
  padding: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  border-radius: 4px;
  color: ${({ theme }) => theme.colors.text};

  @media (max-width: 450px) {
    padding: ${({ theme }) => theme.spacing.sm};
    font-size: ${({ theme }) => theme.fontSizes.small};
  }
`;

const PayButton = styled.button`
  width: 100%;
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.primary} 0%, ${({ theme }) => theme.colors.accent} 100%);
  color: ${({ theme }) => theme.colors.white};
  border: none;
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
  border-radius: 8px;
  font-size: ${({ theme }) => theme.fontSizes.large};
  font-weight: 700;
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.medium};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.sm};

  .spinning {
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.shadows.large};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    &:hover:not(:disabled) {
      transform: none;
    }
  }

  @media (max-width: 450px) {
    padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
    font-size: ${({ theme }) => theme.fontSizes.medium};
  }
`;

const BackButton = styled(PayButton)`
  background: ${({ theme }) => theme.colors.secondary};
  margin-top: ${({ theme }) => theme.spacing.lg};

  &:hover {
    background: ${({ theme }) => theme.colors.text};
  }
`;

const RetryButton = styled(PayButton)`
  background: ${({ theme }) => theme.colors.accent};
  margin-top: ${({ theme }) => theme.spacing.lg};
`;

const SecurityNote = styled.div`
  margin-top: ${({ theme }) => theme.spacing.lg};
  text-align: center;
  color: ${({ theme }) => theme.colors.textLight};
  
  small {
    line-height: 1.6;
  }
`;

const ManualVerifyLink = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.primary};
  text-decoration: underline;
  cursor: pointer;
  margin-top: ${({ theme }) => theme.spacing.md};
  font-size: ${({ theme }) => theme.fontSizes.small};
  padding: ${({ theme }) => theme.spacing.sm};
  
  &:hover {
    color: ${({ theme }) => theme.colors.accent};
  }
`;

export default Payment;
