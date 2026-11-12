import { Routes, Route } from 'react-router-dom'
import ScoreboardPage from './pages/ScoreboardPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<ScoreboardPage />} />
    </Routes>
  )
}
