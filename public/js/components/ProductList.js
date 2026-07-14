// Star and arrow icons
const STAR_ICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>`;
const ARROW_ICON = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>`;
const EMPTY_ICON = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`;

export class ProductList {
  constructor({ container, products, onCountChange }) {
    this.container = container;
    this.products = products;
    this.currentCategory = 'all';
    this.searchQuery = '';
    this.onCountChange = onCountChange; // Callback to update UI count badge
  }

  setFilter({ category, search }) {
    if (category !== undefined) this.currentCategory = category;
    if (search !== undefined) this.searchQuery = search.toLowerCase().trim();
    this.render();
  }

  render() {
    this.container.innerHTML = '';

    // Filter products
    const filteredProducts = this.products.filter(prod => {
      const matchesCategory = this.currentCategory === 'all' || prod.category === this.currentCategory;
      const matchesSearch = !this.searchQuery || 
        prod.name.toLowerCase().includes(this.searchQuery) || 
        prod.description.toLowerCase().includes(this.searchQuery);
      return matchesCategory && matchesSearch;
    });

    // Notify parent of total items matching
    if (this.onCountChange) {
      this.onCountChange(filteredProducts.length);
    }

    if (filteredProducts.length === 0) {
      this.renderEmptyState();
      return;
    }

    const grid = document.createElement('div');
    grid.className = 'products-grid';

    filteredProducts.forEach(prod => {
      const card = document.createElement('article');
      card.className = 'product-card';

      // Badge markup
      const badgeHtml = prod.badge ? `<span class="product-badge">${prod.badge}</span>` : '';

      // Format category tag beautifully
      const categoryLabel = prod.category.replace('-', ' ');

      card.innerHTML = `
        <div class="product-image-wrapper">
          ${badgeHtml}
          <img src="${prod.imageUrl}" alt="${prod.name}" loading="lazy" />
        </div>
        <div class="product-content">
          <div class="product-meta">
            <span class="product-category-tag">${categoryLabel}</span>
            <div class="product-rating">
              ${STAR_ICON}
              <span>${prod.rating.toFixed(1)}</span>
            </div>
          </div>
          <h3 class="product-title">${prod.name}</h3>
          <p class="product-desc">${prod.description}</p>
          <div class="product-footer">
            <span class="product-price">${prod.price}</span>
            <a href="${prod.affiliateLink}" target="_blank" rel="noopener noreferrer" class="buy-btn">
              <span>View Deal</span>
              ${ARROW_ICON}
            </a>
          </div>
        </div>
      `;

      grid.appendChild(card);
    });

    this.container.appendChild(grid);
  }

  renderEmptyState() {
    const empty = document.createElement('div');
    empty.className = 'empty-state';
    empty.innerHTML = `
      ${EMPTY_ICON}
      <h3>No Products Found</h3>
      <p>We couldn't find any products matching your selection. Try a different filter or search term!</p>
    `;
    this.container.appendChild(empty);
  }
}
