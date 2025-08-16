import React from 'react';

const UnauthorizedPage = () => {
  return (
    <div className="d-flex align-items-center justify-content-center min-vh-100 bg-light">
      <div className="text-center">
        <div className="mb-4">
          <svg 
            width="64" 
            height="64" 
            fill="#0C1D61" 
            viewBox="0 0 16 16"
          >
            <path d="M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2zm3 6V3a3 3 0 0 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/>
          </svg>
        </div>
        
        <h1 className="h2 text-dark mb-2">Access Denied</h1>
        <p className="text-muted mb-4">You are not authorized to view this page</p>
    
      </div>
    </div>
  );
};

export default UnauthorizedPage;