// ── State ──────────────────────────────────────────────────────────────────
const STORAGE_KEY = 'aurum_transactions';

let transactions = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null') || [
  { id: 1, desc: 'Monthly Salary',          type: 'income',  amount: 15000, category: 'salary',        date: '2025-04-27' },
  { id: 2, desc: 'Grocery Shopping',         type: 'expense', amount: 1320,  category: 'food',          date: '2025-04-20' },
  { id: 3, desc: 'Freelance Design Project', type: 'income',  amount: 6500,  category: 'freelance',     date: '2025-04-25' },
  { id: 4, desc: 'Electricity & Water',      type: 'expense', amount: 980,   category: 'utilities',     date: '2025-04-22' },
  { id: 5, desc: 'Woolworths — Clothing',    type: 'expense', amount: 2450,  category: 'shopping',      date: '2025-04-24' },
  { id: 6, desc: 'Uber & Petrol',            type: 'expense', amount: 620,   category: 'transport',     date: '2025-03-31' },
  { id: 7, desc: 'Netflix & Spotify',        type: 'expense', amount: 299,   category: 'entertainment', date: '2025-03-30' },
  { id: 8, desc: 'Restaurant — Dinner',      type: 'expense', amount: 581,   category: 'food',          date: '2025-03-28' },
];

let nextId     = transactions.length ? Math.max(...transactions.map(t => t.id)) + 1 : 1;
let activeFilter = 'all'; // 'all' | 'income' | 'expense'

// ── Config ─────────────────────────────────────────────────────────────────
const CATEGORY_META = {
  salary:        { label: 'Salary',        color: '#52b788', badgeClass: 'badge--salary'     },
  freelance:     { label: 'Freelance',     color: '#c9a84c', badgeClass: 'badge--freelance'  },
  'other-income':{ label: 'Other Income',  color: '#9b948f', badgeClass: 'badge--other'      },
  food:          { label: 'Food',          color: '#e07a5f', badgeClass: 'badge--food'        },
  transport:     { label: 'Transport',     color: '#3d7ebe', badgeClass: 'badge--transport'   },
  shopping:      { label: 'Shopping',      color: '#9c6fb5', badgeClass: 'badge--shopping'    },
  utilities:     { label: 'Utilities',     color: '#e08c3a', badgeClass: 'badge--utilities'   },
  health:        { label: 'Health',        color: '#4caf82', badgeClass: 'badge--health'      },
  entertainment: { label: 'Entertainment', color: '#9b948f', badgeClass: 'badge--other'       },
  other:         { label: 'Other',         color: '#9b948f', badgeClass: 'badge--other'       },
};

// ── Helpers ────────────────────────────────────────────────────────────────
const fmt    = n => n.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtShort = n => n >= 1000 ? 'R ' + (n / 1000).toFixed(1) + 'k' : 'R ' + Math.round(n);

function escHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
}

function showToast(msg) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2500);
}

function formatDateDisplay(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-ZA', { day: '2-digit', month: 'short', year: 'numeric' });
}

function getMonthLabel(dateStr) {
  if (!dateStr) return 'Unknown';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-ZA', { month: 'long', year: 'numeric' });
}

function currentMonthLabel() {
  return new Date().toLocaleDateString('en-ZA', { month: 'long', year: 'numeric' });
}

// ── Render: Balance Card ───────────────────────────────────────────────────
function renderBalanceCard() {
  const income  = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const expense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const balance = income - expense;

  const balanceEl = document.querySelector('.balance-amount');
  if (balanceEl) {
    balanceEl.innerHTML = `<span class="currency">R</span>${fmt(balance)}`;
  }

  const incomeVal  = document.querySelector('.stat--income  .stat__value');
  const expenseVal = document.querySelector('.stat--expense .stat__value');
  if (incomeVal)  incomeVal.textContent  = 'R ' + fmt(income);
  if (expenseVal) expenseVal.textContent = 'R ' + fmt(expense);

  const monthEl = document.querySelector('.balance-month');
  if (monthEl) monthEl.textContent = currentMonthLabel();
}

// ── Render: Dashboard Overview ─────────────────────────────────────────────
function renderDashboard() {
  const income  = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const expense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const expenseTxns = transactions.filter(t => t.type === 'expense');
  const pct     = income > 0 ? Math.round((expense / income) * 100) : 0;
  const avgExp  = expenseTxns.length > 0 ? Math.round(expense / expenseTxns.length) : 0;

  // Budget progress bar
  const fill = document.querySelector('.progress-fill');
  if (fill) {
    fill.style.width = Math.min(pct, 100) + '%';
    fill.classList.toggle('progress-fill--warning', pct > 60);
  }

  const budgetFigures = document.querySelector('.budget-figures');
  if (budgetFigures) {
    budgetFigures.innerHTML = `<strong>R ${fmt(expense)}</strong> of R ${fmt(income)}`;
  }

  const budgetNote = document.querySelector('.budget-note');
  if (budgetNote) {
    const msg = pct <= 40
      ? `You have spent <span>${pct}%</span> of your total income this month. Well done!`
      : pct <= 70
      ? `You have spent <span>${pct}%</span> of your total income this month. Stay mindful.`
      : `You have spent <span>${pct}%</span> of your total income — consider cutting back.`;
    budgetNote.innerHTML = msg;
  }

  // Overview tiles
  const tiles = document.querySelectorAll('.overview-tile__value');
  if (tiles[0]) tiles[0].textContent = transactions.length;
  if (tiles[1]) tiles[1].textContent = new Date().toLocaleDateString('en-ZA', { month: 'short' });
  if (tiles[2]) tiles[2].textContent = avgExp > 0 ? fmtShort(avgExp) : '—';
}

// ── Render: Category Breakdown ─────────────────────────────────────────────
function renderCategories() {
  const catList = document.querySelector('.cat-list');
  if (!catList) return;

  // Tally per category
  const totals = {};
  transactions.forEach(t => {
    const key = t.category || 'other';
    totals[key] = (totals[key] || 0) + t.amount;
  });

  // Find max for bar scaling
  const maxVal = Math.max(...Object.values(totals), 1);

  // Sort by amount descending
  const sorted = Object.entries(totals).sort((a, b) => b[1] - a[1]);

  catList.innerHTML = sorted.map(([cat, total]) => {
    const meta  = CATEGORY_META[cat] || CATEGORY_META['other'];
    const width = Math.round((total / maxVal) * 100);
    return `
      <div class="cat-row">
        <span class="cat-dot" style="background:${meta.color};"></span>
        <span class="cat-name">${meta.label}</span>
        <div class="cat-bar-track">
          <div class="cat-bar-fill" style="width:${width}%; background:${meta.color};"></div>
        </div>
        <span class="cat-amount">R ${fmt(total)}</span>
      </div>`;
  }).join('');
}

// ── Render: Transaction List ───────────────────────────────────────────────
function renderTransactions() {
  const list = document.querySelector('.transactions-list');
  if (!list) return;

  // Apply filter
  const filtered = activeFilter === 'all'
    ? transactions
    : transactions.filter(t => t.type === activeFilter);

  if (filtered.length === 0) {
    list.innerHTML = '<p style="padding:24px;text-align:center;color:var(--ash);font-size:13px;">No transactions found.</p>';
    return;
  }

  // Sort newest first
  const sorted = filtered.slice().sort((a, b) => new Date(b.date) - new Date(a.date));

  // Group by month
  const groups = {};
  sorted.forEach(t => {
    const label = getMonthLabel(t.date);
    if (!groups[label]) groups[label] = [];
    groups[label].push(t);
  });

  list.innerHTML = Object.entries(groups).map(([month, txns], groupIdx) => {
    const rows = txns.map((t, i) => {
      const meta = CATEGORY_META[t.category] || CATEGORY_META['other'];
      const isNew = groupIdx === 0 && i === 0;
      return `
        <div class="txn txn--${t.type}${isNew ? ' txn-new' : ''}" data-id="${t.id}">
          <span class="txn__dot"></span>
          <div class="txn__info">
            <p class="txn__desc">${escHtml(t.desc)}</p>
            <div class="txn__meta">
              <span class="txn__badge ${meta.badgeClass}">${meta.label}</span>
              <span class="txn__date">${formatDateDisplay(t.date)}</span>
            </div>
          </div>
          <div class="txn__right">
            <p class="txn__amount">
              <span class="txn__sign">${t.type === 'income' ? '+' : '−'}</span>R ${fmt(t.amount)}
            </p>
          </div>
          <button class="txn__delete" title="Delete" onclick="deleteTransaction(${t.id})"
            style="background:none;border:none;cursor:pointer;font-size:11px;color:var(--ash);padding:4px 6px;opacity:0.6;transition:opacity 0.2s;"
            onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0.6'">✕</button>
        </div>`;
    }).join('');

    return `<div class="txn-month-group">${month}</div>${rows}`;
  }).join('');
}

// ── Master Render ──────────────────────────────────────────────────────────
function render() {
  renderBalanceCard();
  renderDashboard();
  renderCategories();
  renderTransactions();
}

// ── Add Transaction ────────────────────────────────────────────────────────
document.querySelector('.btn-add').addEventListener('click', () => {
  const descEl     = document.getElementById('desc');
  const amountEl   = document.getElementById('amount');
  const typeEl     = document.getElementById('type');
  const categoryEl = document.getElementById('category');
  const dateEl     = document.getElementById('date');

  const desc     = descEl.value.trim();
  const amount   = parseFloat(amountEl.value);
  const type     = typeEl.value;
  const category = categoryEl.value;
  const date     = dateEl.value || new Date().toISOString().slice(0, 10);

  // Validation
  let valid = true;
  [descEl, amountEl, typeEl, categoryEl].forEach(el => el.classList.remove('error'));

  if (!desc)              { descEl.classList.add('error');     valid = false; }
  if (!amount || amount <= 0) { amountEl.classList.add('error'); valid = false; }
  if (!type)              { typeEl.classList.add('error');     valid = false; }
  if (!category)          { categoryEl.classList.add('error'); valid = false; }

  if (!valid) { showToast('Please fill in all fields correctly.'); return; }

  transactions.push({ id: nextId++, desc, type, amount, category, date });
  save();
  render();

  // Reset form
  descEl.value     = '';
  amountEl.value   = '';
  typeEl.value     = '';
  categoryEl.value = '';
  // Keep date as-is for convenience

  showToast(type === 'income' ? '↑ Income added' : '↓ Expense added');
});

// Enter key submits form
['desc', 'amount', 'type', 'category', 'date'].forEach(id => {
  const el = document.getElementById(id);
  if (el) el.addEventListener('keydown', e => {
    if (e.key === 'Enter') document.querySelector('.btn-add').click();
  });
});

// ── Delete Transaction ─────────────────────────────────────────────────────
function deleteTransaction(id) {
  transactions = transactions.filter(t => t.id !== id);
  save();
  render();
  showToast('Transaction removed.');
}

// ── Filter Tabs ────────────────────────────────────────────────────────────
document.querySelectorAll('.filter-tab').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-tab').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const label = btn.textContent.trim().toLowerCase();
    activeFilter = label === 'income' ? 'income' : label === 'expenses' ? 'expense' : 'all';
    renderTransactions();
  });
});

// ── Set today's date as default ────────────────────────────────────────────
const dateInput = document.getElementById('date');
if (dateInput && !dateInput.value) {
  dateInput.value = new Date().toISOString().slice(0, 10);
}

// ── Init ───────────────────────────────────────────────────────────────────
render();