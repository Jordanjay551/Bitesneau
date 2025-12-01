// Simple front-end demo functionality for BitesNearU website
// - demo stores data and Leaflet map
// - loyalty points saved to localStorage
// - minimal "reserve" flow (no backend)

const STORES = [
  {
    id: 's1',
    name: "Greenwich Deli",
    lat: 51.4826,
    lng: -0.0077,
    items: [
      {id: 'i1', title: "Sandwich & juice (near-expiry)", price: "£2.50", window: "17:00-18:00"},
      {id: 'i2', title: "Salad box", price: "£1.75", window: "16:30-18:00"}
    ],
    address: "34 Market Road, Greenwich",
    rating: 4.2
  },
  {
    id: 's2',
    name: "Camden Bakery",
    lat: 51.5421,
    lng: -0.1435,
    items: [
      {id: 'i3', title: "Pastry bundle (x3)", price: "£2.00", window: "15:00-17:00"},
    ],
    address: "12 High St, Camden",
    rating: 4.6
  },
  {
    id: 's3',
    name: "Student Coop",
    lat: 51.5220,
    lng: -0.1310,
    items: [
      {id: 'i4', title: "Ready meal (vegan)", price: "£2.80", window: "18:00-19:30"},
      {id: 'i5', title: "Fruit pack", price: "£1.00", window: "12:00-13:00"}
    ],
    address: "University Quarter",
    rating: 4.0
  }
];

// Points keys
const POINTS_KEY = 'bnu_points';
const RESERVED_KEY = 'bnu_reserved_items';

// Utilities
function getPoints(){return parseInt(localStorage.getItem(POINTS_KEY) || '0',10)}
function setPoints(n){localStorage.setItem(POINTS_KEY,String(n)); updatePointsUI();}
function addPoints(n){setPoints(getPoints()+n);}
function getReserved(){try{return JSON.parse(localStorage.getItem(RESERVED_KEY)||'[]')}catch(e){return []}}
function addReserved(item){const r=getReserved();r.push(item);localStorage.setItem(RESERVED_KEY,JSON.stringify(r));}

// UI wiring
document.addEventListener('DOMContentLoaded',()=>{
  document.getElementById('year').textContent = new Date().getFullYear();
  initMiniMap();
  initMap();
  renderStores();
  updatePointsUI();

  // Modal
  const modal = document.getElementById('modal');
  document.getElementById('cta-open').addEventListener('click',()=>openModal());
  document.getElementById('cta-signup').addEventListener('click',()=>openModal());
  document.getElementById('cta-map').addEventListener('click',()=>document.getElementById('mapid').scrollIntoView({behavior:'smooth'}));
  document.getElementById('modal-close').addEventListener('click',()=>closeModal());
  document.getElementById('close-ok').addEventListener('click',()=>closeModal());

  // contact form demo
  document.getElementById('contact-form').addEventListener('submit', (e)=>{
    e.preventDefault();
    alert('Thanks — demo message submitted. We will contact you (demo).');
    e.target.reset();
  });
});

function updatePointsUI(){
  document.getElementById('points').textContent = getPoints();
}

// Modal helpers
function openModal(){
  const m=document.getElementById('modal');
  m.setAttribute('aria-hidden','false');
}
function closeModal(){
  const m=document.getElementById('modal');
  m.setAttribute('aria-hidden','true');
}

// Render store cards
function renderStores(){
  const c = document.getElementById('store-list');
  c.innerHTML = '';
  STORES.forEach(s=>{
    const card = document.createElement('article');
    card.className = 'store-card';
    const inner = `
      <h4>${escapeHtml(s.name)}</h4>
      <div class="store-meta">${escapeHtml(s.address)} · ⭐ ${s.rating}</div>
      <ul style="margin-top:.6rem;padding-left:1.1rem">
        ${s.items.map(it => `<li><strong>${escapeHtml(it.title)}</strong> — ${escapeHtml(it.price)} <span class="muted">(${escapeHtml(it.window)})</span> <button class="btn small" data-store="${s.id}" data-item="${it.id}" style="margin-left:.6rem">Reserve</button></li>`).join('')}
      </ul>
    `;
    card.innerHTML = inner;
    c.appendChild(card);
  });

  // hook reserve buttons
  c.querySelectorAll('button[data-item]').forEach(btn=>{
    btn.addEventListener('click', (e)=>{
      const storeId = btn.getAttribute('data-store');
      const itemId = btn.getAttribute('data-item');
      handleReserve(storeId, itemId);
    });
  });
}

function handleReserve(storeId, itemId){
  // In a real app: call backend to create reservation, take payment if needed.
  const store = STORES.find(s => s.id === storeId);
  const item = store.items.find(i => i.id === itemId);
  addReserved({store: storeId, item: itemId, ts: Date.now()});
  addPoints(10); // demo reward
  alert(`Reserved: ${item.title} at ${store.name}. You earned 10 points!`);
}

// Small helper to escape text for insertion to innerHTML
function escapeHtml(text){
  return (text+'').replace(/[&<>"']/g, function(m){
    return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m];
  });
}

/* --- LEAFLET MAPS --- */
let map, miniMap;

function initMiniMap(){
  try {
    miniMap = L.map('mini-map', {zoomControl:false, attributionControl:false}).setView([51.52, -0.12], 12);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19
    }).addTo(miniMap);
    // add sample markers
    STORES.forEach(s => L.circleMarker([s.lat,s.lng], {radius:6}).addTo(miniMap));
  } catch(e) {
    console.warn('Mini map failed to initialize', e);
  }
}

function initMap(){
  map = L.map('mapid').setView([51.52, -0.12], 12);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap contributors'
  }).addTo(map);

  // Add markers and popup content
  STORES.forEach(s=>{
    const marker = L.marker([s.lat, s.lng]).addTo(map);
    const popupHtml = `
      <strong>${escapeHtml(s.name)}</strong><br/>
      ${escapeHtml(s.address)}<br/>
      ${s.items.map(it => `${escapeHtml(it.title)} — ${escapeHtml(it.price)} <em>(${escapeHtml(it.window)})</em>`).join('<br/>')}
      <br/><br/>
      <button class="reserve-btn" data-store="${s.id}">Reserve (demo)</button>
    `;
    marker.bindPopup(popupHtml, {maxWidth:260});
  });

  // Listen for popupopen to wire demo reserve buttons inside popup
  map.on('popupopen', (e)=>{
    const el = e.popup._contentNode;
    const btn = el.querySelector('.reserve-btn');
    if(btn){
      btn.addEventListener('click', () => {
        // pick first item as demo
        const storeId = btn.getAttribute('data-store');
        const store = STORES.find(s => s.id === storeId);
        const item = store.items[0];
        addReserved({store: storeId, item: item.id, ts: Date.now()});
        addPoints(10);
        alert(`Reserved ${item.title} from ${store.name}. +10 points (demo).`);
        map.closePopup();
      });
    }
  });
}
