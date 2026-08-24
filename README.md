# 🎮 LevelUp Money Life

<p align="center">
  <img src="app-icon.png" alt="LevelUp Money Life Logo" width="100" style="border-radius: 20px; margin-bottom: 12px;" />
</p>

<p align="center">
  <b>Modern Gamified Personal Finance & Life Tracker Desktop App</b><br/>
  <i>Finance First, Game Layer Second • 100% Local-First, Private & High-Performance</i>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Tauri-v2-24C8D8?logo=tauri&logoColor=white&style=flat-square" alt="Tauri v2" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black&style=flat-square" alt="React 19" />
  <img src="https://img.shields.io/badge/TypeScript-5.0+-3178C6?logo=typescript&logoColor=white&style=flat-square" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?logo=tailwindcss&logoColor=white&style=flat-square" alt="Tailwind CSS v4" />
  <img src="https://img.shields.io/badge/SQLite-Local--First-003B57?logo=sqlite&logoColor=white&style=flat-square" alt="SQLite" />
  <img src="https://img.shields.io/badge/Vitest-71%20Passed-brightgreen?logo=vitest&logoColor=white&style=flat-square" alt="Vitest Tests" />
  <img src="https://img.shields.io/badge/OCR-Tesseract.js-5C6BC0?style=flat-square" alt="Tesseract.js OCR" />
  <img src="https://img.shields.io/badge/i18n-TH%20%7C%20EN-orange?style=flat-square" alt="i18n TH/EN" />
  <img src="https://img.shields.io/badge/License-MIT-green?style=flat-square" alt="MIT License" />
</p>

---

<p align="center">
  <a href="#-english"><b>English</b></a> •
  <a href="#-ภาษาไทย"><b>ภาษาไทย</b></a> •
  <a href="#-keyboard-shortcuts"><b>Shortcuts</b></a> •
  <a href="#-tech-stack"><b>Tech Stack</b></a> •
  <a href="#-project-structure"><b>Project Structure</b></a> •
  <a href="#-getting-started"><b>Getting Started</b></a>
</p>

---

## 🇬🇧 English

### 🌟 Overview

**LevelUp Money Life** is an ultra-fast, privacy-first desktop application designed to make personal financial management effortless, clear, and engaging. By seamlessly fusing **Notion-style high-density data tables** with an **RPG gamification layer (XP, Streaks, Daily Quests & Level Progression)** and **1-Click Smart Logging**, it transforms daily expense tracking into an enjoyable discipline.

> **Design Philosophy:** *Finance first, game layer second.* Your money data is always clean, clear, and accurate. The game mechanics motivate consistent habits without getting in the way of serious financial decisions.

---

### ✨ Core Features

```
┌────────────────────────────────────────────────────────────────────────┐
│                        LEVELUP MONEY LIFE ARCHITECTURE                 │
├──────────────────┬───────────────────┬─────────────────────────────────┤
│  ⚡ QUICK INPUT  │  📊 ANALYTICS     │  🎮 GAMIFICATION ENGINE         │
│  • 1-Tap Presets │  • Safe-to-Spend  │  • RPG Leveling (Lv 1 - 50)     │
│  • Smart Parser  │  • 50/30/20 Budget│  • Daily Habit Quests           │
│  • Autocomplete  │  • Thai Tax Engine│  • Streak & Milestone Medals    │
│  • Slip OCR Scan │  • Donut Charts   │  • Level-Up Celebrations        │
└──────────────────┴───────────────────┴─────────────────────────────────┘
```

#### 1. ⚡ Quick Command Bar & One-Tap Presets *(New)*
- **One-Tap Quick Logging**: Click preconfigured buttons (☕ Coffee 60฿, 🍱 Lunch 70฿, 🚇 Transit 45฿, 🛒 7-11 100฿, ⛽ Fuel 500฿) to log expenses in under 1 second.
- **Smart Frequent Suggestion**: Automatically analyzes recent transaction frequency to suggest your most common expenses.
- **Natural Language Single-Line Input**: Type naturally in Thai or English (e.g. `กะเพรา 65`, `BTS 45`, `25*3`, `+salary 45000`) with auto arithmetic evaluation and automatic category inference.
- **WAI-ARIA Combobox Autocomplete**: Live suggestions of historical transactions with instant keyboard selection (`↑` / `↓` / `Enter`).
- **Interactive Undo Toast**: 5-second countdown notification with instant 1-click rollback in case of accidental entries.
- **Custom Preset Manager**: Full CRUD dialog to create, edit, reorder, and personalize custom preset chips.

#### 2. 🎯 Real-Time Daily Safe-to-Spend Indicator
- **Daily Financial Compass**: Real-time calculated daily spending allowance based on monthly disposable income, current day of month, and total spending to date.
- **Visual Comfort States**: Color-coded indicators (`comfortable`, `caution`, `critical`) showing whether your daily pace is on track.
- **Instant Reactive Updates**: Automatically recalculates immediately upon transaction creation or undo.

#### 3. 🏠 Finance Command Deck (Dashboard)
- **High-Altitude Overview**: Real-time KPI cards for Total Income, Total Expenses, Net Balance, and Savings Rate.
- **Level & XP Gauge**: Dynamic level badge (Novice to Grandmaster) and active streak tracker.
- **Active Quests Widget**: Check off daily financial habits directly from the overview.

#### 4. 📜 Notion-Style Transaction Ledger
- **Interactive Data Grid**: Clean, high-density spreadsheet experience tailored for desktop.
- **Multi-Field Sorting & Filtering**: Sort by date, amount, category, or description with a single click.
- **Instant Search & Category Filtering**: Filter by Food, Transport, Home, Health, Learning, Fun, Savings, Income, or Debt.
- **Cleared Reconciliation Tracking**: Toggle verified status for reconciling bank accounts.

#### 5. 🎯 Dynamic 50/30/20 Budget Planner
- **Flexible Budget Allocations**: Set custom target percentages for **Needs**, **Wants**, and **Savings**.
- **Live Target vs. Actuals**: Real-time comparison progress bars with semantic warnings against overspending.

#### 6. 🧮 Thai Tax Planner (Personal Income Tax Calculator)
- **Revenue Department Tier Engine**: Full progressive tax bracket calculation (0% to 35%).
- **Comprehensive Thai Deductions**: Personal allowance, Social Security (SSO), Provident Fund (PVD), RMF, SSF, ThaiESG, Easy E-Receipt, Life/Health insurance, and Home loan interest deductions.
- **Tax Optimization Insights**: Real-time estimation of net taxable income and tax savings.

#### 7. 📊 Analytics Hub
- **Interactive Visualizations**: Powered by Recharts with custom curated accessible palettes.
- **Category Spending Distribution**: Interactive donut charts revealing exactly where your money went.
- **Monthly In/Out Flow**: Month-over-month financial trend comparisons.

#### 8. ⚔️ Quests & Growth (Gamification Engine)
- **Daily Quests**: Complete daily financial actions to earn XP and level up.
- **Streak Multipliers**: Maintain consecutive active days to boost XP gains.
- **Achievements & Badges**: Unlock milestone medals (First Log, 7-Day Streak, Budget Master, Savings Champion).

#### 9. 🧾 AI & OCR Bank Slip Scanner
- **Thai Bank Recognition**: Pre-trained regex & OCR for major Thai banks (KBank, SCB, PromptPay, BBL, KTB, TTB).
- **Auto Data Extraction**: Automatically extracts transfer amount, date/time, sender, receiver, and reference number.
- **Canvas Image Preprocessing**: Grayscale & contrast enhancement for maximum OCR accuracy.

#### 10. 🔒 100% Local-First & Private Data Management
- **Zero Cloud Dependence**: Data stays strictly on your local machine in an embedded SQLite database (`@tauri-apps/plugin-sql`).
- **JSON Backup & Snapshot Restore**: Export and import complete snapshots including custom presets and quest history.
- **CSV Data Export**: Export clean transaction history for Excel, Google Sheets, or tax filings.

---

## 🇹🇭 ภาษาไทย

### 🌟 ภาพรวมโครงการ

**LevelUp Money Life** คือแอปพลิเคชันเดสก์ท็อปสำหรับการบริหารจัดการการเงินส่วนบุคคลที่ผสมผสานความเรียบง่าย รวดเร็ว และเป็นส่วนตัว ด้วยการนำตารางบันทึกข้อมูลแบบ **Notion Spreadsheet** มาผสานเข้ากับระบบ **RPG Gamification (XP, เลเวล, เควสต์ประจำวัน, เหรียญความสำเร็จ)** และระบบ **จดด่วน 1-Click** ช่วยเปลี่ยนการจดบันทึกรายรับ-รายจ่ายให้กลายเป็นนิสัยที่สนุกและทำได้ทุกวันอย่างง่ายดาย

> **หลักการออกแบบ:** *การเงินต้องมาก่อน เกมเป็นตัวเสริม (Finance first, game layer second)* ข้อมูลตัวเลขการเงินต้องถูกต้อง แม่นยำ อ่านง่าย ตอบคำถาม *"เงินหายไปกับอะไร?"* ได้ทันทีในคลิกเดียว

---

### ✨ ฟังก์ชันเด่นในระบบ

| หมวดหมู่ | รายละเอียดฟีเจอร์ |
|---|---|
| ⚡ **แถบจดด่วน & One-Tap Presets (ใหม่)** | ปุ่มลัดจดรายจ่าย 1-Click (กาแฟ, ข้าวเที่ยง, เดินทาง, 7-11, น้ำมัน) + Auto-suggest รายการยอดฮิต + ช่องพิมพ์ภาษาธรรมชาติ (`กะเพรา 65`, `25*3`, `+เงินเดือน 45000`) รู้หมวดหมู่อัตโนมัติ + Dropdown แนะนำรายการเดิม |
| 🎯 **Safe-to-Spend รายวัน (ใหม่)** | ตัวชี้วัดยอดเงินที่ "ปลอดภัยต่อการใช้จ่ายในแต่ละวัน" แบบเรียลไทม์ พร้อมไฟสถานะความสบายใจ (`comfortable`, `caution`, `critical`) |
| ↩️ **Undo Toast 5 วินาที (ใหม่)** | ป้องกันการกดผิด ด้วยแถบแจ้งเตือนนับถอยหลัง 5 วินาที พร้อมปุ่มกดยกเลิกรายการและคืนค่า XP ทันที |
| 🏠 **แดชบอร์ดศูนย์บัญชาการ (Dashboard)** | สรุปภาพรวม รายรับ, รายจ่าย, ยอดคงเหลือ, อัตราการออม, แถบเลเวล XP และ Streak การเข้าใช้งาน |
| 📜 **สมุดบัญชีสไตล์ Notion (Ledger)** | ตารางบันทึกข้อมูลความหนาแน่นสูง รองรับการค้นหา, กรองหมวดหมู่, จัดเรียง (Sort), และติ๊กสถานะเคลียร์ยอด |
| 🎯 **วางแผนงบประมาณ 50/30/20 (Budget)** | จัดสรรสัดส่วน Needs / Wants / Savings เทียบยอดใช้จริงกับเป้าหมายแบบเรียลไทม์ |
| 🧮 **คำนวณภาษีเงินได้บุคคลธรรมดา (Tax Planner)** | คำนวณอัตราภาษีขั้นบันได 0%-35% พร้อมรองรับค่าลดหย่อนภาษีไทยครบวงจร (ประกันสังคม, กองทุน PVD, RMF, SSF, ThaiESG, Easy E-Receipt, ประกันชีวิต/สุขภาพ, ดอกเบี้ยบ้าน) |
| 📊 **ศูนย์วิเคราะห์ข้อมูล (Analytics Hub)** | กราฟวงกลม Donut Chart และกราฟแท่งเปรียบเทียบสัดส่วนรายจ่ายแยกหมวดหมู่ |
| ⚔️ **ระบบเควสต์ & เลเวล (Quests & Growth)** | ภารกิจรายวันเก็บ XP เลื่อนระดับจาก Novice สู่ Grandmaster พร้อมเหรียญความสำเร็จ |
| 🧾 **สแกนสลิปโอนเงินอัจฉริยะ (Slip Scanner)** | ถอดข้อความจากภาพสลิปธนาคารไทย (KBank, SCB, PromptPay, BBL, KTB, TTB) ด้วย OCR ดึงยอดเงิน วันที่ และจัดหมวดหมู่อัตโนมัติ |
| 💾 **จัดการข้อมูล & ความเป็นส่วนตัว (Data Manager)** | ข้อมูลเก็บในเครื่อง 100% ด้วย SQLite รองรับการ Backup/Restore ไฟล์ JSON, Export ตารางเป็น CSV |
| 🎨 **ดีไซน์ระดับพรีเมียม & Bilingual** | รองรับ Dark/Light Mode, สลับภาษาไทย-อังกฤษได้ทันที, แอนิเมชันลื่นไหลด้วย Framer Motion |

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action | Scope |
|---|---|---|
| <kbd>/</kbd> หรือ <kbd>N</kbd> | โฟกัสช่องพิมพ์จดด่วน (Quick Command Bar) ทันที | ทุกหน้า (เมื่อไม่ได้พิมพ์ในช่องอื่น) |
| <kbd>Esc</kbd> | ล้างข้อความ / ยกเลิกการโฟกัสช่องพิมพ์ | Quick Command Bar / Modals |
| <kbd>↑</kbd> / <kbd>↓</kbd> | เลื่อนเลือกรายการใน Autocomplete Suggestions | Quick Command Bar |
| <kbd>Enter</kbd> | ยืนยันการบันทึกรายการด่วน | Quick Command Bar |

---

## 🛠️ Tech Stack

```
Frontend UI          React 19 + TypeScript + Vite
Styling              Tailwind CSS v4 (@tailwindcss/postcss)
Desktop Framework    Tauri v2 (Rust Native Core)
Database Layer       SQLite (@tauri-apps/plugin-sql) — 100% Local-First
Testing Engine       Vitest (71 Unit & Integration Tests Passing)
OCR Engine           Tesseract.js + HTML5 Canvas Preprocessing
Charts & Visuals     Recharts
Motion & Animations  Framer Motion v12
Iconography          Phosphor Icons React + Lucide React
Typography           Outfit (UI Sans) + JetBrains Mono (Financial Numbers)
Internationalization react-i18next (TH / EN)
```

---

## 📂 Project Structure

```
LevelUp-Money-Life/
├── src/
│   ├── components/
│   │   ├── common/                  # Reusable UI primitives (Select, Calendar, MetricTile, BentoCard)
│   │   ├── views/                   # Main application views
│   │   │   ├── DashboardOverview.tsx   # Financial overview, Safe-to-Spend & quick stats
│   │   │   ├── TransactionLedger.tsx   # Notion-style interactive data grid
│   │   │   ├── BudgetPlanner.tsx       # 50/30/20 allocation & budget limits
│   │   │   ├── TaxPlannerView.tsx      # Thai personal income tax planner & deductions
│   │   │   ├── AnalyticsHub.tsx        # Charts & category spending distribution
│   │   │   └── QuestsGrowth.tsx        # Gamified quests & achievement medals
│   │   ├── QuickCommandBar.tsx      # ⚡ Fast single-line natural language input & 1-tap presets
│   │   ├── PresetManagerModal.tsx   # ⚙️ Custom preset CRUD management dialog
│   │   ├── UndoToast.tsx            # ↩️ 5-second countdown interactive undo notification
│   │   ├── AppLogo.tsx              # Animated brand vector logo
│   │   ├── CategorySpendingChart.tsx# Donut chart spending breakdown
│   │   ├── DailyQuests.tsx          # Daily checklist widget
│   │   ├── DataManagerModal.tsx     # JSON/CSV backup, restore, & demo seed
│   │   ├── FinancialPlan.tsx        # Budget allocation sliders
│   │   ├── HeaderCommandDeck.tsx    # XP bar, view tabs, language & action buttons
│   │   ├── LevelUpCelebration.tsx   # Level up particle & modal reward screen
│   │   ├── QuickAddModal.tsx        # Detailed transaction entry modal
│   │   ├── SlipScanModal.tsx        # Thai bank slip OCR scanner & auto-parser
│   │   └── SummaryStats.tsx         # Monthly KPI cards
│   ├── hooks/                       # Custom React hooks (useTheme, useLocalStorage)
│   ├── services/
│   │   ├── db.ts                    # SQLite database service & schema migrations
│   │   ├── exportImport.ts          # CSV and JSON backup/restore snapshot engine
│   │   ├── gamification.ts          # Leveling algorithms, XP calculation & achievements
│   │   ├── slipScanner.ts           # OCR image preprocessor & Thai bank slip parser
│   │   └── taxCalculator.ts         # Thai Revenue Dept tax bracket calculator
│   ├── utils/
│   │   ├── quickParser.ts           # Natural language expense & category parser
│   │   ├── presetManager.ts         # Preset CRUD & smart frequency suggestion engine
│   │   └── safeToSpend.ts           # Daily Safe-to-Spend calculation logic
│   ├── types.ts                     # TypeScript domain definitions & color palettes
│   ├── i18n.ts                      # Bilingual translations (TH / EN)
│   ├── index.css                    # Semantic color design tokens (Light & Dark)
│   ├── App.tsx                      # Root state coordinator & global shortcut listener
│   └── main.tsx                     # React DOM mount point
├── src-tauri/                       # Tauri v2 desktop configuration & Rust backend
├── design.md                        # Single-source-of-truth design system specifications
├── PRODUCT.md                       # Product vision, target users & design principles
└── package.json
```

---

## 🚀 Getting Started

### Prerequisites

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

3. **Run Unit Tests:**
   ```bash
   npm test
   ```

4. **Start desktop development mode:**
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

## 📄 License

Distributed under the **MIT License**.

<p align="center">
  Crafted with ❤️ for smart personal finance & life leveling.
</p>
