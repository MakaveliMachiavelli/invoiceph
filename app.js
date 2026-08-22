/* InvoicePH — app logic. Vanilla JS, no dependencies, no server. */
'use strict';

/* ============ config ============ */
/* PRO unlock codes. OWNER: change these to your own codes before promoting
   (see PAYMENTS.md). A code is simply given to the buyer after GCash payment. */
const PRO_CODES = ['INVOICEPH-PRO-199', 'IPH-DEMO'];
const PRICE_PESOS = 199;

const LS = {
  draft: 'iph_draft', pro: 'iph_pro', clients: 'iph_clients', book: 'iph_book', counter: 'iph_counter'
};

/* ============ state ============ */
let items = [{ qty: 1, unit: 'hr', desc: 'Web design services — March', price: 5000 }];
let pro = localStorage.getItem(LS.pro) === '1';

const $ = (id) => document.getElementById(id);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const peso = (n) => '₱' + (Math.round(n * 100) / 100).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const todayISO = () => new Date().toISOString().slice(0, 10);

/* ============ computations ============ */
function calc() {
  const mode = $('vatMode').value;
  const gross = items.reduce((s, it) => s + (Number(it.qty) || 0) * (Number(it.price) || 0), 0);
  let sub = gross, vat = 0, total = gross, vatLabel = '';
  if (mode === 'vat-excl') { vat = gross * 0.12; sub = gross; total = gross + vat; vatLabel = 'VAT (12%)'; }
  else if (mode === 'vat-incl') { total = gross; sub = gross / 1.12; vat = gross - sub; vatLabel = 'VAT (12%, incl.)'; }
  else { sub = gross; vat = 0; total = gross; vatLabel = ''; }
  return { mode, sub, vat, total, vatLabel };
}

/* ============ items editor ============ */
const UNITS = ['hr', 'pc', 'day', 'mo', 'proj', 'kg', 'box'];

function renderItems() {
  const wrap = $('items');
  wrap.innerHTML = '';
  items.forEach((it, i) => {
    const row = document.createElement('div');
    row.className = 'item-row';
    row.innerHTML =
      `<input type="number" min="0" step="any" value="${it.qty}" data-i="${i}" data-f="qty" aria-label="quantity">` +
      `<input list="units" value="${esc(it.unit)}" data-i="${i}" data-f="unit" aria-label="unit" class="unit" placeholder="hr">` +
      `<input value="${esc(it.desc)}" data-i="${i}" data-f="desc" placeholder="Description of goods / services" aria-label="description">` +
      `<div class="unit-l">${esc(it.unit || '')}</div>` +
      `<input type="number" min="0" step="any" value="${it.price}" data-i="${i}" data-f="price" aria-label="unit price">` +
      `<button class="item-x" data-i="${i}" aria-label="remove" title="Remove">✕</button>`;
    wrap.appendChild(row);
  });
  const dl = document.createElement('datalist'); dl.id = 'units';
  dl.innerHTML = UNITS.map(u => `<option value="${u}">`).join('');
  if (!$('units')) wrap.appendChild(dl);
}

/* ============ preview ============ */
function render() {
  const c = calc();
  $('p_sName').textContent = $('sName').value || 'Your Registered Name';
  $('p_sTin').textContent = 'TIN: ' + ($('sTin').value || '—');
  $('p_sAddr').textContent = $('sAddr').value || '—';
  const vatFlag = $('p_sVat');
  if (c.mode === 'nonvat') { vatFlag.textContent = 'NON-VAT'; vatFlag.className = 'party-meta vat-flag'; }
  else { vatFlag.textContent = 'VAT-REGISTERED'; vatFlag.className = 'party-meta vat-flag'; }
  $('p_bName').textContent = $('bName').value || 'Client name';
  $('p_bTin').textContent = 'TIN: ' + ($('bTin').value || '—');
  $('p_bAddr').textContent = $('bAddr').value || '—';
  $('p_invNo').textContent = 'No. ' + ($('invNo').value || '—');
  $('p_invDate').textContent = 'Date: ' + ($('invDate').value || todayISO());
  $('p_invDue').textContent = 'Due: ' + ($('invDue').value || '—');

  const tb = $('p_items');
  tb.innerHTML = '';
  const rows = items.filter(it => it.desc || it.price || it.qty);
  if (rows.length === 0) {
    tb.innerHTML = '<tr><td>1</td><td>—</td><td>(add your line items on the left)</td><td class="r">—</td><td class="r">—</td></tr>';
  } else {
    rows.forEach(it => {
      const amt = (Number(it.qty) || 0) * (Number(it.price) || 0);
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${esc(it.qty || '')}</td><td>${esc(it.unit || '')}</td><td>${esc(it.desc || '')}</td>` +
        `<td class="r">${peso(Number(it.price) || 0)}</td><td class="r">${peso(amt)}</td>`;
      tb.appendChild(tr);
    });
  }
  $('p_subtotal').textContent = peso(c.sub);
  const vatRow = $('p_vatRow');
  if (c.mode === 'nonvat') { vatRow.style.display = 'none'; }
  else { vatRow.style.display = 'flex'; $('p_vatLabel').textContent = c.vatLabel; $('p_vat').textContent = peso(c.vat); }
  $('p_total').textContent = peso(c.total);
  $('p_notes').textContent = $('notes').value || '';
  $('p_terms').textContent = $('terms').value || '';
  $('p_footer').textContent = c.mode === 'nonvat'
    ? 'NON-VAT taxpayer — per EOPT Act / RR 11-2024. Any applicable percentage tax is already included in the price. Original for the client.'
    : 'VAT-registered — per EOPT Act / RR 11-2024. Original for the client.';
  saveDraft();
}

/* ============ draft persistence ============ */
function gatherDraft() {
  return {
    s: [$('sName').value, $('sTin').value, $('sAddr').value, $('vatMode').value],
    b: [$('bName').value, $('bTin').value, $('bAddr').value],
    inv: [$('invNo').value, $('invDate').value, $('invDue').value],
    nt: [$('notes').value, $('terms').value],
    items
  };
}
function saveDraft() { try { localStorage.setItem(LS.draft, JSON.stringify(gatherDraft())); } catch (e) {} }
function loadDraft() {
  try {
    const d = JSON.parse(localStorage.getItem(LS.draft) || 'null');
    if (!d) return false;
    [$('sName'), $('sTin'), $('sAddr'), $('vatMode')].forEach((el, i) => el.value = d.s[i] ?? el.value);
    [$('bName'), $('bTin'), $('bAddr')].forEach((el, i) => el.value = d.b[i] ?? '');
    [$('invNo'), $('invDate'), $('invDue')].forEach((el, i) => el.value = d.inv[i] ?? '');
    [$('notes'), $('terms')].forEach((el, i) => el.value = d.nt[i] ?? '');
    if (Array.isArray(d.items) && d.items.length) items = d.items;
    return true;
  } catch (e) { return false; }
}

/* ============ PRO ============ */
function applyPro() {
  $('proBadge').classList.toggle('hidden', !pro);
  $('loadClientBtn').classList.toggle('hidden', !pro);
  $('saveClientBtn').classList.toggle('hidden', !pro);
  $('salesbookBtn').classList.toggle('hidden', !pro);
}

/* ============ sales book ============ */
function getBook() { try { return JSON.parse(localStorage.getItem(LS.book) || '[]'); } catch (e) { return []; } }
function logToBook() {
  if (!pro) return;
  const c = calc();
  const book = getBook();
  book.push({
    date: $('invDate').value || todayISO(), no: $('invNo').value || String(book.length + 1).padStart(6, '0'),
    client: $('bName').value, tin: $('bTin').value, sub: c.sub, vat: c.vat, total: c.total
  });
  localStorage.setItem(LS.book, JSON.stringify(book));
}
function nextNumber() {
  const cur = parseInt($('invNo').value, 10) || 0;
  const stored = Number(localStorage.getItem(LS.counter) || 0);
  const n = Math.max(cur, stored) + 1;
  localStorage.setItem(LS.counter, String(n));
  return String(n).padStart(6, '0');
}
function renderBook() {
  const book = getBook();
  $('bookBody').innerHTML = book.length
    ? book.map(r => `<tr><td>${esc(r.date)}</td><td>${esc(r.no)}</td><td>${esc(r.client)}</td><td>${esc(r.tin)}</td>` +
        `<td class="r">${peso(r.sub)}</td><td class="r">${peso(r.vat)}</td><td class="r">${peso(r.total)}</td></tr>`).join('')
    : '<tr><td colspan="7" style="color:#667085">No invoices logged yet. Press “Print / Save as PDF”.</td></tr>';
}
function exportCsv() {
  const book = getBook();
  const rows = [['Date', 'Invoice No', 'Client', 'Client TIN', 'Net Amount', 'VAT', 'Total']]
    .concat(book.map(r => [r.date, r.no, r.client, r.tin, r.sub.toFixed(2), r.vat.toFixed(2), r.total.toFixed(2)]));
  const csv = rows.map(r => r.map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' }));
  a.download = 'invoiceph-salesbook.csv';
  a.click();
}

/* ============ clients ============ */
function getClients() { try { return JSON.parse(localStorage.getItem(LS.clients) || '[]'); } catch (e) { return []; } }
function saveClient() {
  const name = $('bName').value.trim();
  if (!name) { alert('Enter a client name first.'); return; }
  const clients = getClients().filter(c => c.name !== name);
  clients.push({ name, tin: $('bTin').value.trim(), addr: $('bAddr').value.trim() });
  localStorage.setItem(LS.clients, JSON.stringify(clients));
  alert('Client saved: ' + name);
}
function renderClients() {
  const list = getClients();
  $('clientList').innerHTML = list.length
    ? list.map((c, i) => `<li><div><strong>${esc(c.name)}</strong><br><small>${esc(c.tin || 'no TIN')} · ${esc(c.addr || '')}</small></div>` +
        `<button data-ci="${i}">Load</button></li>`).join('')
    : '<li style="color:#667085">No saved clients yet. Fill the client fields and press 💾 save.</li>';
}

/* ============ wire-up ============ */
document.addEventListener('DOMContentLoaded', () => {
  const restored = loadDraft();
  if (!$('invDate').value) $('invDate').value = todayISO();
  if (!$('invNo').value) $('invNo').value = pro ? nextNumber() : '000001';  renderItems();
  applyPro();

  // generic field -> preview
  ['sName','sTin','sAddr','vatMode','bName','bTin','bAddr','invNo','invDate','invDue','notes','terms']
    .forEach(id => $(id).addEventListener('input', render));

  // items events (delegated)
  $('items').addEventListener('input', e => {
    const t = e.target, i = +t.dataset.i, f = t.dataset.f;
    if (f === undefined || Number.isNaN(i)) return; // ignore non-item bubbling
    if (f === 'qty' || f === 'price') items[i][f] = Number(t.value) || 0; else items[i][f] = t.value;
    if (f === 'unit') t.closest('.item-row').querySelector('.unit-l').textContent = t.value;
    render();
  });
  $('items').addEventListener('click', e => {
    if (e.target.classList.contains('item-x')) { items.splice(+e.target.dataset.i, 1); renderItems(); render(); }
  });
  $('addItem').addEventListener('click', () => { items.push({ qty: 1, unit: 'hr', desc: '', price: 0 }); renderItems(); render(); });

  // print + log
  $('printBtn').addEventListener('click', () => { logToBook(); window.print(); });

  // new invoice (keeps seller identity)
  $('newBtn').addEventListener('click', () => {
    items = [{ qty: 1, unit: 'hr', desc: '', price: 0 }];
    $('bName').value = $('bTin').value = $('bAddr').value = '';
    $('invNo').value = pro ? nextNumber() : $('invNo').value;
    $('notes').value = $('terms').value = '';
    renderItems(); render();
  });

  // pro modal
  const openPay = () => { $('payModal').classList.remove('hidden'); $('codeMsg').textContent = ''; };
  $('proBtn').addEventListener('click', openPay);
  $('proBtn2').addEventListener('click', openPay);
  $('payClose').addEventListener('click', () => $('payModal').classList.add('hidden'));
  $('codeBtn').addEventListener('click', () => {
    const code = $('codeInput').value.trim().toUpperCase();
    if (PRO_CODES.includes(code)) {
      pro = true; localStorage.setItem(LS.pro, '1'); applyPro();
      $('codeMsg').textContent = '✓ PRO unlocked! Saved clients, sales book and auto-numbering are now active.';
      $('codeMsg').className = 'code-msg ok';
      setTimeout(() => $('payModal').classList.add('hidden'), 1600);
    } else {
      $('codeMsg').textContent = 'Invalid code. Check your payment reference and try again.';
      $('codeMsg').className = 'code-msg bad';
    }
  });
  $('codeInput').addEventListener('keydown', e => { if (e.key === 'Enter') $('codeBtn').click(); });

  // sales book modal
  $('salesbookBtn').addEventListener('click', () => { renderBook(); $('bookModal').classList.remove('hidden'); });
  $('bookClose').addEventListener('click', () => $('bookModal').classList.add('hidden'));
  $('exportCsv').addEventListener('click', exportCsv);
  $('clearBook').addEventListener('click', () => {
    if (confirm('Clear the whole sales book? This cannot be undone.')) { localStorage.removeItem(LS.book); renderBook(); }
  });

  // clients
  $('saveClientBtn').addEventListener('click', saveClient);
  $('loadClientBtn').addEventListener('click', () => { renderClients(); $('clientModal').classList.remove('hidden'); });
  $('clientClose').addEventListener('click', () => $('clientModal').classList.add('hidden'));
  $('clientList').addEventListener('click', e => {
    const btn = e.target.closest('button[data-ci]'); if (!btn) return;
    const c = getClients()[+btn.dataset.ci];
    if (c) { $('bName').value = c.name; $('bTin').value = c.tin || ''; $('bAddr').value = c.addr || ''; render(); $('clientModal').classList.add('hidden'); }
  });

  // close modals on backdrop
  document.querySelectorAll('.modal').forEach(m => m.addEventListener('click', e => { if (e.target === m) m.classList.add('hidden'); }));

  render();
  if (restored) { /* draft restored silently */ }
});
