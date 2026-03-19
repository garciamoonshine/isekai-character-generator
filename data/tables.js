// ===== ISEKAI DATA TABLES =====
const RACES = [
  { name: 'Human', bonus: 'CHA', desc: 'Adaptable and driven by potential' },
  { name: 'High Elf', bonus: 'INT', desc: 'Ancient wisdom, gifted with magic' },
  { name: 'Dark Elf', bonus: 'AGI', desc: 'Swift shadows, masters of deception' },
  { name: 'Demon', bonus: 'STR', desc: 'Raw power and chaotic energy' },
  { name: 'Dragon-kin', bonus: 'DEF', desc: 'Scales of iron, breath of fire' },
  { name: 'Undead', bonus: 'INT', desc: 'Cursed immortality with forbidden knowledge' },
  { name: 'Beastman', bonus: 'STR', desc: 'Primal instincts and pack loyalty' },
  { name: 'Celestial', bonus: 'LUK', desc: 'Blessed by higher powers, fate-touched' },
  { name: 'Goblin', bonus: 'AGI', desc: 'Cunning survivor, underestimated always' },
  { name: 'Dwarf', bonus: 'DEF', desc: 'Stubborn as stone, forged in fire' },
  { name: 'Kitsune', bonus: 'CHA', desc: 'Fox spirit, master of illusion and charm' },
  { name: 'Vampire', bonus: 'CHA', desc: 'Eternal predator, magnetic and deadly' },
];

const CLASSES = [
  { name: 'Swordmaster', icon: '⚔️', desc: 'Unrivaled blade technique' },
  { name: 'Archmage', icon: '🔮', desc: 'Commands the forces of reality' },
  { name: 'Shadow Assassin', icon: '🗡️', desc: 'Kills before being seen' },
  { name: 'Holy Paladin', icon: '🛡️', desc: 'Faith made manifest as power' },
  { name: 'Alchemist', icon: '⚗️', desc: 'Transforms the world through science and magic' },
  { name: 'Summoner', icon: '📿', desc: 'Commands armies of bound spirits' },
  { name: 'Merchant Prince', icon: '💰', desc: 'Economy is just another battlefield' },
  { name: 'Dragon Tamer', icon: '🐉', desc: 'Speaks the language of beasts' },
  { name: 'Healer', icon: '💊', desc: 'Life and death are just two sides of the same coin' },
  { name: 'Berserker', icon: '🪓', desc: 'Pain is power, rage is clarity' },
  { name: 'Necromancer', icon: '💀', desc: 'Death is just another resource' },
  { name: 'Chef Hero', icon: '🍳', desc: 'Food is the ultimate magic' },
  { name: 'Blacksmith', icon: '🔨', desc: 'Forges destiny from raw ore' },
  { name: 'Ranger', icon: '🏹', desc: 'Nature itself is an ally' },
  { name: 'Bard', icon: '🎵', desc: 'Words and music bend reality' },
];

const SKILLS = [
  { name: '「Infinite Inventory」', desc: 'Can store unlimited items in a pocket dimension with zero weight.' },
  { name: '「Death Counter」', desc: 'Resets to the moment before death up to 3 times per day.' },
  { name: '「Skill Copy」', desc: 'Can permanently copy any skill observed once.' },
  { name: '「Voice of Heaven」', desc: 'Every spoken command is treated as divine law by those who hear it.' },
  { name: '「Void Step」', desc: 'Can teleport to any location ever visited, instantaneously.' },
  { name: '「Appraisal God」', desc: 'Sees the full stats, history and weaknesses of any entity.' },
  { name: '「Time Dilation」', desc: 'Can slow personal time perception to 1/100th speed for 60 seconds/day.' },
  { name: '「Overpowered Growth」', desc: 'EXP gain is multiplied 100× compared to normal beings.' },
  { name: '「Poison Master」', desc: 'All poisons are ineffective; can create any toxin from memory.' },
  { name: '「Monster Tamer」', desc: 'Any creature below legendary rank can be tamed with eye contact.' },
  { name: '「Lucky Star」', desc: 'Probability of positive outcomes is always nudged in your favour.' },
  { name: '「Soul Bind」', desc: 'Can form an unbreakable contract with any being, enforced by the world itself.' },
  { name: '「Language of All」', desc: 'Understands and speaks every language, including ancient and divine.' },
  { name: '「Shadow Army」', desc: 'Can raise fallen enemies as loyal shadow soldiers.' },
  { name: '「Crafting God」', desc: 'Can craft any item with any material, quality is always maximum.' },
  { name: '「Charm Aura」', desc: 'Passive aura causes all NPCs to start at Friendly disposition.' },
];

const HAIR_COLORS = ['Silver', 'Platinum Blonde', 'Jet Black', 'Cherry Red', 'Ocean Blue', 'Emerald Green', 'Lavender', 'Pure White', 'Crimson', 'Golden', 'Dark Purple', 'Ash Grey'];
const EYE_COLORS = ['Violet', 'Ruby Red', 'Gold', 'Ice Blue', 'Emerald', 'Pitch Black', 'Silver', 'Amber', 'Heterochromia (Violet/Gold)', 'Glowing Teal', 'Deep Purple', 'Rose Pink'];
const BUILDS = ['Slender and agile', 'Tall and imposing', 'Petite but fierce', 'Athletic and balanced', 'Lean and wiry', 'Broad-shouldered', 'Delicate and graceful', 'Compact and powerful'];
const MARKS = ['A claw scar across the left cheek', 'A glowing runic tattoo on the wrist', 'Heterochromic eyes', 'A crown-shaped birthmark on the nape', 'Pointed ears tipped with gold', 'Scales along the collarbone', 'A permanent shadow that moves independently', 'None — perfectly unmarked'];
const STYLES = ['Tattered dark cloak over battle armour', 'Elegant noble robes with hidden weapons', 'Casual modern clothes (from their original world)', 'Revealing mage robes with arcane sigils', 'Heavy plate armour with a sigil of a fallen kingdom', 'Lightweight leather assassin gear', 'Pristine white healer vestments', 'Flashy merchant finery with a hidden blade'];

const TRAITS = ['Tsundere', 'Overly confident', 'Secretly kind', 'Ruthlessly efficient', 'Chaotic good', 'Haunted by the past', 'Obsessed with food', 'Lazy unless motivated', 'Fiercely loyal', 'Morally grey', 'Absurdly calm in danger', 'Sarcastic', 'Naive but powerful', 'Calculating', 'Recklessly brave', 'Quietly observant'];

const ALIGNMENTS = ['Lawful Good', 'Neutral Good', 'Chaotic Good', 'Lawful Neutral', 'True Neutral', 'Chaotic Neutral', 'Lawful Evil', 'Neutral Evil', 'Chaotic Evil'];

const WORLDS = ['Modern Japan', 'Contemporary Hong Kong', 'Rural USA', 'Medieval Europe (already an isekai)', 'A post-apocalyptic Earth', 'An orbital space station', 'A peaceful village', 'A corrupt megacity'];

const ISEKAI_METHODS = ['Hit by a truck (classic)', 'Fell into a magic mirror', 'Summoned by a demon lord', 'Pulled through a bookshelf portal', 'Drowned in a bathtub and woke up here', 'Chose to reincarnate from the afterlife', 'Was a game NPC who gained consciousness', 'A god sneezed and accidentally displaced them'];

const ITEMS = [
  { name: 'Cursed Ring of the Void King', desc: 'Grants immense power but whispers dark suggestions at night.' },
  { name: 'Infinite Grimoire', desc: 'A blank book that writes spells as you think of them.' },
  { name: 'Familiar Egg (Unknown Species)', desc: 'Will hatch into something terrifying or adorable — no one knows.' },
  { name: 'Legendary Broken Sword', desc: 'Said to be the shard of a god-killing blade. Currently unusable.' },
  { name: 'Dimensional Bag', desc: 'Holds 500kg of items. Smells faintly of another world.' },
  { name: 'The Last Potion', desc: 'One use. Cures anything. Even death. Use wisely.' },
  { name: 'Cracked Hero\'s Shield', desc: 'Once protected a legendary hero. Still remembers how.' },
  { name: 'Golden Compass of Fate', desc: 'Always points toward your destiny. Not always where you want to go.' },
  { name: 'Forbidden Cookbook', desc: 'Every recipe grants a temporary magical effect when eaten.' },
  { name: 'Contract Quill', desc: 'Any promise written with it becomes a binding magical contract.' },
];

const HIDDEN_STATS = ['FATE', 'KARMA', 'DIVINITY', 'SHADOW', 'CHAOS', 'VOID', 'SOUL', 'DESTINY'];


const GENDERS = ['Male', 'Female', 'Male', 'Female', 'Non-binary', 'Bishounen', 'Bishoujo'];

const GOALS = [
  'Find a way back to the original world — but slowly losing the desire to.',
  'Become the strongest being in this world and rewrite its rules.',
  'Locate the one who summoned them and demand answers.',
  'Build a peaceful life and never fight again (fate keeps ruining this plan).',
  'Overthrow the corrupt kingdom and install a just ruler.',
  'Collect all legendary artifacts and seal the ancient demon god.',
  'Open a restaurant. Just a restaurant. Please.',
  'Find the other seven heroes who were summoned at the same time.',
  'Discover who they were before their memory was wiped upon arrival.',
  'Protect the one person who showed them kindness on day one.',
];
