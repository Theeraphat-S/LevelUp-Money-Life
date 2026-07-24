# 🎮 LevelUp Money Life

<p align="center">
  <b>Modern Gamified Personal Finance & Life Tracker Desktop App</b>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Tauri-v2-blue?logo=tauri&logoColor=white" alt="Tauri v2" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black" alt="React 19" />
  <img src="https://img.shields.io/badge/TypeScript-5.0+-3178C6?logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?logo=tailwindcss&logoColor=white" alt="Tailwind CSS v4" />
  <img src="https://img.shields.io/badge/Language-TH%20%7C%20EN-orange" alt="i18n TH/EN" />
</p>

---

<p align="center">
  <a href="#-english"><b>English</b></a> •
  <a href="#-ภาษาไทย"><b>ภาษาไทย</b></a>
</p>

---

## 🇬🇧 English

### Overview
**LevelUp Money Life** is a lightweight, high-performance desktop application designed to make personal finance management engaging and effortless. By blending **Notion-style tracking** with **gamification elements** (XP, Leveling, Daily Quests), it turns daily financial discipline into an enjoyable game.

### ✨ Key Features
- 📊 **Daily Money Log**: Notion-style interactive table for recording income and expenses with automatic local auto-save.
- 📈 **Month-End Summary**: Comprehensive visual breakdown of net balance, total income, expenses, and category charts (Recharts).
- 🎯 **Financial Planning**: Interactive allocation sliders (e.g., 50/30/20 rule) with real-time target visualization.
- 🎮 **Daily Quests & Gamification**: Earn XP and level up as you complete your daily habits and financial goals.
- 🌐 **Multi-Language Support**: Instant switching between English and Thai.
- ⚡ **Native Performance**: Built on Tauri v2 for minimal memory usage, instant launch, and small binary size.

### 🛠️ Tech Stack
| Category | Technology |
|---|---|
| **Core Desktop Engine** | [Tauri v2](https://tauri.app/) (Rust) |
| **Frontend Framework** | [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) |
| **Build Tool** | [Vite](https://vitejs.dev/) |
| **Styling & Fonts** | [Tailwind CSS v4](https://tailwindcss.com/), JetBrains Mono, Outfit |
| **Animations & UI** | [Framer Motion](https://www.framer.com/motion/) |
| **Data Visualization** | [Recharts](https://recharts.org/) |
| **Icons** | [Lucide React](https://lucide.dev/), [Phosphor Icons](https://phosphoricons.com/) |
| **Internationalization** | [i18next](https://www.i18next.com/) |

### 🚀 Getting Started

#### Prerequisites
- **Node.js** (v18 or higher)
- **Rust** (Install via [rustup.rs](https://rustup.rs/))
- **Windows Users**: Visual Studio C++ Build Tools ("Desktop development with C++")

#### Installation & Development
```bash
# Clone repository
git clone https://github.com/Theeraphat-S/LevelUp-Money-Life.git
cd LevelUp-Money-Life

# Install dependencies
npm install

# Run in desktop development mode
npm run tauri dev
```

#### Build Production App
```bash
npm run tauri build
```
> The compiled binary / installer will be generated in `src-tauri/target/release/bundle/`.

---

## 🇹🇭 ภาษาไทย

### ภาพรวมโครงการ
**LevelUp Money Life** คือแอปพลิเคชันเดสก์ท็อปสำหรับจัดการการเงินส่วนบุคคลและเป้าหมายชีวิตแบบ Gamification ที่ยกระดับการบันทึกรายรับ-รายจ่ายให้สนุกสนาน ไม่น่าเบื่อ รวมแนวคิดการบันทึกแบบ **Notion-style** เข้ากับระบบ **เก็บเลเวล (XP & Leveling)** และภารกิจรายวัน (Daily Quests)

### ✨ ฟีเจอร์หลัก
- 📊 **บันทึกรายรับ-รายจ่ายรายวัน (Daily Log)**: ตารางบันทึกสไตล์ Notion ใช้งานง่าย บันทึกข้อมูลให้อัตโนมัติลงในเครื่อง (Local Storage)
- 📈 **สรุปภาพรวมรายเดือน (Month-End Summary)**: วิเคราะห์รายได้ รายจ่าย ยอดคงเหลือ พร้อมกราฟวงกลมแยกหมวดหมู่ชัดเจน
- 🎯 **วางแผนการเงิน (Financial Plan)**: เครื่องมือจัดสรรงบประมาณ (เช่น กฎ 50/30/20) พร้อมสไลเดอร์ปรับสัดส่วนแบบเรียลไทม์
- 🎮 **ระบบภารกิจและเลเวล (Daily Quests & XP)**: ทำภารกิจรายวันเพื่อรับ XP ยกระดับเลเวลชีวิตและการเงิน
- 🌐 **รองรับสองภาษา (TH/EN)**: สลับเปลี่ยนภาษาไทยและอังกฤษได้ทันทีภายในแอป
- ⚡ **ทำงานรวดเร็ว เบา ไม่กินสเปก**: พัฒนาด้วย Tauri v2 ให้ประสิทธิภาพสูงและขนาดไฟล์ที่เล็ก

### 🛠️ เทคโนโลยีที่ใช้
| หมวดหมู่ | เทคโนโลยี |
|---|---|
| **ระบบเดสก์ท็อป** | [Tauri v2](https://tauri.app/) (Rust) |
| **เฟรมเวิร์ก Frontend** | [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) |
| **เครื่องมือ Build** | [Vite](https://vitejs.dev/) |
| **สไตล์และฟอนต์** | [Tailwind CSS v4](https://tailwindcss.com/), JetBrains Mono, Outfit |
| **เอฟเฟกต์/อนิเมชัน** | [Framer Motion](https://www.framer.com/motion/) |
| **แสดงผลกราฟ** | [Recharts](https://recharts.org/) |
| **ไอคอน** | [Lucide React](https://lucide.dev/), [Phosphor Icons](https://phosphoricons.com/) |
| **ระบบเปลี่ยนภาษา** | [i18next](https://www.i18next.com/) |

### 🚀 วิธีการติดตั้งและใช้งาน

#### สิ่งที่ต้องเตรียมก่อนใช้งาน
- **Node.js** (เวอร์ชัน 18 ขึ้นไป)
- **Rust** (ติดตั้งผ่าน [rustup.rs](https://rustup.rs/))
- **ผู้ใช้ Windows**: Visual Studio C++ Build Tools (เลือกหัวข้อ "Desktop development with C++")

#### การติดตั้งและรันโปรแกรม (Development)
```bash
# คลองคลังโค้ด
git clone https://github.com/Theeraphat-S/LevelUp-Money-Life.git
cd LevelUp-Money-Life

# ติดตั้ง Dependencies
npm install

# รันโปรแกรมในรูปแบบ Desktop Mode
npm run tauri dev
```

#### การสร้างไฟล์ติดตั้ง (Production Build)
```bash
npm run tauri build
```
> ไฟล์ `.exe` หรือตัวติดตั้งจะอยู่ที่ `src-tauri/target/release/bundle/`

---

## 📂 Project Structure

```
LevelUp-Money-Life/
├── src/
│   ├── components/       # UI Components (ExpenseTable, SummaryStats, FinancialPlan, DailyQuests)
│   ├── hooks/            # Custom React Hooks (useLocalStorage, etc.)
│   ├── i18n/             # Internationalization config & translation files
│   ├── App.tsx           # Main Application Container
│   └── main.tsx          # React Entry Point
├── src-tauri/            # Tauri & Rust Backend Configuration
└── package.json
```

---

<p align="center">
  Created with ❤️ for smart personal finance & life leveling.
</p>
