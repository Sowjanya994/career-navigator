# 🧭 Career Navigator — Setup Guide
> Keep this file. Follow these steps every time you work on the project.

---

## 📁 Project Location
```
C:\Users\varsh\Downloads\career-navigator
```

---

## ⚙️ ONE-TIME SETUP (do this only once)

### Step 1 — Install Node.js
- Download from: https://nodejs.org (LTS version)
- Install with all defaults

### Step 2 — Install project dependencies
Open terminal and run:
```
cd C:\Users\varsh\Downloads\career-navigator
npm install
npm install express cors node-fetch@2
```

### Step 3 — Get your free Groq API Key
- Go to: https://console.groq.com/keys
- Sign up free → Create API Key
- Copy the key (starts with gsk_...)

### Step 4 — Add your API key to proxy.js
- Open: C:\Users\varsh\Downloads\career-navigator\proxy.js
- Find this line:
  ```
  'Authorization': 'Bearer YOUR_GROQ_API_KEY'
  ```
- Replace YOUR_GROQ_API_KEY with your actual key
- Save the file

### Step 5 — Add Tailwind CDN to index.html
- Open: C:\Users\varsh\Downloads\career-navigator\public\index.html
- Add this line just before </head>:
  ```
  <script src="https://cdn.tailwindcss.com"></script>
  ```
- Save the file

---

## 🚀 EVERY TIME YOU WANT TO RUN THE PROJECT

### Open Terminal 1 — Start the AI Proxy
```
cd C:\Users\varsh\Downloads\career-navigator
node proxy.js
```
✅ You should see:
```
✅ Career Navigator AI Proxy running!
   URL: http://localhost:3001
   AI:  Groq llama-3.3-70b-versatile
```
⚠️ Keep this terminal open. Do NOT close it.

### Open Terminal 2 — Start the React App
```
cd C:\Users\varsh\Downloads\career-navigator
npm start
```
✅ You should see:
```
Compiled successfully!
```
Then your browser opens automatically at:
```
http://localhost:3000
```

---

## 📂 Important Files

| File | Location | Purpose |
|------|----------|---------|
| App.js | src\App.js | Main app — all features |
| proxy.js | career-navigator\proxy.js | AI backend — must run |
| index.html | public\index.html | Add Tailwind CDN here |
| index.css | src\index.css | Should have @tailwind lines |

---

## 🔑 API Keys

| Service | Where to get | Free? |
|---------|-------------|-------|
| Groq | https://console.groq.com/keys | ✅ Yes, free |

⚠️ NEVER share your API key in chat or screenshots.
⚠️ If key is exposed, delete it immediately and create a new one.

---

## 🌟 Features in the App

| Feature | What it does |
|---------|-------------|
| 🔥 Live Job Search | Search fresher IT jobs in Bengaluru |
| 📋 Application Tracker | Track Applied → Offer Received |
| 🎯 Career Discovery | Find suitable career paths for you |
| 📊 Skill Assessment | Evaluate your technical & soft skills |
| 📚 Learning Roadmap | Step-by-step learning plan |
| 🗂️ Project Builder | Project ideas + guidance + evaluation |
| 💬 AI Mentor | Chat with your 24/7 career mentor |
| 📄 Resume & ATS | Build resume + check ATS score |
| 💼 LinkedIn Booster | Optimize your LinkedIn profile |
| 🎤 Mock Interview | Practice interviews + get feedback |
| 📈 Dashboard | Track your overall job readiness |

---

## 🔧 Common Errors & Fixes

### "Failed to fetch" / "Something went wrong"
→ Proxy is not running. Go to Terminal 1 and run:
```
node proxy.js
```

### "Cannot find module"
→ Dependencies not installed. Run:
```
npm install
npm install express cors node-fetch@2
```

### "Linkedin is not defined"
→ Open src\App.js, press Ctrl+H
→ Find: icon: Linkedin
→ Replace with: icon: Star
→ Save

### "Compiled with problems" / ESLint errors
→ Check the exact error line shown
→ Usually an unused variable — safe to ignore warnings
→ Only ERROR (not WARNING) stops the app

### Port 3000 already in use
→ Run: netstat -ano | findstr :3000
→ Then: taskkill /PID [number] /F

### Port 3001 already in use
→ Run: netstat -ano | findstr :3001
→ Then: taskkill /PID [number] /F

---

## 💡 Quick Shortcut — Start Both at Once

Create a file called start.bat in your career-navigator folder:
```
@echo off
start cmd /k "cd C:\Users\varsh\Downloads\career-navigator && node proxy.js"
timeout /t 2
start cmd /k "cd C:\Users\varsh\Downloads\career-navigator && npm start"
```
→ Double-click start.bat to launch everything automatically.

---

## 📞 Job Search Tips (using the app)

1. Go to 🔥 Live Job Search
2. Click any role pill (Java, Python, AI/ML, Cybersecurity...)
3. Location is set to Bengaluru by default
4. Click "Search jobs now"
5. Click "Apply on [Portal]" → opens real portal
6. Click "Track application" → saved in Application Tracker

---

*Last updated: June 2025*