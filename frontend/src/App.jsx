import React from 'react'
import DashboardPage from './pages/DashboardPage'
import { ThemeProvider } from './contexts/ThemeContext'

function App() {
  return (
    <ThemeProvider>
      <div className="App">
        <DashboardPage/>
      </div>
    </ThemeProvider>
  )
}

export default App
