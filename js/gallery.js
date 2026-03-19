// ===== GLOBAL GALLERY CONTROLLER =====
document.addEventListener('DOMContentLoaded', async () => {
  const grid = document.getElementById('gallery-grid');
  const empty = document.getElementById('gallery-empty');
  const loader = document.createElement('div');
  loader.id = 'gallery-loader';
  loader.innerHTML = '🔮 Summoning Heroes from the Multiverse...';
  loader.style.textAlign = 'center';
  loader.style.gridColumn = '1/-1';
  loader.style.padding = '100px 20px';
  loader.style.color = 'var(--muted)';
  grid.appendChild(loader);

  try {
    const res = await fetch('/api/gallery');
    if (!res.ok) throw new Error('API Offline');
    const gallery = await res.json();
    loader.remove();

    if (!gallery || gallery.length === 0) {
      empty.classList.remove('hidden');
      return;
    }

    gallery.forEach(char => {
      const card = document.createElement('div');
      card.className = 'gallery-card';
      
      let link = `index.html#seed=${char.seed}`;
      if (char.portraitSeed && char.portraitSeed !== char.seed) {
          link += `&pseed=${char.portraitSeed}`;
      }

      // Reconstruct the exact URL using the STORED PROMPT
      // Fallback to basic prompt if older entry has no prompt field
      const prompt = char.prompt || `anime fantasy RPG character portrait, ${char.race}, ${char.cls}, detailed face, digital art`;
      const liveUrl = `https://gen.pollinations.ai/image/${encodeURIComponent(prompt)}?width=300&height=533&nologo=true&model=zimage&seed=${char.portraitSeed || char.seed}`;

      card.innerHTML = `
        <div class="gc-portrait-wrap" style="aspect-ratio:9/16; background:var(--bg3); border-radius:10px; overflow:hidden; margin-bottom:12px;">
            <img src="${liveUrl}" alt="${char.name}" loading="lazy" style="width:100%; height:100%; object-fit:cover;">
        </div>
        <div class="gc-name">${char.name}</div>
        <div class="gc-class">${char.cls}</div>
        <div class="gc-traits">${char.traits ? char.traits.slice(0,2).join(' · ') : ''}</div>
      `;
      card.addEventListener('click', () => {
        window.location.href = link;
      });
      grid.appendChild(card);
    });
  } catch (e) {
    loader.innerHTML = '⚠️ The Multiverse connection is unstable.<br><small>Please verify Cloudflare KV bindings.</small>';
    console.error('[Gallery] API Error:', e);
  }
});
