import Product from './models/Product.js';
import User from './models/users.js';  // Corrected to 'User' instead of 'users'
import bcrypt from 'bcrypt';
import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import cors from 'cors'; // Added CORS for cross-origin requests
import jwt from 'jsonwebtoken';
import { authenticateToken } from './middleware/auth.js';  // Import the middleware

// Load environment variables
dotenv.config();
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors()); // Enable CORS for cross-origin requests

// Check if MONGO_URL is set in the environment
if (!process.env.MONGO_URL) {
    console.error("MONGO_URL environment variable is missing");
    process.exit(1);
}

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("Connected to MongoDB successfully"))
    .catch((err) => console.error("Error connecting to MongoDB:", err));

// Serve static files from 'public' directory
app.use(express.static(path.join(path.resolve(), 'public')));

// Route to get all products
app.get('/api/products', async (req, res) => {
    try {
        const products = await Product.find(); // Fetch all products from MongoDB
        res.json(products); // Send products as JSON
    } catch (error) {
        res.status(500).json({ error: error.message }); // Send error message if something goes wrong
    }
});

// Route to search for products
app.get('/api/products/search', async (req, res) => {
    try {
        const { query, category } = req.query;
        const filters = {};

        // If there's a query, match the product name
        if (query) {
            filters.name = { $regex: query, $options: 'i' }; // Case-insensitive search for product name
        }

        // If there's a category, match the category
        if (category) {
            filters.category = category;
        }

        // If no filters are applied, return all products
        const products = await Product.find(filters); // Query the products collection based on the filters
        res.json(products); // Return the matching products as JSON
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ error: 'Failed to fetch products' });
    }
});

// Route to get a product by its ID
app.get('/api/products/:productId', async (req, res) => {
    try {
        const { productId } = req.params;
        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        res.json(product);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Route to create a new product
app.post('/post', async (req, res) => {
    const { name, description, price, category, stock, imageUrl } = req.body;

    // Create a new product
    const newProduct = new Product({
        name,
        description,
        price,
        category,
        stock,
        imageUrl,
    });

    try {
        // Save the product to the database
        await newProduct.save();
        console.log('Product added:', newProduct);

        // Send success response
        res.status(201).json({ message: 'Product added successfully' });
    } catch (error) {
        console.error('Error saving product:', error);
        res.status(500).json({ error: error.message });
    }
});

// Route for user registration
app.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Check if the email is already registered
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create and save the new user
        const newUser = new User({ username, email, password: hashedPassword });
        await newUser.save();

        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Login route to check credentials
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Find the user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        // Compare the password with the hashed password
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        // Generate a JWT token
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        // Send the token in the response
        res.status(200).json({ message: 'Login successful', token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Route for user data (protected)
app.get('/user', authenticateToken, async (req, res) => {
    const userId = req.user.userId; // Get userId from the decoded token

    try {
        // Find the user in the database using the userId
        const user = await User.findById(userId).select('-password'); // Exclude the password field

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Send the user data (excluding sensitive information like password)
        res.json(user);
    } catch (error) {
        console.error('Error fetching user data:', error);
        res.status(500).json({ message: 'Error fetching user data' });
    }
});


// Start the server on port 3000
app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});
