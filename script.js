// SIGNUP & LOGIN SYSTEM
function signup() {
  let email = document.getElementById("signupEmail").value;
  let password = document.getElementById("signupPass").value;

  localStorage.setItem("userEmail", email);
  localStorage.setItem("userPass", password);

  alert("Account created!");
}

function login() {
  let email = document.getElementById("loginEmail").value;
  let password = document.getElementById("loginPass").value;

  if (
    email === localStorage.getItem("userEmail") &&
    password === localStorage.getItem("userPass")
  ) {
    alert("Login successful!");
    window.location.href = "index.html";
  } else {
    alert("Incorrect login details.");
  }
}

// SEARCH FUNCTION
function search() {
  let query = document.getElementById("searchInput").value.toLowerCase();
  let resultsDiv = document.getElementById("results");

  let fakeData = ["bakery bag", "fruit box", "veg pack", "meal deal"];

  resultsDiv.innerHTML = "";

  fakeData.forEach(item => {
    if (item.includes(query)) {
      resultsDiv.innerHTML += `<div class='card'><p>${item}</p>
      <button onclick="addToCart('${item}')">Add to Cart</button></div>`;
    }
  });
}

// CART SYSTEM
function addToCart(item) {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  cart.push(item);
  localStorage.setItem("cart", JSON.stringify(cart));
  alert("Added to cart!");
}

function displayCart() {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  let cartDiv = document.getElementById("cartItems");

  if (cartDiv) {
    cartDiv.innerHTML = "";
    cart.forEach(i => {
      cartDiv.innerHTML += `<div class='card'>${i}</div>`;
    });
  }
}

function checkout() {
  alert("Payment completed! Thank you!");
  localStorage.removeItem("cart");
  window.location.href = "index.html";
}

displayCart();
