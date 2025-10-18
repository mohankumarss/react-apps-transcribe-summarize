import React, { useState, useEffect } from 'react';
import { Button } from '@shared/components';
import { useAuth } from '@shared/services';
import { ThemeProvider } from '@shared/services/theme';
import { logger } from '@shared/utils';
import CallLogPage from './components/CallLogPage';
import CallDetailPage from './components/CallDetailPage';
import CallDetailNewTabPage from './components/CallDetailNewTabPage';
import { DevelopmentToolbar } from './components/DevelopmentToolbar';
import { CallRecord } from './services/mockDataService';

// Navigation state type
type AppView = 'list' | 'detail' | 'new-tab';

function App() {
  const [currentView, setCurrentView] = useState<AppView>('list');
  const [selectedCallRecord, setSelectedCallRecord] = useState<CallRecord | null>(null);
  const { user, isAuthenticated, login } = useAuth();

  useEffect(() => {
    logger.info('Transcript and Summary app initialized');

    // Check if we're in a new tab context
    const params = new URLSearchParams(window.location.search);
    const context = params.get('context');
    if (context === 'new-tab') {
      setCurrentView('new-tab');
      logger.info('New tab context detected');
    }

    // Force CRM theme for webresource builds
    const deploymentMode = (typeof process !== 'undefined' ? process.env?.WEBPACK_DEPLOYMENT_MODE : undefined) || 'microfrontend';
    if (deploymentMode === 'web_resource') {
      // Ensure document root has CRM theme attribute
      document.documentElement.setAttribute('data-theme', 'crm');
      document.body.setAttribute('data-theme', 'crm');
      logger.info('CRM theme applied for webresource deployment');
    }
  }, []);

  // Navigation handlers
  const handleViewCall = (callRecord: CallRecord) => {
    setSelectedCallRecord(callRecord);
    setCurrentView('detail');
    logger.info('Navigating to call detail', { callId: callRecord.id });
  };

  const handleBackToList = () => {
    setCurrentView('list');
    setSelectedCallRecord(null);
    logger.info('Navigating back to call list');
  };

  // if (!isAuthenticated) {
  //   return (
  //     <ThemeProvider enableAutoDetection={true} enablePersistence={true}>
  //       <div className="transcript-app" style={{
  //         display: 'flex',
  //         flexDirection: 'column',
  //         alignItems: 'center',
  //         justifyContent: 'center',
  //         minHeight: '100vh',
  //         padding: '20px'
  //       }}>
  //         <h1>Transcript and Summary</h1>
  //         <p style={{ marginBottom: '20px' }}>
  //           Please log in to access the application.
  //         </p>
  //         <Button
  //           onClick={() => login({ email: 'demo@example.com', password: 'password' })}
  //           variant="primary"
  //         >
  //           Demo Login
  //         </Button>
  //       </div>
  //     </ThemeProvider>
  //   );
  // }

  // Configure theme provider based on deployment mode
  const deploymentMode = (typeof process !== 'undefined' ? process.env?.WEBPACK_DEPLOYMENT_MODE : undefined) || 'microfrontend';
  const isWebResource = deploymentMode === 'web_resource';

  return (
    <ThemeProvider
      enableAutoDetection={!isWebResource}
      enablePersistence={!isWebResource}
    >
      <div className="transcript-app" data-testid="app-container" data-theme={isWebResource ? 'crm' : undefined}>
        {currentView === 'new-tab' ? (
          <CallDetailNewTabPage />
        ) : currentView === 'list' ? (
          <CallLogPage onViewCall={handleViewCall} />
        ) : (
          selectedCallRecord && (
            <CallDetailPage
              callRecord={selectedCallRecord}
              onBack={handleBackToList}
            />
          )
        )}
      </div>
      {currentView !== 'new-tab' && <DevelopmentToolbar />}
    </ThemeProvider>
  );
}

export default App;
