import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc,
  query, 
  where,
  onSnapshot,
  DocumentData,
  QuerySnapshot,
  QueryDocumentSnapshot
} from 'firebase/firestore';
import { db } from '../firebaseConfig';

export const firestoreService = {
  // Set a document with a specific ID
  set: async (collectionName: string, id: string, data: any) => {
    try {
      await setDoc(doc(db, collectionName, id), data);
      return { id, ...data };
    } catch (error) {
      console.error(`Error setting document ${id} in ${collectionName}: `, error);
      throw error;
    }
  },

  // Add a document to a collection
  add: async (collectionName: string, data: any) => {
    try {
      const docRef = await addDoc(collection(db, collectionName), data);
      return { id: docRef.id, ...data };
    } catch (error) {
      console.error(`Error adding document to ${collectionName}: `, error);
      throw error;
    }
  },

  // Get all documents from a collection
  getAll: async (collectionName: string) => {
    try {
      const querySnapshot: QuerySnapshot<DocumentData> = await getDocs(collection(db, collectionName));
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error(`Error getting documents from ${collectionName}: `, error);
      throw error;
    }
  },

  // Get a single document by ID
  getById: async (collectionName: string, id: string) => {
    try {
      const docSnap = await getDoc(doc(db, collectionName, id));
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      } else {
        return null;
      }
    } catch (error) {
      console.error(`Error getting document ${id} from ${collectionName}: `, error);
      throw error;
    }
  },

  // Update a document
  update: async (collectionName: string, id: string, data: any) => {
    try {
      const docRef = doc(db, collectionName, id);
      await updateDoc(docRef, data);
      return { id, ...data };
    } catch (error) {
      console.error(`Error updating document ${id} in ${collectionName}: `, error);
      throw error;
    }
  },

  // Delete a document
  delete: async (collectionName: string, id: string) => {
    try {
      await deleteDoc(doc(db, collectionName, id));
      return id;
    } catch (error) {
      console.error(`Error deleting document ${id} from ${collectionName}: `, error);
      throw error;
    }
  },

  // Query documents with a filter
  query: async (collectionName: string, field: string, operator: any, value: any) => {
    try {
      const q = query(collection(db, collectionName), where(field, operator, value));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error(`Error querying ${collectionName}: `, error);
      throw error;
    }
  },

  // Listen to changes in a query
  listen: (collectionName: string, field: string, operator: any, value: any, callback: (data: any[]) => void) => {
    const q = query(collection(db, collectionName), where(field, operator, value));
    return onSnapshot(q, (querySnapshot) => {
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback(data);
    }, (error) => {
      console.error(`Error listening to ${collectionName}: `, error);
    });
  }
};
