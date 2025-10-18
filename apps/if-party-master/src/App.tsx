import React, { useState, useEffect } from 'react';
import { Button, LoadingSpinner } from '@shared/components';
import { useAuth } from '@shared/services';
import { logger, formatDate } from '@shared/utils';
import PartyList from './components/PartyList';
import PartyDetails from './components/PartyDetails';
import PartyForm from './components/PartyForm';

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

function App() {
  const [parties, setParties] = useState<Party[]>([]);
  const [selectedParty, setSelectedParty] = useState<Party | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingParty, setEditingParty] = useState<Party | null>(null);
  const { user, isAuthenticated, login } = useAuth();

  useEffect(() => {
    logger.info('IF Party Master app initialized');
    loadParties();
  }, []);

  const loadParties = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockParties: Party[] = [
        {
          id: '1',
          name: 'John Doe',
          type: 'Individual',
          email: 'john.doe@example.com',
          phone: '+1 (555) 123-4567',
          address: '123 Main St, Anytown, USA',
          status: 'Active',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: '2',
          name: 'Acme Corporation',
          type: 'Organization',
          email: 'contact@acme.com',
          phone: '+1 (555) 987-6543',
          address: '456 Business Ave, Corporate City, USA',
          status: 'Active',
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          updatedAt: new Date(Date.now() - 3600000).toISOString(),
        },
        {
          id: '3',
          name: 'Jane Smith',
          type: 'Individual',
          email: 'jane.smith@example.com',
          phone: '+1 (555) 456-7890',
          status: 'Pending',
          createdAt: new Date(Date.now() - 172800000).toISOString(),
          updatedAt: new Date(Date.now() - 172800000).toISOString(),
        },
      ];
      
      setParties(mockParties);
      logger.info('Parties loaded successfully', { count: mockParties.length });
    } catch (error) {
      logger.error('Failed to load parties', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePartySelect = (party: Party) => {
    setSelectedParty(party);
    logger.info('Party selected', { id: party.id, name: party.name });
  };

  const handleCreateParty = () => {
    setEditingParty(null);
    setShowForm(true);
  };

  const handleEditParty = (party: Party) => {
    setEditingParty(party);
    setShowForm(true);
  };

  const handleSaveParty = async (partyData: Omit<Party, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      if (editingParty) {
        // Update existing party
        const updatedParty: Party = {
          ...editingParty,
          ...partyData,
          updatedAt: new Date().toISOString(),
        };
        
        setParties(prev => prev.map(p => p.id === editingParty.id ? updatedParty : p));
        setSelectedParty(updatedParty);
        logger.info('Party updated', { id: updatedParty.id, name: updatedParty.name });
      } else {
        // Create new party
        const newParty: Party = {
          ...partyData,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        
        setParties(prev => [newParty, ...prev]);
        setSelectedParty(newParty);
        logger.info('Party created', { id: newParty.id, name: newParty.name });
      }
      
      setShowForm(false);
      setEditingParty(null);
    } catch (error) {
      logger.error('Failed to save party', error);
    }
  };

  const handleDeleteParty = async (partyId: string) => {
    try {
      setParties(prev => prev.filter(p => p.id !== partyId));
      if (selectedParty?.id === partyId) {
        setSelectedParty(null);
      }
      logger.info('Party deleted', { id: partyId });
    } catch (error) {
      logger.error('Failed to delete party', error);
    }
  };

  if (!isAuthenticated) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '100vh',
        padding: '20px'
      }}>
        <h1>IF Party Master</h1>
        <p>Please log in to access the application.</p>
        <Button 
          onClick={() => login({ email: 'demo@example.com', password: 'password' })}
          variant="primary"
        >
          Demo Login
        </Button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Header */}
      <header style={{ 
        backgroundColor: '#fff', 
        padding: '1rem 2rem', 
        borderBottom: '1px solid #e5e7eb',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ margin: 0, color: '#1f2937' }}>IF Party Master</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span>Welcome, {user?.name || 'User'}</span>
            <Button variant="secondary" size="small">
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div style={{ display: 'flex', flex: 1 }}>
        {/* Sidebar - Party List */}
        <aside style={{ 
          width: '350px', 
          backgroundColor: '#f9fafb', 
          borderRight: '1px solid #e5e7eb',
          padding: '1rem'
        }}>
          <div style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem' }}>
            <Button onClick={handleCreateParty} size="small" style={{ flex: 1 }}>
              New Party
            </Button>
            <Button onClick={loadParties} variant="secondary" size="small">
              Refresh
            </Button>
          </div>
          
          {isLoading ? (
            <LoadingSpinner message="Loading parties..." />
          ) : (
            <PartyList 
              parties={parties}
              selectedParty={selectedParty}
              onPartySelect={handlePartySelect}
            />
          )}
        </aside>

        {/* Main Content Area */}
        <main style={{ flex: 1 }}>
          {showForm ? (
            <PartyForm
              party={editingParty}
              onSave={handleSaveParty}
              onCancel={() => {
                setShowForm(false);
                setEditingParty(null);
              }}
            />
          ) : selectedParty ? (
            <PartyDetails 
              party={selectedParty}
              onEdit={handleEditParty}
              onDelete={handleDeleteParty}
            />
          ) : (
            <div style={{ 
              flex: 1, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              color: '#6b7280'
            }}>
              <p>Select a party to view details or create a new one</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
