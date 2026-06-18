import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProductsFromFirebase, addProductToFirebase, updateProductInFirebase, deleteProductFromFirebase, transformDriveUrl } from '../services/productService';
import { getCategoriesFromFirebase, addCategoryToFirebase, updateCategoryInFirebase, deleteCategoryFromFirebase } from '../services/categoryService';
import { fetchProducts as fetchProductsFromSheets } from '../utils/sheets';
import { auth } from '../config/firebase';
import { signOut } from 'firebase/auth';
import './AdminPanel.css';
import { Settings, Plus, Edit2, Trash2, Save, X, RefreshCw, LogOut, Package, Tags } from 'lucide-react';

export const AdminPanel = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('products'); // 'products' or 'categories'
  
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [migrating, setMigrating] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  
  const [currentProduct, setCurrentProduct] = useState(null);
  const [currentCategory, setCurrentCategory] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    image: '',
    additionalImages: '',
    category: '',
    description: '',
    sizes: '',
    colors: '',
    measurements: '',
    stock: ''
  });

  const [categoryFormData, setCategoryFormData] = useState({
    name: '',
    description: ''
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [productsData, categoriesData] = await Promise.all([
        getProductsFromFirebase(),
        getCategoriesFromFirebase()
      ]);
      setProducts(productsData);
      setCategories(categoriesData);
      setError(null);
    } catch (err) {
      console.error("Error loading data:", err);
      setError("Error al cargar los datos desde Firebase.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login');
  };

  // --- PRODUCTS LOGIC ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = async (e, field) => {
    const file = e.target.files[0];
    if (!file) return;

    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      alert("Por favor, configura las variables de Cloudinary en tu archivo .env");
      return;
    }

    setUploadingImage(true);
    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", uploadPreset);

    try {
      const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: "POST",
        body: data,
      });
      const result = await response.json();
      
      if (result.secure_url) {
        if (field === 'image') {
          setFormData(prev => ({ ...prev, image: result.secure_url }));
        } else if (field === 'additionalImages') {
          setFormData(prev => ({ 
            ...prev, 
            additionalImages: prev.additionalImages ? `${prev.additionalImages}, ${result.secure_url}` : result.secure_url 
          }));
        }
      } else {
        alert("Error al subir la imagen: " + (result.error?.message || 'Desconocido'));
      }
    } catch (err) {
      console.error("Upload error:", err);
      alert("Error al conectar con Cloudinary.");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleEditProduct = (product) => {
    setFormData({
      id: product.id,
      name: product.name || '',
      price: product.price || '',
      image: product.imageOriginal || product.image || '',
      additionalImages: product.additionalImagesOriginal || (Array.isArray(product.additionalImages) ? product.additionalImages.join(', ') : ''),
      category: product.category || '',
      description: product.description || '',
      sizes: Array.isArray(product.sizes) ? product.sizes.join(', ') : (product.sizes || ''),
      colors: Array.isArray(product.colors) ? product.colors.join(', ') : (product.colors || ''),
      measurements: product.measurements || '',
      stock: product.stock !== undefined ? product.stock : ''
    });
    setCurrentProduct(product);
    setIsEditing(true);
  };

  const handleAddNewProduct = () => {
    setFormData({
      name: '', price: '', image: '', additionalImages: '', category: categories.length > 0 ? categories[0].name : '', 
      description: '', sizes: '', colors: '', measurements: '', stock: ''
    });
    setCurrentProduct(null);
    setIsEditing(true);
  };

  const handleDeleteProduct = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este producto?')) {
      try {
        setLoading(true);
        await deleteProductFromFirebase(id);
        await loadData();
      } catch (err) {
        setError("Error al eliminar producto");
        setLoading(false);
      }
    }
  };

  const handleSubmitProduct = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const processedData = {
        name: formData.name,
        price: parseFloat(formData.price) || 0,
        imageOriginal: formData.image,
        image: transformDriveUrl(formData.image.trim()),
        additionalImagesOriginal: formData.additionalImages,
        additionalImages: formData.additionalImages 
          ? formData.additionalImages.split(',').map(url => transformDriveUrl(url.trim())).filter(Boolean)
          : [],
        category: formData.category,
        description: formData.description,
        sizes: formData.sizes ? formData.sizes.split(',').map(s => s.trim()).filter(Boolean) : [],
        colors: formData.colors ? formData.colors.split(',').map(c => c.trim()).filter(Boolean) : [],
        measurements: formData.measurements,
        stock: parseInt(formData.stock, 10) || 0,
      };

      if (currentProduct && currentProduct.id) {
        await updateProductInFirebase(currentProduct.id, processedData);
      } else {
        await addProductToFirebase(processedData);
      }
      
      setIsEditing(false);
      setCurrentProduct(null);
      await loadData();
    } catch (err) {
      setError("Error al guardar producto");
      setLoading(false);
    }
  };

  // --- CATEGORIES LOGIC ---
  const handleCategoryInputChange = (e) => {
    const { name, value } = e.target;
    setCategoryFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEditCategory = (category) => {
    setCategoryFormData({
      id: category.id,
      name: category.name || '',
      description: category.description || ''
    });
    setCurrentCategory(category);
    setIsEditing(true);
  };

  const handleAddNewCategory = () => {
    setCategoryFormData({ name: '', description: '' });
    setCurrentCategory(null);
    setIsEditing(true);
  };

  const handleDeleteCategory = async (id) => {
    if (window.confirm('¿Eliminar esta categoría? Los productos asociados podrían quedar sin categoría.')) {
      try {
        setLoading(true);
        await deleteCategoryFromFirebase(id);
        await loadData();
      } catch (err) {
        setError("Error al eliminar categoría");
        setLoading(false);
      }
    }
  };

  const handleSubmitCategory = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (currentCategory && currentCategory.id) {
        await updateCategoryInFirebase(currentCategory.id, categoryFormData);
      } else {
        await addCategoryToFirebase(categoryFormData);
      }
      setIsEditing(false);
      setCurrentCategory(null);
      await loadData();
    } catch (err) {
      setError("Error al guardar categoría");
      setLoading(false);
    }
  };

  // --- MIGRATION LOGIC ---
  const handleMigrate = async () => {
    if (!window.confirm("Esto leerá todos los productos del Google Sheet y los agregará a Firebase. ¿Continuar?")) return;
    
    setMigrating(true);
    setError(null);
    try {
      const sheetsProducts = await fetchProductsFromSheets();
      
      let count = 0;
      for (const p of sheetsProducts) {
        const productData = {
          name: p.name, price: p.price, image: p.image, additionalImages: p.additionalImages,
          category: p.category, description: p.description, sizes: p.sizes, colors: p.colors,
          measurements: p.measurements, stock: p.stock,
        };
        await addProductToFirebase(productData);
        count++;
      }
      alert(`Migración completada. ${count} productos importados.`);
      await loadData();
    } catch (err) {
      console.error(err);
      setError("Error durante la migración desde Google Sheets.");
    } finally {
      setMigrating(false);
    }
  };

  const handleGenerateCategories = async () => {
    if (!window.confirm("Se extraerán las categorías únicas de los productos actuales y se crearán. ¿Continuar?")) return;
    
    setLoading(true);
    try {
      const uniqueCats = [...new Set(products.map(p => p.category).filter(Boolean))];
      const existingCats = categories.map(c => c.name);
      
      let count = 0;
      for (const catName of uniqueCats) {
        if (!existingCats.includes(catName)) {
          await addCategoryToFirebase({ name: catName, description: '' });
          count++;
        }
      }
      alert(`${count} categorías generadas exitosamente.`);
      await loadData();
    } catch (err) {
      console.error(err);
      setError("Error al generar categorías.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-page">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <Settings size={24} />
          <h2>Panel Admin</h2>
        </div>
        <nav className="admin-nav">
          <button 
            className={`admin-nav-item ${activeTab === 'products' ? 'active' : ''}`}
            onClick={() => { setActiveTab('products'); setIsEditing(false); }}
          >
            <Package size={18} /> Productos
          </button>
          <button 
            className={`admin-nav-item ${activeTab === 'categories' ? 'active' : ''}`}
            onClick={() => { setActiveTab('categories'); setIsEditing(false); }}
          >
            <Tags size={18} /> Categorías
          </button>
        </nav>
        <div className="admin-sidebar-footer">
          <button onClick={handleLogout} className="btn-logout">
            <LogOut size={18} /> Cerrar Sesión
          </button>
          <button onClick={() => navigate('/')} className="btn-store">
            Ir a la tienda
          </button>
        </div>
      </aside>

      <main className="admin-main">
        <header className="admin-header">
          <h2>{activeTab === 'products' ? 'Gestión de Productos' : 'Gestión de Categorías'}</h2>
        </header>

        <div className="admin-content">
          {error && <div className="admin-error">{error}</div>}

          {!isEditing ? (
            <>
              <div className="admin-toolbar">
                <button onClick={activeTab === 'products' ? handleAddNewProduct : handleAddNewCategory} className="btn-primary" disabled={loading}>
                  <Plus size={18} /> Nuevo {activeTab === 'products' ? 'Producto' : 'Categoría'}
                </button>
                
                {activeTab === 'products' && (
                  <button onClick={handleMigrate} className="btn-secondary" disabled={loading || migrating} title="Importar desde Sheets">
                    <RefreshCw size={18} className={migrating ? 'spinning' : ''} />
                    {migrating ? 'Migrando...' : 'Migrar desde Sheets'}
                  </button>
                )}

                {activeTab === 'categories' && (
                  <button onClick={handleGenerateCategories} className="btn-secondary" disabled={loading}>
                    Generar desde Productos
                  </button>
                )}
              </div>

              {loading && !migrating ? (
                <div className="admin-loading">Cargando datos...</div>
              ) : (
                <div className="admin-table-container">
                  {activeTab === 'products' ? (
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Imagen</th><th>Nombre</th><th>Categoría</th><th>Precio</th><th>Stock</th><th>Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {products.length === 0 ? (
                          <tr><td colSpan="6" className="admin-empty">No hay productos.</td></tr>
                        ) : (
                          products.map(product => (
                            <tr key={product.id}>
                              <td>
                                {product.image ? <img src={product.image} alt={product.name} className="admin-thumb" /> : <div className="admin-thumb-placeholder">Sin Img</div>}
                              </td>
                              <td>{product.name}</td>
                              <td>{product.category}</td>
                              <td>${product.price}</td>
                              <td><span className={`stock-badge ${product.stock > 0 ? 'stock-ok' : 'stock-out'}`}>{product.stock}</span></td>
                              <td>
                                <div className="admin-actions">
                                  <button onClick={() => handleEditProduct(product)} className="btn-icon edit" title="Editar"><Edit2 size={16} /></button>
                                  <button onClick={() => handleDeleteProduct(product.id)} className="btn-icon delete" title="Eliminar"><Trash2 size={16} /></button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  ) : (
                    <table className="admin-table">
                      <thead>
                        <tr><th>Nombre</th><th>Descripción</th><th>Acciones</th></tr>
                      </thead>
                      <tbody>
                        {categories.length === 0 ? (
                          <tr><td colSpan="3" className="admin-empty">No hay categorías.</td></tr>
                        ) : (
                          categories.map(category => (
                            <tr key={category.id}>
                              <td>{category.name}</td>
                              <td>{category.description}</td>
                              <td>
                                <div className="admin-actions">
                                  <button onClick={() => handleEditCategory(category)} className="btn-icon edit" title="Editar"><Edit2 size={16} /></button>
                                  <button onClick={() => handleDeleteCategory(category.id)} className="btn-icon delete" title="Eliminar"><Trash2 size={16} /></button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="admin-form-container">
              <div className="form-header">
                <h3>
                  {activeTab === 'products' 
                    ? (currentProduct ? 'Editar Producto' : 'Nuevo Producto') 
                    : (currentCategory ? 'Editar Categoría' : 'Nueva Categoría')}
                </h3>
                <button onClick={() => setIsEditing(false)} className="btn-icon" title="Cancelar"><X size={20} /></button>
              </div>

              {activeTab === 'products' ? (
                <form onSubmit={handleSubmitProduct} className="admin-form">
                  <div className="form-row">
                    <div className="form-group">
                      <label>Nombre del Producto *</label>
                      <input type="text" name="name" value={formData.name} onChange={handleInputChange} required />
                    </div>
                    <div className="form-group">
                      <label>Precio *</label>
                      <input type="number" name="price" value={formData.price} onChange={handleInputChange} required min="0" step="0.01" />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Categoría *</label>
                      <select name="category" value={formData.category} onChange={handleInputChange} required>
                        <option value="">Selecciona una categoría...</option>
                        {categories.map(cat => (
                          <option key={cat.id} value={cat.name}>{cat.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Stock *</label>
                      <input type="number" name="stock" value={formData.stock} onChange={handleInputChange} required min="0" />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>URL Imagen Principal o Subir Archivo</label>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                      <input type="text" name="image" value={formData.image} onChange={handleInputChange} placeholder="URL de la imagen" style={{ flex: 1 }} />
                      <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'image')} style={{ display: 'none' }} id="file-upload-main" />
                      <label htmlFor="file-upload-main" className="btn-secondary" style={{ cursor: 'pointer', margin: 0, padding: '0.75rem 1rem' }}>
                        {uploadingImage ? 'Subiendo...' : 'Subir Imagen'}
                      </label>
                    </div>
                    {formData.image && <img src={formData.image} alt="Preview" style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '4px', marginTop: '0.5rem' }} />}
                  </div>

                  <div className="form-group">
                    <label>Imágenes Adicionales (Separadas por coma) o Subir Archivo</label>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                      <input type="text" name="additionalImages" value={formData.additionalImages} onChange={handleInputChange} style={{ flex: 1 }} />
                      <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'additionalImages')} style={{ display: 'none' }} id="file-upload-add" />
                      <label htmlFor="file-upload-add" className="btn-secondary" style={{ cursor: 'pointer', margin: 0, padding: '0.75rem 1rem' }}>
                        {uploadingImage ? 'Subiendo...' : 'Añadir Imagen'}
                      </label>
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Talles (Separados por coma: S, M, L)</label>
                      <input type="text" name="sizes" value={formData.sizes} onChange={handleInputChange} />
                    </div>
                    <div className="form-group">
                      <label>Colores (Separados por coma: Rojo, Azul)</label>
                      <input type="text" name="colors" value={formData.colors} onChange={handleInputChange} />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Descripción</label>
                    <textarea name="description" value={formData.description} onChange={handleInputChange} rows="3"></textarea>
                  </div>

                  <div className="form-group">
                    <label>Medidas (Texto descriptivo)</label>
                    <textarea name="measurements" value={formData.measurements} onChange={handleInputChange} rows="2"></textarea>
                  </div>

                  <div className="form-actions">
                    <button type="button" onClick={() => setIsEditing(false)} className="btn-secondary">Cancelar</button>
                    <button type="submit" className="btn-primary" disabled={loading || uploadingImage}><Save size={18} /> {loading ? 'Guardando...' : 'Guardar Producto'}</button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleSubmitCategory} className="admin-form">
                  <div className="form-group">
                    <label>Nombre de la Categoría *</label>
                    <input type="text" name="name" value={categoryFormData.name} onChange={handleCategoryInputChange} required />
                  </div>
                  <div className="form-group">
                    <label>Descripción</label>
                    <textarea name="description" value={categoryFormData.description} onChange={handleCategoryInputChange} rows="3"></textarea>
                  </div>
                  <div className="form-actions">
                    <button type="button" onClick={() => setIsEditing(false)} className="btn-secondary">Cancelar</button>
                    <button type="submit" className="btn-primary" disabled={loading}><Save size={18} /> {loading ? 'Guardando...' : 'Guardar Categoría'}</button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
