# PlacementPrep AI

## 1. Overview & Objective
Build a modern, production-grade web application for "Reimagined Placement Preparation" tailored for a 2-person development team:
- **Kishore S (`main` branch):** CCC AI Proctoring & Monitoring Engine, Kishore-AI-Mentor Lounge, Feedback-Loop Recommendation Engine.
- **Ashwin Kirbaa (`feature-ash` branch):** Unified Dashboard, Dynamic LMS Modules, Question Bank & Assessment UI, Deep Analytics Engine.

The app compiles and runs out of the box with responsive Tailwind styling, Lucide icons, modular components, and mock API endpoints that allow both developers to plug in backend logic independently.

---

## 2. Tech Stack
- **Framework:** Vite + React with TypeScript
- **Styling:** Tailwind CSS + Shadcn-style utility classes
- **Icons:** Lucide-react
- **Charts/Analytics:** Recharts
- **State Management:** React Context (Syncing CCC test results to LMS recommendations and Mentor prompts)

---

## 3. Directory & Folder Structure

```text
placement-prep-ai/
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── common/             # Navbar, Sidebar, Layout, StatCard, Badge
│   │   ├── dashboard/          # Ashwin: Readiness score, daily streaks, roadmaps
│   │   ├── lms/                # Ashwin: Module cards, video/text reader, progress bar
│   │   ├── assessment/         # Ashwin & Kishore: Code editor, MCQ player, timer
│   │   ├── ccc-monitor/        # Kishore: WebCam feed preview, violation logs, stress HUD
│   │   ├── ai-mentor/          # Kishore: Humanoid avatar container, voice/text chat, feedback panel
│   │   └── analytics/          # Ashwin: Radar charts, strength/weakness heatmaps
│   ├── context/
│   │   └── AppContext.tsx      # Unified user profile, test results, recommendation tags
│   ├── data/
│   │   └── mockData.ts         # Initial JSON dataset for zero-backend testing
│   ├── pages/
│   │   ├── Dashboard.tsx       # /
│   │   ├── LearningTracks.tsx  # /learn
│   │   ├── AssessmentHub.tsx   # /assessment
│   │   ├── MentorLounge.tsx    # /mentor
│   │   └── Analytics.tsx       # /analytics
│   ├── services/
│   │   └── api.ts              # REST API contract functions
│   └── types/
│       └── index.ts            # Shared TypeScript interfaces
├── .gitignore
├── package.json
├── README.md
└── tailwind.config.js
```

---

## 4. Git Branching Strategy & Initial Setup Instructions

```bash
# 1. Initialize Repo on main
git init
git add .
git commit -m "feat: scaffold base placement prep platform with mock routes"
git branch -M main
git remote add origin <GITHUB_REPO_URL>
git push -u origin main

# 2. Ashwin's Branch Creation
git checkout -b feature-ash
# Ashwin works exclusively inside:
# - src/components/dashboard/
# - src/components/lms/
# - src/components/analytics/
# - src/pages/LearningTracks.tsx & Analytics.tsx

# 3. Kishore's main branch works inside:
# - src/components/ccc-monitor/
# - src/components/ai-mentor/
# - src/pages/MentorLounge.tsx & AssessmentHub.tsx
```
