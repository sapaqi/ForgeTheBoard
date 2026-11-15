/* Free Motion APIs only: animate, inView, stagger. Content is visible by default. */
(() => {
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  const preview = new URLSearchParams(location.search).get('motion') === 'reduce';
  if (preference.matches || preview || !window.Motion) return;

  const { animate, inView, stagger } = window.Motion;
  const smallScreen = matchMedia('(max-width: 760px)');
  const stops = [];
  const active = new Map();
  let disabled = false;
  let disposeHero = () => {};
  const ease = [.22, 1, .36, 1];

  function clear(element) {
    const reset = () => {
      element.style.removeProperty('opacity');
      element.style.removeProperty('transform');
      element.style.removeProperty('translate');
      element.style.removeProperty('will-change');
      element.removeAttribute('data-motion-pending');
    };
    reset();
    // Hybrid Motion may commit its final styles in the next render batch.
    requestAnimationFrame(reset);
  }

  function enter(elements, delay = 0) {
    const distance = smallScreen.matches ? 24 : 52;
    for (const [index, element] of elements.entries()) {
      // Keyframes are explicit: we never depend on an invisible CSS default.
      element.removeAttribute('data-motion-pending');
      element.dataset.motionEntered = 'true';
      const control = animate(element, {
        opacity: [0, 1], transform: [`translateY(${distance}px)`, 'translateY(0px)']
      }, { duration: .72, ease, delay: typeof delay === 'function' ? delay(index, elements.length) : delay });
      active.set(element, control);
      control.then(() => {
        if (active.get(element) !== control) return;
        active.delete(element);
        control.cancel();
        clear(element);
      });
    }
  }

  function prepare(element) {
    const rect = element.getBoundingClientRect();
    // Reloads, restored scroll positions and direct anchors must stay readable.
    if (rect.top < 0) {
      element.dataset.motionEntered = 'true';
      return false;
    }
    element.dataset.motionPending = 'true';
    element.style.opacity = '0';
    element.style.transform = `translateY(${smallScreen.matches ? 24 : 52}px)`;
    element.style.willChange = 'transform, opacity';
    return true;
  }

  function reveal(selector) {
    document.querySelectorAll(selector).forEach(element => {
      if (!prepare(element)) return;
      stops.push(inView(element, () => {
        if (!disabled && !element.dataset.motionEntered) enter([element]);
        // No leave callback: Motion unobserves after this first entry.
      }, { margin: '0px 0px -7% 0px', amount: .12 }));
    });
  }

  function revealList(selector) {
    document.querySelectorAll(selector).forEach(list => {
      const elements = [...list.children].filter(element => element.matches('button, li, details'));
      const pending = elements.filter(prepare);
      if (!pending.length) return;
      // Observe each row so tall mobile lists don't finish below the viewport.
      // Rows sharing an IntersectionObserver delivery are staggered together.
      const queue = new Set();
      let frame;
      let nextStart = 0;
      stops.push(() => cancelAnimationFrame(frame));
      pending.forEach(element => {
        stops.push(inView(element, () => {
          if (disabled || element.dataset.motionEntered) return;
          queue.add(element);
          if (frame) return;
          frame = requestAnimationFrame(() => {
            frame = 0;
            const batch = pending.filter(item => queue.has(item) && !item.dataset.motionEntered);
            queue.clear();
            if (!disabled) {
              const now = performance.now();
              const startDelay = Math.max(0, (nextStart - now) / 1000);
              enter(batch, stagger(.12, { startDelay }));
              nextStart = now + (startDelay + batch.length * .12) * 1000;
            }
          });
        }, { margin: '0px 0px -6% 0px', amount: .18 }));
      });
    });
  }

  function finishAll() {
    disabled = true;
    stops.forEach(stop => stop());
    active.forEach((control, element) => { control.stop(); clear(element); });
    active.clear();
    document.querySelectorAll('[data-motion-pending]').forEach(clear);
    disposeHero();
  }

  try {
    reveal('.section-intro > div, .intro-description, .sample-stage, .idea-copy > h2, .status-intro, .finale-content');
    // The tableau already uses responsive scale/rotations. Animate its contents
    // as one composition via CSS translate, preserving those authored transforms.
    const tableau = document.querySelector('.tableau');
    if (tableau) {
      stops.push(inView(tableau, () => {
        if (disabled) return;
        tableau.dataset.motionEntered = 'true';
        const control = animate(tableau, { opacity: [0, 1], translate: [`0 ${smallScreen.matches ? 24 : 52}px`, '0 0px'] }, { duration: .8, ease });
        active.set(tableau, control);
        control.then(() => { if (active.get(tableau) === control) { active.delete(tableau); control.cancel(); clear(tableau); } });
      }, { amount: .15 }));
    }
    revealList('.workshop-choices, .creation-steps, .project-questions');

    // Keyboard users never focus an invisible row while it waits for its entry.
    document.addEventListener('focusin', event => {
      const element = event.target.closest('[data-motion-pending], [data-motion-entered]');
      if (!element) return;
      active.get(element)?.stop();
      active.delete(element);
      clear(element);
      element.dataset.motionEntered = 'true';
    });
    preference.addEventListener('change', event => { if (event.matches) finishAll(); });

    import('./hero-watercolour.js').then(async ({ paintHero }) => {
      if (disabled) return;
      disposeHero = await paintHero({ animate, preference, preview });
      if (disabled) disposeHero();
    }).catch(error => console.warn('Watercolour: static map fallback.', error));
  } catch (error) {
    finishAll();
    console.warn('Motion: visible content fallback.', error);
  }
})();
