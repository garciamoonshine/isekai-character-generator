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
  let url = `${POLLINATIONS_BASE}${encoded}?width=512&height=512&nologo=true&model=${PORTRAIT_MODEL}`;
  if (seed !== undefined) url += `&seed=${seed}`;
  return url;
}

async function fetchPortraitBlob(url, key) {
  const headers = {};
  if (key) headers['Authorization'] = `Bearer ${key}`;
  
  try {
    const fetchOptions = { headers };
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000);
    fetchOptions.signal = controller.signal;

    const resp = await fetch(url, fetchOptions);
    clearTimeout(timeoutId);
    
    if (resp.status === 402 || resp.status === 429) throw new Error('Pollen Depleted');
    
    // If we get a 400 and we DON'T HAVE A KEY, it means anonymous public usage is blocked/exhausted
    if (resp.status === 400 && !key) throw new Error('Unconnected');
    
    if (resp.status >= 400) {
        if (url.includes('model=zimage')) {
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
        return fetchPortraitBlob(url, null); 
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
    
    if (e.message === 'Unconnected' || (!key && e.message.includes('400'))) {
        msg = 'Connection Required ⚡';
        detail = 'Please connect your Pollinations account<br>to generate these portraits!';
    } else if (e.message.includes('Pollen')) {
        msg = 'Pollen Depleted 🌸';
        detail = 'Hourly public quota reached.<br>Connect your own key to bypass.';
    }
    
    placeholder.innerHTML = `⚠️<br><strong>${msg}</strong><br><small>${detail}</small>`;
  } finally {
    setBusy(false);
  }
  return pSeed;
}
