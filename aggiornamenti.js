// Controllo delle nuove versioni pubblicate sul repository GitHub dell'estensione
const Aggiornamenti = (() => {
  const REPO = "mtt0000/Ermes-Extensions";
  const RAMO = "main";
  const URL_MANIFEST = `https://raw.githubusercontent.com/${REPO}/${RAMO}/manifest.json`;
  const URL_ZIP = `https://codeload.github.com/${REPO}/zip/refs/heads/${RAMO}`;

  // > 0 se a e' piu' recente di b ("3.10" > "3.9")
  function confronta(a, b) {
    const pa = String(a).split(".").map(n => parseInt(n, 10) || 0);
    const pb = String(b).split(".").map(n => parseInt(n, 10) || 0);
    for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
      const d = (pa[i] || 0) - (pb[i] || 0);
      if (d) return d;
    }
    return 0;
  }

  const versioneAttuale = () => chrome.runtime.getManifest().version;

  // Legge la versione pubblicata, aggiorna il badge dell'icona e restituisce { attuale, disponibile, nuova }
  async function controlla() {
    const res = await fetch(`${URL_MANIFEST}?t=${Date.now()}`, { cache: "no-store" });
    if (!res.ok) throw new Error(`GitHub ha risposto ${res.status}`);
    const disponibile = (await res.json()).version;
    const info = { attuale: versioneAttuale(), disponibile, nuova: confronta(disponibile, versioneAttuale()) > 0 };
    await chrome.storage.local.set({ ultimoControllo: { ...info, il: Date.now() } });
    chrome.action.setBadgeBackgroundColor({ color: "#d32f2f" });
    chrome.action.setBadgeText({ text: info.nuova ? "NEW" : "" });
    return info;
  }

  return { URL_ZIP, confronta, versioneAttuale, controlla };
})();
