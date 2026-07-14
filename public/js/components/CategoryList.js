const ICONS = {
  Sparkles: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>`,
  BookOpen: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>`,
  ShoppingBag: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>`,
  Watch: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="7"/><polyline points="12 9 12 12 13.5 13.5"/><path d="M16.51 7.16 18 3H6l1.49 4.16"/><path d="M7.49 16.84 6 21h12l-1.49-4.16"/></svg>`,
  Shirt: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z"/></svg>`
};

export class CategoryList {
  constructor({ container, categories, onCategoryChange }) {
    this.container = container;
    this.categories = categories;
    this.activeCategoryId = 'all';
    this.onCategoryChange = onCategoryChange;
  }

  setActive(categoryId) {
    if (this.activeCategoryId === categoryId) return;
    this.activeCategoryId = categoryId;
    
    // Update active class in DOM directly to keep transitions snappy
    const buttons = this.container.querySelectorAll('.category-btn');
    buttons.forEach(btn => {
      if (btn.dataset.id === categoryId) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    this.onCategoryChange(categoryId);
  }

  render() {
    this.container.innerHTML = '';
    
    const nav = document.createElement('nav');
    nav.className = 'categories-container';

    this.categories.forEach(cat => {
      const btn = document.createElement('button');
      btn.className = `category-btn ${this.activeCategoryId === cat.id ? 'active' : ''}`;
      btn.dataset.id = cat.id;
      
      const iconSvg = ICONS[cat.icon] || '';
      btn.innerHTML = `${iconSvg} <span>${cat.name}</span>`;

      btn.addEventListener('click', () => this.setActive(cat.id));
      nav.appendChild(btn);
    });

    this.container.appendChild(nav);
  }
}
