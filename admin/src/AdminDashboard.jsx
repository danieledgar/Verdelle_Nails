import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import api from './api';

const DashboardContainer = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
  min-height: calc(100vh - 80px);
`;

const Header = styled.div`
  margin-bottom: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  h1 {
    color: ${props => props.theme.colors.primary};
    margin-bottom: 0.5rem;
  }
  
  p {
    color: ${props => props.theme.colors.textLight};
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: ${props => props.theme.shadows.large};
  transition: all ${props => props.theme.transitions.fast};
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: ${props => props.theme.shadows.large}, 0 12px 28px rgba(0, 0, 0, 0.12);
  }
  
  h3 {
    color: ${props => props.theme.colors.textLight};
    font-size: 0.9rem;
    font-weight: 500;
    margin-bottom: 0.5rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  
  .value {
    font-size: 2rem;
    font-weight: bold;
    color: ${props => props.theme.colors.primary};
    margin-bottom: 0.5rem;
  }
  
  .change {
    font-size: 0.875rem;
    color: ${props => props.positive ? '#22c55e' : '#ef4444'};
  }
`;

const QuickActions = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
`;

const ActionButton = styled.button`
  padding: 1rem;
  background: linear-gradient(135deg, ${props => props.theme.colors.primary} 0%, ${props => props.theme.colors.accent} 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};
  box-shadow: ${props => props.theme.shadows.medium};
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: ${props => props.theme.shadows.large};
  }
`;

const RecentActivity = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: ${props => props.theme.shadows.large};
  
  h2 {
    color: ${props => props.theme.colors.secondary};
    margin-bottom: 1rem;
    font-family: ${props => props.theme.fonts.heading};
  }
`;

const ActivityList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const ActivityItem = styled.div`
  padding: 1rem;
  background: ${props => props.theme.colors.background};
  border-radius: 4px;
  border-left: 4px solid ${props => props.theme.colors.primary};
  
  .time {
    font-size: 0.875rem;
    color: ${props => props.theme.colors.textLight};
    margin-bottom: 0.25rem;
  }
  
  .description {
    color: ${props => props.theme.colors.text};
  }
`;

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalAppointments: 0,
    pendingAppointments: 0,
    totalRevenue: 0,
    totalUsers: 0,
    totalServices: 0,
    totalGalleryItems: 0
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    fetchDashboardData();
    
    // Auto-refresh every 30 seconds for live updates
    const interval = setInterval(() => {
      fetchDashboardData();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      console.log('Fetching dashboard data...');
      // Fetch all data in parallel - add ?page_size=1000 to get all records
      const [appointmentsRes, usersRes, servicesRes, galleryRes, transactionsRes] = await Promise.all([
        api.get('/appointments/?page_size=1000'),
        api.get('/users/?page_size=1000'),
        api.get('/services/?page_size=1000'),
        api.get('/gallery/?page_size=1000'),
        api.get('/transactions/?page_size=1000')
      ]);
      
      // Handle paginated responses
      const appointments = appointmentsRes.data.results 
        ? appointmentsRes.data.results 
        : (Array.isArray(appointmentsRes.data) ? appointmentsRes.data : []);
      
      const users = usersRes.data.results 
        ? usersRes.data.results 
        : (Array.isArray(usersRes.data) ? usersRes.data : []);
      
      const services = servicesRes.data.results 
        ? servicesRes.data.results 
        : (Array.isArray(servicesRes.data) ? servicesRes.data : []);
      
      const gallery = galleryRes.data.results 
        ? galleryRes.data.results 
        : (Array.isArray(galleryRes.data) ? galleryRes.data : []);
      
      const transactions = transactionsRes.data.results 
        ? transactionsRes.data.results 
        : (Array.isArray(transactionsRes.data) ? transactionsRes.data : []);
      
      const totalAppointments = appointments.length;
      const pendingAppointments = appointments.filter(
        apt => apt.status === 'pending'
      ).length;
      
      // Calculate total revenue from completed appointments
      const appointmentRevenue = appointments
        .filter(apt => apt.status === 'completed')
        .reduce((sum, apt) => sum + parseFloat(apt.amount_paid || 0), 0);
      
      // Also include completed transactions (for any other payments)
      const transactionRevenue = transactions
        .filter(txn => txn.status === 'completed')
        .reduce((sum, txn) => sum + parseFloat(txn.amount || 0), 0);
      
      const totalRevenue = appointmentRevenue + transactionRevenue;

      setStats({
        totalAppointments,
        pendingAppointments,
        totalRevenue: totalRevenue.toFixed(2),
        totalUsers: users.length,
        totalServices: services.length,
        totalGalleryItems: gallery.length
      });

      // Create recent activities from appointments - sort by date descending
      const recent = appointments
        .sort((a, b) => new Date(b.appointment_date) - new Date(a.appointment_date))
        .slice(0, 5)
        .map(apt => ({
          time: new Date(apt.appointment_date).toLocaleString(),
          description: `Appointment: ${apt.service_name || 'Service'} - ${apt.customer_name || 'Customer'} (${apt.status})`
        }));
      
      setRecentActivities(recent);
      setLoading(false);
      setLastUpdated(new Date());
      console.log('Dashboard updated:', { totalAppointments, pendingAppointments, totalRevenue: totalRevenue.toFixed(2) });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardContainer>
        <p>Loading dashboard...</p>
      </DashboardContainer>
    );
  }

  return (
    <DashboardContainer>
      <Header>
        <div>
          <h1>Admin Dashboard</h1>
          <p>Welcome back! Here's an overview of your nail salon.</p>
          {lastUpdated && <small style={{color: '#666', fontSize: '0.85rem'}}>Last updated: {lastUpdated.toLocaleTimeString()}</small>}
        </div>
        <button 
          onClick={fetchDashboardData}
          style={{
            padding: '0.75rem 1.5rem',
            background: '#c9a684',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '500'
          }}
        >
          Refresh Data
        </button>
      </Header>

      <StatsGrid>
        <StatCard>
          <h3>Total Appointments</h3>
          <div className="value">{stats.totalAppointments}</div>
          <div className="change positive">All time</div>
        </StatCard>
        
        <StatCard>
          <h3>Pending Appointments</h3>
          <div className="value">{stats.pendingAppointments}</div>
          <div className="change">Requires attention</div>
        </StatCard>
        
        <StatCard>
          <h3>Total Revenue</h3>
          <div className="value">KSh {stats.totalRevenue}</div>
          <div className="change positive">From completed transactions</div>
        </StatCard>
        
        <StatCard>
          <h3>Registered Users</h3>
          <div className="value">{stats.totalUsers}</div>
          <div className="change positive">Total users</div>
        </StatCard>

        <StatCard>
          <h3>Active Services</h3>
          <div className="value">{stats.totalServices}</div>
          <div className="change positive">Available services</div>
        </StatCard>

        <StatCard>
          <h3>Gallery Images</h3>
          <div className="value">{stats.totalGalleryItems}</div>
          <div className="change positive">Portfolio items</div>
        </StatCard>
      </StatsGrid>

      <QuickActions>
        <ActionButton onClick={() => navigate('/appointments')}>
          Manage Appointments
        </ActionButton>
        <ActionButton onClick={() => navigate('/services')}>
          Manage Services
        </ActionButton>
        <ActionButton onClick={() => navigate('/gallery')}>
          Manage Gallery
        </ActionButton>
        <ActionButton onClick={() => navigate('/users')}>
          Manage Users
        </ActionButton>
      </QuickActions>

      <RecentActivity>
        <h2>Recent Activity</h2>
        <ActivityList>
          {recentActivities.length > 0 ? (
            recentActivities.map((activity, index) => (
              <ActivityItem key={index}>
                <div className="time">{activity.time}</div>
                <div className="description">{activity.description}</div>
              </ActivityItem>
            ))
          ) : (
            <p>No recent activity</p>
          )}
        </ActivityList>
      </RecentActivity>
    </DashboardContainer>
  );
};

export default AdminDashboard;
