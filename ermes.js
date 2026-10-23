// Controllo della sessione su Ermes e accesso con le credenziali salvate
const ERMES_URL = "http://ermes.cen.poliziadistato.it";

const Ermes = (() => {
  // Ermes senza sessione rimanda a /login, che contiene il modulo #form-login
  function paginaLogin(url, html) {
    return new URL(url).pathname.startsWith("/login") || html.includes('id="form-login"');
  }

  // "connesso", "non-connesso" oppure "irraggiungibile"
  async function statoLogin() {
    try {
      const res = await fetch(`${ERMES_URL}/admin`, { credentials: "include", cache: "no-store" });
      if (res.status >= 500) return "irraggiungibile";
      return paginaLogin(res.url, await res.text()) ? "non-connesso" : "connesso";
    } catch (e) {
      return "irraggiungibile";
    }
  }

  // Invia il modulo di login come farebbe la pagina.
  // Esito: "connesso", "2fa" (serve il codice), "errato", "non-connesso" o "irraggiungibile"
  async function accedi({ username, password }) {
    try {
      await fetch(`${ERMES_URL}/login`, { credentials: "include", cache: "no-store" });
      const res = await fetch(`${ERMES_URL}/login`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ username, password })
      });
      const html = await res.text();
      if (!paginaLogin(res.url, html)) return "connesso";
      if (/<input[^>]+name="(twofa_code|backup_code)"/.test(html)) return "2fa";
      if (html.includes('class="notification undone')) return "errato";
      return "non-connesso";
    } catch (e) {
      return "irraggiungibile";
    }
  }

  return { statoLogin, accedi };
})();
