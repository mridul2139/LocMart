// Debug script for cart functionality
import { request, getToken, getLocalCart, setLocalCart } from './api';

export async function testCartFunctionality() {
  console.log('🔍 Testing cart functionality...');
  
  // Test 1: Check if API is reachable
  try {
    const health = await request('/health');
    console.log('✅ API Health Check:', health);
  } catch (error) {
    console.error('❌ API Health Check Failed:', error);
    return;
  }
  
  // Test 2: Check if items are available
  try {
    const items = await request('/items');
    console.log('✅ Items available:', items.length);
    if (items.length > 0) {
      console.log('📦 First item:', items[0]);
    }
  } catch (error) {
    console.error('❌ Failed to fetch items:', error);
    return;
  }
  
  // Test 3: Check local cart functionality
  const localCart = getLocalCart();
  console.log('🛒 Local cart:', localCart);
  
  // Test 4: Test adding to local cart
  try {
    const testItem = { itemId: 1, qty: 1 };
    const updatedCart = [...localCart, testItem];
    setLocalCart(updatedCart);
    console.log('✅ Local cart updated:', updatedCart);
  } catch (error) {
    console.error('❌ Failed to update local cart:', error);
  }
  
  // Test 5: Check authentication
  const token = getToken();
  console.log('🔐 Token available:', !!token);
  
  if (token) {
    // Test 6: Test authenticated cart operations
    try {
      const cart = await request('/cart', { token });
      console.log('✅ Server cart:', cart);
    } catch (error) {
      console.error('❌ Failed to fetch server cart:', error);
    }
  }
  
  console.log('🎉 Cart functionality test complete!');
}

// Auto-run if in browser
if (typeof window !== 'undefined') {
  window.testCartFunctionality = testCartFunctionality;
}
