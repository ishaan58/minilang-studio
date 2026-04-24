import { AppState } from './state.js';
import { DB } from './db.js';
import { esc } from './utils.js';
import { renderProjs, loadProjs } from './projects.js';
import { updateLnums } from './editor.js';

// ══ VIEWS ══
export function toggleSidebar() {
  const sb = document.getElementById('sidebar');
  const ov = document.getElementById('sbOverlay');
  sb.classList.toggle('open');
  ov.classList.toggle('on');
}

export function closeSidebar() {
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('sbOverlay').classList.remove('on');
}

export function view(v) {
  document.querySelectorAll('.nb').forEach((b, i) => b.classList.toggle('on', ['e', 't', 'h'][i] === v));
  document.getElementById('sidebar').style.display = v === 'e' ? 'flex'  : 'none';
  document.getElementById('ws').style.display      = v === 'e' ? 'flex'  : 'none';
  document.getElementById('tv').style.display      = v === 't' ? 'block' : 'none';
  document.getElementById('hv').style.display      = v === 'h' ? 'block' : 'none';
  if (v === 'h') renderHist();
  closeSidebar();
}

// ══ HISTORY ══
export function ago(iso) {
  const d = Date.now() - new Date(iso).getTime();
  if (d < 60000)    return 'just now';
  if (d < 3600000)  return Math.floor(d / 60000)   + 'm ago';
  if (d < 86400000) return Math.floor(d / 3600000)  + 'h ago';
  return Math.floor(d / 86400000) + 'd ago';
}

export async function renderHist() {
  const h  = AppState.CU ? await DB.hist(AppState.CU.uid) : [];
  const el = document.getElementById('hlist');
  if (!h.length) {
    el.innerHTML = '<div style="color:#71717a;font-size:13px;">No history yet — run some code!</div>';
    return;
  }
  el.innerHTML = h.map(x => `
    <div class="hi">
      <div class="hi-m">
        <strong>${esc(x.proj)}</strong>
        <span class="badge ${x.err && x.err.length ? 'b-err' : 'b-ok'}">${x.err && x.err.length ? 'error' : 'ok'}</span>
        · ${ago(x.t)}
      </div>
      <div class="hi-c">${esc(x.code)}</div>
      ${x.out ? `<div class="hi-o">${esc(x.out.slice(0, 80))}</div>` : ''}
    </div>`).join('');
}

// ══ TUTORIALS ══
const TUTS = [
  {
    t: 'Variables & values',
    d: 'Use <code>let</code> to store data. MiniLang supports numbers, strings, and booleans.',
    c: `<span class="kw">let</span> name = <span class="str">"Alice"</span>\n<span class="kw">let</span> age = <span class="num">25</span>\n<span class="fn">print</span>(name, <span class="str">"is"</span>, age)`,
    s: `let name = "Alice"\nlet age = 25\nlet active = true\nprint(name, "is", age, "years old")\nprint("Active:", active)`,
  },
  {
    t: 'Arithmetic & strings',
    d: 'MiniLang supports +, -, *, /, and %. Use <code>str()</code> to convert numbers.',
    c: `<span class="kw">let</span> x = <span class="num">10</span>, y = <span class="num">3</span>\n<span class="fn">print</span>(x + y)   <span class="cm"># 13</span>\n<span class="fn">print</span>(x * y)   <span class="cm"># 30</span>\n<span class="fn">print</span>(x % y)   <span class="cm"># 1</span>`,
    s: `let x = 10\nlet y = 3\nprint("x + y =", x + y)\nprint("x * y =", x * y)\nprint("x / y =", x / y)\nprint("x % y =", x % y)\nprint("Text: " + str(x) + " items")`,
  },
  {
    t: 'If / else conditions',
    d: 'Make decisions with <code>if</code>, <code>else if</code>, and <code>else</code>. Indent body with 2 spaces.',
    c: `<span class="kw">let</span> n = <span class="num">28</span>\n<span class="kw">if</span> n > <span class="num">30</span>:\n  <span class="fn">print</span>(<span class="str">"Hot!"</span>)\n<span class="kw">else if</span> n > <span class="num">20</span>:\n  <span class="fn">print</span>(<span class="str">"Nice!"</span>)\n<span class="kw">else</span>:\n  <span class="fn">print</span>(<span class="str">"Cold!"</span>)`,
    s: `let temp = 28\nif temp > 30:\n  print("Hot day!")\nelse if temp > 20:\n  print("Nice day!")\nelse:\n  print("Cold day!")\n\nlet score = 85\nif score >= 90:\n  print("Grade: A")\nelse if score >= 80:\n  print("Grade: B")\nelse:\n  print("Grade: C")`,
  },
  {
    t: 'While loops',
    d: 'Repeat code while a condition is true. Always ensure the condition becomes false eventually!',
    c: `<span class="kw">let</span> i = <span class="num">1</span>\n<span class="kw">while</span> i <= <span class="num">5</span>:\n  <span class="fn">print</span>(<span class="str">"Count:"</span>, i)\n  i = i + <span class="num">1</span>`,
    s: `let i = 1\nwhile i <= 5:\n  print("Count:", i)\n  i = i + 1\nprint("Done!")\n\nlet sum = 0\nlet n = 1\nwhile n <= 10:\n  sum = sum + n\n  n = n + 1\nprint("Sum 1..10 =", sum)`,
  },
  {
    t: 'Functions',
    d: 'Group reusable code with <code>func</code>. Use <code>return</code> to send a value back.',
    c: `<span class="kw">func</span> <span class="fn">greet</span>(name):\n  <span class="kw">return</span> <span class="str">"Hello, "</span> + name\n\n<span class="fn">print</span>(<span class="fn">greet</span>(<span class="str">"World"</span>))`,
    s: `func greet(name):\n  return "Hello, " + name + "!"\n\nfunc square(x):\n  return x * x\n\nprint(greet("World"))\nprint("7 squared =", square(7))\nprint("average:", (10+20)/2)`,
  },
  {
    t: 'Lists & for loops',
    d: 'Lists store multiple values. Loop over them with <code>for..in</code> or access by index.',
    c: `<span class="kw">let</span> nums = [<span class="num">3</span>, <span class="num">1</span>, <span class="num">4</span>]\n<span class="fn">print</span>(nums[<span class="num">0</span>])  <span class="cm"># 3</span>\n<span class="kw">for</span> n <span class="kw">in</span> nums:\n  <span class="fn">print</span>(n)`,
    s: `let fruits = ["apple", "banana", "cherry"]\nprint("Count:", len(fruits))\nfor fruit in fruits:\n  print("-", fruit)\n\nlet total = 0\nfor n in [3,1,4,1,5,9]:\n  total = total + n\nprint("Sum:", total)`,
  },
];

export function renderTuts() {
  const el = document.getElementById('tv');
  if (el.querySelectorAll('.lesson').length) return;
  TUTS.forEach((t, i) => {
    const d = document.createElement('div');
    d.className = 'lesson';
    d.innerHTML = `<h3><div class="ln">${i + 1}</div>${t.t}</h3><div class="lb">${t.d}</div><div class="lcode">${t.c}</div><button class="try-btn" onclick="loadTut(${i})">Try it in editor ↗</button>`;
    el.appendChild(d);
  });
}

export async function loadTut(i) {
  const t = TUTS[i];
  if (!AppState.curP) {
    const p = { id: 'p' + Date.now(), name: t.t, code: t.s, created: new Date().toISOString() };
    AppState.projs.unshift(p);
    AppState.curP = p;
    if (AppState.CU) {
      await DB.saveProj(AppState.CU.uid, p);
    }
    renderProjs();
  }
  document.getElementById('editor').value = t.s;
  if (AppState.curP) AppState.curP.code = t.s;
  updateLnums();
  view('e');
}
