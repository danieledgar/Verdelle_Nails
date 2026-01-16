import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FaUser, FaPhone, FaCamera, FaSave } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [previewImage, setPreviewImage] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);
  
  const [formData, setFormData] = useState({
    phone_number: user?.phone_number || '',
    profile_picture: null
  });

  const getProfilePictureUrl = () => {
    if (previewImage) return previewImage;
    if (!user?.profile_picture) return null;
    if (user.profile_picture.startsWith('http')) return user.profile_picture;
    return `http://127.0.0.1:8000${user.profile_picture}`;
  };

  const handleAvatarClick = () => {
    const profilePicUrl = getProfilePictureUrl();
    if (profilePicUrl) {
      setShowImageModal(true);
    }
    // If no profile picture, do nothing - user should use camera badge to add one
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size should be less than 5MB');
        return;
      }
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }

      setFormData({
        ...formData,
        profile_picture: file
      });

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const token = localStorage.getItem('token');
      const formDataToSend = new FormData();
      
      if (formData.phone_number) {
        formDataToSend.append('phone_number', formData.phone_number);
      }
      
      if (formData.profile_picture) {
        formDataToSend.append('profile_picture', formData.profile_picture);
      }

      const response = await fetch('http://127.0.0.1:8000/api/auth/profile/update/', {
        method: 'PATCH',
        headers: {
          'Authorization': `Token ${token}`,
        },
        body: formDataToSend
      });

      if (response.ok) {
        const updatedUser = await response.json();
        updateUser(updatedUser);
        setMessage('Profile updated successfully!');
        setPreviewImage(null);
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to update profile');
      }
    } catch (err) {
      setError('An error occurred while updating profile');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const profilePicUrl = getProfilePictureUrl();

  return (
    <ProfileContainer>
      <Container>
        <ProfileContent
          as={motion.div}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <ProfileSection>
            <ProfilePictureSection>
              <input
                type="file"
                id="profile-picture"
                accept="image/*"
                onChange={handleImageChange}
                style={{ display: 'none' }}
              />
              <AvatarWrapper>
                <ProfileAvatar onClick={handleAvatarClick} style={{ cursor: 'pointer' }}>
                  {profilePicUrl ? (
                    <AvatarImage src={profilePicUrl} alt={user?.username} />
                  ) : (
                    <AvatarPlaceholder>
                      <FaUser />
                    </AvatarPlaceholder>
                  )}
                </ProfileAvatar>
                <CameraBadge htmlFor="profile-picture">
                  <FaCamera />
                </CameraBadge>
              </AvatarWrapper>
              <ProfileName>{user?.first_name} {user?.last_name}</ProfileName>
              <ProfileEmail>{user?.email}</ProfileEmail>
            </ProfilePictureSection>
          </ProfileSection>

          <Form onSubmit={handleSubmit}>
            <ProfileSection>
              <SectionTitle>Contact Information</SectionTitle>
              
              <FormGroup>
                <Label htmlFor="phone_number">
                  <FaPhone />
                  Phone Number
                </Label>
                <Input
                  type="tel"
                  id="phone_number"
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleInputChange}
                  placeholder="Enter your phone number"
                />
              </FormGroup>
            </ProfileSection>

            {error && <ErrorMessage>{error}</ErrorMessage>}
            {message && <SuccessMessage>{message}</SuccessMessage>}

            <ButtonGroup>
              <CancelButton type="button" onClick={() => navigate('/dashboard')}>
                Cancel
              </CancelButton>
              <SaveButton type="submit" disabled={loading}>
                <FaSave />
                {loading ? 'Saving...' : 'Save Changes'}
              </SaveButton>
            </ButtonGroup>
          </Form>
        </ProfileContent>
      </Container>

      {showImageModal && profilePicUrl && (
        <ImageModal onClick={() => setShowImageModal(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalImage src={profilePicUrl} alt="Profile" />
            <CloseButton onClick={() => setShowImageModal(false)}>×</CloseButton>
          </ModalContent>
        </ImageModal>
      )}
    </ProfileContainer>
  );
};

export default Profile;

// Styled Components
const ProfileContainer = styled.div`
  min-height: calc(100vh - 180px);
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.background} 0%, ${({ theme }) => theme.colors.accent}11 100%);
`;

const PageHeader = styled.div`
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.primary} 0%, ${({ theme }) => theme.colors.accent} 100%);
  color: ${({ theme }) => theme.colors.white};
  padding: ${({ theme }) => theme.spacing.xxl} ${({ theme }) => theme.spacing.lg};
  text-align: center;
`;

const PageTitle = styled.h1`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: ${({ theme }) => theme.fontSizes.xxxlarge};
  margin-bottom: ${({ theme }) => theme.spacing.sm};

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    font-size: ${({ theme }) => theme.fontSizes.xxlarge};
  }
`;

const PageSubtitle = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.large};
  opacity: 0.9;
`;

const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacing.xl} ${({ theme }) => theme.spacing.md};
  padding-top: 120px;
  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    padding: ${({ theme }) => theme.spacing.xl} ${({ theme }) => theme.spacing.md};
    padding-top: 100px;
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    padding: ${({ theme }) => theme.spacing.lg} ${({ theme }) => theme.spacing.sm};
    padding-top: 90px;
  }`;

const ProfileContent = styled.div`
  background: ${({ theme }) => theme.colors.white};
  border-radius: 12px;
  box-shadow: ${({ theme }) => theme.shadows.medium};
  overflow: hidden;
`;

const ProfileSection = styled.div`
  padding: ${({ theme }) => theme.spacing.xl};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};

  &:last-child {
    border-bottom: none;
  }
`;

const SectionTitle = styled.h2`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: ${({ theme }) => theme.fontSizes.xlarge};
  color: ${({ theme }) => theme.colors.secondary};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const ProfilePictureSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
`;

const AvatarWrapper = styled.div`
  position: relative;
  width: 150px;
  height: 150px;
`;

const ProfileAvatar = styled.div`
  position: relative;
  width: 150px;
  height: 150px;
  border-radius: 50%;
  overflow: hidden;
  border: 4px solid ${({ theme }) => theme.colors.primary};

  &:hover > div {
    opacity: 1;
  }
`;

const AvatarImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const AvatarPlaceholder = styled.div`
  width: 100%;
  height: 100%;
  background: ${({ theme }) => theme.colors.accent}33;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 60px;
  color: ${({ theme }) => theme.colors.primary};
`;

const CameraBadge = styled.label`
  position: absolute;
  bottom: 5px;
  right: 5px;
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.primary} 0%, ${({ theme }) => theme.colors.accent} 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.white};
  cursor: pointer;
  box-shadow: ${({ theme }) => theme.shadows.medium};
  border: 3px solid ${({ theme }) => theme.colors.white};
  transition: all ${({ theme }) => theme.transitions.medium};
  z-index: 2;

  svg {
    font-size: ${({ theme }) => theme.fontSizes.medium};
  }

  &:hover {
    transform: scale(1.1);
  }

  @media (max-width: 450px) {
    width: 35px;
    height: 35px;
    bottom: 0;
    right: 0;

    svg {
      font-size: ${({ theme }) => theme.fontSizes.small};
    }
  }
`;

const ProfileName = styled.h3`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: ${({ theme }) => theme.fontSizes.xlarge};
  color: ${({ theme }) => theme.colors.secondary};
`;

const ProfileEmail = styled.p`
  color: ${({ theme }) => theme.colors.textLight};
  font-size: ${({ theme }) => theme.fontSizes.medium};
`;

const Form = styled.form``;

const FormGroup = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const Label = styled.label`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  font-size: ${({ theme }) => theme.fontSizes.medium};

  svg {
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const Input = styled.input`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  border: 2px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  font-size: ${({ theme }) => theme.fontSizes.medium};
  transition: border-color ${({ theme }) => theme.transitions.fast};

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.xl};
  justify-content: flex-end;

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    padding: ${({ theme }) => theme.spacing.md};
    gap: ${({ theme }) => theme.spacing.sm};
  }

  @media (max-width: 450px) {
    flex-direction: column;
    gap: ${({ theme }) => theme.spacing.sm};
    padding: ${({ theme }) => theme.spacing.sm};
  }
`;

const SaveButton = styled.button`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.primary} 0%, ${({ theme }) => theme.colors.accent} 100%);
  color: ${({ theme }) => theme.colors.white};
  border: none;
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.xl};
  border-radius: 8px;
  font-size: ${({ theme }) => theme.fontSizes.medium};
  font-weight: 600;
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.medium};
  justify-content: center;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.shadows.medium};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
    font-size: ${({ theme }) => theme.fontSizes.small};
  }

  @media (max-width: 450px) {
    width: 100%;
    padding: ${({ theme }) => theme.spacing.sm};
  }
`;

const CancelButton = styled.button`
  background: ${({ theme }) => theme.colors.white};
  color: ${({ theme }) => theme.colors.text};
  border: 2px solid ${({ theme }) => theme.colors.border};
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.xl};
  border-radius: 8px;
  font-size: ${({ theme }) => theme.fontSizes.medium};
  font-weight: 600;
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.medium};

  &:hover {
    background: ${({ theme }) => theme.colors.border};
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
    font-size: ${({ theme }) => theme.fontSizes.small};
  }

  @media (max-width: 450px) {
    width: 100%;
    padding: ${({ theme }) => theme.spacing.sm};
  }
`;

const ErrorMessage = styled.div`
  background: #fee;
  color: #c33;
  padding: ${({ theme }) => theme.spacing.md};
  border-radius: 8px;
  margin: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.xl};
  text-align: center;
`;

const SuccessMessage = styled.div`
  background: #efe;
  color: #3c3;
  padding: ${({ theme }) => theme.spacing.md};
  border-radius: 8px;
  margin: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.xl};
  text-align: center;
`;

const ImageModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: ${({ theme }) => theme.spacing.md};
`;

const ModalContent = styled.div`
  position: relative;
  max-width: 90vw;
  max-height: 90vh;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ModalImage = styled.img`
  max-width: 100%;
  max-height: 90vh;
  border-radius: 8px;
  box-shadow: ${({ theme }) => theme.shadows.xlarge};
`;

const CloseButton = styled.button`
  position: absolute;
  top: -40px;
  right: -40px;
  background: ${({ theme }) => theme.colors.white};
  color: ${({ theme }) => theme.colors.secondary};
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  font-size: 30px;
  line-height: 1;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all ${({ theme }) => theme.transitions.fast};

  &:hover {
    background: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.white};
    transform: scale(1.1);
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    top: 10px;
    right: 10px;
  }
`;
