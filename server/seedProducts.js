require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });

// Product Schema (simplified version matching your model)
const productSchema = new mongoose.Schema({
  name: String,
  description: String,
  price: Number,
  category: String,
  subcategory: String,
  brand: String,
  images: [String],
  sizes: [String],
  colors: [String],
  stock: Number,
  rating: Number,
  reviews: { type: [Object], default: [] }
});

const Product = mongoose.model('Product', productSchema);

// Read the products JSON file
const productsPath = path.join(__dirname, '../client/public/products.json');
const products = JSON.parse(fs.readFileSync(productsPath, 'utf-8'));

// Seed the database
async function seedDatabase() {
  try {
    // Clear existing products
    await Product.deleteMany({});
    console.log('🗑️  Cleared existing products');

    // Transform products to match schema (add first image as main image field if needed)
    const transformedProducts = products.map(p => ({
      ...p,
      image: p.images[0], // Add single image field if your model has it
      reviews: []
    }));

    // Insert all products
    await Product.insertMany(transformedProducts);
    console.log(`✅ Successfully imported ${products.length} products to MongoDB!`);
    
    // Show image distribution
    const categories = products.reduce((acc, p) => {
      acc[p.category] = (acc[p.category] || 0) + 1;
      return acc;
    }, {});
    console.log('📊 Products by category:', categories);
    
    mongoose.connection.close();
    console.log('👋 Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
