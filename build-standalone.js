const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const indexHtmlPath = path.join(ROOT, 'index.html');
const outputFiles = [
  'Save the Date · Trupti & Krushna.html',
  'Trupti-and-Krushna-Invitation.html'
];

function normalizeFile(filePath) {
  if (!fs.existsSync(filePath)) return '';
  let content = fs.readFileSync(filePath, 'utf8');
  content = content.replace(/\r\n/g, '\n').replace(/\n{3,}/g, '\n\n');
  fs.writeFileSync(filePath, content, 'utf8');
  return content;
}

function buildStandalone() {
  if (!fs.existsSync(indexHtmlPath)) {
    console.error('index.html not found');
    process.exit(1);
  }

  let html = normalizeFile(indexHtmlPath);

  // Verify preserved wedding facts
  const requiredFacts = [
    'TRUPTI &amp; KRUSHNA',
    'Trupti &amp; Krushna',
    '01 NOVEMBER',
    '2026',
    '11:00 AM',
    'BALAJI MANDIR, BADNAPUR',
    'The CA Coder Couple',
    '@the_ca_coder_couple',
    'ARE GETTING ENGAGED!',
    '₹ CA',
    '&lt;/&gt; Engineer'
  ];
  const missingFacts = requiredFacts.filter((f) => !html.includes(f));
  if (missingFacts.length) {
    console.error('❌ Missing required wedding facts:', missingFacts);
    process.exit(1);
  }

  // Verify all DOM IDs referenced in scripts exist in index.html
  const scriptFiles = ['scripts/audio.js', 'scripts/particles.js', 'scripts/activities.js', 'scripts/main.js'];
  const allJs = scriptFiles.map((f) => normalizeFile(path.join(ROOT, f))).join('\n');

  const idRefs = [...allJs.matchAll(/\(['"]#([a-zA-Z0-9_-]+)['"]\)|getElementById\(['"]([a-zA-Z0-9_-]+)['"]\)/g)]
    .map((m) => m[1] || m[2])
    .filter(Boolean);

  const missingIds = [...new Set(idRefs)].filter((id) => !html.includes(`id="${id}"`));
  if (missingIds.length) {
    console.error('❌ Missing DOM IDs in index.html:', missingIds);
    process.exit(1);
  }

  // Inline local stylesheets: <link rel="stylesheet" href="styles/royal.css">
  html = html.replace(/<link\s+rel="stylesheet"\s+href="(styles\/[^"]+)"\s*\/?>/g, (match, relPath) => {
    const fullPath = path.join(ROOT, relPath);
    if (fs.existsSync(fullPath)) {
      const css = normalizeFile(fullPath);
      return `<style>\n${css}\n</style>`;
    }
    return match;
  });

  // Inline local scripts: <script src="scripts/..." defer></script>
  html = html.replace(/<script\s+src="(scripts\/[^"]+)"(?:\s+defer)?><\/script>/g, (match, relPath) => {
    const fullPath = path.join(ROOT, relPath);
    if (fs.existsSync(fullPath)) {
      const js = normalizeFile(fullPath);
      return `<script>\n${js}\n</script>`;
    }
    return match;
  });

  const kb = (Buffer.byteLength(html, 'utf8') / 1024).toFixed(1);
  outputFiles.forEach((fileName) => {
    fs.writeFileSync(path.join(ROOT, fileName), html, 'utf8');
    console.log(`✅ Built standalone luxury invitation: ${fileName} (${kb} KB)`);
  });
}

buildStandalone();
