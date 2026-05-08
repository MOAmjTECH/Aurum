/* ============================================================
   Aurum Finance — auth.js
   Handles: sign-in validation, redirect, sign-out, session
   ============================================================ */

// ── Demo credentials (replace with real auth later) ──
const DEMO_EMAIL    = null;        // null = accept ANY email
const DEMO_PASSWORD = "test123";

// ── How long the "session" lasts (ms) ──
const SESSION_DURATION = 1000 * 60 * 60; // 1 hour

/* ============================================================
   PAGE DETECTION
   Runs the right logic depending on which page is loaded
   ============================================================ */
document.addEventListener("DOMContentLoaded", () => {
  const page = document.body.dataset.page;

  if (page === "signin") {
    initSignIn();
  } else if (page === "tracker") {
    guardPage();       // redirect to sign-in if not logged in
    initSignOut();
    showUserGreeting();
  }
});

/* ============================================================
   SIGN-IN PAGE
   ============================================================ */
function initSignIn() {
  // If already logged in, skip straight to tracker
  if (isLoggedIn()) {
    window.location.href = "tracker.html";
    return;
  }

  const btn       = document.getElementById("signinBtn");
  const emailEl   = document.getElementById("email");
  const passwordEl= document.getElementById("password");
  const errorMsg  = document.getElementById("errorMsg");
  const togglePw  = document.getElementById("togglePw");

  // ── Show / hide password ──
  togglePw.addEventListener("click", () => {
    const hidden = passwordEl.type === "password";
    passwordEl.type      = hidden ? "text" : "password";
    togglePw.textContent = hidden ? "🙈" : "👁";
  });

  // ── Sign-in button click ──
  btn.addEventListener("click", attemptSignIn);

  // ── Allow Enter key to submit ──
  [emailEl, passwordEl].forEach(el => {
    el.addEventListener("keydown", e => {
      if (e.key === "Enter") attemptSignIn();
    });
  });

  // ── Clear error when user starts typing again ──
  [emailEl, passwordEl].forEach(el => {
    el.addEventListener("input", () => hideError());
  });

  /* ── Core sign-in logic ── */
  function attemptSignIn() {
    const email = emailEl.value.trim();
    const pw    = passwordEl.value;

    hideError();

    // Empty field checks
    if (!email) {
      showError("Please enter your email address.");
      emailEl.focus();
      return;
    }
    if (!isValidEmail(email)) {
      showError("Please enter a valid email address.");
      emailEl.focus();
      return;
    }
    if (!pw) {
      showError("Please enter your password.");
      passwordEl.focus();
      return;
    }

    // Credential check
    const emailOk = DEMO_EMAIL === null || email === DEMO_EMAIL;
    const pwOk    = pw === DEMO_PASSWORD;

    if (!emailOk || !pwOk) {
      showError("Invalid email or password. Try password: test123");
      shakeCard();
      passwordEl.value = "";
      passwordEl.focus();
      return;
    }

    // ✅ Credentials valid — store session & redirect
    setLoading(true);
    saveSession(email);

    setTimeout(() => {
      window.location.href = "tracker.html";
    }, 1100);
  }

  function showError(msg) {
    errorMsg.textContent = msg;
    errorMsg.classList.add("visible");
  }
  function hideError() {
    errorMsg.classList.remove("visible");
  }
  function setLoading(on) {
    btn.classList.toggle("loading", on);
    btn.disabled = on;
  }
  function shakeCard() {
    const card = document.querySelector(".signin-card");
    card.style.animation = "none";
    card.offsetHeight; // reflow
    card.style.animation = "shake 0.4s ease";
  }
}

/* ============================================================
   TRACKER PAGE
   ============================================================ */

/* Redirect to sign-in if no valid session */
function guardPage() {
  if (!isLoggedIn()) {
    window.location.href = "signin.html";
  }
}

/* Wire up the Sign Out button */
function initSignOut() {
  const btn = document.getElementById("signoutBtn");
  if (!btn) return;

  btn.addEventListener("click", (e) => {
    e.preventDefault();
    clearSession();
    window.location.href = "signin.html";
  });
}

/* Show the logged-in user's email in the greeting */
function showUserGreeting() {
  const email   = getSessionEmail();
  const el      = document.getElementById("userGreeting");
  if (el && email) {
    const name = email.split("@")[0];                      // e.g. "jane"
    const display = name.charAt(0).toUpperCase() + name.slice(1);
    el.textContent = "Welcome back, " + display;
  }
}

/* ============================================================
   SESSION HELPERS  (localStorage)
   ============================================================ */
function saveSession(email) {
  const session = {
    email,
    expires: Date.now() + SESSION_DURATION,
  };
  localStorage.setItem("aurum_session", JSON.stringify(session));
}

function isLoggedIn() {
  try {
    const raw = localStorage.getItem("aurum_session");
    if (!raw) return false;
    const session = JSON.parse(raw);
    if (Date.now() > session.expires) {
      clearSession();
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

function getSessionEmail() {
  try {
    const raw = localStorage.getItem("aurum_session");
    return raw ? JSON.parse(raw).email : null;
  } catch {
    return null;
  }
}

function clearSession() {
  localStorage.removeItem("aurum_session");
}

/* ============================================================
   UTILITIES
   ============================================================ */
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  console.log("JS connected");
}