(() => {
  const root = document.documentElement;
  const theme = document.querySelector('#theme');
  theme.addEventListener('click', () => {
    const current = root.dataset.theme || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    const next = current === 'dark' ? 'light' : 'dark';
    root.dataset.theme = next;
    try { localStorage.setItem('theme', next); } catch (_) {}
    theme.setAttribute('aria-label', `Switch to ${next === 'dark' ? 'light' : 'dark'} theme`);
  });
  const comparison = document.querySelector('#comparison-image');
  document.querySelectorAll('[data-comparison]').forEach(button => {
    button.addEventListener('click', () => {
      const before = button.dataset.comparison === 'before';
      document.querySelectorAll('[data-comparison]').forEach(b => b.setAttribute('aria-pressed', String(b === button)));
      comparison.src = `assets/${before ? 'results-before' : '28_results_summary'}.webp`;
      comparison.closest('a').href = comparison.src;
      comparison.closest('a').setAttribute('aria-label', before ? 'Open earlier results screenshot' : 'Open revised results screenshot');
      comparison.alt = before ? 'Earlier results screen: a full list of metrics precedes advice.' : 'Updated results screen: a short observation, one next step and a repeat button.';
      document.querySelector('#comparison-caption').textContent = before ? 'Earlier results screen · Russian build' : 'Revised results screen';
    });
  });
  const dialog = document.querySelector('#screen-viewer');
  if (typeof dialog.showModal !== 'function') return;
  const links = [...document.querySelectorAll('.screen-grid a')];
  let index = 0;
  const image = dialog.querySelector('img');
  const title = dialog.querySelector('#viewer-title');
  const count = dialog.querySelector('#viewer-count');
  const display = () => {
    image.src = links[index].href;
    image.alt = links[index].dataset.caption;
    title.textContent = image.alt;
    count.textContent = `${index + 1} / ${links.length}`;
  };
  links.forEach((link, i) => link.addEventListener('click', event => {
    event.preventDefault(); index = i; display(); dialog.showModal();
  }));
  document.querySelectorAll('.phone[data-caption]').forEach(link => link.addEventListener('click', event => {
    const found = links.findIndex(l => l.getAttribute('href') === link.getAttribute('href'));
    if (found < 0) return;
    event.preventDefault(); index = found; display(); dialog.showModal();
  }));
  dialog.querySelector('#viewer-close').addEventListener('click', () => dialog.close());
  const move = step => { index = (index + step + links.length) % links.length; display(); };
  dialog.querySelector('#viewer-prev').addEventListener('click', () => move(-1));
  dialog.querySelector('#viewer-next').addEventListener('click', () => move(1));
  dialog.addEventListener('keydown', event => {
    if (event.key === 'ArrowRight') { event.preventDefault(); move(1); }
    if (event.key === 'ArrowLeft') { event.preventDefault(); move(-1); }
  });
  dialog.addEventListener('click', event => {
    const box = dialog.getBoundingClientRect();
    if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) dialog.close();
  });
})();
