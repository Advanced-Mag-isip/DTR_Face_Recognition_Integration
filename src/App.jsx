import './App.css'
import EmployeeDashboard from './components/EmployeeDashboard'
import AdminDashboard from './components/AdminDashboard'
import LoginPage from './pages/LoginPage'
import { Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'

const Dashboard = () => <EmployeeDashboard />

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />

      <Route path="/admin/dashboard" element={
        <ProtectedRoute>
          <AdminDashboard />
        </ProtectedRoute>
      } />

      <Route path="*" element={<Navigate to="/login" replace/>}/>
    </Routes>
  )
}

export default App
