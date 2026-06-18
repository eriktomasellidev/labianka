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
          <p>Av. Santa Fe 1234, CABA, Argentina</p>
          <div className="map-container">
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3284.1837424915664!2d-58.38927958423653!3d-34.59950798046039!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95bccac4985db6e1%3A0x6bba3c690bc02c81!2sAv.%20Sta.%20Fe%201234%2C%20C1059ABO%20Cdad.%20Aut%C3%B3noma%20de%20Buenos%20Aires!5e0!3m2!1ses-419!2sar!4v1683050942504!5m2!1ses-419!2sar" 
              width="100%" 
              height="350" 
              style={{ border: 0 }} 
              allowFullScreen="" 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
              title="Mapa de Ubicación La Bianka"
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
