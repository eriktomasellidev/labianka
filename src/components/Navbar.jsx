import React from 'react';
import { ShoppingBag } from 'lucide-react';
import laBiankaLogo from '../assets/labianka-logo.png';
import './Navbar.css';

export const Navbar = ({ cartItemCount, onOpenCart }) => {
  return (
    <nav className="navbar">
      <div className="container navbar-content">
        <div className="navbar-logo">
          <img src={laBiankaLogo} alt="La Bianka" className="navbar-logo-img" />
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
