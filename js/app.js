// ===== MAIN APP CONTROLLER (UX & R2 & DUP-BLOCK) =====
let currentSeed = null;
let currentPortraitSeed = null;
let isGenerating = false;
let globalGalleryCache = null;

document.addEventListener('DOMContentLoaded', async () => {
  const seeds = getShareSeed();
  if (seeds.charSeed !== null) loadFromSeeds(seeds.charSeed, seeds.portraitSeed);

  // Pre-fetch gallery index to handle client-side button states
  refreshGalleryCache();

  document.getElementById('generate-btn').addEventListener('click', () => {
    if (isGenerating) return;
    currentSeed = generateSeed();
    currentPortraitSeed = currentSeed;
    loadFromSeeds(currentSeed, currentPortraitSeed);
  });

  document.getElementById('reroll-portrait-btn').addEventListener('click', () => {
    if (isGenerating || !window.currentCharacter) return;
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
    btn.textContent = '⏳ Publishing...';
    
    try {
        const imageRes = await fetch(imgElement.src);
        const imageBlob = await imageRes.blob();
        
        const res = await publishToGlobalGallery(window.currentCharacter, currentPortraitSeed, imageBlob);
        
        if (res.ok) {
            showToast('🌐 Published to the Multiverse!');
            btn.textContent = '✅ Published';
            // Update local cache
            if (globalGalleryCache) globalGalleryCache.push(`${window.currentCharacter.seed}_${currentPortraitSeed}`);
        } else if (res.status === 409) {
            showToast('✨ This hero is already in the Gallery!');
            btn.textContent = '✅ Already Published';
        } else {
            showToast('⚠️ Publish failed.');
            btn.disabled = false;
            btn.textContent = '🌐 Publish to Gallery';
        }
    } catch (e) {
        showToast('⚠️ Processing error.');
        btn.disabled = false;
    }
  });

  document.getElementById('export-btn').addEventListener('click', () => {
    if (!window.currentCharacter) return;
    const exportData = { character: window.currentCharacter, portraitSeed: currentPortraitSeed };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${window.currentCharacter.name.replace(/\\s+/g, '_')}.json`;
    a.click();
  });
});

async function refreshGalleryCache() {
    try {
        const res = await fetch('/api/gallery');
        const data = await res.json();
        globalGalleryCache = data.map(c => c.id || `${c.seed}_${c.portraitSeed}`);
        checkCurrentPublishStatus();
    } catch(e) { console.warn('Cache refresh failed'); }
}

function checkCurrentPublishStatus() {
    if (!globalGalleryCache || !window.currentCharacter) return;
    const currentId = `${window.currentCharacter.seed}_${currentPortraitSeed}`;
    const btn = document.getElementById('publish-btn');
    if (globalGalleryCache.includes(currentId)) {
        btn.disabled = true;
        btn.textContent = '✅ Published';
    } else {
        btn.disabled = false;
        btn.textContent = '🌐 Publish to Gallery';
    }
}

function setBusy(busy) {
    isGenerating = busy;
    const btns = ['generate-btn', 'reroll-portrait-btn', 'publish-btn'];
    btns.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.disabled = busy;
    });
    if (!busy) checkCurrentPublishStatus();
}

async function loadFromSeeds(charSeed, portraitSeed) {
  currentSeed = charSeed;
  currentPortraitSeed = (portraitSeed !== null) ? portraitSeed : charSeed;
  const char = generateCharacter(currentSeed);
  renderCharacter(char);
  
  const hash = window.location.hash;
  const r2Match = hash.match(/r2=([^&]+)/);
  
  if (r2Match) {
      const img = document.getElementById('portrait-img');
      img.src = `/api/portrait/${r2Match[1]}`;
      img.classList.remove('hidden');
      document.getElementById('portrait-placeholder').classList.add('hidden');
      document.getElementById('portrait-loading').classList.add('hidden');
      document.getElementById('portrait-seed').classList.remove('hidden');
      document.getElementById('seed-display').textContent = currentPortraitSeed;
      setBusy(false);
  } else {
      await loadPortrait(char, currentPortraitSeed);
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
  } catch (e) {
    loading.classList.add('hidden'); placeholder.classList.remove('hidden');
    placeholder.innerHTML = `⚠️<br><strong>Failed</strong><br><small>${e.message}</small>`;
  } finally { 
      setBusy(false); 
  }
  return pSeed;
}

async function publishToGlobalGallery(char, portraitSeed, imageBlob) {
  const metadata = {
    id: `${char.seed}_${portraitSeed}`,
    seed: char.seed,
    portraitSeed: portraitSeed,
    name: char.name,
    title: char.title,
    race: char.race.name,
    cls: `${char.cls.icon} ${char.cls.name}`,
    traits: char.traits,
    prompt: buildPortraitPrompt(char)
  };
  const formData = new FormData();
  formData.append('metadata', JSON.stringify(metadata));
  formData.append('image', imageBlob, 'portrait.png');
  return fetch('/api/gallery', { method: 'POST', body: formData });
}
