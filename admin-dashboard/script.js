// Configuration
const API_BASE_URL = 'https://avery-website-backend.onrender.com/api'; // Deployed backend URL
const ADMIN_BASE_URL = 'https://avery-website-backend.onrender.com'; // Deployed backend URL

// Global page references
let pageElements = {};

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
    // Check if user is already logged in
    const token = localStorage.getItem('adminToken');
    if (token) {
        validateToken(token);
    } else {
        showLoginScreen();
    }

    // Event listeners
    setupEventListeners();
    
    // Store references to all pages
    const allPages = document.querySelectorAll('.page');
    allPages.forEach(page => {
        pageElements[page.id] = page;
    });
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
    
    // Select all checkbox
    const selectAllCheckbox = document.getElementById('selectAll');
    if (selectAllCheckbox) {
        selectAllCheckbox.addEventListener('change', handleSelectAll);
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

    // Image upload for add product
    const uploadImageBtn = document.getElementById('uploadImageBtn');
    const productImageFile = document.getElementById('productImageFile');
    if (uploadImageBtn && productImageFile) {
        uploadImageBtn.addEventListener('click', () => productImageFile.click());
        productImageFile.addEventListener('change', handleImageUpload);
    }

    // Image upload for edit product
    const editUploadImageBtn = document.getElementById('editUploadImageBtn');
    const editProductImageFile = document.getElementById('editProductImageFile');
    if (editUploadImageBtn && editProductImageFile) {
        editUploadImageBtn.addEventListener('click', () => editProductImageFile.click());
        editProductImageFile.addEventListener('change', handleEditImageUpload);
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

    // Show selected page - use stored reference
    // Handle special cases for page mapping
    let pageId;
    if (page === 'add-product') {
        pageId = 'addProductPage';
    } else if (page === 'top-picks') {
        pageId = 'topPicksPage';
    } else {
        pageId = `${page}Page`;
    }
    const pageElement = pageElements[pageId];
    
    if (pageElement) {
        pageElement.classList.add('active');
        updatePageTitle(page);
        loadPageData(page);
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
        case 'tags':
            loadTags();
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
    
    // Reset select all checkbox
    const selectAllCheckbox = document.getElementById('selectAll');
    if (selectAllCheckbox) {
        selectAllCheckbox.checked = false;
    }
    
    // Add event listeners to individual checkboxes
    const checkboxes = tbody.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', updateSelectAllState);
    });
}

function updateSelectAllState() {
    const checkboxes = document.querySelectorAll('#productsTableBody input[type="checkbox"]');
    const selectAllCheckbox = document.getElementById('selectAll');
    
    if (!selectAllCheckbox || checkboxes.length === 0) return;
    
    const checkedCount = Array.from(checkboxes).filter(cb => cb.checked).length;
    
    if (checkedCount === 0) {
        selectAllCheckbox.checked = false;
        selectAllCheckbox.indeterminate = false;
    } else if (checkedCount === checkboxes.length) {
        selectAllCheckbox.checked = true;
        selectAllCheckbox.indeterminate = false;
    } else {
        selectAllCheckbox.checked = false;
        selectAllCheckbox.indeterminate = true;
    }
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

function handleSelectAll(e) {
    const isChecked = e.target.checked;
    const checkboxes = document.querySelectorAll('#productsTableBody input[type="checkbox"]');
    
    checkboxes.forEach(checkbox => {
        checkbox.checked = isChecked;
    });
}

// Product CRUD functions
async function handleAddProduct(e) {
    e.preventDefault();
    
    const isTopPick = e.target.isTopPick.checked;
    
    // Check top picks limit before submitting
    if (isTopPick) {
        const currentTopPicks = allProducts.filter(p => p.isTopPick).length;
        if (currentTopPicks >= 6) {
            alert('Maximum of 6 top picks allowed. Please remove an existing top pick first.');
            return;
        }
    }
    
    const formData = new FormData();
    
    // Add basic form data
    formData.append('title', e.target.title.value);
    formData.append('description', e.target.description.value);
    formData.append('price', e.target.price.value);
    formData.append('link', e.target.link.value);
    formData.append('category', e.target.category.value);
    formData.append('rank', e.target.rank.value || '0');
    formData.append('tags', e.target.tags.value);
    formData.append('isTopPick', isTopPick);
    formData.append('isActive', e.target.isActive.checked);
    
    // Add image file if selected
    const imageFile = document.getElementById('productImageFile').files[0];
    if (imageFile) {
        formData.append('image', imageFile);
    }

    try {
        const response = await fetch(`${API_BASE_URL}/products`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
            },
            body: formData
        });

        if (response.ok) {
            alert('Product added successfully!');
            e.target.reset();
            // Clear image preview
            document.getElementById('imagePreview').style.display = 'none';
            document.getElementById('imageFileName').textContent = '';
            loadProducts();
        } else {
            const error = await response.json();
            alert(error.error || 'Failed to add product');
        }
    } catch (error) {
        console.error('Error adding product:', error);
        alert('Error adding product. Please try again.');
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
    document.getElementById('editProductRank').value = product.rank || 0;
    document.getElementById('editProductTags').value = product.tags ? product.tags.join(', ') : '';
    document.getElementById('editIsTopPick').checked = product.isTopPick || false;
    document.getElementById('editIsActive').checked = product.isActive !== false; // Default to true if not set

    // Clear any previous image preview
    const imagePreview = document.getElementById('editImagePreview');
    const imageFileName = document.getElementById('editImageFileName');
    if (imagePreview) imagePreview.style.display = 'none';
    if (imageFileName) imageFileName.textContent = '';

    // Show modal
    document.getElementById('editModal').style.display = 'flex';
}

async function handleEditProduct(e) {
    e.preventDefault();
    
    const productId = document.getElementById('editProductId').value;
    const imageFile = document.getElementById('editProductImageFile').files[0];
    
    // Create FormData for multipart/form-data submission
    const formData = new FormData();
    formData.append('title', document.getElementById('editProductTitle').value);
    formData.append('category', document.getElementById('editProductCategory').value);
    formData.append('description', document.getElementById('editProductDescription').value);
    formData.append('price', document.getElementById('editProductPrice').value);
    formData.append('link', document.getElementById('editProductLink').value);
    formData.append('rank', document.getElementById('editProductRank').value);
    formData.append('tags', document.getElementById('editProductTags').value);
    formData.append('isTopPick', document.getElementById('editIsTopPick').checked);
    formData.append('isActive', document.getElementById('editIsActive').checked);
    
    // Add image file if selected
    if (imageFile) {
        formData.append('image', imageFile);
    }

    try {
        const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
            },
            body: formData
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

    // Sort by rank (ascending order - rank 1 first)
    const sortedTopPicks = [...topPicks].sort((a, b) => (a.rank || 0) - (b.rank || 0));

    let html = '';
    sortedTopPicks.forEach((product, index) => {
        // Add $ to price if it doesn't already have one
        const displayPrice = product.price && !product.price.startsWith('$') ? `$${product.price}` : product.price;
        
        html += `
            <div class="top-pick-item" data-id="${product._id}" draggable="true">
                <div class="pick-rank">#${index + 1}</div>
                <div class="pick-content">
                    <h4>${product.title}</h4>
                    <p>${product.category} • ${displayPrice}</p>
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
    
    // Setup drag and drop functionality
    setupDragAndDrop();
}

// Drag and drop functionality for top picks
function setupDragAndDrop() {
    const container = document.getElementById('topPicksList');
    if (!container) return;

    let draggedItem = null;

    // Add event listeners to all draggable items
    const items = container.querySelectorAll('.top-pick-item');
    items.forEach(item => {
        item.addEventListener('dragstart', handleDragStart);
        item.addEventListener('dragend', handleDragEnd);
        item.addEventListener('dragover', handleDragOver);
        item.addEventListener('drop', handleDrop);
    });

    function handleDragStart(e) {
        draggedItem = this;
        this.style.opacity = '0.5';
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/html', this.outerHTML);
    }

    function handleDragEnd(e) {
        this.style.opacity = '1';
        // Get fresh items after DOM changes
        const currentItems = container.querySelectorAll('.top-pick-item');
        currentItems.forEach(item => {
            item.classList.remove('over');
        });
    }

    function handleDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        return false;
    }

    function handleDrop(e) {
        e.stopPropagation();
        
        if (draggedItem !== this) {
            // Get fresh items after DOM changes
            const currentItems = container.querySelectorAll('.top-pick-item');
            const allItems = [...currentItems];
            const draggedIndex = allItems.indexOf(draggedItem);
            const droppedIndex = allItems.indexOf(this);

            // Reorder the items
            if (draggedIndex < droppedIndex) {
                this.parentNode.insertBefore(draggedItem, this.nextSibling);
            } else {
                this.parentNode.insertBefore(draggedItem, this);
            }

            // Update the database with new order
            updateTopPicksOrder();
        }

        return false;
    }
}

// Update top picks order in database
async function updateTopPicksOrder() {
    const container = document.getElementById('topPicksList');
    if (!container) return;

    const items = container.querySelectorAll('.top-pick-item');
    const newOrder = Array.from(items).map((item, index) => ({
        productId: item.dataset.id,
        rank: index + 1
    }));

    try {
        const response = await fetch(`${API_BASE_URL}/products/top-picks/reorder`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
            },
            body: JSON.stringify({ order: newOrder })
        });

        if (response.ok) {
            const updatedTopPicks = await response.json();
            
            // Update the rank numbers displayed
            items.forEach((item, index) => {
                const rankElement = item.querySelector('.pick-rank');
                if (rankElement) {
                    rankElement.textContent = `#${index + 1}`;
                }
            });
            
            // Update the global products array to reflect the new order
            updatedTopPicks.forEach((updatedProduct, index) => {
                const existingProductIndex = allProducts.findIndex(p => p._id === updatedProduct._id);
                if (existingProductIndex !== -1) {
                    allProducts[existingProductIndex] = { ...allProducts[existingProductIndex], ...updatedProduct };
                }
            });
        } else {
            const error = await response.json();
            alert('Failed to update order. Please try again.');
            // Reload to show original order
            loadTopPicks();
        }
    } catch (error) {
        alert('Network error. Please try again.');
        // Reload to show original order
        loadTopPicks();
    }
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
            
            // Also load products to get product counts
            const productsResponse = await fetch(`${API_BASE_URL}/admin/products?limit=1000`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
                }
            });
            
            if (productsResponse.ok) {
                const productsData = await productsResponse.json();
                console.log('Categories - Products loaded:', productsData);
                const products = productsData.products || productsData;
                console.log('Categories - Final products array:', products);
                displayCategories(categories, products);
            } else {
                console.log('Categories - Failed to load products');
                displayCategories(categories, []);
            }
        }
    } catch (error) {
        console.error('Error loading categories:', error);
        displayCategories([], []);
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

function displayCategories(categories, products = []) {
    const container = document.getElementById('categoriesList');
    if (!container) return;

    console.log('displayCategories called with:', { categories, productsCount: products.length });

    if (categories.length === 0) {
        container.innerHTML = '<div class="empty-state">No categories found</div>';
        return;
    }

    let html = '<div class="categories-grid">';
    categories.forEach(category => {
        // Get products in this category
        const categoryProducts = products.filter(p => p.category === category && p.isActive);
        const productCount = categoryProducts.length;
        console.log(`Category ${category}: ${productCount} products`);
        
        // Create product list HTML
        let productsHtml = '';
        if (categoryProducts.length > 0) {
            productsHtml = '<div class="category-products">';
            categoryProducts.slice(0, 3).forEach(product => {
                const displayPrice = product.price && !product.price.startsWith('$') ? `$${product.price}` : product.price;
                productsHtml += `
                    <div class="category-product">
                        <span class="product-title">${product.title}</span>
                        <span class="product-price">${displayPrice}</span>
                    </div>
                `;
            });
            if (categoryProducts.length > 3) {
                const moreCount = categoryProducts.length - 3;
                productsHtml += `<div class="more-products">+${moreCount} more ${moreCount === 1 ? 'product' : 'products'}</div>`;
            }
            productsHtml += '</div>';
        }
        
        html += `
            <div class="category-card">
                <div class="category-header">
                    <h3>${category}</h3>
                    <span class="product-count">${productCount} ${productCount === 1 ? 'product' : 'products'}</span>
                </div>
                ${productsHtml}
                <div class="category-actions">
                    <button class="btn btn-secondary" onclick="filterByCategory('${category}')">
                        View All Products
                    </button>
                </div>
            </div>
        `;
    });
    html += '</div>';
    
    container.innerHTML = html;
}

function filterByCategory(category) {
    // Navigate to products page and filter by category
    navigateToPage('products');
    setTimeout(() => {
        const categoryFilter = document.getElementById('categoryFilter');
        if (categoryFilter) {
            categoryFilter.value = category;
            // Trigger the filter
            const event = new Event('change');
            categoryFilter.dispatchEvent(event);
        }
    }, 100);
}

// Tags management
async function loadTags() {
    try {
        // Load products to extract tags
        const response = await fetch(`${API_BASE_URL}/admin/products?limit=1000`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            const products = data.products || data || [];
            
            // Extract all unique tags from products
            const allTags = new Set();
            products.forEach(product => {
                if (product.tags && Array.isArray(product.tags)) {
                    product.tags.forEach(tag => {
                        if (tag.trim()) {
                            allTags.add(tag.trim());
                        }
                    });
                }
            });
            
            const tagsArray = Array.from(allTags).sort();
            displayTags(tagsArray, products);
        } else {
            displayTags([], []);
        }
    } catch (error) {
        console.error('Error loading tags:', error);
        displayTags([], []);
    }
}

function displayTags(tags, products = []) {
    const container = document.getElementById('tagsList');
    if (!container) return;

    if (tags.length === 0) {
        container.innerHTML = '<div class="empty-state">No tags found</div>';
        return;
    }

    let html = '<div class="tags-grid">';
    tags.forEach(tag => {
        // Get products with this tag
        const tagProducts = products.filter(p => 
            p.tags && Array.isArray(p.tags) && 
            p.tags.some(t => t.trim().toLowerCase() === tag.toLowerCase()) && 
            p.isActive
        );
        const productCount = tagProducts.length;
        
        // Create product list HTML
        let productsHtml = '';
        if (tagProducts.length > 0) {
            productsHtml = '<div class="tag-products">';
            tagProducts.slice(0, 3).forEach(product => {
                const displayPrice = product.price && !product.price.startsWith('$') ? `$${product.price}` : product.price;
                productsHtml += `
                    <div class="tag-product">
                        <span class="product-title">${product.title}</span>
                        <span class="product-price">${displayPrice}</span>
                    </div>
                `;
            });
            if (tagProducts.length > 3) {
                const moreCount = tagProducts.length - 3;
                productsHtml += `<div class="more-products">+${moreCount} more ${moreCount === 1 ? 'product' : 'products'}</div>`;
            }
            productsHtml += '</div>';
        }
        
        html += `
            <div class="tag-card">
                <div class="tag-header">
                    <h3>#${tag}</h3>
                    <span class="product-count">${productCount} ${productCount === 1 ? 'product' : 'products'}</span>
                </div>
                ${productsHtml}
                <div class="tag-actions">
                    <button class="btn btn-secondary" onclick="filterByTag('${tag}')">
                        View All Products
                    </button>
                </div>
            </div>
        `;
    });
    html += '</div>';
    
    container.innerHTML = html;
}

function filterByTag(tag) {
    // Navigate to products page and filter by tag
    navigateToPage('products');
    setTimeout(() => {
        // For now, we'll just show all products since we don't have tag filtering in the products page yet
        // You can implement tag filtering in the products page if needed
        alert(`Tag filtering for "${tag}" will be implemented in the products page`);
    }, 100);
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

// Image upload handler
function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
        alert('Please select an image file (PNG, JPG, GIF)');
        return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
        alert('Image size must be less than 5MB');
        return;
    }

    // Show file name
    const fileName = document.getElementById('imageFileName');
    fileName.textContent = file.name;

    // Show preview
    const reader = new FileReader();
    reader.onload = function(e) {
        const preview = document.getElementById('imagePreview');
        const previewImg = document.getElementById('previewImg');
        previewImg.src = e.target.result;
        preview.style.display = 'block';
    };
    reader.readAsDataURL(file);
}

// Edit image upload handler
function handleEditImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
        alert('Please select an image file (PNG, JPG, GIF)');
        return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
        alert('Image size must be less than 5MB');
        return;
    }

    // Show file name
    const fileName = document.getElementById('editImageFileName');
    fileName.textContent = file.name;

    // Show preview
    const reader = new FileReader();
    reader.onload = function(e) {
        const preview = document.getElementById('editImagePreview');
        const previewImg = document.getElementById('editPreviewImg');
        previewImg.src = e.target.result;
        preview.style.display = 'block';
    };
    reader.readAsDataURL(file);
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