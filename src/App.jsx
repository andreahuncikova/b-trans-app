import { Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing.jsx'
import Overview from './pages/Overview.jsx'
import LogStops from './pages/LogStops.jsx'
import Drivers from './pages/Drivers.jsx'
import Vehicles from './pages/Vehicles.jsx'
import Report from './pages/Report.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/prehlad" element={<Overview />} />
      <Route path="/zastavky" element={<LogStops />} />
      <Route path="/vodici" element={<Drivers />} />
      <Route path="/vozidla" element={<Vehicles />} />
      <Route path="/report" element={<Report />} />
    </Routes>
  )
}
