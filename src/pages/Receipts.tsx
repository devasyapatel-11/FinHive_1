import React, { useState, useEffect, useRef } from 'react';
import PageTemplate from './PageTemplate';
import { useAuth } from '@/hooks/useAuth';
import { formatIndianCurrency } from '@/services/financeService';
import { saveReceipt, getReceipts, deleteReceipt } from '@/services/financeService';
import { Plus, Calendar, Search, FileText, Trash2, X, AlertCircle, Upload, Filter } from 'lucide-react';

const Receipts = () => {
  const { user } = useAuth();
  const [receipts, setReceipts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [filterType, setFilterType] = useState('all');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [receiptToDelete, setReceiptToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [deleteSuccess, setDeleteSuccess] = useState('');
  
  // Form state
  const [newReceipt, setNewReceipt] = useState({
    title: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    category: '',
    notes: '',
    file: null as File | null,
  });
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Load receipts
  useEffect(() => {
    loadReceipts();
  }, [user]);
  
  const loadReceipts = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const data = await getReceipts(user.id);
      setReceipts(data);
    } catch (error) {
      console.error('Error loading receipts:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setNewReceipt({ ...newReceipt, file });
    
    // Create preview URL
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreviewUrl(null);
    }
  };
  
  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewReceipt(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    try {
      setError('');
      setIsSubmitting(true);
      
      // Validate form
      if (!newReceipt.title) {
        setError('Please enter a title for the receipt');
        return;
      }
      
      if (!newReceipt.file) {
        setError('Please upload a receipt image');
        return;
      }
      
      // Convert amount to number
      const amount = newReceipt.amount ? Number(newReceipt.amount) : 0;
      
      // Save receipt
      const savedReceipt = await saveReceipt(user.id, {
        ...newReceipt,
        amount,
        file: newReceipt.file
      });
      
      // Add to local state
      setReceipts(prev => [savedReceipt, ...prev]);
      
      // Reset form
      setNewReceipt({
        title: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        category: '',
        notes: '',
        file: null,
      });
      setPreviewUrl(null);
      
      // Close modal
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error saving receipt:', error);
      setError('Failed to save receipt. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle receipt deletion
  const handleDeleteReceipt = async () => {
    if (!user || !receiptToDelete) return;
    
    try {
      setIsDeleting(true);
      setDeleteError('');
      setDeleteSuccess('');
      
      const success = await deleteReceipt(receiptToDelete, user.id);
      
      if (success) {
        // Remove from local state
        setReceipts(prev => prev.filter(receipt => receipt.id !== receiptToDelete));
        setDeleteSuccess('Receipt deleted successfully');
        
        // Close modal after delay
        setTimeout(() => {
          setShowDeleteConfirm(false);
          setReceiptToDelete(null);
          setDeleteSuccess('');
        }, 2000);
      } else {
        setDeleteError('Failed to delete receipt. Please try again.');
      }
    } catch (error) {
      console.error('Error deleting receipt:', error);
      setDeleteError('An unexpected error occurred. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };
  
  // Filter and sort receipts
  const filteredReceipts = receipts
    .filter(receipt => {
      // Filter by search term
      const matchesSearch = 
        receipt.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        receipt.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        receipt.category?.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Filter by type
      const matchesType = filterType === 'all' || receipt.category === filterType;
      
      return matchesSearch && matchesType;
    })
    .sort((a, b) => {
      // Sort by selected field
      if (sortBy === 'date') {
        return sortOrder === 'asc' 
          ? new Date(a.date).getTime() - new Date(b.date).getTime()
          : new Date(b.date).getTime() - new Date(a.date).getTime();
      } else if (sortBy === 'amount') {
        return sortOrder === 'asc' 
          ? a.amount - b.amount
          : b.amount - a.amount;
      } else { // title
        return sortOrder === 'asc'
          ? a.title.localeCompare(b.title)
          : b.title.localeCompare(a.title);
      }
    });
  
  // Get unique categories for filter
  const categories = [...new Set(receipts.map(receipt => receipt.category))].filter(Boolean);
  
  return (
    <PageTemplate title="Receipts & Bills">
      <div className="space-y-6">
        {/* Header with search and add button */}
        <div className="bg-white p-6 rounded-lg border border-finhive-border">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div className="flex-1 w-full md:w-auto">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="text-gray-400" size={18} />
                </div>
                <input
                  type="text"
                  placeholder="Search receipts..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-finhive-primary/50"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="relative">
                <select
                  className="appearance-none pl-3 pr-8 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-finhive-primary/50 bg-white text-sm"
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <option value="all">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                  <Filter className="text-gray-400" size={16} />
                </div>
              </div>
              
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-4 py-2 bg-finhive-primary text-white rounded-md text-sm flex items-center gap-2 whitespace-nowrap"
              >
                <Plus size={16} />
                <span>Add Receipt</span>
              </button>
            </div>
          </div>
          
          {/* Sort controls */}
          <div className="flex items-center gap-4 text-sm text-finhive-muted mb-4">
            <span>Sort by:</span>
            <button
              className={`${sortBy === 'date' ? 'text-finhive-primary font-medium' : ''}`}
              onClick={() => {
                setSortBy('date');
                if (sortBy === 'date') setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
              }}
            >
              Date {sortBy === 'date' && (sortOrder === 'asc' ? '↑' : '↓')}
            </button>
            <button
              className={`${sortBy === 'amount' ? 'text-finhive-primary font-medium' : ''}`}
              onClick={() => {
                setSortBy('amount');
                if (sortBy === 'amount') setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
              }}
            >
              Amount {sortBy === 'amount' && (sortOrder === 'asc' ? '↑' : '↓')}
            </button>
            <button
              className={`${sortBy === 'title' ? 'text-finhive-primary font-medium' : ''}`}
              onClick={() => {
                setSortBy('title');
                if (sortBy === 'title') setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
              }}
            >
              Title {sortBy === 'title' && (sortOrder === 'asc' ? '↑' : '↓')}
            </button>
          </div>
          
          {/* Receipts list */}
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-finhive-primary mx-auto"></div>
              <p className="mt-2 text-finhive-muted">Loading receipts...</p>
            </div>
          ) : filteredReceipts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredReceipts.map(receipt => (
                <div key={receipt.id} className="border border-finhive-border rounded-lg overflow-hidden hover:shadow-md transition-shadow relative group">
                  {/* Receipt image/thumbnail */}
                  <div className="h-40 bg-gray-100 flex items-center justify-center overflow-hidden">
                    {receipt.fileUrl ? (
                      <img 
                        src={receipt.fileUrl} 
                        alt={receipt.title} 
                        className="w-full h-full object-cover"
                        onClick={() => window.open(receipt.fileUrl, '_blank')}
                      />
                    ) : (
                      <FileText className="text-gray-400" size={48} />
                    )}
                  </div>
                  
                  {/* Delete button */}
                  <button
                    className="absolute top-2 right-2 p-1.5 bg-white/80 text-gray-500 hover:text-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => {
                      setReceiptToDelete(receipt.id);
                      setShowDeleteConfirm(true);
                    }}
                    title="Delete Receipt"
                  >
                    <Trash2 size={16} />
                  </button>
                  
                  {/* Receipt details */}
                  <div className="p-4">
                    <h3 className="font-medium text-finhive-text truncate">{receipt.title}</h3>
                    <div className="flex justify-between items-center mt-1 mb-2">
                      <span className="text-sm text-finhive-muted flex items-center gap-1">
                        <Calendar size={14} />
                        {new Date(receipt.date).toLocaleDateString('en-IN', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                      {receipt.amount > 0 && (
                        <span className="font-medium">{formatIndianCurrency(receipt.amount)}</span>
                      )}
                    </div>
                    {receipt.category && (
                      <div className="mt-2">
                        <span className="px-2 py-1 bg-gray-100 rounded-full text-xs">
                          {receipt.category}
                        </span>
                      </div>
                    )}
                    {receipt.notes && (
                      <p className="mt-2 text-sm text-gray-600 line-clamp-2">{receipt.notes}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full bg-finhive-accent/30 flex items-center justify-center mx-auto mb-4">
                <FileText className="text-finhive-primary" size={24} />
              </div>
              <h2 className="text-xl font-medium text-finhive-text mb-2">No Receipts Found</h2>
              <p className="text-finhive-muted max-w-md mx-auto mb-6">
                {searchTerm || filterType !== 'all' 
                  ? 'No receipts match your search criteria. Try adjusting your filters.'
                  : 'Start scanning and storing your receipts to keep track of your expenses.'}
              </p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-4 py-2 bg-finhive-primary text-white rounded-md text-sm flex items-center gap-2 mx-auto"
              >
                <Plus size={16} />
                <span>Add Receipt</span>
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Add Receipt Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-md p-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => {
                setIsModalOpen(false);
                setNewReceipt({
                  title: '',
                  amount: '',
                  date: new Date().toISOString().split('T')[0],
                  category: '',
                  notes: '',
                  file: null,
                });
                setPreviewUrl(null);
                setError('');
              }}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <X size={20} />
            </button>
            
            <h2 className="text-xl font-semibold mb-6">Add New Receipt</h2>
            
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-start gap-2">
                <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={16} />
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* File upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Receipt Image</label>
                <div 
                  className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {previewUrl ? (
                    <div className="relative">
                      <img 
                        src={previewUrl} 
                        alt="Receipt preview" 
                        className="max-h-40 mx-auto rounded-md"
                      />
                      <button
                        type="button"
                        className="absolute top-1 right-1 bg-white rounded-full p-1 shadow-md"
                        onClick={(e) => {
                          e.stopPropagation();
                          setNewReceipt({...newReceipt, file: null});
                          setPreviewUrl(null);
                        }}
                      >
                        <X size={16} className="text-gray-500" />
                      </button>
                    </div>
                  ) : (
                    <div className="py-4">
                      <Upload className="mx-auto text-gray-400 mb-2" size={24} />
                      <p className="text-sm text-gray-500">Click to upload or drag and drop</p>
                      <p className="text-xs text-gray-400 mt-1">PNG, JPG, PDF up to 10MB</p>
                    </div>
                  )}
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/jpeg,image/png,application/pdf"
                    onChange={handleFileChange}
                  />
                </div>
              </div>
              
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  name="title"
                  value={newReceipt.title}
                  onChange={handleInputChange}
                  placeholder="e.g. Grocery Bill, Electricity Bill"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-finhive-primary/50"
                  required
                />
              </div>
              
              {/* Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500">₹</span>
                  </div>
                  <input
                    type="number"
                    name="amount"
                    value={newReceipt.amount}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-finhive-primary/50"
                  />
                </div>
              </div>
              
              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  name="date"
                  value={newReceipt.date}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-finhive-primary/50"
                  required
                />
              </div>
              
              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  name="category"
                  value={newReceipt.category}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-finhive-primary/50"
                >
                  <option value="">Select Category</option>
                  <option value="Utility">Utility</option>
                  <option value="Grocery">Grocery</option>
                  <option value="Shopping">Shopping</option>
                  <option value="Medical">Medical</option>
                  <option value="Travel">Travel</option>
                  <option value="Food">Food</option>
                  <option value="Entertainment">Entertainment</option>
                  <option value="Education">Education</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              
              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
                <textarea
                  name="notes"
                  value={newReceipt.notes}
                  onChange={handleInputChange}
                  placeholder="Add any additional details here..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-finhive-primary/50 resize-none"
                />
              </div>
              
              {/* Submit button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2 px-4 bg-finhive-primary text-white rounded-md hover:bg-finhive-primary/90 transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                      Saving...
                    </>
                  ) : (
                    'Save Receipt'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-md p-6 relative">
            <button
              onClick={() => {
                setShowDeleteConfirm(false);
                setReceiptToDelete(null);
                setDeleteSuccess('');
                setDeleteError('');
              }}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
              disabled={isDeleting}
            >
              <X size={20} />
            </button>
            
            <h2 className="text-xl font-semibold mb-2">Delete Receipt</h2>
            
            {deleteSuccess ? (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
                <p className="text-green-700 text-sm">{deleteSuccess}</p>
              </div>
            ) : (
              <>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to delete this receipt? This action cannot be undone.
                </p>
                
                {deleteError && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-start gap-2">
                    <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={16} />
                    <p className="text-red-700 text-sm">{deleteError}</p>
                  </div>
                )}
                
                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      setShowDeleteConfirm(false);
                      setReceiptToDelete(null);
                    }}
                    className="flex-1 py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md transition-colors"
                    disabled={isDeleting}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteReceipt}
                    className="flex-1 py-2 px-4 bg-red-500 hover:bg-red-600 text-white rounded-md transition-colors flex justify-center items-center"
                    disabled={isDeleting}
                  >
                    {isDeleting ? (
                      <>
                        <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                        Deleting...
                      </>
                    ) : (
                      'Delete Receipt'
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </PageTemplate>
  );
};

export default Receipts;
