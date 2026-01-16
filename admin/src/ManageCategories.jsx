import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import api from './api';
import { Container, Header, Table, Button, DangerButton, Modal, ModalOverlay, ModalActions, FormGroup, Input, Loading } from './components/SharedStyles';

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

const StatusBadge = styled.span`
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.875rem;
  font-weight: 500;
  
  ${props => props.active ? 
    'background: #dcfce7; color: #16a34a;' : 
    'background: #fee2e2; color: #dc2626;'
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 0.5rem;
  position: relative;
  z-index: 10;
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
  position: relative;
  pointer-events: auto;
  
  ${props => {
    if (props.variant === 'edit') {
      return `
        background: linear-gradient(135deg, ${props.theme.colors.primary}, ${props.theme.colors.accent});
        color: white;
        &:hover { 
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(201, 166, 132, 0.4);
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

const ManageCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    focus: '',
    icon: 'FaSpa',
    display_order: 0,
    is_active: true
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/service-categories/');
      const data = response.data.results 
        ? response.data.results 
        : (Array.isArray(response.data) ? response.data : []);
      setCategories(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingCategory) {
        await api.put(`/service-categories/${editingCategory.id}/`, formData);
      } else {
        await api.post('/service-categories/', formData);
      }
      
      setShowModal(false);
      setEditingCategory(null);
      setFormData({
        name: '',
        description: '',
        focus: '',
        icon: 'FaSpa',
        display_order: 0,
        is_active: true
      });
      fetchCategories();
    } catch (error) {
      console.error('Error saving category:', error);
      alert('Failed to save category');
    }
  };

  const handleEdit = (category) => {
    console.log('EDIT CLICKED!', category);
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description,
      focus: category.focus,
      icon: category.icon,
      display_order: category.display_order,
      is_active: category.is_active
    });
    console.log('Setting showModal to true');
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this category? All associated services will lose their category.')) {
      try {
        await api.delete(`/service-categories/${id}/`);
        fetchCategories();
      } catch (error) {
        console.error('Error deleting category:', error);
        alert('Failed to delete category');
      }
    }
  };

  const handleAdd = () => {
    setEditingCategory(null);
    setFormData({
      name: '',
      description: '',
      focus: '',
      icon: 'FaSpa',
      display_order: 0,
      is_active: true
    });
    setShowModal(true);
  };

  if (loading) {
    return <Container><p>Loading categories...</p></Container>;
  }

  return (
    <Container>
      <Header>
        <h1>Manage Service Categories</h1>
        <AddButton onClick={handleAdd}>+ Add New Category</AddButton>
      </Header>

      <Table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Description</th>
            <th>Focus</th>
            <th>Order</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {categories.map(category => (
            <tr key={category.id}>
              <td>{category.name}</td>
              <td>{category.description}</td>
              <td>{category.focus}</td>
              <td>{category.display_order}</td>
              <td>
                <StatusBadge active={category.is_active}>
                  {category.is_active ? 'Active' : 'Inactive'}
                </StatusBadge>
              </td>
              <td>
                <ActionButtons>
                  <ActionButton variant="edit" onClick={(e) => { e.stopPropagation(); handleEdit(category); }}>
                    Edit
                  </ActionButton>
                  <ActionButton onClick={(e) => { e.stopPropagation(); handleDelete(category.id); }}>
                    Delete
                  </ActionButton>
                </ActionButtons>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {showModal && (
        <ModalOverlay onClick={() => setShowModal(false)}>
          <Modal onClick={(e) => e.stopPropagation()}>
            <h2>{editingCategory ? 'Edit Category' : 'Add New Category'}</h2>
            <Form onSubmit={handleSubmit}>
              <FormGroup>
                <Label>Category Name</Label>
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
                <Label>Focus</Label>
                <Input
                  type="text"
                  name="focus"
                  value={formData.focus}
                  onChange={handleInputChange}
                  required
                />
              </FormGroup>

              <FormGroup>
                <Label>Icon (React Icon Name)</Label>
                <Input
                  type="text"
                  name="icon"
                  value={formData.icon}
                  onChange={handleInputChange}
                />
              </FormGroup>

              <FormGroup>
                <Label>Display Order</Label>
                <Input
                  type="number"
                  name="display_order"
                  value={formData.display_order}
                  onChange={handleInputChange}
                />
              </FormGroup>

              <FormGroup>
                <Label>
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={formData.is_active}
                    onChange={handleInputChange}
                  />
                  {' '}Active
                </Label>
              </FormGroup>

              <ButtonGroup>
                <SubmitButton type="submit">
                  {editingCategory ? 'Update Category' : 'Add Category'}
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

export default ManageCategories;
