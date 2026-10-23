// Piccolo archivio IndexedDB dell'estensione: chiave di cifratura delle credenziali e cartella per gli aggiornamenti
const Archivio = (() => {
  let dbPromise = null;

  function apri() {
    if (!dbPromise) {
      dbPromise = new Promise((resolve, reject) => {
        const req = indexedDB.open("ermes-estensione", 1);
        req.onupgradeneeded = () => req.result.createObjectStore("valori");
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      });
    }
    return dbPromise;
  }

  async function operazione(modo, fn) {
    const db = await apri();
    return new Promise((resolve, reject) => {
      const tx = db.transaction("valori", modo);
      const req = fn(tx.objectStore("valori"));
      tx.oncomplete = () => resolve(req.result);
      tx.onerror = () => reject(tx.error);
    });
  }

  return {
    leggi: chiave => operazione("readonly", s => s.get(chiave)),
    scrivi: (chiave, valore) => operazione("readwrite", s => s.put(valore, chiave)),
    elimina: chiave => operazione("readwrite", s => s.delete(chiave))
  };
})();
