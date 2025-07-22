import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import AuthForm from './components/Auth/AuthForm';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Templates from './pages/Templates';
import TemplateCreation from './pages/TemplateCreation';
import AuditExecution from './pages/AuditExecution';
import Users from './pages/Users';
import { Loader2 } from 'lucide-react';

const AuthWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  const [authMode, setAuthMode] = React.useState<'signin' | 'signup'>('signin');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto" />
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <AuthForm 
        mode={authMode} 
        onToggleMode={() => setAuthMode(authMode === 'signin' ? 'signup' : 'signin')} 
      />
    );
  }

  return <>{children}</>;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AuthWrapper>
          <Layout>
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/templates" element={<Templates />} />
              <Route path="/templates/create" element={<TemplateCreation />} />
              <Route path="/templates/edit/:id" element={<TemplateCreation />} />
              <Route path="/audits" element={<AuditExecution />} />
              <Route path="/audits/:id" element={<AuditExecution />} />
              <Route path="/users" element={<Users />} />
            </Routes>
          </Layout>
        </AuthWrapper>
      </Router>
    </AuthProvider>
  );
}

export default App;