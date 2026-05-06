// Lazy-load FASTA files into <details> blocks on the Subtypes page.
// This keeps the initial page light while still showing real downloadable data.

function humanFileError(err) {
  if (!err) return 'Unknown error';
  if (typeof err === 'string') return err;
  if (err.message) return err.message;
  return String(err);
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('details.fasta-details').forEach((details) => {
    let loaded = false;

    details.addEventListener('toggle', async () => {
      if (!details.open || loaded) return;

      const src = details.getAttribute('data-fasta-src');
      const pre = details.querySelector('pre.fasta-pre');

      if (!src || !pre) return;

      pre.textContent = 'Loading…';

      try {
        const res = await fetch(src, { cache: 'no-store' });
        if (!res.ok) throw new Error(`HTTP ${res.status} fetching ${src}`);
        const text = await res.text();
        pre.textContent = text.trim() ? text : '(Empty FASTA file)';
        loaded = true;
      } catch (err) {
        pre.textContent = `Failed to load FASTA from ${src}\n${humanFileError(err)}`;
      }
    });
  });
});
