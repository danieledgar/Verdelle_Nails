import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaArrowUp } from 'react-icons/fa';

const BackToTop = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);

    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <BackToTopButton 
      onClick={scrollToTop} 
      $isVisible={isVisible}
      aria-label="Back to top"
    >
      <FaArrowUp />
    </BackToTopButton>
  );
};

const BackToTopButton = styled.button`
  position: fixed;
  bottom: 30px;
  right: 30px;
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.primary} 0%, ${({ theme }) => theme.colors.accent} 100%);
  color: ${({ theme }) => theme.colors.white};
  width: 50px;
  height: 50px;
  border-radius: 50%;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${({ theme }) => theme.fontSizes.large};
  cursor: pointer;
  box-shadow: ${({ theme }) => theme.shadows.large};
  transition: all ${({ theme }) => theme.transitions.medium};
  z-index: 1000;
  opacity: ${({ $isVisible }) => ($isVisible ? '1' : '0')};
  visibility: ${({ $isVisible }) => ($isVisible ? 'visible' : 'hidden')};
  transform: ${({ $isVisible }) => ($isVisible ? 'translateY(0)' : 'translateY(20px)')};

  &:hover {
    transform: translateY(-5px);
    box-shadow: ${({ theme }) => theme.shadows.large};
  }

  &:active {
    transform: translateY(-2px);
  }

  /* Show only on smaller screens */
  @media (min-width: ${({ theme }) => theme.breakpoints.desktop}) {
    display: none;
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    width: 45px;
    height: 45px;
    bottom: 20px;
    right: 20px;
    font-size: ${({ theme }) => theme.fontSizes.medium};
  }

  @media (max-width: 450px) {
    width: 40px;
    height: 40px;
    bottom: 15px;
    right: 15px;
    font-size: ${({ theme }) => theme.fontSizes.small};
  }
`;

export default BackToTop;
