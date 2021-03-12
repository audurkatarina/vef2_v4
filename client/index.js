import { fetchEarthquakes } from './lib/earthquakes';
import { el, element, formatDate } from './lib/utils';
import { init, createPopup, clearMarkers } from './lib/map';

function clearEarthq() {
  const ul = document.querySelector('.earthquakes');
  const header = document.querySelector('.header_earthquakes');
  const cache = document.querySelector('.cache');
  ul.innerHTML = '';
  header.innerHTML = '';
  cache.innerHTML = '';
  clearMarkers();
}

function displayEarthq(earthquakes, headerQuakes, cached, elapsed) {
  const ul = document.querySelector('.earthquakes');
  const header = document.querySelector('.header_earthquakes');
  const cache = document.querySelector('.cache');
  header.innerHTML = headerQuakes;

  if (!earthquakes) {
    ul.appendChild(
      el('p', 'Villa við að sækja gögn'),
    );
  }
  if (cached) {
    cache.innerHTML = `Gögn voru í cache. Fyrirspurn tók ${elapsed} sek`;
  } else {
    cache.innerHTML = `Gögn voru ekki í cache. Fyrirspurn tók ${elapsed} sek`;
  }

  earthquakes.forEach((quake) => {
    const {
      title, mag, time, url,
    } = quake.properties;

    const link = element('a', { href: url, target: '_blank' }, null, 'Skoða nánar');

    const markerContent = el('div',
      el('h3', title),
      el('p', formatDate(time)),
      el('p', link));
    const marker = createPopup(quake.geometry, markerContent.outerHTML);

    const onClick = () => {
      marker.openPopup();
    };

    const li = el('li');

    li.appendChild(
      el('div',
        el('h2', title),
        el('dl',
          el('dt', 'Tími'),
          el('dd', formatDate(time)),
          el('dt', 'Styrkur'),
          el('dd', `${mag} á richter`),
          el('dt', 'Nánar'),
          el('dd', url.toString())),
        element('div', { class: 'buttons' }, null,
          element('button', null, { click: onClick }, 'Sjá á korti'),
          link)),
    );

    ul.appendChild(li);
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  // TODO
  // Bæta við virkni til að sækja úr lista
  // Nota proxy
  // Hreinsa header og upplýsingar þegar ný gögn eru sótt
  // Sterkur leikur að refactora úr virkni fyrir event handler í sér fall
  const links = document.querySelectorAll('a');
  links.forEach((link) => {
    link.addEventListener('click', async (e) => {
      e.preventDefault();
      clearEarthq();

      const urlParams = new URLSearchParams(e.target.getAttribute('href').slice(2));
      const period = urlParams.get('period');
      const type = urlParams.get('type');

      const loading = document.querySelector('.loading');
      loading.classList.toggle('hidden');
      const earthquakes = await fetchEarthquakes(type, period);
      loading.classList.toggle('hidden');

      displayEarthq(
        earthquakes.data.features,
        earthquakes.data.metadata.title,
        earthquakes.info.cached,
        earthquakes.info.elapsed,
      );
    });
  });
  const map = document.querySelector('.map');
  init(map);
});
