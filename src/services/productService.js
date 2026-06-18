import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

const PRODUCTS_COLLECTION = 'products';

// Helper para transformar Drive URLs (reutilizado de sheets.js)
export const transformDriveUrl = (url) => {
  if (!url) return '';
  let fileId = null;
  const matchFileD = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (matchFileD && matchFileD[1]) {
    fileId = matchFileD[1];
  } else {
    const matchId = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (matchId && matchId[1]) {
      fileId = matchId[1];
    }
  }
  if (fileId) {
    return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`;
  }
  return url;
};

export const getProductsFromFirebase = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, PRODUCTS_COLLECTION));
    const products = [];
    querySnapshot.forEach((doc) => {
      products.push({ id: doc.id, ...doc.data() });
    });
    return products;
  } catch (error) {
    console.error("Error getting products from Firebase: ", error);
    throw error;
  }
};

export const addProductToFirebase = async (productData) => {
  try {
    const docRef = await addDoc(collection(db, PRODUCTS_COLLECTION), productData);
    return { id: docRef.id, ...productData };
  } catch (error) {
    console.error("Error adding product to Firebase: ", error);
    throw error;
  }
};

export const updateProductInFirebase = async (id, productData) => {
  try {
    const productRef = doc(db, PRODUCTS_COLLECTION, id);
    await updateDoc(productRef, productData);
    return { id, ...productData };
  } catch (error) {
    console.error("Error updating product in Firebase: ", error);
    throw error;
  }
};

export const deleteProductFromFirebase = async (id) => {
  try {
    await deleteDoc(doc(db, PRODUCTS_COLLECTION, id));
    return id;
  } catch (error) {
    console.error("Error deleting product from Firebase: ", error);
    throw error;
  }
};
