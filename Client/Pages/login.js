/* login.js — Inoviq login form handler */
(function () {
  'use strict';

  var form = document.getElementById('loginForm');
  var submitBtn = document.getElementById('submitBtn');
  var errorMsg = document.getElementById('errorMsg');
  var togglePw = document.getElementById('togglePw');
  var passwordInput = document.getElementById('password');

  /* ---------- Password visibility toggle ---------- */
  if (togglePw && passwordInput) {
    togglePw.addEventListener('click', function () {
      var isHidden = passwordInput.type === 'password';
      passwordInput.type = isHidden ? 'text' : 'password';
      togglePw.textContent = isHidden ? 'Hide' : 'Show';
    });
  }

  /* ---------- Form submission ---------- */
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var email = document.getElementById('email').value.trim();
      var password = passwordInput ? passwordInput.value : '';

      /* Hide any previous error */
      if (errorMsg) errorMsg.style.display = 'none';

      /* Basic validation */
      if (!email || !password) {
        showError('Please fill in both fields.');
        return;
      }

      /* Simulate loading state */
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Signing in…';
      }

      /* TODO: Replace with real auth call */
      setTimeout(function () {
        /* Demo: accept any non-empty credentials → redirect to dashboard */
        window.location.href = 'dashboard.html';
      }, 800);
    });
  }

  function showError(msg) {
    if (errorMsg) {
      errorMsg.textContent = msg;
      errorMsg.style.display = 'block';
    }
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Sign in';
    }
  }
})();
