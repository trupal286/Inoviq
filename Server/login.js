/* ==========================================================================
   INOVIQ — Login Page Handler
   ========================================================================== */

(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {
    var form = document.getElementById('loginForm');
    var errorMsg = document.getElementById('errorMsg');
    var submitBtn = document.getElementById('submitBtn');

    var params = new URLSearchParams(window.location.search);
    var returnUrl = params.get('returnUrl') || sessionStorage.getItem('returnUrl') || 'dashboard.html';

    if (params.get('registered') === '1') {
      var cardTag = document.querySelector('.card-tag');
      if (cardTag) {
        cardTag.textContent = 'Account created successfully! Please sign in to continue.';
        cardTag.style.color = 'var(--moss)';
        cardTag.style.fontWeight = '600';
      }
    }

    var signupLink = document.querySelector('.card-foot a');
    if (signupLink && returnUrl) {
      signupLink.href = 'signup.html?returnUrl=' + encodeURIComponent(returnUrl);
    }

    if (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();

        var idInput = document.getElementById('identifier');
        var pwInput = document.getElementById('password');

        var identifier = idInput ? idInput.value.trim() : '';
        var password = pwInput ? pwInput.value.trim() : '';

        if (!identifier || !password) {
          if (errorMsg) {
            errorMsg.textContent = 'Please enter both identifier and password.';
            errorMsg.style.display = 'block';
          }
          return;
        }

        if (errorMsg) errorMsg.style.display = 'none';

        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.innerHTML = 'Signing in&hellip;';
        }

        setTimeout(function () {
          var nameParts = identifier.split('@')[0].split(/[\._-]/);
          var displayName = nameParts.map(function (p) {
            return p.charAt(0).toUpperCase() + p.slice(1);
          }).join(' ');

          var initials = nameParts.length >= 2
            ? (nameParts[0][0] + nameParts[1][0]).toUpperCase()
            : (displayName.substring(0, 2).toUpperCase() || 'IN');

          var user = {
            name: displayName || 'Trupal Panchal',
            email: identifier.includes('@') ? identifier : identifier + '@inoviq.io',
            initials: initials,
            isLoggedIn: true,
            loginTime: Date.now()
          };

          localStorage.setItem('inoviq_user', JSON.stringify(user));
          sessionStorage.removeItem('returnUrl');

          if (!returnUrl || returnUrl === 'null' || returnUrl === 'undefined') {
            returnUrl = 'dashboard.html';
          }

          window.location.href = returnUrl;
        }, 700);
      });
    }

    /* Password show/hide toggle */
    var togglePw = document.getElementById('togglePw');
    var pwInput = document.getElementById('password');
    if (togglePw && pwInput) {
      togglePw.addEventListener('click', function () {
        if (pwInput.type === 'password') {
          pwInput.type = 'text';
          togglePw.textContent = 'Hide';
        } else {
          pwInput.type = 'password';
          togglePw.textContent = 'Show';
        }
      });
    }
  });
})();
