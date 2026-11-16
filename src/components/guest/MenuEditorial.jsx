import React, { useState, useEffect } from 'react';
import { CATEGORIES } from '../../data/mockData';
import { formatRupiah } from '../../services/storage';

export default function MenuEditorial({ products, onSelectProduct, onQuickAdd }) {
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [dietFilter, setDietFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8; // 8 items per page = 2 rows of 4 on desktop, 4 rows of 2 on tablet

  // Reset to page 1 whenever filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory, searchQuery, dietFilter]);

  const filtered = products.filter(p => {
    const matchCat = activeCategory === 'All' || p.kategori === activeCategory;
    const matchSearch = [p.nama, p.kanji, p.romaji, p.deskripsi].some(f =>
      String(f || '').toLowerCase().includes(searchQuery.toLowerCase())
    );
    let matchDiet = true;
    if (dietFilter === 'signature') matchDiet = p.unggulan;
    else if (dietFilter === 'spicy') matchDiet = (p.dietary || []).some(d => d.toLowerCase().includes('spicy'));
    else if (dietFilter === 'halal') matchDiet = (p.dietary || []).some(d => d.toLowerCase().includes('halal'));
    return matchCat && matchSearch && matchDiet;
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, filtered.length);
  const paginatedItems = filtered.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    const target = document.getElementById('menu-catalog');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section className="menu-editorial-sec" id="menu-catalog">
      <div className="container">
        {/* Minimalist Section Header */}
        <div className="menu-header-minimal">
          <div className="menu-header-left">
            <span className="eyebrow-minimal">THE MENU · お品書き</span>
            <h2 className="menu-title-minimal">
              Curated with <em>Precision.</em>
            </h2>
          </div>
          <p className="menu-desc-minimal">
            Small-batch Japanese favorites, prepared fresh to order with authentic seasonal ingredients.
          </p>
        </div>

        {/* Clean Filter Controls */}
        <div className="menu-controls-bar">
          {/* Category Tabs */}
          <div className="menu-categories-tabs" role="tablist">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                role="tab"
                aria-selected={activeCategory === cat}
                className={`menu-tab-btn ${activeCategory === cat ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Field */}
          <div className="menu-search-wrap">
            <span className="search-icon-inside" aria-hidden="true">🔍</span>
            <input
              type="text"
              placeholder="Search dishes or ingredients..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              aria-label="Cari menu"
            />
            {searchQuery && (
              <button className="search-clear-btn" onClick={() => setSearchQuery('')}>×</button>
            )}
          </div>
        </div>

        {/* Minimalist Subfilter Chips & Results Counter */}
        <div className="menu-subfilter-row">
          <div className="menu-subfilter-chips">
            <button
              className={`subfilter-chip ${dietFilter === 'all' ? 'active' : ''}`}
              onClick={() => setDietFilter('all')}
            >
              All Items ({filtered.length})
            </button>
            <button
              className={`subfilter-chip ${dietFilter === 'signature' ? 'active' : ''}`}
              onClick={() => setDietFilter('signature')}
            >
              ★ Chef's Choice
            </button>
            <button
              className={`subfilter-chip ${dietFilter === 'halal' ? 'active' : ''}`}
              onClick={() => setDietFilter('halal')}
            >
              🌿 Halal-Friendly
            </button>
            <button
              className={`subfilter-chip ${dietFilter === 'spicy' ? 'active' : ''}`}
              onClick={() => setDietFilter('spicy')}
            >
              🌶️ Spicy
            </button>
          </div>

          {filtered.length > 0 && (
            <div className="menu-pagination-indicator">
              Showing <strong>{startIndex + 1}–{endIndex}</strong> of <strong>{filtered.length}</strong> dishes
            </div>
          )}
        </div>

        {/* Clean Menu Grid (Inspired by i6.jpg & i1.jpg) */}
        {filtered.length === 0 ? (
          <div className="menu-empty-state">
            <p>No dishes found matching your selection.</p>
            <button
              className="menu-tab-btn active"
              onClick={() => { setActiveCategory('All'); setSearchQuery(''); setDietFilter('all'); }}
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <>
            <div className="editorial-cards-grid">
              {paginatedItems.map(item => (
                <article
                  key={item.id}
                  className="clean-food-card"
                  onClick={() => onSelectProduct(item)}
                >
                  <div className="card-top-canvas" style={{ backgroundColor: item.tone || '#ede8dd' }}>
                    <span className="card-bg-kanji">{item.kanji}</span>
                    <span className="card-emoji-icon" aria-hidden="true">{item.emoji || '🍱'}</span>
                    {item.unggulan && (
                      <span className="signature-seal">SIGNATURE</span>
                    )}
                    <span className="stock-counter-badge">
                      {item.stok > 0 ? `${item.stok} left` : 'Sold out'}
                    </span>
                  </div>

                  <div className="card-info-pane">
                    <div className="card-meta-line">
                      <span className="card-category-tag">{item.kategori}</span>
                      <span className="card-prep-time">{item.prepTime || '8-10 mins'}</span>
                    </div>

                    <h3 className="card-dish-name">{item.nama}</h3>
                    <p className="card-dish-desc">{item.deskripsi}</p>

                    <div className="card-bottom-bar">
                      <span className="card-dish-price">{formatRupiah(item.harga)}</span>
                      <button
                        className="clean-add-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          onQuickAdd(item);
                        }}
                        disabled={item.stok <= 0}
                      >
                        {item.stok <= 0 ? 'Habis' : '+ Add'}
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="editorial-pagination-bar">
                <button
                  className="page-nav-arrow"
                  onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  aria-label="Previous Page"
                >
                  ← Previous
                </button>

                <div className="page-numbers-track">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(num => (
                    <button
                      key={num}
                      className={`page-number-btn ${currentPage === num ? 'active' : ''}`}
                      onClick={() => handlePageChange(num)}
                      aria-label={`Go to page ${num}`}
                    >
                      {num < 10 ? `0${num}` : num}
                    </button>
                  ))}
                </div>

                <button
                  className="page-nav-arrow"
                  onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  aria-label="Next Page"
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
