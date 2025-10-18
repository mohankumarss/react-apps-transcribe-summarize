import React from 'react';
import { Button } from '@shared/components';
import { formatDate } from '@shared/utils';

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

interface PartyDetailsProps {
  party: Party;
  onEdit: (party: Party) => void;
  onDelete: (partyId: string) => void;
}

const PartyDetails: React.FC<PartyDetailsProps> = ({ 
  party, 
  onEdit, 
  onDelete 
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return '#10b981';
      case 'Inactive': return '#ef4444';
      case 'Pending': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete ${party.name}?`)) {
      onDelete(party.id);
    }
  };

  return (
    <div style={{ padding: '2rem', backgroundColor: '#fff' }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-start',
        marginBottom: '2rem',
        paddingBottom: '1rem',
        borderBottom: '1px solid #e5e7eb'
      }}>
        <div>
          <h2 style={{ margin: '0 0 0.5rem 0', color: '#1f2937' }}>
            {party.name}
          </h2>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{
              fontSize: '0.875rem',
              color: '#6b7280',
              backgroundColor: '#f3f4f6',
              padding: '0.25rem 0.75rem',
              borderRadius: '0.375rem'
            }}>
              {party.type}
            </span>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{
                width: '10px',
                height: '10px',
                backgroundColor: getStatusColor(party.status),
                borderRadius: '50%'
              }}></div>
              <span style={{ fontSize: '0.875rem', color: '#374151' }}>
                {party.status}
              </span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Button onClick={() => onEdit(party)} size="small">
            Edit
          </Button>
          <Button onClick={handleDelete} variant="danger" size="small">
            Delete
          </Button>
        </div>
      </div>

      {/* Contact Information */}
      <div style={{ marginBottom: '2rem' }}>
        <h3 style={{ 
          margin: '0 0 1rem 0', 
          color: '#374151',
          fontSize: '1.125rem',
          fontWeight: '600'
        }}>
          Contact Information
        </h3>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1rem'
        }}>
          {party.email && (
            <div style={{ 
              padding: '1rem',
              backgroundColor: '#f9fafb',
              borderRadius: '0.5rem',
              border: '1px solid #e5e7eb'
            }}>
              <h4 style={{ 
                margin: '0 0 0.5rem 0', 
                fontSize: '0.875rem',
                fontWeight: '600',
                color: '#374151'
              }}>
                Email Address
              </h4>
              <p style={{ margin: 0, color: '#1f2937' }}>
                <a 
                  href={`mailto:${party.email}`}
                  style={{ color: '#2563eb', textDecoration: 'none' }}
                >
                  {party.email}
                </a>
              </p>
            </div>
          )}

          {party.phone && (
            <div style={{ 
              padding: '1rem',
              backgroundColor: '#f9fafb',
              borderRadius: '0.5rem',
              border: '1px solid #e5e7eb'
            }}>
              <h4 style={{ 
                margin: '0 0 0.5rem 0', 
                fontSize: '0.875rem',
                fontWeight: '600',
                color: '#374151'
              }}>
                Phone Number
              </h4>
              <p style={{ margin: 0, color: '#1f2937' }}>
                <a 
                  href={`tel:${party.phone}`}
                  style={{ color: '#2563eb', textDecoration: 'none' }}
                >
                  {party.phone}
                </a>
              </p>
            </div>
          )}

          {party.address && (
            <div style={{ 
              padding: '1rem',
              backgroundColor: '#f9fafb',
              borderRadius: '0.5rem',
              border: '1px solid #e5e7eb',
              gridColumn: 'span 2'
            }}>
              <h4 style={{ 
                margin: '0 0 0.5rem 0', 
                fontSize: '0.875rem',
                fontWeight: '600',
                color: '#374151'
              }}>
                Address
              </h4>
              <p style={{ margin: 0, color: '#1f2937' }}>
                {party.address}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* System Information */}
      <div style={{ marginBottom: '2rem' }}>
        <h3 style={{ 
          margin: '0 0 1rem 0', 
          color: '#374151',
          fontSize: '1.125rem',
          fontWeight: '600'
        }}>
          System Information
        </h3>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1rem'
        }}>
          <div style={{ 
            padding: '1rem',
            backgroundColor: '#f9fafb',
            borderRadius: '0.5rem',
            border: '1px solid #e5e7eb'
          }}>
            <h4 style={{ 
              margin: '0 0 0.5rem 0', 
              fontSize: '0.875rem',
              fontWeight: '600',
              color: '#374151'
            }}>
              Party ID
            </h4>
            <p style={{ margin: 0, color: '#1f2937', fontFamily: 'monospace' }}>
              {party.id}
            </p>
          </div>

          <div style={{ 
            padding: '1rem',
            backgroundColor: '#f9fafb',
            borderRadius: '0.5rem',
            border: '1px solid #e5e7eb'
          }}>
            <h4 style={{ 
              margin: '0 0 0.5rem 0', 
              fontSize: '0.875rem',
              fontWeight: '600',
              color: '#374151'
            }}>
              Created
            </h4>
            <p style={{ margin: 0, color: '#1f2937' }}>
              {formatDate(party.createdAt, 'MMM dd, yyyy h:mm a')}
            </p>
          </div>

          <div style={{ 
            padding: '1rem',
            backgroundColor: '#f9fafb',
            borderRadius: '0.5rem',
            border: '1px solid #e5e7eb'
          }}>
            <h4 style={{ 
              margin: '0 0 0.5rem 0', 
              fontSize: '0.875rem',
              fontWeight: '600',
              color: '#374151'
            }}>
              Last Updated
            </h4>
            <p style={{ margin: 0, color: '#1f2937' }}>
              {formatDate(party.updatedAt, 'MMM dd, yyyy h:mm a')}
            </p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div style={{ 
        display: 'flex', 
        gap: '0.5rem',
        paddingTop: '1rem',
        borderTop: '1px solid #e5e7eb'
      }}>
        <Button variant="secondary" size="small">
          Export to CRM
        </Button>
        <Button variant="secondary" size="small">
          Generate Report
        </Button>
        <Button variant="secondary" size="small">
          View History
        </Button>
        <Button variant="secondary" size="small">
          Duplicate
        </Button>
      </div>
    </div>
  );
};

export default PartyDetails;
