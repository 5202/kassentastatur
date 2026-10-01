// Kompiliert eine Göggingen-Keytable (.MWF) zur binären .mwx für C2K („Write…“),
// ohne WinProgrammer/C2K-„Compile“. Unterstützt nur, was in G vorkommt:
// AlwaysActive-Belegungen (/K/P/L, /K/P), Fn-Ebene (-SL+L/K, -SL+L), Fn-Taste D01.
// Kopfbereich und D01 kommen unverändert aus der Referenz-.mwx (in allen
// bekannten .mwx gleich bzw. fest).
// Aufruf: node tools/build-mwx.js [eingabe.MWF] [ausgabe.mwx] [referenz.mwx]
const fs = require('fs'), path = require('path');
const { decode } = require('./mwxdecode');
const R = path.join(__dirname, '..');
const G = p => path.join(R, 'keytable/goeggingen', p);
const IN = process.argv[2] || G('goeggingen_neu.MWF');
const OUT = process.argv[3] || G('goeggingen_neu.mwx');
const REF = process.argv[4] || G('goeggingen_neu_read.mwx');

// --- Zeichen → Scancodes (Set 1, deutsches Layout), Umkehrung von mwxdecode.js ---
const NORM = { '1':0x02,'2':0x03,'3':0x04,'4':0x05,'5':0x06,'6':0x07,'7':0x08,'8':0x09,'9':0x0a,'0':0x0b,'ß':0x0c,'´':0x0d,
  q:0x10,w:0x11,e:0x12,r:0x13,t:0x14,z:0x15,u:0x16,i:0x17,o:0x18,p:0x19,'ü':0x1a,'+':0x1b,
  a:0x1e,s:0x1f,d:0x20,f:0x21,g:0x22,h:0x23,j:0x24,k:0x25,l:0x26,'ö':0x27,'ä':0x28,'^':0x29,'#':0x2b,
  y:0x2c,x:0x2d,c:0x2e,v:0x2f,b:0x30,n:0x31,m:0x32,',':0x33,'.':0x34,'-':0x35,' ':0x39,'<':0x56 };
const SHIFT = { '!':0x02,'"':0x03,'§':0x04,'$':0x05,'%':0x06,'&':0x07,'/':0x08,'(':0x09,')':0x0a,'=':0x0b,'?':0x0c,'`':0x0d,
  '*':0x1b,'°':0x29,"'":0x2b,';':0x33,':':0x34,'_':0x35,'>':0x56 };
const ALTGR = { '²':0x03,'³':0x04,'{':0x08,'[':0x09,']':0x0a,'}':0x0b,'\\':0x0c,'@':0x10,'€':0x12,'~':0x1b,'µ':0x32,'|':0x56 };
const NAMES = { ESC:0x01, BACKSPACE:0x0e, TAB:0x0f, RETURN:0x1c, CAPSLOCK:0x3a, F11:0x57, F12:0x58 };
for (let i = 0; i < 10; i++) NAMES['F' + (i + 1)] = 0x3b + i;
const ENAMES = { ENTER:0x1c, UP:0x48, DOWN:0x50, LEFT:0x4b, RIGHT:0x4d, DEL:0x53, INS:0x52, HOME:0x47, END:0x4f,
  PGUP:0x49, PGDN:0x51, WIN:0x5b, RWIN:0x5c, APPS:0x5d, NUMDIV:0x35 };
const MOD = { SHIFT:[0x2a], CTRL:[0x1d], ALT:[0x38], ALTGR:[0xe0, 0x38] };
const brk = seq => seq.length === 2 ? [seq[0], seq[1] | 0x80] : [seq[0] | 0x80];

function keySeq(name) {
  if (ENAMES[name] !== undefined) return [0xe0, ENAMES[name]];
  if (NAMES[name] !== undefined) return [NAMES[name]];
  if (NORM[name] !== undefined) return [NORM[name]];
  if (/^[A-Z]$/.test(name)) return [NORM[name.toLowerCase()]];
  throw new Error(`unbekannte Taste ${name}`);
}
const tap = (seq, mods = []) => [...mods.flatMap(m => MOD[m]), ...seq, ...brk(seq),
  ...mods.flatMap(m => brk(MOD[m]))];   // C2K lässt in Drückreihenfolge los: 2a 38 06 86 aa b8

function encode(macro) {
  const out = [];
  for (const [, tok, ch] of macro.matchAll(/\{([^}]+)\}|(.)/gsu)) {
    if (tok) {
      const parts = tok.split('+'), name = parts.pop();
      if (parts.some(p => !MOD[p])) throw new Error(`unbekannter Modifikator in {${tok}}`);
      out.push(...tap(keySeq(name), parts));
    } else if (NORM[ch] !== undefined) out.push(...tap([NORM[ch]]));
    else if (/^[A-Z]$/.test(ch)) out.push(...tap([NORM[ch.toLowerCase()]], ['SHIFT']));
    else if (SHIFT[ch] !== undefined) out.push(...tap([SHIFT[ch]], ['SHIFT']));
    else if (ALTGR[ch] !== undefined) out.push(...tap([ALTGR[ch]], ['ALTGR']));
    else throw new Error(`Zeichen ${ch} nicht abbildbar`);
  }
  return out;
}

// --- MWF lesen (Belegungen in cp850) ------------------------------------------
const FROM850 = { 0x84:'ä',0x94:'ö',0x81:'ü',0x8e:'Ä',0x99:'Ö',0x9a:'Ü',0xe1:'ß',0xf5:'§',0xf8:'°',0xef:'´',0xe6:'µ',0xfd:'²',0xfc:'³' };
const dec850 = s => [...s].map(ch => { const c = ch.charCodeAt(0); if (c < 0x80) return ch;
  if (!FROM850[c]) throw new Error(`Byte ${c.toString(16)} nicht in cp850-Tabelle`); return FROM850[c]; }).join('');
const unesc = s => s.replace(/\\\\/g, '\\');
const NFLAG = { '/K/P/L':0x25, '/K/P':0x05 }, FFLAG = { '-SL+L/K':0x01, '-SL+L':0x00 };
const keys = {};   // key -> { normal: {flag, codes}, fn: {flag, codes} }
let layer = null;
for (const l of fs.readFileSync(IN).toString('latin1').split(/\r?\n/)) {
  let m;
  if ((m = l.match(/^!@KEYLAYER:([^,]+)/))) { layer = m[1]; continue; }
  if (!(m = l.match(/^([A-G]\d\d)([-+/]\S*): "(.*)"$/))) continue;
  const [, key, flag, raw] = m;
  if (key === 'D01') continue;   // Fn-Taste: aus der Referenz
  const text = unesc(dec850(raw));
  const k = keys[key] ??= {};
  if (layer === 'AlwaysActive') {
    if (NFLAG[flag] === undefined) throw new Error(`${key}: Flags ${flag} nicht unterstützt`);
    k.normal = { flag: NFLAG[flag], codes: encode(text) };
  } else if (layer === 'Fn-Layer') {
    if (FFLAG[flag] === undefined) throw new Error(`${key}: Fn-Flags ${flag} nicht unterstützt`);
    k.fn = { flag: FFLAG[flag], codes: encode(text) };
  } else throw new Error(`${key}: Ebene ${layer} nicht unterstützt`);
}

// --- Referenz: Kopf (0x04–0x07 wird neu gesetzt), Bereich 0x108–0x141, D01 ------
const ref = fs.readFileSync(REF);
const FIRST = 0x142;
if (ref.toString('latin1', 0, 4) !== 'Preh' || ref.readUInt16BE(8) !== FIRST) throw new Error('Referenz unerwartet aufgebaut');
const d01 = decode(ref).find(k => k.key === 'D01');
const D01 = d01.recs.map(r => ({ layer: r.layer === 'Fn' ? 0x0191 : r.layer === '' ? 0x0080 : parseInt(r.layer.slice(1), 16),
  flag: parseInt(r.flag === '+K' ? '15' : r.flag.slice(1), 16), codes: [...Buffer.from(r.raw, 'hex')] }));

// --- Ausgabe ------------------------------------------------------------------
const body = [], table = Buffer.alloc(256);
let pos = FIRST;
for (let r = 0; r < 8; r++) for (let c = 0; c < 16; c++) {
  const key = String.fromCharCode(65 + r) + String(c + 1).padStart(2, '0');
  const k = keys[key];
  const recs = key === 'D01' ? D01 : k ? [
    ...(k.fn ? [{ layer: 0x0191, ...k.fn }] : []),
    ...(k.normal ? [{ layer: 0x0080, ...k.normal }] : []),
  ] : [];
  if (!recs.length) continue;
  table.writeUInt16BE(pos, (r * 16 + c) * 2);
  recs.forEach((rec, i) => {
    const len = 5 + rec.codes.length + 1, b = Buffer.alloc(len);
    b.writeUInt16BE(i < recs.length - 1 ? pos + len : 0, 0);
    b.writeUInt16BE(rec.layer, 2); b[4] = rec.flag;
    Buffer.from(rec.codes).copy(b, 5);
    body.push(b); pos += len;
  });
}
const out = Buffer.concat([ref.subarray(0, 8), table, ref.subarray(0x108, FIRST), ...body]);
out.writeUInt16BE(out.length, 6);
fs.writeFileSync(OUT, out);
console.log(`${OUT}: ${out.length} Bytes, ${Object.keys(keys).length + 1} Tasten`);
