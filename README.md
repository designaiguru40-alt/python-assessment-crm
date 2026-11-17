# 🚀 Quantum AI — Python 3 MCQ Assessment & Student CRM Portal

A full-fledged, responsive Online Examination & Assessment Management System built with **101 authentic Python 3 Multiple Choice Questions** (with official Answer Key extraction from *Python3 101 MCQ* by S. C. Lewis).

Designed specifically for **Mohit Sir (Technical Trainer at Quantum AI)** to conduct seamless online student tests, perform automatic scoring, and track batch performance via a built-in Faculty CRM.

---

## 🌟 Key Features

### 📝 1. Student Examination Portal
- **101 Question Bank:** Complete beginner-to-intermediate Python 3 questions covering syntax, operators, lists, dictionaries, conditionals, loops, functions, and file I/O.
- **Dark IDE Monospace Code Snippets:** High-readability Python code formatting with clear indentation.
- **Interactive Question Palette (1–101):** Color-coded navigation grid (Answered = Green, Marked for Review = Orange, Pending = Gray, Current = Blue).
- **Live Countdown Timer:** Configurable time limits (90 mins, 60 mins, or untimed) with automatic submission when time expires.
- **Keyboard Shortcuts:** Fast navigation via `A`, `B`, `C`, `D` or `1`, `2`, `3`, `4` to pick options, `N` for next, `P` for previous, and `M` to mark for review.

### 🎯 2. Instant Automated Evaluation & Scorecard
- **Automatic Scoring:** Matches student responses against the official PDF Answer Key immediately upon submission.
- **Performance Tiers:** Automatic grading with Distinction (≥ 80%), Qualified / Pass (≥ 50%), and Needs Revision (< 50%).
- **Topic Mastery Breakdown:** Percentage scores across 10 individual Python domains (e.g., Arithmetic, Lists & Sequences, Dictionaries & Sets, Loops, Functions, File I/O).
- **1-Click Printable Scorecard:** Specially styled print layout for issuing student certificates or assessment reports via `Ctrl + P` / Print to PDF.
- **Detailed Solution Review:** Explores every question with side-by-side comparison of the student's selected answer vs. the official correct answer.

### 📊 3. Faculty CRM & Batch Management
- **Zero-Setup Database:** Submissions automatically persist in browser `localStorage`.
- **Batch Performance Analytics:** Live metrics showing Total Students Tested, Batch Average Score, Highest Score, and Pass Rate %.
- **Search & Filter:** Instant search by student name, roll number, or batch.
- **Export to Excel / CSV:** One-click CSV export with detailed student timestamps, scores, percentages, and performance tiers.

---

## ⚡ Quick Start (Local Run)

1. Open this folder on your computer:
   ```
   C:\Users\Mohit Panwar\.gemini\antigravity\scratch\python-assessment-crm
   ```
2. Double-click `index.html` to open it directly in Google Chrome, Microsoft Edge, or any modern web browser.
3. Everything runs 100% offline with zero dependencies!

---

## 🌐 Deploy to GitHub & Get a Free Live Online Link

To send this test as an online link to students anywhere (on phone or laptop) using **GitHub Pages**:

### Step 1: Create a GitHub Repository
1. Log in to [GitHub.com](https://github.com/).
2. Click **New Repository** (green button).
3. Name it: `python-assessment-crm` (set it to **Public**).
4. Do NOT check "Add a README" (we already have one). Click **Create repository**.

### Step 2: Push Your Code (Run these 3 commands in Terminal/PowerShell)
Inside this project directory:
```bash
git remote add origin https://github.com/<YOUR_GITHUB_USERNAME>/python-assessment-crm.git
git branch -M main
git push -u origin main
```

### Step 3: Enable Free Live Hosting on GitHub Pages
1. In your GitHub repository, click on **Settings** (gear icon on the top right).
2. On the left sidebar, click **Pages**.
3. Under **Build and deployment** -> **Branch**, select `main` and `/ (root)`.
4. Click **Save**.
5. Within 30 seconds, GitHub will give you your live public link:
   ```
   https://<YOUR_GITHUB_USERNAME>.github.io/python-assessment-crm/
   ```

Aap ye live link kisi bhi bache ko WhatsApp ya email par bhej sakte hain! Bacha phone ya laptop kisi par bhi link open karke test de sakta hai aur uska score turant generate ho jayega.

---

## 📂 Project Structure

```
python-assessment-crm/
│
├── index.html          # Master Single-Page Web Application
├── styles.css          # Responsive styling, modern UI & Print Scorecard layout
├── app.js              # State management, Timer, Auto-scoring, CRM & CSV exporter
├── questions.js        # 101 Extracted Python MCQs with verified Answer Key
├── questions.json      # Raw JSON format of the question bank
└── README.md           # Documentation & GitHub deployment guide
```
