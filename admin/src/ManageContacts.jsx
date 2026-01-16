import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import api from './api';
import { Container, Header, Table, StatusBadge, Button, Modal, ModalOverlay, ModalActions, FormGroup, Textarea, Loading } from './components/SharedStyles';

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

const Filters = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
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
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  ${props => {
    if (props.variant === 'mark') {
      return `
        background: linear-gradient(135deg, ${props.theme.colors.primary}, ${props.theme.colors.accent});
        color: white;
        &:hover:not(:disabled) { 
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(201, 166, 132, 0.4);
        }
      `;
    }
    if (props.variant === 'reply') {
      return `
        background: linear-gradient(135deg, #10b981, #059669);
        color: white;
        &:hover:not(:disabled) { 
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
        }
      `;
    }
    return `
      background: linear-gradient(135deg, #dc2626, #ef4444);
      color: white;
      &:hover:not(:disabled) { 
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(220, 38, 38, 0.4);
      }
    `;
  }}
  
  &:active {
    transform: translateY(0);
  }
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

const MessageDetail = styled.div`
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

const MessagePreview = styled.div`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: ${props => props.theme.colors.textLight};
  font-size: 0.9rem;
`;

const ManageContacts = () => {
  const [messages, setMessages] = useState([]);
  const [filteredMessages, setFilteredMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [processingId, setProcessingId] = useState(null);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [replyMessage, setReplyMessage] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);

  useEffect(() => {
    fetchMessages();
  }, []);

  useEffect(() => {
    filterMessages();
  }, [messages, statusFilter]);

  const fetchMessages = async () => {
    try {
      const response = await api.get('/contact/');
      const data = response.data.results 
        ? response.data.results 
        : (Array.isArray(response.data) ? response.data : []);
      setMessages(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching messages:', error);
      setMessages([]);
      setLoading(false);
    }
  };

  const filterMessages = () => {
    if (!Array.isArray(messages)) {
      setFilteredMessages([]);
      return;
    }
    
    let filtered = [...messages];

    if (statusFilter === 'read') {
      filtered = filtered.filter(msg => msg.is_read);
    } else if (statusFilter === 'unread') {
      filtered = filtered.filter(msg => !msg.is_read);
    }

    setFilteredMessages(filtered);
  };

  const handleViewMessage = async (message) => {
    setSelectedMessage(message);
    setShowModal(true);
    
    // Mark as read if not already
    if (!message.is_read) {
      try {
        await api.patch(`/contact/${message.id}/`, { is_read: true });
        fetchMessages();
      } catch (error) {
        console.error('Error marking message as read:', error);
      }
    }
  };

  const toggleReadStatus = async (id, currentStatus) => {
    setProcessingId(id);
    try {
      console.log('Toggling read status for message:', id, 'from', currentStatus, 'to', !currentStatus);
      const response = await api.patch(`/contact/${id}/`, { is_read: !currentStatus });
      console.log('Toggle response:', response.data);
      
      // Optimistically update local state
      setMessages(prev => prev.map(msg => 
        msg.id === id ? { ...msg, is_read: !currentStatus } : msg
      ));
      
      await fetchMessages();
      setProcessingId(null);
    } catch (error) {
      console.error('Error updating message:', error);
      console.error('Error response:', error.response?.data);
      setProcessingId(null);
      alert(`Failed to update message: ${error.response?.data?.detail || error.message}`);
    }
  };

  const deleteMessage = async (id, e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this message?')) {
      try {
        await api.delete(`/contact/${id}/`);
        fetchMessages();
      } catch (error) {
        console.error('Error deleting message:', error);
        alert('Failed to delete message');
      }
    }
  };

  const handleOpenReply = (message, e) => {
    e.stopPropagation();
    setReplyingTo(message);
    setReplyMessage('');
    setShowReplyModal(true);
  };

  const handleSendReply = async () => {
    if (!replyMessage.trim()) {
      alert('Please enter a reply message');
      return;
    }

    setProcessingId(replyingTo.id);
    try {
      console.log('Sending reply to message:', replyingTo.id);
      const response = await api.post(`/contact/${replyingTo.id}/reply/`, {
        admin_reply: replyMessage
      });
      console.log('Reply response:', response.data);
      
      setShowReplyModal(false);
      setReplyingTo(null);
      setReplyMessage('');
      setProcessingId(null);
      
      await fetchMessages();
      alert('Reply sent successfully! The user will be notified.');
    } catch (error) {
      console.error('Error sending reply:', error);
      console.error('Error response:', error.response?.data);
      setProcessingId(null);
      alert(`Failed to send reply: ${error.response?.data?.error || error.message}`);
    }
  };

  if (loading) {
    return <Container><p>Loading messages...</p></Container>;
  }

  return (
    <Container>
      <Header>
        <h1>Manage Contact Messages</h1>
      </Header>

      <Filters>
        <FilterSelect 
          value={statusFilter} 
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All Messages</option>
          <option value="unread">Unread</option>
          <option value="read">Read</option>
        </FilterSelect>
      </Filters>

      <Table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Subject</th>
            <th>Message</th>
            <th>Status</th>
            <th>Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredMessages.map(message => (
            <tr key={message.id} onClick={() => handleViewMessage(message)}>
              <td style={{ fontWeight: message.is_read ? 'normal' : 'bold' }}>
                {message.name}
              </td>
              <td>{message.email}</td>
              <td>{message.phone || 'N/A'}</td>
              <td>{message.subject}</td>
              <td style={{ maxWidth: '250px' }}>
                <MessagePreview>
                  {message.message?.substring(0, 80)}{message.message?.length > 80 ? '...' : ''}
                </MessagePreview>
              </td>
              <td>
                <StatusBadge read={message.is_read}>
                  {message.is_read ? 'Read' : 'Unread'}
                </StatusBadge>
              </td>
              <td>{new Date(message.created_at).toLocaleDateString()}</td>
              <td>
                <ActionButtons onClick={(e) => e.stopPropagation()}>
                  <ActionButton
                    variant="mark"
                    disabled={processingId === message.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleReadStatus(message.id, message.is_read);
                    }}
                  >
                    {processingId === message.id ? 'Processing...' : (message.is_read ? 'Mark Unread' : 'Mark Read')}
                  </ActionButton>
                  <ActionButton 
                    variant="reply"
                    disabled={processingId === message.id}
                    onClick={(e) => handleOpenReply(message, e)}
                  >
                    Reply
                  </ActionButton>
                  <ActionButton 
                    disabled={processingId === message.id}
                    onClick={(e) => deleteMessage(message.id, e)}
                  >
                    Delete
                  </ActionButton>
                </ActionButtons>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {showModal && selectedMessage && (
        <Modal onClick={() => setShowModal(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <h2>Message Details</h2>
            
            <MessageDetail>
              <label>From</label>
              <p>{selectedMessage.name}</p>
            </MessageDetail>
            
            <MessageDetail>
              <label>Email</label>
              <p>{selectedMessage.email}</p>
            </MessageDetail>
            
            {selectedMessage.phone && (
              <MessageDetail>
                <label>Phone</label>
                <p>{selectedMessage.phone}</p>
              </MessageDetail>
            )}
            
            <MessageDetail>
              <label>Subject</label>
              <p>{selectedMessage.subject}</p>
            </MessageDetail>
            
            <MessageDetail>
              <label>Message</label>
              <p style={{ whiteSpace: 'pre-wrap' }}>{selectedMessage.message}</p>
            </MessageDetail>
            
            <MessageDetail>
              <label>Received</label>
              <p>{new Date(selectedMessage.created_at).toLocaleString()}</p>
            </MessageDetail>
            
            <CloseButton onClick={() => setShowModal(false)}>
              Close
            </CloseButton>
          </ModalContent>
        </Modal>
      )}

      {showReplyModal && replyingTo && (
        <Modal onClick={() => setShowReplyModal(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <h2>Reply to {replyingTo.name}</h2>
            
            <MessageDetail>
              <label>Original Message</label>
              <p style={{ whiteSpace: 'pre-wrap', background: '#f3f4f6', padding: '1rem', borderRadius: '4px' }}>
                {replyingTo.message}
              </p>
            </MessageDetail>

            {replyingTo.admin_reply && (
              <MessageDetail>
                <label>Previous Reply</label>
                <p style={{ whiteSpace: 'pre-wrap', background: '#e0f2fe', padding: '1rem', borderRadius: '4px' }}>
                  {replyingTo.admin_reply}
                </p>
              </MessageDetail>
            )}
            
            <MessageDetail>
              <label>Your Reply</label>
              <textarea
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
                rows={6}
                placeholder="Type your reply here..."
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '1rem',
                  fontFamily: 'inherit',
                  resize: 'vertical'
                }}
              />
            </MessageDetail>
            
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
              <CloseButton 
                onClick={() => setShowReplyModal(false)}
                style={{ background: '#6b7280' }}
              >
                Cancel
              </CloseButton>
              <CloseButton 
                onClick={handleSendReply}
                disabled={processingId === replyingTo?.id}
              >
                {processingId === replyingTo?.id ? 'Sending...' : 'Send Reply'}
              </CloseButton>
            </div>
          </ModalContent>
        </Modal>
      )}
    </Container>
  );
};

export default ManageContacts;
