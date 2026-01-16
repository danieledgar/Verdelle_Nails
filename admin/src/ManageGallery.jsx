import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import api from './api';
import { Container, Header, Button, DangerButton, Grid, Card, Modal, ModalOverlay, ModalActions, FormGroup, Input, Textarea, Select, StatusBadge, Loading } from './components/SharedStyles';

const AddButton = styled.button`
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, ${props => props.theme.colors.primary}, ${props => props.theme.colors.accent});
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 15px rgba(201, 166, 132, 0.3);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(201, 166, 132, 0.4);
  }
`;

const UploadButton = styled.label`
  padding: 0.75rem 1.5rem;
  background: ${props => props.theme.colors.secondary};
  color: white;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  
  &:hover {
    background: #3c3c3c;
  }
  
  input {
    display: none;
  }
`;

const GalleryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
`;

const GalleryItem = styled.div`
  position: relative;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
`;

const ImageContainer = styled.div`
  width: 100%;
  height: 280px;
  overflow: hidden;
  background: ${props => props.theme.colors.background};
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const ItemContent = styled.div`
  padding: 1rem;
`;

const ItemTitle = styled.h3`
  color: ${props => props.theme.colors.primary};
  margin-bottom: 0.5rem;
  font-size: 1rem;
`;

const ItemDescription = styled.p`
  color: ${props => props.theme.colors.text};
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const ItemCategory = styled.span`
  display: inline-block;
  padding: 0.25rem 0.75rem;
  background: ${props => props.theme.colors.primary}20;
  color: ${props => props.theme.colors.primary};
  border-radius: 12px;
  font-size: 0.75rem;
  margin-bottom: 1rem;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 0.5rem;
  position: relative;
  z-index: 10;
`;

const ActionButton = styled.button`
  flex: 1;
  padding: 0.5rem;
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  position: relative;
  pointer-events: auto;
  
  ${props => props.variant === 'edit' ? `
    background: linear-gradient(135deg, ${props.theme.colors.primary}, ${props.theme.colors.accent});
    color: white;
    &:hover { 
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(201, 166, 132, 0.4);
    }
  ` : `
    background: linear-gradient(135deg, #dc2626, #ef4444);
    color: white;
    &:hover { 
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(220, 38, 38, 0.4);
    }
  `}
  
  &:active {
    transform: translateY(0);
  }
`;

const ModalContent = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 8px;
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const Label = styled.label`
  color: ${props => props.theme.colors.text};
  font-weight: 500;
`;

const TextArea = styled.textarea`
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  min-height: 80px;
  resize: vertical;
  font-family: inherit;
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
`;

const SubmitButton = styled.button`
  flex: 1;
  padding: 0.75rem;
  background: ${props => props.theme.colors.primary};
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  
  &:hover {
    background: ${props => props.theme.colors.secondary};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const CancelButton = styled.button`
  flex: 1;
  padding: 0.75rem;
  background: #6b7280;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  
  &:hover {
    background: #4b5563;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  color: ${props => props.theme.colors.textLight};
`;

const ImagePreviewContainer = styled.div`
  width: 100%;
  max-width: 400px;
  margin-bottom: 1rem;
  border-radius: 8px;
  overflow: hidden;
  border: 2px solid ${props => props.theme.colors.primary};
  
  img {
    width: 100%;
    height: auto;
    display: block;
  }
`;

const ManageGallery = () => {
  const [galleryItems, setGalleryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    image: null
  });

  useEffect(() => {
    fetchGalleryItems();
  }, []);

  const fetchGalleryItems = async () => {
    try {
      const response = await api.get('/gallery/');
      const data = response.data.results 
        ? response.data.results 
        : (Array.isArray(response.data) ? response.data : []);
      setGalleryItems(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching gallery items:', error);
      setGalleryItems([]);
      setLoading(false);
    }
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const uploadFormData = new FormData();
    uploadFormData.append('image', file);
    uploadFormData.append('title', file.name);
    uploadFormData.append('description', 'New gallery image');
    uploadFormData.append('category', 'general');

    try {
      await api.post('/gallery/', uploadFormData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      fetchGalleryItems();
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleInputChange = (e) => {
    if (e.target.name === 'image') {
      const file = e.target.files[0];
      setFormData({
        ...formData,
        image: file
      });
      // Create preview URL
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result);
        };
        reader.readAsDataURL(file);
      }
    } else {
      setFormData({
        ...formData,
        [e.target.name]: e.target.value
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const submitFormData = new FormData();
    submitFormData.append('title', formData.title);
    submitFormData.append('description', formData.description);
    submitFormData.append('category', formData.category);
    
    if (formData.image) {
      submitFormData.append('image', formData.image);
    }

    try {
      if (editingItem) {
        await api.put(`/gallery/${editingItem.id}/`, submitFormData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
      } else {
        await api.post('/gallery/', submitFormData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
      }
      
      setShowModal(false);
      setEditingItem(null);
      setImagePreview(null);
      setFormData({
        title: '',
        description: '',
        category: '',
        image: null
      });
      fetchGalleryItems();
    } catch (error) {
      console.error('Error saving gallery item:', error);
      alert('Failed to save gallery item');
    }
  };

  const handleEdit = (item) => {
    console.log('EDIT BUTTON CLICKED!', item);
    setEditingItem(item);
    setFormData({
      title: item.title,
      description: item.description,
      category: item.category,
      image: null
    });
    setImagePreview(item.image);
    console.log('About to setShowModal(true)');
    setShowModal(true);
    console.log('showModal should now be true');
  };

  const handleAdd = () => {
    setEditingItem(null);
    setImagePreview(null);
    setFormData({
      title: '',
      description: '',
      category: '',
      image: null
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this gallery item?')) {
      try {
        await api.delete(`/gallery/${id}/`);
        fetchGalleryItems();
      } catch (error) {
        console.error('Error deleting gallery item:', error);
        alert('Failed to delete gallery item');
      }
    }
  };

  if (loading) {
    return <Container><p>Loading gallery...</p></Container>;
  }

  return (
    <Container>
      <Header>
        <h1>Manage Gallery</h1>
        <AddButton onClick={handleAdd}>+ Add New Item</AddButton>
      </Header>

      {galleryItems.length === 0 ? (
        <EmptyState>
          <p>No gallery items yet. Upload your first image!</p>
        </EmptyState>
      ) : (
        <GalleryGrid>
          {galleryItems.map(item => (
            <GalleryItem key={item.id}>
              <ImageContainer>
                <img src={item.image} alt={item.title} />
              </ImageContainer>
              <ItemContent>
                <ItemTitle>{item.title}</ItemTitle>
                {item.category && (
                  <ItemCategory>{item.category}</ItemCategory>
                )}
                <ItemDescription>{item.description}</ItemDescription>
                <ActionButtons>
                  <ActionButton variant="edit" onClick={(e) => { e.stopPropagation(); handleEdit(item); }}>
                    Edit
                  </ActionButton>
                  <ActionButton onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}>
                    Delete
                  </ActionButton>
                </ActionButtons>
              </ItemContent>
            </GalleryItem>
          ))}
        </GalleryGrid>
      )}

      {showModal && (
        <ModalOverlay onClick={() => setShowModal(false)}>
          <Modal onClick={(e) => e.stopPropagation()}>
            <h2>{editingItem ? 'Edit Gallery Item' : 'Add Gallery Item'}</h2>
            <Form onSubmit={handleSubmit}>
              <FormGroup>
                <Label>Title</Label>
                <Input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                />
              </FormGroup>

              <FormGroup>
                <Label>Description</Label>
                <TextArea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                />
              </FormGroup>

              <FormGroup>
                <Label>Category</Label>
                <Input
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  placeholder="e.g., manicure, pedicure, nail art"
                />
              </FormGroup>

              <FormGroup>
                <Label>{editingItem ? 'Change Image (Optional)' : 'Image'}</Label>
                {imagePreview && (
                  <ImagePreviewContainer>
                    <img src={imagePreview} alt="Preview" />
                  </ImagePreviewContainer>
                )}
                <Input
                  type="file"
                  name="image"
                  accept="image/*"
                  onChange={handleInputChange}
                  required={!editingItem}
                />
              </FormGroup>

              <ButtonGroup>
                <SubmitButton type="submit">
                  {editingItem ? 'Update Item' : 'Add Item'}
                </SubmitButton>
                <CancelButton type="button" onClick={() => {
                  setShowModal(false);
                  setImagePreview(null);
                }}>
                  Cancel
                </CancelButton>
              </ButtonGroup>
            </Form>
          </Modal>
        </ModalOverlay>
      )}
    </Container>
  );
};

export default ManageGallery;
