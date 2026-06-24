// Publie la carte du jour sur Instagram via l'API Graph (Content Publishing).
// 2 étapes : créer le conteneur média (image_url + caption) -> publier (creation_id).
import { readFileSync } from 'node:fs';

const TZ = 'America/Toronto';
const today = new Date().toLocaleDateString('en-CA', { timeZone: TZ });
const IG = process.env.IG_USER_ID;
const TOK = process.env.IG_ACCESS_TOKEN;
const REPO = process.env.IMG_REPO || 's1dupuis-spec/switch-landing';
const BRANCH = process.env.IMG_BRANCH || 'main';
const API = 'https://graph.facebook.com/v21.0';

if (!IG || !TOK) { console.error('Secrets IG_USER_ID / IG_ACCESS_TOKEN manquants.'); process.exit(1); }

const imageUrl = `https://raw.githubusercontent.com/${REPO}/${BRANCH}/ig/${today}.png`;
let caption = '';
try { caption = readFileSync(`content/posts-quotidiens/${today}/copy_instagram.txt`, 'utf8').trim(); } catch { caption = ''; }

const post = async (path, body) => {
  const r = await fetch(`${API}/${path}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...body, access_token: TOK }) });
  return r.json();
};

console.log('Image :', imageUrl);
const container = await post(`${IG}/media`, { image_url: imageUrl, caption });
if (!container.id) { console.error('Échec création conteneur :', container); process.exit(1); }

// petite attente : IG doit télécharger l'image
await new Promise(r => setTimeout(r, 8000));

const published = await post(`${IG}/media_publish`, { creation_id: container.id });
if (!published.id) { console.error('Échec publication :', published); process.exit(1); }
console.log('✅ Publié sur Instagram. media id :', published.id);
