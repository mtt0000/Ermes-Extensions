// Aggiornamento dell'estensione non pacchettizzata: scarica lo ZIP del repository e riscrive i file
// nella cartella da cui Chrome la carica (accesso concesso una volta con la File System Access API)
const CHIAVE_CARTELLA = "cartellaEstensione";
const btnAggiorna = document.getElementById("aggiorna");
const btnCartella = document.getElementById("scegliCartella");
let cartella = null;
let info = null;

function stato(testo, tipo) {
  const el = document.getElementById("stato");
  el.textContent = testo;
  el.className = tipo || "";
}

function bloccaPulsanti(bloccati) {
  btnAggiorna.disabled = bloccati;
  btnCartella.disabled = bloccati;
}

// Legge un archivio ZIP (senza librerie: la decompressione la fa il browser) e toglie la cartella
// principale "Ermes-Extensions-main/" che GitHub mette davanti a ogni file
async function leggiZip(buffer) {
  const dv = new DataView(buffer);
  let fine = -1;
  for (let i = buffer.byteLength - 22; i >= Math.max(0, buffer.byteLength - 22 - 65535); i--) {
    if (dv.getUint32(i, true) === 0x06054b50) { fine = i; break; }
  }
  if (fine < 0) throw new Error("archivio ZIP non valido");

  const file = new Map();
  const totale = dv.getUint16(fine + 10, true);
  let p = dv.getUint32(fine + 16, true);
  for (let n = 0; n < totale; n++) {
    if (dv.getUint32(p, true) !== 0x02014b50) throw new Error("archivio ZIP non valido");
    const metodo = dv.getUint16(p + 10, true);
    const dimensione = dv.getUint32(p + 20, true);
    const lungNome = dv.getUint16(p + 28, true);
    const offsetLocale = dv.getUint32(p + 42, true);
    const nome = new TextDecoder().decode(new Uint8Array(buffer, p + 46, lungNome));
    p += 46 + lungNome + dv.getUint16(p + 30, true) + dv.getUint16(p + 32, true);

    const percorso = nome.split("/").slice(1).join("/");
    if (!percorso || percorso.endsWith("/")) continue;
    const inizio = offsetLocale + 30 + dv.getUint16(offsetLocale + 26, true) + dv.getUint16(offsetLocale + 28, true);
    const compressi = new Uint8Array(buffer, inizio, dimensione);
    if (metodo === 0) {
      file.set(percorso, compressi.slice());
    } else if (metodo === 8) {
      const flusso = new Blob([compressi]).stream().pipeThrough(new DecompressionStream("deflate-raw"));
      file.set(percorso, new Uint8Array(await new Response(flusso).arrayBuffer()));
    } else {
      throw new Error(`compressione non supportata per ${percorso}`);
    }
  }
  return file;
}

const attendi = ms => new Promise(r => setTimeout(r, ms));

async function stessoContenuto(dir, nome, dati) {
  try {
    const attuale = new Uint8Array(await (await (await dir.getFileHandle(nome)).getFile()).arrayBuffer());
    return attuale.length === dati.length && attuale.every((b, i) => b === dati[i]);
  } catch (e) {
    return false;
  }
}

// Su Windows un file appena scritto puo' restare occupato per un attimo (antivirus, OneDrive, cartelle di rete):
// si riprova qualche volta e, dal secondo tentativo, si elimina il file prima di ricrearlo.
// Restituisce false se il file era gia' uguale e non e' stato toccato.
async function scriviFile(radice, percorso, dati) {
  const parti = percorso.split("/");
  if (parti.some(x => !x || x === "." || x === "..")) throw new Error(`percorso non valido: ${percorso}`);
  let dir = radice;
  for (const parte of parti.slice(0, -1)) dir = await dir.getDirectoryHandle(parte, { create: true });
  const nome = parti[parti.length - 1];
  if (await stessoContenuto(dir, nome, dati)) return false;

  const ATTESE = [0, 500, 1500, 3000];
  for (let tentativo = 0; ; tentativo++) {
    await attendi(ATTESE[tentativo]);
    try {
      if (tentativo > 0) await dir.removeEntry(nome).catch(() => {});
      const scrittura = await (await dir.getFileHandle(nome, { create: true })).createWritable();
      await scrittura.write(dati);
      await scrittura.close();
      return true;
    } catch (e) {
      if (tentativo === ATTESE.length - 1) throw new Error(`impossibile scrivere ${percorso} (${e.name}: ${e.message})`);
    }
  }
}

// La cartella giusta contiene il manifest di questa estensione, alla versione in uso (o piu' recente)
async function cartellaValida(dir) {
  try {
    const m = JSON.parse(await (await (await dir.getFileHandle("manifest.json")).getFile()).text());
    return m.name === chrome.runtime.getManifest().name && Aggiornamenti.confronta(m.version, Aggiornamenti.versioneAttuale()) >= 0;
  } catch (e) {
    return false;
  }
}

let aggiornamentoInCorso = false;

async function aggiorna(dir) {
  // un solo aggiornamento alla volta: due scritture sugli stessi file si ostacolano
  if (aggiornamentoInCorso) return;
  aggiornamentoInCorso = true;
  bloccaPulsanti(true);
  try {
    stato("⏳ Download della nuova versione da GitHub…");
    const res = await fetch(`${Aggiornamenti.URL_ZIP}?t=${Date.now()}`, { cache: "no-store" });
    if (!res.ok) throw new Error(`download non riuscito (${res.status})`);
    const file = await leggiZip(await res.arrayBuffer());
    const manifest = file.get("manifest.json");
    if (!manifest) throw new Error("manifest.json mancante nell'archivio");
    const nuova = JSON.parse(new TextDecoder().decode(manifest)).version;
    if (Aggiornamenti.confronta(nuova, Aggiornamenti.versioneAttuale()) <= 0) {
      stato(`✅ L'estensione è già aggiornata (versione ${Aggiornamenti.versioneAttuale()}).`, "ok");
      return;
    }

    // manifest.json per ultimo: se qualcosa va storto la cartella resta riconoscibile e si puo' riprovare
    const percorsi = [...file.keys()].filter(p => p !== "manifest.json").concat("manifest.json");
    let scritti = 0;
    for (const [i, percorso] of percorsi.entries()) {
      stato(`⏳ Scrittura dei file (${i + 1}/${percorsi.length}): ${percorso}`);
      if (await scriviFile(dir, percorso, file.get(percorso))) scritti++;
    }

    await chrome.storage.local.set({ aggiornamentoAtteso: nuova });
    stato(`✅ Versione ${nuova} installata (${scritti} file aggiornati): riavvio dell'estensione…`, "ok");
    setTimeout(() => chrome.runtime.reload(), 1200);
  } catch (e) {
    stato(`⚠️ Aggiornamento non riuscito: ${e.message}. Chiudi i file dell'estensione eventualmente aperti e riprova.`, "errore");
  } finally {
    aggiornamentoInCorso = false;
    bloccaPulsanti(false);
  }
}

btnAggiorna.addEventListener("click", async () => {
  if ((await cartella.requestPermission({ mode: "readwrite" })) !== "granted") {
    stato("⚠️ Serve il permesso di modifica della cartella per aggiornare.", "errore");
    return;
  }
  if (!(await cartellaValida(cartella))) {
    stato("⚠️ La cartella salvata non contiene più l'estensione: sceglila di nuovo.", "errore");
    return;
  }
  aggiorna(cartella);
});

btnCartella.addEventListener("click", async () => {
  let dir;
  try {
    dir = await window.showDirectoryPicker({ id: "ermes-estensione", mode: "readwrite" });
  } catch (e) {
    return; // finestra chiusa senza scegliere
  }
  if (!(await cartellaValida(dir))) {
    stato("⚠️ Questa non è la cartella dell'estensione: scegli quella che contiene manifest.json (es. ufficio ops\\Ermes-Extensions-main).", "errore");
    return;
  }
  cartella = dir;
  await Archivio.scrivi(CHIAVE_CARTELLA, dir);
  btnAggiorna.hidden = false;
  btnCartella.textContent = "📂 Cambia cartella";
  aggiorna(dir);
});

(async function avvio() {
  document.getElementById("vAttuale").textContent = Aggiornamenti.versioneAttuale();
  try {
    info = await Aggiornamenti.controlla();
    document.getElementById("vDisponibile").textContent = info.disponibile;
  } catch (e) {
    document.getElementById("vDisponibile").textContent = "?";
    stato(`⚠️ Impossibile contattare GitHub: ${e.message}`, "errore");
    return;
  }

  cartella = await Archivio.leggi(CHIAVE_CARTELLA);
  if (cartella) {
    btnAggiorna.hidden = false;
    btnCartella.textContent = "📂 Cambia cartella";
  }
  if (!info.nuova) {
    stato(`✅ Hai già l'ultima versione (${info.attuale}).`, "ok");
    return;
  }
  // cartella gia' autorizzata: si parte senza clic
  if (cartella && (await cartella.queryPermission({ mode: "readwrite" })) === "granted" && (await cartellaValida(cartella))) {
    aggiorna(cartella);
  } else {
    stato(cartella ? "Clicca «Aggiorna ora» e consenti la modifica della cartella." : "Clicca «Scegli cartella e aggiorna» e seleziona la cartella dell'estensione.");
  }
})();
