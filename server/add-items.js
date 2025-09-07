const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, 'data.sqlite');
const db = new sqlite3.Database(DB_PATH);

// Function to add a single item
function addItem(title, description, price, category, image) {
  const stmt = db.prepare('INSERT INTO items (title, description, price, category, image) VALUES (?, ?, ?, ?, ?)');
  
  stmt.run([title, description, price, category, image], function(err) {
    if (err) {
      console.error('❌ Error adding item:', err);
    } else {
      console.log(`✅ Added: ${title} - $${price} (ID: ${this.lastID})`);
    }
    stmt.finalize();
    db.close();
  });
}

// Function to add multiple items
function addItems(items) {
  console.log('🛒 Adding items to database...');
  
  const stmt = db.prepare('INSERT INTO items (title, description, price, category, image) VALUES (?, ?, ?, ?, ?)');
  
  items.forEach((item, index) => {
    stmt.run([item.title, item.description, item.price, item.category, item.image], function(err) {
      if (err) {
        console.error('❌ Error adding item:', err);
      } else {
        console.log(`✅ Added: ${item.title} - $${item.price}`);
      }
      
      if (index === items.length - 1) {
        stmt.finalize();
        db.close();
        console.log(`🎉 Successfully added ${items.length} items!`);
      }
    });
  });
}

// Function to list all items
function listItems() {
  console.log('📋 Current items in database:');
  
  db.all('SELECT id, title, price, category FROM items ORDER BY category, title', (err, rows) => {
    if (err) {
      console.error('❌ Error fetching items:', err);
      return;
    }
    
    if (rows.length === 0) {
      console.log('📭 No items found in database');
    } else {
      console.log(`📊 Total items: ${rows.length}`);
      console.log('\n📦 Items by category:');
      
      const categories = {};
      rows.forEach(row => {
        if (!categories[row.category]) {
          categories[row.category] = [];
        }
        categories[row.category].push(row);
      });
      
      Object.keys(categories).sort().forEach(category => {
        console.log(`\n🏷️  ${category}:`);
        categories[category].forEach(item => {
          console.log(`   ${item.id}. ${item.title} - $${item.price}`);
        });
      });
    }
    
    db.close();
  });
}

// Command line interface
const command = process.argv[2];

if (command === 'list') {
  listItems();
} else if (command === 'add') {
  const title = process.argv[3];
  const description = process.argv[4];
  const price = parseFloat(process.argv[5]);
  const category = process.argv[6];
  const image = process.argv[7] || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=400&fit=crop';
  
  if (!title || !description || !price || !category) {
    console.log('❌ Usage: node add-items.js add "Title" "Description" price "Category" [image_url]');
    console.log('📝 Example: node add-items.js add "Fresh Apples" "Sweet red apples" 3.99 "Fruits"');
    process.exit(1);
  }
  
  addItem(title, description, price, category, image);
} else {
  console.log('🛒 LokMart Item Management');
  console.log('\n📋 Available commands:');
  console.log('  list                                    - List all items');
  console.log('  add "Title" "Description" price "Category" [image_url] - Add single item');
  console.log('\n📝 Examples:');
  console.log('  node add-items.js list');
  console.log('  node add-items.js add "Fresh Apples" "Sweet red apples" 3.99 "Fruits"');
  console.log('  node add-items.js add "Organic Milk" "Fresh organic milk" 4.99 "Dairy" "https://example.com/milk.jpg"');
}
