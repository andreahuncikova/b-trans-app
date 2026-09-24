import { Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing.jsx'
import Login from './pages/Login.jsx'
import Overview from './pages/Overview.jsx'
import LogStops from './pages/LogStops.jsx'
import Drivers from './pages/Drivers.jsx'
import Vehicles from './pages/Vehicles.jsx'
import Report from './pages/Report.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/prehlad" element={<ProtectedRoute><Overview /></ProtectedRoute>} />
      <Route path="/zastavky" element={<ProtectedRoute><LogStops /></ProtectedRoute>} />
      <Route path="/vodici" element={<ProtectedRoute><Drivers /></ProtectedRoute>} />
      <Route path="/vozidla" element={<ProtectedRoute><Vehicles /></ProtectedRoute>} />
      <Route path="/report" element={<ProtectedRoute><Report /></ProtectedRoute>} />
    </Routes>
  )
}
