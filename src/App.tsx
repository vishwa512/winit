import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Templates from './pages/Templates';
import TemplateCreation from './pages/TemplateCreation';
import AuditExecution from './pages/AuditExecution';
import Reports from './pages/Reports';
import Users from './pages/Users';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/templates" element={<Templates />} />
          <Route path="/templates/create" element={<TemplateCreation />} />
          <Route path="/templates/edit/:id" element={<TemplateCreation />} />
          <Route path="/audits" element={<AuditExecution />} />
          <Route path="/audits/:id" element={<AuditExecution />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/users" element={<Users />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;