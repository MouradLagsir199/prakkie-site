const screens = {
  results: ['Zoekresultaten voor halfvolle melk bij verschillende winkels, met prijzen en hartjes', 'Zoeken en vergelijken'],
  list: ['Boodschappenlijst met melk, brood en afgevinkte bananen', 'Je boodschappenlijstje'],
  match: ['Twee alternatieven voor halfvolle melk bij Albert Heijn', 'Alternatieven kiezen'],
  stores: ['Overzicht van je lijstje per winkel met totalen en openstaande keuzes', 'Je lijstje per winkel']
};
document.querySelectorAll('[data-screen]').forEach(button => {
  button.addEventListener('click', () => {
    const screen = button.dataset.screen;
    if (!screens[screen]) return;
    document.querySelectorAll('[data-screen]').forEach(other => {
      const active = other === button;
      other.classList.toggle('active', active);
      other.setAttribute('aria-pressed', String(active));
    });
    const image = document.getElementById('feature-image');
    image.src = '/assets/app-' + screen + '.png';
    image.alt = screens[screen][0];
    document.getElementById('feature-caption').textContent = screens[screen][1] + ' · voorbeeldgegevens';
  });
});
