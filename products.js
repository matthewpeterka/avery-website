// API configuration
const API_BASE_URL = 'https://avery-website-backend.onrender.com/api'; // Deployed backend URL

// Fallback data in case API is not available
const fallbackTopPicks = [
    {
        id: 1,
        title: "Wireless Bluetooth Headphones",
        description: "Premium sound quality with noise cancellation. Perfect for workouts and daily commutes. 30-hour battery life and comfortable fit.",
        price: "$89.99",
        image: "🎧",
        link: "https://amazon.com/dp/example1",
        category: "Tech"
    },
    {
        id: 2,
        title: "Organic Face Moisturizer",
        description: "Hydrating daily moisturizer with natural ingredients. Suitable for all skin types. Leaves skin feeling soft and refreshed.",
        price: "$24.99",
        image: "🧴",
        link: "https://sephora.com/product/example2",
        category: "Beauty"
    },
    {
        id: 3,
        title: "Smart Water Bottle",
        description: "Track your hydration with this smart water bottle. Connects to your phone and reminds you to drink water throughout the day.",
        price: "$49.99",
        image: "💧",
        link: "https://target.com/p/example3",
        category: "Wellness"
    },
    {
        id: 4,
        title: "Cozy Throw Blanket",
        description: "Ultra-soft blanket perfect for snuggling on the couch. Made from sustainable materials and comes in beautiful colors.",
        price: "$34.99",
        image: "🛋️",
        link: "https://anthropologie.com/product/example4",
        category: "Home"
    },
    {
        id: 5,
        title: "Portable Phone Charger",
        description: "10,000mAh power bank that charges your phone multiple times. Compact design perfect for travel and daily use.",
        price: "$19.99",
        image: "🔋",
        link: "https://bestbuy.com/sku/example5",
        category: "Tech"
    },
    {
        id: 6,
        title: "Yoga Mat",
        description: "Premium non-slip yoga mat perfect for home workouts and studio sessions. Eco-friendly materials and comfortable cushioning.",
        price: "$29.99",
        image: "🧘‍♀️",
        link: "https://lululemon.com/product/example6",
        category: "Fitness"
    }
];

// Global variable to store products from API
let topPicks = [];

// Function to fetch products from API
async function fetchTopPicks() {
    try {
        const response = await fetch(`${API_BASE_URL}/products/top-picks`);
        if (response.ok) {
            const data = await response.json();
            topPicks = data.map((product, index) => ({
                ...product,
                id: product._id || index + 1
            }));
            return true;
        } else {
            console.warn('Failed to fetch from API, using fallback data');
            topPicks = fallbackTopPicks;
            return false;
        }
    } catch (error) {
        console.warn('API not available, using fallback data:', error);
        topPicks = fallbackTopPicks;
        return false;
    }
}

// Function to display products on the top picks page
function displayProducts() {
    const productsGrid = document.getElementById('productsGrid');
    
    if (!productsGrid) return;

    productsGrid.innerHTML = '';

    topPicks.forEach((product, index) => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.style.animationDelay = `${index * 0.1}s`;
        
        // Handle image display - check if it's a URL or emoji
        const imageContent = product.image && (product.image.startsWith('http') || product.image.startsWith('/uploads/')) 
            ? `<img src="${product.image}" alt="${product.title}" onerror="this.style.display='none'; this.nextElementSibling.style.display='inline';" /><span style="display: none;">🛍️</span>`
            : `<span>${product.image || '🛍️'}</span>`;
        
        productCard.innerHTML = `
            <div class="product-image">
                ${imageContent}
            </div>
            <div class="product-content">
                <h3 class="product-title">${product.title}</h3>
                <p class="product-description">${product.description}</p>
                <div class="product-price">${product.price}</div>
                <a href="${product.link}" class="product-link" target="_blank" rel="noopener noreferrer">
                    Shop Now
                </a>
            </div>
        `;

        // Add click tracking (you can integrate with analytics here)
        const shopLink = productCard.querySelector('.product-link');
        shopLink.addEventListener('click', function() {
            // Track product clicks (you can add Google Analytics or other tracking here)
            console.log(`Product clicked: ${product.title}`);
            
            // Optional: Add a small delay to show the click was registered
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = '';
            }, 150);
        });

        productsGrid.appendChild(productCard);
    });

    // Add fade-in animation to product cards
    const productCards = document.querySelectorAll('.product-card');
    productCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 100);
    });
}

// Function to filter products by category (for future use)
function filterProducts(category) {
    const filteredProducts = category === 'all' 
        ? topPicks 
        : topPicks.filter(product => product.category.toLowerCase() === category.toLowerCase());
    
    return filteredProducts;
}

// Function to search products (for future use)
function searchProducts(query) {
    const searchResults = topPicks.filter(product => 
        product.title.toLowerCase().includes(query.toLowerCase()) ||
        product.description.toLowerCase().includes(query.toLowerCase()) ||
        product.category.toLowerCase().includes(query.toLowerCase())
    );
    
    return searchResults;
}

// Initialize products when the page loads
document.addEventListener('DOMContentLoaded', async function() {
    // Check if we're on the top picks page
    if (window.location.pathname.includes('top-picks.html') || 
        window.location.pathname.endsWith('/') && document.getElementById('productsGrid')) {
        // Try to fetch from API first, then display
        await fetchTopPicks();
        displayProducts();
    }
});



// Export functions for potential future use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        topPicks,
        displayProducts,
        filterProducts,
        searchProducts
    };
} 