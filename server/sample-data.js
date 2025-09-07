const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, 'data.sqlite');
const db = new sqlite3.Database(DB_PATH);

// Sample grocery items
const sampleItems = [
  {
    title: "Fresh Organic Bananas",
    description: "Sweet, ripe organic bananas perfect for snacking or baking",
    price: 2.99,
    category: "Fruits",
    image: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400&h=400&fit=crop"
  },
  {
    title: "Premium Basmati Rice",
    description: "Long grain basmati rice, perfect for biryani and pulao",
    price: 4.99,
    category: "Grains",
    image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=400&fit=crop"
  },
  {
    title: "Fresh Milk 1L",
    description: "Fresh whole milk, pasteurized and homogenized",
    price: 3.49,
    category: "Dairy",
    image: "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&h=400&fit=crop"
  },
  {
    title: "Organic Spinach",
    description: "Fresh organic spinach leaves, perfect for salads and cooking",
    price: 2.49,
    category: "Vegetables",
    image: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400&h=400&fit=crop"
  },
  {
    title: "Free Range Eggs (12 pack)",
    description: "Fresh free-range eggs from happy hens",
    price: 5.99,
    category: "Dairy",
    image: "https://images.unsplash.com/photo-1518569656558-1ea25c4d4b3c?w=400&h=400&fit=crop"
  },
  {
    title: "Whole Wheat Bread",
    description: "Freshly baked whole wheat bread, soft and nutritious",
    price: 2.99,
    category: "Bakery",
    image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=400&fit=crop"
  },
  {
    title: "Extra Virgin Olive Oil",
    description: "Premium cold-pressed extra virgin olive oil",
    price: 8.99,
    category: "Cooking Oil",
    image: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&h=400&fit=crop"
  },
  {
    title: "Fresh Tomatoes",
    description: "Juicy, ripe tomatoes perfect for salads and cooking",
    price: 3.99,
    category: "Vegetables",
    image: "https://images.unsplash.com/photo-1546470427-4b4b0b0b0b0b?w=400&h=400&fit=crop"
  },
  {
    title: "Greek Yogurt",
    description: "Thick and creamy Greek yogurt, high in protein",
    price: 4.49,
    category: "Dairy",
    image: "https://images.unsplash.com/photo-1571212053456-5a8867b6e6b9?w=400&h=400&fit=crop"
  },
  {
    title: "Almonds (250g)",
    description: "Premium California almonds, raw and unsalted",
    price: 6.99,
    category: "Nuts",
    image: "https://images.unsplash.com/photo-1559181567-c3190ca9959b?w=400&h=400&fit=crop"
  },
  {
    title: "Fresh Carrots",
    description: "Crisp and sweet carrots, perfect for snacking",
    price: 1.99,
    category: "Vegetables",
    image: "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=400&h=400&fit=crop"
  },
  {
    title: "Chicken Breast (500g)",
    description: "Fresh, lean chicken breast, perfect for grilling",
    price: 7.99,
    category: "Meat",
    image: "https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=400&h=400&fit=crop"
  },
  {
    title: "Quinoa (500g)",
    description: "Organic quinoa, a superfood grain",
    price: 5.99,
    category: "Grains",
    image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=400&fit=crop"
  },
  {
    title: "Fresh Strawberries",
    description: "Sweet and juicy strawberries, perfect for desserts",
    price: 4.99,
    category: "Fruits",
    image: "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=400&h=400&fit=crop"
  },
  {
    title: "Cheddar Cheese (200g)",
    description: "Aged cheddar cheese, sharp and flavorful",
    price: 4.99,
    category: "Dairy",
    image: "https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=400&h=400&fit=crop"
  },
  {
    title: "Sweet Potatoes",
    description: "Nutritious sweet potatoes, perfect for roasting",
    price: 2.49,
    category: "Vegetables",
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop"
  },
  {
    title: "Honey (500g)",
    description: "Pure, raw honey from local beekeepers",
    price: 8.99,
    category: "Pantry",
    image: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400&h=400&fit=crop"
  },
  {
    title: "Fresh Broccoli",
    description: "Fresh broccoli florets, rich in vitamins",
    price: 3.49,
    category: "Vegetables",
    image: "https://images.unsplash.com/photo-1584270354949-c26b0d5b4a0c?w=400&h=400&fit=crop"
  },
  {
    title: "Salmon Fillet (300g)",
    description: "Fresh Atlantic salmon fillet, rich in omega-3",
    price: 12.99,
    category: "Seafood",
    image: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=400&h=400&fit=crop"
  },
  {
    title: "Avocados (4 pack)",
    description: "Ripe Hass avocados, perfect for guacamole",
    price: 5.99,
    category: "Fruits",
    image: "https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=400&h=400&fit=crop"
  }
];

// Function to add sample items
function addSampleItems() {
  console.log('🛒 Adding sample grocery items to database...');
  
  // Clear existing items first
  db.run('DELETE FROM items', (err) => {
    if (err) {
      console.error('Error clearing items:', err);
      return;
    }
    
    console.log('✅ Cleared existing items');
    
    // Add sample items
    const stmt = db.prepare('INSERT INTO items (title, description, price, category, image) VALUES (?, ?, ?, ?, ?)');
    
    sampleItems.forEach((item, index) => {
      stmt.run([item.title, item.description, item.price, item.category, item.image], function(err) {
        if (err) {
          console.error('Error inserting item:', err);
        } else {
          console.log(`✅ Added: ${item.title} - $${item.price}`);
        }
        
        // Close database when all items are added
        if (index === sampleItems.length - 1) {
          stmt.finalize();
          db.close();
          console.log('🎉 Sample data added successfully!');
          console.log(`📊 Added ${sampleItems.length} grocery items`);
          console.log('🌐 Refresh your browser to see the items on the home page');
        }
      });
    });
  });
}

// Run the script
addSampleItems();
