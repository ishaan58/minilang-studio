// ══ DB (localStorage) ══
const DB = {
  users()          { try { return JSON.parse(localStorage.getItem('ml_u') || '[]') } catch { return [] } },
  saveUsers(u)     { localStorage.setItem('ml_u', JSON.stringify(u)) },
  sess()           { try { return JSON.parse(localStorage.getItem('ml_s') || 'null') } catch { return null } },
  saveSess(s)      { localStorage.setItem('ml_s', JSON.stringify(s)) },
  clearSess()      { localStorage.removeItem('ml_s') },
  projs(id)        { try { return JSON.parse(localStorage.getItem('ml_p_' + id) || '[]') } catch { return [] } },
  saveProjs(id, p) { localStorage.setItem('ml_p_' + id, JSON.stringify(p)) },
  hist(id)         { try { return JSON.parse(localStorage.getItem('ml_h_' + id) || '[]') } catch { return [] } },
  saveHist(id, h)  { localStorage.setItem('ml_h_' + id, JSON.stringify(h.slice(0, 50))) },
  ob(id)           { return localStorage.getItem('ml_ob_' + id) === '1' },
  setOb(id)        { localStorage.setItem('ml_ob_' + id, '1') },
};
