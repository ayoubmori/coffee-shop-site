let products = []; // Declare the products variable globally

// Fetch products from the API
function getProducts() {
    fetch('https://fake-coffee-api.vercel.app/api')
        .then(response => response.json())
        .then(data => {
            console.log("Fetched products:", data); // Log the fetched data
            if (data.length > 0) {
                products = data; // Store fetched products
                addProductsToDB(products)
                displayProducts(products)
                // openDB(); // Open the database after fetching products
            } else {
                console.log("No products to add.");
            }
        })
        .catch(error => {
            console.error("Error fetching products:", error);
            loadProductsFromDB();
        });
}

//in case offline , get products from db
function loadProductsFromDB() {
    const dbRequest = indexedDB.open("CoffeeShopDB", 2);

    dbRequest.onsuccess = (event) => {
        const db = event.target.result;
        const transaction = db.transaction("products", "readonly");
        const store = transaction.objectStore("products");
        const getAllRequest = store.getAll();

        getAllRequest.onsuccess = () => {
            const products = getAllRequest.result;
            console.log("Loaded products from IndexedDB:", products);
            displayProducts(products);
        };

        getAllRequest.onerror = (event) => {
            console.error("Error loading products from IndexedDB:", event.target.error);
        };
    };

    dbRequest.onerror = (event) => {
        console.error("Database open error:", event.target.error);
    };
}


// ajout au panier 
function addToCart(productId) {
    let product_detail = products.find(p => p.id == productId);
    const cartItem = {
        id: productId,
        image_url: product_detail.image_url,
        name: product_detail.name,
        price: product_detail.price,
        quantity: 1
    };

    const dbRequest = indexedDB.open('CoffeeShopDB', 2); // Ensure name matches

    dbRequest.onsuccess = (event) => {
        const db = event.target.result;
        const transaction = db.transaction('cart', 'readwrite');
        const store = transaction.objectStore('cart');
        store.put(cartItem);
        transaction.oncomplete = () => {
            console.log("Product added to cart:", cartItem);
        };

        transaction.onerror = (event) => {
            console.error("Error adding product to cart:", event.target.error);
        };
    };
}





// Create a product card
function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
        <img src="${product.image_url}" alt="${product.title}">
        <h3>${product.name}</h3>
        <div class="product-info">
            <h4 class="price">${product.price}dh </h4>
            <p class="description">${product.description}</p>
            <button onclick="addToCart('${product.id}')" class="add-to-cart">+</button>
        </div>
    `;
    return card;
}

// Display products
function displayProducts(products) {
    const grid = document.querySelector('.product-content');
    grid.innerHTML = ''; // Clear previous products
    products.forEach(product => {
        grid.appendChild(createProductCard(product));
    });
}

// Function for filtering products
function filterProducts() {
    const keyword = document.getElementById('search-input').value.toLowerCase();
    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(keyword) ||
        (product.description && product.description.toLowerCase().includes(keyword))
    );
    displayProducts(filteredProducts);
}

// Event listener for the search input
document.getElementById('search-input').addEventListener('input', filterProducts);

// Mode view setup
const container = document.querySelector('.product-content');
const gridIcon = document.getElementById('grid');
const listIcon = document.getElementById('list');

// Function for grid view
function setGridView() {
    container.style.display = 'flex';
    container.style.flexDirection = 'row';
    container.style.flexWrap = 'wrap';
    container.style.gap = '20px';
    container.style.justifyContent = 'flex-start';

    document.querySelectorAll('.product-card').forEach(card => {
        card.style.display = 'flex';
        card.style.flexDirection = 'column';
        card.style.maxWidth = '300px';
    });
}

// Function for list view
function setListView() {
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.gap = '10px';

    document.querySelectorAll('.product-card').forEach(card => {
        card.style.display = 'flex';
        card.style.flexDirection = 'row';
        card.style.maxWidth = '100%';
        card.style.alignItems = 'center';
        card.style.gap = '20px';
    });

    document.querySelectorAll('.product-card img').forEach(img => {
        img.style.maxWidth = "200px";
    });

    document.querySelectorAll('.product-card button').forEach(btn => {
        btn.style.alignSelf = 'flex-end';
    });
}

// Add event listeners for the grid and list icons
gridIcon.addEventListener('click', setGridView);
listIcon.addEventListener('click', setListView);

// Initialize the view (grid)
setGridView();

// Open the IndexedDB database
function openDB() {
    const dbRequest = indexedDB.open("CoffeeShopDB", 2);

    dbRequest.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains("products")) {
            db.createObjectStore("products", { keyPath: "id" });
        }
        if (!db.objectStoreNames.contains("cart")) {
            db.createObjectStore("cart", { keyPath: "id" });
        }
        console.log("Database and object stores created or verified.");
    };

    dbRequest.onsuccess = (event) => {
        console.log("Database opened successfully.");
        // db is now open and can be used
    };

    dbRequest.onerror = (event) => {
        console.error("Database open error:", event.target.error);
    };
}


// Add products to the database
function addProductsToDB(products) {
    const dbRequest = indexedDB.open("CoffeeShopDB", 2);

    dbRequest.onsuccess = (event) => {
        const db = event.target.result;
        const transaction = db.transaction("products", "readwrite");
        const store = transaction.objectStore("products");

        products.forEach(product => {
            store.put(product);
        });

        transaction.oncomplete = () => {
            console.log("Products added to IndexedDB.");
        };

        transaction.onerror = (event) => {
            console.error("Error adding products:", event.target.error);
        };
    };

    dbRequest.onerror = (event) => {
        console.error("Database open error:", event.target.error);
    };
}

// This function adds a product to the IndexedDB cart store
function addProductToCart(product) {
    const dbRequest = indexedDB.open("CoffeeShopDB", 2); // Open DB

    dbRequest.onsuccess = function(event) {
        const db = event.target.result;
        const transaction = db.transaction("cart", "readwrite");
        const store = transaction.objectStore("cart");

        // Add product to cart store
        store.add(product);
    };

    dbRequest.onerror = function() {
        console.error("Error opening IndexedDB.");
    };
}




// Start the process
getProducts();





// function getProducts() {
//     fetch('https://fake-coffee-api.vercel.app/api')
//         .then(response => {  return response.json();  })
//         .then(data => {
//             products = data;
//             displayProducts(products);
//         })
//         .catch(error => {
//             console.error("Erreur lors de la récupération des produits:", error);
//             displayProducts([]);
//         });
// }