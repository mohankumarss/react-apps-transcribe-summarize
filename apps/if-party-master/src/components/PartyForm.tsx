import React, { useState, useEffect } from 'react';
import { Button } from '@shared/components';
import { validateEmail, validatePhoneNumber, validateRequired, combineValidationResults } from '@shared/utils';

interface Party {
  id: string;
  name: string;
  type: 'Individual' | 'Organization';
  email?: string;
  phone?: string;
  address?: string;
  status: 'Active' | 'Inactive' | 'Pending';
  createdAt: string;
  updatedAt: string;
}

interface PartyFormProps {
  party?: Party | null;
  onSave: (party: Omit<Party, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

const PartyForm: React.FC<PartyFormProps> = ({ 
  party, 
  onSave, 
  onCancel 
}) => {
  const [formData, setFormData] = useState({
    name: '',
    type: 'Individual' as 'Individual' | 'Organization',
    email: '',
    phone: '',
    address: '',
    status: 'Active' as 'Active' | 'Inactive' | 'Pending',
  });

  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (party) {
      setFormData({
        name: party.name,
        type: party.type,
        email: party.email || '',
        phone: party.phone || '',
        address: party.address || '',
        status: party.status,
      });
    }
  }, [party]);

  const validateForm = () => {
    const validationResults = {
      name: validateRequired(formData.name, 'Name'),
      email: formData.email ? validateEmail(formData.email) : { isValid: true, errors: [] },
      phone: formData.phone ? validatePhoneNumber(formData.phone) : { isValid: true, errors: [] },
    };

    const newErrors: Record<string, string[]> = {};
    Object.entries(validationResults).forEach(([field, result]) => {
      if (!result.isValid) {
        newErrors[field] = result.errors;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear errors for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const renderFieldError = (field: string) => {
    if (errors[field]) {
      return (
        <div style={{ marginTop: '0.25rem' }}>
          {errors[field].map((error, index) => (
            <p key={index} style={{ 
              margin: 0, 
              fontSize: '0.75rem', 
              color: '#ef4444' 
            }}>
              {error}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ padding: '2rem', backgroundColor: '#fff' }}>
      {/* Header */}
      <div style={{ 
        marginBottom: '2rem',
        paddingBottom: '1rem',
        borderBottom: '1px solid #e5e7eb'
      }}>
        <h2 style={{ margin: '0 0 0.5rem 0', color: '#1f2937' }}>
          {party ? 'Edit Party' : 'Create New Party'}
        </h2>
        <p style={{ margin: 0, color: '#6b7280' }}>
          {party ? 'Update the party information below.' : 'Enter the details for the new party.'}
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem'
        }}>
          {/* Name */}
          <div>
            <label style={{ 
              display: 'block',
              marginBottom: '0.5rem',
              fontSize: '0.875rem',
              fontWeight: '600',
              color: '#374151'
            }}>
              Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: `1px solid ${errors.name ? '#ef4444' : '#d1d5db'}`,
                borderRadius: '0.375rem',
                fontSize: '0.875rem',
                boxSizing: 'border-box'
              }}
              placeholder="Enter party name"
            />
            {renderFieldError('name')}
          </div>

          {/* Type */}
          <div>
            <label style={{ 
              display: 'block',
              marginBottom: '0.5rem',
              fontSize: '0.875rem',
              fontWeight: '600',
              color: '#374151'
            }}>
              Type
            </label>
            <select
              value={formData.type}
              onChange={(e) => handleInputChange('type', e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                fontSize: '0.875rem',
                boxSizing: 'border-box'
              }}
            >
              <option value="Individual">Individual</option>
              <option value="Organization">Organization</option>
            </select>
          </div>

          {/* Email */}
          <div>
            <label style={{ 
              display: 'block',
              marginBottom: '0.5rem',
              fontSize: '0.875rem',
              fontWeight: '600',
              color: '#374151'
            }}>
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: `1px solid ${errors.email ? '#ef4444' : '#d1d5db'}`,
                borderRadius: '0.375rem',
                fontSize: '0.875rem',
                boxSizing: 'border-box'
              }}
              placeholder="Enter email address"
            />
            {renderFieldError('email')}
          </div>

          {/* Phone */}
          <div>
            <label style={{ 
              display: 'block',
              marginBottom: '0.5rem',
              fontSize: '0.875rem',
              fontWeight: '600',
              color: '#374151'
            }}>
              Phone
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: `1px solid ${errors.phone ? '#ef4444' : '#d1d5db'}`,
                borderRadius: '0.375rem',
                fontSize: '0.875rem',
                boxSizing: 'border-box'
              }}
              placeholder="Enter phone number"
            />
            {renderFieldError('phone')}
          </div>

          {/* Status */}
          <div>
            <label style={{ 
              display: 'block',
              marginBottom: '0.5rem',
              fontSize: '0.875rem',
              fontWeight: '600',
              color: '#374151'
            }}>
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => handleInputChange('status', e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                fontSize: '0.875rem',
                boxSizing: 'border-box'
              }}
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Pending">Pending</option>
            </select>
          </div>

          {/* Address */}
          <div style={{ gridColumn: 'span 2' }}>
            <label style={{ 
              display: 'block',
              marginBottom: '0.5rem',
              fontSize: '0.875rem',
              fontWeight: '600',
              color: '#374151'
            }}>
              Address
            </label>
            <textarea
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              rows={3}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                fontSize: '0.875rem',
                boxSizing: 'border-box',
                resize: 'vertical'
              }}
              placeholder="Enter address"
            />
          </div>
        </div>

        {/* Form Actions */}
        <div style={{ 
          display: 'flex', 
          gap: '0.5rem',
          paddingTop: '1rem',
          borderTop: '1px solid #e5e7eb'
        }}>
          <Button 
            type="submit" 
            disabled={isSubmitting}
            style={{ minWidth: '120px' }}
          >
            {isSubmitting ? 'Saving...' : (party ? 'Update Party' : 'Create Party')}
          </Button>
          <Button 
            type="button"
            variant="secondary" 
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
};

export default PartyForm;
