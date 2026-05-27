import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Today from './pages/Today'
import Sport from './pages/Sport'
import Health from './pages/Health'
import Work from './pages/Work'
import Week from './pages/Week'

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="max-w-5xl mx-auto px-4 py-6">
          <Routes>
            <Route path="/" element={<Today />} />
            <Route path="/sport" element={<Sport />} />
            <Route path="/health" element={<Health />} />
            <Route path="/work" element={<Work />} />
            <Route path="/week" element={<Week />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}
