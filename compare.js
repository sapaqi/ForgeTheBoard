const viewer = document.querySelector('#variant-preview');
const openVersion = document.querySelector('.open-version');
const controls = [...document.querySelectorAll('[data-variant]')];
controls.forEach(button=>button.addEventListener('click',()=>{
  const variant = button.dataset.variant;
  controls.forEach(control=>control.setAttribute('aria-pressed',String(control===button)));
  viewer.src = `./?hero=${variant}`;
  viewer.title = variant==='fade'?'Wariant A — subtelny fade':'Wariant B — brzeg pergaminu';
  openVersion.href = `./?hero=${variant}`;
}));
