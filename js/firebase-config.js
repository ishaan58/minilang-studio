// ══ FIREBASE INIT ══
import { initializeApp }  from 'https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js';
import { getAuth }        from 'https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js';
import { getFirestore }   from 'https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js';

const firebaseConfig = {
  apiKey:            'AIzaSyCsVf8XvG-NEe12hg3ML23RqMfpGUMPf2c',
  authDomain:        'minilang-studio.firebaseapp.com',
  projectId:         'minilang-studio',
  storageBucket:     'minilang-studio.firebasestorage.app',
  messagingSenderId: '390912860377',
  appId:             '1:390912860377:web:cef6b5ce8de6060e4c9ec8',
  measurementId:     'G-Z359XSHTNB',
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db   = getFirestore(app);
