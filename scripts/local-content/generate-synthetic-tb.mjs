// ─── Generate Synthetic TB for Manufacturing Company ───
// Creates a realistic trial balance for "شركة المصنع السعودي للصناعات المعدنية"
// npx tsx --env-file .env scripts/local-content/generate-synthetic-tb.mjs

import * as XLSX from "xlsx";
import { writeFileSync } from "fs";
import { resolve } from "path";

const OUTPUT_PATH = resolve(import.meta.dirname, "../../TB_manufacturing_SAMA.xlsx");

// Manufacturing company chart of accounts with realistic balances (SAR)
const accounts = [
  // ── Assets (1xxxxx) ──
  { code: "1101010001", name: "صندوق النقدية", debit: 350000, credit: 0 },
  { code: "1101020001", name: "البنك السعودي الفرنسي", debit: 8250000, credit: 0 },
  { code: "1101020002", name: "بنك الرياض", debit: 4200000, credit: 0 },
  { code: "1102010001", name: "أوراق قبض", debit: 1250000, credit: 0 },
  { code: "1102020001", name: "مدينون تجاريون", debit: 18500000, credit: 0 },
  { code: "1102020002", name: "مخصص ديون مشكوك فيها", debit: 0, credit: 925000 },
  { code: "1103010001", name: "مخزون مواد خام", debit: 9500000, credit: 0 },
  { code: "1103010002", name: "مخزون إنتاج تحت التشغيل", debit: 3200000, credit: 0 },
  { code: "1103010003", name: "مخزون تام الصنع", debit: 7800000, credit: 0 },
  { code: "1103010004", name: "مخزون قطع غيار", debit: 1250000, credit: 0 },
  { code: "1104010001", name: "مصروفات مدفوعة مقدماً", debit: 890000, credit: 0 },
  { code: "1104020001", name: "ودائع تأمينية", debit: 450000, credit: 0 },
  // ── Non-current Assets (12xxxxx) ──
  { code: "1201010001", name: "أراضي", debit: 15000000, credit: 0 },
  { code: "1201020001", name: "مباني", debit: 35000000, credit: 0 },
  { code: "1201020002", name: "مخصص إهلاك المباني", debit: 0, credit: 8750000 },
  { code: "1202010001", name: "آلات ومعدات إنتاج", debit: 42000000, credit: 0 },
  { code: "1202010002", name: "مخصص إهلاك آلات ومعدات", debit: 0, credit: 12600000 },
  { code: "1203010001", name: "مركبات", debit: 5800000, credit: 0 },
  { code: "1203010002", name: "مخصص إهلاك مركبات", debit: 0, credit: 2320000 },
  { code: "1204010001", name: "أجهزة حاسب آلي", debit: 2100000, credit: 0 },
  { code: "1204010002", name: "مخصص إهلاك أجهزة حاسب", debit: 0, credit: 1050000 },
  { code: "1205010001", name: "أثاث ومعدات مكتبية", debit: 1800000, credit: 0 },
  { code: "1205010002", name: "مخصص إهلاك أثاث", debit: 0, credit: 540000 },
  { code: "1206010001", name: "استثمارات في شركات زميلة", debit: 5000000, credit: 0 },
  // ── Liabilities (2xxxxx) ──
  { code: "2101010001", name: "دائنون تجاريون", debit: 0, credit: 11200000 },
  { code: "2102010001", name: "أوراق دفع", debit: 0, credit: 2500000 },
  { code: "2103010001", name: "مصروفات مستحقة", debit: 0, credit: 1850000 },
  { code: "2103020001", name: "رواتب وأجور مستحقة", debit: 0, credit: 3200000 },
  { code: "2103030001", name: "زكاة وضريبة دخل مستحقة", debit: 0, credit: 1450000 },
  { code: "2104010001", name: "إيرادات مقبوضة مقدماً", debit: 0, credit: 980000 },
  { code: "2201010001", name: "قروض بنكية قصيرة الأجل", debit: 0, credit: 5000000 },
  { code: "2202010001", name: "قروض بنكية طويلة الأجل", debit: 0, credit: 15000000 },
  { code: "2202020001", name: "تسهيلات ائتمانية", debit: 0, credit: 8000000 },
  // ── Equity (3xxxxx) ──
  { code: "3101010001", name: "رأس المال", debit: 0, credit: 50000000 },
  { code: "3102010001", name: "الاحتياطي النظامي", debit: 0, credit: 5000000 },
  { code: "3103010001", name: "أرباح مبقاة", debit: 0, credit: 18500000 },
  { code: "3104010001", name: "صافي الربح (خسارة) السنة", debit: 0, credit: 0 }, // calculated
  // ── Revenue (4xxxxx) ──
  { code: "4101010001", name: "مبيعات منتجات صناعية", debit: 0, credit: 85000000 },
  { code: "4101010002", name: "مبيعات خردة", debit: 0, credit: 1200000 },
  { code: "4102010001", name: "مردودات ومسموحات مبيعات", debit: 850000, credit: 0 },
  { code: "4103010001", name: "إيرادات نقل", debit: 0, credit: 2500000 },
  { code: "4104010001", name: "إيرادات استثمارية", debit: 0, credit: 400000 },
  // ── Direct Costs (5xxxxx) ──
  { code: "5101010001", name: "مشتريات مواد خام", debit: 32000000, credit: 0 },
  { code: "5101020001", name: "مصروفات نقل مشتريات", debit: 1850000, credit: 0 },
  { code: "5101030001", name: "مردودات مشتريات", debit: 0, credit: 650000 },
  { code: "5102010001", name: "أجور عمال إنتاج", debit: 12500000, credit: 0 },
  { code: "5102020001", name: "مكافآت عمال إنتاج", debit: 2500000, credit: 0 },
  { code: "5103010001", name: "تأمينات عمال إنتاج", debit: 950000, credit: 0 },
  { code: "5104010001", name: "كهرباء ومياه المصنع", debit: 2800000, credit: 0 },
  { code: "5104020001", name: "إيجار المصنع", debit: 3600000, credit: 0 },
  { code: "5104030001", name: "صيانة آلات ومعدات", debit: 1250000, credit: 0 },
  { code: "5104040001", name: "مستهلكات المصنع", debit: 580000, credit: 0 },
  { code: "5104050001", name: "إهلاك آلات ومعدات إنتاج", debit: 2800000, credit: 0 },
  // ── Operating Expenses (6xxxxx) ──
  { code: "6101010001", name: "رواتب إدارية", debit: 8500000, credit: 0 },
  { code: "6101010002", name: "مكافآت إدارية", debit: 1800000, credit: 0 },
  { code: "6102010001", name: "إيجار مباني إدارية", debit: 1200000, credit: 0 },
  { code: "6102020001", name: "كهرباء وهواتف إدارية", debit: 450000, credit: 0 },
  { code: "6102030001", name: "مصروفات سفر", debit: 680000, credit: 0 },
  { code: "6102040001", name: "مصروفات استشارات", debit: 920000, credit: 0 },
  { code: "6102050001", name: "إهلاك مباني وأثاث", debit: 1250000, credit: 0 },
  { code: "6103010001", name: "مصروفات بيعية", debit: 2500000, credit: 0 },
  { code: "6103010002", name: "عمولات وكلاء", debit: 1800000, credit: 0 },
  { code: "6103010003", name: "دعاية وإعلان", debit: 750000, credit: 0 },
  { code: "6103010004", name: "مصروفات شحن وتوزيع", debit: 1200000, credit: 0 },
  { code: "6104010001", name: "مصروفات تمويلية", debit: 1800000, credit: 0 },
  { code: "6104020001", name: "مصروفات بنكية", debit: 250000, credit: 0 },
  // ── Other (7xxxxx) ──
  { code: "7101010001", name: "مصروفات زكاة", debit: 650000, credit: 0 },
  { code: "7102010001", name: "مصروفات استثنائية", debit: 350000, credit: 0 },
];

// Calculate trial balance (ensure debits = credits)
let totalDebit = 0, totalCredit = 0;
for (const a of accounts) {
  totalDebit += a.debit;
  totalCredit += a.credit;
}

// Add balancing entry to retained earnings if needed
const diff = totalDebit - totalCredit;
if (diff > 0) {
  accounts.push({ code: "3103010002", name: "أرباح مبقاة (تسوية)", debit: 0, credit: diff });
} else if (diff < 0) {
  accounts.push({ code: "3103010002", name: "أرباح مبقاة (تسوية)", debit: Math.abs(diff), credit: 0 });
}

// Create XLSX
const ws = XLSX.utils.aoa_to_sheet([
  ["#", "رقم الحساب", "اسم الحساب", "رصيد مدين", "رصيد دائن"],
  ...accounts.map((a, i) => [i + 1, a.code, a.name, a.debit, a.credit]),
]);

// Add totals row
const finalDebit = accounts.reduce((s, a) => s + a.debit, 0);
const finalCredit = accounts.reduce((s, a) => s + a.credit, 0);
XLSX.utils.sheet_add_aoa(ws, [["", "", "الإجمالي", finalDebit, finalCredit]], { origin: -1 });

ws["!cols"] = [{ wch: 5 }, { wch: 14 }, { wch: 35 }, { wch: 15 }, { wch: 15 }];

const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, ws, "ميزان المراجعة");
XLSX.writeFile(wb, OUTPUT_PATH);

console.log("=".repeat(60));
console.log("  SYNTHETIC TB GENERATED");
console.log("=".repeat(60));
console.log(`  File:    ${OUTPUT_PATH}`);
console.log(`  Company: شركة المصنع السعودي للصناعات المعدنية`);
console.log(`  Sector:  Manufacturing / Industrial`);
console.log(`  Accounts: ${accounts.length}`);
console.log(`  Debit:   SAR ${(finalDebit / 1e6).toFixed(2)}M`);
console.log(`  Credit:  SAR ${(finalCredit / 1e6).toFixed(2)}M`);
console.log(`  Balanced: ${Math.abs(finalDebit - finalCredit) < 0.01 ? "YES" : "NO — by SAR " + Math.abs(finalDebit - finalCredit).toFixed(2)}`);
console.log("=".repeat(60));
