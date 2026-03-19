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

// Global reference to the current error message for display
let lastErrorDetail = null;

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
    
    if (resp.status === 402 || resp.status === 429) {
        lastErrorDetail = 'Pollen Depleted';
        throw new Error('Pollen Depleted');
    }
    
    if (resp.status === 400) {
        if (!key) {
            lastErrorDetail = 'Unconnected';
            throw new Error('Unconnected');
        } else {
            const errText = await resp.text();
            lastErrorDetail = `Bad Request: ${errText.substring(0, 50)}`;
            throw new Error(lastErrorDetail);
        }
    }
    
    if (!resp.ok) {
        lastErrorDetail = `HTTP ${resp.status}`;
        throw new Error(lastErrorDetail);
    }
    
    const blob = await resp.blob();
    if (blob.size < 100) throw new Error('Empty Image Data');
    return URL.createObjectURL(blob);
  } catch (e) {
    if (e.name === 'AbortError') {
        lastErrorDetail = 'Request Timed Out';
        throw new Error('Request Timed Out');
    }
    if (key && !e.message.includes('Pollen') && !e.message.includes('Bad')) {
        console.warn('[Portrait] Auth failed, trying public fallback...');
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
  loading.textContent = '⏳ Manifesting...';

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
    console.error('[Portrait] Error Caught:', e);
    loading.classList.add('hidden');
    placeholder.classList.remove('hidden');
    
    // VISITOR SCENARIO
    if (e.message === 'Unconnected' || (!key && e.message.includes('400')) || (!key && e.message.includes('Bad'))) {
        placeholder.innerHTML = `
            <div style="padding:20px;">
                <div style="font-size:40px; margin-bottom:10px;">🔌</div>
                <div style="font-weight:bold; color:var(--accent); font-size:16px;">Connection Required</div>
                <div style="font-size:12px; margin-top:10px; opacity:0.8; line-height:1.4;">Connect your free Pollinations account to manifested this hero's portrait!</div>
                <button onclick="document.getElementById('byop-btn').click()" style="margin-top:20px; background:var(--accent); color:#000; border:none; padding:10px 20px; border-radius:30px; font-weight:bold; cursor:pointer; font-size:13px; box-shadow:0 4px 15px rgba(192,132,252,0.3);">🔗 Connect with Pollinations</button>
            </div>
        `;
    } 
    // ERROR SCENARIO (Connected or Quota)
    else {
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
