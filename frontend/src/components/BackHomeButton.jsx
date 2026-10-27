import { useNavigate } from 'react-router-dom'
import { Home } from 'lucide-react'

export default function BackHomeButton() {
  const navigate = useNavigate()
  return (
    <button
      className="btn btn-ghost back-home-btn"
      onClick={() => navigate('/')}
      title="Back to Home"
    >
      <Home size={16} />
      Home
    </button>
  )
}
