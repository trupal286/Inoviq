/* ==========================================================================
   INOVIQ — Login JS
   ========================================================================== */
(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {
    var togglePwBtn = document.getElementById('togglePw');
    var pwInput = document.getElementById('password');
    var loginForm = document.getElementById('loginForm');
    var submitBtn = document.getElementById('submitBtn');
    var errorMsg = document.getElementById('errorMsg');

    if (togglePwBtn && pwInput) {
      togglePwBtn.addEventListener('click', function () {
        if (pwInput.type === 'password') {
          pwInput.type = 'text';
          togglePwBtn.textContent = 'Hide';
        } else {
          pwInput.type = 'password';
          togglePwBtn.textContent = 'Show';
        }
      });
    }

    if (loginForm) {
      loginForm.addEventListener('submit', function (e) {
        e.preventDefault();
        var email = document.getElementById('email').value.trim();
        var password = pwInput.value.trim();

        if (!email || !password) {
          if (errorMsg) errorMsg.classList.add('show');
          return;
        }

        if (errorMsg) errorMsg.classList.remove('show');
        if (submitBtn) submitBtn.classList.add('is-stamping');

        setTimeout(function () {
          window.location.href = 'index.html';
        }, 900);
      });
    }
  });
})();
