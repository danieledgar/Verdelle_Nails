import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { useAuth } from "../context/AuthContext";
import {
  FaCalendarAlt,
  FaStar,
  FaBell,
  FaUser,
  FaGift,
  FaHistory,
} from "react-icons/fa";
import api from "../services/api";

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    let mounted = true;

    const fetchNotifications = async () => {
      try {
        const response = await api.get("/notifications/");
        const notifList = response.data?.results || response.data || [];

        if (mounted) {
          setNotifications(notifList);
          setUnreadCount(notifList.filter((n) => !n.is_read).length);
        }
      } catch (error) {
        if (mounted) {
          setNotifications([]);
          setUnreadCount(0);
        }
        console.error("Error fetching notifications:", error);
      }
    };

    fetchNotifications();

    return () => {
      mounted = false;
    };
  }, []);

  const getProfilePictureUrl = () => {
    if (!user?.profile_picture) return null;

    if (user.profile_picture.startsWith("http")) {
      return user.profile_picture;
    }

    const baseUrl = (process.env.REACT_APP_API_URL || "").replace(/\/api$/, "");
    return `${baseUrl}${user.profile_picture}`;
  };

  const profilePicUrl = getProfilePictureUrl();

  const handleProfileClick = () => {
    navigate("/profile");
  };

  return (
    <Container>
      <Hero>
        <WelcomeText>
          Welcome back, {user?.first_name || user?.username}!
        </WelcomeText>
        <Subtitle>Elegance at your fingertips</Subtitle>
      </Hero>

      <Content>
        <TopSection>
          <ProfileCard onClick={handleProfileClick}>
            <ProfileAvatar>
              {profilePicUrl ? (
                <AvatarImage
                  src={profilePicUrl}
                  alt={user?.username}
                  onError={(e) => (e.target.style.display = "none")}
                />
              ) : (
                <AvatarPlaceholder>
                  <FaUser />
                </AvatarPlaceholder>
              )}
            </ProfileAvatar>

            <ProfileInfo>
              <ProfileName>
                {user?.first_name} {user?.last_name}
              </ProfileName>
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
              <ActionDescription>
                Schedule your next nail session
              </ActionDescription>
            </ActionCard>

            <ActionCard to="/services">
              <ActionIcon>
                <FaStar />
              </ActionIcon>
              <ActionTitle>Browse Services</ActionTitle>
              <ActionDescription>
                Explore our premium nail services
              </ActionDescription>
            </ActionCard>

            <ActionCard to="/notifications" style={{ position: "relative" }}>
              <ActionIcon>
                <FaBell />
              </ActionIcon>
              {unreadCount > 0 && <NotificationBadge>{unreadCount}</NotificationBadge>}
              <ActionTitle>Notifications</ActionTitle>
              <ActionDescription>
                View your messages and updates
              </ActionDescription>
            </ActionCard>

            <ActionCard to="/appointments">
              <ActionIcon>
                <FaHistory />
              </ActionIcon>
              <ActionTitle>My Appointments</ActionTitle>
              <ActionDescription>
                View your booking history
              </ActionDescription>
            </ActionCard>
          </QuickActions>
        </TopSection>

        <AboutSection>
          <SectionTitle>About Verdelle Nails</SectionTitle>
          <AboutText>
            Welcome to Verdelle Nails, where elegance meets expertise. We
            specialize in premium nail care services, offering everything from
            classic manicures to intricate nail art designs.
          </AboutText>
          <AboutText>
            <strong>Our Mission:</strong> To provide exceptional nail care
            services in a luxurious and relaxing environment, making every
            client feel pampered and beautiful.
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

/* ================= STYLED COMPONENTS ================= */

const Container = styled.div`
  min-height: 100vh;
  background: ${({ theme }) => theme.colors.background};
  padding-bottom: 80px;
`;

const Hero = styled.div`
  text-align: center;
  padding: ${({ theme }) => theme.spacing.xxl} 0;
`;

const WelcomeText = styled.h1`
  font-size: ${({ theme }) => theme.fontSizes.xxlarge};
  color: ${({ theme }) => theme.colors.primary};
`;

const Subtitle = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.large};
  color: ${({ theme }) => theme.colors.textLight};
  margin-top: ${({ theme }) => theme.spacing.sm};
`;

const Content = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacing.xl};
`;

const TopSection = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.lg};
`;

const ProfileCard = styled.div`
  flex: 1 1 300px;
  background: ${({ theme }) => theme.colors.white};
  border-radius: 16px;
  padding: ${({ theme }) => theme.spacing.lg};
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  box-shadow: ${({ theme }) => theme.shadows.medium};
`;

const ProfileAvatar = styled.div`
  width: 100px;
  height: 100px;
  margin-bottom: ${({ theme }) => theme.spacing.md};
  border-radius: 50%;
  overflow: hidden;
`;

const AvatarImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const AvatarPlaceholder = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #e5e7eb;
  color: #6b7280;
  font-size: 2rem;
`;

const ProfileInfo = styled.div`
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const ProfileName = styled.h3`
  margin: 0;
  font-size: ${({ theme }) => theme.fontSizes.large};
`;

const ProfileEmail = styled.p`
  margin: 0;
  font-size: ${({ theme }) => theme.fontSizes.medium};
  color: ${({ theme }) => theme.colors.textLight};
`;

const LoyaltyCard = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: ${({ theme }) => theme.spacing.md};
  color: ${({ theme }) => theme.colors.primary};
`;

const LoyaltyPoints = styled.span`
  font-weight: bold;
  margin-top: ${({ theme }) => theme.spacing.xs};
`;

const LoyaltyText = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.small};
`;

const QuickActions = styled.div`
  flex: 2 1 600px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: ${({ theme }) => theme.spacing.md};
`;

const ActionCard = styled(Link)`
  background: ${({ theme }) => theme.colors.white};
  border-radius: 12px;
  padding: ${({ theme }) => theme.spacing.md};
  text-decoration: none;
  color: inherit;
  box-shadow: ${({ theme }) => theme.shadows.small};
  transition: all 0.2s;

  &:hover {
    transform: translateY(-3px);
    box-shadow: ${({ theme }) => theme.shadows.medium};
  }
`;

const ActionIcon = styled.div`
  font-size: 1.5rem;
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  color: ${({ theme }) => theme.colors.primary};
`;

const ActionTitle = styled.h4`
  margin: 0;
  font-size: ${({ theme }) => theme.fontSizes.medium};
`;

const ActionDescription = styled.p`
  margin: 0;
  font-size: ${({ theme }) => theme.fontSizes.small};
  color: ${({ theme }) => theme.colors.textLight};
`;

const NotificationBadge = styled.span`
  position: absolute;
  top: 0;
  right: 0;
  background: #ef4444;
  color: white;
  font-size: 0.75rem;
  font-weight: bold;
  padding: 2px 6px;
  border-radius: 50%;
`;

/* About Section / Stats */
const AboutSection = styled.section`
  margin-top: ${({ theme }) => theme.spacing.xxxl};
`;

const SectionTitle = styled.h2`
  font-size: ${({ theme }) => theme.fontSizes.xxlarge};
  font-family: ${({ theme }) => theme.fonts.heading};
  color: ${({ theme }) => theme.colors.secondary};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const AboutText = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.medium};
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  line-height: 1.6;
`;

const AboutStats = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.xl};
  margin-top: ${({ theme }) => theme.spacing.lg};
  flex-wrap: wrap;
`;

const StatItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const StatNumber = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.xxlarge};
  font-weight: 700;
  color: ${({ theme }) => theme.colors.primary};
`;

const StatLabel = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.medium};
  color: ${({ theme }) => theme.colors.textLight};
`;

export default Dashboard;
