import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Knowledge from './pages/Knowledge'
import Simulator from './pages/Simulator'
import Admin from './pages/Admin'
import History from './pages/History'
import Login from './pages/Login'
import Register from './pages/Register'
import BrainGames from './pages/BrainGames'

function PrivateRoute({ children }) {
  const user = JSON.parse(localStorage.getItem('ht_user') || 'null')
  return user ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/*" element={
          <>
            <Navbar />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/knowledge" element={<Knowledge />} />
              <Route path="/simulator" element={<PrivateRoute><Simulator /></PrivateRoute>} />
              <Route path="/braingames" element={<PrivateRoute><BrainGames /></PrivateRoute>} />
              <Route path="/history" element={<PrivateRoute><History /></PrivateRoute>} />
              <Route path="/admin" element={<Admin />} />
            </Routes>
          </>
        } />
      </Routes>
    </BrowserRouter>
  )
}
