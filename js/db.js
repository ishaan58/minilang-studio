import { db } from './firebase-config.js';
import { collection, doc, setDoc, getDoc, getDocs, updateDoc, deleteDoc, addDoc, query, orderBy, limit } from 'https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js';

// ══ DB (Firestore) ══
export const DB = {
  async ensureUser(uid, name, email) {
    const ref = doc(db, 'users', uid);
    const d = await getDoc(ref);
    if (!d.exists()) {
      await setDoc(ref, {
        name,
        email,
        created: new Date().toISOString(),
        onboarded: false
      }, { merge: true });
    }
  },

  async ob(uid) {
    const ref = doc(db, 'users', uid);
    const d = await getDoc(ref);
    return d.exists() && d.data().onboarded;
  },

  async setOb(uid) {
    const ref = doc(db, 'users', uid);
    await updateDoc(ref, { onboarded: true });
  },

  async projs(uid) {
    const q = query(collection(db, `users/${uid}/projects`), orderBy('created', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  },

  async saveProj(uid, p) {
    // p contains id, name, code, created
    const { id, ...data } = p;
    await setDoc(doc(db, `users/${uid}/projects`, id), data);
  },

  async deleteProj(uid, id) {
    await deleteDoc(doc(db, `users/${uid}/projects`, id));
  },

  async hist(uid) {
    const q = query(collection(db, `users/${uid}/history`), orderBy('t', 'desc'), limit(50));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  },

  async addHist(uid, entry) {
    await addDoc(collection(db, `users/${uid}/history`), entry);
  }
};
