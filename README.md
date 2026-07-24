# LevelUp Money Life

Desktop personal-finance app built with **Tauri v2 + React + TypeScript + Tailwind v4 + Recharts**. Gamified money management: daily log, month-end summary, budget planning, daily quests.

## Features

1. **Daily Money Log** — Notion-style table. Income (positive) / expense (negative). Auto-saved to local storage, full history.
2. **Month-end Summary** — Income, expenses, net, and category breakdown (donut chart).
3. **Financial Plan** — Monthly income allocator with sliders (e.g. 50/30/20) + bar chart.
4. **Daily Quests** — Checklist with XP and level. Plan ahead, toggle done.

## Prerequisites

- **Node.js** 18+
- **Rust** (via [rustup.rs](https://rustup.rs/))
- **Windows:** C++ Build Tools (Visual Studio Installer → "Desktop development with C++")

## Setup

```bash
npm install
```

## Develop

```bash
npm run tauri dev
```

Frontend hot-reloads at `http://localhost:1420`; Rust recompiles on change.

## Build production binary

```bash
npm run tauri build
```

Installer / `.exe` lands in `src-tauri/target/release/bundle/`.

> First `tauri build` needs app icons. Run once:
> ```bash
> npm run tauri icon <path-to-png>
> ```

## Tech

| Layer | Tool |
|---|---|
| Shell | Tauri v2 |
| UI | React + TypeScript |
| Build | Vite |
| Styles | Tailwind CSS v4 |
| Charts | Recharts |
| Icons | lucide-react |
| Persistence | `localStorage` (swap to `@tauri-apps/plugin-store` for cross-window sync) |

## Project layout

```
src/
  components/
    ExpenseTable.tsx     # daily log
    SummaryStats.tsx     # month-end breakdown + donut
    FinancialPlan.tsx    # allocation sliders + bar chart
    DailyQuests.tsx      # quest checklist + XP
  hooks/useLocalStorage.ts
  App.tsx
src-tauri/              # Rust backend + Tauri config
```

## Repo

Push target: https://github.com/Theeraphat-S/LevelUp-Money-Life.git
