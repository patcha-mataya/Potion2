// Handle the login form submission
async function handleLogin(event) {
    event.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    // Send login request to the server
    try {
        const response = await fetch('http://localhost:3000/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {
            // Login success - save the token to localStorage
            localStorage.setItem('token', data.token); // Store token in localStorage
            alert('Login successful!');
            window.location.href = 'index.html'; // Redirect to the homepage or dashboard
        } else {
            alert(data.message || 'Invalid credentials');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred. Please try again.');
    }
}

// Fetch user profile data
async function fetchUserProfile() {
    const token = localStorage.getItem('token'); // Get the token from localStorage

    if (!token) {
        console.log('No token found, user is not logged in');
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/user', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}` // Send token in Authorization header
            }
        });

        const data = await response.json();

        if (response.ok) {
            // Successfully fetched user data
            console.log('User data:', data);
            displayUserProfile(data); // Display the user profile
        } else {
            console.error('Failed to fetch user data:', data.message);
            alert(data.message || 'Failed to fetch user data');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while fetching user data');
    }
}
