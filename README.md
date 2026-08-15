# 🎮 LevelUp Money Life

<p align="center">
  <b>Modern Gamified Personal Finance & Life Tracker Desktop App</b><br/>
  <i>Finance First, Game Layer Second • 100% Local-First & Private</i>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Tauri-v2-24C8D8?logo=tauri&logoColor=white&style=flat-square" alt="Tauri v2" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black&style=flat-square" alt="React 19" />
  <img src="https://img.shields.io/badge/TypeScript-5.0+-3178C6?logo=typescript&logoColor=white&style=flat-square" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?logo=tailwindcss&logoColor=white&style=flat-square" alt="Tailwind CSS v4" />
  <img src="https://img.shields.io/badge/SQLite-Local--First-003B57?logo=sqlite&logoColor=white&style=flat-square" alt="SQLite" />
  <img src="https://img.shields.io/badge/OCR-Tesseract.js-5C6BC0?style=flat-square" alt="Tesseract.js OCR" />
  <img src="https://img.shields.io/badge/i18n-TH%20%7C%20EN-orange?style=flat-square" alt="i18n TH/EN" />
</p>

---

<p align="center">
  <a href="#-english"><b>English</b></a> •
  <a href="#-ภาษาไทย"><b>ภาษาไทย</b></a> •
  <a href="#-tech-stack"><b>Tech Stack</b></a> •
  <a href="#-project-structure"><b>Project Structure</b></a> •
  <a href="#-getting-started"><b>Getting Started</b></a>
</p>

---

## 🇬🇧 English

### 🌟 Overview

**LevelUp Money Life** is a high-performance, privacy-focused desktop application designed to make personal finance tracking effortless and engaging. By integrating **Notion-style interactive ledger tables** with an **RPG gamification layer (XP, Streaks, Daily Quests & Leveling)**, it transforms daily financial discipline into an enjoyable habit.

> **Design Philosophy:** *Finance first, game layer second.* Your money data is always clean, clear, and accurate. The game mechanics motivate consistent habits without cluttering your financial analysis.

---

### ✨ Key Features

#### 1. 🏠 Finance Command Deck (Dashboard)
- **Real-Time Financial Cockpit**: Instant visibility over total Income, Expenses, Net Balance, and Savings Rate.
- **Level & XP Progress**: Dynamic level badge (Novice to Grandmaster) and interactive streak counter.
- **Recent Activity Feed**: Quick overview of recent transactions with category color accents.
- **Active Quests Widget**: Check off daily financial habits directly from the overview.

#### 2. 📜 Notion-Style Transaction Ledger
- **Interactive Data Grid**: Clean, high-density spreadsheet experience tailored for desktop.
- **Multi-Field Sorting & Filtering**: Sort by date, amount, category, or description with a single click.
- **Instant Search & Category Filtering**: Filter by Income, Food, Transport, Home, Health, Learning, Fun, Debt, or Savings.
- **Cleared Status Tracking**: Toggle transaction verification status for reconciling bank accounts.
- **Batch Actions & Quick Deletion**: Manage transactions with ease.

#### 3. 🎯 Dynamic Budget Planner
- **50/30/20 & Custom Allocation**: Set target percentages for **Needs**, **Wants**, and **Savings**.
- **Real-Time Target vs. Actuals**: Live comparison bars highlighting whether your spending matches your planned budget.
- **Visual Budget Health**: Progress bars with semantic color warnings to prevent overspending.

#### 4. 📊 Analytics Hub
- **Interactive Visualizations**: Powered by Recharts with custom curated color palettes.
- **Category Spending Distribution**: Interactive donut charts revealing exactly where your money went (*"เงินหายไปกับอะไร?"*).
- **Income vs. Expense Breakdown**: Compare net savings and identify high-cost habits month-over-month.

#### 5. ⚔️ Quests & Growth (Gamification Engine)
- **Daily Quests**: Complete daily financial actions (e.g. logging daily spend, reviewing budget) to earn XP.
- **Streak Multipliers**: Maintain consecutive active days to boost your leveling journey.
- **Achievements System**: Unlock milestone badges (First Log, Streak 7, Savings Champion, Balanced Budget) with XP rewards.
- **Level-Up Celebrations**: Rewarding milestone animations when leveling up.

#### 6. 🧾 AI & OCR Bank Slip Scanner
- **Thai Bank Slip Recognition**: Pre-trained regex & OCR for major Thai banks (KBank, SCB, PromptPay, Bangkok Bank, Krungthai, TTB).
- **Auto Data Extraction**: Automatically extracts transfer amount, transaction date/time, sender, receiver, and reference number.
- **Smart Categorization**: Recommends appropriate expense/income category based on slip metadata.
- **Canvas Image Preprocessing**: Automatic grayscale & contrast enhancement for maximum OCR accuracy.

#### 7. 🔒 100% Local-First & Private Data Management
- **Zero Cloud Dependence**: Data stays strictly on your local machine in an embedded SQLite database (`@tauri-apps/plugin-sql`).
- **JSON Backup & Restore**: Full database snapshot export and import.
- **CSV Data Export**: Export clean transaction history for Excel, Google Sheets, or tax preparation.
- **Demo Data Seed**: Pre-populate sample transactions with one click to test out all features.

#### 8. 🎨 Premium UI & Multi-Language
- **Light & Dark Theme**: Handcrafted semantic color tokens (Mist Green, Ink Forest, Soft Jade, Amber, Clay Rose, Moss).
- **Fluid Micro-Animations**: Smooth UI transitions powered by Framer Motion.
- **Modern Typography**: JetBrains Mono for numbers and Outfit for UI text.
- **Bilingual (TH/EN)**: Seamless instant switching between Thai and English via `react-i18next`.

---

## 🇹🇭 ภาษาไทย

### 🌟 ภาพรวมโครงการ

**LevelUp Money Life** คือแอปพลิเคชันเดสก์ท็อปสำหรับบริหารการเงินส่วนบุคคลและพัฒนาวินัยชีวิต ที่รวมแนวคิดการบันทึกข้อมูลแบบ **Notion Spreadsheet** เข้ากับระบบ **RPG Gamification (XP, เลเวล, ภารกิจรายวัน, และเหรียญความสำเร็จ)** ช่วยให้การจดบันทึกรายรับ-รายจ่ายและการวางแผนงบประมาณเป็นเรื่องสนุกและทำได้ต่อเนื่องทุกวัน

> **หลักการออกแบบ:** *การเงินต้องมาก่อน เกมเป็นตัวเสริม (Finance first, game layer second)* ข้อมูลตัวเลขการเงินต้องอ่านง่าย ถูกต้อง และตอบโจทย์ "เงินหายไปกับอะไร?" ได้ทันที โดยมีระบบเควสต์และ XP ช่วยสร้างแรงจูงใจในการสร้างวินัย

---

### ✨ ฟีเจอร์เด่นที่น่าสนใจ

| หมวดหมู่ | รายละเอียดฟีเจอร์ |
|---|---|
| 🏠 **แดชบอร์ดศูนย์บัญชาการ (Dashboard)** | สรุปภาพรวม รายรับ, รายจ่าย, ยอดคงเหลือ, และอัตราการออม พร้อมแถบเลเวล XP และ Streak การเข้าใช้งาน |
| 📜 **สมุดบัญชีสไตล์ Notion (Ledger)** | ตารางบันทึกข้อมูลความหนาแน่นสูง รองรับการค้นหา, กรองหมวดหมู่, เรียงลำดับ (Sort), และติ๊กสถานะเคลียร์ยอด |
| 🎯 **วางแผนงบประมาณ (Budget Planner)** | สไลเดอร์จัดสรรสัดส่วน 50/30/20 (Needs / Wants / Savings) พร้อมคำนวณงบเป้าหมายและเทียบกับยอดใช้จริงแบบ Real-time |
| 📊 **ศูนย์วิเคราะห์ข้อมูล (Analytics Hub)** | กราฟวงกลม Donut Chart และแท่งเปรียบเทียบจาก Recharts วิเคราะห์สัดส่วนรายจ่ายแยกตามหมวดหมู่อย่างชัดเจน |
| ⚔️ **ระบบเควสต์และการเติบโต (Quests & Growth)** | ภารกิจรายวันเก็บ XP เลื่อนระดับจาก Novice สู่ Grandmaster พร้อมระบบเหรียญรางวัลเกียรติยศ (Achievements) |
| 🧾 **สแกนสลิปโอนเงินอัจฉริยะ (Slip Scanner)** | ถอดข้อความจากภาพสลิปธนาคารไทย (KBank, SCB, PromptPay, BBL, KTB, TTB) ด้วย OCR และดึง ยอดเงิน/วันที่/หมวดหมู่อัตโนมัติ |
| 💾 **จัดการข้อมูล & ความเป็นส่วนตัว (Data Manager)** | ข้อมูลเก็บในเครื่อง 100% ด้วย SQLite รองรับการ Backup/Restore ไฟล์ JSON, Export ตารางเป็น CSV และโหลดข้อมูลตัวอย่าง |
| 🎨 **ดีไซน์ระดับพรีเมียม (Theme & i18n)** | รองรับ Dark Mode / Light Mode, สลับภาษาไทย-อังกฤษได้ทันที, แอนิเมชันลื่นไหลด้วย Framer Motion |

---

## 🛠️ Tech Stack

```
Frontend UI          React 19 + TypeScript + Vite
Styling              Tailwind CSS v4 (@tailwindcss/postcss)
Desktop Framework    Tauri v2 (Rust Native Core)
Database Layer       SQLite (@tauri-apps/plugin-sql) — 100% Local-First
OCR Engine           Tesseract.js + HTML5 Canvas Preprocessing
Charts & Visuals     Recharts
Motion & Animations  Framer Motion v12
Iconography          Phosphor Icons React + Lucide React
Typography           Outfit (UI Sans) + JetBrains Mono (Numbers)
Internationalization react-i18next (TH / EN)
```

---

## 📂 Project Structure

```
LevelUp-Money-Life/
├── src/
│   ├── components/
│   │   ├── common/              # Reusable UI primitives (Select, Calendar, Buttons)
│   │   ├── views/               # Main application views
│   │   │   ├── DashboardOverview.tsx   # Financial overview & quick stats
│   │   │   ├── TransactionLedger.tsx   # Notion-style interactive data grid
│   │   │   ├── BudgetPlanner.tsx       # 50/30/20 allocation & budget limits
│   │   │   ├── AnalyticsHub.tsx        # Charts & category spending distribution
│   │   │   └── QuestsGrowth.tsx        # Gamified quests & achievement medals
│   │   ├── AppLogo.tsx          # Animated brand vector logo
│   │   ├── CategorySpendingChart.tsx   # Donut chart spending breakdown
│   │   ├── DailyQuests.tsx      # Daily checklist widget
│   │   ├── DataManagerModal.tsx # JSON/CSV backup, restore, & demo seed
│   │   ├── FinancialPlan.tsx    # Budget allocation sliders
│   │   ├── HeaderCommandDeck.tsx# XP bar, view tabs, language & action buttons
│   │   ├── LevelUpCelebration.tsx# Level up particle & modal reward screen
│   │   ├── QuickAddModal.tsx    # Fast keyboard transaction entry
│   │   ├── SlipScanModal.tsx    # Thai bank slip OCR scanner & auto-parser
│   │   └── SummaryStats.tsx     # Monthly KPI cards
│   ├── hooks/                   # Custom React hooks (useTheme, useMediaQuery)
│   ├── services/
│   │   ├── db.ts                # SQLite database service & schema migrations
│   │   ├── exportImport.ts      # CSV and JSON backup/restore engine
│   │   ├── gamification.ts      # Leveling algorithms, XP calculation & achievements
│   │   └── slipScanner.ts       # OCR image preprocessor & Thai bank slip parser
│   ├── utils/                   # Helper functions (currency, date formatting)
│   ├── types.ts                 # TypeScript domain definitions & color palettes
│   ├── i18n.ts                  # Bilingual translations (TH / EN)
│   ├── index.css                # Semantic color design tokens (Light & Dark)
│   ├── App.tsx                  # Root state coordinator & navigation manager
│   └── main.tsx                 # React DOM mount point
├── src-tauri/                   # Tauri v2 desktop configuration & Rust backend
├── design.md                    # Single-source-of-truth design system specifications
├── PRODUCT.md                   # Product vision, target users & design principles
└── package.json
```

---

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed on your machine:
- **Node.js** (v18.0.0 or higher) & **npm**
- **Rust & Cargo** (Install via [rustup.rs](https://rustup.rs/))
- **Windows Users**: Visual Studio C++ Build Tools (Choose *"Desktop development with C++"*)
- **macOS Users**: Xcode Command Line Tools (`xcode-select --install`)
- **Linux Users**: WebKitGTK and standard Tauri dependencies

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Theeraphat-S/LevelUp-Money-Life.git
   cd LevelUp-Money-Life
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start desktop development mode:**
   ```bash
   npm run tauri dev
   ```
   > *Tip:* You can also run `npm run dev` to preview the frontend interface in your default web browser.

---

### 📦 Building for Production

To compile a native desktop executable/installer for your operating system:

```bash
npm run tauri build
```

The output standalone installer will be created in:
- **Windows**: `src-tauri/target/release/bundle/msi/` or `nsis/` (`.exe` / `.msi`)
- **macOS**: `src-tauri/target/release/bundle/dmg/` or `macos/` (`.dmg` / `.app`)
- **Linux**: `src-tauri/target/release/bundle/deb/` or `appimage/` (`.deb` / `.AppImage`)

---

## ⌨️ Useful Shortcuts & Tips

- **Quick Add Transaction**: Click the `+ Quick Add` button in the header command deck.
- **Scan Bank Slip**: Click the `📷 Scan Slip` button or drag-and-drop a receipt/slip image directly into the scanner.
- **Toggle Language**: Click the language badge (`TH` / `EN`) in the top navigation bar.
- **Export Data**: Go to `Settings / Data` to export your transactions to CSV or create an offline JSON backup.

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

<p align="center">
  Crafted with ❤️ for smart personal finance & life leveling.
</p>
