import React from 'react'
import { ThemeProvider } from './contexts/ThemeContext'
import DashboardPage from './pages/DashboardPage'

const Template = () => {
  return (
    <ThemeProvider>
      <div className="App">
        <DashboardPage/>
      </div>
    </ThemeProvider>
  )
}

export default Template
