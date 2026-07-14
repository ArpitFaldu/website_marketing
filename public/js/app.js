import { CategoryList } from './components/CategoryList.js';
import { ProductList } from './components/ProductList.js';

document.addEventListener('DOMContentLoaded', async () => {
  // DOM Selection
  const categoryContainer = document.getElementById('categories-root');
  const productsContainer = document.getElementById('products-root');
  const searchInput = document.getElementById('search-input');
  const countBadge = document.getElementById('product-count-badge');
  const themeToggleBtn = document.getElementById('theme-toggle-btn');
  const yearSpan = document.getElementById('current-year');

  // Set current year in footer
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
  }

  // Fetch data dynamically from Express API
  try {
    const [categoriesRes, productsRes] = await Promise.all([
      fetch('/api/categories'),
      fetch('/api/products')
    ]);

    if (!categoriesRes.ok || !productsRes.ok) {
      throw new Error('Failed to fetch store data');
    }

    const categories = await categoriesRes.json();
    const products = await productsRes.json();

    // Initialize ProductList component
    const productList = new ProductList({
      container: productsContainer,
      products: products,
      onCountChange: (count) => {
        if (countBadge) {
          countBadge.textContent = `${count} ${count === 1 ? 'item' : 'items'}`;
        }
      }
    });

    // Initialize CategoryList component
    const categoryList = new CategoryList({
      container: categoryContainer,
      categories: categories,
      onCategoryChange: (categoryId) => {
        productList.setFilter({ category: categoryId });
      }
    });

    // Render components
    categoryList.render();
    productList.render();

    // Search filter integration
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        productList.setFilter({ search: e.target.value });
      });
    }

  } catch (error) {
    console.error('Error starting application:', error);
    if (productsContainer) {
      productsContainer.innerHTML = `
        <div class="empty-state">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h3>Failed to Load Data</h3>
          <p>Please check if the Express backend server is running and try again.</p>
        </div>
      `;
    }
  }

  // Theme Toggle Logic
  const getPreferredTheme = () => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) return savedTheme;
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  };

  const setTheme = (theme) => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    updateThemeToggleUI(theme);
  };

  const updateThemeToggleUI = (theme) => {
    if (!themeToggleBtn) return;
    if (theme === 'light') {
      themeToggleBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>
        </svg>
      `; // Moon icon
      themeToggleBtn.setAttribute('title', 'Switch to Dark Mode');
    } else {
      themeToggleBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>
        </svg>
      `; // Sun icon
      themeToggleBtn.setAttribute('title', 'Switch to Light Mode');
    }
  };

  // Initialize Theme
  const currentTheme = getPreferredTheme();
  setTheme(currentTheme);

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const isLight = document.documentElement.getAttribute('data-theme') === 'light';
      setTheme(isLight ? 'dark' : 'light');
    });
  }
});
