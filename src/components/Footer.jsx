import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';
import './Footer.css';

export const Footer = () => {
  const [clickCount, setClickCount] = useState(0);
  const navigate = useNavigate();

  const handleAdminClick = () => {
    const newCount = clickCount + 1;
    setClickCount(newCount);
    if (newCount >= 5) {
      setClickCount(0);
      navigate('/login');
    }
  };
  return (
    <footer className="footer">
      <div className="container-wide footer-content">
        <div className="footer-section">
          <h4>La Bianka</h4>
          <p>Tu estilo, nuestra pasión. Descubre la elegancia natural en cada prenda de nuestra colección exclusiva.</p>
        </div>
        
        <div className="footer-section">
          <h4>Contacto</h4>
          <p><strong>Teléfono:</strong> +54 11 1234-5678</p>
          <p><strong>Email:</strong> contacto@labianka.com</p>
          <p><strong>Horarios:</strong> Lunes a Sábados de 10:00 a 20:00 hs</p>
          <div className="social-links">
            <a href="#" aria-label="Instagram">Instagram</a>
            <a href="#" aria-label="Facebook">Facebook</a>
            <a href="#" aria-label="WhatsApp">WhatsApp</a>
          </div>
        </div>
        
        <div className="footer-section">
          <h4>Ubicación</h4>
          <p>Córdoba, Argentina</p>
          <div className="map-container">
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d109832.73432014483!2d-64.27441!3d-31.4201!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9432985f478f5b69%3A0xb0a24f9a5366b092!2sC%C3%B3rdoba%2C%20Argentina!5e0!3m2!1ses-419!2sar!4v1683050942504!5m2!1ses-419!2sar" 
              width="100%" 
              height="350" 
              style={{ border: 0 }} 
              allowFullScreen="" 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
              title="Mapa de Ubicación La Bianka - Córdoba"
            ></iframe>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <div className="container-wide">
          <p onClick={handleAdminClick} style={{ cursor: 'pointer', userSelect: 'none' }}>
            &copy; {new Date().getFullYear()} La Bianka. Todos los derechos reservados.
            <Lock size={12} style={{ opacity: 0.1, marginLeft: '8px', verticalAlign: 'middle' }} />
          </p>
        </div>
      </div>
    </footer>
  );
};
