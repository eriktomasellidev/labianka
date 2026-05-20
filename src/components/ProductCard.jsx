import React from 'react';
import './ProductCard.css';

export const ProductCard = ({ product, onView }) => {
  return (
    <div className="product-card">
      <div className="product-image-container" onClick={() => onView(product)} style={{ cursor: 'pointer' }}>
        <img src={product.image} alt={product.name} className="product-image" loading="lazy" />
      </div>
      <div className="product-info">
        <p className="product-category">{product.category}</p>
        <h3 className="product-name" onClick={() => onView(product)} style={{ cursor: 'pointer' }}>{product.name}</h3>
        <p className="product-price">${product.price.toLocaleString('es-AR')}</p>
        <button className="add-button" onClick={() => onView(product)}>
          Ver producto
        </button>
      </div>
    </div>
  );
};
