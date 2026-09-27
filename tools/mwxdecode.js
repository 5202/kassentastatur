// Decoder für PrehKeyTec-MWX (MCI 84), deutsches Tastaturlayout, Scancode-Set 1.
// Aufruf: node mwxdecode.js datei.mwx [--raw]
const fs = require('fs');

const NORM = { 0x02:'1',0x03:'2',0x04:'3',0x05:'4',0x06:'5',0x07:'6',0x08:'7',0x09:'8',0x0a:'9',0x0b:'0',0x0c:'ß',0x0d:'´',
  0x10:'q',0x11:'w',0x12:'e',0x13:'r',0x14:'t',0x15:'z',0x16:'u',0x17:'i',0x18:'o',0x19:'p',0x1a:'ü',0x1b:'+',
  0x1e:'a',0x1f:'s',0x20:'d',0x21:'f',0x22:'g',0x23:'h',0x24:'j',0x25:'k',0x26:'l',0x27:'ö',0x28:'ä',0x29:'^',0x2b:'#',
  0x2c:'y',0x2d:'x',0x2e:'c',0x2f:'v',0x30:'b',0x31:'n',0x32:'m',0x33:',',0x34:'.',0x35:'-',0x39:' ',0x56:'<',
  0x37:'*' };
const SHIFT = { 0x02:'!',0x03:'"',0x04:'§',0x05:'$',0x06:'%',0x07:'&',0x08:'/',0x09:'(',0x0a:')',0x0b:'=',0x0c:'?',0x0d:'`',
  0x1b:'*',0x29:'°',0x2b:"'",0x33:';',0x34:':',0x35:'_',0x56:'>' };
const ALTGR = { 0x03:'²',0x04:'³',0x08:'{',0x09:'[',0x0a:']',0x0b:'}',0x0c:'\\',0x10:'@',0x12:'€',0x1b:'~',0x32:'µ',0x56:'|' };
const NAMES = { 0x01:'ESC',0x0e:'BACKSPACE',0x0f:'TAB',0x1c:'RETURN',0x3a:'CAPSLOCK',0x57:'F11',0x58:'F12' };
for (let i = 0; i < 10; i++) NAMES[0x3b + i] = 'F' + (i + 1);
const ENAMES = { 0x1c:'ENTER',0x48:'UP',0x50:'DOWN',0x4b:'LEFT',0x4d:'RIGHT',0x53:'DEL',0x52:'INS',0x47:'HOME',0x4f:'END',
  0x49:'PGUP',0x51:'PGDN',0x5b:'WIN',0x5c:'RWIN',0x5d:'APPS',0x35:'NUMDIV' };

function decodeCodes(c) {
  let out = '', i = 0; const mods = { SHIFT:false, CTRL:false, ALT:false, ALTGR:false };
  while (i < c.length) {
    let e = false, x = c[i++];
    if (x === 0xe0) { e = true; x = c[i++]; }
    const brk = x & 0x80, k = x & 0x7f;
    if (!e && (k === 0x2a || k === 0x36)) { mods.SHIFT = !brk; continue; }
    if (k === 0x1d) { mods.CTRL = !brk; continue; }
    if (k === 0x38) { if (e) mods.ALTGR = !brk; else mods.ALT = !brk; continue; }
    if (brk) continue;
    if (x >= 0xfc) { out += `{KEY-FN:${x.toString(16)}}`; continue; }
    const base = e ? ENAMES[k] : (NAMES[k] || NORM[k]);
    if (base === undefined) { out += `{?${e ? 'e0' : ''}${k.toString(16)}}`; continue; }
    const isChar = !e && !NAMES[k];
    if (mods.ALTGR && !mods.SHIFT && !mods.CTRL && !mods.ALT && ALTGR[k]) { out += ALTGR[k]; continue; }
    if (mods.SHIFT && !mods.CTRL && !mods.ALT && !mods.ALTGR && isChar) { out += SHIFT[k] || base.toUpperCase(); continue; }
    const m = ['SHIFT','CTRL','ALT','ALTGR'].filter(n => mods[n]);
    if (m.length) out += `{${m.join('+')}+${base}}`;
    else out += isChar ? base : `{${base}}`;
  }
  return out;
}

const LAYER = { 0x0080: '', 0x0191: 'Fn' };
const FLAGS = { '': { 0x25: '/K/P/L', 0x05: '/K/P', 0x15: '+K' }, Fn: { 0x00: '-SL+L', 0x01: '-SL+L/K' } };

function decode(buf) {
  if (buf.toString('latin1', 0, 4) !== 'Preh') throw new Error('keine MWX-Datei');
  const keys = [];
  for (let r = 0; r < 8; r++) for (let col = 0; col < 16; col++) {
    let o = buf.readUInt16BE(8 + (r * 16 + col) * 2); if (!o) continue;
    const key = String.fromCharCode(65 + r) + String(col + 1).padStart(2, '0');
    const recs = [];
    for (let guard = 0; guard < 8; guard++) {
      const next = buf.readUInt16BE(o), layer = buf.readUInt16BE(o + 2), flag = buf[o + 4];
      let p = o + 5; const codes = [];
      while (buf[p] !== 0x00) codes.push(buf[p++]);
      const ln = layer in LAYER ? LAYER[layer] : 'L' + layer.toString(16);
      recs.push({ layer: ln, flag: (FLAGS[ln] || {})[flag] ?? '#' + flag.toString(16), text: decodeCodes(codes), raw: Buffer.from(codes).toString('hex') });
      if (!next) break; o = next;
    }
    keys.push({ key, recs });
  }
  return keys;
}

module.exports = { decode, decodeCodes };
if (require.main === module) {
  const raw = process.argv.includes('--raw');
  for (const { key, recs } of decode(fs.readFileSync(process.argv[2])))
    for (const r of recs.slice().reverse())
      console.log(`${key}${r.layer ? ' [' + r.layer + ']' : ''}${r.flag}: "${r.text}"${raw ? '   ' + r.raw : ''}`);
}
