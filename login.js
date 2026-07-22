(function () {
  'use strict';

  var form = document.getElementById('loginForm');
  var emailInput = document.getElementById('email');
  var pwInput = document.getElementById('password');
  var togglePw = document.getElementById('togglePw');
  var submitBtn = document.getElementById('submitBtn');
  var errorMsg = document.getElementById('errorMsg');

  togglePw.addEventListener('click', function () {
    var isPw = pwInput.type === 'password';
    pwInput.type = isPw ? 'text' : 'password';
    togglePw.textContent = isPw ? 'Hide' : 'Show';
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    errorMsg.classList.remove('show');

    // Demo-only check — replace with a real call to your auth API,
    // e.g. POST /api/auth/login { email, password }
    var email = emailInput.value.trim();
    var password = pwInput.value;

    if (!email || !password) {
      errorMsg.classList.add('show');
      return;
    }

    submitBtn.classList.add('is-stamping');
    submitBtn.disabled = true;

    // Hold on the "Verified" stamp for a beat, then move on.
    setTimeout(function () {
      window.location.href = 'dashboard.html';
    }, 900);
  });
})();