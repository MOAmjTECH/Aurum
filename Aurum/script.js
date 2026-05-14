  /* ══════════════════════════════════════
       STORAGE
    ══════════════════════════════════════ */
    const USERS_KEY   = "aurum_users";
    const SESSION_KEY = "aurum_session";
    const TXN_KEY     = "aurum_txns";
    const SESSION_TTL = 1000 * 60 * 60;

    const getUsers    = () => { try { return JSON.parse(localStorage.getItem(USERS_KEY)) || {}; } catch { return {}; } };
    const saveUsers   = u  => localStorage.setItem(USERS_KEY, JSON.stringify(u));
    const getTxns     = () => { try { return JSON.parse(localStorage.getItem(TXN_KEY))  || []; } catch { return []; } };
    const saveTxns    = t  => localStorage.setItem(TXN_KEY, JSON.stringify(t));

    function saveSession(email, name) {
      localStorage.setItem(SESSION_KEY, JSON.stringify({ email, name, expires: Date.now() + SESSION_TTL }));
    }
    function getSession() {
      try {
        const s = JSON.parse(localStorage.getItem(SESSION_KEY));
        if (!s || Date.now() > s.expires) { clearSession(); return null; }
        return s;
      } catch { return null; }
    }
    function clearSession() { localStorage.removeItem(SESSION_KEY); }
    const isValidEmail = e => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

    /* ══════════════════════════════════════
       VIEW SWITCHING
    ══════════════════════════════════════ */
    const views = ["viewSignin","viewRegister","viewTracker"];
    function show(id) {
      views.forEach(v => document.getElementById(v).classList.add("hidden"));
      document.getElementById(id).classList.remove("hidden");
      window.scrollTo(0,0);
    }

    /* ══════════════════════════════════════
       PASSWORD TOGGLES
    ══════════════════════════════════════ */
    document.querySelectorAll(".toggle-pw").forEach(btn => {
      btn.addEventListener("click", () => {
        const inp = document.getElementById(btn.dataset.target);
        const h = inp.type === "password";
        inp.type = h ? "text" : "password";
        btn.textContent = h ? "🙈" : "👁";
      });
    });

    /* ══════════════════════════════════════
       ERROR HELPERS
    ══════════════════════════════════════ */
    const showErr = (id, msg) => { const el = document.getElementById(id); el.textContent = msg; el.classList.add("visible"); };
    const hideErr = id => document.getElementById(id).classList.remove("visible");
    function shakeCard(id) {
      const c = document.getElementById(id);
      c.style.animation = "none"; c.offsetHeight;
      c.style.animation = "shake 0.4s ease";
    }

    /* ══════════════════════════════════════
       SIGN IN
    ══════════════════════════════════════ */
    function attemptSignIn() {
      const email = document.getElementById("siEmail").value.trim();
      const pw    = document.getElementById("siPassword").value;
      hideErr("signinError");
      if (!email)               return showErr("signinError","Please enter your email address.");
      if (!isValidEmail(email)) return showErr("signinError","Please enter a valid email address.");
      if (!pw)                  return showErr("signinError","Please enter your password.");
      fetch("http://localhost:3000/login", {
    method: "POST",
    headers: {
        "Content-Type": "application/json"
    },
    body: JSON.stringify({
        email,
        password: pw
    })
})
.then(res => res.json())
.then(data => {

    if (data.user) {
        saveSession(email, data.user.name);
        loadTracker(data.user);
    } else {
        showErr("signinError", data.message || "Login failed");
        shakeCard("signinCard");
    }

})
.catch(err => {
    console.log(err);
    showErr("signinError", "Server error");
});
    }

    document.getElementById("signinBtn").addEventListener("click", attemptSignIn);
    ["siEmail","siPassword"].forEach(id => {
      document.getElementById(id).addEventListener("keydown", e => { if(e.key==="Enter") attemptSignIn(); });
      document.getElementById(id).addEventListener("input",   () => hideErr("signinError"));
    });

    /* ══════════════════════════════════════
       REGISTER
    ══════════════════════════════════════ */
    function attemptRegister() {
      const name  = document.getElementById("regName").value.trim();
      const email = document.getElementById("regEmail").value.trim();
      const pw    = document.getElementById("regPassword").value;
      const conf  = document.getElementById("regConfirm").value;
      hideErr("registerError");
      if (!name)               return showErr("registerError","Please enter your full name.");
      if (!email)              return showErr("registerError","Please enter your email address.");
      if (!isValidEmail(email)) return showErr("registerError","Please enter a valid email address.");
      if (pw.length < 6)       return showErr("registerError","Password must be at least 6 characters.");
      if (pw !== conf)         return showErr("registerError","Passwords do not match.");
      const users = getUsers();
      if (users[email.toLowerCase()]) {
        shakeCard("registerCard");
        return showErr("registerError","An account with this email already exists.");
      }
      
    fetch("http://localhost:3000/register", {
    method: "POST",
    headers: {
        "Content-Type": "application/json"
    },
    body: JSON.stringify({
        name,
        email,
        password: pw
    })
})
.then(res => res.json())
.then(data => {
    console.log(data);

    saveSession(email, name);
    loadTracker({ name, email });
});
    }

    document.getElementById("registerBtn").addEventListener("click", attemptRegister);
    ["regName","regEmail","regPassword","regConfirm"].forEach(id => {
      document.getElementById(id).addEventListener("keydown", e => { if(e.key==="Enter") attemptRegister(); });
      document.getElementById(id).addEventListener("input",   () => hideErr("registerError"));
    });

    /* ══════════════════════════════════════
       NAV LINKS
    ══════════════════════════════════════ */
    document.getElementById("goToRegister").addEventListener("click", e => { e.preventDefault(); show("viewRegister"); });
    document.getElementById("goToSignin").addEventListener("click",   e => { e.preventDefault(); show("viewSignin"); });
    document.getElementById("signoutBtn").addEventListener("click",   e => { e.preventDefault(); clearSession(); show("viewSignin"); });

    /* ══════════════════════════════════════
       TRACKER — LOAD
    ══════════════════════════════════════ */
    function loadTracker(user) {
      const first = (user.name || user.email.split("@")[0]);
      const disp  = first.charAt(0).toUpperCase() + first.slice(1);
      document.getElementById("userGreeting").textContent = "Welcome back, " + disp + " 👋";

      // Set today's date in form
      document.getElementById("txnDate").valueAsDate = new Date();

      // Month label
      const now = new Date();
      const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
      document.getElementById("balanceMonth").textContent  = months[now.getMonth()] + " " + now.getFullYear();
      document.getElementById("currentMonth").textContent  = months[now.getMonth()];

      // Fetch transactions from server
      fetch(`http://localhost:3000/transactions/${user.email}`)
        .then(res => res.json())
        .then(txns => {
          // Normalize data from server
          const normalized = txns.map(t => ({
            id: t.id,
            description: t.description,
            desc: t.description,
            amount: parseFloat(t.amount),
            date: t.date,
            type: t.type,
            category: t.category
          }));
          saveTxns(normalized);
          renderAll();
        })
        .catch(err => {
          console.log("Failed to fetch transactions:", err);
          renderAll(); // Render with localStorage data as fallback
        });

      show("viewTracker");
    }

    /* ══════════════════════════════════════
       TRACKER — RENDER
    ══════════════════════════════════════ */
    const CAT_COLORS = {
      salary:"#52b788", freelance:"#c9a84c", food:"#e07a5f",
      shopping:"#9c6fb5", transport:"#3d7ebe", utilities:"#e08c3a", other:"#9b948f"
    };

    let activeFilter = "all";

    function fmt(n) {
      const num = typeof n === 'string' ? parseFloat(n) : n;
      return "R " + Math.abs(num).toLocaleString("en-ZA", { minimumFractionDigits:2, maximumFractionDigits:2 });
    }

    function renderAll() {
      const txns    = getTxns();
      const income  = txns.filter(t => t.type === "income").reduce((s,t) => s + parseFloat(t.amount || 0), 0);
      const expense = txns.filter(t => t.type === "expense").reduce((s,t) => s + parseFloat(t.amount || 0), 0);
      const balance = income - expense;
      const pct     = income > 0 ? Math.min(100, Math.round((expense / income) * 100)) : 0;

      // Balance card
      document.getElementById("balanceAmount").textContent  = fmt(balance);
      document.getElementById("totalIncome").textContent    = fmt(income);
      document.getElementById("totalExpenses").textContent  = fmt(expense);

      // Progress
      document.getElementById("spendLabel").textContent   = fmt(expense);
      document.getElementById("incomeLabel").textContent  = fmt(income);
      document.getElementById("progressFill").style.width = pct + "%";
      document.getElementById("progressText").textContent = "You have spent " + pct + "% of your total income this month.";

      // Overview tiles
      const expTxns = txns.filter(t => t.type === "expense");
      document.getElementById("txnCount").textContent  = txns.length;
      document.getElementById("avgExpense").textContent = expTxns.length
        ? "R " + Math.round(expense / expTxns.length).toLocaleString("en-ZA")
        : "R 0";

      // Categories
      renderCategories(txns);

      // Transaction list
      renderTxnList(txns);
    }

    function renderCategories(txns) {
      const totals = {};
      txns.forEach(t => {
        const amt = parseFloat(t.amount || 0);
        totals[t.category] = (totals[t.category] || 0) + amt;
      });
      const max = Math.max(...Object.values(totals), 1);
      const catList = document.getElementById("catList");
      if (!Object.keys(totals).length) {
        catList.innerHTML = '<p class="empty-state" style="padding:8px;">No transactions yet.</p>';
        return;
      }
      catList.innerHTML = Object.entries(totals)
        .sort((a,b) => b[1]-a[1])
        .map(([cat, amt]) => `
          <div class="cat-row">
            <span class="cat-dot" style="background:${CAT_COLORS[cat]||'#9b948f'};"></span>
            <span class="cat-name">${cat.charAt(0).toUpperCase()+cat.slice(1)}</span>
            <div class="cat-bar-track">
              <div class="cat-bar-fill" style="width:${Math.round((amt/max)*100)}%;background:${CAT_COLORS[cat]||'#9b948f'};"></div>
            </div>
            <span class="cat-amount">${fmt(amt)}</span>
          </div>`).join("");
    }

    function renderTxnList(txns) {
      const list = document.getElementById("txnList");
      const filtered = activeFilter === "all" ? txns
        : txns.filter(t => t.type === activeFilter);

      if (!filtered.length) {
        list.innerHTML = '<p class="empty-state">No transactions here yet.</p>';
        return;
      }

      // Sort newest first
      const sorted = [...filtered].sort((a,b) => new Date(b.date) - new Date(a.date));

      list.innerHTML = sorted.map(t => `
        <div class="txn txn--${t.type}">
          <span class="txn__dot"></span>
          <div class="txn__info">
            <p class="txn__desc">${t.description || t.desc}</p>
            <div class="txn__meta">
              <span class="txn__badge badge--${t.category}">${t.category}</span>
              <span style="font-size:10px;color:var(--ash);">${formatDate(t.date)}</span>
            </div>
          </div>
          <div class="txn__amount" style="color:${t.type==='income'?'var(--income-deep)':'var(--expense-deep)'};">
            ${t.type==='income'?'+':'-'}${fmt(t.amount)}
          </div>
          <button class="txn__delete" data-id="${t.id}" title="Delete">🗑</button>
        </div>`).join("");

      // Delete listeners
      list.querySelectorAll(".txn__delete").forEach(btn => {
        btn.addEventListener("click", () => {
          const txnId = parseInt(btn.dataset.id, 10);
          fetch(`http://localhost:3000/transactions/${txnId}`, {
            method: "DELETE"
          })
          .then(() => {
            const txns = getTxns().filter(t => t.id !== txnId);
            saveTxns(txns);
            renderAll();
          })
          .catch(err => {
            console.log("Delete error:", err);
            showErr("txnError", "Failed to delete transaction");
          });
        });
      });
    }

    function formatDate(d) {
      let dt;
      if (typeof d === 'string') {
        // Handle YYYY-MM-DD format from server
        if (d.includes('T')) {
          dt = new Date(d);
        } else {
          dt = new Date(d + "T00:00:00");
        }
      } else {
        dt = new Date(d);
      }
      return dt.toLocaleDateString("en-ZA", { day:"numeric", month:"short", year:"numeric" });
    }

    /* ══════════════════════════════════════
       ADD TRANSACTION
    ══════════════════════════════════════ */
    document.getElementById("addTxnBtn").addEventListener("click", () => {
      const session = getSession();
      if (!session) {
        showErr("txnError", "Session expired. Please sign in again.");
        show("viewSignin");
        return;
      }

      const desc  = document.getElementById("txnDesc").value.trim();
      const amt   = parseFloat(document.getElementById("txnAmount").value);
      const date  = document.getElementById("txnDate").value;
      const type  = document.getElementById("txnType").value;
      const cat   = document.getElementById("txnCategory").value;

      hideErr("txnError");

      if (!desc)         return showErr("txnError","Please enter a description.");
      if (!amt || amt<=0) return showErr("txnError","Please enter a valid amount.");
      if (!date)         return showErr("txnError","Please select a date.");

      fetch("http://localhost:3000/transactions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            user_email: session.email,
            description: desc,
            amount: amt,
            date,
            type,
            category: cat
        })
      })
      .then(() => {
          // Save to localStorage as well
          const txns = getTxns();
          txns.push({
            id: Date.now().toString(),
            description: desc,
            desc,
            amount: amt,
            date,
            type,
            category: cat
          });
          saveTxns(txns);

          // Clear form
          document.getElementById("txnDesc").value   = "";
          document.getElementById("txnAmount").value = "";
          document.getElementById("txnDate").valueAsDate = new Date();
          renderAll();
      })
      .catch(err => {
          console.log(err);
          showErr("txnError", "Failed to save transaction");
      });
    });

    /* ══════════════════════════════════════
       FILTER TABS
    ══════════════════════════════════════ */
    document.querySelectorAll(".filter-tab").forEach(tab => {
      tab.addEventListener("click", () => {
        document.querySelectorAll(".filter-tab").forEach(t => t.classList.remove("active"));
        tab.classList.add("active");
        activeFilter = tab.dataset.filter;
        renderTxnList(getTxns());
      });
    });

    /* ══════════════════════════════════════
       AUTO-LOGIN
    ══════════════════════════════════════ */
    const session = getSession();
    if (session) loadTracker({ name: session.name, email: session.email });
    else show("viewSignin");