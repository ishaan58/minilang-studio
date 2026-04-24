import { AppState } from './state.js';
import { DB } from './db.js';
import { esc } from './utils.js';
import { clearCon } from './console.js';
import { updateLnums } from './editor.js';
import { closeSidebar } from './views.js';

// ══ PROJECTS ══

export async function loadProjs() {
  if (!AppState.CU) return;
  AppState.projs = await DB.projs(AppState.CU.uid);
  renderProjs();
  if (AppState.projs.length) {
    await openProj(AppState.projs[0].id);
  }
}

export function renderProjs() {
  document.getElementById('plist').innerHTML = AppState.projs.map(p => `
    <div class="pi${AppState.curP && AppState.curP.id === p.id ? ' on' : ''}" onclick="openProj('${p.id}')">
      <span style="font-size:10px;opacity:.5">◈</span>
      <span class="pi-n">${esc(p.name)}</span>
      <span class="pi-x" onclick="delProj(event,'${p.id}')">✕</span>
    </div>`).join('');
}

export async function openProj(id) {
  if (AppState.curP) {
    AppState.curP.code = document.getElementById('editor').value;
    if (AppState.CU) {
      await DB.saveProj(AppState.CU.uid, AppState.curP);
    }
  }
  
  AppState.curP = AppState.projs.find(p => p.id === id) || null;
  if (!AppState.curP) return;
  
  document.getElementById('editor').value           = AppState.curP.code;
  document.getElementById('fname').textContent      = AppState.curP.name + '.ml';
  document.getElementById('unsaved').style.display  = 'none';
  
  updateLnums();
  clearCon();
  renderProjs();
  closeSidebar();
}

export async function delProj(e, id) {
  e.stopPropagation();
  AppState.projs = AppState.projs.filter(p => p.id !== id);
  if (AppState.curP && AppState.curP.id === id) { 
    AppState.curP = null; 
    document.getElementById('editor').value = ''; 
    updateLnums(); 
  }
  if (AppState.CU) {
    await DB.deleteProj(AppState.CU.uid, id);
  }
  renderProjs();
}

export function newProjModal() {
  document.getElementById('pname').value = '';
  document.getElementById('modal').classList.add('on');
  setTimeout(() => document.getElementById('pname').focus(), 50);
}

export function closeM() { 
  document.getElementById('modal').classList.remove('on'); 
}

export async function createProj() {
  const n = document.getElementById('pname').value.trim() || 'Untitled';
  const p = { 
    id: 'p' + Date.now(), 
    name: n, 
    code: `# ${n}\nprint("Hello from ${n}!")\n`, 
    created: new Date().toISOString() 
  };
  AppState.projs.unshift(p);
  
  if (AppState.CU) {
    await DB.saveProj(AppState.CU.uid, p);
  }
  
  closeM();
  renderProjs();
  await openProj(p.id);
}
