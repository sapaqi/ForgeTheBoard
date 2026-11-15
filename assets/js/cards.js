const types = {
  place: 'Miejsce',
  ally: 'Sojusznik',
  adventure: 'Przygoda',
  item: 'Przedmiot'
};
const cards = [
  {
    id: 'twierdza-brzasku', title: 'Twierdza Brzasku', type: 'place', art: 'castle',
    label: 'Schronienie', value: 3, phase: 'Po wejściu na pole twierdzy',
    lead: 'Nad przełęczą wciąż pali się ogień. Straż wpuszcza podróżnych przed zmierzchem.',
    rule: 'Odzyskaj 2 zapasy. Jeśli w drużynie jest Rycerka Popielnego Szlaku, odzyskaj dodatkowo 1 zapas.',
    tip: 'Zaplanuj postój w twierdzy przed wyprawą przez przełęcz. Powrót tędy daje drużynie szansę na kolejny odpoczynek.',
    related: ['rycerka-popielnego-szlaku', 'smok-z-przeleczy']
  },
  {
    id: 'smok-z-przeleczy', title: 'Smok z Przełęczy', type: 'adventure', art: 'dragon',
    label: 'Wyzwanie', value: 4, phase: 'Przy pierwszym przejściu przez przełęcz',
    lead: 'Gdy wiatr ustaje, nad drogą słychać już tylko uderzenia skrzydeł.',
    rule: 'Wydaj 2 zapasy, by odwrócić uwagę smoka i przejść dalej. Możesz też zawrócić do ostatniego odkrytego miejsca.',
    tip: 'Porównaj koszt przejścia z zapasami potrzebnymi na dalszą drogę. Jeśli drużyna jest blisko twierdzy, odwrót pozwoli się przygotować.',
    related: ['twierdza-brzasku', 'kompas-zarowy']
  },
  {
    id: 'kartograf-mgly', title: 'Kartograf Mgły', type: 'ally', art: 'wizard',
    label: 'Rozpoznanie', value: 2, phase: 'Na początku swojej tury',
    lead: 'Rysuje drogi, których jeszcze nie ma na mapach.',
    rule: 'Raz na wyprawę podejrzyj dwie wierzchnie karty przygód. Odłóż je na wierzch w dowolnej kolejności.',
    tip: 'Użyj zdolności tuż przed odkryciem nowego szlaku, by wybrać wyzwanie odpowiednie dla drużyny.',
    related: ['kompas-zarowy', 'smok-z-przeleczy']
  },
  {
    id: 'rycerka-popielnego-szlaku', title: 'Rycerka Popielnego Szlaku', type: 'ally', art: 'knight',
    label: 'Ochrona', value: 3, phase: 'Gdy masz stracić zapasy',
    lead: 'Zna tych, którzy pilnują bram, i tych, przed którymi bramy się zamyka.',
    rule: 'Raz na wyprawę zmniejsz utratę zapasów o 1. W Twierdzy Brzasku drużyna odzyskuje dodatkowy zapas.',
    tip: 'Zachowaj ochronę na przejście, po którym trudno będzie uzupełnić zapasy.',
    related: ['twierdza-brzasku', 'orun-kowal']
  },
  {
    id: 'kompas-zarowy', title: 'Kompas Żarowy', type: 'item', art: 'forge',
    label: 'Ekwipunek', value: 2, phase: 'Przed ruchem drużyny',
    lead: 'Wykuty w kuźni Oruna, wyczuwa szlaki ukryte pod popiołem.',
    rule: 'Raz na wyprawę przesuń drużynę na sąsiednie odkryte miejsce, nawet jeśli łączący je szlak jest zamknięty.',
    tip: 'Kompas ułatwia powrót po zapasy albo skraca drogę do punktu spotkania.',
    related: ['orun-kowal', 'kartograf-mgly']
  },
  {
    id: 'orun-kowal', title: 'Orun, kowal z zatoki', type: 'ally', art: 'dwarf',
    label: 'Rzemiosło', value: 2, phase: 'Podczas odpoczynku w miejscu',
    lead: 'Z popękanego ostrza potrafi wykuć rzecz wartą drogi na drugi koniec zatoki.',
    rule: 'Raz na wyprawę wydaj 1 zapas, by odnowić użyty przedmiot. Jego zdolność znów jest dostępna.',
    tip: 'Połącz Oruna z Kompasem Żarowym, gdy plan wyprawy wymaga dwóch przejść zamkniętym szlakiem.',
    related: ['kompas-zarowy', 'rycerka-popielnego-szlaku']
  }
];

const hammer = '<svg class="forge-hammer" aria-hidden="true"><use href="#forge-hammer"/></svg>';
const frameSides = [
  { side: 'top', width: 30, height: 24, angle: 0 },
  { side: 'bottom', width: 30, height: 24, angle: 180 },
  { side: 'left', width: 24, height: 30, angle: -90 },
  { side: 'right', width: 24, height: 30, angle: 90 }
];
const framePattern = `<span class="deck-frame-pattern" aria-hidden="true">${frameSides.map(({ side }) =>
  `<svg class="deck-frame-${side}"><rect width="100%" height="100%" fill="url(#deck-frame-anvil-${side})"/></svg>`
).join('')}</span>`;
document.querySelector('.deck-symbols').insertAdjacentHTML('beforeend', `<defs>
    <filter id="deck-pencil-ink" x="0%" y="0%" width="100%" height="100%" color-interpolation-filters="sRGB">
      <feColorMatrix in="SourceGraphic" type="saturate" values="0" result="luma"/>
      <feGaussianBlur in="luma" stdDeviation="1.4" result="wash"/>
      <feComposite in="wash" in2="luma" operator="arithmetic" k2="1" k3="-1" k4=".18" result="edge"/>
      <feColorMatrix in="edge" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  4 0 0 0 -.72" result="inkMask"/>
      <feFlood flood-color="#5e3025" result="ink"/>
      <feComposite in="ink" in2="inkMask" operator="in" result="lines"/>
      <feFlood flood-color="#f5efe2" result="paper"/>
      <feMerge><feMergeNode in="paper"/><feMergeNode in="lines"/></feMerge>
    </filter>
    <filter id="deck-card-pencil-ink" x="0%" y="0%" width="100%" height="100%" color-interpolation-filters="sRGB">
      <feColorMatrix in="SourceGraphic" type="saturate" values="0" result="luma"/>
      <feGaussianBlur in="luma" stdDeviation=".55" result="softLuma"/>
      <feConvolveMatrix in="softLuma" order="3" kernelMatrix="1 1 1 1 -8 1 1 1 1"
        divisor="8" kernelUnitLength="1.6" preserveAlpha="true" result="edge"/>
      <feColorMatrix in="edge" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  5.4 0 0 0 0" result="inkMask"/>
      <feMorphology in="inkMask" operator="dilate" radius="1" result="continuousLines"/>
      <feFlood result="ink"/>
      <feComposite in="ink" in2="continuousLines" operator="in" result="lines"/>
      <feFlood flood-color="#f5efe2" result="paper"/>
      <feMerge><feMergeNode in="paper"/><feMergeNode in="lines"/></feMerge>
    </filter>

  <path id="deck-frame-anvil" fill="#fff5e2" d="M161 5H44v10H0c0 9 17 25 47 29 10 7 6 26-8 26-10 0-10 2-10 15l52 1 51-1c0-13 0-15-11-15-16 0-20-32 11-39 15-5 29-10 29-26Z"/>
  ${frameSides.map(({ side, width, height, angle }) => `<pattern id="deck-frame-anvil-${side}" patternUnits="userSpaceOnUse" width="${width}" height="${height}">
    <use href="#deck-frame-anvil" transform="translate(${width / 2} ${height / 2}) rotate(${angle}) scale(.0931677) translate(-80.5 -45)"/>
  </pattern>`).join('')}
</defs>`);
const cardUrl = card => `karta.html?karta=${card.id}`;
const art = card => `<div class="deck-art deck-card-art">
  <img src="assets/card-art/${card.art}.webp" alt="" width="960" height="640" loading="lazy">
</div>`;
const typePaths = {
  place: 'M3 21V8h4v3h3V5h4v6h3V8h4v13z M10 21v-4a2 2 0 0 1 4 0v4',
  ally: 'M12 3l8 3v5c0 4.5-3.4 8-8 10-4.6-2-8-5.5-8-10V6z M12 8v7 M8.5 11.5h7',
  adventure: 'M12 2l2.6 7.4L22 12l-7.4 2.6L12 22l-2.6-7.4L2 12l7.4-2.6z',
  item: 'M6 4h12l4 6-10 11L2 10z M2 10h20 M8 10l4 11 4-11 M8 10l4-6 4 6'
};
const typeEmblem = card => `<span class="deck-type-emblem"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="${typePaths[card.type]}"/></svg></span>`;
const tag = card => `<span class="deck-tag">${typeEmblem(card)}${types[card.type]}</span>`;
const statPaths = {
  value: 'M12 2l3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z',
  supplies: 'M5 8h14l2 4-3 8H6l-3-8z M3 12h18 M9 8l2-4h2l2 4 M12 12v8',
  shield: 'M12 3l7 3v5c0 5-3 8-7 10-4-2-7-5-7-10V6z M9 12l2 2 4-4',
  route: 'M4 19l5-6 3 3 7-10 M14 6h5v5 M4 19h4',
  scout: 'M2 12s4-6 10-6 10 6 10 6-4 6-10 6-10-6-10-6z M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0',
  charge: 'M13 2L5 14h6l-1 8 9-12h-6z'
};
const cardStats = {
  castle: [["supplies","Odzyskaj zapasy","+2"],["shield","Premia z Rycerką","+1"]],
  dragon: [["supplies","Koszt przejścia","2"],["route","Moment","Pierwsze przejście"]],
  wizard: [["scout","Podejrzyj karty","2"],["charge","Użycia na wyprawę","1"]],
  knight: [["shield","Ogranicz stratę","−1"],["charge","Użycia na wyprawę","1"]],
  forge: [["route","Ruch mimo blokady","1 pole"],["charge","Użycia na wyprawę","1"]],
  dwarf: [["supplies","Koszt w zapasach","1"],["charge","Odnów przedmiot","1"]],
};
const stats = card => `<ul class="deck-stats" aria-label="Parametry karty">
  ${[['value', 'Wartość', card.value], ...cardStats[card.art]].map(([icon, label, value]) =>
    `<li data-stat="${icon}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="${statPaths[icon]}"/></svg><span>${label} <strong>${value}</strong></span></li>`
  ).join('')}
</ul>`;

let saved = new Set();
try {
  const stored = JSON.parse(localStorage.getItem('forge-deck-saved') || '[]');
  if (Array.isArray(stored)) saved = new Set(stored);
} catch { /* Browsing and saving still work for the current page. */ }

function saveButton(card) {
  const isSaved = saved.has(card.id);
  return `<button class="forge-cta forge-cta-secondary" type="button" data-save-card="${card.id}"
    aria-pressed="${isSaved}"><span>${isSaved ? 'Zapisano' : 'Zapisz'}</span> ${hammer}</button>`;
}

function cardTile(card, { current = false } = {}) {
  const heading = current ? 'h2' : 'h3';
  const body = `
      <div class="deck-tile-heading">
        ${typeEmblem(card)}
        <div>
          <span class="deck-type-name">${types[card.type]}</span>
          <${heading}>${card.title}</${heading}>
        </div>
      </div>
      ${art(card)}
      <div class="deck-tile-copy">
        <p>${card.lead}</p>
        <span class="deck-tile-meta">${card.label}</span>
      </div>
      <div class="deck-tile-actions">
        ${stats(card)}
        ${current ? '' : `<span class="forge-cta forge-cta-secondary">Szczegóły karty ${hammer}</span>`}
      </div>`;
  return `<article class="deck-tile${current ? ' deck-tile-current' : ''}" data-type="${card.type}">
    ${framePattern}
    ${current ? `<div class="deck-tile-body">${body}</div>` : `<a class="deck-tile-link" href="${cardUrl(card)}">${body}</a>`}
  </article>`;
}

function renderListing() {
  const filters = document.querySelector('#deck-filters');
  const grid = document.querySelector('#deck-grid');
  const pages = document.querySelector('#deck-pages');
  const status = document.querySelector('#deck-status');
  const pageSize = 4;
  let filter = 'all';
  let page = 1;
  filters.innerHTML = Object.entries({ all: 'Wszystkie', ...types }).map(([type, label]) =>
    `<button type="button" data-type="${type}" aria-pressed="${type === filter}">${label}</button>`
  ).join('');

  function renderResults(focusPage = false) {
    const matching = filter === 'all' ? cards : cards.filter(card => card.type === filter);
    const pageCount = Math.ceil(matching.length / pageSize);
    const start = (page - 1) * pageSize;
    grid.innerHTML = matching.slice(start, start + pageSize).map(cardTile).join('');
    status.textContent = `Karty ${start + 1}–${Math.min(start + pageSize, matching.length)} z ${matching.length}`;
    pages.hidden = pageCount < 2;
    pages.innerHTML = pageCount < 2 ? '' : [
      `<button type="button" data-page="${page - 1}" ${page === 1 ? 'disabled' : ''}>← Wstecz</button>`,
      ...Array.from({ length: pageCount }, (_, index) => {
        const number = index + 1;
        return `<button type="button" data-page="${number}" aria-label="Strona ${number}" ${page === number ? 'aria-current="page"' : ''}>${number}</button>`;
      }),
      `<button type="button" data-page="${page + 1}" ${page === pageCount ? 'disabled' : ''}>Dalej →</button>`
    ].join('');
    if (focusPage) pages.querySelector('[aria-current="page"]')?.focus();
  }

  filters.addEventListener('click', event => {
    const button = event.target.closest('button');
    if (!button) return;
    filter = button.dataset.type;
    page = 1;
    for (const option of filters.querySelectorAll('button')) {
      option.setAttribute('aria-pressed', String(option === button));
    }
    renderResults();
  });
  pages.addEventListener('click', event => {
    const button = event.target.closest('button[data-page]');
    if (!button || button.disabled) return;
    page = Number(button.dataset.page);
    renderResults(true);
  });
  renderResults();
}

function renderDetail() {
  const detail = document.querySelector('#card-detail');
  const id = new URLSearchParams(location.search).get('karta');
  const card = id === null ? cards[0] : cards.find(item => item.id === id);
  if (!card) {
    document.title = 'Nie znaleziono karty · Forge the Board';
    detail.innerHTML = '<section class="deck-missing deck-wrap"><h1>Nie znaleziono karty</h1><p><a href="karty.html">Wróć do talii „Wybrzeża Gryfów”</a>.</p></section>';
    return;
  }
  document.title = `${card.title} · Forge the Board`;
  detail.innerHTML = `<section class="deck-hero deck-image-hero detail-hero" data-type="${card.type}" aria-labelledby="card-title">
    <div class="deck-art deck-hero-backdrop" aria-hidden="true">
      <img src="assets/card-art/${card.art}.webp" alt="" width="960" height="640" fetchpriority="high">
    </div>
    <div class="deck-wrap">
      <div class="deck-intro">
        <nav class="deck-breadcrumb" aria-label="Ścieżka nawigacji"><a href="karty.html">← Karty gry</a></nav>
        ${tag(card)}
        <h1 id="card-title">${card.title}</h1>
        <p class="deck-voice">${card.lead}</p>
      </div>
    </div>
  </section>
  <section class="deck-rules deck-wrap" aria-labelledby="rule-title">
    ${cardTile(card, { current: true })}
    <div class="deck-rule-copy">
      <div class="deck-rule-meta">
        <dl><div><dt>Rola</dt><dd>${card.label}</dd></div>
        <div><dt>Kiedy użyć</dt><dd>${card.phase}</dd></div></dl>
      </div>
      <h2 id="rule-title">Efekt karty</h2><p>${card.rule}</p>
      <h3>W trakcie wyprawy</h3><p>${card.tip}</p>
      ${saveButton(card)}
    </div>
  </section>
  <section class="deck-listing deck-wrap" aria-labelledby="related-title">
    <h2 id="related-title">Powiązane karty</h2>
    <div class="deck-grid related-grid">${card.related.map(id => cardTile(cards.find(item => item.id === id))).join('')}</div>
  </section>`;
}

if (document.body.dataset.cardView === 'detail') renderDetail();
else renderListing();

document.querySelector('#main').addEventListener('click', event => {
  const button = event.target.closest('[data-save-card]');
  if (!button) return;
  const id = button.dataset.saveCard;
  const isSaved = !saved.has(id);
  if (isSaved) saved.add(id);
  else saved.delete(id);
  button.setAttribute('aria-pressed', String(isSaved));
  button.querySelector('span').textContent = isSaved ? 'Zapisano' : 'Zapisz';
  try { localStorage.setItem('forge-deck-saved', JSON.stringify([...saved])); }
  catch { /* Preserve the on-page state when storage is unavailable. */ }
});

const preference = matchMedia('(prefers-reduced-motion: reduce)');
const noop = () => {};

async function animateIllustration(host, { duration, canPaint, sketchReturn = 0, inkColor }) {
  if (preference.matches || !canPaint()) return noop;
  const image = host.querySelector('img');
  const paintWithoutWebGL = () => {
    if (preference.matches || !canPaint()) return noop;
    const pencil = image.cloneNode();
    pencil.className = 'deck-art-pencil';
    if (sketchReturn) {
      document.querySelector('#deck-card-pencil-ink feFlood').setAttribute('flood-color', inkColor);
      host.classList.add('deck-paint-roundtrip');
    }
    host.prepend(pencil);
    host.style.setProperty('--deck-paint-duration', `${duration}s`);
    host.classList.add('deck-paint-fallback');
    function finish(event) {
      if (event && !['deck-paper-reveal', 'deck-paper-roundtrip'].includes(event.animationName)) return;
      image.removeEventListener('animationend', finish);
      host.classList.remove('deck-paint-fallback', 'deck-paint-roundtrip');
      host.style.removeProperty('--deck-paint-duration');
      pencil.remove();
    }
    image.addEventListener('animationend', finish);
    return finish;
  };
  if (location.protocol === 'file:' || !window.Motion) return paintWithoutWebGL();
  try {
    const { paintArtwork } = await import('./hero-watercolour.js');
    return await paintArtwork({
      host, image, animate: window.Motion.animate, preference, duration, canPaint, sketchReturn, inkColor,
      onUnavailable: paintWithoutWebGL
    });
  } catch {
    return paintWithoutWebGL();
  }
}

const mapBackdrop = document.querySelector('[data-card-paint]');
if (mapBackdrop) animateIllustration(mapBackdrop, {
  duration: 2.8, canPaint: () => mapBackdrop.getBoundingClientRect().bottom > 0
});

const main = document.querySelector('#main');
let activePaint;
function stopCardPaint() {
  activePaint?.stop();
  activePaint = undefined;
}
async function paintCard(link) {
  if (preference.matches || activePaint?.link === link) return;
  stopCardPaint();
  const request = { link, stop: noop };
  activePaint = request;
  const stop = await animateIllustration(link.querySelector('.deck-card-art'), {
    duration: .75, sketchReturn: .3,
    inkColor: getComputedStyle(link.closest('.deck-tile')).borderTopColor,
    canPaint: () => activePaint === request && link.isConnected
  });
  if (activePaint === request) request.stop = stop;
  else stop();
}
main.addEventListener('pointerover', event => {
  const link = event.target.closest('.deck-tile-link');
  if (link && event.pointerType !== 'touch' && !link.contains(event.relatedTarget)) paintCard(link);
});
main.addEventListener('pointerout', event => {
  const link = event.target.closest('.deck-tile-link');
  if (link === activePaint?.link && !link.contains(event.relatedTarget) && !link.matches(':focus-visible')) {
    stopCardPaint();
  }
});
main.addEventListener('focusin', event => {
  if (event.target.matches('.deck-tile-link:focus-visible')) paintCard(event.target);
});
main.addEventListener('focusout', event => {
  if (activePaint?.link === event.target && !event.target.matches(':hover')) stopCardPaint();
});
preference.addEventListener('change', () => { if (preference.matches) stopCardPaint(); });
