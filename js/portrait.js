// ===== AI PORTRAIT GENERATION =====
// Standard model for public visuals
const POLLINATIONS_BASE = 'https://gen.pollinations.ai/image/';
const PORTRAIT_MODEL = 'zimage';

function buildPortraitPrompt(char) {
  return `anime fantasy RPG character portrait, ${char.race.name}, ${char.cls.name}, ` +
    `${char.hair} hair, ${char.eyes} eyes, ${char.build}, ${char.style}, ` +
    `${char.mark}, detailed face, cinematic lighting, high quality, ` +
    `white gradient background, upper body shot, digital art`;
}

// URL generation logic
function getPortraitUrl(char, seed, key = null) {
  const prompt = buildPortraitPrompt(char);
  const encoded = encodeURIComponent(prompt);
  // We use gen.pollinations.ai because it handles generic public requests better
  let url = `${POLLINATIONS_BASE}${encoded}?width=512&height=512&nologo=true&model=${PORTRAIT_MODEL}`;
  if (seed !== undefined) url += `&seed=${seed}`;
  // If no auth key is provided, we still point to the public endpoint
  return url;
}

// Updated fetch logic to handle the "No Key" scenario gracefully
async function fetchPortraitBlob(url, key) {
  const headers = {};
  
  // Try the authenticated path if a key exists
  if (key) {
      headers['Authorization'] = `Bearer ${key}`;
      try {
        const resp = await fetch(url, { headers });
        if (resp.ok) {
            const blob = await resp.blob();
            return URL.createObjectURL(blob);
        }
      } catch (e) { console.warn('[Portrait] Auth fetch failed, trying public fallback...'); }
  }

  // Fallback to Public No-Key fetch
  try {
    const publicUrl = url; // Pollinations supports anonymous requests
    const res = await fetch(publicUrl);
    
    if (res.status === 402 || res.status === 429) {
        throw new Error('Pollen Depleted'); // Specific error for credit/rate limits
    }
    
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const blob = await res.blob();
    return URL.createObjectURL(blob);
  } catch (e) {
    throw e;
  }
}

async function loadPortrait(char, portraitSeed) {
  const key = window.pollinationsKey || null;
  const img = document.getElementById('portrait-img');
  const placeholder = document.getElementById('portrait-placeholder');
  const loading = document.getElementById('portrait-loading');
  const seedWrap = document.getElementById('portrait-seed');
  const seedDisplay = document.getElementById('seed-display');

  img.classList.add('hidden');
  placeholder.classList.add('hidden');
  loading.classList.remove('hidden');
  loading.textContent = '⏳ Manifesting Portrait...';

  const pSeed = (portraitSeed !== undefined) ? portraitSeed : char.seed;
  const url = getPortraitUrl(char, pSeed, key);

  try {
    const blobUrl = await fetchPortraitBlob(url, key);
    img.src = blobUrl;
    img.classList.remove('hidden');
    loading.classList.add('hidden');
    seedWrap.classList.remove('hidden');
    if (seedDisplay) seedDisplay.textContent = pSeed;
  } catch (e) {
    console.error('[Portrait] Summoning Failed:', e);
    loading.classList.add('hidden');
    placeholder.classList.remove('hidden');
    
    let msg = 'Summoning Failed';
    let detail = 'The Multiverse is unstable.';
    
    if (e.message.includes('Pollen')) {
        msg = 'Pollen Depleted';
        detail = 'Hourly public quota reached.<br>Connect your own Pollen to bypass.';
    } else if (!key) {
        msg = 'Connection Required';
        detail = 'Please connect Pollinations API<br>to generate unique visuals.';
    } else {
        detail = e.message;
    }
    
    placeholder.innerHTML = `⚠️<br><strong>${msg}</strong><br><small>${detail}</small>`;
  }

  return pSeed;
}
