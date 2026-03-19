// ===== MAIN APP CONTROLLER =====
let currentSeed = null;
let currentPortraitSeed = null;

document.addEventListener('DOMContentLoaded', () => {
  // Check for shared seeds in URL
  const seeds = getShareSeed();
  if (seeds.charSeed !== null) {
    loadFromSeeds(seeds.charSeed, seeds.portraitSeed);
  }

  // Generate button
  document.getElementById('generate-btn').addEventListener('click', () => {
    currentSeed = generateSeed();
    currentPortraitSeed = currentSeed; // Default same seed
    loadFromSeeds(currentSeed, currentPortraitSeed);
  });

  // Reroll portrait
  document.getElementById('reroll-portrait-btn').addEventListener('click', () => {
    if (!window.currentCharacter) return;
    currentPortraitSeed = generateSeed();
    loadPortrait(window.currentCharacter, currentPortraitSeed);
    updateURLAndShareBox();
  });

  // Share button
  document.getElementById('share-btn').addEventListener('click', () => {
    if (currentSeed !== null) copyShareUrl(currentSeed, currentPortraitSeed);
  });

  // Publish to gallery
  document.getElementById('publish-btn').addEventListener('click', () => {
    if (!window.currentCharacter) return;
    publishToGallery(window.currentCharacter, currentPortraitSeed);
    showToast('🌐 Published to gallery!');
  });

  // Export JSON
  document.getElementById('export-btn').addEventListener('click', () => {
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
  // Identify by combined seeds to allow multiple portraits of same roll
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
