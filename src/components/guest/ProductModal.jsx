import React, { useState } from 'react';
import { formatRupiah } from '../../services/storage';

export default function ProductModal({ product, onClose, onAddToCart }) {
  const [qty, setQty] = useState(1);
  const [notes, setNotes] = useState('');

  if (!product) return null;

  const handleAdd = () => {
    onAddToCart(product.id, qty, notes);
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="clean-modal-card" onClick={e => e.stopPropagation()}>
        <div className="modal-card-top" style={{ backgroundColor: product.tone || '#ede8dd' }}>
          <button className="modal-close-icon" onClick={onClose}>×</button>
          <span className="modal-card-kanji">{product.kanji}</span>
          <span className="modal-card-art">{product.emoji || '🍱'}</span>
          {product.unggulan && <span className="modal-card-tag">CHEF'S SIGNATURE</span>}
        </div>

        <div className="modal-card-body">
          <div className="modal-card-title-row">
            <div>
              <span className="modal-card-category">{product.kategori}</span>
              <h3 className="modal-card-name">{product.nama}</h3>
              <span className="modal-card-romaji">{product.romaji || product.kanji}</span>
            </div>
            <div className="modal-card-price">{formatRupiah(product.harga)}</div>
          </div>

          <p className="modal-card-description">{product.deskripsi}</p>

          <div className="modal-card-specs">
            <div>
              <span>Preparation:</span>
              <strong>{product.prepTime || '8-10 mins'}</strong>
            </div>
            <div>
              <span>Availability:</span>
              <strong>{product.stok > 0 ? `${product.stok} portions available` : 'Sold out'}</strong>
            </div>
          </div>

          {product.allergens && product.allergens.length > 0 && (
            <div className="modal-allergens-row">
              <span>Allergens:</span>
              <div className="allergens-chips">
                {product.allergens.map((a, i) => (
                  <span key={i} className="allergen-pill">{a}</span>
                ))}
              </div>
            </div>
          )}

          <div className="modal-notes-field">
            <label>Special Instructions</label>
            <input
              type="text"
              placeholder="e.g. less salt, sauce on the side, no wasabi..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
            />
          </div>

          <div className="modal-actions-row">
            <div className="modal-stepper">
              <button onClick={() => setQty(Math.max(1, qty - 1))}>-</button>
              <span>{qty}</span>
              <button onClick={() => setQty(qty + 1)}>+</button>
            </div>
            <button
              className="modal-add-button"
              onClick={handleAdd}
              disabled={product.stok <= 0}
            >
              {product.stok <= 0 ? 'Out of Stock' : `Add to Order · ${formatRupiah(product.harga * qty)}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
