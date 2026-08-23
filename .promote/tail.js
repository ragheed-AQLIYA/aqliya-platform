const fs = require("fs")
const buf = fs.readFileSync(process.argv[2])
const isUtf16 = buf[0] === 0xff && buf[1] === 0xfe
const text = isUtf16 ? buf.toString("utf16le").replace(/^﻿/, "") : buf.toString("utf-8")
const lines = text.split(/\r?\n/).filter((l) => l.trim() !== "")
const n = Number(process.argv[3] || 30)
const filter = process.argv[4]
const out = filter ? lines.filter((l) => new RegExp(filter, "i").test(l)) : lines.slice(-n)
console.log(out.join("\n"))
