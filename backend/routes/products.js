const express = require('express');
const Product = require('../models/Product');
const { auth, adminAuth } = require('../middleware/auth');
const multer = require('multer');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const path = require('path');

const router = express.Router();

// AWS S3 configuration
const s3Client = new S3Client({
    region: process.env.AWS_REGION || 'us-east-1',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    }
});

// Custom multer storage for S3
const s3Storage = multer.memoryStorage();

// Multer configuration
const upload = multer({
    storage: s3Storage,
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

// Helper function to upload to S3
async function uploadToS3(file) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const filename = `uploads/${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`;
    
    const command = new PutObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET || 'avery-website-images',
        Key: filename,
        Body: file.buffer,
        ContentType: file.mimetype
    });
    
    await s3Client.send(command);
    return `https://${process.env.AWS_S3_BUCKET || 'avery-website-images'}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${filename}`;
}

// Get all products (public)
router.get('/', async (req, res) => {
    try {
        const { category, search, limit = 50 } = req.query;
        
        let query = { isActive: true };
        
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
        
        const products = await Product.find(query)
            .sort({ rank: -1, createdAt: -1 })
            .limit(parseInt(limit));
            
        res.json(products);
    } catch (error) {
        console.error('Get products error:', error);
        res.status(500).json({ error: 'Failed to fetch products' });
    }
});

// Get top picks (public)
router.get('/top-picks', async (req, res) => {
    try {
        const topPicks = await Product.find({ 
            isActive: true, 
            isTopPick: true 
        })
        .sort({ rank: -1 })
        .limit(6);
        
        res.json(topPicks);
    } catch (error) {
        console.error('Get top picks error:', error);
        res.status(500).json({ error: 'Failed to fetch top picks' });
    }
});

// Get product by ID (public)
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findOne({ 
            _id: req.params.id, 
            isActive: true 
        });
        
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        
        res.json(product);
    } catch (error) {
        console.error('Get product error:', error);
        res.status(500).json({ error: 'Failed to fetch product' });
    }
});

// Create product (admin only)
router.post('/', adminAuth, upload.single('image'), async (req, res) => {
    try {
        const productData = {
            title: req.body.title,
            description: req.body.description,
            price: req.body.price,
            link: req.body.link,
            category: req.body.category,
            rank: parseInt(req.body.rank) || 0,
            tags: req.body.tags ? req.body.tags.split(',').map(tag => tag.trim()) : [],
            isTopPick: req.body.isTopPick === 'true',
            isActive: req.body.isActive === 'true'
        };

        // Check if trying to add as top pick and validate limit
        if (productData.isTopPick) {
            const currentTopPicks = await Product.countDocuments({ isTopPick: true });
            if (currentTopPicks >= 6) {
                return res.status(400).json({ error: 'Maximum of 6 top picks allowed. Please remove an existing top pick first.' });
            }
        }

        // Handle image upload
        if (req.file) {
            productData.image = await uploadToS3(req.file); // S3 URL
        } else {
            productData.image = '🛍️'; // Default emoji
        }

        const product = new Product(productData);
        await product.save();
        
        res.status(201).json(product);
    } catch (error) {
        console.error('Create product error:', error);
        res.status(400).json({ error: 'Failed to create product' });
    }
});

// Update product (admin only)
router.put('/:id', adminAuth, upload.single('image'), async (req, res) => {
    try {
        const updateData = {
            title: req.body.title,
            description: req.body.description,
            price: req.body.price,
            link: req.body.link,
            category: req.body.category,
            rank: parseInt(req.body.rank) || 0,
            tags: req.body.tags ? req.body.tags.split(',').map(tag => tag.trim()) : [],
            isTopPick: req.body.isTopPick === 'true',
            isActive: req.body.isActive === 'true'
        };

        // Check if trying to add as top pick and validate limit
        if (updateData.isTopPick) {
            const currentTopPicks = await Product.countDocuments({ isTopPick: true });
            const isCurrentlyTopPick = await Product.findById(req.params.id).then(p => p?.isTopPick);
            
            // Only check limit if this product wasn't already a top pick
            if (!isCurrentlyTopPick && currentTopPicks >= 6) {
                return res.status(400).json({ error: 'Maximum of 6 top picks allowed. Please remove an existing top pick first.' });
            }
        }

        // Handle image upload if new image is provided
        if (req.file) {
            updateData.image = await uploadToS3(req.file);
        }

        const product = await Product.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        );
        
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        
        res.json(product);
    } catch (error) {
        console.error('Update product error:', error);
        res.status(400).json({ error: 'Failed to update product' });
    }
});

// Delete product (admin only)
router.delete('/:id', adminAuth, async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        
        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        console.error('Delete product error:', error);
        res.status(500).json({ error: 'Failed to delete product' });
    }
});

// Toggle top pick status (admin only)
router.patch('/:id/toggle-top-pick', adminAuth, async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        
        product.isTopPick = !product.isTopPick;
        await product.save();
        
        res.json(product);
    } catch (error) {
        console.error('Toggle top pick error:', error);
        res.status(500).json({ error: 'Failed to toggle top pick status' });
    }
});

// Update product rank (admin only)
router.patch('/:id/rank', adminAuth, async (req, res) => {
    try {
        const { rank } = req.body;
        
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            { rank },
            { new: true }
        );
        
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        
        res.json(product);
    } catch (error) {
        console.error('Update rank error:', error);
        res.status(500).json({ error: 'Failed to update rank' });
    }
});

// Reorder top picks (admin only)
router.put('/top-picks/reorder', adminAuth, async (req, res) => {
    try {
        const { order } = req.body;
        
        console.log('Received reorder request:', order);
        
        if (!Array.isArray(order)) {
            return res.status(400).json({ error: 'Order must be an array' });
        }

        // Update each product's rank
        for (const item of order) {
            console.log(`Updating product ${item.productId} to rank ${item.rank}`);
            const updatedProduct = await Product.findByIdAndUpdate(
                item.productId,
                { rank: item.rank },
                { new: true }
            );
            console.log('Updated product:', updatedProduct);
        }

        // Return updated top picks
        const topPicks = await Product.find({ 
            isActive: true, 
            isTopPick: true 
        })
        .sort({ rank: 1 })
        .limit(6);

        console.log('Returning updated top picks:', topPicks);
        res.json(topPicks);
    } catch (error) {
        console.error('Reorder top picks error:', error);
        res.status(500).json({ error: 'Failed to reorder top picks' });
    }
});

// Get categories (public)
router.get('/categories/list', async (req, res) => {
    try {
        const categories = await Product.distinct('category', { isActive: true });
        res.json(categories);
    } catch (error) {
        console.error('Get categories error:', error);
        res.status(500).json({ error: 'Failed to fetch categories' });
    }
});

module.exports = router; 