// Credenziali di Ermes cifrate con AES-GCM a 256 bit.
// La chiave e' generata dall'estensione come non esportabile e resta nell'IndexedDB dell'estensione;
// in chrome.storage.local (mai in sync, quindi non lascia il computer) c'e' solo il testo cifrato.
const Credenziali = (() => {
  const CHIAVE_DB = "chiaveCredenziali";

  const inBase64 = buf => btoa(String.fromCharCode(...new Uint8Array(buf)));
  const daBase64 = s => Uint8Array.from(atob(s), c => c.charCodeAt(0));

  async function chiave(crea) {
    let k = await Archivio.leggi(CHIAVE_DB);
    if (!k && crea) {
      k = await crypto.subtle.generateKey({ name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"]);
      await Archivio.scrivi(CHIAVE_DB, k);
    }
    return k;
  }

  async function salva(username, password) {
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const chiaro = new TextEncoder().encode(JSON.stringify({ username, password }));
    const cifrato = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, await chiave(true), chiaro);
    await chrome.storage.local.set({ credenzialiErmes: { iv: inBase64(iv), dati: inBase64(cifrato) }, loginFallito: false });
  }

  // { username, password } oppure null se non ci sono o non si possono decifrare
  async function leggi() {
    const { credenzialiErmes } = await chrome.storage.local.get("credenzialiErmes");
    if (!credenzialiErmes) return null;
    const k = await chiave(false);
    if (!k) return null;
    try {
      const chiaro = await crypto.subtle.decrypt({ name: "AES-GCM", iv: daBase64(credenzialiErmes.iv) }, k, daBase64(credenzialiErmes.dati));
      return JSON.parse(new TextDecoder().decode(chiaro));
    } catch (e) {
      return null;
    }
  }

  async function elimina() {
    await chrome.storage.local.remove(["credenzialiErmes", "loginFallito"]);
  }

  return { salva, leggi, elimina };
})();
