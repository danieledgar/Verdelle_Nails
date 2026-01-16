import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../AuthContext';

const HeaderContainer = styled.header`
  background: linear-gradient(135deg, ${props => props.theme.colors.primary} 0%, ${props => props.theme.colors.accent} 100%);
  color: white;
  box-shadow: ${props => props.theme.shadows.large};
  position: sticky;
  top: 0;
  z-index: 1000;
  backdrop-filter: blur(10px);
`;

const Nav = styled.nav`
  max-width: 1400px;
  margin: 0 auto;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Logo = styled.div`
  font-family: ${props => props.theme.fonts.heading};
  font-size: 1.5rem;
  font-weight: 700;
  
  a {
    color: white;
    text-decoration: none;
  }
`;

const NavLinks = styled.div`
  display: flex;
  gap: 2rem;
  align-items: center;
  
  @media (max-width: 768px) {
    gap: 1rem;
  }
`;

const NavLink = styled(Link)`
  color: white;
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 30px;
  transition: all ${props => props.theme.transitions.fast};
  font-weight: 500;
  
  ${props => props.$active && `
    background: rgba(255, 255, 255, 0.25);
    box-shadow: ${props.theme.shadows.small};
  `}
  
  &:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: translateY(-2px);
  }
  
  @media (max-width: 768px) {
    padding: 0.5rem;
    font-size: 0.9rem;
  }
`;

const LogoutButton = styled.button`
  background: transparent;
  border: 2px solid white;
  color: white;
  padding: 0.5rem 1.5rem;
  border-radius: 30px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  transition: all ${props => props.theme.transitions.fast};
  box-shadow: ${props => props.theme.shadows.small};
  
  &:hover {
    background: #dc2626;
    border-color: #dc2626;
    transform: translateY(-2px);
    box-shadow: ${props => props.theme.shadows.medium};
  }
`;

const UserInfo = styled.span`
  margin-right: 1rem;
  color: rgba(255, 255, 255, 0.9);
  
  @media (max-width: 768px) {
    display: none;
  }
`;

const Header = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  return (
    <HeaderContainer>
      <Nav>
        <Logo>
          <Link to="/">Verdelle Nails Admin</Link>
        </Logo>
        <NavLinks>
          <NavLink to="/" $active={location.pathname === '/'}>
            Dashboard
          </NavLink>
          <NavLink to="/categories" $active={location.pathname === '/categories'}>
            Categories
          </NavLink>
          <NavLink to="/reviews" $active={location.pathname === '/reviews'}>
            Reviews
          </NavLink>
          <NavLink to="/contacts" $active={location.pathname === '/contacts'}>
            Messages
          </NavLink>
          <NavLink to="/transactions" $active={location.pathname === '/transactions'}>
            Transactions
          </NavLink>
          {user && (
            <LogoutButton onClick={logout}>Logout</LogoutButton>
          )}
        </NavLinks>
      </Nav>
    </HeaderContainer>
  );
};

export default Header;
