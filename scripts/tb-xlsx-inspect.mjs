import XLSX from "xlsx";

const filePath = process.argv[2] ?? "TB.xlsx";
const wb = XLSX.readFile(filePath);
const sheet = wb.Sheets[wb.SheetNames[0]];
const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });

console.log("File:", filePath);
console.log("Sheet:", wb.SheetNames[0]);
console.log("Row count:", rows.length);
console.log("Columns:", Object.keys(rows[0] ?? {}));

const keys = Object.keys(rows[0] ?? {});
const debitKey = keys.find((k) => k.includes("حركة الفترة مدين")) ?? "Debit";
const creditKey = keys.find((k) => k.includes("حركة الفترة دائن")) ?? "Credit";
const closeDebitKey = keys.find((k) => k.includes("الرصيد الحالي مدين"));
const closeCreditKey = keys.find((k) => k.includes("الرصيد الحالي دائن"));

let sumPeriodD = 0;
let sumPeriodC = 0;
let sumCloseD = 0;
let sumCloseC = 0;

let sumNet = 0;
let sumFinal = 0;
const netKey = keys.find((k) => k.includes("صافي الرصيد الحالي"));
const finalKey = keys.find((k) => k.includes("الرصيد الختامي"));

for (const r of rows) {
  sumPeriodD += Number(String(r[debitKey]).replace(/,/g, "")) || 0;
  sumPeriodC += Number(String(r[creditKey]).replace(/,/g, "")) || 0;
  if (closeDebitKey && closeCreditKey) {
    sumCloseD += Number(String(r[closeDebitKey]).replace(/,/g, "")) || 0;
    sumCloseC += Number(String(r[closeCreditKey]).replace(/,/g, "")) || 0;
  }
  if (netKey) sumNet += Number(String(r[netKey]).replace(/,/g, "")) || 0;
  if (finalKey) sumFinal += Number(String(r[finalKey]).replace(/,/g, "")) || 0;
}

console.log("\nNet current (sum):", sumNet);
console.log("Final balance col (sum):", sumFinal);

let resolvedD = 0;
let resolvedC = 0;
let withCloseCredit = 0;
let withCloseDebit = 0;
for (const r of rows) {
  const code = String(r["رقم الحساب"] ?? "").trim();
  if (!code) continue;
  const movD = Number(String(r[debitKey]).replace(/,/g, "")) || 0;
  const movC = Number(String(r[creditKey]).replace(/,/g, "")) || 0;
  let d = movD;
  let c = movC;
  if (movD === 0 && movC === 0 && closeDebitKey && closeCreditKey) {
    d = Number(String(r[closeDebitKey]).replace(/,/g, "")) || 0;
    c = Number(String(r[closeCreditKey]).replace(/,/g, "")) || 0;
  }
  if (d === 0 && c === 0 && netKey) {
    const bal = Number(String(r[netKey]).replace(/,/g, "")) || 0;
    if (bal >= 0) d = bal;
    else c = Math.abs(bal);
  }
  resolvedD += d;
  resolvedC += c;
  if (d > 0) withCloseDebit++;
  if (c > 0) withCloseCredit++;
}
console.log("\nResolved (UI-like) debit:", resolvedD, "credit:", resolvedC, "variance:", resolvedD - resolvedC);
console.log("Rows with debit:", withCloseDebit, "credit:", withCloseCredit);

const bsKey = keys.find((k) => k.includes("BS/IS"));
const map1Key = keys.find((k) => k.trim() === "Mapping 1");
if (bsKey) {
  const bsCounts = {};
  for (const r of rows) {
    const code = String(r["رقم الحساب"] ?? "").trim();
    if (!code) continue;
    const tag = String(r[bsKey] ?? "?").trim();
    bsCounts[tag] = (bsCounts[tag] ?? 0) + 1;
  }
  console.log("\nBS/IS breakdown:", bsCounts);
  const onlyIs =
    Object.keys(bsCounts).length === 1 && bsCounts["Income Statement"];
  if (onlyIs) {
    console.log(
      "\n⚠ IS-only extract: no balance sheet accounts. Trial balance cannot balance until revenue/BS lines are included.",
    );
  }
}
if (map1Key) {
  const mapCounts = {};
  for (const r of rows) {
    const code = String(r["رقم الحساب"] ?? "").trim();
    if (!code) continue;
    const m = String(r[map1Key] ?? "?").trim();
    mapCounts[m] = (mapCounts[m] ?? 0) + 1;
  }
  console.log(
    "Mapping 1 groups:",
    Object.entries(mapCounts).sort((a, b) => b[1] - a[1]),
  );
}

console.log("\nFirst row sample:", JSON.stringify(rows[0], null, 2));
console.log("\nPeriod movement — debit:", sumPeriodD, "credit:", sumPeriodC, "variance:", sumPeriodD - sumPeriodC);
console.log("Closing balance cols — debit:", sumCloseD, "credit:", sumCloseC, "variance:", sumCloseD - sumCloseC);
