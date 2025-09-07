import React, { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { ShoppingCart } from 'lucide-react'

export default function ItemCard({ item, onAdd, index = 0 }) {
  const [isHovered, setIsHovered] = useState(false)
  const [isAdding, setIsAdding] = useState(false)

  // Delegate add-to-cart to parent handler; keep stable reference
  const handleAdd = useCallback(async () => {
    if (isAdding) return;
    setIsAdding(true);
    try {
      console.log('Add to Cart clicked:', { itemId: item.id, title: item.title });
      if (typeof onAdd === 'function') {
        await Promise.resolve(onAdd(item.id));
      }
    } catch (error) {
      console.error('❌ Error adding to cart:', error);
    } finally {
      setIsAdding(false);
    }
  }, [isAdding, onAdd, item.id]);

  // Add test function to window for debugging
  useEffect(() => {
    window.testCartButton = () => {
      console.log('🧪 Testing cart button for item:', item.id)
      handleAdd()
    }
    // eslint-disable-next-line
  }, [handleAdd, item.id])

  return (
    <motion.div
      className='card group relative overflow-hidden'
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -8 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      {/* Image */}
      <div className='relative overflow-hidden rounded-xl mb-4'>
        <motion.img
          src={item.image || `https://picsum.photos/seed/${item.id}/400/300`}
          alt={item.title}
          className='w-full h-48 object-cover transition-transform duration-500 group-hover:scale-110'
          whileHover={{ scale: 1.1 }}
        />

        {/* Category Badge */}
        {item.category && (
          <motion.div
            className='absolute top-3 left-3 px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-medium text-gray-700'
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            {item.category}
          </motion.div>
        )}
      </div>

      {/* Content */}
      <div className='space-y-3'>
        <div>
          <h3 className='font-semibold text-lg text-gray-900 group-hover:text-blue-600 transition-colors'>
            {item.title}
          </h3>
          {item.description && (
            <p className='text-sm text-gray-500 mt-1 line-clamp-2'>
              {item.description}
            </p>
          )}
        </div>

        <div className='flex items-center justify-between'>
          <motion.div
            className='text-2xl font-bold gradient-text'
            whileHover={{ scale: 1.05 }}
          >
            ₹{item.price}
          </motion.div>

          <motion.button
            className={`add-to-cart flex items-center space-x-2 px-4 py-2 rounded-xl font-semibold transition-all duration-300 ${
              isAdding
                ? 'bg-green-500 text-white'
                : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white group-hover:from-blue-700 group-hover:to-purple-700 cursor-pointer'
            }`}
            onClick={handleAdd}
            disabled={isAdding}
            whileHover={isAdding ? {} : { scale: 1.05 }}
            whileTap={isAdding ? {} : { scale: 0.95 }}
            type="button"
          >
            <motion.div
              animate={{ rotate: isAdding ? 360 : 0 }}
              transition={{ duration: 0.5 }}
            >
              <ShoppingCart size={18} />
            </motion.div>
            <span>{isAdding ? 'Added!' : 'Add to Cart'}</span>
          </motion.button>
        </div>
      </div>

      {/* Hover Effect Border */}
      <motion.div
        className='absolute inset-0 border-2 border-blue-500 rounded-2xl opacity-0 pointer-events-none'
        animate={{ opacity: isHovered ? 0.3 : 0 }}
        transition={{ duration: 0.3 }}
      />
    </motion.div>
  )
}
