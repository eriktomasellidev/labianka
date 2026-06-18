import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../config/firebase';

const CATEGORIES_COLLECTION = 'categories';

export const getCategoriesFromFirebase = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, CATEGORIES_COLLECTION));
    const categories = [];
    querySnapshot.forEach((doc) => {
      categories.push({ id: doc.id, ...doc.data() });
    });
    return categories;
  } catch (error) {
    console.error("Error getting categories from Firebase: ", error);
    throw error;
  }
};

export const addCategoryToFirebase = async (categoryData) => {
  try {
    const docRef = await addDoc(collection(db, CATEGORIES_COLLECTION), categoryData);
    return { id: docRef.id, ...categoryData };
  } catch (error) {
    console.error("Error adding category to Firebase: ", error);
    throw error;
  }
};

export const updateCategoryInFirebase = async (id, categoryData) => {
  try {
    const categoryRef = doc(db, CATEGORIES_COLLECTION, id);
    await updateDoc(categoryRef, categoryData);
    return { id, ...categoryData };
  } catch (error) {
    console.error("Error updating category in Firebase: ", error);
    throw error;
  }
};

export const deleteCategoryFromFirebase = async (id) => {
  try {
    await deleteDoc(doc(db, CATEGORIES_COLLECTION, id));
    return id;
  } catch (error) {
    console.error("Error deleting category from Firebase: ", error);
    throw error;
  }
};
