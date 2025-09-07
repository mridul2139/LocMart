import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, Lock, Eye, EyeOff, ArrowRight, User } from 'lucide-react'
import { request, saveLocalAuth, getLocalCart, setLocalCart, clearLocalCart } from '../api'
import { useNavigate } from 'react-router-dom'

export default function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  
  const navigate = useNavigate()

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid'
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setLoading(true)
    try {
      const data = await request('/auth/login', {
        method: 'POST',
        body: formData
      })
      
      saveLocalAuth(data.token, data.user)
      
      // Sync server cart with local cart
      const serverCart = await request('/cart', { token: data.token })
      const localCart = getLocalCart()
      
      // Merge carts (naive approach: sum quantities)
      const cartMap = new Map()
      serverCart.forEach(item => {
        cartMap.set(item.itemId, (cartMap.get(item.itemId) || 0) + item.qty)
      })
      localCart.forEach(item => {
        cartMap.set(item.itemId, (cartMap.get(item.itemId) || 0) + item.qty)
      })
      
      const mergedCart = Array.from(cartMap.entries()).map(([itemId, qty]) => ({
        itemId,
        qty
      }))
      
      // Save merged cart to server
      await request('/cart', {
        method: 'PUT',
        body: { items: mergedCart },
        token: data.token
      })
      
      clearLocalCart()
      navigate('/')
    } catch (error) {
      setErrors({ submit: error.error || 'Login failed' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='min-h-screen flex items-center justify-center py-12 px-4'>
      <motion.div
        className='w-full max-w-md'
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <motion.div
          className='card'
          whileHover={{ y: -5 }}
          transition={{ duration: 0.3 }}
        >
          <div className='text-center mb-8'>
            <motion.div
              className='w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4'
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.6 }}
            >
              <User className='text-white' size={32} />
            </motion.div>
            <h2 className='text-3xl font-bold gradient-text mb-2'>
              Welcome Back
            </h2>
            <p className='text-gray-600'>
              Sign in to your LokMart account
            </p>
          </div>

          <form onSubmit={handleSubmit} className='space-y-6'>
            {/* Email Field */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Email Address
              </label>
              <div className='relative'>
                <Mail className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400' size={20} />
                <input
                  type='email'
                  name='email'
                  value={formData.email}
                  onChange={handleChange}
                  className={`input-field pl-10 ${errors.email ? 'border-red-500' : ''}`}
                  placeholder='Enter your email'
                />
              </div>
              {errors.email && (
                <motion.p
                  className='text-red-500 text-sm mt-1'
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {errors.email}
                </motion.p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Password
              </label>
              <div className='relative'>
                <Lock className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400' size={20} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name='password'
                  value={formData.password}
                  onChange={handleChange}
                  className={`input-field pl-10 pr-10 ${errors.password ? 'border-red-500' : ''}`}
                  placeholder='Enter your password'
                />
                <button
                  type='button'
                  onClick={() => setShowPassword(!showPassword)}
                  className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600'
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.password && (
                <motion.p
                  className='text-red-500 text-sm mt-1'
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {errors.password}
                </motion.p>
              )}
            </div>

            {/* Submit Error */}
            {errors.submit && (
              <motion.div
                className='bg-red-50 border border-red-200 rounded-xl p-4'
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <p className='text-red-600 text-sm'>{errors.submit}</p>
              </motion.div>
            )}

            {/* Submit Button */}
            <motion.button
              type='submit'
              disabled={loading}
              className='w-full btn-primary flex items-center justify-center space-x-2'
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {loading ? (
                <motion.div
                  className='w-5 h-5 border-2 border-white border-t-transparent rounded-full'
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                />
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight size={20} />
                </>
              )}
            </motion.button>
          </form>

          <div className='mt-6 text-center'>
            <p className='text-gray-600'>
              Don't have an account?{' '}
              <motion.a
                href='/signup'
                className='text-blue-600 hover:text-blue-700 font-semibold'
                whileHover={{ scale: 1.05 }}
              >
                Create one
              </motion.a>
            </p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}
