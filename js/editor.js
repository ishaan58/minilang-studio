// ══ EDITOR ══
function onEdit() {
  if (curP) {
    document.getElementById('unsaved').style.display = 'inline';
    curP.code = document.getElementById('editor').value;
  }
  updateLnums();
}

function updateLnums() {
  const ls = (document.getElementById('editor').value || '').split('\n');
  document.getElementById('lni').innerHTML = ls.map((_, i) =>
    `<div style="height:20.8px;line-height:1.6">${i + 1}</div>`
  ).join('');
}

function syncScroll() {
  document.getElementById('lnums').scrollTop = document.getElementById('editor').scrollTop;
}

function handleKey(e) {
  const ta = e.target;

  if (e.key === 'Tab') {
    e.preventDefault();
    const s = ta.selectionStart, en = ta.selectionEnd;
    ta.value = ta.value.slice(0, s) + '  ' + ta.value.slice(en);
    ta.selectionStart = ta.selectionEnd = s + 2;
    onEdit();
  }

  if (e.key === 'Enter') {
    const b   = ta.value.slice(0, ta.selectionStart);
    const l   = b.split('\n').pop() || '';
    const ind = l.match(/^(\s*)/)[1];
    const ex  = l.trimEnd().endsWith(':') ? '  ' : '';
    if (ind || ex) {
      e.preventDefault();
      const p = ta.selectionStart;
      ta.value = ta.value.slice(0, p) + '\n' + ind + ex + ta.value.slice(ta.selectionEnd);
      ta.selectionStart = ta.selectionEnd = p + 1 + ind.length + ex.length;
      onEdit();
    }
  }

  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
    e.preventDefault();
    runCode();
  }
}
