
import { Route, Routes } from 'react-router-dom'

import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'

import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import AccountDetail from './pages/AccountDetail'
import MyProfile from './pages/MyProfile'

export default function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />

          <Route
            path="/accounts/:accountNumber"
            element={<AccountDetail />}
          />

          <Route
            path="/profile"
            element={<MyProfile />}
          />
        </Route>
      </Route>
    </Routes>
  )
}
