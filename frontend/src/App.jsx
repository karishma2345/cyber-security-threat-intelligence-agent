import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home.jsx'
import Login from './pages/Login.jsx'
import Signup from './pages/Signup.jsx'
import AdminLogin from './pages/AdminLogin.jsx'
import UserDashboard from './pages/UserDashboard.jsx'
import AdminDashboard from './pages/AdminDashboard.jsx'
import { RequireUser, RequireAdmin } from './components/RouteGuards.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/admin/login" element={<AdminLogin />} />

      <Route
        path="/app/*"
        element={
          <RequireUser>
            <UserDashboard />
          </RequireUser>
        }
      />
      <Route
        path="/admin/*"
        element={
          <RequireAdmin>
            <AdminDashboard />
          </RequireAdmin>
        }
      />

      <Route path="*" element={<Home />} />
    </Routes>
  )
}
