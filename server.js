import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Serve static assets from public folder
app.use(express.static(path.join(__dirname, 'public')));

// Database mock data
const categories = [
  { id: 'all', name: 'All Products', icon: 'Sparkles' },
  { id: 'books', name: 'Books', icon: 'BookOpen' },
  { id: 'shoes', name: 'Shoes', icon: 'ShoppingBag' },
  { id: 'wrist-watch', name: 'Wrist Watches', icon: 'Watch' },
  { id: 'tshirt', name: 'T-Shirts', icon: 'Shirt' }
];

const products = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'products_scraped.json'), 'utf8')
);


// API Endpoints
app.get('/api/categories', (req, res) => {
  res.json(categories);
});

app.get('/api/products', (req, res) => {
  res.json(products);
});

// Fallback for SPA routing if needed, serves index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
