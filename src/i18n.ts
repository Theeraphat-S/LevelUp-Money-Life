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
      level: "Level {{level}} · Money Builder",
      xp: "{{earned}}/{{goal}} XP",
      app: {
        title: "LevelUp Money Life",
        subtitle: "Track money in and out, plan next month, and build daily habits.",
        loading: "Loading LevelUp Money Life Database...",
      },
      metric: {
        spent: "Spent · this month",
        cleared: "Cleared logs",
        net: "Net outlook",
      },
      lang: { toggle: "Switch language", en: "EN", th: "TH" },
      expense: {
        title: "Daily money log",
        subtitle: "Income in, expenses out — simple and clear for everyone.",
        addExpense: "Add expense",
        addIncome: "Add income",
        type: "Type",
        incomeType: "Income",
        expenseType: "Expense",
        clearFilters: "Clear filters",
        deleted: "Entry deleted.",
        undo: "Undo",
        emptyTitle: "Start your first entry",
        emptyHint: "Add an income or expense to see monthly totals instantly.",
        noResultsTitle: "No matching entries found",
        noResultsHint: "Try changing your search term or category filter.",
        nameFor: "Entry name for {{name}}",
        amountFor: "Amount for {{name}}",
        dateFor: "Date for {{name}}",
        categoryFor: "Category for {{name}}",
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
        subtitle: "See where your money went this month.",
        income: "Income",
        expenses: "Expenses",
        net: "Net",
        total: "Total",
        spent: "Spent",
        emptyTitle: "No expenses logged this month yet",
        emptyHint: "Add expenses in your money log to see category breakdown here.",
        empty: "No expenses logged this month yet.",
        viewDonut: "Donut View",
        viewBar: "Bar View",
        viewDonutAria: "Switch to donut chart view",
        viewBarAria: "Switch to bar chart view",
        spendingAnalytics: "Category Breakdown Analytics",
        topCategory: "Top spend: {{category}} ฿{{amount}} · {{pct}}%",
      },
      plan: {
        title: "Financial plan",
        subtitle: "Divide your monthly income into 3 easy buckets.",
        incomeLabel: "Monthly income",
        incomeHint: "Enter your monthly income first to update bucket amounts.",
        incomeError: "Please enter a valid monthly income.",
        balanced: "Allocations balanced",
        unbalanced: "Total off 100% — adjust to balance",
        allocated: "Allocated",
        preset503020: "50/30/20 Rule",
        autoBalance: "Auto-Balance",
        help: {
          Needs: "Essentials like food, home, and travel",
          Wants: "Fun things like games, cafes, and toys",
          Savings: "Money saved for goals and future needs",
        },
      },
      quests: {
        title: "Daily quests",
        subtitle: "Small money habits for today.",
        add: "Add quest",
        empty: "No quests yet. Add one to start your streak.",
        delete: "Delete quest",
        newDefault: "New daily habit",
        toggle: "Mark quest {{title}} as done",
        deleted: "Quest deleted.",
        undo: "Undo",
      },
      prep: {
        title: "Next month prep",
        subtitle: "Tune categories before salary day.",
        i1: "Compare planned vs actual spend",
        i2: "Roll leftover savings forward",
        i3: "Set next month’s quest streak",
        toggle: "Toggle prep item {{item}}",
      },
    },
  },
  th: {
    translation: {
      level: "เลเวล {{level}} · นักสร้างเงิน",
      xp: "{{earned}}/{{goal}} XP",
      app: {
        title: "LevelUp Money Life",
        subtitle: "จดเงินเข้าออก วางแผนเดือนหน้า และสร้างนิสัยการเงินทุกวัน",
        loading: "กำลังโหลดฐานข้อมูล LevelUp Money Life...",
      },
      metric: {
        spent: "ใช้จ่าย · เดือนนี้",
        cleared: "ยืนยันแล้ว",
        net: "คงเหลือจริงเดือนนี้",
      },
      lang: { toggle: "เปลี่ยนภาษา", en: "EN", th: "TH" },
      expense: {
        title: "บันทึกเงินรายวัน",
        subtitle: "รายรับเข้า รายจ่ายออก — ใช้ง่าย ชัดเจนสำหรับทุกคน",
        addExpense: "เพิ่มรายจ่าย",
        addIncome: "เพิ่มรายรับ",
        type: "ชนิด",
        incomeType: "รายรับ",
        expenseType: "รายจ่าย",
        clearFilters: "ล้างตัวกรอง",
        deleted: "ลบรายการแล้ว",
        undo: "เลิกทำ",
        emptyTitle: "เริ่มเพิ่มรายการแรก",
        emptyHint: "เพิ่มรายรับหรือรายจ่าย แล้วดูสรุปประจำเดือนได้ทันที",
        noResultsTitle: "ไม่พบรายการที่ค้นหา",
        noResultsHint: "ลองเปลี่ยนคำค้นหาหรือเปลี่ยนตัวกรองหมวดหมู่",
        nameFor: "ชื่อรายการสำหรับ {{name}}",
        amountFor: "จำนวนเงินสำหรับ {{name}}",
        dateFor: "วันที่สำหรับ {{name}}",
        categoryFor: "หมวดหมู่สำหรับ {{name}}",
        name: "รายการ",
        amount: "จำนวนเงิน",
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
        subtitle: "ดูว่าเดือนนี้ใช้เงินไปกับอะไรบ้าง",
        income: "รายได้",
        expenses: "ค่าใช้จ่าย",
        net: "คงเหลือ",
        total: "รวม",
        spent: "ใช้จ่าย",
        emptyTitle: "ยังไม่มีค่าใช้จ่ายในเดือนนี้",
        emptyHint: "เพิ่มรายจ่ายในบันทึกเงิน แล้วสรุปหมวดหมู่จะขึ้นที่นี่",
        empty: "ยังไม่มีค่าใช้จ่ายในเดือนนี้",
        viewDonut: "มุมมองโดนัท",
        viewBar: "มุมมองแท่ง",
        viewDonutAria: "สลับเป็นกราฟโดนัท",
        viewBarAria: "สลับเป็นกราฟแท่ง",
        spendingAnalytics: "วิเคราะห์ค่าใช้จ่ายตามหมวดหมู่",
        topCategory: "ใช้มากสุด: {{category}} ฿{{amount}} · {{pct}}%",
      },
      plan: {
        title: "แผนการเงิน",
        subtitle: "แบ่งเงินเดือนเป็น 3 กองง่าย ๆ",
        incomeLabel: "เงินรับต่อเดือน",
        incomeHint: "ใส่เงินรับต่อเดือนก่อน เพื่อคำนวณยอดเงินแต่ละกอง",
        incomeError: "กรุณาใส่จำนวนเงินให้ถูกต้อง",
        balanced: "สัดส่วนครบ 100%",
        unbalanced: "รวมไม่ครบ 100% — ปรับให้สมดุล",
        allocated: "ที่จัดสรร",
        preset503020: "สูตร 50/30/20",
        autoBalance: "ปรับสมดุลอัตโนมัติ",
        help: {
          Needs: "ของจำเป็น เช่น อาหาร บ้าน การเดินทาง",
          Wants: "ของอยากได้ เช่น เกม คาเฟ่ ของเล่น",
          Savings: "เงินออมสำหรับเป้าหมายและอนาคต",
        },
      },
      quests: {
        title: "เควสประจำวัน",
        subtitle: "นิสัยการเงินเล็ก ๆ ของวันนี้",
        add: "เพิ่มเควส",
        empty: "ยังไม่มีเควส เพิ่มเควสเพื่อเริ่มสะสมนิสัยที่ดี",
        delete: "ลบเควส",
        newDefault: "นิสัยประจำวันใหม่",
        toggle: "ทำเครื่องหมายเควส {{title}} ว่าเสร็จแล้ว",
        deleted: "ลบเควสแล้ว",
        undo: "เลิกทำ",
      },
      prep: {
        title: "เตรียมเดือนหน้า",
        subtitle: "ปรับหมวดหมู่ก่อนถึงวันเงินเดือน",
        i1: "เทียบแผนกับที่ใช้จริง",
        i2: "ยกยอดเงินออมไปเดือนถัดไป",
        i3: "ตั้งสถิติเควสเดือนหน้า",
        toggle: "สลับสถานะรายการเตรียมตัว {{item}}",
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
