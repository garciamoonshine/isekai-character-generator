// ===== AI PORTRAIT GENERATION =====
const POLLINATIONS_BASE = 'https://pollinations.ai/p/';
const PORTRAIT_MODEL = 'flux'; // Switching to flux which is faster and more reliable for public

function buildPortraitPrompt(char) {
  return `anime fantasy RPG character portrait, ${char.race.name}, ${char.cls.name}, ` +
    `${char.hair} hair, ${char.eyes} eyes, ${char.build}, ${char.style}, ` +
    `${char.mark}, detailed face, cinematic lighting, high quality, ` +
    `white background, upper body shot, digital art`;
}

function getPortraitUrl(char, seed) {
  const prompt = buildPortraitPrompt(char);
  const encoded = encodeURIComponent(prompt);
  // Using the primary /p/ endpoint for maximum compatibility
  let url = `${POLLINATIONS_BASE}${encoded}?width=512&height=768&nologo=true&model=${PORTRAIT_MODEL}`;
  if (seed !== undefined) url += `&seed=${seed}`;
  return url;
}

async function fetchPortraitBlob(url, key) {
  const headers = {};
  if (key) headers['Authorization'] = `Bearer ${key}`;
  
  try {
    const resp = await fetch(url, { headers });
    
    // Detailed error handling for Pollinations responses
    if (resp.status === 402 || resp.status === 429) throw new Error('Pollen Depleted');
    if (resp.status === 400 || resp.status === 404) {
        // Fallback: try different model if primary fails
        if (url.includes('flux')) {
            console.warn('[Portrait] Flux failed, trying turbo fallback...');
            return fetchPortraitBlob(url.replace('model=flux', 'model=turbo'), key);
        }
        throw new Error(`API Error (${resp.status})`);
    }
    
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    
    const blob = await resp.blob();
    if (blob.size < 100) throw new Error('Empty Response');
    
    return URL.createObjectURL(blob);
  } catch (e) {
    if (key && !e.message.includes('Depleted')) {
        console.warn('[Portrait] Auth failed, trying public fallback...');
        return fetchPortraitBlob(url, null);
    }
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
  loading.textContent = '⏳ Invoking the Void...';

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
    console.error('[Portrait] Error:', e);
    loading.classList.add('hidden');
    placeholder.classList.remove('hidden');
    
    let msg = 'Summoning Failed';
    let detail = e.message;
    
    if (e.message.includes('Pollen')) {
        msg = 'Pollen Depleted';
        detail = 'Hourly quota reached. Connect API key to bypass.';
    }
    
    placeholder.innerHTML = `⚠️<br><strong>${msg}</strong><br><small>${detail}</small>`;
  }
  return pSeed;
}
