// Build thumbnail URL from ID
function getThumbnailUrl(id) {
  const A = String(id)[0]; // first digit

  const B = (Math.floor(id / 100) * 100) % 1000; 
  const Bfolder = B.toString().padStart(3, "0");

  const ID = id.toString().padStart(4, "0");

  return `https://2shankz.github.io/optc-db.github.io/api/images/thumbnail/jap/${A}/${Bfolder}/${ID}.png`;
}

// Load character data from GitHub
async function loadCharacters() {
  const url = "https://raw.githubusercontent.com/mswyyy666-ai/OPTC-Character-Tracker-DB/main/data/characters.json";

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch character database");

    const data = await response.json();

    return Object.values(data).map((unit, index) => ({
      id: unit.id ?? index,
      name: unit.name,
      type: unit.type,
      class: unit.class,
      stars: unit.stars,
      thumbnail: getThumbnailUrl(unit.id)
    }));

  } catch (e) {
    console.error("Error loading characters:", e);
    return [];
  }
}

// Render characters to the grid
function renderCharacters(list, ownedSet) {
  const grid = document.getElementById('grid');
  grid.innerHTML = '';

  list.forEach(unit => {
    const box = document.createElement('div');
    box.className = 'char-box';
    if (ownedSet.has(unit.id)) box.classList.add('owned');

    box.innerHTML = `
      <img src="${unit.thumbnail}" alt="${unit.name}" />
    `;

    box.addEventListener('click', () => openCharacterModal(unit, ownedSet));
    grid.appendChild(box);
  });
}

// Open modal
function openCharacterModal(unit, ownedSet) {
  const modal = document.getElementById('modal');
  const modalContent = document.getElementById("modal-content");
  const title = document.getElementById('modal-name');
  const body = document.getElementById('modal-body');
  const checkbox = document.getElementById('modal-owned');
  const modalCloseBtn = document.getElementById("modal-close");

  title.textContent = unit.name;
  body.innerHTML = `
    <p>Type: ${unit.type}</p>
    <p>Class: ${unit.class}</p>
    <p>Rarity: ${unit.stars}</p>
  `;

  checkbox.checked = ownedSet.has(unit.id);
  checkbox.onchange = () => {
    if (checkbox.checked) ownedSet.add(unit.id);
    else ownedSet.delete(unit.id);
    saveOwnedLocal(ownedSet);
  };

  // Click outside to close
  modal.onclick = (e) => {
    if (!modalContent.contains(e.target)) {
      modal.classList.add("hidden");
    }
  };

  // Close button
  modalCloseBtn.onclick = () => {
    modal.classList.add("hidden");
  };

  modal.classList.remove("hidden");
}

// Save locally
function saveOwnedLocal(ownedSet) {
  localStorage.setItem('ownedCharacters', JSON.stringify([...ownedSet]));
}

// Load locally
function loadOwnedLocal() {
  const saved = localStorage.getItem('ownedCharacters');
  return saved ? new Set(JSON.parse(saved)) : new Set();
}

// Init
window.addEventListener('DOMContentLoaded', async () => {
  const characters = await loadCharacters();
  const ownedSet = loadOwnedLocal();

  renderCharacters(characters, ownedSet);
});
