// ══ ONBOARD ══
const OBS = [
  {
    tag: 'Welcome',
    title: 'Welcome to MiniLang Studio',
    desc: 'An interactive IDE for learning how programming languages work from the inside out. You write code, the interpreter shows you every step.',
    pills: [{ t: 'Write code', c: '#22c55e' }, { t: 'Run instantly', c: '#3b82f6' }, { t: 'Learn concepts', c: '#a855f7' }],
  },
  {
    tag: 'Step 1 of 4', title: 'The editor',
    desc: 'The center panel is your code editor with line numbers, auto-indent, and tab support. Sample projects are in the sidebar — click any to open it.',
    code: `<span class="kw">let</span> x = <span class="num">42</span>\n<span class="fn">print</span>(<span class="str">"The answer is"</span>, x)`,
  },
  {
    tag: 'Step 2 of 4', title: 'Run your code',
    desc: 'Click the green Run button or press Ctrl+Enter. Output appears in the console below. Switch to "Execution trace" to see every step the interpreter took.',
    code: `<span class="kw">func</span> <span class="fn">square</span>(n):\n  <span class="kw">return</span> n * n\n\n<span class="fn">print</span>(<span class="fn">square</span>(<span class="num">9</span>))  <span class="cm"># → 81</span>`,
  },
  {
    tag: 'Step 3 of 4', title: 'Guided tutorials',
    desc: 'Six structured lessons in the Tutorials tab walk you through every language feature — variables, conditions, loops, functions, and lists. Each has live code you can edit and run.',
    pills: [{ t: 'Variables', c: '#22c55e' }, { t: 'If/else', c: '#3b82f6' }, { t: 'Loops', c: '#f59e0b' }, { t: 'Functions', c: '#a855f7' }, { t: 'Lists', c: '#ec4899' }],
  },
  {
    tag: 'Step 4 of 4', title: 'Projects & history',
    desc: 'Create multiple projects, switch between them from the sidebar, and revisit every execution in the History tab — including the exact code and output.',
    code: `<span class="cm"># Code auto-saves as you type</span>\n<span class="cm"># History logs every run</span>\n<span class="cm"># Create unlimited projects</span>`,
  },
];

let obI = 0;

function startOb() {
  obI = 0;
  renderOb();
  document.getElementById('onboard').style.display = 'flex';
}

function renderOb() {
  const s = OBS[obI], total = OBS.length;
  document.getElementById('obBar').style.width    = ((obI + 1) / total * 100) + '%';
  document.getElementById('obBack').style.visibility = obI === 0 ? 'hidden' : 'visible';
  document.getElementById('obNext').textContent   = obI === total - 1 ? 'Get started →' : 'Next →';
  document.getElementById('obDots').innerHTML     = OBS.map((_, i) => `<div class="ob-dot${i === obI ? ' on' : ''}"></div>`).join('');

  let h = `<div class="ob-tag">${s.tag}</div><div class="ob-title">${s.title}</div><div class="ob-desc">${s.desc}</div>`;
  if (s.code)  h += `<div class="ob-code">${s.code}</div>`;
  if (s.pills) h += `<div class="ob-pills">${s.pills.map(p => `<div class="ob-pill" style="background:${p.c}22;color:${p.c};border:1px solid ${p.c}44">${p.t}</div>`).join('')}</div>`;
  document.getElementById('obBody').innerHTML = h;
}

function obNext() { if (obI < OBS.length - 1) { obI++; renderOb(); } else skipOb(); }
function obPrev() { if (obI > 0) { obI--; renderOb(); } }
function skipOb() {
  document.getElementById('onboard').style.display = 'none';
  if (CU) DB.setOb(CU.id);
}
