import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/src/config/firebase';
import { Comunidade, Time } from '@/src/types';

export class FirebaseService {

  static async addComunidade(comunidade: Omit<Comunidade, 'id'>) {
    const docRef = await addDoc(collection(db, 'comunidades'), comunidade);
    return docRef.id;
  }

  static async getComunidades(): Promise<Comunidade[]> {
    const querySnapshot = await getDocs(collection(db, 'comunidades'));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Comunidade));
  }

  static async updateComunidade(id: string, data: Partial<Comunidade>) {
    const docRef = doc(db, 'comunidades', id);
    await updateDoc(docRef, data);
  }

  static async deleteComunidade(id: string) {
    await deleteDoc(doc(db, 'comunidades', id));
  }


  static async addTime(time: Omit<Time, 'id'>) {
    const docRef = await addDoc(collection(db, 'times'), time);
    return docRef.id;
  }

  static async getTimes(): Promise<Time[]> {
    const querySnapshot = await getDocs(collection(db, 'times'));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Time));
  }

  static async updateTime(id: string, data: Partial<Time>) {
    const docRef = doc(db, 'times', id);
    await updateDoc(docRef, data);
  }

  static async deleteTime(id: string) {
    await deleteDoc(doc(db, 'times', id));
  }
}