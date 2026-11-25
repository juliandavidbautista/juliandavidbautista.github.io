const themes = {
  blue:   ['#101d36','#edf4ff','#81b2ff','#23395a','#244b83'],
  teal:   ['#10282e','#eaf7f4','#67e2ce','#20444c','#235f64']
};
const palette = document.querySelector('#palette');
function applyPalette() {
  const values = themes[palette.value];
  document.documentElement.toggleAttribute('data-themed', Boolean(values));
  ['--ink','--paper','--orange','--surface','--deep'].forEach((key,index) => {
    if (values) document.documentElement.style.setProperty(key,values[index]);
    else document.documentElement.style.removeProperty(key);
  });
  if (typeof render === 'function') document.querySelectorAll('canvas[data-art]').forEach(render);
  document.querySelectorAll('a[href]').forEach(link => {
    const href = link.getAttribute('href');
    if (!/^(index|pump|router|coatings)\.html/.test(href)) return;
    const url = new URL(link.href); url.searchParams.set('palette',palette.value); link.setAttribute("href", href.split(/[?#]/)[0]+url.search+url.hash);
  });
}
palette.addEventListener('change',applyPalette);

const chosen=new URLSearchParams(location.search).get('palette');
if (Object.hasOwn(themes,chosen)) palette.value=chosen;

