// ===== MAIN APP CONTROLLER (UX & R2 STORAGE SYNC) =====
let currentSeed = null;
let currentPortraitSeed = null;
let isGenerating = false;

document.addEventListener('DOMContentLoaded', () => {
  const seeds = getShareSeed();
  if (seeds.charSeed !== null) {
      loadFromSeeds(seeds.charSeed, seeds.portraitSeed);
  }

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
    btn.textContent = '⏳ Freezing in R2...';
    
    try {
        const imageRes = await fetch(imgElement.src);
        const imageBlob = await imageRes.blob();
        const success = await publishToGlobalGallery(window.currentCharacter, currentPortraitSeed, imageBlob);
        
        if (success) {
            showToast('❄️ Image frozen in R2 & Published!');
            btn.textContent = '✅ Published';
        } else {
            showToast('⚠️ Sync failed.');
            btn.disabled = false;
            btn.textContent = '🌐 Publish to Gallery';
        }
    } catch (e) {
        showToast('⚠️ Could not process image.');
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

function setBusy(busy) {
    isGenerating = busy;
    const btns = ['generate-btn', 'reroll-portrait-btn', 'publish-btn'];
    btns.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.disabled = busy;
    });
}

async function loadFromSeeds(charSeed, portraitSeed) {
  currentSeed = charSeed;
  currentPortraitSeed = (portraitSeed !== null) ? portraitSeed : charSeed;
  
  const char = generateCharacter(currentSeed);
  renderCharacter(char);
  
  // Check if we arrived from a link that is an R2 file
  const hash = window.location.hash;
  const r2Match = hash.match(/r2=([^&]+)/);
  
  if (r2Match) {
      // IF VISITOR CLICKED FROM R2 GALLERY: Load the frozen R2 image instead of re-rolling
      const img = document.getElementById('portrait-img');
      img.src = `/api/portrait/${r2Match[1]}`;
      img.classList.remove('hidden');
      document.getElementById('portrait-placeholder').classList.add('hidden');
      document.getElementById('portrait-loading').classList.add('hidden');
      document.getElementById('portrait-seed').classList.remove('hidden');
      document.getElementById('seed-display').textContent = currentPortraitSeed;
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

// Updated loadPortrait with Busy State
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
    loading.classList.add('hidden');
    placeholder.classList.remove('hidden');
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
    traits: char.traits
  };
  const formData = new FormData();
  formData.append('metadata', JSON.stringify(metadata));
  formData.append('image', imageBlob, 'portrait.png');
  try {
    const res = await fetch('/api/gallery', { method: 'POST', body: formData });
    return res.ok;
  } catch (e) { return false; }
}
