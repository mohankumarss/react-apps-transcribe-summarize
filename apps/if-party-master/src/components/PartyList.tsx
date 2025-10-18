import React, { useState } from 'react';
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

interface PartyListProps {
  parties: Party[];
  selectedParty: Party | null;
  onPartySelect: (party: Party) => void;
}

const PartyList: React.FC<PartyListProps> = ({ 
  parties, 
  selectedParty, 
  onPartySelect 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [filterType, setFilterType] = useState<string>('All');

  const filteredParties = parties.filter(party => {
    const matchesSearch = party.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         party.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'All' || party.status === filterStatus;
    const matchesType = filterType === 'All' || party.type === filterType;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return '#10b981';
      case 'Inactive': return '#ef4444';
      case 'Pending': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  return (
    <div>
      {/* Search and Filters */}
      <div style={{ marginBottom: '1rem' }}>
        <input
          type="text"
          placeholder="Search parties..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: '100%',
            padding: '0.5rem',
            border: '1px solid #d1d5db',
            borderRadius: '0.375rem',
            marginBottom: '0.5rem',
            fontSize: '0.875rem'
          }}
        />
        
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{
              flex: 1,
              padding: '0.25rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.25rem',
              fontSize: '0.75rem'
            }}
          >
            <option value="All">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="Pending">Pending</option>
          </select>
          
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            style={{
              flex: 1,
              padding: '0.25rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.25rem',
              fontSize: '0.75rem'
            }}
          >
            <option value="All">All Types</option>
            <option value="Individual">Individual</option>
            <option value="Organization">Organization</option>
          </select>
        </div>
      </div>

      {/* Party List */}
      <div>
        <h3 style={{ 
          marginBottom: '1rem', 
          color: '#374151',
          fontSize: '0.875rem',
          fontWeight: '600'
        }}>
          Parties ({filteredParties.length})
        </h3>
        
        {filteredParties.map(party => (
          <div
            key={party.id}
            onClick={() => onPartySelect(party)}
            style={{
              padding: '0.75rem',
              marginBottom: '0.5rem',
              backgroundColor: selectedParty?.id === party.id ? '#dbeafe' : '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '0.375rem',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            {/* Party Header */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'flex-start',
              marginBottom: '0.25rem'
            }}>
              <h4 style={{ 
                margin: 0, 
                fontSize: '0.875rem', 
                fontWeight: '600',
                color: '#1f2937'
              }}>
                {party.name}
              </h4>
              
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem'
              }}>
                <div style={{
                  width: '8px',
                  height: '8px',
                  backgroundColor: getStatusColor(party.status),
                  borderRadius: '50%'
                }}></div>
                <span style={{
                  fontSize: '0.75rem',
                  color: '#6b7280'
                }}>
                  {party.status}
                </span>
              </div>
            </div>

            {/* Party Type */}
            <div style={{ marginBottom: '0.25rem' }}>
              <span style={{
                fontSize: '0.75rem',
                color: '#6b7280',
                backgroundColor: '#f3f4f6',
                padding: '0.125rem 0.375rem',
                borderRadius: '0.25rem'
              }}>
                {party.type}
              </span>
            </div>

            {/* Contact Info */}
            {party.email && (
              <p style={{ 
                margin: '0 0 0.125rem 0', 
                fontSize: '0.75rem', 
                color: '#6b7280'
              }}>
                📧 {party.email}
              </p>
            )}
            
            {party.phone && (
              <p style={{ 
                margin: '0 0 0.125rem 0', 
                fontSize: '0.75rem', 
                color: '#6b7280'
              }}>
                📞 {party.phone}
              </p>
            )}

            {/* Last Updated */}
            <p style={{ 
              margin: '0.25rem 0 0 0', 
              fontSize: '0.75rem', 
              color: '#9ca3af'
            }}>
              Updated: {formatDate(party.updatedAt, 'MMM dd, yyyy')}
            </p>
          </div>
        ))}
        
        {filteredParties.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '2rem',
            color: '#9ca3af',
            fontSize: '0.875rem'
          }}>
            No parties found matching your criteria
          </div>
        )}
      </div>
    </div>
  );
};

export default PartyList;
