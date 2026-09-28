import './App.css'
import { useAuth } from './context/AuthContext'
import LandingPage from './pages/LandingPage'
import UserPage from './pages/UserPage'
import AdminPage from './pages/AdminPage'
import ProtectedRoute from './components/ProtectedRoute'

export default function App() {
  const { currentUser, role } = useAuth();

  if (!currentUser) return <LandingPage />;
  if (role === 'admin') {
    return (
      <ProtectedRoute requiredRole="admin">
        <AdminPage />
      </ProtectedRoute>
    );
  }
  return <UserPage />;
}
