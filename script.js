// ==============================
// Load all characters
// ==============================
async function loadCharacters() {
  const url = "https://raw.githubusercontent.com/mswyyy666-ai/OPTC-Character-Tracker-DB/main/data/characters.json";

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch character database");

    const data = await response.json();

    return Object.entries(data)
      .filter(([id, unit]) => unit && unit.name && unit.stars != null) // hanya karakter valid
      .map(([id, unit]) => {
        const idStr = String(id).padStart(4, "0");
        const folder1 = idStr[0];
        const folder2Num = Math.floor(parseInt(idStr, 10) / 100) * 100;
        const folder2 = String(folder2Num).padStart(3, "0");
        const thumbnail = `api/images/thumbnail/glo/${folder1}/${folder2}/${idStr}.png`;

        return {
          id: parseInt(id, 10),
          name: unit.name,
          type: unit.type,
          classes: unit.classes,
          stars: unit.stars,
          thumbnail: thumbnail
        };
      });
  } catch (e) {
    console.error("Error loading characters:", e);
    return [];
  }
}

// ==============================
// Batch rendering
// ==============================
let characters = [];
let ownedSet = new Set();
let currentIndex = 0;
const batchSize = 50;

function renderBatch() {
  const grid = document.getElementById('grid');
  if (!Array.isArray(characters)) characters = [];

  const slice = characters.slice(currentIndex, currentIndex + batchSize);

  slice.forEach(unit => {
    const box = document.createElement('div');
    box.className = 'char-box';
    if (ownedSet.has(unit.id)) box.classList.add('owned');

    const img = document.createElement('img');
    img.src = unit.thumbnail;
    img.alt = unit.name;
    img.onerror = () => img.src = "api/images/common/noimage.png";

    box.appendChild(img);
    box.addEventListener('click', () => openCharacterModal(unit, ownedSet));
    grid.appendChild(box);
  });

  currentIndex += batchSize;
}

// Load next batch saat scroll ke bawah
window.addEventListener('scroll', () => {
  if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight) {
    renderBatch();
  }
});

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

  // safe check sebelum contains
  if (modal && modalContent) {
    modal.onclick = (e) => {
      if (!modalContent.contains(e.target)) modal.classList.add("hidden");
    };
  }

  if (modalCloseBtn) modalCloseBtn.onclick = () => modal.classList.add("hidden");

  if (modal) modal.classList.remove("hidden");
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
  characters = await loadCharacters();
  ownedSet = loadOwnedLocal();
  renderBatch(); // batch pertama
});
