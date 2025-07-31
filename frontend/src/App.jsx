
import React from 'react'
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom'
import Template from './Template'
import AuthPage from './pages/AuthPage'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/auth" element={<AuthPage/>} />
        <Route path="/" element={<Template/>} />
        <Route path="/chat" element={<Template/>} />
      </Routes>
    </Router>
  )
}

export default App
