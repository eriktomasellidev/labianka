import React, { useState, useEffect } from 'react';
import './ProductModal.css';

export const ProductModal = ({ product, onClose, onAdd }) => {
  if (!product) return null;

  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [currentImage, setCurrentImage] = useState(product.image);

  // Reset state when product changes
  useEffect(() => {
    if (product) {
      setSelectedSize(product.sizes && product.sizes.length === 1 ? product.sizes[0] : '');
      setSelectedColor(product.colors && product.colors.length === 1 ? product.colors[0] : '');
      setCurrentImage(product.image);
    }
  }, [product]);

  const allImages = [product.image, ...(product.additionalImages || [])];

  const handleAdd = () => {
    // Only require selection if options exist and are not already selected
    if (product.sizes?.length > 1 && !selectedSize) {
      alert("Por favor, selecciona un talle.");
      return;
    }
    if (product.colors?.length > 1 && !selectedColor) {
      alert("Por favor, selecciona un color.");
      return;
    }

    const variantProduct = {
      ...product,
      // If there's only one option, it was auto-selected. If none, pass empty string.
      selectedSize: selectedSize || (product.sizes?.length === 1 ? product.sizes[0] : ''),
      selectedColor: selectedColor || (product.colors?.length === 1 ? product.colors[0] : ''),
    };

    onAdd(variantProduct);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>&times;</button>
        
        <div className="modal-grid">
          <div className="modal-gallery">
            <div className="main-image-container">
              <img src={currentImage} alt={product.name} className="main-image" />
            </div>
            
            {allImages.length > 1 && (
              <div className="thumbnails-container">
                {allImages.map((img, idx) => (
                  <img 
                    key={idx} 
                    src={img} 
                    alt={`${product.name} vista ${idx + 1}`} 
                    className={`thumbnail ${currentImage === img ? 'active' : ''}`}
                    onClick={() => setCurrentImage(img)}
                  />
                ))}
              </div>
            )}
          </div>
          
          <div className="modal-info">
            <p className="modal-category">{product.category}</p>
            <h2 className="modal-title">{product.name}</h2>
            <p className="modal-price">${product.price.toLocaleString('es-AR')}</p>
            
            <div className="modal-description">
              <p>{product.description}</p>
            </div>

            {product.measurements && (
              <div className="modal-measurements">
                <strong>Medidas:</strong> {product.measurements}
              </div>
            )}

            {product.sizes && product.sizes.length > 0 && (
              <div className="modal-options">
                <h4>Talle:</h4>
                <div className="option-buttons">
                  {product.sizes.map(size => (
                    <button 
                      key={size}
                      className={`option-btn ${selectedSize === size ? 'selected' : ''}`}
                      onClick={() => setSelectedSize(size)}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {product.colors && product.colors.length > 0 && (
              <div className="modal-options">
                <h4>Color:</h4>
                <div className="option-buttons">
                  {product.colors.map(color => (
                    <button 
                      key={color}
                      className={`option-btn ${selectedColor === color ? 'selected' : ''}`}
                      onClick={() => setSelectedColor(color)}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button className="modal-add-btn" onClick={handleAdd}>
              Agregar al Carrito
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
