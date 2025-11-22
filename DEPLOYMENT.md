# 🚀 Deploy MenuViz to GitHub Pages

## Quick Deployment Guide

Deploy your MenuViz app to GitHub Pages for **FREE** in 10 minutes!

---

## Prerequisites

- GitHub account
- Git installed on your computer
- MenuViz app ready to deploy

---

## Step 1: Prepare Your App

### 1.1 Update `vite.config.ts`

Open `vite.config.ts` and add the base URL:

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/menu_app/', // Replace 'menu_app' with your repo name
})
```

### 1.2 Create `.gitignore` (if not exists)

Create `.gitignore` in project root:

```
# Dependencies
node_modules/

# Build output
dist/

# Environment variables
.env
.env.local
.env.production

# IDE
.vscode/
.idea/

# OS
.DS_Store
Thumbs.db

# Logs
*.log
npm-debug.log*
```

### 1.3 Add Deployment Script

Open `package.json` and add this script:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "deploy": "npm run build && gh-pages -d dist"
  }
}
```

### 1.4 Install gh-pages

```powershell
npm install --save-dev gh-pages
```

---

## Step 2: Create GitHub Repository

### 2.1 Create New Repository

1. Go to https://github.com/new
2. Repository name: `menu_app` (or your preferred name)
3. Description: "AI-Powered Menu Visualizer with Translation"
4. **Public** (required for free GitHub Pages)
5. **Don't** initialize with README
6. Click **"Create repository"**

### 2.2 Copy Repository URL

Copy the HTTPS URL (looks like: `https://github.com/YOUR_USERNAME/menu_app.git`)

---

## Step 3: Initialize Git & Push

Open PowerShell in your project folder:

```powershell
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - MenuViz app"

# Add remote (replace with your URL)
git remote add origin https://github.com/YOUR_USERNAME/menu_app.git

# Push to GitHub
git branch -M main
git push -u origin main
```

---

## Step 4: Deploy to GitHub Pages

### 4.1 Deploy

```powershell
npm run deploy
```

This will:
- Build your app
- Create `gh-pages` branch
- Push to GitHub

### 4.2 Enable GitHub Pages

1. Go to your repository on GitHub
2. Click **Settings**
3. Scroll to **Pages** (left sidebar)
4. Source: **Deploy from a branch**
5. Branch: **gh-pages** → **/ (root)**
6. Click **Save**

### 4.3 Wait for Deployment

- GitHub will deploy your app (takes 1-2 minutes)
- You'll see a green checkmark when ready
- Your app URL: `https://YOUR_USERNAME.github.io/menu_app/`

---

## Step 5: Add Environment Variables

⚠️ **IMPORTANT:** Don't commit your API keys!

### 5.1 For GitHub Pages Deployment

Since GitHub Pages is static hosting, you have two options:

**Option A: Use GitHub Secrets (Recommended)**

1. Go to repository → **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. Name: `VITE_GA_MEASUREMENT_ID`
4. Value: Your GA4 Measurement ID
5. Click **Add secret**

Then create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Build
        env:
          VITE_GA_MEASUREMENT_ID: ${{ secrets.VITE_GA_MEASUREMENT_ID }}
          VITE_GEMINI_API_KEY: ${{ secrets.VITE_GEMINI_API_KEY }}
        run: npm run build
        
      - name: Deploy
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

**Option B: Build Locally (Simpler)**

Build with your `.env.local` file, then deploy:

```powershell
npm run deploy
```

> ⚠️ **Security Warning:** Your API keys will be visible in the deployed code. For production, use a backend proxy (see security guide).

---

## Step 6: Custom Domain (Optional)

### 6.1 Add Custom Domain

1. Buy a domain (e.g., from Namecheap, GoDaddy)
2. Go to repository → **Settings** → **Pages**
3. Custom domain: `menuviz.com`
4. Click **Save**

### 6.2 Configure DNS

Add these DNS records:

```
Type: A
Host: @
Value: 185.199.108.153

Type: A
Host: @
Value: 185.199.109.153

Type: A
Host: @
Value: 185.199.110.153

Type: A
Host: @
Value: 185.199.111.153

Type: CNAME
Host: www
Value: YOUR_USERNAME.github.io
```

---

## Step 7: Verify Deployment

### 7.1 Test Your App

Visit: `https://YOUR_USERNAME.github.io/menu_app/`

**Test checklist:**
- [ ] App loads correctly
- [ ] Can upload/scan menu
- [ ] Images generate
- [ ] Translation works
- [ ] Chat works
- [ ] Analytics tracking (check GA4)

### 7.2 Check Analytics

1. Open GA4 → Realtime
2. Visit your deployed app
3. Verify events are tracked

---

## 🔄 Update Your Deployed App

Whenever you make changes:

```powershell
# Make your changes
# ...

# Commit changes
git add .
git commit -m "Description of changes"

# Push to GitHub
git push

# Deploy updated version
npm run deploy
```

---

## 🐛 Troubleshooting

### Issue: 404 Error

**Solution:** Check `vite.config.ts` base URL matches your repo name

```typescript
base: '/menu_app/', // Must match repo name
```

### Issue: Blank Page

**Solution:** Check browser console for errors. Usually a base URL issue.

### Issue: Images Not Loading

**Solution:** Ensure all image paths are relative, not absolute.

### Issue: API Key Not Working

**Solution:** 
1. Check `.env.local` exists
2. Rebuild: `npm run build`
3. Redeploy: `npm run deploy`

### Issue: Analytics Not Tracking

**Solution:**
1. Verify GA4 Measurement ID in `.env.local`
2. Check browser console for GA4 initialization
3. Wait 24 hours for data to appear in GA4 reports

---

## 📊 Deployment Checklist

Before deploying:

- [ ] Update `vite.config.ts` with correct base URL
- [ ] Add `.gitignore` file
- [ ] Install `gh-pages` package
- [ ] Add deploy script to `package.json`
- [ ] Test locally (`npm run dev`)
- [ ] Build successfully (`npm run build`)
- [ ] Create GitHub repository
- [ ] Push code to GitHub
- [ ] Deploy to GitHub Pages
- [ ] Enable GitHub Pages in settings
- [ ] Test deployed app
- [ ] Verify analytics working

---

## 🎯 Next Steps

After deployment:

1. **Share your app** - Send the URL to friends!
2. **Monitor analytics** - Check GA4 for user behavior
3. **Add security** - Implement backend proxy for API keys
4. **Custom domain** - Make it professional
5. **SEO optimization** - Add meta tags for better discovery
6. **Performance** - Optimize images and code splitting

---

## 📚 Resources

- [GitHub Pages Docs](https://docs.github.com/en/pages)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)
- [Custom Domain Setup](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site)

---

## 🎉 You're Live!

Your MenuViz app is now deployed and accessible to the world! 🚀

**Your app URL:** `https://YOUR_USERNAME.github.io/menu_app/`

Share it, get feedback, and keep improving! 💪
