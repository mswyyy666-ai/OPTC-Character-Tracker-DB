// Load character data from GitHub
async function loadCharacters() {
  const url = "https://raw.githubusercontent.com/mswyyy666-ai/OPTC-Character-Tracker-DB/main/data/characters.json";

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch character database");

    const data = await response.json();

    return Object.entries(data)
      .filter(([id, unit]) => unit.name && unit.stars != null) // skip placeholder
      .map(([id, unit]) => {
        const idStr = String(id).padStart(4, "0");

        // Tentukan folder pertama dan kedua sesuai pola ribuan & ratusan
        const folder1 = idStr[0];
        const folder2Num = Math.floor(parseInt(idStr, 10) / 100) * 100;
        const folder2 = String(folder2Num).padStart(3, "0");

        const thumbnail = `/api/images/thumbnail/jap/${folder1}/${folder2}/${idStr}.png`;

        return {
          id: id,
          name: unit.name,
          type: unit.type,
          classes: unit.classes,
          stars: unit.stars,
          thumbnail: thumbnail
        };
      }) || []; // fallback array kosong

  } catch (e) {
    console.error("Error loading characters:", e);
    return []; // fallback array kosong
  }
}

// Render characters to the grid
function renderCharacters(list, ownedSet) {
  if (!Array.isArray(list)) list = []; // extra safety

  const grid = document.getElementById('grid');
  grid.innerHTML = '';

  list.forEach(unit => {
    const box = document.createElement('div');
    box.className = 'char-box';
    if (ownedSet.has(unit.id)) box.classList.add('owned');

    const img = document.createElement('img');
    img.src = unit.thumbnail;
    img.alt = unit.name;

    // fallback image jika 404
    img.onerror = () => {
      img.src = '/api/images/common/icons/fallback.png';
    };

    box.appendChild(img);

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
    <p>Class: ${unit.classes.join(", ")}</p>
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
