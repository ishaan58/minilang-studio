import { auth } from './firebase-config.js';
import { DB } from './db.js';
import { AppState } from './state.js';
import { loadProjs } from './projects.js';
import { renderTuts } from './views.js';
import { startOb } from './onboard.js';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js';

// ══ AUTH ══

export function toLogin() {
  document.getElementById('aLogin').style.display = 'block';
  document.getElementById('aSignup').style.display = 'none';
}

export function toSignup() {
  document.getElementById('aLogin').style.display = 'none';
  document.getElementById('aSignup').style.display = 'block';
}

export function prefill() {
  document.getElementById('lemail').value = 'demo@minilang.dev';
  document.getElementById('lpass').value = 'demo1234';
}

export async function doLogin() {
  const e = document.getElementById('lemail').value.trim();
  const p = document.getElementById('lpass').value;
  const el = document.getElementById('lerr');
  
  try {
    const btn = document.querySelector('#aLogin .auth-btn');
    const oldText = btn.textContent;
    btn.textContent = 'Signing in...';
    btn.disabled = true;
    
    await signInWithEmailAndPassword(auth, e, p);
    
    btn.textContent = oldText;
    btn.disabled = false;
  } catch (err) {
    const btn = document.querySelector('#aLogin .auth-btn');
    btn.textContent = 'Sign in';
    btn.disabled = false;
    el.textContent = 'Invalid email or password.';
    el.style.display = 'block';
  }
}

export async function doSignup() {
  const n  = document.getElementById('sname').value.trim();
  const e  = document.getElementById('semail').value.trim();
  const p  = document.getElementById('spass').value;
  const el = document.getElementById('serr');

  if (!n || !e || !p) { el.textContent = 'All fields required.'; el.style.display = 'block'; return; }
  if (p.length < 6)   { el.textContent = 'Password must be at least 6 characters.'; el.style.display = 'block'; return; }

  try {
    const btn = document.querySelector('#aSignup .auth-btn');
    const oldText = btn.textContent;
    btn.textContent = 'Creating account...';
    btn.disabled = true;

    const cred = await createUserWithEmailAndPassword(auth, e, p);
    const user = cred.user;
    
    await DB.ensureUser(user.uid, n, e);
    await DB.saveProj(user.uid, {
      id: 'p0',
      name: 'Hello World',
      code: `# ${n}'s first program\nlet name = "${n}"\nprint("Hello, " + name + "!")\nprint("Welcome to MiniLang Studio!")\n`,
      created: new Date().toISOString()
    });

    btn.textContent = oldText;
    btn.disabled = false;
  } catch (err) {
    const btn = document.querySelector('#aSignup .auth-btn');
    btn.textContent = 'Create account';
    btn.disabled = false;
    
    if (err.code === 'auth/email-already-in-use') {
      el.textContent = 'Email already registered.';
    } else {
      el.textContent = err.message;
    }
    el.style.display = 'block';
  }
}

export async function doLogout() {
  await signOut(auth);
}

export async function boot(userRecord) {
  AppState.CU = userRecord;
  document.getElementById('auth').style.display   = 'none';
  document.getElementById('topbar').style.display = 'flex';
  document.getElementById('app').style.display    = 'flex';
  document.getElementById('uname').textContent    = userRecord.name.split(' ')[0];
  document.getElementById('av').textContent       = userRecord.name[0].toUpperCase();
  
  await loadProjs();
  renderTuts();
  
  const onboarded = await DB.ob(userRecord.uid);
  if (!onboarded) startOb();
}

// Global auth listener
onAuthStateChanged(auth, async (user) => {
  if (user) {
    // User is signed in
    import('./firebase-config.js').then(async ({ db }) => {
      const { doc, getDoc } = await import('https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js');
      const docSnap = await getDoc(doc(db, 'users', user.uid));
      let name = user.email.split('@')[0];
      if (docSnap.exists()) {
        name = docSnap.data().name || name;
      }
      boot({ uid: user.uid, name, email: user.email });
    });
  } else {
    // User is signed out
    AppState.CU = null;
    document.getElementById('auth').style.display    = 'flex';
    document.getElementById('topbar').style.display  = 'none';
    document.getElementById('app').style.display     = 'none';
    document.getElementById('onboard').style.display = 'none';
    const lpass = document.getElementById('lpass');
    if(lpass) lpass.value = '';
  }
});
