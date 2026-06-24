// Rend la carte SWITCH du jour en PNG 1080x1350, sans navigateur (SVG -> PNG via resvg).
// Lit content/posts-quotidiens/AAAA-MM-JJ/carte.txt (repo mon-premier-repo checkout sous ./content).
// Écrit ig/AAAA-MM-JJ.png à la racine de switch-landing.
import { Resvg } from '@resvg/resvg-js';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';

const TZ = 'America/Toronto';
const today = new Date().toLocaleDateString('en-CA', { timeZone: TZ }); // YYYY-MM-DD
const dir = process.env.CONTENT_DIR || 'content/posts-quotidiens';

let carte = '';
try { carte = readFileSync(`${dir}/${today}/carte.txt`, 'utf8'); }
catch { console.error('Pas de carte.txt pour', today, '— rien à rendre.'); process.exit(78); }

const field = (label) => { const m = carte.match(new RegExp(label + '\\s*:?\\s*(.+)', 'i')); return m ? m[1].trim() : ''; };
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const wrap = (s, n) => { const w = s.split(/\s+/); const out = []; let cur = ''; for (const x of w) { if ((cur + ' ' + x).trim().length > n) { if (cur) out.push(cur.trim()); cur = x; } else cur += ' ' + x; } if (cur.trim()) out.push(cur.trim()); return out; };

const kicker = (field('KICKER') || 'SWITCH').toUpperCase();
const titre = field('TITRE') || '';
const points = (carte.match(/^\s*[•\-]\s*(.+)$/gm) || []).map(s => s.replace(/^\s*[•\-]\s*/, '').trim()).filter(p => p.length > 2 && !/^DIRECTIVE/i.test(p)).slice(0, 3);

const titleLines = wrap(titre, 22);
const tyStart = 560;
const titleSvg = titleLines.map((l, i) => `<text x="80" y="${tyStart + i * 72}" font-size="60" font-weight="800" fill="#f4f7fa">${esc(l)}</text>`).join('\n');
let py = tyStart + titleLines.length * 72 + 70;
const pointsSvg = points.map((p, i) => `<text x="80" y="${py + i * 56}" font-size="30" fill="#aeb8c4">• ${esc(p)}</text>`).join('\n');

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1350" viewBox="0 0 1080 1350" font-family="Helvetica, Arial, sans-serif">
<defs><radialGradient id="g" cx="50%" cy="0%" r="95%"><stop offset="0%" stop-color="#16384f"/><stop offset="55%" stop-color="#080b11"/><stop offset="100%" stop-color="#080b11"/></radialGradient></defs>
<rect width="1080" height="1350" fill="url(#g)"/>
<text x="80" y="115" font-size="34" font-weight="800" letter-spacing="9" fill="#2e9fe0">S·W·I·T·C·H</text>
<text x="80" y="440" font-size="26" letter-spacing="6" fill="#2e9fe0">${esc(kicker)}</text>
${titleSvg}
${pointsSvg}
<text x="80" y="1285" font-size="26" fill="#6b7787">@_sebdupuis_</text>
</svg>`;

mkdirSync('ig', { recursive: true });
const png = new Resvg(svg, { font: { loadSystemFonts: true }, background: '#080b11' }).render().asPng();
writeFileSync(`ig/${today}.png`, png);
console.log('Carte rendue : ig/' + today + '.png');
