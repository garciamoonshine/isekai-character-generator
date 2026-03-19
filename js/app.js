// ===== MAIN APP CONTROLLER =====
let currentSeed = null;
let currentPortraitSeed = null;

document.addEventListener('DOMContentLoaded', () => {
  const seeds = getShareSeed();
  if (seeds.charSeed !== null) {
    loadFromSeeds(seeds.charSeed, seeds.portraitSeed);
  }

  document.getElementById('generate-btn').addEventListener('click', () => {
    currentSeed = generateSeed();
    currentPortraitSeed = currentSeed;
    loadFromSeeds(currentSeed, currentPortraitSeed);
  });

  document.getElementById('reroll-portrait-btn').addEventListener('click', () => {
    if (!window.currentCharacter) return;
    currentPortraitSeed = generateSeed();
    loadPortrait(window.currentCharacter, currentPortraitSeed);
    updateURLAndShareBox();
  });

  document.getElementById('share-btn').addEventListener('click', () => {
    if (currentSeed !== null) copyShareUrl(currentSeed, currentPortraitSeed);
  });

  document.getElementById('publish-btn').addEventListener('click', async () => {
    if (!window.currentCharacter) return;
    const btn = document.getElementById('publish-btn');
    btn.disabled = true;
    btn.textContent = '⏳ Publishing...';
    
    // Build the exact prompt used for this portrait
    const fullPrompt = buildPortraitPrompt(window.currentCharacter);
    const success = await publishToGlobalGallery(window.currentCharacter, currentPortraitSeed, fullPrompt);
    
    if (success) {
        showToast('🌐 Character published globally!');
        btn.textContent = '✅ Published';
    } else {
        showToast('⚠️ Sync failed. Check KV bindings.');
        btn.disabled = false;
        btn.textContent = '🌐 Publish to Gallery';
    }
  });

  document.getElementById('export-btn').addEventListener('click', () => {
    if (!window.currentCharacter) return;
    const exportData = {
        character: window.currentCharacter,
        portraitSeed: currentPortraitSeed,
        prompt: buildPortraitPrompt(window.currentCharacter)
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${window.currentCharacter.name.replace(/\\s+/g, '_')}.json`;
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

async function publishToGlobalGallery(char, portraitSeed, fullPrompt) {
  const payload = {
    id: `${char.seed}_${portraitSeed}`,
    seed: char.seed,
    portraitSeed: portraitSeed,
    prompt: fullPrompt, // SAVING THE FULL PROMPT FOR CONSISTENCY
    name: char.name,
    title: char.title,
    race: char.race.name,
    cls: `${char.cls.icon} ${char.cls.name}`,
    traits: char.traits
  };

  try {
    const res = await fetch('/api/gallery', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return res.ok;
  } catch (e) {
    return false;
  }
}
