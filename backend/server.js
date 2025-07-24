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

// Serve static files from the main website
app.use(express.static(path.join(__dirname, '..')));

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/avery-website', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
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
    console.log(`Main website: http://localhost:${PORT}`);
    console.log(`Admin dashboard: http://localhost:${PORT}/admin`);
}); 