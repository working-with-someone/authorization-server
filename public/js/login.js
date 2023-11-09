document.addEventListener('DOMContentLoaded', function () {
  const urlParams = new URLSearchParams(window.location.search);
  const continueURL = urlParams.get('continue');

  const form = document.getElementById('login-form');

  const hiddenField = document.createElement('input');
  hiddenField.type = 'hidden';
  hiddenField.name = 'continue';
  hiddenField.value = continueURL;

  form.appendChild(hiddenField);
});
