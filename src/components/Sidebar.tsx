
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  BarChart3, 
  Wallet, 
  MessagesSquare, 
  Users, 
  LayoutDashboard, 
  Receipt, 
  HelpCircle, 
  Settings, 
  LogOut 
} from 'lucide-react';
import FinHiveLogo from './FinHiveLogo';
import { useAuth } from '@/hooks/useAuth';

const Sidebar = () => {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <div className="h-screen w-64 border-r border-finhive-border flex flex-col bg-white">
      <div className="p-5 border-b border-finhive-border">
        <FinHiveLogo />
      </div>

      <div className="px-3 py-4">
        <p className="text-xs font-medium text-finhive-muted mb-2 px-3">General</p>
        <nav className="space-y-1">
          <Link to="/dashboard" className="nav-item active">
            <LayoutDashboard className="w-5 h-5" />
            <span>Dashboard</span>
          </Link>
          <Link to="/transactions" className="nav-item">
            <Receipt className="w-5 h-5" />
            <span>Transactions</span>
          </Link>
          <Link to="/receipts" className="nav-item">
            <Receipt className="w-5 h-5" />
            <span>Receipts</span>
          </Link>
          <Link to="/analytics" className="nav-item">
            <BarChart3 className="w-5 h-5" />
            <span>Analytics</span>
          </Link>
          <Link to="/wallet" className="nav-item">
            <Wallet className="w-5 h-5" />
            <span>My Wallet</span>
          </Link>
        </nav>
      </div>

      <div className="px-3 py-4">
        <p className="text-xs font-medium text-finhive-muted mb-2 px-3">College Tools</p>
        <nav className="space-y-1">
          <Link to="/split-bills" className="nav-item">
            <Receipt className="w-5 h-5" />
            <span>Split Bills</span>
          </Link>
          <Link to="/shared-wallets" className="nav-item">
            <Wallet className="w-5 h-5" />
            <span>Shared Wallets</span>
          </Link>
          <Link to="/scan-receipts" className="nav-item">
            <Receipt className="w-5 h-5" />
            <span>Scan Receipts</span>
          </Link>
        </nav>
      </div>

      <div className="px-3 py-4">
        <p className="text-xs font-medium text-finhive-muted mb-2 px-3">Other</p>
        <nav className="space-y-1">
          <Link to="/chat" className="nav-item">
            <MessagesSquare className="w-5 h-5" />
            <span>Chat</span>
            <span className="ml-auto bg-finhive-primary text-white text-xs font-medium rounded-full w-5 h-5 flex items-center justify-center">3</span>
          </Link>
          <Link to="/contacts" className="nav-item">
            <Users className="w-5 h-5" />
            <span>Contacts</span>
          </Link>
        </nav>
      </div>

      <div className="px-3 py-4 mt-auto">
        <nav className="space-y-1">
          <Link to="/help" className="nav-item">
            <HelpCircle className="w-5 h-5" />
            <span>Help Center</span>
          </Link>
          <Link to="/settings" className="nav-item">
            <Settings className="w-5 h-5" />
            <span>Settings</span>
          </Link>
          <button 
            onClick={handleLogout} 
            className="w-full flex items-center gap-3 px-3 py-2 text-finhive-danger rounded-md transition-all hover:bg-finhive-danger/10"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;
