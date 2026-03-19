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
  let url = `${POLLINATIONS_BASE}${encoded}?width=512&height=512&nologo=true&model=${PORTRAIT_MODEL}`;
  if (seed !== undefined) url += `&seed=${seed}`;
  return url;
}

// Fixed fetcher: removes the broken "?key=sk_..." logic that caused Fallback HTTP 400
async function fetchPortraitBlob(url, key) {
  const headers = {};
  if (key) {
      headers['Authorization'] = `Bearer ${key}`;
  }
  
  try {
    const resp = await fetch(url, { headers });
    
    // Explicitly handle failures
    if (resp.status === 402 || resp.status === 429) throw new Error('Pollen Depleted');
    
    if (!resp.ok) {
        // If we tried with a key and failed, try one final ANONYMOUS attempt
        if (key) {
            console.warn('[Portrait] Authenticated fetch failed, attempting anonymous fallback...');
            const anonResp = await fetch(url);
            if (anonResp.ok) {
                const blob = await anonResp.blob();
                return URL.createObjectURL(blob);
            }
            throw new Error(`Fallback HTTP ${anonResp.status}`);
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
                <div style="font-size:12px; margin-top:10px; opacity:0.8; line-height:1.4;">Connect your free Pollinations account to manifest this hero's portrait!</div>
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
