import { config } from "dotenv";
import { resolve } from "path";
config({ path: resolve(__dirname, "../.env") });
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
const ORG = "cmpr0j9hm0000l4pq6k41xa9w";
const ACTOR = "cmpr0j9lb0001l4pqyivo84sj";
function createDb(){const url=process.env.DATABASE_URL;if(!url)throw new Error("DATABASE_URL required");return new PrismaClient({adapter:new PrismaPg(url)});}
function newId(prefix){return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,9)}`;}
async function review(itemId){const p=createDb();const row=await p.contentStudioReview.create({data:{id:newId("crev"),contentItemId:itemId,organizationId:ORG,status:"approved",dimensions:{sourceGrounding:true,brand:true,compliance:true,factualClaims:true,languageQuality:true},notes:"L6 smoke review dimensions verified",reviewerId:ACTOR,reviewerName:"Ahmed Al-Mansouri"}});console.log(JSON.stringify({reviewId:row.id,dimensions:row.dimensions},null,2));await p.$disconnect();}
async function approve(itemId){const p=createDb();const row=await p.contentStudioApproval.create({data:{id:newId("cappr"),contentItemId:itemId,organizationId:ORG,approved:true,notes:"Approved via L6 smoke",approverId:ACTOR,approverName:"Ahmed Al-Mansouri"}});await p.contentStudioItem.update({where:{id:itemId},data:{status:"approved"}});console.log(JSON.stringify({approvalId:row.id,itemStatus:"approved"},null,2));await p.$disconnect();}
async function verify(itemId){const p=createDb();const item=await p.contentStudioItem.findUnique({where:{id:itemId}});const reviews=await p.contentStudioReview.findMany({where:{contentItemId:itemId}});const approvals=await p.contentStudioApproval.findMany({where:{contentItemId:itemId}});console.log(JSON.stringify({item,reviews,approvals},null,2));await p.$disconnect();}
const cmd=process.argv[2];const id=process.argv[3]||"citem_mpulibpz_eb760wn";if(cmd==="review")review(id);else if(cmd==="approve")approve(id);else verify(id);
