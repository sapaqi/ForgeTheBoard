/* Podłącz rzeczywisty adres rejestracji, gdy aplikacja będzie dostępna. */
const REGISTRATION_URL = null;
const reducedPreview = new URLSearchParams(location.search).get('motion') === 'reduce';
const parchmentHero = new URLSearchParams(location.search).get('hero') === 'parchment';
if (reducedPreview) document.documentElement.classList.add('reduce-motion-preview');
const dialog = document.querySelector('#start-dialog');
document.querySelectorAll('[data-start]').forEach(button => button.addEventListener('click', () => {
  if (REGISTRATION_URL) { window.location.assign(REGISTRATION_URL); return; }
  dialog.showModal();
}));
document.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
document.querySelector('#dialog-workshop').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => { if (event.target === dialog) { const r = dialog.getBoundingClientRect(); if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) dialog.close(); } });
const menuButton = document.querySelector('.menu-toggle');
const mobileNav = document.querySelector('#mobile-nav');
function closeMenu() { mobileNav.hidden = true; menuButton.setAttribute('aria-expanded', 'false'); menuButton.setAttribute('aria-label', 'Otwórz menu'); }
menuButton.addEventListener('click', () => { const open = menuButton.getAttribute('aria-expanded') !== 'true'; mobileNav.hidden = !open; menuButton.setAttribute('aria-expanded', String(open)); menuButton.setAttribute('aria-label', open ? 'Zamknij menu' : 'Otwórz menu'); });
mobileNav.querySelectorAll('a,button').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', event => { if (event.key === 'Escape' && !mobileNav.hidden) { closeMenu(); menuButton.focus(); } });
const journey = document.querySelector('.forge-journey');
const stage = document.querySelector('.journey-stage');
const artifact = document.querySelector('.map-artifact');
const hero = document.querySelector('.hero-copy');
const chapter = document.querySelector('.chapter-two');
const shell = document.querySelector('.device-shell');
const ui = document.querySelector('.device-ui');
const title = document.querySelector('.world-title');
const wash = document.querySelector('.hero-wash');
const caption = document.querySelector('.journey-caption');
const hint = document.querySelector('.scroll-hint');
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const mapCanvas = document.querySelector('.map-canvas');
const edgeLines = [...artifact.querySelectorAll('.parchment-edge polyline')];
const staticCanvas = document.querySelector('.hero-static-canvas');
const staticEdgeLines = [...document.querySelectorAll('.hero-map-static .parchment-edge polyline')];
const clamp = (n, min = 0, max = 1) => Math.min(max, Math.max(min, n));
const lerp = (a,b,t) => a + (b-a)*t;
const smooth = t => t*t*(3-2*t);
function parchmentContour(mobile) {
  return Array.from({length:97},(_,i)=>{
    const noise = Math.sin(i*127.1+11.7)*43758.5453;
    const grain = noise-Math.floor(noise)-.5;
    const y = i===0?0:i===96?100:i*100/96+grain*.4;
    const base = mobile?(y<70?97-y*.065:92.45-(y-70)*2.72):48-y*.125;
    const tear = grain*2.6+Math.sin(i*.79)*.25-(i%19===7?1.1:0);
    return [base+tear,y];
  });
}
function paintParchment(canvas,lines,contour,amount) {
  const points = contour.map(([x,y])=>[x*amount,y]);
  canvas.style.clipPath = `polygon(100% 0%,100% 100%,${[...points].reverse().map(([x,y])=>`${x.toFixed(3)}% ${y.toFixed(3)}%`).join(',')})`;
  const outline = points.map(([x,y])=>`${x.toFixed(3)},${y.toFixed(3)}`).join(' ');
  lines.forEach(line=>line.setAttribute('points',outline));
}
let ticking = false;
function renderJourney() {
  ticking = false;
  const mobile = innerWidth <= 760;
  // Anchor the vertical mobile fade below the complete copy, including loaded fonts.
  stage.style.setProperty('--hero-copy-end', `${hero.offsetTop + hero.offsetHeight}px`);
  if (parchmentHero) paintParchment(staticCanvas,staticEdgeLines,parchmentContour(mobile),1);
  if (reduced.matches || reducedPreview) {
    stage.style.setProperty('--tablet-art-reveal', 1);
    stage.style.setProperty('--tablet-art-center-y', `${artifact.offsetTop + artifact.offsetHeight / 2}px`);
    if (parchmentHero) { mapCanvas.style.clipPath='none'; artifact.style.setProperty('--edge-open',0); }
    return;
  }
  const rect = journey.getBoundingClientRect();
  const stageHeight = stage.offsetHeight;
  const p = clamp(-rect.top / Math.max(1,journey.offsetHeight-stageHeight));
  stage.style.setProperty('--tablet-art-reveal', smooth(clamp((p-.47)/.28)).toFixed(3));
  const t = smooth(clamp((p-.04)/.65));
  const ratio = mobile ? 1.3 : 1.65;
  const frame = mobile ? 10 : 17;
  const textGap = mobile ? 36 : 48;
  const targetY = Math.max(stageHeight*(mobile?.44:.32),chapter.offsetTop+chapter.offsetHeight+textGap+frame);
  const bottomReserve = parseFloat(getComputedStyle(caption).bottom)+caption.offsetHeight+frame+24;
  const availableHeight = Math.max(120,stageHeight-targetY-bottomReserve);
  const endW = Math.min(mobile?86:58,870/stage.clientWidth*100,availableHeight*ratio/stage.clientWidth*100);
  const width = lerp(100,endW,t);
  const finalHeight = stage.clientWidth * endW / 100 / ratio;
  const height = lerp(stageHeight,finalHeight,t);
  artifact.style.width = `${width}%`;
  artifact.style.height = `${height}px`;
  artifact.style.left = `${(100-width)/2}%`;
  artifact.style.top = `${lerp(0,targetY,t)}px`;
  stage.style.setProperty('--tablet-art-center-y', `${lerp(0,targetY,t) + height / 2}px`);
  artifact.style.transform = 'none';
  artifact.style.setProperty('--frame-progress',t);
  if (parchmentHero) {
    const remaining = 1-smooth(clamp((p-.04)/.38));
    paintParchment(mapCanvas,edgeLines,parchmentContour(mobile),remaining);
    artifact.style.setProperty('--edge-open',remaining);
  }
  wash.style.opacity=1-smooth(clamp(p/.42));
  const opening = clamp(1-p/.3);
  hero.style.opacity=opening;
  hero.style.transform=`translateY(${-p*(mobile?72:180)}px)`;
  hero.style.visibility=opening===0?'hidden':'visible';
  const device = smooth(clamp((p-.3)/.34));
  shell.style.opacity=device;
  ui.style.opacity=device;
  title.style.opacity=0;
  const chapterTranslation = (1-device)*(mobile?18:35);
  const chapterClearance = lerp(0,targetY,t)-frame-chapter.offsetTop-chapter.offsetHeight-chapterTranslation;
  const chapterReveal = smooth(clamp((chapterClearance-(textGap-12))/12));
  chapter.style.opacity=smooth(clamp((p-.32)/.25))*chapterReveal;
  chapter.style.transform=`translateY(${chapterTranslation}px)`;
  caption.style.opacity=smooth(clamp((p-.7)/.17));
  hint.style.opacity=clamp(1-p/.15);
  stage.dataset.progress=p.toFixed(3);
}
function requestRender(){if(!ticking){ticking=true;requestAnimationFrame(renderJourney);}}
addEventListener('scroll',requestRender,{passive:true});
addEventListener('resize',requestRender);
reduced.addEventListener('change',requestRender);
document.fonts.ready.then(requestRender);
renderJourney();

// Align each side illustration with its adjacent graphic in desktop and stacked layouts.
const cardScene = document.querySelector('.idea-table');
const cardTableau = document.querySelector('.tableau');
const workshopScene = document.querySelector('.workshop');
const workshopGraphic = document.querySelector('.sample-stage');
function alignCowboyWithCards() {
  for (const [scene, graphic, property] of [[cardScene, cardTableau, '--cards-center-y'], [workshopScene, workshopGraphic, '--workshop-center-y']]) {
    const graphicRect = graphic.getBoundingClientRect();
    const sceneRect = scene.getBoundingClientRect();
    scene.style.setProperty(property, `${graphicRect.top + graphicRect.height / 2 - sceneRect.top - scene.clientTop}px`);
  }
}
const cardLayoutObserver = new ResizeObserver(alignCowboyWithCards);
cardLayoutObserver.observe(cardScene);
cardLayoutObserver.observe(cardTableau);
cardLayoutObserver.observe(workshopScene);
cardLayoutObserver.observe(workshopGraphic);
addEventListener('resize', alignCowboyWithCards);
document.fonts.ready.then(alignCowboyWithCards);
alignCowboyWithCards();

const workshopTabs = [...document.querySelectorAll('[data-view]')];
const mobileLayout = matchMedia('(max-width: 760px)');
function syncTabOrientation() {
  document.querySelector('.workshop-choices').setAttribute('aria-orientation', mobileLayout.matches ? 'horizontal' : 'vertical');
}
mobileLayout.addEventListener('change', syncTabOrientation);
syncTabOrientation();
const sampleCaptions = {
  map:'Miejsce na historie, których jeszcze nikt nie opowiedział.',
  cards:'Mała karta. Wielki zwrot w twojej opowieści.',
  rules:'Twój świat, twoje zasady. I jeszcze jedna runda.'
};
function selectWorkshopTab(tab, focus = false) {
  workshopTabs.forEach(other => {
    const selected = tab === other;
    other.setAttribute('aria-selected', String(selected));
    other.tabIndex = selected ? 0 : -1;
    other.classList.toggle('active', selected);
    document.getElementById(other.getAttribute('aria-controls')).hidden = !selected;
  });
  document.querySelector('.sample-caption').textContent = sampleCaptions[tab.dataset.view];
  if (focus) tab.focus();
}
workshopTabs.forEach((tab,index)=>{
  tab.addEventListener('click',()=>selectWorkshopTab(tab));
  tab.addEventListener('keydown',event=>{
    if (event.ctrlKey || event.metaKey || event.altKey) return;
    let next = index;
    if(event.key==='ArrowDown'||event.key==='ArrowRight') next=(index+1)%workshopTabs.length;
    else if(event.key==='ArrowUp'||event.key==='ArrowLeft') next=(index+workshopTabs.length-1)%workshopTabs.length;
    else if(event.key==='Home') next=0;
    else if(event.key==='End') next=workshopTabs.length-1;
    else return;
    event.preventDefault(); selectWorkshopTab(workshopTabs[next],true);
  });
});

