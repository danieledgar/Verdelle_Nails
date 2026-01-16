import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FaBars, FaTimes, FaUser, FaSignOutAlt } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const userMenuRef = useRef(null);
  const menuRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  const toggleMenu = () => setIsOpen(!isOpen);
  const toggleUserMenu = () => setShowUserMenu(!showUserMenu);
  const toggleHamburgerMenu = () => setIsMenuOpen(!isMenuOpen);

  const isActive = (path) => location.pathname === path;

  const handleNavClick = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setIsMenuOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    setShowUserMenu(false);
    navigate('/');
  };

  useEffect(() => {
    if (!showUserMenu) return;

    const handleClickOutside = (event) => {
      const container = userMenuRef.current;
      if (!container) return;
      if (!container.contains(event.target)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserMenu]);

  useEffect(() => {
    if (!isMenuOpen) return;

    const handleClickOutside = (event) => {
      const container = menuRef.current;
      if (!container) return;
      if (!container.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  useEffect(() => {
    const handleScroll = () => {
      setShowSidebar(window.scrollY > 200);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      {isAuthenticated() && (
        <LogoutButtonFixed onClick={handleLogout}>
          <FaSignOutAlt /> Logout
        </LogoutButtonFixed>
      )}

      <HamburgerButton 
        show={showSidebar && isAuthenticated()} 
        onClick={toggleHamburgerMenu}
        ref={menuRef}
      >
        {isMenuOpen ? <FaTimes /> : <FaBars />}
        {isMenuOpen && (
          <HamburgerMenu>
            <MenuLink to="/dashboard" $active={isActive('/dashboard')} onClick={handleNavClick}>
              Home
            </MenuLink>
            <MenuLink to="/services" $active={isActive('/services')} onClick={handleNavClick}>
              Services
            </MenuLink>
            <MenuLink to="/gallery" $active={isActive('/gallery')} onClick={handleNavClick}>
              Gallery
            </MenuLink>
            <MenuLink to="/contact" $active={isActive('/contact')} onClick={handleNavClick}>
              Contact
            </MenuLink>
          </HamburgerMenu>
        )}
      </HamburgerButton>

      <FloatingNav show={!showSidebar && isAuthenticated()}>
      <FloatingNavLink to="/dashboard" $active={isActive('/dashboard')} onClick={handleNavClick}>
        Home
      </FloatingNavLink>
      <FloatingNavLink to="/services" $active={isActive('/services')} onClick={handleNavClick}>
        Services
      </FloatingNavLink>
      <FloatingNavLink to="/gallery" $active={isActive('/gallery')} onClick={handleNavClick}>
        Gallery
      </FloatingNavLink>
      <FloatingNavLink to="/contact" $active={isActive('/contact')} onClick={handleNavClick}>
        Contact
      </FloatingNavLink>
    </FloatingNav>
    </>
  );
};

const LogoutButtonFixed = styled.button`
  position: absolute;
  top: 30px;
  right: 30px;
  color: ${props => props.theme.colors.white};
  background: linear-gradient(135deg, ${props => props.theme.colors.primary} 0%, ${props => props.theme.colors.accent} 100%);
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.lg};
  border-radius: 30px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  font-weight: 600;
  font-size: ${props => props.theme.fontSizes.small};
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
  z-index: 1001;
  box-shadow: ${props => props.theme.shadows.large};
  backdrop-filter: blur(10px);

  &:hover {
    background: #dc2626;
    color: ${props => props.theme.colors.white};
    border-color: #dc2626;
    transform: translateY(-2px);
    box-shadow: ${props => props.theme.shadows.xlarge};
  }

  &:active {
    transform: translateY(0);
  }

  @media (max-width: ${props => props.theme.breakpoints.tablet}) {
    top: 20px;
    right: 20px;
    padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.md};
    font-size: ${props => props.theme.fontSizes.xsmall};
  }

  @media (max-width: 450px) {
    top: 20px;
    right: 20px;
    padding: 10px;
    font-size: 0;
    width: 40px;
    height: 40px;
    justify-content: center;
    align-items: center;
    border-radius: 50%;
    background-image: url('https://cdn.iconscout.com/icon/premium/png-256-thumb/in-icon-svg-download-png-9805773.png?f=webp&w=128');
    background-size: 18px 18px;
    background-repeat: no-repeat;
    background-position: center;
    background-color: ${props => props.theme.colors.primary};
    
    svg {
      display: none;
    }
    
    &:hover {
      background-image: url('https://cdn.iconscout.com/icon/premium/png-256-thumb/in-icon-svg-download-png-9805773.png?f=webp&w=128');
      background-size: 18px 18px;
      background-repeat: no-repeat;
      background-position: center;
      background-color: #dc2626;
    }
  }
`;

const FloatingNav = styled.nav`
  position: fixed;
  top: 30px;
  left: 50%;
  transform: translateX(-50%);
  background: ${props => props.theme.colors.white};
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.lg};
  border-radius: 50px;
  box-shadow: ${props => props.theme.shadows.large};
  display: ${props => props.show ? 'flex' : 'none'};
  gap: ${props => props.theme.spacing.md};
  align-items: center;
  z-index: 999;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  border: 1px solid ${props => props.theme.colors.primary}33;

  @media (max-width: ${props => props.theme.breakpoints.tablet}) {
    top: 20px;
    padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.md};
    gap: ${props => props.theme.spacing.sm};
  }

  @media (max-width: 450px) {
    padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.sm};
    gap: ${props => props.theme.spacing.xs};
    max-width: 95vw;
  }
`;

const HamburgerButton = styled.div`
  position: fixed;
  top: 30px;
  right: 30px;
  width: 50px;
  height: 50px;
  background: ${props => props.theme.colors.white};
  border-radius: 50%;
  display: ${props => props.show ? 'flex' : 'none'};
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 999;
  box-shadow: ${props => props.theme.shadows.large};
  border: 1px solid ${props => props.theme.colors.primary}33;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(10px);

  svg {
    font-size: ${props => props.theme.fontSizes.large};
    color: ${props => props.theme.colors.primary};
    transition: transform 0.3s ease;
  }

  &:hover {
    transform: scale(1.1);
    box-shadow: ${props => props.theme.shadows.xlarge};
    
    svg {
      transform: rotate(90deg);
    }
  }

  @media (max-width: ${props => props.theme.breakpoints.tablet}) {
    top: 20px;
    right: 20px;
    width: 45px;
    height: 45px;
  }
`;

const HamburgerMenu = styled.div`
  position: absolute;
  top: 60px;
  right: 0;
  background: ${props => props.theme.colors.white};
  border-radius: 15px;
  box-shadow: ${props => props.theme.shadows.large};
  padding: ${props => props.theme.spacing.md};
  min-width: 180px;
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.xs};
  border: 1px solid ${props => props.theme.colors.primary}33;
  backdrop-filter: blur(10px);
  animation: slideDown 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @media (max-width: ${props => props.theme.breakpoints.tablet}) {
    min-width: 160px;
    padding: ${props => props.theme.spacing.sm};
  }
`;

const MenuLink = styled(Link)`
  color: ${props => props.$active ? props.theme.colors.white : props.theme.colors.secondary};
  background: ${props => props.$active ? props.theme.colors.primary : 'transparent'};
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  border-radius: 8px;
  font-weight: 500;
  font-size: ${props => props.theme.fontSizes.small};
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  text-decoration: none;
  text-align: center;

  &:hover {
    background: ${props => props.$active ? props.theme.colors.accent : props.theme.colors.primary}22;
    color: ${props => props.$active ? props.theme.colors.white : props.theme.colors.primary};
    transform: translateX(-3px);
    text-decoration: none;
  }

  @media (max-width: ${props => props.theme.breakpoints.tablet}) {
    padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.sm};
    font-size: ${props => props.theme.fontSizes.xsmall};
  }
`;

const Sidebar = styled.nav`
  position: fixed;
  right: ${props => props.show ? '0' : '-200px'};
  top: 50%;
  transform: translateY(-50%);
  background: ${props => props.theme.colors.white};
  padding: ${props => props.theme.spacing.lg} ${props => props.theme.spacing.sm};
  border-radius: 15px 0 0 15px;
  box-shadow: ${props => props.theme.shadows.large};
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.sm};
  z-index: 998;
  transition: right 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(10px);
  border: 1px solid ${props => props.theme.colors.primary}33;
  border-right: none;

  @media (max-width: ${props => props.theme.breakpoints.tablet}) {
    right: ${props => props.show ? '0' : '-180px'};
    padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.xs};
  }
`;

const SidebarLink = styled(Link)`
  color: ${props => props.$active ? props.theme.colors.white : props.theme.colors.secondary};
  background: ${props => props.$active ? props.theme.colors.primary : 'transparent'};
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  border-radius: 8px;
  font-weight: 500;
  font-size: ${props => props.theme.fontSizes.small};
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  text-decoration: none;
  text-align: center;
  white-space: nowrap;

  &:hover {
    background: ${props => props.$active ? props.theme.colors.accent : props.theme.colors.primary}22;
    color: ${props => props.$active ? props.theme.colors.white : props.theme.colors.primary};
    transform: translateX(-5px);
    text-decoration: none;
  }

  @media (max-width: ${props => props.theme.breakpoints.tablet}) {
    padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.sm};
    font-size: ${props => props.theme.fontSizes.xsmall};
  }
`;

const FloatingNavLink = styled(Link)`
  color: ${props => props.$active ? props.theme.colors.white : props.theme.colors.secondary};
  background: ${props => props.$active ? props.theme.colors.primary : 'transparent'};
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  border-radius: 30px;
  font-weight: 500;
  font-size: ${props => props.theme.fontSizes.small};
  transition: all ${props => props.theme.transitions.fast};
  text-decoration: none;
  white-space: nowrap;

  @media (hover: hover) {
    &:hover {
      background: ${props => props.$active ? props.theme.colors.accent : props.theme.colors.primary}22;
      color: ${props => props.$active ? props.theme.colors.white : props.theme.colors.primary};
      transform: translateY(-2px);
      text-decoration: none;
    }
  }

  &:active {
    transform: translateY(0);
  }

  @media (max-width: ${props => props.theme.breakpoints.tablet}) {
    padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.sm};
    font-size: ${props => props.theme.fontSizes.xsmall};
  }

  @media (max-width: 450px) {
    padding: 6px 10px;
    font-size: 11px;
  }
`;

const LogoutButton = styled.button`
  color: ${props => props.theme.colors.white};
  background: #dc2626;
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  border-radius: 30px;
  border: none;
  font-weight: 500;
  font-size: ${props => props.theme.fontSizes.small};
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};

  @media (hover: hover) {
    &:hover {
      background: #b91c1c;
      transform: translateY(-2px);
      box-shadow: ${props => props.theme.shadows.small};
    }
  }

  &:active {
    transform: translateY(0);
  }

  @media (max-width: ${props => props.theme.breakpoints.tablet}) {
    padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.sm};
    font-size: ${props => props.theme.fontSizes.xsmall};
  }

  @media (max-width: 450px) {
    padding: 6px 10px;
    font-size: 11px;
    
    svg {
      display: none;
    }
  }
`;

const LogoutMenuItem = styled.button`
  color: ${props => props.theme.colors.white};
  background: #dc2626;
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  border-radius: 8px;
  border: none;
  font-weight: 500;
  font-size: ${props => props.theme.fontSizes.small};
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${props => props.theme.spacing.xs};

  &:hover {
    background: #b91c1c;
    transform: translateX(-3px);
  }

  @media (max-width: ${props => props.theme.breakpoints.tablet}) {
    padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.sm};
    font-size: ${props => props.theme.fontSizes.xsmall};
  }
`;

const HeaderContainer = styled.header`
  background: ${props => props.theme.colors.white};
  box-shadow: ${props => props.theme.shadows.small};
  position: sticky;
  top: 0;
  z-index: 1000;
`;

const Nav = styled.nav`
  max-width: 1200px;
  margin: 0 auto;
  padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.lg};
  display: flex;
  justify-content: space-between;
  align-items: center;

  @media (max-width: ${props => props.theme.breakpoints.tablet}) {
    padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  }
`;

const Logo = styled(Link)`
  font-family: ${props => props.theme.fonts.heading};
  font-size: ${props => props.theme.fontSizes.xlarge};
  font-weight: 700;
  color: ${props => props.theme.colors.secondary};
  
  span {
    color: ${props => props.theme.colors.primary};
  }

  &:hover {
    color: ${props => props.theme.colors.primary};
  }
`;

const MenuIcon = styled.div`
  display: none;
  font-size: ${props => props.theme.fontSizes.xlarge};
  color: ${props => props.theme.colors.secondary};
  cursor: pointer;

  @media (max-width: ${props => props.theme.breakpoints.tablet}) {
    display: block;
  }
`;

const NavMenu = styled.ul`
  display: flex;
  align-items: center;
  list-style: none;
  gap: ${props => props.theme.spacing.lg};

  .desktop-only {
    display: block;
  }

  @media (max-width: ${props => props.theme.breakpoints.tablet}) {
    position: fixed;
    top: 70px;
    right: 0;
    flex-direction: column;
    background: ${props => props.theme.colors.white};
    width: 100%;
    padding: ${props => props.theme.spacing.lg};
    box-shadow: ${props => props.theme.shadows.medium};
    transform: ${props => props.isOpen ? 'translateX(0)' : 'translateX(100%)'};
    transition: transform ${props => props.theme.transitions.medium};

    .desktop-only {
      display: none;
    }
  }
`;

const NavItem = styled.li``;

const NavLink = styled(Link)`
  color: ${props => props.$active ? props.theme.colors.primary : props.theme.colors.text};
  font-weight: ${props => props.$active ? '600' : '400'};
  font-size: ${props => props.theme.fontSizes.medium};
  position: relative;
  white-space: nowrap;

  &:after {
    content: '';
    position: absolute;
    bottom: -5px;
    left: 0;
    width: ${props => props.$active ? '100%' : '0'};
    height: 2px;
    background: ${props => props.theme.colors.primary};
    transition: width ${props => props.theme.transitions.fast};
  }

  &:hover {
    color: ${props => props.theme.colors.primary};
    
    &:after {
      width: 100%;
    }
  }

  @media (max-width: 450px) {
    font-size: ${props => props.theme.fontSizes.small};
  }
`;

const BookButton = styled(Link)`
  background: ${props => props.theme.colors.primary};
  color: ${props => props.theme.colors.white};
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.lg};
  border-radius: 30px;
  font-weight: 500;
  transition: all ${props => props.theme.transitions.medium};

  &:hover {
    background: ${props => props.theme.colors.accent};
    transform: translateY(-2px);
    box-shadow: ${props => props.theme.shadows.medium};
  }
`;

const SignupButton = styled(Link)`
  background: ${props => props.theme.colors.secondary};
  color: ${props => props.theme.colors.white};
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.lg};
  border-radius: 30px;
  font-weight: 500;
  transition: all ${props => props.theme.transitions.medium};

  &:hover {
    background: ${props => props.theme.colors.primary};
    transform: translateY(-2px);
    box-shadow: ${props => props.theme.shadows.medium};
  }
`;

const UserMenuWrapper = styled.div`
  position: relative;
`;

const UserButton = styled.button`
  background: transparent;
  border: 2px solid ${props => props.theme.colors.primary};
  color: ${props => props.theme.colors.primary};
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.md};
  border-radius: 30px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
  transition: all ${props => props.theme.transitions.fast};

  &:hover {
    background: ${props => props.theme.colors.primary};
    color: ${props => props.theme.colors.white};
  }
`;

const UserDropdown = styled.div`
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  background: ${props => props.theme.colors.white};
  border-radius: 8px;
  box-shadow: ${props => props.theme.shadows.large};
  min-width: 200px;
  z-index: 1000;
`;

const UserInfo = styled.div`
  padding: ${props => props.theme.spacing.md};
`;

const UserName = styled.div`
  font-weight: 600;
  color: ${props => props.theme.colors.secondary};
  margin-bottom: ${props => props.theme.spacing.xs};
`;

const UserEmail = styled.div`
  font-size: ${props => props.theme.fontSizes.small};
  color: ${props => props.theme.colors.textLight};
  margin-bottom: ${props => props.theme.spacing.xs};
`;

const LoyaltyPoints = styled.div`
  font-size: ${props => props.theme.fontSizes.small};
  color: ${props => props.theme.colors.primary};
  font-weight: 600;
  background: ${props => props.theme.colors.primary}22;
  padding: ${props => props.theme.spacing.xs};
  border-radius: 4px;
  text-align: center;
`;

const DropdownDivider = styled.div`
  height: 1px;
  background: ${props => props.theme.colors.border};
  margin: 0;
`;

const DropdownItem = styled.button`
  width: 100%;
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  background: transparent;
  border: none;
  text-align: left;
  cursor: pointer;
  color: ${props => props.theme.colors.text};
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
  transition: none;

  &:hover {
    background: transparent;
    text-decoration: none;
  }
`;

export default Header;
