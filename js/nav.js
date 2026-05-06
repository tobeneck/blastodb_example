// Highlight active nav link
document.addEventListener('DOMContentLoaded', () => {
  const path = window.location.pathname.replace(/\/$/, '').split('/').pop() || 'index';
  document.querySelectorAll('.nav-links a').forEach(a => {
    const href = a.getAttribute('href').replace(/\/$/, '').split('/').pop();
    if (href === path || (path === 'index' && href === 'index.html')) {
      a.classList.add('active');
    }
  });
});
