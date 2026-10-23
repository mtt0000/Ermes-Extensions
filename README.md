# Ermes-Extension

Estensione Chrome (MV3) per Ermes che unisce:

- **Stralcio Completo** (popup): apre lo stralcio per uno o più piloti e genera una tabella riepilogativa con ore reali, simulatore, totali, notturne, data ultimo volo e **una colonna per ogni SCOPO DEL VOLO** trovato nelle schede. I filtri **Elicottero / Aereo / Tutti** limitano l'elenco dei piloti.
- **Modulo Parti Prime** (ex `Ermes-Extension-PartiPrime`): pulsanti di apertura rapida, nomi scansione, separatori per data e allegato automatico dei PDF. Si attiva o disattiva dall'interruttore "Modulo Parti Prime" in fondo al popup.

File principali: `popup.html`/`popup.js` (interfaccia), `pilots.js` (elenco piloti), `stralcio.js` (lettura dello stralcio), `background.js` (riepilogo), `parteprima.js` (modulo Parti Prime).

Gli ID Ermes dei piloti sono in `pilots.js` e si possono modificare dalla sezione "⚙️ ID Ermes piloti" del popup.

## Aggiornamenti automatici

All'apertura del popup (e ogni 6 ore, con il badge **NEW** sull'icona) l'estensione confronta la propria versione con quella del `manifest.json` sul ramo `main` di GitHub. Se ce n'è una nuova compare l'avviso **🆕 Aggiorna ora**: si apre la pagina di aggiornamento, che scarica lo ZIP del repository, riscrive i file nella cartella dell'estensione e la riavvia.

La prima volta bisogna indicare la cartella da cui Chrome carica l'estensione (es. `ufficio ops\Ermes-Extensions-main`) e consentirne la modifica; dalle volte successive basta un clic (o nessuno, se Chrome ricorda il permesso).

**Per pubblicare una nuova versione** basta aumentare `version` in `manifest.json` (es. `3.1` → `3.2`) e portare le modifiche su `main`.

## Accesso a Ermes

- Prima di aprire i report il popup verifica che la sessione su Ermes sia attiva. Se non lo è prova l'accesso con le credenziali salvate; altrimenti apre Ermes e i report partono da soli appena fatto il login (anche con il codice 2FA).
- In **🔐 Accesso automatico a Ermes** si salvano username e password: sono cifrati con AES-GCM 256 con una chiave non esportabile generata dall'estensione e restano solo su quel computer (`chrome.storage.local`, mai sincronizzati). Con l'opzione attiva, la pagina di login di Ermes viene compilata e inviata da sola (con 1,5 s per annullare).
- Se l'accesso automatico fallisce non viene ripetuto finché le credenziali non vengono salvate di nuovo, per non bloccare l'utenza.
