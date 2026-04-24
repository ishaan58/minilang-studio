// ══ INTERPRETER ══
function interpret(src) {
  const start = Date.now();
  try {
    const tok = lex(src);
    const ast  = parse(tok);
    const r    = exec(ast);
    return { ...r, dur: Date.now() - start };
  } catch (e) {
    return { output: [], errors: [e.message || String(e)], steps: [], dur: Date.now() - start };
  }
}

// ── LEXER ──
function lex(src) {
  const toks = []; let i = 0, ln = 1, col = 1;
  const ist = [0];
  const KW  = new Set(['let','const','if','else','while','for','in','func','return','print','and','or','not','break','continue']);

  while (i < src.length) {
    const ch = src[i];

    if (ch === '\n') {
      toks.push({ t: 'NL', v: '\n', ln, col }); i++; ln++; col = 1;
      let sp = 0;
      while (i < src.length && (src[i] === ' ' || src[i] === '\t')) { sp += src[i] === '\t' ? 4 : 1; i++; col++; }
      if (i < src.length && src[i] !== '\n' && src[i] !== '#') {
        const c = ist[ist.length - 1];
        if (sp > c) { ist.push(sp); toks.push({ t: 'IN', v: 'IN', ln, col }); }
        else if (sp < c) { while (ist.length > 1 && ist[ist.length - 1] > sp) { ist.pop(); toks.push({ t: 'DE', v: 'DE', ln, col }); } }
      }
    }
    else if (ch === ' ' || ch === '\t' || ch === '\r') { i++; col++; }
    else if (ch === '#') { while (i < src.length && src[i] !== '\n') i++; }
    else if (ch === '"' || ch === "'") {
      let v = ''; const q = ch, L = ln, C = col; i++; col++;
      while (i < src.length && src[i] !== q && src[i] !== '\n') {
        if (src[i] === '\\') { i++; const e = src[i++]; v += e === 'n' ? '\n' : e === 't' ? '\t' : e; }
        else v += src[i++];
      }
      if (src[i] === q) { i++; col++; }
      toks.push({ t: 'STR', v, ln: L, col: C });
    }
    else if (ch >= '0' && ch <= '9') {
      let v = ''; const L = ln, C = col;
      while (i < src.length && src[i] >= '0' && src[i] <= '9') { v += src[i++]; col++; }
      if (src[i] === '.' && src[i + 1] >= '0' && src[i + 1] <= '9') {
        v += src[i++]; col++;
        while (i < src.length && src[i] >= '0' && src[i] <= '9') { v += src[i++]; col++; }
      }
      toks.push({ t: 'NUM', v: parseFloat(v), ln: L, col: C });
    }
    else if (/[a-zA-Z_]/.test(ch)) {
      let v = ''; const L = ln, C = col;
      while (i < src.length && /[a-zA-Z0-9_]/.test(src[i])) { v += src[i++]; col++; }
      if      (v === 'true')  toks.push({ t: 'BOOL', v: true,  ln: L, col: C });
      else if (v === 'false') toks.push({ t: 'BOOL', v: false, ln: L, col: C });
      else if (v === 'null')  toks.push({ t: 'NULL', v: null,  ln: L, col: C });
      else if (v === 'and')   toks.push({ t: 'AND',  v: 'and', ln: L, col: C });
      else if (v === 'or')    toks.push({ t: 'OR',   v: 'or',  ln: L, col: C });
      else if (v === 'not')   toks.push({ t: 'NOT',  v: 'not', ln: L, col: C });
      else if (KW.has(v))     toks.push({ t: 'KW',   v,        ln: L, col: C });
      else                    toks.push({ t: 'ID',   v,        ln: L, col: C });
    }
    else {
      const L = ln, C = col, two = src.slice(i, i + 2);
      if      (two === '==') { toks.push({ t: 'EQ',  v: '==', ln: L, col: C }); i += 2; col += 2; }
      else if (two === '!=') { toks.push({ t: 'NEQ', v: '!=', ln: L, col: C }); i += 2; col += 2; }
      else if (two === '<=') { toks.push({ t: 'LTE', v: '<=', ln: L, col: C }); i += 2; col += 2; }
      else if (two === '>=') { toks.push({ t: 'GTE', v: '>=', ln: L, col: C }); i += 2; col += 2; }
      else {
        const m = { '+':'PLUS','-':'MINUS','*':'STAR','/':'SLASH','%':'PCT','(':'LP',')':'RP','[':'LSB',']':'RSB',',':'CM',':':'COL','.':'DOT',';':'SC','=':'ASS','<':'LT','>':'GT' };
        if (m[ch]) { toks.push({ t: m[ch], v: ch, ln: L, col: C }); i++; col++; }
        else       { i++; col++; }
      }
    }
  }

  while (ist.length > 1) { ist.pop(); toks.push({ t: 'DE', v: 'DE', ln, col }); }
  toks.push({ t: 'EOF', v: '', ln, col });
  return toks;
}

// ── PARSER ──
function parse(toks) {
  let pos = 0;
  const pk  = (o = 0) => toks[Math.min(pos + o, toks.length - 1)];
  const adv = ()      => toks[pos++];
  const chk = (t, v)  => pk().t === t && (v === undefined || pk().v === v);
  const mat = (t, v)  => { if (chk(t, v)) { adv(); return true; } return false; };
  const exp = (t, v)  => { if (!chk(t, v)) { const tk = pk(); throw new Error(`Expected ${v ?? t} got '${tk.v}' at line ${tk.ln}`); } return adv(); };
  const snl = ()      => { while (chk('NL') || chk('SC')) adv(); };

  const prog = () => { const b = []; snl(); while (!chk('EOF')) { b.push(stmt()); snl(); } return { k: 'prog', b }; };
  const blk  = () => {
    exp('IN'); const b = []; snl();
    while (!chk('DE') && !chk('EOF')) { b.push(stmt()); snl(); }
    mat('DE');
    return { k: 'blk', b };
  };

  const stmt = () => {
    const tk = pk();
    if (tk.t === 'KW') {
      if (tk.v === 'let' || tk.v === 'const') { adv(); const n = exp('ID').v; exp('ASS'); return { k: 'let', n, v: expr(), line: tk.ln }; }
      if (tk.v === 'if')       return ifS();
      if (tk.v === 'while')    { adv(); const c = expr(); mat('COL'); mat('NL'); return { k: 'wh',  c, b: blk(), line: tk.ln }; }
      if (tk.v === 'for')      { adv(); const va = exp('ID').v; exp('KW', 'in'); const it = expr(); mat('COL'); mat('NL'); return { k: 'for', va, it, b: blk(), line: tk.ln }; }
      if (tk.v === 'func')     { adv(); const n = exp('ID').v; exp('LP'); const ps = []; while (!chk('RP') && !chk('EOF')) { ps.push(exp('ID').v); if (!mat('CM')) break; } exp('RP'); mat('COL'); mat('NL'); return { k: 'fn', n, ps, b: blk(), line: tk.ln }; }
      if (tk.v === 'return')   { adv(); const v = (!chk('NL') && !chk('DE') && !chk('EOF') && !chk('SC')) ? expr() : null; return { k: 'ret', v, line: tk.ln }; }
      if (tk.v === 'print')    { adv(); exp('LP'); const args = []; while (!chk('RP') && !chk('EOF')) { args.push(expr()); if (!mat('CM')) break; } exp('RP'); return { k: 'print', args, line: tk.ln }; }
      if (tk.v === 'break')    { adv(); return { k: 'brk', line: tk.ln }; }
      if (tk.v === 'continue') { adv(); return { k: 'cont', line: tk.ln }; }
    }
    if (tk.t === 'ID') {
      if (pk(1).t === 'ASS') { const n = adv().v; adv(); return { k: 'asgn', n, v: expr(), line: tk.ln }; }
      if (pk(1).t === 'LSB') { const obj = { k: 'id', n: adv().v, line: tk.ln }; adv(); const idx = expr(); exp('RSB'); if (mat('ASS')) { return { k: 'idxa', obj, idx, v: expr(), line: tk.ln }; } return cc({ k: 'ix', obj, idx, line: tk.ln }); }
    }
    return expr();
  };

  const ifS = () => {
    const line = pk().ln; adv(); const c = expr(); mat('COL'); mat('NL'); const th = blk(); snl();
    let el;
    if (chk('KW', 'else')) { adv(); if (chk('KW', 'if')) el = ifS(); else { mat('COL'); mat('NL'); el = blk(); } }
    return { k: 'if', c, th, el, line };
  };

  const expr = () => orE();
  const orE  = () => { let l = andE(); while (chk('OR'))  { const ln = pk().ln; adv(); l = { k: 'bin', op: 'or',  l, r: andE(),  line: ln }; } return l; };
  const andE = () => { let l = notE(); while (chk('AND')) { const ln = pk().ln; adv(); l = { k: 'bin', op: 'and', l, r: notE(),  line: ln }; } return l; };
  const notE = () => { if (chk('NOT')) { const ln = pk().ln; adv(); return { k: 'un', op: 'not', v: notE(), line: ln }; } return cmpE(); };
  const cmpE = () => {
    let l = addE();
    const ops = ['EQ','NEQ','LT','GT','LTE','GTE'];
    while (ops.includes(pk().t)) { const ln = pk().ln; const op = adv().v; l = { k: 'bin', op, l, r: addE(), line: ln }; }
    return l;
  };
  const addE = () => { let l = mulE(); while (chk('PLUS') || chk('MINUS')) { const ln = pk().ln; const op = adv().v; l = { k: 'bin', op, l, r: mulE(), line: ln }; } return l; };
  const mulE = () => { let l = unE();  while (chk('STAR') || chk('SLASH') || chk('PCT'))  { const ln = pk().ln; const op = adv().v; l = { k: 'bin', op, l, r: unE(),  line: ln }; } return l; };
  const unE  = () => { if (chk('MINUS')) { const ln = pk().ln; adv(); return { k: 'un', op: '-', v: unE(), line: ln }; } return cc(prim()); };

  const cc = (e) => {
    while (true) {
      if      (chk('LP'))  { const ln = pk().ln; adv(); const args = []; while (!chk('RP') && !chk('EOF')) { args.push(expr()); if (!mat('CM')) break; } exp('RP'); e = { k: 'call', fn: e, args, line: ln }; }
      else if (chk('LSB')) { const ln = pk().ln; adv(); const idx = expr(); exp('RSB'); e = { k: 'ix', obj: e, idx, line: ln }; }
      else if (chk('DOT')) { const ln = pk().ln; adv(); const m = exp('ID').v; e = { k: 'mem', obj: e, m, line: ln }; }
      else break;
    }
    return e;
  };

  const prim = () => {
    const tk = pk();
    if (tk.t === 'NUM')  { adv(); return { k: 'num',  v: tk.v }; }
    if (tk.t === 'STR')  { adv(); return { k: 'str',  v: tk.v }; }
    if (tk.t === 'BOOL') { adv(); return { k: 'bool', v: tk.v }; }
    if (tk.t === 'NULL') { adv(); return { k: 'null' }; }
    if (tk.t === 'ID')   { adv(); return { k: 'id', n: tk.v, line: tk.ln }; }
    if (tk.t === 'KW' && tk.v === 'print') { adv(); return { k: 'id', n: 'print', line: tk.ln }; }
    if (tk.t === 'LP')   { adv(); const e = expr(); exp('RP'); return e; }
    if (tk.t === 'LSB')  { adv(); const els = []; while (!chk('RSB') && !chk('EOF')) { els.push(expr()); if (!mat('CM')) break; } exp('RSB'); return { k: 'list', els }; }
    throw new Error(`Unexpected '${tk.v}' at line ${tk.ln}`);
  };

  return prog();
}

// ── EXECUTOR ──
function exec(ast) {
  const out = [], steps = [], errs = [];
  let ig = 0, cd = 0;

  class Env {
    constructor(p) { this.v = new Map(); this.p = p; }
    get(n, l) {
      if (this.v.has(n)) return this.v.get(n);
      if (this.p)        return this.p.get(n, l);
      throw new Error(`Undefined variable '${n}'` + (l ? ` (line ${l})` : ''));
    }
    set(n, v)    { this.v.set(n, v); }
    asgn(n, v, l) {
      if (this.v.has(n)) { this.v.set(n, v); return; }
      if (this.p)        { this.p.asgn(n, v, l); return; }
      throw new Error(`Cannot assign '${n}'` + (l ? ` (line ${l})` : ''));
    }
  }

  const R  = v => ({ R: 1, v });
  const B  = { B: 1 };
  const C  = { C: 1 };
  const d  = v => {
    if (v === null)       return 'null';
    if (v === true)       return 'true';
    if (v === false)      return 'false';
    if (Array.isArray(v)) return '[' + v.map(d).join(', ') + ']';
    if (v && v._f)        return `<func ${v._n}>`;
    return String(v);
  };
  const tr = v => v !== null && v !== false && v !== 0 && v !== '' && !(Array.isArray(v) && !v.length);
  const st = (ln, desc) => { if (steps.length < 200) steps.push({ line: ln, description: desc, vars: {} }); };

  const G = new Env(null);
  G.set('len',    v => Array.isArray(v) ? v.length : typeof v === 'string' ? v.length : 0);
  G.set('str',    v => d(v));
  G.set('num',    v => { const n = Number(v); if (isNaN(n)) throw new Error('Cannot convert to number'); return n; });
  G.set('range',  (...a) => { let s = 0, e = 0, sp = 1; if (a.length === 1) e = a[0]; else if (a.length >= 2) { s = a[0]; e = a[1]; } if (a.length === 3) sp = a[2]; const r = []; for (let i = s; i < e; i += sp) r.push(i); return r; });
  G.set('type',   v => v === null ? 'null' : Array.isArray(v) ? 'list' : v && v._f ? 'func' : typeof v);
  G.set('append', (l, item) => { if (!Array.isArray(l)) throw new Error('append() needs a list'); l.push(item); return null; });
  G.set('pop',    l => { if (!Array.isArray(l)) throw new Error('pop() needs a list'); return l.pop() ?? null; });
  G.set('abs',    v => Math.abs(v));
  G.set('sqrt',   v => Math.sqrt(v));
  G.set('floor',  v => Math.floor(v));
  G.set('ceil',   v => Math.ceil(v));
  G.set('round',  v => Math.round(v));
  G.set('max',    (...a) => Math.max(...a));
  G.set('min',    (...a) => Math.min(...a));
  G.set('join',   (l, sep = ' ') => (Array.isArray(l) ? l : []).map(d).join(d(sep)));
  G.set('upper',  s => String(s).toUpperCase());
  G.set('lower',  s => String(s).toLowerCase());
  G.set('print',  (...args) => { out.push(args.map(d).join(' ')); return null; });

  const eb = (blk, env) => {
    for (const n of blk.b) { const r = en(n, env); if (r && (r.R || r.B || r.C)) return r; }
    return null;
  };

  const en = (n, env) => {
    switch (n.k) {
      case 'let':  { const v = ev(n.v, env); env.set(n.n, v); st(n.line, `let ${n.n} = ${d(v)}`); return null; }
      case 'asgn': { const v = ev(n.v, env); env.asgn(n.n, v, n.line); st(n.line, `${n.n} = ${d(v)}`); return null; }
      case 'idxa': { const obj = ev(n.obj, env), idx = ev(n.idx, env), val = ev(n.v, env); if (!Array.isArray(obj)) throw new Error('Cannot index non-list'); obj[idx] = val; return null; }
      case 'print':{ const vals = n.args.map(a => ev(a, env)); const o = vals.map(d).join(' '); out.push(o); st(n.line, `print → "${o.slice(0, 50)}"`); return null; }
      case 'if':   { const c = ev(n.c, env); st(n.line, `if → ${tr(c) ? 'true' : 'false'} branch`); if (tr(c)) return eb(n.th, new Env(env)); if (n.el) { if (n.el.k === 'blk') return eb(n.el, new Env(env)); return en(n.el, env); } return null; }
      case 'wh':   { let cnt = 0; while (true) { if (++cnt > 10000) throw new Error('Infinite loop (>10000 iterations)'); if (++ig > 500000) throw new Error('Iteration limit'); if (!tr(ev(n.c, env))) break; const r = eb(n.b, new Env(env)); if (r && r.R) return r; if (r && r.B) break; } return null; }
      case 'for':  { const it = ev(n.it, env); const items = Array.isArray(it) ? it : typeof it === 'string' ? it.split('') : []; for (const item of items) { if (++ig > 500000) throw new Error('Iteration limit'); const le = new Env(env); le.set(n.va, item); const r = eb(n.b, le); if (r && r.R) return r; if (r && r.B) break; } return null; }
      case 'fn':   { env.set(n.n, { _f: 1, _n: n.n, ps: n.ps, b: n.b, cl: env }); st(n.line, `func ${n.n}(${n.ps.join(',')}) defined`); return null; }
      case 'ret':  return R(n.v ? ev(n.v, env) : null);
      case 'brk':  return B;
      case 'cont': return C;
      default:     return ev(n, env);
    }
  };

  const ev = (n, env) => {
    switch (n.k) {
      case 'num':  return n.v;
      case 'str':  return n.v;
      case 'bool': return n.v;
      case 'null': return null;
      case 'list': return n.els.map(e => ev(e, env));
      case 'id':   return env.get(n.n, n.line);
      case 'un':   { if (n.op === '-') return -ev(n.v, env); if (n.op === 'not') return !tr(ev(n.v, env)); return null; }
      case 'bin':  return bo(n, env);
      case 'call': return cf(n, env);
      case 'ix':   { const obj = ev(n.obj, env), idx = ev(n.idx, env); if (Array.isArray(obj)) { const i = idx < 0 ? obj.length + idx : idx; if (i < 0 || i >= obj.length) throw new Error(`Index ${idx} out of bounds`); return obj[i]; } if (typeof obj === 'string') return obj[idx] ?? null; throw new Error('Cannot index non-list'); }
      case 'mem':  { const obj = ev(n.obj, env); if (Array.isArray(obj) && n.m === 'length') return obj.length; if (typeof obj === 'string') { if (n.m === 'length') return obj.length; if (n.m === 'upper') return obj.toUpperCase(); if (n.m === 'lower') return obj.toLowerCase(); } throw new Error(`Unknown member '${n.m}'`); }
      default:     return null;
    }
  };

  const bo = (n, env) => {
    const L  = () => ev(n.l, env);
    const Rv = () => ev(n.r, env);
    switch (n.op) {
      case '+':  { const l = L(), r = Rv(); if (typeof l === 'string' || typeof r === 'string') return d(l) + d(r); if (Array.isArray(l) && Array.isArray(r)) return [...l, ...r]; return l + r; }
      case '-':  return L() - Rv();
      case '%':  return L() % Rv();
      case '*':  { const l = L(), r = Rv(); if (typeof l === 'string' && typeof r === 'number') return l.repeat(r); return l * r; }
      case '/':  { const r = Rv(); if (r === 0) throw new Error('Division by zero'); return L() / r; }
      case '==': return JSON.stringify(L()) === JSON.stringify(Rv());
      case '!=': return JSON.stringify(L()) !== JSON.stringify(Rv());
      case '<':  return L() < Rv();
      case '>':  return L() > Rv();
      case '<=': return L() <= Rv();
      case '>=': return L() >= Rv();
      case 'and':{ const l = L(); return tr(l) ? Rv() : l; }
      case 'or': { const l = L(); return tr(l) ? l : Rv(); }
    }
  };

  const cf = (n, env) => {
    const callee = ev(n.fn, env);
    const args   = n.args.map(a => ev(a, env));
    if (typeof callee === 'function') { const r = callee(...args); return r === undefined ? null : r; }
    if (callee && callee._f) {
      if (++cd > 500) throw new Error('Stack overflow');
      const fe = new Env(callee.cl);
      callee.ps.forEach((p, i) => fe.set(p, args[i] ?? null));
      const r = eb(callee.b, fe);
      cd--;
      if (r && r.R) return r.v;
      return null;
    }
    const nm = n.fn.n || '?';
    if (nm === 'print') { out.push(args.map(d).join(' ')); return null; }
    throw new Error(`'${nm}' is not a function`);
  };

  try { eb({ b: ast.b }, G); } catch (e) { errs.push(e.message || String(e)); }
  return { output: out, errors: errs, steps };
}
