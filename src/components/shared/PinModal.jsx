import React, { useState } from 'react';

export default function PinModal({ targetRole, onClose, onSuccess }) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  const expectedPin = targetRole === 'admin' ? '1234' : '1111';
  const roleName = targetRole === 'admin' ? 'Admin Manajer' : 'Kasir POS';

  const handleSubmit = (e) => {
    e.preventDefault();
    if (pin === expectedPin) {
      onSuccess(targetRole);
    } else {
      setError(`PIN salah! Gunakan PIN default "${expectedPin}" untuk demo.`);
    }
  };

  const handleBypass = () => {
    onSuccess(targetRole);
  };

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="clean-modal-card pin-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header-simple">
          <h3>Autentikasi Akses {roleName}</h3>
          <button onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="pin-modal-body">
          <p className="pin-guide">
            Masukkan PIN keamanan untuk beralih ke peran {roleName}.
          </p>

          <input
            type="password"
            maxLength={6}
            className="pin-big-input"
            placeholder="••••"
            value={pin}
            onChange={e => {
              setPin(e.target.value);
              setError('');
            }}
            autoFocus
          />

          {error && <div className="pin-error-msg">{error}</div>}

          <div className="pin-hint-box">
            <span>* Demo Shortcut: PIN default adalah <strong>{expectedPin}</strong>, atau klik "Masuk Langsung" untuk bypass.</span>
          </div>

          <div className="pin-modal-buttons">
            <button type="button" className="btn-bypass-pin" onClick={handleBypass}>
              Masuk Langsung (Demo)
            </button>
            <button type="submit" className="btn-submit-pin">
              Verifikasi PIN
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
