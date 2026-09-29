// Baut die neue Göggingen-Keytable (.MWF) aus
//   - keytable/goeggingen/goeggingen_original.mwx  (Ausgangsbelegung G)
//   - keytable/goeggingen/aenderungen.md           (neue Belegungen, Spalte „Tastatur“)
//   - plaene/mci-84-oliver.json                    (Kappenbeschriftung und Farbe)
//   - keytable/leitershofen/kasse1/XBB_Siebenfrisch_03.09.MWF   (Kopf, Ebenen, Attribute als Vorlage)
// Aufruf: node tools/build-mwf.js [ausgabe.MWF]
const fs = require('fs'), path = require('path');
const { decode } = require('./mwxdecode');
const R = path.join(__dirname, '..');
const OUT = process.argv[2] || path.join(R, 'keytable/goeggingen/goeggingen_neu.MWF');

// --- Zeichensätze: Beschriftungen cp1252, Belegungen cp850 -------------------
const CP850 = { 'ä':0x84,'ö':0x94,'ü':0x81,'Ä':0x8e,'Ö':0x99,'Ü':0x9a,'ß':0xe1,'§':0xf5,'°':0xf8,'´':0xef,'µ':0xe6,'²':0xfd,'³':0xfc };
function enc850(s) {
  return Buffer.from([...s].map(ch => {
    const c = ch.codePointAt(0); if (c < 0x80) return c;
    if (CP850[ch] === undefined) throw new Error(`Zeichen ${ch} nicht in cp850`); return CP850[ch];
  }));
}
function enc1252(s) {
  return Buffer.from([...s].map(ch => {
    const c = ch.codePointAt(0); if (c < 0x80 || (c >= 0xa0 && c <= 0xff)) return c;
    if (ch === '€') return 0x80; throw new Error(`Zeichen ${ch} nicht in cp1252`);
  }));
}

// --- Vorlage ------------------------------------------------------------------
const tpl = fs.readFileSync(path.join(R, 'keytable/leitershofen/kasse1/XBB_Siebenfrisch_03.09.MWF')).toString('latin1').split('\r\n');
const iPrint = tpl.findIndex(l => l.startsWith('!@KEYPRINT:'));
const iAlways = tpl.findIndex(l => l.startsWith('!@KEYLAYER:AlwaysActive'));
const iNormal = tpl.findIndex(l => l.startsWith('!@KEYLAYER:Normal-Layer'));
const iFnLast = tpl.findLastIndex(l => l.startsWith('!@KEYLAYER:Fn-Layer'));
const tplAttrib = {}, tplFlag = {};
for (const l of tpl.slice(iAlways, iNormal)) {
  let m;
  if ((m = l.match(/^!@KEYATTRIB:(\w+) (\w+)$/))) tplAttrib[m[1]] = m[2];
  else if ((m = l.match(/^([A-G]\d\d)(\/\S*): /))) tplFlag[m[1]] = m[2];
}

// --- Ausgangsbelegung G -------------------------------------------------------
const base = {}, fn = {};
for (const { key, recs } of decode(fs.readFileSync(path.join(R, 'keytable/goeggingen/goeggingen_original.mwx'))))
  for (const r of recs) {
    if (r.layer === '' && key !== 'D01') base[key] = { flag: r.flag, text: r.text };
    if (r.layer === 'Fn') fn[key] = { flag: r.flag, text: r.text };
  }

// --- Änderungen ---------------------------------------------------------------
const plan = require(path.join(R, 'plaene/mci-84-oliver.json'));
const singleCell = id => plan.keys.some(k => k.w === 1 && k.h === 1 &&
  String.fromCharCode(72 - k.r) + String(k.c).padStart(2, '0') === id);
let nChanges = 0;
for (const l of fs.readFileSync(path.join(R, 'keytable/goeggingen/aenderungen.md'), 'utf8').split(/\r?\n/)) {
  const m = l.match(/^\| \w+ \| ([A-G]\d\d) \| [^|]+\| [^|]+\| `(.*?)` \|(.*)\|$/); if (!m) continue;
  const [, key, text, note] = m;
  base[key] = { flag: base[key].flag, text }; nChanges++;
  if (/Flags .*neu `([^`]+)`/.test(note)) base[key].flag = note.match(/Flags .*neu `([^`]+)`/)[1];
  // /K/P ohne L trugen in G die zweiten Hälften der alten Doppeltasten; neu
  // belegte Einzeltasten bekommen /K/P/L wie ihre Nachbarn
  if (base[key].flag === '/K/P' && singleCell(key)) base[key].flag = '/K/P/L';
  if (/Fn-Ebene `.*?` fallen weg|Fn-Ebene .*fällt weg|und Fn-Ebene `\+` fallen weg/.test(note)) delete fn[key];
}

// --- Kappen aus dem Plan (Plan-Zeile 1 = oben = Tastatur G) -------------------
const CAP = { grau:'d8d9d4', blau:'7b8fd0', gruen:'9dc48b', gelb:'e2dc72', beige:'dcc9a6', rot:'e08e94', rosa:'e9a9c6',
  obst:'c9a3dc', gemuese:'8ecfb4', schwarz:'1e2124', weiss:'eceded' };
const bgr = rgb => (rgb.slice(4, 6) + rgb.slice(2, 4) + rgb.slice(0, 2)).toUpperCase().replace(/^0+(?=.)/, '');
const LABEL = { '←':'links', '↑':'oben', '→':'rechts', '↓':'unten', '−':'-' };
const cap = {};
for (const k of plan.keys) {
  // Mehrfeldtasten: Beschriftung wie in Leitershofen auf das untere rechte Feld
  const row = String.fromCharCode(72 - (k.r + k.h - 1)), col = k.c + k.w - 1;
  const id = row + String(col).padStart(2, '0');
  let label = [...k.label].map(ch => LABEL[ch] ?? ch).join('').replace(/ (?!%)/g, '\\line');
  cap[id] = { label, cat: k.cat };
}
const pad8 = s => s.padStart(8, ' ');
function keyprint(id) {
  const c = cap[id]; if (!c) return `!@KEYPRINT:${id} "";0.00;0.00;0.00;0.00;${pad8('0')};${pad8('0')};0;0;0;0;0;`;
  const plain = c.label.replace(/\\line/g, ' ');
  const size = plain.length <= 2 ? '4.80' : ['ESC', 'WIN', 'TAB', 'Fn'].includes(plain) ? '3.50' : '0.00';
  const fg = c.cat === 'schwarz' ? 'FFFFFF' : '0';
  return `!@KEYPRINT:${id} "${c.label}";0.00;0.00;0.00;${size};${pad8(bgr(CAP[c.cat] || CAP.grau))};${pad8(fg)};0;0;0;0;0;`;
}

// --- Ausgabe ------------------------------------------------------------------
const KEYS = []; for (const r of 'ABCDEFG') for (let c = 1; c <= 12; c++) KEYS.push(r + String(c).padStart(2, '0'));
const esc = s => s.replace(/\\/g, '\\\\');
const attribFor = (key, flag) => {
  const t = tplAttrib[key];
  if (t && tplFlag[key] === flag) return t;
  if (flag === '/K/P/L') return t && t.endsWith('6A') ? t : '00000A6A';
  if (flag === '/K/P') return t && t.endsWith('2A') ? t : '00000A2A';
  throw new Error(`${key}: unbekannte Flags ${flag}`);
};
const parts = [];
const line = (s, cp = enc1252) => { parts.push(cp(s), Buffer.from('\r\n')); };
tpl.slice(0, iPrint).forEach(l => parts.push(Buffer.from(l, 'latin1'), Buffer.from('\r\n')));
KEYS.forEach(id => line(keyprint(id)));
line(tpl[iAlways]);
const always = KEYS.filter(k => base[k]);
always.forEach(k => line(`${k}${base[k].flag}: "${esc(base[k].text)}"`, enc850));
always.forEach(k => line(`!@KEYATTRIB:${k} ${attribFor(k, base[k].flag)}`));
// Die Fn-Taste D01 hat in G das Attributbyte 05, nach der Leitershofen-Vorlage
// kompiliert sie zu 15 — auch ohne /A in dieser Zeile. Ohne Folgen, da Fn nichts sendet.
tpl.slice(iNormal, iFnLast + 1).forEach(l => parts.push(Buffer.from(l, 'latin1'), Buffer.from('\r\n')));
const fnKeys = KEYS.filter(k => fn[k]);
fnKeys.forEach(k => line(`${k}${fn[k].flag}: "${esc(fn[k].text)}"`, enc850));
fnKeys.forEach(k => line(`!@KEYATTRIB:${k} ${fn[k].flag === '-SL+L/K' ? '00000A01' : '00000A00'}`));
fs.writeFileSync(OUT, Buffer.concat(parts));
console.log(`${OUT}: ${always.length} Tasten, ${fnKeys.length} Fn-Belegungen, ${nChanges} Änderungen angewendet`);
