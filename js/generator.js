// ===== CHARACTER GENERATION ENGINE =====
function generateCharacter(seed) {
  const rng = makeRNG(seed);

  const race = rng.pick(RACES);
  const cls = rng.pick(CLASSES);
  const skill = rng.pick(SKILLS);
  const traits = rng.pickN(TRAITS, 3);
  const item = rng.pick(ITEMS);
  const hiddenStat = rng.pick(HIDDEN_STATS);
  const alignment = rng.pick(ALIGNMENTS);
  const origin = rng.pick(WORLDS);
  const isekaiMethod = rng.pick(ISEKAI_METHODS);
  const goal = rng.pick(GOALS);

  // Stats — base 10-60, bonus +20 to race's stat
  const statNames = ['STR', 'INT', 'AGI', 'DEF', 'LUK', 'CHA'];
  const stats = {};
  statNames.forEach(s => { stats[s] = rng.range(10, 60); });
  stats[race.bonus] = Math.min(99, stats[race.bonus] + 20);

  const hair = rng.pick(HAIR_COLORS);
  const eyes = rng.pick(EYE_COLORS);
  const build = rng.pick(BUILDS);
  const mark = rng.pick(MARKS);
  const style = rng.pick(STYLES);

  // Generate name
  const prefixes = ['Aria','Lyra','Zael','Kira','Vael','Sora','Nyx','Aiden','Ren','Sera','Kai','Mira','Dusk','Ash','Zephyr','Luna'];
  const suffixes = ['von Darkhollow','the Undying','Shadowbane','Lightweaver','of the Void','Starfall','Ironheart','Dawnbreaker','the Forgotten','of Eternity'];
  const firstName = rng.pick(prefixes);
  const lastName = rng.pick(suffixes);
  const name = `${firstName} ${lastName}`;
  const title = `The ${rng.pick(['Legendary','Overpowered','Cursed','Blessed','Forgotten','Exiled','Reborn','Awakened'])} ${cls.name}`;

  // Backstory
  const backstory = `Originally from ${origin}, ${firstName} was ${isekaiMethod.toLowerCase()} and found themselves in this fantasy world with no memory of how to return. Identified as a ${race.name} ${cls.name} by the local guild, they quickly rose to infamy after their unique skill ${skill.name} was discovered.`;

  return { seed, name, title, race, cls, skill, traits, stats, hair, eyes, build, mark, style, item, hiddenStat, alignment, origin, isekaiMethod, goal, backstory };
}

window.currentCharacter = null;

function renderCharacter(char) {
  window.currentCharacter = char;

  document.getElementById('char-name').textContent = char.name;
  document.getElementById('char-title').textContent = char.title;

  document.getElementById('f-race').textContent = `${char.race.name} — ${char.race.desc}`;
  document.getElementById('f-class').textContent = `${char.cls.icon} ${char.cls.name}`;
  document.getElementById('f-origin').textContent = char.origin;
  document.getElementById('f-isekai').textContent = char.isekaiMethod;

  document.getElementById('s-str').textContent = char.stats.STR;
  document.getElementById('s-int').textContent = char.stats.INT;
  document.getElementById('s-agi').textContent = char.stats.AGI;
  document.getElementById('s-def').textContent = char.stats.DEF;
  document.getElementById('s-luk').textContent = char.stats.LUK;
  document.getElementById('s-cha').textContent = char.stats.CHA;

  document.getElementById('skill-name').textContent = char.skill.name;
  document.getElementById('skill-desc').textContent = char.skill.desc;

  document.getElementById('f-hair').textContent = char.hair;
  document.getElementById('f-eyes').textContent = char.eyes;
  document.getElementById('f-build').textContent = char.build;
  document.getElementById('f-mark').textContent = char.mark;
  document.getElementById('f-style').textContent = char.style;

  const traitsWrap = document.getElementById('traits-wrap');
  traitsWrap.innerHTML = char.traits.map(t => `<span class="trait-tag">${t}</span>`).join('');
  document.getElementById('f-alignment').textContent = char.alignment;

  document.getElementById('item-name').textContent = char.item.name;
  document.getElementById('item-desc').textContent = char.item.desc;

  document.getElementById('backstory-text').textContent = char.backstory;
  document.getElementById('goal-text').textContent = char.goal;

  document.getElementById('hidden-stat-name').textContent = '???';
  document.getElementById('hidden-stat-val').textContent = '??';

  document.getElementById('character-sheet').classList.remove('hidden');

  // Enable buttons
  ['reroll-portrait-btn','share-btn','publish-btn','export-btn'].forEach(id => {
    document.getElementById(id).disabled = false;
  });

  // Update share URL display
  const shareUrl = buildShareUrl(char.seed);
  document.getElementById('share-url-box').textContent = shareUrl;
}
