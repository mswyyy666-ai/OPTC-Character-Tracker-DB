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
        const thumbnail = `api/images/thumbnail/jap/${folder1}/${folder2}/${idStr}.png`;

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
// Pagination variables and functions
// ==============================
let characters = [];
let ownedSet = new Set();
let currentPage = 1;
const itemsPerPage = 50; // Tetap 50 per halaman

function renderPage(page) {
  const grid = document.getElementById('grid');
  if (!Array.isArray(characters)) characters = [];

  const start = (page - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  const charactersToShow = characters.slice(start, end);

  grid.innerHTML = ''; // Kosongkan grid sebelum render ulang

  charactersToShow.forEach(unit => {
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

  updatePaginationButtons();
}

function updatePaginationButtons() {
  const prevBtn = document.getElementById('prev-btn');
  const nextBtn = document.getElementById('next-btn');
  const pageInfo = document.getElementById('page-info');

  const totalPages = Math.ceil(characters.length / itemsPerPage);
  prevBtn.disabled = currentPage === 1;
  nextBtn.disabled = currentPage === totalPages;
  pageInfo.textContent = `Halaman ${currentPage} dari ${totalPages}`;
}

// Event listeners untuk tombol pagination
document.getElementById('prev-btn').addEventListener('click', () => {
  if (currentPage > 1) {
    currentPage--;
    renderPage(currentPage);
  }
});

document.getElementById('next-btn').addEventListener('click', () => {
  const totalPages = Math.ceil(characters.length / itemsPerPage);
  if (currentPage < totalPages) {
    currentPage++;
    renderPage(currentPage);
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
  renderPage(currentPage); // Render halaman pertama
});
