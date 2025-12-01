/* LocalStorage Keys */
const USERS_KEY = "bnu_users";
const LOGGED_KEY = "bnu_logged";
const OFFERS_KEY = "bnu_offers";
const RES_KEY = "bnu_reservations";

/* Helpers */
function load(key, fallback) {
  return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback));
}
function save(key, val) {
  localStorage.setItem(key, JSON.stringify(val));
}

/* Data */
let users = load(USERS_KEY, []);
let logged = load(LOGGED_KEY, null);
let offers = load(OFFERS_KEY, []);
let reservations = load(RES_KEY, []);

/* UI Elements */
const offersDiv = document.getElementById("offers");
const resDiv = document.getElementById("reservations");
const accName = document.getElementById("acc-name");
const pointsUI = document.getElementById("points");

/* Modal references */
const authModal = document.getElementById("auth-modal");
const offerModal = document.getElementById("offer-modal");
const payModal = document.getElementById("pay-modal");

/* -------- AUTH -------- */
let authMode = "login";

document.getElementById("btn-login").onclick = () => openAuth("login");
document.getElementById("btn-register").onclick = () => openAuth("register");

function openAuth(mode) {
  authMode = mode;
  document.getElementById("auth-title").textContent =
    mode === "login" ? "Login" : "Register";
  authModal.style.display = "flex";
}

document.getElementById("close-auth").onclick = () =>
  (authModal.style.display = "none");

document.getElementById("auth-submit").onclick = () => {
  const email = document.getElementById("auth-email").value.trim();
  const pass = document.getElementById("auth-pass").value.trim();

  if (!email || !pass) return alert("Fill all fields.");

  if (authMode === "register") {
    if (users.find(u => u.email === email))
      return alert("Email already registered.");

    users.push({ email, pass, points: 0 });
    save(USERS_KEY, users);
    alert("Account created. Please login.");
    authModal.style.display = "none";
  } else {
    const u = users.find(u => u.email === email && u.pass === pass);
    if (!u) return alert("Invalid login.");
    logged = email;
    save(LOGGED_KEY, logged);
    authModal.style.display = "none";
    updateAccount();
  }
};

/* -------- ADD OFFER -------- */
document.getElementById("add-offer-btn").onclick = () => {
  if (!logged) return alert("Login first.");
  offerModal.style.display = "flex";
};

document.getElementById("close-offer").onclick = () =>
  (offerModal.style.display = "none");

document.getElementById("submit-offer").onclick = () => {
  const store = document.getElementById("store-name").value.trim();
  const title = document.getElementById("offer-title").value.trim();
  const price = document.getElementById("offer-price").value.trim();
  const window = document.getElementById("offer-window").value.trim();

  if (!store || !title || !price || !window)
    return alert("Fill all fields.");

  offers.push({
    id: Date.now(),
    store,
    title,
    price,
    window
  });

  save(OFFERS_KEY, offers);
  offerModal.style.display = "none";
  renderOffers();
};

/* -------- RENDER OFFERS -------- */
function renderOffers() {
  offersDiv.innerHTML = "";
  offers.forEach(o => {
    let card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <h4>${o.store}</h4>
      <p><strong>${o.title}</strong></p>
      <p>Price: ${o.price}</p>
      <p>Pickup: ${o.window}</p>
      <button class="btn primary" onclick="reserve(${o.id})">Reserve</button>
    `;
    offersDiv.appendChild(card);
  });
}

/* -------- RESERVE -------- */
let pendingOffer = null;

function reserve(id) {
  if (!logged) return alert("Login first!");

  pendingOffer = id;
  payModal.style.display = "flex";
}

document.getElementById("close-pay").onclick = () =>
  (payModal.style.display = "none");

document.getElementById("pay-now").onclick = () => {
  const offer = offers.find(o => o.id === pendingOffer);
  if (!offer) return;

  reservations.push({
    ...offer,
    user: logged
  });

  save(RES_KEY, reservations);
  awardPoints(logged, 10);
  payModal.style.display = "none";
  renderReservations();
  updateAccount();

  alert("Reservation completed! +10 loyalty points");
};

/* -------- RENDER RESERVATIONS -------- */
function renderReservations() {
  resDiv.innerHTML = "";

  reservations
    .filter(r => r.user === logged)
    .forEach(r => {
      let card = document.createElement("div");
      card.className = "card";
      card.innerHTML = `
        <h4>${r.store}</h4>
        <p><strong>${r.title}</strong></p>
        <p>Pickup: ${r.window}</p>
      `;
      resDiv.appendChild(card);
    });
}

/* -------- ACCOUNT -------- */
function updateAccount() {
  if (!logged) {
    accName.textContent = "None";
    pointsUI.textContent = 0;
    return;
  }
  const u = users.find(u => u.email === logged);
  accName.textContent = logged;
  pointsUI.textContent = u.points;
}

function awardPoints(email, amount) {
  const u = users.find(u => u.email === email);
  u.points += amount;
  save(USERS_KEY, users);
}

/* INIT */
renderOffers();
renderReservations();
updateAccount();
