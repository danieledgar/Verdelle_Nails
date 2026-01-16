import styled from 'styled-components';

// Common Container
export const Container = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
  min-height: 100vh;
  background: linear-gradient(135deg, ${props => props.theme.colors.background} 0%, #fdfcfa 100%);
`;

// Header
export const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding: 2rem;
  background: linear-gradient(135deg, ${props => props.theme.colors.primary} 0%, ${props => props.theme.colors.accent} 100%);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(201, 166, 132, 0.3);
  
  h1 {
    font-family: ${props => props.theme.fonts.heading};
    font-size: 2rem;
    font-weight: 600;
    color: white;
    margin: 0;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
  }

  p {
    color: rgba(255, 255, 255, 0.9);
    margin: 0.5rem 0 0 0;
  }

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }
`;

// Buttons
export const Button = styled.button`
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, ${props => props.theme.colors.primary} 0%, ${props => props.theme.colors.accent} 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  font-family: ${props => props.theme.fonts.body};
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(201, 166, 132, 0.3);
  
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(201, 166, 132, 0.4);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

export const SecondaryButton = styled(Button)`
  background: white;
  color: ${props => props.theme.colors.primary};
  border: 2px solid ${props => props.theme.colors.primary};
  box-shadow: 0 4px 15px rgba(201, 166, 132, 0.2);
  
  &:hover:not(:disabled) {
    background: linear-gradient(135deg, ${props => props.theme.colors.background}, white);
    box-shadow: 0 6px 20px rgba(201, 166, 132, 0.3);
  }
`;

export const DangerButton = styled(Button)`
  background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%);
  box-shadow: 0 4px 15px rgba(220, 38, 38, 0.3);
  
  &:hover:not(:disabled) {
    box-shadow: 0 6px 20px rgba(220, 38, 38, 0.4);
  }
`;

// Table
export const Table = styled.table`
  width: 100%;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
  
  thead {
    background: linear-gradient(135deg, ${props => props.theme.colors.secondary} 0%, #3c3c3c 100%);
    
    th {
      padding: 1.25rem;
      text-align: left;
      font-family: ${props => props.theme.fonts.heading};
      font-weight: 600;
      font-size: 0.95rem;
      color: white;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
  }
  
  tbody {
    tr {
      border-bottom: 1px solid #f0f0f0;
      transition: all 0.3s ease;
      
      &:hover {
        background: linear-gradient(to right, ${props => props.theme.colors.background}, white);
      }
      
      &:last-child {
        border-bottom: none;
      }
      
      td {
        padding: 1.25rem;
        color: ${props => props.theme.colors.text};
        font-size: 0.95rem;
      }
    }
  }
`;

// Form Elements
export const Input = styled.input`
  width: 100%;
  padding: 0.875rem 1rem;
  border: 2px solid #e5e5e5;
  border-radius: 8px;
  font-size: 1rem;
  font-family: ${props => props.theme.fonts.body};
  transition: all 0.3s ease;
  background: white;
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 3px rgba(201, 166, 132, 0.1);
  }
  
  &::placeholder {
    color: #999;
  }
`;

export const Select = styled.select`
  width: 100%;
  padding: 0.875rem 1rem;
  border: 2px solid #e5e5e5;
  border-radius: 8px;
  font-size: 1rem;
  font-family: ${props => props.theme.fonts.body};
  background: white;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 3px rgba(201, 166, 132, 0.1);
  }
`;

export const Textarea = styled.textarea`
  width: 100%;
  padding: 0.875rem 1rem;
  border: 2px solid #e5e5e5;
  border-radius: 8px;
  font-size: 1rem;
  font-family: ${props => props.theme.fonts.body};
  min-height: 120px;
  resize: vertical;
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 3px rgba(201, 166, 132, 0.1);
  }
`;

// Cards
export const Card = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  border: 1px solid rgba(201, 166, 132, 0.1);
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.12);
  }
  
  h3 {
    font-family: ${props => props.theme.fonts.heading};
    color: ${props => props.theme.colors.primary};
    margin-bottom: 1rem;
    font-size: 1.5rem;
  }
`;

// Modal
export const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(44, 44, 44, 0.8);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease;
  
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;

export const Modal = styled.div`
  background: white;
  padding: 2.5rem;
  border-radius: 16px;
  max-width: 600px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.3s ease;
  
  @keyframes slideUp {
    from {
      transform: translateY(50px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
  
  h2 {
    font-family: ${props => props.theme.fonts.heading};
    color: ${props => props.theme.colors.primary};
    margin-bottom: 1.5rem;
    font-size: 1.75rem;
  }
`;

export const ModalActions = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
  justify-content: flex-end;
`;

// Status Badge
export const StatusBadge = styled.span`
  padding: 0.4rem 0.9rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  background: ${props => {
    switch(props.status) {
      case 'pending': return 'linear-gradient(135deg, #f59e0b, #fbbf24)';
      case 'confirmed': return 'linear-gradient(135deg, #3b82f6, #60a5fa)';
      case 'completed': return 'linear-gradient(135deg, #10b981, #34d399)';
      case 'cancelled': return 'linear-gradient(135deg, #ef4444, #f87171)';
      case 'failed': return 'linear-gradient(135deg, #dc2626, #ef4444)';
      case 'approved': return 'linear-gradient(135deg, #10b981, #34d399)';
      case 'active': return 'linear-gradient(135deg, #10b981, #34d399)';
      case 'inactive': return 'linear-gradient(135deg, #ef4444, #f87171)';
      default: return 'linear-gradient(135deg, #6b7280, #9ca3af)';
    }
  }};
  color: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
`;

// Grid
export const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
`;

// Filters
export const Filters = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  flex-wrap: wrap;
`;

// Form Group
export const FormGroup = styled.div`
  margin-bottom: 1.5rem;
  
  label {
    display: block;
    margin-bottom: 0.5rem;
    color: ${props => props.theme.colors.text};
    font-weight: 500;
    font-size: 0.95rem;
    font-family: ${props => props.theme.fonts.body};
  }
`;

// Loading
export const Loading = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  font-size: 1.25rem;
  color: ${props => props.theme.colors.primary};
  font-family: ${props => props.theme.fonts.heading};
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 3rem;
  color: ${props => props.theme.colors.primary};
  font-size: 1.25rem;
  font-weight: 600;
`;

// Empty State
export const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  color: ${props => props.theme.colors.textLight};
  
  h3 {
    color: ${props => props.theme.colors.text};
    margin-bottom: 0.5rem;
  }
`;
