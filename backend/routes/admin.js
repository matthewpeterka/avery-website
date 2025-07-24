const express = require('express');
const Product = require('../models/Product');
const User = require('../models/User');
const { adminAuth } = require('../middleware/auth');

const router = express.Router();

// Get dashboard statistics
router.get('/stats', adminAuth, async (req, res) => {
    try {
        const totalProducts = await Product.countDocuments();
        const activeProducts = await Product.countDocuments({ isActive: true });
        const topPicks = await Product.countDocuments({ isTopPick: true });
        const totalUsers = await User.countDocuments();
        
        // Get products by category
        const categoryStats = await Product.aggregate([
            { $match: { isActive: true } },
            { $group: { _id: '$category', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);
        
        // Get recent products
        const recentProducts = await Product.find({ isActive: true })
            .sort({ createdAt: -1 })
            .limit(5)
            .select('title category createdAt');
        
        res.json({
            totalProducts,
            activeProducts,
            topPicks,
            totalUsers,
            categoryStats,
            recentProducts
        });
    } catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({ error: 'Failed to fetch statistics' });
    }
});

// Get all products for admin (including inactive)
router.get('/products', adminAuth, async (req, res) => {
    try {
        const { page = 1, limit = 20, category, search, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
        
        let query = {};
        
        if (category) {
            query.category = category;
        }
        
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { tags: { $in: [new RegExp(search, 'i')] } }
            ];
        }
        
        const sortOptions = {};
        sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;
        
        const products = await Product.find(query)
            .sort(sortOptions)
            .limit(parseInt(limit))
            .skip((parseInt(page) - 1) * parseInt(limit));
            
        const total = await Product.countDocuments(query);
        
        res.json({
            products,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / parseInt(limit)),
                totalItems: total,
                itemsPerPage: parseInt(limit)
            }
        });
    } catch (error) {
        console.error('Get admin products error:', error);
        res.status(500).json({ error: 'Failed to fetch products' });
    }
});

// Bulk operations
router.post('/products/bulk', adminAuth, async (req, res) => {
    try {
        const { action, productIds } = req.body;
        
        switch (action) {
            case 'activate':
                await Product.updateMany(
                    { _id: { $in: productIds } },
                    { isActive: true }
                );
                break;
            case 'deactivate':
                await Product.updateMany(
                    { _id: { $in: productIds } },
                    { isActive: false }
                );
                break;
            case 'delete':
                await Product.deleteMany({ _id: { $in: productIds } });
                break;
            default:
                return res.status(400).json({ error: 'Invalid action' });
        }
        
        res.json({ message: `Products ${action}d successfully` });
    } catch (error) {
        console.error('Bulk operation error:', error);
        res.status(500).json({ error: 'Failed to perform bulk operation' });
    }
});

// Export products
router.get('/products/export', adminAuth, async (req, res) => {
    try {
        const products = await Product.find({}).sort({ createdAt: -1 });
        
        const csvData = products.map(product => ({
            title: product.title,
            description: product.description,
            price: product.price,
            link: product.link,
            category: product.category,
            isTopPick: product.isTopPick,
            rank: product.rank,
            isActive: product.isActive,
            tags: product.tags.join(', '),
            createdAt: product.createdAt.toISOString()
        }));
        
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=products.csv');
        
        // Simple CSV conversion
        const csv = [
            Object.keys(csvData[0]).join(','),
            ...csvData.map(row => Object.values(row).map(val => `"${val}"`).join(','))
        ].join('\n');
        
        res.send(csv);
    } catch (error) {
        console.error('Export error:', error);
        res.status(500).json({ error: 'Failed to export products' });
    }
});

module.exports = router; 