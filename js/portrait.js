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
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); 
    const resp = await fetch(url, { headers, signal: controller.signal });
    clearTimeout(timeoutId);
    
    // 1. Quota Errors
    if (resp.status === 402 || resp.status === 429) {
        throw new Error('QUOTA_EXHAUSTED');
    }
    
    // 2. Auth Errors (401/403)
    if (resp.status === 401 || resp.status === 403) {
        if (key) throw new Error('INVALID_KEY');
        throw new Error('VISITOR_REJECTED');
    }

    // 3. User Errors (400)
    if (resp.status === 400) {
        const body = await resp.json().catch(() => ({}));
        throw new Error(body.error?.message || 'BAD_REQUEST');
    }
    
    if (!resp.ok) throw new Error(`HTTP_${resp.status}`);
    
    const blob = await resp.blob();
    if (blob.size < 100) throw new Error('EMPTY_DATA');
    return URL.createObjectURL(blob);
  } catch (e) {
    if (e.name === 'AbortError') throw new Error('TIMEOUT');
    
    // Fallback: If we had a key and it failed (but not a quota issue), try anonymous automatically
    if (key && !['QUOTA_EXHAUSTED', 'BAD_REQUEST'].includes(e.message)) {
        console.warn('[Portrait] Key failed, trying anonymous fallback...');
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
    console.error('[Portrait] Error:', e.message);
    loading.classList.add('hidden');
    placeholder.classList.remove('hidden');
    
    let title = 'Summoning Failed';
    let detail = e.message;
    let showConnect = false;

    // SCENARIO: VISITOR (No Key)
    if (!key) {
        if (['VISITOR_REJECTED', 'BAD_REQUEST', 'HTTP_400', 'HTTP_401'].some(m => e.message.includes(m))) {
            title = 'Connection Required';
            detail = 'Connect your free Pollinations account to manifest this hero!';
            showConnect = true;
        } else if (e.message === 'QUOTA_EXHAUSTED') {
            title = 'Pollen Depleted 🌸';
            detail = 'The public hourly quota is full. Connect your own key to bypass!';
            showConnect = true;
        }
    } 
    // SCENARIO: CONNECTED (Has Key)
    else {
        if (e.message === 'INVALID_KEY') {
            title = 'Key Invalid';
            detail = 'Your API key was rejected. Please reconnect.';
            showConnect = true;
        } else if (e.message === 'QUOTA_EXHAUSTED') {
            title = 'Credits Empty';
            detail = 'Your Pollen account has run out of credits.';
        }
    }

    if (showConnect) {
        placeholder.innerHTML = `
            <div style="padding:20px;">
                <div style="font-size:40px; margin-bottom:10px;">🔌</div>
                <div style="font-weight:bold; color:var(--accent); font-size:16px;">${title}</div>
                <div style="font-size:12px; margin-top:10px; opacity:0.8; line-height:1.4;">${detail}</div>
                <button onclick="document.getElementById('byop-btn').click()" style="margin-top:20px; background:var(--accent); color:#000; border:none; padding:10px 20px; border-radius:30px; font-weight:bold; cursor:pointer; font-size:13px; box-shadow:0 4px 15px rgba(192,132,252,0.3);">🔗 Connect with Pollinations</button>
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
