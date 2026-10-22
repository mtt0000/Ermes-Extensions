# Ermes-Extension

Estensione Chrome (MV3) per Ermes che unisce:

- **Stralcio Completo** (popup): apre lo stralcio per uno o più piloti e genera una tabella riepilogativa con ore reali, simulatore, totali, notturne, data ultimo volo e **una colonna per ogni SCOPO DEL VOLO** trovato nelle schede. I filtri **Elicottero / Aereo / Tutti** limitano l'elenco dei piloti.
- **Modulo Parti Prime** (ex `Ermes-Extension-PartiPrime`): pulsanti di apertura rapida, nomi scansione, separatori per data e allegato automatico dei PDF. Si attiva o disattiva dall'interruttore "Modulo Parti Prime" in fondo al popup.

File principali: `popup.html`/`popup.js` (interfaccia), `pilots.js` (elenco piloti), `stralcio.js` (lettura dello stralcio), `background.js` (riepilogo), `parteprima.js` (modulo Parti Prime).

Gli ID Ermes dei piloti nuovi vanno impostati nella sezione "⚙️ ID Ermes piloti" del popup (oppure in `pilots.js`).
