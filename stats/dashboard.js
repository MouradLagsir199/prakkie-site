(function () {
  'use strict';
  var token = '';
  var busy = false;
  var byId = function (id) { return document.getElementById(id); };
  var format = function (value) { return Number(value).toLocaleString('nl-NL'); };
  async function refresh() {
    if (busy || !token) return;
    busy = true;
    byId('refresh').disabled = true;
    byId('status').textContent = 'Laden…';
    try {
      var response = await fetch('https://prakkie-api-prod.azurewebsites.net/v1/website/stats?days=' + byId('days').value, {
        headers: { Authorization: 'Bearer ' + token }, cache: 'no-store', credentials: 'omit', referrerPolicy: 'no-referrer',
      });
      if (!response.ok) throw new Error(response.status === 401 ? 'Ongeldige toegangscode.' : 'Ophalen mislukt. Probeer opnieuw.');
      var data = await response.json();
      var sums = { view: 0, apple_click: 0, apple_redirect: 0, google_click: 0, google_redirect: 0 };
      var dates = {};
      data.rows.forEach(function (row) {
        var key = row.event === 'view' ? 'view' : row.store + '_' + row.event;
        if (!(key in sums)) return;
        sums[key] += row.count;
        if (!dates[row.date]) dates[row.date] = { view: 0, apple_click: 0, apple_redirect: 0, google_click: 0, google_redirect: 0 };
        dates[row.date][key] += row.count;
      });
      byId('views').textContent = format(sums.view);
      ['apple', 'google'].forEach(function (store) {
        byId(store).textContent = format(sums[store + '_click'] + sums[store + '_redirect']);
        byId(store + '-detail').textContent = format(sums[store + '_click']) + ' klikken · ' + format(sums[store + '_redirect']) + ' automatisch';
      });
      byId('rows').replaceChildren();
      Object.keys(dates).sort().reverse().forEach(function (date) {
        var row = dates[date];
        var tr = document.createElement('tr');
        [date, format(row.view), format(row.apple_click) + ' / ' + format(row.apple_redirect), format(row.google_click) + ' / ' + format(row.google_redirect)].forEach(function (value) {
          var td = document.createElement('td'); td.textContent = value; tr.appendChild(td);
        });
        byId('rows').appendChild(tr);
      });
      byId('period').textContent = data.start + ' t/m ' + data.end + ' (vandaag is nog niet volledig)';
      byId('report').hidden = false;
      byId('login').hidden = true;
      byId('token').value = '';
      byId('status').textContent = data.rows.length ? 'Bijgewerkt om ' + new Date().toLocaleTimeString('nl-NL') : 'Nog geen metingen ontvangen.';
    } catch (err) { byId('status').textContent = err.message; }
    finally { busy = false; byId('refresh').disabled = false; }
  }
  byId('login').addEventListener('submit', function (event) { event.preventDefault(); token = byId('token').value.trim(); refresh(); });
  byId('refresh').addEventListener('click', refresh);
  byId('days').addEventListener('change', refresh);
  byId('logout').addEventListener('click', function () { location.reload(); });
}());
