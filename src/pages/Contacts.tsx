import React, { useState } from 'react';
import PageTemplate from './PageTemplate';
import { useAuth } from '@/hooks/useAuth';
import { getContacts } from '@/services/financeService';
import { User, Plus, Search, Send, Trash2, Edit } from 'lucide-react';

const Contacts = () => {
  const { user } = useAuth();
  const [contacts, setContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  React.useEffect(() => {
    const loadContacts = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const data = await getContacts(user.id);
        setContacts(data.length > 0 ? data : [
          { id: '1', name: 'Rahul Sharma', avatar: 'https://i.pravatar.cc/150?img=1' },
          { id: '2', name: 'Priya Patel', avatar: 'https://i.pravatar.cc/150?img=5' },
          { id: '3', name: 'Amit Kumar', avatar: 'https://i.pravatar.cc/150?img=3' },
          { id: '4', name: 'Sneha Gupta', avatar: 'https://i.pravatar.cc/150?img=6' },
          { id: '5', name: 'Vikram Singh', avatar: 'https://i.pravatar.cc/150?img=9' },
        ]);
      } catch (error) {
        console.error('Error loading contacts:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadContacts();
  }, [user]);

  const filteredContacts = contacts.filter(contact => 
    contact.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <PageTemplate title="Contacts">
      <div className="space-y-6">
        {/* Contacts header */}
        <div className="bg-white p-6 rounded-lg border border-finhive-border">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search contacts..."
                className="w-full md:w-64 px-4 py-2 pl-10 rounded-md border border-finhive-border focus:outline-none focus:ring-2 focus:ring-finhive-primary/50"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute left-3 top-2.5 text-finhive-muted" size={18} />
            </div>
            
            <button className="px-4 py-2 bg-finhive-primary text-white rounded-md text-sm flex items-center gap-2 self-start md:self-auto">
              <Plus size={16} />
              <span>Add Contact</span>
            </button>
          </div>
        </div>

        {/* Contacts list */}
        <div className="bg-white rounded-lg border border-finhive-border overflow-hidden">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-finhive-primary mx-auto"></div>
              <p className="mt-2 text-finhive-muted">Loading contacts...</p>
            </div>
          ) : filteredContacts.length > 0 ? (
            <div className="divide-y divide-finhive-border">
              {filteredContacts.map((contact) => (
                <div key={contact.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      {contact.avatar ? (
                        <img 
                          src={contact.avatar} 
                          alt={contact.name} 
                          className="w-12 h-12 rounded-full mr-4 object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-finhive-accent/30 flex items-center justify-center text-finhive-primary font-bold mr-4">
                          {contact.name.charAt(0)}
                        </div>
                      )}
                      <div>
                        <h3 className="font-medium">{contact.name}</h3>
                        <p className="text-sm text-finhive-muted">Added on {new Date().toLocaleDateString('en-IN')}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button className="p-2 rounded-full hover:bg-finhive-accent/10 transition-colors text-finhive-primary">
                        <Send size={18} />
                      </button>
                      <button className="p-2 rounded-full hover:bg-finhive-accent/10 transition-colors text-finhive-primary">
                        <Edit size={18} />
                      </button>
                      <button className="p-2 rounded-full hover:bg-red-100 transition-colors text-red-500">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-finhive-accent/30 flex items-center justify-center mx-auto mb-4">
                <User className="text-finhive-primary" size={24} />
              </div>
              {searchQuery ? (
                <>
                  <h2 className="text-xl font-medium text-finhive-text mb-2">No matching contacts</h2>
                  <p className="text-finhive-muted max-w-md mx-auto">
                    No contacts found matching '{searchQuery}'
                  </p>
                </>
              ) : (
                <>
                  <h2 className="text-xl font-medium text-finhive-text mb-2">No Contacts Yet</h2>
                  <p className="text-finhive-muted max-w-md mx-auto mb-6">
                    Add your first contact to start sending and receiving money.
                  </p>
                  <button className="px-4 py-2 bg-finhive-primary text-white rounded-md text-sm flex items-center gap-2 mx-auto">
                    <Plus size={16} />
                    <span>Add Contact</span>
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white p-6 rounded-lg border border-finhive-border">
          <h2 className="text-lg font-medium mb-6">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button className="p-4 rounded-lg border border-finhive-border hover:bg-finhive-accent/10 transition-colors text-center">
              <div className="w-10 h-10 rounded-full bg-finhive-accent/30 flex items-center justify-center mx-auto mb-2">
                <Plus className="text-finhive-primary" size={20} />
              </div>
              <div className="font-medium">Add Contact</div>
            </button>
            <button className="p-4 rounded-lg border border-finhive-border hover:bg-finhive-accent/10 transition-colors text-center">
              <div className="w-10 h-10 rounded-full bg-finhive-accent/30 flex items-center justify-center mx-auto mb-2">
                <Send className="text-finhive-primary" size={20} />
              </div>
              <div className="font-medium">Send Money</div>
            </button>
            <button className="p-4 rounded-lg border border-finhive-border hover:bg-finhive-accent/10 transition-colors text-center">
              <div className="w-10 h-10 rounded-full bg-finhive-accent/30 flex items-center justify-center mx-auto mb-2">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M16 9V19H8V9H16ZM14.5 3H9.5L8.5 4H5V6H19V4H15.5L14.5 3ZM18 7H6V19C6 20.1 6.9 21 8 21H16C17.1 21 18 20.1 18 19V7Z" fill="#FF6634"/>
                </svg>
              </div>
              <div className="font-medium">Import Contacts</div>
            </button>
            <button className="p-4 rounded-lg border border-finhive-border hover:bg-finhive-accent/10 transition-colors text-center">
              <div className="w-10 h-10 rounded-full bg-finhive-accent/30 flex items-center justify-center mx-auto mb-2">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M16 17V19H2V17H16ZM21.5 6.5L19 9L17.5 7.5L16 9L19 12L23 8L21.5 6.5ZM16 13V15H2V13H16ZM16 9V11H2V9H16ZM16 5V7H2V5H16Z" fill="#FF6634"/>
                </svg>
              </div>
              <div className="font-medium">Manage Groups</div>
            </button>
          </div>
        </div>
      </div>
    </PageTemplate>
  );
};

export default Contacts;
