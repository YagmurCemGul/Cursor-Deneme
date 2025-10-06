import fs from 'fs';
import path from 'path';

const DIST = process.env.DIST_DIR || 'dist';
const mPath = path.join(DIST, 'manifest.json');
if (!fs.existsSync(mPath)) {
  console.error('manifest.json not found in dist/');
  process.exit(1);
}
const m = JSON.parse(fs.readFileSync(mPath,'utf8'));
const list = (dir='') => fs.readdirSync(path.join(DIST, dir), {withFileTypes:true})
  .flatMap(d => d.isDirectory() ? list(path.join(dir,d.name)) : [path.join(dir,d.name)]);

const files = list().map(p => p.replace(/\\/g,'/'));
const has = p => fs.existsSync(path.join(DIST, p));
const findJS = (hint) => {
  // prefer exact path if exists
  if (hint && has(hint)) return hint;
  // search by folder/name hints
  const candidates = files.filter(f => f.endsWith('.js'));
  const byFolder = candidates.find(f => f.includes(`/${hint}/`)) || candidates.find(f => f.includes(`${hint}.`));
  if (byFolder) return byFolder;
  // fallback: first JS at root
  return candidates.find(f => !f.includes('/chunks/')) || candidates[0];
};

const ensureHtml = (p) => {
  if (p && has(p)) return p;
  // Extract the base name from the path (e.g., "src/popup/index.html" -> "popup")
  const base = path.basename(path.dirname(p));
  // Look for a matching HTML file at root
  const match = files.find(f => f.endsWith('.html') && f.includes(base) && !f.includes('/'));
  return match || files.find(f => f.endsWith(p)) || files.find(f => f.endsWith('.html'));
};

let changed = false;

/** Background (MV3) */
if (!m.background) m.background = {};
let sw = m.background.service_worker || '';
// Try common Vite/CRX outputs first
const guessSW = () =>
  ['background.js',
   'service-worker.js',
   'background/index.js',
   'src/background/index.js',
   'service-worker-loader.js'
  ].find(p => has(p)) || findJS('background');

const resolvedSW = guessSW();
if (!resolvedSW) {
  console.error('No background service worker .js found in dist/');
  process.exit(1);
}
if (sw !== resolvedSW) { m.background.service_worker = resolvedSW; changed = true; }
if (m.background.type !== 'module') { m.background.type = 'module'; changed = true; }

/** Popup */
if (m.action?.default_popup) {
  const ph = m.action.default_popup;
  const real = has(ph) ? ph : ensureHtml(ph);
  if (real && real !== ph) { m.action.default_popup = real; changed = true; }
}

/** Options */
if (m.options_page) {
  const oh = m.options_page;
  const real = has(oh) ? oh : ensureHtml(oh);
  if (real && real !== oh) { m.options_page = real; changed = true; }
}

/** New Tab override */
if (m.chrome_url_overrides?.newtab) {
  const nh = m.chrome_url_overrides.newtab;
  const real = has(nh) ? nh : ensureHtml(nh);
  if (real && real !== nh) { m.chrome_url_overrides.newtab = real; changed = true; }
}

/** Content scripts */
if (Array.isArray(m.content_scripts)) {
  for (const cs of m.content_scripts) {
    if (Array.isArray(cs.js)) {
      const oldJs = JSON.stringify(cs.js);
      // First check if content.js exists (Webpack output)
      if (has('content.js')) {
        cs.js = ['content.js'];
      } else {
        cs.js = cs.js.map(j => {
          if (has(j)) return j;
          // Try to find by filename hints
          const basename = path.basename(j, path.extname(j));
          return findJS(basename);
        }).filter(Boolean);
      }
      if (JSON.stringify(cs.js) !== oldJs) changed = true;
    }
    if (Array.isArray(cs.css)) {
      const oldCss = JSON.stringify(cs.css);
      cs.css = cs.css.filter(c => has(c));
      if (JSON.stringify(cs.css) !== oldCss) changed = true;
    }
  }
}

/** Icons exist? (best-effort) */
if (m.icons) {
  for (const [k,v] of Object.entries(m.icons)) {
    if (!has(v)) {
      // try to find a similarly sized png/svg
      const guess = files.find(f => f.includes('/icon') && (f.endsWith(`/${k}.png`) || f.endsWith('.png') || f.endsWith('.svg')));
      if (guess) { m.icons[k] = guess; changed = true; }
    }
  }
}

if (changed) {
  fs.writeFileSync(mPath, JSON.stringify(m, null, 2));
  console.log('manifest.json updated ✓');
} else {
  console.log('manifest.json already correct ✓');
}
console.log(JSON.stringify({ background: m.background, action: m.action, options_page: m.options_page, newtab: m.chrome_url_overrides?.newtab, content_scripts: m.content_scripts?.length || 0 }, null, 2));
