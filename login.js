// Accesso automatico: sulla pagina di login di Ermes compila e invia il modulo con le credenziali salvate nell'estensione
(function () {
  const form = document.getElementById("form-login");
  const username = document.getElementById("login-username");
  const password = document.getElementById("login-password");
  if (!form || !username || !password || username.readOnly) return;

  // passaggio del codice 2FA: lo inserisce l'utente
  if (document.querySelector('input[name="twofa_code"], input[name="backup_code"]')) return;
  // appena usciti da Ermes non si rientra da soli
  if (/logout/i.test(document.referrer)) return;

  // se il tentativo precedente e' tornato al login le credenziali sono probabilmente errate: non si riprova
  const CHIAVE = "ermesEstensioneLoginTentato";
  const tentato = Number(sessionStorage.getItem(CHIAVE) || 0);
  sessionStorage.removeItem(CHIAVE);
  if (Date.now() - tentato < 60000) {
    chrome.runtime.sendMessage({ type: "loginAutomaticoFallito" });
    return;
  }

  chrome.runtime.sendMessage({ type: "credenzialiLogin" }, cred => {
    if (chrome.runtime.lastError || !cred) return;

    // qualche secondo per annullare, ad esempio per entrare con un altro utente
    const avviso = document.createElement("div");
    avviso.style.cssText = "position:fixed;top:16px;left:50%;transform:translateX(-50%);z-index:9999;background:#0b1f4d;color:#fff;padding:10px 16px;border-radius:10px;font:14px 'Inter',system-ui,sans-serif;box-shadow:0 8px 24px rgba(0,0,0,.4)";
    avviso.textContent = `🔐 Accesso automatico come ${cred.username}… `;
    const annulla = document.createElement("a");
    annulla.href = "#";
    annulla.textContent = "Annulla";
    annulla.style.cssText = "color:#93c5fd;font-weight:600;margin-left:6px";
    avviso.appendChild(annulla);
    document.body.appendChild(avviso);

    const timer = setTimeout(() => {
      avviso.remove();
      username.value = cred.username;
      password.value = cred.password;
      [username, password].forEach(i => i.dispatchEvent(new Event("input", { bubbles: true })));
      sessionStorage.setItem(CHIAVE, String(Date.now()));
      const pulsante = document.getElementById("btn-login");
      if (pulsante) pulsante.click();
      else form.requestSubmit();
    }, 1500);

    annulla.addEventListener("click", e => {
      e.preventDefault();
      clearTimeout(timer);
      avviso.remove();
    });
  });
})();
