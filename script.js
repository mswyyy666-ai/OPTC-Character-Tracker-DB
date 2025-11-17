// ==============================
// Load only character ID 1
// ==============================
async function loadCharacter1() {
  const url = "https://raw.githubusercontent.com/mswyyy666-ai/OPTC-Character-Tracker-DB/main/data/characters.json";

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch character database");

    const data = await response.json();
    const unit = data["1"]; // ambil hanya ID 1

    if (!unit || !unit.name || unit.stars == null) return [];

    const idStr = String(1).padStart(4, "0"); // "0001"
    const folder1 = idStr[0]; // "0"
    const folder2Num = Math.floor(parseInt(idStr, 10) / 100) * 100; // 0
    const folder2 = String(folder2Num).padStart(3, "0"); // "000"

    const thumbnail = `api/images/thumbnail/glo/${folder1}/${folder2}/${idStr}.png`;

    return [{
      id: 1,
      name: unit.name,
      type: unit.type,
      classes: unit.classes,
      stars: unit.stars,
      thumbnail: thumbnail
    }];
  } catch (e) {
    console.error("Error loading character 1:", e);
    return [];
  }
}

// ==============================
// Render characters
// ==============================
function renderCharacters(list, ownedSet) {
  if (!Array.isArray(list)) list = [];

  const grid = document.getElementById('grid');
  grid.innerHTML = '';

  list.forEach(unit => {
    const box = document.createElement('div');
    box.className = 'char-box';
    if (ownedSet.has(unit.id)) box.classList.add('owned');

    const img = document.createElement('img');
    img.src = unit.thumbnail;
    img.alt = unit.name;

    // fallback jika thumbnail gagal
    img.onerror = () => img.src = "api/images/common/noimage.png";

    box.appendChild(img);
    box.addEventListener('click', () => openCharacterModal(unit, ownedSet));
    grid.appendChild(box);
  });
}

// ==============================
// Modal
// ==============================
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
    <p>Class: ${unit.classes.join(", ")}</p>
    <p>Rarity: ${unit.stars}</p>
  `;

  checkbox.checked = ownedSet.has(unit.id);
  checkbox.onchange = () => {
    if (checkbox.checked) ownedSet.add(unit.id);
    else ownedSet.delete(unit.id);
    saveOwnedLocal(ownedSet);
  };

  modal.onclick = (e) => {
    if (!modalContent.contains(e.target)) modal.classList.add("hidden");
  };

  modalCloseBtn.onclick = () => modal.classList.add("hidden");

  modal.classList.remove("hidden");
}

// ==============================
// localStorage functions
// ==============================
function saveOwnedLocal(ownedSet) {
  localStorage.setItem('ownedCharacters', JSON.stringify([...ownedSet]));
}

function loadOwnedLocal() {
  const saved = localStorage.getItem('ownedCharacters');
  return saved ? new Set(JSON.parse(saved)) : new Set();
}

// ==============================
// Init
// ==============================
window.addEventListener('DOMContentLoaded', async () => {
  const characters = await loadCharacter1();
  const ownedSet = loadOwnedLocal();
  renderCharacters(characters, ownedSet);
});

