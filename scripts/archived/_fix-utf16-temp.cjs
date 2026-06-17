const fs=require("fs"),path=require("path");
function isUtf16LE(buf){return buf.length>=2&&buf[1]===0&&buf[0]!==0;}
function walk(dir,out=[]){for(const name of fs.readdirSync(dir)){const full=path.join(dir,name);const st=fs.statSync(full);if(st.isDirectory()){if(name==="node_modules"||name===".git")continue;walk(full,out);}else if(/\.(ts|tsx|js|jsx|json|mdc|md|mjs|cjs)$/.test(name))out.push(full);}return out;}
let fixed=0;for(const file of walk(path.join(process.cwd(),"src"))){const buf=fs.readFileSync(file);if(!isUtf16LE(buf))continue;let text=buf[0]===0xff&&buf[1]===0xfe?buf.toString("utf16le").slice(1):buf.toString("utf16le");fs.writeFileSync(file,text,"utf8");console.log("fixed:",path.relative(process.cwd(),file));fixed++;}
console.log("Converted",fixed,"files");
