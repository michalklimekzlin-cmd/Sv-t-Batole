// Projekt Batole — jednoduché živé semínko světa
// Bez build toolů, jen vanilla JS. Data jsou v /data/*.json

const creatorsGrid = document.getElementById('creatorsGrid');
const peopleGrid = document.getElementById('peopleGrid');
const searchInput = document.getElementById('searchInput');
const creatorFilter = document.getElementById('creatorFilter');
const emptyState = document.getElementById('emptyState');
const addPersonBtn = document.getElementById('addPersonBtn');
const personDialog = document.getElementById('personDialog');
const personForm = document.getElementById('personForm');

let creators = [];
let people = [];

// Load data
async function loadData(){
  const [c,p] = await Promise.all([
    fetch('data/creators.json').then(r=>r.json()),
    fetch('data/people.json').then(r=>r.json())
  ]);
  creators = c;
  people = p;
  renderCreators();
  populateCreatorFilter();
  renderPeople();
}

function renderCreators(){
  creatorsGrid.innerHTML = '';
  const tmpl = document.getElementById('cardTmpl');
  creators.forEach(cr => {
    const node = tmpl.content.cloneNode(true);
    node.querySelector('.title').textContent = cr.name;
    node.querySelector('.subtitle').textContent = cr.aspect;
    node.querySelector('.desc').textContent = cr.desc;
    const chips = node.querySelector('.chips');
    (cr.gifts || []).forEach(g => {
      const el = document.createElement('span');
      el.className = 'chip';
      el.textContent = g;
      chips.appendChild(el);
    });
    // Hide actions for creators (read-only in UI seed)
    node.querySelector('.actions').remove();
    creatorsGrid.appendChild(node);
  });
}

function populateCreatorFilter(){
  // Select in filters
  creatorFilter.innerHTML = '<option value="">Všichni</option>' + creators.map(c=>`<option value="${c.id}">${c.name}</option>`).join('');
  // Select in dialog
  const dialogSelect = personForm.querySelector('select[name="creator"]');
  dialogSelect.innerHTML = creators.map(c=>`<option value="${c.id}">${c.name}</option>`).join('');
}

function personMatches(person, q, creatorId){
  const text = (person.name + ' ' + (person.bio||'') + ' ' + (person.gifts||[]).join(' ') + ' ' + person.creatorName).toLowerCase();
  const okQ = !q || text.includes(q.toLowerCase());
  const okC = !creatorId || person.creator === creatorId;
  return okQ && okC;
}

function renderPeople(){
  const q = searchInput.value.trim();
  const c = creatorFilter.value;
  const filtered = people.filter(p => personMatches(p, q, c));
  peopleGrid.innerHTML = '';
  const tmpl = document.getElementById('cardTmpl');
  filtered.forEach(p => {
    const node = tmpl.content.cloneNode(true);
    node.querySelector('.title').textContent = p.name;
    node.querySelector('.subtitle').textContent = creators.find(x=>x.id===p.creator)?.name || p.creatorName || '';
    node.querySelector('.desc').textContent = p.bio || '';
    const chips = node.querySelector('.chips');
    (p.gifts || []).forEach(g => {
      const el = document.createElement('span');
      el.className = 'chip';
      el.textContent = g;
      chips.appendChild(el);
    });
    const [editBtn, delBtn] = node.querySelectorAll('button');
    editBtn.addEventListener('click', ()=> editPerson(p.id));
    delBtn.addEventListener('click', ()=> deletePerson(p.id));
    peopleGrid.appendChild(node);
  });
  emptyState.style.display = filtered.length ? 'none' : 'block';
}

// CRUD for people (localStorage persistence)
const STORAGE_KEY = 'batole.people.v1';

function saveToStorage(){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(people));
}

function loadFromStorage(){
  const raw = localStorage.getItem(STORAGE_KEY);
  if(raw){
    try{
      const local = JSON.parse(raw);
      if(Array.isArray(local) && local.length){
        people = local;
      }
    }catch(e){}
  }
}

function openDialog(initial){
  personForm.reset();
  if(initial){
    personForm.name.value = initial.name || '';
    personForm.creator.value = initial.creator || creators[0]?.id || '';
    personForm.bio.value = initial.bio || '';
    personForm.gifts.value = (initial.gifts||[]).join(', ');
  }else{
    personForm.creator.value = creators[0]?.id || '';
  }
  personDialog.showModal();
}

function editPerson(id){
  const p = people.find(x=>x.id===id);
  openDialog(p);
  personDialog.returnValue = '';
  personDialog.addEventListener('close', function handler(){
    personDialog.removeEventListener('close', handler);
    if(personDialog.returnValue === 'save'){
      const updated = getFormPerson(p.id);
      const idx = people.findIndex(x=>x.id===id);
      people[idx] = updated;
      saveToStorage();
      renderPeople();
    }
  });
}

function deletePerson(id){
  if(confirm('Opravdu smazat postavu?')){
    people = people.filter(x=>x.id!==id);
    saveToStorage();
    renderPeople();
  }
}

function getFormPerson(existingId){
  const formData = new FormData(personForm);
  const gifts = (formData.get('gifts')||'').split(',').map(s=>s.trim()).filter(Boolean);
  const creator = formData.get('creator');
  const creatorName = creators.find(c=>c.id===creator)?.name || '';
  return {
    id: existingId || ('p_' + Math.random().toString(36).slice(2,9)),
    name: formData.get('name').trim(),
    creator,
    creatorName,
    bio: formData.get('bio').trim(),
    gifts,
    createdAt: existingId ? undefined : new Date().toISOString()
  };
}

addPersonBtn.addEventListener('click', ()=>{
  openDialog();
  personDialog.returnValue = '';
  personDialog.addEventListener('close', function handler(){
    personDialog.removeEventListener('close', handler);
    if(personDialog.returnValue === 'save'){
      const p = getFormPerson();
      people.push(p);
      saveToStorage();
      renderPeople();
    }
  });
});

personForm.addEventListener('submit', (e)=>{
  // prevent default close behaviour; using dialog buttons for returnValue
  e.preventDefault();
});

searchInput.addEventListener('input', renderPeople);
creatorFilter.addEventListener('change', renderPeople);

// Init
loadFromStorage();
loadData();
