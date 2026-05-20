import React from 'react';
import { ShoppingBag } from 'lucide-react';
import './Navbar.css';

export const Navbar = ({ cartItemCount, onOpenCart }) => {
  return (
    <nav className="navbar">
      <div className="container navbar-content">
        <div className="navbar-logo">
          <h1>La Bianka</h1>
        </div>
        <button className="cart-button" onClick={onOpenCart}>
          <ShoppingBag size={24} />
          {cartItemCount > 0 && (
            <span className="cart-badge">{cartItemCount}</span>
          )}
        </button>
      </div>
    </nav>
  );
};
