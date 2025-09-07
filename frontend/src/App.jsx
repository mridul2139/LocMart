import React from 'react'
import { Outlet } from 'react-router-dom'
import Header from './components/Header'
import { motion } from 'framer-motion'

export default function App() {
  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50'>
      <Header />
      <motion.main 
        className='container mx-auto p-6'
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Outlet />
      </motion.main>
    </div>
  )
}
