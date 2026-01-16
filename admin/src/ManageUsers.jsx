import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import api from './api';
import { Container, Header, Table, Button, DangerButton, Filters, Input, Modal, ModalOverlay, ModalActions, FormGroup, Select, Loading } from './components/SharedStyles';

const SearchBar = styled.input`
  padding: 0.75rem 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  min-width: 300px;
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
  }
`;

const Badge = styled.span`
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.875rem;
  font-weight: 500;
  
  ${props => {
    if (props.role === 'admin') {
      return 'background: #dcfce7; color: #16a34a;';
    }
    return 'background: #dbeafe; color: #2563eb;';
  }}
`;

const StatusBadge = styled.span`
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.875rem;
  font-weight: 500;
  
  ${props => props.active ? 
    'background: #dcfce7; color: #16a34a;' : 
    'background: #fee2e2; color: #dc2626;'
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const ActionButton = styled.button`
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  
  ${props => {
    if (props.variant === 'view') {
      return `
        background: linear-gradient(135deg, ${props.theme.colors.primary}, ${props.theme.colors.accent});
        color: white;
        &:hover { 
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(201, 166, 132, 0.4);
        }
      `;
    }
    if (props.variant === 'toggle') {
      return `
        background: linear-gradient(135deg, #f59e0b, #d97706);
        color: white;
        &:hover { 
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(245, 158, 11, 0.4);
        }
      `;
    }
    return `
      background: linear-gradient(135deg, #dc2626, #ef4444);
      color: white;
      &:hover { 
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(220, 38, 38, 0.4);
      }
    `;
  }}
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  color: ${props => props.theme.colors.textLight};
`;

const ModalContent = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 8px;
  max-width: 600px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
`;

const UserDetail = styled.div`
  margin-bottom: 1rem;
  
  label {
    display: block;
    font-weight: 600;
    color: ${props => props.theme.colors.primary};
    margin-bottom: 0.25rem;
  }
  
  p {
    color: ${props => props.theme.colors.text};
    margin: 0;
  }
`;

const CloseButton = styled.button`
  margin-top: 1rem;
  padding: 0.75rem 1.5rem;
  background: ${props => props.theme.colors.primary};
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  width: 100%;
  
  &:hover {
    background: ${props => props.theme.colors.secondary};
  }
`;

const Stats = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  text-align: center;
  
  .value {
    font-size: 2rem;
    font-weight: bold;
    color: ${props => props.theme.colors.primary};
    margin-bottom: 0.5rem;
  }
  
  .label {
    color: ${props => props.theme.colors.text};
    opacity: 0.7;
    font-size: 0.875rem;
    text-transform: uppercase;
  }
`;

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [processingId, setProcessingId] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    admins: 0
  });

  useEffect(() => {
    fetchUsers();
    
    // Auto-refresh every 30 seconds for live updates
    const interval = setInterval(() => {
      fetchUsers();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm]);

  const fetchUsers = async () => {
    try {
      console.log('Fetching users...');
      const response = await api.get('/users/?page_size=1000');
      // Handle both paginated and non-paginated responses
      const data = response.data.results 
        ? response.data.results 
        : (Array.isArray(response.data) ? response.data : []);
      console.log('Fetched users:', data.length);
      setUsers(data);
      
      // Calculate stats
      const total = data.length;
      const active = data.filter(u => u.is_active).length;
      const admins = data.filter(u => u.is_staff || u.is_superuser).length;
      
      setStats({
        total,
        active,
        inactive: total - active,
        admins
      });
      
      setLoading(false);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]);
      setLoading(false);
    }
  };

  const filterUsers = () => {
    if (!Array.isArray(users)) {
      setFilteredUsers([]);
      return;
    }
    
    if (!searchTerm) {
      setFilteredUsers(users);
      return;
    }

    const filtered = users.filter(user =>
      user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.last_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    setFilteredUsers(filtered);
  };

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    setProcessingId(userId);
    try {
      console.log('Toggling user status:', userId, 'from', currentStatus, 'to', !currentStatus);
      const response = await api.patch(`/users/${userId}/`, {
        is_active: !currentStatus
      });
      console.log('Toggle response:', response);
      
      // Optimistically update local state
      setUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, is_active: !currentStatus } : user
      ));
      
      await fetchUsers();
      setProcessingId(null);
      alert(`User ${!currentStatus ? 'activated' : 'deactivated'} successfully!`);
    } catch (error) {
      console.error('Error updating user status:', error);
      console.error('Error response:', error.response?.data);
      setProcessingId(null);
      alert(`Failed to update user status: ${error.response?.data?.detail || error.message}`);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      setProcessingId(userId);
      try {
        console.log('Deleting user:', userId);
        await api.delete(`/users/${userId}/`);
        
        // Optimistically remove from local state
        setUsers(prev => prev.filter(user => user.id !== userId));
        
        await fetchUsers();
        setProcessingId(null);
        alert('User deleted successfully!');
      } catch (error) {
        console.error('Error deleting user:', error);
        console.error('Error response:', error.response?.data);
        setProcessingId(null);
        alert(`Failed to delete user: ${error.response?.data?.detail || error.message}`);
      }
    }
  };

  if (loading) {
    return <Container><p>Loading users...</p></Container>;
  }

  return (
    <Container>
      <Header>
        <div>
          <h1>Manage Users</h1>
          <p style={{color: '#666', margin: '0.5rem 0 0 0', fontSize: '0.95rem'}}>Total: {users.length} users</p>
          {lastUpdated && <small style={{color: '#666', fontSize: '0.85rem'}}>Last updated: {lastUpdated.toLocaleTimeString()}</small>}
        </div>
        <SearchBar
          type="text"
          placeholder="Search users by name, email, or username..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </Header>

      <Stats>
        <StatCard>
          <div className="value">{stats.total}</div>
          <div className="label">Total Users</div>
        </StatCard>
        <StatCard>
          <div className="value">{stats.active}</div>
          <div className="label">Active Users</div>
        </StatCard>
        <StatCard>
          <div className="value">{stats.inactive}</div>
          <div className="label">Inactive Users</div>
        </StatCard>
        <StatCard>
          <div className="value">{stats.admins}</div>
          <div className="label">Administrators</div>
        </StatCard>
      </Stats>

      {filteredUsers.length === 0 ? (
        <EmptyState>
          <p>No users found</p>
        </EmptyState>
      ) : (
        <Table>
          <thead>
            <tr>
              <th>Username</th>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(user => (
              <tr key={user.id}>
                <td>{user.username}</td>
                <td>{user.first_name} {user.last_name}</td>
                <td>{user.email}</td>
                <td>
                  <Badge role={user.is_staff || user.is_superuser ? 'admin' : 'user'}>
                    {user.is_staff || user.is_superuser ? 'Admin' : 'User'}
                  </Badge>
                </td>
                <td>
                  <StatusBadge active={user.is_active}>
                    {user.is_active ? 'Active' : 'Inactive'}
                  </StatusBadge>
                </td>
                <td>{new Date(user.date_joined).toLocaleDateString()}</td>
                <td>
                  <ActionButtons>
                    <ActionButton 
                      variant="view" 
                      onClick={() => handleViewUser(user)}
                      disabled={processingId === user.id}
                    >
                      View
                    </ActionButton>
                    <ActionButton 
                      variant="toggle"
                      onClick={() => handleToggleStatus(user.id, user.is_active)}
                      disabled={processingId === user.id}
                    >
                      {processingId === user.id ? 'Processing...' : (user.is_active ? 'Deactivate' : 'Activate')}
                    </ActionButton>
                    <ActionButton 
                      onClick={() => handleDeleteUser(user.id)}
                      disabled={user.is_superuser || processingId === user.id}
                    >
                      {processingId === user.id ? 'Deleting...' : 'Delete'}
                    </ActionButton>
                  </ActionButtons>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {showModal && selectedUser && (
        <Modal onClick={() => setShowModal(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <h2>User Details</h2>
            
            <UserDetail>
              <label>Username</label>
              <p>{selectedUser.username}</p>
            </UserDetail>
            
            <UserDetail>
              <label>Full Name</label>
              <p>{selectedUser.first_name} {selectedUser.last_name}</p>
            </UserDetail>
            
            <UserDetail>
              <label>Email</label>
              <p>{selectedUser.email}</p>
            </UserDetail>
            
            <UserDetail>
              <label>Status</label>
              <p>{selectedUser.is_active ? 'Active' : 'Inactive'}</p>
            </UserDetail>
            
            <UserDetail>
              <label>Role</label>
              <p>{selectedUser.is_superuser ? 'Super Admin' : selectedUser.is_staff ? 'Staff' : 'User'}</p>
            </UserDetail>
            
            <UserDetail>
              <label>Date Joined</label>
              <p>{new Date(selectedUser.date_joined).toLocaleString()}</p>
            </UserDetail>
            
            <UserDetail>
              <label>Last Login</label>
              <p>{selectedUser.last_login ? new Date(selectedUser.last_login).toLocaleString() : 'Never'}</p>
            </UserDetail>
            
            <CloseButton onClick={() => setShowModal(false)}>
              Close
            </CloseButton>
          </ModalContent>
        </Modal>
      )}
    </Container>
  );
};

export default ManageUsers;
