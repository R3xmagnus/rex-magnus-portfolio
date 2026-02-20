# Rex Magnus — Author Portfolio
## How to Deploy to Vercel (Get a Live Link in 5 Minutes)

---

### STEP 1 — Create a free GitHub account
Go to https://github.com and sign up if you don't have an account.

---

### STEP 2 — Upload this project to GitHub

1. **Unzip** the downloaded file — you'll get a folder called `rex-magnus-portfolio`
2. Go to https://github.com/new
3. Name your repository: `rex-magnus-portfolio`
4. Make it **Public**
5. Click **"Create repository"**
6. On the next page, click **"uploading an existing file"**
7. **Open** the `rex-magnus-portfolio` folder on your computer
8. Select ALL the files and folders **inside** it (index.html, package.json, vite.config.js, vercel.json, README.md, src/, public/)
   ⚠️ IMPORTANT: Upload the FILES INSIDE the folder — NOT the folder itself.
   The top level of your GitHub repo must show index.html, not another folder.
9. Click **"Commit changes"**

---

### STEP 3 — Deploy on Vercel (Free)

1. Go to https://vercel.com and sign up with your GitHub account
2. Click **"Add New Project"**
3. Find and select your `rex-magnus-portfolio` repository
4. Vercel will auto-detect it as a Vite project — don't change any settings
5. Click **"Deploy"**
6. Wait ~60 seconds...
7. 🎉 You'll get a live link like: `rex-magnus-portfolio.vercel.app`

---

### STEP 4 — Share your link!
Copy the link Vercel gives you and share it with anyone in the world.

---

## Optional: Get a custom domain (e.g. rexmagnus.com)

1. Buy a domain at https://namecheap.com (~$10–15/year)
2. In Vercel → Your Project → Settings → Domains
3. Add your domain and follow the DNS instructions
4. Done — your site is now at your own address!

---

## Changing Your Admin Password

Open `src/App.jsx` and change line 7:
```
const ADMIN_PASSWORD = "admin123";
```
Replace `admin123` with whatever password you want, then re-upload to GitHub (Vercel will auto-redeploy).

---

## Running Locally (Optional)

If you have Node.js installed:
```
npm install
npm run dev
```
Then open http://localhost:5173 in your browser.

---

## Need Help?
If you get stuck on any step, just ask Claude for help!
