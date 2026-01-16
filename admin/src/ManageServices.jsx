import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import api from './api';
import { Container, Header, Button, DangerButton, SecondaryButton, Grid, Card, Modal, ModalOverlay, ModalActions, FormGroup, Input, Textarea, Select, Loading } from './components/SharedStyles';

const ServiceCard = styled(Card)`
  padding: 0;
  overflow: hidden;
  
  &:hover {
    transform: translateY(-2px);
  }
`;

const ServiceImage = styled.div`
  width: 100%;
  height: 200px;
  background: linear-gradient(135deg, ${props => props.theme.colors.primary}, ${props => props.theme.colors.secondary});
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 3rem;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const ServiceContent = styled.div`
  padding: 1.5rem;
`;

const ServiceTitle = styled.h3`
  color: ${props => props.theme.colors.primary};
  margin-bottom: 0.5rem;
`;

const ServiceCategory = styled.p`
  color: ${props => props.theme.colors.text};
  opacity: 0.6;
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
`;

const ServiceDescription = styled.p`
  color: ${props => props.theme.colors.text};
  margin-bottom: 1rem;
  line-height: 1.6;
`;

const ServiceDetails = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #eee;
`;

const Price = styled.span`
  font-size: 1.25rem;
  font-weight: bold;
  color: ${props => props.theme.colors.primary};
`;

const Duration = styled.span`
  color: ${props => props.theme.colors.text};
  opacity: 0.7;
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

const AddButton = styled.button`
  padding: 0.75rem 1.5rem;
  background: ${props => props.theme.colors.primary};
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  
  &:hover {
    background: ${props => props.theme.colors.secondary};
  }
`;

const ServicesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
`;

const TextArea = styled.textarea`
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  min-height: 100px;
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

const ManageServices = () => {
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    duration: '',
    category: ''
  });

  useEffect(() => {
    fetchServices();
    fetchCategories();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await api.get('/services/');
      const data = response.data.results 
        ? response.data.results 
        : (Array.isArray(response.data) ? response.data : []);
      setServices(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching services:', error);
      setServices([]);
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get('/service-categories/');
      const data = response.data.results 
        ? response.data.results 
        : (Array.isArray(response.data) ? response.data : []);
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingService) {
        await api.put(`/services/${editingService.id}/`, formData);
      } else {
        await api.post('/services/', formData);
      }
      
      setShowModal(false);
      setEditingService(null);
      setFormData({
        name: '',
        description: '',
        price: '',
        duration: '',
        category: ''
      });
      fetchServices();
    } catch (error) {
      console.error('Error saving service:', error);
      alert('Failed to save service');
    }
  };

  const handleEdit = (service) => {
    console.log('EDIT BUTTON CLICKED!', service);
    setEditingService(service);
    setFormData({
      name: service.name,
      description: service.description,
      price: service.price,
      duration: service.duration,
      category: service.category
    });
    console.log('About to setShowModal(true)');
    setShowModal(true);
    console.log('showModal should now be true');
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this service?')) {
      try {
        await api.delete(`/services/${id}/`);
        fetchServices();
      } catch (error) {
        console.error('Error deleting service:', error);
        alert('Failed to delete service');
      }
    }
  };

  const handleAdd = () => {
    setEditingService(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      duration: '',
      category: ''
    });
    setShowModal(true);
  };

  if (loading) {
    return <Container><p>Loading services...</p></Container>;
  }

  return (
    <Container>
      <Header>
        <h1>Manage Services</h1>
        <AddButton onClick={handleAdd}>+ Add New Service</AddButton>
      </Header>

      <ServicesGrid>
        {services.map(service => (
          <ServiceCard key={service.id}>
            <ServiceImage>
              {service.image ? (
                <img src={service.image} alt={service.name} />
              ) : (
                '💅'
              )}
            </ServiceImage>
            <ServiceContent>
              <ServiceTitle>{service.name}</ServiceTitle>
              <ServiceCategory>
                {categories.find(cat => cat.id === service.category)?.name || 'Uncategorized'}
              </ServiceCategory>
              <ServiceDescription>{service.description}</ServiceDescription>
              <ServiceDetails>
                <Price>KSh {service.price}</Price>
                <Duration>{service.duration} min</Duration>
              </ServiceDetails>
              <ActionButtons>
                <ActionButton variant="edit" onClick={(e) => { e.stopPropagation(); handleEdit(service); }}>
                  Edit
                </ActionButton>
                <ActionButton onClick={(e) => { e.stopPropagation(); handleDelete(service.id); }}>
                  Delete
                </ActionButton>
              </ActionButtons>
            </ServiceContent>
          </ServiceCard>
        ))}
      </ServicesGrid>

      {showModal && (
        <ModalOverlay onClick={() => setShowModal(false)}>
          <Modal onClick={(e) => e.stopPropagation()}>
            <h2>{editingService ? 'Edit Service' : 'Add New Service'}</h2>
            <Form onSubmit={handleSubmit}>
              <FormGroup>
                <Label>Service Name</Label>
                <Input
                  type="text"
                  name="name"
                  value={formData.name}
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
                  required
                />
              </FormGroup>

              <FormGroup>
                <Label>Category</Label>
                <Select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </Select>
              </FormGroup>

              <FormGroup>
                <Label>Price (KSh)</Label>
                <Input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                />
              </FormGroup>

              <FormGroup>
                <Label>Duration (minutes)</Label>
                <Input
                  type="number"
                  name="duration"
                  value={formData.duration}
                  onChange={handleInputChange}
                  required
                />
              </FormGroup>

              <ButtonGroup>
                <SubmitButton type="submit">
                  {editingService ? 'Update Service' : 'Add Service'}
                </SubmitButton>
                <CancelButton type="button" onClick={() => setShowModal(false)}>
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

export default ManageServices;
