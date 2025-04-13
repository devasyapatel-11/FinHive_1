import React from 'react';
import Sidebar from '@/components/Sidebar';
import { useAuth } from '@/hooks/useAuth';

interface PageTemplateProps {
  title: string;
  children?: React.ReactNode;
}

const PageTemplate: React.FC<PageTemplateProps> = ({ title, children }) => {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-finhive-primary mx-auto"></div>
          <p className="mt-4 text-finhive-text">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto p-6">
          <h1 className="text-2xl font-bold text-finhive-text mb-6">{title}</h1>
          
          {children || (
            <div className="bg-white p-6 rounded-lg border border-finhive-border">
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-full bg-finhive-accent/30 flex items-center justify-center mx-auto mb-4">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M13 9H11V7H13V9ZM13 17H11V11H13V17ZM12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20Z" fill="#FF6634"/>
                  </svg>
                </div>
                <h2 className="text-xl font-medium text-finhive-text mb-2">Coming Soon</h2>
                <p className="text-finhive-muted max-w-md mx-auto">
                  This feature is currently under development. Check back soon for updates!
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PageTemplate;
