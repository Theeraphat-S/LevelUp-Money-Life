import i18n from "i18next";
import { initReactI18next } from "react-i18next";

export type Lang = "en" | "th";

const STORAGE_KEY = "levelup.lang";

function detectInitial(): Lang {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "en" || stored === "th") return stored;
  } catch {
    /* ignore */
  }
  if (typeof navigator !== "undefined" && navigator.language?.toLowerCase().startsWith("th")) return "th";
  return "en";
}

const resources = {
  en: {
    translation: {
      level: "Level {{level}} · Money Adventurer",
      xp: "{{earned}}/{{goal}} XP",
      app: {
        title: "LevelUp Money Life",
        subtitle: "A personal finance cockpit — daily log, month-end clarity, allocation planning, and habit quests in one desk surface.",
      },
      metric: {
        spent: "Spent · this month",
        cleared: "Cleared logs",
        net: "Net outlook",
      },
      lang: { toggle: "Switch language", en: "EN", th: "TH" },
      expense: {
        title: "Daily money log",
        subtitle: "Income in, expenses out — every line kept for history.",
        add: "Add entry",
        name: "Name",
        amount: "Amount",
        date: "Date",
        category: "Category",
        cleared: "Cleared",
        empty: "No entries match your view.",
        delete: "Delete entry",
        markCleared: "Mark {{name}} cleared",
        searchPlaceholder: "Search transactions...",
        allCategories: "All Categories",
        exportCSV: "Export CSV",
        exportJSON: "Backup (JSON)",
        importCSV: "Import CSV",
        importJSON: "Restore (JSON)",
      },
      category: {
        Income: "Income",
        Food: "Food",
        Transport: "Transport",
        Home: "Home",
        Health: "Health",
        Learning: "Learning",
        Fun: "Fun",
        Debt: "Debt",
        Savings: "Savings",
      },
      alloc: { Needs: "Needs", Wants: "Wants", Savings: "Savings" },
      summary: {
        title: "Month-end summary",
        subtitle: "Where the money went this month.",
        income: "Income",
        expenses: "Expenses",
        net: "Net",
        total: "Total",
        spent: "Spent",
        empty: "No expenses logged this month yet.",
        viewDonut: "Donut View",
        viewBar: "Bar View",
        spendingAnalytics: "Category Breakdown Analytics",
      },
      plan: {
        title: "Financial plan",
        subtitle: "Allocate monthly income across each bucket.",
        incomeLabel: "Monthly income",
        balanced: "Allocations balanced",
        unbalanced: "Total off 100% — adjust to balance",
        allocated: "Allocated",
      },
      quests: {
        title: "Daily quests",
        subtitle: "Habits that compound. Plan ahead, check off.",
        add: "Add quest",
        empty: "No quests yet. Add one to start the streak.",
        delete: "Delete quest",
        newDefault: "New daily habit",
      },
      prep: {
        title: "Next month prep",
        subtitle: "Tune categories before salary day.",
        i1: "Compare planned vs actual spend",
        i2: "Roll leftover savings forward",
        i3: "Set next month’s quest streak",
      },
    },
  },
  th: {
    translation: {
      level: "เลเวล {{level}} · นักผจญภัยเรื่องเงิน",
      xp: "{{earned}}/{{goal}} XP",
      app: {
        title: "LevelUp Money Life",
        subtitle: "ฐานบัญชาการการเงินส่วนตัว — บันทึกรายวัน สรุปสิ้นเดือน วางแผนสัดส่วน และเควสสร้างนิสัย ในหน้าเดียว",
      },
      metric: {
        spent: "ใช้จ่าย · เดือนนี้",
        cleared: "ยืนยันแล้ว",
        net: "คงเหลือโดยประมาณ",
      },
      lang: { toggle: "เปลี่ยนภาษา", en: "EN", th: "TH" },
      expense: {
        title: "บันทึกเงินรายวัน",
        subtitle: "รายรับเข้า รายจ่ายออก — เก็บทุกบรรทัดไว้ดูย้อนหลัง",
        add: "เพิ่มรายการ",
        name: "รายการ",
        amount: "จำนวน",
        date: "วันที่",
        category: "หมวดหมู่",
        cleared: "ยืนยัน",
        empty: "ไม่พบรายการตามเงื่อนไข",
        delete: "ลบรายการ",
        markCleared: "ทำเครื่องหมาย {{name}} ว่ายืนยันแล้ว",
        searchPlaceholder: "ค้นหารายการ...",
        allCategories: "ทุกหมวดหมู่",
        exportCSV: "ส่งออก CSV",
        exportJSON: "สำรองข้อมูล (JSON)",
        importCSV: "นำเข้า CSV",
        importJSON: "กู้คืนข้อมูล (JSON)",
      },
      category: {
        Income: "รายได้",
        Food: "อาหาร",
        Transport: "การเดินทาง",
        Home: "ที่พัก",
        Health: "สุขภาพ",
        Learning: "การเรียน",
        Fun: "สนุก",
        Debt: "หนี้",
        Savings: "เงินออม",
      },
      alloc: { Needs: "จำเป็น", Wants: "อยากได้", Savings: "ออม" },
      summary: {
        title: "สรุปสิ้นเดือน",
        subtitle: "เดือนนี้เงินหายไปกับอะไรบ้าง",
        income: "รายได้",
        expenses: "ค่าใช้จ่าย",
        net: "คงเหลือ",
        total: "รวม",
        spent: "ใช้จ่าย",
        empty: "ยังไม่มีค่าใช้จ่ายในเดือนนี้",
        viewDonut: "มุมมองโดนัท",
        viewBar: "มุมมองแท่ง",
        spendingAnalytics: "วิเคราะห์ค่าใช้จ่ายตามหมวดหมู่",
      },
      plan: {
        title: "แผนการเงิน",
        subtitle: "จัดสรรเงินเดือนไปยังแต่ละกอง",
        incomeLabel: "เงินเดือน",
        balanced: "สัดส่วนครบ 100%",
        unbalanced: "รวมไม่ครบ 100% — ปรับให้สมดุล",
        allocated: "ที่จัดสรร",
      },
      quests: {
        title: "เควสประจำวัน",
        subtitle: "นิสัยที่สะสม วางแผนล่วงหน้า แล้วทำเสร็จ",
        add: "เพิ่มเควส",
        empty: "ยังไม่มีเควส เพิ่มเพื่อเริ่มสะสมสถิติ",
        delete: "ลบเควส",
        newDefault: "นิสัยประจำวันใหม่",
      },
      prep: {
        title: "เตรียมเดือนหน้า",
        subtitle: "ปรับหมวดหมู่ก่อนถึงวันเงินเดือน",
        i1: "เทียบแผนกับที่ใช้จริง",
        i2: "ยกยอดเงินออมไปเดือนถัดไป",
        i3: "ตั้งสถิติเควสเดือนหน้า",
      },
    },
  },
} as const;

i18n.use(initReactI18next).init({
  resources,
  lng: detectInitial(),
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

i18n.on("languageChanged", (lng) => {
  try {
    localStorage.setItem(STORAGE_KEY, lng);
  } catch {
    /* ignore */
  }
});

export default i18n;
