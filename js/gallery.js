// ===== GALLERY PAGE =====
document.addEventListener('DOMContentLoaded', () => {
  const grid = document.getElementById('gallery-grid');
  const empty = document.getElementById('gallery-empty');
  const gallery = JSON.parse(localStorage.getItem('isekai_gallery') || '[]');

  if (gallery.length === 0) {
    empty.classList.remove('hidden');
    return;
  }

  gallery.forEach(char => {
    const card = document.createElement('div');
    card.className = 'gallery-card';
    card.innerHTML = `
      <img src="${char.portraitUrl || ''}" alt="${char.name}" onerror="this.style.display='none'">
      <div class="gc-name">${char.name}</div>
      <div class="gc-class">${char.cls}</div>
      <div class="gc-traits">${char.traits.slice(0,2).join(' · ')}</div>
    `;
    card.addEventListener('click', () => {
      window.location.href = `index.html#seed=${char.seed}`;
    });
    grid.appendChild(card);
  });
});
