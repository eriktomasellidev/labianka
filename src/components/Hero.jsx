import React from 'react';
import './Hero.css';

export const Hero = () => {
  return (
    <section className="hero">
      <div className="hero-overlay"></div>
      <div className="hero-content">
        <span className="hero-subtitle">Descubre la Nueva Temporada</span>
        <h1 className="hero-title">Colección La Bianka</h1>
        <p className="hero-description">
          Prendas diseñadas para resaltar tu elegancia natural. 
          Encuentra tu estilo único con nuestra selección exclusiva.
        </p>
        <button className="hero-cta" onClick={() => {
          document.getElementById('catalog').scrollIntoView({ behavior: 'smooth' });
        }}>
          Ver Colección
        </button>
      </div>
    </section>
  );
};
