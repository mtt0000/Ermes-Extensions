(async function() {

  function waitForIFrame(id) {
    return new Promise(resolve => {
      const iframe = document.getElementById(id);
      if (iframe) {
        resolve(iframe);
      } else {
        const obs = new MutationObserver(() => {
          const f = document.getElementById(id);
          if (f) { obs.disconnect(); resolve(f); }
        });
        obs.observe(document.body, { childList: true, subtree: true });
      }
    });
  }

  // FIX nome: cerca div con font-size:10px che non inizia con "Dal"
  function getNomeCompleto(doc) {
    const divs = doc.querySelectorAll('div[style*="font-size:10px"]');
    for (const div of divs) {
      const text = div.textContent.trim();
      if (text.startsWith('Dal')) continue;
      if (/[A-Z]{2,}/.test(text) && /[A-Z][a-z]+/.test(text)) return text;
    }
    return "";
  }

  const QUALIFICHE = [
  "ADDETTO AGLI EQUINI","ADDETTO AI SERVIZI DI RISTORAZIONE",
  "AGENTE SCELTO TECNICO","AGENTE SCELTO","AGENTE TECNICO","AGENTE",
  "AIUTO EDUCATORE","AIUTO MANUTENTORE",
  "ASSISTENTE AMMINISTRATIVO CONTABILE","ASSISTENTE AMMINISTRATIVO",
  "ASSISTENTE CAPO COORDINATORE","ASSISTENTE CAPO TECNICO COORDINATORE",
  "ASSISTENTE CAPO TECNICO","ASSISTENTE CAPO",
  "ASSISTENTE DI BIBLIOTECA","ASSISTENTE ECONOMICO FINANZIARIO",
  "ASSISTENTE INFORMATICO","ASSISTENTE LINGUISTICO",
  "ASSISTENTE SOCIALE COORDINATORE","ASSISTENTE STATISTICO",
  "ASSISTENTE TECNICO EDILE","ASSISTENTE TECNICO","ASSISTENTE",
  "AUSILIARIO TECNICO","AUSILIARIO","BIBLIOTECARIO","BUTTERO",
  "CAMERIERE DIRETTORE DI SALA E DI BAR",
  "COADIUTORE AMMINISTRATIVO CONTABILE - A","COADIUTORE AMMINISTRATIVO CONTABILE",
  "COLLABORATORE AMMINISTRATIVO CONTABILE","COLLABORATORE AMMINISTRATIVO",
  "COLLABORATORE DI BIBLIOTECA","COLLABORATORE INFORMATICO",
  "COLLABORATORE STATISTICO","COLLABORATORE TECNICO",
  "COMMISSARIO CAPO TECNICO","COMMISSARIO CAPO","COMMISSARIO TECNICO R.E.",
  "COMMISSARIO TECNICO","COMMISSARIO",
  "DIRETTORE AMM.VO CONTABILE","DIRETTORE AMM.VO",
  "DIRETTORE COORD. DI SERVIZIO SOCIALE","DIRETTORE DI BIBLIOTECA",
  "DIRETTORE DI ORGANIZZAZIONE","DIRETTORE DI SERVIZIO SOCIALE",
  "DIRETTORE INFORMATICO","DIRETTORE STATISTICO","DIRETTORE TECNICO CAPO",
  "DIRETTORE TECNICO SUPERIORE","DIRETTORE TRADUTTORE INTERPRETE",
  "DIRIGENTE GENERALE MEDICO","DIRIGENTE GENERALE TECNICO","DIRIGENTE GENERALE",
  "DIRIGENTE SUPERIORE MEDICO","DIRIGENTE SUPERIORE TECNICO","DIRIGENTE SUPERIORE",
  "EDUCATORE ESPERTO","EDUCATORE",
  "FUNZIONARIO AMMINISTRATIVO CONTABILE","FUNZIONARIO AMMINISTRATIVO",
  "FUNZIONARIO ASSISTENTE SOCIALE","FUNZIONARIO DI BIBLIOTECA",
  "FUNZIONARIO DI ORGANIZZAZIONE","FUNZIONARIO ECONOMICO FINANZIARIO",
  "FUNZIONARIO INFORMATICO","FUNZIONARIO LINGUISTICO",
  "FUNZIONARIO STATISTICO","FUNZIONARIO TECNICO",
  "ISPETTORE CAPO TECNICO","ISPETTORE CAPO","ISPETTORE SUPERIORE TECNICO",
  "ISPETTORE SUPERIORE","ISPETTORE TECNICO","ISPETTORE",
  "MANUTENTORE ESPERTO","MANUTENTORE",
  "MEDICO CAPO","MEDICO PRINCIPALE","MEDICO SUPERIORE","MEDICO",
  "OPERATORE AMMINISTRATIVO CONTABILE","OPERATORE AMMINISTRATIVO",
  "OPERATORE DI CENTRO STAMPA","OPERATORE ESPERTO DI CENTRO STAMPA",
  "OPERATORE ESPERTO PER L`ALIMENTAZIONE","OPERATORE PER L`ALIMENTAZIONE",
  "OPERATORE TECNICO",
  "PERITO SUPERIORE SOSTITUTO DIRETTORE TECNICO COORDINATORE",
  "PRIMO DIRIGENTE MEDICO","PRIMO DIRIGENTE TECNICO","PRIMO DIRIGENTE",
  "RESPONSABILE DI MENSA","REVISORE TRADUTTORE INTERPRETE",
  "SORVEGLIANTE DEGLI EQUINI","SORVEGLIANTE DI ALLEVAMENTO",
  "SOSTITUTO COMMISSARIO COORDINATORE","SOSTITUTO COMMISSARIO TECNICO","SOSTITUTO COMMISSARIO",
  "SOVRINTENDENTE CAPO COORDINATORE","SOVRINTENDENTE CAPO TECNICO COORDINATORE",
  "SOVRINTENDENTE CAPO TECNICO","SOVRINTENDENTE CAPO",
  "SOVRINTENDENTE TECNICO","SOVRINTENDENTE",
  "TECNICO COORDINATORE DI CENTRO STAMPA","TECNICO COORDINATORE",
  "TRADUTTORE INTERPRETE",
  "VICE COMMISSARIO","VICE ISPETTORE TECNICO","VICE ISPETTORE",
  "VICE QUESTORE AGGIUNTO","VICE QUESTORE",
  "VICE SOVRINTENDENTE TECNICO","VICE SOVRINTENDENTE"
].sort((a, b) => b.length - a.length); // <-- importante: più lunghe prima

function rimuoviGrado(testoCompleto) {
  for (const q of QUALIFICHE) {
    if (testoCompleto.startsWith(q)) {
      return testoCompleto.slice(q.length).trim();
    }
  }
  return testoCompleto.trim();
}

  // Somma le righe "Totale ore su Elicotteri" / "Totale ore su Aerei"/... (colonna TOT)
  function getOreVolate(doc = document) {
    const rows = Array.from(doc.querySelectorAll("tr"))
      .filter(tr => (tr.children[0]?.textContent || "").trim().startsWith("Totale ore su"));
    if (rows.length === 0) return "";
    const tot = rows.reduce((acc, tr) => acc + parseOreToMinuti((tr.children[3]?.textContent || "").trim()), 0);
    return minutiToOreStr(tot);
  }

  function getOreSimulatore(doc = document) {
    const h3 = Array.from(doc.querySelectorAll("h3"))
      .find(h => h.textContent.includes("simulatori"));
    if (!h3) return "0:00";

    let table = h3.nextElementSibling;
    while (table && table.tagName !== "TABLE") table = table.nextElementSibling;
    if (!table) return "0:00";

    let totMinuti = 0;
    table.querySelectorAll("tbody tr").forEach(row => {
      const cells = row.querySelectorAll("td");
      if (cells.length > 7) {
        const durata = cells[7].textContent.trim();
        if (durata.includes(":")) {
          const [h, m] = durata.split(":").map(x => parseInt(x) || 0);
          totMinuti += h * 60 + m;
        } else {
          totMinuti += parseInt(durata) || 0;
        }
      }
    });

    return `${Math.floor(totMinuti / 60)}:${String(totMinuti % 60).padStart(2, "0")}`;
  }

  // Ore notturne: riga "(di cui VFR Notturno)" nella tabella .noborder
  // La cella VFR (children[1]) contiene es. "(9:10)"
  function getOreNotturne(doc = document) {
    let tot = 0;
    doc.querySelectorAll("table.noborder tbody tr").forEach(row => {
      const label = (row.children[0]?.textContent || "").trim();
      if (!label.includes("Notturno")) return;
      const m = (row.children[1]?.textContent || "").trim().match(/\(?(\d+):(\d{2})\)?/);
      if (m) tot += parseInt(m[1]) * 60 + parseInt(m[2]);
    });
    return minutiToOreStr(tot);
  }

  // Righe dei voli reali: le tabelle .fontCustom possono essere piu' d'una (salto pagina)
  function getRigheVoli(doc = document) {
    return Array.from(doc.querySelectorAll("table.fontCustom tbody tr"));
  }

  // Minuti di volo per ogni "SCOPO DEL VOLO" (ultima colonna; DURATA e' la 5a dalla fine)
  function getOrePerScopo(doc = document) {
    const perScopo = {};
    getRigheVoli(doc).forEach(row => {
      const cells = row.querySelectorAll("td");
      if (cells.length < 6) return;
      const scopo = (cells[cells.length - 1].textContent || "").replace(/\s+/g, " ").trim().toUpperCase() || "N/D";
      const durata = parseInt((cells[cells.length - 5].textContent || "").replace(/[^\d]/g, ""), 10) || 0;
      perScopo[scopo] = (perScopo[scopo] || 0) + durata;
    });
    return perScopo;
  }

  function getDataUltimoVolo(doc = document) {
    let lastDate = null;
    getRigheVoli(doc).forEach(row => {
      const cell = row.querySelector('td');
      if (!cell) return;
      const m = cell.textContent.trim().match(/(\d{2})\/(\d{2})\/(\d{4})/);
      if (!m) return;
      const d = new Date(`${m[3]}-${m[2]}-${m[1]}`);
      if (!lastDate || d > lastDate) lastDate = d;
    });

    if (!lastDate) return '';
    return `${String(lastDate.getDate()).padStart(2,'0')}/${String(lastDate.getMonth()+1).padStart(2,'0')}/${lastDate.getFullYear()}`;
  }

  function getDataUltimoVoloNotturno(doc = document) {
    let lastDate = null;
    getRigheVoli(doc).forEach(row => {
      const cells = row.querySelectorAll("td");
      if (cells.length < 9) return;

      const dataTxt = (cells[0]?.textContent || "").trim();
      const voloNottTxt = (cells[cells.length - 4]?.textContent || "").trim();
      const m = dataTxt.match(/(\d{2})\/(\d{2})\/(\d{4})/);
      if (!m) return;

      const minutiNott = parseInt(voloNottTxt.replace(/[^\d]/g, ""), 10) || 0;
      if (minutiNott <= 0) return;

      const d = new Date(`${m[3]}-${m[2]}-${m[1]}`);
      if (!lastDate || d > lastDate) lastDate = d;
    });

    if (!lastDate) return "";
    return `${String(lastDate.getDate()).padStart(2,'0')}/${String(lastDate.getMonth()+1).padStart(2,'0')}/${lastDate.getFullYear()}`;
  }

  function parseOreToMinuti(oreStr) {
    if (!oreStr) return 0;
    const parts = oreStr.split(':');
    if (parts.length === 2) return (parseInt(parts[0]) || 0) * 60 + (parseInt(parts[1]) || 0);
    return 0;
  }

  function minutiToOreStr(minuti) {
    return `${Math.floor(minuti / 60)}:${String(minuti % 60).padStart(2, "0")}`;
  }

  const iframe = await waitForIFrame('iframe');

  iframe.addEventListener('load', () => {
    const doc = iframe.contentDocument || iframe.contentWindow.document;

    const testoCompleto = getNomeCompleto(doc);
    const cognomeNome   = rimuoviGrado(testoCompleto);
    const oreTotali     = getOreVolate(doc);
    const oreSimulatore = getOreSimulatore(doc);
    const oreNotturne   = getOreNotturne(doc);

    const totMin   = parseOreToMinuti(oreTotali);
    const simMin   = parseOreToMinuti(oreSimulatore);
    const oreReali = minutiToOreStr(totMin - simMin);

    const dataUltimoVolo         = getDataUltimoVolo(doc);
    const dataUltimoVoloNotturno = getDataUltimoVoloNotturno(doc);
    const orePerScopo            = getOrePerScopo(doc);

    const h2 = document.querySelector('#pagePreview h2');
    if (h2) h2.textContent = `- ${cognomeNome} (${oreTotali})`;

    chrome.runtime.sendMessage({
      type: 'statsComplete',
      data: {
        pilota: cognomeNome,
        oreReali,
        oreSimulatore,
        oreTotali,
        oreNotturne,
        dataUltimoVolo,
        dataUltimoVoloNotturno,
        orePerScopo
      }
    });
  });

})();
