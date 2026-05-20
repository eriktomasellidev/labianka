import React from 'react';
import './Categories.css';

export const Categories = ({ categories, selectedCategory, onSelectCategory }) => {
  if (!categories || categories.length === 0) return null;

  return (
    <section className="categories-section">
      <div className="container">
        <h3 className="categories-title">Explorar por Categoría</h3>
        <div className="categories-list">
          {categories.map((category, index) => (
            <button
              key={index}
              className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
              onClick={() => onSelectCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};
