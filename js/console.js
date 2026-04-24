// ══ CONSOLE ══
let lastTrace = [], curTab = 'o';

function clearCon() {
  document.getElementById('cbody').innerHTML = '<div class="l-info">Ready. Press Run to execute.</div>';
}

function ctab(t) {
  curTab = t;
  document.querySelectorAll('.ctab').forEach((el, i) =>
    el.classList.toggle('on', (i === 0 && t === 'o') || (i === 1 && t === 't'))
  );
  if (t === 'o') renderOut(null); else renderTrace();
}

function renderOut(r) {
  if (!r) { clearCon(); return; }
  let h = `<div class="l-info">▶ Ran in ${r.dur}ms</div>`;
  r.output.forEach(l  => { h += `<div class="l-ok">${esc(l)}</div>`; });
  r.errors.forEach(e  => { h += `<div class="l-err">⚠ ${esc(e)}</div>`; });
  if (!r.output.length && !r.errors.length) h += `<div class="l-info">(no output)</div>`;
  document.getElementById('cbody').innerHTML = h;
}

function renderTrace() {
  if (!lastTrace.length) {
    document.getElementById('cbody').innerHTML = '<div class="l-info">Run code first.</div>';
    return;
  }
  document.getElementById('cbody').innerHTML = lastTrace.slice(0, 150).map((s, i) =>
    `<div class="l-step">${i + 1} &nbsp;L${s.line} &nbsp;${esc(s.description)}</div>`
  ).join('');
}

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// ══ RUN ══
function runCode() {
  const code = document.getElementById('editor').value;
  if (!code.trim()) return;

  const btn = document.getElementById('runbtn');
  btn.innerHTML = '⟳ Running…';
  btn.style.background = '#16a34a';

  setTimeout(() => {
    const r = interpret(code);
    lastTrace = r.steps || [];

    if (curTab === 'o') renderOut(r); else renderTrace();

    if (CU && curP) {
      curP.code = code;
      document.getElementById('unsaved').style.display = 'none';
      DB.saveProjs(CU.id, projs);
      const h = DB.hist(CU.id);
      h.unshift({
        id: Date.now(), proj: curP.name,
        code: code.slice(0, 250),
        out: r.output.join('\n').slice(0, 150),
        err: r.errors,
        t: new Date().toISOString(),
      });
      DB.saveHist(CU.id, h);
    }

    btn.innerHTML = '<span class="tri"></span> Run';
    btn.style.background = '#22c55e';
  }, 10);
}
