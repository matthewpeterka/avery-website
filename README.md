# Avery's Shopping Guide

A modern, responsive website for Avery's curated shopping recommendations. Built with vanilla HTML, CSS, and JavaScript for simplicity and fast loading times.

## 🚀 Features

- **Modern Design**: Clean, professional layout with smooth animations
- **Responsive**: Works perfectly on desktop, tablet, and mobile devices
- **Fast Loading**: Optimized for speed with minimal dependencies
- **Easy to Customize**: Simple structure makes it easy to update content
- **SEO Friendly**: Semantic HTML structure for better search engine visibility

## 📁 Project Structure

```
avery_website/
├── index.html          # Landing page
├── top-picks.html      # Product recommendations page
├── about.html          # About Avery page
├── faq.html           # Frequently asked questions
├── styles.css         # All styling
├── script.js          # Main JavaScript functionality
├── products.js        # Product data and display logic
└── README.md          # This file
```

## 🎨 Design Features

- **Color Palette**: Modern purple/blue gradient theme
- **Typography**: Inter font family for clean readability
- **Animations**: Smooth hover effects and transitions
- **Mobile-First**: Responsive design that works on all devices

## 🛠️ Setup Instructions

1. **Clone or Download** the project files
2. **Open** `index.html` in your web browser
3. **Customize** the content to match Avery's preferences
4. **Deploy** to your preferred hosting service

## 📝 Customization Guide

### Updating Product Recommendations

Edit the `products.js` file to change Avery's top picks:

```javascript
const topPicks = [
    {
        id: 1,
        title: "Your Product Name",
        description: "Product description here",
        price: "$XX.XX",
        image: "🎧", // Emoji or image URL
        link: "https://your-affiliate-link.com",
        category: "Category"
    },
    // Add more products...
];
```

### Changing Colors

Update the color scheme in `styles.css`:

```css
/* Primary color */
--primary-color: #6366f1;

/* Gradient backgrounds */
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
```

### Adding Avery's Photo

Replace the placeholder in `about.html`:

```html
<div class="image-placeholder">
    <img src="path/to/avery-photo.jpg" alt="Avery" style="width: 100%; height: 100%; object-fit: cover; border-radius: 20px;">
</div>
```

### Updating Social Links

Replace the placeholder links in all HTML files:

```html
<a href="https://instagram.com/avery-username" class="social-link">Instagram</a>
<a href="https://tiktok.com/@avery-username" class="social-link">TikTok</a>
```

## 🌐 Deployment Options

### GitHub Pages (Free)
1. Create a GitHub repository
2. Upload all files
3. Go to Settings > Pages
4. Select source branch (usually `main`)
5. Your site will be available at `https://username.github.io/repository-name`

### Netlify (Free)
1. Drag and drop the project folder to [netlify.com](https://netlify.com)
2. Your site will be live instantly
3. Get a custom domain option

### Vercel (Free)
1. Connect your GitHub repository to [vercel.com](https://vercel.com)
2. Automatic deployments on every push
3. Custom domain support

## 📱 Mobile Optimization

The website is fully optimized for mobile devices with:
- Responsive navigation menu
- Touch-friendly buttons
- Optimized typography
- Fast loading times

## 🔧 Future Enhancements

Potential features to add:
- **Product Categories**: Filter products by category
- **Search Functionality**: Search through recommendations
- **Email Newsletter**: Collect subscriber emails
- **Analytics**: Track page views and clicks
- **Blog Section**: Share detailed product reviews
- **User Reviews**: Allow visitors to leave reviews

## 📊 Analytics Integration

To track website performance, add Google Analytics:

1. Create a Google Analytics account
2. Get your tracking ID
3. Add this code to the `<head>` section of all HTML files:

```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_TRACKING_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_TRACKING_ID');
</script>
```

## 🎯 SEO Optimization

The website includes:
- Semantic HTML structure
- Meta tags for social sharing
- Fast loading times
- Mobile-friendly design
- Clean URL structure

## 💡 Tips for Success

1. **Regular Updates**: Keep product recommendations fresh
2. **Quality Content**: Only recommend products you truly believe in
3. **Engage with Audience**: Respond to comments and questions
4. **Track Performance**: Monitor which products get the most clicks
5. **Stay Authentic**: Build trust through honest recommendations

## 📞 Support

For questions or customization help:
- Check the FAQ page on the website
- Review the code comments for guidance
- Consider hiring a developer for complex customizations

---

**Built with ❤️ for Avery's Shopping Guide** 