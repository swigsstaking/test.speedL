import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Courses from './pages/Courses'
import Permits from './pages/Permits'
import GiftCards from './pages/GiftCards'
import Contact from './pages/Contact'

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/cours" element={<Courses />} />
          <Route path="/permis" element={<Permits />} />
          <Route path="/bons-cadeaux" element={<GiftCards />} />
          <Route path="/contact" element={<Contact />} />
          {/* Rediriger toutes les autres routes vers la page d'accueil */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </Router>
  )
}

export default App
