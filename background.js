let schedeInCorso = [];
let allStats = [];
let filtriUsati = null;

chrome.runtime.onMessage.addListener((msg, sender) => {
  if (msg.type === "openPilot") {
    if (!filtriUsati && msg.filtri) {
      filtriUsati = msg.filtri;
    }
    chrome.tabs.create({ url: msg.url }, tab => {
      schedeInCorso.push({
        tabId: tab.id,
        pilota: msg.pilotaId,
        keepOpen: msg.keepOpen,
        showSummary: msg.showSummary
      });
    });

  } else if (msg.type === "statsComplete") {
    allStats.push(msg.data);

    const idx = schedeInCorso.findIndex(s => s.tabId === sender.tab.id);
    let shouldShowSummary = false;

    if (idx !== -1) {
      const scheda = schedeInCorso[idx];
      shouldShowSummary = scheda.showSummary;
      if (!scheda.keepOpen) chrome.tabs.remove(scheda.tabId);
      schedeInCorso.splice(idx, 1);
    }

    if (allStats.length > 0 && schedeInCorso.length === 0 && shouldShowSummary) {

      const tableRows = allStats.map(r =>
        `<tr>
          <td>${r.pilota}</td>
          <td>${r.oreReali}</td>
          <td>${r.oreSimulatore}</td>
          <td>${r.oreTotali}</td>
          <td>${r.oreNotturne || '0:00'}</td>
          <td>${r.dataUltimoVolo || ''}</td>
          <td>${r.dataUltimoVoloNotturno || ''}</td>
        </tr>`
      ).join('');

      // NOTA: il tag </script> interno va spezzato per non chiudere il template literal
      const html = `<!DOCTYPE html><html lang="it"><head><meta charset="UTF-8"><title>Statistiche Piloti</title>
<style>
body{font-family:Arial,sans-serif;max-width:1050px;margin:40px auto;padding:20px;background:#f6f7f9}
h2{color:#2d6cdf;text-align:center;margin-bottom:10px}
.subtitle{text-align:center;color:#666;font-size:14px;margin-bottom:30px}
table{width:100%;border-collapse:collapse;background:white;box-shadow:0 2px 4px rgba(0,0,0,0.1);border-radius:8px;overflow:hidden}
th{background:#2d6cdf;color:white;padding:12px;text-align:left;font-weight:600;cursor:pointer;user-select:none;transition:background 0.2s}
th:hover{background:#1f56b5}
th::after{content:' \u2195';opacity:0.4;font-size:11px}
th.sorted-asc::after{content:' \u2191';opacity:1}
th.sorted-desc::after{content:' \u2193';opacity:1}
td{padding:12px;border-bottom:1px solid #e4e7eb}
tr:last-child td{border-bottom:none}
tbody tr:nth-child(even) td{background:#eef2fa}
tbody tr:nth-child(odd) td{background:#ffffff}
tbody tr:hover td{background:#dce8f5 !important}
.filtri-box{background:white;border-radius:8px;padding:14px 18px;margin-bottom:20px;box-shadow:0 2px 4px rgba(0,0,0,0.1);font-size:13px;color:#333}
.filtri-box strong{color:#2d6cdf}
.filtri-box span{display:inline-block;margin-right:24px}
</style>
</head><body>
<h2>&#128202; Statistiche Piloti</h2>
<p class="subtitle">Clicca sulle intestazioni per ordinare</p>
${filtriUsati ? `<div class="filtri-box">
  <span><strong>Periodo:</strong> ${filtriUsati.dal} &ndash; ${filtriUsati.al}</span>
  <span><strong>Aeromobile:</strong> ${filtriUsati.aeromobile}</span>
  <span><strong>Pilota:</strong> ${filtriUsati.pilotaSelezione}</span>
</div>` : ''}
<table id="statsTable">
  <thead>
    <tr>
      <th data-col="0" data-type="text">Pilota</th>
      <th data-col="1" data-type="ore">Ore Reali</th>
      <th data-col="2" data-type="ore">Ore Simulatore</th>
      <th data-col="3" data-type="ore">Ore Totali</th>
      <th data-col="4" data-type="ore">Ore Notturne</th>
      <th data-col="5" data-type="date">Data ultimo volo</th>
      <th data-col="6" data-type="date">Data ultimo volo notturno</th>
    </tr>
  </thead>
  <tbody>${tableRows}</tbody>
</table>
<scr` + `ipt>
(function(){
  var state = {col: null, dir: 1};

  function parseOre(s) {
    if (!s) return -1;
    var p = s.split(':');
    if (p.length === 2) return parseInt(p[0]) * 60 + (parseInt(p[1]) || 0);
    return -1;
  }

  function parseDate(s) {
    if (!s) return -1;
    var m = s.match(/(\\d{2})\\/(\\d{2})\\/(\\d{4})/);
    if (!m) return -1;
    return new Date(m[3] + '-' + m[2] + '-' + m[1]).getTime();
  }

  function sortBy(col, type) {
    var tbody = document.querySelector('#statsTable tbody');
    var rows = Array.from(tbody.querySelectorAll('tr'));
    var dir = (state.col === col) ? -state.dir : 1;
    state.col = col;
    state.dir = dir;

    rows.sort(function(a, b) {
      var av = a.cells[col].textContent.trim();
      var bv = b.cells[col].textContent.trim();
      var an, bn;
      if (type === 'ore')  { an = parseOre(av);  bn = parseOre(bv);  return dir * (an - bn); }
      if (type === 'date') { an = parseDate(av); bn = parseDate(bv); return dir * (an - bn); }
      return dir * av.localeCompare(bv, 'it');
    });

    rows.forEach(function(r){ tbody.appendChild(r); });

    document.querySelectorAll('#statsTable th').forEach(function(th){
      th.classList.remove('sorted-asc','sorted-desc');
    });
    var th = document.querySelector('#statsTable th[data-col="' + col + '"]');
    if (th) th.classList.add(dir === 1 ? 'sorted-asc' : 'sorted-desc');
  }

  document.querySelectorAll('#statsTable th').forEach(function(th){
    th.addEventListener('click', function(){
      sortBy(parseInt(th.dataset.col), th.dataset.type);
    });
  });

  // ordina per Pilota all'avvio
  sortBy(0, 'text');
})();
</scr` + `ipt>
</body></html>`;

      const dataUrl = 'data:text/html;charset=utf-8,' + encodeURIComponent(html);
      chrome.tabs.create({ url: dataUrl });
      allStats = [];
      filtriUsati = null;
    }
  }
});
