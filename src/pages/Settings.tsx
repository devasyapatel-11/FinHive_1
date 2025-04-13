import React, { useState, useEffect } from 'react';
import PageTemplate from './PageTemplate';
import { useAuth } from '@/hooks/useAuth';
import { User, Bell, Lock, CreditCard, HelpCircle, LogOut, Check } from 'lucide-react';
import { getUserProfile, updateUserProfile, getUserPreferences, updateUserPreferences, UserProfile, UserPreferences } from '@/services/settingsService';

const Settings = () => {
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  // Profile state
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileForm, setProfileForm] = useState({
    first_name: '',
    last_name: '',
    phone_number: ''
  });
  
  // Preferences state
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [preferencesForm, setPreferencesForm] = useState({
    currency: 'INR',
    date_format: 'DD/MM/YYYY',
    email_notifications: true,
    push_notifications: false
  });
  
  // Load user data
  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user]);
  
  const loadUserData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Load profile
      const userProfile = await getUserProfile(user.id);
      setProfile(userProfile);
      
      if (userProfile) {
        setProfileForm({
          first_name: userProfile.first_name || '',
          last_name: userProfile.last_name || '',
          phone_number: userProfile.phone_number || ''
        });
      }
      
      // Load preferences
      const userPreferences = await getUserPreferences(user.id);
      setPreferences(userPreferences);
      
      if (userPreferences) {
        setPreferencesForm({
          currency: userPreferences.currency || 'INR',
          date_format: userPreferences.date_format || 'DD/MM/YYYY',
          email_notifications: userPreferences.email_notifications || true,
          push_notifications: userPreferences.push_notifications || false
        });
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle profile form changes
  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileForm(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle preferences form changes
  const handlePreferencesChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setPreferencesForm(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setPreferencesForm(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  
  // Save profile changes
  const handleSaveProfile = async () => {
    if (!user) return;
    
    setSaveLoading(true);
    try {
      const updatedProfile = await updateUserProfile(user.id, profileForm);
      setProfile(updatedProfile);
      setSaveSuccess(true);
      
      // Reset success message after 3 seconds
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setSaveLoading(false);
    }
  };
  
  // Save preferences changes
  const handleSavePreferences = async () => {
    if (!user) return;
    
    setSaveLoading(true);
    try {
      const updatedPreferences = await updateUserPreferences(user.id, preferencesForm);
      setPreferences(updatedPreferences);
      setSaveSuccess(true);
      
      // Reset success message after 3 seconds
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    } catch (error) {
      console.error('Error saving preferences:', error);
    } finally {
      setSaveLoading(false);
    }
  };
  
  const handleLogout = async () => {
    await signOut();
    window.location.href = '/auth';
  };

  return (
    <PageTemplate title="Settings">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Sidebar */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-lg border border-finhive-border overflow-hidden">
            <div className="p-6 border-b border-finhive-border">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-finhive-accent/30 flex items-center justify-center text-finhive-primary font-bold text-xl">
                  {user?.email?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div>
                  <h3 className="font-medium">{user?.email || 'User'}</h3>
                  <p className="text-sm text-finhive-muted">Free Account</p>
                </div>
              </div>
            </div>
            
            <nav className="p-2">
              <button 
                onClick={() => setActiveTab('profile')}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left rounded-md ${activeTab === 'profile' ? 'bg-finhive-accent/10 text-finhive-primary' : 'hover:bg-gray-50'}`}
              >
                <User size={20} />
                <span>Profile</span>
              </button>
              <button 
                onClick={() => setActiveTab('preferences')}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left rounded-md ${activeTab === 'preferences' ? 'bg-finhive-accent/10 text-finhive-primary' : 'hover:bg-gray-50'}`}
              >
                <Bell size={20} />
                <span>Preferences</span>
              </button>
              <button 
                onClick={() => setActiveTab('security')}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left rounded-md ${activeTab === 'security' ? 'bg-finhive-accent/10 text-finhive-primary' : 'hover:bg-gray-50'}`}
              >
                <Lock size={20} />
                <span>Security</span>
              </button>
              <button 
                onClick={() => setActiveTab('billing')}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left rounded-md ${activeTab === 'billing' ? 'bg-finhive-accent/10 text-finhive-primary' : 'hover:bg-gray-50'}`}
              >
                <CreditCard size={20} />
                <span>Billing</span>
              </button>
              <button 
                onClick={() => setActiveTab('help')}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left rounded-md ${activeTab === 'help' ? 'bg-finhive-accent/10 text-finhive-primary' : 'hover:bg-gray-50'}`}
              >
                <HelpCircle size={20} />
                <span>Help</span>
              </button>
              <button 
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 text-left rounded-md hover:bg-red-50 text-red-500"
              >
                <LogOut size={20} />
                <span>Logout</span>
              </button>
            </nav>
          </div>
        </div>
        
        {/* Main content */}
        <div className="md:col-span-2 space-y-6">
          {loading ? (
            <div className="bg-white p-6 rounded-lg border border-finhive-border flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-finhive-primary"></div>
              <p className="ml-3 text-finhive-muted">Loading settings...</p>
            </div>
          ) : (
            <>
              {/* Profile section */}
              {activeTab === 'profile' && (
                <div className="bg-white p-6 rounded-lg border border-finhive-border">
                  <h2 className="text-lg font-medium mb-6">Profile Information</h2>
                  
                  {saveSuccess && activeTab === 'profile' && (
                    <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md flex items-center gap-2">
                      <Check className="text-green-500 shrink-0" size={16} />
                      <p className="text-green-700 text-sm">Profile updated successfully!</p>
                    </div>
                  )}
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-finhive-muted mb-1">Email</label>
                      <input 
                        type="email" 
                        value={user?.email || ''} 
                        disabled
                        className="w-full px-4 py-2 rounded-md border border-finhive-border bg-gray-50"
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-finhive-muted mb-1">First Name</label>
                        <input 
                          type="text" 
                          name="first_name"
                          value={profileForm.first_name}
                          onChange={handleProfileChange}
                          placeholder="Enter your first name"
                          className="w-full px-4 py-2 rounded-md border border-finhive-border focus:outline-none focus:ring-2 focus:ring-finhive-primary/50"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-finhive-muted mb-1">Last Name</label>
                        <input 
                          type="text" 
                          name="last_name"
                          value={profileForm.last_name}
                          onChange={handleProfileChange}
                          placeholder="Enter your last name"
                          className="w-full px-4 py-2 rounded-md border border-finhive-border focus:outline-none focus:ring-2 focus:ring-finhive-primary/50"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-finhive-muted mb-1">Phone Number</label>
                      <input 
                        type="tel" 
                        name="phone_number"
                        value={profileForm.phone_number}
                        onChange={handleProfileChange}
                        placeholder="Enter your phone number"
                        className="w-full px-4 py-2 rounded-md border border-finhive-border focus:outline-none focus:ring-2 focus:ring-finhive-primary/50"
                      />
                    </div>
                    
                    <div className="pt-4">
                      <button 
                        onClick={handleSaveProfile}
                        disabled={saveLoading}
                        className="px-6 py-2 bg-finhive-primary text-white rounded-md hover:bg-finhive-accent transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center"
                      >
                        {saveLoading && activeTab === 'profile' ? (
                          <>
                            <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                            Saving...
                          </>
                        ) : 'Save Changes'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Preferences section */}
              {activeTab === 'preferences' && (
                <div className="bg-white p-6 rounded-lg border border-finhive-border">
                  <h2 className="text-lg font-medium mb-6">Preferences</h2>
                  
                  {saveSuccess && activeTab === 'preferences' && (
                    <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md flex items-center gap-2">
                      <Check className="text-green-500 shrink-0" size={16} />
                      <p className="text-green-700 text-sm">Preferences updated successfully!</p>
                    </div>
                  )}
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-finhive-muted mb-1">Currency Display</label>
                      <select 
                        name="currency"
                        value={preferencesForm.currency}
                        onChange={handlePreferencesChange}
                        className="w-full px-4 py-2 rounded-md border border-finhive-border focus:outline-none focus:ring-2 focus:ring-finhive-primary/50"
                      >
                        <option value="INR">Indian Rupee (₹)</option>
                        <option value="USD">US Dollar ($)</option>
                        <option value="EUR">Euro (€)</option>
                        <option value="GBP">British Pound (£)</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-finhive-muted mb-1">Date Format</label>
                      <select 
                        name="date_format"
                        value={preferencesForm.date_format}
                        onChange={handlePreferencesChange}
                        className="w-full px-4 py-2 rounded-md border border-finhive-border focus:outline-none focus:ring-2 focus:ring-finhive-primary/50"
                      >
                        <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                        <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                        <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                      </select>
                    </div>
                    
                    <div className="flex items-center justify-between py-2">
                      <div>
                        <h3 className="font-medium">Email Notifications</h3>
                        <p className="text-sm text-finhive-muted">Receive email updates about your account</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          name="email_notifications"
                          checked={preferencesForm.email_notifications}
                          onChange={handlePreferencesChange}
                          className="sr-only peer" 
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-finhive-primary"></div>
                      </label>
                    </div>
                    
                    <div className="flex items-center justify-between py-2">
                      <div>
                        <h3 className="font-medium">Push Notifications</h3>
                        <p className="text-sm text-finhive-muted">Receive push notifications on your device</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          name="push_notifications"
                          checked={preferencesForm.push_notifications}
                          onChange={handlePreferencesChange}
                          className="sr-only peer" 
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-finhive-primary"></div>
                      </label>
                    </div>
                    
                    <div className="pt-4">
                      <button 
                        onClick={handleSavePreferences}
                        disabled={saveLoading}
                        className="px-6 py-2 bg-finhive-primary text-white rounded-md hover:bg-finhive-accent transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center"
                      >
                        {saveLoading && activeTab === 'preferences' ? (
                          <>
                            <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                            Saving...
                          </>
                        ) : 'Save Preferences'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Placeholder sections for other tabs */}
              {activeTab === 'security' && (
                <div className="bg-white p-6 rounded-lg border border-finhive-border">
                  <h2 className="text-lg font-medium mb-6">Security Settings</h2>
                  <p className="text-finhive-muted">Security settings will be available in a future update.</p>
                </div>
              )}
              
              {activeTab === 'billing' && (
                <div className="bg-white p-6 rounded-lg border border-finhive-border">
                  <h2 className="text-lg font-medium mb-6">Billing Information</h2>
                  <p className="text-finhive-muted">Billing settings will be available in a future update.</p>
                </div>
              )}
              
              {activeTab === 'help' && (
                <div className="bg-white p-6 rounded-lg border border-finhive-border">
                  <h2 className="text-lg font-medium mb-6">Help Center</h2>
                  <p className="text-finhive-muted">Help center will be available in a future update.</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </PageTemplate>
  );
};

export default Settings;
