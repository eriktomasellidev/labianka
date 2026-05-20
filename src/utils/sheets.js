import Papa from 'papaparse';

// Obtiene la URL de la hoja de Google Sheets de las variables de entorno, o usa el archivo local por defecto
const CSV_URL = import.meta.env.VITE_GOOGLE_SHEET_URL;

// Helper function to convert standard Google Drive links to direct image links
const transformDriveUrl = (url) => {
  if (!url) return '';

  let fileId = null;

  // Match standard Google Drive share links: /file/d/ID/view
  const matchFileD = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (matchFileD && matchFileD[1]) {
    fileId = matchFileD[1];
  } else {
    // Match links with id=... (e.g., /open?id=ID)
    const matchId = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (matchId && matchId[1]) {
      fileId = matchId[1];
    }
  }

  if (fileId) {
    // Usar la API de thumbnail que es más compatible con navegadores modernos
    return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`;
  }

  return url;
};

export const fetchProducts = () => {
  const cacheBusterUrl = `${CSV_URL}${CSV_URL.includes('?') ? '&' : '?'}t=${new Date().getTime()}`;
  return new Promise((resolve, reject) => {
    Papa.parse(cacheBusterUrl, {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        // Transform and clean up the data if needed
        const products = results.data.map((item) => {
          // Si el usuario pone múltiples enlaces en la columna principal separados por coma
          const allImagesFromMain = item.Imagen_URL 
            ? item.Imagen_URL.split(',').map(url => transformDriveUrl(url.trim())).filter(Boolean) 
            : [];
          const mainImage = allImagesFromMain.length > 0 ? allImagesFromMain[0] : '';
          const extraFromMain = allImagesFromMain.slice(1);

          // Parse additional images if they exist
          const extraFromAdd = item.Imagenes_Adicionales
            ? item.Imagenes_Adicionales.split(',').map(url => transformDriveUrl(url.trim())).filter(Boolean)
            : [];
            
          const additionalImages = [...extraFromMain, ...extraFromAdd];

          return {
            id: item.ID,
            name: item.Nombre,
            price: parseFloat(item.Precio) || 0,
            image: mainImage,
            additionalImages: additionalImages,
            category: item.Categoria,
            description: item.Descripcion,
            sizes: item.Talles ? item.Talles.split(',').map(s => s.trim()).filter(Boolean) : [],
            colors: item.Colores ? item.Colores.split(',').map(c => c.trim()).filter(Boolean) : [],
            measurements: item.Medidas || '',
            stock: item.Stock ? parseInt(item.Stock, 10) : 0,
          };
        });
        resolve(products);
      },
      error: (error) => {
        reject(error);
      },
    });
  });
};
