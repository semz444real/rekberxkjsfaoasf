import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/SupabaseAuthContext';
import { ChatProvider } from './contexts/SupabaseChatContext';
import ErrorBoundary from './components/common/ErrorBoundary';
import OfflineIndicator from './components/common/OfflineIndicator';
import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Chat from './pages/Chat';
import Inbox from './pages/Inbox';
import Admin from './pages/Admin';
import NotFound from './pages/NotFound';
import Debug from './pages/Debug';
import ToastContainer from './components/common/ToastContainer';
import { useToast } from './hooks/useToast';

const App: React.FC = () => {
  const { toasts, removeToast } = useToast();

  return (
    <ErrorBoundary>
      <AuthProvider>
        <ChatProvider>
          <Router>
            <Layout>
              <OfflineIndicator />
              <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/chat" element={<Chat />} />
                <Route path="/inbox" element={<Inbox />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/debug" element={<Debug />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Layout>
          </Router>
        </ChatProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;