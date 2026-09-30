import './App.css'
import { AuthProvider, useAuth } from './context/AuthContext'
import Footer from './components/Footer'
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
      <div className="w-full min-h-screen bg-w flex flex-col overflow-hidden">
        <AppRoutes />
        <Footer />
      </div>
    </AuthProvider>
  )
}