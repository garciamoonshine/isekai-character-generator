// ===== MAIN APP CONTROLLER =====
let currentSeed = null;
let currentPortraitSeed = null;

document.addEventListener('DOMContentLoaded', () => {
  console.log('[App] Loaded');
  
  // Check for shared seeds in URL
  const seeds = getShareSeed();
  if (seeds.charSeed !== null) {
    console.log('[App] Loading from shared seeds:', seeds);
    loadFromSeeds(seeds.charSeed, seeds.portraitSeed);
  }

  // Generate button
  const genBtn = document.getElementById('generate-btn');
  if (genBtn) {
      genBtn.addEventListener('click', () => {
        console.log('[App] Rolling new character...');
        currentSeed = generateSeed();
        currentPortraitSeed = currentSeed; // Default same seed
        loadFromSeeds(currentSeed, currentPortraitSeed);
      });
  }

  // Reroll portrait
  const rerollBtn = document.getElementById('reroll-portrait-btn');
  if (rerollBtn) {
      rerollBtn.addEventListener('click', () => {
        if (!window.currentCharacter) return;
        console.log('[App] Rerolling portrait...');
        currentPortraitSeed = generateSeed();
        loadPortrait(window.currentCharacter, currentPortraitSeed);
        updateURLAndShareBox();
      });
  }

  // Share button
  const shareBtn = document.getElementById('share-btn');
  if (shareBtn) {
      shareBtn.addEventListener('click', () => {
        if (currentSeed !== null) copyShareUrl(currentSeed, currentPortraitSeed);
      });
  }

  // Publish to gallery
  const pubBtn = document.getElementById('publish-btn');
  if (pubBtn) {
      pubBtn.addEventListener('click', () => {
        if (!window.currentCharacter) return;
        publishToGallery(window.currentCharacter, currentPortraitSeed);
        showToast('🌐 Published to gallery!');
      });
  }

  // Export JSON
  const expBtn = document.getElementById('export-btn');
  if (expBtn) {
      expBtn.addEventListener('click', () => {
        if (!window.currentCharacter) return;
        const exportData = {
            character: window.currentCharacter,
            portraitSeed: currentPortraitSeed
        };
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `${window.currentCharacter.name.replace(/\s+/g, '_')}.json`;
        a.click();
      });
  }
});

function loadFromSeeds(charSeed, portraitSeed) {
  currentSeed = charSeed;
  currentPortraitSeed = (portraitSeed !== null) ? portraitSeed : charSeed;
  const char = generateCharacter(currentSeed);
  renderCharacter(char);
  loadPortrait(char, currentPortraitSeed);
  updateURLAndShareBox();
}

function updateURLAndShareBox() {
    const url = buildShareUrl(currentSeed, currentPortraitSeed);
    window.history.replaceState(null, null, url);
    const box = document.getElementById('share-url-box');
    if (box) box.textContent = url;
}

function publishToGallery(char, portraitSeed) {
  const gallery = JSON.parse(localStorage.getItem('isekai_gallery') || '[]');
  const uniqueId = `${char.seed}_${portraitSeed}`;
  const exists = gallery.find(c => c.id === uniqueId);
  
  if (!exists) {
    gallery.unshift({
      id: uniqueId,
      seed: char.seed,
      portraitSeed: portraitSeed,
      name: char.name,
      title: char.title,
      race: char.race.name,
      cls: `${char.cls.icon} ${char.cls.name}`,
      traits: char.traits,
      portraitUrl: document.getElementById('portrait-img').src || ''
    });
    localStorage.setItem('isekai_gallery', JSON.stringify(gallery.slice(0, 50)));
  }
}
