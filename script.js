(() => {
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const canHover = matchMedia('(hover:hover) and (min-width:901px)').matches;
gsap.registerPlugin(ScrollTrigger);

const lenis = new Lenis({ lerp: 0.1 });
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add(t => lenis.raf(t * 1000));
gsap.ticker.lagSmoothing(0);
lenis.stop();
$$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
  const t = $(a.getAttribute('href'));
  if (t) { e.preventDefault(); lenis.scrollTo(t, { offset: -58 }); }
}));

// wrap every word (also inside child elements) in a masked span
function split(el) {
  const walk = n => [...n.childNodes].forEach(c => {
    if (c.nodeType === 3) {
      const f = document.createDocumentFragment();
      c.textContent.split(/(\s+)/).forEach(p => {
        if (!p.trim()) return f.append(p);
        const w = document.createElement('span'); w.className = 'w';
        w.innerHTML = '<span></span>'; w.firstChild.textContent = p; f.append(w);
      });
      c.replaceWith(f);
    } else if (c.nodeType === 1 && c.tagName !== 'BR') walk(c);
  });
  walk(el);
  return $$('.w > span', el);
}

$$('.mq > div').forEach(d => { d.innerHTML += d.innerHTML; d.innerHTML += d.innerHTML; });

/* ---------- hero: spotlight + lights-on ---------- */
const lit = $('#lit'), slides = $$('.hs'), caps = ['Concert night', 'Sangeet stage', 'Cabinet installation', 'Crystal entrance'];
let px = innerWidth / 2, py = innerHeight / 2, tx = px, ty = py, moved = false, prog = 0;
addEventListener('pointermove', e => { moved = true; tx = e.clientX; ty = e.clientY; });
const spot = t => {
  if (!moved) { tx = innerWidth * (.5 + .26 * Math.sin(t * .0007)); ty = innerHeight * (.55 + .18 * Math.sin(t * .001)); }
  px += (tx - px) * .14; py += (ty - py) * .14;
  const maxR = Math.hypot(innerWidth, innerHeight) * 2.1, base = innerWidth < 900 ? 150 : 250;
  const r = base + (maxR - base) * Math.pow(prog, 2.2);
  lit.style.setProperty('--x', px + 'px'); lit.style.setProperty('--y', py + 'px'); lit.style.setProperty('--r', r + 'px');
};
gsap.ticker.add((t, dt) => spot(performance.now()));

let cur = 0, z = 1;
function swap() {
  const a = slides[cur]; cur = (cur + 1) % slides.length; const b = slides[cur];
  gsap.set(b, { zIndex: ++z });
  gsap.fromTo(b, { opacity: 0, scale: 1.12 }, { opacity: 1, scale: 1, duration: 1.4, ease: 'power2.out' });
  gsap.set(a, { opacity: 0, delay: 1.4 });
  $('#heroCap').textContent = caps[cur];
  gsap.delayedCall(4, swap);
}

const heroWords = $$('.hh').flatMap(split);
gsap.set(heroWords, { yPercent: 110 });
gsap.set(['.hero-foot', '#hint'], { opacity: 0 });

function heroIn() {
  gsap.to(heroWords, { yPercent: 0, duration: 1.1, stagger: 0.05, ease: 'expo.out' });
  gsap.to(['.hero-foot', '#hint'], { opacity: 1, duration: 1, delay: 0.5 });
  if (!reduce) gsap.delayedCall(4, swap);
}

function scrollAnims() {
  ScrollTrigger.create({ trigger: '.hero', start: 'top top', end: '+=130%', pin: '.hero-pin', scrub: true,
    onUpdate: s => { prog = s.progress; gsap.set('#hint', { opacity: Math.max(0, 1 - s.progress * 8) }); } });

  // statement: words light up, inline photos open
  const sw = split($('#statement'));
  gsap.fromTo(sw, { opacity: 0.16 }, { opacity: 1, stagger: 0.08, ease: 'none',
    scrollTrigger: { trigger: '#statement', start: 'top 80%', end: 'bottom 55%', scrub: true } });
  $$('.th').forEach(t => gsap.from(t, { width: 0, margin: 0, ease: 'none',
    scrollTrigger: { trigger: t, start: 'top 85%', end: 'top 45%', scrub: true } }));

  $$('[data-n]').forEach(el => {
    const o = { v: 0 };
    ScrollTrigger.create({ trigger: el, start: 'top 90%', once: true, onEnter: () =>
      gsap.to(o, { v: +el.dataset.n, duration: 1.6, ease: 'power3.out', onUpdate: () => el.textContent = Math.round(o.v) }) });
  });

  $$('.sec-h h2, .wed h2, .cta').forEach(h => {
    gsap.from(split(h), { yPercent: 110, duration: 1, stagger: 0.06, ease: 'expo.out',
      scrollTrigger: { trigger: h, start: 'top 88%' } });
  });

  gsap.from('.wl li', { y: 50, duration: 0.9, stagger: 0.06, ease: 'power3.out',
    scrollTrigger: { trigger: '.wl', start: 'top 85%' } });

  // services: each card recedes as the next one stacks over it
  const cards = $$('.sv');
  if (innerWidth > 900) cards.slice(0, -1).forEach((c, i) => gsap.to(c, { scale: 0.93, ease: 'none',
    scrollTrigger: { trigger: cards[i + 1], start: 'top bottom', end: `top ${58 + 14 + (i + 1) * 14}px`, scrub: true } }));

  gsap.from('.steps li', { opacity: 0, y: 40, duration: 0.9, stagger: 0.1, ease: 'power3.out',
    scrollTrigger: { trigger: '.steps', start: 'top 88%' } });
  gsap.from('.cl li', { opacity: 0, y: 30, duration: 0.7, stagger: 0.04, ease: 'power2.out',
    scrollTrigger: { trigger: '.cl', start: 'top 85%' } });

  // wedding reel: pinned horizontal scroll on desktop
  gsap.matchMedia().add('(min-width: 901px)', () => {
    const tr = $('#wedTrack'), sec = $('.wed');
    const dist = () => tr.scrollWidth - innerWidth;
    gsap.to(tr, { x: () => -dist(), ease: 'none',
      scrollTrigger: { trigger: sec, start: 'top top', end: () => '+=' + dist(), pin: true, scrub: 0.6,
        invalidateOnRefresh: true, anticipatePin: 1,
        onUpdate: s => gsap.set('#wedBar', { scaleX: s.progress }) } });
  });
}

/* ---------- work list: image follows the cursor ---------- */
if (canHover) {
  const peek = $('#peek'), list = $('#wl');
  gsap.set(peek, { xPercent: 0, yPercent: -50, scale: 0, rotation: 0 });
  const qx = gsap.quickTo(peek, 'x', { duration: 0.6, ease: 'power3' }), qy = gsap.quickTo(peek, 'y', { duration: 0.6, ease: 'power3' });
  const qr = gsap.quickTo(peek, 'rotation', { duration: 0.5, ease: 'power3' });
  let lx = 0;
  list.addEventListener('pointermove', e => { qx(e.clientX + 60); qy(e.clientY); qr(Math.max(-10, Math.min(10, (e.clientX - lx) * 0.4))); lx = e.clientX; });
  $$('li', list).forEach(li => {
    new Image().src = li.dataset.img;
    li.addEventListener('pointerenter', () => { peek.src = li.dataset.img; gsap.to(peek, { scale: 1, duration: 0.45, ease: 'back.out(1.6)', overwrite: 'auto' }); });
  });
  list.addEventListener('pointerleave', () => gsap.to(peek, { scale: 0, duration: 0.3, ease: 'power2.in', overwrite: 'auto' }));
}

/* ---------- boot: logo ring draws, then a circle of light opens ---------- */
const pre = $('#pre'), ring = $('.pre-logo circle'), hole = { v: 0 };
const maxH = Math.hypot(innerWidth, innerHeight) / 2 + 40;
gsap.set(ring, { strokeDasharray: 358, strokeDashoffset: 358 });
gsap.set('.pre-logo img', { scale: 0.6, opacity: 0 });
gsap.set('.pre-word', { y: 12, opacity: 0 });
gsap.timeline()
  .to(ring, { strokeDashoffset: 0, duration: 0.9, ease: 'power2.inOut' })
  .to('.pre-logo img', { scale: 1, opacity: 1, duration: 0.7, ease: 'back.out(1.7)' }, 0.15)
  .to('.pre-word', { y: 0, opacity: 1, duration: 0.5, ease: 'power2.out' }, 0.4)
  .add(() => { heroIn(); lenis.start(); scrollAnims(); ScrollTrigger.refresh(); }, '+=0.15')
  .to(hole, { v: 1, duration: 0.9, ease: 'power3.in',
    onUpdate: () => pre.style.setProperty('--h', hole.v * maxH + 'px'),
    onComplete: () => pre.remove() }, '<');
})();
