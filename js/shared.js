// Inject shared nav
const NAV_HTML = `
<nav>
  <a class="nav-logo" href="index.html">
    <img src="https://images.squarespace-cdn.com/content/v1/689c6545c94b4240bd6c83f4/53bf4175-906a-4ba8-9194-539b15f9bf77/logo-main%404x.jpg" alt="BlastoDB logo">
    <span>BlastoDB</span>
  </a>
  <ul class="nav-links">
    <li><a href="index.html">Home</a></li>
    <li><a href="publications.html">Publications</a></li>
    <li><a href="about.html">About BlastoDB</a></li>
    <li><a href="subtypes.html">Subtypes</a></li>
    <li><a href="genomes.html">Genome/Transcriptomes</a></li>
    <li><a href="protocols.html">Lab Protocols</a></li>
    <li><a href="labs.html">Research Labs</a></li>
    <li><a href="gallery.html">Gallery</a></li>
    <li><a href="contact.html">Contact</a></li>
  </ul>
</nav>`;

const FOOTER_HTML = `
<footer>
  <strong>BlastoDB</strong> — The <em>Blastocystis</em> Database<br>
  A community resource hosted on <a href="https://pages.github.com" target="_blank">GitHub Pages</a><br>
  Contact: <a href="mailto:A.Tsaousis@kent.ac.uk">A.Tsaousis@kent.ac.uk</a> · University of Kent, School of Biosciences
</footer>`;

document.addEventListener('DOMContentLoaded', () => {
  const navEl = document.getElementById('nav-placeholder');
  if (navEl) navEl.outerHTML = NAV_HTML;
  const footerEl = document.getElementById('footer-placeholder');
  if (footerEl) footerEl.outerHTML = FOOTER_HTML;

  // Highlight active link
  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(a => {
    if (a.getAttribute('href') === path) a.classList.add('active');
  });
});
