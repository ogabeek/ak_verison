const toggleBtn = document.getElementById('togglePwd');
const pwdInput = document.getElementById('password');
const eyeIcon = document.getElementById('eyeIcon');

const eyeOpen = `<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>`;
const eyeClosed = `<path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>`;

let visible = false;
toggleBtn.addEventListener('click', () => {
  visible = !visible;
  pwdInput.type = visible ? 'text' : 'password';
  eyeIcon.innerHTML = visible ? eyeClosed : eyeOpen;
});