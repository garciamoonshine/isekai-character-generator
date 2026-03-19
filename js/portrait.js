// ===== AI PORTRAIT GENERATION =====
const POLLINATIONS_BASE = 'https://pollinations.ai/p/';

function buildPortraitPrompt(char) {
  return `anime fantasy RPG character portrait, ${char.race.name}, ${char.cls.name}, ` +
    `${char.hair} hair, ${char.eyes} eyes, ${char.build}, ${char.style}, ` +
    `${char.mark}, detailed face, cinematic lighting, high quality, ` +
    `white background, upper body shot, digital art`;
}

function getPortraitUrl(char, seed) {
  const prompt = buildPortraitPrompt(char);
  const encoded = encodeURIComponent(prompt);
  // Using the primary /p/ endpoint and explicitly setting model=flux
  // This matches the valid options list provided in the 400 error message.
  let url = `${POLLINATIONS_BASE}${encoded}?width=512&height=512&nologo=true&model=flux`;
  if (seed !== undefined) url += `&seed=${seed}`;
  return url;
}

async function fetchPortraitBlob(url, key) {
  const headers = {};
  if (key) headers['Authorization'] = `Bearer ${key}`;
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 60000); 
  
  try {
    const resp = await fetch(url, { headers, signal: controller.signal });
    clearTimeout(timeoutId);
    
    if (resp.status === 402 || resp.status === 429) throw new Error('QUOTA_EXHAUSTED');
    if (resp.status === 401 || resp.status === 403) throw new Error('AUTH_REJECTED');
    
    if (resp.status === 400) {
        const body = await resp.json().catch(() => ({}));
        throw new Error(body.message || 'VALIDATION_FAILED');
    }
    
    if (!resp.ok) throw new Error(`HTTP_${resp.status}`);
    
    const blob = await resp.blob();
    if (blob.size < 100) throw new Error('EMPTY_DATA');
    return URL.createObjectURL(blob);
  } catch (e) {
    if (e.name === 'AbortError') throw new Error('TIMEOUT');
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
    console.error('[Portrait] Error:', e.message);
    
    // RETRY LOGIC: If a key was used and it failed, try anonymous fallback once
    if (key && e.message !== 'QUOTA_EXHAUSTED') {
        try {
            const fallbackBlob = await fetchPortraitBlob(url, null);
            img.src = fallbackBlob;
            img.classList.remove('hidden');
            loading.classList.add('hidden');
            seedWrap.classList.remove('hidden');
            if (seedDisplay) seedDisplay.textContent = pSeed;
            setBusy(false);
            return pSeed;
        } catch (fError) { e = fError; }
    }

    loading.classList.add('hidden');
    placeholder.classList.remove('hidden');
    
    let title = 'Summoning Failed';
    let detail = e.message;
    let showConnect = false;

    if (!key) {
        title = (e.message === 'QUOTA_EXHAUSTED') ? 'Pollen Depleted 🌸' : 'Connection Required';
        detail = (e.message === 'QUOTA_EXHAUSTED') ? 'The public hourly quota is full.' : 'Connect your Pollinations account to manifest portraits!';
        showConnect = true;
    } else {
        if (e.message === 'AUTH_REJECTED') {
            title = 'Key Rejected';
            detail = 'Your API key is invalid or unauthorized.';
            showConnect = true;
        } else if (e.message === 'QUOTA_EXHAUSTED') {
            title = 'Credits Empty';
            detail = 'Your personal Pollen balance has run out.';
        } else {
            detail = e.message;
        }
    }

    if (showConnect) {
        placeholder.innerHTML = `
            <div style="padding:20px;">
                <div style="font-size:40px; margin-bottom:10px;">🔌</div>
                <div style="font-weight:bold; color:var(--accent); font-size:16px;">${title}</div>
                <div style="font-size:12px; margin-top:10px; opacity:0.8; line-height:1.4;">${detail}</div>
                <button onclick="document.getElementById('byop-btn').click()" style="margin-top:20px; background:var(--accent); color:#000; border:none; padding:10px 20px; border-radius:30px; font-weight:bold; cursor:pointer; font-size:13px;">🔗 Connect Now</button>
            </div>
        `;
    } else {
        placeholder.innerHTML = `<div style="padding:20px;"><div style="font-size:40px; margin-bottom:10px;">⚠️</div><strong>${title}</strong><br><small style="display:block; margin-top:8px; opacity:0.7;">${detail}</small></div>`;
    }
  } finally {
    setBusy(false);
  }
  return pSeed;
}
