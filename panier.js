// Function to load products from cart in IndexedDB
function loadProductsFromCart() {
    const dbRequest = indexedDB.open("CoffeeShopDB", 2); // Open IndexedDB with version 2

    dbRequest.onsuccess = function(event) {
        const db = event.target.result;
        const transaction = db.transaction("cart", "readonly");
        const store = transaction.objectStore("cart");
        const getAllRequest = store.getAll(); // Get all products in the cart

        getAllRequest.onsuccess = function() {
            const cartItems = getAllRequest.result;
            displayCartItem(cartItems); // Display products
            calculateTotal(cartItems); // Calculate and display total
        };
    };
}

// Display the cart items with images and a delete button
function displayCartItem(cartItems) {
    const cartContainer = document.getElementById('cart-items');
    cartContainer.innerHTML = ''; // Clear existing content

    if (cartItems.length === 0) {
        cartContainer.innerHTML = "<p>Votre panier est vide.</p>";
        return;
    }

    cartItems.forEach(product => {
        const productRow = createCartItemRow(product);
        cartContainer.appendChild(productRow); // Add each product to the cart view
    });
}

// Create a row for each product in the cart with a delete button and quantity input
function createCartItemRow(product) {
    const row = document.createElement('tr');
    row.className = 'cart-item';

    // Create the HTML content for the row
    row.innerHTML = `
        <td>
            <img src="${product.image_url}" alt="${product.name}" class="cart-item-img">
            <span class="product-name">${product.name}</span>
        </td>
        <td class="product-price">${product.price} dh</td>
        <td>
            <div class="quantity-control">
                <button class="decrease" onclick="updateQuantity('${product.id}', ${product.quantity - 1})">-</button>
                <span class="quantity">${product.quantity}</span>
                <button class="increase" onclick="updateQuantity('${product.id}', ${product.quantity + 1})">+</button>
            </div>
        </td>
        <td class="item-total">${(product.price * product.quantity).toFixed(2)} dh</td>
        <td>
            <button class="remove-btn" onclick="removeFromCart('${product.id}')">×</button>
        </td>
    `;
    return row;
}

// Function to remove product from cart
function removeFromCart(productId) {
    const dbRequest = indexedDB.open("CoffeeShopDB", 2); // Open IndexedDB with version 2

    dbRequest.onsuccess = function(event) {
        const db = event.target.result;
        const transaction = db.transaction("cart", "readwrite");
        const store = transaction.objectStore("cart");

        store.delete(productId); // Delete the product from the cart store using its productId

        transaction.oncomplete = function() {
            loadProductsFromCart(); // Reload and display updated cart
        };
    };

    dbRequest.onerror = function() {
        console.error("Error opening IndexedDB.");
    };
}

// Function to update the product quantity in cart
function updateQuantity(itemId, newQuantity) {
    if (newQuantity < 1) return; // Prevent negative or zero quantities

    const dbRequest = indexedDB.open("CoffeeShopDB", 2);

    dbRequest.onsuccess = function(event) {
        const db = event.target.result;
        const transaction = db.transaction("cart", "readwrite");
        const store = transaction.objectStore("cart");

        const getRequest = store.get(itemId);

        getRequest.onsuccess = function() {
            const product = getRequest.result;
            if (product) {
                product.quantity = newQuantity;

                store.put(product); // Update the product in the cart

                transaction.oncomplete = function() {
                    loadProductsFromCart(); // Reload cart with updated quantity
                };
            }
        };
    };

    dbRequest.onerror = function() {
        console.error("Error updating product in cart.");
    };
}

// Function to calculate and display the total price of products in the cart
function calculateTotal(cartItems) {
    let total = 0;

    cartItems.forEach(product => {
        total += product.price * product.quantity;
    });

    const totalElement = document.getElementById('cart-total');
    totalElement.innerText = `${total.toFixed(2)} dh`;
}

// Call the loadProductsFromCart function to load and display cart items when the page is loaded
window.onload = function() {
    loadProductsFromCart();
};
