import React from 'react';
import { X, Plus, Minus } from 'lucide-react';
import { generateWhatsAppLink } from '../utils/whatsapp';
import './Cart.css';

export const Cart = ({ isOpen, onClose, cartItems, updateQuantity, removeItem }) => {
  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleCheckout = () => {
    if (cartItems.length === 0) return;
    const url = generateWhatsAppLink(cartItems, total);
    window.open(url, '_blank');
  };

  return (
    <>
      <div className={`cart-overlay ${isOpen ? 'open' : ''}`} onClick={onClose} />
      <div className={`cart-drawer ${isOpen ? 'open' : ''}`}>
        <div className="cart-header">
          <h2>Tu Carrito</h2>
          <button onClick={onClose} className="close-button" aria-label="Cerrar">
            <X size={24} />
          </button>
        </div>

        <div className="cart-items">
          {cartItems.length === 0 ? (
            <p className="empty-cart">Tu carrito está vacío.</p>
          ) : (
            cartItems.map((item) => (
              <div key={item.variantId} className="cart-item">
                <img src={item.image} alt={item.name} className="cart-item-image" />
                <div className="cart-item-details">
                  <h4>{item.name}</h4>
                  {(item.selectedSize || item.selectedColor) && (
                    <p className="cart-item-variant">
                      {item.selectedSize && `Talle: ${item.selectedSize}`}
                      {item.selectedSize && item.selectedColor && ' | '}
                      {item.selectedColor && `Color: ${item.selectedColor}`}
                    </p>
                  )}
                  <p className="cart-item-price">${item.price.toLocaleString('es-AR')}</p>
                  <div className="cart-item-actions">
                    <div className="quantity-controls">
                      <button onClick={() => updateQuantity(item.variantId, item.quantity - 1)}><Minus size={16}/></button>
                      <span>{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.variantId, item.quantity + 1)}><Plus size={16}/></button>
                    </div>
                    <button className="remove-button" onClick={() => removeItem(item.variantId)}>
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="cart-footer">
          <div className="cart-total">
            <span>Total:</span>
            <span>${total.toLocaleString('es-AR')}</span>
          </div>
          <button 
            className="checkout-button" 
            onClick={handleCheckout}
            disabled={cartItems.length === 0}
          >
            Comprar por WhatsApp
          </button>
        </div>
      </div>
    </>
  );
};
