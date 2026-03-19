// ===== AI PORTRAIT GENERATION =====
const POLLINATIONS_BASE = 'https://gen.pollinations.ai/image/';
const PORTRAIT_MODEL = 'zimage'; 

function buildPortraitPrompt(char) {
  return `anime fantasy RPG character portrait, ${char.race.name}, ${char.cls.name}, ` +
    `${char.hair} hair, ${char.eyes} eyes, ${char.build}, ${char.style}, ` +
    `${char.mark}, detailed face, cinematic lighting, high quality, ` +
    `white background, upper body shot, digital art`;
}

function getPortraitUrl(char, seed) {
  const prompt = buildPortraitPrompt(char);
  const encoded = encodeURIComponent(prompt);
  // Using 512x512 square as primary to ensure stability since Joe noted zimage is square anyway
  let url = `${POLLINATIONS_BASE}${encoded}?width=512&height=512&nologo=true&model=${PORTRAIT_MODEL}`;
  if (seed !== undefined) url += `&seed=${seed}`;
  return url;
}

async function fetchPortraitBlob(url, key) {
  const headers = {};
  if (key) headers['Authorization'] = `Bearer ${key}`;
  
  try {
    const fetchOptions = { headers };
    // Add timeout to prevent hanging
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s timeout
    fetchOptions.signal = controller.signal;

    const resp = await fetch(url, fetchOptions);
    clearTimeout(timeoutId);
    
    if (resp.status === 402 || resp.status === 429) throw new Error('Pollen Depleted');
    if (resp.status >= 400) {
        // Fallback: if zimage fails, try turbo model
        if (url.includes('model=zimage')) {
            console.warn('[Portrait] zimage failed, trying turbo fallback...');
            return fetchPortraitBlob(url.replace('model=zimage', 'model=turbo'), key);
        }
        throw new Error(`API Error (${resp.status})`);
    }
    
    const blob = await resp.blob();
    if (blob.size < 100) throw new Error('Empty Image Data');
    return URL.createObjectURL(blob);
  } catch (e) {
    if (e.name === 'AbortError') throw new Error('Request Timed Out');
    if (key && !e.message.includes('Depleted')) {
        return fetchPortraitBlob(url, null); // Retry without key
    }
    throw e;
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
    
    let msg = 'Summoning Failed';
    let detail = e.message;
    if (e.message.includes('Pollen')) {
        msg = 'Pollen Depleted';
        detail = 'Hourly quota reached. Connect API key to bypass.';
    }
    placeholder.innerHTML = `⚠️<br><strong>${msg}</strong><br><small>${detail}</small>`;
  } finally {
    setBusy(false);
  }
  return pSeed;
}
