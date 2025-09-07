import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingCart, Trash2, Plus, Minus, ArrowLeft, CreditCard } from 'lucide-react'
import { getToken, request, getLocalCart, setLocalCart } from '../api'
import { useNavigate } from 'react-router-dom'

export default function Cart() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(new Set())
  const navigate = useNavigate()

  const token = getToken()

  async function loadCart() {
    setLoading(true)
    try {
      if (!token) {
        // Load local cart
        const localCart = getLocalCart()
        if (localCart.length === 0) {
          setItems([])
          return
        }

        // Fetch item details
        const itemIds = localCart.map(item => item.itemId)
        const response = await fetch(`${import.meta.env.VITE_API_BASE || 'http://localhost:4000/api'}/items?limit=100`)
        const allItems = await response.json()
        const itemMap = new Map(allItems.map(item => [item.id, item]))
        
        const cartWithDetails = localCart.map(cartItem => ({
          ...cartItem,
          details: itemMap.get(cartItem.itemId)
        }))
        
        setItems(cartWithDetails)
        return
      }

      // Load server cart
      const serverCart = await request('/cart', { token })
      if (serverCart.length === 0) {
        setItems([])
        return
      }

      // Fetch item details
      const response = await fetch(`${import.meta.env.VITE_API_BASE || 'http://localhost:4000/api'}/items?limit=100`)
      const allItems = await response.json()
      const itemMap = new Map(allItems.map(item => [item.id, item]))
      
      const cartWithDetails = serverCart.map(cartItem => ({
        ...cartItem,
        details: itemMap.get(cartItem.itemId)
      }))
      
      setItems(cartWithDetails)
    } catch (error) {
      console.error('Error loading cart:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCart()
  }, [])

  const updateQuantity = async (itemId, newQty) => {
    if (newQty < 0) return
    
    setUpdating(prev => new Set([...prev, itemId]))
    
    try {
      if (!token) {
        // Update local cart
        const localCart = getLocalCart()
        const updatedCart = localCart.map(item => 
          item.itemId === itemId 
            ? { ...item, qty: newQty }
            : item
        ).filter(item => item.qty > 0)
        
        setLocalCart(updatedCart)
        setItems(prev => prev.map(item => 
          item.itemId === itemId 
            ? { ...item, qty: newQty }
            : item
        ).filter(item => item.qty > 0))
      } else {
        // Update server cart
        if (newQty === 0) {
          await request('/cart/remove', {
            method: 'POST',
            body: { itemId },
            token
          })
        } else {
          // For simplicity, we'll replace the entire cart
          const updatedItems = items.map(item => 
            item.itemId === itemId 
              ? { ...item, qty: newQty }
              : item
          ).filter(item => item.qty > 0)
          
          await request('/cart', {
            method: 'PUT',
            body: { items: updatedItems.map(({ details, ...item }) => item) },
            token
          })
        }
        
        loadCart()
      }
    } catch (error) {
      console.error('Error updating cart:', error)
    } finally {
      setUpdating(prev => {
        const newSet = new Set(prev)
        newSet.delete(itemId)
        return newSet
      })
    }
  }

  const removeItem = async (itemId) => {
    await updateQuantity(itemId, 0)
  }

  const getTotalPrice = () => {
    return items.reduce((total, item) => {
      const price = item.details?.price || 0
      return total + (price * item.qty)
    }, 0)
  }

  const getTotalItems = () => {
    return items.reduce((total, item) => total + item.qty, 0)
  }

  if (loading) {
    return (
      <div className='max-w-4xl mx-auto'>
        <div className='space-y-6'>
          {[...Array(3)].map((_, i) => (
            <div key={i} className='card'>
              <div className='flex items-center space-x-4'>
                <div className='shimmer w-24 h-24 rounded-xl'></div>
                <div className='flex-1 space-y-3'>
                  <div className='shimmer h-4 rounded w-3/4'></div>
                  <div className='shimmer h-3 rounded w-1/2'></div>
                  <div className='shimmer h-6 rounded w-20'></div>
                </div>
                <div className='shimmer h-8 rounded w-24'></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className='max-w-4xl mx-auto'>
      <motion.div
        className='mb-8'
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className='flex items-center justify-between mb-6'>
          <div className='flex items-center space-x-4'>
            <motion.button
              onClick={() => navigate('/')}
              className='p-2 rounded-xl hover:bg-gray-100 transition-colors'
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ArrowLeft size={24} />
            </motion.button>
            <div>
              <h1 className='text-3xl font-bold gradient-text'>
                Shopping Cart
              </h1>
              <p className='text-gray-600'>
                {getTotalItems()} items in your cart
              </p>
            </div>
          </div>
        </div>

        {items.length === 0 ? (
          <motion.div
            className='text-center py-16'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <motion.div
              className='w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6'
              whileHover={{ scale: 1.1 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <ShoppingCart size={48} className='text-gray-400' />
            </motion.div>
            <h3 className='text-2xl font-semibold text-gray-700 mb-2'>
              Your cart is empty
            </h3>
            <p className='text-gray-500 mb-8'>
              Looks like you haven't added any items to your cart yet
            </p>
            <motion.button
              onClick={() => navigate('/')}
              className='btn-primary'
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Start Shopping
            </motion.button>
          </motion.div>
        ) : (
          <div className='grid lg:grid-cols-3 gap-8'>
            {/* Cart Items */}
            <div className='lg:col-span-2 space-y-4'>
              <AnimatePresence>
                {items.map((item, index) => (
                  <motion.div
                    key={item.itemId}
                    className='card'
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    layout
                  >
                    <div className='flex items-center space-x-4'>
                      {/* Item Image */}
                      <motion.div
                        className='relative'
                        whileHover={{ scale: 1.05 }}
                      >
                        <img
                          src={item.details?.image || `https://picsum.photos/seed/${item.itemId}/120/120`}
                          alt={item.details?.title || 'Item'}
                          className='w-24 h-24 object-cover rounded-xl'
                        />
                        {updating.has(item.itemId) && (
                          <div className='absolute inset-0 bg-white/50 rounded-xl flex items-center justify-center'>
                            <motion.div
                              className='w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full'
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                            />
                          </div>
                        )}
                      </motion.div>

                      {/* Item Details */}
                      <div className='flex-1 min-w-0'>
                        <h3 className='font-semibold text-lg text-gray-900 truncate'>
                          {item.details?.title || `Item ${item.itemId}`}
                        </h3>
                        <p className='text-sm text-gray-500'>
                          {item.details?.category || 'Category'}
                        </p>
                        <div className='text-lg font-bold gradient-text mt-2'>
                          ₹{(item.details?.price || 0) * item.qty}
                        </div>
                      </div>

                      {/* Quantity Controls */}
                      <div className='flex items-center space-x-3'>
                        <motion.button
                          onClick={() => updateQuantity(item.itemId, item.qty - 1)}
                          disabled={updating.has(item.itemId) || item.qty <= 1}
                          className='p-2 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Minus size={16} />
                        </motion.button>
                        
                        <span className='w-8 text-center font-semibold'>
                          {item.qty}
                        </span>
                        
                        <motion.button
                          onClick={() => updateQuantity(item.itemId, item.qty + 1)}
                          disabled={updating.has(item.itemId)}
                          className='p-2 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Plus size={16} />
                        </motion.button>
                      </div>

                      {/* Remove Button */}
                      <motion.button
                        onClick={() => removeItem(item.itemId)}
                        disabled={updating.has(item.itemId)}
                        className='p-2 rounded-full bg-red-100 text-red-600 hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Trash2 size={16} />
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Order Summary */}
            <motion.div
              className='lg:col-span-1'
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <div className='card sticky top-24'>
                <h3 className='text-xl font-semibold text-gray-900 mb-6'>
                  Order Summary
                </h3>
                
                <div className='space-y-4 mb-6'>
                  <div className='flex justify-between'>
                    <span className='text-gray-600'>Items ({getTotalItems()})</span>
                    <span className='font-semibold'>₹{getTotalPrice()}</span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-gray-600'>Shipping</span>
                    <span className='font-semibold text-green-600'>Free</span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-gray-600'>Tax</span>
                    <span className='font-semibold'>₹{(getTotalPrice() * 0.18).toFixed(0)}</span>
                  </div>
                  <div className='border-t border-gray-200 pt-4'>
                    <div className='flex justify-between text-lg font-bold'>
                      <span>Total</span>
                      <span className='gradient-text'>
                        ₹{(getTotalPrice() * 1.18).toFixed(0)}
                      </span>
                    </div>
                  </div>
                </div>

                <motion.button
                  className='w-full btn-primary flex items-center justify-center space-x-2'
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <CreditCard size={20} />
                  <span>Proceed to Checkout</span>
                </motion.button>

                <p className='text-xs text-gray-500 text-center mt-4'>
                  Secure checkout powered by LokMart
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </motion.div>
    </div>
  )
}
