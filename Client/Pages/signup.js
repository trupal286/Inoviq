/* ==========================================================================
   INOVIQ — Signup Page Handler
   ========================================================================== */

/* ── Password Strength Checker ── */
function checkStrength(val) {
  'use strict';
  var segs = [
    document.getElementById('seg1'),
    document.getElementById('seg2'),
    document.getElementById('seg3'),
    document.getElementById('seg4')
  ];
  var label = document.getElementById('strengthLabel');

  segs.forEach(function (s) { if (s) s.className = 'strength-seg'; });
  if (label) {
    label.textContent = '';
    label.style.color = 'var(--ink-light)';
  }

  if (!val) return;

  var score = 0;
  if (val.length >= 8) score++;
  if (/[A-Z]/.test(val)) score++;
  if (/[0-9]/.test(val)) score++;
  if (/[^A-Za-z0-9]/.test(val)) score++;

  var levels = ['weak', 'fair', 'good', 'strong'];
  var colors = { weak: '#C0392B', fair: '#E67E22', good: 'var(--moss)', strong: '#27AE60' };
  var texts = { weak: 'Weak', fair: 'Fair', good: 'Good', strong: 'Strong 💪' };

  if (score === 0) return;
  var level = levels[score - 1];
  for (var i = 0; i < score; i++) { if (segs[i]) segs[i].classList.add(level); }
  if (label) {
    label.textContent = texts[level];
    label.style.color = colors[level];
  }
}

/* ── Form Submit Handler ── */
function handleSignup(e) {
  'use strict';
  e.preventDefault();

  var pass = document.getElementById('signupPassword').value;
  var confirm = document.getElementById('signupConfirm');
  var btn = document.getElementById('signupBtn');
  var firstName = (document.getElementById('signupFirstName').value || '').trim();
  var lastName = (document.getElementById('signupLastName').value || '').trim();
  var email = (document.getElementById('signupEmail').value || '').trim();

  if (pass !== confirm.value) {
    confirm.style.borderColor = 'var(--stamp-red)';
    confirm.style.boxShadow = '0 0 0 3px rgba(156,61,61,0.15)';
    confirm.focus();
    return;
  }

  btn.textContent = 'Creating account\u2026';
  btn.disabled = true;

  var params = new URLSearchParams(window.location.search);
  var returnUrl = params.get('returnUrl') || sessionStorage.getItem('returnUrl') || 'dashboard.html';

  var fullName = (firstName + ' ' + lastName).trim() || 'New Member';
  var initials = ((firstName[0] || 'N') + (lastName[0] || 'M')).toUpperCase();

  var user = {
    name: fullName,
    email: email || 'member@inoviq.io',
    initials: initials,
    isLoggedIn: true,
    loginTime: Date.now()
  };

  localStorage.setItem('inoviq_user', JSON.stringify(user));

  setTimeout(function () {
    sessionStorage.removeItem('returnUrl');
    window.location.href = returnUrl;
  }, 900);
}

/* ── Theme Toggle & Event Handlers ── */
document.addEventListener('DOMContentLoaded', function () {
  'use strict';
  var params = new URLSearchParams(window.location.search);
  var returnUrl = params.get('returnUrl') || sessionStorage.getItem('returnUrl');
  if (returnUrl) {
    var loginLink = document.querySelector('.card-foot a');
    if (loginLink) loginLink.href = 'login.html?returnUrl=' + encodeURIComponent(returnUrl);
  }

  var confirm = document.getElementById('signupConfirm');
  if (confirm) {
    confirm.addEventListener('input', function () {
      confirm.style.borderColor = '';
      confirm.style.boxShadow = '';
    });
  }

  var themeBtn = document.getElementById('themeToggle');
  var currentTheme = localStorage.getItem('inoviq_theme') || 'light';

  function applyTheme(theme) {
    if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
      if (themeBtn) themeBtn.textContent = '☀️';
    } else {
      document.documentElement.removeAttribute('data-theme');
      if (themeBtn) themeBtn.textContent = '🌙';
    }
    localStorage.setItem('inoviq_theme', theme);
  }
  applyTheme(currentTheme);

  if (themeBtn) {
    themeBtn.addEventListener('click', function () {
      currentTheme = (currentTheme === 'light') ? 'dark' : 'light';
      applyTheme(currentTheme);
    });
  }
});
