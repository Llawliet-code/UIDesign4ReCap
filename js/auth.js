// =====================
// auth.js
// Plain script (no ES module) — uses Firebase v9 compat CDN
// loaded via <script> tags in index.html BEFORE this file
// =====================

const firebaseConfig = {
  apiKey:            "AIzaSyDlHHUNhFgCNXILTRCSo_Oa3ZQcywNMG9I",
  authDomain:        "recap-6dbce.firebaseapp.com",
  projectId:         "recap-6dbce",
  storageBucket:     "recap-6dbce.firebasestorage.app",
  messagingSenderId: "965752248609",
  appId:             "1:965752248609:web:d6bb866fc773edd5c5c660",
  measurementId:     "G-S0ZTSEH9D9"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db   = firebase.firestore();

// =====================
// MODAL HELPERS
// =====================

function openLoginModal() {
  document.getElementById('login-modal').classList.add('open');
  clearAuthErrors();
}

function closeLoginModal() {
  document.getElementById('login-modal').classList.remove('open');
  clearAuthErrors();
}

function openRegisterModal() {
  document.getElementById('register-modal').classList.add('open');
  clearAuthErrors();
}

function closeRegisterModal() {
  document.getElementById('register-modal').classList.remove('open');
  clearAuthErrors();
}

// Keep openAuthModal as a convenience alias used by the nav buttons
function openAuthModal(tab) {
  if (tab === 'register') openRegisterModal();
  else openLoginModal();
}

function clearAuthErrors() {
  document.querySelectorAll('.auth-error').forEach(el => {
    el.textContent = '';
    el.style.display = 'none';
  });
}

function showError(formId, message) {
  const el = document.querySelector(`#${formId} .auth-error`);
  if (el) {
    el.textContent = message;
    el.style.display = 'block';
  }
}

function setLoading(btnId, loading) {
  const btn = document.getElementById(btnId);
  if (!btn) return;
  btn.disabled    = loading;
  btn.textContent = loading ? 'Please wait...' : btn.dataset.label;
}

// =====================
// LOGIN
// =====================

function handleLogin(e) {
  e.preventDefault();
  const email    = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;

  clearAuthErrors();
  setLoading('btn-login', true);

  auth.signInWithEmailAndPassword(email, password)
    .then(credential => {
      return db.collection('users').doc(credential.user.uid).get()
        .then(userDoc => {
          if (!userDoc.exists) {
            showError('form-login', 'Account data not found. Please contact the librarian.');
            return auth.signOut();
          }
          closeLoginModal();
          applyUserSession(credential.user, userDoc.data());
        });
    })
    .catch(err => showError('form-login', friendlyError(err.code)))
    .finally(() => setLoading('btn-login', false));
}

// =====================
// REGISTER
// =====================

function handleRegister(e) {
  e.preventDefault();
  const name     = document.getElementById('reg-name').value.trim();
  const email    = document.getElementById('reg-email').value.trim();
  const password = document.getElementById('reg-password').value;
  const confirm  = document.getElementById('reg-confirm').value;
  const role     = document.getElementById('reg-role').value;
  const program  = document.getElementById('reg-program').value.trim();

  clearAuthErrors();

  if (!role) {
    showError('form-register', 'Please select a role.');
    return;
  }
  if (password !== confirm) {
    showError('form-register', 'Passwords do not match.');
    return;
  }
  if (password.length < 6) {
    showError('form-register', 'Password must be at least 6 characters.');
    return;
  }

  setLoading('btn-register', true);

  auth.createUserWithEmailAndPassword(email, password)
    .then(credential => {
      const userData = {
        name,
        email,
        role,
        program: program || null,
        createdAt: new Date().toISOString()
      };
      return db.collection('users').doc(credential.user.uid).set(userData)
        .then(() => {
          closeRegisterModal();
          applyUserSession(credential.user, userData);
        });
    })
    .catch(err => showError('form-register', friendlyError(err.code)))
    .finally(() => setLoading('btn-register', false));
}

// =====================
// LOGOUT
// =====================

function handleLogout() {
  auth.signOut().then(() => clearUserSession());
}

// =====================
// AUTH STATE LISTENER
// Restores session automatically on page refresh
// =====================

auth.onAuthStateChanged(user => {
  if (user) {
    db.collection('users').doc(user.uid).get().then(userDoc => {
      if (userDoc.exists) applyUserSession(user, userDoc.data());
    });
  } else {
    clearUserSession();
  }
});

// =====================
// SESSION UI
// =====================

function applyUserSession(user, data) {
  const { name, role, program } = data;

  // Nav: swap Login button → user info + Logout
  document.getElementById('nav-login-btn').style.display   = 'none';
  document.getElementById('nav-register-btn').style.display = 'none';
  document.getElementById('nav-user-info').style.display   = 'flex';
  document.getElementById('nav-user-name').textContent    = name || user.email;
  document.getElementById('nav-user-avatar').textContent  = (name || user.email).charAt(0).toUpperCase();

  // Dashboard welcome + role badge
  document.querySelector('.dash-welcome span').textContent = name || user.email;
  const roleLabel = role.charAt(0).toUpperCase() + role.slice(1);
  document.querySelector('.role-badge').textContent = program ? `${roleLabel} — ${program}` : roleLabel;

  // Show only the correct role panel; hide dev role-switcher
  activateDashboardRole(role);
  document.querySelector('.role-tabs').style.display = 'none';

  switchView('dashboard');
}

function clearUserSession() {
  document.getElementById('nav-login-btn').style.display = '';
  document.getElementById('nav-register-btn').style.display = '';
  document.getElementById('nav-user-info').style.display = 'none';
  document.querySelector('.dash-welcome span').textContent = 'Guest';
  document.querySelector('.role-badge').textContent = '';
  document.querySelector('.role-tabs').style.display = 'flex';
  switchView('landing');
}

function activateDashboardRole(role) {
  ['student', 'adviser', 'librarian'].forEach(r => {
    const panel = document.getElementById('dash-' + r);
    if (panel) panel.style.display = (r === role) ? 'block' : 'none';
  });
}

// =====================
// FRIENDLY ERROR MESSAGES
// =====================

function friendlyError(code) {
  const map = {
    'auth/invalid-email':          'Please enter a valid email address.',
    'auth/user-not-found':         'No account found with that email.',
    'auth/wrong-password':         'Incorrect password. Please try again.',
    'auth/invalid-credential':     'Incorrect email or password.',
    'auth/email-already-in-use':   'An account with this email already exists.',
    'auth/weak-password':          'Password must be at least 6 characters.',
    'auth/too-many-requests':      'Too many failed attempts. Try again later.',
    'auth/network-request-failed': 'Network error. Check your connection.',
  };
  return map[code] || 'Something went wrong. Please try again.';
}

// =====================
// EXPOSE TO GLOBAL SCOPE
// =====================
window.openAuthModal      = openAuthModal;
window.openLoginModal     = openLoginModal;
window.closeLoginModal    = closeLoginModal;
window.openRegisterModal  = openRegisterModal;
window.closeRegisterModal = closeRegisterModal;
window.handleLogin        = handleLogin;
window.handleRegister     = handleRegister;
window.handleLogout       = handleLogout;
