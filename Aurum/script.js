  // ── State ──────────────────────────────────────────────────
    const STORAGE_KEY = 'aurum_transactions';

    let transactions = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null') || [
      { id: 1, desc: 'Monthly Salary',          type: 'income',  amount: 15000 },
      { id: 2, desc: 'Grocery Shopping',         type: 'expense', amount: 1320  },
      { id: 3, desc: 'Freelance Design Project', type: 'income',  amount: 6500  },
      { id: 4, desc: 'Electricity & Water',      type: 'expense', amount: 980   },
      { id: 5, desc: 'Woolworths — Clothing',    type: 'expense', amount: 2450  },
      { id: 6, desc: 'Uber & Petrol',            type: 'expense', amount: 620   },
      { id: 7, desc: 'Netflix & Spotify',        type: 'expense', amount: 299   },
      { id: 8, desc: 'Restaurant — Dinner',      type: 'expense', amount: 581   },
    ];

    let nextId = transactions.length ? Math.max(...transactions.map(t => t.id)) + 1 : 1;

    // ── Helpers ────────────────────────────────────────────────
    const fmt = n => n.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    function save() {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
    }

    function showToast(msg) {
      const toast = document.getElementById('toast');
      toast.textContent = msg;
      toast.classList.add('show');
      setTimeout(() => toast.classList.remove('show'), 2500);
    }

    // ── Render ─────────────────────────────────────────────────
    function render() {
      const list = document.getElementById('txn-list');

      // Totals
      const income  = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
      const expense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
      const balance = income - expense;

      document.getElementById('balance').textContent      = fmt(balance);
      document.getElementById('total-income').textContent  = 'R ' + fmt(income);
      document.getElementById('total-expense').textContent = 'R ' + fmt(expense);

      // List
      if (transactions.length === 0) {
        list.innerHTML = '<p class="txn-empty">No transactions yet. Add one above.</p>';
        return;
      }

      list.innerHTML = transactions.slice().reverse().map(t => `
        <div class="txn txn--${t.type}" data-id="${t.id}">
          <span class="txn__dot"></span>
          <div class="txn__info">
            <p class="txn__desc">${escHtml(t.desc)}</p>
            <p class="txn__category">${t.type === 'income' ? 'Income' : 'Expense'}</p>
          </div>
          <p class="txn__amount">
            <span class="txn__sign">${t.type === 'income' ? '+' : '−'}</span>R ${fmt(t.amount)}
          </p>
          <button class="txn__delete" title="Delete" onclick="deleteTransaction(${t.id})">✕</button>
        </div>
      `).join('');

      // Animate the first (newest) item
      const first = list.querySelector('.txn');
      if (first) first.classList.add('txn-new');
    }

    function escHtml(str) {
      return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
    }

    // ── Add Transaction ────────────────────────────────────────
    document.getElementById('btn-add').addEventListener('click', () => {
      const descEl   = document.getElementById('desc');
      const amountEl = document.getElementById('amount');
      const typeEl   = document.getElementById('type');

      const desc   = descEl.value.trim();
      const amount = parseFloat(amountEl.value);
      const type   = typeEl.value;

      // Validation
      let valid = true;
      [descEl, amountEl, typeEl].forEach(el => el.classList.remove('error'));

      if (!desc)             { descEl.classList.add('error');   valid = false; }
      if (!amount || amount <= 0) { amountEl.classList.add('error'); valid = false; }
      if (!type)             { typeEl.classList.add('error');   valid = false; }

      if (!valid) { showToast('Please fill in all fields correctly.'); return; }

      transactions.push({ id: nextId++, desc, type, amount });
      save();
      render();

      // Reset form
      descEl.value   = '';
      amountEl.value = '';
      typeEl.value   = '';

      showToast(type === 'income' ? '↑ Income added' : '↓ Expense added');
    });

    // Allow Enter key on inputs to submit
    ['desc', 'amount', 'type'].forEach(id => {
      document.getElementById(id).addEventListener('keydown', e => {
        if (e.key === 'Enter') document.getElementById('btn-add').click();
      });
    });

    // ── Delete Transaction ─────────────────────────────────────
    function deleteTransaction(id) {
      transactions = transactions.filter(t => t.id !== id);
      save();
      render();
      showToast('Transaction removed.');
    }

    // ── Init ───────────────────────────────────────────────────
    render();