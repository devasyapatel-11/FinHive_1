import React, { useState } from 'react';
import PageTemplate from './PageTemplate';
import { formatIndianCurrency } from '@/services/financeService';
import { ScanLine, Upload, Check, AlertCircle } from 'lucide-react';

const ScanReceipts = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedReceipts, setUploadedReceipts] = useState<any[]>([
    { id: 1, name: 'Grocery_Receipt.jpg', status: 'processed', amount: 1250.75, date: '2025-04-10', merchant: 'BigBazaar' },
    { id: 2, name: 'Restaurant_Bill.jpg', status: 'processing', amount: null, date: null, merchant: null },
  ]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    // In a real app, we would process the files here
    // For demo purposes, we'll just show a message
    alert('Receipt upload feature is coming soon!');
  };

  return (
    <PageTemplate title="Scan Receipts">
      <div className="space-y-6">
        {/* Upload section */}
        <div className="bg-white p-6 rounded-lg border border-finhive-border">
          <h2 className="text-lg font-medium mb-6">Upload Receipt</h2>
          
          <div 
            className={`border-2 border-dashed rounded-lg p-8 text-center ${isDragging ? 'border-finhive-primary bg-finhive-accent/10' : 'border-gray-300'}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="w-16 h-16 rounded-full bg-finhive-accent/30 flex items-center justify-center mx-auto mb-4">
              <ScanLine className="text-finhive-primary" size={24} />
            </div>
            <h3 className="text-lg font-medium mb-2">Drag & Drop Receipt</h3>
            <p className="text-finhive-muted max-w-md mx-auto mb-6">
              Upload a photo or scan of your receipt to automatically extract the details
            </p>
            <button className="px-4 py-2 bg-finhive-primary text-white rounded-md text-sm flex items-center gap-2 mx-auto">
              <Upload size={16} />
              <span>Browse Files</span>
            </button>
            <p className="text-xs text-finhive-muted mt-4">
              Supported formats: JPG, PNG, PDF (Max size: 10MB)
            </p>
          </div>
        </div>

        {/* Recent Uploads */}
        <div className="bg-white p-6 rounded-lg border border-finhive-border">
          <h2 className="text-lg font-medium mb-6">Recent Uploads</h2>
          
          {uploadedReceipts.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-finhive-border">
                    <th className="text-left py-3 px-4 font-medium text-finhive-muted">Receipt</th>
                    <th className="text-left py-3 px-4 font-medium text-finhive-muted">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-finhive-muted">Merchant</th>
                    <th className="text-left py-3 px-4 font-medium text-finhive-muted">Date</th>
                    <th className="text-right py-3 px-4 font-medium text-finhive-muted">Amount</th>
                    <th className="text-right py-3 px-4 font-medium text-finhive-muted">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {uploadedReceipts.map((receipt) => (
                    <tr key={receipt.id} className="border-b border-finhive-border hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded bg-finhive-accent/20 flex items-center justify-center">
                            <ScanLine className="text-finhive-primary" size={16} />
                          </div>
                          <span>{receipt.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {receipt.status === 'processed' ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                            <Check size={12} className="mr-1" /> Processed
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">
                            <svg className="animate-spin -ml-1 mr-2 h-3 w-3 text-yellow-800" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Processing
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {receipt.merchant || '-'}
                      </td>
                      <td className="py-3 px-4">
                        {receipt.date ? new Date(receipt.date).toLocaleDateString('en-IN') : '-'}
                      </td>
                      <td className="py-3 px-4 text-right font-medium">
                        {receipt.amount ? formatIndianCurrency(receipt.amount) : '-'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button className="text-finhive-primary hover:text-finhive-accent transition-colors">
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full bg-finhive-accent/30 flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="text-finhive-primary" size={24} />
              </div>
              <h2 className="text-xl font-medium text-finhive-text mb-2">No Receipts Yet</h2>
              <p className="text-finhive-muted max-w-md mx-auto">
                Upload your first receipt to get started.
              </p>
            </div>
          )}
        </div>

        {/* How It Works */}
        <div className="bg-white p-6 rounded-lg border border-finhive-border">
          <h2 className="text-lg font-medium mb-6">How It Works</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-finhive-accent/30 flex items-center justify-center mx-auto mb-4">
                <span className="text-finhive-primary font-bold">1</span>
              </div>
              <h3 className="font-medium mb-2">Upload Receipt</h3>
              <p className="text-sm text-finhive-muted">
                Take a photo or scan your receipt and upload it to the platform.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-finhive-accent/30 flex items-center justify-center mx-auto mb-4">
                <span className="text-finhive-primary font-bold">2</span>
              </div>
              <h3 className="font-medium mb-2">Automatic Processing</h3>
              <p className="text-sm text-finhive-muted">
                Our AI technology extracts key information like merchant, date, and amount.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-finhive-accent/30 flex items-center justify-center mx-auto mb-4">
                <span className="text-finhive-primary font-bold">3</span>
              </div>
              <h3 className="font-medium mb-2">Track Expenses</h3>
              <p className="text-sm text-finhive-muted">
                The receipt data is automatically added to your expense tracking.
              </p>
            </div>
          </div>
        </div>
      </div>
    </PageTemplate>
  );
};

export default ScanReceipts;
