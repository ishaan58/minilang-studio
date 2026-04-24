import { AppState } from './state.js';
import { DB } from './db.js';
import { esc } from './utils.js';

// ══ CONSOLE ══

export function clearCon() {
  document.getElementById('cbody').innerHTML = '<div class="l-info">Ready. Press Run to execute.</div>';
}

export function ctab(t) {
  AppState.curTab = t;
  document.querySelectorAll('.ctab').forEach((el, i) =>
    el.classList.toggle('on', (i === 0 && t === 'o') || (i === 1 && t === 't'))
  );
  if (t === 'o') renderOut(null); else renderTrace();
}

export function renderOut(r) {
  if (!r) { clearCon(); return; }
  let h = `<div class="l-info">▶ Ran in ${r.dur}ms</div>`;
  r.output.forEach(l  => { h += `<div class="l-ok">${esc(l)}</div>`; });
  r.errors.forEach(e  => { h += `<div class="l-err">⚠ ${esc(e)}</div>`; });
  if (!r.output.length && !r.errors.length) h += `<div class="l-info">(no output)</div>`;
  document.getElementById('cbody').innerHTML = h;
}

export function renderTrace() {
  if (!AppState.lastTrace.length) {
    document.getElementById('cbody').innerHTML = '<div class="l-info">Run code first.</div>';
    return;
  }
  document.getElementById('cbody').innerHTML = AppState.lastTrace.slice(0, 150).map((s, i) =>
    `<div class="l-step">${i + 1} &nbsp;L${s.line} &nbsp;${esc(s.description)}</div>`
  ).join('');
}

// ══ RUN ══
export function runCode() {
  const code = document.getElementById('editor').value;
  if (!code.trim()) return;

  const btn = document.getElementById('runbtn');
  btn.innerHTML = '⟳ Running…';
  btn.style.background = '#16a34a';

  setTimeout(async () => {
    // Dynamic import to avoid circular dependency if interpreter imports from global,
    // though here interpreter is pure
    const { interpret } = window; // interpreter.js sets this globally for now, or we can assume it's loaded
    const r = interpret(code);
    AppState.lastTrace = r.steps || [];

    if (AppState.curTab === 'o') renderOut(r); else renderTrace();

    if (AppState.CU && AppState.curP) {
      AppState.curP.code = code;
      document.getElementById('unsaved').style.display = 'none';
      await DB.saveProj(AppState.CU.uid, AppState.curP);
      
      const entry = {
        proj: AppState.curP.name,
        code: code.slice(0, 250),
        out: r.output.join('\n').slice(0, 150),
        err: r.errors,
        t: new Date().toISOString(),
      };
      await DB.addHist(AppState.CU.uid, entry);
    }

    btn.innerHTML = '<span class="tri"></span> Run';
    btn.style.background = '#22c55e';
  }, 10);
}
