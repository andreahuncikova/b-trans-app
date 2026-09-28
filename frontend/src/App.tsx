import { Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing.tsx'
import Login from './pages/Login.tsx'
import Overview from './pages/Overview.tsx'
import LogStops from './pages/LogStops.tsx'
import Drivers from './pages/Drivers.tsx'
import Vehicles from './pages/Vehicles.tsx'
import NotFound from './pages/NotFound.tsx'
import ProtectedRoute from './components/ProtectedRoute.tsx'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/prehlad" element={<ProtectedRoute><Overview /></ProtectedRoute>} />
      <Route path="/zastavky" element={<ProtectedRoute><LogStops /></ProtectedRoute>} />
      <Route path="/vodici" element={<ProtectedRoute><Drivers /></ProtectedRoute>} />
      <Route path="/vozidla" element={<ProtectedRoute><Vehicles /></ProtectedRoute>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
