// main.js

document.addEventListener('DOMContentLoaded', function () {
    // Fetch and display all products on page load
    fetchFeaturedProducts();
    checkLoginStatus();

    // Event listener for category checkboxes
    const categoryFilter = document.getElementById('category-filter');
    categoryFilter.addEventListener('change', function () {
        const selectedCategories = Array.from(categoryFilter.querySelectorAll('input[type="checkbox"]:checked'))
            .map(checkbox => checkbox.value);
        const query = document.getElementById('search-query').value.trim(); // Get the search query from the search bar
        fetchFeaturedProducts(query, selectedCategories); // Fetch products based on query and selected categories
    });

    // Event listener for search form submission
    document.getElementById('search-form').addEventListener('submit', searchProducts);

    // Initial call to update the cart display when the page loads
    updateCart();
});

// Fetch and display featured products
async function fetchFeaturedProducts(query = '', selectedCategories = []) {
    try {
        console.log("Fetching products...");
        // Fetch all products from the API
        const response = await fetch('http://localhost:3000/api/products');
        const products = await response.json();

        // Normalize selected categories to lowercase
        const normalizedCategories = selectedCategories.map(category => category.toLowerCase());

        console.log("Fetched products:", products);

        // Filter products based on the selected categories and the search query
        const filteredProducts = products.filter(product => {
            const productCategory = product.category.toLowerCase(); // Normalize product category to lowercase
            const matchesCategory = normalizedCategories.length === 0 || normalizedCategories.includes(productCategory);
            const matchesQuery = product.name.toLowerCase().includes(query.toLowerCase()) ||
                product.category.toLowerCase().includes(query.toLowerCase());

            return matchesQuery && matchesCategory;
        });

        // Get the container where products will be displayed
        const container = document.getElementById('featured-products-container');
        container.innerHTML = ''; 

        // Display filtered products or a message if no products are found
        if (filteredProducts.length === 0) {
            container.innerHTML = '<p>No products found for your search.</p>';
        } else {
            filteredProducts.forEach(product => {
                // Limit description length (e.g., 100 characters)
                const truncatedDescription = product.description.length > 100
                    ? product.description.substring(0, 100) + '...'
                    : product.description;
                    const productHTML = `
                    <div class="col-md-4">
                        <div class="card mb-4">
                            <img src="${product.imageUrl}" alt="${product.name}" class="card-img-top">
                            <div class="card-body">
                                <h5 class="card-title">${product.name}</h5>
                                <p class="category">Category: ${product.category}</p>
                                <p class="card-text">${truncatedDescription}</p>
                                <p class="price"><strong>฿${product.price.toFixed(2)}</strong></p>
                                <p class="stock">Stock: ${product.stock}</p>
                                <a href="product-details.html?productId=${product._id}" class="btn btn-primary">View Details</a>
                            </div>
                        </div>
                    </div>
                `;
                container.innerHTML += productHTML;
            });
        }
    } catch (error) {
        console.error('Failed to fetch featured products:', error);
    }
}

// Search products based on user input
function searchProducts(event) {
    event.preventDefault(); // Prevent form submission to keep the page from refreshing

    const query = document.getElementById('search-query').value.trim(); // Get the search query
    const selectedCategories = Array.from(document.querySelectorAll('.category-filter:checked'))
        .map(checkbox => checkbox.value);

    console.log("Search query:", query);
    console.log("Selected categories:", selectedCategories);

    // Fetch products based on the search query and selected categories
    fetchFeaturedProducts(query, selectedCategories);
}

// Update the cart display
function updateCart() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartItemsDiv = document.getElementById('cart-items');
    const totalPriceSpan = document.getElementById('total-price');
    let totalPrice = 0;

    // Clear the current cart content
    cartItemsDiv.innerHTML = '';

    if (cart.length === 0) {
        cartItemsDiv.innerHTML = '<p>Your cart is empty.</p>';
        totalPriceSpan.textContent = '0.00';
        return;
    }

    // Loop through cart items and create HTML for each product
    cart.forEach((product, index) => {
        const productRow = document.createElement('div');
        productRow.classList.add('row', 'cart-item', 'mb-4', 'align-items-center');
        productRow.innerHTML = `
              <div class="col-md-2">
                  <img src="${product.imageUrl}" alt="${product.name}" class="img-fluid cart-item-image">
              </div>
              <div class="col-md-4">
                  <h5>${product.name}</h5>
                  <p>฿${product.price}</p>
              </div>
              <div class="col-md-2">
                  <input type="number" class="form-control quantity" value="${product.quantity}" min="1" data-index="${index}">
              </div>
              <div class="col-md-2">
                  <p class="item-total">฿${(product.price * product.quantity).toFixed(2)}</p>
              </div>
              <div class="col-md-2">
                  <button class="btn btn-danger remove-item" data-index="${index}">Remove</button>
              </div>
          `;
        cartItemsDiv.appendChild(productRow);
        totalPrice += product.price * product.quantity;
    });

    // Update total price display
    totalPriceSpan.textContent = totalPrice.toFixed(2);
}

// Event listener for quantity change
document.addEventListener('input', function (e) {
    if (e.target.classList.contains('quantity')) {
        const index = e.target.getAttribute('data-index');
        const quantity = parseInt(e.target.value);
        const cart = JSON.parse(localStorage.getItem('cart')) || [];

        if (cart[index]) {
            cart[index].quantity = quantity;
        }

        localStorage.setItem('cart', JSON.stringify(cart));
        updateCart();
    }
});

// Event listener for removing an item
document.addEventListener('click', function (e) {
    if (e.target.classList.contains('remove-item')) {
        const index = e.target.getAttribute('data-index');
        const cart = JSON.parse(localStorage.getItem('cart')) || [];

        cart.splice(index, 1); // Remove the item from the cart array
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCart();
    }
});

// Initialize the cart when the page loads
window.onload = updateCart;

// Extract productId from the URL (query string)
document.addEventListener('DOMContentLoaded', function () {
    const productId = new URLSearchParams(window.location.search).get('productId');
    if (productId) {
        fetchProductDetails(productId);
    }
});

// Fetch product details by ID
function fetchProductDetails(productId) {
    fetch(`http://localhost:3000/api/products/${productId}`)
        .then(response => response.json())
        .then(product => {
            document.getElementById('product-name').innerText = product.name;
            document.getElementById('product-image').src = product.imageUrl;
            document.getElementById('product-description').innerText = product.description;
            document.getElementById('product-price').innerText = `฿${product.price.toFixed(2)}`;

            // Enable the Add to Cart button after product details are loaded
            document.getElementById('add-to-cart').disabled = false;
        })
        .catch(error => {
            console.error('Error fetching product:', error);
            alert('Failed to load product details.');
        });
}

// Handle "Add to Cart" button click
document.getElementById('add-to-cart').addEventListener('click', function () {
    const productName = document.getElementById('product-name').innerText;
    const productImage = document.getElementById('product-image').src;
    const productDescription = document.getElementById('product-description').innerText;
    const productPrice = parseFloat(document.getElementById('product-price').innerText.trim().replace(/[^0-9.]/g, ''));
    const productId = new URLSearchParams(window.location.search).get('productId');

    const product = {
        id: productId,
        name: productName,
        imageUrl: productImage,
        description: productDescription,
        price: productPrice,
        quantity: 1
    };

    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    // If the product is already in the cart, increase the quantity
    const existingProductIndex = cart.findIndex(item => item.id === product.id);
    if (existingProductIndex !== -1) {
        cart[existingProductIndex].quantity += 1;
    } else {
        cart.push(product);
    }

    // Save the updated cart to localStorage
    localStorage.setItem('cart', JSON.stringify(cart));

    alert('Product added to cart');
});

// JavaScript to handle the form submission and redirect
document.getElementById('add-product-form').addEventListener('submit', async (event) => {
    event.preventDefault(); // Prevent default form submission

    // Get form data
    const formData = new FormData(event.target);
    const productData = {
        name: formData.get('name'),
        description: formData.get('description'),
        price: formData.get('price'),
        category: formData.get('category'),
        stock: formData.get('stock'),
        imageUrl: formData.get('imageUrl'),
    };

    try {
        const response = await fetch('/post', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(productData),
        });

        const result = await response.json();
        if (response.ok) {
            // Show success message
            alert(result.message);

            // Redirect to addproduct.html
            window.location.href = 'addproduct.html'; // Redirect
        } else {
            alert(result.error || 'An error occurred');
        }
    } catch (error) {
        alert('An error occurred: ' + error.message);
    }
});


// Function to check if user is logged in and hide/show buttons accordingly
function checkLoginStatus() {
    const token = localStorage.getItem('token'); // Get the token from local storage

    // If token exists, show the profile button and hide the login button
    if (token) {
        document.getElementById('login-btn').style.display = 'none'; // Hide login button
        document.getElementById('profile-btn').style.display = 'inline-block'; // Show profile button
    } else {
        document.getElementById('login-btn').style.display = 'inline-block'; // Show login button
        document.getElementById('profile-btn').style.display = 'none'; // Hide profile button
    }
}

// Function to logout
function logout() {
    localStorage.removeItem('token'); // Remove token from local storage
    checkLoginStatus(); // Update button visibility after logout
}

// Call the function to check login status when the page loads
window.onload = function () {
    checkLoginStatus();
};


