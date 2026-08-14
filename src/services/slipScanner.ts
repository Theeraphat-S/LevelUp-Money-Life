import { createWorker } from "tesseract.js";
import type { TransactionCategory } from "../types";

export interface ParsedSlipResult {
  bankName: string;
  transactionType: "expense" | "income";
  amount: number;
  date: string; // "YYYY-MM-DD"
  time?: string;
  sender?: string;
  receiver?: string;
  refNumber?: string;
  suggestedCategory: TransactionCategory;
  description: string;
  notes?: string;
  rawText?: string;
  confidence: number;
  engine: "gemini" | "local_ocr";
}

const THAI_MONTHS: Record<string, string> = {
  "ม.ค.": "01", "มกราคม": "01",
  "ก.พ.": "02", "กุมภาพันธ์": "02",
  "มี.ค.": "03", "มีนาคม": "03",
  "เม.ย.": "04", "เมษายน": "04",
  "พ.ค.": "05", "พฤษภาคม": "05",
  "มิ.ย.": "06", "มิถุนายน": "06",
  "ก.ค.": "07", "กรกฎาคม": "07",
  "ส.ค.": "08", "สิงหาคม": "08",
  "ก.ย.": "09", "กันยายน": "09",
  "ต.ค.": "10", "ตุลาคม": "10",
  "พ.ย.": "11", "พฤศจิกายน": "11",
  "ธ.ค.": "12", "ธันวาคม": "12",
  "jan": "01", "january": "01",
  "feb": "02", "february": "02",
  "mar": "03", "march": "03",
  "apr": "04", "april": "04",
  "may": "05",
  "jun": "06", "june": "06",
  "jul": "07", "july": "07",
  "aug": "08", "august": "08",
  "sep": "09", "september": "09",
  "oct": "10", "october": "10",
  "nov": "11", "november": "11",
  "dec": "12", "december": "12",
};

/**
 * Preprocesses an image using HTML Canvas (grayscale + contrast enhancement)
 * to maximize OCR recognition accuracy on colored bank slip backgrounds.
 */
async function preprocessImage(imageSource: string | File): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(typeof imageSource === "string" ? imageSource : URL.createObjectURL(imageSource));
        return;
      }

      // Upscale if too small, limit max dimension to 1800px for speed
      const scale = Math.min(1.5, 1800 / Math.max(img.width, img.height));
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imgData.data;

      // Enhance contrast & convert to high-contrast grayscale
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        let gray = 0.299 * r + 0.587 * g + 0.114 * b;
        
        // Contrast curve
        gray = ((gray - 128) * 1.3) + 128;
        gray = Math.max(0, Math.min(255, gray));

        data[i] = gray;
        data[i + 1] = gray;
        data[i + 2] = gray;
      }

      ctx.putImageData(imgData, 0, 0);
      resolve(canvas.toDataURL("image/png"));
    };

    img.onerror = () => {
      resolve(typeof imageSource === "string" ? imageSource : URL.createObjectURL(imageSource));
    };

    if (typeof imageSource === "string") {
      img.src = imageSource;
    } else {
      img.src = URL.createObjectURL(imageSource);
    }
  });
}

/**
 * Converts File or Data URL to clean Base64 string + MimeType
 */
async function getBase64Data(imageSource: string | File): Promise<{ base64: string; mimeType: string }> {
  if (imageSource instanceof File) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const [header, base64] = result.split(",");
        const mimeType = header.match(/:(.*?);/)?.[1] || "image/jpeg";
        resolve({ base64, mimeType });
      };
      reader.onerror = reject;
      reader.readAsDataURL(imageSource);
    });
  } else if (imageSource.startsWith("data:")) {
    const [header, base64] = imageSource.split(",");
    const mimeType = header.match(/:(.*?);/)?.[1] || "image/jpeg";
    return { base64, mimeType };
  } else {
    const resp = await fetch(imageSource);
    const blob = await resp.blob();
    return getBase64Data(new File([blob], "slip.jpg", { type: blob.type }));
  }
}

const MONTH_PATTERN = "ม\\.ค\\.?|ก\\.พ\\.?|มี\\.ค\\.?|เม\\.ย\\.?|พ\\.ค\\.?|มิ\\.ย\\.?|ก\\.ค\\.?|ส\\.ค\\.?|ก\\.ย\\.?|ต\\.ค\\.?|พ\\.ย\\.?|ธ\\.ค\\.?|มกราคม|กุมภาพันธ์|มีนาคม|เมษายน|พฤษภาคม|มิถุนายน|กรกฎาคม|สิงหาคม|กันยายน|ตุลาคม|พฤศจิกายน|ธันวาคม|jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?";

/**
 * Parses Thai bank date strings and converts Buddhist Era (พ.ศ.) to ISO YYYY-MM-DD.
 */
export function parseThaiDateString(text: string): { date: string; time?: string } | null {
  const today = new Date().toISOString().slice(0, 10);

  // 1. Look for labeled date e.g. "วันที่ทำรายการ 23 มี.ค. 2569 - 10:38"
  const labeledRegex = new RegExp(`(?:วันที่(?:ทำรายการ)?|date)[\\s:.]*([0-9]{1,2})\\s*(${MONTH_PATTERN})\\s*([0-9]{2,4})(?:[\\s,-]+([0-9]{1,2}:[0-9]{2}))?`, "i");
  let match = text.match(labeledRegex);

  // 2. Fallback to any date containing a valid month token
  if (!match) {
    const genericMonthRegex = new RegExp(`([0-9]{1,2})\\s*(${MONTH_PATTERN})\\s*([0-9]{2,4})(?:[\\s,-]+([0-9]{1,2}:[0-9]{2}))?`, "i");
    match = text.match(genericMonthRegex);
  }

  if (match) {
    const day = parseInt(match[1], 10);
    const monthRaw = match[2].trim().toLowerCase();
    let year = parseInt(match[3], 10);
    const time = match[4];

    // Find month number
    let monthStr = "01";
    for (const [k, v] of Object.entries(THAI_MONTHS)) {
      if (
        monthRaw.startsWith(k) ||
        k.startsWith(monthRaw) ||
        monthRaw.replace(/\./g, "") === k.replace(/\./g, "")
      ) {
        monthStr = v;
        break;
      }
    }

    // Convert Buddhist Era to CE
    if (year >= 2400) {
      year -= 543;
    } else if (year >= 50 && year < 100) {
      // 2-digit BE (e.g. 67, 68, 69)
      year = (2500 + year) - 543;
    } else if (year < 50) {
      // 2-digit CE (e.g. 24, 25, 26)
      year = 2000 + year;
    }

    const isoDate = `${year}-${monthStr}-${String(day).padStart(2, "0")}`;
    if (!isNaN(new Date(isoDate).getTime())) {
      return { date: isoDate, time };
    }
  }

  // Pattern: "DD/MM/YYYY" or "YYYY-MM-DD"
  const slashPattern = /(?:วันที่|date)?[\s:.]*([0-9]{1,2})[\/\.]([0-9]{1,2})[\/\.]([0-9]{2,4})(?:[\s-]+([0-9]{1,2}:[0-9]{2}))?/i;
  const slashMatch = text.match(slashPattern);
  if (slashMatch) {
    const d = parseInt(slashMatch[1], 10);
    const m = parseInt(slashMatch[2], 10);
    let y = parseInt(slashMatch[3], 10);
    const time = slashMatch[4];

    if (y >= 2400) y -= 543;
    else if (y >= 50 && y < 100) y = (2500 + y) - 543;
    else if (y < 50) y = 2000 + y;

    const isoDate = `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    if (!isNaN(new Date(isoDate).getTime())) {
      return { date: isoDate, time };
    }
  }

  return { date: today };
}

/**
 * Intelligent categorization based on recipient/merchant name or keywords
 */
export function guessCategoryFromText(text: string): TransactionCategory {
  const t = text.toLowerCase();

  // Food & Dining
  if (
    /line\s*pay|ไลน์\s*เพย์|food|restaurant|cafe|coffee|lineman|grabfood|shopeefood|7-eleven|seven|เซเว่น|อาหาร|ข้าว|ก๋วยเตี๋ยว|ชาบู|ส้มตำ|เบเกอรี่|กาแฟ|อเมซอน|starbucks|mcdonald|kfc|shabu|sukishi|barbq|mk\s/i.test(t)
  ) {
    return "Food";
  }

  // Transport
  if (
    /transport|bts|mrt|srt|bolt|grab|taxi|tollway|ทางด่วน|น้ำมัน|ptt|bangchak|shell|caltex|รถไฟ|ตั๋วรถ|เครื่องบิน|airasia|nokair|vietjet/i.test(t)
  ) {
    return "Transport";
  }

  // Home & Utilities
  if (
    /home|condo|rent|ค่าน้ำ|ค่าไฟ|การไฟฟ้า|การประปา|pea|mea|pwa|mwa|internet|ais|true|dtac|nt|3bb|ikea|homepro|ไทวัสดุ|คอนโด|เช่า|หอพัก/i.test(t)
  ) {
    return "Home";
  }

  // Health & Wellness
  if (
    /health|hospital|clinic|โรงพยาบาล|คลินิก|ยา|pharmacy|boots|watsons|หมอ|ทันตกรรม|ฟิตเนส|fitness|gym|yoga/i.test(t)
  ) {
    return "Health";
  }

  // Learning & Education
  if (
    /learning|course|udemy|coursera|book|หนังสือ|se-ed|naiin|นายอินทร์|ค่าเทอม|มหาลัย|โรงเรียน|school|university|อบรม|คอร์ส/i.test(t)
  ) {
    return "Learning";
  }

  // Entertainment & Fun
  if (
    /fun|game|steam|playstation|nintendo|netflix|spotify|youtube|cinema|major|sf\s*cinema|ดูหนัง|เที่ยว|hotel|resort|agoda|shopee|lazada|tiktok|บันเทิง/i.test(t)
  ) {
    return "Fun";
  }

  // Debt & Loans
  if (
    /debt|loan|credit|บัตรเครดิต|สินเชื่อ|ผ่อน|ค่างวด|กู้|กยศ|ไฟแนนซ์/i.test(t)
  ) {
    return "Debt";
  }

  // Savings & Investments
  if (
    /saving|investment|fund|กองทุน|หุ้น|crypto|binance|bitkub|ออมเงิน|ฝากเงิน|สลาก/i.test(t)
  ) {
    return "Savings";
  }

  return "Food";
}

/**
 * Extracts bank, amount, date, receiver, sender, and ref code using regex heuristics
 */
export function extractThaiBankSlipData(rawText: string): Partial<ParsedSlipResult> {
  const lines = rawText.split("\n").map((l) => l.trim()).filter(Boolean);
  const fullText = lines.join(" ");

  // 1. Detect Bank
  let bankName = "Thai Bank";
  if (/krungthai|กรุงไทย|ktb|next/i.test(fullText)) bankName = "Krungthai Bank (กรุงไทย)";
  else if (/kasikorn|กสิกรไทย|kbank|k\s*plus/i.test(fullText)) bankName = "Kasikornbank (กสิกรไทย)";
  else if (/ไทยพาณิชย์|scb|scb\s*easy/i.test(fullText)) bankName = "SCB (ไทยพาณิชย์)";
  else if (/กรุงเทพ|bangkok\s*bank|bbl|bualuang/i.test(fullText)) bankName = "Bangkok Bank (กรุงเทพ)";
  else if (/กรุงศรี|krungsri|bay|kma/i.test(fullText)) bankName = "Krungsri (กรุงศรี)";
  else if (/ออมสิน|gsb|mymo/i.test(fullText)) bankName = "GSB (ออมสิน)";
  else if (/ttb|ทหารไทยธนชาต|touch/i.test(fullText)) bankName = "ttb (ทีทีบี)";
  else if (/truemoney|ทรูมันนี่/i.test(fullText)) bankName = "TrueMoney Wallet";
  else if (/shopeepay|ช้อปปี้เพย์/i.test(fullText)) bankName = "ShopeePay";
  else if (/line\s*pay|ไลน์\s*เพย์/i.test(fullText)) bankName = "LINE Pay";
  else if (/promptpay|พร้อมเพย์/i.test(fullText)) bankName = "PromptPay (พร้อมเพย์)";

  // 2. Detect Transaction Type
  let transactionType: "expense" | "income" = "expense";
  if (
    /รับเงินสำเร็จ|เงินเข้า|ได้รับเงิน|เงินโอนเข้า|payment\s*received/i.test(fullText) &&
    !/จ่ายบิลสำเร็จ|โอนเงินสำเร็จ|ชำระเงินสำเร็จ/i.test(fullText)
  ) {
    transactionType = "income";
  }

  // 3. Detect Amount
  let amount = 0;
  // Match "จำนวนเงิน 66.00 บาท" or "จำนวนเงิน 66.00" or "66.00 บาท" or "66.00 THB"
  const amountPatterns = [
    /จำนวนเงิน(?:โอน)?\s*[:\s]?\s*([0-9,]+\.[0-9]{2})/i,
    /จำนวนเงิน\s*([0-9,]+(?:\.[0-9]{2})?)\s*บาท/i,
    /([0-9,]+\.[0-9]{2})\s*บาท/i,
    /([0-9,]+\.[0-9]{2})\s*thb/i,
    /amount\s*[:\s]?\s*([0-9,]+\.[0-9]{2})/i,
  ];

  for (const pat of amountPatterns) {
    const m = fullText.match(pat);
    if (m && m[1]) {
      const parsed = parseFloat(m[1].replace(/,/g, ""));
      if (!isNaN(parsed) && parsed > 0) {
        amount = parsed;
        break;
      }
    }
  }

  // Fallback: search any decimal currency number in text if amount is still 0
  if (amount === 0) {
    const genericMatch = fullText.match(/\b([0-9]{1,6}\.[0-9]{2})\b/);
    if (genericMatch) {
      amount = parseFloat(genericMatch[1]);
    }
  }

  // 4. Detect Date & Time
  const { date, time } = parseThaiDateString(fullText) || { date: new Date().toISOString().slice(0, 10) };

  // 5. Detect Reference Number
  let refNumber: string | undefined;
  const refMatch = fullText.match(/(?:รหัสอ้างอิง|หมายเลขอ้างอิง|ref(?:\s*no|\s*id)?|transaction\s*id)[\s:.]*([a-z0-9]{8,30})/i);
  if (refMatch && refMatch[1]) {
    refNumber = refMatch[1];
  }

  // 6. Detect Receiver / Recipient
  let receiver: string | undefined;
  if (/ไลน์\s*เพย์/i.test(fullText)) receiver = "ไลน์ เพย์";
  else if (/7-eleven|เซเว่น/i.test(fullText)) receiver = "7-Eleven";
  else if (/shopee/i.test(fullText)) receiver = "Shopee";
  else if (/lazada/i.test(fullText)) receiver = "Lazada";
  else if (/grab/i.test(fullText)) receiver = "Grab";
  else if (/lineman/i.test(fullText)) receiver = "LINE MAN";

  // If not matched by keywords, try finding line following sender/receiver indicators
  if (!receiver) {
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (/ไปยัง|ไปยังบัญชี|ผู้รับเงิน|to\s*account|to\s*:/i.test(line)) {
        if (lines[i + 1]) receiver = lines[i + 1];
        break;
      }
    }
  }

  // 7. Detect Sender
  let sender: string | undefined;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/จาก|จากบัญชี|ผู้โอน|from\s*account|from\s*:/i.test(line)) {
      if (lines[i + 1]) sender = lines[i + 1];
      break;
    }
  }

  // 8. Construct Description & Suggested Category
  const merchantOrTarget = receiver || (transactionType === "income" ? (sender || "Income Transfer") : bankName);
  const description = transactionType === "income"
    ? `รับเงินจาก ${merchantOrTarget}`
    : `จ่าย ${merchantOrTarget}`;

  const suggestedCategory = transactionType === "income"
    ? "Income"
    : guessCategoryFromText(`${merchantOrTarget} ${fullText}`);

  const notes = [
    bankName,
    sender ? `From: ${sender}` : null,
    receiver ? `To: ${receiver}` : null,
    time ? `Time: ${time}` : null,
    refNumber ? `Ref: ${refNumber}` : null,
  ].filter(Boolean).join(" · ");

  return {
    bankName,
    transactionType,
    amount,
    date,
    time,
    sender,
    receiver,
    refNumber,
    suggestedCategory,
    description,
    notes,
    rawText,
    confidence: amount > 0 ? 0.85 : 0.5,
    engine: "local_ocr",
  };
}

/**
 * Google Gemini AI Vision Parser (Zero-config prompt designed for Thai bank slips)
 */
async function parseWithGeminiVision(
  imageSource: string | File,
  apiKey: string
): Promise<ParsedSlipResult> {
  const { base64, mimeType } = await getBase64Data(imageSource);

  const prompt = `You are a financial OCR expert specializing in Thai bank e-Slips (e.g. Krungthai, KBank, SCB, Bangkok Bank, GSB, PromptPay, TrueMoney, Line Pay).
Analyze this uploaded slip image and return ONLY a valid JSON object strictly matching this schema:
{
  "bankName": "Bank or provider name (e.g. Krungthai Bank, KBank, SCB, LINE Pay, PromptPay)",
  "transactionType": "expense" | "income",
  "amount": number (positive decimal number e.g. 66.00, without commas or currency symbols),
  "date": "YYYY-MM-DD" (Convert Buddhist Year 25xx to Common Era 20xx e.g. 23 มี.ค. 2569 -> 2026-03-23),
  "time": "HH:mm" (e.g. 10:38),
  "sender": "Sender name or account snippet if visible",
  "receiver": "Receiver name or merchant name (e.g. ไลน์ เพย์, Grab, 7-Eleven)",
  "refNumber": "Transaction reference number / รหัสอ้างอิง",
  "suggestedCategory": "Food" | "Transport" | "Home" | "Health" | "Learning" | "Fun" | "Debt" | "Savings" | "Income",
  "description": "Short friendly Thai title (e.g. จ่าย ไลน์ เพย์, ค่าอาหาร, โอนเงิน)",
  "notes": "Helpful details such as bank name, recipient and ref code"
}`;

  const payload = {
    contents: [
      {
        parts: [
          { text: prompt },
          {
            inlineData: {
              mimeType,
              data: base64,
            },
          },
        ],
      },
    ],
    generationConfig: {
      responseMimeType: "application/json",
      temperature: 0.1,
    },
  };

  let response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }
  );

  if (!response.ok) {
    response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );
  }

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Gemini API Error (${response.status}): ${errText}`);
  }

  const jsonResp = await response.json();
  const textContent = jsonResp.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!textContent) {
    throw new Error("No response generated from Gemini Vision API");
  }

  const parsed = JSON.parse(textContent);
  return {
    bankName: parsed.bankName || "Thai Bank",
    transactionType: parsed.transactionType === "income" ? "income" : "expense",
    amount: typeof parsed.amount === "number" ? Math.abs(parsed.amount) : parseFloat(parsed.amount) || 0,
    date: parsed.date || new Date().toISOString().slice(0, 10),
    time: parsed.time,
    sender: parsed.sender,
    receiver: parsed.receiver,
    refNumber: parsed.refNumber,
    suggestedCategory: (parsed.suggestedCategory as TransactionCategory) || "Food",
    description: parsed.description || `จ่าย ${parsed.receiver || parsed.bankName || "รายการ"}`,
    notes: parsed.notes || `${parsed.bankName || "Slip"} · Ref: ${parsed.refNumber || ""}`,
    confidence: 0.98,
    engine: "gemini",
  };
}

/**
 * Main Slip Scanner: executes Gemini AI Vision (if API key is present)
 * or built-in Tesseract.js Thai/English OCR + Regex extraction pipeline.
 */
export async function parseSlipImage(
  imageSource: File | string,
  geminiApiKey?: string,
  onProgress?: (step: string, progressPct: number) => void
): Promise<ParsedSlipResult> {
  // Option A: Gemini Vision API (if key provided)
  if (geminiApiKey && geminiApiKey.trim()) {
    try {
      onProgress?.("Connecting to Gemini Vision AI...", 30);
      const result = await parseWithGeminiVision(imageSource, geminiApiKey.trim());
      onProgress?.("Slip analyzed successfully!", 100);
      return result;
    } catch (err) {
      console.warn("Gemini API failed, falling back to Local OCR:", err);
      onProgress?.("Gemini fallback: Initializing Local OCR...", 40);
    }
  }

  // Option B: Built-in Local OCR Engine (Tesseract.js + Regex)
  onProgress?.("Enhancing image contrast...", 20);
  const preprocessedUrl = await preprocessImage(imageSource);

  onProgress?.("Loading OCR Engine (Thai & English)...", 40);
  const worker = await createWorker(["tha", "eng"]);

  onProgress?.("Reading slip text & signatures...", 70);
  const { data } = await worker.recognize(preprocessedUrl);
  await worker.terminate();

  onProgress?.("Parsing bank fields and amounts...", 90);
  const extracted = extractThaiBankSlipData(data.text);

  onProgress?.("Completed!", 100);

  return {
    bankName: extracted.bankName || "Thai Bank",
    transactionType: extracted.transactionType || "expense",
    amount: extracted.amount || 0,
    date: extracted.date || new Date().toISOString().slice(0, 10),
    time: extracted.time,
    sender: extracted.sender,
    receiver: extracted.receiver,
    refNumber: extracted.refNumber,
    suggestedCategory: extracted.suggestedCategory || "Food",
    description: extracted.description || "Bank Transfer",
    notes: extracted.notes || "Parsed from slip",
    rawText: data.text,
    confidence: extracted.confidence || 0.8,
    engine: "local_ocr",
  };
}
