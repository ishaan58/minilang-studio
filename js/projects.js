// ══ PROJECTS ══
let projs = [], curP = null;

function loadProjs() {
  projs = DB.projs(CU.id);
  renderProjs();
  if (projs.length) openProj(projs[0].id);
}

function renderProjs() {
  document.getElementById('plist').innerHTML = projs.map(p => `
    <div class="pi${curP && curP.id === p.id ? ' on' : ''}" onclick="openProj('${p.id}')">
      <span style="font-size:10px;opacity:.5">◈</span>
      <span class="pi-n">${esc(p.name)}</span>
      <span class="pi-x" onclick="delProj(event,'${p.id}')">✕</span>
    </div>`).join('');
}

function openProj(id) {
  if (curP) { curP.code = document.getElementById('editor').value; DB.saveProjs(CU.id, projs); }
  curP = projs.find(p => p.id === id) || null;
  if (!curP) return;
  document.getElementById('editor').value           = curP.code;
  document.getElementById('fname').textContent      = curP.name + '.ml';
  document.getElementById('unsaved').style.display  = 'none';
  updateLnums();
  clearCon();
  renderProjs();
}

function delProj(e, id) {
  e.stopPropagation();
  projs = projs.filter(p => p.id !== id);
  if (curP && curP.id === id) { curP = null; document.getElementById('editor').value = ''; updateLnums(); }
  DB.saveProjs(CU.id, projs);
  renderProjs();
}

function newProjModal() {
  document.getElementById('pname').value = '';
  document.getElementById('modal').classList.add('on');
  setTimeout(() => document.getElementById('pname').focus(), 50);
}

function closeM() { document.getElementById('modal').classList.remove('on'); }

function createProj() {
  const n = document.getElementById('pname').value.trim() || 'Untitled';
  const p = { id: 'p' + Date.now(), name: n, code: `# ${n}\nprint("Hello from ${n}!")\n`, created: new Date().toISOString() };
  projs.unshift(p);
  DB.saveProjs(CU.id, projs);
  closeM();
  renderProjs();
  openProj(p.id);
}
