// Modulo "Parti Prime" (ex estensione Ermes-Extension-PartiPrime).
// Si attiva solo se il toggle "Modulo Parti Prime" nel popup e' acceso.
chrome.storage.sync.get({ partiPrimeEnabled: true }, (cfg) => {
  if (cfg.partiPrimeEnabled) avviaPartiPrime();
});

// Al cambio del toggle ricarica la pagina per applicare/rimuovere le funzioni
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'sync' && changes.partiPrimeEnabled && window.location.pathname.includes('/parte-prima')) {
    window.location.reload();
  }
});

function avviaPartiPrime() {
  if (
    window.location.search.includes('mod/?id=') ||
    (window.location.pathname.includes('mod') && window.location.search.includes('id=')) ||
    window.location.pathname.endsWith('/parte-prima/add/') ||
    window.location.pathname.endsWith('/parte-prima/add')
  ) return;

  const BASE_URL = 'http://ermes.cen.poliziadistato.it/admin/parte-prima/mod/?id=';
  const UPLOAD_URL = 'http://ermes.cen.poliziadistato.it/admin/index/add-allegati?type=parteprima&parteprima=';

  const BTN_ROW_STYLE = `
  display:inline-flex !important;
  align-items:center !important;
  justify-content:center !important;
  width:34px !important;
  height:34px !important;
  padding:0 !important;
  font-size:16px !important;
  font-weight:bold !important;
  cursor:pointer !important;
  background-color:#4caf50 !important;
  background:#4caf50 !important;
  color:#fff !important;
  border:1px solid #388e3c !important;
  border-radius:4px !important;
  line-height:1 !important;
  flex-shrink:0 !important;
  opacity:1 !important;
  box-shadow:none !important;
  `;

  const BTN_ROW_HOVER = `
  display:inline-flex !important;
  align-items:center !important;
  justify-content:center !important;
  width:34px !important;
  height:34px !important;
  padding:0 !important;
  font-size:16px !important;
  font-weight:bold !important;
  cursor:pointer !important;
  background-color:#388e3c !important;
  background:#388e3c !important;
  color:#fff !important;
  border:1px solid #2e7d32 !important;
  border-radius:4px !important;
  line-height:1 !important;
  flex-shrink:0 !important;
  opacity:1 !important;
  box-shadow:none !important;
  `;

  const BTN_COPY_STYLE = `
  display:inline-flex !important;
  align-items:center !important;
  justify-content:center !important;
  width:34px !important;
  height:34px !important;
  padding:0 !important;
  cursor:pointer !important;
  background-color:#1976d2 !important;
  background:#1976d2 !important;
  color:#fff !important;
  border:1px solid #0d47a1 !important;
  border-radius:4px !important;
  line-height:1 !important;
  flex-shrink:0 !important;
  box-shadow:none !important;
  `;

  const BTN_COPY_HOVER = `
  display:inline-flex !important;
  align-items:center !important;
  justify-content:center !important;
  width:34px !important;
  height:34px !important;
  padding:0 !important;
  cursor:pointer !important;
  background-color:#0d47a1 !important;
  background:#0d47a1 !important;
  color:#fff !important;
  border:1px solid #0d47a1 !important;
  border-radius:4px !important;
  line-height:1 !important;
  flex-shrink:0 !important;
  box-shadow:none !important;
  `;

  const BTN_TOOLBAR_BASE = `
  padding:8px 18px !important;
  font-size:14px !important;
  font-weight:bold !important;
  cursor:pointer !important;
  border-radius:5px !important;
  color:#fff !important;
  opacity:1 !important;
  margin-left:6px !important;
  line-height:1.4 !important;
  `;

  const BTN_ALL_STYLE = BTN_TOOLBAR_BASE + `background-color:#4caf50 !important;background:#4caf50 !important;border:1px solid #388e3c !important;`;
  const BTN_ALL_HOVER_STYLE = BTN_TOOLBAR_BASE + `background-color:#388e3c !important;background:#388e3c !important;border:1px solid #2e7d32 !important;`;
  const BTN_SCAN_ON = BTN_TOOLBAR_BASE + `background-color:#1976d2 !important;background:#1976d2 !important;border:1px solid #0d47a1 !important;`;
  const BTN_SCAN_ON_HOVER = BTN_TOOLBAR_BASE + `background-color:#0d47a1 !important;background:#0d47a1 !important;border:1px solid #0d47a1 !important;`;
  const BTN_SCAN_OFF = BTN_TOOLBAR_BASE + `background-color:#9e9e9e !important;background:#9e9e9e !important;border:1px solid #757575 !important;`;
  const BTN_SCAN_OFF_HOVER = BTN_TOOLBAR_BASE + `background-color:#757575 !important;background:#757575 !important;border:1px solid #757575 !important;`;
  const BTN_ATTACH_STYLE = BTN_TOOLBAR_BASE + `background-color:#f57c00 !important;background:#f57c00 !important;border:1px solid #ef6c00 !important;`;
  const BTN_ATTACH_HOVER = BTN_TOOLBAR_BASE + `background-color:#ef6c00 !important;background:#ef6c00 !important;border:1px solid #e65100 !important;`;

  const SCAN_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;margin-right:4px"><rect x="2" y="3" width="4" height="18"/><rect x="8" y="3" width="2" height="18"/><rect x="12" y="3" width="4" height="18"/><rect x="18" y="3" width="4" height="18"/></svg>`;
  const COPY_ICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>`;
  const CHECK_ICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`;
  const ATTACH_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;margin-right:4px"><path d="M21 12.5l-8.5 8.5a5 5 0 0 1-7.07-7.07L14 5.33a3.5 3.5 0 0 1 4.95 4.95L10 19.23a2 2 0 0 1-2.83-2.83L15.5 8.07"/></svg>`;

  function applyBtnStyle(btn, style) {
    btn.setAttribute('style', style.replace(/\n\s*/g, ' ').trim());
  }

  function formatDate(ddmmyyyy) {
    const parts = ddmmyyyy.trim().split('/');
    if (parts.length !== 3) return '';
    const yy = parts[2].slice(-2);
    return yy + parts[1] + parts[0];
  }

  function extractProtocollo(raw) {
    return raw.trim().split('/')[0];
  }

  function copyToClipboard(text, onDone) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(onDone).catch(() => fallbackCopy(text, onDone));
    } else {
      fallbackCopy(text, onDone);
    }
  }

  function fallbackCopy(text, onDone) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('style', 'position:fixed;top:-9999px;left:-9999px;opacity:0;');
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    try { document.execCommand('copy'); } catch (e) {}
    document.body.removeChild(ta);
    if (onDone) onDone();
  }

  function processIdCells() {
    const idImages = document.querySelectorAll('table.partiPrimeTable tbody td img[data-original-title]');
    idImages.forEach((img) => {
      const cell = img.closest('td');
      if (!cell || cell.dataset.ermesProcessed) return;
      cell.dataset.ermesProcessed = 'true';

      const id = img.getAttribute('data-original-title');
      if (!id) return;

      const wrapper = document.createElement('div');
      wrapper.setAttribute('style', 'display:flex !important;align-items:center !important;justify-content:center !important;gap:4px !important;');

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = '↗';
      btn.title = 'Apri ID ' + id + ' in nuova scheda';
      applyBtnStyle(btn, BTN_ROW_STYLE);

      btn.addEventListener('mouseenter', () => applyBtnStyle(btn, BTN_ROW_HOVER));
      btn.addEventListener('mouseleave', () => applyBtnStyle(btn, BTN_ROW_STYLE));
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        window.open(BASE_URL + id, '_blank');
      });

      const idLabel = document.createElement('span');
      idLabel.textContent = id;
      idLabel.setAttribute('style', 'font-size:11px !important;font-weight:bold !important;color:#222 !important;font-family:monospace !important;white-space:nowrap !important;');

      wrapper.appendChild(btn);
      wrapper.appendChild(idLabel);
      cell.innerHTML = '';
      cell.appendChild(wrapper);
    });
  }

  function getRowFlightDate(tr) {
    const cells = tr.querySelectorAll('td');
    if (cells.length < 2) return null;
    const dateCell = cells[1];
    const parts = dateCell.innerHTML
      .split(/<br\s*\/?>/i)
      .map((p) => p.replace(/<[^>]+>/g, '').trim())
      .filter(Boolean);
    return parts[1] || parts[0] || null;
  }

  function addDateSeparators() {
    const table = document.querySelector('table.partiPrimeTable');
    if (!table) return;
    const rows = Array.from(table.querySelectorAll('tbody tr'));
    let lastDate = null;
    rows.forEach((tr) => {
      const dateStr = getRowFlightDate(tr);
      const isSeparator = lastDate !== null && dateStr !== null && dateStr !== lastDate;
      tr.querySelectorAll('td').forEach((td) => {
        if (isSeparator) {
          td.style.setProperty('border-top', '4px solid #d32f2f', 'important');
        } else {
          td.style.removeProperty('border-top');
        }
      });
      if (dateStr !== null) lastDate = dateStr;
    });
  }

  function addOpenAllButton() {
    const filterBar = document.querySelector('div.talign-right');
    if (!filterBar || filterBar.dataset.ermesOpenAll) return;
    filterBar.dataset.ermesOpenAll = 'true';
    filterBar.setAttribute('style', 'display:flex !important;justify-content:flex-end !important;align-items:center !important;flex-wrap:wrap !important;gap:4px !important;');

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.innerHTML = '↗ Apri tutti';
    btn.title = 'Apre ogni ID della pagina in una scheda separata';
    btn.autocomplete = 'off';
    applyBtnStyle(btn, BTN_ALL_STYLE);

    btn.addEventListener('mouseenter', () => applyBtnStyle(btn, BTN_ALL_HOVER_STYLE));
    btn.addEventListener('mouseleave', () => applyBtnStyle(btn, BTN_ALL_STYLE));
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();

      const ids = Array.from(document.querySelectorAll('table.partiPrimeTable tbody td img[data-original-title]'))
        .map(img => img.getAttribute('data-original-title'))
        .filter(Boolean);
      const processedIds = Array.from(document.querySelectorAll('table.partiPrimeTable tbody td[data-ermes-processed] span'))
        .map(span => span.textContent.trim())
        .filter(id => /^\d+$/.test(id));
      const allIds = [...new Set([...ids, ...processedIds])];

      if (allIds.length === 0) {
        alert('Nessun ID trovato.');
        return;
      }

      if (!confirm(`Aprire ${allIds.length} schede?`)) return;
      allIds.forEach(id => window.open(BASE_URL + id, '_blank'));
    });

    filterBar.appendChild(btn);
  }

  let scanColVisible = true;

  function addScanNameColumn() {
    const table = document.querySelector('table.partiPrimeTable');
    if (!table) return;

    const rows = Array.from(table.querySelectorAll('tbody tr'));
    if (rows.length === 0) return;

    const rowData = rows.map(tr => {
      const cells = tr.querySelectorAll('td');
      if (cells.length < 3) return null;

      const id = tr.querySelector('img[data-original-title]')?.getAttribute('data-original-title') ||
                 tr.querySelector('td[data-ermes-processed] span')?.textContent?.trim() || '';

      const cell1Text = cells[1].innerText || cells[1].textContent || '';
      const lines1 = cell1Text.split('\n').map(s => s.trim()).filter(Boolean);
      const protocollo = lines1.length > 0 ? extractProtocollo(lines1[0]) : '';
      const dataRaw = lines1.length > 1 ? lines1[1] : '';
      const dataFmt = formatDate(dataRaw);

      const cell2Text = cells[2].innerText || cells[2].textContent || '';
      const lines2 = cell2Text.split('\n').map(s => s.trim()).filter(Boolean);
      const matricola = lines2.length > 1 ? lines2[1] : (lines2[0] || '');

      return { tr, cells, id, dataFmt, matricola, protocollo };
    }).filter(Boolean);

    const groupMap = new Map();
    rowData.forEach(({ dataFmt, matricola, protocollo }) => {
      const key = [dataFmt, matricola].filter(Boolean).join('_');
      if (!key) return;
      if (!groupMap.has(key)) groupMap.set(key, []);
      if (protocollo && !groupMap.get(key).includes(protocollo)) {
        groupMap.get(key).push(protocollo);
      }
    });

    rowData.forEach(({ tr, cells, id, dataFmt, matricola, protocollo }) => {
      if (tr.querySelector('.ermes-scan-box')) return;

      const key = [dataFmt, matricola].filter(Boolean).join('_');
      const protos = groupMap.get(key) || (protocollo ? [protocollo] : []);
      const nomeScan = [key, ...protos].filter(Boolean).join('_');
      if (!nomeScan) return;

      const targetCell = cells[cells.length - 1];
      if (!targetCell) return;

      targetCell.style.position = 'relative';
      targetCell.style.overflow = 'visible';
      targetCell.style.minWidth = '260px';
      targetCell.dataset.ermesScanHost = 'true';
      targetCell.dataset.ermesNomeScan = nomeScan;
      targetCell.dataset.ermesId = id || '';

      const box = document.createElement('div');
      box.className = 'ermes-scan-box';
      box.setAttribute('style', [
        'display:flex !important',
        'align-items:center !important',
        'justify-content:space-between !important',
        'gap:6px !important',
        'min-width:250px !important',
        'padding:2px 0 !important',
      ].join(';'));

      const span = document.createElement('span');
      span.textContent = nomeScan;
      span.setAttribute('style', [
        'text-align:left !important',
        'flex:1 1 auto !important',
        'font-weight:bold !important',
        'white-space:nowrap !important',
      ].join(';'));

      const copyBtn = document.createElement('button');
      copyBtn.type = 'button';
      copyBtn.innerHTML = COPY_ICON_SVG;
      copyBtn.title = 'Copia nome scansione';
      applyBtnStyle(copyBtn, BTN_COPY_STYLE);

      copyBtn.addEventListener('mouseenter', () => applyBtnStyle(copyBtn, BTN_COPY_HOVER));
      copyBtn.addEventListener('mouseleave', () => applyBtnStyle(copyBtn, BTN_COPY_STYLE));
      copyBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        copyToClipboard(nomeScan, () => {
          copyBtn.innerHTML = CHECK_ICON_SVG;
          setTimeout(() => { copyBtn.innerHTML = COPY_ICON_SVG; }, 1400);
        });
      });

      box.appendChild(span);
      box.appendChild(copyBtn);
      targetCell.appendChild(box);
    });
  }

  function removeScanNameColumn() {
    document.querySelectorAll('.ermes-scan-box').forEach(el => el.remove());
    document.querySelectorAll('td[data-ermes-scan-host="true"]').forEach(td => {
      td.style.minWidth = '';
      delete td.dataset.ermesScanHost;
      delete td.dataset.ermesNomeScan;
      delete td.dataset.ermesId;
    });
  }

  function updateScanBtnStyle(btn) {
    applyBtnStyle(btn, scanColVisible ? BTN_SCAN_ON : BTN_SCAN_OFF);
    btn.innerHTML = SCAN_ICON + (scanColVisible ? 'Nomi scansione ✓' : 'Nomi scansione');
  }

  function addScanColButton() {
    const filterBar = document.querySelector('div.talign-right');
    if (!filterBar || filterBar.dataset.ermesScanBtn) return;
    filterBar.dataset.ermesScanBtn = 'true';

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.title = 'Mostra/nascondi nomi di scansione';
    btn.autocomplete = 'off';
    updateScanBtnStyle(btn);

    btn.addEventListener('mouseenter', () => {
      applyBtnStyle(btn, scanColVisible ? BTN_SCAN_ON_HOVER : BTN_SCAN_OFF_HOVER);
    });
    btn.addEventListener('mouseleave', () => {
      applyBtnStyle(btn, scanColVisible ? BTN_SCAN_ON : BTN_SCAN_OFF);
    });
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (scanColVisible) {
        removeScanNameColumn();
        scanColVisible = false;
      } else {
        addScanNameColumn();
        scanColVisible = true;
      }
      updateScanBtnStyle(btn);
    });

    filterBar.appendChild(btn);
  }

  async function pickFolderFiles() {
    if (window.showDirectoryPicker) {
      const dirHandle = await window.showDirectoryPicker();
      const filesByName = new Map();

      const walk = async (handle) => {
        for await (const entry of handle.values()) {
          if (entry.kind === 'file') {
            const file = await entry.getFile();
            if (/\.pdf$/i.test(file.name)) filesByName.set(file.name.trim(), file);
          } else if (entry.kind === 'directory') {
            await walk(entry);
          }
        }
      };

      await walk(dirHandle);
      return filesByName;
    }

    return new Promise((resolve, reject) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.webkitdirectory = true;
      input.multiple = true;
      input.accept = '.pdf,application/pdf';
      input.style.display = 'none';
      document.body.appendChild(input);

      input.addEventListener('change', () => {
        const filesByName = new Map();
        Array.from(input.files || [])
          .filter(file => /\.pdf$/i.test(file.name))
          .forEach(file => filesByName.set(file.name.trim(), file));
        document.body.removeChild(input);
        resolve(filesByName);
      });

      input.addEventListener('cancel', () => {
        document.body.removeChild(input);
        reject(new Error('cancelled'));
      });

      input.click();
    });
  }

  function setFileInputFiles(input, file) {
    const dt = new DataTransfer();
    dt.items.add(file);
    input.files = dt.files;
    input.dispatchEvent(new Event('change', { bubbles: true }));
  }

  function collectUniqueTargets() {
    const rawTargets = Array.from(
      document.querySelectorAll('td[data-ermes-scan-host="true"][data-ermes-id][data-ermes-nome-scan]')
    ).map(td => ({
      id: (td.dataset.ermesId || '').trim(),
      nomeScan: (td.dataset.ermesNomeScan || '').trim()
    })).filter(x => x.id && x.nomeScan);

    const uniqueMap = new Map();
    rawTargets.forEach(item => {
      uniqueMap.set(`${item.id}||${item.nomeScan}`, item);
    });

    return Array.from(uniqueMap.values());
  }

  function collectMatchingFiles(targets, filesByName) {
    return targets.map(target => ({
      ...target,
      fileName: target.nomeScan + '.pdf',
      file: filesByName.get(target.nomeScan + '.pdf') || null
    }));
  }


  function uploadWithExistingWindow(item) {
    return new Promise((resolve, reject) => {
      const { file, win } = item;
      const start = Date.now();
      const check = () => {
        try {
          if (win.closed) {
            reject(new Error('upload window closed'));
            return;
          }

          const doc = win.document;
          const input = doc.querySelector('#fileupload input[type="file"], input[type="file"]');
          if (!input) {
            if (Date.now() - start > 20000) {
              reject(new Error('upload form not ready'));
              return;
            }
            setTimeout(check, 250);
            return;
          }

          setFileInputFiles(input, file);

          const startBtn = doc.querySelector('#fileupload button.start, button.start, input[type="submit"], button[type="submit"]');
          if (startBtn) {
            startBtn.click();
          } else {
            const form = input.form || doc.querySelector('#fileupload');
            if (form) form.submit();
          }

          setTimeout(() => {
            try { if (!win.closed) win.close(); } catch (e) {}
            resolve();
          }, 2500);
        } catch (err) {
          if (Date.now() - start > 20000) reject(err);
          else setTimeout(check, 250);
        }
      };
      check();
    });
  }

  async function startAttachFlow() {
    try {
      if (!scanColVisible) {
        addScanNameColumn();
        scanColVisible = true;
        const scanBtn = document.querySelector('div.talign-right button[title="Mostra/nascondi nomi di scansione"]');
        if (scanBtn) updateScanBtnStyle(scanBtn);
      }

      const targets = collectUniqueTargets();
      if (targets.length === 0) {
        alert('Nessun nome scansione trovato.');
        return;
      }

      const filesByName = await pickFolderFiles();
      const targetsWithFiles = collectMatchingFiles(targets, filesByName);
      const matched = targetsWithFiles.filter(x => x.file);
      const missing = targetsWithFiles.filter(x => !x.file).map(x => x.fileName);

      if (matched.length === 0) {
        alert('Nessun PDF corrispondente ai nomi scansione trovati in cartella.');
        return;
      }

      if (!confirm(`Trovate ${targets.length} righe uniche in tabella e ${matched.length} PDF corrispondenti nella cartella. Procedere con l\'upload?`)) {
        return;
      }

      let ok = 0;
      const failed = [...missing];

      for (const item of matched) {
        try {
          const win = window.open(UPLOAD_URL + encodeURIComponent(item.id), '_blank');
          if (!win) throw new Error('popup blocked');
          await uploadWithExistingWindow({ ...item, win });
          ok++;
        } catch (err) {
          console.error('Upload failed for', item.id, err);
          failed.push(item.fileName);
          if (String(err && err.message) === 'popup blocked') {
            break;
          }
        }
      }

      if (failed.length) {
        alert(`Completato: ${ok}/${targets.length}. Mancanti o falliti:\n\n` + failed.join('\n'));
      } else {
        alert(`Completato: ${ok}/${targets.length}.`);
      }
    } catch (err) {
      console.error(err);
      if (String(err && err.message) === 'popup blocked') {
        alert('Il browser blocca window.open mentre il selettore cartella/file è attivo o appena chiuso. Soluzione tecnica: dopo la scelta cartella, il browser non considera piu valido il gesto utente per aprire piu popup automatici. Serve aprire una sola finestra per volta oppure cambiare flusso.');
      } else if (String(err && err.message) !== 'cancelled') {
        alert('Operazione interrotta o non riuscita.');
      }
    }
  }

  function addAttachButton() {
    const filterBar = document.querySelector('div.talign-right');
    if (!filterBar || filterBar.dataset.ermesAttachBtn) return;
    filterBar.dataset.ermesAttachBtn = 'true';

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.innerHTML = ATTACH_ICON + 'ALLEGA';
    btn.title = 'Seleziona una cartella e allega automaticamente i PDF alle parti prime';
    applyBtnStyle(btn, BTN_ATTACH_STYLE);

    btn.addEventListener('mouseenter', () => applyBtnStyle(btn, BTN_ATTACH_HOVER));
    btn.addEventListener('mouseleave', () => applyBtnStyle(btn, BTN_ATTACH_STYLE));
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      startAttachFlow();
    });

    filterBar.appendChild(btn);
  }

  function waitAndInit() {
    const check = () => {
      const firstId = document.querySelector('table.partiPrimeTable tbody td img[data-original-title]');
      const filterBar = document.querySelector('div.talign-right');
      if (firstId && filterBar) {
        setTimeout(() => {
          processIdCells();
          addOpenAllButton();
          addScanColButton();
          addAttachButton();
          if (scanColVisible) addScanNameColumn();
          addDateSeparators();
        }, 500);
      } else {
        setTimeout(check, 200);
      }
    };
    check();
  }

  waitAndInit();

  const observer = new MutationObserver(() => {
    processIdCells();
    addOpenAllButton();
    addScanColButton();
    addAttachButton();
    if (scanColVisible) addScanNameColumn();
    addDateSeparators();
  });
  observer.observe(document.body, { childList: true, subtree: true });
}
