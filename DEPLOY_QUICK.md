# 🚀 Quick Deployment Commands

## Deploy to GitHub Pages in 5 Steps

### 1. Create GitHub Repository
```
Go to: https://github.com/new
Name: menu_app
Type: Public
Click: Create repository
```

### 2. Initialize Git & Push
```powershell
git init
git add .
git commit -m "Initial commit - MenuViz"
git remote add origin https://github.com/YOUR_USERNAME/menu_app.git
git branch -M main
git push -u origin main
```

### 3. Deploy
```powershell
npm run deploy
```

### 4. Enable GitHub Pages
```
1. Go to: https://github.com/YOUR_USERNAME/menu_app/settings/pages
2. Source: Deploy from a branch
3. Branch: gh-pages → / (root)
4. Click: Save
```

### 5. Visit Your App
```
https://YOUR_USERNAME.github.io/menu_app/
```

---

## Update Deployed App
```powershell
git add .
git commit -m "Update: description of changes"
git push
npm run deploy
```

---

## Important Notes

⚠️ **Before deploying:**
- Update `vite.config.ts` base URL to match your repo name
- Don't commit `.env.local` (it's gitignored)
- Build will use your local environment variables

⚠️ **Security:**
- API keys will be visible in deployed code
- For production, use backend proxy (see security guide)

📖 **Full guide:** See `DEPLOYMENT.md`

---

## Troubleshooting

**404 Error?**
- Check `vite.config.ts` base URL matches repo name

**Blank page?**
- Check browser console for errors
- Verify base URL is correct

**Need help?**
- See full deployment guide in `DEPLOYMENT.md`
