// ===== AI PORTRAIT GENERATION =====
const POLLINATIONS_BASE = 'https://pollinations.ai/p/';

function buildPortraitPrompt(char) {
  // SIMPLIFIED PROMPT: Long complex prompts are often rejected by Pollinations with HTTP 400
  return `anime character portrait, ${char.race.name}, ${char.cls.name}, ${char.gender}, ${char.hair} hair, ${char.eyes} eyes, digital art style`;
}

function getPortraitUrl(char, seed, useTurbo = false) {
  const prompt = buildPortraitPrompt(char);
  const encoded = encodeURIComponent(prompt);
  const model = useTurbo ? 'turbo' : 'flux'; // Flux is generally more stable than zimage right now
  let url = `${POLLINATIONS_BASE}${encoded}?width=512&height=512&nologo=true&model=${model}`;
  if (seed !== undefined) url += `&seed=${seed}`;
  return url;
}

async function fetchPortraitBlob(url, key) {
  const headers = {};
  if (key) headers['Authorization'] = `Bearer ${key}`;
  
  try {
    const resp = await fetch(url, { headers });
    
    if (resp.status === 402 || resp.status === 429) throw new Error('Pollen Depleted');
    
    if (!resp.ok) {
        // If the primary model failed (400 often means prompt filtered), try TURBO
        if (!url.includes('model=turbo')) {
            console.warn('[Portrait] Primary model failed, trying Turbo fallback...');
            const turboUrl = url.includes('model=flux') ? url.replace('model=flux', 'model=turbo') : url + '&model=turbo';
            return fetchPortraitBlob(turboUrl, key);
        }
        throw new Error(`HTTP ${resp.status}`);
    }
    
    const blob = await resp.blob();
    return URL.createObjectURL(blob);
  } catch (e) {
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
    console.error('[Portrait] Error:', e.message);
    loading.classList.add('hidden');
    placeholder.classList.remove('hidden');
    
    if (!key && (e.message.includes('400') || e.message.includes('401'))) {
       placeholder.innerHTML = `
            <div style="padding:20px;">
                <div style="font-size:40px; margin-bottom:10px;">🔌</div>
                <div style="font-weight:bold; color:var(--accent); font-size:16px;">Connection Required</div>
                <div style="font-size:12px; margin-top:10px; opacity:0.8; line-height:1.4;">Connect your free Pollinations account to bypass public limits!</div>
                <button onclick="document.getElementById('byop-btn').click()" style="margin-top:20px; background:var(--accent); color:#000; border:none; padding:10px 20px; border-radius:30px; font-weight:bold; cursor:pointer; font-size:13px;">🔗 Connect Now</button>
            </div>
        `;
    } else {
        let msg = 'Summoning Failed';
        let detail = e.message;
        if (e.message.includes('Pollen')) {
            msg = 'Pollen Depleted 🌸';
            detail = 'Hourly public quota reached.<br>Connect your own key to bypass.';
        }
        placeholder.innerHTML = `<div style="padding:20px;"><div style="font-size:40px; margin-bottom:10px;">⚠️</div><strong>${msg}</strong><br><small style="display:block; margin-top:8px; opacity:0.7;">${detail}</small></div>`;
    }
  } finally {
    setBusy(false);
  }
  return pSeed;
}
