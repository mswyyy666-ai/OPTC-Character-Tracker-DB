// script.js (re-generated)


// Render characters to the grid
function renderCharacters(list, ownedSet) {
const grid = document.getElementById('character-grid');
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


// Character modal
function openCharacterModal(unit, ownedSet) {
const modal = document.getElementById('character-modal');
const title = document.getElementById('modal-title');
const body = document.getElementById('modal-body');
const checkbox = document.getElementById('modal-owned');


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


modal.style.display = 'flex';
}


// LocalStorage save/load
function saveOwnedLocal(ownedSet) {
localStorage.setItem('ownedCharacters', JSON.stringify([...ownedSet]));
}


function loadOwnedLocal() {
const saved = localStorage.getItem('ownedCharacters');
return saved ? new Set(JSON.parse(saved)) : new Set();
}


// Page initialization
window.addEventListener('DOMContentLoaded', async () => {
const characters = await loadCharacters();
const ownedSet = loadOwnedLocal();


const list = Object.values(characters);
renderCharacters(list, ownedSet);
});