const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Multer configuration for file uploads
const multer = require('multer');
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + '.' + file.originalname.split('.').pop());
    }
});
const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: function (req, file, cb) {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'), false);
        }
    }
});

// Serve static files from the main website (root directory)
app.use(express.static(path.join(__dirname, '..')));
app.use('/styles.css', express.static(path.join(__dirname, '../styles.css')));
app.use('/script.js', express.static(path.join(__dirname, '../script.js')));
app.use('/products.js', express.static(path.join(__dirname, '../products.js')));
app.use('/images', express.static(path.join(__dirname, '../images')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/avery-website', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 30000,
    socketTimeoutMS: 45000,
    maxPoolSize: 10,
    minPoolSize: 1,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/admin', require('./routes/admin'));

// Serve admin dashboard
app.use('/admin', express.static(path.join(__dirname, '../admin-dashboard')));

// API health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Avery\'s Shopping Guide API is running' });
});

// IP check endpoint
app.get('/api/ip', (req, res) => {
    const clientIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    res.json({ 
        clientIP: clientIP,
        headers: req.headers,
        message: 'This shows the IP address making the request'
    });
});

// Serve main website routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../index.html'));
});

app.get('/top-picks', (req, res) => {
    res.sendFile(path.join(__dirname, '../top-picks.html'));
});

app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname, '../about.html'));
});

app.get('/faq', (req, res) => {
    res.sendFile(path.join(__dirname, '../faq.html'));
});

// Admin dashboard route
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, '../admin-dashboard/index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    if (process.env.NODE_ENV !== 'production') {
        console.log(`Main website: http://localhost:${PORT}`);
        console.log(`Admin dashboard: http://localhost:${PORT}/admin`);
    }
}); 