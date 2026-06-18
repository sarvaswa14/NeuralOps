import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { SocketProvider } from './context/SocketContext'
import ProtectedRoute from './components/ProtectedRoute'

import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Monitor from './pages/Monitor'
import Incidents from './pages/Incidents'
import IncidentDetail from './pages/IncidentDetail'
import AgentTrace from './pages/AgentTrace'
import Logs from './pages/Logs'
import Deployments from './pages/Deployments'
import LearningStore from './pages/LearningStore'
import Demo from './pages/Demo'
import Settings from './pages/Settings'
import OAuthCallback from './pages/OAuthCallback'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
          <Routes>
            <Route path="/oauth" element={<OAuthCallback />} />
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/monitor" element={<ProtectedRoute><Monitor /></ProtectedRoute>} />
            <Route path="/incidents" element={<ProtectedRoute><Incidents /></ProtectedRoute>} />
            <Route path="/incidents/:id" element={<ProtectedRoute><IncidentDetail /></ProtectedRoute>} />
            <Route path="/incidents/:id/trace" element={<ProtectedRoute><AgentTrace /></ProtectedRoute>} />
            <Route path="/logs" element={<ProtectedRoute><Logs /></ProtectedRoute>} />
            <Route path="/deployments" element={<ProtectedRoute><Deployments /></ProtectedRoute>} />
            <Route path="/learning" element={<ProtectedRoute><LearningStore /></ProtectedRoute>} />
            <Route path="/demo" element={<ProtectedRoute><Demo /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          </Routes>
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}