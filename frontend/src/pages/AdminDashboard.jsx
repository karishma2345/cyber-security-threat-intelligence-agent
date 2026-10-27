import { Routes, Route } from 'react-router-dom'
import { LayoutDashboard, KeyRound, Users, History, Rss } from 'lucide-react'
import DashboardLayout from '../components/DashboardLayout.jsx'
import AdminOverview from './admin/AdminOverview.jsx'
import ApiIntegrationPage from './admin/ApiIntegrationPage.jsx'
import UserManagementPage from './admin/UserManagementPage.jsx'
import HistoryAnalysisPage from './admin/HistoryAnalysisPage.jsx'
import ThreatFeedPage from './user/ThreatFeedPage.jsx'
import '../styles/dashboard.css'

const NAV_ITEMS = [
  { to: '/admin', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/admin/api', label: 'API Integration', icon: KeyRound },
  { to: '/admin/users', label: 'User Management', icon: Users },
  { to: '/admin/history', label: 'History Analysis', icon: History },
  { to: '/admin/feed', label: 'Threat Repository', icon: Rss },
]

export default function AdminDashboard() {
  return (
    <DashboardLayout navItems={NAV_ITEMS} roleLabel="Administrator">
      <Routes>
        <Route index element={<AdminOverview />} />
        <Route path="api" element={<ApiIntegrationPage />} />
        <Route path="users" element={<UserManagementPage />} />
        <Route path="history" element={<HistoryAnalysisPage />} />
        <Route path="feed" element={<ThreatFeedPage />} />
      </Routes>
    </DashboardLayout>
  )
}
