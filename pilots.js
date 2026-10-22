// ===== ELENCO PILOTI =====
// specialita: "elicottero" | "aereo"
// id: ID interno Ermes (parametro "pilota" dello Stralcio Completo); null = da impostare dal popup
// tipo: gruppo storico PIOP/PIAB (solo per i piloti gia' classificati)
const PILOTI = [
{ n: 1,  qualifica: "P.D.",       nome: "ROVERATO Bruno",       specialita: "elicottero", matricola: "18761",  id: null },
{ n: 2,  qualifica: "V.Q.A.",     nome: "COLASANTI Matteo",     specialita: "elicottero", matricola: "20681",  id: "1028", tipo: "piop" },
{ n: 3,  qualifica: "COMM.C.",    nome: "MARTELLUCCI Giovanni", specialita: "elicottero", matricola: "309369", id: null },
{ n: 4,  qualifica: "COMM.C.",    nome: "SCHIETROMA Enrico",    specialita: "aereo",      matricola: "28581",  id: null },
{ n: 5,  qualifica: "SOST.COMM.", nome: "SOLLEVANTI Marco",     specialita: "elicottero", matricola: "233678", id: "22",   tipo: "piop" },
{ n: 6,  qualifica: "ISP.",       nome: "BONO Antonio",         specialita: "elicottero", matricola: "321812", id: "1072", tipo: "piop" },
{ n: 7,  qualifica: "ISP.",       nome: "BORZI Andrea",         specialita: "aereo",      matricola: "282537", id: null },
{ n: 8,  qualifica: "ISP.",       nome: "FILICE Damiano",       specialita: "aereo",      matricola: "322188", id: null },
{ n: 9,  qualifica: "ISP.",       nome: "FOCACCIA Fabio",       specialita: "elicottero", matricola: "324706", id: "1086", tipo: "piab" },
{ n: 10, qualifica: "ISP.",       nome: "GIARDINI Simone",      specialita: "elicottero", matricola: "319975", id: "1157", tipo: "piab" },
{ n: 11, qualifica: "ISP.",       nome: "LEONETTI Salvatore",   specialita: "aereo",      matricola: "320181", id: null },
{ n: 12, qualifica: "ISP.",       nome: "NICASTRO Giuseppe",    specialita: "aereo",      matricola: "321510", id: null },
{ n: 13, qualifica: "ISP.",       nome: "PECORARE Maurizio",    specialita: "aereo",      matricola: "282046", id: null },
{ n: 14, qualifica: "ISP.",       nome: "SERAFINI Daniele",     specialita: "aereo",      matricola: "319562", id: null },
{ n: 15, qualifica: "ISP.",       nome: "VERNI Gianfranco",     specialita: "aereo",      matricola: "299194", id: null },
{ n: 16, qualifica: "V.ISP.",     nome: "CASCONE Rosario",      specialita: "aereo",      matricola: "323935", id: null },
{ n: 17, qualifica: "V.ISP.",     nome: "PROCOPIO Mattia",      specialita: "elicottero", matricola: "325708", id: "1137", tipo: "piab" },
{ n: 18, qualifica: "V.ISP.",     nome: "TROZZI Marco",         specialita: "elicottero", matricola: "271323", id: "522",  tipo: "piop" },
{ n: 19, qualifica: "SOV.",       nome: "CASINI Giulio",        specialita: "elicottero", matricola: "289011", id: "33",   tipo: "piop" },
{ n: 20, qualifica: "SOV.",       nome: "CATALANO Ettore",      specialita: "aereo",      matricola: "289701", id: null },
{ n: 21, qualifica: "ASS.C.",     nome: "MANCINI Armando",      specialita: "aereo",      matricola: "317078", id: null },
{ n: 22, qualifica: "ASS.",       nome: "MARINO Giuseppe",      specialita: "aereo",      matricola: "323759", id: null },
{ n: 23, qualifica: "ASS.",       nome: "MIRISOLA Claudio",     specialita: "aereo",      matricola: "319148", id: null },
{ n: 24, qualifica: "AG.S.",      nome: "CONTADIN Martina",     specialita: "aereo",      matricola: "327156", id: null },
{ n: 25, qualifica: "AG.S.",      nome: "COPPARONI Federico",   specialita: "aereo",      matricola: "326967", id: null },
{ n: 26, qualifica: "AG.S.",      nome: "MARZIALI Lorenzo",     specialita: "elicottero", matricola: "241116", id: "1184", tipo: "piab" },
{ n: 27, qualifica: "AG.",        nome: "PRESTIERI Gianluca",   specialita: "aereo",      matricola: "300626", id: null }
];
