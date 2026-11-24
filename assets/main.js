// Hero: iki telefon, tek bütçe. Veri yalnız bu sayfada yaşar, hiçbir yere gitmez.
(() => {
  const demo = document.getElementById('demo');
  if (!demo) return;
  const LIMIT = 3000, START = 2075.75, MAX = 12;
  const SEED = [['Jane Doe', 'Grocery', 85.4], ['John Doe', 'Dining', 42]];
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fmt = n => '€' + n.toLocaleString('en-US', { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 });
  const phones = [...demo.querySelectorAll('.phone')];
  const reset = document.getElementById('reset');
  const live = document.getElementById('live');
  let items, shown = LIMIT - START, raf, touched = false;

  const total = () => items.reduce((s, i) => s + i[2], START - SEED.reduce((s, i) => s + i[2], 0));
  const paint = left => phones.forEach(p => {
    p.querySelector('[data-left]').textContent = fmt(Math.abs(Math.round(left * 100) / 100));
    p.querySelector('[data-word]').textContent = left < 0 ? 'over' : 'left';
  });
  function render(fresh) {
    const spent = Math.round(total() * 100) / 100, target = LIMIT - spent, from = shown;
    // Uygulamadaki eşik: %80'de uyarı rengi, %100'de aşım.
    const state = spent > LIMIT ? 'over' : spent >= LIMIT * .8 ? 'warn' : 'ok';
    phones.forEach(p => {
      p.dataset.state = state;
      p.querySelector('[data-spent]').textContent = `${fmt(spent)} spent of ${fmt(LIMIT)}`;
      const ul = p.querySelector('[data-rows]');
      ul.replaceChildren(...items.slice(0, 3).map(([who, cat, amt], i) => {
        const li = document.createElement('li'), a = document.createElement('span'),
          s = document.createElement('small'), b = document.createElement('b');
        if (fresh && i === 0) li.className = 'new';
        a.append(who); s.append(cat); a.append(s); b.append(fmt(amt)); li.append(a, b);
        return li;
      }));
    });
    demo.querySelectorAll('[data-cat]').forEach(b => { b.disabled = items.length >= MAX + SEED.length; });
    reset.hidden = items.length <= SEED.length;
    cancelAnimationFrame(raf);
    shown = target;
    if (still || !fresh) return paint(target);
    const t0 = performance.now();
    (function step(t) {
      const k = Math.min(1, Math.max(0, (t - t0) / 500)), e = 1 - (1 - k) ** 3;
      paint(from + (target - from) * e);
      if (k < 1) raf = requestAnimationFrame(step);
    })(t0);
  }
  function add(who, cat, amt) {
    items.unshift([who, cat, amt]);
    render(true);
    const left = LIMIT - total();
    live.textContent = `${who} added ${cat} ${fmt(amt)}. ${fmt(Math.abs(left))} ${left < 0 ? 'over' : 'left'} on both phones.`;
  }
  demo.addEventListener('click', e => {
    const b = e.target.closest('[data-cat]');
    if (!b) return;
    touched = true;
    add(b.closest('.phone').dataset.who, b.dataset.cat, Number(b.dataset.amt));
  });
  reset.addEventListener('click', () => { items = SEED.map(i => [...i]); live.textContent = ''; render(false); demo.querySelector('[data-cat]').focus(); });

  items = SEED.map(i => [...i]);
  render(false);
  if (!still) setTimeout(() => { if (!touched) add('Jane Doe', 'Pet', 18); }, 1600);
})();
