import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FaBell, FaCheckCircle, FaEnvelopeOpen, FaTrash } from 'react-icons/fa';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, unread, read

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/api/notifications/', {
        headers: {
          'Authorization': `Token ${token}`,
        },
      });
      const data = await response.json();
      const notificationsList = data.results || data;
      setNotifications(notificationsList);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_BASE}/api/notifications/${id}/`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ is_read: true }),
      });
      fetchNotifications();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_BASE}/api/notifications/mark_all_read/`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`,
        },
      });
      fetchNotifications();
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const deleteNotification = async (id) => {
    if (window.confirm('Delete this notification?')) {
      try {
        const token = localStorage.getItem('token');
        await fetch(`${API_BASE}/api/notifications/${id}/`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Token ${token}`,
          },
        });
        fetchNotifications();
      } catch (error) {
        console.error('Error deleting notification:', error);
      }
    }
  };

  const filteredNotifications = notifications.filter(notif => {
    if (filter === 'unread') return !notif.is_read;
    if (filter === 'read') return notif.is_read;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <Container>
      <Content>
        <Controls>
          <FilterButtons>
            <FilterButton active={filter === 'all'} onClick={() => setFilter('all')}>
              All
            </FilterButton>
            <FilterButton active={filter === 'unread'} onClick={() => setFilter('unread')}>
              Unread
            </FilterButton>
            <FilterButton active={filter === 'read'} onClick={() => setFilter('read')}>
              Read
            </FilterButton>
          </FilterButtons>

          {unreadCount > 0 && (
            <MarkAllButton onClick={markAllAsRead}>
              <FaCheckCircle /> Mark All Read
            </MarkAllButton>
          )}
        </Controls>

        {loading ? (
          <LoadingText>Loading notifications...</LoadingText>
        ) : filteredNotifications.length === 0 ? (
          <EmptyState>
            <EmptyIcon>
              <FaBell size={60} />
            </EmptyIcon>
            <EmptyTitle>No Notifications</EmptyTitle>
            <EmptyText>
              {filter === 'unread' && 'You have no unread notifications'}
              {filter === 'read' && 'You have no read notifications'}
              {filter === 'all' && "You don't have any notifications yet"}
            </EmptyText>
          </EmptyState>
        ) : (
          <NotificationsList>
            {filteredNotifications.map((notif, index) => (
              <NotificationCard
                key={notif.id}
                as={motion.div}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                unread={!notif.is_read}
                onClick={() => !notif.is_read && markAsRead(notif.id)}
              >
                <NotificationHeader>
                  <NotificationTitle unread={!notif.is_read}>
                    {notif.title}
                  </NotificationTitle>
                  <NotificationActions>
                    {!notif.is_read && (
                      <ActionButton
                        onClick={(e) => {
                          e.stopPropagation();
                          markAsRead(notif.id);
                        }}
                        title="Mark as read"
                      >
                        <FaEnvelopeOpen />
                      </ActionButton>
                    )}
                    <ActionButton
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(notif.id);
                      }}
                      title="Delete"
                      danger
                    >
                      <FaTrash />
                    </ActionButton>
                  </NotificationActions>
                </NotificationHeader>

                <NotificationMessage>{notif.message}</NotificationMessage>

                <NotificationFooter>
                  <NotificationType type={notif.notification_type}>
                    {notif.notification_type.replace('_', ' ')}
                  </NotificationType>
                  <NotificationTime>
                    {new Date(notif.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </NotificationTime>
                </NotificationFooter>
              </NotificationCard>
            ))}
          </NotificationsList>
        )}
      </Content>
    </Container>
  );
};

// Styled Components
const Container = styled.div`
  min-height: calc(100vh - 180px);
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.background} 0%, ${({ theme }) => theme.colors.accent}11 100%);
`;

const Content = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacing.xxl} ${({ theme }) => theme.spacing.lg};
  padding-top: 140px;

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    padding: ${({ theme }) => theme.spacing.xl} ${({ theme }) => theme.spacing.md};
    padding-top: 120px;
  }
`;

const Controls = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.md};
`;

const FilterButtons = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const FilterButton = styled.button`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.lg};
  border: 2px solid ${({ theme, active }) => active ? theme.colors.primary : theme.colors.border};
  background: ${({ theme, active }) => active ? theme.colors.primary : theme.colors.white};
  color: ${({ theme, active }) => active ? theme.colors.white : theme.colors.text};
  border-radius: 8px;
  font-size: ${({ theme }) => theme.fontSizes.medium};
  font-weight: 600;
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.medium};

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.shadows.small};
  }
`;

const MarkAllButton = styled.button`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.lg};
  background: #10b981;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: ${({ theme }) => theme.fontSizes.medium};
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  transition: all ${({ theme }) => theme.transitions.medium};

  &:hover {
    background: #059669;
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.shadows.medium};
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
  font-size: ${({ theme }) => theme.fontSizes.medium};
`;

const NotificationsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`;

const NotificationCard = styled.div`
  background: ${({ theme, unread }) => unread ? '#eff6ff' : theme.colors.white};
  border-left: 4px solid ${({ theme, unread }) => unread ? theme.colors.primary : 'transparent'};
  padding: ${({ theme }) => theme.spacing.lg};
  border-radius: 12px;
  box-shadow: ${({ theme }) => theme.shadows.small};
  transition: all ${({ theme }) => theme.transitions.medium};
  cursor: ${({ unread }) => unread ? 'pointer' : 'default'};

  &:hover {
    transform: translateX(4px);
    box-shadow: ${({ theme }) => theme.shadows.medium};
  }
`;

const NotificationHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const NotificationTitle = styled.h3`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: ${({ theme }) => theme.fontSizes.large};
  color: ${({ theme }) => theme.colors.secondary};
  margin: 0;
  font-weight: ${({ unread }) => unread ? '700' : '600'};
  flex: 1;
`;

const NotificationActions = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const ActionButton = styled.button`
  background: ${({ danger }) => danger ? '#fee2e2' : '#f3f4f6'};
  color: ${({ danger }) => danger ? '#dc2626' : '#6b7280'};
  border: none;
  padding: ${({ theme }) => theme.spacing.xs};
  border-radius: 6px;
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.fast};
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: ${({ danger }) => danger ? '#fecaca' : '#e5e7eb'};
    transform: scale(1.1);
  }

  svg {
    font-size: 0.875rem;
  }
`;

const NotificationMessage = styled.p`
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.fontSizes.medium};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  white-space: pre-wrap;
  line-height: 1.6;
`;

const NotificationFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const NotificationType = styled.span`
  background: ${({ type }) => {
    switch(type) {
      case 'contact_reply': return '#dbeafe';
      case 'appointment': return '#fef3c7';
      default: return '#e5e7eb';
    }
  }};
  color: ${({ type }) => {
    switch(type) {
      case 'contact_reply': return '#1e40af';
      case 'appointment': return '#92400e';
      default: return '#374151';
    }
  }};
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  border-radius: 12px;
  font-size: ${({ theme }) => theme.fontSizes.small};
  font-weight: 600;
  text-transform: capitalize;
`;

const NotificationTime = styled.span`
  color: ${({ theme }) => theme.colors.textLight};
  font-size: ${({ theme }) => theme.fontSizes.small};
`;

export default Notifications;
