import { Routes, Route } from 'react-router-dom'
import { LayoutDashboard, Search, ScanSearch, MessageSquareText, UploadCloud } from 'lucide-react'
import DashboardLayout from '../components/DashboardLayout.jsx'
import UserOverview from './user/UserOverview.jsx'
import ThreatFeedPage from './user/ThreatFeedPage.jsx'
import ThreatDetectionPage from './user/ThreatDetectionPage.jsx'
import ChatbotPage from './user/ChatbotPage.jsx'
import UploadsPage from './user/UploadsPage.jsx'
import '../styles/dashboard.css'

const NAV_ITEMS = [
  { to: '/app', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/app/feed', label: 'Threat Search', icon: Search },
  { to: '/app/detect', label: 'Threat & Severity Detection', icon: ScanSearch },
  { to: '/app/chat', label: 'AI Chatbot', icon: MessageSquareText },
  { to: '/app/uploads', label: 'My Uploads', icon: UploadCloud },
]

export default function UserDashboard() {
  return (
    <DashboardLayout navItems={NAV_ITEMS} roleLabel="Security Analyst">
      <Routes>
        <Route index element={<UserOverview />} />
        <Route path="feed" element={<ThreatFeedPage />} />
        <Route path="detect" element={<ThreatDetectionPage />} />
        <Route path="chat" element={<ChatbotPage />} />
        <Route path="uploads" element={<UploadsPage />} />
      </Routes>
    </DashboardLayout>
  )
}
