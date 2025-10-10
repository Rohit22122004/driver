import { Route, Routes, Navigate } from 'react-router-dom'
import OfflineBanner from './components/OfflineBanner'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DriverDashboard from './pages/DriverDashboard'
import AdminDashboard from './pages/AdminDashboard'
import TripPlanner from './pages/TripPlanner'
import TripMapView from './pages/TripMapView'
import MonitoringPage from './pages/MonitoringPage'
import NotificationsPage from './pages/NotificationsPage'
import ProfilePage from './pages/ProfilePage'
import { useLocation } from 'react-router-dom'

function App() {
  const location = useLocation()
  const path = location.pathname || ''
  const isAuth = path.startsWith('/login') || path.startsWith('/register')

  return (
    <div className="min-h-screen flex flex-col">
      <OfflineBanner />
      <main className={isAuth ? 'flex-1' : 'flex-1 max-w-6xl mx-auto w-full px-4 py-6'}>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route path="/driver/dashboard" element={<DriverDashboard />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />

          <Route path="/trip/planning" element={<TripPlanner />} />
          <Route path="/trip/:id/map" element={<TripMapView />} />

          <Route path="/monitoring" element={<MonitoringPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
