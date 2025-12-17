<div align="center">

# 🛡️ ResiSync

### AI-Powered Compliance Shield for Digital Nomads

[![Live Demo](https://img.shields.io/badge/🚀_Live_Demo-Visit_Site-6366f1?style=for-the-badge)](https://abhijatsarari.github.io/resisync)
[![YouTube Demo](https://img.shields.io/badge/🎬_Watch_Demo-YouTube-FF0000?style=for-the-badge&logo=youtube)](https://youtu.be/ISOGPxONKrs)
[![License](https://img.shields.io/badge/License-MIT-emerald?style=for-the-badge)](LICENSE)
[![Made with React](https://img.shields.io/badge/React-19.x-61DAFB?style=for-the-badge&logo=react)](https://react.dev)
[![Powered by Gemini](https://img.shields.io/badge/AI-Google_Gemini-4285F4?style=for-the-badge&logo=google)](https://ai.google.dev)

<br/>

<img src="logo.png" alt="ResiSync Logo" width="180" height="180" style="border-radius: 24px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);"/>

<br/>

**Navigate visa regulations, tax residency rules, and Schengen compliance with AI intelligence.**

[🎬 Watch Demo](https://youtu.be/ISOGPxONKrs) • [✨ Features](#features) • [🚀 Quick Start](#quick-start) • [🛠️ Tech Stack](#tech-stack)

---

</div>

## 🎯 The Problem

Digital nomads face a complex web of regulations:

| Challenge | Risk |
|-----------|------|
| **Schengen 90/180 Rule** | Overstay = fines, deportation, future visa denials |
| **Tax Residency (183 days)** | Unintended tax obligations in foreign countries |
| **Multiple Jurisdictions** | Conflicting rules across 195+ countries |
| **Manual Tracking** | Spreadsheets fail. Memory fails. Compliance fails. |

## 💡 The Solution

**ResiSync** is your intelligent travel compliance companion that:

- 🔒 **Tracks** Schengen days with rolling 180-day precision
- 🧮 **Calculates** tax residency exposure per country
- 🤖 **Analyzes** your situation with Google Gemini AI
- 🔮 **Simulates** future trips before you book
- 📍 **Visualizes** your global footprint on an interactive map

---

## 🎬 Demo

<div align="center">

[![ResiSync Demo Video](https://img.youtube.com/vi/ISOGPxONKrs/maxresdefault.jpg)](https://youtu.be/ISOGPxONKrs)

**👆 Click to watch the full demo on YouTube**

</div>

---

## ✨ Features

<table>
<tr>
<td width="50%">

### 🛡️ Schengen Shield
Real-time 90/180 day tracking with visual progress ring. Know exactly when you're safe, cautious, or at risk.

### 🗺️ Interactive World Map
See your travel history visualized. Click markers for trip details and AI-generated destination intelligence.

### 🤖 AI Strategy Engine
Powered by Google Gemini, get personalized recommendations based on your passport, tax residence, and travel patterns.

</td>
<td width="50%">

### 📊 Tax Residency Tracker
Monitor days per country against 183-day thresholds. Never accidentally become a tax resident.

### 🔮 Simulation Mode
Plan hypothetical trips and see their impact on your compliance status before booking flights.

### 📱 Beautiful Dashboard
Glassmorphic UI with dark mode, smooth animations, and intuitive bento-grid layout.

</td>
</tr>
</table>

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- Google Gemini API Key ([Get one free](https://makersuite.google.com/app/apikey))

### Installation

```bash
# Clone the repository
git clone https://github.com/abhijatsarari/resisync.git
cd resisync

# Install dependencies
npm install

# Configure environment
cp .env.example .env.local
```

### Environment Setup

Create `.env.local` in the root directory:

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) 🎉

### Build for Production

```bash
npm run build
npm run preview
```

---

## 🛠️ Tech Stack

<div align="center">

**React 19.2.3, TypeScript 5.8.2, Vite 6.2.0, Tailwind CSS 3.x, Google Gemini AI API (@google/genai 1.33.0), Recharts 3.6.0, React Markdown 9.0.1, Node.js 18+, GitHub Pages**

</div>

---

## 📁 Project Structure

```
resisync/
├── 📄 App.tsx              # Main application component
├── 📄 index.html           # Entry HTML with SEO meta tags
├── 📄 types.ts             # TypeScript interfaces
├── 📂 components/
│   ├── 🛡️ FreedomMeter.tsx    # Schengen day tracker
│   ├── 🗺️ WorldMap.tsx        # Interactive travel map
│   ├── 🤖 SmartAdvice.tsx     # AI recommendations
│   ├── 📊 TaxTracker.tsx      # Tax residency monitor
│   ├── 📅 Timeline.tsx        # Trip timeline/calendar
│   ├── 🌍 DestinationInsights # Country-specific intel
│   ├── 💬 AiAssistant.tsx     # Chat interface
│   ├── 🎬 SplashScreen.tsx    # Video splash intro
│   ├── 📖 AppTour.tsx         # Feature walkthrough
│   └── 👤 Onboarding.tsx      # User setup wizard
├── 📂 services/
│   └── 🔮 geminiService.ts    # AI integration layer
└── 📂 public/
    ├── 🎨 logo.png            # App icon
    └── 🎥 logo.mp4            # Splash video
```

---

## 🔐 Privacy & Data

- ✅ **No server storage** — All data stays in your browser's localStorage
- ✅ **No tracking** — Zero analytics or third-party trackers
- ✅ **API calls** — Only to Google Gemini for AI features (your API key)
- ✅ **Open source** — Audit the code yourself

---

## 🗺️ Roadmap

- [ ] Mobile app (React Native)
- [ ] Calendar sync (Google/Apple)
- [ ] Document OCR for automatic trip detection
- [ ] Multi-currency expense tracking
- [ ] Visa expiry notifications
- [ ] Export compliance reports (PDF)

---

## 👨‍💻 Developer

<div align="center">

**Abhijat Sarari**

[![GitHub](https://img.shields.io/badge/GitHub-@abhijatsarari-181717?style=for-the-badge&logo=github)](https://github.com/abhijatsarari)
[![YouTube](https://img.shields.io/badge/YouTube-Demo-FF0000?style=for-the-badge&logo=youtube)](https://youtu.be/ISOGPxONKrs)

*Building tools for location-independent living* 🌍

</div>

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

```
MIT License - Free to use, modify, and distribute.
Attribution appreciated but not required.
```

---

<div align="center">

### ⭐ Star this repo if ResiSync helps you travel smarter!

<br/>

**[🚀 Try Live Demo](https://abhijatsarari.github.io/resisync)** • **[🎬 Watch Demo](https://youtu.be/ISOGPxONKrs)** • **[🐛 Report Bug](https://github.com/abhijatsarari/resisync/issues)**

<br/>

<sub>Made with ❤️ by Abhijat Sarari for digital nomads everywhere</sub>

</div>
