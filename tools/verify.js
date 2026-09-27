const fs = require('fs'); const { decode } = require('./mwxdecode');
const [, , mwx, mwf] = process.argv;
const want = {}; let layer = '';
for (const l of fs.readFileSync(mwf, 'latin1').replace(/\r/g, '').split('\n')) {
  let m;
  if ((m = l.match(/^!@KEYLAYER:([^,]+)/))) layer = m[1].startsWith('Fn') ? 'Fn' : m[1] === 'AlwaysActive' ? '' : 'X';
  else if ((m = l.match(/^([A-H]\d\d)(\S*): "(.*)"$/)) && layer !== 'X')
    want[m[1] + '|' + layer] = { flag: m[2], text: m[3].split('\\\\').join('\\') };
}
const got = {};
for (const { key, recs } of decode(fs.readFileSync(mwx))) for (const r of recs) got[key + '|' + r.layer] = r;
let ok = 0, bad = 0;
for (const k of new Set([...Object.keys(want), ...Object.keys(got)])) {
  if (k.startsWith('D01|')) continue;
  const w = want[k], g = got[k];
  if (w && g && w.text === g.text && w.flag === g.flag) ok++;
  else { bad++; console.log('DIFF', k, 'MWF:', w && w.flag + ' ' + JSON.stringify(w.text), ' MWX:', g && g.flag + ' ' + JSON.stringify(g.text)); }
}
console.log(`${ok} gleich, ${bad} abweichend`);
