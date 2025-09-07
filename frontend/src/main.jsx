import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './styles.css'
import App from './App'
import Signup from './pages/Signup'
import Login from './pages/Login'
import Listing from './pages/Listing'
import Cart from './pages/Cart'

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<App/>}>
          <Route index element={<Listing/>} />
          <Route path='signup' element={<Signup/>} />
          <Route path='login' element={<Login/>} />
          <Route path='cart' element={<Cart/>} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
)
