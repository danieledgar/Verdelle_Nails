import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import api from './api';
import { Container, Header, Table, StatusBadge, Filters, Input, Select, Loading } from './components/SharedStyles';

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

const Stats = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
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
    color: ${props => props.theme.colors.textLight};
    font-size: 0.875rem;
    text-transform: uppercase;
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
    if (props.variant === 'confirm') {
      return `
        background: linear-gradient(135deg, #22c55e, #16a34a);
        color: white;
        &:hover { 
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(34, 197, 94, 0.4);
        }
      `;
    }
    if (props.variant === 'cancel') {
      return `
        background: linear-gradient(135deg, #dc2626, #ef4444);
        color: white;
        &:hover { 
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(220, 38, 38, 0.4);
        }
      `;
    }
    return `
      background: linear-gradient(135deg, ${props.theme.colors.primary}, ${props.theme.colors.accent});
      color: white;
      &:hover { 
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(201, 166, 132, 0.4);
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

const ManageTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [processingId, setProcessingId] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    failed: 0,
    totalAmount: 0
  });

  useEffect(() => {
    fetchTransactions();
    
    // Auto-refresh every 30 seconds for live updates
    const interval = setInterval(() => {
      fetchTransactions();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    filterTransactions();
  }, [transactions, statusFilter]);

  const fetchTransactions = async () => {
    try {
      console.log('Fetching transactions...');
      const response = await api.get('/transactions/?page_size=1000');
      const data = response.data.results 
        ? response.data.results 
        : (Array.isArray(response.data) ? response.data : []);
      console.log('Fetched transactions:', data.length);
      setTransactions(data);
      
      // Calculate stats
      const total = data.length;
      const completed = data.filter(t => t.status === 'completed').length;
      const pending = data.filter(t => ['pending', 'initiated'].includes(t.status)).length;
      const failed = data.filter(t => ['failed', 'cancelled'].includes(t.status)).length;
      const totalAmount = data
        .filter(t => t.status === 'completed')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);
      
      setStats({ total, completed, pending, failed, totalAmount: totalAmount.toFixed(2) });
      setLoading(false);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setLoading(false);
    }
  };

  const filterTransactions = () => {
    if (!Array.isArray(transactions)) {
      setFilteredTransactions([]);
      return;
    }
    
    let filtered = [...transactions];

    if (statusFilter !== 'all') {
      filtered = filtered.filter(txn => txn.status === statusFilter);
    }

    setFilteredTransactions(filtered);
  };

  const updateTransactionStatus = async (id, status) => {
    setProcessingId(id);
    try {
      console.log('Updating transaction:', id, 'to status:', status);
      
      // If completing transaction, set completed_at timestamp
      const updateData = { status };
      if (status === 'completed') {
        updateData.completed_at = new Date().toISOString();
      }
      
      const response = await api.patch(`/transactions/${id}/`, updateData);
      console.log('Update response:', response);
      console.log('Updated transaction data:', response.data);
      
      // Optimistically update the local state immediately with the response data
      setTransactions(prev => prev.map(txn => 
        txn.id === id ? { ...txn, ...response.data } : txn
      ));
      
      // Then fetch fresh data from server to ensure consistency
      await fetchTransactions();
      setProcessingId(null);
      
      // Custom success messages
      if (status === 'completed') {
        const completedTime = new Date(response.data.completed_at || updateData.completed_at).toLocaleString();
        alert(`Transaction marked as completed at ${completedTime}! Revenue has been updated.`);
      } else if (status === 'pending') {
        alert('Transaction reset to pending. User can retry payment now.');
      } else {
        alert(`Transaction status updated to "${status}" successfully!`);
      }
    } catch (error) {
      console.error('Error updating transaction:', error);
      console.error('Error response:', error.response?.data);
      setProcessingId(null);
      alert(`Failed to update transaction status: ${error.response?.data?.detail || error.message}`);
    }
  };

  if (loading) {
    return <Container><p>Loading transactions...</p></Container>;
  }

  return (
    <Container>
      <Header>
        <div>
          <h1>Manage Transactions</h1>
          <p style={{color: '#666', margin: '0.5rem 0'}}>Total: {transactions.length} transactions</p>
          {lastUpdated && <small style={{color: '#666', fontSize: '0.85rem'}}>Last updated: {lastUpdated.toLocaleTimeString()}</small>}
        </div>
      </Header>

      <Stats>
        <StatCard>
          <div className="value">{stats.total}</div>
          <div className="label">Total Transactions</div>
        </StatCard>
        <StatCard>
          <div className="value">{stats.completed}</div>
          <div className="label">Completed</div>
        </StatCard>
        <StatCard>
          <div className="value">{stats.pending}</div>
          <div className="label">Pending</div>
        </StatCard>
        <StatCard>
          <div className="value">{stats.failed}</div>
          <div className="label">Failed</div>
        </StatCard>
        <StatCard>
          <div className="value">KSh {stats.totalAmount}</div>
          <div className="label">Total Revenue</div>
        </StatCard>
      </Stats>

      <Filters>
        <FilterSelect 
          value={statusFilter} 
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All Transactions</option>
          <option value="completed">Completed</option>
          <option value="pending">Pending</option>
          <option value="initiated">Initiated</option>
          <option value="failed">Failed</option>
          <option value="cancelled">Cancelled</option>
        </FilterSelect>
      </Filters>

      <Table>
        <thead>
          <tr>
            <th>Transaction ID</th>
            <th>User</th>
            <th>Phone Number</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Initiated</th>
            <th>Completed</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredTransactions.map(txn => (
            <tr key={txn.id}>
              <td>
                {txn.mpesa_transaction_id || 'N/A'}<br />
                <small style={{ opacity: 0.6 }}>{txn.mpesa_checkout_request_id}</small>
              </td>
              <td>{txn.user_username || 'N/A'}</td>
              <td>{txn.phone_number}</td>
              <td>KSh {txn.amount}</td>
              <td>
                <StatusBadge status={txn.status}>
                  {txn.status}
                </StatusBadge>
              </td>
              <td>{new Date(txn.initiated_at).toLocaleString()}</td>
              <td>{txn.completed_at ? new Date(txn.completed_at).toLocaleString() : 'N/A'}</td>
              <td>
                <ActionButtons>
                  {(txn.status === 'pending' || txn.status === 'initiated') && (
                    <ActionButton
                      variant="confirm"
                      onClick={() => updateTransactionStatus(txn.id, 'completed')}
                      disabled={processingId === txn.id}
                    >
                      {processingId === txn.id ? 'Processing...' : 'Complete'}
                    </ActionButton>
                  )}
                  {(txn.status === 'pending' || txn.status === 'initiated') && (
                    <ActionButton
                      variant="cancel"
                      onClick={() => updateTransactionStatus(txn.id, 'failed')}
                      disabled={processingId === txn.id}
                    >
                      {processingId === txn.id ? 'Processing...' : 'Mark Failed'}
                    </ActionButton>
                  )}
                  {txn.status === 'failed' && (
                    <ActionButton
                      variant="confirm"
                      onClick={() => {
                        if (window.confirm('Reset this transaction to pending so the user can retry payment?')) {
                          updateTransactionStatus(txn.id, 'pending');
                        }
                      }}
                      disabled={processingId === txn.id}
                    >
                      {processingId === txn.id ? 'Processing...' : 'Retry Payment'}
                    </ActionButton>
                  )}
                </ActionButtons>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
};

export default ManageTransactions;
