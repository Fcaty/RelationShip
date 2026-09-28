import './App.css'
import { AuthProvider, useAuth } from './context/AuthContext'
import LandingPage from './pages/LandingPage'
import UserPage from './pages/UserPage'
import AdminPage from './pages/AdminPage'

function AppRoutes() {
  const { currentUser, role } = useAuth()

  if (!currentUser) return <LandingPage />
  if (role === 'admin') return <AdminPage />
  return <UserPage />
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}