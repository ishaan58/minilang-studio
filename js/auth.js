// ══ AUTH ══
let CU = null;

function toLogin() {
  document.getElementById('aLogin').style.display = 'block';
  document.getElementById('aSignup').style.display = 'none';
}

function toSignup() {
  document.getElementById('aLogin').style.display = 'none';
  document.getElementById('aSignup').style.display = 'block';
}

function prefill() {
  document.getElementById('lemail').value = 'demo@minilang.dev';
  document.getElementById('lpass').value = 'demo1234';
}

function doLogin() {
  const e = document.getElementById('lemail').value.trim();
  const p = document.getElementById('lpass').value;
  const u = DB.users().find(x => x.email === e);
  if (!u || u.password !== p) {
    const el = document.getElementById('lerr');
    el.textContent = 'Invalid email or password.';
    el.style.display = 'block';
    return;
  }
  DB.saveSess({ id: u.id, name: u.name, email: u.email });
  boot(u);
}

function doSignup() {
  const n  = document.getElementById('sname').value.trim();
  const e  = document.getElementById('semail').value.trim();
  const p  = document.getElementById('spass').value;
  const el = document.getElementById('serr');

  if (!n || !e || !p) { el.textContent = 'All fields required.'; el.style.display = 'block'; return; }
  if (p.length < 6)   { el.textContent = 'Password must be at least 6 characters.'; el.style.display = 'block'; return; }

  const u = DB.users();
  if (u.find(x => x.email === e)) { el.textContent = 'Email already registered.'; el.style.display = 'block'; return; }

  const nu = { id: 'u' + Date.now(), name: n, email: e, password: p, created: new Date().toISOString() };
  u.push(nu);
  DB.saveUsers(u);
  DB.saveProjs(nu.id, [{
    id: 'p0', name: 'Hello World',
    code: `# ${n}'s first program\nlet name = "${n}"\nprint("Hello, " + name + "!")\nprint("Welcome to MiniLang Studio!")\n`,
    created: new Date().toISOString()
  }]);
  DB.saveSess({ id: nu.id, name: nu.name, email: nu.email });
  boot(nu);
}

function doLogout() {
  DB.clearSess();
  CU = null;
  document.getElementById('auth').style.display    = 'flex';
  document.getElementById('topbar').style.display  = 'none';
  document.getElementById('app').style.display     = 'none';
  document.getElementById('onboard').style.display = 'none';
  document.getElementById('lpass').value = '';
}

function boot(u) {
  CU = u;
  document.getElementById('auth').style.display   = 'none';
  document.getElementById('topbar').style.display = 'flex';
  document.getElementById('app').style.display    = 'flex';
  document.getElementById('uname').textContent    = u.name.split(' ')[0];
  document.getElementById('av').textContent       = u.name[0].toUpperCase();
  loadProjs();
  renderTuts();
  if (!DB.ob(u.id)) startOb();
}

// Auto-login from stored session
(function autoLogin() {
  const s = DB.sess();
  if (s) {
    const u = DB.users().find(x => x.id === s.id);
    if (u) setTimeout(() => boot(u), 80);
  }
})();
