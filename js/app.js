// ===== MAIN APP CONTROLLER (UX & R2 & COOLDOWN) =====
let currentSeed = null;
let currentPortraitSeed = null;
let isGenerating = false;
let globalGalleryCache = null;
let cooldownTimer = null;

document.addEventListener('DOMContentLoaded', async () => {
  const seeds = getShareSeed();
  if (seeds.charSeed !== null) loadFromSeeds(seeds.charSeed, seeds.portraitSeed);

  refreshGalleryCache();

  document.getElementById('generate-btn').addEventListener('click', () => {
    if (isGenerating || cooldownTimer) return;
    currentSeed = generateSeed();
    currentPortraitSeed = currentSeed;
    loadFromSeeds(currentSeed, currentPortraitSeed);
  });

  document.getElementById('reroll-portrait-btn').addEventListener('click', () => {
    if (isGenerating || cooldownTimer || !window.currentCharacter) return;
    currentPortraitSeed = generateSeed();
    loadPortrait(window.currentCharacter, currentPortraitSeed);
    updateURLAndShareBox();
  });

  document.getElementById('share-btn').addEventListener('click', () => {
    if (currentSeed !== null) copyShareUrl(currentSeed, currentPortraitSeed);
  });

  document.getElementById('publish-btn').addEventListener('click', async () => {
    if (isGenerating || !window.currentCharacter) return;
    
    const imgElement = document.getElementById('portrait-img');
    if (!imgElement || imgElement.classList.contains('hidden') || !imgElement.src || imgElement.src.includes('placeholder')) {
        showToast('⚠️ Generate a portrait before publishing!');
        return;
    }

    const btn = document.getElementById('publish-btn');
    btn.disabled = true;
    btn.textContent = '⏳ Freezing...';
    
    try {
        const imageRes = await fetch(imgElement.src);
        const imageBlob = await imageRes.blob();
        const res = await publishToGlobalGallery(window.currentCharacter, currentPortraitSeed, imageBlob);
        
        if (res.ok) {
            showToast('🌐 Published!');
            btn.textContent = '✅ Published';
            if (globalGalleryCache) globalGalleryCache.push(`${window.currentCharacter.seed}_${currentPortraitSeed}`);
        } else {
            showToast('⚠️ Publish failed.');
            btn.disabled = false;
            btn.textContent = '🌐 Publish to Gallery';
        }
    } catch (e) {
        showToast('⚠️ Error.');
        btn.disabled = false;
    }
  });

  document.getElementById('export-btn').addEventListener('click', () => {
    if (!window.currentCharacter) return;
    const exportData = { character: window.currentCharacter, portraitSeed: currentPortraitSeed };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
    a.download = `${window.currentCharacter.name.replace(/\\s+/g, '_')}.json`; a.click();
  });
});

async function refreshGalleryCache() {
    try {
        const res = await fetch('/api/gallery');
        const data = await res.json();
        globalGalleryCache = data.map(c => c.id || `${c.seed}_${c.portraitSeed}`);
        checkCurrentPublishStatus();
    } catch(e) {}
}

function checkCurrentPublishStatus() {
    if (!globalGalleryCache || !window.currentCharacter) return;
    const currentId = `${window.currentCharacter.seed}_${currentPortraitSeed}`;
    const btn = document.getElementById('publish-btn');
    if (globalGalleryCache.includes(currentId)) {
        btn.disabled = true;
        btn.textContent = '✅ Published';
    } else if (!isGenerating) { // NO LONGER CHECKS COOLDOWN
        btn.disabled = false;
        btn.textContent = '🌐 Publish to Gallery';
    }
}

function startCooldown() {
    let seconds = 10;
    const genBtn = document.getElementById('generate-btn');
    const rerollBtn = document.getElementById('reroll-portrait-btn');
    
    cooldownTimer = setInterval(() => {
        seconds--;
        if (seconds <= 0) {
            clearInterval(cooldownTimer);
            cooldownTimer = null;
            genBtn.textContent = '🎲 Roll New Character';
            // Only re-enable if not currently generating
            if (!isGenerating) {
                genBtn.disabled = false;
                rerollBtn.disabled = false;
            }
        } else {
            genBtn.textContent = `⏳ Cool-down (${seconds}s)`;
            genBtn.disabled = true;
            rerollBtn.disabled = true;
        }
    }, 1000);
}

function setBusy(busy) {
    isGenerating = busy;
    // Generate and Reroll buttons are locked if busy OR cooldown is active
    document.getElementById('generate-btn').disabled = (busy || !!cooldownTimer);
    document.getElementById('reroll-portrait-btn').disabled = (busy || !!cooldownTimer);
    
    // Publish button is ONLY locked if busy (generating), NOT during cooldown
    document.getElementById('publish-btn').disabled = busy;

    if (!busy) checkCurrentPublishStatus();
}

async function loadFromSeeds(charSeed, portraitSeed) {
  currentSeed = charSeed;
  currentPortraitSeed = (portraitSeed !== null) ? portraitSeed : charSeed;
  const char = generateCharacter(currentSeed);
  renderCharacter(char);
  
  const hash = window.location.hash;
  if (hash.includes('r2=')) {
      const parts = hash.split('r2=')[1].split('&')[0];
      const img = document.getElementById('portrait-img');
      img.src = `/api/portrait/${parts}`;
      img.classList.remove('hidden');
      document.getElementById('portrait-placeholder').classList.add('hidden');
      document.getElementById('portrait-loading').classList.add('hidden');
      document.getElementById('portrait-seed').classList.remove('hidden');
      document.getElementById('seed-display').textContent = currentPortraitSeed;
      setBusy(false);
  } else {
      const result = await loadPortrait(char, currentPortraitSeed);
      if (result) startCooldown(); 
  }
  updateURLAndShareBox();
}

function updateURLAndShareBox() {
    const url = buildShareUrl(currentSeed, currentPortraitSeed);
    window.history.replaceState(null, null, url);
    const box = document.getElementById('share-url-box');
    if (box) box.textContent = url;
}

async function loadPortrait(char, portraitSeed) {
  setBusy(true);
  const img = document.getElementById('portrait-img');
  const placeholder = document.getElementById('portrait-placeholder');
  const loading = document.getElementById('portrait-loading');
  const seedWrap = document.getElementById('portrait-seed');
  const seedDisplay = document.getElementById('seed-display');

  img.classList.add('hidden'); placeholder.classList.add('hidden'); loading.classList.remove('hidden');

  const pSeed = (portraitSeed !== undefined) ? portraitSeed : char.seed;
  const url = getPortraitUrl(char, pSeed);
  try {
    const blobUrl = await fetchPortraitBlob(url, window.pollinationsKey);
    img.src = blobUrl;
    img.classList.remove('hidden'); loading.classList.add('hidden');
    seedWrap.classList.remove('hidden');
    if (seedDisplay) seedDisplay.textContent = pSeed;
    setBusy(false);
    return true; 
  } catch (e) {
    loading.classList.add('hidden'); placeholder.classList.remove('hidden');
    placeholder.innerHTML = `⚠️<br><strong>Failed</strong><br><small>${e.message}</small>`;
    setBusy(false);
    return false;
  }
}

async function publishToGlobalGallery(char, portraitSeed, imageBlob) {
  const metadata = {
    id: `${char.seed}_${portraitSeed}`, seed: char.seed, portraitSeed: portraitSeed,
    name: char.name, title: char.title, race: char.race.name,
    cls: `${char.cls.icon} ${char.cls.name}`, traits: char.traits,
    prompt: buildPortraitPrompt(char)
  };
  const formData = new FormData();
  formData.append('metadata', JSON.stringify(metadata));
  formData.append('image', imageBlob, 'portrait.png');
  return fetch('/api/gallery', { method: 'POST', body: formData });
}
