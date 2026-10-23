// ===== PILOTI =====
// PILOTI e' definito in pilots.js; gli ID Ermes impostati dal popup sono salvati in storage
let idPersonalizzati = {};

function idPilota(p) {
return (idPersonalizzati[p.matricola] || p.id || "").trim();
}

function specialitaSelezionata() {
return document.querySelector('input[name="specialita"]:checked').value;
}

function pilotiFiltrati() {
const spec = specialitaSelezionata();
return PILOTI.filter(p => spec === "tutti" || p.specialita === spec);
}

function etichettaSpecialita(spec) {
return spec === "elicottero" ? "Elicottero" : spec === "aereo" ? "Aereo" : "Tutti";
}

function popolaSelectPiloti() {
const select = document.getElementById("pilota");
const precedente = select.value;
const spec = specialitaSelezionata();
const lista = pilotiFiltrati();
select.innerHTML = "";

const add = (value, text, disabled) => {
const opt = document.createElement("option");
opt.value = value;
opt.textContent = text;
opt.disabled = !!disabled;
select.appendChild(opt);
};

add("TUTTI", `🌍 TUTTI (${etichettaSpecialita(spec)})`);
if (spec !== "aereo") {
add("TUTTI_PIOP", "👥 TUTTI PIOP");
add("TUTTI_PIAB", "👥 TUTTI PIAB");
}
lista.forEach(p => {
const id = idPilota(p);
const icona = p.specialita === "aereo" ? "✈️" : "🚁";
add(p.matricola, `${icona} ${p.qualifica} ${p.nome}${id ? "" : " (ID mancante)"}`, !id);
});

if (Array.from(select.options).some(o => o.value === precedente && !o.disabled)) {
select.value = precedente;
}
}

function popolaListaId() {
const box = document.getElementById("idList");
box.innerHTML = "";
PILOTI.forEach(p => {
const row = document.createElement("div");
row.className = "id-row" + (idPilota(p) ? "" : " missing");
const span = document.createElement("span");
span.textContent = `${p.nome} (${p.matricola})`;
const input = document.createElement("input");
input.type = "text";
input.placeholder = "ID";
input.value = idPilota(p);
input.addEventListener("change", () => {
const v = input.value.trim();
if (v && v !== p.id) idPersonalizzati[p.matricola] = v;
else delete idPersonalizzati[p.matricola];
chrome.storage.sync.set({ idPersonalizzati });
row.className = "id-row" + (idPilota(p) ? "" : " missing");
popolaSelectPiloti();
});
row.appendChild(span);
row.appendChild(input);
box.appendChild(row);
});
}

const BASE_URL = "http://ermes.cen.poliziadistato.it/admin/piloti/anteprima?titolo=Stralcio%20Completo&link=/admin/report/stralcio-completo&filters=date_from=DATEFROM,date_to=DATETO,AEROMOBILE_PLACEHOLDERpilota=PILOTA,id_firmatario_custom=,id_dirigente_custom=2,type=tutto,reparto_intestazione=23,qualifica_custom=null1,type=tutto,tipologia_attivita=1";

// ===== UTILITIES =====
function formatDateLocal(d) {
const y = d.getFullYear();
const m = String(d.getMonth() + 1).padStart(2, "0");
const day = String(d.getDate()).padStart(2, "0");
return `${y}-${m}-${day}`;
}

function formatDMY(iso) {
const d = new Date(iso);
return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
}

// ===== MESSAGGI =====
function mostraMessaggio(testo, tipo) {
const el = document.getElementById("messaggio");
el.textContent = testo;
el.className = "messaggio" + (tipo ? " " + tipo : "");
el.hidden = !testo;
}

// ===== APERTURA LINK =====
function creaRichiesta(pilota) {
const id = idPilota(pilota);
const da = formatDMY(document.getElementById("date_from").value);
const a = formatDMY(document.getElementById("date_to").value);
const aeromobileVal = document.getElementById("aeromobile").value;
const aeromobilePart = aeromobileVal === "" ? "" : `aeromobile=${aeromobileVal},`;
const url = BASE_URL
.replace("DATEFROM", da)
.replace("DATETO", a)
.replace("AEROMOBILE_PLACEHOLDER", aeromobilePart)
.replace("PILOTA", id);

return {
url,
pilotaId: id,
pilotaInfo: { nome: pilota.nome, qualifica: pilota.qualifica, matricola: pilota.matricola, specialita: pilota.specialita },
showSummary: document.getElementById("showSummary").checked,
keepOpen: document.getElementById("keepOpen").checked
};
}

// Testo leggibile dei filtri, da mostrare nel riepilogo finale
function filtriCorrenti() {
return {
dal: formatDMY(document.getElementById("date_from").value),
al: formatDMY(document.getElementById("date_to").value),
aeromobile: document.getElementById("aeromobile").selectedOptions[0].textContent,
pilotaSelezione: document.getElementById("pilota").selectedOptions[0].textContent,
specialita: etichettaSpecialita(specialitaSelezionata())
};
}

// Il background verifica l'accesso a Ermes prima di aprire le schede
function apriReport(lista) {
mostraMessaggio("⏳ Verifica dell'accesso a Ermes…");
chrome.runtime.sendMessage({ type: "apriReport", items: lista.map(creaRichiesta), filtri: filtriCorrenti() }, risposta => {
if (chrome.runtime.lastError || !risposta) {
mostraMessaggio("⚠️ Errore interno dell'estensione: riprova.", "errore");
} else if (!risposta.ok) {
mostraMessaggio(`⚠️ ${risposta.errore}`, "errore");
} else if (risposta.inAttesaLogin) {
mostraMessaggio("🔐 Accedi a Ermes nella scheda aperta: i report partiranno subito dopo.");
} else {
mostraMessaggio("");
}
});
}

// ===== EVENTI CLICK =====
function apriGruppo(lista) {
const conId = lista.filter(p => idPilota(p));
const senzaId = lista.length - conId.length;
if (conId.length === 0) {
alert("Nessun pilota con ID Ermes impostato per questa selezione.");
return;
}
if (senzaId > 0 && !confirm(`${senzaId} piloti senza ID Ermes verranno saltati. Continuare con ${conId.length}?`)) return;
apriReport(conId);
}

document.getElementById("go").addEventListener("click", () => {
const sel = document.getElementById("pilota").value;
if (sel === "TUTTI") {
apriGruppo(pilotiFiltrati());
} else if (sel === "TUTTI_PIOP") {
apriGruppo(pilotiFiltrati().filter(p => p.tipo === "piop"));
} else if (sel === "TUTTI_PIAB") {
apriGruppo(pilotiFiltrati().filter(p => p.tipo === "piab"));
} else {
const p = PILOTI.find(x => x.matricola === sel);
if (p && idPilota(p)) apriReport([p]);
}
});

document.querySelectorAll('input[name="specialita"]').forEach(r => {
r.addEventListener("change", () => {
const spec = specialitaSelezionata();
// L'AW139 e' solo elicottero: per gli aerei si passa a "Tutti" gli aeromobili
const aeromobile = document.getElementById("aeromobile");
if (spec === "aereo" && aeromobile.value === "7") aeromobile.value = "";
if (spec === "elicottero" && aeromobile.value === "") aeromobile.value = "7";
chrome.storage.sync.set({ specialita: spec });
popolaSelectPiloti();
});
});

// ===== PERIODI PRESET =====
document.getElementById("mese").addEventListener("click", () => {
const now = new Date();
document.getElementById("date_from").value = formatDateLocal(new Date(now.getFullYear(), now.getMonth(), 1));
document.getElementById("date_to").value = formatDateLocal(new Date(now.getFullYear(), now.getMonth() + 1, 0));
});

document.getElementById("anno").addEventListener("click", () => {
const y = new Date().getFullYear();
document.getElementById("date_from").value = `${y}-01-01`;
document.getElementById("date_to").value = `${y}-12-31`;
});

document.getElementById("ultimi30").addEventListener("click", () => {
const now = new Date();
const past = new Date(now);
past.setDate(now.getDate() - 30);
document.getElementById("date_from").value = formatDateLocal(past);
document.getElementById("date_to").value = formatDateLocal(now);
});

document.getElementById("ultimi180").addEventListener("click", () => {
const now = new Date();
const past = new Date(now);
past.setDate(now.getDate() - 180);
document.getElementById("date_from").value = formatDateLocal(past);
document.getElementById("date_to").value = formatDateLocal(now);
});

document.getElementById("ultimi365").addEventListener("click", () => {
const now = new Date();
const past = new Date(now);
past.setDate(now.getDate() - 365);
document.getElementById("date_from").value = formatDateLocal(past);
document.getElementById("date_to").value = formatDateLocal(now);
});

document.getElementById("tutto").addEventListener("click", () => {
document.getElementById("date_from").value = "1950-01-01";
document.getElementById("date_to").value = "2100-12-31";
});

// ===== GESTIONE CHECKBOX CON STORAGE =====
chrome.storage.sync.get({ showSummary: true, keepOpen: false, partiPrimeEnabled: true, specialita: "tutti", idPersonalizzati: {} }, (data) => {
document.getElementById("showSummary").checked = data.showSummary;
document.getElementById("keepOpen").checked = data.keepOpen;
document.getElementById("partiPrimeEnabled").checked = data.partiPrimeEnabled;
idPersonalizzati = data.idPersonalizzati || {};
const radio = document.querySelector(`input[name="specialita"][value="${data.specialita}"]`);
if (radio) radio.checked = true;
if (data.specialita === "aereo") document.getElementById("aeromobile").value = "";
popolaSelectPiloti();
popolaListaId();
});

document.getElementById("partiPrimeEnabled").addEventListener("change", (e) => {
chrome.storage.sync.set({ partiPrimeEnabled: e.target.checked });
});

document.getElementById("showSummary").addEventListener("change", (e) => {
chrome.storage.sync.set({ showSummary: e.target.checked });
});

document.getElementById("keepOpen").addEventListener("change", (e) => {
chrome.storage.sync.set({ keepOpen: e.target.checked });
});

// ===== STATO DELL'ACCESSO =====
async function mostraStatoLogin() {
const el = document.getElementById("statoLogin");
const stato = await Ermes.statoLogin();
const testi = {
connesso: "🟢 Connesso a Ermes",
"non-connesso": "🔴 Accesso a Ermes non effettuato",
irraggiungibile: "⚠️ Ermes non raggiungibile"
};
el.textContent = testi[stato];
el.className = "stato " + stato;
if (stato === "non-connesso") {
const link = document.createElement("a");
link.href = "#";
link.textContent = "Accedi";
link.addEventListener("click", e => {
e.preventDefault();
chrome.tabs.create({ url: `${ERMES_URL}/admin` });
});
el.appendChild(link);
}
}

// ===== AGGIORNAMENTI =====
async function mostraAggiornamenti() {
const attuale = Aggiornamenti.versioneAttuale();
document.getElementById("versione").textContent = `v${attuale}`;

// esito dell'ultimo aggiornamento automatico
const { aggiornamentoAtteso } = await chrome.storage.local.get("aggiornamentoAtteso");
if (aggiornamentoAtteso) {
await chrome.storage.local.remove("aggiornamentoAtteso");
if (Aggiornamenti.confronta(attuale, aggiornamentoAtteso) >= 0) {
mostraMessaggio(`✅ Estensione aggiornata alla versione ${attuale}`, "ok");
} else {
// i file sono stati scritti in una cartella diversa da quella caricata da Chrome
await Archivio.elimina("cartellaEstensione");
mostraMessaggio("⚠️ L'aggiornamento non è stato applicato: la cartella scelta non è quella da cui Chrome carica l'estensione. Riprova scegliendo la cartella giusta.", "errore");
}
}

try {
const info = await Aggiornamenti.controlla();
if (info.nuova) {
document.getElementById("testoAggiornamento").textContent = `🆕 Disponibile la versione ${info.disponibile} (installata ${info.attuale})`;
document.getElementById("avvisoAggiornamento").hidden = false;
}
} catch (e) {
// GitHub non raggiungibile: nessun avviso
}
}

document.getElementById("apriAggiornamento").addEventListener("click", () => {
chrome.tabs.create({ url: chrome.runtime.getURL("update.html") });
});

// ===== CREDENZIALI =====
async function caricaCredenziali() {
const cred = await Credenziali.leggi();
const { loginAutomatico = true, loginFallito = false } = await chrome.storage.local.get(["loginAutomatico", "loginFallito"]);
document.getElementById("credUsername").value = cred ? cred.username : "";
document.getElementById("credPassword").value = "";
document.getElementById("credPassword").placeholder = cred ? "•••••••• (salvata)" : "Password";
document.getElementById("loginAutomatico").checked = loginAutomatico;
document.getElementById("statoCredenziali").textContent = !cred
? "Nessuna credenziale salvata. Username e password vengono cifrati (AES-256) e restano solo su questo computer."
: loginFallito
? "⚠️ L'ultimo accesso automatico non è riuscito: controlla username e password e salvali di nuovo."
: "🔒 Credenziali salvate e cifrate (AES-256) solo su questo computer.";
}

document.getElementById("salvaCredenziali").addEventListener("click", async () => {
const username = document.getElementById("credUsername").value.trim();
let password = document.getElementById("credPassword").value;
if (!password) {
// password lasciata vuota: si tiene quella gia' salvata
const salvate = await Credenziali.leggi();
password = salvate ? salvate.password : "";
}
if (!username || !password) {
document.getElementById("statoCredenziali").textContent = "⚠️ Inserisci username e password.";
return;
}
await Credenziali.salva(username, password);
await caricaCredenziali();
});

document.getElementById("eliminaCredenziali").addEventListener("click", async () => {
await Credenziali.elimina();
await caricaCredenziali();
});

document.getElementById("loginAutomatico").addEventListener("change", e => {
chrome.storage.local.set({ loginAutomatico: e.target.checked });
});

mostraAggiornamenti();
mostraStatoLogin();
caricaCredenziali();
