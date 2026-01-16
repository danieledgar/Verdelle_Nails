import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import api from './api';
import { Container, Header, Table, Button, DangerButton, StatusBadge, Filters, Select, Loading } from './components/SharedStyles';

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

const Stars = styled.div`
  color: #f59e0b;
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
    if (props.variant === 'approve') {
      return `
        background: linear-gradient(135deg, #22c55e, #16a34a);
        color: white;
        &:hover { 
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(34, 197, 94, 0.4);
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
  
  &:active {
    transform: translateY(0);
  }
`;

const ManageReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [filteredReviews, setFilteredReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchReviews();
  }, []);

  useEffect(() => {
    filterReviews();
  }, [reviews, statusFilter]);

  const fetchReviews = async () => {
    try {
      const response = await api.get('/reviews/');
      const data = response.data.results 
        ? response.data.results 
        : (Array.isArray(response.data) ? response.data : []);
      setReviews(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      setReviews([]);
      setLoading(false);
    }
  };

  const filterReviews = () => {
    if (!Array.isArray(reviews)) {
      setFilteredReviews([]);
      return;
    }
    
    let filtered = [...reviews];

    if (statusFilter === 'approved') {
      filtered = filtered.filter(review => review.is_approved);
    } else if (statusFilter === 'pending') {
      filtered = filtered.filter(review => !review.is_approved);
    }

    setFilteredReviews(filtered);
  };

  const toggleApproval = async (id, currentStatus) => {
    try {
      await api.patch(`/reviews/${id}/`, {
        is_approved: !currentStatus
      });
      fetchReviews();
    } catch (error) {
      console.error('Error updating review:', error);
      alert('Failed to update review');
    }
  };

  const deleteReview = async (id) => {
    if (window.confirm('Are you sure you want to delete this review?')) {
      try {
        await api.delete(`/reviews/${id}/`);
        fetchReviews();
      } catch (error) {
        console.error('Error deleting review:', error);
        alert('Failed to delete review');
      }
    }
  };

  if (loading) {
    return <Container><p>Loading reviews...</p></Container>;
  }

  return (
    <Container>
      <Header>
        <h1>Manage Reviews</h1>
      </Header>

      <Filters>
        <FilterSelect 
          value={statusFilter} 
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All Reviews</option>
          <option value="approved">Approved</option>
          <option value="pending">Pending Approval</option>
        </FilterSelect>
      </Filters>

      <Table>
        <thead>
          <tr>
            <th>Customer</th>
            <th>Rating</th>
            <th>Comment</th>
            <th>Service</th>
            <th>Status</th>
            <th>Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredReviews.map(review => (
            <tr key={review.id}>
              <td>{review.customer_name}</td>
              <td>
                <Stars>{'⭐'.repeat(review.rating)}</Stars>
              </td>
              <td style={{ maxWidth: '300px' }}>{review.comment}</td>
              <td>{review.service_name || 'General'}</td>
              <td>
                <StatusBadge approved={review.is_approved}>
                  {review.is_approved ? 'Approved' : 'Pending'}
                </StatusBadge>
              </td>
              <td>{new Date(review.created_at).toLocaleDateString()}</td>
              <td>
                <ActionButtons>
                  <ActionButton
                    variant="approve"
                    onClick={() => toggleApproval(review.id, review.is_approved)}
                  >
                    {review.is_approved ? 'Unapprove' : 'Approve'}
                  </ActionButton>
                  <ActionButton onClick={() => deleteReview(review.id)}>
                    Delete
                  </ActionButton>
                </ActionButtons>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
};

export default ManageReviews;
