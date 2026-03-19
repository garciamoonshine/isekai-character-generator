// ===== AI PORTRAIT GENERATION =====
const POLLINATIONS_BASE = 'https://gen.pollinations.ai/image/';
const PORTRAIT_MODEL = 'zimage';

function buildPortraitPrompt(char) {
  return `anime fantasy RPG ${char.gender} character portrait, ${char.race.name}, ${char.cls.name}, ` +
    `${char.hair} hair, ${char.eyes} eyes, ${char.build}, ${char.style}, ` +
    `${char.mark}, detailed face, cinematic lighting, high quality, ` +
    `white gradient background, upper body shot, digital art`;
}

function getPortraitUrl(char, seed) {
  const prompt = buildPortraitPrompt(char);
  const encoded = encodeURIComponent(prompt);
  let url = `${POLLINATIONS_BASE}${encoded}?width=1080&height=1920&nologo=true&safe=false&model=${PORTRAIT_MODEL}`;
  if (seed !== undefined) url += `&seed=${seed}`;
  return url;
}

// Fetch portrait as blob using Authorization header (handles sk_ keys correctly)
async function fetchPortraitBlob(url, key) {
  const headers = {};
  if (key) headers['Authorization'] = `Bearer ${key}`;
  try {
    const resp = await fetch(url, { headers });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const blob = await resp.blob();
    return URL.createObjectURL(blob);
  } catch (e) {
    // Fallback: try URL param method (works for pk_ keys without CORS issue)
    const fallbackUrl = key ? url + `&key=${encodeURIComponent(key)}` : url;
    const resp2 = await fetch(fallbackUrl);
    if (!resp2.ok) throw new Error(`Fallback HTTP ${resp2.status}`);
    const blob2 = await resp2.blob();
    return URL.createObjectURL(blob2);
  }
}

async function loadPortrait(char, portraitSeed) {
  setBusy(true);
  const key = window.pollinationsKey || null;
  const img = document.getElementById('portrait-img');
  const placeholder = document.getElementById('portrait-placeholder');
  const loading = document.getElementById('portrait-loading');
  const seedWrap = document.getElementById('portrait-seed');
  const seedDisplay = document.getElementById('seed-display');

  img.classList.add('hidden');
  placeholder.classList.add('hidden');
  loading.classList.remove('hidden');
  loading.textContent = '⏳ Drawing from the Aether...';

  const pSeed = (portraitSeed !== undefined) ? portraitSeed : char.seed;
  const url = getPortraitUrl(char, pSeed);

  try {
    const blobUrl = await fetchPortraitBlob(url, key);
    img.src = blobUrl;
    img.classList.remove('hidden');
    loading.classList.add('hidden');
    seedWrap.classList.remove('hidden');
    if (seedDisplay) seedDisplay.textContent = pSeed;
  } catch (e) {
    console.error('[Portrait] Failed:', e);
    loading.classList.add('hidden');
    placeholder.classList.remove('hidden');
    placeholder.innerHTML = `⚠️<br><strong>Summoning Failed</strong><br><small>${e.message}</small>`;
  } finally {
    setBusy(false);
  }

  return pSeed;
}
