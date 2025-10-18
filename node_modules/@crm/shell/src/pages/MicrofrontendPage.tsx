/**
 * Microfrontend Page
 * 
 * Generic page for displaying microfrontends
 */

import React from 'react';
import { Navigate } from 'react-router-dom';
import { MicrofrontendContainer } from '../components/MicrofrontendContainer/MicrofrontendContainer';
import { getMicrofrontendByRoute } from '../config/shellConfig';
import './MicrofrontendPage.css';
import { useLocation } from "react-router-dom";
export const MicrofrontendPage: React.FC = () => {
  const { pathname } = useLocation();

  // Extract the base route from pathname (e.g., /transcript/something -> /transcript)
  const baseRoute = '/' + pathname.split('/')[1];

  // Find the microfrontend configuration for this route
  const config = getMicrofrontendByRoute(baseRoute);

  if (!config) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="microfrontend-page">
      <div className="microfrontend-page__header">
        <h1 className="microfrontend-page__title">{config.displayName}</h1>
        {config.description && (
          <p className="microfrontend-page__description">{config.description}</p>
        )}
      </div>

      <div className="microfrontend-page__content">
        <MicrofrontendContainer
          config={config}
          onLoad={(instance) => {
            console.log(`Loaded microfrontend: ${instance.config.name}`);
          }}
          onError={(error) => {
            console.error(`Error loading microfrontend: ${config.name}`, error);
          }}
        />
      </div>
    </div>
  );
};
