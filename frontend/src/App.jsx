import { Routes, Route, Link } from 'react-router-dom'
import Home from './pages/Home.jsx'
import Students from './pages/Students.jsx'
import Marks from './pages/Marks.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'

function App() {
  return (
    <div className="container mt-4">
      <nav className="nav nav-pills mb-4">
        <Link className="nav-link" to="/">Home</Link>
        <Link className="nav-link" to="/students">Students</Link>
        <Link className="nav-link" to="/marks">Marks</Link>
      </nav>
      <ErrorBoundary>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/students" element={<Students />} />
          <Route path="/marks" element={<Marks />} />
        </Routes>
      </ErrorBoundary>
    </div>
  )
}

export default App