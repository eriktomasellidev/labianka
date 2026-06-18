import React, { useState, useEffect, useMemo } from 'react';
import { Navbar } from './Navbar';
import { Hero } from './Hero';
import { Categories } from './Categories';
import { ProductCard } from './ProductCard';
import { ProductModal } from './ProductModal';
import { Cart } from './Cart';
import { Footer } from './Footer';
import { fetchProducts } from '../utils/sheets';
import { getProductsFromFirebase } from '../services/productService';

export const Store = () => {
  const [products, setProducts] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [viewingProduct, setViewingProduct] = useState(null);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        let data;
        if (import.meta.env.VITE_FIREBASE_API_KEY) {
          try {
            data = await getProductsFromFirebase();
            if (data.length === 0) {
              data = await fetchProducts();
            }
          } catch (firebaseErr) {
            data = await fetchProducts();
          }
        } else {
          data = await fetchProducts();
        }

        setProducts(data.filter(p => p.stock > 0));
        setLoading(false);
      } catch (err) {
        console.error("Error loading products:", err);
        setError("No se pudieron cargar los productos. Por favor intenta más tarde.");
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  const categories = useMemo(() => {
    if (!products.length) return [];
    const uniqueCategories = new Set(products.map(p => p.category).filter(Boolean));
    return ['Todas', ...Array.from(uniqueCategories)];
  }, [products]);

  const filteredProducts = useMemo(() => {
    if (selectedCategory === 'Todas') return products;
    return products.filter(p => p.category === selectedCategory);
  }, [products, selectedCategory]);

  const addToCart = (productWithVariant) => {
    const variantId = `${productWithVariant.id}-${productWithVariant.selectedSize || 'none'}-${productWithVariant.selectedColor || 'none'}`;
    
    setCartItems(prev => {
      const existing = prev.find(item => item.variantId === variantId);
      if (existing) {
        return prev.map(item => 
          item.variantId === variantId ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...productWithVariant, variantId, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const updateQuantity = (variantId, newQuantity) => {
    if (newQuantity < 1) {
      removeItem(variantId);
      return;
    }
    setCartItems(prev => 
      prev.map(item => item.variantId === variantId ? { ...item, quantity: newQuantity } : item)
    );
  };

  const removeItem = (variantId) => {
    setCartItems(prev => prev.filter(item => item.variantId !== variantId));
  };

  const cartItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="app">
      <Navbar cartItemCount={cartItemCount} onOpenCart={() => setIsCartOpen(true)} />
      
      <Hero />

      <Categories 
        categories={categories} 
        selectedCategory={selectedCategory} 
        onSelectCategory={setSelectedCategory} 
      />

      <main className="container-wide main-content" id="catalog">
        <header className="catalog-header">
          <h2>{selectedCategory === 'Todas' ? 'Nuestra Colección' : `Colección ${selectedCategory}`}</h2>
          <p>Descubre nuestra selección de prendas pensadas para resaltar tu elegancia natural.</p>
        </header>

        {loading ? (
          <div className="loading">Cargando productos...</div>
        ) : error ? (
          <div className="error">{error}</div>
        ) : (
          <div className="product-grid">
            {filteredProducts.map(product => (
              <ProductCard key={product.id} product={product} onView={setViewingProduct} />
            ))}
            {filteredProducts.length === 0 && (
              <div className="no-products">
                No hay productos disponibles en esta categoría.
              </div>
            )}
          </div>
        )}
      </main>

      <ProductModal 
        product={viewingProduct} 
        onClose={() => setViewingProduct(null)} 
        onAdd={addToCart} 
      />

      <Cart 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        updateQuantity={updateQuantity}
        removeItem={removeItem}
      />

      <Footer />
    </div>
  );
};
