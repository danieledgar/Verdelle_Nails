import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../context/AuthContext';
import { FaCalendarAlt, FaStar, FaBell, FaUser, FaGift, FaHistory } from 'react-icons/fa';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  
  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://127.0.0.1:8000/api/notifications/', {
        headers: {
          'Authorization': `Token ${token}`,
        },
      });
      const data = await response.json();
      const notifList = data.results || data;
      setNotifications(notifList);
      setUnreadCount(notifList.filter(n => !n.is_read).length);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };
  
  // Construct full URL for profile picture
  const getProfilePictureUrl = () => {
    if (!user?.profile_picture) return null;
    // If it's already a full URL, return it
    if (user.profile_picture.startsWith('http')) return user.profile_picture;
    // Otherwise, prepend the backend URL
    const baseUrl = 'http://127.0.0.1:8000';
    return `${baseUrl}${user.profile_picture}`;
  };

  const profilePicUrl = getProfilePictureUrl();

  const handleProfileClick = () => {
    navigate('/profile');
  };

  return (
    <Container>
      <Hero>
        <WelcomeText>Welcome back, {user?.first_name || user?.username}!</WelcomeText>
        <Subtitle>Elegance at your fingertips</Subtitle>
      </Hero>

      <Content>
        <TopSection>
          <ProfileCard onClick={handleProfileClick}>
            <ProfileAvatar>
              {profilePicUrl ? (
                <AvatarImage 
                  src={profilePicUrl} 
                  alt={user.username}
                  onError={(e) => {
                    console.error('Failed to load profile picture:', profilePicUrl);
                    e.target.style.display = 'none';
                  }}
                />
              ) : (
                <AvatarPlaceholder>
                  <FaUser />
                </AvatarPlaceholder>
              )}
            </ProfileAvatar>
            <ProfileInfo>
              <ProfileName>{user?.first_name} {user?.last_name}</ProfileName>
              <ProfileEmail>{user?.email}</ProfileEmail>
            </ProfileInfo>
            <LoyaltyCard>
              <FaGift />
              <LoyaltyPoints>{user?.loyalty_points || 0} Points</LoyaltyPoints>
              <LoyaltyText>Loyalty Rewards</LoyaltyText>
            </LoyaltyCard>
          </ProfileCard>

          <QuickActions>
            <ActionCard to="/booking">
              <ActionIcon>
                <FaCalendarAlt />
              </ActionIcon>
              <ActionTitle>Book Appointment</ActionTitle>
              <ActionDescription>Schedule your next nail session</ActionDescription>
            </ActionCard>

            <ActionCard to="/services">
              <ActionIcon>
                <FaStar />
              </ActionIcon>
              <ActionTitle>Browse Services</ActionTitle>
              <ActionDescription>Explore our premium nail services</ActionDescription>
            </ActionCard>

            <ActionCard to="/notifications" style={{ position: 'relative' }}>
              <ActionIcon>
                <FaBell />
              </ActionIcon>
              {unreadCount > 0 && (
                <NotificationBadge>{unreadCount}</NotificationBadge>
              )}
              <ActionTitle>Notifications</ActionTitle>
              <ActionDescription>View your messages and updates</ActionDescription>
            </ActionCard>

            <ActionCard to="/appointments">
              <ActionIcon>
                <FaHistory />
              </ActionIcon>
              <ActionTitle>My Appointments</ActionTitle>
              <ActionDescription>View your booking history</ActionDescription>
            </ActionCard>
          </QuickActions>
        </TopSection>

        <AboutSection>
          <SectionTitle>About Verdelle Nails</SectionTitle>
          <AboutText>
            Welcome to Verdelle Nails, where elegance meets expertise. We specialize in 
            premium nail care services, offering everything from classic manicures to 
            intricate nail art designs.
          </AboutText>
          <AboutText>
            <strong>Our Mission:</strong> To provide exceptional nail care services in a 
            luxurious and relaxing environment, making every client feel pampered and beautiful.
          </AboutText>
          <AboutStats>
            <StatItem>
              <StatNumber>5+</StatNumber>
              <StatLabel>Years Experience</StatLabel>
            </StatItem>
            <StatItem>
              <StatNumber>1000+</StatNumber>
              <StatLabel>Happy Clients</StatLabel>
            </StatItem>
            <StatItem>
              <StatNumber>20+</StatNumber>
              <StatLabel>Services</StatLabel>
            </StatItem>
          </AboutStats>
        </AboutSection>
      </Content>
    </Container>
  );
};

export default Dashboard;

// Styled Components
const Container = styled.div`
  min-height: calc(100vh - 180px);
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.background} 0%, ${({ theme }) => theme.colors.accent}11 100%);
`;

const Hero = styled.div`
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.primary} 0%, ${({ theme }) => theme.colors.accent} 100%);
  color: ${({ theme }) => theme.colors.white};
  padding-top: 160px;
  padding: ${({ theme }) => theme.spacing.xxl} ${({ theme }) => theme.spacing.lg};
  padding-top: 160px;
  text-align: center;

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    padding: ${({ theme }) => theme.spacing.xl} ${({ theme }) => theme.spacing.md};
    padding-top: 140px;
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    padding: ${({ theme }) => theme.spacing.lg} ${({ theme }) => theme.spacing.sm};
    padding-top: 110px;
  }
`;

const WelcomeText = styled.h1`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: ${({ theme }) => theme.fontSizes.xxxlarge};
  margin-bottom: ${({ theme }) => theme.spacing.sm};

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    font-size: ${({ theme }) => theme.fontSizes.xxlarge};
  }

  @media (max-width: 450px) {
    font-size: ${({ theme }) => theme.fontSizes.xlarge};
  }
`;

const Subtitle = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.large};
  opacity: 0.9;
`;

const Content = styled.div`
  max-width: 100%;
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacing.xl} ${({ theme }) => theme.spacing.md};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xl};
  box-sizing: border-box;

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.sm};
    gap: ${({ theme }) => theme.spacing.md};
  }

  @media (max-width: 450px) {
    padding: ${({ theme }) => theme.spacing.sm};
  }
`;

const TopSection = styled.div`
  display: grid;
  grid-template-columns: 380px 1fr;
  gap: ${({ theme }) => theme.spacing.lg};
  align-items: start;

  @media (max-width: ${({ theme }) => theme.breakpoints.desktop}) {
    grid-template-columns: 1fr;
    gap: ${({ theme }) => theme.spacing.xl};
  }

  @media (max-width: 450px) {
    gap: ${({ theme }) => theme.spacing.md};
  }
`;

const ProfileCard = styled.div`
  background: ${({ theme }) => theme.colors.white};
  border-radius: 12px;
  padding: ${({ theme }) => theme.spacing.lg};
  box-shadow: ${({ theme }) => theme.shadows.medium};
  text-align: center;
  border: 2px solid ${({ theme }) => theme.colors.border};
  border-right: 3px solid ${({ theme }) => theme.colors.primary};
  max-width: 100%;
  width: 100%;
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.medium};
  margin-left: auto;
  box-sizing: border-box;
  overflow: hidden;

  &:hover {
    transform: translateY(-5px);
    box-shadow: ${({ theme }) => theme.shadows.large};
    border-right-color: ${({ theme }) => theme.colors.accent};
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.desktop}) {
    margin-left: 0;
  }

  @media (max-width: 450px) {
    padding: ${({ theme }) => theme.spacing.sm};
    border-radius: 10px;
    border: 1px solid ${({ theme }) => theme.colors.border};
    border-right: 2px solid ${({ theme }) => theme.colors.primary};
  }
`;

const ProfileAvatar = styled.div`
  width: 100px;
  height: 100px;
  margin: 0 auto ${({ theme }) => theme.spacing.sm};
  border-radius: 50%;
  overflow: hidden;
  border: 4px solid ${({ theme }) => theme.colors.primary};

  @media (max-width: 450px) {
    width: 80px;
    height: 80px;
    border: 3px solid ${({ theme }) => theme.colors.primary};
  }
`;

const AvatarImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const AvatarPlaceholder = styled.div`
  width: 100%;
  height: 100%;
  background: ${({ theme }) => theme.colors.accent}33;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40px;
  color: ${({ theme }) => theme.colors.primary};

  @media (max-width: 450px) {
    font-size: 32px;
  }
`;

const ProfileInfo = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const ProfileName = styled.h2`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: ${({ theme }) => theme.fontSizes.large};
  color: ${({ theme }) => theme.colors.secondary};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
  word-wrap: break-word;
  overflow-wrap: break-word;

  @media (max-width: 450px) {
    font-size: ${({ theme }) => theme.fontSizes.medium};
  }
`;

const ProfileEmail = styled.p`
  color: ${({ theme }) => theme.colors.textLight};
  font-size: ${({ theme }) => theme.fontSizes.small};
  word-wrap: break-word;
  overflow-wrap: break-word;

  @media (max-width: 450px) {
    font-size: ${({ theme }) => theme.fontSizes.xsmall};
  }
`;

const LoyaltyCard = styled.div`
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.primary} 0%, ${({ theme }) => theme.colors.accent} 100%);
  color: ${({ theme }) => theme.colors.white};
  padding: ${({ theme }) => theme.spacing.md};
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};

  svg {
    font-size: 28px;
  }
`;

const LoyaltyPoints = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.xlarge};
  font-weight: 700;
  font-family: ${({ theme }) => theme.fonts.heading};
`;

const LoyaltyText = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.small};
  opacity: 0.9;
`;

const AboutSection = styled.div`
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.white} 0%, ${({ theme }) => theme.colors.accent}08 100%);
  border-radius: 16px;
  padding: ${({ theme }) => theme.spacing.xxl};
  box-shadow: ${({ theme }) => theme.shadows.medium};
  border: 1px solid ${({ theme }) => theme.colors.border};
  width: 100%;
  box-sizing: border-box;
  max-width: 100%;
`;

const SectionTitle = styled.h3`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: ${({ theme }) => theme.fontSizes.xlarge};
  color: ${({ theme }) => theme.colors.secondary};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  text-align: center;
  position: relative;
  padding-bottom: ${({ theme }) => theme.spacing.sm};

  &:after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 60px;
    height: 3px;
    background: linear-gradient(90deg, ${({ theme }) => theme.colors.primary} 0%, ${({ theme }) => theme.colors.accent} 100%);
    border-radius: 2px;
  }
`;

const AboutText = styled.p`
  color: ${({ theme }) => theme.colors.text};
  line-height: 1.8;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  font-size: ${({ theme }) => theme.fontSizes.medium};
  text-align: left;
  max-width: 100%;

  strong {
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const AboutStats = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: ${({ theme }) => theme.spacing.md};
  margin-top: ${({ theme }) => theme.spacing.lg};

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    grid-template-columns: 1fr;
    gap: ${({ theme }) => theme.spacing.sm};
  }
`;

const StatItem = styled.div`
  text-align: center;
  padding: ${({ theme }) => theme.spacing.lg};
  background: ${({ theme }) => theme.colors.white};
  border-radius: 10px;
  box-shadow: ${({ theme }) => theme.shadows.small};
  border: 2px solid ${({ theme }) => theme.colors.border};
  transition: all ${({ theme }) => theme.transitions.medium};

  &:hover {
    transform: translateY(-3px);
    box-shadow: ${({ theme }) => theme.shadows.medium};
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const StatNumber = styled.div`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: ${({ theme }) => theme.fontSizes.xxlarge};
  color: ${({ theme }) => theme.colors.primary};
  font-weight: 700;
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const StatLabel = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.small};
  color: ${({ theme }) => theme.colors.text};
  font-weight: 500;
`;

const QuickActions = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: repeat(2, 1fr);
  gap: ${({ theme }) => theme.spacing.md};
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
  
  @media (max-width: ${({ theme }) => theme.breakpoints.desktop}) {
    margin-left: 0;
    margin-right: 0;
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    grid-template-columns: 1fr;
    max-width: 100%;
  }
`;

const ActionCard = styled(Link)`
  background: ${({ theme }) => theme.colors.white};
  border-radius: 12px;
  padding: ${({ theme }) => theme.spacing.lg};
  box-shadow: ${({ theme }) => theme.shadows.small};
  text-align: center;
  transition: all ${({ theme }) => theme.transitions.medium};
  border: 2px solid transparent;
  text-decoration: none;

  &:hover {
    transform: translateY(-3px);
    box-shadow: ${({ theme }) => theme.shadows.large};
    border-color: ${({ theme }) => theme.colors.primary};
    text-decoration: none;
  }

  @media (max-width: 450px) {
    padding: ${({ theme }) => theme.spacing.md};
  }
`;

const ActionIcon = styled.div`
  font-size: 40px;
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const NotificationBadge = styled.div`
  position: absolute;
  top: 15px;
  right: 15px;
  background: #ef4444;
  color: white;
  border-radius: 50%;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 700;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
`;

const ActionTitle = styled.h3`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: ${({ theme }) => theme.fontSizes.medium};
  color: ${({ theme }) => theme.colors.secondary};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const ActionDescription = styled.p`
  color: ${({ theme }) => theme.colors.textLight};
  font-size: ${({ theme }) => theme.fontSizes.small};
`;

const InfoSection = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};
`;

const InfoCard = styled.div`
  background: ${({ theme }) => theme.colors.white};
  border-radius: 12px;
  padding: ${({ theme }) => theme.spacing.xl};
  box-shadow: ${({ theme }) => theme.shadows.small};
`;

const InfoTitle = styled.h3`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: ${({ theme }) => theme.fontSizes.large};
  color: ${({ theme }) => theme.colors.secondary};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  border-bottom: 2px solid ${({ theme }) => theme.colors.primary};
  padding-bottom: ${({ theme }) => theme.spacing.sm};
`;

const FeaturesList = styled.ul`
  list-style: none;
  padding: 0;
`;

const FeatureItem = styled.li`
  color: ${({ theme }) => theme.colors.text};
  padding: ${({ theme }) => theme.spacing.sm} 0;
  line-height: 1.6;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};

  &:last-child {
    border-bottom: none;
  }
`;

const HoursList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`;

const HourItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.sm};
  background: ${({ theme }) => theme.colors.background};
  border-radius: 8px;
`;

const Day = styled.span`
  font-weight: 600;
  color: ${({ theme }) => theme.colors.secondary};
`;

const Time = styled.span`
  color: ${({ theme }) => theme.colors.primary};
  font-weight: 500;
`;
