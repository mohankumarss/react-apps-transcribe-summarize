/**
 * Not Found Page
 * 
 * 404 error page for the shell application
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@shared/components';
import './NotFoundPage.css';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="not-found-page">
      <div className="not-found-page__content">
        <h1 className="not-found-page__title">404</h1>
        <h2 className="not-found-page__subtitle">Page Not Found</h2>
        <p className="not-found-page__message">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="not-found-page__actions">
          <Link to="/">
            <Button variant="primary">
              Go to Dashboard
            </Button>
          </Link>
          <Button 
            variant="secondary" 
            onClick={() => window.history.back()}
          >
            Go Back
          </Button>
        </div>
      </div>
    </div>
  );
};
