import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Grid, List, SlidersHorizontal, ShoppingCart } from 'lucide-react'
import ItemCard from '../components/ItemCard'
import { request, getToken, getLocalCart, setLocalCart } from '../api'

export default function Listing() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    q: '',
    category: '',
    minPrice: '',
    maxPrice: ''
  })
  const [viewMode, setViewMode] = useState('grid')
  const [showFilters, setShowFilters] = useState(false)
  const [cartCount, setCartCount] = useState(0)

  const categories = ['Electronics', 'Clothing', 'Books', 'Home', 'Sports', 'Beauty']

  async function loadItems() {
    setLoading(true)
    try {
      const data = await request('/items', { method: 'GET' })
      setItems(data)
    } catch (error) {
      console.error('Error loading items:', error)
    } finally {
      setLoading(false)
    }
  }

  async function loadCartCount() {
    try {
      const token = getToken()
      if (token) {
        const serverCart = await request('/cart', { token })
        const count = Array.isArray(serverCart)
          ? serverCart.reduce((sum, i) => sum + (i.qty || 0), 0)
          : 0
        setCartCount(count)
        return
      }
      const localCart = getLocalCart()
      const count = Array.isArray(localCart)
        ? localCart.reduce((sum, i) => sum + (i.qty || 0), 0)
        : 0
      setCartCount(count)
    } catch (e) {
      setCartCount(0)
    }
  }

  async function searchItems() {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.set(key, value)
      })
      
      const data = await request(`/items?${params.toString()}`)
      setItems(data)
    } catch (error) {
      console.error('Error searching items:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadItems()
    loadCartCount()
    
    // Add test function to window for debugging
    window.testAddToCart = (itemId = 1) => {
      console.log('🧪 Testing add to cart with itemId:', itemId)
      return onAddToCart(itemId)
    }
    
    console.log('🧪 Test function available: window.testAddToCart(itemId)')
  }, [])

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const clearFilters = () => {
    setFilters({ q: '', category: '', minPrice: '', maxPrice: '' })
    loadItems()
  }

  const onAddToCart = async (itemId) => {
    console.log('🛒 onAddToCart called with itemId:', itemId)
    
    try {
      const token = getToken()
      if (token) {
        // Logged-in: update server cart
        await request('/cart/add', { method: 'POST', body: { itemId, qty: 1 }, token })
        console.log('✅ Server cart updated for item:', itemId)
        alert('✅ Added to cart!')
        setCartCount(prev => prev + 1)
        return true
      }

      // Guest: use local cart
      const localCart = getLocalCart()
      console.log('🛒 Current local cart:', localCart)

      const existingItem = localCart.find(item => item.itemId === itemId)
      if (existingItem) {
        existingItem.qty += 1
        console.log('➕ Incremented existing item quantity')
      } else {
        localCart.push({ itemId, qty: 1 })
        console.log('➕ Added new item to local cart')
      }

      setLocalCart(localCart)
      console.log('✅ Local cart updated:', localCart)

      const totalItems = localCart.reduce((sum, item) => sum + item.qty, 0)
      alert(`✅ Added to cart!\nItem ID: ${itemId}\nTotal items in cart: ${totalItems}`)
      setCartCount(totalItems)
      return true
      
    } catch (error) {
      console.error('❌ Error adding to cart:', error)
      alert('❌ Error adding to cart: ' + error.message)
      throw error // Re-throw to let ItemCard handle it
    }
  }

  return (
    <div className='space-y-8'>
      {/* Hero Section */}
      <motion.div
        className='text-center py-12'
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className='text-4xl md:text-6xl font-bold gradient-text mb-4'>
          Discover Amazing Products
        </h1>
        <p className='text-xl text-gray-600 max-w-2xl mx-auto'>
          Find everything you need with our premium collection of products
        </p>
      </motion.div>

      {/* Search and Filters */}
      <motion.div
        className='bg-white rounded-2xl shadow-lg p-6'
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <div className='flex flex-col lg:flex-row gap-4'>
          {/* Search Bar */}
          <div className='flex-1 relative'>
            <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400' size={20} />
            <input
              type='text'
              placeholder='Search products...'
              value={filters.q}
              onChange={(e) => handleFilterChange('q', e.target.value)}
              className='input-field pl-10'
            />
          </div>

          {/* Filter Toggle */}
          <motion.button
            className='lg:hidden px-4 py-3 bg-gray-100 rounded-xl flex items-center space-x-2'
            onClick={() => setShowFilters(!showFilters)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <SlidersHorizontal size={20} />
            <span>Filters</span>
          </motion.button>

          {/* Search Button */}
          <motion.button
            className='btn-primary flex items-center space-x-2'
            onClick={searchItems}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Search size={20} />
            <span>Search</span>
          </motion.button>
        </div>

        {/* Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              className='mt-6 pt-6 border-t border-gray-200'
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                {/* Category Filter */}
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Category
                  </label>
                  <select
                    value={filters.category}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                    className='input-field'
                  >
                    <option value=''>All Categories</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                {/* Price Range */}
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Min Price
                  </label>
                  <input
                    type='number'
                    placeholder='Min price'
                    value={filters.minPrice}
                    onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                    className='input-field'
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Max Price
                  </label>
                  <input
                    type='number'
                    placeholder='Max price'
                    value={filters.maxPrice}
                    onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                    className='input-field'
                  />
                </div>
              </div>

              <div className='flex justify-end mt-4 space-x-3'>
                <button
                  onClick={clearFilters}
                  className='btn-secondary'
                >
                  Clear Filters
                </button>
                <button
                  onClick={searchItems}
                  className='btn-primary'
                >
                  Apply Filters
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* View Controls */}
      <div className='flex justify-between items-center'>
        <motion.div
          className='flex items-center space-x-2'
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <span className='text-gray-600'>View:</span>
          <div className='flex bg-gray-100 rounded-xl p-1'>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-all ${
                viewMode === 'grid' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
              }`}
            >
              <Grid size={20} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-all ${
                viewMode === 'list' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
              }`}
            >
              <List size={20} />
            </button>
          </div>
        </motion.div>

        <motion.div
          className='flex items-center space-x-4'
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <span className='text-gray-600'>{items.length} products found</span>
          <div className='flex items-center space-x-2 px-3 py-1 bg-gray-100 rounded-lg text-sm'>
            <ShoppingCart size={16} />
            <span>{cartCount}</span>
          </div>
        </motion.div>
      </div>

      {/* Items Grid */}
      {loading ? (
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
          {[...Array(8)].map((_, i) => (
            <div key={i} className='card'>
              <div className='shimmer h-48 rounded-xl mb-4'></div>
              <div className='space-y-3'>
                <div className='shimmer h-4 rounded'></div>
                <div className='shimmer h-3 rounded w-2/3'></div>
                <div className='flex justify-between items-center'>
                  <div className='shimmer h-6 rounded w-20'></div>
                  <div className='shimmer h-8 rounded w-24'></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <motion.div
          className={`grid gap-6 ${
            viewMode === 'grid'
              ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
              : 'grid-cols-1'
          }`}
          layout
        >
          <AnimatePresence>
            {items.map((item, index) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3 }}
              >
                <ItemCard
                  item={item}
                  onAdd={onAddToCart}
                  index={index}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Empty State */}
      {!loading && items.length === 0 && (
        <motion.div
          className='text-center py-12'
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className='text-6xl mb-4'>🔍</div>
          <h3 className='text-2xl font-semibold text-gray-700 mb-2'>
            No products found
          </h3>
          <p className='text-gray-500 mb-6'>
            Try adjusting your search or filter criteria
          </p>
          <button
            onClick={clearFilters}
            className='btn-primary'
          >
            Clear Filters
          </button>
        </motion.div>
      )}
    </div>
  )
}
