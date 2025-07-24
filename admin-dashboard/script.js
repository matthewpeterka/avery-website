// Configuration
const API_BASE_URL = 'https://avery-website-backend.onrender.com/api'; // Deployed backend URL
const ADMIN_BASE_URL = 'https://avery-website-backend.onrender.com'; // Deployed backend URL

// State management
let currentUser = null;
let currentPage = 1;
let productsPerPage = 20;
let allProducts = [];
let filteredProducts = [];

// DOM elements
const loginScreen = document.getElementById('loginScreen');
const dashboard = document.getElementById('dashboard');
const loginForm = document.getElementById('loginForm');
const loginError = document.getElementById('loginError');
const logoutBtn = document.getElementById('logoutBtn');
const userName = document.getElementById('userName');
const pageTitle = document.getElementById('pageTitle');

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    console.log('Initializing app...');
    
    // Check if user is already logged in
    const token = localStorage.getItem('adminToken');
    if (token) {
        validateToken(token);
    } else {
        showLoginScreen();
    }

    // Event listeners
    setupEventListeners();
    
    // Check what pages are available on initialization
    const allPages = document.querySelectorAll('.page');
    const pageIds = Array.from(allPages).map(p => p.id);
    console.log('Pages available on init:', pageIds);
    
    // Check if addProductPage exists specifically
    const addProductPage = document.getElementById('addProductPage');
    console.log('addProductPage element exists:', !!addProductPage);
    if (addProductPage) {
        console.log('addProductPage classes:', addProductPage.className);
    }
}

function setupEventListeners() {
    // Login form
    loginForm.addEventListener('submit', handleLogin);

    // Logout
    logoutBtn.addEventListener('click', handleLogout);

    // Navigation
    document.querySelectorAll('.menu-item').forEach(item => {
        item.addEventListener('click', () => navigateToPage(item.dataset.page));
    });

    // Search and filters
    const searchInput = document.getElementById('productSearch');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(handleSearch, 300));
    }

    const categoryFilter = document.getElementById('categoryFilter');
    if (categoryFilter) {
        categoryFilter.addEventListener('change', handleCategoryFilter);
    }

    // Pagination
    const prevBtn = document.getElementById('prevPage');
    const nextBtn = document.getElementById('nextPage');
    if (prevBtn) prevBtn.addEventListener('click', () => changePage(-1));
    if (nextBtn) nextBtn.addEventListener('click', () => changePage(1));

    // Forms
    const addProductForm = document.getElementById('addProductForm');
    if (addProductForm) {
        addProductForm.addEventListener('submit', handleAddProduct);
    }

    const editProductForm = document.getElementById('editProductForm');
    if (editProductForm) {
        editProductForm.addEventListener('submit', handleEditProduct);
    }

    // Modal
    const modalCloseBtns = document.querySelectorAll('.modal-close');
    modalCloseBtns.forEach(btn => {
        btn.addEventListener('click', closeModal);
    });

    // Export
    const exportBtn = document.getElementById('exportBtn');
    if (exportBtn) {
        exportBtn.addEventListener('click', handleExport);
    }
}

// Authentication functions
async function handleLogin(e) {
    e.preventDefault();
    
    const formData = new FormData(loginForm);
    const username = formData.get('username');
    const password = formData.get('password');

    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem('adminToken', data.token);
            currentUser = data.user;
            showDashboard();
            loadDashboardData();
        } else {
            showLoginError(data.error || 'Login failed');
        }
    } catch (error) {
        console.error('Login error:', error);
        showLoginError('Network error. Please try again.');
    }
}

async function validateToken(token) {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/me`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            currentUser = data.user;
            showDashboard();
            loadDashboardData();
        } else {
            localStorage.removeItem('adminToken');
            showLoginScreen();
        }
    } catch (error) {
        console.error('Token validation error:', error);
        localStorage.removeItem('adminToken');
        showLoginScreen();
    }
}

function handleLogout() {
    localStorage.removeItem('adminToken');
    currentUser = null;
    showLoginScreen();
}

function showLoginError(message) {
    loginError.textContent = message;
    loginError.style.display = 'block';
    setTimeout(() => {
        loginError.style.display = 'none';
    }, 5000);
}

function showLoginScreen() {
    loginScreen.style.display = 'flex';
    dashboard.style.display = 'none';
}

function showDashboard() {
    loginScreen.style.display = 'none';
    dashboard.style.display = 'flex';
    if (currentUser) {
        userName.textContent = currentUser.username;
    }
}

// Navigation functions
function navigateToPage(page) {
    console.log('Navigating to page:', page);
    
    // Update active menu item
    document.querySelectorAll('.menu-item').forEach(item => {
        item.classList.remove('active');
    });
    const menuItem = document.querySelector(`[data-page="${page}"]`);
    if (menuItem) {
        menuItem.classList.add('active');
    }

    // Hide all pages
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));

    // Show selected page - use querySelector instead of getElementById
    const targetPage = document.querySelector(`#${page}Page`);
    console.log('Target page element:', targetPage);
    if (targetPage) {
        console.log('Adding active class to page');
        targetPage.classList.add('active');
        console.log('Page classes after adding active:', targetPage.className);
        updatePageTitle(page);
        loadPageData(page);
    } else {
        console.error('Page not found:', page);
        // Let's check what pages are actually available
        const allPages = document.querySelectorAll('.page');
        const pageIds = Array.from(allPages).map(p => p.id);
        console.log('Available pages:', pageIds);
        console.log('Looking for page ID:', `${page}Page`);
        
        // Try to find the page using a different approach
        const pageElement = Array.from(allPages).find(p => p.id === `${page}Page`);
        if (pageElement) {
            console.log('Found page using alternative method:', pageElement);
            console.log('Page element classes before:', pageElement.className);
            pageElement.classList.add('active');
            console.log('Page element classes after:', pageElement.className);
            updatePageTitle(page);
            loadPageData(page);
        } else {
            console.error('Page not found even with alternative method');
        }
    }
}

function updatePageTitle(page) {
    const titles = {
        'overview': 'Dashboard Overview',
        'products': 'Product Management',
        'add-product': 'Add New Product',
        'top-picks': 'Manage Top Picks',
        'categories': 'Category Management'
    };
    pageTitle.textContent = titles[page] || 'Dashboard';
}

function loadPageData(page) {
    switch (page) {
        case 'overview':
            loadDashboardStats();
            break;
        case 'products':
            loadProducts();
            break;
        case 'add-product':
            // Add Product page doesn't need to load data
            break;
        case 'top-picks':
            loadTopPicks();
            break;
        case 'categories':
            loadCategories();
            break;
    }
}

// Dashboard functions
async function loadDashboardData() {
    await Promise.all([
        loadDashboardStats(),
        loadRecentProducts()
    ]);
}

async function loadDashboardStats() {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/stats`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
            }
        });

        if (response.ok) {
            const stats = await response.json();
            updateStatsDisplay(stats);
            updateCategoryChart(stats.categoryStats);
        }
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

function updateStatsDisplay(stats) {
    document.getElementById('totalProducts').textContent = stats.totalProducts;
    document.getElementById('activeProducts').textContent = stats.activeProducts;
    document.getElementById('topPicks').textContent = stats.topPicks;
    document.getElementById('totalUsers').textContent = stats.totalUsers;
}

function updateCategoryChart(categoryStats) {
    const chartContainer = document.getElementById('categoryChart');
    if (!chartContainer) return;

    if (categoryStats.length === 0) {
        chartContainer.innerHTML = '<div class="loading">No data available</div>';
        return;
    }

    // Simple text-based chart
    let chartHTML = '<div class="category-chart">';
    categoryStats.forEach(category => {
        const percentage = Math.round((category.count / categoryStats.reduce((sum, c) => sum + c.count, 0)) * 100);
        chartHTML += `
            <div class="chart-item">
                <div class="chart-label">${category._id}</div>
                <div class="chart-bar">
                    <div class="chart-fill" style="width: ${percentage}%"></div>
                </div>
                <div class="chart-value">${category.count} (${percentage}%)</div>
            </div>
        `;
    });
    chartHTML += '</div>';
    chartContainer.innerHTML = chartHTML;
}

async function loadRecentProducts() {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/stats`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            updateRecentProducts(data.recentProducts);
        }
    } catch (error) {
        console.error('Error loading recent products:', error);
    }
}

function updateRecentProducts(products) {
    const container = document.getElementById('recentProducts');
    if (!container) return;

    if (products.length === 0) {
        container.innerHTML = '<div class="loading">No recent products</div>';
        return;
    }

    let html = '';
    products.forEach(product => {
        const date = new Date(product.createdAt).toLocaleDateString();
        html += `
            <div class="recent-item">
                <h4>${product.title}</h4>
                <p>${product.category} • ${date}</p>
            </div>
        `;
    });
    container.innerHTML = html;
}

// Product management functions
async function loadProducts() {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/products?page=${currentPage}&limit=${productsPerPage}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            allProducts = data.products;
            filteredProducts = data.products;
            displayProducts(data.products);
            updatePagination(data.pagination);
            loadCategories();
        }
    } catch (error) {
        console.error('Error loading products:', error);
    }
}

function displayProducts(products) {
    const tbody = document.getElementById('productsTableBody');
    if (!tbody) return;

    if (products.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="loading">No products found</td></tr>';
        return;
    }

    let html = '';
    products.forEach(product => {
        html += `
            <tr>
                <td><input type="checkbox" value="${product._id}"></td>
                <td>
                    <div>
                        <strong>${product.title}</strong>
                        <br>
                        <small>${product.description.substring(0, 50)}...</small>
                    </div>
                </td>
                <td>${product.category}</td>
                <td>${product.price}</td>
                <td>
                    <span class="status-badge ${product.isActive ? 'active' : 'inactive'}">
                        ${product.isActive ? 'Active' : 'Inactive'}
                    </span>
                </td>
                <td>
                    <span class="status-badge ${product.isTopPick ? 'top-pick' : 'regular'}">
                        ${product.isTopPick ? 'Top Pick' : 'Regular'}
                    </span>
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-secondary" onclick="editProduct('${product._id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-danger" onclick="deleteProduct('${product._id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    });
    tbody.innerHTML = html;
}

function updatePagination(pagination) {
    const pageInfo = document.getElementById('pageInfo');
    const prevBtn = document.getElementById('prevPage');
    const nextBtn = document.getElementById('nextPage');

    if (pageInfo) {
        pageInfo.textContent = `Page ${pagination.currentPage} of ${pagination.totalPages}`;
    }

    if (prevBtn) {
        prevBtn.disabled = pagination.currentPage <= 1;
    }

    if (nextBtn) {
        nextBtn.disabled = pagination.currentPage >= pagination.totalPages;
    }
}

function changePage(delta) {
    currentPage += delta;
    loadProducts();
}

// Search and filter functions
function handleSearch(e) {
    const searchTerm = e.target.value.toLowerCase();
    filteredProducts = allProducts.filter(product => 
        product.title.toLowerCase().includes(searchTerm) ||
        product.description.toLowerCase().includes(searchTerm) ||
        product.category.toLowerCase().includes(searchTerm)
    );
    displayProducts(filteredProducts);
}

function handleCategoryFilter(e) {
    const category = e.target.value;
    if (category) {
        filteredProducts = allProducts.filter(product => product.category === category);
    } else {
        filteredProducts = allProducts;
    }
    displayProducts(filteredProducts);
}

// Product CRUD functions
async function handleAddProduct(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const productData = {
        title: formData.get('title'),
        description: formData.get('description'),
        price: formData.get('price'),
        link: formData.get('link'),
        category: formData.get('category'),
        image: formData.get('image') || '🛍️',
        rank: parseInt(formData.get('rank')) || 0,
        tags: formData.get('tags') ? formData.get('tags').split(',').map(tag => tag.trim()) : [],
        isTopPick: formData.get('isTopPick') === 'on',
        isActive: formData.get('isActive') === 'on'
    };

    try {
        const response = await fetch(`${API_BASE_URL}/products`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
            },
            body: JSON.stringify(productData)
        });

        if (response.ok) {
            e.target.reset();
            alert('Product added successfully!');
            navigateToPage('products');
        } else {
            const error = await response.json();
            alert('Error adding product: ' + error.error);
        }
    } catch (error) {
        console.error('Error adding product:', error);
        alert('Network error. Please try again.');
    }
}

async function editProduct(productId) {
    const product = allProducts.find(p => p._id === productId);
    if (!product) return;

    // Populate edit form
    document.getElementById('editProductId').value = product._id;
    document.getElementById('editProductTitle').value = product.title;
    document.getElementById('editProductCategory').value = product.category;
    document.getElementById('editProductDescription').value = product.description;
    document.getElementById('editProductPrice').value = product.price;
    document.getElementById('editProductLink').value = product.link;

    // Show modal
    document.getElementById('editModal').style.display = 'flex';
}

async function handleEditProduct(e) {
    e.preventDefault();
    
    const productId = document.getElementById('editProductId').value;
    const productData = {
        title: document.getElementById('editProductTitle').value,
        category: document.getElementById('editProductCategory').value,
        description: document.getElementById('editProductDescription').value,
        price: document.getElementById('editProductPrice').value,
        link: document.getElementById('editProductLink').value
    };

    try {
        const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
            },
            body: JSON.stringify(productData)
        });

        if (response.ok) {
            closeModal();
            alert('Product updated successfully!');
            loadProducts();
        } else {
            const error = await response.json();
            alert('Error updating product: ' + error.error);
        }
    } catch (error) {
        console.error('Error updating product:', error);
        alert('Network error. Please try again.');
    }
}

async function deleteProduct(productId) {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
        const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
            }
        });

        if (response.ok) {
            alert('Product deleted successfully!');
            loadProducts();
        } else {
            const error = await response.json();
            alert('Error deleting product: ' + error.error);
        }
    } catch (error) {
        console.error('Error deleting product:', error);
        alert('Network error. Please try again.');
    }
}

// Top picks management
async function loadTopPicks() {
    try {
        const response = await fetch(`${API_BASE_URL}/products/top-picks`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
            }
        });

        if (response.ok) {
            const topPicks = await response.json();
            displayTopPicks(topPicks);
        }
    } catch (error) {
        console.error('Error loading top picks:', error);
    }
}

function displayTopPicks(topPicks) {
    const container = document.getElementById('topPicksList');
    if (!container) return;

    if (topPicks.length === 0) {
        container.innerHTML = '<div class="loading">No top picks found</div>';
        return;
    }

    let html = '';
    topPicks.forEach((product, index) => {
        html += `
            <div class="top-pick-item" data-id="${product._id}">
                <div class="pick-rank">#${index + 1}</div>
                <div class="pick-content">
                    <h4>${product.title}</h4>
                    <p>${product.category} • ${product.price}</p>
                </div>
                <div class="pick-actions">
                    <button class="btn btn-secondary" onclick="toggleTopPick('${product._id}')">
                        Remove from Top Picks
                    </button>
                </div>
            </div>
        `;
    });
    container.innerHTML = html;
}

async function toggleTopPick(productId) {
    try {
        const response = await fetch(`${API_BASE_URL}/products/${productId}/toggle-top-pick`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
            }
        });

        if (response.ok) {
            loadTopPicks();
        }
    } catch (error) {
        console.error('Error toggling top pick:', error);
    }
}

// Category management
async function loadCategories() {
    try {
        const response = await fetch(`${API_BASE_URL}/products/categories/list`);
        if (response.ok) {
            const categories = await response.json();
            updateCategoryFilter(categories);
        }
    } catch (error) {
        console.error('Error loading categories:', error);
    }
}

function updateCategoryFilter(categories) {
    const filter = document.getElementById('categoryFilter');
    if (!filter) return;

    // Keep the "All Categories" option
    filter.innerHTML = '<option value="">All Categories</option>';
    
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        filter.appendChild(option);
    });
}

// Export function
async function handleExport() {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/products/export`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
            }
        });

        if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'products.csv';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        }
    } catch (error) {
        console.error('Error exporting products:', error);
        alert('Error exporting products. Please try again.');
    }
}

// Utility functions
function closeModal() {
    document.getElementById('editModal').style.display = 'none';
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Add some CSS for the category chart
const style = document.createElement('style');
style.textContent = `
    .category-chart {
        padding: 1rem 0;
    }
    .chart-item {
        display: flex;
        align-items: center;
        margin-bottom: 0.5rem;
        gap: 1rem;
    }
    .chart-label {
        min-width: 80px;
        color: #d1d5db;
    }
    .chart-bar {
        flex: 1;
        height: 20px;
        background: #374151;
        border-radius: 10px;
        overflow: hidden;
    }
    .chart-fill {
        height: 100%;
        background: #6366f1;
        transition: width 0.3s ease;
    }
    .chart-value {
        min-width: 60px;
        text-align: right;
        color: #9ca3af;
        font-size: 0.9rem;
    }
    .status-badge {
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 0.8rem;
        font-weight: 500;
    }
    .status-badge.active {
        background: #10b981;
        color: white;
    }
    .status-badge.inactive {
        background: #6b7280;
        color: white;
    }
    .status-badge.top-pick {
        background: #f59e0b;
        color: white;
    }
    .status-badge.regular {
        background: #374151;
        color: #d1d5db;
    }
    .top-pick-item {
        display: flex;
        align-items: center;
        padding: 1rem;
        background: #1e293b;
        border: 1px solid #374151;
        border-radius: 8px;
        margin-bottom: 1rem;
    }
    .pick-rank {
        width: 40px;
        height: 40px;
        background: #6366f1;
        color: white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 700;
        margin-right: 1rem;
    }
    .pick-content {
        flex: 1;
    }
    .pick-content h4 {
        margin-bottom: 0.25rem;
    }
    .pick-content p {
        color: #9ca3af;
        font-size: 0.9rem;
    }
`;
document.head.appendChild(style); 