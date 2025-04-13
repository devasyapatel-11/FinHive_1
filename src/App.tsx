
import { Toaster } from "@/components/ui/toaster"; // Use the shadcn toaster
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import LandingPage from "./pages/LandingPage";
import NotFound from "./pages/NotFound";

// Import all the new pages for sidebar options
import Transactions from "./pages/Transactions";
import Analytics from "./pages/Analytics";
import Wallet from "./pages/Wallet";
import Receipts from "./pages/Receipts";
import SplitBills from "./pages/SplitBills";
import SharedWallets from "./pages/SharedWallets";
import ScanReceipts from "./pages/ScanReceipts";
import Chat from "./pages/Chat";
import Contacts from "./pages/Contacts";
import Help from "./pages/Help";
import Settings from "./pages/Settings";

const queryClient = new QueryClient();

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  return user ? <>{children}</> : <Navigate to="/" replace />;
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster /> {/* Replace Sonner with shadcn Toaster */}
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth" element={<Auth />} />
            
            {/* Dashboard and all protected routes */}
            <Route 
              path="/dashboard" 
              element={
                <PrivateRoute>
                  <Index />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/transactions" 
              element={
                <PrivateRoute>
                  <Transactions />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/analytics" 
              element={
                <PrivateRoute>
                  <Analytics />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/wallet" 
              element={
                <PrivateRoute>
                  <Wallet />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/receipts" 
              element={
                <PrivateRoute>
                  <Receipts />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/split-bills" 
              element={
                <PrivateRoute>
                  <SplitBills />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/shared-wallets" 
              element={
                <PrivateRoute>
                  <SharedWallets />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/scan-receipts" 
              element={
                <PrivateRoute>
                  <ScanReceipts />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/chat" 
              element={
                <PrivateRoute>
                  <Chat />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/contacts" 
              element={
                <PrivateRoute>
                  <Contacts />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/help" 
              element={
                <PrivateRoute>
                  <Help />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/settings" 
              element={
                <PrivateRoute>
                  <Settings />
                </PrivateRoute>
              } 
            />
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
