# 🚀 Complete Deployment Guide for Avery's Shopping Guide

## 📋 Overview

This guide will help you deploy:
1. **Main Website** - Public-facing site (GitHub Pages/Netlify)
2. **Backend + Admin Dashboard** - Full-stack app (Render/Railway)

## 🌐 Option 1: Render Deployment (Recommended)

### Step 1: Set up MongoDB Atlas (Free Database)

1. **Create MongoDB Atlas Account**
   - Go to [mongodb.com/atlas](https://mongodb.com/atlas)
   - Sign up for free account
   - Create a new cluster (free tier)

2. **Get Connection String**
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database password

### Step 2: Deploy to Render

1. **Create Render Account**
   - Go to [render.com](https://render.com)
   - Sign up with GitHub

2. **Deploy Backend**
   - Click "New Web Service"
   - Connect your GitHub repository
   - Configure:
     - **Name**: `avery-website-backend`
     - **Root Directory**: `backend`
     - **Build Command**: `npm install`
     - **Start Command**: `npm start`
     - **Plan**: Free

3. **Set Environment Variables**
   - Go to your service settings
   - Add these environment variables:
     ```
     MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/avery-website
     JWT_SECRET=your-super-secret-jwt-key-change-this
     NODE_ENV=production
     ```

4. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment (5-10 minutes)

### Step 3: Deploy Main Website

1. **Option A: GitHub Pages (Free)**
   - Push your code to GitHub
   - Go to repository Settings → Pages
   - Select "main" branch
   - Your site will be at: `https://username.github.io/repository-name`

2. **Option B: Netlify (Free)**
   - Go to [netlify.com](https://netlify.com)
   - Drag and drop your project folder
   - Your site will be live instantly

## 🌐 Option 2: Railway Deployment

### Step 1: Deploy to Railway

1. **Create Railway Account**
   - Go to [railway.app](https://railway.app)
   - Sign up with GitHub

2. **Deploy Backend**
   - Click "New Project"
   - Choose "Deploy from GitHub repo"
   - Select your repository
   - Railway will auto-detect it's a Node.js app

3. **Set Environment Variables**
   - Go to Variables tab
   - Add:
     ```
     MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/avery-website
     JWT_SECRET=your-super-secret-jwt-key-change-this
     NODE_ENV=production
     ```

4. **Deploy**
   - Railway will automatically deploy
   - Get your URL from the Deployments tab

## 🔧 Setup Instructions

### Step 1: Create Admin User

Once deployed, create Avery's admin account:

```bash
# Replace YOUR_BACKEND_URL with your actual backend URL
curl -X POST https://your-backend-url.onrender.com/api/auth/setup \
  -H "Content-Type: application/json" \
  -d '{
    "username": "avery",
    "email": "avery@example.com", 
    "password": "your-secure-password"
  }'
```

### Step 2: Update Frontend API URLs

Update the admin dashboard to use your backend URL:

1. **Edit `admin-dashboard/script.js`**
   - Replace `http://localhost:3000` with your backend URL
   - Example: `https://avery-website-backend.onrender.com`

2. **Edit main website files**
   - Update `products.js` to fetch from your backend API

### Step 3: Test Everything

1. **Test Main Website**
   - Visit your deployed website
   - Check that all pages load correctly

2. **Test Admin Dashboard**
   - Visit: `https://your-backend-url.onrender.com/admin`
   - Login with Avery's credentials
   - Test adding/editing products

## 🔗 URLs After Deployment

- **Main Website**: `https://username.github.io/avery-website` (GitHub Pages)
- **Backend API**: `https://avery-website-backend.onrender.com`
- **Admin Dashboard**: `https://avery-website-backend.onrender.com/admin`

## 📱 Remote Access for Avery

Once deployed, Avery can:

1. **Access Admin Dashboard** from anywhere:
   - URL: `https://your-backend-url.onrender.com/admin`
   - Login with her username/password
   - Manage products remotely

2. **Add/Edit Products** on any device:
   - Mobile-friendly admin interface
   - Upload images and manage content
   - View analytics and statistics

3. **Share Website** with anyone:
   - Public website accessible worldwide
   - Professional domain (can add custom domain later)

## 🔒 Security Considerations

1. **Strong Passwords**
   - Use a secure password for admin account
   - Change JWT_SECRET to something unique

2. **Environment Variables**
   - Never commit `.env` files to GitHub
   - Use platform environment variables

3. **Database Security**
   - Use MongoDB Atlas with proper authentication
   - Restrict database access to your app only

## 💰 Cost Breakdown

**Free Tier (Recommended for starting):**
- **MongoDB Atlas**: Free (512MB storage)
- **Render/Railway**: Free (750 hours/month)
- **GitHub Pages/Netlify**: Free
- **Total**: $0/month

**Paid Options (When you grow):**
- **Custom Domain**: ~$10-15/year
- **Upgraded Database**: ~$9/month
- **Premium Hosting**: ~$7-25/month

## 🚀 Quick Start Commands

```bash
# 1. Push to GitHub
git add .
git commit -m "Ready for deployment"
git push origin main

# 2. Deploy to Render (via web interface)
# Follow the steps above

# 3. Create admin user
curl -X POST https://your-backend-url.onrender.com/api/auth/setup \
  -H "Content-Type: application/json" \
  -d '{"username":"avery","email":"avery@example.com","password":"securepassword"}'

# 4. Test deployment
# Visit your website and admin dashboard
```

## 🆘 Troubleshooting

**Common Issues:**
1. **Build fails**: Check Node.js version (use 16+)
2. **Database connection**: Verify MongoDB URI format
3. **CORS errors**: Backend should handle CORS automatically
4. **Admin login fails**: Check if admin user was created

**Need Help?**
- Check Render/Railway logs for errors
- Verify environment variables are set correctly
- Test API endpoints with Postman/curl

---

**Your website will be live and accessible worldwide once deployed!** 🌍 