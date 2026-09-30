import './App.css'
import { AuthProvider, useAuth } from './context/AuthContext'
import Footer from './components/Footer'
import LandingPage from './pages/LandingPage'
import AdminPage from './pages/AdminPage'

function AppRoutes() {
  const { currentUser, role } = useAuth()

  if (!currentUser) return <LandingPage isAuthenticated={false} />
  if (role === 'admin') return <AdminPage />
  return <LandingPage isAuthenticated />
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