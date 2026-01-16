import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import api from './api';
import { Container, Header, Table, StatusBadge, Button, DangerButton, SecondaryButton, Filters, Input, Select, Modal, ModalOverlay, ModalActions, FormGroup, Loading } from './components/SharedStyles';

const PaymentBadge = styled.span`
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.875rem;
  font-weight: 500;
  
  ${props => {
    switch(props.status) {
      case 'completed':
        return 'background: #dcfce7; color: #16a34a;';
      case 'pending':
        return 'background: #fef3c7; color: #d97706;';
      case 'failed':
        return 'background: #fee2e2; color: #dc2626;';
      default:
        return 'background: #f3f4f6; color: #6b7280;';
    }
  }}
`;

const FilterSelect = styled.select`
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  min-width: 150px;
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
  }
`;

const SearchInput = styled.input`
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

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  color: ${props => props.theme.colors.textLight};
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
  font-weight: 600;
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};
  box-shadow: ${props => props.theme.shadows.small};
  
  ${props => {
    if (props.variant === 'confirm') {
      return `
        background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
        color: white;
        &:hover { transform: translateY(-2px); box-shadow: ${props.theme.shadows.medium}; }
      `;
    }
    if (props.variant === 'cancel') {
      return `
        background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
        color: white;
        &:hover { transform: translateY(-2px); box-shadow: ${props.theme.shadows.medium}; }
      `;
    }
    return `
      background: linear-gradient(135deg, ${props.theme.colors.primary} 0%, ${props.theme.colors.accent} 100%);
      color: white;
      &:hover { transform: translateY(-2px); box-shadow: ${props.theme.shadows.medium}; }
    `;
  }}
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ManageAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [lastUpdated, setLastUpdated] = useState(null);
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    fetchAppointments();
    
    // Auto-refresh every 30 seconds for live updates
    const interval = setInterval(() => {
      fetchAppointments();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    filterAppointments();
  }, [appointments, statusFilter, paymentFilter, searchTerm]);

  const fetchAppointments = async () => {
    try {
      console.log('Fetching appointments...');
      const response = await api.get('/appointments/?page_size=1000');
      const data = response.data.results 
        ? response.data.results 
        : (Array.isArray(response.data) ? response.data : []);
      console.log('Fetched appointments:', data.length);
      setAppointments(data);
      setLoading(false);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching appointments:', error);
      setAppointments([]);
      setLoading(false);
    }
  };

  const filterAppointments = () => {
    if (!Array.isArray(appointments)) {
      setFilteredAppointments([]);
      return;
    }
    
    let filtered = [...appointments];

    if (statusFilter !== 'all') {
      filtered = filtered.filter(apt => apt.status === statusFilter);
    }

    if (paymentFilter !== 'all') {
      filtered = filtered.filter(apt => apt.payment_status === paymentFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(apt =>
        apt.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt.customer_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt.service_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredAppointments(filtered);
  };

  const updateAppointmentStatus = async (id, status) => {
    setProcessingId(id);
    try {
      console.log('Updating appointment:', id, 'to status:', status);
      
      // If completing appointment, also mark payment as completed
      const updateData = { status };
      if (status === 'completed') {
        updateData.payment_status = 'completed';
      }
      
      const response = await api.patch(`/appointments/${id}/`, updateData);
      console.log('Update response:', response);
      
      // Optimistically update the local state immediately
      setAppointments(prev => prev.map(apt => 
        apt.id === id ? { ...apt, ...updateData } : apt
      ));
      
      // Then fetch fresh data from server
      await fetchAppointments();
      setProcessingId(null);
      alert(`Appointment status updated to "${status}" successfully!`);
    } catch (error) {
      console.error('Error updating appointment:', error);
      console.error('Error response:', error.response?.data);
      setProcessingId(null);
      alert(`Failed to update appointment status: ${error.response?.data?.detail || error.message}`);
    }
  };

  const deleteAppointment = async (id) => {
    if (window.confirm('Are you sure you want to delete this appointment? This action cannot be undone.')) {
      setProcessingId(id);
      try {
        console.log('Deleting appointment:', id);
        await api.delete(`/appointments/${id}/`);
        
        // Optimistically remove from local state immediately
        setAppointments(prev => prev.filter(apt => apt.id !== id));
        
        // Then fetch fresh data from server
        await fetchAppointments();
        setProcessingId(null);
        alert('Appointment deleted successfully!');
      } catch (error) {
        console.error('Error deleting appointment:', error);
        console.error('Error response:', error.response?.data);
        setProcessingId(null);
        alert(`Failed to delete appointment: ${error.response?.data?.detail || error.message}`);
      }
    }
  };

  if (loading) {
    return <Container><p>Loading appointments...</p></Container>;
  }

  return (
    <Container>
      <Header>
        <div>
          <h1>Manage Appointments</h1>
          <p style={{color: '#666', margin: '0.5rem 0'}}>
            Total: {appointments.length} appointments | 
            Showing: {filteredAppointments.length} {statusFilter !== 'all' && `(${statusFilter})`}
          </p>
          {lastUpdated && <small style={{color: '#666', fontSize: '0.85rem'}}>Last updated: {lastUpdated.toLocaleTimeString()}</small>}
        </div>
      </Header>

      <Filters>
        <FilterSelect 
          value={statusFilter} 
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </FilterSelect>

        <FilterSelect 
          value={paymentFilter} 
          onChange={(e) => setPaymentFilter(e.target.value)}
        >
          <option value="all">All Payments</option>
          <option value="pending">Pending Payment</option>
          <option value="completed">Paid</option>
          <option value="failed">Failed</option>
        </FilterSelect>

        <SearchInput
          type="text"
          placeholder="Search by client name, email, or service..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </Filters>

      {filteredAppointments.length === 0 ? (
        <EmptyState>
          <p>No appointments found</p>
        </EmptyState>
      ) : (
        <Table>
          <thead>
            <tr>
              <th>Date & Time</th>
              <th>Client</th>
              <th>Service</th>
              <th>Status</th>
              <th>Payment</th>
              <th>Amount</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAppointments.map(appointment => (
              <tr key={appointment.id}>
                <td>
                  {new Date(appointment.appointment_date).toLocaleDateString()}<br />
                  <small>{appointment.appointment_time}</small>
                </td>
                <td>
                  {appointment.customer_name}<br />
                  <small>{appointment.customer_email}</small>
                </td>
                <td>{appointment.service_name || 'N/A'}</td>
                <td>
                  <StatusBadge status={appointment.status}>
                    {appointment.status}
                  </StatusBadge>
                </td>
                <td>
                  <PaymentBadge status={appointment.payment_status}>
                    {appointment.payment_status}
                  </PaymentBadge>
                </td>
                <td>KSh {appointment.amount_paid || '0.00'}</td>
                <td>
                  <ActionButtons>
                    {appointment.status === 'pending' && (
                      <ActionButton
                        variant="confirm"
                        onClick={() => updateAppointmentStatus(appointment.id, 'confirmed')}
                        disabled={processingId === appointment.id}
                      >
                        {processingId === appointment.id ? 'Processing...' : 'Confirm'}
                      </ActionButton>
                    )}
                    {appointment.status === 'confirmed' && (
                      <ActionButton
                        onClick={() => updateAppointmentStatus(appointment.id, 'completed')}
                        disabled={processingId === appointment.id}
                      >
                        {processingId === appointment.id ? 'Processing...' : 'Complete'}
                      </ActionButton>
                    )}
                    <ActionButton
                      variant="cancel"
                      onClick={() => deleteAppointment(appointment.id)}
                      disabled={processingId === appointment.id}
                    >
                      {processingId === appointment.id ? 'Deleting...' : 'Delete'}
                    </ActionButton>
                  </ActionButtons>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </Container>
  );
};

export default ManageAppointments;
