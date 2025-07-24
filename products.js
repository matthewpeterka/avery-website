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

// Function to format description with bullet points
function formatDescription(description) {
    if (!description) return '';
    
    // Split by newlines and filter out empty lines
    const lines = description.split('\n').filter(line => line.trim());
    
    if (lines.length === 0) return '';
    
    // If only one line, return as regular paragraph
    if (lines.length === 1) {
        return `<p class="product-description">${lines[0]}</p>`;
    }
    
    // Multiple lines - format as bullet points
    const bulletPoints = lines.map(line => `<li>${line.trim()}</li>`).join('');
    return `<ul class="product-description-list">${bulletPoints}</ul>`;
}

// Function to display products on the top picks page
function displayProducts() {
    const productsGrid = document.getElementById('productsGrid');
    
    if (!productsGrid) return;

    productsGrid.innerHTML = '';

    // Sort by rank (ascending order - rank 1 first)
    const sortedTopPicks = [...topPicks].sort((a, b) => (a.rank || 0) - (b.rank || 0));

    sortedTopPicks.forEach((product, index) => {
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
                ${formatDescription(product.description)}
                <div class="product-price">${product.price}</div>
                <a href="${product.link}" class="product-lin