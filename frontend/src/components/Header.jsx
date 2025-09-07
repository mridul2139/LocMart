import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingCart, User, LogOut, Menu, X, Search } from 'lucide-react'
import { getUser, getToken, clearLocalAuth, getLocalCart, request } from '../api'

export default function Header() {
  const user = getUser()
  const token = getToken()
  const navigate = useNavigate()
  const location = useLocation()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [cartCount, setCartCount] = useState(0)

  useEffect(() => {
    const updateCartCount = async () => {
      try {
        const tk = getToken()
        if (tk) {
          const serverCart = await request('/cart', { token: tk })
          const count = Array.isArray(serverCart)
            ? serverCart.reduce((sum, i) => sum + (i.qty || 0), 0)
            : 0
          setCartCount(count)
          return
        }
        const localCart = getLocalCart()
        const totalItems = localCart.reduce((sum, item) => sum + (item.qty || 0), 0)
        setCartCount(totalItems)
      } catch (e) {
        setCartCount(0)
      }
    }

    updateCartCount()
    const interval = setInterval(updateCartCount, 3000)
    return () => clearInterval(interval)
  }, [])

  const logout = () => {
    clearLocalAuth()
    setIsMenuOpen(false)
    navigate('/')
  }

  const navItems = [
    { path: '/', label: 'Shop', icon: Search },
    { path: '/cart', label: 'Cart', icon: ShoppingCart, badge: cartCount }
  ]

  const authItems = token ? [
    { label: `Hi, ${user?.name || user?.email}`, icon: User },
    { label: 'Logout', icon: LogOut, onClick: logout }
  ] : [
    { path: '/login', label: 'Login' },
    { path: '/signup', label: 'Signup' }
  ]

  return (
    <motion.header 
      className='bg-white/80 backdrop-blur-md shadow-lg sticky top-0 z-50'
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className='container mx-auto flex items-center justify-between p-4'>
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Link to='/' className='font-bold text-2xl gradient-text'>
            LokMart
          </Link>
        </motion.div>

        {/* Desktop Navigation */}
        <nav className='hidden md:flex items-center space-x-6'>
          {navItems.map((item) => (
            <motion.div
              key={item.path}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                to={item.path}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-300 ${
                  location.pathname === item.path
                    ? 'bg-blue-100 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <item.icon size={20} />
                <span>{item.label}</span>
                {item.badge > 0 && (
                  <motion.span
                    className='bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center'
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 500 }}
                  >
                    {item.badge}
                  </motion.span>
                )}
              </Link>
            </motion.div>
          ))}
        </nav>

        {/* Desktop Auth */}
        <div className='hidden md:flex items-center space-x-4'>
          {authItems.map((item, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {item.path ? (
                <Link
                  to={item.path}
                  className={`px-4 py-2 rounded-xl transition-all duration-300 ${
                    item.label === 'Signup'
                      ? 'btn-primary'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {item.icon && <item.icon size={20} className="inline mr-2" />}
                  {item.label}
                </Link>
              ) : (
                <button
                  onClick={item.onClick}
                  className='flex items-center space-x-2 px-4 py-2 rounded-xl text-gray-600 hover:bg-gray-100 transition-all duration-300'
                >
                  {item.icon && <item.icon size={20} />}
                  <span>{item.label}</span>
                </button>
              )}
            </motion.div>
          ))}
        </div>

        {/* Mobile Menu Button */}
        <motion.button
          className='md:hidden p-2 rounded-xl hover:bg-gray-100 transition-colors'
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </motion.button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            className='md:hidden bg-white border-t border-gray-200'
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className='p-4 space-y-4'>
              {navItems.map((item) => (
                <motion.div
                  key={item.path}
                  whileHover={{ x: 10 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    to={item.path}
                    onClick={() => setIsMenuOpen(false)}
                    className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 ${
                      location.pathname === item.path
                        ? 'bg-blue-100 text-blue-600'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <div className='flex items-center space-x-3'>
                      <item.icon size={20} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge > 0 && (
                      <span className='bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center'>
                        {item.badge}
                      </span>
                    )}
                  </Link>
                </motion.div>
              ))}
              
              <div className='border-t border-gray-200 pt-4 space-y-2'>
                {authItems.map((item, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ x: 10 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {item.path ? (
                      <Link
                        to={item.path}
                        onClick={() => setIsMenuOpen(false)}
                        className={`block px-4 py-3 rounded-xl transition-all duration-300 ${
                          item.label === 'Signup'
                            ? 'btn-primary text-center'
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        {item.label}
                      </Link>
                    ) : (
                      <button
                        onClick={() => {
                          item.onClick()
                          setIsMenuOpen(false)
                        }}
                        className='w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-gray-100 transition-all duration-300 text-left'
                      >
                        {item.icon && <item.icon size={20} />}
                        <span>{item.label}</span>
                      </button>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}
