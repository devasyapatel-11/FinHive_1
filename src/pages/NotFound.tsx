
import React from 'react';
import { Link } from 'react-router-dom';
import FinHiveLogo from '@/components/FinHiveLogo';

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="text-center mb-8">
        <FinHiveLogo size="lg" className="mx-auto mb-6" />
        <h1 className="text-6xl font-bold text-finhive-primary mb-4">404</h1>
        <p className="text-xl text-finhive-text mb-8">Oops! The page you're looking for doesn't exist.</p>
        <Link 
          to="/" 
          className="inline-flex items-center justify-center px-6 py-3 bg-finhive-primary text-white font-medium rounded-md hover:bg-finhive-primary/90 transition-colors"
        >
          Return to Dashboard
        </Link>
      </div>
      <p className="text-finhive-muted text-sm">
        If you believe this is an error, please contact support@finhive.com
      </p>
    </div>
  );
};

export default NotFound;
