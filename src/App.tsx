import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Router from './components/Router';
import Login from './components/Login';
import DashboardLayout from './components/admin/DashboardLayout';
import Dashboard from './components/admin/Dashboard';
import FormsManagement from './components/admin/FormsManagement';
import FeedbackFormPage from './components/user/FeedbackFormPage';
import { Loader2 } from 'lucide-react';

function AppContent() {
  const { isAuthenticated, isLoading } = useAuth();
  const [currentPage, setCurrentPage] = useState<'dashboard' | 'forms'>('dashboard');

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <Router>
      {(route, params) => {
        if (route.startsWith('/form/') && params.formId) {
          return <FeedbackFormPage formId={params.formId} />;
        }

        if (!isAuthenticated) {
          return <Login />;
        }

        return (
          <DashboardLayout currentPage={currentPage} onNavigate={setCurrentPage}>
            {currentPage === 'dashboard' ? <Dashboard /> : <FormsManagement />}
          </DashboardLayout>
        );
      }}
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;