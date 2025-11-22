# Google Analytics 4 - Quick Setup Guide

## Step 1: Create GA4 Property (5 minutes)

1. Go to https://analytics.google.com/
2. Click **"Admin"** (bottom left gear icon)
3. Click **"Create Property"**
4. Enter property name: **"MenuViz"**
5. Select timezone and currency
6. Click **"Next"**
7. Select industry: **"Food & Drink"**
8. Click **"Create"**
9. Choose **"Web"** platform
10. Enter your website URL
11. **COPY YOUR MEASUREMENT ID** (format: `G-XXXXXXXXXX`)

## Step 2: Add Measurement ID to App

1. Open PowerShell in your project folder
2. Run these commands:

```powershell
# Copy the template file
copy .env.template .env.local

# Open the file in notepad
notepad .env.local
```

3. Replace `G-XXXXXXXXXX` with your actual Measurement ID
4. Save and close

## Step 3: Restart Dev Server

```powershell
# Stop the current server (Ctrl+C)
# Then restart:
npm run dev
```

## Step 4: Verify It's Working

1. Open your app in the browser
2. Go to GA4 → **Reports** → **Realtime**
3. Scan a menu in your app
4. Watch the event appear in GA4 Realtime! 🎉

## Events Being Tracked

✅ **menu_scanned** - When you analyze a menu
✅ **dish_translated** - When you translate a dish  
✅ **recipe_generated** - When you get a recipe
✅ **chat_opened** - When you open the chat
✅ **chat_message_sent** - When you send a chat message
✅ **language_changed** - When you change language
✅ **favorite_action** - When you add/remove favorites
✅ **image_generated** - When dish images are created
✅ **error_occurred** - When errors happen

## Troubleshooting

**Events not showing up?**
- Check `.env.local` has correct Measurement ID
- Restart dev server after adding ID
- Wait 30 seconds for events to appear in Realtime
- Check browser console for errors

**Still not working?**
- Make sure `.env.local` exists (not `.env.template`)
- Measurement ID should start with `G-`
- No quotes around the ID in `.env.local`

## Next Steps

After you see events in Realtime:
1. Create custom dashboards in GA4
2. Set up conversion events
3. Configure data retention settings
4. Export data to BigQuery (optional)

Need help? Check the full implementation plan!
