// ===== PILOTI =====
const piloti = [
{ id: "1028", tipo: "piop" },
{ id: "10", tipo: "piop" },
{ id: "22", tipo: "piop" },
{ id: "1072", tipo: "piop" },
{ id: "522", tipo: "piop" },
{ id: "33", tipo: "piop" },
{ id: "1086", tipo: "piab" },
{ id: "1157", tipo: "piab" },
{ id: "1137", tipo: "piab" },
{ id: "1099", tipo: "piab" },
{ id: "1184", tipo: "piab" }
];

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

// ===== APERTURA LINK =====
function apriLink(id) {
const da = formatDMY(document.getElementById("date_from").value);
const a = formatDMY(document.getElementById("date_to").value);
const aeromobileVal = document.getElementById("aeromobile").value;
const aeromobilePart = aeromobileVal === "" ? "" : `aeromobile=${aeromobileVal},`;
const url = BASE_URL
.replace("DATEFROM", da)
.replace("DATETO", a)
.replace("AEROMOBILE_PLACEHOLDER", aeromobilePart)
.replace("PILOTA", id);

const showSummary = document.getElementById("showSummary").checked;
const keepOpen = document.getElementById("keepOpen").checked;

// Testo leggibile dei filtri, da mostrare nel riepilogo finale
const aeromobileLabel = document.getElementById("aeromobile").selectedOptions[0].textContent;
const pilotaLabel = document.getElementById("pilota").selectedOptions[0].textContent;
const filtri = {
dal: da,
al: a,
aeromobile: aeromobileLabel,
pilotaSelezione: pilotaLabel
};

chrome.runtime.sendMessage({
type: "openPilot",
url,
pilotaId: id,
showSummary,
keepOpen,
filtri
});
}

// ===== EVENTI CLICK =====
document.getElementById("go").addEventListener("click", () => {
const sel = document.getElementById("pilota").value;
if (sel === "TUTTI") {
piloti.forEach(p => apriLink(p.id));
} else if (sel === "TUTTI_PIOP") {
piloti.filter(p => p.tipo === "piop").forEach(p => apriLink(p.id));
} else if (sel === "TUTTI_PIAB") {
piloti.filter(p => p.tipo === "piab").forEach(p => apriLink(p.id));
} else {
apriLink(sel);
}
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
chrome.storage.sync.get({ showSummary: true, keepOpen: false }, (data) => {
document.getElementById("showSummary").checked = data.showSummary;
document.getElementById("keepOpen").checked = data.keepOpen;
});

document.getElementById("showSummary").addEventListener("change", (e) => {
chrome.storage.sync.set({ showSummary: e.target.checked });
});

document.getElementById("keepOpen").addEventListener("change", (e) => {
chrome.storage.sync.set({ keepOpen: e.target.checked });
});
